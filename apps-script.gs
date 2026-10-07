// Name-vote backend v2. Paste into script.google.com → Deploy → Web app (new version).
// Sheets: votes (ts, voter, name, rating) · ballots (ts, voter, guts_json, rank_json, veto, order_json)
const ADMIN_KEY = 'CHANGE-ME-admin-key';

function sheet(name, header){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(name);
  if(!s){ s = ss.insertSheet(name); s.appendRow(header); }
  return s;
}

function doPost(e){
  const d = JSON.parse(e.postData.contents);
  const voter = String(d.voter||'').trim();
  if(!voter) return out({ok:false,error:'name required'});
  const now = new Date().toISOString();

  // star ratings (replace-on-revote)
  const s = sheet('votes', ['ts','voter','name','rating']);
  const rows = s.getDataRange().getValues();
  for(const [name, ratingRaw] of Object.entries(d.votes||{})){
    const rating = Number(ratingRaw);
    if(rating<1||rating>5) continue;
    let replaced=false;
    for(let i=1;i<rows.length;i++){
      if(String(rows[i][1]).toLowerCase()===voter.toLowerCase() && rows[i][2]===name){
        s.getRange(i+1,1).setValue(now);
        s.getRange(i+1,4).setValue(rating); replaced=true; break;
      }
    }
    if(!replaced) s.appendRow([d.ts||now, voter, name, rating]);
  }

  // ballot extras: gut calls, ranking, veto, card order (one row per voter, latest wins)
  if(d.guts || d.rank || d.veto){
    const b = sheet('ballots', ['ts','voter','guts','rank','veto','order']);
    const brows = b.getDataRange().getValues();
    let bi = -1;
    for(let i=1;i<brows.length;i++){
      if(String(brows[i][1]).toLowerCase()===voter.toLowerCase()){ bi=i+1; break; }
    }
    const row = [d.ts||now, voter, JSON.stringify(d.guts||{}), JSON.stringify(d.rank||[]), String(d.veto||''), JSON.stringify(d.order||[])];
    if(bi>0){ b.getRange(bi,1,1,6).setValues([row]); }
    else b.appendRow(row);
  }
  return out({ok:true});
}

function doGet(e){
  const action=(e.parameter.action||'results');
  const s = sheet('votes', ['ts','voter','name','rating']);
  const rows = s.getDataRange().getValues().slice(1);
  const byName={}, voters=new Set();
  rows.forEach(r=>{ if(!r[1])return; voters.add(r[1]);
    byName[r[2]]=byName[r[2]]||[]; byName[r[2]].push(Number(r[3])); });
  const scores=Object.entries(byName).map(([id,a])=>({id,avg:a.reduce((x,y)=>x+y,0)/a.length,count:a.length}));

  // ballot data
  const b = sheet('ballots', ['ts','voter','guts','rank','veto','order']);
  const brows = b.getDataRange().getValues().slice(1).filter(r=>r[1]);
  const guts={}, rankPts={}, vetoes=[];
  brows.forEach(r=>{
    let g={}, rk=[];
    try{ g=JSON.parse(r[2]||'{}'); }catch(_){}
    try{ rk=JSON.parse(r[3]||'[]'); }catch(_){}
    for(const [id,v] of Object.entries(g)){ guts[id]=guts[id]||{keep:0,maybe:0,pass:0}; if(guts[id][v]!=null) guts[id][v]++; }
    rk.forEach((id,i)=>{ rankPts[id]=(rankPts[id]||0)+(5-i); }); // 5 pts for #1 … 1 pt for #5
    if(r[4]) vetoes.push({voter:r[1], text:String(r[4])});
  });
  const ballotSummary = { guts, rankPts, vetoes, ballotCount: brows.length };

  if(action==='admin'){
    if((e.parameter.key||'')!==ADMIN_KEY) return out({ok:false,error:'Invalid admin key'});
    let top=null,best=-1; scores.forEach(x=>{if(x.avg>best){best=x.avg;top=x.id}});
    return out({ok:true, voterCount:voters.size, totalRatings:rows.length, topName:top,
      rows: rows.map(r=>({ts:r[0],voter:r[1],name:r[2],rating:r[3]})).reverse(),
      ballots: ballotSummary });
  }
  return out({ok:true, voterCount:voters.size, scores, ballots: ballotSummary});
}
function out(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

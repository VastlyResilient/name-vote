// Name-vote backend. Paste into script.google.com → Deploy → Web app.
const ADMIN_KEY = 'CHANGE-ME-admin-key';
function sheet(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName('votes');
  if(!s){ s = ss.insertSheet('votes'); s.appendRow(['ts','voter','name','rating']); }
  return s;
}
function doPost(e){
  const d = JSON.parse(e.postData.contents);
  const voter = String(d.voter||'').trim();
  if(!voter) return out({ok:false,error:'name required'});
  const s = sheet(), rows = s.getDataRange().getValues();
  for(const [name, rating] of Object.entries(d.votes||{})){
    rating = Number(rating);
    if(rating<1||rating>5) continue;
    let replaced=false;
    for(let i=1;i<rows.length;i++){
      if(rows[i][1].toLowerCase()===voter.toLowerCase() && rows[i][2]===name){
        s.getRange(i+1,1).setValue(new Date().toISOString());
        s.getRange(i+1,4).setValue(rating); replaced=true; break;
      }
    }
    if(!replaced) s.appendRow([d.ts||new Date().toISOString(), voter, name, rating]);
  }
  return out({ok:true});
}
function doGet(e){
  const action=(e.parameter.action||'results');
  const s=sheet(), rows=s.getDataRange().getValues().slice(1);
  const byName={}, voters=new Set();
  rows.forEach(r=>{ if(!r[1])return; voters.add(r[1]);
    byName[r[2]]=byName[r[2]]||[]; byName[r[2]].push(Number(r[3])); });
  const scores=Object.entries(byName).map(([id,a])=>({id,avg:a.reduce((x,y)=>x+y,0)/a.length,count:a.length}));
  if(action==='admin'){
    if((e.parameter.key||'')!==ADMIN_KEY) return out({ok:false,error:'Invalid admin key'});
    let top=null,best=-1; scores.forEach(x=>{if(x.avg>best){best=x.avg;top=x.id}});
    return out({ok:true, voterCount:voters.size, totalRatings:rows.length, topName:top,
      rows: rows.map(r=>({ts:r[0],voter:r[1],name:r[2],rating:r[3]})).reverse()});
  }
  return out({ok:true, voterCount:voters.size, scores});
}
function out(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
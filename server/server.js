// name-vote backend — self-hosted. SQLite + Express.
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const ADMIN_KEY = process.env.ADMIN_KEY || 'change-me';
const PORT = process.env.PORT || 8787;
const db = new Database(process.env.DB_PATH || path.join(__dirname, 'votes.db'));

db.exec(`CREATE TABLE IF NOT EXISTS tokens(
  voter TEXT PRIMARY KEY, token TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS votes(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT, voter TEXT, name TEXT, rating INTEGER,
  UNIQUE(voter, name) ON CONFLICT REPLACE);
CREATE TABLE IF NOT EXISTS ballots(
  voter TEXT PRIMARY KEY, ts TEXT, guts TEXT, rank TEXT, veto TEXT, ord TEXT);
CREATE TABLE IF NOT EXISTS feedback(
  id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT, voter TEXT, feedback TEXT);`);

const app = express();
app.use(cors());
app.use(express.text({ type: '*/*', limit: '1mb' }));

const parseBody = (req) => { try { return JSON.parse(req.body || '{}'); } catch { return {}; } };

app.post('/', (req, res) => {
  const d = parseBody(req);
  const voter = String(d.voter || '').trim();
  // enforce real names: 2+ chars, letters/numbers/spaces only
  if (voter.length < 2 || !/[\p{L}\p{N}]/u.test(voter) || /^[\W_]+$/.test(voter))
    return res.status(400).json({ ok: false, error: 'Please enter your real name (letters, 2+ characters).' });
  const token = String(d.token || '');
  if (!token || token.length < 16)
    return res.status(400).json({ ok: false, error: 'missing session token' });
  // name-claim enforcement: first claim wins; same token = update allowed
  const claim = db.prepare('SELECT token FROM tokens WHERE lower(voter)=lower(?)').get(voter);
  if (claim && claim.token !== token)
    return res.status(409).json({ ok: false, error: 'That name is already taken. If this is you, use the same device you voted on, or pick a different name.' });
  if (!claim)
    db.prepare('INSERT INTO tokens(voter,token,created) VALUES(?,?,?)').run(voter, token, new Date().toISOString());
  const now = new Date().toISOString();
  if (d.votes && typeof d.votes === 'object') {
    const ins = db.prepare(`INSERT INTO votes(ts,voter,name,rating) VALUES(?,?,?,?)
      ON CONFLICT(voter,name) DO UPDATE SET ts=excluded.ts, rating=excluded.rating`);
    for (const [name, r] of Object.entries(d.votes)) {
      const rating = Number(r);
      if (rating >= 1 && rating <= 5) ins.run(d.ts || now, voter, name, rating);
    }
  }
  if (d.guts || d.rank || d.veto) {
    db.prepare(`INSERT INTO ballots(voter,ts,guts,rank,veto,ord) VALUES(?,?,?,?,?,?)
      ON CONFLICT(voter) DO UPDATE SET ts=excluded.ts,guts=excluded.guts,rank=excluded.rank,veto=excluded.veto,ord=excluded.ord`)
      .run(voter, d.ts || now, JSON.stringify(d.guts||{}), JSON.stringify(d.rank||[]), String(d.veto||''), JSON.stringify(d.order||[]));
  }
  if (d.feedback) {
    db.prepare('INSERT INTO feedback(ts,voter,feedback) VALUES(?,?,?)').run(d.ts || now, voter, String(d.feedback));
  }
  res.json({ ok: true });
});

function summary() {
  const votes = db.prepare('SELECT * FROM votes').all();
  const voters = new Set(votes.map(v => v.voter));
  const byName = {};
  votes.forEach(v => { (byName[v.name] = byName[v.name] || []).push(v.rating); });
  const scores = Object.entries(byName).map(([id, a]) => ({ id, avg: a.reduce((x, y) => x + y, 0) / a.length, count: a.length }));
  const ballots = db.prepare('SELECT * FROM ballots').all();
  const guts = {}, rankPts = {}, vetoes = [];
  ballots.forEach(b => {
    try { const g = JSON.parse(b.guts || '{}'); for (const [id, v] of Object.entries(g)) { guts[id] = guts[id] || { keep: 0, maybe: 0, pass: 0 }; if (guts[id][v] != null) guts[id][v]++; } } catch {}
    try { JSON.parse(b.rank || '[]').forEach((id, i) => { rankPts[id] = (rankPts[id] || 0) + (5 - i); }); } catch {}
    if (b.veto) vetoes.push({ voter: b.voter, text: b.veto });
  });
  const perVoter = {};
  votes.forEach(v => { (perVoter[v.voter] = perVoter[v.voter] || { ratings: {}, latest: '' }); perVoter[v.voter].ratings[v.name] = v.rating; if (v.ts > perVoter[v.voter].latest) perVoter[v.voter].latest = v.ts; });
  return { voterCount: voters.size, scores, votes, perVoter, ballots: { guts, rankPts, vetoes, ballotCount: ballots.length } };
}

app.get('/', (req, res) => {
  const action = req.query.action || 'results';
  if (action === 'reset') {
    if (req.query.key !== ADMIN_KEY) return res.json({ ok: false, error: 'Invalid admin key' });
    const v = db.prepare('DELETE FROM votes').run().changes;
    const b = db.prepare('DELETE FROM ballots').run().changes;
    const f = db.prepare('DELETE FROM feedback').run().changes;
    return res.json({ ok: true, cleared: [`votes: ${v}`, `ballots: ${b}`, `feedback: ${f}`] });
  }
  if (action === 'dump') {
    if (req.query.key !== ADMIN_KEY) return res.json({ ok: false, error: 'Invalid admin key' });
    return res.json({ ok: true, votes: db.prepare('SELECT * FROM votes ORDER BY id').all(),
      ballots: db.prepare('SELECT * FROM ballots').all(), feedback: db.prepare('SELECT * FROM feedback').all() });
  }
  const s = summary();
  if (action === 'admin') {
    if (req.query.key !== ADMIN_KEY) return res.json({ ok: false, error: 'Invalid admin key' });
    let top = null, best = -1;
    s.scores.forEach(x => { if (x.avg > best) { best = x.avg; top = x.id; } });
    const fb = db.prepare('SELECT ts,voter,feedback FROM feedback ORDER BY id DESC').all();
    return res.json({ ok: true, voterCount: s.voterCount, totalRatings: s.votes.length, topName: top,
      rows: s.votes.map(r => ({ ts: r.ts, voter: r.voter, name: r.name, rating: r.rating })).reverse(),
      ballots: s.ballots, feedback: fb });
  }
  res.json({ ok: true, voterCount: s.voterCount, scores: s.scores, ballots: s.ballots });
});

app.get('/health', (req, res) => res.json({ ok: true }));
app.listen(PORT, () => console.log('name-vote backend on :' + PORT));

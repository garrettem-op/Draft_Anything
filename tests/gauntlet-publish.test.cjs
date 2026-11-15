/* Run with: node --test tests/gauntlet-publish.test.cjs */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');
const G = require('../data/gauntlet.js');
const P = require('../tools/gauntlet-publish.cjs');

const mk = (left, right, choice, session, seq) => G.makeVote({ left, right }, choice, { session, seq, ts: '2026-11-15T12:00:00.000Z' });
// What the server summary looks like, built from the same votes the client would hold.
function summaryOf(votes) {
  const agg = G.aggregate(votes);
  const leftWinsBy = new Map();
  for (const v of votes) if (v.outcome === 'win' && v.winner === v.left) leftWinsBy.set(v.key, (leftWinsBy.get(v.key) || 0) + 1);
  return { sessions: agg.totals.sessions, pairs: agg.pairs.map(p => ({ ...p, leftWins: leftWinsBy.get(p.key) || 0 })).reverse() };
}
const votes = [
  mk('nba:b', 'nba:a', 'left', 'sess0001', 0), mk('nba:a', 'nba:b', 'left', 'sess0002', 0), mk('nba:a', 'nba:b', 'left', 'sess0002', 1),
  mk('mcu:x', 'nba:a', 'right', 'sess0001', 1), mk('mcu:x', 'nba:a', 'tie', 'sess0003', 0), mk('mcu:y', 'nba:b', 'skip', 'sess0003', 1)
];

test('server summary builds the same aggregate the client computes from the votes', () => {
  const built = P.build(summaryOf(votes)), direct = G.aggregate(votes);
  assert.deepEqual(built.pairs, direct.pairs);
  assert.deepEqual(built.totals, direct.totals);
  assert.deepEqual(built.positionBias, direct.positionBias);
  assert.deepEqual(G.validateAggregates(JSON.parse(P.serialize(built))), { ok: true, errors: [] });
});

test('repeats on the same matchup are all counted', () => {
  const rep = [mk('nba:a', 'nba:b', 'left', 's0000001', 0), mk('nba:b', 'nba:a', 'right', 's0000002', 0), mk('nba:a', 'nba:b', 'left', 's0000003', 0)];
  const built = P.build(summaryOf(rep));
  assert.equal(built.totals.votes, 3);
  assert.equal(built.pairs[0].aWins, 3);
  assert.equal(built.totals.repeatPairs, 1);
  assert.equal(built.totals.unanimousRepeatPairs, 1);
});

test('output is deterministic and has no timestamps', () => {
  const a = P.serialize(P.build(summaryOf(votes))), b = P.serialize(P.build(summaryOf(votes.slice().reverse())));
  assert.equal(a, b);
  assert.doesNotMatch(a, /20\d\d-\d\d-\d\dT/);
});

test('inconsistent or malformed summaries are refused', () => {
  const good = summaryOf(votes);
  const bad = fn => { const c = JSON.parse(JSON.stringify(good)); fn(c); return () => P.build(c); };
  assert.throws(bad(c => { c.pairs[0].decisive += 1; }), /decisive/);
  assert.throws(bad(c => { c.pairs[0].leftWins = 99; }), /left counts/);
  assert.throws(bad(c => { c.pairs[0].aWins = -1; }), /bad counts/);
  assert.throws(bad(c => { c.pairs[0].key = 'x'; }), /invalid aggregate/);
  assert.throws(bad(c => { c.sessions = 'many'; }), /wrong shape/);
});

test('CLI writes the file, then rank tool can read it; no votes means no file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gp-'));
  const inp = path.join(dir, 's.json'), out = path.join(dir, 'out', 'agg.json');
  fs.writeFileSync(inp, JSON.stringify(summaryOf(votes)));
  const ok = cp.spawnSync('node', ['tools/gauntlet-publish.cjs', inp, '--out', out], { encoding: 'utf8' });
  assert.equal(ok.status, 0, ok.stderr);
  const rank = cp.spawnSync('node', ['tools/gauntlet-rank.cjs', out, '--json'], { encoding: 'utf8' });
  assert.equal(rank.status, 0, rank.stderr);
  fs.writeFileSync(inp, JSON.stringify({ sessions: 0, pairs: [] }));
  const none = path.join(dir, 'none.json');
  const empty = cp.spawnSync('node', ['tools/gauntlet-publish.cjs', inp, '--out', none], { encoding: 'utf8' });
  assert.equal(empty.status, 3);
  assert.equal(fs.existsSync(none), false);
});

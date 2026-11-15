/* Run with: node --test tests/gauntlet.test.cjs */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../data/gauntlet.js');

const ids = pool => n => Array.from({ length: n }, (_, i) => ({ id: pool + ':c' + i, n: pool + 'c' + i }));
const mk = (left, right, choice, session, seq, extra) => G.makeVote({ left, right }, choice, Object.assign({ session, seq, ts: '2026-11-15T12:00:00.000Z' }, extra));

test('pair keys are order independent', () => {
  assert.equal(G.pairKey('nba:a', 'mcu:b'), G.pairKey('mcu:b', 'nba:a'));
});

test('votes validate; malformed votes are rejected', () => {
  const v = mk('nba:b', 'nba:a', 'left', 'abcdefgh1', 0);
  assert.equal(v.winner, 'nba:b');
  assert.equal(v.a, 'nba:a');
  assert.deepEqual(G.validateVote(v), { ok: true, errors: [] });
  assert.equal(G.makeVote({ left: 'nba:a', right: 'nba:b' }, 'nope'), null);
  for (const mutate of [x => { x.winner = 'nba:z'; }, x => { x.key = 'x'; }, x => { x.pools = ['mcu']; }, x => { x.a = x.b; }, x => { x.ts = 'never'; }, x => { x.confidence = 'huge'; }, x => { x.session = 'A!'; }]) {
    const copy = JSON.parse(JSON.stringify(v)); mutate(copy);
    assert.equal(G.validateVote(copy).ok, false);
  }
  const tie = mk('nba:a', 'nba:b', 'tie', 'abcdefgh1', 1);
  assert.equal(tie.winner, null);
  tie.winner = 'nba:a';
  assert.equal(G.validateVote(tie).ok, false);
  assert.equal(G.validateVote(v, { known: new Set(['nba:a']) }).ok, false);
});

test('store and merge dedupe by vote id and ignore input order', () => {
  const v1 = mk('nba:a', 'nba:b', 'left', 'abcdefgh1', 0), v2 = mk('nba:a', 'nba:c', 'right', 'abcdefgh1', 1);
  const r1 = G.mergeVotes([[v1, v2], [v2, v1, { junk: true }]]), r2 = G.mergeVotes([[v2], [v1]]);
  assert.equal(r1.store.votes.length, 2);
  assert.deepEqual(r1.dropped, { invalid: 1, duplicate: 2 });
  assert.deepEqual(G.aggregate(r1.store.votes), G.aggregate(r2.store.votes));
  const s = G.newStore([v1]);
  assert.equal(G.addVote(s, v1).reason, 'duplicate');
  assert.equal(G.undoLast(s).id, v1.id);
  assert.equal(s.votes.length, 0);
});

test('sampling is seeded, avoids self pairs and same-name twins, and randomizes orientation', () => {
  const A = ids('nba')(12), B = ids('mcu')(12);
  const draw = seed => { const rng = G.mulberry32(seed), out = []; for (let i = 0; i < 40; i++) out.push(G.nextPair(A, B, { rng })); return out; };
  assert.deepEqual(draw(7), draw(7));
  assert.notDeepEqual(draw(7), draw(8));
  const same = ids('nba')(8), pairs = []; const rng = G.mulberry32(3);
  for (let i = 0; i < 200; i++) pairs.push(G.nextPair(same, same, { rng }));
  assert.ok(pairs.every(p => p.left !== p.right && p.a < p.b && p.key === p.a + '|' + p.b));
  const leftIsA = pairs.filter(p => p.left === p.a).length;
  assert.ok(leftIsA > 70 && leftIsA < 130, 'orientation is roughly balanced: ' + leftIsA);
  const twins = [{ id: 'games:pikachu', n: 'Pikachu' }], twins2 = [{ id: 'pokemon:pikachu', n: 'Pikachu' }];
  assert.equal(G.nextPair(twins, twins2, { rng: G.mulberry32(1) }), null);
  assert.equal(G.nextPair([], A), null);
});

test('coverage-aware sampling spreads votes across pairs', () => {
  const A = ids('nba')(6), votes = [], rng = G.mulberry32(11);
  for (let i = 0; i < 15; i++) {
    const p = G.nextPair(A, A, { rng, counts: G.buildCounts(votes) });
    votes.push(mk(p.left, p.right, 'left', 'abcdefgh1', i));
  }
  const pairCounts = [...G.buildCounts(votes).pair.values()];
  assert.ok(Math.max(...pairCounts) <= 2, 'with 15 of 15 possible pairs, repeats stay rare: ' + pairCounts.join(','));
  assert.ok(pairCounts.length >= 12);
});

function ladder(order, perPair) { // order[0] beats everyone after it
  const votes = []; let seq = 0;
  for (let i = 0; i < order.length; i++) for (let j = i + 1; j < order.length; j++) for (let k = 0; k < perPair; k++)
    votes.push(mk(k % 2 ? order[i] : order[j], k % 2 ? order[j] : order[i], k % 2 ? 'left' : 'right', 'abcdefgh1', seq++));
  return votes;
}

test('aggregates: counts, position bias, no session keys or timestamps', () => {
  const votes = ladder(['nba:a', 'nba:b', 'nba:c'], 4);
  const agg = G.aggregate(votes);
  assert.equal(agg.totals.votes, 12); assert.equal(agg.totals.decisive, 12);
  assert.equal(agg.positionBias.leftShare, 0.5);
  assert.equal(JSON.stringify(agg).includes('abcdefgh1'), false);
  assert.equal(JSON.stringify(agg).includes('2026-11-15'), false);
  assert.equal(G.validateAggregates(agg).ok, true);
  assert.equal(G.validateAggregates({ schema: 'x' }).ok, false);
  assert.ok(G.aggregatesToCSV(agg).split('\n')[0].startsWith('pair_key'));
  const biased = G.aggregate(Array.from({ length: 20 }, (_, i) => mk('nba:a', 'nba:b', 'left', 'abcdefgh1', i)));
  assert.equal(biased.positionBias.leftShare, 1);
  assert.ok(biased.positionBias.wilson95[0] > 0.8);
});

test('Bradley-Terry ranking orders a clean ladder, is deterministic and stays finite when sparse', () => {
  const order = ['nba:a', 'nba:b', 'nba:c', 'nba:d'];
  const r = G.rank(G.aggregate(ladder(order, 6)));
  assert.deepEqual(r.rows.map(x => x.id), order);
  assert.ok(r.rows[0].rating > r.rows[1].rating && r.rows[1].rating > r.rows[3].rating);
  assert.deepEqual(r, G.rank(G.aggregate(ladder(order, 6).reverse())));
  const sparse = G.rank(G.aggregate([mk('nba:a', 'nba:b', 'left', 'abcdefgh1', 0)]));
  assert.ok(sparse.rows.every(x => Number.isFinite(x.rating) && Math.abs(x.rating - 1500) < 200));
  assert.ok(sparse.rows[0].ci95[1] - sparse.rows[0].ci95[0] > 300, 'one vote leaves a wide interval');
  const ties = G.rank(G.aggregate([0, 1, 2, 3].map(i => mk('nba:a', 'nba:b', 'tie', 'abcdefgh1', i))));
  assert.ok(Math.abs(ties.rows[0].rating - ties.rows[1].rating) < 1e-6);
  assert.equal(G.rank(G.aggregate([])).rows.length, 0);
});

test('ranking marks disconnected components and wilson intervals are sane', () => {
  const votes = [mk('nba:a', 'nba:b', 'left', 'abcdefgh1', 0), mk('mcu:a', 'mcu:b', 'left', 'abcdefgh1', 1)];
  assert.equal(G.rank(G.aggregate(votes)).components, 2);
  const [lo, hi] = G.wilson(5, 10);
  assert.ok(lo < 0.5 && hi > 0.5 && lo > 0.2 && hi < 0.8);
  assert.deepEqual(G.wilson(0, 0), [0, 1]);
});

test('transitive inference follows win chains and flags conflicts', () => {
  const agg = G.aggregate(ladder(['nba:a', 'nba:b', 'nba:c'], 2).filter(v => v.key !== 'nba:a|nba:c'));
  const g = G.winGraph(agg);
  assert.deepEqual(G.infer(g, 'nba:a', 'nba:c'), { predicted: 'x', source: 'chain', path: ['nba:a', 'nba:b', 'nba:c'] });
  assert.equal(G.infer(g, 'nba:c', 'nba:a').predicted, 'y');
  assert.equal(G.infer(g, 'nba:a', 'nba:b').source, 'direct');
  assert.equal(G.infer(g, 'nba:a', 'nba:zzz').source, 'none');
});

test('contradiction loops are found', () => {
  const votes = [mk('nba:a', 'nba:b', 'left', 's1234567', 0), mk('nba:b', 'nba:c', 'left', 's1234567', 1), mk('nba:c', 'nba:a', 'left', 's1234567', 2), mk('nba:d', 'nba:a', 'left', 's1234567', 3)];
  const c = G.contradictions(G.aggregate(votes));
  assert.deepEqual(c.cycles, [['nba:a', 'nba:b', 'nba:c']]);
  assert.equal(G.contradictions(G.aggregate(ladder(['nba:a', 'nba:b', 'nba:c'], 2))).cycles.length, 0);
  const split = G.contradictions(G.aggregate([mk('nba:a', 'nba:b', 'left', 's1234567', 0), mk('nba:a', 'nba:b', 'right', 's1234567', 1)]));
  assert.equal(split.contestedPairs.length, 1);
});

test('coverage reports within/cross pool pairs and compareToPredictor counts agreement', () => {
  const votes = [mk('nba:a', 'nba:b', 'left', 'abcdefgh1', 0), mk('nba:a', 'mcu:a', 'left', 'abcdefgh1', 1), mk('nba:a', 'mcu:a', 'skip', 'abcdefgh1', 2)];
  const agg = G.aggregate(votes), cov = G.coverage(agg, { nba: ['nba:a', 'nba:b', 'nba:c', 'nba:d'], mcu: ['mcu:a', 'mcu:b'] });
  assert.equal(cov.withinPoolPairs, 1); assert.equal(cov.crossPoolPairs, 1); assert.equal(cov.votedCharacters, 3);
  assert.equal(cov.pools.find(p => p.pool === 'nba').share, 0.5);
  const cmp = G.compareToPredictor(agg, (a, b) => (a === 'mcu:a' ? 'a' : b === 'mcu:a' ? 'b' : null));
  assert.equal(cmp.compared, 1); assert.equal(cmp.disagree, 1); assert.equal(cmp.abstained, 1);
});

test('UI flow: local persistence, undo, clear, and no engine prediction shown', () => {
  const store = {};
  global.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } };
  const cands = { nba: ids('nba')(10), mcu: ids('mcu')(10) };
  global.POOLS = { nba: { entries: [1], short: 'NBA' }, mcu: { entries: [1], short: 'MCU' }, mashup: { entries: [1] } };
  global.getPool = id => global.POOLS[id];
  global.getCands = id => cands[id].map(c => Object.assign({ pool: id, t: 'tag', a: [50] }, c));
  global.esc = s => String(s); global.avatar = () => '';
  const st = G.newState();
  assert.deepEqual(G.poolIds(), ['nba', 'mcu']);
  st.poolA = 'nba'; st.poolB = 'mcu'; G.start(st);
  assert.ok(st.current && st.current.a.split(':')[0] !== st.current.b.split(':')[0]);
  const html = G.render(st);
  assert.ok(!/predict|odds|favou?rite|win %/i.test(html.replace('The game’s own prediction is hidden on purpose.', '')), 'no engine prediction is shown');
  assert.equal(G.vote(st, 'left').accepted, true);
  assert.equal(G.vote(st, 'skip').accepted, true);
  assert.equal(st.ctx.store.votes.length, 2);
  assert.equal(JSON.parse(store[G.STORE_KEY]).votes.length, 2);
  const reloaded = G.loadLocal();
  assert.equal(reloaded.store.votes.length, 2);
  assert.equal(reloaded.session, st.ctx.session);
  assert.equal(G.undo(st), true);
  assert.equal(st.ctx.store.votes.length, 1);
  assert.equal(G.vote(st, 'right').accepted, true);
  assert.equal(new Set(st.ctx.store.votes.map(v => v.id)).size, 2, 'ids stay unique after undo');
  st.stage = 'ladder';
  assert.ok(G.render(st).includes('Your ladder'));
  assert.equal(JSON.parse(G.exportJSON(st)).votes.length, 2);
  G.clearAll(st);
  assert.equal(st.ctx.store.votes.length, 0);
  assert.equal(G.vote({ ctx: st.ctx, current: null }, 'left').accepted, false);
  for (const k of ['POOLS', 'getPool', 'getCands', 'esc', 'avatar', 'localStorage']) delete global[k];
});

test('ranking CLI reads votes and aggregate files', () => {
  const { execFileSync } = require('node:child_process'), fs = require('node:fs'), os = require('node:os'), path = require('node:path');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gauntlet-'));
  const votes = ladder(['dc:a', 'dc:b', 'mcu:c'], 4);
  fs.writeFileSync(path.join(dir, 'votes.json'), JSON.stringify({ schema: 'draft-anything.gauntlet.votes', version: 1, votes: votes.concat(votes) }));
  const cli = path.resolve(__dirname, '../tools/gauntlet-rank.cjs');
  const out = JSON.parse(execFileSync('node', [cli, path.join(dir, 'votes.json'), '--json', '--write-aggregates', path.join(dir, 'agg.json')], { encoding: 'utf8' }));
  assert.equal(out.totals.votes, 12, 'duplicate votes are dropped');
  assert.equal(out.totals.droppedDuplicate, 12);
  assert.equal(out.ranking.rows[0].id, 'dc:a');
  const again = JSON.parse(execFileSync('node', [cli, path.join(dir, 'agg.json'), '--json'], { encoding: 'utf8' }));
  assert.equal(again.totals.votes, 12);
  assert.equal(again.ranking.rows[0].id, 'dc:a');
  assert.equal(again.positionBias.decisiveVotes, 12);
  assert.throws(() => execFileSync('node', [cli, path.join(dir, 'nope.json')], { stdio: 'pipe' }));
});

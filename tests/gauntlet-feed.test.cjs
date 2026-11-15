/* Run with: node --test tests/gauntlet-feed.test.cjs */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../data/gauntlet.js');
const F = require('../data/gauntlet-feed.js');

const T0 = Date.parse('2026-11-15T15:00:00.000Z');
const SEC = 1000, DAY = 86400000;
const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const chars = pool => Array.from({ length: 12 }, (_, i) => ({ id: pool + ':c' + i, n: pool.toUpperCase() + ' Hero ' + i, pool }));
const byPool = { nba: chars('nba'), mcu: chars('mcu') };
let clock = T0;
const host = {
  poolIds: ['nba', 'mcu'],
  candsOf: pool => byPool[pool].map(c => ({ id: c.id, n: c.n })),
  cardById: id => { const p = id.split(':')[0]; return (byPool[p] || []).find(c => c.id === id) || null; },
  poolTitle: p => p.toUpperCase(),
  cardHTML: (c, side) => '<button class="gt-card" data-act="gaunt-pick" data-side="' + side + '">' + esc(c ? c.n : '?') + '</button>',
  esc, now: () => clock, tzOffsetMinutes: () => 0
};
function useStorage() {
  const store = {};
  global.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } };
  return store;
}
function mkState(seed) {
  return { ctx: { store: G.newStore(), session: 'abcdefgh1', seq: 0 }, sampleSeed: seed || 12345, poolA: 'nba', poolB: 'nba', current: null, lean: false, sync: { share: false, pending: [] } };
}
function cast(state, left, right, choice, ts) {
  const v = G.makeVote({ left, right }, choice, { session: state.ctx.session, seq: state.ctx.seq, ts: new Date(ts).toISOString() });
  assert.equal(G.addVote(state.ctx.store, v).added, true);
  state.ctx.seq++;
  return v;
}
const id = i => 'nba:c' + i;
/** Plain votes (no feed hooks) at a steady pace. Left always wins unless choice says otherwise. */
function fill(state, n, startTs, step, choice) {
  let ts = startTs;
  for (let i = 0; i < n; i++) { cast(state, id(i % 6), id((i + 2) % 6), choice || 'left', ts); ts += step; }
  return ts;
}

test('combo counts picks in a run; skips and ties neither add nor break; a long pause ends it', () => {
  useStorage();
  const s = mkState();
  let ts = T0;
  for (let i = 0; i < 4; i++) { cast(s, id(0), id(1), 'left', ts); ts += 5 * SEC; }
  cast(s, id(0), id(1), 'skip', ts); ts += 5 * SEC;
  cast(s, id(0), id(1), 'tie', ts); ts += 5 * SEC;
  cast(s, id(0), id(1), 'right', ts);
  assert.equal(F.runCombo(s.ctx.store.votes), 5, 'five picks; the skip and tie are neutral');
  ts += 60 * SEC;
  cast(s, id(0), id(1), 'left', ts);
  assert.equal(F.runCombo(s.ctx.store.votes), 1, 'a 60 second pause starts a new run');
  assert.equal(F.runCombo(s.ctx.store.votes, 5), 4, 'the first five votes were four picks and a skip');
  assert.equal(F.comboNow(s.ctx.store.votes, ts + 10 * SEC), 1);
  assert.equal(F.comboNow(s.ctx.store.votes, ts + 5 * 60 * SEC), 0, 'an old run shows as zero');
  assert.equal(F.comboNow([], T0), 0);
});

test('day streak needs ten judged matchups a day, may still be in progress today, and respects the time zone', () => {
  const s = mkState();
  let seq = 0;
  const day = (offsetDays, count) => { for (let i = 0; i < count; i++) cast(s, id(0), id(1 + (i % 4)), i % 3 ? 'left' : 'skip', T0 + offsetDays * DAY + i * SEC); seq += count; };
  day(-3, 21); day(-2, 18); day(-1, 17);
  let r = F.dayStreak(s.ctx.store.votes, T0 + 5 * SEC, 0);
  assert.equal(r.days, 3, 'three completed days count');
  assert.equal(r.todayDone, false);
  day(0, 25);
  r = F.dayStreak(s.ctx.store.votes, T0 + 2 * 3600 * SEC, 0);
  assert.equal(r.days, 4);
  assert.equal(r.todayDone, true);
  assert.equal(F.dayStreak(s.ctx.store.votes, T0 + 3 * DAY, 0).days, 0, 'a missed day ends the streak');
  // skips alone do not count
  const lazy = mkState();
  for (let i = 0; i < 30; i++) cast(lazy, id(0), id(1), 'skip', T0 + i * SEC);
  assert.equal(F.dayStreak(lazy.ctx.store.votes, T0 + 100 * SEC, 0).days, 0, 'skips do not build a streak');
  // the same instants fall on different local days in different time zones
  const edge = mkState();
  for (let i = 0; i < 10; i++) cast(edge, id(0), id(1), 'left', Date.parse('2026-11-15T02:00:00Z') + i * SEC);
  assert.equal(F.dayIndex(Date.parse('2026-11-15T02:00:00Z'), 0) - F.dayIndex(Date.parse('2026-11-15T02:00:00Z'), 300), 1, 'UTC-5 is still the previous local day');
});

test('titles, progress and badges', () => {
  assert.equal(F.titleFor(0).name, 'Newcomer');
  assert.equal(F.titleFor(24).name, 'Newcomer');
  assert.equal(F.titleFor(25).name, 'Regular');
  assert.equal(F.titleFor(100).name, 'Judge of the Court');
  assert.deepEqual(F.titleFor(100).next, { name: 'Arbiter', at: 250 });
  assert.equal(F.titleFor(5000).next, null);
  assert.deepEqual(F.badgesCrossed({ picks: 9, combo: 3 }, { picks: 10, combo: 4 }).map(b => b.id), ['picks-10']);
  assert.deepEqual(F.badgesCrossed({ picks: 99, combo: 9 }, { picks: 100, combo: 10 }).map(b => b.id), ['picks-100', 'combo-10']);
  assert.equal(F.badgesCrossed({ picks: 99, combo: 9 }, { picks: 100, combo: 10 })[0].title, 'Judge of the Court');
  assert.deepEqual(F.badgesCrossed({ picks: 12, combo: 5 }, { picks: 13, combo: 6 }), [], 'nothing crossed');
});

test('ladder moves report climbs, drops and debuts from the voter\'s own ladder', () => {
  const s = mkState();
  let ts = T0;
  // c0 and c1 each win a few, c2 loses to everyone
  for (const [w, l] of [[0, 2], [1, 2], [0, 2], [1, 2], [0, 1]]) { cast(s, id(w), id(l), 'left', ts); ts += 5 * SEC; }
  // c2 keeps upsetting the leader: at some step c2 must climb and the leader must slip
  let sawClimb = false, before = null, moves = null;
  for (let k = 0; k < 8 && !sawClimb; k++) {
    before = new Map(F.computeRows(s.ctx.store.votes).map(r => [r.id, r.rank]));
    const v = cast(s, id(2), id(0), 'left', ts); ts += 5 * SEC;
    moves = F.ladderMoves(before, F.computeRows(s.ctx.store.votes), v);
    assert.equal(moves.winner.id, id(2));
    assert.ok(moves.winner.delta >= 0 && moves.loser.delta <= 0, 'winner never moves down, loser never moves up');
    sawClimb = moves.winner.delta > 0 && moves.loser.delta < 0;
  }
  assert.ok(sawClimb, 'an upset eventually moves both sides on the ladder');
  const debut = F.ladderMoves(before, F.computeRows(s.ctx.store.votes.concat([G.makeVote({ left: id(9), right: id(0) }, 'left', { session: 'abcdefgh1', seq: 99, ts: new Date(ts + SEC).toISOString() })])), G.makeVote({ left: id(9), right: id(0) }, 'left', { session: 'abcdefgh1', seq: 99 }));
  assert.equal(debut.winner.debut, true);
  assert.equal(F.ladderMoves(before, [], G.makeVote({ left: id(0), right: id(1) }, 'skip', { session: 'abcdefgh1', seq: 0 })), null, 'no movement for a skip');
});

test('crowd lines appear only with enough real votes, and only valid aggregates are accepted', () => {
  const s = mkState();
  const v = cast(s, id(1), id(0), 'left', T0); // winner c1, key c0|c1, a = c0
  assert.equal(F.crowdLine(null, v), null);
  assert.equal(F.buildCrowd({ nonsense: true }), null, 'wrong schema is ignored');
  const mk = (aWins, bWins) => F.buildCrowd({ schema: G.AGG_SCHEMA, version: 1, pairs: [{ key: v.key, a: v.a, b: v.b, aWins, bWins, ties: 0, skips: 0, aLeftDecisive: 0, decisive: aWins + bWins }] });
  assert.equal(F.crowdLine(mk(3, 4), v), null, 'below the minimum there is no line');
  const bold = F.crowdLine(mk(18, 2), v); // my pick is b: 2 of 20 = 10%
  assert.equal(bold.pct, 10); assert.equal(bold.tone, 'bold'); assert.match(bold.text, /^Bold\. Only 10%/);
  const nice = F.crowdLine(mk(3, 9), v);
  assert.equal(nice.pct, 75); assert.equal(nice.tone, 'nice');
  assert.equal(F.crowdLine(mk(6, 6), v).tone, 'plain');
  assert.equal(F.crowdLine(mk(18, 2), cast(s, id(1), id(0), 'tie', T0 + SEC)), null, 'ties get no crowd line');
});

test('own-history lines compare with earlier answers to the same matchup', () => {
  const s = mkState();
  const first = cast(s, id(0), id(1), 'left', T0);
  assert.equal(F.ownLine(s.ctx.store.votes, first), null, 'first time: nothing to compare');
  const again = cast(s, id(1), id(0), 'right', T0 + 5 * SEC); // right = c0 again
  assert.match(F.ownLine(s.ctx.store.votes, again).text, /Same pick as last time/);
  const flip = cast(s, id(0), id(1), 'right', T0 + 10 * SEC); // c1 this time
  assert.match(F.ownLine(s.ctx.store.votes, flip).text, /Mixed history: 0 of 2|changed your mind/);
  const three = cast(s, id(0), id(1), 'left', T0 + 15 * SEC);
  assert.match(F.ownLine(s.ctx.store.votes, three).text, /Mixed history: 2 of 3/);
});

test('top five and taste describe the ladder without rewarding any choice', () => {
  const s = mkState();
  fill(s, 40, T0, 5 * SEC);
  const rows = F.computeRows(s.ctx.store.votes);
  const top = F.topFive(rows);
  assert.equal(top.length, 5);
  assert.deepEqual(top.map(t => t.place), [1, 2, 3, 4, 5]);
  assert.ok(top.every((t, i) => i === 0 || t.rating <= top[i - 1].rating), 'ordered by rating');
  const taste = F.tasteOf(s.ctx.store.votes, rows);
  assert.ok(taste === null || ['Underdog lover', 'Chalk picker', 'Balanced judge'].includes(taste.label));
  assert.equal(F.tasteOf(s.ctx.store.votes.slice(0, 5), F.computeRows(s.ctx.store.votes.slice(0, 5))), null, 'too little data: no taste claim');
});

test('surprise cards are deterministic, use no gameplay RNG, vary in timing, and cover all three kinds', () => {
  useStorage();
  const real = Math.random;
  Math.random = () => { throw new Error('Math.random must not be used by the feed'); };
  try {
    const base = mkState();
    let ts = fill(base, 40, T0, 5 * SEC);
    cast(base, id(0), id(1), 'left', ts); cast(base, id(1), id(0), 'left', ts + SEC); // a contested pair
    const run = seed => {
      const s = mkState(seed);
      s.ctx.store = G.newStore(base.ctx.store.votes);
      const F1 = F.ensure(s); F1.nextSurpriseAt = s.ctx.store.votes.length;
      const pair = F.chooseCard(s, host, { recent: new Set() });
      return pair ? { type: pair.surprise, key: pair.key, left: pair.left, gap: F1.nextSurpriseAt - s.ctx.store.votes.length } : null;
    };
    const kinds = new Set(), gaps = new Set();
    for (let seed = 1; seed <= 80; seed++) {
      const r = run(seed);
      assert.ok(r, 'a special card is always available with this history');
      assert.deepEqual(run(seed), r, 'same seed and history give the same card');
      kinds.add(r.type); gaps.add(r.gap);
      assert.ok(r.gap >= F.SURPRISE_GAP[0] && r.gap <= F.SURPRISE_GAP[1], 'next one is 6 to 12 votes away');
    }
    assert.deepEqual([...kinds].sort(), ['clash', 'dream', 'tiebreak']);
    assert.ok(gaps.size > 3, 'timing varies');
    // each kind has the shape it advertises
    const some = type => { for (let seed = 1; seed < 200; seed++) { const s = mkState(seed); s.ctx.store = G.newStore(base.ctx.store.votes); F.ensure(s).nextSurpriseAt = s.ctx.store.votes.length; const p = F.chooseCard(s, host, { recent: new Set() }); if (p && p.surprise === type) return p; } return null; };
    const clash = some('clash'); assert.notEqual(clash.left.split(':')[0], clash.right.split(':')[0], 'clash crosses pools');
    const tie = some('tiebreak'); assert.equal(tie.key, id(0) + '|' + id(1), 'tiebreaker is the contested pair');
    const dream = some('dream'); assert.ok(host.cardById(dream.left) && host.cardById(dream.right));
    // not due yet: no card
    const idle = mkState(); idle.ctx.store = G.newStore(base.ctx.store.votes); F.ensure(idle).nextSurpriseAt = idle.ctx.store.votes.length + 3;
    assert.equal(F.chooseCard(idle, host, {}), null);
  } finally { Math.random = real; }
});

test('afterVote: badge once per device, reveal every 25, check-in at 50, skips do not count', () => {
  useStorage();
  const real = Math.random;
  Math.random = () => { throw new Error('Math.random must not be used by the feed'); };
  try {
    const s = mkState();
    F.onStart(s, host);
    let ts = T0; clock = ts;
    const step = (left, right, choice) => { const v = cast(s, left, right, choice, ts); clock = ts; F.afterVote(s, host, v); ts += 5 * SEC; return v; };
    for (let i = 0; i < 9; i++) step(id(i % 6), id((i + 2) % 6), 'left');
    assert.ok(s.feed.reward, 'every pick gets some feedback');
    step(id(3), id(5), 'left'); // 10th judged
    assert.equal(s.feed.reward.tone, 'badge');
    assert.match(s.feed.reward.headline, /10 picks judged/);
    assert.equal(s.feed.reward.confetti, true);
    // skips do not move the count or earn anything
    const before = F.judgedCount(s.ctx.store.votes);
    step(id(0), id(1), 'skip');
    assert.equal(F.judgedCount(s.ctx.store.votes), before);
    assert.equal(s.feed.reward.headline, 'Skipped');
    assert.equal(s.feed.interstitial, null);
    // undo and re-vote: the 10-pick badge is not celebrated twice
    const undone = G.undoLast(s.ctx.store); s.ctx.seq--; F.afterUndo(s, host, undone);
    const undone2 = G.undoLast(s.ctx.store); s.ctx.seq--; F.afterUndo(s, host, undone2);
    assert.equal(F.judgedCount(s.ctx.store.votes), 9);
    step(id(3), id(5), 'left');
    assert.ok(!/picks judged/.test(s.feed.reward.headline || ''), 'badge already seen on this device');
    // reach 25 judged matchups: a top-five reveal appears
    while (F.judgedCount(s.ctx.store.votes) < 25) step(id(s.ctx.store.votes.length % 6), id((s.ctx.store.votes.length + 2) % 6), 'left');
    assert.equal(s.feed.interstitial.type, 'top5');
    assert.equal(s.feed.interstitial.top.length, 5);
    assert.equal(s.feed.interstitial.checkIn, false);
    F.dismiss(s); assert.equal(s.feed.interstitial, null);
    while (F.judgedCount(s.ctx.store.votes) < 50) step(id(s.ctx.store.votes.length % 6), id((s.ctx.store.votes.length + 2) % 6), 'left');
    assert.equal(s.feed.interstitial.picks, 50);
    assert.equal(s.feed.interstitial.checkIn, true, 'the 50-pick reveal carries the soft check-in');
    assert.ok(s.feed.persist.bestCombo >= 10);
  } finally { Math.random = real; clock = T0; }
});

test('afterVote reports ladder movement and own-history lines', () => {
  useStorage();
  const s = mkState();
  F.onStart(s, host);
  let ts = T0; clock = ts;
  const step = (l, r, c) => { const v = cast(s, l, r, c, ts); clock = ts; F.afterVote(s, host, v); ts += 5 * SEC; return v; };
  step(id(0), id(1), 'left'); step(id(0), id(2), 'left'); step(id(0), id(3), 'left');
  step(id(4), id(0), 'left'); // c4 beats the leader
  const tags = s.feed.reward.tags.map(t => t.text).join(' | ');
  assert.match(tags, /Hero 4/);
  assert.match(tags, /climbs|debuts|drops/);
  step(id(5), id(3), 'left');
  step(id(0), id(1), 'left'); // same matchup, same pick, again
  assert.match(s.feed.reward.headline, /Same pick as last time/);
  clock = T0;
});

test('sound: tone recipes rise with the combo, nothing plays when off, and a missing audio engine is harmless', () => {
  assert.ok(F.toneSet('pick', 8)[0].f > F.toneSet('pick', 0)[0].f * 1.5);
  assert.ok(F.toneSet('pick', 99)[0].f === F.toneSet('pick', 16)[0].f, 'pitch is capped');
  for (const n of ['pick', 'soft', 'combo', 'milestone', 'surprise', 'reveal', 'undo']) assert.ok(F.toneSet(n, 3).length > 0, n);
  assert.deepEqual(F.toneSet('nope', 1), []);
  const made = []; let created = 0, buzz = [];
  const mkCtx = () => { created++; return { currentTime: 1, state: 'suspended', resume() { this.state = 'running'; return Promise.resolve(); }, destination: {}, createGain() { return { gain: { value: 0, setValueAtTime() { }, exponentialRampToValueAtTime() { } }, connect() { } }; }, createOscillator() { const o = { type: '', frequency: { setValueAtTime() { }, exponentialRampToValueAtTime() { } }, connect() { }, start() { made.push(o); }, stop() { } }; return o; } }; };
  let on = false;
  const snd = F.createSound({ enabled: () => on, getContext: mkCtx, vibrate: p => buzz.push(p) });
  assert.equal(snd.play('pick', 2), false); snd.unlock();
  assert.equal(created, 0, 'no audio engine is created while sound is off');
  assert.deepEqual(buzz, [], 'no buzz while sound is off');
  on = true;
  assert.equal(snd.play('milestone', 0), true);
  assert.equal(made.length, 5);
  assert.equal(created, 1, 'one engine is reused');
  snd.play('pick', 1); assert.equal(created, 1);
  assert.ok(buzz.length >= 2);
  const none = F.createSound({ enabled: () => true, getContext: () => null, vibrate() { } });
  assert.equal(none.play('pick', 1), false);
  const boom = F.createSound({ enabled: () => true, getContext: () => { throw new Error('no audio'); }, vibrate() { } });
  assert.equal(boom.play('pick', 1), false);
});

test('settings persist on this device; motion defaults off for reduced-motion users', () => {
  const store = useStorage();
  const s = mkState();
  const fx = F.ensure(s);
  assert.equal(fx.persist.sound, true); assert.equal(fx.persist.motion, true);
  assert.equal(F.toggle(s, 'sound'), false);
  assert.equal(F.toggle(s, 'motion'), false);
  assert.equal(F.toggle(s, 'bogus'), false);
  const saved = JSON.parse(store[F.SETTINGS_KEY]);
  assert.equal(saved.sound, false); assert.equal(saved.motion, false);
  const s2 = mkState(); const f2 = F.ensure(s2);
  assert.equal(f2.persist.sound, false); assert.equal(f2.persist.motion, false);
  const prevMatch = global.matchMedia;
  global.matchMedia = q => ({ matches: /reduce/.test(q) });
  useStorage();
  try { assert.equal(F.ensure(mkState()).persist.motion, false, 'OS reduced-motion turns motion off by default'); } finally { global.matchMedia = prevMatch; }
  delete global.localStorage;
});

test('vote screen: all the controls, no engine prediction, escaped names, motion class, reveal replaces the pair', () => {
  useStorage();
  const s = mkState();
  F.onStart(s, host);
  s.current = { key: id(0) + '|' + id(1), a: id(0), b: id(1), left: id(0), right: id(1) };
  clock = T0;
  let html = F.voteHTML(s, host);
  assert.equal((html.match(/data-act="gaunt-pick"/g) || []).length, 2);
  for (const a of ['gaunt-tie', 'gaunt-skip', 'gaunt-lean', 'gaunt-undo', 'gaunt-ladder', 'gaunt-setup', 'gaunt-sound', 'gaunt-motion']) assert.ok(html.includes('data-act="' + a + '"'), a);
  assert.ok(!/\bodds\b|win probability|favou?rite/i.test(html), 'no engine prediction before voting');
  assert.ok(!html.includes('gt-reduce'));
  F.toggle(s, 'motion');
  assert.ok(F.voteHTML(s, host).includes('gt-reduce'), 'motion off adds the class that stops animation');
  // surprise label
  s.current = Object.assign({}, s.current, { surprise: 'dream' });
  assert.match(F.voteHTML(s, host), /Dream final/);
  // names are escaped
  const evil = '<img src=x onerror=alert(1)>';
  byPool.nba[0].n = evil;
  try { assert.ok(!F.voteHTML(s, host).includes(evil), 'raw markup never appears'); assert.ok(F.voteHTML(s, host).includes('&lt;img')); } finally { byPool.nba[0].n = 'NBA Hero 0'; }
  // reveal card hides the pair
  fill(s, 30, T0, 5 * SEC);
  s.feed.interstitial = { type: 'top5', picks: 50, top: F.topFive(F.computeRows(s.ctx.store.votes)), taste: null, checkIn: true };
  html = F.voteHTML(s, host);
  assert.ok(html.includes('data-act="gaunt-continue"') && !html.includes('data-act="gaunt-pick"'));
  assert.match(html, /Stop whenever you like/);
  assert.equal(F.voteHTML(Object.assign(mkState(), { current: null }), host), null);
  delete global.localStorage;
});

test('wired into Gauntlet: votes are stored exactly as before, and a broken feed cannot block voting', () => {
  const store = useStorage();
  const cands = { nba: chars('nba'), mcu: chars('mcu') };
  global.POOLS = { nba: { entries: [1], short: 'NBA' }, mcu: { entries: [1], short: 'MCU' }, mashup: { entries: [1] } };
  global.getPool = pid => global.POOLS[pid];
  global.getCands = pid => cands[pid].map(c => Object.assign({ t: 'tag', a: [50] }, c));
  global.esc = esc; global.avatar = () => '';
  try {
    G.setFeed(F);
    const st = G.newState();
    st.poolA = 'nba'; st.poolB = 'mcu';
    G.start(st);
    assert.ok(st.feed, 'feed state created on start');
    let surprises = 0;
    for (let i = 0; i < 60; i++) {
      if (st.current.surprise) surprises++;
      const choice = i % 11 === 10 ? 'skip' : i % 7 === 6 ? 'tie' : i % 2 ? 'left' : 'right';
      assert.equal(G.vote(st, choice).accepted, true);
      if (st.feed.interstitial) F.dismiss(st);
    }
    assert.ok(surprises >= 3 && surprises <= 14, 'special cards appear now and then (' + surprises + ' in 60)');
    const votes = st.ctx.store.votes;
    assert.equal(votes.length, 60);
    assert.ok(votes.every(v => G.validateVote(v).ok), 'every vote is a plain schema-v1 vote');
    assert.ok(votes.every(v => Object.keys(v).sort().join() === Object.keys(votes[0]).sort().join()), 'no extra fields are added to votes');
    const html = G.render(st);
    assert.ok(html.includes('gt-feed') && html.includes('data-act="gaunt-pick"'));
    // a feed that throws never blocks a vote or the screen
    G.setFeed({ afterVote() { throw new Error('boom'); }, chooseCard() { throw new Error('boom'); }, voteHTML() { throw new Error('boom'); }, onStart() { throw new Error('boom'); } });
    const st2 = G.newState(); st2.poolA = st2.poolB = 'nba'; G.start(st2);
    assert.equal(G.vote(st2, 'left').accepted, true);
    assert.equal(st2.ctx.store.votes.length, 61, 'saved on top of the 60 already on this device');
    assert.ok(G.render(st2).includes('data-act="gaunt-pick"'), 'falls back to the plain vote screen');
    G.setFeed(null);
    const st3 = G.newState(); st3.poolA = st3.poolB = 'nba'; G.start(st3);
    assert.ok(!G.render(st3).includes('gt-feed'), 'without the feed the original screen is used');
    assert.equal(G.vote(st3, 'right').accepted, true);
    assert.ok(Object.keys(store).includes(G.STORE_KEY));
  } finally {
    G.setFeed(null);
    for (const k of ['POOLS', 'getPool', 'getCands', 'esc', 'avatar', 'localStorage']) delete global[k];
  }
});

test('per-vote cost stays small even with thousands of saved votes', () => {
  useStorage();
  const s = mkState();
  const many = Array.from({ length: 200 }, (_, i) => 'nba:p' + i);
  let ts = T0;
  for (let i = 0; i < 3000; i++) { const a = many[(i * 7) % 200], b = many[(i * 13 + 5) % 200]; if (a === b) continue; cast(s, a, b, i % 2 ? 'left' : 'right', ts); ts += 3 * SEC; }
  const hostBig = Object.assign({}, host, { cardById: id2 => ({ id: id2, n: id2, pool: 'nba' }) });
  F.onStart(s, hostBig);
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < 5; i++) { const v = cast(s, many[i], many[i + 50], 'left', ts); ts += 3 * SEC; clock = ts; F.afterVote(s, hostBig, v); }
  const perVoteMs = Number(process.hrtime.bigint() - t0) / 1e6 / 5;
  assert.ok(perVoteMs < 400, 'one vote with 3000 saved votes took ' + perVoteMs.toFixed(1) + ' ms');
  clock = T0;
  delete global.localStorage;
});

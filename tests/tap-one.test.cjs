/* Run with: node tests/tap-one.test.cjs */
(function runTests() {
  'use strict';
  const assert = require('node:assert/strict');
  // Tap One reads Campaign's shared tag helper at call time. Provide a stand-in keyed on a fake `tags` list.
  globalThis.campaignHoldsAcceptedTag = (c, accepted) => (c.tags || []).some(t => accepted.includes(t));
  const T = require('../data/tap-one.js');

  // Synthetic DC-like roster: 60 characters, with enough villains, magic users and tech users to deal every hand.
  const cands = [];
  for (let i = 0; i < 60; i++) {
    const a = Array.from({length: 12}, (_, k) => 20 + ((i * 7 + k * 13) % 75));
    cands.push({
      id: 'dc:c' + i, n: 'Char ' + i, pool: 'dc', a,
      archetype: i % 9 === 0 ? 'assassin' : i % 5 === 0 ? 'tactician' : 'metahuman',
      taxonomy: i % 4 === 0 ? ['Legion of Doom'] : i % 11 === 0 ? ['Flash Rogues'] : ['Justice League'],
      tags: (i % 6 === 0 ? ['magic'] : []).concat(i % 7 === 0 ? ['powered-armor'] : [])
    });
  }
  const byId = new Map(cands.map(c => [c.id, c]));
  const look = id => byId.get(id);

  // ----- run construction -----
  const run = T.buildRun(12345, cands);
  assert.equal(run.rounds.length, T.ROUNDS);
  assert.deepEqual(run.rounds.map(r => r.cat), T.CATEGORIES.map(c => c.id));
  assert.ok(run.rounds.every(r => r.hand.length === T.HAND && new Set(r.hand).size === T.HAND));
  const everyone = run.rounds.flatMap(r => r.hand);
  assert.equal(new Set(everyone).size, T.ROUNDS * T.HAND, 'nobody is dealt twice in one run');
  assert.deepEqual(T.buildRun(12345, cands), run, 'same seed deals the same run');
  assert.notDeepEqual(T.buildRun(54321, cands).rounds.map(r => r.hand), run.rounds.map(r => r.hand));
  assert.ok(T.validRun(run));
  assert.equal(T.validRun({...run, rounds: run.rounds.slice(1)}), false);
  assert.throws(() => T.buildRun(1, cands.slice(0, 10)), /Not enough characters/);

  // Signal categories always hold a real choice: at least two qualified characters in the hand.
  for (let seed = 1; seed <= 200; seed++) {
    const r = T.buildRun(seed, cands);
    for (const round of r.rounds) {
      const cat = T.CATEGORIES.find(c => c.id === round.cat);
      if (!cat.qualifies) continue;
      const n = round.hand.filter(id => cat.qualifies(look(id))).length;
      assert.ok(n >= 2, cat.id + ' hand needs two qualified characters (seed ' + seed + ')');
    }
  }

  // ----- scoring -----
  const mk = (id, extra) => ({id, n: id, pool: 'dc', a: Array(12).fill(50), archetype: 'metahuman', taxonomy: [], tags: [], ...extra});
  const strong = mk('s', {a: [50, 50, 95, 50, 50, 50, 50, 50, 50, 50, 50, 50]});
  const mid = mk('m', {a: [50, 50, 70, 50, 50, 50, 50, 50, 50, 50, 50, 50]});
  const weak = mk('w', {a: [50, 50, 30, 50, 50, 50, 50, 50, 50, 50, 50, 50]});
  const tie = mk('t', {a: [50, 50, 70, 50, 50, 50, 50, 50, 50, 50, 50, 50]});
  const hand = [strong, mid, weak, tie];
  assert.equal(T.gapFor('strength', hand, 's'), 0);
  assert.equal(T.gapFor('strength', hand, 'm'), 1);
  assert.equal(T.gapFor('strength', hand, 't'), 1, 'ties share the same gap');
  assert.equal(T.gapFor('strength', hand, 'w'), 3);
  assert.equal(T.gapFor('strength', hand, 'nobody'), null);
  assert.equal(T.gapFor('nope', hand, 's'), null);
  // Villainy is affiliation based; a hero never outranks a villain.
  const villain = mk('v', {taxonomy: ['Suicide Squad']}), hero = mk('h', {a: Array(12).fill(99)});
  assert.ok(T.isVillain(villain) && !T.isVillain(hero));
  assert.equal(T.gapFor('villainy', [villain, hero], 'h'), 1);
  assert.equal(T.gapFor('villainy', [villain, hero], 'v'), 0);
  // Martial Arts favors trained fighters over raw power.
  const fighter = mk('f', {archetype: 'assassin', a: Array(12).fill(80)}), god = mk('g', {archetype: 'cosmic', a: Array(12).fill(88)});
  assert.equal(T.gapFor('martial', [fighter, god], 'f'), 0);

  // ----- play-through -----
  const play = T.buildRun(777, cands);
  assert.equal(T.current(play), 0);
  assert.equal(T.pick(play, 'dc:not-in-hand', look).accepted, false);
  for (let i = 0; i < T.ROUNDS; i++) {
    assert.equal(T.current(play), i);
    assert.equal(T.done(play), false);
    const res = T.pick(play, play.rounds[i].hand[0], look);
    assert.ok(res.accepted && res.gap >= 0 && res.gap <= 3);
  }
  assert.equal(T.done(play), true);
  assert.equal(T.pick(play, play.rounds[0].hand[0], look).accepted, false, 'finished run takes no more picks');
  assert.ok(T.total(play) >= 0 && T.total(play) <= T.ROUNDS * 3);

  // A run of always-best picks scores 0; always-worst picks stay within the 24 cap.
  function perfect(seed, worst) {
    const r = T.buildRun(seed, cands);
    r.rounds.forEach(round => {
      const cat = T.CATEGORIES.find(c => c.id === round.cat);
      const ranked = round.hand.map(look).sort((x, y) => cat.score(y) - cat.score(x));
      T.pick(r, (worst ? ranked[ranked.length - 1] : ranked[0]).id, look);
    });
    return r;
  }
  for (let seed = 1; seed <= 50; seed++) {
    assert.equal(T.total(perfect(seed, false)), 0);
    assert.ok(T.total(perfect(seed, true)) <= 24);
  }

  // ----- labels and sharing -----
  assert.equal(T.titleFor(0), 'Perfect build');
  assert.equal(T.titleFor(3), 'Elite build');
  assert.equal(T.titleFor(7), 'Solid build');
  assert.equal(T.titleFor(12), 'Rough build');
  assert.equal(T.titleFor(13), 'Wrong multiverse');
  const share = T.shareText(play, look);
  assert.match(share, /^Draft Anything · Tap One \(DC\) · \d+ \(0 is perfect\)\n[🟩🟨🟧🟥]{8}\n/u);
  // The share text and result never carry hidden ratings: no attribute numbers, only the score and the picks' names.
  assert.equal(/\b(rating|score:|\d{2,3}\/)/i.test(share), false);

  console.log('tap-one tests passed');
})();

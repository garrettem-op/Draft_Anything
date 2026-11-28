'use strict';
/* Version 2: reviewed power tiers for research moves (research/option-c/power-tiers.json,
   docs/option-c/POWER_TIERS.md). A tier is an editorial review tied to the record's own feat or technique. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp } = require('./helpers/option-c-app-harness.cjs');
const DATA = require('../data/option-c/research-moves-data.js');
const RM = require('../data/option-c/research-moves.js');
const builder = require('../tools/build-research-moves.cjs');
const pipe = require('../tools/v2-research-pipeline.cjs');
const { CORE } = require('../data/brawl-attack-profiles.js');
const OVERLAY = JSON.parse(fs.readFileSync(path.join(__dirname, '../research/option-c/power-tiers.json'), 'utf8'));
const ROSTER = new Set(pipe.rosterIds());
const row = (id) => DATA.rows.find((r) => r[0] === id);

test('the overlay: real identities in reviewed pools, tiers 1-4, a stated reason for every dropped move', () => {
  const pools = new Set(OVERLAY.reviewedPools);
  assert.ok(pools.size >= 2);
  for (const [id, t] of Object.entries(OVERLAY.tiers)) {
    assert.ok(ROSTER.has(id), 'not a roster identity: ' + id);
    assert.ok(pools.has(id.split(':')[0]), id + ' is tiered but its pool is not marked reviewed');
    assert.ok(Number.isInteger(t.tier) && t.tier >= 1 && t.tier <= 4, id + ': tier 5 and ranks stay with individual profiles');
    assert.ok(!CORE[id], id + ' has an individual profile; tier it there');
    assert.ok(!(id in OVERLAY.noMove), id + ' is both tiered and dropped');
  }
  for (const [id, reason] of Object.entries(OVERLAY.noMove)) {
    assert.ok(ROSTER.has(id), 'not a roster identity: ' + id);
    assert.ok(typeof reason === 'string' && reason.length >= 25, id + ' needs a reason');
    assert.equal(row(id), undefined, id + ' must have no generated move');
  }
});

test('every reviewed tier is tied to the record: the generated row carries the tier and its basis', () => {
  for (const [id, t] of Object.entries(OVERLAY.tiers)) {
    const r = row(id);
    assert.ok(r, id + ' has no generated move');
    assert.equal(r[7], t.tier, id);
    assert.ok(typeof r[8] === 'string' && r[8].length >= 20, id + ' needs a basis from its record');
    if (t.domain) assert.equal(r[2], t.domain, id);
    if (t.domain === 'melee') assert.ok(t.move, id + ': a melee signature names its technique');
    if (t.move) { const shown = r[1].toLowerCase(), named = t.move.toLowerCase(); // the generator capitalises and shortens the technique
      assert.ok(shown.startsWith(named.slice(0, 20)) || named.startsWith(shown), id + ': move named after the reviewed technique'); }
  }
  for (const r of DATA.rows) if (!(r[0] in OVERLAY.tiers)) assert.equal(r.length, 7, r[0] + ' is not reviewed and must stay at the standard strength');
  const rec = { id: 'x:y', feats: [{ claim: 'Did a thing', citation: 'Book 1' }], offense: { techniques: ['Blast'] } };
  assert.equal(builder.tierBasis(rec, { tier: 3 }), 'Did a thing (Book 1)');
  assert.equal(builder.tierBasis(rec, { tier: 3, technique: 'Blast' }), 'Technique on record: Blast');
  assert.throws(() => builder.tierBasis(rec, { tier: 3, technique: 'Invented' }), /not in the record/);
  assert.throws(() => builder.tierBasis({ id: 'x:z', feats: [], offense: {} }, { tier: 4 }), /no feat in the record/);
  const built = builder.build();
  assert.deepEqual(built.rows.filter((r) => r.length > 7).map((r) => [r[0], r[7]]), DATA.rows.filter((r) => r.length > 7).map((r) => [r[0], r[7]]), 'generated file is in step with the overlay');
  assert.deepEqual(DATA.reviewedPools, OVERLAY.reviewedPools);
});

test('strength follows the tier: pierce 12/17/22/27%, the standard is unchanged, the limit states the basis', () => {
  assert.deepEqual([1, 2, 3, 4].map(RM.pierceFor), [0.12, 0.17, 0.22, 0.27]);
  const surfer = RM.researchMoveOf({ pool: 'mcu', n: 'Silver Surfer' });
  assert.equal(surfer.tier, 4); assert.equal(surfer.domain, 'cosmic'); assert.equal(surfer.pierce, 0.27); assert.equal(surfer.tierReviewed, true);
  assert.match(surfer.limit, /reviewed power tier 4\. Basis in its research record: Traveled across galaxies/);
  const std = DATA.rows.find((r) => r.length === 7), [pool, n] = [std[0].split(':')[0], std[0].slice(std[0].indexOf(':') + 1)];
  if (!n.includes('|')) { const m = RM.researchMoveOf({ pool, n }); assert.equal(m.tier, 2); assert.equal(m.pierce, 0.17); assert.equal(m.tierReviewed, false); assert.equal(m.limit, RM.LIMIT); }
  assert.equal(RM.researchMoveOf({ pool: 'dc', n: 'Amanda Waller' }), null, 'directing a task force is not an arena attack');
});

test('in the fight: tier 4 brings the ward, never a rank; tier-4 psychic power is high-order; a dropped move falls back to V1', () => {
  const r = JSON.parse(loadApp().run(`JSON.stringify((() => {
    const pos = SPORTS.brawl.pos.find(p => p.id === 'd1'), find = (pool, n) => getCands(pool).find(c => c.n === n);
    const T = c => ({ rating: 80, rows: [{ pos, cand: c, fit: fitIn('brawl', c, pos) }] });
    const F = (pa, a, pb, b) => { const g = DA_BRAWL_COMBAT.resolveBrawlCombat(T(find(pa, a)), T(find(pb, b)), [80, 80], rngFrom('pt')); return g.sides.map(s => s.fighters[0]).map(f => ({ move: f.powerMove, dom: f.powerDomain, ward: f.wardHp, apex: f.apexRank, rank: f.intrinsicRank, limit: f.powerLimit })); };
    const duel = (pa, a, pb, b) => { let w = 0; const ta = T(find(pa, a)), tb = T(find(pb, b)); for (let s = 0; s < 300; s++) if (DA_BRAWL_COMBAT.resolveBrawlCombat(ta, tb, [80, 80], rngFrom('pt|' + s)).winner === 0) w++; return w / 300; };
    return { sb: F('mcu', 'Silver Surfer', 'dc', 'Black Adam'), jx: F('mcu', 'Jean Grey', 'mcu', 'Professor X'), aq: F('dc', 'Aquaman', 'dc', 'Amanda Waller'), cr: F('dc', 'Killer Croc', 'dc', 'Mera'),
      surferVsAdam: duel('mcu', 'Silver Surfer', 'dc', 'Black Adam'), jeanVsAchilles: duel('mcu', 'Jean Grey', 'actionmovies', 'Achilles') };
  })())`));
  const [surfer, adam] = r.sb, [jean, xavier] = r.jx, [aquaman, waller] = r.aq;
  assert.ok(surfer.ward > 0, 'tier-4 cosmic research move brings the finite ward'); assert.equal(adam.ward, 0, 'tier 3 does not');
  for (const f of [surfer, adam, xavier]) { assert.equal(f.apex, 0); assert.equal(f.rank, 0, 'research never grants an Apex or intrinsic rank'); }
  assert.ok(jean.ward > 0 && xavier.ward > 0, 'tier-4 psychic power is high-order');
  assert.equal(aquaman.move, 'Marine life command', 'the review names the move after another technique in the record');
  assert.equal(waller.move, '', 'no signature move: plain attacks');
  assert.equal(r.cr[0].move, '', 'a bite is a plain attack');
  // The project vision's own example, and the matchup that started the caster work.
  assert.ok(r.surferVsAdam > 0.6, 'Silver Surfer is generally favored over Black Adam: ' + r.surferVsAdam);
  assert.ok(r.jeanVsAchilles > 0.5, 'Jean Grey is favored over Achilles: ' + r.jeanVsAchilles);
});

test('physical powerhouses get a reviewed melee signature; power users strike with their power between signature uses', () => {
  const hulk = RM.researchMoveOf({ pool: 'mcu', n: 'Hulk' });
  assert.equal(hulk.domain, 'melee'); assert.equal(hulk.tier, 3); assert.match(hulk.limit, /Stopped a speeding Chitauri Leviathan/);
  assert.throws(() => builder.tierBasis({ id: 'x:y', feats: [], offense: { techniques: ['Punch'] } }, { tier: 3, domain: 'melee', move: 'Punch' }), /no feat in the record/);
  const r = JSON.parse(loadApp().run(`JSON.stringify((() => {
    const pos = SPORTS.brawl.pos.find(p => p.id === 'd1'), find = (pool, n) => getCands(pool).find(c => c.n === n);
    const T = c => ({ rating: 80, rows: [{ pos, cand: c, fit: fitIn('brawl', c, pos) }] });
    const duel = (pa, a, pb, b) => { let w = 0; const ta = T(find(pa, a)), tb = T(find(pb, b)); for (let s = 0; s < 300; s++) if (DA_BRAWL_COMBAT.resolveBrawlCombat(ta, tb, [80, 80], rngFrom('mel|' + s)).winner === 0) w++; return w / 300; };
    const f = (pa, a) => DA_BRAWL_COMBAT.resolveBrawlCombat(T(find(pa, a)), T(find('mcu', 'Hawkeye')), [80, 80], rngFrom('ps')).sides[0].fighters[0];
    return { hulkVsAbom: duel('mcu', 'Hulk', 'mcu', 'Abomination'), yodaVsAchilles: duel('starwars', 'Yoda', 'actionmovies', 'Achilles'),
      strike: { hulk: f('mcu', 'Hulk').powerStrike, xavier: f('mcu', 'Professor X').powerStrike, yoda: f('starwars', 'Yoda').powerStrike, hawkeye: f('mcu', 'Black Widow').powerStrike } };
  })())`));
  assert.ok(r.hulkVsAbom > 0.4, 'the Hulk is no longer a clear underdog to the Abomination: ' + r.hulkVsAbom);
  assert.ok(r.yodaVsAchilles > 0.5, 'Yoda is favored over Achilles: ' + r.yodaVsAchilles);
  assert.equal(r.strike.hulk, 0, 'a melee signature still strikes with the body');
  assert.equal(r.strike.xavier, 95); assert.equal(r.strike.yoda, 95, 'tier 4: a lesser use of the power, not bare hands');
});

test('comedy and performance are not power attacks; gods and reality-benders are tiered', () => {
  const m = (pool, n) => RM.researchMoveOf({ pool, n });
  for (const n of ['Waldorf', 'Kermit the Frog', 'Scooter', 'Sam Eagle', 'Link Hogthrob']) assert.equal(m('muppets', n), null, n + ' has no research move');
  assert.deepEqual([m('muppets', 'Miss Piggy').move, m('muppets', 'Miss Piggy').domain], ['Karate chop', 'melee']);
  assert.equal(m('muppets', 'Crazy Harry').tier, 1);
  const bugs = m('toons', 'Bugs Bunny');
  assert.deepEqual([bugs.move, bugs.tier], ['Cartoon physics manipulation', 2], 'Bugs Bunny keeps the standard, named after his real power');
  for (const n of ['Goofy', 'Snow White', 'Velma', 'Buzz Lightyear']) assert.equal(m('toons', n), null, n + ' has no research move');
  assert.deepEqual([m('toons', 'Hades').tier, m('toons', 'Rick Sanchez').tier, m('actionmovies', 'Aslan').tier], [4, 4, 4]);
  assert.deepEqual([m('toons', 'Elsa').tier, m('toons', 'Blossom').tier, m('actionmovies', 'Neo').tier], [3, 3, 3]);
  assert.equal(m('actionmovies', 'Xerxes'), null, 'commanding an army is not an arena attack');
});

test('games and Pokémon: a trainer or pilot has no attack of his own; tiers follow evolution, legend and feats', () => {
  const m = (pool, n) => RM.researchMoveOf({ pool, n });
  for (const n of ['Ash Ketchum', 'Professor Oak', 'Fox McCloud', 'Cortana', 'Q*bert']) assert.equal(m('games', n), null, n + ' has no research move');
  assert.deepEqual([m('games', 'Kratos').tier, m('games', 'Bayonetta').tier], [4, 4]);
  assert.deepEqual([m('games', 'Sonic the Hedgehog').domain, m('games', 'Sonic the Hedgehog').tier, m('games', 'Shadow the Hedgehog').tier], ['melee', 3, 3], 'rivals are tiered together');
  assert.deepEqual([m('games', 'Mario|Fire Mario') && 1, m('games', 'Creeper').tier], [1, 1]);
  for (const n of ['Pidgey', 'Charmander', 'Squirtle', 'Abra']) assert.equal(m('pokemon', n).tier, 1, n + ' is an unevolved Pokémon');
  for (const n of ['Charizard', 'Raichu', 'Gengar', 'Pikachu']) assert.equal(m('pokemon', n).tier, 2, n + ' stays at the standard');
  for (const n of ['Zapdos', 'Articuno', 'Moltres', 'Dragonite', 'Gyarados']) assert.equal(m('pokemon', n).tier, 3, n);
  assert.equal(m('pokemon', 'Ditto'), null, 'Transform is not an attack of its own');
  assert.deepEqual(OVERLAY.reviewedPools.slice().sort(), ['actionmovies', 'dc', 'games', 'harrypotter', 'lotr', 'mcu', 'muppets', 'pokemon', 'starwars', 'toons'], 'all ten pools are reviewed');
});

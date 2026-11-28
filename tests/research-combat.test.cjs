'use strict';
/* Version 2: the research record's guards, weaknesses, power barrier and fighting proficiency count in
   Battle Royale fights (owner direction 2026-11-27: V2 covers weapon mastery from researched techniques
   and durability from documented powers). docs/option-c/RESEARCH_POWERS.md. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./helpers/option-c-app-harness.cjs');
const DATA = require('../data/option-c/research-moves-data.js');
const RM = require('../data/option-c/research-moves.js');
const RP = require('../data/option-c/research-profile.js');
const builder = require('../tools/build-research-moves.cjs');
const pipe = require('../tools/v2-research-pipeline.cjs');

const ROSTER = new Set(pipe.rosterIds());
const POWER_TYPES = new Set(Object.values(RP.DOMAIN_MAP).filter((d) => !RP.CONVENTIONAL.includes(d)));
const row = (id) => DATA.combat.find((r) => r[0] === id);

test('proficiency: only a named fighting or weapon technique, and its level only from that technique\'s own words', () => {
  assert.deepEqual(RP.proficiencyOf(['Master martial arts', 'Gadget deployment']), { level: 'master', technique: 'Master martial arts' });
  assert.equal(RP.proficiencyOf(['Master of the Mystic Arts', 'Astral projection']), null, 'no fighting technique named');
  assert.equal(RP.proficiencyOf(['Form IV (Ataru) acrobatic lightsaber combat']).level, 'expert', 'a named form is formal training');
  assert.equal(RP.proficiencyOf(['Spear thrusts and sweeps']).level, 'trained');
  assert.equal(RP.proficiencyOf(['Cosmic energy blasts', 'Flight']), null, 'a power is not proficiency');
  assert.equal(RP.proficiencyOf(['Blaster rifle volley fire', 'Green Destiny sword mastery']).level, 'master', 'the highest documented level wins');
});

test('barriers and weaknesses: explicit wording only', () => {
  assert.equal(RP.shieldOf(['Invulnerable silvery skin', 'Force fields']).kind, 'force');
  assert.equal(RP.shieldOf(['Telekinetic shields']).kind, 'telekinetic');
  assert.equal(RP.shieldOf(['Magical aura shielding']).kind, 'magical');
  assert.equal(RP.shieldOf(['Psychic shield against telepaths']), null, 'a mental shield guards the mind, not the body');
  assert.equal(RP.shieldOf(['Bronze armor and heavy shield', 'Vibranium-alloy shield blocking']), null, 'a carried shield is not a power barrier');
  const weak = (w) => RP.deriveFromRecord({ id: 'x:y', weaknesses: [w] }).weakTo;
  assert.deepEqual(weak('Vulnerability to intense electrical discharges such as Force lightning'), ['energy']);
  assert.deepEqual(weak('Vulnerability to high-tier magic and trickery'), ['magic']);
  assert.deepEqual(weak('Vulnerability to extreme energy drains or mystical containment'), [], 'a drain is not an energy attack');
  assert.deepEqual(weak('Reliance on his armor'), []);
});

test('generated combat extras: real identities, no NBA, closed vocabularies, in step with the research', () => {
  assert.ok(DATA.combat.length > 500, 'expected several hundred rows, got ' + DATA.combat.length);
  const seen = new Set(), kinds = new Set(RP.SHIELD_PATTERNS.map((p) => p.kind));
  for (const [id, guard, weakTo, shield, prof, source, armor] of DATA.combat) {
    assert.ok(ROSTER.has(id), 'not a roster identity: ' + id);
    assert.ok(!seen.has(id), 'duplicate ' + id); seen.add(id);
    assert.ok(!id.startsWith('nba:'), 'NBA players are exempt from research: ' + id);
    for (const g of [...guard, ...weakTo]) assert.ok(POWER_TYPES.has(g), id + ': unknown guard/weakness ' + g);
    if (shield) { assert.ok(kinds.has(shield[0]), id + ': shield kind ' + shield[0]); assert.ok(shield[1].length >= 5 && shield[1].length <= 71, id); }
    if (prof) { assert.ok(RP.PROFICIENCY_LEVELS.includes(prof[0]), id + ': level ' + prof[0]); assert.ok(prof[1].length >= 3 && prof[1].length <= 71, id); }
    if (armor) { assert.ok(['light', 'standard', 'heavy'].includes(armor[0]), id + ': armour grade ' + armor[0]); assert.ok(armor[1].length >= 4 && armor[1].length <= 71, id); }
    assert.ok(guard.length || weakTo.length || shield || prof || armor, id + ': empty row');
    assert.equal(typeof source, 'string');
  }
  const built = builder.build().combat, key = (r) => JSON.stringify(r), have = new Set(DATA.combat.map(key));
  const stale = built.filter((r) => !have.has(key(r))).length;
  if (stale) console.log('# combat extras differ from current research in ' + stale + ' row(s); run node tools/build-research-moves.cjs');
  // Documented examples the rules were written for.
  assert.equal(row('starwars:Yoda')[4][0], 'expert'); assert.equal(row('starwars:Yoda')[3][0], 'force');
  assert.ok(row('starwars:Darth Vader')[2].includes('energy'), 'Vader: documented weakness to electrical discharge');
  assert.equal(row('dc:Batman')[4][0], 'master');
  assert.ok(row('dc:Black Adam')[2].includes('magic'));
});

test('lookup: one fixed standard, fresh objects, a form uses its own record, the switch turns it off', () => {
  const yoda = { pool: 'starwars', n: 'Yoda', a: Array(12).fill(70) };
  const x = RM.researchCombatOf(yoda);
  assert.equal(x.proficiency.strike, RM.STRIKE.expert); assert.equal(x.shield.pool, 30); assert.equal(x.shield.level, 1); assert.equal(x.shield.blocks, 'all');
  x.guard.push('x'); assert.ok(!RM.researchCombatOf(yoda).guard.includes('x'), 'callers cannot change the shared table');
  assert.deepEqual(Object.keys(yoda), ['pool', 'n', 'a'], 'candidate not mutated');
  assert.ok(RM.STRIKE.trained < RM.STRIKE.expert && RM.STRIKE.expert < RM.STRIKE.master && RM.STRIKE.master < 99);
  assert.equal(RM.researchCombatOf({ pool: 'nba', n: 'Michael Jordan' }), null);
  assert.equal(RM.researchCombatOf({ pool: 'starwars', n: 'Not A Form', variantBase: 'Yoda' }), null, 'a form never inherits its base record');
  assert.equal(RM.withEnabled(false, () => RM.researchCombatOf(yoda)), null);
});

const FIGHT = (a, b, n = 60) => `JSON.stringify((() => {
  const A = ocTeam('brawl', { d1: ${JSON.stringify(a)} }, 'actionmovies'), B = ocTeam('brawl', { d1: ${JSON.stringify(b)} }, 'actionmovies');
  const one = (X, Y, seed) => DA_BRAWL_COMBAT.resolveBrawlCombat({ rating: 80, rows: X.rows.filter(r => r.pos.id === 'd1') }, { rating: 80, rows: Y.rows.filter(r => r.pos.id === 'd1') }, [80, 80], rngFrom(seed));
  let dmg = 0, wins = 0, first = null;
  for (let i = 0; i < ${n}; i++) { const g = one(A, B, 'rc|' + i); dmg += g.sides[0].damage; if (g.winner === 0) wins++; first = first || g; }
  const f = first.sides[0].fighters[0], t = first.sides[1].fighters[0];
  return { dmg, wins, f: { prof: f.proficiency, shieldKind: f.shieldKind, shieldMax: f.shieldMax, absorbed: f.shieldAbsorbed, mit: f.mit, weakTo: f.weakTo, guard: f.guard, move: f.powerMove },
    t: { weakTo: t.weakTo, shieldKind: t.shieldKind, shieldMax: t.shieldMax } };
})())`;

test('in the fight: proficiency lifts a weak-bodied armed fighter, V1 shields win, research weaknesses reach V1-profiled characters', () => {
  const on = loadApp(), off = loadApp({ search: '?researchPowers=0' });
  // Princess Leia: an ordinary body with a documented blaster. Switch off = Version 1.
  const leiaOn = JSON.parse(on.run(FIGHT(['starwars', 'Leia Organa'], ['actionmovies', 'Deputy Art Galt']))), leiaOff = JSON.parse(off.run(FIGHT(['starwars', 'Leia Organa'], ['actionmovies', 'Deputy Art Galt'])));
  assert.ok(RP.PROFICIENCY_LEVELS.includes(leiaOn.f.prof), 'Leia fights with documented proficiency');
  assert.equal(leiaOff.f.prof, '');
  assert.ok(leiaOn.dmg > leiaOff.dmg, 'the weapon carries the blow: ' + leiaOn.dmg + ' vs ' + leiaOff.dmg);
  assert.ok(leiaOn.dmg < leiaOff.dmg * 1.5, 'a floor under strength, not a new order of power');
  // Darth Vader keeps his individual V1 profile and shield; the research adds his documented weakness.
  const vader = JSON.parse(on.run(FIGHT(['starwars', 'Darth Vader'], ['starwars', 'Luke Skywalker'], 5))), vaderOff = JSON.parse(off.run(FIGHT(['starwars', 'Darth Vader'], ['starwars', 'Luke Skywalker'], 5)));
  assert.equal(vader.f.move, 'Force choke and telekinesis', 'individual V1 profile kept');
  assert.equal(vader.f.shieldMax, 30, 'his individual V1 shield entry (level 1) is used');
  assert.ok(vader.f.weakTo.includes('energy')); assert.deepEqual(vaderOff.f.weakTo, []);
  // Silver Surfer has no V1 shield entry: the barrier named in his research record is used, at the standard strength.
  const surfer = JSON.parse(on.run(FIGHT(['mcu', 'Silver Surfer'], ['dc', 'Black Adam'], 20)));
  assert.equal(surfer.f.shieldKind, 'energy'); assert.equal(surfer.f.shieldMax, 30);
  assert.ok(surfer.f.absorbed <= 30 && surfer.f.mit >= surfer.f.absorbed);
  assert.ok(surfer.t.weakTo.includes('magic'), 'Black Adam: documented weakness to magic');
});

test('the evaluator reads the same extras the fight uses', () => {
  const r = JSON.parse(loadApp().run(`JSON.stringify((() => {
    const P = (pool, n) => DA_OPTION_C.getProfile(getCands(pool).find(c => c.n === n));
    const yoda = P('starwars', 'Yoda'), jean = P('mcu', 'Jean Grey'), batman = P('dc', 'Batman'), vader = P('starwars', 'Darth Vader');
    const off = DA_RESEARCH_MOVES.withEnabled(false, () => P('dc', 'Batman'));
    return { yoda: { s: yoda.shield, p: yoda.proficiency }, jean: jean.shield, batman: batman.proficiency, vaderWeak: vader.weakTo, off: { s: off.shield, p: off.proficiency } };
  })())`));
  assert.equal(r.yoda.s.origin, 'brawl-shield-entry', 'an individual V1 shield entry wins'); assert.equal(r.yoda.s.evidenceStatus, 'reviewed');
  assert.equal(r.yoda.p.level, 'expert'); assert.equal(r.yoda.p.evidenceStatus, 'provisional');
  assert.equal(r.jean.kind, 'telekinetic');
  assert.equal(r.batman.level, 'master'); assert.match(r.batman.technique, /martial arts/i);
  assert.ok(r.vaderWeak.includes('energy'));
  assert.equal(r.off.s, null); assert.equal(r.off.p, null, 'with the switch off the evaluator sees Version 1 only');
});

test('the battle report states proficiency and documented weaknesses', () => {
  const html = loadApp().run(`(() => {
    const A = ocTeam('brawl', { d1: ['starwars', 'Darth Vader'] }, 'starwars'), B = ocTeam('brawl', { d1: ['dc', 'Batman'] }, 'dc');
    const g = playGame('brawl', A, B, 2.5, rngFrom('report'), true);
    return daComparison('brawl', A, B, g.combat.sides[0].kos, g.combat.sides[1].kos, 'A', 'B', 'report', { combat: g.combat });
  })()`);
  assert.match(html, /Documented expert fighting proficiency \(Lightsaber combat \(Form V Djem So\)\)/);
  assert.match(html, /Documented master fighting proficiency \(Master martial arts\)/);
  assert.match(html, /Documented weakness to energy attacks\./);
});

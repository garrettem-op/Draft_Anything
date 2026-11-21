'use strict';
/* Version 2: research powers join Battle Royale fights (owner decision 2026-11-20, option A, on by default).
   docs/option-c/RESEARCH_POWERS.md. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp } = require('./helpers/option-c-app-harness.cjs');
const { runParityFixtures } = require('./helpers/option-c-parity-fixtures.cjs');
const DATA = require('../data/option-c/research-moves-data.js');
const RM = require('../data/option-c/research-moves.js');
const { DOMAIN_MAP, CONVENTIONAL } = require('../data/option-c/research-profile.js');
const { CORE } = require('../data/brawl-attack-profiles.js');
const { VARIANT_ABILITY_PROFILES } = require('../data/variant-abilities.js');
const builder = require('../tools/build-research-moves.cjs');
const pipe = require('../tools/v2-research-pipeline.cjs');
const golden = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/option-c-v1-golden.json'), 'utf8')).digests;

const ROSTER = new Set(pipe.rosterIds());
const POWER_TYPES = new Set(Object.values(DOMAIN_MAP).filter((d) => !CONVENTIONAL.includes(d)));

test('generated moves: real identities, power types only, never a V1-profiled character or NBA', () => {
  assert.ok(DATA.rows.length > 500, 'expected several hundred research moves, got ' + DATA.rows.length);
  const seen = new Set();
  for (const [id, move, domain, guard, weakTo, source, continuity] of DATA.rows) {
    assert.ok(ROSTER.has(id), 'not a roster identity: ' + id);
    assert.ok(!seen.has(id), 'duplicate ' + id); seen.add(id);
    assert.ok(POWER_TYPES.has(domain), id + ': ' + domain + ' is not a non-physical power type');
    assert.ok(typeof move === 'string' && move.length >= 3 && move.length <= 46, id + ': bad move name ' + move);
    assert.ok(!CORE[id] && !VARIANT_ABILITY_PROFILES[id], id + ' already has a V1 combat profile');
    assert.ok(!id.startsWith('nba:'), 'NBA players never get research moves');
    for (const g of [...guard, ...weakTo]) assert.ok(POWER_TYPES.has(g), id + ': unknown guard/weakness ' + g);
    assert.equal(typeof source, 'string'); assert.equal(typeof continuity, 'string');
  }
  // Freshness is reported, not enforced: research merges land between regenerations.
  const built = builder.build();
  const key = (r) => JSON.stringify(r), have = new Set(DATA.rows.map(key));
  const stale = built.rows.filter((r) => !have.has(key(r))).length + DATA.rows.filter((r) => !new Set(built.rows.map(key)).has(key(r))).length;
  if (stale) console.log('# research-moves-data.js differs from current research in ' + stale + ' row(s); run node tools/build-research-moves.cjs');
});

test('move names come from the record: matching technique first, plain label when there is none', () => {
  assert.deepEqual(builder.pickMove({ domains: ['energy'], primaryDomain: 'energy' }, ['Iron Tail', 'Thunderbolt', 'Quick Attack']), { domain: 'energy', name: 'Thunderbolt' });
  // A technique matching a secondary type wins over an unmatched first technique, and the type follows it.
  assert.deepEqual(builder.pickMove({ domains: ['energy', 'magic'], primaryDomain: 'energy' }, ['Counsel', 'Force push and pull']), { domain: 'magic', name: 'Force push and pull' });
  assert.deepEqual(builder.pickMove({ domains: ['magic'], primaryDomain: 'magic' }, []), { domain: 'magic', name: 'Magic power' });
  assert.equal(builder.shortName('Imperius Curse used on Viktor Krum and others during the tournament'), 'Imperius Curse used on Viktor Krum…');
  assert.equal(builder.shortName('hard water objects; such as missiles'), 'Hard water objects');
});

test('researchMoveOf: standard strength, fresh objects, forms by their own record, switch respected', () => {
  const pika = { pool: 'pokemon', n: 'Pikachu', a: [] };
  const m = RM.researchMoveOf(pika);
  assert.equal(m.move, 'Thunderbolt'); assert.equal(m.domain, 'energy');
  assert.equal(m.tier, 2); assert.equal(m.pierce, 0.17); assert.equal(m.cooldown, 3); assert.equal(m.origin, 'research');
  assert.match(m.limit, /standard research strength/);
  m.guard.push('x');
  assert.deepEqual(RM.researchMoveOf(pika).guard, [], 'callers cannot change the shared table');
  assert.deepEqual(Object.keys(pika), ['pool', 'n', 'a'], 'candidate not mutated');
  assert.equal(RM.researchMoveOf({ pool: 'mcu', n: 'Hulk' }), null, 'physical-only research gives no move');
  assert.equal(RM.researchMoveOf({ pool: 'nba', n: 'Michael Jordan' }), null);
  assert.equal(RM.researchMoveOf({ pool: 'pokemon', n: 'Pikachu', variantAbilities: { domains: ['energy'] } }), null, 'a reviewed form keeps its V1 kit');
  const formRow = DATA.rows.find((r) => r[0].includes('|'));
  const [base, form] = formRow[0].split('|'), [pool, baseName] = [base.split(':')[0], base.slice(base.indexOf(':') + 1)];
  assert.equal(RM.researchIdOf({ pool, n: form, variantBase: baseName }), formRow[0]);
  assert.equal(RM.researchMoveOf({ pool, n: form, variantBase: baseName }).move, formRow[1]);
  assert.equal(RM.withEnabled(false, () => RM.researchMoveOf(pika)), null);
  assert.equal(RM.enabled(), true, 'withEnabled restores the switch');
  RM.setEnabled(false); assert.equal(RM.researchMoveOf(pika), null); RM.setEnabled(true);
});

const FIGHT = `JSON.stringify((() => {
  const T = (o, pool) => ocTeam('brawl', o, pool);
  const A = T({ tk1: ['mcu', 'Hulk'], tk2: ['dc', 'Superman'], d1: ['lotr', 'Gandalf'], d2: ['toons', 'Bugs Bunny'], d3: ['starwars', 'Darth Vader'], bn: ['muppets', 'Kermit the Frog'], cmd: ['starwars', 'Yoda'] }, 'mcu');
  const B = T({ tk1: ['dc', 'Doomsday'], tk2: ['mcu', 'Thanos'], d1: ['mcu', 'Scarlet Witch'], d2: ['pokemon', 'Pikachu'], d3: ['dc', 'Darkseid'], bn: ['muppets', 'Gonzo'], cmd: ['harrypotter', 'Albus Dumbledore'] }, 'mcu');
  const g = playGame('brawl', A, B, 2.5, rngFrom('research-moves'), true);
  const f = g.combat.sides.flatMap(s => s.fighters).map(x => ({ name: x.name, move: x.powerMove, uses: x.powerUses, domain: x.powerDomain, limit: x.powerLimit, ward: x.wardHp, apex: x.apexRank }));
  return { winner: g.winner, f, again: playGame('brawl', A, B, 2.5, rngFrom('research-moves'), true).winner };
})())`;

test('in the page: research moves fight beside V1 profiles; V1 kits win; switch off restores V1', () => {
  const on = JSON.parse(loadApp().run(FIGHT)), off = JSON.parse(loadApp({ search: '?researchPowers=0' }).run(FIGHT));
  const by = (r) => Object.fromEntries(r.f.map((x) => [x.name, x]));
  const a = by(on), b = by(off);
  assert.equal(a.Pikachu.move, 'Thunderbolt'); assert.ok(a.Pikachu.uses > 0); assert.match(a.Pikachu.limit, /Research move/);
  assert.equal(a.Gandalf.move, 'Fire magic'); assert.equal(a['Darth Vader'].domain, 'energy');
  assert.equal(a.Darkseid.move, 'Omega Beams', 'V1 profile kept'); assert.equal(a.Superman.move, 'Kryptonian power');
  assert.equal(a.Hulk.move, '', 'physical-only research: plain attacks, as in V1');
  for (const x of on.f) if (/Research move/.test(x.limit)) { assert.equal(x.ward, 0, x.name + ' gets no ward'); assert.equal(x.apex, 0, x.name + ' gets no Apex rank'); }
  assert.equal(b.Pikachu.move, ''); assert.equal(b.Pikachu.uses, 0); assert.equal(b.Gandalf.move, '');
  assert.equal(b.Darkseid.move, 'Omega Beams');
  assert.equal(on.winner, on.again, 'seeded fights stay deterministic');
});

test('switch on changes only Battle Royale; every sport stays byte-identical to Version 1', () => {
  const on = runParityFixtures(loadApp(), false);
  for (const id of Object.keys(golden)) {
    if (id.includes('brawl')) continue;
    assert.equal(on.digests[id], golden[id], 'research powers changed a non-fight result: ' + id);
  }
  assert.notEqual(on.digests['championship:brawl'], golden['championship:brawl'], 'research moves reach championship fights');
  assert.equal(on.digests['teamScore:brawl'], golden['teamScore:brawl'], 'team scores are untouched');
});

test('Head-to-Head rooms carry the host setting so both players replay the same fight', () => {
  const app = loadApp({ search: '?researchPowers=0' });
  assert.equal(app.run('DA_RESEARCH_MOVES.enabled()'), false, '?researchPowers=0 turns the switch off');
  const src = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(src, /researchPowers: DA_RESEARCH_MOVES\.enabled\(\)/, 'new rooms record the host setting');
  assert.match(src, /DA_RESEARCH_MOVES\.withEnabled\(d\.rules\.researchPowers !== false/, 'results replay with the room setting');
  const res = JSON.parse(app.run(`JSON.stringify((() => {
    const A = ocTeam('brawl', { d2: ['pokemon', 'Pikachu'], d1: ['lotr', 'Gandalf'] }, 'pokemon'), B = ocTeam('brawl', {}, 'starwars');
    const room = DA_RESEARCH_MOVES.withEnabled(true, () => simH2H('brawl', A, B, 'low', 'ROOM1'));
    DA_RESEARCH_MOVES.setEnabled(true); const local = simH2H('brawl', A, B, 'low', 'ROOM1'); DA_RESEARCH_MOVES.setEnabled(false);
    return { same: JSON.stringify(room) === JSON.stringify(local), restored: DA_RESEARCH_MOVES.enabled() };
  })())`));
  assert.equal(res.same, true); assert.equal(res.restored, false);
});

test('the evaluator reads the same research moves the fight uses', () => {
  const r = JSON.parse(loadApp().run(`JSON.stringify((() => {
    const p = DA_OPTION_C_MODULES.profileAdapter.getProfile(getCands('pokemon').find(c => c.n === 'Pikachu'));
    const A = ocTeam('brawl', { d2: ['pokemon', 'Pikachu'] }, 'pokemon'), B = ocTeam('brawl', {}, 'pokemon');
    const a = DA_OPTION_C.evaluateMatchup({ sportKey: 'brawl', teamA: A, teamB: B, mode: 'shadow' });
    const off = DA_RESEARCH_MOVES.withEnabled(false, () => DA_OPTION_C_MODULES.profileAdapter.getProfile(getCands('pokemon').find(c => c.n === 'Pikachu')));
    return { sig: p.signature, combat: p.evidence.combat, kits: (a.uncertainties.find(u => u.kind === 'unresearched-kits') || {}).text || '', offSig: off.signature };
  })())`));
  assert.equal(r.sig.origin, 'research-move'); assert.equal(r.sig.label, 'Thunderbolt'); assert.equal(r.sig.tier, 2);
  assert.equal(r.combat, 'provisional', 'a research move is never reviewed evidence');
  assert.ok(!/Pikachu/.test(r.kits), 'Pikachu is no longer listed as having no typed profile');
  assert.equal(r.offSig, null, 'with the switch off the evaluator sees Version 1 profiles only');
});

'use strict';
/* Version 2 fight rules of 2026-11-27 (docs/option-c/FIGHT_RULES.md): powers that overcome instead of
   wounding, named counters, strength above the scale and skill for reviewed melee signatures, proficiency
   as defence, worn armour. All follow the research switch: off, the engine is Version 1's (the golden
   fixtures in tests/option-c-shadow.test.cjs prove that byte for byte). */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp } = require('./helpers/option-c-app-harness.cjs');
const DATA = require('../data/option-c/research-moves-data.js');
const RM = require('../data/option-c/research-moves.js');
const RP = require('../data/option-c/research-profile.js');
const builder = require('../tools/build-research-moves.cjs');
const pipe = require('../tools/v2-research-pipeline.cjs');
const OVERLAY = JSON.parse(fs.readFileSync(path.join(__dirname, '../research/option-c/power-tiers.json'), 'utf8'));
const RECORDS = new Map(); for (const { batch } of pipe.loadBatches()) for (const r of batch.characters || []) RECORDS.set(r.id, r);

const DUELS = [
  ['x_wick', 'mcu:Professor X', 'actionmovies:John Wick'], ['x_ultron', 'mcu:Professor X', 'mcu:Ultron'], ['x_galactus', 'mcu:Professor X', 'mcu:Galactus'],
  ['luthien_morgoth', 'lotr:Lúthien Tinúviel', 'lotr:Morgoth (Melkor)'],
  ['harry_dementor', 'harrypotter:Harry Potter', 'harrypotter:Dementor'], ['draco_dementor', 'harrypotter:Draco Malfoy', 'harrypotter:Dementor'],
  ['sam_shelob', 'lotr:Samwise Gamgee', 'lotr:Shelob'], ['pippin_shelob', 'lotr:Peregrin Took', 'lotr:Shelob'],
  ['hulk_thor', 'mcu:Hulk', 'mcu:Thor'], ['cap_hulk', 'mcu:Captain America', 'mcu:Hulk'], ['sonic_shadow', 'games:Sonic the Hedgehog', 'games:Shadow the Hedgehog'],
  ['gimli_legolas', 'lotr:Gimli', 'lotr:Legolas'], ['cass_slade', 'dc:Cassandra Cain', 'dc:Deathstroke'],
];
const run = (on) => JSON.parse(loadApp().run(`JSON.stringify((() => {
  DA_RESEARCH_MOVES.setEnabled(${on});
  const pos = SPORTS.brawl.pos.find(p => p.id === 'd1'), find = (s) => getCands(s.slice(0, s.indexOf(':'))).find(c => c.n === s.slice(s.indexOf(':') + 1));
  const T = c => ({ rating: 80, rows: [{ pos, cand: c, fit: fitIn('brawl', c, pos) }] }), out = {};
  for (const [k, a, b] of ${JSON.stringify(DUELS)}) { let w = 0, fin = 0; const ta = T(find(a)), tb = T(find(b));
    for (let s = 0; s < 300; s++) { const r = DA_BRAWL_COMBAT.resolveBrawlCombat(ta, tb, [80, 80], rngFrom('rules|' + s)); if (r.winner === 0) w++; fin += r.sides[0].fighters[0].finishers || 0; }
    out[k] = w / 300; out[k + '_finishers'] = fin; }
  return out; })())`));

test('the reviewed data: overcome labels, named counters, proficiency and armour all come from the records', () => {
  for (const [id, t] of Object.entries(OVERLAY.tiers)) if (t.overcome) {
    const r = DATA.rows.find((x) => x[0] === id);
    assert.ok(r && r[7] >= 3 && ['psychic', 'control', 'magic'].includes(r[2]) && r[9] === t.overcome, id + ': overcome needs a tier-3+ mind or magic move');
  }
  assert.ok(DATA.rows.filter((r) => r[9]).length >= 6);
  for (const [id, p] of Object.entries(OVERLAY.proficiency)) {
    assert.ok(RECORDS.get(id).offense.techniques.includes(p.technique), id + ': reviewed proficiency cites a technique in the record');
    assert.equal(RM.researchCombatOf({ pool: id.split(':')[0], n: id.split(':')[1] }).proficiency.level, p.level);
  }
  for (const [name, chance, targets, holders] of DATA.counters) {
    assert.ok(chance > 0 && chance <= 0.75, name);
    const term = new RegExp(name.split(' ')[0], 'i');
    for (const t of targets) assert.ok(RECORDS.get(t).weaknesses.some((w) => term.test(w)), t + ' names the ' + name + ' among its weaknesses');
    for (const [id, basis] of holders) assert.ok(term.test(basis) && RECORDS.has(id), id + ' names the ' + name + ' in its own record');
  }
  const holders = (n) => DATA.counters.find((c) => c[0] === n)[3].map((h) => h[0]);
  assert.ok(holders('Patronus Charm').includes('harrypotter:Harry Potter') && !holders('Patronus Charm').includes('harrypotter:Draco Malfoy'));
  assert.ok(holders('Phial of Galadriel').includes('lotr:Samwise Gamgee'));
  assert.deepEqual(builder.build().counters, DATA.counters, 'generated counters are in step with the research');
  assert.equal(RP.armorOf(['Dwarven mail and helm']).grade, 'standard');
  assert.equal(RP.armorOf(['Light elven mail and swift evasive movement']).grade, 'light');
  assert.equal(RP.armorOf(['Mithril shirt (impenetrable to ordinary stabs and cuts)']).grade, 'heavy');
  assert.equal(RP.armorOf(['Vibranium-alloy shield blocking']).grade, 'standard');
  for (const natural of ['Impenetrable thick chitinous armor against ordinary weapons', 'Protego shield charms', 'telepathic shields', 'Extremely dense muscular hide'])
    assert.equal(RP.armorOf([natural]), null, natural + ' is not worn armour');
});

test('in the fight: the four problems the review found', () => {
  const r = run(true);
  assert.ok(r.x_wick > 0.55, 'a tier-4 telepath overcomes a gunman with no mental defence: ' + r.x_wick);
  assert.ok(r.x_ultron < 0.1, 'a machine has no mind to take: ' + r.x_ultron);
  assert.ok(r.x_galactus < 0.15, 'a ranked cosmic entity is not overcome: ' + r.x_galactus);
  assert.ok(r.luthien_morgoth < 0.15, 'an Apex rank resists enchantment: ' + r.luthien_morgoth);
  assert.ok(r.harry_dementor > 0.55 && r.harry_dementor_finishers > 100, 'a Patronus drives off a Dementor: ' + r.harry_dementor);
  assert.ok(r.draco_dementor < 0.25 && r.draco_dementor_finishers === 0, 'no Patronus on record, no counter: ' + r.draco_dementor);
  assert.ok(r.sam_shelob > 0.25 && r.pippin_shelob < 0.05, 'the Phial of Galadriel works for its bearer only: ' + r.sam_shelob + ' / ' + r.pippin_shelob);
  assert.ok(r.hulk_thor > 0.25 && r.hulk_thor < 0.6, 'the Hulk is in the fight with Thor: ' + r.hulk_thor);
  assert.ok(r.cap_hulk < 0.3, 'skill and a shield do not outclass the Hulk: ' + r.cap_hulk);
  assert.ok(r.sonic_shadow > 0.2, 'rivals are closer: ' + r.sonic_shadow);
  assert.ok(r.gimli_legolas > 0.08 && r.cass_slade > 0.08, 'small skilled fighters are no longer shut out: ' + r.gimli_legolas + ' / ' + r.cass_slade);
});

test('the rules follow the research switch: off, none of them acts', () => {
  const off = run(false);
  for (const [k] of DUELS) assert.equal(off[k + '_finishers'], 0, k + ': no finisher with the switch off');
  assert.ok(off.x_wick < 0.1 && off.harry_dementor < 0.2, 'switched off, the old results return: ' + off.x_wick + ' / ' + off.harry_dementor);
});

test('form on the day: near-equals split their fights, mismatches stay mismatches, inputs untouched', () => {
  const r = JSON.parse(loadApp().run(`JSON.stringify((() => {
    const pos = SPORTS.brawl.pos.find(p => p.id === 'd1'), find = (s) => getCands(s.slice(0, s.indexOf(':'))).find(c => c.n === s.slice(s.indexOf(':') + 1));
    const T = c => ({ rating: 80, rows: [{ pos, cand: c, fit: fitIn('brawl', c, pos) }] });
    const duel = (a, b) => { const ta = T(find(a)), tb = T(find(b)), before = JSON.stringify([ta, tb]); let w = 0, spread = 0, forms = new Set();
      for (let s = 0; s < 300; s++) { const x = DA_BRAWL_COMBAT.resolveBrawlCombat(ta, tb, [80, 80], rngFrom('form|' + s)); if (x.winner === 0) w++; const f = x.sides[0].fighters[0]; spread = f.formSpread; forms.add(f.form); }
      return { win: w / 300, spread, forms: forms.size, untouched: JSON.stringify([ta, tb]) === before }; };
    const out = { gimli: duel('lotr:Gimli', 'lotr:Legolas'), owl: duel('harrypotter:Hedwig', 'harrypotter:Harry Potter'), kal: duel('dc:Batman', 'dc:Superman'), queen: duel('lotr:Tar-Míriel', 'lotr:Aragorn') };
    const one = (seed) => JSON.stringify(DA_BRAWL_COMBAT.resolveBrawlCombat(T(find('lotr:Gimli')), T(find('lotr:Legolas')), [80, 80], rngFrom(seed)));
    out.repeatable = one('same') === one('same');
    DA_RESEARCH_MOVES.setEnabled(false);
    const off = DA_BRAWL_COMBAT.resolveBrawlCombat(T(find('lotr:Gimli')), T(find('lotr:Legolas')), [80, 80], rngFrom('off')).sides[0].fighters[0];
    out.offHasForm = 'form' in off;
    return out; })())`));
  assert.ok(r.gimli.spread > 0.1 && r.gimli.forms > 100, 'a close fight gets a real swing: ' + r.gimli.spread);
  assert.ok(r.gimli.win > 0.18, 'Gimli takes a real share against Legolas: ' + r.gimli.win);
  assert.equal(r.owl.spread, 0, 'an owl against a wizard is a mismatch with no swing');
  assert.ok(r.owl.win < 0.02 && r.queen.win < 0.03 && r.kal.win < 0.06, 'mismatches stay mismatches: ' + [r.owl.win, r.queen.win, r.kal.win]);
  for (const k of ['gimli', 'owl', 'kal', 'queen']) assert.ok(r[k].untouched, k + ': the probe fights do not change the teams');
  assert.ok(r.repeatable, 'the same seed gives the same fight');
  assert.equal(r.offHasForm, false, 'no form with the switch off');
});

test('the evaluator reads the same fight rules the engine applies', () => {
  const r = JSON.parse(loadApp().run(`JSON.stringify((() => {
    const find = (s) => getCands(s.slice(0, s.indexOf(':'))).find(c => c.n === s.slice(s.indexOf(':') + 1));
    const ev = (a, b) => { const e = DA_OPTION_C.evaluateMatchup({ sportKey: 'brawl', teamA: teamScore('brawl', { d1: find(a) }), teamB: teamScore('brawl', { d1: find(b) }), mode: 'shadow' });
      const ab = e.interactions.find(x => x.attackerTeam === 'A'), ba = e.interactions.find(x => x.attackerTeam === 'B');
      return { p: e.sides[0].probability, rules: ab.rules, back: ba.rules, via: ab.via }; };
    const out = { wick: ev('mcu:Professor X', 'actionmovies:John Wick'), ultron: ev('mcu:Professor X', 'mcu:Ultron'), harry: ev('harrypotter:Harry Potter', 'harrypotter:Dementor'),
      draco: ev('harrypotter:Draco Malfoy', 'harrypotter:Dementor'), galactus: ev('mcu:Galactus', 'mcu:Thor'), gimli: ev('lotr:Legolas', 'lotr:Gimli') };
    DA_RESEARCH_MOVES.setEnabled(false);
    out.off = ev('harrypotter:Harry Potter', 'harrypotter:Dementor');
    return out; })())`));
  assert.ok(r.wick.rules.includes('overcome-power') && r.wick.p >= 0.75, 'a telepath overcomes an undefended mind: ' + r.wick.p);
  assert.ok(r.ultron.rules.includes('overcome-no-mind') && r.ultron.p < r.wick.p - 0.3, 'a machine has no mind to take: ' + r.ultron.p);
  assert.ok(r.harry.rules.includes('named-counter') && r.harry.via === 'Patronus Charm' && r.harry.p >= 0.75, 'the Patronus is read as a counter: ' + r.harry.p);
  assert.ok(!r.draco.rules.includes('named-counter') && r.draco.p < 0.5, 'no Patronus on record, no counter: ' + r.draco.p);
  assert.ok(r.galactus.rules.includes('intrinsic-pressure') && r.galactus.back.includes('intrinsic-shell'), 'an intrinsic rank is read like the engine reads it');
  assert.ok(r.gimli.rules.includes('worn-armour') && r.gimli.rules.includes('skilled-defender'), 'armour and skill are reported');
  assert.ok(!r.off.rules.includes('named-counter'), 'with the switch off the evaluator reports none of it');
  const IE = require('../data/option-c/interaction-engine.js');
  for (const id of ['overcome-power', 'overcome-resisted', 'overcome-resisted-by-rank', 'overcome-no-mind', 'named-counter', 'intrinsic-shell', 'intrinsic-pressure', 'worn-armour', 'skilled-defender'])
    assert.ok(IE.RULES[id] && IE.RULES[id].text.length > 30, id + ' is explained');
});

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
  assert.ok(r.cap_hulk < 0.2, 'skill and a shield do not outclass the Hulk: ' + r.cap_hulk);
  assert.ok(r.sonic_shadow > 0.2, 'rivals are closer: ' + r.sonic_shadow);
  assert.ok(r.gimli_legolas > 0.08 && r.cass_slade > 0.08, 'small skilled fighters are no longer shut out: ' + r.gimli_legolas + ' / ' + r.cass_slade);
});

test('the rules follow the research switch: off, none of them acts', () => {
  const off = run(false);
  for (const [k] of DUELS) assert.equal(off[k + '_finishers'], 0, k + ': no finisher with the switch off');
  assert.ok(off.x_wick < 0.1 && off.harry_dementor < 0.2, 'switched off, the old results return: ' + off.x_wick + ' / ' + off.harry_dementor);
});

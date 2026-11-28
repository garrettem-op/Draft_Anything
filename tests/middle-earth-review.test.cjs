'use strict';
/* Version 2: Middle-earth stored attributes follow the characters, not the archetype templates
   (docs/middle-earth-attribute-review.md), and its research moves carry reviewed power tiers
   (docs/option-c/POWER_TIERS.md). */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { loadApp } = require('./helpers/option-c-app-harness.cjs');
const RM = require('../data/option-c/research-moves.js');
const root = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const KEYS = ['spd', 'agi', 'str', 'siz', 'lep', 'end', 'tch', 'acc', 'ref', 'iq', 'clu', 'ldr'];
const at = (a, k) => a[KEYS.indexOf(k)];

test('every reviewed Middle-earth character matches the review table, with a reason and a source', () => {
  const cx = vm.createContext({ window: {} });
  vm.runInContext(read('data/new-pool-core.js'), cx);
  vm.runInContext(read('data/pools-middle-earth.js'), cx);
  const entries = cx.window.DA_ADDED_POOLS.lotr.entries;
  assert.equal(entries.length, 115);
  const a = (n) => { const e = entries.find((x) => x[0] === n); assert.ok(e, 'no Middle-earth character ' + n); return e[3]; };
  const rows = [...read('docs/middle-earth-attribute-review.md').matchAll(/^\| ([^|]+) \| `([^`]+)` \| ([^|]+) \| (https:\/\/\S+) \|$/gm)];
  assert.ok(rows.length >= 20, 'expected the full review table, got ' + rows.length);
  for (const [, name, changes, why] of rows) {
    const attrs = a(name.trim());
    assert.ok(why.trim().length >= 30, name + ' needs a reason');
    for (const pair of changes.split(',')) { const [k, v] = pair.split('='); assert.ok(KEYS.includes(k), name + ' ' + k); assert.equal(at(attrs, k), Number(v), name + ' ' + k); }
  }
  assert.ok(at(a('Gandalf'), 'siz') <= 70, 'Gandalf has an old man\'s frame');
  assert.ok(at(a('Tar-Míriel'), 'str') < 60 && at(a('Tar-Míriel'), 'tch') < at(a('Aragorn'), 'tch'), 'a queen with no feat of arms is not Aragorn');
  assert.ok(at(a('Gimli'), 'end') >= 95, 'Gimli ran across Rohan');
  assert.deepEqual([...a('Morgoth (Melkor)')].slice(0, 6), [99, 99, 99, 99, 99, 99], 'the Valar and Morgoth are left to the owner\'s cosmic rulings');
});

test('reviewed tiers: dragons, Balrogs and the great duelists; ordinary weapon skill is not a power', () => {
  const m = (n) => RM.researchMoveOf({ pool: 'lotr', n });
  assert.equal(m('Smaug').tier, 3);
  assert.deepEqual([m('Ancalagon the Black').tier, m('Ancalagon the Black').domain], [4, 'elemental']);
  assert.deepEqual([m('Durin\'s Bane').tier, m('Durin\'s Bane').domain], [3, 'elemental']);
  assert.deepEqual([m('Fingolfin').tier, m('Fingolfin').domain], [3, 'melee']);
  assert.deepEqual([m('Lúthien Tinúviel').tier, m('Lúthien Tinúviel').domain], [4, 'magic']);
  assert.doesNotMatch(m('Fëanor').move, /Ringil/, 'Ringil is Fingolfin\'s sword; the record was corrected');
  for (const n of ['Celeborn', 'Tar-Míriel', 'Gríma Wormtongue', 'Vairë', 'Frodo Baggins']) assert.equal(m(n), null, n + ' has no research move');
});

test('in the fight: Middle-earth results follow the characters', () => {
  const r = JSON.parse(loadApp().run(`JSON.stringify((() => {
    const pos = SPORTS.brawl.pos.find(p => p.id === 'd1'), find = (n) => getCands('lotr').find(c => c.n === n);
    const T = c => ({ rating: 80, rows: [{ pos, cand: c, fit: fitIn('brawl', c, pos) }] });
    const duel = (a, b) => { let w = 0; const ta = T(find(a)), tb = T(find(b)); for (let s = 0; s < 300; s++) if (DA_BRAWL_COMBAT.resolveBrawlCombat(ta, tb, [80, 80], rngFrom('me|' + s)).winner === 0) w++; return w / 300; };
    return { queen: duel('Aragorn', 'Tar-Míriel'), balrog: duel('Gandalf', 'Durin\\'s Bane'), dragons: duel('Ancalagon the Black', 'Smaug'), arwen: duel('Arwen Undómiel', 'Aragorn') };
  })())`));
  assert.ok(r.queen > 0.9, 'Aragorn beats a queen with no feat of arms: ' + r.queen);
  assert.ok(r.balrog > 0.3 && r.balrog < 0.7, 'Gandalf and the Balrog are a near-even fight: ' + r.balrog);
  assert.ok(r.dragons > 0.6, 'Ancalagon outclasses Smaug: ' + r.dragons);
  assert.ok(r.arwen < 0.7, 'Arwen does not beat Aragorn nine times in ten: ' + r.arwen);
});

'use strict';
/* Version 2: Harry Potter stored attributes follow the characters, not the archetype templates
   (docs/harry-potter-attribute-review.md), and its research moves carry reviewed power tiers
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

test('every reviewed Harry Potter character matches the review table, with a reason and a source', () => {
  const cx = vm.createContext({ window: {} });
  vm.runInContext(read('data/new-pool-core.js'), cx);
  vm.runInContext(read('data/pools-harry-potter.js'), cx);
  const entries = cx.window.DA_ADDED_POOLS.harrypotter.entries;
  assert.equal(entries.length, 106);
  const a = (n) => { const e = entries.find((x) => x[0] === n); assert.ok(e, 'no Harry Potter character ' + n); return e[3]; };
  const rows = [...read('docs/harry-potter-attribute-review.md').matchAll(/^\| ([^|]+) \| `([^`]+)` \| ([^|]+) \| (https:\/\/\S+) \|$/gm)];
  assert.ok(rows.length >= 24, 'expected the full review table, got ' + rows.length);
  for (const [, name, changes, why] of rows) {
    const attrs = a(name.trim());
    assert.ok(why.trim().length >= 30, name + ' needs a reason');
    for (const pair of changes.split(',')) { const [k, v] = pair.split('='); assert.ok(KEYS.includes(k), name + ' ' + k); assert.equal(at(attrs, k), Number(v), name + ' ' + k); }
  }
  for (const pet of ['Hedwig', 'Crookshanks', 'Niffler', 'Bowtruckle (Pickett)']) assert.ok(at(a(pet), 'str') <= 15, pet + ' is a small animal');
  assert.ok(at(a('Filius Flitwick'), 'siz') <= 25 && at(a('Filius Flitwick'), 'acc') >= 95, 'Flitwick is tiny but still a duelling champion');
  assert.deepEqual([at(a('Albus Dumbledore'), 'acc'), at(a('Lord Voldemort'), 'acc')], [98, 98], 'the senior duellists keep their scores');
});

test('reviewed tiers: city-scale powers at tier 3, untrained spellwork at tier 1, no attacks for ghosts and healers', () => {
  const m = (n) => RM.researchMoveOf({ pool: 'harrypotter', n });
  for (const n of ['Gellert Grindelwald', 'Obscurus', 'Credence Barebone', 'Thunderbird (Frank)']) assert.equal(m(n).tier, 3, n);
  assert.deepEqual([m('Basilisk').move, m('Basilisk').domain, m('Basilisk').tier], ['Instant death gaze', 'magic', 3]);
  for (const n of ['Pansy Parkinson', 'Gilderoy Lockhart', 'Narcissa Malfoy', 'Winky']) assert.equal(m(n).tier, 1, n);
  for (const n of ['Minerva McGonagall', 'Severus Snape', 'Bellatrix Lestrange', 'Harry Potter']) assert.equal(m(n).tier, 2, n + ' stays at the standard: Dumbledore and Voldemort are the tier-3 profiles');
  assert.deepEqual([m('Rubeus Hagrid').domain, m('Rubeus Hagrid').tier], ['melee', 2]);
  for (const n of ['Nearly Headless Nick', 'Madam Poppy Pomfrey', 'Cornelius Fudge', 'Helga Hufflepuff', 'Peeves']) assert.equal(m(n), null, n + ' has no research move');
});

test('in the fight: pets, ghosts and frauds no longer beat trained wizards', () => {
  const r = JSON.parse(loadApp().run(`JSON.stringify((() => {
    const pos = SPORTS.brawl.pos.find(p => p.id === 'd1'), find = (n) => getCands('harrypotter').find(c => c.n === n);
    const T = c => ({ rating: 80, rows: [{ pos, cand: c, fit: fitIn('brawl', c, pos) }] });
    const duel = (a, b) => { let w = 0; const ta = T(find(a)), tb = T(find(b)); for (let s = 0; s < 300; s++) if (DA_BRAWL_COMBAT.resolveBrawlCombat(ta, tb, [80, 80], rngFrom('hp|' + s)).winner === 0) w++; return w / 300; };
    return { owl: duel('Hedwig', 'Harry Potter'), ghost: duel('Nearly Headless Nick', 'Harry Potter'), fraud: duel('Gilderoy Lockhart', 'Harry Potter'),
      wandmaker: duel('Ollivander', 'Bellatrix Lestrange'), draco: duel('Harry Potter', 'Draco Malfoy'), top: duel('Albus Dumbledore', 'Gellert Grindelwald') };
  })())`));
  assert.ok(r.owl < 0.05, 'an owl does not beat Harry Potter: ' + r.owl);
  assert.ok(r.ghost < 0.1, 'a ghost cannot hurt the living: ' + r.ghost);
  assert.ok(r.fraud < 0.1, 'Lockhart does not out-duel Harry: ' + r.fraud);
  assert.ok(r.wandmaker < 0.1, 'Ollivander does not out-duel Bellatrix: ' + r.wandmaker);
  assert.ok(r.draco > 0.52, 'Harry beats Draco more often than not (form on the day narrows it): ' + r.draco);
  assert.ok(r.top > 0.4 && r.top < 0.75, 'Dumbledore and Grindelwald are near peers: ' + r.top);
});

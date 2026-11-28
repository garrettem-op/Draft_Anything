'use strict';
/* Version 2: DC stored attributes follow the characters, not the archetype templates
   (docs/dc-attribute-review.md; owner direction 2026-11-27: V2 covers the per-character attribute review). */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { loadApp } = require('./helpers/option-c-app-harness.cjs');
const root = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const KEYS = ['spd', 'agi', 'str', 'siz', 'lep', 'end', 'tch', 'acc', 'ref', 'iq', 'clu', 'ldr'];
const at = (a, k) => a[KEYS.indexOf(k)];

test('every reviewed DC character matches the review table, with a reason and a source', () => {
  const cx = vm.createContext({ window: {} });
  vm.runInContext(read('data/new-pool-core.js'), cx);
  vm.runInContext(read('data/pools-dc.js'), cx);
  const entries = cx.window.DA_ADDED_POOLS.dc.entries;
  assert.equal(entries.length, 104);
  const a = (n) => { const e = entries.find((x) => x[0] === n); assert.ok(e, 'no DC character ' + n); return e[3]; };
  const rows = [...read('docs/dc-attribute-review.md').matchAll(/^\| ([^|]+) \| `([^`]+)` \| ([^|]+) \| (https:\/\/\S+) \|$/gm)];
  assert.ok(rows.length >= 75, 'expected the full review table, got ' + rows.length);
  for (const [, name, changes, why] of rows) {
    const attrs = a(name.trim());
    assert.ok(why.trim().length >= 30, name + ' needs a reason');
    for (const pair of changes.split(',')) { const [k, v] = pair.split('='); assert.ok(KEYS.includes(k), name + ' ' + k); assert.equal(at(attrs, k), Number(v), name + ' ' + k); }
  }
  // The template errors that started the review.
  assert.ok(at(a('Batman'), 'str') >= 80 && at(a('Batman'), 'agi') >= 90, 'Batman is at the peak of human conditioning');
  assert.ok(at(a('Wonder Woman'), 'siz') < at(a('Bane'), 'siz'), 'Wonder Woman is not larger than Bane');
  assert.ok(at(a('Poison Ivy'), 'str') < 65 && at(a('Black Canary'), 'str') < 75, 'no super-strength where the character has none');
  assert.ok(at(a('Amanda Waller'), 'tch') <= 55, 'a bureaucrat is not a trained fighter');
  assert.equal(at(a('Trigon'), 'siz'), 97, 'cosmic entities are left to the owner\'s cosmic rulings');
});

test('in the fight: Batman is no longer an ordinary body', () => {
  const r = JSON.parse(loadApp().run(`JSON.stringify((() => {
    const pos = SPORTS.brawl.pos.find(p => p.id === 'd1'), find = (pool, n) => getCands(pool).find(c => c.n === n);
    const T = c => ({ rating: 80, rows: [{ pos, cand: c, fit: fitIn('brawl', c, pos) }] });
    const duel = (pa, a, pb, b) => { let w = 0; const ta = T(find(pa, a)), tb = T(find(pb, b)); for (let s = 0; s < 300; s++) if (DA_BRAWL_COMBAT.resolveBrawlCombat(ta, tb, [80, 80], rngFrom('dc|' + s)).winner === 0) w++; return w / 300; };
    return { wick: duel('dc', 'Batman', 'actionmovies', 'John Wick'), bane: duel('dc', 'Bane', 'dc', 'Batman'), ivy: duel('dc', 'Poison Ivy', 'dc', 'Aquaman') };
  })())`));
  assert.ok(r.wick > 0.35, 'Batman is competitive with John Wick: ' + r.wick);
  assert.ok(r.bane < 0.98, 'Bane does not beat Batman every time: ' + r.bane);
  assert.ok(r.ivy < 0.4, 'Poison Ivy does not out-muscle Aquaman: ' + r.ivy);
});

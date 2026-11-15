/* Run with: node --test tests/archetype-groups.test.cjs
 * Archetype chemistry groups for the MCU pool: data integrity, wiring into the real page code, and what they change. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp } = require('./helpers/option-c-app-harness.cjs');
const A = require('../data/archetype-groups.js');

const ROOT = path.join(__dirname, '..');
const mua = fs.readFileSync(path.join(ROOT, 'docs/option-c/MUA3_TEAM_BONUS_RESEARCH.md'), 'utf8');
const withG = loadApp();
const without = loadApp({ skip: s => s.includes('archetype-groups') });
const J = (app, code) => JSON.parse(app.run('JSON.stringify(' + code + ')'));

test('every group has sourced-style membership: real MCU roster names, a basis for each, no duplicates', () => {
  const roster = new Set(J(withG, "getCands('mcu').map(c => c.n)"));
  assert.ok(A.groups.length >= 5);
  const slugs = new Set();
  for (const g of A.groups) {
    assert.equal(g.pool, 'mcu');
    assert.ok(!slugs.has(g.slug), 'duplicate slug ' + g.slug); slugs.add(g.slug);
    assert.equal(g.strength, 0.5, g.name + ' should match the other trait groups');
    assert.ok(g.members.length >= 3 && g.members.length <= 10, g.name + ' size');
    assert.equal(new Set(g.members.map(m => m.name)).size, g.members.length, g.name + ' has a duplicate member');
    for (const m of g.members) {
      assert.ok(roster.has(m.name), m.name + ' is not in the MCU pool');
      assert.ok(typeof m.basis === 'string' && m.basis.length > 15, m.name + ' needs an on-screen basis');
      assert.equal(typeof m.mua3, 'boolean');
    }
    assert.ok(mua.includes(g.mua3Affiliation), g.mua3Affiliation + ' is not an affiliation named in the MUA3 research note');
  }
});

test('the page registers the groups and leaves every existing group exactly as it was', () => {
  const before = J(without, "Object.fromEntries(Object.entries(SYN_DEF).map(([k, v]) => [k, v.map(r => r.slice(0, 3).concat([r[3].length]))]))");
  const after = J(withG, "Object.fromEntries(Object.entries(SYN_DEF).map(([k, v]) => [k, v.map(r => r.slice(0, 3).concat([r[3].length]))]))");
  for (const pk of Object.keys(before)) {
    if (pk === 'mcu') assert.deepEqual(after.mcu.slice(0, before.mcu.length), before.mcu, 'existing MCU groups changed');
    else assert.deepEqual(after[pk], before[pk], pk + ' groups changed');
  }
  assert.equal(after.mcu.length, before.mcu.length + A.groups.length);
  for (const g of A.groups) {
    assert.ok(!before.mcu.some(r => r[0] === g.slug), 'slug ' + g.slug + ' already used');
    assert.deepEqual(J(withG, 'GROUPS["mcu:' + g.slug + '"]'), { name: g.name, strength: g.strength });
    for (const m of g.members) assert.ok(J(withG, 'SYN_MEMBERS.mcu[' + JSON.stringify(m.name) + ']').includes('mcu:' + g.slug));
  }
});

test('two members of one archetype add exactly strength x tier, and nothing changes outside the MCU pool', () => {
  // Fill with NBA names so only the two chosen MCU characters can share groups.
  const code = app => app.run(`(function(){
    const sk = 'hockey', pos = SPORTS[sk].pos, spec = ${JSON.stringify(['Daredevil', 'Iron Fist'])};
    const nba = getCands('nba').filter(c => !c.coach).slice();
    const r = {}; let k = 0;
    pos.forEach((p, i) => { r[p.id] = i < 2 ? getCands('mcu').find(c => c.n === spec[i]) : nba[k++]; });
    const s = synergyOf(sk, r);
    return JSON.stringify({ total: s.total, links: s.links.map(l => [l.id, +l.pts.toFixed(4)]) });
  })()`);
  const a = JSON.parse(code(withG)), b = JSON.parse(code(without));
  const tier2 = 0.45;
  const expected = A.groups.filter(g => ['Daredevil', 'Iron Fist'].every(n => g.members.some(m => m.name === n))).reduce((s, g) => s + g.strength * tier2, 0);
  assert.ok(expected > 0);
  assert.ok(Math.abs((a.total - b.total) - expected) < 1e-9, 'delta ' + (a.total - b.total) + ' expected ' + expected);
  assert.ok(a.total <= 2.8 + 1.4, 'stays within cap plus coach style');
  const nbaRoster = app => JSON.parse(app.run(`(function(){ const sk='basketball'; const r={}; const c=getCands('nba').filter(x=>!x.coach); SPORTS[sk].pos.forEach((p,i)=>r[p.id]=c[i]); return JSON.stringify(synergyOf(sk,r).total); })()`));
  assert.equal(nbaRoster(withG), nbaRoster(without));
});

test('the combined chemistry cap still holds for an all-archetype roster', () => {
  const total = app => JSON.parse(app.run(`(function(){
    const sk = 'hockey', names = ['Daredevil','Iron Fist','Black Widow','Gamora','Wolverine','Deadpool','Elektra','Black Panther'];
    const r = {}; SPORTS[sk].pos.forEach((p, i) => r[p.id] = getCands('mcu').find(c => c.n === names[i]));
    const s = synergyOf(sk, r); return JSON.stringify({ links: s.links.reduce((x, l) => x + l.pts, 0), total: Math.min(LINK_CAP, s.links.reduce((x, l) => x + l.pts, 0)), reported: s.total - (s.style ? s.style.pts : 0) });
  })()`));
  const t = total(withG);
  assert.ok(t.links > 2.8, 'this roster should exceed the cap before capping');
  assert.equal(t.reported, 2.8);
});

test('scoring stays deterministic and does not consume or reorder anything', () => {
  const score = app => app.run(`(function(){
    const sk = 'volleyball', pool = getCands('mcu'); const r = {}; SPORTS[sk].pos.forEach((p, i) => r[p.id] = pool[i * 7 % pool.length]);
    const a = JSON.stringify(teamScore(sk, r).rating), b = JSON.stringify(teamScore(sk, r).rating); return a === b ? a : 'differs';
  })()`);
  assert.notEqual(score(withG), 'differs');
});

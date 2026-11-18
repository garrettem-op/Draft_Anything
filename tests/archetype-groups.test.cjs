/* Run with: node --test tests/archetype-groups.test.cjs
 * Shared archetype chemistry groups across every pool: data integrity, sourcing, wiring into the real page code,
 * cross-universe links in Mashup, and what they change. */
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

// What a research record must say for each archetype (same vocabulary used to mine the records).
const TRAIT = {
  martial: /martial[- ]art|kung[- ]fu|karate|judo|jujutsu|jiu[- ]jitsu|ninjutsu|hand[- ]to[- ]hand|boxing|\bcqc\b|teräs käsi/i,
  agile: /acrobat|parkour|free[- ]?running|gymnast|wall[- ]run|agility|agile/i,
  blades: /sword|blade|katana|saber|sabre|lightsaber|dagger|knife|knives|claws?\b|\bsai\b|\baxe\b|scythe|ninjato|rapier|leek/i,
  antiheroes: /anti[- ]?hero|vigilante|mercenary|bounty hunter/i,
  quips: /quip|wisecrack|sarcas|snark|\bwit\b|trash[- ]talk|prank|joke|heckl|comic/i,
};

const recordCache = {};
function findRecord(file, id) {
  if (!recordCache[file]) recordCache[file] = JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
  const j = recordCache[file];
  return (j.characters || j.records || []).find(c => c.id === id) || null;
}
function recordText(r) {
  return [r.summary, ...(r.offense?.techniques || []), ...(r.defense?.mechanisms || []), ...(r.mobility || []),
    ...(r.feats || []).map(f => f.claim), ...(r.sources || []).map(s => s.supports)].filter(Boolean).join(' \n ');
}
const originOf = s => (s.record && !s.url) ? 'repo-research' : new URL(s.url).hostname.replace(/^www\./, '').toLowerCase();

test('every member is a real roster entry, groups stay selective, strength matches the film groups', () => {
  const rosters = {};
  const rosterOf = pool => (rosters[pool] = rosters[pool] || new Set(J(withG, 'getCands(' + JSON.stringify(pool) + ').map(c => c.n)')));
  assert.equal(A.STRENGTH, 1);
  const slugs = new Set();
  for (const g of A.groups) {
    assert.ok(!slugs.has(g.slug), 'duplicate slug ' + g.slug); slugs.add(g.slug);
    assert.ok(TRAIT[g.slug], g.slug + ' needs a trait vocabulary in this test');
    assert.equal(g.strength, 1, g.name + ' sits on the same footing as the film chemistry groups (owner ruling 2026-11-18)');
    assert.ok(mua.includes(g.mua3Affiliation), g.mua3Affiliation + ' is not an affiliation named in the MUA3 research note');
    const perPool = {}, seen = new Set();
    for (const m of g.members) {
      const key = m.pool + '|' + m.name;
      assert.ok(!seen.has(key), g.name + ' lists ' + key + ' twice'); seen.add(key);
      assert.ok(rosterOf(m.pool).has(m.name), m.name + ' is not in the ' + m.pool + ' pool');
      assert.ok(typeof m.basis === 'string' && m.basis.length > 5, key + ' needs a basis');
      if (m.pool === 'mcu') assert.equal(typeof m.mua3, 'boolean', key + ' MCU members record the MUA3 listing');
      perPool[m.pool] = (perPool[m.pool] || 0) + 1;
    }
    for (const [pool, n] of Object.entries(perPool)) assert.ok(n <= 10, g.name + ' has ' + n + ' members in ' + pool + '; keep groups selective');
  }
  // Every built-in pool with candidates is covered by at least one archetype.
  const pools = new Set(A.groups.flatMap(g => g.members.map(m => m.pool)));
  for (const p of ['nba', 'mcu', 'toons', 'muppets', 'games', 'pokemon', 'starwars', 'dc', 'lotr', 'harrypotter', 'actionmovies']) assert.ok(pools.has(p), p + ' has no archetype members');
});

test('every member is sourced, and every research-record reference actually states the trait', () => {
  const LABELS = new Set(['corroborated', 'credible', 'needs-review']);
  let needsReview = 0;
  for (const g of A.groups) {
    for (const m of g.members) {
      const who = m.pool + ':' + m.name + ' in ' + g.name;
      assert.ok(LABELS.has(m.evidence), who + ' needs an evidence label');
      assert.ok(Array.isArray(m.sources) && m.sources.length >= 1, who + ' needs at least one source');
      for (const s of m.sources) {
        if (s.url) assert.ok(/^https:\/\/[^\s]+$/.test(s.url), who + ' source needs an https URL');
        if (s.record) {
          assert.ok(fs.existsSync(path.join(ROOT, s.record)), who + ' cites a missing record file ' + s.record);
          const r = findRecord(s.record, s.id);
          assert.ok(r, who + ' cites record id ' + s.id + ' not found in ' + s.record);
          assert.ok(TRAIT[g.slug].test(recordText(r)), who + ': record ' + s.id + ' does not state the ' + g.slug + ' trait');
          if (s.url) assert.ok((r.sources || []).some(x => x.url === s.url), who + ': ' + s.url + ' is not a source of record ' + s.id);
        } else {
          assert.ok(typeof s.title === 'string' && s.title.length > 5 && s.url, who + ' web source needs a title and url');
        }
      }
      assert.equal(new Set(m.sources.map(s => s.url || s.record + '#' + s.id)).size, m.sources.length, who + ' repeats a source');
      if (m.evidence === 'corroborated') assert.ok(new Set(m.sources.map(originOf)).size >= 2, who + ' is corroborated but not by a second origin');
      if (m.evidence === 'needs-review') needsReview++;
    }
  }
  assert.ok(needsReview <= 2, needsReview + ' members flagged needs-review');
});

test('the page registers one shared id per archetype, tags exactly the members, and leaves every other group alone', () => {
  const def = app => J(app, "Object.fromEntries(Object.entries(SYN_DEF).map(([k, v]) => [k, v.map(r => r.slice(0, 3).concat([r[3].length]))]))");
  assert.deepEqual(def(withG), def(without), 'franchise and trait groups must be unchanged');
  for (const g of A.groups) assert.deepEqual(J(withG, 'GROUPS["arch:' + g.slug + '"]'), { name: g.name, strength: g.strength });
  const pools = [...new Set(A.groups.flatMap(g => g.members.map(m => m.pool)))];
  for (const pool of pools) {
    const tagged = J(withG, 'getCands(' + JSON.stringify(pool) + ').map(c => [c.n, c.g.filter(id => id.startsWith("arch:"))])');
    const expected = {};
    for (const g of A.groups) for (const m of g.members) if (m.pool === pool) (expected[m.name] = expected[m.name] || []).push('arch:' + g.slug);
    for (const [n, ids] of tagged) assert.deepEqual(ids.sort(), (expected[n] || []).sort(), pool + ':' + n + ' archetype tags');
    // Removing archetypes must leave each candidate's non-archetype groups untouched.
    const before = J(without, 'getCands(' + JSON.stringify(pool) + ').map(c => c.g)');
    const after = J(withG, 'getCands(' + JSON.stringify(pool) + ').map(c => c.g.filter(id => !id.startsWith("arch:")))');
    assert.deepEqual(after, before, pool + ' other groups changed');
  }
});

// A filler that cannot form any archetype link of its own. The names are fixed from the archetype build so both
// builds score exactly the same players.
const FILL_NAMES = J(withG, "getCands('nba').filter(c => !c.coach && !c.g.some(id => id.startsWith('arch:'))).map(c => c.n)");
const FILL = `${JSON.stringify(FILL_NAMES)}.map(n => getCands('nba').find(c => c.n === n))`;

test('two members of one archetype add exactly strength x tier inside a pool', () => {
  const run = (app, sk, poolA, nA, poolB, nB) => JSON.parse(app.run(`(function(){
    const sk = ${JSON.stringify(sk)}, pos = SPORTS[sk].pos, fill = ${FILL};
    const pick = (p, n) => getCands(p).find(c => c.n === n);
    const r = {}; let k = 0;
    pos.forEach((p, i) => { r[p.id] = i === 0 ? pick(${JSON.stringify(poolA)}, ${JSON.stringify(nA)}) : i === 1 ? pick(${JSON.stringify(poolB)}, ${JSON.stringify(nB)}) : fill[k++]; });
    return JSON.stringify(synergyOf(sk, r).total);
  })()`));
  // Daredevil and Iron Fist share Martial Artists and Agile Fighters.
  let d = run(withG, 'hockey', 'mcu', 'Daredevil', 'mcu', 'Iron Fist') - run(without, 'hockey', 'mcu', 'Daredevil', 'mcu', 'Iron Fist');
  assert.ok(Math.abs(d - 2 * A.STRENGTH * 0.45) < 1e-9, 'MCU delta ' + d);
  // Po and Tigress (Toons) share Martial Artists only.
  d = run(withG, 'hockey', 'toons', 'Po', 'toons', 'Tigress') - run(without, 'hockey', 'toons', 'Po', 'toons', 'Tigress');
  assert.ok(Math.abs(d - A.STRENGTH * 0.45) < 1e-9, 'Toons delta ' + d);
});

test('Mashup links archetype members across universes, and only through archetypes', () => {
  const run = app => JSON.parse(app.run(`(function(){
    const sk = 'hockey', pos = SPORTS[sk].pos, fill = ${FILL}, mash = getCands('mashup');
    const batman = mash.find(c => c.pool === 'dc' && c.n === 'Batman'), po = mash.find(c => c.pool === 'toons' && c.n === 'Po');
    const r = {}; let k = 0;
    pos.forEach((p, i) => { r[p.id] = i === 0 ? batman : i === 1 ? po : fill[k++]; });
    const s = synergyOf(sk, r);
    return JSON.stringify({ total: s.total, links: s.links.map(l => l.id) });
  })()`));
  const a = run(withG), b = run(without);
  assert.ok(a.links.includes('arch:martial'), 'Batman and Po should link as Martial Artists in Mashup');
  assert.ok(Math.abs((a.total - b.total) - A.STRENGTH * 0.45) < 1e-9, 'cross-universe delta ' + (a.total - b.total));
});

test('the combined chemistry cap still holds for an all-archetype roster', () => {
  const t = JSON.parse(withG.run(`(function(){
    const sk = 'hockey', names = ['Daredevil','Iron Fist','Black Widow','Gamora','Wolverine','Deadpool','Elektra','Black Panther'];
    const r = {}; SPORTS[sk].pos.forEach((p, i) => r[p.id] = getCands('mcu').find(c => c.n === names[i]));
    const s = synergyOf(sk, r); return JSON.stringify({ links: s.links.reduce((x, l) => x + l.pts, 0), reported: s.total - (s.style ? s.style.pts : 0) });
  })()`));
  assert.ok(t.links > 2.8, 'this roster should exceed the cap before capping');
  assert.equal(t.reported, 2.8);
});

test('rosters with no archetype members score exactly as before, and scoring stays deterministic', () => {
  const total = app => JSON.parse(app.run(`(function(){ const sk='basketball'; const r={}; const c=${FILL}; SPORTS[sk].pos.forEach((p,i)=>r[p.id]=c[i]); return JSON.stringify(synergyOf(sk,r).total); })()`));
  assert.equal(total(withG), total(without));
  const score = withG.run(`(function(){
    const sk = 'volleyball', pool = getCands('mashup'); const r = {}; SPORTS[sk].pos.forEach((p, i) => r[p.id] = pool[i * 97 % pool.length]);
    const a = JSON.stringify(teamScore(sk, r).rating), b = JSON.stringify(teamScore(sk, r).rating); return a === b ? a : 'differs';
  })()`);
  assert.notEqual(score, 'differs');
});

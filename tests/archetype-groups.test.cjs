/* Run with: node --test tests/archetype-groups.test.cjs
 * Shared archetype and tag chemistry groups across the talent pools: data integrity, sourcing, wiring into the real
 * page code, cross-universe links in Mashup, and what they change. */
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
const idOf = g => (g.kind === 'tag' ? 'tag:' : 'arch:') + g.slug;
const isOurs = id => id.startsWith('arch:') || id.startsWith('tag:');
const COLOR_SLUGS = ['green', 'blue', 'red', 'yellow', 'orange', 'purple', 'pink'];

// What a research record must say for each group (same vocabulary used to mine the records).
const TRAIT = {
  martial: /martial[- ]art|kung[- ]fu|karate|judo|jujutsu|jiu[- ]jitsu|ninjutsu|hand[- ]to[- ]hand|boxing|\bcqc\b|teräs käsi/i,
  agile: /acrobat|parkour|free[- ]?running|gymnast|wall[- ]run|agility|agile/i,
  blades: /sword|blade|katana|saber|sabre|lightsaber|dagger|knife|knives|claws?\b|\bsai\b|\baxe\b|scythe|ninjato|rapier|leek/i,
  antiheroes: /anti[- ]?hero|vigilante|mercenary|bounty hunter/i,
  quips: /quip|wisecrack|sarcas|snark|\bwit\b|trash[- ]talk|prank|joke|heckl|comic/i,
  sorcerers: /spell|sorcer|wizard|witch|warlock|\bmage\b|magic|magick|incantation|\bwand\b|enchant|\bhex|curse|mystic arts|thu'um|transfigur|necroman|voodoo|dark arts/i,
  green: /\bgreen\b/i, blue: /\bblue\b|turquoise/i, red: /\bred\b/i, yellow: /\byellow\b/i,
  orange: /\borange\b/i, purple: /\bpurple\b|lavender/i, pink: /\bpink\b/i,
};

const recordCache = {};
function findRecord(file, id) {
  if (!recordCache[file]) recordCache[file] = JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
  const j = recordCache[file];
  return (j.characters || j.records || []).find(c => c.id === id) || null;
}
function recordText(r) {
  // earlierSummary: the pre-expansion summary kept when a record is expanded to all depictions (2026-11-20).
  return [r.summary, r.earlierSummary, ...(r.offense?.techniques || []), ...(r.defense?.mechanisms || []), ...(r.mobility || []),
    ...(r.feats || []).map(f => f.claim), ...(r.sources || []).map(s => s.supports)].filter(Boolean).join(' \n ');
}
const originOf = s => (s.record && !s.url) ? 'repo-research' : new URL(s.url).hostname.replace(/^www\./, '').toLowerCase();

test('every member is a real roster entry, groups stay selective, strengths follow the owner rulings, NBA stays out', () => {
  const rosters = {};
  const rosterOf = pool => (rosters[pool] = rosters[pool] || new Set(J(withG, 'getCands(' + JSON.stringify(pool) + ').map(c => c.n)')));
  assert.equal(A.ARCHETYPE_STRENGTH, 1);
  assert.equal(A.TAG_STRENGTH, 0.25);
  const ids = new Set();
  for (const g of A.groups) {
    assert.ok(['archetype', 'tag'].includes(g.kind), g.slug + ' needs a kind');
    assert.ok(!ids.has(idOf(g)), 'duplicate id ' + idOf(g)); ids.add(idOf(g));
    assert.ok(TRAIT[g.slug], g.slug + ' needs a trait vocabulary in this test');
    if (g.kind === 'archetype') {
      assert.equal(g.strength, 1, g.name + ' sits on film-group footing (owner ruling 2026-11-18)');
      assert.ok(mua.includes(g.mua3Affiliation), g.mua3Affiliation + ' is not an affiliation named in the MUA3 research note');
    } else {
      assert.equal(g.strength, 0.25, g.name + ' is a broad tag at 0.25 (owner ruling 2026-11-19)');
    }
    const perPool = {}, seen = new Set();
    for (const m of g.members) {
      const key = m.pool + '|' + m.name;
      assert.notEqual(m.pool, 'nba', 'NBA runs on its own terms and takes no archetype or tag (owner ruling 2026-11-19)');
      assert.ok(!seen.has(key), g.name + ' lists ' + key + ' twice'); seen.add(key);
      assert.ok(rosterOf(m.pool).has(m.name), m.name + ' is not in the ' + m.pool + ' pool');
      assert.ok(typeof m.basis === 'string' && m.basis.length > 5, key + ' needs a basis');
      if (m.pool === 'mcu' && g.kind === 'archetype') assert.equal(typeof m.mua3, 'boolean', key + ' MCU archetype members record the MUA3 listing');
      perPool[m.pool] = (perPool[m.pool] || 0) + 1;
    }
    // Groups stay selective (10 per pool) unless the owner lifted the cap for that group (perPoolCap: null).
    // Owner ruling 2026-11-20: Sorcerers is uncapped; every sourced spellcaster joins.
    if (g.slug === 'sorcerers') assert.equal(g.perPoolCap, null, 'Sorcerers is uncapped by owner ruling');
    else assert.ok(g.perPoolCap === undefined, g.name + ' must keep the default per-pool cap');
    const cap = g.perPoolCap === null ? Infinity : A.PER_POOL_CAP;
    for (const [pool, n] of Object.entries(perPool)) assert.ok(n <= cap, g.name + ' has ' + n + ' members in ' + pool + '; keep groups selective');
  }
  for (const s of ['sorcerers', ...COLOR_SLUGS]) assert.ok(ids.has('tag:' + s), 'missing tag ' + s);
  // One colour per character.
  const colourOf = {};
  for (const g of A.groups.filter(g => COLOR_SLUGS.includes(g.slug))) for (const m of g.members) {
    const key = m.pool + '|' + m.name;
    assert.ok(!colourOf[key], key + ' is in both ' + colourOf[key] + ' and ' + g.name); colourOf[key] = g.name;
  }
  // Every built-in pool except NBA is covered by at least one archetype.
  const pools = new Set(A.groups.filter(g => g.kind === 'archetype').flatMap(g => g.members.map(m => m.pool)));
  for (const p of ['mcu', 'toons', 'muppets', 'games', 'pokemon', 'starwars', 'dc', 'lotr', 'harrypotter', 'actionmovies']) assert.ok(pools.has(p), p + ' has no archetype members');
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
  // Known flags: Valkyrie (Blades & Claws), The Count (Purples), Imhotep (Sorcerers).
  assert.ok(needsReview <= 3, needsReview + ' members flagged needs-review');
});

test('the page registers one shared id per group, tags exactly the members, and leaves every other group alone', () => {
  const def = app => J(app, "Object.fromEntries(Object.entries(SYN_DEF).map(([k, v]) => [k, v.map(r => r.slice(0, 3).concat([r[3].length]))]))");
  assert.deepEqual(def(withG), def(without), 'franchise and trait groups must be unchanged');
  for (const g of A.groups) assert.deepEqual(J(withG, 'GROUPS[' + JSON.stringify(idOf(g)) + ']'), { name: g.name, strength: g.strength });
  const pools = [...new Set(A.groups.flatMap(g => g.members.map(m => m.pool))), 'nba'];
  for (const pool of pools) {
    const tagged = J(withG, 'getCands(' + JSON.stringify(pool) + ').map(c => [c.n, c.g.filter(id => id.startsWith("arch:") || id.startsWith("tag:"))])');
    const expected = {};
    for (const g of A.groups) for (const m of g.members) if (m.pool === pool) (expected[m.name] = expected[m.name] || []).push(idOf(g));
    for (const [n, ids] of tagged) assert.deepEqual(ids.sort(), (expected[n] || []).sort(), pool + ':' + n + ' group tags');
    const before = J(without, 'getCands(' + JSON.stringify(pool) + ').map(c => c.g)');
    const after = J(withG, 'getCands(' + JSON.stringify(pool) + ').map(c => c.g.filter(id => !id.startsWith("arch:") && !id.startsWith("tag:")))');
    assert.deepEqual(after, before, pool + ' other groups changed');
  }
});

// NBA players carry no archetype or tag, so they make a neutral filler. Names are fixed so both builds score the
// same players.
const FILL_NAMES = J(withG, "getCands('nba').filter(c => !c.coach && !c.g.some(id => id.startsWith('arch:') || id.startsWith('tag:'))).map(c => c.n)");
const FILL = `${JSON.stringify(FILL_NAMES)}.map(n => getCands('nba').find(c => c.n === n))`;

function pairDelta(sk, a, b) {
  const run = app => JSON.parse(app.run(`(function(){
    const sk = ${JSON.stringify(sk)}, pos = SPORTS[sk].pos, fill = ${FILL};
    const pick = ([p, n]) => (p === 'mashup' ? getCands('mashup').find(c => c.pool === n[0] && c.n === n[1]) : getCands(p).find(c => c.n === n));
    const r = {}; let k = 0;
    pos.forEach((p, i) => { r[p.id] = i === 0 ? pick(${JSON.stringify(a)}) : i === 1 ? pick(${JSON.stringify(b)}) : fill[k++]; });
    const s = synergyOf(sk, r);
    return JSON.stringify({ total: s.total, links: s.links.map(l => l.id) });
  })()`));
  const x = run(withG), y = run(without);
  return { delta: x.total - y.total, links: x.links };
}

test('two members of one group add exactly strength x tier inside a pool', () => {
  // Daredevil and Iron Fist share Martial Artists and Agile Fighters.
  let d = pairDelta('hockey', ['mcu', 'Daredevil'], ['mcu', 'Iron Fist']).delta;
  assert.ok(Math.abs(d - 2 * A.ARCHETYPE_STRENGTH * 0.45) < 1e-9, 'MCU delta ' + d);
  // Po and Tigress (Toons) share Martial Artists only.
  d = pairDelta('hockey', ['toons', 'Po'], ['toons', 'Tigress']).delta;
  assert.ok(Math.abs(d - A.ARCHETYPE_STRENGTH * 0.45) < 1e-9, 'Toons delta ' + d);
  // Kermit and Oscar (Muppets) share Greens only.
  d = pairDelta('hockey', ['muppets', 'Kermit the Frog'], ['muppets', 'Oscar the Grouch']).delta;
  assert.ok(Math.abs(d - A.TAG_STRENGTH * 0.45) < 1e-9, 'Muppets Greens delta ' + d);
  // Dumbledore and Hermione share Sorcerers only.
  d = pairDelta('hockey', ['harrypotter', 'Albus Dumbledore'], ['harrypotter', 'Hermione Granger']).delta;
  assert.ok(Math.abs(d - A.TAG_STRENGTH * 0.45) < 1e-9, 'Harry Potter Sorcerers delta ' + d);
});

test('Mashup links members across universes, and only through these groups', () => {
  let r = pairDelta('hockey', ['mashup', ['dc', 'Batman']], ['mashup', ['toons', 'Po']]);
  assert.ok(r.links.includes('arch:martial'), 'Batman and Po should link as Martial Artists in Mashup');
  assert.ok(Math.abs(r.delta - A.ARCHETYPE_STRENGTH * 0.45) < 1e-9, 'cross-universe archetype delta ' + r.delta);
  r = pairDelta('hockey', ['mashup', ['muppets', 'Kermit the Frog']], ['mashup', ['mcu', 'Hulk']]);
  assert.ok(r.links.includes('tag:green'), 'Kermit and Hulk should link as Greens in Mashup');
  assert.ok(Math.abs(r.delta - A.TAG_STRENGTH * 0.45) < 1e-9, 'cross-universe colour delta ' + r.delta);
  r = pairDelta('hockey', ['mashup', ['lotr', 'Gandalf']], ['mashup', ['mcu', 'Doctor Strange']]);
  assert.ok(r.links.includes('tag:sorcerers'), 'Gandalf and Doctor Strange should link as Sorcerers in Mashup');
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

test('NBA rosters score exactly as before, and scoring stays deterministic', () => {
  const total = app => JSON.parse(app.run(`(function(){ const sk='basketball'; const r={}; const c=getCands('nba').filter(x=>!x.coach); SPORTS[sk].pos.forEach((p,i)=>r[p.id]=c[i*7 % c.length]); return JSON.stringify(synergyOf(sk,r).total); })()`));
  assert.equal(total(withG), total(without));
  const score = withG.run(`(function(){
    const sk = 'volleyball', pool = getCands('mashup'); const r = {}; SPORTS[sk].pos.forEach((p, i) => r[p.id] = pool[i * 97 % pool.length]);
    const a = JSON.stringify(teamScore(sk, r).rating), b = JSON.stringify(teamScore(sk, r).rating); return a === b ? a : 'differs';
  })()`);
  assert.notEqual(score, 'differs');
});

test('skipping the archetype file reproduces the previous V1 golden digests exactly', () => {
  const { runParityFixtures } = require('./helpers/option-c-parity-fixtures.cjs');
  const golden = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/option-c-v1-golden.json'), 'utf8'));
  // The first archetype revision holds the digests from before any archetype or tag group existed.
  const rev = (golden.revisions || []).find(r => /archetype/i.test(r.reason));
  assert.ok(rev && rev.previousDigests, 'the golden file records the pre-archetype digests');
  const noArch = runParityFixtures(loadApp({ skip: s => s.startsWith('data/option-c/') || s.includes('archetype-groups') }), false);
  for (const id of Object.keys(rev.previousDigests)) assert.equal(noArch.digests[id], rev.previousDigests[id], 'without archetypes, ' + id + ' should match the pre-archetype baseline');
});

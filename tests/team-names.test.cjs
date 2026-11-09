const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const names = require('../data/team-names.js');

const poolIds = ['nba', 'mcu', 'toons', 'muppets', 'games', 'pokemon', 'starwars', 'dc', 'lotr', 'harrypotter'];
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('every single talent pool has a sufficiently deep and distinct location-inspired name catalog', () => {
  assert.deepEqual(Object.keys(names.POOL_TEAM_NAMES).sort(), poolIds.slice().sort());
  for (const id of poolIds) {
    const entries = names.POOL_TEAM_NAMES[id];
    assert.ok(entries.length >= 16, id + ' should support a full 16-team league including the user');
    assert.equal(new Set(entries.map(s => s.toLowerCase())).size, entries.length, id + ' duplicate team name');
    for (const s of entries) {
      assert.ok(s.length > 5 && s.length <= 32, id + ' cannot display team name: ' + s);
      assert.ok(s.split(' ').length >= 2, id + ' name lacks location and nickname: ' + s);
    }
  }
  assert.equal(names.suggestion('lotr'), 'Gondor Shield');
  assert.equal(names.suggestion('lotr', 1), 'Rohan Riders');
  assert.equal(names.suggestion('lotr', 2), 'Shire Folk');
  assert.equal(names.suggestion('mashup'), null);
});

test('same-pool opponent names are unique and never collide with the user name', () => {
  const rng = () => 0.41;
  for (const id of poolIds) {
    const mine = names.suggestion(id);
    const generated = names.generate(id, 15, rng, () => {
      throw Error('single pool should not fall back to generic cities');
    }, [mine]);
    assert.equal(generated.length, 15, id);
    assert.equal(new Set(generated.map(s => s.toLowerCase())).size, generated.length, id);
    assert.ok(!generated.some(s => s.toLowerCase() === mine.toLowerCase()), id + ' collision with user');
    assert.ok(generated.every(n => names.POOL_TEAM_NAMES[id].includes(n)), id + ' unexpected generic name');
  }
});

test('seeded name generation is stable and supports expanded leagues without repeats', () => {
  function rng(seed) {
    let s = seed;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0x100000000);
  }
  const a = names.generate('lotr', 24, rng(17), null, ['Gondor Shield']);
  const b = names.generate('lotr', 24, rng(17), null, ['Gondor Shield']);
  assert.deepEqual(a, b);
  assert.equal(new Set(a).size, 24);
  assert.ok(a.includes('Rohan Riders'));
  assert.equal(names.generate('lotr', 0, rng(1)).length, 0);
  const large = names.generate('lotr', 40, rng(3));
  assert.equal(large.length, 40);
  assert.equal(new Set(large).size, 40);
  assert.ok(large.some(s => / 2$/.test(s)), 'expanded leagues keep themed names');
});

test('mashup and custom pools retain the generic city-and-mascot generator', () => {
  let hits = 0;
  const fallback = (count, rng) => {
    hits++;
    return Array.from({ length: count }, (_, i) => 'New York Generic ' + i);
  };
  for (const id of ['mashup', 'custom-123', null]) {
    assert.deepEqual(names.generate(id, 3, () => 0.2, fallback), [
      'New York Generic 0', 'New York Generic 1', 'New York Generic 2'
    ]);
  }
  assert.equal(hits, 3);
});

test('the live app loads the naming catalog before use in single-pool game modes', () => {
  const script = html.indexOf('<script src="data/team-names.js"></script>');
  const app = html.indexOf('<script>\nconst POOLS');
  assert.ok(script > 0 && script < app, 'themed names must be loaded before app script');
  assert.match(html, /poolRivalTeamNames\(c\.poolId, c\.opps, rng, mineName\)/);
  assert.match(html, /const mineName = \(c\.teamName \|\| ''\)\.trim\(\) \|\| suggestedTeamName\(c\.poolId\)/);
  assert.match(html, /suggestedTeamName\(f\.poolId, 0, 'Home team'\)/);
  assert.match(html, /suggestedTeamName\(d\.poolId, 1, 'Away team'\)/);
  assert.match(html, /const names = aiTeamNames\(opp\.length, rng\)/,
    'Perfect Season remains cross-universe and retains generic names');
  assert.match(html, /function contestName\(d, side\)/,
    'existing Head-to-Head contests still render their saved names');
});

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {SIDEKICK_ROSTER, BENCH_CHEM, sidekickOf, isSidekick, characterRoleTags, benchChemistry, benchHeatRoll} = require('../data/bench-chemistry.js');
const {CHARACTER_ABILITY_TAGS} = require('../data/character-abilities.js');

const C = (pool, n, g = []) => ({pool, n, g});
const POS = [{id: 'a'}, {id: 'b'}, {id: 'c'}, {id: 'd'}, {id: 'hc', coach: true}, {id: 'bn', bench: true}];
const fixed = v => () => v;

test('every sidekick and every lead is a real roster character in the same pool', () => {
  let count = 0;
  for (const [pool, list] of Object.entries(SIDEKICK_ROSTER)) for (const [name, [leads, note]] of Object.entries(list)) {
    count++;
    assert.ok(name in CHARACTER_ABILITY_TAGS[pool], `${pool}:${name} is not on the roster`);
    for (const l of leads) assert.ok(l in CHARACTER_ABILITY_TAGS[pool], `${pool}:${name} lead ${l} is not on the roster`);
    assert.ok(typeof note === 'string' && note.length > 8, `${pool}:${name} needs a reason`);
    assert.ok(!leads.includes(name), `${pool}:${name} cannot lead themselves`);
  }
  assert.ok(count >= 100);
});

test('sidekick is a role tag, never mixed into the power index', () => {
  assert.deepEqual(characterRoleTags(C('lotr', 'Samwise Gamgee')), ['sidekick']);
  assert.deepEqual(characterRoleTags(C('lotr', 'Frodo Baggins')), []);
  assert.ok(isSidekick(C('starwars', 'Chewbacca')));
  assert.equal(sidekickOf(C('nba', 'Michael Jordan')), null);
  for (const pool of Object.values(CHARACTER_ABILITY_TAGS)) for (const tags of Object.values(pool)) assert.ok(!tags.includes('sidekick'));
});

test('a sidekick on the bench is a guaranteed lift, bigger next to their lead', () => {
  const frodo = C('lotr', 'Frodo Baggins'), sam = C('lotr', 'Samwise Gamgee'), aragorn = C('lotr', 'Aragorn');
  const alone = benchChemistry({a: aragorn, bn: sam}, POS, 80);
  assert.equal(alone.percent, BENCH_CHEM.sidekickLock);
  const reunion = benchChemistry({a: frodo, b: aragorn, bn: sam}, POS, 80);
  assert.equal(reunion.percent, BENCH_CHEM.sidekickLock + BENCH_CHEM.leadEach);
  assert.deepEqual(reunion.leads, ['Frodo Baggins']);
  assert.ok(Math.abs(reunion.points - 80 * reunion.percent / 100) < 1e-9);
});

test('a lead in the coach spot still counts (owner ruling)', () => {
  const r = benchChemistry({a: C('nba', 'LeBron James'), hc: C('nba', 'Michael Jordan'), bn: C('nba', 'Scottie Pippen')}, POS, 70);
  assert.deepEqual(r.leads, ['Michael Jordan']);
  assert.equal(r.percent, BENCH_CHEM.sidekickLock + BENCH_CHEM.leadEach);
});

test('a sidekick in a starting slot gets no bench bonus', () => {
  const r = benchChemistry({a: C('lotr', 'Samwise Gamgee'), b: C('lotr', 'Frodo Baggins'), bn: C('lotr', 'Aragorn')}, POS, 80);
  assert.equal(r.sidekick, false);
  assert.equal(r.percent, 0);
});

test('any bench player who meshes with the group lifts the team, counting the coach', () => {
  const g = ['nba:bulls'];
  const r = benchChemistry({a: C('nba', 'Michael Jordan', g), b: C('nba', 'LeBron James'), hc: C('nba', 'Phil Jackson', g), bn: C('nba', 'Steve Kerr', g)}, POS, 70);
  assert.equal(r.sidekick, false);
  assert.deepEqual(r.mesh.sort(), ['Michael Jordan', 'Phil Jackson']);
  assert.equal(r.percent, 2 * BENCH_CHEM.meshEach);
});

test('a lead is not double-counted as mesh, and the total is capped at 8%', () => {
  const g = ['nba:bulls'];
  const r = benchChemistry({a: C('nba', 'Michael Jordan', g), b: C('nba', 'Scottie Pippen', g), bn: C('nba', 'Dennis Rodman', g)}, POS, 70);
  assert.deepEqual(r.leads.sort(), ['Michael Jordan', 'Scottie Pippen']);
  assert.deepEqual(r.mesh, []);
  const many = {}; 'abcd'.split('').forEach((id, i) => many[id] = C('nba', 'X' + i, g));
  many.hc = C('nba', 'Michael Jordan', g); many.bn = C('nba', 'Scottie Pippen', g);
  assert.equal(BENCH_CHEM.cap, 8);
  assert.ok(benchChemistry(many, POS, 70).percent <= BENCH_CHEM.cap);
});

test('empty or missing bench gives nothing', () => {
  assert.equal(benchChemistry({a: C('lotr', 'Frodo Baggins')}, POS, 80).percent, 0);
  assert.equal(benchChemistry(null, POS, 80).percent, 0);
});

test('Off the Bench heat: clutch raises the heater, sidekicks rarely go cold, one draw per game', () => {
  let draws = 0; const rng = () => { draws++; return 0.2; };
  assert.equal(benchHeatRoll(10, 70, false, false, rng).kind, null);
  assert.equal(benchHeatRoll(95, 70, false, false, rng).kind, 'boom');
  assert.equal(draws, 2);
  assert.equal(benchHeatRoll(50, 70, false, false, fixed(0.96)).kind, 'bust');
  assert.equal(benchHeatRoll(50, 70, true, false, fixed(0.96)).kind, null);
  assert.ok(benchHeatRoll(90, 99, false, false, fixed(0)).pts > benchHeatRoll(90, 40, false, false, fixed(0)).pts);
  assert.equal(benchHeatRoll(50, 70, false, false, fixed(0.22)).kind, null);
  assert.equal(benchHeatRoll(50, 70, false, true, fixed(0.22)).kind, 'boom');
});

test('the game wires bench chemistry into scoring, AI value and every game', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const tag = html.indexOf('<script src="data/bench-chemistry.js"></script>');
  assert.ok(tag > 0 && tag < html.indexOf('<script src="data/campaign.js"></script>'));
  assert.match(html, /const benchChem=benchChemistry\(roster,sp\.pos,baseRating\)/);
  assert.match(html, /rating:baseRating\+muppetTeam\.points\+benchChem\.points/);
  assert.match(html, /benchChemistry\(roster,sp\.pos,baseRating\)\.points;\n\}/);
  assert.match(html, /benchHeatRoll\(bh\.clutch, bh\.fit, bh\.sidekick, playoff, rng\)/);
});

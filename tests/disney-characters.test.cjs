/* Regression tests for the Disney characters added to the Cartoons pool (2026-11-10).
   Checks that each one is wired into every registry, that the reviewed powers and
   identity rulings hold, and that uncertain powers stay out. No network, no paid AI. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadGame } = require('../tools/ability-audit-lib.cjs');
const { toonForceOf } = require('../data/toon-force.js');
const { CHARACTER_ABILITY_TAGS, CHARACTER_ABILITY_RESEARCH_QUEUE } = require('../data/character-abilities.js');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const html = read('index.html');
const toonsRegion = html.slice(html.indexOf('POOLS.toons ='), html.indexOf('POOLS.muppets ='));
const shipped = [...toonsRegion.matchAll(/^\["([^"]+)","[^"]*","[^"]*",\[([0-9,]+)\]\]/gm)].map(m => m[1]);

const FILMS = {
  'Aladdin': ['Aladdin', 'Jasmine', 'Genie', 'Jafar'],
  'The Little Mermaid': ['Ariel', 'Ursula', 'King Triton', 'Sebastian'],
  'Beauty and the Beast': ['Belle', 'Beast', 'Gaston', 'Lumière'],
  'The Hunchback of Notre Dame': ['Quasimodo', 'Esmeralda', 'Frollo', 'Phoebus'],
  'The Lion King': ['Simba', 'Mufasa', 'Scar', 'Timon', 'Pumbaa'],
  'Mulan': ['Mulan', 'Mushu', 'Shan Yu'],
  'Hercules': ['Hercules', 'Phil', 'Hades'],
  'Frozen': ['Elsa', 'Anna', 'Olaf'],
  'Lilo & Stitch': ['Lilo', 'Stitch'],
  'Peter Pan': ['Peter Pan', 'Captain Hook'],
};
const ADDED = ['Aladdin', 'Jasmine', 'Genie', 'Jafar', 'Ariel', 'Ursula', 'King Triton', 'Sebastian',
  'Belle', 'Beast', 'Gaston', 'Lumière', 'Quasimodo', 'Esmeralda', 'Frollo', 'Phoebus',
  'Scar', 'Mufasa', 'Timon', 'Pumbaa', 'Mushu', 'Shan Yu', 'Hades', 'Anna', 'Olaf', 'Lilo',
  'Peter Pan', 'Captain Hook', 'Maleficent', 'Snow White', 'Cinderella'];

const game = loadGame();
const byId = new Map(game.roster.map(c => [c.id, c]));
const toon = n => { const c = byId.get('toons:' + n); assert.ok(c, n + ' is not a playable cartoon'); return c; };
const accepts = (n, rule) => game.allowed(toon(n), rule);

test('all 31 Disney additions are playable once each, with the ten film groups at 3-5 members', () => {
  for (const n of ADDED) assert.equal(shipped.filter(x => x === n).length, 1, n);
  assert.match(toonsRegion, new RegExp("blurb: '" + shipped.length + ' animated legends'));
  const synToons = html.slice(html.indexOf('const SYN_DEF'));
  const block = synToons.slice(synToons.indexOf('  toons: ['), synToons.indexOf('  muppets: ['));
  for (const [film, members] of Object.entries(FILMS)) {
    const row = block.split('\n').find(l => l.includes("'" + film + "', 1, ["));
    assert.ok(row, 'Missing chemistry group for ' + film);
    for (const m of members) assert.ok(row.includes("'" + m + "'"), m + ' missing from ' + film);
    assert.ok(members.length >= 2 && members.length <= 5, film);
  }
});

test('every addition has research, a guide entry, a knowledge-roster entry and an audited index row', () => {
  const g = read('data/toons-profiles.js');
  const guide = JSON.parse(g.slice(g.indexOf('toons=') + 6).trim().replace(/;\s*$/, ''));
  const batch = JSON.parse(read('research/TOONS_PROFILES_BATCH_04.json')).characters;
  const roster = JSON.parse(read('supabase/functions/character-knowledge/roster.json')).toons;
  assert.deepEqual(roster, shipped, 'Knowledge roster must match the game roster order');
  for (const n of ADDED) {
    assert.ok(guide[n]?.works?.length && guide[n].sources.every(u => u.startsWith('https://')), n + ' guide');
    const p = batch.find(x => x.name === n);
    assert.ok(p && p.feats.every(f => f.source_url?.startsWith('https://')), n + ' research feats need sources');
    assert.ok(Array.isArray(CHARACTER_ABILITY_TAGS.toons[n]), n + ' missing from the reviewed ability index');
  }
});

test('documented Disney powers qualify for their Campaign challenges', () => {
  for (const [n, rule] of [['Aladdin', 'flight'], ['Genie', 'flight'], ['Genie', 'magic'], ['Peter Pan', 'flight'],
    ['Jafar', 'magic'], ['Jafar', 'psychic'], ['Jafar', 'giants'], ['Jafar', 'fire'],
    ['Ariel', 'aquatic'], ['Ursula', 'aquatic'], ['Ursula', 'giants'], ['Ursula', 'magic'],
    ['King Triton', 'aquatic'], ['King Triton', 'magic'], ['Sebastian', 'aquatic'],
    ['Mushu', 'fire'], ['Hades', 'fire'], ['Hades', 'teleport'],
    ['Maleficent', 'magic'], ['Maleficent', 'giants'], ['Maleficent', 'fire'], ['Maleficent', 'teleport']]) {
    assert.equal(accepts(n, rule), true, n + ' should qualify for ' + rule);
  }
  assert.ok(CHARACTER_ABILITY_TAGS.toons.Aladdin.includes('mount'), 'Aladdin flies by riding Carpet');
  assert.ok(CHARACTER_ABILITY_TAGS.toons['King Triton'].includes('magic-item'), "Triton's power lives in his trident");
});

test('passengers, job titles and unconfirmed powers do not qualify', () => {
  // Jasmine only rides Carpet as a passenger; Gaston is a hunter, not a giant; uncertain powers wait in the queue.
  for (const [n, rule] of [['Jasmine', 'flight'], ['Belle', 'magic'], ['Beast', 'giants'], ['Lumière', 'fire'],
    ['Genie', 'giants'], ['Genie', 'teleport'], ['Esmeralda', 'stealth'], ['Gaston', 'giants'], ['Olaf', 'ice'],
    ['Anna', 'ice'], ['Cinderella', 'magic'], ['Captain Hook', 'flight']]) {
    assert.equal(accepts(n, rule), false, n + ' must not qualify for ' + rule);
  }
  for (const [n, tag] of [['Genie', 'giants'], ['Genie', 'teleport'], ['Lumière', 'fire'], ['Beast', 'giants'], ['Esmeralda', 'stealth']]) {
    assert.ok(CHARACTER_ABILITY_RESEARCH_QUEUE.some(q => q.id === 'toons:' + n && q.tag === tag), n + '/' + tag + ' should be queued for research');
  }
});

test('identity challenges use the stated canon', () => {
  for (const n of ['Jasmine', 'Ariel', 'Ursula', 'Belle', 'Esmeralda', 'Anna', 'Lilo', 'Maleficent', 'Snow White', 'Cinderella'])
    assert.equal(accepts(n, 'women'), true, n);
  for (const n of ['Aladdin', 'Genie', 'Beast', 'Mufasa', 'Peter Pan']) assert.equal(accepts(n, 'women'), false, n);
  // Ariel says she is sixteen; Lilo is six; Peter Pan never grows up.
  for (const n of ['Ariel', 'Lilo', 'Peter Pan']) assert.equal(accepts(n, 'kids'), true, n);
  for (const n of ['Belle', 'Mufasa', 'Jafar']) assert.equal(accepts(n, 'kids'), false, n);
  for (const n of ['Aladdin', 'Belle', 'Gaston', 'Quasimodo', 'Esmeralda', 'Phoebus', 'Shan Yu', 'Captain Hook', 'Cinderella'])
    assert.equal(accepts(n, 'mortal'), true, n);
  for (const n of ['Genie', 'Jafar', 'Ursula', 'Hades', 'Maleficent', 'Peter Pan']) assert.equal(accepts(n, 'mortal'), false, n);
  for (const n of ['Sebastian', 'Mushu']) assert.equal(accepts(n, 'red'), true, n);
});

test('Genie is the only addition with ToonForce', () => {
  const sample = n => ({ pool: 'toons', n, a: Array(12).fill(70) });
  assert.ok(toonForceOf(sample('Genie'))?.score >= 90);
  for (const n of ADDED.filter(n => n !== 'Genie')) assert.equal(toonForceOf(sample(n)), null, n);
});

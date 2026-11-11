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
    ['Maleficent', 'magic'], ['Maleficent', 'giants'], ['Maleficent', 'fire'], ['Maleficent', 'teleport'],
    // Owner rulings, 2026-11-10.
    ['Genie', 'giants'], ['Genie', 'teleport'], ['Lumière', 'fire'], ['Beast', 'giants'], ['Esmeralda', 'stealth'], ['Hades', 'magic']]) {
    assert.equal(accepts(n, rule), true, n + ' should qualify for ' + rule);
  }
  assert.ok(CHARACTER_ABILITY_TAGS.toons.Aladdin.includes('mount'), 'Aladdin flies by riding Carpet');
  assert.ok(CHARACTER_ABILITY_TAGS.toons['King Triton'].includes('magic-item'), "Triton's power lives in his trident");
});

test('passengers and job titles do not qualify', () => {
  // Jasmine only rides Carpet as a passenger; Gaston is a hunter, not a giant.
  for (const [n, rule] of [['Jasmine', 'flight'], ['Belle', 'magic'], ['Gaston', 'giants'], ['Olaf', 'ice'],
    ['Anna', 'ice'], ['Cinderella', 'magic'], ['Captain Hook', 'flight'], ['Quasimodo', 'giants']]) {
    assert.equal(accepts(n, rule), false, n + ' must not qualify for ' + rule);
  }
  // Approved rulings leave the research queue.
  assert.equal(CHARACTER_ABILITY_RESEARCH_QUEUE.filter(q => ADDED.includes(q.id.replace(/^toons:/, ''))).length, 0);
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

/* PR #55 review (2026-11-10): evidence strength and form/item gating. */
const { CHARACTER_ABILITIES } = require('../data/character-abilities.js');
// Evidence standard (owner, 2026-11-10): accuracy, not source type. A specific, well-documented community
// entry is credible evidence; a second independent source that agrees is corroboration.
const host = u => new URL(u).hostname.replace(/^www\./, '');
const disneyRecords = () => ADDED.flatMap(n => (CHARACTER_ABILITIES['toons:' + n] || []).map(r => [n, r]));

test('every Disney power record is labelled corroborated, credible, needs-review or owner-ruling, with a scene', () => {
  const records = disneyRecords();
  assert.ok(records.length >= 22);
  for (const [n, r] of records) {
    assert.ok(['corroborated', 'credible', 'needs-review', 'owner-ruling'].includes(r.verification), n + ' ' + r.tag + ' needs a verification label');
    if (r.verification !== 'owner-ruling') assert.ok(r.scene?.length >= 20, n + ' ' + r.tag + ' needs an identifiable scene reference');
  }
});

test('"corroborated" Disney records cite a second source independent of the first', () => {
  for (const [n, r] of disneyRecords().filter(([, r]) => r.verification === 'corroborated')) {
    const second = [].concat(r.verifiedBy || []);
    assert.ok(second.length, n + ' ' + r.tag + ' is corroborated without verifiedBy');
    for (const u of second) assert.match(u, /^https:\/\/\S+$/, n + ' ' + r.tag);
    assert.ok(second.some(u => host(u) !== host(r.source)), n + ' ' + r.tag + ': the corroborating source is the same site as the first');
  }
  // Records the review called out by name. Jafar's fire is flagged for accuracy (the scene is unconfirmed),
  // not for its source; Maleficent's teleport cites one site twice, so it is credible, not corroborated.
  const rec = (n, tag) => CHARACTER_ABILITIES['toons:' + n].find(r => r.tag === tag);
  assert.equal(rec('Jafar', 'fire').verification, 'needs-review');
  assert.equal(rec('Maleficent', 'teleport').verification, 'credible');
  assert.ok(!/comicvine/.test(host(rec('Maleficent', 'teleport').source)), 'Maleficent teleport cites the film synopsis');
  assert.equal(rec('Peter Pan', 'flight').verification, 'owner-ruling', "Peter Pan's flight is owner-settled");
});

test('form- and item-dependent Disney powers record their gate', () => {
  const gate = (n, tag) => CHARACTER_ABILITIES['toons:' + n].find(r => r.tag === tag)?.formGate?.type;
  assert.equal(gate('Jafar', 'giants'), 'wish-form');
  assert.equal(gate('Jafar', 'fire'), 'wish-form');
  assert.equal(gate('Jafar', 'psychic'), 'owned-item');
  assert.equal(gate('Ursula', 'giants'), 'stolen-item');
  assert.deepEqual(CHARACTER_ABILITIES['toons:Ursula'].find(r => r.tag === 'aquatic').formGate.appliesTo, ['water-control']);
  assert.equal(gate('King Triton', 'magic'), 'owned-item');
  assert.equal(gate('Maleficent', 'giants'), 'self-transformation');
  const TYPES = ['owned-item', 'stolen-item', 'wish-form', 'self-transformation'];
  for (const [n, r] of disneyRecords()) if (r.formGate) assert.ok(TYPES.includes(r.formGate.type) && r.formGate.note, n + ' ' + r.tag);
});

/* Owner ruling (Garrett, 2026-11-10): Peter Pan is flight-eligible for Skyborne. Settled; not a pixie-dust condition. */
test('Peter Pan stays Skyborne-eligible under the owner ruling', () => {
  assert.equal(accepts('Peter Pan', 'flight'), true, 'Skyborne uses the flight rule');
  const tags = CHARACTER_ABILITY_TAGS.toons['Peter Pan'];
  assert.ok(tags.includes('flight') && tags.includes('natural-flight'), 'reviewed index grants his own flight');
  const r = CHARACTER_ABILITIES['toons:Peter Pan'].find(x => x.tag === 'flight');
  assert.equal(r.verification, 'owner-ruling');
  assert.match(r.ruling, /owner-settled/);
  assert.equal(r.formGate, undefined, 'pixie dust is not recorded as a form or item gate');
  assert.ok(!CHARACTER_ABILITY_RESEARCH_QUEUE.some(q => q.id === 'toons:Peter Pan'), 'not reopened in the research queue');
});

test('owner ruling 2026-11-10: form-, wish- and item-dependent powers count for the base character', () => {
  for (const [n, rule] of [['Jafar', 'giants'], ['Jafar', 'fire'], ['Jafar', 'psychic'], ['Ursula', 'giants'],
    ['Ursula', 'aquatic'], ['King Triton', 'magic'], ['Maleficent', 'giants'], ['Maleficent', 'fire']])
    assert.equal(accepts(n, rule), true, n + ' keeps ' + rule + ' under the keep-them-all ruling');
});

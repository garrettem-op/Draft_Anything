/* Regression tests for the complete character ability index and the audited evidence.
   Uses the real roster from index.html and every bundled evidence layer (descriptions,
   research guides, Pokémon types, curated records). No network, no paid AI. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { POWER_TAGS, POOL_IDS, LEGACY_POOL_IDS, loadGame, engineMatrix } = require('../tools/ability-audit-lib.cjs');
const { derivedIndex } = require('../tools/ability-audit.cjs');

const game = loadGame();
const matrix = engineMatrix(game);
const byId = new Map(game.roster.map(c => [c.id, c]));
const get = id => { const c = byId.get(id); assert.ok(c, id + ' is not on the roster'); return c; };
const accepts = (id, tag) => game.allowed(get(id), tag);

test('index lists every roster character in every pool exactly once, and nobody else', () => {
  assert.equal(game.roster.filter(c => LEGACY_POOL_IDS.includes(c.pool)).length, 848);
  let listed = 0;
  for (const pool of POOL_IDS) {
    const names = Object.keys(game.tagIndex[pool] || {});
    listed += names.length;
    for (const n of names) assert.ok(byId.has(pool + ':' + n), 'Index lists unknown character ' + pool + ':' + n);
  }
  assert.equal(listed, game.roster.length);
  for (const c of game.roster) assert.ok(Array.isArray(game.tagIndex[c.pool][c.n]), c.id + ' missing from index');
});

test('index tags are valid power ids and every one is honored by Campaign validation', () => {
  for (const c of game.roster) for (const tag of game.tagIndex[c.pool][c.n]) {
    assert.ok(POWER_TAGS.includes(tag), c.id + ' has unknown tag ' + tag);
    assert.equal(game.allowed(c, tag), true, c.id + ' is indexed as ' + tag + ' but Campaign rejects it');
  }
});

test('index is in sync with evidence (rerun tools/ability-audit.cjs --write-index if this fails)', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(game.tagIndex)), derivedIndex(game, matrix));
});

test('NBA players are audited as non-powered', () => {
  for (const c of game.roster.filter(c => c.pool === 'nba')) assert.equal(game.tagIndex.nba[c.n].length, 0, c.id);
});

test('every evidence record names one roster character, a real power, a feat and a source', () => {
  for (const [id, facts] of Object.entries(game.abilities)) {
    assert.ok(byId.has(id), 'Evidence for unknown roster character ' + id);
    assert.ok(facts.length, id + ' has an empty record');
    const seen = new Set();
    for (const f of facts) {
      assert.ok(POWER_TAGS.includes(f.tag), id + ' unknown tag ' + f.tag);
      assert.ok(!seen.has(f.tag), id + ' has duplicate ' + f.tag + ' records (only the first is read)');
      seen.add(f.tag);
      assert.ok(typeof f.kind === 'string' && f.kind.length, id + ' ' + f.tag + ' missing kind');
      assert.ok(f.feat?.length >= 20, id + ' ' + f.tag + ' missing a specific feat');
      assert.match(f.source, /^https:\/\/\S+$/, id + ' ' + f.tag + ' missing source URL');
      if (f.audit) assert.ok(f.continuity?.length, id + ' ' + f.tag + ' audit record missing continuity');
    }
  }
});

test('disputes and research-queue entries are well formed and not silently granted', () => {
  for (const d of game.disputes) {
    assert.ok(byId.has(d.id), 'Dispute for unknown character ' + d.id);
    assert.ok(POWER_TAGS.includes(d.tag), d.id + ' dispute has unknown tag');
    assert.ok(['incorrect', 'ruling'].includes(d.verdict), d.id + ' bad verdict');
    assert.ok(d.reason?.length >= 20, d.id + ' dispute needs a reason');
    assert.ok(accepts(d.id, d.tag), 'Stale dispute: engine no longer grants ' + d.id + ' ' + d.tag);
  }
  for (const q of game.research) {
    assert.ok(byId.has(q.id), 'Queued research for unknown character ' + q.id);
    assert.ok(POWER_TAGS.includes(q.tag), q.id + ' queue has unknown tag');
    assert.ok(q.note?.length >= 20, q.id + ' queue needs a note');
    assert.equal((game.abilities[q.id] || []).some(f => f.tag === q.tag), false,
      q.id + ' ' + q.tag + ' is queued for research but also has granting evidence');
  }
});

test('evidence records are the reason a character qualifies, not just a duplicate', () => {
  // Every curated record must be reachable through characterAbilityEvidence (first record per tag).
  for (const [id, facts] of Object.entries(game.abilities)) for (const f of facts) {
    assert.equal(accepts(id, f.tag), true, id + ' has ' + f.tag + ' evidence but is rejected');
  }
});

// ---- Regression: characters players could be wrongly denied before this audit ----
const MUST_QUALIFY = {
  // Roster-name mismatches against the CAMPAIGN_TAGS name list ("Iroh", "Squidward Tentacles",
  // "Palpatine", "Fire Mario") previously rejected these canonical users of the power.
  // Owner ruling 2026-11-09: Mandalorian wrist flamethrowers count for Inferno.
  fire: ['starwars:The Mandalorian', 'starwars:Boba Fett', 'starwars:Jango Fett', 'toons:Uncle Iroh', 'games:Mario', 'games:Scorpion', 'games:Liu Kang', 'games:Geralt of Rivia', 'pokemon:Charmander'],
  aquatic: ['toons:Squidward', 'toons:Katara', 'toons:Aang', 'starwars:Kit Fisto', 'starwars:Admiral Ackbar', 'starwars:Jar Jar Binks', 'pokemon:Dratini'],
  electric: ['starwars:Emperor Palpatine', 'starwars:Count Dooku', 'starwars:Rey', 'games:Chrono', 'games:Thrall', 'games:Kirby'],
  // Mind Games: every Force user with a documented telekinesis / mind-trick / telepathy scene.
  psychic: ['starwars:Luke Skywalker', 'starwars:Yoda', 'starwars:Obi-Wan Kenobi', 'starwars:Anakin Skywalker',
    'starwars:Mace Windu', 'starwars:Qui-Gon Jinn', 'starwars:Ahsoka Tano', 'starwars:Plo Koon', 'starwars:Kit Fisto',
    'starwars:Aayla Secura', 'starwars:Kanan Jarrus', 'starwars:Ezra Bridger', 'starwars:Cal Kestis', 'starwars:Rey',
    'starwars:Kylo Ren', 'starwars:Leia Organa', 'starwars:Darth Vader', 'starwars:Darth Maul', 'starwars:Count Dooku',
    'starwars:Asajj Ventress', 'starwars:Savage Opress', 'starwars:Grand Inquisitor', 'starwars:Reva',
    'starwars:Supreme Leader Snoke', 'mcu:Mantis', 'mcu:Heimdall', 'games:M. Bison', 'games:Sarah Kerrigan',
    'games:Zelda', 'pokemon:Butterfree', 'pokemon:Golduck', 'pokemon:Lapras'],
  // Owner ruling 2026-11-09: a documented glide counts for Skyborne.
  flight: ['toons:Buzz Lightyear', 'toons:Frozone', 'games:Knuckles', 'games:Steve', 'games:Fox McCloud', 'games:Kirby', 'games:Tails', 'games:Meta Knight', 'games:Princess Peach', 'games:Rayman',
    'mcu:Star-Lord', 'mcu:Valkyrie', 'mcu:Rocket', 'starwars:Kanan Jarrus', 'starwars:Watto', 'starwars:Leia Organa',
    'toons:Aang', 'toons:Hercules', 'toons:Elastigirl', 'muppets:Abby Cadabby', 'muppets:Grover', 'pokemon:Dragonair'],
  magic: ['games:Geralt of Rivia', 'games:Sora', 'games:Ganondorf', 'games:Link', 'games:Ciri', 'games:Illidan Stormrage',
    'muppets:Abby Cadabby', 'muppets:The Amazing Mumford', 'toons:Mickey Mouse'],
  ice: ['games:Mario', 'games:Samus Aran', 'games:Sora', 'games:Arthas Menethil', 'pokemon:Shellder', 'toons:Aang'],
  tech: ['mcu:Spider-Man', 'mcu:Obadiah Stane', 'starwars:C-3PO', 'starwars:BB-8', 'starwars:The Mandalorian', 'starwars:Tech',
    'games:Cortana', 'games:GLaDOS', 'games:Gordon Freeman', 'toons:Megatron', 'toons:Plankton', 'muppets:Dr. Bunsen Honeydew'],
  stealth: ['games:Sly Cooper', 'games:Agent 47', 'games:Big Boss', 'games:Arbiter', 'toons:Raphael', 'toons:Michelangelo',
    'pokemon:Ekans', 'pokemon:Mew'],
  teleport: ['games:Tracer', 'games:Chell', 'games:Ciri', 'games:Yennefer', 'games:Scorpion', 'games:Shadow the Hedgehog',
    'games:Ness', 'mcu:Heimdall', 'mcu:Captain Marvel', 'muppets:Abby Cadabby', 'pokemon:Slowpoke', 'pokemon:Mr. Mime'],
  healing: ['games:Aerith Gainsborough', 'games:Sora', 'games:Princess Peach', 'pokemon:Staryu', 'pokemon:Porygon', 'mcu:Iron Fist'],
  // Owner ruling 2026-11-09: about 8 ft or taller counts as giant.
  giants: ['muppets:Big Bird', 'mcu:Smart Hulk', 'mcu:Abomination', 'mcu:Hulk', 'pokemon:Gyarados', 'muppets:Pa Gorg', 'muppets:Ma Gorg', 'muppets:Animal', 'starwars:Rancor', 'mcu:Ego', 'mcu:Sandman', 'games:Mario'],
};
for (const [tag, ids] of Object.entries(MUST_QUALIFY)) {
  test('previously denied ' + tag + ' characters qualify with sourced, offline evidence', () => {
    for (const id of ids) {
      assert.equal(accepts(id, tag), true, id + ' wrongly rejected for ' + tag);
      assert.ok(game.tagIndex[get(id).pool][get(id).n].includes(tag), id + ' missing ' + tag + ' in the index');
    }
  });
}

// ---- Regression: false positives that must stay rejected ----
const MUST_NOT_QUALIFY = [
  ['games:Marth', 'fire', 'Fire Emblem is a franchise title, not fire powers'],
  ['muppets:Dr. Teeth', 'electric', 'Electric Mayhem is a band name'],
  ['starwars:Han Solo', 'psychic', 'not Force-sensitive'],
  ['starwars:Chirrut Îmwe', 'psychic', 'databank: belief in the Force, no Force abilities'],
  ['starwars:Wampa', 'ice', 'lives on an ice planet; no ice powers'],
  ['starwars:Asajj Ventress', 'electric', 'only shown being hit by Force lightning'],
  ['starwars:Savage Opress', 'magic', 'received Nightsister magick, never cast it'],
  ['starwars:Stormtrooper', 'tech', 'armor-only; awaiting a design ruling'],
  ['games:Lara Croft', 'aquatic', 'ordinary human swimming'],
  ['starwars:Finn', 'flight', 'owner ruling 2026-11-09: gunners do not count for Skyborne'],
  ['starwars:Chopper', 'flight', 'owner ruling 2026-11-09: gunners do not count for Skyborne'],
  ['games:Captain Falcon', 'flight', 'the Blue Falcon is a track-bound hover racer'],
  ['mcu:Ms. Marvel', 'giants', 'MCU Kamala only enlarges her fists'],
  ['mcu:Jessica Jones', 'flight', 'jumps; does not fly'],
  ['muppets:Crazy Harry', 'fire', 'uses explosives, does not command fire'],
  ['pokemon:Clefairy', 'healing', 'no Recover/Softboiled in its Generation I learnset'],
  ['pokemon:Slowbro', 'healing', 'owner ruling 2026-11-09: Rest is not healing'],
];
test('false positives stay rejected (titles, names, roles, being hit by a power)', () => {
  for (const [id, tag, why] of MUST_NOT_QUALIFY) assert.equal(accepts(id, tag), false, id + ' ' + tag + ': ' + why);
});

test('one power never leaks into another theme', () => {
  assert.equal(accepts('starwars:Luke Skywalker', 'electric'), false);
  assert.equal(accepts('games:Tracer', 'flight'), false);
  assert.equal(accepts('pokemon:Shellder', 'fire'), false);
  assert.equal(accepts('mcu:Mantis', 'teleport'), false);
});

test('vehicle, power-up, form and device dependence is recorded, not hidden', () => {
  const ev = (id, tag) => game.abilities[id].find(f => f.tag === tag);
  assert.match(ev('games:Fox McCloud', 'flight').kind, /pilot/);
  assert.match(ev('starwars:Kanan Jarrus', 'flight').kind, /pilot/);
  assert.match(ev('games:Mario', 'fire').limitation, /Fire Flower/);
  assert.match(ev('games:Jin Kazama', 'flight').limitation, /Devil/);
  assert.match(ev('games:Chell', 'teleport').limitation, /Portal|device/i);
  assert.match(ev('mcu:Thanos', 'teleport').limitation, /Space Stone|Gauntlet/);
});

test('disputed grants with verdict "incorrect" are excluded from the reviewed index', () => {
  const { characterAbilityTags } = require('../data/character-abilities.js');
  for (const d of game.disputes.filter(d => d.verdict === 'incorrect')) {
    const c = get(d.id);
    assert.equal(characterAbilityTags(c).includes(d.tag), false, d.id + ' should not list ' + d.tag);
  }
  assert.equal(characterAbilityTags({ pool: 'mcu', n: 'Not A Roster Character' }), null);
  assert.deepEqual(characterAbilityTags({ pool: 'nba', n: game.roster.find(c => c.pool === 'nba').n }), []);
});

test('owner ruling 2026-11-09: Ghost Protocol needs a stealth feat, not a role or title', () => {
  for (const id of ['mcu:Black Widow', 'mcu:Nebula', 'mcu:Yelena Belova', 'mcu:Elektra', 'games:Ezio Auditore', 'games:Raiden',
    'starwars:Cassian Andor', 'starwars:Fennec Shand', 'starwars:Asajj Ventress', 'toons:Leonardo']) {
    assert.ok(game.abilities[id]?.some(f => f.tag === 'stealth'), id + ' needs a sourced stealth feat');
    assert.ok(game.tagIndex[get(id).pool][get(id).n].includes('stealth'), id);
  }
  for (const id of ['mcu:Hawkeye', 'mcu:Gamora', 'mcu:Bullseye', 'games:Scorpion', 'games:Widowmaker', 'toons:Master Splinter']) {
    assert.equal(game.tagIndex[get(id).pool][get(id).n].includes('stealth'), false, id + ' is role-only');
  }
});

test('owner ruling 2026-11-09: advanced armor counts for Tech Titans, standard-issue armor does not', () => {
  for (const id of ['mcu:Iron Man', 'mcu:War Machine', 'starwars:Death Trooper', 'games:Doomguy', 'games:Reinhardt']) {
    assert.equal(accepts(id, 'tech'), true, id);
  }
  for (const id of ['starwars:Stormtrooper', 'starwars:Captain Phasma']) assert.equal(accepts(id, 'tech'), false, id);
});

test('owner ruling 2026-11-09: Giant Problems is about 8 ft or taller, with a documented size', () => {
  assert.equal(game.tagIndex.mcu['The Thing'].includes('giants'), false);
  assert.equal(game.tagIndex.games['Donkey Kong'].includes('giants'), false);
  for (const id of ['muppets:Sweetums', 'muppets:Mr. Snuffleupagus']) assert.equal(accepts(id, 'giants'), false, id + ' has no documented height yet');
});

test('owner rulings 2026-11-09 (voice): Pokémon learnable moves, Shepard, Tracer, Echo', () => {
  // Any move learnable in Gen I (level-up or TM/HM) counts; Rest does not.
  for (const [id, tag] of [['pokemon:Doduo', 'flight'], ['pokemon:Dodrio', 'flight'], ['pokemon:Snorlax', 'aquatic'],
    ['pokemon:Mew', 'healing'], ['pokemon:Starmie', 'healing'], ['pokemon:Gengar', 'psychic'], ['pokemon:Arcanine', 'teleport'],
    ['pokemon:Nidoking', 'ice'], ['pokemon:Gyarados', 'electric'], ['games:Commander Shepard', 'psychic'],
    ['games:Tracer', 'healing'], ['games:Tracer', 'teleport'], ['mcu:Echo', 'healing']]) {
    assert.equal(accepts(id, tag), true, id + ' ' + tag);
    assert.ok(game.tagIndex[get(id).pool][get(id).n].includes(tag), id + ' index ' + tag);
  }
  const move = game.abilities['pokemon:Dodrio'].find(f => f.tag === 'flight');
  assert.match(move.feat, /Fly/);
  assert.match(move.source, /pokemondb\.net\/pokedex\/dodrio\/moves\/1$/);
  // Vision: no Mind Games despite the Mind Stone. Still granted by the CAMPAIGN_TAGS name list until the
  // engine honors 'incorrect' disputes, so assert the reviewed index here.
  assert.equal(game.tagIndex.mcu.Vision.includes('psychic'), false);
  // Moves never leak into themes with no move mapping.
  assert.equal(accepts('pokemon:Dodrio', 'stealth'), false);
  assert.equal(accepts('pokemon:Dodrio', 'giants'), false);
});

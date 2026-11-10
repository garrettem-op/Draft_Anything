/* Regression tests for the complete character ability index and the audited evidence.
   Uses the real roster from index.html and every bundled evidence layer (descriptions,
   research guides, Pokémon types, curated records). No network, no paid AI. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { POWER_TAGS, POOL_IDS, LEGACY_POOL_IDS, loadGame, engineMatrix } = require('../tools/ability-audit-lib.cjs');
const { derivedIndex, provenanceRows } = require('../tools/ability-audit.cjs');
const { TAG_FAMILIES, BROAD_OF } = require('../tools/ability-tag-families.cjs');
const abilityApi = require('../data/character-abilities.js');

const game = loadGame();
const matrix = engineMatrix(game);
const byId = new Map(game.roster.map(c => [c.id, c]));
const get = id => { const c = byId.get(id); assert.ok(c, id + ' is not on the roster'); return c; };
const accepts = (id, tag) => game.allowed(get(id), tag);

test('index lists every roster character in every pool exactly once, and nobody else', () => {
  assert.equal(game.roster.filter(c => LEGACY_POOL_IDS.includes(c.pool)).length, 879);
  let listed = 0;
  for (const pool of POOL_IDS) {
    const names = Object.keys(game.tagIndex[pool] || {});
    listed += names.length;
    for (const n of names) assert.ok(byId.has(pool + ':' + n), 'Index lists unknown character ' + pool + ':' + n);
  }
  assert.equal(listed, game.roster.length);
  for (const c of game.roster) assert.ok(Array.isArray(game.tagIndex[c.pool][c.n]), c.id + ' missing from index');
});

test('index tags are broad power ids or specific family tags, and every broad tag is honored by Campaign validation', () => {
  for (const c of game.roster) for (const tag of game.tagIndex[c.pool][c.n]) {
    assert.ok(POWER_TAGS.includes(tag) || BROAD_OF[tag], c.id + ' has unknown tag ' + tag);
    if (POWER_TAGS.includes(tag)) assert.equal(game.allowed(c, tag), true, c.id + ' is indexed as ' + tag + ' but Campaign rejects it');
  }
});

test('index is in sync with evidence (rerun tools/ability-audit.cjs --write-index if this fails)', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(game.tagIndex)), derivedIndex(game));
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
    // A legacy description correction can invalidate an old name-list grant.
    // Never require a known-incorrect grant to remain live.
    if (game.engine !== 'legacy-names' && d.verdict === 'incorrect') {
      assert.equal(accepts(d.id, d.tag), false, 'Tag engine still grants disputed ' + d.id + ' ' + d.tag);
    }
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
    ['games:Tracer', 'healing'], ['games:Tracer', 'teleport'], ['mcu:Echo', 'healing'], ['pokemon:Magneton', 'flight']]) {
    assert.equal(accepts(id, tag), true, id + ' ' + tag);
    assert.ok(game.tagIndex[get(id).pool][get(id).n].includes(tag), id + ' index ' + tag);
  }
  const move = game.abilities['pokemon:Dodrio'].find(f => f.tag === 'flight');
  assert.match(move.feat, /Fly/);
  assert.match(move.source, /pokemondb\.net\/pokedex\/dodrio\/moves\/1$/);
  // Vision: no Mind Games despite the Mind Stone. The legacy engine still grants it through the
  // CAMPAIGN_TAGS name list, so assert the reviewed index (the tag engine reads only the index).
  assert.equal(game.tagIndex.mcu.Vision.includes('psychic'), false);
  // Moves never leak into themes with no move mapping.
  assert.equal(accepts('pokemon:Dodrio', 'stealth'), false);
  assert.equal(accepts('pokemon:Dodrio', 'giants'), false);
});

// ---- Contract with the tag-criteria engine (PR #44) ----
test('index emits only element-specific tags; no generic element tag can cross-qualify themes', () => {
  for (const c of game.roster) for (const tag of game.tagIndex[c.pool][c.n]) {
    assert.doesNotMatch(tag, /^element-/, c.id + ' has a generic element tag');
  }
  if (game.engine !== 'tag-criteria') return;
  const accepted = Object.fromEntries(game.themeRules.map(r => [r, game.ctx.campaignCriteria(r).acceptedTags]));
  for (const rule of game.themeRules) {
    assert.ok(accepted[rule].includes(rule), rule + ' must accept its own broad tag');
    for (const other of POWER_TAGS) if (other !== rule) {
      assert.equal(accepted[rule].includes(other), false, rule + ' must not accept the ' + other + ' tag');
    }
  }
  for (const el of ['fire', 'ice', 'electric']) for (const other of ['fire', 'ice', 'electric']) if (other !== el) {
    assert.equal(accepted[el].some(t => t.startsWith(other + '-')), false, el + ' accepts a ' + other + ' sub-tag');
    assert.equal(accepted[el].some(t => t.startsWith('element-')), false, el + ' accepts a generic element sub-tag');
  }
});

test('tag-criteria engine grants exactly the reviewed index: no names, keywords or descriptions', () => {
  if (game.engine !== 'tag-criteria') return;
  for (const c of game.roster) for (const rule of game.themeRules) {
    assert.equal(game.allowed(c, rule), game.tagIndex[c.pool][c.n].includes(rule), c.id + ' ' + rule);
  }
});

test('Giant Problems size-change must reach giant size; shrinking alone does not count', () => {
  for (const id of ['mcu:Ant-Man', 'mcu:Bill Foster', 'dc:Giganta', 'lotr:Beorn']) assert.equal(accepts(id, 'giants'), true, id);
  for (const id of ['mcu:The Wasp', 'mcu:Janet van Dyne', 'mcu:Hank Pym', 'dc:The Atom (Ray Palmer)']) {
    assert.equal(accepts(id, 'giants'), false, id + ' only shrinks');
  }
});

test('Skyborne: pilots and aerial mounts count, ground riders and passengers do not', () => {
  for (const id of ['starwars:Poe Dameron', 'mcu:The Thing', 'harrypotter:Madam Hooch', 'harrypotter:Buckbeak']) {
    assert.equal(accepts(id, 'flight'), true, id);
  }
  for (const id of ['lotr:Éomer', 'lotr:Théoden', 'lotr:Gandalf']) assert.equal(accepts(id, 'flight'), false, id);
});

// ==== PR #45 review round 2 (2026-11): specific tags, provenance, disputes, new pools ====

// The accepted-tag lists PR #44 defines for each themed challenge (copied from its CAMPAIGN_EXTRA criteria).
const PR44_ACCEPTED = {
  flight: ['flight', 'natural-flight', 'powered-flight', 'glide', 'pilot', 'mount'],
  magic: ['magic', 'spellcaster', 'magic-item'],
  psychic: ['psychic', 'telepathy', 'telekinesis', 'mind-control'],
  aquatic: ['aquatic', 'water-breathing', 'swimmer', 'water-control'],
  fire: ['fire', 'fire-control', 'fire-weapon'],
  ice: ['ice', 'ice-control', 'ice-weapon'],
  electric: ['electric', 'electric-control', 'electric-weapon'],
  tech: ['tech', 'powered-armor', 'robot-or-ai', 'cyborg', 'gadgets', 'inventor'],
  stealth: ['stealth', 'invisibility', 'infiltration'],
  teleport: ['teleport', 'self-teleport', 'portals', 'teleports-others'],
  healing: ['healing', 'self-regeneration', 'heals-others'],
  giants: ['giants', 'giant-sized', 'size-change'],
};
const tagsOf = id => game.tagIndex[get(id).pool][get(id).n];
const qualifiesUnderPR44 = (id, rule) => PR44_ACCEPTED[rule].some(t => tagsOf(id).includes(t));

test('specific tags: our families match PR #44 accepted tags exactly', () => {
  for (const rule of POWER_TAGS) assert.deepEqual([rule, ...TAG_FAMILIES[rule]].sort(), PR44_ACCEPTED[rule].slice().sort(), rule);
  if (game.engine === 'tag-criteria') {
    for (const rule of POWER_TAGS) assert.deepEqual(Array.from(game.ctx.campaignCriteria(rule).acceptedTags).sort(), PR44_ACCEPTED[rule].slice().sort(), rule); // host-realm copy
  }
});

test('specific tags: every broad tag carries a specific tag from its own family, and every specific implies its broad', () => {
  for (const c of game.roster) {
    const tags = game.tagIndex[c.pool][c.n];
    assert.equal(new Set(tags).size, tags.length, c.id + ' duplicate tags');
    for (const broad of POWER_TAGS.filter(t => tags.includes(t))) {
      assert.ok(TAG_FAMILIES[broad].some(t => tags.includes(t)), c.id + ' has ' + broad + ' without a specific tag');
    }
    for (const t of tags.filter(t => BROAD_OF[t])) assert.ok(tags.includes(BROAD_OF[t]), c.id + ' has ' + t + ' without ' + BROAD_OF[t]);
  }
});

test('specific tags: elements and other families never cross-qualify', () => {
  for (const c of game.roster) for (const t of game.tagIndex[c.pool][c.n]) {
    for (const rule of POWER_TAGS) if (PR44_ACCEPTED[rule].includes(t)) {
      assert.ok(t === rule || TAG_FAMILIES[rule].includes(t), c.id + ' tag ' + t + ' leaks into ' + rule);
    }
  }
  assert.equal(qualifiesUnderPR44('dc:Superman', 'fire'), false, 'freeze breath must not prove fire');
  assert.equal(qualifiesUnderPR44('dc:Mr. Freeze', 'electric'), false);
});

test('specific tags: representative classifications', () => {
  const expect = [
    ['dc:Superman', ['natural-flight', 'ice-control', 'self-regeneration']], ['dc:Mr. Freeze', ['ice-weapon', 'powered-armor']],
    ['mcu:Iron Man', ['powered-flight', 'powered-armor']], ['starwars:Boba Fett', ['powered-flight', 'fire-weapon']],
    ['starwars:Poe Dameron', ['pilot']], ['lotr:Witch-king of Angmar', ['mount', 'spellcaster', 'invisibility']],
    ['harrypotter:Rubeus Hagrid', ['pilot', 'giant-sized']], ['harrypotter:Madam Hooch', ['powered-flight']],
    ['harrypotter:Albus Dumbledore', ['fire-control', 'invisibility', 'teleports-others']], ['lotr:Beorn', ['size-change']],
    ['mcu:Ant-Man', ['size-change']], ['lotr:Treebeard', ['giant-sized']], ['toons:Katara', ['water-control', 'heals-others']],
    ['pokemon:Lapras', ['telepathy']], ['starwars:Darth Vader', ['telekinesis', 'cyborg', 'pilot']],
  ];
  for (const [id, tags] of expect) for (const t of tags) assert.ok(tagsOf(id).includes(t), id + ' should have ' + t);
});

test('provenance: every granted tag is backed by evidence or a reviewed carry-over; new pools are fully evidenced', () => {
  const rows = provenanceRows(game, game.tagIndex);
  for (const c of game.roster) for (const t of game.tagIndex[c.pool][c.n]) {
    const p = abilityApi.characterAbilityProvenance(c, t);
    assert.ok(p && ['evidence', 'carry-over'].includes(p.basis), c.id + ' ' + t + ' has no provenance');
  }
  const newPoolRows = rows.filter(r => ['dc', 'lotr', 'harrypotter'].includes(r.pool));
  assert.ok(newPoolRows.length >= 300);
  assert.deepEqual(newPoolRows.filter(r => !r.basis.startsWith('evidence')), [], 'new-pool grants without a source-linked record');
  assert.equal(abilityApi.characterAbilityProvenance(get('mcu:Vision'), 'psychic'), null);
});

test('provenance: carry-over records are explicit, reviewed and limited to the original seven pools', () => {
  const origins = new Set(['name-list', 'research-guide', 'roster-description', 'pokemon-type', 'curated-aerial']);
  const seen = new Set();
  for (const x of game.carryover) {
    assert.ok(byId.has(x.id), x.id);
    assert.ok(LEGACY_POOL_IDS.includes(x.id.split(':')[0]), x.id + ' carry-over outside the original pools');
    assert.ok(origins.has(x.origin), x.id + ' origin ' + x.origin);
    assert.ok(x.basis?.length >= 4, x.id + ' needs a basis');
    assert.ok(x.tags.length && x.tags.every(t => TAG_FAMILIES[x.tag].includes(t)), x.id + ' bad specific tags');
    assert.ok(!(game.abilities[x.id] || []).some(f => f.tag === x.tag), x.id + ' ' + x.tag + ' already has evidence');
    assert.ok(!seen.has(x.id + '|' + x.tag), 'duplicate carry-over ' + x.id); seen.add(x.id + '|' + x.tag);
  }
});

test('index generation never consults name lists, descriptions, keywords or the Campaign engine', () => {
  const blind = { ...game, roster: game.roster.map(c => ({ ...c, t: '' })),
    allowed() { throw new Error('derivedIndex must not call the Campaign engine'); },
    layer() { throw new Error('derivedIndex must not run evidence-layer matching'); } };
  assert.deepEqual(derivedIndex(blind), JSON.parse(JSON.stringify(game.tagIndex)));
});

test('every incorrect dispute is rejected under the PR #44 tag criteria (Vision psychic included)', () => {
  const incorrect = game.disputes.filter(d => d.verdict === 'incorrect');
  assert.ok(incorrect.length >= 32);
  for (const d of incorrect) {
    assert.equal(qualifiesUnderPR44(d.id, d.tag), false, d.id + ' still qualifies for ' + d.tag + ' via the reviewed tags');
    assert.equal(abilityApi.characterAbilityProvenance(get(d.id), d.tag), null, d.id + ' ' + d.tag + ' still has provenance');
    if (game.engine === 'tag-criteria') assert.equal(accepts(d.id, d.tag), false, d.id + ' ' + d.tag + ' accepted by the engine');
  }
  for (const [id, tag] of [['mcu:Vision', 'psychic'], ['lotr:Éowyn', 'magic'], ['pokemon:Snorlax', 'giants'], ['mcu:The Thing', 'giants'],
    ['toons:Popeye', 'healing'], ['mcu:Hawkeye', 'stealth'], ['dc:Harley Quinn', 'stealth'], ['dc:Doctor Manhattan', 'magic'],
    ['lotr:Galadriel', 'healing'], ['lotr:Tulkas', 'magic'], ['harrypotter:Norbert (Norberta)', 'flight']]) {
    assert.ok(incorrect.some(d => d.id === id && d.tag === tag), id + ' ' + tag + ' must be a recorded incorrect dispute');
  }
  // Vision keeps his documented flight and synthezoid tags.
  assert.ok(qualifiesUnderPR44('mcu:Vision', 'flight') && qualifiesUnderPR44('mcu:Vision', 'tech'));
});

test('new pools: owner rulings and corrected seeds', () => {
  const yes = [['lotr:Witch-king of Angmar', 'flight'], ['lotr:Khamûl the Easterling', 'flight'], ['harrypotter:Madam Hooch', 'flight'],
    ['harrypotter:Rubeus Hagrid', 'flight'], ['harrypotter:Rubeus Hagrid', 'giants'], ['dc:Superman', 'ice'], ['dc:Beast Boy', 'giants'],
    ['dc:Batman', 'stealth'], ['lotr:Gollum (Sméagol)', 'aquatic'], ['harrypotter:Peter Pettigrew', 'stealth'], ['dc:Giganta', 'giants']];
  const no = [['lotr:Gandalf', 'flight'], ['lotr:Éomer', 'flight'], ['dc:Firestorm', 'tech'], ['dc:Amanda Waller', 'tech'],
    ['dc:Deadshot', 'stealth'], ['dc:Nightwing', 'stealth'], ['lotr:Durin\'s Bane', 'giants'], ['harrypotter:Hermione Granger', 'flight'],
    ['harrypotter:Jacob Kowalski', 'magic'], ['harrypotter:Argus Filch', 'magic'], ['dc:The Atom (Ray Palmer)', 'giants']];
  for (const [id, r] of yes) assert.equal(qualifiesUnderPR44(id, r), true, id + ' ' + r);
  for (const [id, r] of no) assert.equal(qualifiesUnderPR44(id, r), false, id + ' ' + r);
  for (const q of game.research.filter(q => ['dc', 'lotr', 'harrypotter'].includes(q.id.split(':')[0]))) {
    assert.equal(qualifiesUnderPR44(q.id, q.tag), false, q.id + ' ' + q.tag + ' is queued, not granted');
  }
});

test('Pokémon rules: Gen I Fly earns flight, Surf earns aquatic, Rest is never healing', () => {
  let fly = 0, surf = 0;
  for (const c of game.roster.filter(c => c.pool === 'pokemon')) {
    for (const f of game.abilities[c.id] || []) {
      if (f.tag === 'flight' && /\bFly\b/.test(f.feat)) { fly++; assert.ok(qualifiesUnderPR44(c.id, 'flight'), c.id); }
      if (f.tag === 'aquatic' && /\bSurf\b/.test(f.feat)) { surf++; assert.ok(qualifiesUnderPR44(c.id, 'aquatic'), c.id); }
      if (f.tag === 'healing') assert.doesNotMatch(f.feat, /\bRest\b(?!ore)/, c.id + ' healing must not rest on Rest');
    }
  }
  assert.ok(fly >= 2 && surf >= 5, 'expected Fly and Surf learnset records');
  for (const id of ['pokemon:Doduo', 'pokemon:Dodrio']) assert.ok(tagsOf(id).includes('natural-flight'), id);
  assert.ok(tagsOf('pokemon:Snorlax').includes('swimmer'), 'Snorlax learns Surf');
  assert.equal(qualifiesUnderPR44('pokemon:Slowbro', 'healing'), false);
});


test('saved player appeals cannot override explicitly incorrect audited tags', () => {
  if (game.engine !== 'tag-criteria') return;
  const original = game.ctx.KnowledgeEngine;
  game.ctx.KnowledgeEngine = { has: (c, rule) =>
    (c.pool === 'mcu' && c.n === 'Vision' && rule === 'psychic') ||
    (c.pool === 'pokemon' && c.n === 'Snorlax' && rule === 'giants') ||
    (c.pool === 'harrypotter' && c.n === 'Obscurus' && rule === 'magic') };
  try {
    assert.equal(accepts('mcu:Vision', 'psychic'), false, 'previous appeal cannot restore Vision psychic');
    assert.equal(accepts('pokemon:Snorlax', 'giants'), false, 'previous appeal cannot restore Snorlax giant');
    // A researched-but-unresolved power remains eligible for a future approved appeal.
    assert.equal(accepts('harrypotter:Obscurus', 'magic'), true,
      'non-disputed player approval remains usable');
  } finally { game.ctx.KnowledgeEngine = original; }
});

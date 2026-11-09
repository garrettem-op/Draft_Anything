/* Specific ability tags (agreed with the Campaign engine owner, PR #44) and how evidence
   records map onto them. Every broad tag in the reviewed index is accompanied by at least
   one specific tag from its own family, and every specific tag implies its broad parent,
   so broad-tag challenges keep working while new challenges can target specific tags.
   Records may set `tags` explicitly; otherwise classifySpecific() derives them from the
   record's kind and feat text, with SPECIFIC_OVERRIDES for reviewed exceptions. */
const { CHARACTER_ABILITY_TAG_FAMILIES: TAG_FAMILIES } = require('../data/character-abilities.js');
const BROAD_OF = Object.freeze(Object.fromEntries(
  Object.entries(TAG_FAMILIES).flatMap(([broad, list]) => list.map(t => [t, broad]))));

// Reviewed exceptions where kind/feat wording would mislead the rules below.
const SPECIFIC_OVERRIDES = Object.freeze({
  'games:Mario|fire': ['fire-control'], 'games:Mario|ice': ['ice-control'], 'games:Mario|giants': ['size-change'],
  'mcu:Ant-Man|giants': ['size-change'], 'mcu:Bill Foster|giants': ['size-change'],
  'mcu:Hulk|giants': ['giant-sized'], 'mcu:Smart Hulk|giants': ['giant-sized'],
  'mcu:Ego|giants': ['giant-sized', 'size-change'], 'mcu:Sandman|giants': ['size-change'],
  'mcu:Galactus|giants': ['giant-sized'],
  'pokemon:Ditto|giants': ['size-change'],
  'starwars:The Mandalorian|fire': ['fire-weapon'], 'starwars:Boba Fett|fire': ['fire-weapon'], 'starwars:Jango Fett|fire': ['fire-weapon'],
  'mcu:Thanos|teleport': ['portals'], 'mcu:Heimdall|teleport': ['teleports-others', 'portals'],
  'mcu:Captain Marvel|teleport': ['self-teleport'],
  'games:Tracer|teleport': ['self-teleport'], 'games:Tracer|healing': ['self-regeneration'],
  'games:Chell|teleport': ['portals'], 'toons:Rick Sanchez|teleport': ['portals'],
  'mcu:Echo|healing': ['heals-others'], 'mcu:Groot|healing': ['self-regeneration'],
  'mcu:Franklin Richards|healing': ['heals-others'],
  // Reviewed 2026-11 classifier pass.
  'games:Aerith Gainsborough|healing': ['heals-others'], 'games:Arthas Menethil|healing': ['heals-others'],
  'games:Ness|healing': ['heals-others', 'self-regeneration'], 'games:Princess Peach|healing': ['heals-others'],
  'pokemon:Mew|healing': ['self-regeneration', 'heals-others'], 'pokemon:Chansey|healing': ['self-regeneration', 'heals-others'],
  'games:Sarah Kerrigan|stealth': ['invisibility'], 'games:Ganondorf|teleport': ['self-teleport'],
  'toons:Aang|giants': ['size-change'], 'games:Tails|flight': ['natural-flight'],
  'pokemon:Lapras|psychic': ['telepathy'], 'pokemon:Ninetales|psychic': ['mind-control'],
  'games:Geralt of Rivia|psychic': ['mind-control'], 'mcu:Invisible Woman|psychic': ['telekinesis'],
  'mcu:Mantis|psychic': ['telepathy', 'mind-control'],
  'toons:Plankton|tech': ['inventor', 'gadgets'], 'toons:Sandy Cheeks|tech': ['inventor', 'gadgets'],
  'mcu:Spider-Man|tech': ['powered-armor', 'gadgets'], 'games:Dr. Eggman|tech': ['inventor', 'gadgets'],
  'games:Dr. Light|tech': ['inventor'], 'pokemon:Porygon|tech': ['robot-or-ai'],
  'starwars:Battle Droid|tech': ['robot-or-ai'], 'starwars:IG-11|tech': ['robot-or-ai'],
  'toons:Megatron|tech': ['robot-or-ai'], 'starwars:Chopper|tech': ['robot-or-ai'],
  'games:Commander Shepard|tech': ['cyborg'], 'starwars:Darth Maul|tech': ['cyborg'], 'mcu:Nebula|tech': ['cyborg'],
  'mcu:Phastos|tech': ['inventor'], 'mcu:Killmonger|tech': ['powered-armor'], 'starwars:Sabine Wren|tech': ['gadgets'],
});

const has = (s, re) => re.test(s || '');
function classifySpecific(id, rec) {
  if (Array.isArray(rec.tags) && rec.tags.length) return rec.tags.slice();
  const o = SPECIFIC_OVERRIDES[id + '|' + rec.tag];
  if (o) return o.slice();
  const kind = (rec.kind || '').toLowerCase(), text = kind + ' ' + (rec.feat || '') + ' ' + (rec.limitation || '');
  const pokemon = id.startsWith('pokemon:');
  const out = new Set();
  switch (rec.tag) {
    case 'flight':
      if (has(kind, /pilot/) || (!has(kind, /self-flight|glide|hover|levitat|natural|mount/) && has(text, /\b(pilot|starfighter|x-wing|tie fighter|cockpit|spaceship|aircraft|plane|ship|flying ace|doghouse|arwing|millennium falcon|motorbike)\b/i))) out.add('pilot');
      if (has(kind, /mount/)) out.add('mount');
      if (has(kind, /glide/)) out.add('glide');
      if (has(kind, /device|jet|rocket|suit|armor|boots/) || has(text, /\b(jetpack|jet ?pack|jet boots|rocket boots|repulsor|armor|suit|glider|broom|cloak of levitation|mjolnir|stormbreaker|hammer|wing ?suit|propeller|helicopter|hover ?board|device)\b/i) && !out.size) out.add('powered-flight');
      if (!out.size) out.add('natural-flight');
      break;
    case 'magic':
      if (has(text, /\b(hook|staff|wand|amulet|lasso|cloak|ring|helm|orb|stone|sword|keyblade|book|grimoire|item)\b/i) && !has(text, /\b(spell|cast|sorcer|incantation|curse|hex|conjur)/i)) out.add('magic-item');
      else out.add('spellcaster');
      break;
    case 'psychic':
      if (has(text, /telepath|mind[- ]?(read|link|probe|speech)|reads? (the )?(minds?|thoughts)|psychic link|clairvoy|thoughts/i)) out.add('telepathy');
      if (has(text, /telekin|lifts?|levitat|force (push|pull|choke)|choke|hurls?|moves objects|throws|psychokinesis|confusion|psybeam|\bpsychic\b(?! type)/i)) out.add('telekinesis');
      if (has(text, /mind[- ]?(trick|control|manipulation|wipe)|hypno|control(s|led)? (his|her|their|the) (mind|will)|domina|sleep induction|possess|control over/i)) out.add('mind-control');
      if (!out.size) out.add(pokemon ? 'telekinesis' : 'telepathy');
      break;
    case 'aquatic':
      if (has(text, /water[- ]?bend|hydrokin|controls? (water|the sea|tides)|water control|surf on|summons? (a )?wave/i) && !pokemon) out.add('water-control');
      if (has(text, /breath(e|es|ing) (under ?water|in water)|gills|amphibi|water[- ]breath|underwater breathing|lives in the sea|gungan|mon calamari|nautolan|bubble/i)) out.add('water-breathing');
      if (has(text, /swim|surf|dives?|underwater|diving|water type|water-type|ocean|sea|river/i) || pokemon || !out.size) out.add('swimmer');
      break;
    case 'fire': case 'ice': case 'electric': {
      const weapon = has(kind, /weapon|gun|flamethrower|cannon/) || has(text, /\b(flamethrower|flame ?thrower|freeze ray|cold gun|ice gun|freeze gun|blaster|gun|cannon|taser|stun baton|electro-?staff|arc reactor gauntlet|whip|gauntlets?|weapon)\b/i) && !has(text, /\bbreath|breathes|bending|generat|summon|conjur|tm|level-up|move\b/i);
      out.add(rec.tag + (weapon ? '-weapon' : '-control'));
      break;
    }
    case 'tech':
      if (has(text, /\b(droid|robot|android|\bai\b|artificial intelligence|synthezoid|computer program|hologram|cortana|glados|program|machine body|transformer|cybertronian|autobot|decepticon)\b|\bAI\b|artificial-being/i)) out.add('robot-or-ai');
      if (has(text, /cyborg|prosthetic|cybernetic|bionic|mechanical (arm|limb|body)|implant/i)) out.add('cyborg');
      if (has(text, /\b(armor|armour|power suit|powered suit|exosuit|mech|iron man suit|varia|spartan|mjolnir armor|nanotech suit|suit)\b/i)) out.add('powered-armor');
      if (has(text, /invent|built|builds|designed|engineer|scientist|genius|tinker|mechanic/i)) out.add('inventor');
      if (has(text, /gadget|device|drone|arrow|grappl|utility|jetpack|tool|launcher|web-shooter|shooter|gun|blaster|hack|portal gun|scanner|watch/i) || !out.size) out.add('gadgets');
      break;
    case 'stealth':
      if (has(text, /invisib|vanish|cloak(ed|ing)? (device|field)|cloaking|camouflage|disappear/i)) out.add('invisibility');
      if (!out.size || has(text, /infiltrat|sneak|undetected|unseen|covert|disguise|stealth|undercover|evad|shadow|silent/i)) out.add('infiltration');
      break;
    case 'teleport':
      if (has(text, /portal|bifrost|sling ring|boom tube|gate|wormhole|tesseract|space stone/i)) out.add('portals');
      if (has(text, /teleports? (others|allies|him and|them|the team|people)|carries|takes (others|them|him|her)|side-along|with (him|her|them)|transports? (others|allies|the party)|bring(s)? (others|allies)/i)) out.add('teleports-others');
      if (!out.size || has(text, /blink|teleports? (him|her|it)self|self-teleport|shadow-walk|vanish|appears|instantly|teleport move|tm\d|level-up/i)) out.add('self-teleport');
      break;
    case 'healing':
      if (has(kind, /heals?[- ]others|medical/) || has(text, /heal(s|ed|ing)? (others|allies|teammates|the party|people|a |an |his |her |their |luke|anakin|wounded)|revive|resurrect(s|ed)? (others|someone|her|him)|softboiled|wish|aromatherapy|heal pulse|cure|medic|first aid|restores (others|allies)/i)) out.add('heals-others');
      if (has(kind, /regenerat|self/) || has(text, /regenerat|self-heal|heals? (itself|himself|herself|rapidly|quickly)|recover\b|recovers|healing factor|regrow|recall|restores (its|his|her) own/i) || !out.size) out.add('self-regeneration');
      break;
    case 'giants':
      if (has(text, /grow(s|ing)?\b|enlarg|size-?change|transforms? into|becomes? (a )?(giant|huge|enormous)|giant[- ]?size(d)? form|gigantamax|pym particle|mega mushroom|expand/i)) out.add('size-change');
      if (!out.size || has(text, /\b(\d+(\.\d+)?\s*(ft|feet|foot|m|meters|metres)|tall|height|planet|already giant|towering|enormous|huge)\b/i)) out.add('giant-sized');
      break;
  }
  return [...out];
}
module.exports = { TAG_FAMILIES, BROAD_OF, SPECIFIC_OVERRIDES, classifySpecific };

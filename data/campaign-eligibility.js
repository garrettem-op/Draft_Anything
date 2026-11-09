/* Free offline Campaign eligibility evidence.
   Descriptions are already part of the built-in character roster, so an explicitly
   stated ability must not be rejected merely because a hand-curated list missed it.
   This is a conservative rule-aware fallback, not arbitrary natural-language AI.
   NO fetch, network call, OpenAI request, storage mutation, or attribute inference.
   Only positive evidence counts: absence is NOT proof that a character lacks a power.
*/
const CAMPAIGN_DESCRIPTION_PATTERNS = Object.freeze({
  // Skyborne explicitly permits known pilots and aerial combatants as well as
  // natural/powered flyers. "Winged" and "pilot" do not imply unaided self-flight.
  flight:/\b(?:flies|fly|flying|flight|aerial|airborne|winged|soar(?:s|ing)?|hover(?:s|ing)?|levitat(?:es?|ing)|jetpack|starfighter|(?:co-)?pilot)\b/i,
  magic:/\b(?:magic|sorcerer|sorceress|sorcery|wizard|witch|spellcast(?:er|ing)|mystic arts|enchantress)\b/i,
  psychic:/\b(?:psychic|telepath(?:ic)?|telekinetic|psionic|mind[- ]controller|mind[- ]reader|mind[- ]reading)\b/i,
  aquatic:/\b(?:underwater|aquatic|oceanic|swimm(?:er|ing)|water[- ]bending|water[- ]breathing|(?:sea|water)[- ](?:serpent|dragon|terror|seal|creature|fortress))\b/i,
  fire:/\b(?:fire[- ](?:breathing|breather|bending|wielding|pup|puppy)|flame|flames|flame[- ]\w+|tail[- ]flame|lava[- ]spitting|pyrokinetic|inferno)\b/i,
  ice:/\b(?:ice[- ](?:queen|skating|dancer|magic|bending|wielding|blast|control)|frost(?:y|bite|bound)?|freez(?:e|ing)|blizzard)\b/i,
  electric:/\b(?:lightning|electri(?:c|city)(?:[- ](?:whip|mouse|eel|powers?|attacks?|type))?|(?:god of |living |legendary )?thunder(?:[- ](?:god|bird))?|volt(?:age|s)?)\b/i,
  tech:/\b(?:armor|armored|armour|robot(?:ic)?|android|cyborg|mech(?:anical)?|gadget|engineer|tech[- ]genius|tech genius|inventor (?:and industrialist|in armor)|eternal inventor)\b/i,
  stealth:/\b(?:stealth|invisib(?:le|ility)|spy|spies|ninja|infiltrat(?:e|ion|or)|assassin|covert)\b/i,
  teleport:/\b(?:teleport(?:ation|ing|s)?|portal[- ](?:travel|jump)|warping|warp[- ]travel)\b/i,
  healing:/\b(?:heals?|healer|healing|regenerat(?:e|es|ion|ing)|self[- ]repair)\b/i,
  giants:/\b(?:grows? giant|grows? enormous|giant (?:who|monster|rock|creature|serpent|robot|warrior)|huge (?:blue )?monster|enormous (?:creature|monster|dragon)|size[- ]shifting)\b/i
});
// Exclude accidental matches and role/profession terms that do not prove powers.
// Such ambiguous claims require specific curated evidence instead of guesses.
const CAMPAIGN_DESCRIPTION_EXCEPTIONS = Object.freeze({
  flight:/\b(?:flightless|cannot fly|can't fly|unable to fly|non[- ]flying)\b/i,
  electric:/\b(?:electric mayhem|shock trooper)\b/i,
  tech:/\b(?:game inventor|workshop inventor)\b/i,
  aquatic:/\b(?:boomerang fish|fish launcher)\b/i,
  fire:/\b(?:fire emblem|firefighter)\b/i,
  ice:/\b(?:ice beast|snow[- ]white|ice hockey)\b/i,
  stealth:/\b(?:nurse[- ]droid assassin)\b/i,
  giants:/\b(?:giant[- ]petaled|giant petals)\b/i
});
// Character-specific, directly documented exceptions where the one-line
// description is too short to mention the real ability. Roster-scoped by pool.
const CAMPAIGN_OFFLINE_AERIAL = Object.freeze({
  // The original Kanto roster has many well-known flying or hovering Pokémon
  // whose short character blurbs say nothing about their airborne behavior.
  pokemon:new Set([
    'Butterfree','Beedrill','Pidgey','Pidgeotto','Pidgeot','Spearow',
    'Fearow','Zubat','Golbat','Venomoth',"Farfetch'd",'Scyther',
    'Aerodactyl','Articuno','Zapdos','Moltres','Dragonite',
    'Gastly','Haunter','Gengar','Magnemite','Magneton','Koffing',
    'Weezing','Mew','Mewtwo'
  ]),
  // Canonical vehicle-based aerial combat is valid; no self-flight implied.
  starwars:new Set([
    'Luke Skywalker','Darth Vader','Obi-Wan Kenobi','Anakin Skywalker',
    'Han Solo','Chewbacca','Lando Calrissian','Wedge Antilles',
    'Nien Nunb','Plo Koon','Hera Syndulla','Poe Dameron',
    'Rey','Kylo Ren','Ahsoka Tano','The Mandalorian',
    'Boba Fett','Jango Fett','Bo-Katan Kryze','R2-D2'
  ])
});
const CAMPAIGN_OFFLINE_AERIAL_SOURCES = Object.freeze({
  pokemon:'https://www.pokemon.com/pokedex/',
  starwars:'https://www.starwars.com/databank'
});
function campaignDescriptionEvidence(candidate,rule){
  if(!candidate||!candidate.pool||!candidate.n||typeof candidate.t!=='string')return null;
  const desc=candidate.t.trim();
  if(!desc)return null;
  const test=CAMPAIGN_DESCRIPTION_PATTERNS[rule];
  if(!test||!test.test(desc)||(CAMPAIGN_DESCRIPTION_EXCEPTIONS[rule]?.test(desc)))return null;
  return {tag:rule,kind:'explicit-roster-description',feat:desc,
    source:'built-in-character-description',pool:candidate.pool,name:candidate.n};
}
function campaignOfflineEvidence(candidate,rule){
  if(!candidate||!candidate.pool||!candidate.n)return null;
  const described=campaignDescriptionEvidence(candidate,rule);
  if(described)return described;
  if(rule==='flight'&&CAMPAIGN_OFFLINE_AERIAL[candidate.pool]?.has(candidate.n)){
    return {tag:'flight',kind:'curated-flight-or-air-combat',pool:candidate.pool,name:candidate.n,
      feat:'Known flight, hovering, or aircraft/spacecraft piloting relevant to Skyborne. Vehicle use does not imply unaided flight.',
      source:CAMPAIGN_OFFLINE_AERIAL_SOURCES[candidate.pool]};
  }
  return null;
}
if(typeof module!=='undefined'&&module.exports)module.exports={
  CAMPAIGN_DESCRIPTION_PATTERNS,CAMPAIGN_DESCRIPTION_EXCEPTIONS,
  CAMPAIGN_OFFLINE_AERIAL,campaignDescriptionEvidence,campaignOfflineEvidence
};

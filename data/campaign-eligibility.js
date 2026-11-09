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
  tech:/\b(?:powered[- ]armor|powered[- ]suit|rescue[- ]armor|custom[- ]armor|armored[- ](?:inventor|engineer|sorcerer)|robot(?:ic)?|android|cyborg|mech(?:anical)?|gadget|engineer|tech[- ]genius|tech genius|inventor (?:and industrialist|in armor)|eternal inventor)\b/i,
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
  psychic:/\b(?:telekinetic[- ]style|psychic[- ]type)\b/i,
  giants:/\b(?:giant[- ]petaled|giant petals)\b/i
});
// Character-specific, directly documented exceptions where the one-line
// description is too short to mention the real ability. Roster-scoped by pool.
/* The research guide is already shipped with the game. Consult its powers/feats
   on the same local device, with no network request, only for positive claims.
   Only the dedicated Powers field can qualify a character (never opponent feats).
   Exclude speculative, negated, alternate-form or 'similar to' statements;
   a profile describing what someone *cannot* do is never supporting evidence. */
const CAMPAIGN_PROFILE_PATTERNS = Object.freeze({
  flight:/\b(?:flies|flying|flight|fly|aerial|airborne|hover(?:s|ing)?|levitat(?:e|ion)|glider flight|wingsuit|winged[- ]ankle|pilots? (?:a |an )?(?:ship|fighter|starfighter|spacecraft))\b/i,
  magic:/\b(?:magic|sorcer(?:er|ess|y)|wizard|witch|spell(?:s|cast(?:ing|er)?)?|mystic arts|portal sorcery|enchant(?:ment|ress)?)\b/i,
  psychic:/\b(?:telepathy|telepathic|telekinesis|telekinetic|psychic|psionic|mind[- ]control|mind[- ]reading|mind manipulation)\b/i,
  aquatic:/\b(?:underwater|aquatic|water[- ]breathing|water[- ]bending|lives? in (?:the )?(?:sea|ocean)|swim(?:ming)? through water)\b/i,
  fire:/\b(?:fire(?:[- ]bending|[- ]breath|[- ]blast|[- ]control)?|flames?|plasma flame|pyrokinesis|combustion|inferno)\b/i,
  ice:/\b(?:ice(?:[- ]bending|[- ]control|[- ]blast)?|freez(?:e|es|ing)|freezing|frost|cryokinesis|snow and ice)\b/i,
  electric:/\b(?:lightning|electri(?:c|city|cal)|thunder(?:bolt)?|electrokinesis)\b/i,
  tech:/\b(?:powered[- ]armor|advanced (?:technology|tech|armor)|nanotechnology|tech(?:nology)?[- ](?:targeting|weapons|armor)|robot(?:ic)?|android|cyborg|mecha|drones?|gadget(?:s)?|repulsors?|nanotech|mechanical tentacles|artificial intelligence|engineering genius|scientific invention|super[- ]suit(?:s)?|combat suit)\b/i,
  stealth:/\b(?:invisib(?:le|ility)|stealth|infiltrat(?:ion|e|or)|espionage|covert|ninja|assassin stealth)\b/i,
  teleport:/\b(?:teleport(?:ation|s|ing)?|portal(?:s)?|sling ring|instant relocation|warps? (?:through|between))\b/i,
  healing:/\b(?:heals?|healing|healer|regenerat(?:e|es|ion|ing)|self[- ]healing|restor(?:ation|ing) of injuries|resurrect(?:ion|s)?)\b/i,
  giants:/\b(?:giant[- ]form|giant[- ]size|grows? (?:to |into )?(?:a )?(?:giant|enormous)|massive size[- ]shift|size[- ]shifting|becom(?:e|es|ing) enormous|enlarg(?:e|ement)|colossal form)\b/i
});
const CAMPAIGN_PROFILE_UNCERTAIN = /\b(?:uncertain|speculat(?:ive|ion)|variant[- ]dependent|version[- ]dependent|only conditional|not established|no evidence|cannot|can't|unable|not able|does not|lacks?|non[- ](?:magical|supernatural)|telekinetic[- ]style|teleportation[- ]like)\b/i;
function campaignGuideEvidence(candidate,rule,guides){
  if(!candidate?.pool||!candidate?.n)return null;
  const profile=(guides || (typeof window!=='undefined' ? window.DA_CHARACTER_GUIDES : null))?.[candidate.pool]?.[candidate.n] || (typeof window!=='undefined' ? window.DA_POOL_LORE?.[candidate.pool]?.[candidate.n] : null);
  if(!profile||!CAMPAIGN_PROFILE_PATTERNS[rule])return null;
  // Only the explicit Powers field: feats often describe surviving an attack
  // or witnessing an opponent's ability, which must NOT confer that power.
  for(const item of (Array.isArray(profile.powers)?profile.powers:[])){
    if(typeof item!=='string')continue;
    for(const clause of item.split(/[;,\n]+/)){
      const v=clause.trim();
      if(!v||CAMPAIGN_PROFILE_UNCERTAIN.test(v))continue;
      if(rule==='psychic'&&/\b(?:inventions?|technology|robot|device|machine|mechanical)\b/i.test(v))continue;
      if(CAMPAIGN_PROFILE_PATTERNS[rule].test(v)){
        return {tag:rule,kind:'built-in-research-guide',feat:v,pool:candidate.pool,name:candidate.n,
          source:(profile.sources||[]).find(url=>typeof url==='string'&&/^https:\/\//i.test(url))||'built-in-research-guide'};
      }
    }
  }
  return null;
}
/* Original-151 Pokémon already carry curated in-game type groups. Those groups
   are stronger evidence than guessing power from words like "electric" in a title.
   Do not translate Flying typing directly to self-flight: Doduo/Dodrio and some
   other Flying types are not actually airborne, so Skyborne uses curated feats. */
const CAMPAIGN_POKEMON_THEME_TAGS = Object.freeze({
  fire:'Fire Types',ice:'Ice Types',electric:'Electric Types',
  aquatic:'Water Types',psychic:'Psychic Types',healing:'Healers'
});
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
  const guide=campaignGuideEvidence(candidate,rule);
  if(guide)return guide;
  const pokemonTag=CAMPAIGN_POKEMON_THEME_TAGS[rule];
  if(candidate.pool==='pokemon'&&pokemonTag&&Array.isArray(candidate.taxonomy)&&candidate.taxonomy.includes(pokemonTag)){
    return {tag:rule,kind:'curated-pokemon-type',pool:candidate.pool,name:candidate.n,
      feat:'The roster classifies this Kanto Pokémon under '+pokemonTag+'.',
      source:'built-in-pokemon-type-taxonomy'};
  }
  if(rule==='flight'&&CAMPAIGN_OFFLINE_AERIAL[candidate.pool]?.has(candidate.n)){
    return {tag:'flight',kind:'curated-flight-or-air-combat',pool:candidate.pool,name:candidate.n,
      feat:'Known flight, hovering, or aircraft/spacecraft piloting relevant to Skyborne. Vehicle use does not imply unaided flight.',
      source:CAMPAIGN_OFFLINE_AERIAL_SOURCES[candidate.pool]};
  }
  return null;
}
if(typeof module!=='undefined'&&module.exports)module.exports={
  CAMPAIGN_DESCRIPTION_PATTERNS,CAMPAIGN_DESCRIPTION_EXCEPTIONS,
  CAMPAIGN_OFFLINE_AERIAL,CAMPAIGN_PROFILE_PATTERNS,CAMPAIGN_POKEMON_THEME_TAGS,
  campaignDescriptionEvidence,campaignGuideEvidence,campaignOfflineEvidence
};

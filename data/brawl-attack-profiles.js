/* Battle Royale combat power atlas, sourced to publishers and continuity.
 * Gameplay magnitudes are editorial, bounded and NOT published power levels.
 * A profile governs a repeatable arena technique, never automatic victory.
 */
(function(root){
 'use strict';
 const entries=[
 // Full-roster baseline powers. No variant gear or future form is silently stacked.
 ['dc:Perpetua','Multiversal creation surge','reality',5,.40,['reality','cosmic'],4,'https://www.dcuniverseinfinite.com/comics/book/justice-league-2018-38/caabff58-ead0-460e-9572-46c7482745f4','Restored creator portrayal; power is bounded by the arena and can be depleted or opposed.'],
 ['toons:Marvin the Martian','Martian energy weapon','tech',4,.32,['tech'],3,'https://www.imdb.com/title/tt0051701/','Advanced alien arsenal includes the Q-36 device; arena attacks are bounded and do not destroy planets.'],
 ['games:Rayman','Extendable fist strike','melee',3,.18,[],3,'https://www.ubisoft.com/en-us/games/rayman-legends','Limbless melee and platforming attacks require range and timing; not an automatic knockout.'],
 ['games:Bowser','Fire breath','elemental',3,.20,['elemental'],3,'https://www.mariowiki.com/Fire_Breath','Base Bowser uses fire breath; giant Fury form is not assumed.'],
 ['dc:Joker','Joker toxin','toxin',1,.05,[],3,'https://www.dc.com/characters/the-joker','Weapons and toxin rely on delivery; no superhuman physiology.'],
 ['dc:Darkseid','Omega Beams','cosmic',4,.34,['cosmic','energy'],3,'https://www.dc.com/characters/darkseid','Avatar-scale arena encounter; not the full transcendent form or guaranteed disintegration.'],
 ['dc:Ares (DC)','God of War strike','melee',3,.20,['melee'],3,'https://www.dc.com/characters/ares','War conflict empowers him; conceptual warfare is not infinite arena damage.'],
 ['dc:Lucifer Morningstar','Creation-shaping will','reality',5,.43,['reality','magic'],4,'https://www.dc.com/characters/lucifer','Cosmic agency is constrained by story and intent; no automatic win.'],
 // Tier 5 by owner ruling 2026-11-27: the ultimate personification of death, the only Endless to outlive
 // this universe, and the one who takes Dream himself (The Sandman #69). Pierce and cooldown are
 // unchanged: she has no offensive combat feats, so her arena attack stays modest.
 ['dc:Death of the Endless','The Endless presence','reality',5,.25,['reality'],4,'https://www.dc.com/blog/2022/08/26/the-sandman-deaths-among-us','Personification of mortality is represented by an arena manifestation, not literally killed by an HP knockout.'],
 ['dc:Superman','Kryptonian power','melee',3,.22,['melee'],3,'https://www.dc.com/characters/superman','Baseline Superman; weakness and continuity-dependent feats remain relevant.'],
 ['dc:Wonder Woman','Amazon divine combat','melee',3,.20,['melee'],3,'https://www.dc.com/characters/wonder-woman','Divine strength and weapon skill do not bypass all magical defenses.'],
 ['dc:Doomsday','Adaptive brutal force','melee',3,.24,['melee'],3,'https://www.dc.com/characters/doomsday','Evolution across encounters is not instantaneous immunity within one exchange.'],
 ['dc:Trigon','Azarathic soul power','magic',5,.34,['magic','cosmic'],4,'https://www.dc.com/characters/trigon','Dimensional threat not an unrestricted combatant outside his realm.'],
 ['mcu:Adam Warlock','Cosmic energy projection','cosmic',3,.27,['cosmic'],3,'https://www.marvel.com/comics/discover/731/adam-warlock','The Soul Gem is not assumed active unless the selected form equips it.'],
 ['mcu:Abomination','Gamma-powered onslaught','melee',3,.18,['melee'],3,'https://www.marvel.com/comics/guides/2318/the_abomination','Base Emil Blonsky, not a temporary Chaos King or enhanced variant.'],
 ['mcu:Scarlet Witch','Chaos hex','magic',4,.32,['magic'],3,'https://www.marvel.com/articles/comics/marvel-unlimited-reading-club-comics-to-read-before-house-of-m-event-starring-scarlet-witch','Baseline chaos magic; House of M feat is not every ordinary strike.'],
 ['mcu:The Watcher','Cosmic intervention','cosmic',4,.30,['cosmic'],4,'https://www.marvel.com/comics/guides/2196/when-the-watcher-does-more-than-watch','Uatu has a non-interference oath; being drafted for battle assumes he chooses to intervene.'],
 ['mcu:Odin','Odinforce discharge','magic',4,.32,['magic','cosmic'],3,'https://latency.marvel.com/comics/discover/1048/odin','Odinforce requires replenishment during Odinsleep; no automatic victory.'],
 // Publisher-grounded exceptional beings, with continuity limits from the existing exceptional-power register.
 ['dc:Anti-Monitor','Antimatter wave','cosmic',5,.38,['cosmic'],4,'https://www.dc.com/characters/anti-monitor','Multiversal feats are scenario-dependent, not instant arena obliteration.'],
 ['dc:Mister Mxyzptlk','Fifth-dimensional revision','reality',5,.40,['reality'],4,'https://www.dc.com/blog/2024/05/02/invasion-of-the-imps-five-magical-pranksters-from-the-fifth-dimension','Trickable and bound by narrative banishment conventions.'],
 ['dc:Doctor Manhattan','Matter reconstitution','reality',5,.40,['reality'],4,'https://www.dc.com/blog/2024/08/28/we-may-have-been-entirely-wrong-about-why-doctor-manhattan-goes-to-mars','Temporal perspective and motivations constrain intervention.'],
 ['dc:The Spectre','Spectral judgment','magic',5,.38,['magic','reality'],4,'https://www.dc.com/graphic-novels/dc-finest-the-spectre-the-wrath-of-the-spectre','Dependent on host and divine mandate.'],
 ['dc:Dream of the Endless','Dream manifestation','reality',4,.26,['reality'],4,'https://www.dc.com/characters','Dream realm influence does not guarantee waking-arena victory.'],
 ['mcu:Franklin Richards','Reality reshape','reality',5,.40,['reality'],4,'https://www.marvel.com/comics/discover/2513/the-children-of-the-fantastic-four','Powers vary by age, depletion and storyline.'],
 ['mcu:Galactus','Power Cosmic discharge','cosmic',5,.38,['cosmic'],4,'https://www.marvel.com/teams-and-groups/heralds-of-galactus','Hunger and feeding state matter.'],
 ['lotr:Morgoth (Melkor)','Primordial corruption','cosmic',5,.32,['cosmic','magic'],4,'https://tolkiengateway.net/wiki/Morgoth','Power diminished as it was dispersed into Arda.'],
 ['lotr:Manwë','Lord of Winds','elemental',4,.28,['elemental'],4,'https://tolkiengateway.net/wiki/Manw%C3%AB','Primordial world-shaping authority is distinct from direct attack.'],
 ['lotr:Varda (Elbereth)','Star-kindling light','cosmic',4,.28,['cosmic'],4,'https://tolkiengateway.net/wiki/Varda','Creation feats are not ordinary repeatable beams.'],
 ['lotr:Ulmo','Oceanic command','elemental',4,.28,['elemental'],4,'https://tolkiengateway.net/wiki/Ulmo','Effect depends on environment and divine form.'],
 ['lotr:Aulë','Earthcraft shaping','elemental',4,.26,['elemental'],4,'https://tolkiengateway.net/wiki/Aul%C3%AB','Craftsmanship and creative authority differ from direct dueling.'],
 ['lotr:Tulkas','Champion of the Valar','melee',4,.26,['melee'],3,'https://tolkiengateway.net/wiki/Tulkas','Legendary direct physical prowess is not reality alteration.'],
 ['mcu:God Emperor Doom','Battleworld decree','reality',5,.43,['reality','magic'],4,'https://www.marvel.com/articles/comics/secret-wars-official-marvel-guide','Temporary stolen Beyonders power. Not ordinary Doctor Doom.'],
 ['mcu:Rune King Thor','Runic command','magic',5,.38,['magic','cosmic'],4,'https://www.marvel.com/characters/thor-thor-odinson/in-comics','Ascended story-specific state. Not ordinary Thor.'],
 ['mcu:White Phoenix of the Crown','Phoenix judgment','cosmic',5,.40,['cosmic','reality'],4,'https://www.marvel.com/characters/jean-grey-phoenix/in-comics','Dependent on full Phoenix Force context.'],
 ['mcu:Infinity Ultron','Infinity Stone volley','cosmic',5,.40,['cosmic','reality'],4,'https://www.marvel.com/tv-shows/animation/what-if/1','What If...? Infinity Stone continuity, not ordinary Ultron.'],
 ['dc:The Darkest Knight','Dark Multiverse rewrite','reality',5,.43,['reality'],4,'https://www.dc.com/graphic-novels/dark-nights-death-metal-2020','Temporary alternate continuity; not Batman with normal preparation.']
 ];
 const CORE=Object.create(null);
 for(const [id,move,domain,tier,pierce,guard,cooldown,source,limit] of entries){
   CORE[id]=Object.freeze({move,domain,tier,pierce,guard:Object.freeze(guard),cooldown,source,limit});
 }
 Object.freeze(CORE);
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const activeForm=c=>c&&c.variantAbilities&&Array.isArray(c.variantAbilities.domains)&&c.variantAbilities.domains.length;
 function brawlAbilityOf(candidate){
   if(!candidate)return null;
   // Reviewed forms replace their base kit. In particular, Emperor Joker is
   // NEVER awarded to normal Joker and Infinity Ultron is not ordinary Ultron.
   if(activeForm(candidate)){
     const v=candidate.variantAbilities,tier=clamp(Number(v.tier)||2,1,5);
     const hellbat=candidate.pool==='dc'&&candidate.n==='Hellbat Armor Batman'&&v.move==='Hellbat Counteroffensive';
     return {
       move:v.move||'Signature strike',domain:v.domains[0],tier,
       pierce:hellbat ? .34 :clamp(.08+.045*tier,.10,.34),
       guard:Array.isArray(v.guards)?v.guards.slice(0,8):[],
       weakTo:Array.isArray(v.weakTo)?v.weakTo.slice(0,8):[],
       cooldown:hellbat ? 3 :(tier>=5?4:3),
       wearStart:hellbat ? 5 :0,wearRate:hellbat ? .025 :0,
       source:hellbat?'https://www.dc.com/blog/2014/12/19/this-just-happened-robin-rises-batman-falls':(v.source||''),
       origin:v.origin||'',limit:v.limit||'',
       continuity:v.continuity||''
     };
   }
   if(candidate.variantBase)return null;
   const rec=CORE[String(candidate.pool||'')+':'+String(candidate.n||'')];
   return rec?{...rec,guard:rec.guard.slice(),weakTo:[],wearStart:0,wearRate:0}:derivedAbilityOf(candidate);
 }
 // A character with a reviewed attacking power but no individual atlas entry still has that power.
 // Until a sourced profile is written, they get one modest generic attack derived from their reviewed
 // ability record: tier 2 (an ordinary attack with a repeatable edge, never an Apex or ward), low pierce,
 // a slow cadence. Only powers that are themselves a way of hurting someone count: spellcasting,
 // elemental control and telekinesis. Flight, healing, stealth, teleportation, gadgets and size do not.
 // An individual entry in CORE, a reviewed form, or a registered exceptional power always wins.
 const DERIVED=Object.freeze([
  // [broad tag, specific tag, domain, move]
  ['fire','fire-control','elemental','Fire control'],
  ['ice','ice-control','elemental','Ice control'],
  ['electric','electric-control','elemental','Electric control'],
  ['aquatic','water-control','elemental','Water control'],
  ['psychic','telekinesis','psychic','Telekinetic strike'],
  ['magic','spellcaster','magic','Spellcasting']
 ]);
 const DERIVED_TIER=2,DERIVED_PIERCE=.12,DERIVED_COOLDOWN=4;
 function derivedAbilityOf(candidate){
   if(!candidate||!candidate.pool||!candidate.n)return null;
   // The reviewed ability index lists every roster character's tags (broad id, then specific tags).
   // Script-level const declarations are global bindings but not window properties, so read by name.
   const index=typeof CHARACTER_ABILITY_TAGS!=='undefined'?CHARACTER_ABILITY_TAGS:root&&root.CHARACTER_ABILITY_TAGS;
   const tags=index&&index[candidate.pool]&&index[candidate.pool][candidate.n];
   if(!Array.isArray(tags)||!tags.length)return null;
   const exceptional=root&&root.brawlExceptionalPower;
   if(typeof exceptional==='function'&&exceptional(candidate,'brawl',{id:'d1'})>0)return null;
   const evidence=root&&root.characterAbilityEvidence;
   for(const [broad,specific,domain,move] of DERIVED){
     if(!tags.includes(specific))continue;
     let rec=null;
     try{rec=typeof evidence==='function'?evidence(candidate,broad):null;}catch(e){rec=null;}
     return {move,domain,tier:DERIVED_TIER,pierce:DERIVED_PIERCE,guard:[],weakTo:[],cooldown:DERIVED_COOLDOWN,
       wearStart:0,wearRate:0,source:String(rec&&rec.source||''),origin:'derived',derived:true,
       limit:'Generic modest attack derived from the reviewed '+specific+' ability record; not a published power level. An individual profile replaces it.'};
   }
   return null;
 }
 const api={brawlAbilityOf,CORE,derivedAbilityOf};
 if(root)root.DA_BRAWL_ABILITY_API=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:null);

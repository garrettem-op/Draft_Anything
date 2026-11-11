/* Battle Royale combat power atlas, sourced to publishers and continuity.
 * Gameplay magnitudes are editorial, bounded and NOT published power levels.
 * A profile governs a repeatable arena technique, never automatic victory.
 */
(function(root){
 'use strict';
 const entries=[
 // Full-roster baseline powers. No variant gear or future form is silently stacked.
 ['dc:Joker','Joker toxin','toxin',1,.05,[],3,'https://www.dc.com/characters/the-joker','Weapons and toxin rely on delivery; no superhuman physiology.'],
 ['dc:Darkseid','Omega Beams','cosmic',4,.34,['cosmic','energy'],3,'https://www.dc.com/characters/darkseid','Avatar-scale arena encounter; not the full transcendent form or guaranteed disintegration.'],
 ['dc:Ares (DC)','God of War strike','melee',3,.20,['melee'],3,'https://www.dc.com/characters/ares','War conflict empowers him; conceptual warfare is not infinite arena damage.'],
 ['dc:Lucifer Morningstar','Creation-shaping will','reality',5,.43,['reality','magic'],4,'https://www.dc.com/characters/lucifer','Cosmic agency is constrained by story and intent; no automatic win.'],
 ['dc:Death of the Endless','The Endless presence','reality',4,.25,['reality'],4,'https://www.dc.com/blog/2022/08/26/the-sandman-deaths-among-us','Personification of mortality is represented by an arena manifestation, not literally killed by an HP knockout.'],
 ['dc:Superman','Kryptonian power','melee',3,.22,['melee'],3,'https://www.dc.com/characters/superman','Baseline Superman; weakness and continuity-dependent feats remain relevant.'],
 ['dc:Wonder Woman','Amazon divine combat','melee',3,.20,['melee'],3,'https://www.dc.com/characters/wonder-woman','Divine strength and weapon skill do not bypass all magical defenses.'],
 ['dc:Doomsday','Adaptive brutal force','melee',3,.24,['melee'],3,'https://www.dc.com/characters/doomsday','Evolution across encounters is not instantaneous immunity within one exchange.'],
 ['dc:Trigon','Azarathic soul power','magic',5,.34,['magic','cosmic'],4,'https://www.dc.com/characters/trigon','Dimensional threat not an unrestricted combatant outside his realm.'],
 ['mcu:Adam Warlock','Cosmic energy projection','cosmic',3,.27,['cosmic'],3,'https://www.marvel.com/comics/discover/731/adam-warlock','The Soul Gem is not assumed active unless the selected form equips it.'],
 ['mcu:Abomination','Gamma-powered onslaught','melee',3,.18,['melee'],3,'https://www.marvel.com/comics/guides/2318/the_abomination','Base Emil Blonsky, not a temporary Chaos King or enhanced variant.'],
 ['mcu:Scarlet Witch','Chaos hex','magic',4,.32,['magic'],3,'https://www.marvel.com/articles/comics/marvel-unlimited-reading-club-comics-to-read-before-house-of-m-event-starring-scarlet-witch','Baseline chaos magic; House of M feat is not every ordinary strike.'],
 ['mcu:The Watcher','Cosmic intervention','cosmic',4,.30,['cosmic'],4,'https://www.marvel.com/comics/guides/2196/when-the-watcher-does-more-than-watch','Uatu has a non-interference oath; being drafted for battle assumes he chooses to intervene.'],
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
       source:v.source||'',origin:v.origin||'',limit:v.limit||'',
       continuity:v.continuity||''
     };
   }
   if(candidate.variantBase)return null;
   const rec=CORE[String(candidate.pool||'')+':'+String(candidate.n||'')];
   return rec?{...rec,guard:rec.guard.slice(),weakTo:[],wearStart:0,wearRate:0}:null;
 }
 const api={brawlAbilityOf,CORE};
 if(root)root.DA_BRAWL_ABILITY_API=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:null);

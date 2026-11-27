/* Battle Royale: what a rating was earned doing, and how much of it a fight can use.
 *
 * The twelve attributes are shared by every mode. Touch, Accuracy and Game IQ record
 * skill in whatever a character is known for: a jump shot for a point guard, a bow for
 * an archer, spellwork for a wizard. A fight can use physical gifts directly (speed,
 * agility, strength, size, leaping, endurance, reflexes), but it can only use a skill
 * to the extent that the skill was demonstrated in combat, or is itself a way of
 * hurting someone.
 *
 * This file records, per character, the domain their skill ratings come from. It never
 * changes a stored attribute and it has no effect outside Battle Royale. The default is
 * 'combat' (full transfer): characters whose skills are fighting, weapon, power or
 * battlefield skills, and anyone not yet reviewed, are unchanged.
 *
 * A record does NOT say "this pool is weak". It says "these ratings measure basketball".
 * A basketball player with documented fight training gets an individual record below,
 * and a character with innate destructive power is unaffected because reviewed powers
 * already bypass conventional skill (see offensiveCredibility in brawl-combat.js).
 *
 * Coefficients are editorial gameplay calibration, not measured facts.
 */
(function(root){
  'use strict';
  const KEYS=['spd','agi','str','siz','lep','end','tch','acc','ref','iq','clu','ldr'];
  // An untrained adult's fighting technique and aim on the game's 1–99 scale
  // (matches the 'civilian' archetype in data/new-pool-core.js).
  const UNTRAINED=50;
  // skill: share of Touch/Accuracy above the untrained baseline that carries into a fight.
  // tactics: share of Game IQ above the baseline that carries into reading a fight.
  const DOMAINS=Object.freeze({
    combat:Object.freeze({skill:1,tactics:1,label:'combat-proven skills'}),
    // Hand-eye coordination, body control and spatial reads are real, but a shooting
    // stroke is not marksmanship with a weapon and ball-handling is not fight technique.
    sport:Object.freeze({skill:.30,tactics:.50,label:'sporting skills, no documented combat training'}),
    // An athlete with documented fight training applies more of that coordination.
    'sport-trained':Object.freeze({skill:.60,tactics:.65,label:'sporting skills plus documented fight training'})
  });
  // Pool-level statement of what the ratings MEASURE (not a verdict on the people in it).
  // The NBA pool rates real players on what they did on a basketball court (index.html blends
  // their real production into those ratings), so its skill ratings are basketball ratings.
  const RATING_DOMAIN=Object.freeze({nba:'sport'});
  // Individual, sourced exceptions. Add a character here only with a citable record.
  const INDIVIDUAL=Object.freeze({
    'nba:Kareem Abdul-Jabbar':['sport-trained',
      'Studied Jeet Kune Do under Bruce Lee and fought him on screen in Game of Death (1978).',
      'https://en.wikipedia.org/wiki/Game_of_Death'],
    'nba:Shaquille O\'Neal':['sport-trained',
      'Completed the LA County Sheriff\'s Reserve Academy and was sworn in as an armed reserve police officer (Port of Los Angeles 2002, Miami Beach 2005).',
      'https://www.espn.com/nba/story/_/id/12202263/shaquille-oneal-becomes-reserve-police-officer-south-florida']
  });
  const idOf=c=>String(c?.pool||'')+':'+String(c?.variantBase||c?.n||'');
  function combatTransfer(c){
    if(!c)return {domain:'combat',...DOMAINS.combat,reason:'',source:''};
    const own=INDIVIDUAL[String(c.pool)+':'+String(c.n)]||INDIVIDUAL[idOf(c)];
    const domain=own?own[0]:(RATING_DOMAIN[c.pool]||'combat');
    return {domain,...DOMAINS[domain],
      reason:own?own[1]:domain==='combat'?'':'Skill ratings were earned in '+String(c.pool).toUpperCase()+' competition.',
      source:own?own[2]:''};
  }
  // The attribute vector a fight actually uses. Physical gifts, composure and
  // leadership are untouched; only above-baseline skill is scaled, never raised.
  function combatAttributes(c){
    const a=Array.isArray(c?.a)?c.a:[];
    const t=combatTransfer(c);
    if(t.skill===1&&t.tactics===1)return a;
    const scale=(v,k)=>v>UNTRAINED?UNTRAINED+k*(v-UNTRAINED):v;
    return a.map((v,i)=>{
      const key=KEYS[i],n=Number(v)||0;
      return key==='tch'||key==='acc'?scale(n,t.skill):key==='iq'?scale(n,t.tactics):n;
    });
  }
  const api={combatTransfer,combatAttributes,COMBAT_TRANSFER_DOMAINS:DOMAINS,COMBAT_UNTRAINED_BASELINE:UNTRAINED};
  if(root)root.DA_COMBAT_TRANSFER=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:null);

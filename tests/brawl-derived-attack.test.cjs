// Owner ruling 2026-11-27 (option A): characters with a reviewed attacking power but no individual
// atlas entry get one modest generic attack derived from that reviewed record.
const test=require('node:test');
const assert=require('node:assert/strict');
const lcg=seed=>{let s=seed>>>0;return()=>((s=Math.imul(s,1664525)+1013904223>>>0)/4294967296);};
const hero=(pool,n,a=Array(12).fill(70),extra={})=>({id:pool+':'+n,pool,n,a,...extra});
function load(globals={}){
  for(const k of ['CHARACTER_ABILITY_TAGS','characterAbilityEvidence','brawlExceptionalPower'])delete globalThis[k];
  Object.assign(globalThis,globals);
  for(const f of ['../data/brawl-attack-profiles.js','../data/brawl-combat.js'])delete require.cache[require.resolve(f)];
  const api=require('../data/brawl-attack-profiles.js');
  globalThis.DA_BRAWL_ABILITY_API=api;
  return {...api,combat:require('../data/brawl-combat.js')};
}
const TAGS={
  hp:{'Pansy':['flight','powered-flight','magic','spellcaster'],'Quidditch Fan':['flight','powered-flight'],'Torch':['fire','fire-control'],'Wand Seller':['magic','magic-item']},
  mcu:{'Jean':['psychic','telepathy','telekinesis'],'Healer':['healing','heals-others'],'Odin':['magic','spellcaster']},
  dc:{'Superman':['flight','natural-flight','fire','fire-control']}
};
const evidence=(c,t)=>({source:'https://example.test/'+c.n+'/'+t});
test('reviewed attacking powers get one modest generic attack with the record as its source',()=>{
  const {brawlAbilityOf}=load({CHARACTER_ABILITY_TAGS:TAGS,characterAbilityEvidence:evidence});
  const p=brawlAbilityOf(hero('hp','Pansy'));
  assert.equal(p.domain,'magic');assert.equal(p.tier,2);assert.ok(p.pierce<=.15);assert.equal(p.cooldown,4);
  assert.equal(p.derived,true);assert.match(p.source,/^https:\/\/example\.test\/Pansy\/magic$/);
  assert.equal(brawlAbilityOf(hero('hp','Torch')).domain,'elemental');
  assert.equal(brawlAbilityOf(hero('mcu','Jean')).domain,'psychic');
});
test('flight, healing, telepathy and item-dependent magic are not attacks',()=>{
  const {brawlAbilityOf}=load({CHARACTER_ABILITY_TAGS:TAGS,characterAbilityEvidence:evidence});
  assert.equal(brawlAbilityOf(hero('hp','Quidditch Fan')),null);
  assert.equal(brawlAbilityOf(hero('mcu','Healer')),null);
  assert.equal(brawlAbilityOf(hero('hp','Wand Seller')),null,'magic-item is equipment, not spellcasting');
  assert.equal(brawlAbilityOf(hero('hp','Unlisted')),null);
});
test('an individual profile, a registered exceptional power or a form is never replaced',()=>{
  const tags={mcu:{Odin:['magic','spellcaster'],Thanos:['magic','spellcaster']},dc:{Joker:['magic','spellcaster'],'Hellbat Armor Batman':['tech']}};
  const {brawlAbilityOf}=load({CHARACTER_ABILITY_TAGS:tags,characterAbilityEvidence:evidence,
    brawlExceptionalPower:(c)=>c.n==='Thanos'?40:0});
  assert.equal(brawlAbilityOf(hero('mcu','Odin')).move,'Odinforce discharge','individual atlas entry wins');
  assert.equal(brawlAbilityOf(hero('dc','Joker')).move,'Joker toxin');
  assert.equal(brawlAbilityOf(hero('mcu','Thanos')),null,'registered exceptional power already models this character');
  assert.equal(brawlAbilityOf(hero('dc','Super Form',undefined,{variantBase:'Superman'})),null,'forms never inherit a base kit');
});
test('the generic attack is modest: no Apex rank, no ward, no intrinsic rank, and a power user out-damages an identical fighter without it',()=>{
  const {combat}=load({CHARACTER_ABILITY_TAGS:TAGS,characterAbilityEvidence:evidence});
  const attrs=[70,70,60,60,60,65,40,40,70,70,70,50];
  const dummy=hero('mcu','Sparring Partner',Array(12).fill(70));
  const side=c=>({rating:80,rows:[{pos:{id:'d1'},cand:c,fit:78}]});
  let withPower=0,without=0,first=null;
  for(let i=1;i<=200;i++){
    const a=combat.resolveBrawlCombat(side(hero('hp','Pansy',attrs)),side(dummy),[80,80],lcg(i));
    const b=combat.resolveBrawlCombat(side(hero('hp','Plain',attrs)),side(dummy),[80,80],lcg(i));
    withPower+=a.sides[0].damage;without+=b.sides[0].damage;first=first||a.sides[0].fighters[0];
  }
  assert.ok(withPower>without,'power '+withPower+' vs none '+without);
  assert.ok(withPower<without*1.6,'modest, not a multiplier of a different order: '+withPower+' vs '+without);
  assert.ok(!first.apexRank&&!first.intrinsicRank);
});
test('Jean Grey has an individual sourced profile that replaces the generic attack',()=>{
  const {brawlAbilityOf}=load({CHARACTER_ABILITY_TAGS:{mcu:{'Jean Grey':['psychic','telepathy','telekinesis']}},characterAbilityEvidence:evidence});
  const p=brawlAbilityOf(hero('mcu','Jean Grey'));
  assert.equal(p.domain,'psychic');assert.equal(p.tier,4);assert.ok(!p.derived);
  assert.match(p.source,/^https:\/\/www\.marvel\.com\//);
  assert.equal(brawlAbilityOf(hero('mcu','Jean Grey',undefined,{variantBase:'Jean Grey'})),null,'forms are separate entries');
});

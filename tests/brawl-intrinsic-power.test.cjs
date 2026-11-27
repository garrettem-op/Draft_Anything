const test=require('node:test');
const assert=require('node:assert/strict');
const {resolveBrawlCombat,intrinsicPowerOf,apexRankOf,powerInteraction}=require('../data/brawl-combat.js');
const {brawlAbilityOf}=require('../data/brawl-attack-profiles.js');
const {variantAbilityProfile}=require('../data/variant-abilities.js');
const hero=(pool,n,a=Array(12).fill(95))=>({pool,n,id:pool+':'+n,a});
const dark=hero('dc','Darkseid');
const darkForm={...dark,n:'Infinite Frontier Darkseid',id:'dc:Infinite Frontier Darkseid',variantBase:dark.n,variantAbilities:variantAbilityProfile(dark,{name:'Infinite Frontier Darkseid'})};
const p=hero('dc','Perpetua'),anti=hero('dc','Anti-Monitor'),galactus=hero('mcu','Galactus');
const solo=(cand,fit=164)=>({rating:100,rows:[{cand,fit,pos:{id:'tk1',tank:true}}]});
const rng=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const duel=(a,b,seed)=>resolveBrawlCombat(solo(a),solo(b),[100,100],rng(seed),{trace:true});
test('intrinsic scale is identity-specific, evidence-gated and not Apex stacking',()=>{
 for(const [h,hp,mult] of [[p,900,2.9],[anti,800,2.75],[galactus,730,2.7]]){
  const kit=brawlAbilityOf(h);
  assert.deepEqual(intrinsicPowerOf(h,kit),{rank:2,hp,multiplier:mult});
  assert.equal(apexRankOf(h,kit),0);
  assert.equal(intrinsicPowerOf({...h,pool:'toons'},kit),null);
  assert.equal(intrinsicPowerOf({...h,variantBase:h.n},kit),null);
  assert.equal(intrinsicPowerOf(h,{...kit,tier:3}),null);
 }
 assert.equal(intrinsicPowerOf(darkForm,brawlAbilityOf(darkForm)),null);
 assert.equal(intrinsicPowerOf(dark,brawlAbilityOf(dark)),null);
 assert.equal(intrinsicPowerOf(hero('mcu','Odin'),brawlAbilityOf(hero('mcu','Odin'))).rank,1);
});
test('cosmic counters normalize an already enhanced intrinsic attacker against conventional Apex',()=>{
 const a={ability:{domain:'reality',tier:5},intrinsicRank:2,apexRank:0};
 const b={ability:{domain:'tech',tier:3},apexRank:2};
 assert.equal(powerInteraction(a,b,true).counterMultiplier,1.5);
 assert.equal(powerInteraction(a,{ability:{domain:'cosmic',tier:5},apexRank:2},true).counterMultiplier,1);
});
test('750 seeded equal-fit controlled cosmic duels preserve parity and accounting',()=>{
 for(const h of [p,anti,galactus]){
  let wins=0,actions=0,damage=0;
  for(let i=1;i<=250;i++){
   const r=duel(h,darkForm,10009+i*37),f=r.sides[0].fighters[0],d=r.sides[1].fighters[0];
   wins+=r.winner===0;actions+=f.attacks>f.roundsAlive;damage+=f.dmg;
   assert.equal(f.apexHp,0);assert.equal(f.apexRank,0);assert.equal(f.intrinsicRank,2);
   assert.equal(d.intrinsicHp,0);assert.equal(d.apexHp,730);
   assert.ok(f.maxHp>=d.maxHp);assert.ok(f.attacks<=2*f.roundsAlive&&f.powerUses<=f.roundsAlive);
   assert.equal(f.dmg-d.abs,f.overkill);assert.equal(d.dmg-f.abs,d.overkill);
   for(const e of r.events.filter(e=>e.type==='hit'&&e.peerSignature))assert.equal(e.counterMultiplier,1);
  }
  console.log(h.n,'vs Infinite Frontier Darkseid',wins+'/250','extra action games',actions,'mean damage',Math.round(damage/250));
  assert.ok(wins>=25,h.n+' cannot be routinely helpless against a comparable form');
  assert.ok(actions>=100,h.n+' should actually use the extra action');
 }
});
test('unrelated fighters retain baseline HP, action economy and form limits',()=>{
 const regular=hero('dc','Batman'),unreviewed={...p,variantBase:'Perpetua'};
 const r=duel(regular,unreviewed,31);
 for(const s of r.sides){const f=s.fighters[0];assert.equal(f.intrinsicHp,0);assert.equal(f.combatMultiplier,1);assert.ok(f.attacks<=f.roundsAlive);}
});

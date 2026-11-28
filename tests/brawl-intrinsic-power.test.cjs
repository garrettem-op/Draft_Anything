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

// Calibration follow-up to #676: intrinsic rank is parity with Apex forms, not a bonus over unranked
// high-order peers, whose typed kits (tier, pierce, guards) already decide those fights.
test('intrinsic rank does not stack over unranked high-order peers; Apex parity is unchanged',()=>{
 const luc={ability:{domain:'reality',tier:5},intrinsicRank:2,apexRank:0,combatMultiplier:2.7};
 const unrankedPeer={ability:{domain:'cosmic',tier:4},apexRank:0,intrinsicRank:0};
 const rankedPeer={ability:{domain:'reality',tier:5},apexRank:0,intrinsicRank:2};
 const apexPeer={ability:{domain:'cosmic',tier:5},apexRank:2,intrinsicRank:0};
 const conventional={ability:{domain:'melee',tier:3},apexRank:0,intrinsicRank:0};
 assert.equal(powerInteraction(luc,unrankedPeer,true).peerScale,1/2.7);
 assert.equal(powerInteraction(luc,unrankedPeer,false).peerScale,1/2.7);
 for(const o of [rankedPeer,apexPeer,conventional])assert.equal(powerInteraction(luc,o,true).peerScale,1);
 const apexAttacker={ability:{domain:'cosmic',tier:5},apexRank:2,intrinsicRank:0,combatMultiplier:2.7};
 assert.equal(powerInteraction(apexAttacker,unrankedPeer,true).peerScale,1,'Apex forms are unaffected');
 // Ranked against unranked peer: no second action, no rank shell; HP is unchanged.
 const lucifer=hero('dc','Lucifer Morningstar'),darkseid=hero('dc','Darkseid');
 let extra=0;
 for(let i=1;i<=40;i++){
  const r=duel(lucifer,darkseid,707+i*13),f=r.sides[0].fighters[0];
  assert.equal(f.intrinsicRank,2);assert.equal(f.intrinsicHp,730);
  extra+=f.attacks>f.roundsAlive;
  const hits=r.events.filter(e=>e.type==='hit'&&e.attacker===f.id);
  assert.ok(hits.length>0);
  for(const e of hits)assert.equal(e.counterMultiplier,1);
 }
 assert.equal(extra,0,'no second action while only unranked high-order peers remain');
});

test('rank HP counts only partly against unranked high-order peers (owner choice 2026-11-27)',()=>{
 const target={ability:{domain:'reality',tier:5},intrinsicRank:2,apexRank:0,intrinsicHp:730,maxHp:1000};
 const unrankedPeer={ability:{domain:'cosmic',tier:4},apexRank:0,intrinsicRank:0};
 // A quarter of the 730 rank HP counts: effective HP 1000-0.75*730=452.5.
 assert.equal(powerInteraction(unrankedPeer,target,true).hpScale,1000/(1000-.75*730));
 const conventional={ability:{domain:'melee',tier:3},apexRank:0,intrinsicRank:0};
 const ranked={ability:{domain:'reality',tier:5},apexRank:0,intrinsicRank:2};
 const apex={ability:{domain:'cosmic',tier:5},apexRank:2,intrinsicRank:0};
 for(const o of [conventional,ranked,apex])assert.equal(powerInteraction(o,target,true).hpScale,1);
 assert.equal(powerInteraction(unrankedPeer,{...target,intrinsicHp:0},true).hpScale,1);
 assert.equal(powerInteraction(unrankedPeer,{...target,apexRank:2},true).hpScale,1,'Apex forms keep full HP');
 // Generally favored, not certain: Lucifer still beats Darkseid most of the time but not always.
 const lucifer=hero('dc','Lucifer Morningstar'),darkseid=hero('dc','Darkseid');
 let wins=0;
 for(let i=1;i<=150;i++)wins+=duel(lucifer,darkseid,1201+i*29).winner===0;
 assert.ok(wins>75&&wins<150,'Lucifer vs Darkseid '+wins+'/150');
});

test('Death of the Endless is tier 5 with rank 1 by owner ruling (2026-11-27); Dream stays tier 4 and unranked',()=>{
 const death=hero('dc','Death of the Endless'),dream=hero('dc','Dream of the Endless');
 const kit=brawlAbilityOf(death);
 assert.equal(kit.tier,5);
 assert.equal(kit.pierce,.25,'no offensive combat feats: arena attack stays modest');
 assert.deepEqual(intrinsicPowerOf(death,kit),{rank:1,hp:570,multiplier:2.3});
 assert.equal(intrinsicPowerOf({...death,variantBase:'x'},kit),null);
 assert.equal(brawlAbilityOf(dream).tier,4);
 assert.equal(intrinsicPowerOf(dream,brawlAbilityOf(dream)),null);
});

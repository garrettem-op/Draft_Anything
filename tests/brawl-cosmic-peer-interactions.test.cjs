const test=require('node:test');
const assert=require('node:assert/strict');
const {highOrderPower,powerInteraction,resolveBrawlCombat}=require('../data/brawl-combat.js');
const {variantAbilityProfile}=require('../data/variant-abilities.js');
const expansion=require('../data/campaign-variant-expansion.js');
const kit=(domain,tier,apexRank=0)=>({ability:{domain,tier},apexRank});
test('high-order classification is independent of transformation and requires a typed reviewed power',()=>{
 for(const domain of ['cosmic','magic','reality','time','elemental']){
  assert.equal(highOrderPower({domain,tier:4}),true);
  assert.equal(highOrderPower({domain,tier:3}),false);
 }
 for(const domain of ['tech','melee','physical','toxin'])assert.equal(highOrderPower({domain,tier:5}),false);
 assert.equal(highOrderPower(null),false);
});
test('cosmic peer signatures have no form-status counter or blanket defense penalty',()=>{
 for(const a of [0,1,2])for(const b of [0,1,2])for(const t of [4,5])for(const u of [4,5]){
  assert.deepEqual(powerInteraction(kit('cosmic',t,a),kit('magic',u,b),true),
   {counterMultiplier:1,baselineGuard:0,peerSignature:true,peerScale:1,hpScale:1});
 }
 assert.deepEqual(powerInteraction(kit('cosmic',5,2),kit('reality',5),false),
  {counterMultiplier:1,baselineGuard:0,peerSignature:false,peerScale:1,hpScale:1});
});
test('conventional transformed fighters remain susceptible to high-order counters',()=>{
 const hellbat=kit('tech',3,2),darkseid=kit('cosmic',4),cosmicApex=kit('cosmic',5,2);
 assert.equal(powerInteraction(darkseid,hellbat,true).counterMultiplier,3);
 assert.equal(powerInteraction(kit('reality',5),hellbat,true).counterMultiplier,4);
 assert.equal(powerInteraction(cosmicApex,hellbat,true).counterMultiplier,1.5);
 assert.equal(powerInteraction(darkseid,hellbat,false).counterMultiplier,1);
 assert.equal(powerInteraction(hellbat,darkseid,true).baselineGuard,.5);
 assert.equal(powerInteraction(hellbat,darkseid,false).baselineGuard,.5);
 assert.equal(powerInteraction({apexRank:2,ability:null},darkseid,false).baselineGuard,.5);
});
const keys=['spd','agi','str','siz','lep','end','tch','acc','ref','iq','clu','ldr'];
const hero=(pool,n,a=Array(12).fill(90))=>({pool,n,id:pool+':'+n,a});
function form(c,f){return {...c,n:f.name,variantBase:c.n,variantAbilities:variantAbilityProfile(c,f),a:c.a.map((v,i)=>Math.min(99,v+(f.changes[keys[i]]||0)))};}
const odin=form(hero('mcu','Odin',[72,62,94,76,82,82,88,92,82,96,86,94]),expansion['mcu:Odin'][1]);
const melkor=form(hero('lotr','Morgoth (Melkor)'),expansion['lotr:Morgoth (Melkor)'][0]);
const spectre=hero('dc','The Spectre'),mxy=hero('dc','Mister Mxyzptlk'),lucifer=hero('dc','Lucifer Morningstar');
const team=cs=>({rating:100,rows:cs.map((cand,i)=>({cand,fit:95,pos:{id:['tk1','tk2','d1','d2','d3'][i],tank:i<2}}))});
function rng(seed){return ()=>((seed=(Math.imul(1664525,seed)+1013904223)>>>0)/4294967296);}
test('real catalog cosmic peers use neutral form interaction in traced attacks, including formation fallback',()=>{
 let peerHits=0,odinHits=0,received=0;
 for(let seed=1;seed<=100;seed++){
  const a=team([hero('lotr','Manwë'),odin,hero('toons','Genie'),hero('lotr','Námo (Mandos)'),hero('actionmovies','Aslan')]);
  const b=team([spectre,mxy,melkor,lucifer,hero('lotr','Aulë')]);
  const result=resolveBrawlCombat(a,b,[100,100],rng(seed),{trace:true});
  for(const e of result.events.filter(e=>e.type==='hit')){
   assert.equal(e.raw-e.prevented,e.incoming);
   assert.equal(e.incoming,e.absorbed+e.overkill);
   if(e.peerSignature){peerHits++;assert.equal(e.counterMultiplier,1);assert.equal(e.baselineGuard,0);}
   if(e.attacker===odin.id&&e.domain==='cosmic'){odinHits++;assert.equal(e.baselineGuard,0);}
   if(e.target===odin.id&&e.peerSignature){received++;assert.equal(e.counterMultiplier,1);}
  }
  assert.ok(result.sides.some(s=>s.survivors===0));
 }
 assert.ok(peerHits>0&&odinHits>0&&received>0);
});

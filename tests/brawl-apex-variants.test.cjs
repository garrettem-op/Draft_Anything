const test=require('node:test');
const assert=require('node:assert/strict');
const {resolveBrawlCombat}=require('../data/brawl-combat.js');
const {variantAbilityProfile}=require('../data/variant-abilities.js');

const KEYS=['spd','agi','str','siz','lep','end','tch','acc','ref','iq','clu','ldr'];
function hero(pool,n,attrs={},extra={}){
  return {pool,n,id:pool+':'+n,a:KEYS.map(k=>attrs[k]??75),...extra};
}
function form(pool,base,name,attrs={}){
  const original=hero(pool,base,attrs);
  const skill=variantAbilityProfile(original,{name});
  assert.ok(skill,'Missing reviewed variant power for '+name);
  return hero(pool,name,attrs,{variantBase:base,variantAbilities:skill});
}
const hellbat=form('dc','Batman','Hellbat Armor Batman',
  {str:85,spd:86,end:82,siz:70,acc:88,ref:86,iq:95});
const ordinaryBatman=hero('dc','Batman',
  {str:65,spd:72,end:65,siz:68,acc:80,ref:85,iq:95});
const manhunter=hero('dc','Martian Manhunter',
  {str:93,end:93,siz:85,spd:90,ref:92,acc:90,iq:95});
const abomination=hero('mcu','Abomination',{str:87,end:87,siz:87,acc:83,spd:83});
const peeves=hero('harrypotter','Peeves',{str:24,end:60,siz:45,spd:65,ref:65,acc:60,iq:70});
const snape=hero('harrypotter','Severus Snape',{str:35,end:70,siz:60,spd:70,ref:86,acc:86,iq:95});
const widow=hero('mcu','Black Widow',{str:52,end:74,siz:55,spd:86,ref:93,acc:93,iq:92});
const agent=hero('games','Agent 47',{str:65,end:75,siz:70,spd:82,ref:89,acc:94,iq:87});
const darkseid=hero('dc','Darkseid',{str:99,end:99,siz:99,spd:84,ref:86,acc:93,iq:90});
const manhattan=hero('dc','Doctor Manhattan',{str:60,end:60,siz:70,spd:77,ref:80,acc:80,iq:99});
const lucifer=hero('dc','Lucifer Morningstar',{str:65,end:65,siz:70,spd:87,ref:89,acc:85,iq:99});
const kerrigan=hero('games','Sarah Kerrigan',{str:82,end:86,siz:75,spd:86,ref:85,acc:88,iq:90});
function team(chars,rating=80,fit=80){
  return {rating,rows:chars.map((cand,i)=>({
    cand,fit,pos:{id:i<2?'tk'+i:'d'+i,tank:i<2,coach:false,bench:false}
  }))};
}
function rng(seed){
  let state=seed>>>0;
  return ()=>((state=(Math.imul(1664525,state)+1013904223)>>>0)/4294967296);
}
function run(left,right,seed,options){
  return resolveBrawlCombat(left,right,[left.rating,right.rating],rng(seed),options);
}
test('Hellbat transforms into an actual Apex combatant when Tank, not merely a stat-adjusted Batman',()=>{
  const lhs=team([manhunter,hellbat,peeves,snape,widow],76,75);
  const rhs=team([manhunter,abomination,widow,agent,snape],82,82);
  const result=run(lhs,rhs,76,{trace:true});
  const bat=result.sides[0].fighters[1];
  assert.equal(bat.apexRank,2);
  assert.equal(bat.apexHp,730);
  assert.ok(bat.maxHp>1000,'armor endurance should materially exceed baseline');
  assert.ok(bat.attacks>bat.roundsAlive,'second action must occur in real combat');
  assert.ok(bat.powerUses<=bat.roundsAlive,'signature cooldown should not double fire');
  assert.equal(bat.powerMove,'Hellbat Counteroffensive');
  assert.ok(result.events.some(e=>e.attacker===bat.id&&e.type==='hit'));
  assert.ok(result.sides.flatMap(side=>side.fighters).every(x=>x.hp>=0));
});
test('an Apex outcome is almost decisive against conventional rosters over 250 seeded fights',()=>{
  const normal=team([manhunter,abomination,widow,agent,snape],82,82);
  const allied=team([manhunter,hellbat,peeves,snape,widow],76,75);
  const mundane=team([manhunter,ordinaryBatman,peeves,snape,widow],76,75);
  let apexWins=0,mundaneWins=0,hellDamage=0;
  for(let i=0;i<250;i++){
    const seed=41+i*77;
    const a=run(allied,normal,seed),b=run(mundane,normal,seed);
    apexWins+=a.winner===0;mundaneWins+=b.winner===0;
    hellDamage+=a.sides[0].fighters[1].dmg;
  }
  assert.ok(apexWins>=238,'Apex form should win >=95% of this controlled non-apex fixture: '+apexWins);
  assert.ok(apexWins>mundaneWins+100,'non-apex Batman must not perform like Hellbat');
  assert.ok(hellDamage/250>500,'Apex combat advantage must affect actual inflicted damage');
});
test('a rare Apex form can carry a weak team, without transferring the enhancement to teammates',()=>{
  const rookies=Array.from({length:4},(_,i)=>hero('test','Rookie '+i,{},{}));
  rookies.forEach(c=>c.a=KEYS.map(()=>48));
  const lhs=team([rookies[0],hellbat,...rookies.slice(1)],65,65);
  const rhs=team([manhunter,abomination,widow,agent,snape],82,82);
  let wins=0;
  for(let seed=1;seed<=120;seed++)wins+=run(lhs,rhs,seed*103+157).winner===0;
  assert.ok(wins>=114,'Apex form with weaker allies should win >=95% in calibration: '+wins);
  const r=run(lhs,rhs,31);
  assert.equal(r.sides[0].fighters[0].apexRank,0);
  assert.equal(r.sides[0].fighters[2].apexRank,0);
});
test('peak tier-5 forms and curated tier-4 forms share Apex effects; ordinary tier-4 remains Empowered',()=>{
  const top=[
    form('mcu','Thor','Rune King Thor',{str:70,end:70}),
    form('mcu','Scarlet Witch','House of M Scarlet Witch',{str:45,end:45}),
    form('dc','Joker','Emperor Joker',{str:44,end:52}),
    form('mcu','Hulk','World Breaker Hulk',{str:99,end:99})
  ];
  const regular=form('lotr','Gandalf','Gandalf the White',{str:55,end:65});
  for(const c of top){
    const r=run(team([c]),team([agent]),47);
    assert.equal(r.sides[0].fighters[0].apexRank,2,c.n);
  }
  assert.equal(run(team([regular]),team([agent]),47).sides[0].fighters[0].apexRank,1);
});
test('King Thanos gains the documented Apex combat kit, while base Thanos does not',()=>{
  const attrs={str:99,end:99,iq:98,acc:91,ref:94,spd:83,siz:94};
  const base=hero('mcu','Thanos',attrs);
  const variant=require('../data/campaign-variant-expansion.js')['mcu:Thanos'].find(f=>f.name==='King Thanos');
  assert.ok(variant,'King Thanos form must be in the real surge catalog');
  // Use the actual catalog record so evidence and source metadata are tested end-to-end.
  const king={...base,n:variant.name,variantBase:'Thanos',variantAbilities:variantAbilityProfile(base,variant)};
  const sample=run(team([king]),team([base]),57,{trace:true});
  const upgraded=sample.sides[0].fighters[0];
  const ordinary=sample.sides[1].fighters[0];
  assert.equal(upgraded.apexRank,2);
  assert.equal(ordinary.apexRank,0);
  assert.equal(upgraded.apexHp,730);
  assert.equal(ordinary.apexHp,0);
  assert.equal(upgraded.powerMove,'End-of-Time Onslaught');
  assert.match(upgraded.powerSource,/marvel\.com\/comics\/discover\/1214\/thanos-wins/);
  assert.equal(ordinary.powerMove,'');
  let kingWins=0;
  for(let i=0;i<100;i++)kingWins+=run(team([king]),team([base]),i*37+11).winner===0;
  assert.ok(kingWins>=95,'King Thanos must decisively outperform base Thanos in controlled duels: '+kingWins);
});
test('unreviewed variants and baseline versions do not inherit Apex form powers',()=>{
  const unreviewed=hero('dc','Hellbat Armor Batman',{}, {variantBase:'Batman',variantAbilities:null});
  const cases=[ordinaryBatman,unreviewed,hero('dc','Darkseid',{str:99,end:99}),hero('mcu','Thor')];
  for(const c of cases){
    const result=run(team([c]),team([agent]),19);
    assert.equal(result.sides[0].fighters[0].apexRank,0,c.n);
  }
});
test('cosmic entities retain counters; Hellbat is not programmed to win every matchup',()=>{
  const lhs=team([manhunter,hellbat,peeves,snape,widow],76,75);
  const rhs=team([darkseid,manhattan,lucifer,manhunter,kerrigan],92,92);
  let wins=0;
  for(let i=0;i<250;i++)wins+=run(lhs,rhs,41+i*77).winner===0;
  assert.ok(wins<125,'a stacked roster of cosmic entities should defeat a lone Apex threat more often than not: '+wins);
});

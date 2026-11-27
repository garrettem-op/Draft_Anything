const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {resolveBrawlCombat,formationTarget,rangeBlocked,formationOverrides}=require('../data/brawl-combat.js');

const KEYS=['spd','agi','str','siz','lep','end','tch','acc','ref','iq','clu','ldr'];
function rngFrom(seed){
 let state=seed>>>0;
 return ()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296;};
}
function buildTeam(prefix,stats,base=80){
 const slots=['tk1','tk2','d1','d2','d3'];
 return {rating:base,rows:slots.map((id,i)=>{
   const a=KEYS.map(k=>stats[k]??76);
   return {
     pos:{id,ab:id,tank:id.startsWith('tk'),coach:false,bench:false},
     fit:stats.fit??78,
     cand:{id:prefix+':'+id,n:prefix+' '+id,pool:'test',a}
   };
 })};
}
const total=(rows,k)=>rows.reduce((n,r)=>n+r[k],0);

test('simulated attacks, not team rating margins, account for actual KOs and damage',()=>{
 const A=buildTeam('A',{str:94,acc:90,spd:88,end:87,siz:82,fit:94},95);
 const B=buildTeam('B',{str:64,acc:60,spd:58,end:62,siz:60,fit:64},64);
 const result=resolveBrawlCombat(A,B,[97,63],rngFrom(1234));
 assert.equal(result.version,2);
 assert.equal(result.model,'typed-signature-v3-intrinsic');
 assert.equal(result.sides.length,2);
 assert.equal(result.line[0],5);
 assert.equal(result.winner,0);
 assert.ok(result.rounds>0&&result.rounds<=90);
 for(let i=0;i<2;i++){
   const side=result.sides[i];
   assert.equal(side.fighters.length,5);
   assert.equal(side.damage,total(side.fighters,'dmg'));
   assert.equal(side.absorbed,total(side.fighters,'abs'));
   assert.equal(side.mitigated,total(side.fighters,'mit'));
   assert.equal(side.kos,total(side.fighters,'kos'));
   assert.equal(side.survivors,side.fighters.filter(f=>f.hp>0).length);
   assert.ok(side.fighters.every(f=>f.kos>=0&&f.hp>=0&&f.hp<=f.maxHp));
 }
 assert.equal(result.sides[0].damage-result.sides[1].absorbed,total(result.sides[0].fighters,'overkill'));
 assert.equal(result.sides[1].damage-result.sides[0].absorbed,total(result.sides[1].fighters,'overkill'));
 assert.equal(result.sides[0].kos,5);
 assert.equal(result.line[1],result.sides[1].kos);
 assert.equal(result.sides[1].survivors,0);
 assert.ok(result.sides[1].damage>0,'losing team still attacks and deals damage');
});

test('varying combat events changes damage independently of the 5-KO score',()=>{
 const A=buildTeam('A',{str:91,acc:86,spd:84,end:82,fit:91},91);
 const B=buildTeam('B',{str:56,acc:56,spd:54,end:55,fit:57},57);
 const outcomes=Array.from({length:10},(_,i)=>resolveBrawlCombat(A,B,[91,57],rngFrom(131+i*11)));
 assert.ok(outcomes.every(x=>x.line[0]===5));
 assert.ok(new Set(outcomes.map(x=>x.sides[0].damage)).size>2,
   'total damage must arise from combat, not be fixed to 1400 for all winners');
 assert.ok(outcomes.some(x=>x.sides[1].damage!==350),
   'loser damage must not be pinned to the old 350 minimum');
});

test('combat resolver is deterministic for the same seed and roster',()=>{
 const A=buildTeam('A',{str:88,acc:79,spd:75,end:84,fit:88},88);
 const B=buildTeam('B',{str:86,acc:85,spd:87,end:80,fit:86},86);
 assert.deepEqual(
  resolveBrawlCombat(A,B,[89,84],rngFrom(532)),
  resolveBrawlCombat(A,B,[89,84],rngFrom(532))
 );
});

test('browser wires combat into every brawl match path and report',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const reports=fs.readFileSync(path.join(__dirname,'../data/after-action.js'),'utf8');
 assert.match(html,/<script src="data\/brawl-combat\.js"><\/script>/);
 assert.match(html,/resolveBrawlCombat\(A,B,/);
 assert.match(html,/if \(sportKey==='brawl'\) \{\s*const g=playGame/);
 assert.match(html,/combat:g\.combat/g);
 assert.match(reports,/combat:match\.combat/);
 assert.match(reports,/combat:orderedCombat/);
 assert.doesNotMatch(reports,/total\s*\*\s*210\s*\+\s*350/);
});
test('1000 paired seeds: reordering input rows without changing positions cannot change fighter outcomes',()=>{
 const A=buildTeam('A',{str:88,acc:79,spd:75,end:84,fit:88},88);
 const B=buildTeam('B',{str:86,acc:85,spd:87,end:80,fit:86},86);
 const swapped={...A,rows:A.rows.slice().reverse()};
 const normalized=r=>r.sides.map(side=>side.fighters.map(({position,...f})=>f).sort((a,b)=>a.id.localeCompare(b.id)));
 for(let seed=1;seed<=1000;seed++){
  const original=resolveBrawlCombat(A,B,[89,84],rngFrom(seed));
  const moved=resolveBrawlCombat(swapped,B,[89,84],rngFrom(seed));
  assert.equal(original.winner,moved.winner);
  assert.deepEqual(normalized(original),normalized(moved));
 }
});
test('Apex cosmic attackers do not multiply their own boosted strike by four against another Apex',()=>{
 const stats={str:99,spd:90,end:99,siz:99,acc:99,ref:90,fit:99};
 const A=buildTeam('A',stats,90),B=buildTeam('B',stats,90);
 const power={move:'Cosmic strike',domains:['cosmic'],guards:[],tier:5};
 for(const team of [A,B])for(const r of team.rows)r.cand.variantAbilities=power;
 const r=resolveBrawlCombat(A,B,[90,90],()=>.5,{trace:true});
 const hits=r.events.filter(e=>e.type==='hit'&&e.round===1&&e.domain==='cosmic');
 assert.ok(hits.length>0);
 assert.ok(hits.every(e=>e.raw<800),'opening cosmic strikes must not retain the old 4x stacking');
 assert.ok(r.sides.flatMap(s=>s.fighters).every(f=>f.hp>=0));
});

const board=()=>['tk1','tk2','d1','d2','d3'].map((position,i)=>({id:'b'+i,position,tank:i<2,hp:100,maxHp:100,tactics:{},attack:100-i}));
test('default lanes assign 3 left and 2 right and keep both tanks ahead of rear targets',()=>{
 const a=board(),b=board();
 assert.deepEqual(a.map(f=>formationTarget(f,b,()=>.5).position),['tk1','tk2','tk1','tk1','tk2']);
 b[0].hp=0;assert.ok(a.every(f=>formationTarget(f,b,()=>.5).position==='tk2'));
 b[1].hp=0;assert.deepEqual(a.map(f=>formationTarget(f,b,()=>.5).position),['d1','d3','d1','d1','d3']);
 b[2].hp=0;assert.equal(formationTarget(a[0],b,()=>.5).position,'d2');
});
test('target exceptions can bypass front line; forced targets win only while alive',()=>{
 const a=board(),b=board();b[3].hp=10;
 assert.equal(formationTarget(a[0],b,()=>.99,'random').position,'d3');
 assert.equal(formationTarget(a[0],b,()=>.5,'lowestHp').position,'d2');
 assert.equal(formationTarget(a[0],b,()=>.5,'backline').position,'d1');
 assert.equal(formationTarget(a[0],b,()=>.5,'backline',b[1]).position,'tk2');
 b[1].hp=0;assert.equal(formationTarget(a[0],b,()=>.5,'lane',b[1]).position,'tk1');
});
test('range, mirror mark, and front tank taunt are bounded by formation and cadence',()=>{
 const a=board(),b=board();a[2].tactics.shortRange=true;
 assert.ok(rangeBlocked(a[2],a));assert.equal(rangeBlocked(a[0],a),false);
 a[0].hp=a[1].hp=0;assert.equal(rangeBlocked(a[2],a),false);
 a[0].hp=100;a[3].tactics.mark=true;b[1].tactics.taunt=true;
 const x=formationOverrides([a,b],1);assert.equal(x.marks.get(a[0]),b[3]);assert.equal(x.taunts.get(1),b[1]);
 assert.equal(formationOverrides([a,b],2).marks.size,0);
});
test('live five-position trace protects rear from standard attacks until front falls',()=>{
 const a=buildTeam('A',{fit:80}),b=buildTeam('B',{fit:80});
 const res=resolveBrawlCombat(a,b,[80,80],rngFrom(42),{trace:true});
 const living=[new Set(['A:tk1','A:tk2']),new Set(['B:tk1','B:tk2'])];
 for(const e of res.events){if(!['hit','miss'].includes(e.type))continue;
  if(living[1-e.side].size)assert.ok(living[1-e.side].has(e.target));
  if(e.ko)living[1-e.side].delete(e.target);
 }
});
test('live trace records a rear-targeted cosmic signature and defensive interception',()=>{
 const a=buildTeam('A',{fit:80,spd:99,ref:99}),b=buildTeam('B',{fit:80,spd:40,ref:40});
 a.rows[0].cand={...a.rows[0].cand,pool:'dc',n:'Darkseid'};
 b.rows[0].cand={...b.rows[0].cand,pool:'dc',n:'Wonder Woman'};
 const res=resolveBrawlCombat(a,b,[80,80],()=>.5,{trace:true});
 assert.ok(res.events.some(e=>e.targeting==='intercept'&&e.target==='B:tk1'));
 assert.ok(res.sides[1].fighters[0].intercepts>0);
});

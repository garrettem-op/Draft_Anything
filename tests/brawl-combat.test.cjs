const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {resolveBrawlCombat}=require('../data/brawl-combat.js');

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
 assert.equal(result.model,'typed-signature-v1');
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
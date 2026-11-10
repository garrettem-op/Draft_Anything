/* Run with: node tests/volleyball-scoring-distribution.test.js
   Verifies invariant position rules, per-player point totals, determinism,
   and that distribution varies by match rather than always being balanced. */
const assert=require('node:assert/strict');
const {daBoxScore}=require('../data/after-action.js');
const roles=[
  ['s','S'],['oh1','OH1'],['mb1','MB'],['opp','OPP'],
  ['oh2','OH2'],['lib','L'],['mb2','MB'],['bn','BN'],['hc','HC']
];
const rows=roles.map(([id,ab],i)=>({
  cand:{id:'p'+i,n:'Player '+i,a:[72+i,70,80+i,74+i,78,73,71,75,74,75,70,72]},
  pos:{id,ab,imp:1,coach:id==='hc',bench:id==='bn'},
  fit:75+i
}));
const score={rows,rating:81};
const forbidden={
  lib:['KILLS','BLK'],
  mb1:['DIG','AST'],
  mb2:['DIG','AST']
};
let featuredMatches=0,balancedMatches=0;
for(let i=0;i<150;i++){
  const seed='vb-regression-'+i;
  const build=()=>daBoxScore('volleyball',score,3,seed,{note:'25-22 25-20 25-21',side:0});
  const box=build(),repeat=build();
  assert.deepEqual(box,repeat,'same match must yield same stats for all viewers');
  const byRole=Object.fromEntries(box.map(p=>[p.position,p]));
  for(const [role,metrics] of Object.entries(forbidden)){
    for(const metric of metrics)assert(!byRole[role].stats.some(([name])=>name===metric),role+' cannot receive '+metric);
  }
  for(const r of box.filter(p=>!['bn','hc'].includes(p.position))){
    const get=k=>r.stats.find(([name])=>name===k)?.[1]||0;
    assert.equal(get('PTS'),get('KILLS')+get('BLK')+get('ACE'),'individual points must reconcile');
  }
  const scoring=box.filter(p=>!['bn','hc'].includes(p.position));
  const pointTotal=scoring.reduce((sum,r)=>sum+r.stats.find(([k])=>k==='PTS')[1],0);
  const componentTotal=['KILLS','BLK','ACE'].reduce((sum,k)=>sum+scoring.reduce((n,r)=>n+(r.stats.find(([name])=>name===k)?.[1]||0),0),0);
  assert.equal(pointTotal,componentTotal,'team total must equal sum of individual scoring events');
  const pinKills=['oh1','oh2','opp'].map(role=>byRole[role].stats.find(([k])=>k==='KILLS')?.[1]||0);
  const totalKills=scoring.reduce((n,r)=>n+(r.stats.find(([k])=>k==='KILLS')?.[1]||0),0);
  if(Math.max(...pinKills)/totalKills>=.34)featuredMatches++;
  if(Math.max(...pinKills)-Math.min(...pinKills)<=3)balancedMatches++;
}
assert(featuredMatches>50,'most matches should have a featured pin hitter');
assert(balancedMatches<70,'uniform pin scoring should not be the norm');
console.log('Volleyball scoring tests passed; featured:',featuredMatches,'balanced:',balancedMatches);

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {daBoxScore}=require('../data/after-action.js');
const research=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/research/mens-vb-2025-results.json'),'utf8'));
assert.equal(research.matches,50);
assert.equal(research.teams,100);
const p25=research.quartiles.top_share['25'],median=research.quartiles.top_share['50'],
      p75=research.quartiles.top_share['75'],p90=research.quartiles.top_share['90'];
const positions=['s','oh1','mb1','opp','oh2','lib','mb2','bn','hc'];
const score={rows:positions.map((id,i)=>({
  cand:{id:'sample-'+i,n:'Player '+i,a:[73,72,82,80,76,76,72,77,74,74,71,75]},
  pos:{id,ab:id.toUpperCase(),imp:1,coach:id==='hc',bench:id==='bn'},
  fit:75+(i%4)*3
}))};
function quantile(values,fraction){
  const valuesSorted=values.slice().sort((a,b)=>a-b),k=(valuesSorted.length-1)*fraction,
    lower=Math.floor(k),upper=Math.min(valuesSorted.length-1,lower+1);
  return valuesSorted[lower]+(valuesSorted[upper]-valuesSorted[lower])*(k-lower);
}
const shares=[],twoShares=[];
for(let i=0;i<2400;i++){
  const seed='research-benchmark-'+i;
  const make=()=>daBoxScore('volleyball',score,3,seed,{note:'25-23 25-21 25-19',side:0});
  const entries=make();
  if(i<3)assert.deepEqual(entries,make(),'match scoring must be deterministic');
  const byRole=Object.fromEntries(entries.map(r=>[r.position,r]));
  for(const role of ['lib'])for(const m of ['KILLS','BLK'])
    assert(!byRole[role].stats.some(([key])=>key===m),role+' cannot get '+m);
  for(const role of ['mb1','mb2'])for(const m of ['AST','DIG'])
    assert(!byRole[role].stats.some(([key])=>key===m),role+' cannot get '+m);
  const pointList=[];
  for(const r of entries.filter(r=>!['bn','hc'].includes(r.position))){
    const get=k=>r.stats.find(([key])=>key===k)?.[1]||0;
    assert.equal(get('PTS'),get('KILLS')+get('BLK')+get('ACE'),r.position+' point mismatch');
    pointList.push(get('PTS'));
  }
  pointList.sort((a,b)=>b-a);
  const total=pointList.reduce((a,b)=>a+b,0);
  shares.push(pointList[0]/total);
  twoShares.push((pointList[0]+pointList[1])/total);
}
const medianSim=quantile(shares,.5),p25Sim=quantile(shares,.25),
      p75Sim=quantile(shares,.75),p90Sim=quantile(shares,.9),
      twoSim=quantile(twoShares,.5),
      balanced=shares.filter(x=>x<.25).length/shares.length,
      dominant=shares.filter(x=>x>.35).length/shares.length;
// Allow sampling and lineups to differ; prevent regressions back to completely
// even scoring or overconcentration. The real study remains the source of truth.
assert(Math.abs(medianSim-median)<.055,'median scorer share diverged from research');
assert(Math.abs(p25Sim-p25)<.055,'25th-percentile share diverged');
assert(Math.abs(p75Sim-p75)<.055,'75th-percentile share diverged');
assert(Math.abs(p90Sim-p90)<.07,'90th-percentile share diverged');
assert(Math.abs(twoSim-research.quartiles.top_two_share['50'])<.07,'top-two concentration diverged');
assert(Math.abs(balanced-research.balanced_rate)<.12,'balanced match frequency diverged');
assert(Math.abs(dominant-research.dominant_rate)<.12,'dominant match frequency diverged');
console.log(JSON.stringify({research:{median,p25,p75,p90,balanced:research.balanced_rate,dominant:research.dominant_rate},sim:{medianSim,p25Sim,p75Sim,p90Sim,twoSim,balanced,dominant}},null,2));
console.log("Passed men's volleyball scoring calibration regression.");

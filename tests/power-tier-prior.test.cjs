const test=require('node:test');
const assert=require('node:assert/strict');
const prior=require('../data/power-tier-prior.js');
const {resolveBrawlCombat}=require('../data/brawl-combat.js');
const KEYS=['spd','agi','str','siz','lep','end','tch','acc','ref','iq','clu','ldr'];
const hero=(pool,n,v=75)=>({pool,n,id:pool+':'+n,a:KEYS.map(()=>v)});
const team=chars=>({rating:80,rows:chars.map((cand,i)=>({cand,fit:80,pos:{id:'p'+i,tank:i<2,coach:false,bench:false}}))});
const rng=seed=>{let s=seed>>>0;return()=>((s=(Math.imul(1664525,s)+1013904223)>>>0)/4294967296);};
const names=['A','B','C','D','E'];
const mk=pool=>team(names.map(n=>hero(pool,n)));
function winsFor(left,right,n=200){let w=0;for(let i=0;i<n;i++){const r=resolveBrawlCombat(left,right,[80,80],rng(7+i*31));w+=r.winner===0;}return w;}

test('with no tier data loaded every lookup is null and the factor is neutral',()=>{
  prior.setPowerTiers(null);
  assert.equal(prior.powerTierOf(hero('mcu','A')),null);
  assert.equal(prior.powerTierFactor(null),1);
});
test('combat is byte-identical when no tier data is loaded',()=>{
  prior.setPowerTiers(null);
  const a=JSON.stringify(resolveBrawlCombat(mk('mcu'),mk('dc'),[80,80],rng(5)));
  prior.setPowerTiers({tiers:{}});
  const b=JSON.stringify(resolveBrawlCombat(mk('mcu'),mk('dc'),[80,80],rng(5)));
  assert.equal(a,b);
});
test('factor is bounded: S is +3%, C neutral, F is -3%, nothing beyond',()=>{
  assert.equal(prior.powerTierFactor('C'),1);
  assert.ok(Math.abs(prior.powerTierFactor('S')-1.03)<1e-9);
  assert.ok(Math.abs(prior.powerTierFactor('F')-0.97)<1e-9);
  assert.equal(prior.powerTierFactor('Z'),1);
});
test('a tier gap tilts identical-stat fighters but never guarantees the result',()=>{
  const ids=pool=>names.map(n=>pool+':'+n);
  prior.setPowerTiers({tiers:{mcu:{S:ids('mcu')},dc:{F:ids('dc')}}});
  const w=winsFor(mk('mcu'),mk('dc'));
  prior.setPowerTiers(null);
  const neutral=winsFor(mk('mcu'),mk('dc'));
  assert.ok(w>neutral,'S side should win more than with no tiers: '+w+' vs '+neutral);
  assert.ok(w<200,'the prior must not make outcomes certain');
});
test('the tier letter is never part of the combat result shown to players',()=>{
  prior.setPowerTiers({tiers:{mcu:{S:names.map(n=>'mcu:'+n)}}});
  const r=resolveBrawlCombat(mk('mcu'),mk('dc'),[80,80],rng(3));
  prior.setPowerTiers(null);
  assert.ok(!/tier(Prior|Factor)/.test(JSON.stringify(r)));
});

const test = require('node:test');
const assert = require('node:assert/strict');
const {MUPPET_FORCE_DIMENSIONS,MUPPET_FORCE_PROFILES,MUPPET_FORCE_RULE,muppetForceOf,muppetForceFit} = require('../data/muppet-force.js');
const muppet = n => ({pool:'muppets',n});
const battler = {};
test('MuppetForce is a separate five-dimensional capability', () => {
  assert.equal(MUPPET_FORCE_DIMENSIONS.length,5);
  assert.ok(Math.abs(MUPPET_FORCE_DIMENSIONS.reduce((s,d)=>s+d.weight,0)-1)<1e-9);
  assert.equal(MUPPET_FORCE_RULE.name,'MuppetForce');
});
test('Character-specific scores are stable, bounded, and non-universal',()=>{
  assert.ok(Object.keys(MUPPET_FORCE_PROFILES).length>=25);
  for(const name of Object.keys(MUPPET_FORCE_PROFILES)){
    const r=muppetForceOf(muppet(name));
    assert.ok(r.score>=0&&r.score<=99,name);
    assert.ok(Object.values(r.dimensions).every(v=>Number.isInteger(v)&&v>=0&&v<=99),name);
  }
  assert.equal(muppetForceOf({pool:'toons',n:'Gonzo'}),null);
  assert.equal(muppetForceOf(muppet('Unknown character')),null);
});
test('Environmental prowess is not automatically identical for every Muppet',()=>{
  assert.ok(muppetForceOf(muppet('Gonzo')).score>muppetForceOf(muppet('Bert')).score);
  assert.ok(muppetForceOf(muppet('Gonzo')).score>=MUPPET_FORCE_RULE.campaignMinimum);
  assert.ok(muppetForceOf(muppet('Bert')).score<MUPPET_FORCE_RULE.campaignMinimum);
});
test('Situational advantage never rewrites original attributes',()=>{
  const c={...muppet('Gonzo'),a:[60,74,40,40,70,90,70,50,60,44,90,40]};
  const before=c.a.slice();
  const brawl=muppetForceFit(c,'brawl',battler);
  const basketball=muppetForceFit(c,'basketball',battler);
  assert.ok(brawl>basketball);
  assert.ok(brawl>0&&brawl<=1.75);
  assert.ok(basketball>=0&&basketball<=0.7);
  assert.deepEqual(c.a,before);
  assert.equal(muppetForceFit(c,'brawl',{coach:true}),0);
  assert.equal(muppetForceFit(c,'brawl',{bench:true}),0);
  assert.equal(muppetForceFit({pool:'nba',n:'Michael Jordan'},'brawl',battler),0);
});

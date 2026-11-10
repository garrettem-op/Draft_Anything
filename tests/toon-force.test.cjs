const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {TOON_FORCE_PROFILES,toonForceOf,toonForceMultiplier}=require('../data/toon-force.js');
const sample=n=>({pool:'toons',n,a:Array(12).fill(70)});

test('ToonForce is curated from individual slapstick portrayals, not assigned to every cartoon',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  const start=html.indexOf('POOLS.toons ='),end=html.indexOf('POOLS.muppets =',start);
  const names=[...html.slice(start,end).matchAll(/^\s*\["([^"]+)"/gm)].map(m=>m[1]);
  const catalog=Object.keys(TOON_FORCE_PROFILES);
  assert.ok(catalog.length>=40,'ToonForce should cover iconic physics-driven cartoons');
  assert.ok(catalog.length<names.length,'Animation alone cannot prove reality-defying physics');
  assert.ok(catalog.every(n=>names.includes(n)),'ToonForce must not use un-draftable identities');
  for(const n of catalog){
    const profile=toonForceOf(sample(n));
    assert.ok(profile.score>=50&&profile.score<=99,n);
    assert.ok(profile.feat.length>45&&profile.limit.length>24,n);
  }
  assert.equal(toonForceOf(sample('Aang')),null,'Ordinary bending is not automatically ToonForce');
  assert.equal(toonForceOf({pool:'muppets',n:'Bugs Bunny'}),null,'No cross-pool power leakage');
  assert.equal(toonForceOf(sample('Not a character')),null);
});

test('ToonForce and MuppetForce use the same multiplicative interface with different strengths',()=>{
  const {muppetForceMultiplier,muppetForceTeamwork}=require('../data/muppet-force.js');
  const pos={id:'pg'},base=70;
  const bugs=sample('Bugs Bunny'),gonzo={pool:'muppets',n:'Gonzo',a:Array(12).fill(55)};
  const teen=sample('Aang');
  const tf=toonForceMultiplier(bugs,'basketball',pos);
  const tfBrawl=toonForceMultiplier(bugs,'brawl',pos);
  const mf=muppetForceMultiplier(gonzo,'basketball',pos);
  const mfBrawl=muppetForceMultiplier(gonzo,'brawl',pos);
  assert.ok(tf>1&&tfBrawl>tf);
  assert.ok(mf>1&&mfBrawl>mf);
  assert.ok(base*tf>base&&base*mf>base,'Both multiply a normal position rating');
  assert.equal(toonForceMultiplier(teen,'basketball',pos),1);
  assert.equal(toonForceMultiplier(bugs,'basketball',{coach:true}),1);
  assert.equal(muppetForceMultiplier(bugs,'basketball',pos),1);
  assert.equal(toonForceMultiplier(gonzo,'basketball',pos),1);
  assert.equal(muppetForceTeamwork({pg:bugs,sg:teen},[{id:'pg'},{id:'sg'}],80).points,0,
    'Only Muppets create camaraderie; ToonForce affects its owner');
});

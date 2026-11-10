const test = require('node:test');
const assert = require('node:assert/strict');
const {MUPPET_FORCE_DIMENSIONS,MUPPET_FORCE_PROFILES,MUPPET_FORCE_RULE,muppetForceOf,muppetForceFit,MUPPET_FORCE_WORKS,MUPPET_FORCE_FEATS,muppetForceHistoryOf,muppetForceMultiplier,muppetForceTeamwork} = require('../data/muppet-force.js');
const muppet = n => ({pool:'muppets',n});
const battler = {};
test('MuppetForce is a separate five-dimensional capability', () => {
  assert.equal(MUPPET_FORCE_DIMENSIONS.length,5);
  assert.ok(Math.abs(MUPPET_FORCE_DIMENSIONS.reduce((s,d)=>s+d.weight,0)-1)<1e-9);
  assert.equal(MUPPET_FORCE_RULE.name,'MuppetForce');
});
test('all 101 official Muppet roster characters have individualized MuppetForce assessments',()=>{
  const fs=require('node:fs'),path=require('node:path');
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  const begin=html.indexOf('POOLS.muppets ='),end=html.indexOf('POOLS.games =',begin);
  const names=[...html.slice(begin,end).matchAll(/^\s*\["([^"]+)"/gm)].map(m=>m[1]);
  assert.equal(names.length,101);
  assert.deepEqual(new Set(names),new Set(Object.keys(MUPPET_FORCE_PROFILES)));
  for(const n of names){
    const value=muppetForceOf(muppet(n));
    assert.ok(value&&Number.isInteger(value.score),n+' has no rating');
    assert.ok(value.score>0&&value.score<=99,n);
    assert.ok(value.feat?.length>30&&value.limit?.length>20,n+' requires a specific rationale and limit');
  }
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
  assert.ok(brawl>1&&brawl<=1.52);
  assert.ok(basketball>1&&basketball<=1.36);
  assert.equal(muppetForceMultiplier(c,'basketball',battler),basketball);
  assert.deepEqual(c.a,before);
  assert.equal(muppetForceFit(c,'brawl',{coach:true}),1);
  assert.equal(muppetForceFit(c,'brawl',{bench:true}),1);
  assert.equal(muppetForceFit({pool:'nba',n:'Michael Jordan'},'brawl',battler),1);
});

test('The Muppet filmography marks Treasure Island as initially reviewed, not all films audited',()=>{
  assert.ok(MUPPET_FORCE_WORKS.length>=9);
  const movie=MUPPET_FORCE_WORKS.find(x=>x.id==='muppet-treasure-island-1996');
  assert.equal(movie.year,1996);
  assert.equal(movie.status,'initial-feats-reviewed');
  assert.ok(MUPPET_FORCE_WORKS.some(x=>x.status==='research-queued'));
});
test('Sourced film events map only to the correct character and fictional-role continuity',()=>{
  assert.ok(MUPPET_FORCE_FEATS.length>=10);
  const ids=new Set(MUPPET_FORCE_FEATS.map(f=>f.id));
  assert.equal(ids.size,MUPPET_FORCE_FEATS.length);
  const workIds=new Set(MUPPET_FORCE_WORKS.map(w=>w.id));
  const dimensions=new Set(MUPPET_FORCE_DIMENSIONS.map(d=>d.key));
  for(const f of MUPPET_FORCE_FEATS){
    assert.ok(workIds.has(f.workId),f.id);
    assert.ok(dimensions.has(f.dimension),f.id);
    assert.ok(Array.isArray(f.sources)&&f.sources.every(s=>s.startsWith('https://')),f.id);
    assert.ok(['fictional-role','character-portrayal'].includes(f.continuity),f.id);
  }
  const g=muppetForceHistoryOf(muppet('Gonzo'));
  assert.ok(g.some(f=>f.id==='mti-gonzo-torture'));
  assert.ok(g.some(f=>f.id==='mti-gonzo-starfish'));
  assert.ok(muppetForceHistoryOf(muppet('Kermit the Frog')).some(f=>f.inference.includes('does not prove surviving a fall')));
  assert.deepEqual(muppetForceHistoryOf({pool:'toons',n:'Gonzo'}),[]);
  assert.deepEqual(muppetForceHistoryOf(muppet('Not on the ship')),[]);
});

test('Muppet camaraderie improves other roster members without infinite bonus stacking',()=>{
  const pg={id:'pg',imp:1},sf={id:'sf',imp:1},hc={id:'hc',coach:true,imp:0},bench={id:'bench',bench:true,imp:0};
  const normal={pool:'nba',n:'Michael Jordan',a:Array(12).fill(90)};
  const gonzo={...muppet('Gonzo'),a:Array(12).fill(60)};
  const kermit={...muppet('Kermit the Frog'),a:Array(12).fill(55)};
  const empty=muppetForceTeamwork({pg:normal,sf:normal},[pg,sf],75);
  assert.equal(empty.points,0);
  const solo=muppetForceTeamwork({pg:gonzo},[pg,sf],75);
  assert.equal(solo.points,0,'No team camaraderie without teammates');
  const mixed=muppetForceTeamwork({pg:gonzo,sf:normal},[pg,sf],75);
  assert.ok(mixed.points>0&&mixed.percent<8);
  assert.equal(mixed.performers,1);
  assert.equal(mixed.teammates,2);
  const group=muppetForceTeamwork({pg:gonzo,sf:kermit,hc:kermit,bench:gonzo},[pg,sf,hc,bench],75);
  assert.ok(group.percent>mixed.percent,'More Muppet members increase camaraderie');
  assert.ok(group.percent<=8&&group.points<=6);
  assert.deepEqual(gonzo.a,Array(12).fill(60),'Team aura must not change raw stats');
  assert.equal(muppetForceTeamwork({pg:normal,sf:normal},[pg,sf],75).points,0);
});
test('MuppetForce is a post-attribute multiplier, mirrored in AI and the actual game score',()=>{
  const html=require('node:fs').readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
  assert.match(html,/return \(b \+ expertAdj\(sportKey, c, pos, b\)\)\*characterForceMultiplier\(sportKey,c,pos\)/);
  assert.match(html,/const muppetTeam=muppetForceTeamwork\(roster,sp\.pos,baseRating\)/);
  assert.match(html,/baseRating\+muppetForceTeamwork\(roster,sp\.pos,baseRating\)\.points/);
  assert.match(html,/function batFitAI\(c\).*characterForceMultiplier\('baseball',c,BAT_POS\)/);
});

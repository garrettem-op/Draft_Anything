// Regression tests for the 2026-11-27 combat audit: skill-domain transfer, ordinary bodies, ToonForce gate.
// Benchmark battle: Aladdin, Rambo, Maximus, Wick, Achilles (Bourne, Leonidas) vs
// Conan, Marge Simpson, Stephen Curry, Bryan Mills, Hawkeye (Bill Russell, Colonel Bagley).
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const {combatTransfer,combatAttributes}=require('../data/brawl-combat-transfer.js');
const {toonForceOf,toonForceMultiplier,toonForceCombatGate}=require('../data/toon-force.js');
const KEYS=['spd','agi','str','siz','lep','end','tch','acc','ref','iq','clu','ldr'];
const at=(a,k)=>a[KEYS.indexOf(k)];
const hero=(pool,n,a,extra={})=>({id:pool+':'+n,pool,n,a,...extra});
const curry=hero('nba','Stephen Curry',[82,90,60,67,72,94,96,99,92,94,97,90]);
const hawkeye=hero('mcu','Hawkeye',[70,86,63,59,76,86,98,99,93,92,96,85]);
const kareem=hero('nba','Kareem Abdul-Jabbar',[70,72,78,91,82,92,85,88,82,92,90,85]);
const lcg=seed=>{let s=seed>>>0;return()=>((s=Math.imul(s,1664525)+1013904223>>>0)/4294967296);};
// brawl-combat.js reads optional browser globals when it is loaded, so each case gets a fresh copy.
function loadCombat(globals={}){
  for(const [k,v] of Object.entries(globals))globalThis[k]=v;
  const file=require.resolve('../data/brawl-combat.js');
  delete require.cache[file];
  return require(file);
}
function unloadGlobals(...names){for(const n of names)delete globalThis[n];}

test('sporting skill carries into a fight only partly; physical gifts carry in full',()=>{
  const t=combatTransfer(curry),a=combatAttributes(curry);
  assert.equal(t.domain,'sport');
  for(const k of ['spd','agi','str','siz','lep','end','ref','clu','ldr'])assert.equal(at(a,k),at(curry.a,k),k+' must be unchanged');
  assert.ok(at(a,'acc')<70&&at(a,'acc')>50,'a jump shot is not marksmanship');
  assert.ok(at(a,'tch')<70&&at(a,'iq')<at(curry.a,'iq'));
  assert.deepEqual(curry.a,[82,90,60,67,72,94,96,99,92,94,97,90],'stored attributes are never modified');
});
test('combat-proven skill and unreviewed characters are untouched; exceptions are individual and sourced',()=>{
  assert.equal(combatTransfer(hawkeye).domain,'combat');
  assert.equal(combatAttributes(hawkeye),hawkeye.a);
  const k=combatTransfer(kareem);
  assert.equal(k.domain,'sport-trained');
  assert.match(k.reason,/Bruce Lee/);
  assert.match(k.source,/^https:\/\//);
  assert.ok(at(combatAttributes(kareem),'acc')>50+.3*(88-50));
  // Low skill is never raised toward the baseline.
  const raw=hero('nba','Test Center',[70,70,90,90,80,90,40,30,80,45,70,70]);
  assert.equal(at(combatAttributes(raw),'acc'),30);
  assert.equal(at(combatAttributes(raw),'tch'),40);
});
test('an elite shooter is no longer a fully credible attacker, an elite archer still is',()=>{
  const {offensiveCredibility}=loadCombat();
  assert.equal(offensiveCredibility(hawkeye),1);
  const c=offensiveCredibility(curry);
  assert.ok(c>.6&&c<.85,'Curry offensive capability '+c);
});
test('identical attributes hit harder when the skill was earned in combat',()=>{
  const {resolveBrawlCombat}=loadCombat();
  const attrs=[82,90,60,67,72,94,96,99,92,94,97,90];
  const dummy=hero('mcu','Sparring Partner',Array(12).fill(70));
  const side=c=>({rating:80,rows:[{pos:{id:'d1'},cand:c,fit:85}]});
  let sport=0,combat=0;
  for(let i=1;i<=200;i++){
    sport+=resolveBrawlCombat(side(hero('nba','Shooter',attrs)),side(dummy),[80,80],lcg(i)).sides[0].damage;
    combat+=resolveBrawlCombat(side(hero('mcu','Marksman',attrs)),side(dummy),[80,80],lcg(i)).sides[0].damage;
  }
  assert.ok(sport<combat,'sport '+sport+' vs combat '+combat);
});
test('ordinary human bodies never reach the beyond-human physical tier or full unarmed credibility',()=>{
  const strongHuman=hero('nba','Strong Human',[74,70,99,95,86,90,60,35,80,80,82,85]);
  const monster=hero('mcu','Monster',[74,70,99,95,86,90,60,35,80,80,82,85]);
  const {resolveBrawlCombat,offensiveCredibility}=loadCombat({campaignTraitAllowed:(c,t)=>t==='mortal'&&c.pool==='nba'});
  try{
    const side=c=>({rating:80,rows:[{pos:{id:'d1'},cand:c,fit:85}]});
    const r=resolveBrawlCombat(side(strongHuman),side(monster),[80,80],lcg(7));
    assert.equal(r.sides[0].fighters[0].physicalTier,2);
    assert.equal(r.sides[0].fighters[0].ordinaryBody,true);
    assert.equal(r.sides[1].fighters[0].physicalTier,3);
    assert.ok(offensiveCredibility(strongHuman)<1);
    assert.equal(offensiveCredibility(monster),1,'a beyond-human body is its own weapon');
  }finally{unloadGlobals('campaignTraitAllowed');loadCombat();}
});
test('ToonForce in a fight scales with how well-evidenced the cartoon physics is',()=>{
  assert.equal(toonForceCombatGate(60),0);
  assert.equal(toonForceCombatGate(90),1);
  assert.ok(toonForceCombatGate(71)<toonForceCombatGate(88));
  const tank={id:'tk1',tank:true},dps={id:'d1',styles:[]};
  const toon=n=>({pool:'toons',n});
  const marge=toonForceMultiplier(toon('Marge Simpson'),'brawl',tank);
  const homer=toonForceMultiplier(toon('Homer Simpson'),'brawl',tank);
  const tom=toonForceMultiplier(toon('Tom'),'brawl',tank);
  const bugs=toonForceMultiplier(toon('Bugs Bunny'),'brawl',tank);
  assert.ok(marge<1.10,'household slapstick is not tank durability: '+marge);
  assert.ok(marge<homer&&homer<tom,'ordered by demonstrated resilience');
  assert.ok(bugs>=1.44&&tom>=1.43,'extraordinary profiles keep their full effect');
  assert.ok(toonForceMultiplier(toon('Marge Simpson'),'brawl',dps)<1.05);
  // Sports are a separate ruling (Space Jam) and are unchanged by the combat gate.
  assert.ok(toonForceMultiplier(toon('Marge Simpson'),'basketball',{id:'sf'})>1.2);
  assert.equal(toonForceOf(toon('Marge Simpson')).tier,'situational');
});

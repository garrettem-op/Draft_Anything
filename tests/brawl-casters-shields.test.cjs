// Owner ruling 2026-11-27 (option C): individual sourced caster profiles and documented power shields.
const test=require('node:test');
const assert=require('node:assert/strict');
const lcg=seed=>{let s=seed>>>0;return()=>((s=Math.imul(s,1664525)+1013904223>>>0)/4294967296);};
const hero=(pool,n,a=Array(12).fill(70),extra={})=>({id:pool+':'+n,pool,n,a,...extra});
function load(){
  for(const f of ['../data/brawl-attack-profiles.js','../data/brawl-combat.js'])delete require.cache[require.resolve(f)];
  const api=require('../data/brawl-attack-profiles.js');
  globalThis.DA_BRAWL_ABILITY_API=api;
  return {...api,combat:require('../data/brawl-combat.js')};
}
test('iconic casters have individual sourced profiles, never the generic attack',()=>{
  const {brawlAbilityOf}=load();
  for(const id of ['harrypotter:Albus Dumbledore','harrypotter:Lord Voldemort','lotr:Gandalf','lotr:Saruman','lotr:Sauron',
    'starwars:Yoda','starwars:Luke Skywalker','starwars:Emperor Palpatine','starwars:Count Dooku','starwars:Darth Vader','mcu:Doctor Strange',
    'dc:Doctor Fate','dc:Zatanna','toons:Genie']){
    const [pool,n]=[id.slice(0,id.indexOf(':')),id.slice(id.indexOf(':')+1)];
    const p=brawlAbilityOf(hero(pool,n));
    assert.ok(p&&!p.derived,id);
    assert.ok(p.tier>=3&&p.tier<=4,id+' tier '+p.tier);
    assert.match(p.source,/^https:\/\//,id);
    assert.ok(p.limit.length>=40,id+' needs a stated limit');
  }
});
test('shields are individual, sourced and never inherited by forms',()=>{
  const {brawlShieldOf,SHIELDS}=load();
  assert.ok(Object.keys(SHIELDS).length>=5);
  for(const [id,s] of Object.entries(SHIELDS)){
    assert.match(s.source,/^https:\/\//,id);assert.ok(s.feat.length>=25,id);
    assert.ok(s.level>=1&&s.level<=3,id);
    assert.ok(['all','powers'].includes(s.blocks),id);
  }
  assert.equal(brawlShieldOf(hero('mcu','Jean Grey')).kind,'telekinetic');
  assert.equal(brawlShieldOf(hero('mcu','Jean Grey',undefined,{variantBase:'Jean Grey'})),null);
  assert.equal(brawlShieldOf(hero('mcu','Hawkeye')),null);
});
test('a shield absorbs part of incoming damage until spent, and the report still reconciles',()=>{
  const {combat}=load();
  const attrs=[70,70,50,55,60,60,60,60,75,85,80,70];
  const brute=hero('mcu','Brute',[80,75,95,85,80,90,85,80,80,70,80,60]);
  const side=c=>({rating:80,rows:[{pos:{id:'d1'},cand:c,fit:85}]});
  let shielded=0,plain=0,absorbed=0;
  for(let i=1;i<=200;i++){
    const a=combat.resolveBrawlCombat(side(hero('mcu','Jean Grey',attrs)),side(brute),[80,80],lcg(i));
    const b=combat.resolveBrawlCombat(side(hero('mcu','Unshielded',attrs)),side(brute),[80,80],lcg(i));
    const f=a.sides[0].fighters[0];
    assert.ok(f.shieldAbsorbed<=f.shieldMax,'never absorbs more than its pool');
    assert.ok(f.mit>=f.shieldAbsorbed,'shield absorption is counted as mitigation');
    absorbed+=f.shieldAbsorbed;shielded+=a.sides[0].fighters[0].roundsAlive;plain+=b.sides[0].fighters[0].roundsAlive;
  }
  assert.ok(absorbed>0);
  assert.ok(shielded>plain,'a shielded fighter survives longer: '+shielded+' vs '+plain);
});

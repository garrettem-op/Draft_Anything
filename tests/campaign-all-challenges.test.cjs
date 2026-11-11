// Cross-pool Campaign eligibility regressions. No AI calls or paid APIs.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const abilities=require('../data/character-abilities.js');

function harness(){
  const ctx=vm.createContext({
    window:{},
    S:{campaign:{history:[],roster:{},step:0,status:'draft',sport:'basketball'}},
    SPORTS:{basketball:{pos:Array.from({length:5},(_,i)=>({id:'p'+i}))}},
    KnowledgeEngine:{has:()=>false},
    characterAbilityTags:abilities.characterAbilityTags,
    CHARACTER_ABILITY_DISPUTES:abilities.CHARACTER_ABILITY_DISPUTES,
    muppetForceOf:()=>null,
    MUPPET_FORCE_RULE:{campaignMinimum:65},
    lsGet:()=>({}),lsSet:()=>{},
    getCands:()=>[]
  });
  vm.runInContext(read('data/new-pool-traits.js'),ctx,{filename:'data/new-pool-traits.js'});
  vm.runInContext(read('data/campaign.js')+'\nthis.campaignApi={CAMPAIGN_STAGES,CAMPAIGN_EXTRA,CAMPAIGN_RULE_CRITERIA,campaignAllowed,campaignEligibilityResult,campaignTraitEvidence,campaignHasTheme};',ctx,{filename:'data/campaign.js'});
  const make=(pool,n,attrs={})=>{
    const a=Array(12).fill(82);
    if(attrs.spd!==undefined)a[0]=attrs.spd;
    return {pool,n,id:pool+':'+n,a,t:'One-line roster description'};
  };
  const result=(pool,n,rule,attrs,pos)=>{
    ctx.subject=make(pool,n,attrs);
    ctx.testRule=rule;
    ctx.testPos=pos||null;
    return vm.runInContext('campaignEligibilityResult(subject,testRule,testPos)',ctx);
  };
  return {ctx,make,result,api:ctx.campaignApi};
}

test('all 34 defined Campaign challenges use the one explainable evaluator',()=>{
  const h=harness();
  const stages=[...h.api.CAMPAIGN_STAGES,...h.api.CAMPAIGN_EXTRA];
  assert.equal(stages.length,34);
  assert.equal(new Set(stages.map(x=>x.rule)).size,34);
  for(const stage of stages){
    const r=h.result('games','Blinky',stage.rule);
    assert.equal(typeof r.allowed,'boolean',stage.rule);
    assert.equal(typeof r.reason,'string',stage.rule);
    assert.ok(r.reason.length,stage.rule);
    assert.equal(h.api.campaignAllowed(h.make('games','Blinky'),stage.rule),r.allowed,stage.rule);
  }
});

test('Seeing Red uses actual universe-scoped appearance evidence, not just a character name',()=>{
  const h=harness();
  for(const [pool,name] of [
    ['games','Blinky'],['muppets','Red Fraggle'],['muppets','Elmo'],
    ['muppets','Animal'],['games','Dante'],['games','M. Bison'],
    ['dc','Red Robin (Tim Drake)'],['toons','Lisa Simpson'],['pokemon','Voltorb']
  ]) assert.equal(h.result(pool,name,'red').allowed,true,pool+':'+name);
  for(const [pool,name] of [
    ['lotr','Glaurung'],['games','Scorpion'],
    ['starwars','Savage Opress'],['pokemon','Charmander']
  ]) assert.equal(h.result(pool,name,'red').allowed,false,pool+':'+name);
  assert.match(h.result('lotr','Glaurung','red').reason,/golden/i);
  assert.equal(h.result('lotr','Unknown Red Hero','red').source,'missing-trait-evidence');
});

test('female identities work across Muppets, animation, games, Pokémon, Star Wars and new universes',()=>{
  const h=harness();
  for(const [pool,name] of [
    ['muppets','Red Fraggle'],['muppets','Mokey Fraggle'],
    ['toons','Katara'],['games','Chell'],['pokemon','Nidoqueen'],
    ['starwars','Leia Organa'],['dc','Wonder Woman'],
    ['lotr','Galadriel'],['harrypotter','Hermione Granger']
  ]) assert.equal(h.result(pool,name,'women').allowed,true,pool+':'+name);
  assert.equal(h.result('muppets','Kermit the Frog','women').allowed,false);
});

test('child status is separate from identity and depends on the drafted continuity',()=>{
  const h=harness();
  for(const [pool,name] of [
    ['muppets','Elmo'],['muppets','Robin the Frog'],
    ['games','Atreus'],['toons','Bluey'],['starwars','Grogu'],
    ['dc','Robin (Damian Wayne)'],['harrypotter','Harry Potter'],
    ['mcu','Ms. Marvel']
  ]) assert.equal(h.result(pool,name,'kids').allowed,true,pool+':'+name);
  assert.equal(h.result('games','Nathan Drake','kids').allowed,false);
});

test('nonpowered challenge accepts ordinary human skills while rejecting powered examples',()=>{
  const h=harness();
  for(const [pool,name] of [
    ['games','Nathan Drake'],['games','Lara Croft'],
    ['toons','Mulan'],['starwars','Han Solo'],
    ['dc','Batman'],['lotr','Aragorn'],
    ['harrypotter','Jacob Kowalski']
  ]) assert.equal(h.result(pool,name,'mortal').allowed,true,pool+':'+name);
  assert.equal(h.result('mcu','Thor','mortal').allowed,false);
  assert.equal(h.result('nba','Generic Athlete','mortal').allowed,true);
});

test('source pool and character identity do not bleed across universes',()=>{
  const h=harness();
  assert.equal(h.result('muppets','Blinky','red').allowed,false);
  assert.equal(h.result('games','Red Fraggle','red').allowed,false);
  assert.equal(h.result('games','Wonder Woman','women').allowed,false);
  assert.equal(h.result('dc','Red Fraggle','red').allowed,false);
});

test('ability challenges use reviewed ability tags, and absence provides a reason rather than inventing power',()=>{
  const h=harness();
  assert.equal(h.result('mcu','Iron Man','flight').allowed,true);
  const denied=h.result('muppets','Red Fraggle','flight');
  assert.equal(denied.allowed,false);
  assert.match(denied.reason,/verified flight ability/i);
});

test('universe, stat, MuppetForce, history and composite requirements report their own failures',()=>{
  const h=harness();
  const queries=[
    ['games','Blinky','middle-earth-only',/requires a character from/i],
    ['games','Blinky','muppetforce',/muppetforce/i],
    ['games','Blinky','brain',/IQ/i],
    ['mcu','Thor','brains-not-brawn',/IQ|Strength/i]
  ];
  for(const [pool,name,rule,reason] of queries){
    const r=h.result(pool,name,rule);
    assert.equal(r.allowed,false,rule);
    assert.match(r.reason,reason,rule);
  }
  h.ctx.S.campaign.history=[{ids:['games:Blinky']}];
  assert.match(h.result('games','Blinky','final').reason,/winning Campaign lineup/i);
  assert.equal(h.result('games','Blinky','final').allowed,false);
});

test('missing a classification remains unverified; appeal is never automatically billed',()=>{
  const h=harness();
  for(const rule of ['red','women','kids','mortal']){
    const r=h.result('games','Unreviewed Character',rule);
    assert.equal(r.allowed,false);
    assert.equal(r.source,'missing-trait-evidence');
    assert.match(r.reason,/missing data is not proof/i);
    assert.equal(h.api.campaignHasTheme(rule),false,'paid AI endpoint cannot review this rule');
  }
});

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function harness() {
  const context = vm.createContext({
    KnowledgeEngine: {has: () => false},
    muppetForceOf: () => null,
    MUPPET_FORCE_RULE: {campaignMinimum:65},
    lsGet: () => ({}),
    lsSet: () => {},
    SPORTS: {
      brawl: {
        pos: [
          ...Array.from({length:6},(_,i)=>({id:'fighter'+i,coach:false})),
          {id:'commander',coach:true}
        ]
      }
    },
    S: {campaign:{step:0,stageOrder:[10,1,2,3,4,5,6,7,8,9],history:[],sport:'brawl',roster:{},status:'draft'}}
  });
  const root=path.resolve(__dirname,'..');
  vm.runInContext(fs.readFileSync(path.join(root,'data/character-abilities.js'),'utf8'),context);
  vm.runInContext(fs.readFileSync(path.join(root,'data/campaign-eligibility.js'),'utf8'),context);
  vm.runInContext(fs.readFileSync(path.join(root,'data/campaign.js'),'utf8'),context);
  return context;
}
const present=(pool,n)=>({pool,n,a:Array(12).fill(50),id:pool+':'+n});
test('Skyborne corrects seven previously rejected picks with no knowledge API calls',()=>{
  const cx=harness();
  const picked=[
    present('pokemon','Moltres'),
    present('pokemon','Articuno'),
    present('pokemon','Zapdos'),
    present('games','Alduin'),
    present('starwars','Anakin Skywalker'),
    present('mcu','Ego'),
    present('starwars','Admiral Ackbar')
  ];
  picked.forEach((c,i)=>cx.S.campaign.roster[i===6?'commander':'fighter'+i]=c);
  const invalid=vm.runInContext('campaignInvalidSlots()',cx);
  assert.equal(invalid.size,0);
  const result=vm.runInContext("campaignQualified()",cx);
  assert.equal(result,true);
});
test('The source-backed records qualify only the exact pool and name',()=>{
  const cx=harness();
  for(const [pool,name] of [['pokemon','Moltres'],['pokemon','Articuno'],['pokemon','Zapdos'],['games','Alduin'],['starwars','Anakin Skywalker'],['mcu','Ego']]){
    const evidence=vm.runInContext("characterAbilityEvidence("+JSON.stringify({pool,n:name})+", 'flight')",cx);
    assert.equal(evidence.tag,'flight',pool+':'+name);
    assert.match(evidence.source,/^https:\/\//);
  }
  assert.equal(vm.runInContext("characterAbilityEvidence({pool:'toons',n:'Alduin'},'flight')",cx),null);
});
test('Ackbar qualifies only as the actual Commander, never as a flying fighter',()=>{
  const cx=harness();
  const commander=present('starwars','Admiral Ackbar');
  cx.candidate=commander;
  assert.equal(vm.runInContext("campaignAllowed(candidate,'flight',{coach:true})",cx),true);
  assert.equal(vm.runInContext("campaignAllowed(candidate,'flight',{coach:false})",cx),false);
  assert.equal(vm.runInContext("campaignAllowed(candidate,'flight')",cx),false);
  const source=vm.runInContext("CAMPAIGN_COMMANDER_SPECIALTIES['starwars:Admiral Ackbar'].flight.source",cx);
  assert.match(source,/starwars\.com/);
});
test('No one gets blanket Skyborne eligibility from a numerical Leap score',()=>{
  const cx=harness();
  cx.candidate={pool:'nba',n:'Unknown',a:Array(12).fill(99)};
  assert.equal(vm.runInContext("campaignAllowed(candidate,'flight',{coach:false})",cx),false);
});

test('Anakin has canonical Obi-Wan testimony of elite piloting, not self-flight',()=>{
  const cx=harness();
  const evidence=vm.runInContext("characterAbilityEvidence({pool:'starwars',n:'Anakin Skywalker'},'flight')",cx);
  assert.equal(evidence.kind,'elite-starfighter-pilot');
  assert.match(evidence.feat,/best star-pilot in the galaxy/);
  assert.match(evidence.creditedAssessment,/Obi-Wan Kenobi/);
  assert.match(evidence.dialogueSource,/A-New-Hope/);
  assert.match(evidence.feat,/not unaided personal flight/);
});

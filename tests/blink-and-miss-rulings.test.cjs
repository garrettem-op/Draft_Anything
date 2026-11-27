const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const ability=require('../data/character-abilities.js');
const source=fs.readFileSync(path.join(__dirname,'../data/campaign.js'),'utf8');
const ctx=vm.createContext({S:{campaign:{history:[],roster:{}}},KnowledgeEngine:{has:()=>false},characterAbilityTags:ability.characterAbilityTags});
vm.runInContext(source,ctx);
const cases=[
 ['harrypotter','Bellatrix Lestrange','magical-teleport',true],
 ['actionmovies','Agent Smith','digital-manifestation',false],
 ['dc','Anti-Monitor','dimensional-transport',false],
];
test('Blink and Miss accepts the three reviewed roster picks on both sides without paid appeals',()=>{
 for(const [pool,n,mode,self] of cases){
  const c={pool,n,id:pool+':'+n};
  ctx.c=c;
  for(const side of ['player','cpu']){
   ctx.side=side;
   assert.equal(vm.runInContext("campaignAllowed(c,'teleport',null,side)",ctx),true,c.id);
  }
  assert.ok(ability.characterAbilityTags(c).includes(mode),c.id);
  assert.equal(ability.characterAbilityTags(c).includes('self-teleport'),self,c.id);
  const p=ability.characterAbilityProvenance(c,mode);
  assert.equal(p?.basis,'evidence');
  assert.ok(p.record.limitation&&p.record.source);
 }
});
test('conditional abilities do not leak into other characters, universes or separately named forms',()=>{
 for(const c of [{pool:'actionmovies',n:'Agent Smith (Rogue)'},{pool:'dc',n:'Agent Smith'},{pool:'actionmovies',n:'John Wick'}]){
  assert.equal(ability.characterAbilityEvidence(c,'teleport'),null);
  ctx.c=c;
  assert.equal(vm.runInContext("campaignAllowed(c,'teleport')",ctx),false);
 }
 assert.ok(!ability.CHARACTER_ABILITY_RESEARCH_QUEUE.some(q=>q.id==='harrypotter:Bellatrix Lestrange'&&q.tag==='teleport'));
});

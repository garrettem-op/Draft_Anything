const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const {CHARACTER_ABILITIES,characterAbilityEvidence}=require('../data/character-abilities.js');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const campaign=fs.readFileSync(path.join(root,'data/campaign.js'),'utf8');
// Parse the actual pool data rather than a hand-built fixture to catch stale spellings.
function poolRoster() {
  const byPool={};
  for(const pool of ['nba','mcu','toons','muppets','games','pokemon','starwars']){
    const start=html.indexOf('POOLS.'+pool+' =');
    const entries=html.indexOf('entries: [',start);
    const end=html.indexOf('\n]};',entries);
    assert.ok(start>=0&&entries>=0&&end>entries,'Missing real pool '+pool);
    byPool[pool]=[...html.slice(entries,end).matchAll(/^\["([^"]+)"/gm)].map(x=>x[1]);
  }
  return byPool;
}
const pools=poolRoster();
const list=Object.entries(pools).flatMap(([pool,names])=>names.map(n=>({pool,n,id:pool+':'+n,a:Array(12).fill(85)})));
const state={campaign:{history:[],roster:{},step:0,stageOrder:Array.from({length:10},(_,i)=>i),sport:'basketball'}};
const context={S:state,SPORTS:{basketball:{pos:[{id:'a'}]}},getCands:()=>list,lsGet:(_,v)=>v,lsSet:()=>{},characterAbilityEvidence};
vm.runInNewContext(campaign+'\nthis.eligibilityTest={campaignAllowed,campaignInvalidSlots,CAMPAIGN_TAGS};',context);
const {campaignAllowed,CAMPAIGN_TAGS}=context.eligibilityTest;
test('all documented power facts refer to exactly one character in the named universe',()=>{
  for(const [id,facts] of Object.entries(CHARACTER_ABILITIES)){
    const p=id.indexOf(':');assert.ok(p>0,'Missing universe in '+id);
    const pool=id.slice(0,p),name=id.slice(p+1);
    assert.equal(pools[pool]?.filter(n=>n===name).length,1,'Missing or ambiguous roster character '+id);
    assert.ok(facts.length,id+' has no facts');
    for(const entry of facts){
      assert.ok(CAMPAIGN_TAGS[entry.tag] instanceof Set,'Unknown challenge tag '+entry.tag+' for '+id);
      assert.ok(entry.feat?.length>=20,'Missing specific feat for '+id);
      assert.match(entry.source,/^https:\/\/[^\s]+/,'Missing source URL for '+id);
    }
  }
});
test('all four challenged healer picks qualify, and more verified healers qualify',()=>{
  for(const id of ['toons:Katara','mcu:Ajak','starwars:Grogu','mcu:Abomination',
                   'starwars:Rey','starwars:Kylo Ren','starwars:IG-11']){
    const candidate=list.find(c=>c.id===id);
    assert.ok(candidate,id+' absent from the mashup pool');
    assert.ok(campaignAllowed(candidate,'healing'),id+' wrongly rejected by The Medics');
    assert.ok(characterAbilityEvidence(candidate,'healing')?.source,id+' missing evidence');
  }
});
test('healing does not blanket-approve unrelated candidates',()=>{
  for(const id of ['starwars:Han Solo','mcu:Kingpin','toons:Sokka']){
    const candidate=list.find(c=>c.id===id);
    if(candidate)assert.equal(campaignAllowed(candidate,'healing'),false,id+' should not be accepted');
  }
});
test('same-named characters in other universes do not inherit a power record',()=>{
  assert.equal(characterAbilityEvidence({pool:'nba',n:'Katara'},'healing'),null);
  assert.equal(characterAbilityEvidence({pool:'toons',n:'Grogu'},'healing'),null);
});
test('previous hand-verified eligibility is preserved',()=>{
  const hulk=list.find(c=>c.id==='mcu:Hulk');
  assert.ok(campaignAllowed(hulk,'healing'));
});
test('the four incorrectly rejected slots are no longer marked invalid',()=>{
  const found=['toons:Katara','mcu:Ajak','starwars:Grogu','mcu:Abomination'];
  // The Medics is CAMPAIGN_EXTRA[10], following ten standard stages.
  const medics=10+10;
  state.campaign.stageOrder[0]=medics;
  state.campaign.roster=Object.fromEntries(found.map((id,i)=>['slot'+i,list.find(c=>c.id===id)]));
  assert.equal(context.eligibilityTest.campaignInvalidSlots().size,0);
});

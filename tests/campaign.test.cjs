const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const code=fs.readFileSync(require('node:path').join(__dirname,'../data/campaign.js'),'utf8');
const S={campaign:{step:0,status:'setup',history:[],stageOrder:null}};
const localRecords={};
const lsGet=(key,fallback)=>localRecords[key]??fallback;
const lsSet=(key,value)=>{localRecords[key]=JSON.parse(JSON.stringify(value));};
let catalog=[];
const SPORTS={basketball:{pos:Array.from({length:5},(_,i)=>({id:'p'+i}))}};
const context={S,SPORTS,getCands:()=>catalog,lsGet,lsSet};
vm.runInNewContext(code+'\nthis.campaignTestApi={CAMPAIGN_STAGES,CAMPAIGN_EXTRA,CAMPAIGN_TAGS,CAMPAIGN_WOMEN,CAMPAIGN_RED,CAMPAIGN_KIDS,campaignStages,campaignNewOrder,campaignSportValid,campaignAllowed,campaignEligibleStageIds,campaignReset};',context);
const api=context.campaignTestApi;
const names=[...new Set([...api.CAMPAIGN_WOMEN,...api.CAMPAIGN_RED,...api.CAMPAIGN_KIDS,...Object.values(api.CAMPAIGN_TAGS).flatMap(set=>[...set])])];
catalog=names.map((n,i)=>({id:'id'+i,n,pool:i%3?'mcu':'nba',a:Array(12).fill(i%3?93:70)}));
test('twelve additional thematic cross-pool challenges are defined',()=>{
 assert.equal(api.CAMPAIGN_EXTRA.length,12);
 assert.equal(new Set(api.CAMPAIGN_EXTRA.map(x=>x.rule)).size,12);
});
test('random order has ten unique stages with final gauntlet last',()=>{
 for(let i=0;i<60;i++){
  const order=api.campaignNewOrder('basketball');
  assert.equal(order.length,10);
  assert.equal(new Set(order).size,10);
  assert.equal(order[9],9);
  S.campaign.stageOrder=order;
  assert.equal(api.campaignStages().length,10);
 }
});
test('new campaigns only select challenges with sufficient eligible characters',()=>{
 assert.ok(api.campaignSportValid('basketball'));
 for(let i=0;i<20;i++)for(const id of api.campaignNewOrder('basketball')){
  const stage=id<api.CAMPAIGN_STAGES.length?api.CAMPAIGN_STAGES[id]:api.CAMPAIGN_EXTRA[id-api.CAMPAIGN_STAGES.length];
  if(stage.rule==='final')continue;
  const amount=catalog.filter(c=>api.campaignAllowed(c,stage.rule)).length;
  assert.ok(amount>=5,stage.rule+' has '+amount);
 }
});
test('final gauntlet rejects characters previously used in winning lineups',()=>{
 S.campaign.history=[{ids:[catalog[0].id]}];
 assert.equal(api.campaignAllowed(catalog[0],'final'),false);
 assert.equal(api.campaignAllowed(catalog[1],'final'),true);
});

test('new runs rotate through seldom-used challenges instead of repeating the same ten',()=>{
 delete localRecords['da.campaign.rotation.v1'];
 S.campaign.stageOrder=null;
 const one=api.campaignNewOrder('basketball');
 const two=api.campaignNewOrder('basketball');
 const three=api.campaignNewOrder('basketball');
 const keys=arr=>arr.slice(0,9).sort((a,b)=>a-b).join(',');
 assert.notEqual(keys(one),keys(two),'Second campaign should use different themes');
 assert.notEqual(keys(two),keys(three),'Third campaign should use different themes');
 assert.ok(new Set([...one,...two,...three]).size>10,'Expected new themes to rotate in across campaigns');
 assert.equal(one[9],9);
 assert.equal(two[9],9);
 assert.equal(three[9],9);
 const persisted=lsGet('da.campaign.rotation.v1',{});
 assert.ok(Object.keys(persisted.basketball.counts).length>9,'Rotation usage should persist in storage');
});
test('restarting retains selected sport and team name while rerolling challenges',()=>{
 S.campaign={sport:'basketball',teamName:'Dream Team',step:5,status:'results',history:[],stageOrder:api.campaignNewOrder('basketball')};
 api.campaignReset();
 assert.equal(S.campaign.teamName,'Dream Team');
 assert.equal(S.campaign.sport,'basketball');
 assert.equal(S.campaign.step,0);
 assert.equal(S.campaign.stageOrder.length,10);
});
test('eligible challenge count uses actual characters currently in the game',()=>{
 const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
 const ids=['nba','mcu','toons','muppets','games','pokemon','starwars'];
 const real=[];
 for(const id of ids){
  const start=html.indexOf('POOLS.'+id+' =');
  const entries=html.indexOf('entries: [',start);
  const end=html.indexOf('\n]};',entries);
  assert.ok(start>=0&&entries>=0&&end>entries,'Cannot find candidate pool '+id);
  const names=[...html.slice(entries,end).matchAll(/^\["([^"]+)"/gm)].map(x=>x[1]);
  for(const n of names)real.push({id:id+':'+n,n,pool:id,a:Array(12).fill(85)});
 }
 const original=catalog;catalog=real;
 try{
  const eligible=api.campaignEligibleStageIds('basketball');
  assert.ok(eligible.length>9,'Real pool needs more than nine eligible challenges, found '+eligible.length);
  assert.ok(eligible.some(i=>i>=api.CAMPAIGN_STAGES.length),'Themed challenges should be eligible');
  const order=api.campaignNewOrder('basketball');
  assert.ok(order.slice(0,9).some(i=>i>=api.CAMPAIGN_STAGES.length),'Expect themed challenges in actual campaign selection');
 }finally{catalog=original;}
});

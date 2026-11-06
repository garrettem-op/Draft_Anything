const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const code=fs.readFileSync(require('node:path').join(__dirname,'../data/campaign.js'),'utf8');
const S={campaign:{step:0,status:'setup',history:[],stageOrder:null}};
let catalog=[];
const SPORTS={basketball:{pos:Array.from({length:5},(_,i)=>({id:'p'+i}))}};
const context={S,SPORTS,getCands:()=>catalog};
vm.runInNewContext(code+'\nthis.campaignTestApi={CAMPAIGN_STAGES,CAMPAIGN_EXTRA,CAMPAIGN_TAGS,CAMPAIGN_WOMEN,CAMPAIGN_RED,CAMPAIGN_KIDS,campaignStages,campaignNewOrder,campaignSportValid,campaignAllowed};',context);
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

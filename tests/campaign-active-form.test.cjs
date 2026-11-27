const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../data/campaign.js'),'utf8');
const v={history:[],step:0,sport:'brawl',status:'draft',roster:{},surge:[]};
const S={campaign:v};
const SPORT={brawl:{pos:[{id:'p'}]}};
const base={id:'dc:Batman',pool:'dc',n:'Batman',a:Array(12).fill(80)};
// Isolated engine checks with mocked characters. tests/campaign-active-form-production.test.cjs covers
// the same rules with the live roster, catalog, odds and reviewed research.
const ctx={S,SPORTS:SPORT,characterAbilityTags:c=>c.n==='Batman'?['tech','stealth']:[],
 window:{DA_VARIANT_FORM_RESEARCH:require('../data/variant-form-research.js')},
 variantOdds:c=>ctx.variantOptions(c).map(form=>({form,percent:50,power:1})),
 variantOptions:c=>c.id===base.id?[{name:'Dawnbreaker Batman'},{name:'Red Death Batman'}]:[],
 variantSurgeRecords:v=>v.surge||[],
 variantRoster:v=>Object.fromEntries(Object.entries(v.roster).map(([k,c])=>{
   const r=v.surge?.find(x=>x.id===c.id);
   return [k,r?{...c,n:r.name,variantBase:c.n,a:[r.name==='Red Death Batman'?95:80,...c.a.slice(1)]}:c];
 }))};
ctx.campaignVariantRoster=ctx.variantRoster;
vm.runInNewContext(code+';this.api={campaignFormEligibility,campaignActivePickResult,campaignCanPotentiallyPick,campaignInvalidSlots};',ctx);
const p={id:'p'};
test('only the actual form gains new powers; failed roll cannot qualify via a different form',()=>{
 assert.equal(ctx.api.campaignActivePickResult(base,'flight',p,'player',v).allowed,false);
 assert.equal(ctx.api.campaignCanPotentiallyPick(base,'flight',p,'player',v),true);
 v.surge=[{id:base.id,name:'Red Death Batman'}];
 assert.equal(ctx.api.campaignActivePickResult(base,'flight',p,'player',v).allowed,false);
 assert.equal(ctx.api.campaignCanPotentiallyPick(base,'flight',p,'player',v),false);
 assert.equal(ctx.api.campaignActivePickResult(base,'fast',p,'player',v).allowed,true);
 v.surge=[{id:base.id,name:'Dawnbreaker Batman'}];
 assert.equal(ctx.api.campaignActivePickResult(base,'flight',p,'player',v).allowed,true);
 v.surge=[];
});
test('size evidence, pool and history retain the correct identity',()=>{
 const pika={id:'pokemon:Pikachu',pool:'pokemon',n:'Pikachu',a:Array(12).fill(70)};
 const giant={...pika,n:'Gigantamax Pikachu',variantBase:pika.n,a:Array(12).fill(99)};
 assert.equal(ctx.api.campaignFormEligibility(pika,giant,'giants',p,'player',v).allowed,true);
 assert.equal(ctx.api.campaignFormEligibility(pika,giant,'underdog',p,'player',v).allowed,true);
 assert.equal(ctx.api.campaignFormEligibility(pika,giant,'marvel-dc',p,'player',v).allowed,false);
 v.singleUse=true;v.history=[{ids:[pika.id],playerUsedIds:[pika.id]}];
 assert.equal(ctx.api.campaignFormEligibility(pika,giant,'giants',p,'player',v).allowed,false);
 v.singleUse=false;v.history=[];
});

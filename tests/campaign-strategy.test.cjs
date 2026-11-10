const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const code=fs.readFileSync(path.join(root,'data/campaign-strategy.js'),'utf8');
const expansion=require('../data/campaign-variant-expansion.js');
const P=[...Array.from({length:5},(_,i)=>({id:'p'+i,imp:1})),{id:'bench',bench:true,side:true,imp:0},{id:'coach',coach:true,side:true,imp:0}];
const SPORTS={brawl:{pos:P}};
const chars=Array.from({length:110},(_,i)=>{
 const speed=Math.min(99,25+i);
 return {id:'games:extra'+i,n:'Extra '+i,pool:'games',a:[speed,speed,65,speed,65,65,65,65,65,speed,65,65]};
});
chars.push({id:'mcu:Thor',n:'Thor',pool:'mcu',a:Array(12).fill(75)});
chars.push({id:'mcu:Jean Grey',n:'Jean Grey',pool:'mcu',a:Array(12).fill(85)});
chars.push({id:'mcu:Scarlet Witch',n:'Scarlet Witch',pool:'mcu',a:Array(12).fill(85)});
chars.push({id:'games:Sonic the Hedgehog',n:'Sonic the Hedgehog',pool:'games',a:Array(12).fill(85)});
function seeded(s){
 let n=2166136261;for(const x of String(s)){n=Math.imul(n^x.charCodeAt(0),16777619);}
 return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};
}
function rate(sport,roster){
 let count=0;for(const p of P)if(!p.coach&&!p.bench&&roster[p.id])count+=roster[p.id].a[0];
 return {rating:count/5};
}
function ai(sport,pool,n){
 if(pool.length<P.length)return [];
 const candidates=pool.slice().sort((a,b)=>b.a[0]-a.a[0]);
 return [Object.fromEntries(P.map((p,i)=>[p.id,candidates[i]]))];
}
const saved=[];
const context={
 window:{DA_CAMPAIGN_VARIANT_EXPANSION:expansion},
 SPORTS,getCands:()=>chars,candById:(pool,id)=>chars.find(c=>c.id===id),
 aiStackDraft:ai,candVal:(sport,c)=>c.a[0],fitIn:(sport,c,p)=>c.a[0],
 teamScore:rate,rngFrom:seeded,saveCampaign:()=>saved.push(true),
 CAMPAIGN_KIDS:new Set(),campaignAllowed:(c,rule)=>rule==='fast'?c.a[0]>=90:true
};
vm.runInNewContext(code+'\nthis.strategyApi={campaignChallengeCeiling,campaignBuildOpponent,campaignLockedOpponent,campaignFinalBossOpponent,campaignVariantOptions,campaignVariantRoster,campaignUseVariantSurge,campaignTacticalMatch,CAMPAIGN_VARIANTS};',context);
const api=context.strategyApi;
function stage(seed='campaign-A',step=0,rule='fast'){
 return {seed,step,sport:'brawl',stageOrder:[0,1,2,3,4,5,6,7,8,9],roster:{},opponents:{},surge:null,status:'draft',rule};
}
test('opponents are independent of submitted lineup and locked on retries',()=>{
 const v=stage(),enemy={rule:'fast'};
 const first=api.campaignLockedOpponent(v,enemy);
 const keys=JSON.stringify(Object.fromEntries(Object.entries(first.roster).map(([k,c])=>[k,c.id])));
 v.roster={p0:chars[0],p1:chars[1]};
 const second=api.campaignLockedOpponent(v,enemy);
 assert.equal(JSON.stringify(Object.fromEntries(Object.entries(second.roster).map(([k,c])=>[k,c.id]))),keys);
 assert.equal(first.score.rating,second.score.rating);
 assert.equal(first.tactic,second.tactic);
 assert.equal(saved.length,1,'Enemy must save once and not reroll on another submission');
 const sameStageNewInstance=api.campaignBuildOpponent(stage(),enemy);
 assert.equal(JSON.stringify(sameStageNewInstance.roster),keys,'Seed and stage define enemy roster');
});
test('short-handed ceiling is appropriately below full-strength ceiling',()=>{
 const full=api.campaignChallengeCeiling('brawl','fast');
 const short=api.campaignChallengeCeiling('brawl','short');
 assert.ok(full>short*1.25,{full,short});
 const early=api.campaignBuildOpponent(stage('a',0,'short'),{rule:'short'});
 const rival=Object.fromEntries(Object.entries(early.roster).map(([slot,id])=>[slot,chars.find(c=>c.id===id)]));
 assert.ok(rate('brawl',rival).rating<full*0.9,'Full-strength boss cannot be unreasonably high for 3-on-5');
});
test('opponent tactical profile is measurable and counterplay changes actual rating',()=>{
 const offense={p0:chars[90],p1:chars[85],p2:chars[87],p3:chars[80],p4:chars[88]};
 const defenseless={p0:chars[0],p1:chars[1],p2:chars[2],p3:chars[3],p4:chars[4]};
 const good=api.campaignTacticalMatch('brawl',offense,offense,'blitz');
 const bad=api.campaignTacticalMatch('brawl',defenseless,offense,'blitz');
 assert.ok(good.yourPoints>bad.yourPoints,'Stat counterplay must change the score');
 assert.ok(good.yourPoints<=5.3&&bad.yourPoints>=-2.5);
 assert.equal(good.label,'Explosive tempo');
 assert.ok(good.weakness);
});
test('Variant Surge picks a documented form once and does not alter base character',()=>{
 const v=stage('variant-test',2,'psychic');
 const thor=chars.find(c=>c.id==='mcu:Thor');
 const jean=chars.find(c=>c.id==='mcu:Jean Grey');
 v.roster={p0:thor,p1:jean,p2:chars[72],p3:chars[73],p4:chars[74]};
 const surge=api.campaignUseVariantSurge(v);
 assert.ok(surge?.id&&surge.name);
 assert.equal(api.campaignUseVariantSurge(v),null,'Surge cannot be spent twice in one stage');
 const changed=api.campaignVariantRoster(v);
 const updated=Object.values(changed).find(c=>c.id===surge.id);
 assert.equal(updated.n,surge.name);
 assert.notEqual(updated.a,chars.find(c=>c.id===surge.id).a,'Alternate attributes must be copied');
 assert.equal(chars.find(c=>c.id===surge.id).n,surge.id===thor.id?'Thor':'Jean Grey','Do not mutate original catalog');
 const originalKeys=Object.keys(v.roster),selected=originalKeys.find(k=>v.roster[k].id===surge.id);
 delete v.roster[selected];
 assert.equal(api.campaignUseVariantSurge(v),null,'Removing character cannot restore surge');
 assert.equal(api.campaignVariantRoster(v),v.roster,'Variant form is inactive after removal');
 const replay=stage('variant-test',2,'psychic');
 replay.roster={p0:thor,p1:jean,p2:chars[72],p3:chars[73],p4:chars[74]};
 assert.equal(JSON.stringify(api.campaignUseVariantSurge(replay)),JSON.stringify(surge),'Stage-seeded variant must be reproducible');
});
test('variant catalog refers to actual roster characters and well-labeled alternate forms',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const roster=new Set();
 for(const pool of ['nba','mcu','toons','muppets','games','pokemon','starwars']){
   const start=html.indexOf('POOLS.'+pool+' =');
   const entries=html.indexOf('entries: [',start),end=html.indexOf('\n]};',entries);
   assert.ok(start>=0&&end>entries,'Unknown pool '+pool);
   for(const m of html.slice(entries,end).matchAll(/^\["([^"]+)"/gm))roster.add(pool+':'+m[1]);
 }
 const newer=vm.createContext({window:{}});
 for(const file of ['new-pool-core.js','pools-dc.js','pools-middle-earth.js','pools-harry-potter.js']){
   vm.runInContext(fs.readFileSync(path.join(root,'data',file),'utf8'),newer,{filename:file});
 }
 for(const [pool,p] of Object.entries(newer.window.DA_ADDED_POOLS)){
   for(const entry of p.entries)roster.add(pool+':'+entry[0]);
 }
 for(const [id,forms] of Object.entries(api.CAMPAIGN_VARIANTS)){
   assert.ok(roster.has(id),'Unknown variant base '+id);
   assert.equal(new Set(forms.map(f=>f.name)).size,forms.length,id+' duplicate forms');
   for(const form of forms){
     assert.ok(form.name&&form.origin&&Object.keys(form.changes).length);
     for(const delta of Object.values(form.changes))assert.ok(Number.isFinite(delta)&&Math.abs(delta)<=15);
     if(form.continuity)assert.ok(form.continuity.length>=4);
   }
 }
 for(const name of ['Rune King Thor','White Phoenix of the Crown','House of M Scarlet Witch',
   'God Emperor Doom','Hydra Supreme (Steve Rogers)','Infinity Ultron','The Darkest Knight'])
   assert.ok(Object.values(api.CAMPAIGN_VARIANTS).flat().some(f=>f.name===name),name+' missing');
 assert.ok(Object.keys(api.CAMPAIGN_VARIANTS).length>=130,'Expanded catalog still too small');
});
test('finale draws a second stable boss with different roster and strategy',()=>{
 const v=stage('final-boss-seed',9,'final'),ch={rule:'final'};
 const first=api.campaignLockedOpponent(v,ch);
 const second=api.campaignFinalBossOpponent(v,ch,first);
 const repeated=api.campaignFinalBossOpponent(v,ch,first);
 assert.equal(JSON.stringify(second.roster),JSON.stringify(repeated.roster));
 assert.notEqual(JSON.stringify(second.roster),JSON.stringify(first.roster),'Second boss must be a different team');
 assert.notEqual(second.tactic,first.tactic,'Second boss should require different tactical counterplay');
 assert.equal(second.score.rating,repeated.score.rating);
});
test('campaign runtime no longer scales opponents to player rating or changes match seed per retry',()=>{
 const c=fs.readFileSync(path.join(root,'data/campaign.js'),'utf8');
 assert.doesNotMatch(c,/target=baseRating\s*\+/);
 assert.match(c,/gameSeed=campaignStageSeed\(v\)\+':match'/);
 assert.match(c,/campaignLockedOpponent\(v,st\)/);
 assert.match(c,/campaignVariantRoster\(v\)/);
 assert.match(c,/campaignWinUses\(c\.id\)>=2/);
 const h=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.match(h,/case 'camp-variant'/);
 assert.match(h,/data\/campaign-strategy\.js/);
});

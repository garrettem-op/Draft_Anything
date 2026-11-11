const test=require('node:test');
const assert=require('node:assert/strict');
const {auditCampaignTags}=require('../tools/full-campaign-tag-audit.cjs');
const {deriveCampaignTagTaxonomy}=require('../data/campaign-tag-taxonomy.js');
const {loadGame}=require('../tools/ability-audit-lib.cjs');
const vm=require('node:vm');
let report;
test('tag audit uses every Campaign rule, every power family and all four legacy traits',()=>{
 const game=loadGame();
 const stages=JSON.parse(vm.runInContext('JSON.stringify([...CAMPAIGN_STAGES,...CAMPAIGN_EXTRA])',game.ctx));
 const tax=deriveCampaignTagTaxonomy(stages);
 assert.equal(tax.rules.length,stages.length);
 assert.equal(tax.rules.length,34);
 assert.equal(new Set(tax.rules.map(x=>x.rule)).size,34);
 assert.deepEqual(tax.traitTags.sort(),['women','red','kids','mortal'].sort());
 for(const broad of ['flight','magic','psychic','aquatic','fire','ice','electric','tech','stealth','teleport','healing','giants']) assert.ok(tax.abilityTags.includes(broad),'missing broad '+broad);
 assert.ok(tax.abilityTags.includes('natural-flight'),'granular flight evidence must be represented');
 assert.ok(tax.abilityTags.includes('heals-others'),'granular healing evidence must be represented');
 assert.ok(tax.rules.find(x=>x.rule==='fast').conditions.some(x=>x.key==='spd'&&x.value===90));
 assert.ok(tax.rules.find(x=>x.rule==='final').conditions.some(x=>x.scope==='roster'));
 assert.ok(tax.rules.find(x=>x.rule==='muppetforce').conditions.some(x=>x.kind==='muppetforce'&&x.value===65));
});
test('audit enumerates every real roster character plus all registered alternate forms',()=>{
 report=auditCampaignTags();
 const game=loadGame();
 assert.equal(report.totals.characters,game.roster.length);
 assert.ok(report.totals.characters>=1204);
 assert.ok(report.totals.forms>=221);
 assert.equal(Object.values(report.byPool).reduce((s,x)=>s+Object.keys(x).length,0),game.roster.length);
 assert.equal(report.totals.abilityGranted+report.totals.abilityMissing,game.roster.length*12);
 assert.equal(report.totals.traitGranted+report.totals.traitRejected+report.totals.traitUnreviewed,game.roster.length*4);
 assert.equal(report.totals.formTagsPending,report.totals.forms*16);
 assert.equal(report.completionGate.phase2Ready,false);
});
test('a missing tag is never falsely reported as a researched no; explicit exclusions remain no',()=>{
 report||=auditCampaignTags();
 const trait=(pool,n,k)=>report.byPool[pool][n].traits[k].decision;
 assert.equal(trait('games','Blinky','red'),'yes');
 assert.equal(trait('pokemon','Charmander','red'),'no');
 assert.equal(trait('dc','Wonder Woman','women'),'yes');
 assert.equal(trait('mcu','Thor','mortal'),'needs-individual-review');
 assert.equal(report.byPool.mcu['The Watcher'].abilities.granted.includes('teleport'),true);
 const index=report.byPool.pokemon['Charmander'].abilities;
 assert.equal(index.reviewStatus.includes('confirm positive and negative decisions individually'),true);
});
test('each registered variant gets an independent queue instead of silently inheriting base powers',()=>{
 report||=auditCampaignTags();
 const forms=report.forms['mcu:Thanos'];
 assert.ok(forms.some(x=>x.name==='King Thanos'));
 for(const f of forms){
   assert.equal(Object.keys(f.abilityTags).length,12);
   assert.equal(Object.keys(f.traitTags).length,4);
   for(const decision of [...Object.values(f.abilityTags),...Object.values(f.traitTags)])
     assert.equal(decision.decision,'needs-form-specific-review');
 }
 assert.ok(report.forms['mcu:Thor'].some(x=>x.name==='Rune King Thor'));
});

test('committed audit snapshot matches the entire live roster and every variant; new additions cannot silently escape review',()=>{
 const fs=require('node:fs');
 const path=require('node:path');
 report||=auditCampaignTags();
 const snapshot=JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/campaign-tag-audit-ledger.json'),'utf8'));
 assert.deepEqual(snapshot.totals,report.totals);
 assert.deepEqual(snapshot.taxonomy,report.taxonomy);
 assert.deepEqual(snapshot.byPool,report.byPool);
 assert.deepEqual(snapshot.forms,report.forms);
});

test('unconfirmed research-queue claims cannot silently enter the canonical Campaign tags',()=>{
 const {CHARACTER_ABILITY_TAGS}=require('../data/character-abilities.js');
 const cases=[
  ['dc','Nightwing','stealth'],['dc','Red Hood','stealth'],
  ['dc','Batgirl (Barbara Gordon)','stealth'],['dc','Batwoman','stealth'],
  ['dc','Cassandra Cain','stealth'],['dc','Huntress','stealth'],
  ['dc','Talia al Ghul','stealth'],
  ['lotr',"Durin's Bane",'giants'],
  ['lotr','Gothmog (Lord of Balrogs)','giants'],
  ['harrypotter','Hermione Granger','flight']
 ];
 for(const [pool,name,tag] of cases)
   assert.equal(CHARACTER_ABILITY_TAGS[pool][name].includes(tag),false,pool+':'+name+' must remain on the research queue');
});

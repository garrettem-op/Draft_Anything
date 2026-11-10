const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const ROOT=path.join(__dirname,'..');
const expansion=require('../data/campaign-variant-expansion.js');
const merged=require('../data/campaign-strategy.js').CAMPAIGN_VARIANTS;
const {loadGame}=require('../tools/ability-audit-lib.cjs');
const roster=new Set(loadGame().roster.map(c=>c.id));

test('large multi-continuity expansion references actual roster identities and specific source works',()=>{
 const entries=Object.entries(expansion), forms=entries.flatMap(([,list])=>list);
 assert.ok(entries.length>=130,'Need far more than a handful of variant-eligible characters');
 assert.ok(forms.length>=210,'Need multiple real forms for many characters');
 assert.ok(entries.length<roster.size,'The game should NOT give variants to every roster character');
 for(const [id,list] of entries){
   assert.ok(roster.has(id),'Unknown base character '+id);
   assert.ok(list.length>=1);
   assert.equal(new Set(list.map(f=>f.name.toLowerCase())).size,list.length,id+' has duplicate forms');
   for(const f of list){
     assert.ok(f.name.length>=7,id+' variant has no name');
     assert.ok(f.origin.length>=20,id+' form needs a specific named work');
     assert.ok(f.continuity.length>=4,id+' form must document its continuity');
     assert.ok(Object.keys(f.changes).length>0,id+' form needs actual gameplay changes');
     for(const [attribute,delta] of Object.entries(f.changes)){
       assert.ok(['spd','agi','str','siz','lep','end','tch','acc','ref','iq','clu','ldr'].includes(attribute),id+' '+attribute);
       assert.ok(Number.isInteger(delta)&&Math.abs(delta)<=15&&delta!==0,id+' bad delta '+delta);
     }
     if(f.source)assert.match(f.source,/^https:\/\/\S+$/,id+' invalid source URL');
     if(f.ratingBonus!==undefined)assert.ok(Number.isFinite(f.ratingBonus)&&f.ratingBonus>0&&f.ratingBonus<=5,id+' invalid cosmic boost');
   }
 }
});

test('headline requests are covered, with multiple forms per character',()=>{
 for(const [id,names] of Object.entries({
  'mcu:Doctor Doom':['God Emperor Doom','Sorcerer Supreme Doctor Doom','Infamous Iron Man (Victor von Doom)'],
  'mcu:Captain America':['Hydra Supreme (Steve Rogers)'],
  'mcu:Loki':['God of Stories Loki (TVA)'],
  'mcu:Winter Soldier':['White Wolf (Bucky Barnes)','Captain America (Bucky Barnes)'],
  'mcu:Ultron':['Infinity Ultron'],
  'mcu:Black Panther':['King of the Dead Black Panther'],
  'mcu:Odin':['Young Odin (Prehistoric Avengers)'],
  'mcu:Hulk':['Maestro Hulk','Titan Hulk'],
  'mcu:Wolverine':['Old Man Logan','Phoenix Wolverine'],
  'dc:Batman':['The Batman Who Laughs','The Darkest Knight','Hellbat Armor Batman'],
  'dc:Superman':['Superman Prime One Million','Superman Blue'],
  'games:Sonic the Hedgehog':['Hyper Sonic','Darkspine Sonic'],
  'lotr:Gandalf':['Gandalf the White']
 })){
   const actual=new Set(merged[id]?.map(f=>f.name)||[]);
   for(const form of names)assert.ok(actual.has(form),id+' lacks '+form);
 }
 assert.ok(merged['mcu:Thor'].some(f=>f.name==='Rune King Thor'),'Original forms preserved');
 assert.ok(merged['mcu:Jean Grey'].some(f=>f.name==='White Phoenix of the Crown'));
 assert.ok(merged['mcu:Scarlet Witch'].some(f=>f.name==='House of M Scarlet Witch'));
 for(const id of ['dc:Batman','mcu:Doctor Doom','mcu:Thor','mcu:Hulk','games:Mario'])
   assert.ok(merged[id].length>=4,id+' should have a genuine multi-form selection');
});

test('targeted Variant Surge picks the requested roster character and one deterministic form',()=>{
 const strategy=fs.readFileSync(path.join(ROOT,'data/campaign-strategy.js'),'utf8');
 const SPORT={brawl:{pos:[{id:'a'},{id:'b'},{id:'c'},{id:'coach',coach:true}]}};
 const ctx={window:{DA_CAMPAIGN_VARIANT_EXPANSION:expansion},SPORTS:SPORT,
   rngFrom:seed=>{let n=2166136261;for(const ch of seed)n=Math.imul(n^ch.charCodeAt(0),16777619);return ()=>((n=Math.imul(n,1664525)+1013904223)>>>0)/4294967296;}
 };
 vm.runInNewContext(strategy+'; this.api={campaignUseVariantSurge,campaignVariantOptions,campaignVariantRoster};',ctx);
 const captain={id:'mcu:Captain America',pool:'mcu',n:'Captain America',a:Array(12).fill(80)};
 const doom={id:'mcu:Doctor Doom',pool:'mcu',n:'Doctor Doom',a:Array(12).fill(80)};
 const ordinary={id:'nba:Michael Jordan',pool:'nba',n:'Michael Jordan',a:Array(12).fill(80)};
 const setup=()=>({sport:'brawl',seed:'fixed-surge',step:2,stageOrder:[0,1,2],status:'draft',surge:null,
   roster:{a:captain,b:doom,c:ordinary}});
 const a=setup(),b=setup();
 assert.equal(ctx.api.campaignUseVariantSurge(a,'nba:Michael Jordan'),null,'Unknown target may not spend a charge');
 assert.equal(a.surge,null);
 const first=ctx.api.campaignUseVariantSurge(a,doom.id);
 const second=ctx.api.campaignUseVariantSurge(b,doom.id);
 assert.equal(first.id,doom.id,'Player chooses which character transforms');
 assert.equal(first.name,second.name,'Chosen character and seed lock a form');
 assert.ok(ctx.api.campaignVariantOptions(doom).length>=5);
 const roster=ctx.api.campaignVariantRoster(a);
 assert.equal(roster.b.n,first.name);
 assert.notEqual(roster.b.a,doom.a,'Only temporary transformed copy may change');
 assert.equal(doom.a[0],80,'Canonical roster stats never mutate');
 assert.equal(ctx.api.campaignUseVariantSurge(a,captain.id),null,'One use per challenge');
 delete a.roster.b;
 assert.equal(ctx.api.campaignVariantRoster(a),a.roster,'Spent surge stays spent after removal');
});

test('UI loads the expanded catalog before strategy and exposes character-specific form selection',()=>{
 const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
 const campaign=fs.readFileSync(path.join(ROOT,'data/campaign.js'),'utf8');
 assert.ok(html.indexOf('data/campaign-variant-expansion.js')<html.indexOf('data/campaign-strategy.js'));
 assert.match(html,/campaignUseVariantSurge\(S\.campaign,S\.campaign\.variantTarget\)/);
 assert.match(html,/camp-variant-target/);
 assert.match(campaign,/possible forms/);
 assert.match(campaign,/campaignVariantOptions\(c\)\.length/);
 assert.match(campaign,/minDistinctPools:3,encounters:2/);
 assert.match(campaign,/campaignFinalBossOpponent\(v,st,first\)/);
});

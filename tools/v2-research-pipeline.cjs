#!/usr/bin/env node
'use strict';
/* Offline research manifest, queue and validation. No model/API calls. */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {loadGame,ROOT}=require('./ability-audit-lib.cjs');
const BATCH_DIR=path.join(ROOT,'research/option-c/batches');
const STATUS=new Set(['reviewed','provisional','needs-review','unknown']);
const GOOD_URL=/^https:\/\/(?!localhost|127\.|0\.0\.0\.0)[^\s/]+\.[^\s/]+/i;
const isText=s=>typeof s==='string'&&s.trim().length>=12;
function rosterIds(){
 const game=loadGame(), ids=game.roster.map(r=>r.id);
 const ctx=game.ctx;
 for(const file of ['data/variant-abilities.js','data/campaign-variant-expansion.js','data/campaign-strategy.js']){
  vm.runInContext(fs.readFileSync(path.join(ROOT,file),'utf8'),ctx,{filename:file});
 }
 const variants=JSON.parse(vm.runInContext('JSON.stringify(CAMPAIGN_VARIANTS)',ctx));
 const known=new Set(ids);
 for(const [id,forms] of Object.entries(variants)){
  if(!known.has(id))throw Error('Orphan variant base: '+id);
  for(const f of forms)ids.push(id+'|'+f.name);
 }
 if(new Set(ids).size!==ids.length)throw Error('Duplicate roster/form identity');
 return ids.sort((a,b)=>a.localeCompare(b));
}
/* Campaign ability tag vocabulary (broad families + specific tags) read from the game itself
   (data/character-abilities.js), so research proposals use exactly the tags the engine knows. */
const TAG_RE=/^[a-z][a-z-]{1,40}$/;
function abilityTagVocabulary(){
 const game=loadGame();
 const fam=JSON.parse(vm.runInContext('JSON.stringify(CHARACTER_ABILITY_TAG_FAMILIES)',game.ctx));
 const tags=new Set();
 for(const [broad,list] of Object.entries(fam)){tags.add(broad);for(const t of list)tags.add(t);}
 const out=[...tags].sort();
 if(!out.length||out.some(t=>!TAG_RE.test(t)))throw Error('Ability tag vocabulary missing or malformed');
 return out;
}
function loadBatches(){
 if(!fs.existsSync(BATCH_DIR))return [];
 return fs.readdirSync(BATCH_DIR).filter(x=>x.endsWith('.json')).sort().map(file=>{
  let batch;try{batch=JSON.parse(fs.readFileSync(path.join(BATCH_DIR,file),'utf8'));}
  catch(e){throw Error(file+': invalid JSON: '+e.message);}
  return {file,batch};
 });
}
function checkBatch(file,batch,roster,tags){
 const errors=[],seen=new Set();
 const add=m=>errors.push(file+': '+m);
 if(!batch||typeof batch!=='object'||Array.isArray(batch))return [file+': expected JSON object'];
 if(!isText(batch.batchId))add('batchId must identify the research batch');
 if(batch.schemaVersion!==1)add('schemaVersion must be 1');
 if(!Array.isArray(batch.characters)||!batch.characters.length||batch.characters.length>20)add('characters must contain 1–20 records');
 if(!Array.isArray(batch.characters))return errors;
 for(const [i,p] of batch.characters.entries()){
  const where='characters['+i+']';
  if(!p||typeof p!=='object'){add(where+' not an object');continue;}
  if(typeof p.id!=='string'||!roster.has(p.id))add(where+' id is not an exact current roster/form ID: '+p.id);
  if(seen.has(p.id))add(where+' duplicate id '+p.id);seen.add(p.id);
  if(!isText(p.continuity))add(where+' missing specific continuity');
  if(!isText(p.summary))add(where+' missing useful summary');
  if(!p.offense||typeof p.offense!=='object'||!Array.isArray(p.offense.domains)||!p.offense.domains.length)add(where+' offense.domains required');
  if(!p.defense||typeof p.defense!=='object'||!Array.isArray(p.defense.mechanisms)||!p.defense.mechanisms.length)add(where+' defense.mechanisms required');
  if(!Array.isArray(p.weaknesses)||!p.weaknesses.length)add(where+' weaknesses required (write "not established" with evidence if unknown)');
  if(!Array.isArray(p.sources)||!p.sources.length)add(where+' sources required');
  else for(const [j,s] of p.sources.entries()){
   if(!s||!GOOD_URL.test(s.url||'')||!isText(s.supports))add(where+' source['+j+'] needs valid URL and specific claim it supports');
   else if(s.supports.trim().replace(/\/+$/,'')===s.url.trim().replace(/\/+$/,''))add(where+' source['+j+'].supports must describe the claim, not repeat the URL');
  }
  // Optional evidence lists (feats, notableResults, conditional) may point at sources[] by index.
  const nSources=Array.isArray(p.sources)?p.sources.length:0;
  for(const key of ['feats','notableResults','conditional']){
   if(p[key]===undefined)continue;
   if(!Array.isArray(p[key])){add(where+' '+key+' must be an array');continue;}
   for(const [k,f] of p[key].entries()){
    if(!f||typeof f!=='object'){add(where+' '+key+'['+k+'] must be an object');continue;}
    if(f.source!==undefined&&!(Number.isInteger(f.source)&&f.source>=0&&f.source<nSources))add(where+' '+key+'['+k+'].source must index an existing sources[] entry');
   }
  }
  for(const key of ['limitations','mobility','support','unknowns']){
   if(p[key]!==undefined&&(!Array.isArray(p[key])||p[key].some(x=>typeof x!=='string'||!x.trim())))add(where+' '+key+' must be an array of non-empty strings');
  }
  // Proposed Campaign eligibility tags: closed vocabulary, each tied to a cited source.
  if(p.campaignTags!==undefined){
   if(!Array.isArray(p.campaignTags))add(where+' campaignTags must be an array');
   else if(!(tags instanceof Set))add(where+' campaignTags present but the tag vocabulary is unavailable');
   else for(const [k,t] of p.campaignTags.entries()){
    if(!t||typeof t!=='object'){add(where+' campaignTags['+k+'] must be an object');continue;}
    if(!tags.has(t.tag))add(where+' campaignTags['+k+'].tag is not a known ability tag: '+t.tag);
    if(!isText(t.claim))add(where+' campaignTags['+k+'].claim must state the evidence');
    if(!(Number.isInteger(t.source)&&t.source>=0&&t.source<nSources))add(where+' campaignTags['+k+'].source must index an existing sources[] entry');
   }
  }
  if(!STATUS.has(p.researchStatus))add(where+' invalid researchStatus');
  if(p.researchStatus==='reviewed'&&(!isText(p.reviewedBy)||!isText(p.reviewNotes)))add(where+' reviewed record needs reviewer identity and substantive reviewNotes');
  if(p.id&&p.id.includes('|')&&!isText(p.formDifferences))add(where+' variant must specify formDifferences');
  if(p.numericTier!==undefined&&p.numericTier!==null)add(where+' numericTier disallowed in research batches');
 }
 return errors;
}
function audit(){
 const ids=rosterIds(),known=new Set(ids),tags=abilityTagVocabulary(),tagSet=new Set(tags),batches=loadBatches(),errors=[],records=new Map();
 const poolCounts={};
 for(const id of ids){const pool=id.split(':')[0];if(!poolCounts[pool])poolCounts[pool]={total:0,reviewed:0,provisional:0,missing:0,needsReview:0};poolCounts[pool].total++;}
 for(const {file,batch} of batches){
  errors.push(...checkBatch(file,batch,known,tagSet));
  for(const p of Array.isArray(batch.characters)?batch.characters:[]){
   if(!p||typeof p.id!=='string')continue;
   if(records.has(p.id))errors.push(file+': duplicate across batches '+p.id);
   else records.set(p.id,{file,status:p.researchStatus});
  }
 }
 for(const id of ids){
  const pool=id.split(':')[0],status=records.get(id)?.status;
  if(status==='reviewed')poolCounts[pool].reviewed++;
  else if(status==='provisional')poolCounts[pool].provisional++;
  else if(status)poolCounts[pool].needsReview++;
  else poolCounts[pool].missing++;
 }
 return {ids,records,errors,poolCounts,batches:batches.length,tags};
}
function nextBatch(a,size=10,claimed=new Set()){
 // Skip identities already recorded on the branch AND identities claimed by open, unmerged PRs.
 const outstanding=a.ids.filter(id=>!a.records.has(id)&&!claimed.has(id));if(!outstanding.length)return {complete:true,ids:[]};
 const firstPool=outstanding[0].split(':')[0];
 return {complete:false,pool:firstPool,ids:outstanding.filter(id=>id.startsWith(firstPool+':')).slice(0,size)};
}
function argValue(argv,name){const i=argv.indexOf(name);return i>=0?argv[i+1]:undefined;}
function readClaimed(file){
 if(!file)return new Set();
 const x=JSON.parse(fs.readFileSync(file,'utf8'));
 if(!Array.isArray(x)||x.some(id=>typeof id!=='string'))throw Error('--claimed file must be a JSON array of identity strings');
 return new Set(x);
}
/* Data-only snapshot of the branch: roster ids + merged records. Produced by an UNPRIVILEGED job
   (it executes the branch's game data to read the roster); privileged jobs consume it as JSON. */
function snapshot(a=audit()){
 return {schemaVersion:1,ids:a.ids,tags:a.tags,records:[...a.records].map(([id,r])=>({id,file:r.file,status:r.status})),errors:a.errors};
}
const ID_RE=/^[a-z0-9_-]+:[^\n\r]{1,200}$/i;
function fromSnapshot(x){
 // Strict shape check: the snapshot comes from a lower-trust job and is treated purely as data.
 if(!x||x.schemaVersion!==1||!Array.isArray(x.ids)||!Array.isArray(x.records)||!Array.isArray(x.errors))throw Error('snapshot: bad shape');
 if(x.ids.length>20000||x.records.length>20000)throw Error('snapshot: too large');
 if(x.ids.some(id=>typeof id!=='string'||!ID_RE.test(id)))throw Error('snapshot: bad identity');
 if(!Array.isArray(x.tags)||!x.tags.length||x.tags.length>200||x.tags.some(t=>typeof t!=='string'||!TAG_RE.test(t)))throw Error('snapshot: bad tag vocabulary');
 const records=new Map();
 for(const r of x.records){
  if(!r||typeof r.id!=='string'||!ID_RE.test(r.id)||typeof r.file!=='string'||!/^[a-z0-9][a-z0-9_.-]*\.json$/i.test(r.file))throw Error('snapshot: bad record');
  records.set(r.id,{file:r.file,status:typeof r.status==='string'?r.status:undefined});
 }
 return {ids:[...x.ids],tags:[...x.tags],records,errors:x.errors.map(String)};
}
function main(argv){
 if(argv.includes('--snapshot')){const a=audit();console.log(JSON.stringify(snapshot(a)));if(a.errors.length)process.exitCode=1;return;}
 const a=audit();
 if(argv.includes('--validate')){if(a.errors.length){a.errors.forEach(e=>console.error(e));process.exitCode=1;}else console.log('Research batches valid ('+a.batches+' batches)');return;}
 if(argv.includes('--next')){if(a.errors.length)throw Error('Invalid existing research batches: '+a.errors.join('; '));const size=Number(argValue(argv,'--size')||10);
  if(!Number.isInteger(size)||size<1||size>20)throw Error('--size must be 1-20 (validator limit)');
  console.log(JSON.stringify(nextBatch(a,size,readClaimed(argValue(argv,'--claimed'))),null,2));return;}
 if(argv.includes('--report')){
  console.log(JSON.stringify({identities:a.ids.length,batches:a.batches,pools:a.poolCounts,errors:a.errors},null,2));if(a.errors.length)process.exitCode=1;return;
 }
 console.log('Usage: node tools/v2-research-pipeline.cjs --validate | --report | --snapshot | --next [--size N] [--claimed ids.json]');
}
if(require.main===module)main(process.argv.slice(2));
module.exports={rosterIds,abilityTagVocabulary,loadBatches,checkBatch,audit,nextBatch,snapshot,fromSnapshot};

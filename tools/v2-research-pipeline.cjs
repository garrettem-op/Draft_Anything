#!/usr/bin/env node
'use strict';
/* Offline research manifest, queue and validation. No model/API calls. */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {loadGame,ROOT,RESEARCH_EXTRA_POOL_IDS}=require('./ability-audit-lib.cjs');
const BATCH_DIR=path.join(ROOT,'research/option-c/batches');
const STATUS=new Set(['reviewed','provisional','needs-review','unknown']);
const GOOD_URL=/^https:\/\/(?!localhost|127\.|0\.0\.0\.0)[^\s/]+\.[^\s/]+/i;
const isText=s=>typeof s==='string'&&s.trim().length>=12;
/* Pools whose characters come from one specific film; the roster's taxonomy[0] names it. A record for
   such a character must name that film, say it is the film, and give the year when the roster title
   carries one. A record that researched the myth, novel, comic, legend or a remake instead (Homer's
   Achilles, Ludlum's Bourne, comics Conan, Conan 2011) then fails validation rather than merging. */
const FILM_POOLS=new Set(['actionmovies']);
const FILM_ALIASES={'The Raid: Redemption':['The Raid']};   // international release title
const FILM_WORD=/\b(film|movie|motion picture)s?\b/i;
const normTitle=s=>' '+String(s).normalize('NFKD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/&/g,' and ').replace(/\bvol\b/g,'volume').replace(/[^a-z0-9]+/g,' ').trim()+' ';
function filmKeys(title){
 const year=(title.match(/\((\d{4})\)\s*$/)||[])[1]||null, bare=title.replace(/\s*\(\d{4}\)\s*$/,'').trim();
 const keys=new Set([normTitle(bare)]);
 // A long subtitle alone is distinctive ("The Curse of the Black Pearl"); a short one is not ("Fury Road").
 const i=bare.indexOf(':');
 if(i>0){const sub=normTitle(bare.slice(i+1));if(sub.trim().split(' ').length>=3)keys.add(sub);}
 for(const a of FILM_ALIASES[bare]||[])keys.add(normTitle(a));
 return {title:bare,year,keys:[...keys]};
}
function filmAnchors(game){
 const out=new Map();
 for(const r of game.roster){
  if(!FILM_POOLS.has(r.pool))continue;
  const t=Array.isArray(r.taxonomy)?r.taxonomy[0]:null;
  if(typeof t!=='string'||!t.trim())throw Error('Film-pool roster entry has no film: '+r.id);
  out.set(r.id,filmKeys(t));
 }
 return out;
}
function filmContinuityError(p,films){
 const f=films&&typeof p.id==='string'?films.get(p.id.split('|')[0]):null;
 if(!f||!isText(p.continuity))return null;
 const c=normTitle(p.continuity);
 if(!f.keys.some(k=>c.includes(k)))return 'continuity must name the roster film "'+f.title+'" (this pool is that film\'s version of the character)';
 if(!FILM_WORD.test(p.continuity))return 'continuity must say it is the film version of "'+f.title+'" (film / movie)';
 if(f.year&&!c.includes(' '+f.year+' '))return 'continuity must give the year of "'+f.title+'" ('+f.year+'), the roster\'s version';
 return null;
}
/* Research scope (owner ruling 2026-11-20). Every fictional character is researched across:
     source  – the roster's own source (the pool's film, show, game or comic line),
     sequel  – everything that continues it: sequels, prequels, later seasons, series or games
               in the same continuity (not remakes or reboots),
     comic   – any comic depiction of the character, tie-in or not.
   All three count equally. Records expanded from an earlier single-continuity record also list that old
   continuity as kind "earlier-record", the label on the evidence carried over from it. Every feat, result and condition names the depiction it comes from.
   A form held as its own roster identity keeps its feats in its own record.
   NBA players are real people: the rule does not apply to them. */
const DEPICTION_SCOPE='all';
const DEPICTION_KINDS=['source','sequel','comic','earlier-record'];
const SCOPE_EXEMPT_POOLS=new Set(['nba']);
const POOL_SOURCES={
 mcu:'Marvel Cinematic Universe films and Disney+ series',
 dc:'DC Comics',
 starwars:'Star Wars films and series',
 toons:'the animated series or film the character comes from',
 muppets:'the Muppet, Sesame Street or Fraggle Rock productions the character comes from',
 games:'the video game series the character comes from',
 pokemon:'Pokémon games and anime',
 lotr:'J.R.R. Tolkien\'s Middle-earth writings',
 harrypotter:'Harry Potter books and films',
 nba:'NBA career',
};
const inScope=id=>!SCOPE_EXEMPT_POOLS.has(String(id).split(':')[0]);
/* Per-identity research context for prompts: what the roster says the character is and where it comes from.
   Data only (roster strings), carried to the privileged tick inside the snapshot. */
function researchContext(game,ids){
 const byId=new Map(game.roster.map(r=>[r.id,r])),forms=new Map();
 for(const id of ids)if(id.includes('|')){const b=id.split('|')[0];(forms.get(b)||forms.set(b,[]).get(b)).push(id.slice(b.length+1));}
 const out={};
 for(const id of ids){
  const base=id.split('|')[0],r=byId.get(base);if(!r)continue;
  const tax=Array.isArray(r.taxonomy)?r.taxonomy:[];
  let source=FILM_POOLS.has(r.pool)?'the film '+String(tax[0]||''):POOL_SOURCES[r.pool]||'';
  if(r.pool==='games'&&tax[0])source+=' ('+tax[0]+')';
  out[id]={source:source.trim(),blurb:String(r.t||'').trim()};
  if(!id.includes('|')&&forms.has(id))out[id].forms=forms.get(id);
 }
 return out;
}
/* Film anchors rebuilt from snapshot context (the privileged tick has no roster, only the snapshot). */
function filmAnchorsFromContext(context){
 const out=new Map();
 for(const [id,c] of Object.entries(context||{})){
  if(id.includes('|')||!FILM_POOLS.has(id.split(':')[0])||!c||typeof c.source!=='string')continue;
  out.set(id,filmKeys(c.source.replace(/^the film /,'')));
 }
 return out;
}
function rosterIds(game=loadGame({extraPools:RESEARCH_EXTRA_POOL_IDS})){
 const ids=game.roster.map(r=>r.id);
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
function checkBatch(file,batch,roster,tags,films){
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
  const filmErr=filmContinuityError(p,films);if(filmErr)add(where+' '+p.id+': '+filmErr);
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
  // All-depictions records (owner ruling 2026-11-20): declared depictions, each evidence item labelled.
  if(p.depictionScope!==undefined||p.depictions!==undefined){
   if(p.depictionScope!==DEPICTION_SCOPE)add(where+' depictionScope must be "'+DEPICTION_SCOPE+'" when depictions are given');
   else if(!inScope(p.id))add(where+' '+p.id+': the all-depictions scope does not apply to this pool');
   const ds=Array.isArray(p.depictions)?p.depictions:null,titles=new Set();
   if(!ds||!ds.length||ds.length>60)add(where+' depictions must list 1–60 depictions');
   else for(const [k,d] of ds.entries()){
    if(!d||typeof d.title!=='string'||d.title.trim().length<2){add(where+' depictions['+k+'].title required');continue;}
    if(!DEPICTION_KINDS.includes(d.kind))add(where+' depictions['+k+'].kind must be one of '+DEPICTION_KINDS.join(', '));
    if(titles.has(d.title))add(where+' depictions['+k+'] repeats '+d.title);titles.add(d.title);
   }
   if(ds&&!ds.some(d=>d&&d.kind==='source'))add(where+' depictions must include the roster source (kind "source")');
   for(const key of ['feats','notableResults','conditional'])for(const [k,f] of (Array.isArray(p[key])?p[key]:[]).entries()){
    if(f&&typeof f==='object'&&!titles.has(f.depiction))add(where+' '+key+'['+k+'].depiction must name one of depictions[]');
   }
  }
  if(p.earlierSummary!==undefined&&!isText(p.earlierSummary))add(where+' earlierSummary must be text');
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
 const game=loadGame({extraPools:RESEARCH_EXTRA_POOL_IDS}),films=filmAnchors(game);
 const ids=rosterIds(game),known=new Set(ids),tags=abilityTagVocabulary(),tagSet=new Set(tags),batches=loadBatches(),errors=[],records=new Map();
 const context=researchContext(game,ids);
 const poolCounts={};
 for(const id of ids){const pool=id.split(':')[0];if(!poolCounts[pool])poolCounts[pool]={total:0,reviewed:0,provisional:0,missing:0,needsReview:0,allDepictions:0};poolCounts[pool].total++;}
 for(const {file,batch} of batches){
  errors.push(...checkBatch(file,batch,known,tagSet,films));
  for(const p of Array.isArray(batch.characters)?batch.characters:[]){
   if(!p||typeof p.id!=='string')continue;
   if(records.has(p.id))errors.push(file+': duplicate across batches '+p.id);
   else records.set(p.id,{file,status:p.researchStatus,...(p.depictionScope===DEPICTION_SCOPE?{scope:DEPICTION_SCOPE}:{})});
  }
 }
 for(const id of ids){
  const pool=id.split(':')[0],status=records.get(id)?.status;
  if(status==='reviewed')poolCounts[pool].reviewed++;
  else if(status==='provisional')poolCounts[pool].provisional++;
  else if(status)poolCounts[pool].needsReview++;
  else poolCounts[pool].missing++;
  if(records.get(id)?.scope===DEPICTION_SCOPE)poolCounts[pool].allDepictions++;
 }
 return {ids,records,errors,poolCounts,batches:batches.length,tags,context};
}
function nextBatch(a,size=10,claimed=new Set()){
 // Skip identities already recorded on the branch AND identities claimed by open, unmerged PRs.
 const outstanding=a.ids.filter(id=>!a.records.has(id)&&!claimed.has(id));if(!outstanding.length)return {complete:true,ids:[]};
 const firstPool=outstanding[0].split(':')[0];
 return {complete:false,pool:firstPool,ids:outstanding.filter(id=>id.startsWith(firstPool+':')).slice(0,size)};
}
/* Expansion queue (owner ruling 2026-11-20): recorded, in-scope identities whose record predates the
   all-depictions scope, one batch file at a time (expansion edits records in place). */
function nextExpansion(a,size=10,claimed=new Set()){
 const todo=[...a.records].filter(([id,r])=>inScope(id)&&r.scope!==DEPICTION_SCOPE&&!claimed.has(id)).sort((x,y)=>x[1].file.localeCompare(y[1].file)||x[0].localeCompare(y[0]));
 if(!todo.length)return {complete:true,ids:[]};
 const file=todo[0][1].file;
 return {complete:false,file,pool:todo[0][0].split(':')[0],ids:todo.filter(([,r])=>r.file===file).map(([id])=>id).slice(0,size)};
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
 return {schemaVersion:1,ids:a.ids,tags:a.tags,records:[...a.records].map(([id,r])=>({id,file:r.file,status:r.status,...(r.scope?{scope:r.scope}:{})})),errors:a.errors,context:a.context||{}};
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
  if(r.scope!==undefined&&r.scope!==DEPICTION_SCOPE)throw Error('snapshot: bad record scope');
  records.set(r.id,{file:r.file,status:typeof r.status==='string'?r.status:undefined,...(r.scope?{scope:r.scope}:{})});
 }
 // Prompt context: roster strings only, bounded and free of control characters. Absent in older snapshots.
 const context={},known=new Set(x.ids),okStr=(s,n)=>typeof s==='string'&&s.length<=n&&!/[\u0000-\u001f\u007f]/.test(s);
 if(x.context!==undefined){
  if(!x.context||typeof x.context!=='object'||Array.isArray(x.context))throw Error('snapshot: bad context');
  for(const [id,c] of Object.entries(x.context)){
   if(!known.has(id)||!c||typeof c!=='object'||!okStr(c.source,200)||!okStr(c.blurb,300))throw Error('snapshot: bad context for '+String(id).slice(0,80));
   if(c.forms!==undefined&&(!Array.isArray(c.forms)||c.forms.length>30||c.forms.some(f=>!okStr(f,120))))throw Error('snapshot: bad context forms for '+String(id).slice(0,80));
   context[id]={source:c.source,blurb:c.blurb,...(c.forms?{forms:[...c.forms]}:{})};
  }
 }
 return {ids:[...x.ids],tags:[...x.tags],records,errors:x.errors.map(String),context};
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
module.exports={rosterIds,abilityTagVocabulary,loadBatches,checkBatch,audit,nextBatch,nextExpansion,snapshot,fromSnapshot,filmAnchors,filmAnchorsFromContext,filmKeys,researchContext,inScope,FILM_POOLS,DEPICTION_SCOPE,DEPICTION_KINDS,SCOPE_EXEMPT_POOLS};

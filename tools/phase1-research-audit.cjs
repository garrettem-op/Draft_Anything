#!/usr/bin/env node
/* Phase 1 research pass: exact universe-scoped ability/trait decisions for
 * EVERY source character and EVERY registered alternate form.
 *
 * This is a source-linked consolidation plus researched manual corrections, not
 * an assertion that all missing evidence proves a negative. The gate remains
 * closed until all entries are individually justified.
 *
 * node tools/phase1-research-audit.cjs --summary
 * node tools/phase1-research-audit.cjs --write
 */
'use strict';
const path=require('node:path');
const fs=require('node:fs');
const vm=require('node:vm');
const {ROOT,loadGame,POWER_TAGS,POOL_IDS}=require('./ability-audit-lib.cjs');
const FORM_DECISIONS=require('../data/phase1-form-research.cjs');
const BASE_TRAIT_DECISIONS=require('../data/phase1-trait-research.cjs');
const TRAITS=['women','red','kids','mortal'];
const ALL=[...POWER_TAGS,...TRAITS];
const isLink=s=>/^https:\/\//.test(String(s||''));
const finding=(decision,status,reason,source,more={})=>({
  decision,status,reason:reason||'',source:source||'',...more
});
function collectPhase1Research(){
 const game=loadGame(),ctx=game.ctx;
 const manual=new Map(Object.entries(FORM_DECISIONS));
 const pools=Object.fromEntries(POOL_IDS.map(p=>[p,{base:{},forms:{}}]));
 const summary={
   base:0,forms:0,cells:0,yes:0,no:0,needsReview:0,
   existingSourceYes:0,existingCarryoverYes:0,existingTraitYes:0,
   individualFormYes:0,individualFormNo:0,explicitDisputeNo:0,
   classReviewNBA:0,positiveEvidenceDerivedNo:0,
   individualTraitYes:0,individualTraitNo:0,
   byPool:{}
 };
 const count=(pool,rec)=>{
   const s=summary.byPool[pool]??={characters:0,forms:0,yes:0,no:0,needsReview:0};
   for(const v of Object.values(rec)){
     summary.cells++;
     if(v.decision==='yes'){summary.yes++;s.yes++;}
     else if(v.decision==='no'){summary.no++;s.no++;}
     else if(v.decision==='needs-review'){summary.needsReview++;s.needsReview++;}
     else throw Error('Invalid decision: '+JSON.stringify(v));
   }
 };
 for(const c of game.roster){
   const records=game.abilities[c.id]||[];
   const carryovers=game.carryover.filter(x=>x.id===c.id);
   const disputes=game.disputes.filter(x=>x.id===c.id&&x.verdict==='incorrect');
   const found={};
   for(const tag of POWER_TAGS){
     const record=records.find(r=>r.tag===tag);
     const carry=carryovers.find(r=>r.tag===tag);
     const denied=disputes.find(r=>r.tag===tag);
     const has=game.tagIndex[c.pool]?.[c.n]?.includes(tag);
     if(c.pool==='nba'){
       found[tag]=finding('no','class-reviewed',
         c.n+' is an NBA athlete portrayed as an ordinary human basketball player; the roster does not depict a '+tag+' superpower, specialist technology, or qualifying fantasy feat.',
         'NBA basketball roster / real-world sports continuity');
       summary.classReviewNBA++;
     }else if(denied){
       found[tag]=finding('no','specific-negative-review',denied.reason,denied.source);
       summary.explicitDisputeNo++;
     }else if(has&&record){
       found[tag]=finding('yes','documented-ability',
         record.feat,record.source,{subtags:game.tagIndex[c.pool][c.n].filter(t=>t!==tag&&game.families[tag]?.includes(t)),
         continuity:record.continuity||'',limitation:record.limitation||''});
       summary.existingSourceYes++;
     }else if(has&&carry){
       found[tag]=finding('yes','reviewed-carryover',
         carry.basis,carry.source||'Prior curated character-specific audit',
         {subtags:carry.tags||[],furtherSourceReview:true,origin:carry.origin});
       summary.existingCarryoverYes++;
     }else if(has){
       throw Error('Unexplained positive ability '+c.id+' '+tag);
     }else{
       found[tag]=finding('needs-review','unverified-negative',
         'No individually evidenced qualifying '+tag+' feat is currently indexed for '+c.n+'. This is not proof that the ability is impossible.',
         '');
     }
   }
   for(const tag of TRAITS){
     let trait=null;
     ctx.__phase1Candidate=c;ctx.__phase1Trait=tag;
     const value=vm.runInContext('JSON.stringify(campaignTraitEvidence(__phase1Candidate,__phase1Trait))',ctx);
     if(value)trait=JSON.parse(value);
     const individual=BASE_TRAIT_DECISIONS[c.id]?.[tag];
     if(individual){
       if(trait?.allowed===true&&individual.decision==='no'||trait?.allowed===false&&individual.decision==='yes')
         throw Error('Manual research contradicts an existing individual trait ruling: '+c.id+' '+tag);
       found[tag]=finding(individual.decision,'individual-trait-review',individual.reason,individual.source);
       if(individual.decision==='yes')summary.individualTraitYes++;
       else summary.individualTraitNo++;
     }else if(c.pool==='nba'&&tag!=='red'){
       const yes=tag==='mortal';
       found[tag]=finding(yes?'yes':'no','class-reviewed',
         tag==='mortal'?
         c.n+' is a real professional basketball player, depicted with ordinary human physiology rather than supernatural or superhuman powers.':
         tag==='kids'?
         c.n+' is selected as an adult NBA basketball player, not a child/teenage fictional incarnation.':
         c.n+' is an adult male basketball player in the NBA source roster.',
         'NBA basketball roster / real-world sports continuity');
       summary.classReviewNBA++;
     }else if(trait?.allowed===false){
       found[tag]=finding('no','specific-negative-review',trait.reason,trait.source||trait.url);
     }else if(trait?.allowed===true){
       found[tag]=finding('yes',isLink(trait.source)?'sourced-trait':'curated-trait',
         trait.reason||'Existing individually keyed Campaign trait grant.',trait.source||trait.url,
         {furtherSourceReview:!isLink(trait.source)});
       summary.existingTraitYes++;
     }else{
       // The mortal rule can be rejected from directly documented supernatural
       // feats, but NEVER merely from missing trait inclusion.
       const supernatural=POWER_TAGS.filter(power=>
         (power==='magic'||power==='psychic'||power==='teleport')
         &&found[power].decision==='yes'&&found[power].status==='documented-ability'
       );
       if(tag==='mortal'&&supernatural.length){
         found[tag]=finding('no','entailed-by-documentary-feat',
           c.n+' has an individually documented supernatural ability: '+supernatural.map(t=>t+': '+found[t].reason).join(' | ').slice(0,450),
           found[supernatural[0]].source);
         summary.positiveEvidenceDerivedNo++;
       }else{
         found[tag]=finding('needs-review','uncertain-trait',
           'The '+tag+' classification must be assessed for this precise character and continuity; omission from a curated list is not proof of no.',
           '');
       }
     }
   }
   if(Object.keys(found).length!==16)throw Error('Missing audit decisions: '+c.id);
   pools[c.pool].base[c.n]={id:c.id,decisions:found};
   summary.base++;summary.byPool[c.pool]??={characters:0,forms:0,yes:0,no:0,needsReview:0};
   summary.byPool[c.pool].characters++;
   count(c.pool,found);
 }
 for(const f of ['data/variant-abilities.js','data/campaign-variant-expansion.js','data/campaign-strategy.js']){
   vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx,{filename:f});
 }
 const variants=JSON.parse(vm.runInContext('JSON.stringify(CAMPAIGN_VARIANTS)',ctx));
 const indexed=new Set(game.roster.map(c=>c.id));
 for(const [id,forms] of Object.entries(variants)){
   if(!indexed.has(id))throw Error('Unmatched base identity for alternate form '+id);
   const [pool]=id.split(':');
   const base=game.roster.find(c=>c.id===id);
   for(const form of forms){
     const key=id+'|'+form.name,manualDecisions=manual.get(key)||{};
     manual.delete(key);
     const findings={};
     for(const tag of ALL){
       const d=manualDecisions[tag];
       if(d){
         if(!['yes','no'].includes(d.decision)||!d.reason||!d.source)throw Error('Invalid evidence '+key+' '+tag);
         findings[tag]=finding(d.decision,'individual-form-review',d.reason,d.source);
         if(d.decision==='yes')summary.individualFormYes++;
         else summary.individualFormNo++;
       }else{
         findings[tag]=finding('needs-review','needs-form-specific-review',
           'The '+form.name+' continuity must be assessed independently for '+tag+'. Do not silently inherit baseline '+base.n+' tags.',
           '',{baselineStatus:pools[pool].base[base.n].decisions[tag].decision});
       }
     }
     ctx.__phase1Base=base;ctx.__phase1Form=form;
     const raw=vm.runInContext('JSON.stringify(window.DA_VARIANT_ABILITY_API.variantAbilityProfile(__phase1Base,__phase1Form))',ctx);
     pools[pool].forms[key]={
       id:key,baseId:id,name:form.name,origin:form.origin||'',continuity:form.continuity||'',
       combatAbilityRegistered:!!raw&&raw!=='null',decisions:findings
     };
     summary.forms++;summary.byPool[pool].forms++;count(pool,findings);
   }
 }
 if(manual.size)throw Error('Research records have no live alternate form: '+[...manual.keys()].join(' | '));
 for(const [id,entries] of Object.entries(BASE_TRAIT_DECISIONS)){
   if(!indexed.has(id))throw Error('Manual trait research for unknown roster identity: '+id);
   for(const trait of Object.keys(entries))if(!TRAITS.includes(trait))throw Error('Unknown researched trait: '+id+' '+trait);
 }
 if(summary.base!==game.roster.length||summary.cells!==(summary.base+summary.forms)*ALL.length)
   throw Error('Research decision matrix does not cover every form and character');
 return {schemaVersion:1,task:'Phase 1 Campaign research',rules:ALL,
  policy:'No-knowledge means needs-review; a no decision requires concrete negative evidence or NBA class review.',
  summary,pools,gate:{phase1Complete:summary.needsReview===0,phase2Unblocked:false}};
}
if(require.main===module){
 const report=collectPhase1Research();
 if(process.argv.includes('--write')){
   const dir=path.join(ROOT,'docs/phase1-research');
   fs.mkdirSync(dir,{recursive:true});
   for(const [pool,data] of Object.entries(report.pools))
     fs.writeFileSync(path.join(dir,pool+'.json'),JSON.stringify(data)+'\n');
   const index={schemaVersion:report.schemaVersion,task:report.task,rules:report.rules,
     policy:report.policy,summary:report.summary,gate:report.gate};
   fs.writeFileSync(path.join(dir,'summary.json'),JSON.stringify(index,null,2)+'\n');
   console.log('Wrote '+Object.keys(report.pools).length+' pool reviews and summary');
 }
 if(process.argv.includes('--summary')||!process.argv.includes('--write'))
   console.log(JSON.stringify(report.summary,null,2));
}
module.exports={collectPhase1Research};

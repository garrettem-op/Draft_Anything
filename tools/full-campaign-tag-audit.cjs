#!/usr/bin/env node
/* Full Campaign tag audit ledger, derived from the real roster and 34 live stage
 * definitions. Does NOT call an LLM or silently claim absence of a tag is proof
 * that a character lacks the power. Use --write to persist the full matrix.
 *
 * node tools/full-campaign-tag-audit.cjs --summary
 * node tools/full-campaign-tag-audit.cjs --write
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {ROOT,loadGame,POWER_TAGS}=require('./ability-audit-lib.cjs');
const {deriveCampaignTagTaxonomy}=require('../data/campaign-tag-taxonomy.js');

const TRAITS=['women','red','kids','mortal'];
function auditCampaignTags(){
  const game=loadGame();
  const context=game.ctx;
  const stages=JSON.parse(vm.runInContext('JSON.stringify([...CAMPAIGN_STAGES,...CAMPAIGN_EXTRA])',context));
  const taxonomy=deriveCampaignTagTaxonomy(stages);
  if(taxonomy.rules.length!==34)throw new Error('Campaign stage count changed; inspect the new taxonomy before updating the check');
  const actualAbilities=[...new Set(taxonomy.abilityTags)].filter(t=>POWER_TAGS.includes(t));
  const actualTraits=[...new Set(taxonomy.traitTags)].filter(t=>TRAITS.includes(t));
  if(actualTraits.length!==TRAITS.length)throw new Error('Trait registry did not cover every identity challenge.');
  if(actualAbilities.length!==POWER_TAGS.length)throw new Error('Power registry did not cover every thematic challenge.');
  const byPool={};
  const totals={characters:0,forms:0,abilityGranted:0,abilityMissing:0,traitGranted:0,traitRejected:0,traitUnreviewed:0,formTagsPending:0};
  const notes={};
  for(const candidate of game.roster){
    const granted=game.tagIndex[candidate.pool]?.[candidate.n];
    if(!Array.isArray(granted))throw new Error('Missing ability review for '+candidate.id);
    const positive=actualAbilities.filter(t=>granted.includes(t));
    const notGranted=actualAbilities.filter(t=>!granted.includes(t));
    const traits={};
    for(const trait of actualTraits){
      context.__auditCandidate=candidate;
      context.__auditTrait=trait;
      const raw=vm.runInContext('JSON.stringify(campaignTraitEvidence(__auditCandidate,__auditTrait))',context);
      const finding=raw?JSON.parse(raw):null;
      traits[trait]=finding?.allowed===true?{decision:'yes',basis:finding.source||'curated-trait-review',reason:finding.reason||''}:
        finding?.allowed===false?{decision:'no',basis:finding.source||'explicit-exclusion',reason:finding.reason||''}:
        {decision:'needs-individual-review'};
      if(finding?.allowed===true)totals.traitGranted++;
      else if(finding?.allowed===false)totals.traitRejected++;
      else totals.traitUnreviewed++;
    }
    byPool[candidate.pool]||={};
    byPool[candidate.pool][candidate.n]={
      abilities:{granted:positive,notGranted,reviewStatus:'existing-index; confirm positive and negative decisions individually'},
      traits
    };
    totals.characters++;
    totals.abilityGranted+=positive.length;
    totals.abilityMissing+=notGranted.length;
  }

  // Variants are distinct *forms*, not characters whose base tags can simply
  // be copied. An adult form, powerup or equipment swap may change eligibility.
  vm.runInContext(fs.readFileSync(path.join(ROOT,'data/variant-abilities.js'),'utf8'),context,{filename:'data/variant-abilities.js'});
  vm.runInContext(fs.readFileSync(path.join(ROOT,'data/campaign-variant-expansion.js'),'utf8'),context,{filename:'data/campaign-variant-expansion.js'});
  vm.runInContext(fs.readFileSync(path.join(ROOT,'data/campaign-strategy.js'),'utf8'),context,{filename:'data/campaign-strategy.js'});
  const variants=JSON.parse(vm.runInContext('JSON.stringify(CAMPAIGN_VARIANTS)',context));
  const rosterIds=new Set(game.roster.map(c=>c.id));
  const forms={};
  for(const [id,list] of Object.entries(variants)){
    if(!rosterIds.has(id))throw new Error('Variant source has no corresponding roster character: '+id);
    const base=game.roster.find(c=>c.id===id);
    forms[id]=list.map(f=>{
      context.__auditFormBase=base;
      context.__auditForm=f;
      const profile=vm.runInContext('JSON.stringify(window.DA_VARIANT_ABILITY_API.variantAbilityProfile(__auditFormBase,__auditForm))',context);
      totals.forms++;
      totals.formTagsPending+=actualAbilities.length+actualTraits.length;
      return {name:f.name,origin:f.origin||'',continuity:f.continuity||'',
        combatAbilityRegistered:!!(profile&&profile!=='null'),
        abilityTags:Object.fromEntries(actualAbilities.map(tag=>[tag,{decision:'needs-form-specific-review'}])),
        traitTags:Object.fromEntries(actualTraits.map(tag=>[tag,{decision:'needs-form-specific-review'}])),
        inheritedBaseTagsAreSuggestionsOnly:true};
    });
  }
  const ledger={
    schemaVersion:1,
    purpose:'Offline Campaign eligibility audit and review queue; not a canonical power encyclopedia',
    taxonomy,
    status:'PHASE_1_IN_PROGRESS',
    decisionSemantics:{
      yes:'current curated grant; individual research confirmation still required',
      no:'explicit documented exclusion, not inferred from missing evidence',
      notGranted:'absent from earlier reviewed power index; NOT definitive proof of no power',
      needsIndividualReview:'no sufficient independent yes/no decision yet'
    },
    totals,byPool,forms,
    completionGate:{
      requireAllTraitsReviewed:totals.traitUnreviewed===0,
      requireAllVariantsReviewed:totals.formTagsPending===0,
      requireAbilityProvenanceReview:true,
      phase2Ready:false
    }
  };
  return ledger;
}
if(require.main===module){
  const ledger=auditCampaignTags();
  if(process.argv.includes('--write')){
    const dest=path.join(ROOT,'docs/campaign-tag-audit-ledger.json');
    fs.writeFileSync(dest,JSON.stringify(ledger,null,2)+'\n');
    console.log('Wrote '+dest);
  }
  if(process.argv.includes('--summary')||!process.argv.includes('--write')){
    console.log(JSON.stringify({status:ledger.status,totals:ledger.totals,pools:Object.keys(ledger.byPool),stages:ledger.taxonomy.rules.length,gate:ledger.completionGate},null,2));
  }
}
module.exports={auditCampaignTags};

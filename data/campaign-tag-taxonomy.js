/* The existing Campaign challenge definitions are the source of truth for the
 * roster-wide tag audit. This module never guesses character eligibility. */
(function(root){
  'use strict';
  const parse = stage => {
    const c=stage.criteria||{},conditions=[];
    for(const tag of c.acceptedTags||[]) conditions.push({kind:'ability',key:tag,scope:'character'});
    if(c.trait) conditions.push({kind:'trait',key:c.trait,scope:'character'});
    for(const stat of c.stats||[]) conditions.push({kind:'attribute',key:stat.attribute,op:stat.op,value:stat.value,scope:'character'});
    for(const pool of c.poolIds||[]) conditions.push({kind:'pool',key:pool,scope:'character'});
    if(c.muppetForceMin!==undefined)conditions.push({kind:'muppetforce',key:'muppetforce',op:'gte',value:c.muppetForceMin,scope:'character'});
    if(c.neverPreviouslyWon)conditions.push({kind:'history',key:'unused',scope:'roster'});
    if(c.minDistinctPools)conditions.push({kind:'composition',key:'minDistinctPools',value:c.minDistinctPools,scope:'roster'});
    if(c.encounters)conditions.push({kind:'match',key:'encounters',value:c.encounters,scope:'match'});
    if(c.lineup)conditions.push({kind:'composition',key:'starterFraction',value:c.lineup.starterFraction||1,scope:'roster'});
    if(!conditions.length)conditions.push({kind:'composition',key:'unrestricted',scope:'roster'});
    return {name:stage.name,rule:stage.rule,conditions};
  };
  function deriveCampaignTagTaxonomy(stages,extras=[]){
    const rules=[...stages,...extras].map(parse),seen=new Set();
    for(const r of rules){
      if(!r.rule||seen.has(r.rule))throw new Error('Missing or duplicate Campaign rule: '+r.rule);
      seen.add(r.rule);
    }
    return {
      rules,
      abilityTags:[...new Set(rules.flatMap(r=>r.conditions.filter(c=>c.kind==='ability').map(c=>c.key)))],
      traitTags:[...new Set(rules.flatMap(r=>r.conditions.filter(c=>c.kind==='trait').map(c=>c.key)))],
      metricConditions:rules.flatMap(r=>r.conditions.filter(c=>c.kind==='attribute'||c.kind==='muppetforce').map(c=>({...c,rule:r.rule}))),
      poolTags:[...new Set(rules.flatMap(r=>r.conditions.filter(c=>c.kind==='pool').map(c=>c.key)))],
      groupRules:rules.filter(r=>r.conditions.some(c=>c.scope!=='character')).map(r=>r.rule)
    };
  }
  const api={deriveCampaignTagTaxonomy};
  if(root)root.DA_CAMPAIGN_TAG_TAXONOMY=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:null);

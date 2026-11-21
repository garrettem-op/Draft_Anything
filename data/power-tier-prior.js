/* Hidden power-tier prior (owner-only tuning data, never shown to players).
 *
 * Tiers S..F come from the owner's Power Tier Board export (data/power-tiers.json,
 * not committed yet). They are a bounded BACKSTOP for fighters that have no typed
 * ability profile. They never override researched abilities (Option C rule:
 * ratings are derived from competitive advantages, not substituted for them),
 * and no UI may read them. With no data loaded every lookup returns null and
 * combat is unchanged.
 */
(function(root){
  'use strict';
  const ORDER='SABCDEF';
  const STEP=0.01;         // per tier from C; applied to attack and HP, so it compounds
  const MAX_SWING=0.03;    // S = +3%, F = -3%
  let table=null;
  function build(json){
    const map=new Map();
    const pools=json&&json.tiers;
    if(!pools||typeof pools!=='object')return map;
    for(const tiers of Object.values(pools))
      for(const [tier,ids] of Object.entries(tiers||{}))
        if(ORDER.includes(tier)&&Array.isArray(ids))for(const id of ids)map.set(String(id),tier);
    return map;
  }
  function setPowerTiers(json){table=json?build(json):null;return table?table.size:0;}
  function candidateKeys(c){
    if(!c)return [];
    const pool=String(c.pool||'');
    const keys=[];
    if(c.variantBase)keys.push(pool+':'+c.variantBase+'|'+c.n);
    keys.push(String(c.id||pool+':'+c.n));
    return keys;
  }
  function powerTierOf(c,override){
    const t=override?build(override):table;
    if(!t||!t.size)return null;
    for(const k of candidateKeys(c)){const tier=t.get(k);if(tier)return tier;}
    // A reviewed variant without its own tier inherits nothing: no silent guess.
    return null;
  }
  function powerTierFactor(tier){
    if(!tier)return 1;
    const i=ORDER.indexOf(tier);
    if(i<0)return 1;
    return 1+Math.max(-MAX_SWING,Math.min(MAX_SWING,(3-i)*STEP));
  }
  const api={setPowerTiers,powerTierOf,powerTierFactor,TIER_ORDER:ORDER,MAX_SWING};
  if(typeof window!=='undefined'&&window.DA_POWER_TIERS)setPowerTiers(window.DA_POWER_TIERS);
  else if(typeof require==='function'){
    try{setPowerTiers(require('./power-tiers.json'));}catch(e){/* no data committed: prior is off */}
  }
  if(root)root.DA_POWER_TIER_PRIOR=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

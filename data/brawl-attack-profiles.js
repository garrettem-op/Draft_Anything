/* Battle Royale attack/defense profiles. Curated baseline powers + reviewed variant forms.
 * Numbers are bounded GAMEPLAY parameters, not canonical strength measurements.
 * Never infer a power merely from a character's name or unreviewed variant.
 */
(function(root){
  'use strict';
  const CORE=Object.freeze({
    'dc:Darkseid': {move:'Omega Beams',domain:'cosmic',tier:4,pierce:.34,guard:['cosmic'],cooldown:3},
    'dc:Lucifer Morningstar': {move:'Cosmic command',domain:'reality',tier:5,pierce:.43,guard:['magic','reality'],cooldown:4},
    'dc:Death of the Endless': {move:'Embodiment of Death',domain:'reality',tier:4,pierce:.30,guard:['reality'],cooldown:4},
    'dc:Ares (DC)': {move:'God of War',domain:'magic',tier:3,pierce:.22,guard:['magic'],cooldown:3},
    'mcu:Adam Warlock': {move:'Cosmic energy projection',domain:'cosmic',tier:3,pierce:.27,guard:['cosmic'],cooldown:3},
    'mcu:Scarlet Witch': {move:'Chaos magic',domain:'magic',tier:4,pierce:.32,guard:['magic'],cooldown:3},
    'mcu:The Watcher': {move:'Cosmic intervention',domain:'cosmic',tier:4,pierce:.30,guard:['cosmic'],cooldown:4}
  });
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const activeForm=c=>c&&c.variantAbilities&&Array.isArray(c.variantAbilities.domains)&&c.variantAbilities.domains.length;
  function brawlAbilityOf(candidate){
    if(!candidate)return null;
    // Only a reviewed form supplies additional active battle powers; an
    // unreviewed variant retains its edited physical attributes without invented abilities.
    if(activeForm(candidate)){
      const v=candidate.variantAbilities;
      const tier=clamp(Number(v.tier)||2,1,5);
      const hellbat=candidate.pool==='dc'&&candidate.n==='Hellbat Armor Batman'&&v.move==='Hellbat Counteroffensive';
      return {
        move:v.move||'Signature strike',domain:v.domains[0],
        tier,pierce:hellbat ? .34 : clamp(.08+.045*tier,.10,.34),
        guard:Array.isArray(v.guards)?v.guards.slice(0,8):[],
        weakTo:Array.isArray(v.weakTo)?v.weakTo.slice(0,8):[],
        cooldown:hellbat?3:(tier>=5?4:3),
        // The Hellbat is formidable in short exchanges, but prolonged use
        // consumes Bruce's metabolic reserves. Wear cannot by itself award a KO.
        wearStart:hellbat?5:0,wearRate:hellbat ? .025 : 0,
        origin:v.origin||'',limit:v.limit||''
      };
    }
    // Do not silently grant a variant base character's original powers when a
    // reviewed alternate form has replaced its kit.
    if(candidate.variantBase)return null;
    const rec=CORE[String(candidate.pool||'')+':'+String(candidate.n||'')];
    return rec?{...rec,guard:rec.guard.slice(),weakTo:[]}:null;
  }
  if(root)root.DA_BRAWL_ABILITY_API={brawlAbilityOf,CORE};
  if(typeof module!=='undefined'&&module.exports)module.exports={brawlAbilityOf,CORE};
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:null);

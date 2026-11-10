// Cross-mode character ability regression tests. No metered AI/API calls.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const campaign=fs.readFileSync(path.join(root,'data/campaign.js'),'utf8');
const strategy=fs.readFileSync(path.join(root,'data/campaign-strategy.js'),'utf8');
const expansion=require('../data/campaign-variant-expansion.js');
const pos=[{id:'a'},{id:'b'},{id:'coach',coach:true}];
const SPORTS={brawl:{pos}};
const rngFrom=seed=>{
  let n=2166136261;
  for(const ch of seed)n=Math.imul(n^ch.charCodeAt(0),16777619);
  return ()=>((n=Math.imul(n,1664525)+1013904223)>>>0)/4294967296;
};
const ctx={window:{DA_CAMPAIGN_VARIANT_EXPANSION:expansion},SPORTS,rngFrom};
vm.runInNewContext(strategy+'; this.api={variantOptions,variantSurgeCandidates,useVariantSurge,variantForm,variantRoster,campaignUseVariantSurge,campaignVariantRoster};',ctx);
const powers=ctx.api;

function makeThor(){
  return {id:'mcu:Thor',pool:'mcu',n:'Thor',a:Array(12).fill(95),
    sig:{name:'God of Thunder',kind:'chaos'},boom:true,g:['Avengers']};
}
function newDraft(seed='stable'){
  return {sport:'brawl',roster:{a:makeThor()},surge:null,status:'draft',variantSeed:seed};
}
test('all modes use the same documented character form catalog',()=>{
  const thor=makeThor();
  const forms=powers.variantOptions(thor);
  assert.ok(forms.some(form=>form.name==='Rune King Thor'));
  assert.ok(forms.length>=2);
  assert.equal(powers.variantSurgeCandidates(newDraft()).length,1);
  assert.match(html,/renderVariantSurgePanel\(c,'c-variant','c-variant-target',full,/,
    'Perfect Season and Dealt Hand must share the Surge UI');
  assert.match(campaign,/renderVariantSurgePanel\(v,'camp-variant','camp-variant-target',valid,'challenge'\)/,
    'Campaign must share the Surge UI');
  // H2H intentionally uses the newer on-character Surge prompt, not the
  // older dropdown panel, but must still use the shared form catalog/engine.
  assert.match(html,/function renderH2HPowers\(d\)/,
    'Head-to-Head must present its Surge phase');
  assert.match(html,/variantSurgeCandidates\(\{sport:d.sport,roster:rosterOf\(d,me\)/,
    'Head-to-Head must use documented form eligibility');
  assert.match(html,/useVariantSurge\(v,target,'h2h\|'/,
    'Head-to-Head must use the same Surge transformation engine');
  assert.match(html,/case 'h-variant-confirm':/,
    'Head-to-Head must expose the on-character Surge confirmation');
  assert.match(html,/case 'c-variant':/);
  assert.match(html,/case 'h-variant':/);
  assert.match(html,/case 'camp-variant':/);
});
test('every draft has exactly one targeted deterministic Surge that preserves identity and signature',()=>{
  const a=newDraft('same'),b=newDraft('same');
  const first=powers.useVariantSurge(a,'mcu:Thor','test-round');
  const second=powers.useVariantSurge(b,'mcu:Thor','test-round');
  assert.ok(first&&first.name);
  assert.equal(first.name,second.name);
  assert.equal(powers.useVariantSurge(a,'mcu:Thor','test-round'),null,'one charge per draft');
  const transformed=powers.variantRoster(a).a;
  assert.equal(transformed.id,'mcu:Thor');
  assert.equal(transformed.pool,'mcu');
  assert.equal(transformed.sig.name,'God of Thunder');
  assert.equal(transformed.boom,true);
  assert.equal(transformed.g[0],'Avengers');
  assert.equal(transformed.n,first.name);
  assert.ok(transformed.a.every(n=>n<=99&&n>=1),'attributes stay bounded');
  assert.ok(transformed.a.some((n,i)=>n!==a.roster.a.a[i]),'attributes actually transform');
  assert.ok(a.roster.a.a.every(n=>n===95),'base character cannot mutate');
  delete a.roster.a;
  assert.equal(powers.variantRoster(a),a.roster,'removal does not refund the spent charge');
  assert.equal(powers.useVariantSurge(a,'mcu:Thor','test-round'),null);
});
test('special cosmic forms contribute their bonus exactly once through universal teamScore',()=>{
  const thor=makeThor();
  const v={sport:'brawl',roster:{a:thor},surge:{id:thor.id,name:'Rune King Thor'}};
  const active=powers.variantRoster(v);
  assert.equal(active.a.variantRatingBonus,3);
  const source=html.match(/^function teamScore\(sportKey, roster\) \{[\s\S]*?^\}/m)?.[0];
  assert.ok(source,'shared scoring function must be present');
  const scoreContext={
    SPORTS:{test:{pos:[{id:'a',imp:1}],batting:false,fight:false}},
    fitIn:(_sport,c)=>c.a[0],
    coachMult:()=>1,benchMult:()=>1,
    synergyOf:()=>({total:0}),
    sigOf:rows=>({lift:rows[0].cand.sig?0.8:0,chaos:0,spark:[],list:[]}),
    muppetForceTeamwork:()=>({points:0})
  };
  vm.runInNewContext(source+'; this.score=teamScore;',scoreContext);
  const base=scoreContext.score('test',{a:thor});
  const variant=scoreContext.score('test',active);
  const actualBonus=variant.rating-base.rating;
  assert.equal(actualBonus,active.a.a[0]-thor.a[0]+3);
  assert.equal(variant.variantBonus,3);
  assert.match(campaign,/score\.rating\+=tactics\.yourPoints;/);
  assert.doesNotMatch(campaign,/score\.rating\+=tactics\.yourPoints\+variantBonus/,
    'Campaign may not add the same variant bonus twice');
});
test('signatures are retained and visible during selection across free, campaign, dealt and H2H drafts',()=>{
  assert.match(html,/function sigLine\(c\)/);
  assert.match(html,/\$\{sigLine\(c\)\}/,'normal picker contains signatures');
  assert.match(campaign,/\$\{sigLine\(c\)\}/,'Campaign picker contains signatures');
  assert.match(html,/const move = x\.sig\?\.name \|\| 'Wildcard contender'/,
    'Dealt Hand card exposes signatures');
  assert.match(html,/function gameRatings\(A, B, playoff, rng, sportKey=null\)/,'common match ratings, including contextual ToonForce events');
  assert.match(html,/const sig = sigOf\(rows\)/,'common team scoring');
});
test('H2H saves both players’ Surge choices and does not skip the ability-lock step',()=>{
  assert.match(html,/surges: \{\}, powerReady: \{\}/);
  assert.match(html,/status: done \? 'powers' : 'drafting'/);
  assert.match(html,/status:ready\.host&&ready\.guest\?'complete':'powers'/);
  assert.match(html,/h2hRoster\(d, 'host'\)/);
  assert.match(html,/h2hRoster\(d, 'guest'\)/);
  assert.match(html,/if \(d\.status === 'powers'\) return head\(''\) \+ renderH2HPowers\(d\)/);
  assert.match(html,/case 'h-ready': void lockH2HAbilities\(\)/);
});

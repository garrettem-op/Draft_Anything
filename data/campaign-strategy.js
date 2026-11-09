/* Draft Anything: Campaign encounter strategy and one-shot alternate forms.
   Every encounter is locked to a campaign seed + stage, never to the player's
   chosen lineup. The same retry uses the same opponents and simulation RNG.
   Variant Surge locks one random eligible character AND one documented form
   per stage; replacing that character does not return the charge. */
const CAMPAIGN_ATTR_INDEX=Object.freeze({spd:0,agi:1,str:2,siz:3,lep:4,end:5,tch:6,acc:7,ref:8,iq:9,clu:10,ldr:11});
const CAMPAIGN_TACTICS=Object.freeze({
  blitz:{name:'Explosive tempo',description:'Strikes before defenders can establish control',threat:'spd',counter:'iq',counterLabel:'Anticipation and game IQ'},
  assault:{name:'Overwhelming force',description:'Relies on physical pressure and close-range power',threat:'str',counter:'agi',counterLabel:'Agility and evasive movement'},
  control:{name:'Mental control',description:'Dominates positioning and decisions',threat:'iq',counter:'clu',counterLabel:'Composure and clutch resistance'},
  fortress:{name:'Attrition defense',description:'Absorbs attacks and wins a drawn-out fight',threat:'end',counter:'tch',counterLabel:'Technique and precision execution'},
  misdirection:{name:'Deceptive maneuvers',description:'Exploits gaps and confusion',threat:'agi',counter:'ref',counterLabel:'Reflexes and awareness'},
  precision:{name:'Precision strikes',description:'Targets weak spots with calculated attacks',threat:'acc',counter:'end',counterLabel:'Endurance and resilience'}
});
const CAMPAIGN_RULE_TACTICS=Object.freeze({
  fast:['blitz','misdirection','precision'],women:['control','fortress','precision'],
  red:['assault','blitz','fortress'],kids:['fortress','control','assault'],
  mortal:['assault','precision','control'],brain:['control','precision','misdirection'],
  strong:['assault','fortress','blitz'],underdog:['fortress','assault','precision'],
  short:['assault','blitz','control'],final:['control','fortress','assault'],
  flight:['blitz','precision','misdirection'],magic:['control','misdirection','precision'],
  psychic:['control','precision','misdirection'],aquatic:['fortress','misdirection','assault'],
  fire:['assault','blitz','precision'],ice:['fortress','control','precision'],
  electric:['blitz','precision','assault'],tech:['precision','fortress','control'],
  stealth:['misdirection','blitz','control'],teleport:['misdirection','blitz','precision'],
  healing:['fortress','control','assault'],giants:['assault','fortress','precision']
});
// These are named fictional forms, not new independently draftable characters.
// A form temporarily boosts a subset of its base character's existing stats.
// Some forms cross from the film incarnation into comic continuity by design.
const CAMPAIGN_VARIANTS=Object.freeze({
  'mcu:Thor':[
    {name:'Rune King Thor',changes:{iq:14,tch:12,clu:9,ldr:7},origin:'Marvel Comics · Rune King Thor'},
    {name:'King Thor',changes:{str:8,end:9,iq:10,ldr:12},origin:'Marvel Comics · King Thor'}
  ],
  'mcu:Jean Grey':[
    {name:'White Phoenix of the Crown',changes:{iq:12,tch:13,ref:12,clu:12},origin:'Marvel Comics · White Phoenix'},
    {name:'Dark Phoenix',changes:{str:10,tch:13,clu:-5,spd:8},origin:'Marvel Comics · Dark Phoenix'}
  ],
  'mcu:Scarlet Witch':[
    {name:'House of M Scarlet Witch',changes:{tch:14,iq:12,ref:11,clu:5},origin:'Marvel Comics · House of M'},
    {name:'Darkhold Scarlet Witch',changes:{tch:11,str:9,clu:-5,iq:8},origin:'Marvel Studios · Multiverse of Madness'}
  ],
  'mcu:Hulk':[
    {name:'World Breaker Hulk',changes:{str:13,end:13,siz:8,clu:-8},origin:'Marvel Comics · World Breaker'},
    {name:'Immortal Hulk',changes:{end:14,str:10,ref:7},origin:'Marvel Comics · Immortal Hulk'}
  ],
  'mcu:Iron Man':[
    {name:'Bleeding Edge Iron Man',changes:{tch:12,ref:10,agi:9,iq:8},origin:'Marvel Comics · Bleeding Edge armor'}
  ],
  'mcu:Loki':[
    {name:'God of Stories Loki',changes:{iq:13,tch:12,ref:10,clu:9},origin:'Marvel Comics · God of Stories'}
  ],
  'mcu:Doctor Strange':[
    {name:'Black Priest Doctor Strange',changes:{tch:13,iq:11,ref:8},origin:'Marvel Comics · Black Priests'}
  ],
  'mcu:Captain America':[
    {name:'Worthy Captain America',changes:{str:12,end:8,tch:10,ldr:7},origin:'Marvel Studios · Avengers: Endgame'}
  ],
  'games:Sonic the Hedgehog':[
    {name:'Super Sonic',changes:{spd:12,agi:10,ref:11,end:10},origin:'Sonic · Chaos Emerald transformation'}
  ],
  'games:Shadow the Hedgehog':[
    {name:'Super Shadow',changes:{spd:11,agi:9,ref:10,tch:8},origin:'Sonic · Super transformation'}
  ],
  'games:Mario':[
    {name:'Fire Mario',changes:{tch:10,acc:12,ref:8},origin:'Super Mario · Fire Flower'},
    {name:'Cat Mario',changes:{agi:12,lep:11,ref:9},origin:'Super Mario 3D World · Super Bell'}
  ],
  'games:Link':[
    {name:'Fierce Deity Link',changes:{str:12,tch:12,ref:11,clu:9},origin:"The Legend of Zelda · Majora's Mask"}
  ],
  'games:Bowser':[
    {name:'Fury Bowser',changes:{str:12,siz:13,end:10,clu:-6},origin:"Super Mario 3D World + Bowser's Fury"}
  ],
  'pokemon:Charizard':[
    {name:'Mega Charizard X',changes:{str:13,tch:8,end:8},origin:'Pokémon · Mega Evolution'},
    {name:'Mega Charizard Y',changes:{acc:13,tch:11,spd:6},origin:'Pokémon · Mega Evolution'}
  ],
  'pokemon:Mewtwo':[
    {name:'Mega Mewtwo X',changes:{str:13,tch:11,end:7},origin:'Pokémon · Mega Evolution'},
    {name:'Mega Mewtwo Y',changes:{tch:13,spd:11,iq:9},origin:'Pokémon · Mega Evolution'}
  ]
});
function campaignStageSeed(v,step=v.step){
  return String(v.seed||'legacy-campaign')+'|'+v.sport+'|'+step+'|'+(v.stageOrder?.[step]??step);
}
function campaignOpponentPool(rule,all){
  if(rule==='kids')return all.filter(c=>!CAMPAIGN_KIDS.has(c.n));
  if(rule==='mortal')return all.filter(c=>!campaignAllowed(c,'mortal'));
  if(rule==='underdog')return all.filter(c=>c.a.reduce((x,y)=>x+y,0)/12>76);
  if(rule==='short'||rule==='final')return all;
  return all.filter(c=>campaignAllowed(c,rule));
}
function campaignBuildOpponent(v,stage){
  const sp=SPORTS[v.sport],P=sp.pos.length,all=getCands('mashup');
  let pool=campaignOpponentPool(stage.rule,all);
  if(pool.length<P)pool=all; // A full-strength antagonist for scarce themes.
  const rng=rngFrom(campaignStageSeed(v)+':opponent');
  const ranked=pool.slice().sort((a,b)=>candVal(v.sport,b)-candVal(v.sport,a));
  // The rank band tightens as the campaign advances, independent of user rating.
  // A seeded subset within that band changes adversaries across campaign runs.
  const start=Math.min(Math.max(0,ranked.length-P*2),Math.round((9-v.step)/9*P*1.2));
  const band=ranked.slice(start,start+Math.max(P*4,P+8));
  const shortlist=band.filter(()=>rng()>0.18);
  const choices=shortlist.length>=P?shortlist:band;
  const roster=aiStackDraft(v.sport,choices,1,false)[0]||aiStackDraft(v.sport,ranked,1,false)[0]||{};
  const strategies=CAMPAIGN_RULE_TACTICS[stage.rule]||['assault','control','blitz'];
  const tactic=strategies[Math.floor(rng()*strategies.length)]||strategies[0];
  return {roster:Object.fromEntries(Object.entries(roster).map(([slot,c])=>[slot,c.id])),tactic,
    difficultyBonus:+(v.step*0.35).toFixed(2)};
}
function campaignLockedOpponent(v,stage){
  if(!v.opponents||typeof v.opponents!=='object')v.opponents={};
  let o=v.opponents[v.step];
  if(!o||!o.roster||!o.tactic||!Object.values(o.roster).every(id=>!!candById('mashup',id))){
    o=campaignBuildOpponent(v,stage);
    v.opponents[v.step]=o;
    saveCampaign();
  }
  const roster=Object.fromEntries(Object.entries(o.roster).map(([slot,id])=>[slot,candById('mashup',id)]).filter(([,c])=>!!c));
  const score=teamScore(v.sport,roster);
  score.rating+=Number(o.difficultyBonus)||0;
  return {roster,score,tactic:o.tactic,difficultyBonus:o.difficultyBonus||0};
}
function campaignActiveAverage(sport,roster,attr){
  const ix=CAMPAIGN_ATTR_INDEX[attr];
  const players=(SPORTS[sport]?.pos||[]).filter(p=>!p.coach&&!p.bench&&roster[p.id]);
  return players.length?players.reduce((sum,p)=>sum+(Number(roster[p.id].a?.[ix])||0),0)/players.length:0;
}
function campaignTeamVariety(sport,roster){
  const focus=['spd','str','tch','iq','ref','acc'];
  const positions=(SPORTS[sport]?.pos||[]).filter(p=>!p.coach&&!p.bench&&roster[p.id]);
  const types=new Set(positions.map(p=>focus.reduce((best,k)=>roster[p.id].a[CAMPAIGN_ATTR_INDEX[k]]>roster[p.id].a[CAMPAIGN_ATTR_INDEX[best]]?k:best,focus[0])));
  return Math.min(1.5,Math.max(0,types.size-1)*0.4);
}
function campaignTacticalMatch(sport,yourRoster,rivalRoster,tacticKey){
  const tactic=CAMPAIGN_TACTICS[tacticKey]||CAMPAIGN_TACTICS.assault;
  const threat=campaignActiveAverage(sport,rivalRoster,tactic.threat);
  const defense=campaignActiveAverage(sport,yourRoster,tactic.counter);
  // Interactions can outmatter a small raw rating edge; neither side receives
  // an unlimited bonus simply for stacking maximum-rating characters.
  const counter=Math.max(-2.5,Math.min(3.8,(defense-threat+8)*0.2));
  const pressure=Math.max(0,Math.min(2.0,(threat-defense)*0.095));
  const variety=campaignTeamVariety(sport,yourRoster);
  const rivalVariety=campaignTeamVariety(sport,rivalRoster);
  return {label:tactic.name,weakness:tactic.counterLabel,description:tactic.description,
    counterPoints:+counter.toFixed(2),pressurePoints:+pressure.toFixed(2),
    varietyPoints:+variety.toFixed(2),rivalVarietyPoints:+rivalVariety.toFixed(2),
    yourPoints:+(counter+variety).toFixed(2),rivalPoints:+(pressure+rivalVariety).toFixed(2)};
}
function campaignVariantOptions(candidate){
  return candidate?CAMPAIGN_VARIANTS[candidate.pool+':'+candidate.n]||[]:[];
}
function campaignSurgeCandidates(v){
  const sp=SPORTS[v.sport];
  return sp.pos.filter(p=>!p.coach&&v.roster[p.id]&&campaignVariantOptions(v.roster[p.id]).length)
    .map(p=>v.roster[p.id]);
}
function campaignUseVariantSurge(v){
  if(v.surge||v.status!=='draft')return null;
  const options=campaignSurgeCandidates(v);
  if(!options.length)return null;
  const rng=rngFrom(campaignStageSeed(v)+':variant-surge');
  const target=options[Math.floor(rng()*options.length)];
  const forms=campaignVariantOptions(target);
  const form=forms[Math.floor(rng()*forms.length)];
  v.surge={id:target.id,name:form.name};
  return v.surge;
}
function campaignVariantForm(v){
  if(!v.surge)return null;
  const base=Object.values(v.roster).find(c=>c?.id===v.surge.id);
  if(!base)return null;
  const form=campaignVariantOptions(base).find(f=>f.name===v.surge.name);
  return form?{base,form}:null;
}
function campaignVariantRoster(v){
  const transform=campaignVariantForm(v);
  if(!transform)return v.roster;
  const roster={...v.roster};
  for(const [slot,c] of Object.entries(roster)){
    if(c?.id!==transform.base.id)continue;
    const attrs=c.a.slice();
    for(const [k,delta] of Object.entries(transform.form.changes)){
      const i=CAMPAIGN_ATTR_INDEX[k];
      if(i!==undefined)attrs[i]=Math.max(1,Math.min(99,attrs[i]+delta));
    }
    roster[slot]={...c,n:transform.form.name,a:attrs,variantBase:c.n};
  }
  return roster;
}
if(typeof module!=='undefined'&&module.exports){
  module.exports={CAMPAIGN_TACTICS,CAMPAIGN_VARIANTS,campaignStageSeed,campaignOpponentPool,campaignBuildOpponent,
    campaignActiveAverage,campaignTeamVariety,campaignTacticalMatch,campaignVariantOptions,
    campaignUseVariantSurge,campaignVariantForm,campaignVariantRoster};
}

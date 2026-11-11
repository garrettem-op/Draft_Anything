const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const after=fs.readFileSync(path.join(root,'data/after-action.js'),'utf8');
const strategy=fs.readFileSync(path.join(root,'data/campaign-strategy.js'),'utf8');
const ability=require('../data/variant-abilities.js');
const expansion=require('../data/campaign-variant-expansion.js');
const pos=[{id:'fighter',imp:1},{id:'bench',bench:true},{id:'coach',coach:true}];
const ctx={window:{DA_CAMPAIGN_VARIANT_EXPANSION:expansion,DA_VARIANT_ABILITY_API:ability},
  SPORTS:{brawl:{pos}},rngFrom:()=>()=>0};
vm.runInNewContext(strategy+';this.variant={variantOptions,variantRoster,useVariantSurge};',ctx);
const v=ctx.variant;
const make=(pool,n)=>({pool,n,id:pool+':'+n,a:Array(12).fill(90),
  sig:{name:'Original move',kind:'lift'},g:['team'],boom:true});
const set=(base,form)=>({sport:'brawl',roster:{fighter:base},surge:{id:base.id,name:form}});
const flat=o=>JSON.parse(JSON.stringify(o));

test('curated variant abilities are continuity-scoped and sourced to their documented form',()=>{
  const thor=make('mcu','Thor');
  const form=v.variantOptions(thor).find(x=>x.name==='Rune King Thor');
  const skill=ability.variantAbilityProfile(thor,form);
  assert.equal(skill.move,'Unweave the Ragnarok Cycle');
  assert.ok(skill.domains.includes('reality'));
  assert.ok(skill.guards.includes('magic'));
  assert.equal(skill.origin,form.origin);
  assert.match(skill.limit,/story-specific/);
  assert.equal(ability.variantAbilityProfile(make('toons','Thor'),form),null,
    'matching names cannot borrow powers across universes');
  assert.equal(ability.variantAbilityProfile(thor,{name:'Not A Real Form'}),null);
});
test('documented powers change the form move and retain immutable base identity',()=>{
  const thor=make('mcu','Thor'),input=set(thor,'Rune King Thor');
  const result=v.variantRoster(input).fighter;
  assert.equal(result.id,thor.id);
  assert.equal(result.n,'Rune King Thor');
  assert.equal(result.sig.name,'Unweave the Ragnarok Cycle');
  assert.equal(result.sig.kind,'chaos');
  assert.ok(result.variantAbilities.domains.includes('reality'));
  assert.equal(result.g[0],'team');
  assert.equal(result.boom,true);
  assert.equal(thor.sig.name,'Original move');
  assert.ok(thor.a.every(x=>x===90));
});
test('King Thanos transforms through the shared surge path with an evidence-linked ability, not capped stats alone',()=>{
  const base=make('mcu','Thanos');
  const form=v.variantOptions(base).find(x=>x.name==='King Thanos');
  assert.ok(form);
  const king=v.variantRoster(set(base,'King Thanos')).fighter;
  assert.equal(king.id,base.id);
  assert.equal(king.n,'King Thanos');
  assert.equal(king.variantAbilities.tier,4);
  assert.equal(king.sig.name,'End-of-Time Onslaught');
  assert.equal(king.variantRatingBonus,2.5);
  assert.match(king.variantAbilities.source,/marvel\.com\/comics\/discover\/1214\/thanos-wins/);
  assert.equal(ability.variantAbilityProfile(base,{name:'King Thanos'}).tier,4);
  assert.equal(base.variantAbilities,undefined);
});
test('unreviewed forms never get powers invented from their name or stats',()=>{
  const base=make('mcu','Iron Man'),form='Model Prime Iron Man';
  assert.ok(v.variantOptions(base).some(x=>x.name===form));
  assert.equal(ability.variantAbilityProfile(base,v.variantOptions(base).find(f=>f.name===form)),null);
  const transformed=v.variantRoster(set(base,form)).fighter;
  assert.equal(transformed.variantAbilities,null);
  assert.equal(transformed.sig.name,'Original move');
  assert.notDeepEqual(flat(transformed.a),flat(base.a),'unreviewed form still changes attributes');
});
test('opposing documented resistances and vulnerabilities affect actual match strength',()=>{
  const thor=v.variantRoster(set(make('mcu','Thor'),'Rune King Thor')).fighter;
  const doom=v.variantRoster(set(make('mcu','Doctor Doom'),'God Emperor Doom')).fighter;
  const plain=make('mcu','Hawkeye');
  const mk=c=>({rows:[{cand:c,pos:{id:'fighter'}}],rating:70,sig:{chaos:0,spark:[]}});
  const free=ability.variantBattleImpact(mk(thor),mk(plain),'brawl');
  const counter=ability.variantBattleImpact(mk(thor),mk(doom),'brawl');
  assert.ok(free.points>counter.points);
  assert.ok(counter.events[0].defended.includes('reality'));
  assert.ok(free.points>ability.variantBattleImpact(mk(thor),mk(plain),'basketball').points,
    'sport-specific scaling favors Battle Royale combat');
  assert.deepEqual(flat(ability.variantBattleImpact(mk(plain),mk(thor),'brawl')), {points:0,events:[]});
});
test('unreviewed forms do not trigger matchup impact and forms are bounded',()=>{
  const base=make('mcu','Iron Man');
  const unreviewed=v.variantRoster(set(base,'Model Prime Iron Man')).fighter;
  const opponent=make('mcu','Hawkeye');
  const score=c=>({rows:[{cand:c,pos:{id:'fighter'}}]});
  assert.equal(ability.variantBattleImpact(score(unreviewed),score(opponent),'brawl').points,0);
  for(const rec of Object.values(ability.VARIANT_ABILITY_PROFILES)){
    assert.ok(rec.tier>=1&&rec.tier<=5);
    assert.ok(['lift','chaos','clutch','unbreakable'].includes(rec.kind));
    assert.ok(rec.limit.length>10);
  }
  const standard=score(opponent);
  const extreme=score(v.variantRoster(set(make('dc','Batman'),'The Darkest Knight')).fighter);
  assert.ok(ability.variantBattleImpact(extreme,standard,'brawl').points<=9);
});
test('variant effects contribute to the same game rating pipeline and explainable breakdown',()=>{
  const thor=v.variantRoster(set(make('mcu','Thor'),'Rune King Thor')).fighter;
  const plain=make('mcu','Hawkeye');
  const scores=[
    {rating:78,rows:[{cand:thor,pos:{id:'fighter'}}],sig:{chaos:0,spark:[]}},
    {rating:76,rows:[{cand:plain,pos:{id:'fighter'}}],sig:{chaos:0,spark:[]}}
  ];
  const gameFn=html.match(/^function gameRatings\(A, B, playoff, rng, sportKey=null\) \{[\s\S]*?^\}/m)?.[0];
  const breakFn=html.match(/^function matchRatingBreakdown\(A,B,g,randomDelta\) \{[\s\S]*?^\}/m)?.[0];
  assert.ok(gameFn&&breakFn);
  const env={window:{DA_VARIANT_ABILITY_API:ability},toonForceBattleEvent:()=>null,
    SIG:{clutch:1},BOOM:{p:0.1,up:1,down:1,bust:0.1}};
  vm.runInNewContext(gameFn+'\n'+breakFn+';this.sim={gameRatings,matchRatingBreakdown};',env);
  const game=env.sim.gameRatings(...scores,false,()=>0.5,'brawl');
  assert.ok(game.variant[0]>0);
  assert.equal(game.variant[1],0);
  assert.equal(game.ra,78+game.variant[0]);
  const d=env.sim.matchRatingBreakdown(...scores,game,0.4);
  assert.equal(+d.final[0].toFixed(2),+(game.ra+0.2).toFixed(2));
  assert.equal(+d.final[1].toFixed(2),+(game.rb-0.2).toFixed(2));
  assert.equal(d.variantEvents.length,1);
  assert.match(after,/Variant abilities in this matchup/);
  assert.match(after,/row\('Variant ability · form-specific matchup','variant'\)/);
});
test('Perfect Season, Dealt Hand, Campaign, and H2H use same matchup function',()=>{
  const camp=fs.readFileSync(path.join(root,'data/campaign.js'),'utf8');
  assert.match(html,/data\/variant-abilities\.js/);
  assert.match(html,/powerApi\.variantBattleImpact\(A,B,sportKey\)/);
  assert.match(html,/gameRatings\(teams\[a\]\.score, teams\[b\]\.score, false, rng, sportKey\)/);
  assert.match(html,/const g = gameRatings\(A, B, playoff, rng, sportKey\)/);
  assert.match(camp,/const game=playGame\(v\.sport,score,oppScore/);
  assert.match(html,/return playGame\(sportKey, scoreA, scoreB, UPSET_SIGMA\[upsets\]/);
  assert.match(html,/function renderVariantSurgePanel/);
  assert.match(html,/Unique move:/);
});

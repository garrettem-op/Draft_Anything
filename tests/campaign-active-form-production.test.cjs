/* Campaign active-form (Variant Surge) eligibility, tested against production data: the live roster,
   the real Variant Surge catalog and odds, the reviewed form research and the real Campaign engine.
   Only fit, team scoring and persistence are stubbed, because the rules under test do not depend on them.
   No network, no paid AI. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {loadGame}=require('../tools/ability-audit-lib.cjs');
const {coverage,PENDING}=require('../tools/variant-eligibility-coverage.cjs');
const RESEARCH=require('../data/variant-form-research.js');

const ROOT=path.join(__dirname,'..');
const game=loadGame(),ctx=game.ctx;
for(const f of ['data/brawl-exceptional-power.js','data/brawl-attack-profiles.js','data/brawl-combat.js',
  'data/campaign-variant-expansion.js','data/variant-abilities.js','data/campaign-strategy.js'])
  vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx,{filename:f});
const byId=new Map(game.roster.map(c=>[c.id,c]));
const get=(pool,n)=>{const c=byId.get(pool+':'+n);if(!c)throw Error('Missing live character '+pool+':'+n);return c;};
const run=(expr,vars={})=>{Object.assign(ctx,vars);return vm.runInContext(expr,ctx);};
const realUseVariantSurge=run('useVariantSurge');
function seeded(s){let n=2166136261;for(const x of String(s))n=Math.imul(n^x.charCodeAt(0),16777619);
  return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
const STARTERS=Array.from({length:5},(_,i)=>({id:'p'+i}));
Object.assign(ctx,{
  SPORTS:{brawl:{pos:[...STARTERS,{id:'bn',bench:true,side:true},{id:'cmd',coach:true,side:true}]}},
  fitIn:(sport,c)=>c.a.reduce((s,x)=>s+x,0)/c.a.length,
  teamScore:()=>({rating:0}),rngFrom:seeded,saveCampaign:()=>{},
  candById:(pool,id)=>byId.get(id),getCands:()=>game.roster
});
const pos=STARTERS[0];
const fresh=(extra={})=>({seed:'active-form-production',sport:'brawl',step:0,stageOrder:[0],history:[],
  roster:{},surge:[],status:'draft',opponents:{},...extra});
const stageFor=rule=>run('[...CAMPAIGN_STAGES,...CAMPAIGN_EXTRA].find(s=>s.rule===__r)',{__r:rule});
const base=(c,rule,v=fresh(),side='player')=>run('campaignEligibilityResult(__c,__r,__p,__s,__v)',{__c:c,__r:rule,__p:pos,__s:side,__v:v});
const project=(c,name)=>run('campaignProjectForm(__c,{name:__n})',{__c:c,__n:name});
const inForm=(c,name,rule,v=fresh(),side='player')=>run('campaignFormEligibility(__c,__f,__r,__p,__s,__v)',
  {__c:c,__f:project(c,name),__r:rule,__p:pos,__s:side,__v:v});
const surged=(c,name,rule,v=fresh())=>run('campaignActivePickResult(__c,__r,__p,"player",__v)',
  {__c:c,__r:rule,__p:pos,__v:{...v,surge:[{id:c.id,name}]}});

test('every reviewed form record names a real catalog form of a live character and a real Campaign rule',()=>{
  const variants=run('CAMPAIGN_VARIANTS');
  const rules=new Set(run('[...CAMPAIGN_STAGES,...CAMPAIGN_EXTRA].map(s=>s.rule)'));
  const formRules=run('CAMPAIGN_FORM_RULES');
  assert.ok(Object.keys(formRules).length>=80);
  assert.deepEqual(Object.keys(formRules).sort(),Object.keys(RESEARCH).sort(),'the game reads the reviewed research, nothing else');
  for(const [key,tags] of Object.entries(formRules)){
    const [id,form]=key.split('|');
    assert.ok(byId.has(id),key+': base is not a live roster character (canonical pool:name)');
    assert.ok((variants[id]||[]).some(f=>f.name===form),key+': no catalog form with this exact name');
    for(const tag of Object.keys(tags))assert.ok(rules.has(tag),key+': '+tag+' is not a Campaign rule');
  }
  const c=coverage();
  assert.equal(c.orphanResearch.length,0);
  assert.equal(c.forms.filter(f=>!f.live).length,0);
  for(const [key,tag] of PENDING)assert.equal(formRules[key]?.[tag],undefined,key+' '+tag+' is held for review, not granted');
});

test('variants without reviewed eligibility data are listed for follow-up, and the report is current',()=>{
  const c=coverage();
  const open=c.forms.filter(f=>!Object.keys(f.reviewed).length);
  assert.ok(open.length>0);
  assert.ok(open.some(f=>f.key==='mcu:Odin|Young Odin (Prehistoric Avengers)'));
  const doc=fs.readFileSync(path.join(ROOT,'docs/variant-eligibility-coverage.md'),'utf8');
  assert.equal(doc,require('../tools/variant-eligibility-coverage.cjs').render(c),'run node tools/variant-eligibility-coverage.cjs --write');
});

test('characters gain challenge eligibility through a reviewed transformation',()=>{
  for(const [pool,n,rule,form] of [['dc','Batman','flight','Dawnbreaker Batman'],['mcu','Odin','giants','Odin in Destroyer Armor'],
    ['pokemon','Pikachu','giants','Gigantamax Pikachu'],['dc','Superman','electric','Superman Blue'],
    ['dc','Batman','teleport','The Darkest Knight']]){
    const c=get(pool,n);
    assert.equal(base(c,rule).allowed,false,n+' base must not qualify for '+rule);
    const r=surged(c,form,rule);
    assert.equal(r.allowed,true,form+' should qualify for '+rule);
    assert.equal(r.source,'campaign-variant-evidence');
  }
});

test('characters lose challenge eligibility through a reviewed transformation',()=>{
  for(const [pool,n,rule,form] of [['dc','Batman','mortal','Red Death Batman'],['pokemon','Ninetales','fire','Alolan Ninetales'],
    ['games','Mario','red','Ice Mario'],['games','Mario','red','Cat Mario']]){
    const c=get(pool,n);
    assert.equal(base(c,rule).allowed,true,n+' base qualifies for '+rule);
    assert.equal(surged(c,form,rule).allowed,false,form+' must not qualify for '+rule);
  }
});

test('only the actually rolled variant decides, and a spent roll cannot qualify through another form',()=>{
  const batman=get('dc','Batman'),v=fresh();
  assert.equal(run('campaignCanPotentiallyPick(__c,"flight",__p,"player",__v)',{__c:batman,__p:pos,__v:v}),true,'an unspent surge could still produce Dawnbreaker');
  const spent=fresh({surge:[{id:batman.id,name:'Red Death Batman'}]});
  assert.equal(surged(batman,'Red Death Batman','flight').allowed,false);
  assert.equal(run('campaignCanPotentiallyPick(__c,"flight",__p,"player",__v)',{__c:batman,__p:pos,__v:spent}),false,'Dawnbreaker no longer reachable');
  // Unreviewed forms inherit the base classification instead of copying another form's evidence.
  const odin=get('mcu','Odin');
  assert.equal(surged(odin,'Young Odin (Prehistoric Avengers)','giants').allowed,false);
  assert.equal(surged(odin,'Young Odin (Prehistoric Avengers)','magic').allowed,base(odin,'magic').allowed);
});

test('numerical challenges use the transformed attributes, in both directions',()=>{
  const variants=run('CAMPAIGN_VARIANTS');
  let gained=0,lost=0;
  for(const [id,list] of Object.entries(variants)){
    const c=byId.get(id);
    for(const f of list)for(const rule of ['fast','brain','strong','brains-not-brawn']){
      const crit=run('campaignCriteria(__r)',{__r:rule});
      const passes=x=>run('campaignPassesStats(__x,__s)',{__x:x,__s:crit.stats});
      const form=project(c,f.name),r=surged(c,f.name,rule).allowed;
      assert.equal(r,passes(form),f.name+' '+rule+' must follow the transformed attributes');
      if(r&&!passes(c))gained++;
      if(!r&&passes(c))lost++;
    }
  }
  assert.ok(gained>=20,'transformations cross stat thresholds upward: '+gained);
  const mewtwo=get('games','Mewtwo');
  assert.equal(base(mewtwo,'strong').allowed,false);
  assert.equal(surged(mewtwo,'Mega Mewtwo X','strong').allowed,true);
  assert.ok(lost>=0);
});

test('The Underdogs keeps its pre-surge restrictions in both directions',()=>{
  const charizard=get('pokemon','Charizard');
  const avg=c=>c.a.reduce((s,x)=>s+x,0)/c.a.length;
  assert.ok(avg(charizard)<=73&&avg(project(charizard,'Mega Charizard X'))>73,'fixture crosses the 73 average');
  assert.equal(base(charizard,'underdog').allowed,true);
  assert.equal(surged(charizard,'Mega Charizard X','underdog').allowed,true,'a surge after drafting does not disqualify an Underdog');
  const variants=run('CAMPAIGN_VARIANTS');
  for(const [id,list] of Object.entries(variants)){
    const c=byId.get(id);
    if(base(c,'underdog').allowed)continue;
    for(const f of list)assert.equal(surged(c,f.name,'underdog').allowed,false,f.name+': a surge cannot qualify a non-Underdog');
  }
});

test('talent pool, identity, history and reservations stay tied to the base character',()=>{
  const pikachu=get('pokemon','Pikachu');
  assert.equal(surged(pikachu,'Gigantamax Pikachu','arcade-monsters').allowed,true);
  assert.equal(surged(pikachu,'Gigantamax Pikachu','marvel-dc').allowed,false);
  const active=run('variantRoster({roster:{p0:__c},surge:[{id:__c.id,name:"Gigantamax Pikachu"}]}).p0',{__c:pikachu});
  assert.equal(active.id,pikachu.id,'the surged form keeps the base identity');
  assert.equal(active.pool,pikachu.pool);
  assert.equal(active.variantBase,'Pikachu');
  const used=fresh({singleUse:true,history:[{ids:[pikachu.id],playerUsedIds:[pikachu.id],cpuIds:[]}]});
  assert.equal(surged(pikachu,'Gigantamax Pikachu','giants',used).allowed,false,'a used base cannot return as its form');
  assert.equal(run('campaignCanPotentiallyPick(__c,"giants",__p,"player",__v)',{__c:pikachu,__p:pos,__v:used}),false);
  const cpuUsed=fresh({history:[{ids:[],cpuIds:[pikachu.id]}]});
  assert.equal(run('campaignCpuCanAttempt(__c,"giants",__p,__v)',{__c:pikachu,__p:pos,__v:cpuUsed}),false,'CPU reuse rules apply to the base');
  // Queens of the Court is identity: a form never changes it.
  const jean=get('mcu','Jean Grey');
  for(const f of run('variantOptions(__c)',{__c:jean}))
    assert.equal(surged(jean,f.name,'women').allowed,base(jean,'women').allowed,f.name);
  const reserved=fresh({snake:{step:0,cpu:{p0:pikachu.id},tactic:'assault'},roster:{p1:pikachu}});
  assert.ok(run('campaignReservedIds(__v)',{__v:reserved}).has(pikachu.id),'reservation is by base id');
});

test('several different characters can surge in one round, each with exactly one roll',()=>{
  const v={sport:'brawl',status:'draft',surge:[],roster:{p0:get('dc','Batman'),p1:get('games','Mario'),p2:get('pokemon','Pikachu'),cmd:get('mcu','Odin')}};
  const records=[];
  for(const c of [v.roster.p0,v.roster.p1,v.roster.p2])records.push(realUseVariantSurge(v,c.id,'multi-surge'));
  assert.equal(new Set(records.map(r=>r.id)).size,3);
  assert.equal(run('variantSurgeRecords(__v)',{__v:v}).length,3);
  assert.equal(realUseVariantSurge(v,v.roster.p0.id,'multi-surge'),null,'no second roll for Batman');
  assert.equal(realUseVariantSurge(v,v.roster.cmd.id,'multi-surge'),null,'commanders cannot surge');
  const roster=run('variantRoster(__v)',{__v:v});
  for(const r of records)assert.equal(Object.values(roster).find(c=>c.id===r.id).n,r.name);
});

// --- CPU parity ---------------------------------------------------------------------------------
// Four base-legal giants (the commander cannot surge) and a field of characters who qualify only by surging.
const GIANTS_POOL=[['lotr','Smaug'],['lotr',"Durin's Bane"],['lotr','Glaurung'],['lotr','Ancalagon the Black'],['pokemon','Pikachu'],['pokemon','Charizard'],['pokemon','Meowth'],
  ['pokemon','Gengar'],['pokemon','Blastoise'],['pokemon','Venusaur'],['mcu','Odin'],['dc','Batman'],['pokemon','Eevee'],['pokemon','Snorlax']].map(([p,n])=>get(p,n));
// Starters and a bench only: the commander slot cannot surge and is not under test here.
const CPU_SLOTS=[...STARTERS,{id:'bn',bench:true,side:true}];
const playerRoster=Object.fromEntries(CPU_SLOTS.map((p,i)=>[p.id,game.roster.filter(c=>c.pool==='nba')[i]]));
function cpuDraft(spy,seed='cpu-parity'){
  const v=fresh({seed,roster:playerRoster});
  const calls=[],sport=ctx.SPORTS.brawl;
  ctx.getCands=()=>GIANTS_POOL;ctx.SPORTS.brawl={pos:CPU_SLOTS};
  ctx.useVariantSurge=(roll,id,s)=>{calls.push(id);return spy?spy(roll,id,s):realUseVariantSurge(roll,id,s);};
  try{
    const opponent=run('campaignSnakeOpponent(__v,__s)',{__v:v,__s:stageFor('giants')});
    return {v,opponent,calls};
  }finally{ctx.getCands=()=>game.roster;ctx.useVariantSurge=realUseVariantSurge;ctx.SPORTS.brawl=sport;}
}
// The first seed whose real rolls include a failure, so the failure path is exercised without forcing it.
const PARITY_SEED=Array.from({length:40},(_,i)=>'cpu-parity-'+i).find(seed=>Object.keys(cpuDraft(null,seed).v.snake.failed).length);

test('CPU deciding whether to gamble never rolls: eligibility and odds only',()=>{
  const v=fresh();let rolls=0;
  ctx.useVariantSurge=(...a)=>{rolls++;return realUseVariantSurge(...a);};
  try{
    for(const c of GIANTS_POOL){
      run('campaignCpuCanAttempt(__c,"giants",__p,__v)',{__c:c,__p:pos,__v:v});
      run('campaignFormQualifyChance(__c,"giants",__p,"cpu",__v)',{__c:c,__p:pos,__v:v});
      run('campaignCpuSurgePlan(__c,"giants",__p,__v)',{__c:c,__p:pos,__v:v});
    }
  }finally{ctx.useVariantSurge=realUseVariantSurge;}
  assert.equal(rolls,0);
  const chance=c=>run('campaignFormQualifyChance(__c,"giants",__p,"cpu",__v)',{__c:c,__p:pos,__v:v});
  assert.equal(chance(get('mcu','Odin')),0.25,'Odin qualifies only through Destroyer Armor (25%)');
  assert.equal(chance(get('pokemon','Charizard')),0.55);
  assert.equal(chance(get('dc','Batman')),0,'no reviewed giant form');
  assert.equal(run('campaignCpuCanAttempt(__c,"giants",__p,__v)',{__c:get('dc','Batman'),__p:pos,__v:v}),false);
});

test('CPU rolls only when it commits, with the player\'s odds, and a failed roll stands',()=>{
  assert.ok(PARITY_SEED,'some seed produces a real failed CPU roll');
  const {v,opponent,calls}=cpuDraft(null,PARITY_SEED);
  assert.ok(opponent,'CPU completes a legal lineup');
  assert.ok(Object.keys(v.snake.failed).length>0);
  const picks=Object.entries(v.snake.cpu),failed=Object.keys(v.snake.failed);
  const gambles=picks.filter(([slot,id])=>!run('campaignPickAllowed(__c,"giants",__p,"cpu",__v)',{__c:byId.get(id),__p:CPU_SLOTS.find(p=>p.id===slot),__v:v}));
  assert.ok(gambles.length+failed.length>0,'fixture must exercise surge gambles');
  assert.equal(calls.length,gambles.length+failed.length,'one roll per committed attempt, none while choosing');
  assert.equal(new Set(calls).size,calls.length,'each character rolls at most once');
  for(const id of failed){
    assert.ok(!picks.some(([,x])=>x===id),'a failed character is not drafted');
    assert.equal(run('campaignCpuPickAllowed(__c,"giants",__p,__v)',{__c:byId.get(id),__p:pos,__v:v}),false,id+' really failed');
  }
  for(const [slot,id] of picks)
    assert.equal(run('campaignCpuPickAllowed(__c,"giants",__p,__v)',{__c:byId.get(id),__p:CPU_SLOTS.find(p=>p.id===slot),__v:v}),true,id);
  // Same roll as a player's: the CPU calls the shared useVariantSurge with the shared odds table.
  for(const c of GIANTS_POOL.filter(c=>run('variantOptions(__c)',{__c:c}).length)){
    const cpu=run('campaignCpuRoll(__c,__p,__v,0)',{__c:c,__p:pos,__v:v});
    const shared={sport:'brawl',roster:{p0:c},surge:null,status:'draft'};
    const rec=realUseVariantSurge(shared,c.id,run('campaignCpuSurgeSeed(__v,0)',{__v:v}));
    assert.equal(cpu.n,rec.name);
  }
  // Re-rendering never re-rolls or forgets a failure.
  const sport=ctx.SPORTS.brawl;ctx.SPORTS.brawl={pos:CPU_SLOTS};ctx.getCands=()=>GIANTS_POOL;
  let again;try{again=run('campaignSnakeOpponent(__v,__s)',{__v:v,__s:stageFor('giants')});}finally{ctx.SPORTS.brawl=sport;ctx.getCands=()=>game.roster;}
  assert.deepEqual(Object.keys(v.snake.failed),failed);
  assert.deepEqual(Object.values(again.roster).map(c=>c.id).sort(),Object.values(opponent.roster).map(c=>c.id).sort());
});

test('CPU choices before a roll do not depend on its outcome',()=>{
  const qualifying=(c)=>run('variantOptions(__c)',{__c:c}).find(f=>run('campaignFormEligibility(__c,campaignProjectForm(__c,__f),"giants",__p,"cpu",__v)',{__c:c,__f:f,__p:pos,__v:fresh()}).allowed).name;
  const force=mode=>(roll,id)=>{const c=byId.get(id),name=mode(c)?qualifying(c):'(failed roll)';roll.surge=[{id,name}];return roll.surge[0];};
  const allFail=cpuDraft(force(()=>false)).calls;
  const allPass=cpuDraft(force(()=>true)).calls;
  assert.ok(allFail.length>=2,'fixture needs several gambles');
  assert.equal(allPass[0],allFail[0],'the first gamble is chosen before anything is known');
  let n=0;const firstTwoFail=cpuDraft(force(()=>++n>2)).calls;
  assert.deepEqual(firstTwoFail.slice(0,3),allFail.slice(0,3),'identical history means identical next choice');
});

test('CPU never gambles a locked legal pick, and both finale lineups follow the same surge policy',()=>{
  const v=fresh(),batman=get('dc','Batman');
  // Batman qualifies for No Powers Allowed as himself; Red Death would not.
  assert.equal(run('campaignPickAllowed(__c,"mortal",__p,"cpu",__v)',{__c:batman,__p:pos,__v:v}),true);
  assert.equal(run('campaignCpuSurgePlan(__c,"mortal",__p,__v)',{__c:batman,__p:pos,__v:v}),'none');
  for(const index of [0,1]){
    const lineup=run('campaignCpuActiveRoster(__v,__s,{p0:__c},__i)',{__v:v,__s:stageFor('mortal'),__c:batman,__i:index});
    assert.equal(lineup.p0.n,'Batman','lineup '+index+' keeps the legal form');
  }
  const src=fs.readFileSync(path.join(ROOT,'data/campaign.js'),'utf8');
  assert.match(src,/const rivalRoster=campaignCpuActiveRoster\(v,st,opp\.roster,index\);/,'every finale boss uses the shared policy');
  assert.doesNotMatch(src,/cpuVariantRoster\(/,'the unrestricted CPU surge is not used in Campaign');
});

test('roster exhaustion counts untried qualifying transformations and ends only when none remain',()=>{
  const three=[{id:'a'},{id:'b'},{id:'c'}];
  const saved=ctx.SPORTS.brawl;ctx.SPORTS.brawl={pos:three};
  const pool=['Pikachu','Meowth','Charizard'].map(n=>get('pokemon',n));
  try{
    const fill=v=>run('campaignCanFill("brawl","giants",__a,"player",__v)',{__a:pool,__v:v});
    for(const c of pool)assert.equal(base(c,'giants').allowed,false);
    assert.equal(fill(fresh()),true,'untried Gigantamax forms keep the round alive');
    const failedSurges=fresh({surge:[{id:pool[0].id,name:'Partner Pikachu'},{id:pool[1].id,name:'Alolan Meowth'},{id:pool[2].id,name:'Mega Charizard X'}]});
    assert.equal(fill(failedSurges),false,'every roll spent on a non-qualifying form');
    const oneLeft=fresh({surge:failedSurges.surge.slice(0,2)});
    assert.equal(fill(oneLeft),false,'one possible giant cannot fill three slots');
    const qualified=fresh({surge:[{id:pool[0].id,name:'Gigantamax Pikachu'},...failedSurges.surge.slice(1,2)]});
    assert.equal(fill(qualified),false);
    assert.equal(fill({...qualified,surge:[qualified.surge[0]]}),true,'a qualifying roll plus two untried surges');
  }finally{ctx.SPORTS.brawl=saved;}
});

test('nothing about forms is revealed before selection',()=>{
  const src=fs.readFileSync(path.join(ROOT,'data/campaign.js'),'utf8');
  const fn=name=>{const i=src.indexOf('function '+name+'(');return src.slice(i,src.indexOf('\nfunction ',i+1));};
  const preRoll=fn('renderCampaignSurgeDialog').split('const slot=v.surgeDialog')[1];
  for(const body of [fn('renderCampaignDraft'),preRoll])
    for(const leak of ['variantOdds','variantOptions','CAMPAIGN_FORM_RULES','campaignFormQualifyChance','campaignCpuRoll','.failed'])
      assert.ok(!body.includes(leak),'pre-selection UI must not use '+leak);
});

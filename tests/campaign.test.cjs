const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const code=fs.readFileSync(require('node:path').join(__dirname,'../data/campaign.js'),'utf8');
const S={campaign:{step:0,status:'setup',history:[],stageOrder:null}};
const localRecords={};
const lsGet=(key,fallback)=>localRecords[key]??fallback;
const lsSet=(key,value)=>{localRecords[key]=JSON.parse(JSON.stringify(value));};
let catalog=[];
const SPORTS={basketball:{pos:Array.from({length:5},(_,i)=>({id:'p'+i}))}};
const {characterAbilityEvidence,characterAbilityTags,CHARACTER_ABILITY_TAGS}=require('../data/character-abilities.js');
// campaign.js consults the offline evidence layer (PR #38) and MuppetForce before rejecting picks.
const {campaignOfflineEvidence}=require('../data/campaign-eligibility.js');
const {muppetForceOf,MUPPET_FORCE_RULE}=require('../data/muppet-force.js');
const context={S,SPORTS,getCands:()=>catalog,lsGet,lsSet,characterAbilityEvidence,characterAbilityTags,campaignOfflineEvidence,muppetForceOf,MUPPET_FORCE_RULE};
vm.runInNewContext(code+'\nthis.campaignTestApi={CAMPAIGN_STAGES,CAMPAIGN_EXTRA,CAMPAIGN_TAGS:typeof CAMPAIGN_TAGS!==\'undefined\'?CAMPAIGN_TAGS:null,CAMPAIGN_WOMEN,CAMPAIGN_RED,CAMPAIGN_KIDS,campaignStages,campaignNewOrder,campaignSportValid,campaignAllowed,campaignEligibleStageIds,campaignReset,campaignInvalidSlots,campaignWinUses,campaignPickAllowed,campaignCommanderSpecialty,campaignCommanderEffect,CAMPAIGN_COMMANDER_SPECIALTIES};',context);
const api=context.campaignTestApi;
// Works with both engines: the legacy CAMPAIGN_TAGS name lists, or (PR #44) declarative
// criteria that read only the reviewed CHARACTER_ABILITY_TAGS index.
const THEME_RULES=api.CAMPAIGN_TAGS?Object.keys(api.CAMPAIGN_TAGS)
  :api.CAMPAIGN_EXTRA.filter(s=>s.criteria?.acceptedTags?.length).map(s=>s.rule);
const themed=api.CAMPAIGN_TAGS?Object.values(api.CAMPAIGN_TAGS).flatMap(set=>[...set]).map(n=>[null,n])
  :Object.entries(CHARACTER_ABILITY_TAGS).flatMap(([pool,chars])=>Object.entries(chars).filter(([,t])=>t.length).map(([n])=>[pool,n]));
const seen=new Set(),entries=[];
for(const [pool,n] of [...[...api.CAMPAIGN_WOMEN,...api.CAMPAIGN_RED,...api.CAMPAIGN_KIDS].map(n=>[null,n]),...themed]){
 const key=(pool||'')+':'+n;if(seen.has(key))continue;seen.add(key);entries.push([pool,n]);
}
catalog=entries.map(([pool,n],i)=>({id:'id'+i,n,pool:pool||(i%3?'mcu':'nba'),a:Array(12).fill(i%3?93:70)}));
test('thirteen additional thematic cross-pool challenges are defined (12 powers + MuppetForce)',()=>{
 assert.equal(api.CAMPAIGN_EXTRA.length,13);
 assert.equal(new Set(api.CAMPAIGN_EXTRA.map(x=>x.rule)).size,13);
 assert.ok(api.CAMPAIGN_EXTRA.some(x=>x.rule==='muppetforce'));
});
test('random order has ten unique stages with final gauntlet last',()=>{
 for(let i=0;i<60;i++){
  const order=api.campaignNewOrder('basketball');
  assert.equal(order.length,10);
  assert.equal(new Set(order).size,10);
  assert.equal(order[9],9);
  S.campaign.stageOrder=order;
  assert.equal(api.campaignStages().length,10);
 }
});
test('new campaigns only select challenges with sufficient eligible characters',()=>{
 assert.ok(api.campaignSportValid('basketball'));
 for(let i=0;i<20;i++)for(const id of api.campaignNewOrder('basketball')){
  const stage=id<api.CAMPAIGN_STAGES.length?api.CAMPAIGN_STAGES[id]:api.CAMPAIGN_EXTRA[id-api.CAMPAIGN_STAGES.length];
  if(stage.rule==='final')continue;
  const amount=catalog.filter(c=>api.campaignAllowed(c,stage.rule)).length;
  assert.ok(amount>=5,stage.rule+' has '+amount);
 }
});
test('final gauntlet rejects characters previously used in winning lineups',()=>{
 S.campaign.history=[{ids:[catalog[0].id]}];
 assert.equal(api.campaignAllowed(catalog[0],'final'),false);
 assert.equal(api.campaignAllowed(catalog[1],'final'),true);
});

test('two winning appearances exhaust a character, and final bans any prior win',()=>{
 const prior=S.campaign;
 const eligible={id:'pick-1',n:'Proven Speedster',pool:'games',a:[95,...Array(11).fill(80)]};
 try{
  S.campaign={...prior,history:[],roster:{},step:0,stageOrder:[0,1,2,3,4,5,6,7,8,9],sport:'basketball'};
  assert.equal(api.campaignPickAllowed(eligible,'fast',{id:'pg'}),true);
  S.campaign.history=[{ids:[eligible.id]}];
  assert.equal(api.campaignWinUses(eligible.id),1);
  assert.equal(api.campaignPickAllowed(eligible,'fast',{id:'pg'}),true);
  assert.equal(api.campaignPickAllowed(eligible,'final',{id:'pg'}),false);
  S.campaign.history.push({ids:[eligible.id]});
  assert.equal(api.campaignWinUses(eligible.id),2);
  assert.equal(api.campaignPickAllowed(eligible,'fast',{id:'pg'}),false);
  S.campaign.roster={p0:eligible};
  assert.ok(api.campaignInvalidSlots().has('p0'),'A spent character must be highlighted in red');
 }finally{S.campaign=prior;}
});

test('new runs rotate through seldom-used challenges instead of repeating the same ten',()=>{
 delete localRecords['da.campaign.rotation.v1'];
 S.campaign.stageOrder=null;
 const one=api.campaignNewOrder('basketball');
 const two=api.campaignNewOrder('basketball');
 const three=api.campaignNewOrder('basketball');
 const keys=arr=>arr.slice(0,9).sort((a,b)=>a-b).join(',');
 assert.notEqual(keys(one),keys(two),'Second campaign should use different themes');
 assert.notEqual(keys(two),keys(three),'Third campaign should use different themes');
 assert.ok(new Set([...one,...two,...three]).size>10,'Expected new themes to rotate in across campaigns');
 assert.equal(one[9],9);
 assert.equal(two[9],9);
 assert.equal(three[9],9);
 const persisted=lsGet('da.campaign.rotation.v1',{});
 assert.ok(Object.keys(persisted.basketball.counts).length>9,'Rotation usage should persist in storage');
});
test('restarting retains selected sport and team name while rerolling challenges',()=>{
 S.campaign={sport:'basketball',teamName:'Dream Team',step:5,status:'results',history:[],stageOrder:api.campaignNewOrder('basketball')};
 api.campaignReset();
 assert.equal(S.campaign.teamName,'Dream Team');
 assert.equal(S.campaign.sport,'basketball');
 assert.equal(S.campaign.step,0);
 assert.equal(S.campaign.stageOrder.length,10);
});

// Commander exceptions are slot-specific; no character becomes a speedster merely
// because they run a fast-paced system when assigned as a player or reinforcement.
test('Mike D\'Antoni qualifies as speed commander, but not as player or bench',()=>{
 const c={id:'nba:mike-d-antoni',pool:'nba',n:"Mike D'Antoni",a:[52,65,45,55,49,65,75,60,60,90,76,90]};
 assert.equal(api.campaignAllowed(c,'fast'),false);
 assert.equal(api.campaignAllowed(c,'fast',{id:'pg'}),false);
 assert.equal(api.campaignAllowed(c,'fast',{id:'bench',bench:true}),false);
 assert.equal(api.campaignAllowed(c,'fast',{id:'hc',coach:true}),true);
 assert.equal(api.campaignAllowed(c,'women',{id:'hc',coach:true}),false);
 assert.equal(api.campaignAllowed(c,'kids',{id:'hc',coach:true}),false);
 assert.equal(api.campaignAllowed(c,'mortal',{id:'hc',coach:true}),true,'NBA coaches are already eligible under the existing mortal rule');
 const superhero={id:'mcu:shuri',pool:'mcu',n:'Shuri',a:Array(12).fill(85)};
 assert.equal(api.campaignAllowed(superhero,'mortal',{id:'hc',coach:true}),false,'Tech expertise does not waive the non-superpowered restriction');
});
test('commander expertise is scoped to an exact universe and matching theme',()=>{
 const coach={id:'nba:coach',pool:'nba',n:"Mike D'Antoni",a:Array(12).fill(30)};
 assert.equal(api.campaignCommanderSpecialty(coach,'fast',{coach:true})?.label,'Seven Seconds or Less');
 assert.equal(api.campaignCommanderSpecialty({...coach,pool:'mcu'},'fast',{coach:true}),null);
 assert.equal(api.campaignCommanderSpecialty(coach,'strong',{coach:true}),null);
 assert.equal(api.campaignCommanderSpecialty(coach,'fast',{bench:true}),null);
 for(const [id,rules] of Object.entries(api.CAMPAIGN_COMMANDER_SPECIALTIES)){
  for(const rule of Object.keys(rules)){
   assert.ok(['fast','brain','strong',...THEME_RULES].includes(rule),id+' has unknown rule '+rule);
   assert.ok(rules[rule].reason?.length>=25,id+' missing specialist reasoning');
  }
 }
});
test('validation accepts strategic commander but still rejects the same person on the field',()=>{
 const oldPositions=SPORTS.basketball.pos, oldCampaign=S.campaign;
 const coach={id:'nba:md',pool:'nba',n:"Mike D'Antoni",a:Array(12).fill(60)};
 const runner={id:'games:runner',pool:'games',n:'Sonic the Hedgehog',a:[95,...Array(11).fill(85)]};
 try{
  SPORTS.basketball.pos=[{id:'pg'},{id:'hc',coach:true}];
  S.campaign={...oldCampaign,step:0,stageOrder:[0,1,2,3,4,5,6,7,8,9],roster:{pg:runner,hc:coach}};
  assert.equal(api.campaignInvalidSlots().size,0);
  S.campaign.roster={pg:coach,hc:runner};
  assert.ok(api.campaignInvalidSlots().has('pg'),'D\'Antoni must not qualify on the field');
 }finally{SPORTS.basketball.pos=oldPositions;S.campaign=oldCampaign;}
});
test('commander multiplier is capped, cannot stack, and requires a matching active squad',()=>{
 const old=SPORTS.basketball.pos;
 const coach={id:'nba:md',pool:'nba',n:"Mike D'Antoni",a:Array(12).fill(60)};
 const fast={id:'runner',pool:'games',n:'Road Runner',a:[99,...Array(11).fill(80)]};
 try{
  SPORTS.basketball.pos=[{id:'pg'},{id:'hc',coach:true},{id:'bench',bench:true}];
  const roster={pg:fast,hc:coach};
  const e=api.campaignCommanderEffect('basketball',roster,'fast',80);
  assert.ok(e&&e.percent<=4&&e.percent>=1.5);
  assert.ok(e.points>0,'A matching commander must improve real match rating');
  assert.equal(e.name,"Mike D'Antoni");
  assert.equal(api.campaignCommanderEffect('basketball',roster,'ice',80),null);
  assert.equal(api.campaignCommanderEffect('basketball',{pg:fast,bench:coach},'fast',80),null);
  assert.equal(api.campaignCommanderEffect('basketball',{hc:coach},'fast',80),null);
  assert.equal(api.campaignCommanderEffect('basketball',{...roster,bench:coach},'fast',80).points,e.points,'Bench cannot stack a bonus');
 }finally{SPORTS.basketball.pos=old;}
});
test('strategic commander catalog references actual roster characters',()=>{
 const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
 const byPool={};
 for(const pool of ['nba','mcu','toons','muppets','games','pokemon','starwars']){
  const start=html.indexOf('POOLS.'+pool+' =');
  const entries=html.indexOf('entries: [',start),end=html.indexOf('\n]};',entries);
  byPool[pool]=[...html.slice(entries,end).matchAll(/^\["([^"]+)"/gm)].map(x=>x[1]);
 }
 // Pools registered outside index.html (DC, Middle-earth, Harry Potter; PR #42).
 const added=vm.createContext({window:{}});
 for(const f of ['new-pool-core.js','pools-dc.js','pools-middle-earth.js','pools-harry-potter.js'])
  vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../data',f),'utf8'),added);
 for(const [pool,data] of Object.entries(added.window.DA_ADDED_POOLS))byPool[pool]=data.entries.map(e=>e[0]);
 for(const id of Object.keys(api.CAMPAIGN_COMMANDER_SPECIALTIES)){
  const sep=id.indexOf(':'),pool=id.slice(0,sep),name=id.slice(sep+1);
  assert.ok(byPool[pool]?.includes(name),'Missing strategic commander '+id);
 }
});

test('eligible challenge count uses actual characters currently in the game',()=>{
 const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
 const ids=['nba','mcu','toons','muppets','games','pokemon','starwars'];
 const real=[];
 for(const id of ids){
  const start=html.indexOf('POOLS.'+id+' =');
  const entries=html.indexOf('entries: [',start);
  const end=html.indexOf('\n]};',entries);
  assert.ok(start>=0&&entries>=0&&end>entries,'Cannot find candidate pool '+id);
  const names=[...html.slice(entries,end).matchAll(/^\["([^"]+)"/gm)].map(x=>x[1]);
  for(const n of names)real.push({id:id+':'+n,n,pool:id,a:Array(12).fill(85)});
 }
 const original=catalog;catalog=real;
 try{
  const eligible=api.campaignEligibleStageIds('basketball');
  assert.ok(eligible.length>9,'Real pool needs more than nine eligible challenges, found '+eligible.length);
  assert.ok(eligible.some(i=>i>=api.CAMPAIGN_STAGES.length),'Themed challenges should be eligible');
  const order=api.campaignNewOrder('basketball');
  assert.ok(order.slice(0,9).some(i=>i>=api.CAMPAIGN_STAGES.length),'Expect themed challenges in actual campaign selection');
 }finally{catalog=original;}
});

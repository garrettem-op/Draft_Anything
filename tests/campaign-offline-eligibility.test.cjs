const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const poolIds = ['nba','mcu','toons','muppets','games','pokemon','starwars'];

function harness(){
  const calls={paid:0,cached:0};
  const ctx=vm.createContext({
    window:{DA_CHARACTER_GUIDES:{}},S:{campaign:{
      status:'draft',step:0,stageOrder:[10,1,2,3,4,5,6,7,8,9],
      history:[],sport:'brawl',roster:{},validation:'',validationOpen:false
    }},
    KnowledgeEngine:{
      has:()=>{calls.cached++;return false;},
      challenge:()=>{calls.paid++;throw Error('API was not supposed to run');}
    },
    muppetForceOf:()=>null,MUPPET_FORCE_RULE:{campaignMinimum:65},
    lsGet:()=>({}),lsSet:()=>{},
    SPORTS:{brawl:{pos:[
      ...Array.from({length:6},(_,i)=>({id:'fighter'+i,coach:false})),
      {id:'commander',coach:true}
    ]}}
  });
  for(const file of ['data/mcu-profiles.js','data/toons-profiles.js','data/games-profiles.js',
                     'data/character-abilities.js','data/campaign-eligibility.js','data/campaign.js']){
    vm.runInContext(read(file),ctx,{filename:file});
  }
  const html=read('index.html');
  vm.runInContext('const POOLS={};',ctx);
  for(const id of poolIds){
    const start=html.indexOf('POOLS.'+id+' =');
    assert.ok(start>=0,'missing pool '+id);
    const end=html.indexOf('};',start);
    assert.ok(end>start);
    vm.runInContext(html.slice(start,end+2),ctx,{filename:'index.html / '+id});
  }
  const pools=vm.runInContext('POOLS',ctx);
  const find=(pool,name)=>{
    const e=pools[pool].entries.find(e=>e[0]===name);
    assert.ok(e, pool+':'+name+' must exist');
    return {id:pool+':'+name,pool,n:e[0],t:e[2],a:e[3],taxonomy:Array.isArray(e[4])?e[4]:[]};
  };
  const allows=(pool,name,rule,pos)=>{
    ctx.subject=find(pool,name);
    ctx.rule=rule;ctx.position=pos??null;
    return vm.runInContext('campaignAllowed(subject,rule,position)',ctx);
  };
  return {ctx,calls,pools,find,allows,html};
}

test('All 848 roster records and seven talent pools participate in the local audit',()=>{
  const h=harness();
  assert.equal(poolIds.reduce((sum,id)=>sum+h.pools[id].entries.length,0),848);
  assert.ok(h.html.indexOf('data/campaign-eligibility.js')>0);
  assert.ok(h.html.indexOf('data/campaign-eligibility.js')<h.html.indexOf('data/campaign.js'));
  assert.match(h.html,/taxonomy: Array\.isArray\(e\[4\]\)/);
});

test('Previously denied Skyborne lineup now qualifies before rejection, with no paid research',()=>{
  const h=harness();
  const roster=[
    ['mcu','The Wasp'],['mcu','Namor'],['mcu','Human Torch'],
    ['toons','Snoopy'],['games','Diddy Kong'],['starwars','Hera Syndulla']
  ];
  roster.forEach(([pool,name],i)=>h.ctx.S.campaign.roster['fighter'+i]=h.find(pool,name));
  h.ctx.S.campaign.roster.commander=h.find('starwars','Poe Dameron');
  assert.equal(vm.runInContext('campaignInvalidSlots().size',h.ctx),0);
  assert.equal(vm.runInContext('campaignQualified()',h.ctx),true);
  assert.equal(h.calls.paid,0);
});

test('Flight text and curated aerial entries qualify without a network call',()=>{
  const h=harness();
  for(const [pool,name] of [
    ['mcu','The Wasp'],['mcu','Vulture'],['mcu','Human Torch'],['mcu','Sentry'],
    ['mcu','Pepper Potts'],['toons','Tweety'],['toons','Snoopy'],
    ['games','Diddy Kong'],['games','Falco Lombardi'],['games','Alduin'],
    ['pokemon','Butterfree'],['pokemon','Pidgeot'],['pokemon','Zubat'],
    ['pokemon','Aerodactyl'],['starwars','Hera Syndulla'],
    ['starwars','Poe Dameron'],['starwars','Chewbacca']
  ]) assert.ok(h.allows(pool,name,'flight'),pool+':'+name);
  assert.equal(h.calls.paid,0);
});

test('Original 151 Pokémon uses existing type labels rather than incomplete manual name lists',()=>{
  const h=harness();
  const expected=[
    ['Ninetales','fire'],['Arcanine','fire'],['Ponyta','fire'],['Rapidash','fire'],
    ['Cloyster','ice'],['Dewgong','ice'],['Voltorb','electric'],['Electrode','electric'],
    ['Slowpoke','psychic'],['Drowzee','psychic'],['Exeggutor','psychic'],
    ['Omanyte','aquatic'],['Kabutops','aquatic'],['Krabby','aquatic'],['Chansey','healing']
  ];
  for(const [name,rule] of expected)assert.ok(h.allows('pokemon',name,rule),name+' '+rule);
  assert.equal(h.calls.paid,0);
});

test('Other power themes recognize explicit character descriptions and built-in powers',()=>{
  const h=harness();
  const cases=[
    ['mcu','Kaecilius','magic'],['games','Yennefer','magic'],['games','Bayonetta','magic'],
    ['mcu','Cosmo the Spacedog','psychic'],['games','Ness','psychic'],
    ['mcu','Attuma','aquatic'],['pokemon','Vaporeon','aquatic'],
    ['games','Spyro','fire'],['toons','Aang','fire'],
    ['toons','Blossom','ice'],['mcu','Electro','electric'],['games','Raiden (MK)','electric'],
    ['mcu','Rocket','tech'],['mcu','Pepper Potts','tech'],['mcu','Hank Pym','tech'],
    ['games','Ezio Auditore','stealth'],['mcu','Nakia','stealth'],
    ['toons','Rick Sanchez','teleport'],['mcu','Wong','teleport'],
    ['mcu','Moon Knight','healing'],['toons','SpongeBob SquarePants','healing'],
    ['muppets','Thog','giants'],['pokemon','Onix','giants']
  ];
  for(const [pool,name,rule] of cases)assert.ok(h.allows(pool,name,rule),pool+':'+name+' '+rule);
  assert.equal(h.calls.paid,0);
});

test('No false approvals from misleading franchise titles, opponent feats or simple armor',()=>{
  const h=harness();
  const negatives=[
    ['games','Marth','fire'],              // Fire Emblem is a franchise title
    ['muppets','Dr. Teeth','electric'],     // Electric Mayhem is a band
    ['starwars','Cara Dune','electric'],    // "shock trooper" is not lightning
    ['pokemon','Vileplume','giants'],       // giant petals, not a giant body
    ['muppets','Lew Zealand','aquatic'],    // boomerang fish not underwater power
    ['starwars','Wampa','ice'],            // ice beast is not ice control
    ['pokemon','Nidoqueen','tech'],        // natural armor is not technology
    ['pokemon','Golem','tech'],            // rock armor is not technology
    ['toons','Plankton','psychic'],        // technological mind-control devices
    ['toons','Michigan J. Frog','stealth'],// comedic concealment is not stealth power
    ['toons','Sokka','tech']               // strategy alone not advanced tech
  ];
  for(const [pool,name,rule] of negatives)assert.equal(h.allows(pool,name,rule),false,pool+':'+name+' '+rule);
});

test('Other campaign constraints and Commander-only exceptions stay strict',()=>{
  const h=harness();
  assert.equal(h.allows('starwars','Admiral Ackbar','flight',{coach:true}),true);
  assert.equal(h.allows('starwars','Admiral Ackbar','flight',{coach:false}),false);
  // Owner ruling 2026-11-09: any Pokémon that can learn Fly in Gen I counts for Skyborne,
  // so Doduo and Dodrio (HM02 Fly) now qualify. A Flying TYPE alone still grants nothing.
  assert.equal(h.allows('pokemon','Dodrio','flight'),true);
  assert.equal(h.allows('pokemon','Doduo','flight'),true);
  assert.equal(h.allows('mcu','The Wasp','women'),true);
  assert.equal(h.allows('mcu','The Wasp','mortal'),false);
  h.ctx.subject={pool:'nba',n:'Made-up Person',t:'Jumps very high',a:Array(12).fill(99)};
  assert.equal(vm.runInContext("campaignAllowed(subject,'flight')",h.ctx),false);
  assert.equal(h.calls.paid,0);
});

test('Scanning all 848 character descriptions against all 12 themes never calls paid AI',()=>{
  const h=harness();
  for(const pool of poolIds){
    for(const e of h.pools[pool].entries){
      const c={id:pool+':'+e[0],pool,n:e[0],t:e[2],taxonomy:e[4]||[],a:e[3]};
      for(const rule of ['flight','magic','psychic','aquatic','fire','ice','electric',
                          'tech','stealth','teleport','healing','giants']){
        h.ctx.subject=c;h.ctx.rule=rule;
        const result=vm.runInContext('campaignAllowed(subject,rule)',h.ctx);
        assert.equal(typeof result,'boolean',pool+':'+e[0]+' '+rule);
      }
    }
  }
  assert.equal(h.calls.paid,0);
});

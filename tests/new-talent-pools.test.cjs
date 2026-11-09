const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=(file)=>fs.readFileSync(path.join(root,file),'utf8');
const newly=['dc','lotr','harrypotter'];
const old=['nba','mcu','toons','muppets','games','pokemon','starwars'];
const modules=[
  'data/new-pool-core.js',
  'data/pools-dc.js','data/pools-middle-earth.js','data/pools-harry-potter.js',
  'data/new-pool-traits.js','data/new-pool-powers.js',
  'data/pool-lore-dc.js','data/pool-lore-middle-earth.js','data/pool-lore-harry-potter.js'
];

function harness(){
  let paid=0;
  const cx=vm.createContext({
    window:{}, S:{custom:{},campaign:{step:0,stageOrder:[10,1,2,3,4,5,6,7,8,9],
      history:[],sport:'brawl',roster:{},status:'draft'}},
    SPORTS:{brawl:{pos:[
      ...Array.from({length:6},(_,i)=>({id:'fighter'+i,coach:false})),
      {id:'commander',coach:true}
    ]}},
    KnowledgeEngine:{has:()=>false,challenge:()=>{paid++;throw Error('Paid AI research was called')}},
    muppetForceOf:()=>null,MUPPET_FORCE_RULE:{campaignMinimum:65},
    lsGet:()=>({}),lsSet:()=>{}
  });
  for(const module of modules)vm.runInContext(read(module),cx,{filename:module});
  const html=read('index.html');
  const block=(start,end)=>{
    const a=html.indexOf(start);const b=html.indexOf(end,a);
    assert.ok(a>=0&&b>a,'missing app segment '+start);
    return html.slice(a,b);
  };
  vm.runInContext('const POOLS=Object.assign({},window.DA_ADDED_POOLS);',cx);
  for(const id of old){
    const start=html.indexOf('POOLS.'+id+' =');
    const end=html.indexOf('};',start);
    assert.ok(start>=0&&end>start,'pool missing '+id);
    vm.runInContext(html.slice(start,end+2),cx);
  }
  vm.runInContext("POOLS.mashup={id:'mashup',name:'All-Star Mashup',entries:[]};",cx);
  vm.runInContext('const GROUPS={};const SYN_MEMBERS={};const SIGS={};const BOOM_SET={};',cx);
  vm.runInContext(block('function registerCustomLinks(', '// Returns { total, links:'),cx);
  vm.runInContext(block('function clampAttr(','function initials('),cx);
  vm.runInContext(block('function mashupOnly(', 'function poolFaces('),cx);
  for(const file of ['data/character-abilities.js','data/campaign-eligibility.js','data/campaign.js'])
    vm.runInContext(read(file),cx,{filename:file});
  const evaluate=(expr)=>vm.runInContext(expr,cx);
  const candidate=(pool,name)=>{
    const c=evaluate('getCands('+JSON.stringify(pool)+')').find(x=>x.n===name);
    assert.ok(c,pool+':'+name+' must be in roster');
    return c;
  };
  const allowed=(pool,name,rule,pos=null)=>{
    cx.subject=candidate(pool,name);cx.subjectRule=rule;cx.subjectPos=pos;
    return evaluate('campaignAllowed(subject,subjectRule,subjectPos)');
  };
  return {cx,evaluate,candidate,allowed,paid:()=>paid,html};
}

test('new pools are seeded, have 64+ entries, and use all twelve attribute slots',()=>{
  const h=harness();
  assert.equal(h.evaluate("getCands('dc').length"),104);
  assert.equal(h.evaluate("getCands('lotr').length"),115);
  assert.equal(h.evaluate("getCands('harrypotter').length"),106);
  for(const pool of newly){
    const roster=h.evaluate('getCands('+JSON.stringify(pool)+')');
    assert.ok(roster.length>=64,pool+' must work for two 32-person hockey teams');
    assert.equal(new Set(roster.map(c=>c.id)).size,roster.length,pool+' unique slugs');
    for(const c of roster){
      assert.equal(c.pool,pool);
      assert.equal(c.a.length,12,pool+':'+c.n);
      assert.ok(c.a.every(x=>Number.isInteger(x)&&x>=1&&x<=99),pool+':'+c.n);
      assert.ok(c.t&&typeof c.t==='string');
      assert.ok(Array.isArray(c.taxonomy));
      assert.ok(typeof c.archetype==='string');
    }
  }
});

test('the new pools participate in the picker and Mashup without deleting past pools',()=>{
  const h=harness();
  const builtin=h.evaluate('BUILTIN');
  for(const pool of [...old,...newly,'mashup'])assert.ok(builtin.includes(pool),pool);
  const mashup=h.evaluate("getCands('mashup')");
  assert.equal(mashup.length,1169);
  for(const pool of [...old,...newly])assert.ok(mashup.some(c=>c.pool===pool),pool);
  for(const pool of newly){
    const candidates=h.evaluate('getCands('+JSON.stringify(pool)+')');
    assert.ok(candidates.every(c=>mashup.some(m=>m.id===c.id)),pool);
  }
});

test('seeded Middle-earth includes early ages and supernatural mythic figures',()=>{
  const h=harness();
  for(const name of ['Frodo Baggins','Gandalf','Morgoth (Melkor)','Ungoliant',
    'Fëanor','Fingolfin','Finrod Felagund','Lúthien Tinúviel','Eärendil',
    'Sauron','Ar-Pharazôn','Glaurung','Ancalagon the Black','Gwaihir',
    'Manwë','Varda (Elbereth)','Melian','Arien']){
    h.candidate('lotr',name);
  }
  assert.equal(h.evaluate("getCands('lotr').filter(c=>c.taxonomy.includes('First Age')).length")>20,true);
});

test('new pool Campaign eligibility includes powers, gender, youth and powerless characters',()=>{
  const h=harness();
  const positive=[
    ['dc','Superman','flight'],['dc','Batman','tech'],
    ['dc','Batman','mortal'],['dc','Wonder Woman','women'],
    ['dc','The Flash (Barry Allen)','red'],['dc','Robin (Damian Wayne)','kids'],
    ['lotr','Gandalf','magic'],['lotr','Smaug','flight'],
    ['lotr','Eärendil','flight'],['lotr','Galadriel','women'],
    ['lotr','Frodo Baggins','mortal'],['lotr','Gwaihir','flight'],
    ['harrypotter','Harry Potter','magic'],['harrypotter','Harry Potter','flight'],
    ['harrypotter','Hermione Granger','kids'],['harrypotter','Bellatrix Lestrange','magic'],
    ['harrypotter','Jacob Kowalski','mortal'],['harrypotter','Fawkes','healing']
  ];
  const negative=[
    ['lotr','Glaurung','flight'], // Wingless dragon
    ['harrypotter','Jacob Kowalski','magic'],
    ['harrypotter','Argus Filch','magic'],
    ['lotr','Gandalf','mortal'],
    ['dc','Bane','mortal'],
    ['dc','Black Canary','mortal']
  ];
  for(const [p,n,r] of positive)assert.equal(h.allowed(p,n,r),true,p+':'+n+' '+r);
  for(const [p,n,r] of negative)assert.equal(h.allowed(p,n,r),false,p+':'+n+' '+r);
  assert.equal(h.paid(),0);
});

test('all new pool characters can be evaluated against twelve offline power themes',()=>{
  const h=harness();
  const rules=['flight','magic','psychic','aquatic','fire','ice','electric','tech',
    'stealth','teleport','healing','giants'];
  let checks=0;
  for(const pool of newly){
    for(const c of h.evaluate('getCands('+JSON.stringify(pool)+')')){
      h.cx.subject=c;
      for(const rule of rules){
        h.cx.subjectRule=rule;
        assert.equal(typeof h.evaluate('campaignAllowed(subject,subjectRule)'),'boolean',pool+':'+c.n+' '+rule);
        checks++;
      }
    }
  }
  assert.equal(checks,325*12);
  assert.equal(h.paid(),0);
});

test('separate Claude-owned lore maps replace card descriptions without altering identities or stats',()=>{
  const h=harness();
  const baseline=h.candidate('dc','Superman');
  h.cx.window.DA_POOL_LORE.dc.Superman={
    short:'Kryptonian flying guardian whose compassion guides his cosmic strength',
    biography:'Detailed original prose here',powers:['Flight','Heat vision'],
    feats:[],limitations:[],sources:['https://www.dc.com/characters/superman']
  };
  h.cx.poolUnderTest=h.evaluate("POOLS.dc");
  const fresh=h.evaluate('poolCandidates(poolUnderTest)').find(c=>c.n==='Superman');
  assert.match(fresh.t,/Kryptonian flying guardian/);
  assert.equal(fresh.id,baseline.id);
  assert.equal(fresh.a.join(','),baseline.a.join(','));
  assert.equal(h.cx.window.DA_ADDED_POOLS.dc.entries[0][2], 'Kryptonian protector with flight and heat vision');
  assert.equal(h.paid(),0);
});

test('new pool identity and power metadata never references absent roster characters',()=>{
  const h=harness();
  const windows=h.cx.window;
  for(const tags of [windows.DA_NEW_POOL_TRAITS,windows.DA_NEW_POOL_POWERS]){
    for(const [rule,byPool] of Object.entries(tags)){
      for(const [pool,ids] of Object.entries(byPool)){
        const names=new Set(h.evaluate('getCands('+JSON.stringify(pool)+')').map(x=>x.n));
        for(const id of ids)assert.ok(names.has(id),rule+':'+pool+':'+id);
      }
    }
  }
});

test('distinct pool emblems, color palettes, and script imports are configured',()=>{
  const html=read('index.html');
  for(const script of modules){
    assert.ok(html.includes('<script src="'+script+'"></script>'),script);
  }
  for(const pool of newly){
    assert.ok(html.includes('tc-pool-'+pool),pool+' trading card emblem');
    assert.ok(html.includes('data-pool="'+pool+'"'),pool+' card art');
  }
  assert.match(html,/dc: \['#2157A5'/);
  assert.match(html,/lotr: \['#3C6540'/);
  assert.match(html,/harrypotter: \['#604A7C'/);
});

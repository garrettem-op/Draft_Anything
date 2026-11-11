const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

// Action Movies (PR #70): roster shape, game-mode wiring, Mashup size and Campaign trait gating.
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const old=['nba','mcu','toons','muppets','games','pokemon','starwars'];
const modules=[
  'data/new-pool-core.js',
  'data/pools-dc.js','data/pools-middle-earth.js','data/pools-harry-potter.js','data/pools-action-movies.js',
  'data/new-pool-traits.js','data/new-pool-powers.js',
  'data/pool-lore-dc.js','data/pool-lore-middle-earth.js','data/pool-lore-harry-potter.js'
];

function harness(){
  let paid=0;
  const cx=vm.createContext({
    window:{}, S:{custom:{},campaign:{step:0,stageOrder:[10,1,2,3,4,5,6,7,8,9],history:[],sport:'brawl',roster:{},status:'draft'}},
    SPORTS:{brawl:{pos:[...Array.from({length:6},(_,i)=>({id:'fighter'+i,coach:false})),{id:'commander',coach:true}]}},
    KnowledgeEngine:{has:()=>false,challenge:()=>{paid++;throw Error('Paid AI research was called')}},
    muppetForceOf:()=>null,MUPPET_FORCE_RULE:{campaignMinimum:65},lsGet:()=>({}),lsSet:()=>{}
  });
  for(const m of modules)vm.runInContext(read(m),cx,{filename:m});
  const html=read('index.html');
  const block=(start,end)=>{const a=html.indexOf(start),b=html.indexOf(end,a);assert.ok(a>=0&&b>a,'missing '+start);return html.slice(a,b);};
  vm.runInContext('const POOLS=Object.assign({},window.DA_ADDED_POOLS);',cx);
  for(const id of old){const a=html.indexOf('POOLS.'+id+' ='),b=html.indexOf('};',a);vm.runInContext(html.slice(a,b+2),cx);}
  vm.runInContext("POOLS.mashup={id:'mashup',name:'All-Star Mashup',entries:[]};",cx);
  vm.runInContext('const GROUPS={};const SYN_MEMBERS={};const SIGS={};const BOOM_SET={};',cx);
  vm.runInContext(block('function registerCustomLinks(','// Returns { total, links:'),cx);
  vm.runInContext(block('function clampAttr(','function initials('),cx);
  vm.runInContext(block('function mashupOnly(','function poolFaces('),cx);
  for(const f of ['data/character-abilities.js','data/campaign-eligibility.js','data/campaign.js'])vm.runInContext(read(f),cx,{filename:f});
  const evaluate=expr=>vm.runInContext(expr,cx);
  const allowed=(name,rule)=>{
    cx.subject=evaluate("getCands('actionmovies')").find(c=>c.n===name);
    assert.ok(cx.subject,'actionmovies:'+name+' must be in roster');
    cx.subjectRule=rule;
    return evaluate('campaignAllowed(subject,subjectRule,null)');
  };
  return {evaluate,allowed,paid:()=>paid,html};
}

test('Action Movies roster: 100 unique characters, 25 films, four per film, all 12 attributes', ()=>{
  const h=harness();
  const roster=h.evaluate("getCands('actionmovies')");
  assert.equal(roster.length,100);
  assert.equal(new Set(roster.map(c=>c.id)).size,100,'unique slugs');
  assert.equal(new Set(roster.map(c=>c.n)).size,100,'unique names');
  let raw;
  vm.runInNewContext(read('data/pools-action-movies.js'),{window:{DA_REGISTER_POOL:(i,l,s,d,r)=>{raw=r;}}});
  const films={};
  for(const row of raw.split('\n'))(films[row.split('|')[3]]||=0),films[row.split('|')[3]]++;
  assert.equal(Object.keys(films).length,25);
  for(const [film,n] of Object.entries(films))assert.equal(n,4,film);
  for(const c of roster){
    assert.equal(c.pool,'actionmovies');
    assert.equal(c.a.length,12,c.n);
    for(const v of c.a)assert.ok(Number.isFinite(v)&&v>=1&&v<=99,c.n+' attribute '+v);
  }
});

test('Action Movies is wired into every game mode, Mashup, labels and kits', ()=>{
  const {html}=harness();
  assert.match(html,/<script src="data\/pools-action-movies\.js"><\/script>\s*<script src="data\/new-pool-traits\.js">/);
  assert.match(html,/const BUILTIN = \[[^\]]*'harrypotter', 'actionmovies', 'mashup'\]/);
  assert.match(html,/actionmovies: 'Action Movies'/);
  assert.match(html,/actionmovies: \['#772B23', '#F5B96B'\]/);
  assert.match(html,/\.uchip\.u-actionmovies/);
  assert.match(html,/tc-art\[data-pool="actionmovies"\]/);
});

test('All-Star Mashup includes all 100 Action Movies characters', ()=>{
  const h=harness();
  const mashup=h.evaluate("getCands('mashup')");
  assert.equal(mashup.filter(c=>c.pool==='actionmovies').length,100);
  // No Action Movies id collides with any other Mashup entry. (Pre-existing, unrelated: pokemon:nidoran is shared
  // by Nidoran♀ and Nidoran♂.)
  const others=new Set(mashup.filter(c=>c.pool!=='actionmovies').map(c=>c.id));
  for(const c of mashup.filter(c=>c.pool==='actionmovies'))assert.ok(!others.has(c.id),'id collision '+c.id);
});

test('Campaign traits: women, kids and No Powers Allowed are gated by film-scoped classifications', ()=>{
  const h=harness();
  for(const n of ['Trinity','Ellen Ripley','Imperator Furiosa','The Bride (Beatrix Kiddo)','Xenomorph Queen'])assert.equal(h.allowed(n,'women'),true,n+' women');
  for(const n of ['John Wick','Neo','Maximus Decimus Meridius'])assert.equal(h.allowed(n,'women'),false,n+' women');
  for(const n of ['Lucy Pevensie','John Connor (1991)','Gogo Yubari'])assert.equal(h.allowed(n,'kids'),true,n+' kids');
  for(const n of ['Sarah Connor','Ellen Ripley'])assert.equal(h.allowed(n,'kids'),false,n+' kids');
  for(const n of ['John Wick','John Rambo','John McClane','Ellen Ripley','Achilles','Leonidas','Rama'])assert.equal(h.allowed(n,'mortal'),true,n+' mortal');
  // Superhuman, supernatural, synthetic or simulation-dependent in the drafted film: never "no powers".
  for(const n of ['Neo','Agent Smith','T-800 (Terminator 2)','T-1000','Bishop','Aslan','White Witch (Jadis)','Imhotep',
    'Hector Barbossa','Jack Sparrow','Jungle Hunter Predator','Xenomorph Queen','Li Mu Bai','Thulsa Doom','Xerxes'])
    assert.equal(h.allowed(n,'mortal'),false,n+' mortal');
  assert.equal(h.paid(),0,'Campaign checks never call paid research');
});

test('the server research roster lists the Action Movies pool', ()=>{
  const roster=JSON.parse(read('supabase/functions/character-knowledge/roster.json'));
  assert.equal(roster.actionmovies.length,100);
  assert.ok(roster.actionmovies.includes('John Wick'));
});

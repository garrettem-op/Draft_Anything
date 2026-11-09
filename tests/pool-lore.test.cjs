// Claude-owned regression tests for the researched lore files
// (data/pool-lore-dc.js, data/pool-lore-middle-earth.js, data/pool-lore-harry-potter.js).
// Free and offline: no network, no paid AI. Read-only use of the game engine.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const NEW=['dc','lotr','harrypotter'];
const LORE=['data/pool-lore-dc.js','data/pool-lore-middle-earth.js','data/pool-lore-harry-potter.js'];
const POWER_RULES=['flight','magic','psychic','aquatic','fire','ice','electric','tech','stealth','teleport','healing','giants'];
// Characters with no verifiable reference page this round (listed in the PR).
const NO_SOURCE_YET=new Set(['lotr:Tar-Palantir']);

function harness({withLore}){
  let paid=0;
  const cx=vm.createContext({
    window:{},S:{custom:{},campaign:{step:0,stageOrder:[10,1,2,3,4,5,6,7,8,9],history:[],sport:'brawl',roster:{},status:'draft'}},
    SPORTS:{brawl:{pos:[{id:'fighter',coach:false},{id:'commander',coach:true}]}},
    KnowledgeEngine:{has:()=>false,challenge:()=>{paid++;throw Error('Paid AI research was called')}},
    muppetForceOf:()=>null,MUPPET_FORCE_RULE:{campaignMinimum:65},lsGet:()=>({}),lsSet:()=>{}
  });
  const modules=['data/new-pool-core.js','data/pools-dc.js','data/pools-middle-earth.js','data/pools-harry-potter.js',
    'data/new-pool-traits.js','data/new-pool-powers.js',...(withLore?LORE:[])];
  for(const m of modules)vm.runInContext(read(m),cx,{filename:m});
  const html=read('index.html');
  const block=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b,i);assert.ok(i>=0&&j>i,'missing app segment '+a);return html.slice(i,j);};
  vm.runInContext('const POOLS=Object.assign({},window.DA_ADDED_POOLS);',cx);
  for(const id of ['nba','mcu','toons','muppets','games','pokemon','starwars']){
    const s=html.indexOf('POOLS.'+id+' =');vm.runInContext(html.slice(s,html.indexOf('};',s)+2),cx);
  }
  vm.runInContext("POOLS.mashup={id:'mashup',name:'All-Star Mashup',entries:[]};const GROUPS={};const SYN_MEMBERS={};const SIGS={};const BOOM_SET={};",cx);
  vm.runInContext(block('function registerCustomLinks(','// Returns { total, links:'),cx);
  vm.runInContext(block('function clampAttr(','function initials('),cx);
  vm.runInContext(block('function mashupOnly(','function poolFaces('),cx);
  for(const f of ['data/character-abilities.js','data/campaign-eligibility.js','data/campaign.js'])vm.runInContext(read(f),cx,{filename:f});
  const cands=pool=>{cx.pp=pool;return vm.runInContext('getCands(pp)',cx);};
  const themes=c=>{cx.subject=c;return POWER_RULES.filter(r=>{cx.r=r;return vm.runInContext('campaignAllowed(subject,r,null)',cx);});};
  return {cx,cands,themes,paid:()=>paid,lore:cx.window.DA_POOL_LORE||{}};
}

test('every new-pool character has exactly one lore entry keyed by its exact roster name',()=>{
  const h=harness({withLore:true});
  for(const pool of NEW){
    const names=Array.from(h.cands(pool),c=>c.n); // host-realm array for deepEqual
    const keys=Object.keys(h.lore[pool]||{});
    assert.deepEqual(keys.filter(k=>!names.includes(k)),[],pool+' lore keys missing from roster');
    assert.deepEqual(names.filter(n=>!keys.includes(n)),[],pool+' roster names without lore');
  }
});

test('lore entries follow the documented schema and stay readable on trading cards',()=>{
  const h=harness({withLore:true});
  for(const pool of NEW)for(const [name,e] of Object.entries(h.lore[pool])){
    const id=pool+':'+name;
    assert.equal(typeof e.short,'string',id);
    assert.ok(e.short.length>=40&&e.short.length<=95,id+' short length '+e.short.length);
    assert.ok(typeof e.biography==='string'&&e.biography.length>=80,id+' biography too thin');
    for(const field of ['powers','feats','limitations','sources']){
      assert.ok(Array.isArray(e[field]),id+' '+field);
      assert.ok(e[field].every(x=>typeof x==='string'&&x.trim()),id+' '+field+' has blank items');
    }
    assert.ok(e.powers.length>=1,id+' needs at least one power or skill');
    assert.ok(e.feats.length>=1,id+' needs at least one feat');
    if(NO_SOURCE_YET.has(id))assert.equal(e.sources.length,0,id+' is listed as unsourced');
    else assert.ok(e.sources.length>=1,id+' needs a source');
    for(const u of e.sources)assert.match(u,/^https:\/\/(en\.wikipedia\.org|lotr\.fandom\.com|harrypotter\.fandom\.com)\/wiki\/\S+$/,id+' source '+u);
  }
});

test('lore replaces card text but never alters identity, stats or taxonomy',()=>{
  const plain=harness({withLore:false}),rich=harness({withLore:true});
  for(const pool of NEW){
    const before=new Map(plain.cands(pool).map(c=>[c.n,c]));
    for(const c of rich.cands(pool)){
      const b=before.get(c.n);
      assert.equal(c.id,b.id);assert.equal(c.a.join(),b.a.join());
      assert.equal(c.taxonomy.join(),b.taxonomy.join());assert.equal(c.archetype,b.archetype);
      assert.equal(c.t,rich.lore[pool][c.n].short);
    }
  }
});

// Every Campaign theme the lore adds or removes, reviewed one by one.
// If a wording change alters this list, update it deliberately and say why in the PR.
const APPROVED_THEME_CHANGES={
  "dc:Superman":"+ice +healing",
  "dc:The Flash (Barry Allen)":"+healing",
  "dc:The Flash (Wally West)":"+healing",
  "dc:Aquaman":"+psychic",
  "dc:Cyborg":"+teleport",
  "dc:Martian Manhunter":"+stealth +healing",
  "dc:Hawkgirl":"+healing",
  "dc:Hawkman":"+healing",
  "dc:Zatanna":"+teleport",
  "dc:Doctor Fate":"+flight",
  "dc:Swamp Thing":"+giants",
  "dc:Mister Miracle":"+flight +teleport",
  "dc:Big Barda":"+teleport",
  "dc:Supergirl (Kara Zor-El)":"+ice",
  "dc:Beast Boy":"+flight +aquatic +giants",
  "dc:Lex Luthor":"+flight",
  "dc:Bizarro":"+fire +ice",
  "dc:Deathstroke":"+healing",
  "dc:Atrocitus":"+magic",
  "dc:Saint Walker":"+healing",
  "dc:Ocean Master":"-magic",
  "dc:Killer Croc":"+aquatic +healing",
  "dc:Superboy (Conner Kent)":"+psychic",
  "dc:Doctor Manhattan":"+teleport +healing +giants",
  "dc:Static":"+flight",
  "dc:King Shark":"+healing",
  "lotr:Gollum (Sméagol)":"+aquatic",
  "lotr:Galadriel":"+psychic",
  "lotr:Éowyn":"-magic",
  "lotr:Witch-king of Angmar":"+flight +magic +stealth",
  "lotr:Khamûl the Easterling":"+flight +stealth",
  "lotr:Mouth of Sauron":"+magic",
  "lotr:Morgoth (Melkor)":"+giants",
  "lotr:Lúthien Tinúviel":"+healing",
  "harrypotter:Hermione Granger":"+fire",
  "harrypotter:Albus Dumbledore":"+stealth",
  "harrypotter:Rubeus Hagrid":"+flight +magic",
  "harrypotter:James Potter":"+flight",
  "harrypotter:Fred Weasley":"+teleport",
  "harrypotter:George Weasley":"+teleport",
  "harrypotter:Percy Weasley":"+teleport",
  "harrypotter:Bill Weasley":"+teleport",
  "harrypotter:Charlie Weasley":"+flight +teleport",
  "harrypotter:Lucius Malfoy":"+teleport",
  "harrypotter:Barty Crouch Jr.":"+stealth",
  "harrypotter:Peter Pettigrew":"+stealth",
  "harrypotter:Alastor Moody":"+flight",
  "harrypotter:Nymphadora Tonks":"+flight",
  "harrypotter:Gellert Grindelwald":"+fire",
  "harrypotter:Credence Barebone":"+magic",
  "harrypotter:Rita Skeeter":"+stealth",
  "harrypotter:Dean Thomas":"+flight",
  "harrypotter:Peeves":"+stealth",
  "harrypotter:Fawkes":"+teleport"
};
test('lore and Campaign tags honor the 54 researched eligibility rulings',()=>{
  const plain=harness({withLore:false}),rich=harness({withLore:true});
  const tagsAreAuthoritative=vm.runInContext("typeof campaignHasTheme==='function' && campaignHasTheme('flight')",rich.cx);
  const actual={};
  for(const pool of NEW){
    const before=new Map(plain.cands(pool).map(c=>[c.n,plain.themes(c)]));
    for(const c of rich.cands(pool)){
      const a=before.get(c.n),b=rich.themes(c);
      const diff=[...b.filter(r=>!a.includes(r)).map(r=>'+'+r),...a.filter(r=>!b.includes(r)).map(r=>'-'+r)];
      if(diff.length)actual[pool+':'+c.n]=diff.join(' ');
      if(tagsAreAuthoritative)assert.deepEqual(b,a,pool+':'+c.n+' should not gain powers from card wording');
    }
  }
  if(tagsAreAuthoritative){
    // Description changes have no eligibility side effects: only reviewed tag records decide.
    assert.deepEqual(actual,{});
    for(const [id,changes] of Object.entries(APPROVED_THEME_CHANGES)){
      const i=id.indexOf(':'),pool=id.slice(0,i),name=id.slice(i+1);
      const c=rich.cands(pool).find(x=>x.n===name);
      assert.ok(c,'Missing reviewed character '+id);
      const granted=rich.themes(c);
      for(const change of changes.split(' ')){
        if(change.startsWith('+'))assert.ok(granted.includes(change.slice(1)),id+' missing '+change);
        else assert.ok(!granted.includes(change.slice(1)),id+' still has '+change);
      }
    }
  }else{
    // Legacy mode: lock the description-driven eligibility delta until tag migration.
    assert.deepEqual(actual,APPROVED_THEME_CHANGES);
  }
  assert.equal(plain.paid()+rich.paid(),0);
});

test('known traps stay closed: mounts, roles, titles and negations never grant powers',()=>{
  const h=harness({withLore:true});
  const has=(pool,name,rule)=>h.themes(h.cands(pool).find(c=>c.n===name)).includes(rule);
  const negative=[
    ['lotr','Gandalf','flight'],            // carried by Gwaihir as a passenger; mounted fighters (Nazgûl) do count
    ['lotr','Glaurung','flight'],           // wingless
    ['lotr','Meriadoc Brandybuck','magic'], // "Witch-king" in text is not witchcraft
    ['lotr','Éowyn','magic'],
    ['lotr','Peregrin Took','fire'],        // no "courage under fire" style idioms
    ['lotr','Huan the Hound','magic'],
    ['lotr','Gríma Wormtongue','stealth'],  // an informant role is not a stealth feat
    ['lotr','Glóin','fire'],                // kindling a campfire is not commanding fire
    ['dc','Amanda Waller','stealth'],       // running covert ops is a role
    ['dc','The Atom (Ray Palmer)','giants'],// shrinks only
    ['dc','Poison Ivy','psychic'],          // pheromones are chemical, not psychic
    ['dc','Ra\'s al Ghul','healing'],       // Lazarus Pits are external
    ['harrypotter','Jacob Kowalski','magic'],
    ['harrypotter','Argus Filch','magic'],
    ['harrypotter','James Potter','stealth'],// inherited cloak is equipment
    ['harrypotter','Vincent Crabbe','fire'], // cast Fiendfyre but could not control it
    ['harrypotter','Nagini','magic']
  ];
  for(const [p,n,r] of negative)assert.equal(has(p,n,r),false,p+':'+n+' must not gain '+r);
  assert.equal(h.paid(),0);
});

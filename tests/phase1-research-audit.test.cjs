const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {collectPhase1Research}=require('../tools/phase1-research-audit.cjs');
let full=null;
function load(){if(!full)full=collectPhase1Research();return full;}
const base=(pool,n,tag)=>load().pools[pool].base[n].decisions[tag];
const form=(pool,key,tag)=>load().pools[pool].forms[key].decisions[tag];

test('all source characters and forms have exactly 16 decisions',()=>{
 const r=load();
 assert.equal(r.summary.base,1204);
 assert.equal(r.summary.forms,243);
 assert.equal(r.summary.cells,(1204+243)*16);
 assert.equal(Object.keys(r.pools).length,10);
 for(const [pool,items] of Object.entries(r.pools)){
   for(const [name,c] of Object.entries(items.base))
     assert.deepEqual(Object.keys(c.decisions).sort(),r.rules.slice().sort(),pool+':'+name);
   for(const [name,f] of Object.entries(items.forms))
     assert.deepEqual(Object.keys(f.decisions).sort(),r.rules.slice().sort(),name);
 }
 assert.equal(r.gate.phase1Complete,false);
});
test('NBA human classification is researched and all 12 power tags are negative',()=>{
 for(const [name,c] of Object.entries(load().pools.nba.base)){
   assert.equal(c.decisions.mortal.decision,'yes',name);
   assert.equal(c.decisions.women.decision,'no',name);
   assert.equal(c.decisions.kids.decision,'no',name);
   assert.equal(c.decisions.red.decision,'needs-review',name);
   for(const power of ['flight','magic','psychic','aquatic','fire','ice','electric','tech','stealth','teleport','healing','giants'])
     assert.equal(c.decisions[power].decision,'no',name+' '+power);
 }
});
test('specific ability evidence and researched negative disputes are distinct from absence',()=>{
 assert.equal(base('mcu','Doctor Strange','magic').decision,'yes');
 assert.equal(base('mcu','Hawkeye','stealth').decision,'no');
 assert.equal(base('pokemon','Snorlax','giants').decision,'no');
 assert.equal(base('mcu','The Watcher','flight').decision,'needs-review');
 assert.equal(base('games','Blinky','red').decision,'yes');
 assert.equal(base('mcu','Cosmo the Spacedog','women').decision,'yes');
 assert.equal(base('harrypotter','Hedwig','women').decision,'yes');
 assert.equal(base('lotr','Shelob','women').decision,'yes');
 assert.equal(base('muppets','Curly Bear','women').decision,'yes');
 assert.equal(base('mcu','Thanos','women').decision,'no');
 assert.equal(base('starwars','Jabba the Hutt','women').decision,'no');
 assert.equal(base('pokemon','Charmander','red').decision,'no');
});
test('alternate form research uses exact identity instead of copied baseline tags',()=>{
 assert.equal(form('pokemon','pokemon:Snorlax|Gigantamax Snorlax','giants').decision,'yes');
 assert.equal(form('pokemon','pokemon:Ninetales|Alolan Ninetales','ice').decision,'yes');
 assert.equal(form('pokemon','pokemon:Ninetales|Alolan Ninetales','fire').decision,'no');
 assert.equal(form('games','games:Sonic the Hedgehog|Super Sonic','flight').decision,'yes');
 assert.equal(form('games','games:Mario|Ice Mario','ice').decision,'yes');
 assert.equal(form('toons','toons:Simba|Adult King Simba','kids').decision,'no');
 assert.equal(form('mcu','mcu:Iron Man|Godbuster Iron Man','tech').decision,'yes');
 assert.equal(form('dc','dc:Batman|Hellbat Armor Batman','tech').decision,'yes');
});
test('variant gender identity is independently reviewed, without inheriting other combat or Campaign traits',()=>{
 const phoenix=load().pools.mcu.forms['mcu:Jean Grey|White Phoenix of the Crown'];
 assert.equal(phoenix.decisions.women.decision,'yes');
 assert.equal(phoenix.decisions.red.decision,'needs-review');
 assert.equal(phoenix.decisions.magic.decision,'needs-review','new form powers need specific research');
 assert.equal(form('mcu','mcu:Thanos|King Thanos','women').decision,'no');
 assert.equal(form('mcu','mcu:Silver Surfer|Silver Surfer Black','women').decision,'no');
 assert.equal(form('games','games:Princess Peach|Radiant Peach','women').decision,'yes');
 assert.equal(form('toons','toons:Elsa|Fifth Spirit Elsa','women').decision,'yes');
 const ratio=load().summary.formIdentityYes+load().summary.formIdentityNo;
 assert.ok(ratio>=190);
});
test('committed research snapshots are in sync with the exact live roster',()=>{
 const r=load(),dir=path.join(__dirname,'../docs/phase1-research');
 const summary=JSON.parse(fs.readFileSync(path.join(dir,'summary.json'),'utf8'));
 assert.deepEqual(summary.summary,r.summary);
 for(const [pool,data] of Object.entries(r.pools)){
   const snapshot=JSON.parse(fs.readFileSync(path.join(dir,pool+'.json'),'utf8'));
   function mismatch(a,b,loc=''){
     if(a===b)return null;
     if(!a||!b||typeof a!=='object'||typeof b!=='object')return loc+': '+JSON.stringify(a)+' != '+JSON.stringify(b);
     for(const k of new Set([...Object.keys(a),...Object.keys(b)])){
       const diff=mismatch(a[k],b[k],loc+'.'+k);
       if(diff)return diff;
     }
     return null;
   }
   assert.equal(mismatch(snapshot,data),null,pool);
 }
});

test('Star Wars source-linked #82 batch documents individual visual, age and synthetic-body negatives',()=>{
 const selected=[
  ['Yoda','red'],['Yoda','kids'],['Darth Vader','red'],['Boba Fett','kids'],
  ['Captain Phasma','red'],['Chopper','red'],['R2-D2','mortal'],
  ['IG-11','mortal'],['Battle Droid','mortal'],['Droideka','mortal'],
  ['General Grievous','mortal'],['Grogu','red'],['Omega','red']
 ];
 for(const [name,tag] of selected){
  const f=base('starwars',name,tag);
  assert.equal(f.decision,'no',name+' '+tag);
  assert.equal(f.status,'individual-trait-review');
  assert.ok(f.reason.length>45);
  assert.match(f.source,/^https:\/\/www\.starwars\.com\/databank\//);
 }
 // Do not collapse continuity ambiguities into unresearched blanket negatives.
 assert.equal(base('starwars','Ahsoka Tano','kids').decision,'needs-review');
 assert.equal(base('starwars','Luke Skywalker','kids').decision,'needs-review');
 assert.equal(load().summary.needsReview,17884);
});

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
test('committed research snapshots are in sync with the exact live roster',()=>{
 const r=load(),dir=path.join(__dirname,'../docs/phase1-research');
 const summary=JSON.parse(fs.readFileSync(path.join(dir,'summary.json'),'utf8'));
 assert.deepEqual(summary.summary,r.summary);
 for(const [pool,data] of Object.entries(r.pools)){
   const snapshot=JSON.parse(fs.readFileSync(path.join(dir,pool+'.json'),'utf8'));
   assert.deepEqual(snapshot,data,pool);
 }
});

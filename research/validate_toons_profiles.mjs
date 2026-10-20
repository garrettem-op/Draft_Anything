// Run from repository root: node research/validate_toons_profiles.mjs
// Verifies roster completeness and shipping fidelity, NOT factual accuracy of scenes.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const html=fs.readFileSync('index.html','utf8');
const start=html.indexOf('POOLS.toons ='),end=html.indexOf('POOLS.muppets =',start);
assert(start>=0&&end>start,'Cartoons pool region not found');
const regex=/\["([^"]+)","([^"]*)","([^"]*)",\[([0-9,\s]+)\]\]/g;
const shipped=[...html.slice(start,end).matchAll(regex)].map(m=>({name:m[1],score:m[4].split(',').map(Number)}));
assert.equal(shipped.length,104,'Expected 104 cartoon entries');
const paths=[1,2,3].map(i=>'research/TOONS_PROFILES_BATCH_0'+i+'.json');
const all=paths.flatMap(p=>JSON.parse(fs.readFileSync(p,'utf8')).characters);
assert.equal(all.length,104,'Research profile count');
assert.equal(new Set(all.map(x=>x.name)).size,104,'Duplicate names');
const keys=['spd','agi','str','siz','lep','end','tch','acc','ref','iq','clu','ldr'];
const consolidated=JSON.parse(fs.readFileSync('research/TOONS_ALL_104_PROFILES.json','utf8'));
assert.equal(consolidated.characters.length,104,'Consolidated catalog count');
for(let i=0;i<shipped.length;i++){
 const {name,score}=shipped[i], p=all.find(x=>x.name===name), d=consolidated.characters[i];
 assert(p,'Profile missing '+name);
 assert(d,'Catalog missing '+name);
 assert.equal(d.name,name,'Catalog ordering '+name);
 assert.equal(d.roster_index,i+1,'Catalog index '+name);
 assert.deepEqual(score,keys.map(k=>p.scores[k]),'Shipped ratings drift from research for '+name);
 for(const k of keys){
  assert(Number.isInteger(p.scores[k])&&p.scores[k]>=1&&p.scores[k]<=99,'Invalid rating '+name+'/'+k);
  assert.equal(p.scores[k],d.scores[k],'Catalog score drift '+name+'/'+k);
  assert(d.attribute_rationales[k],'Missing rationale '+name+'/'+k);
 }
 assert(p.feats?.length&&p.limitations?.length&&p.primary_works?.length,'Missing evidence '+name);
}
const js=fs.readFileSync('data/toons-profiles.js','utf8');
const prefix='window.DA_CHARACTER_GUIDES.toons=';
const at=js.indexOf(prefix);
assert(at>=0,'Missing cartoons guide');
const guide=JSON.parse(js.slice(at+prefix.length).trim().replace(/;\s*$/,''));
assert.deepEqual(Object.keys(guide),shipped.map(e=>e.name),'Guide roster mismatch');
for(const p of all){
 const g=guide[p.name];
 assert.deepEqual(keys.map(k=>g.scores[k]),keys.map(k=>p.scores[k]),'Guide score mismatch '+p.name);
}
assert(html.includes('<script src="data/toons-profiles.js"></script>'),'Cartoon guide not loaded');
console.log('PASS: 104 unique cartoon characters, 12 scores, app rank data, consolidated research, and optional Guide synced.');
console.log('NOTE: This checks structure and consistency, not the historical truth of every described animation feat.');

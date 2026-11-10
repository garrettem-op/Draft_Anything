const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const poolSource=html.slice(html.indexOf('// ----- Pools -----'),html.indexOf('function poolFaces('));
assert(poolSource.includes('function mashupPoolId('));
const ids=['nba','mcu','toons','muppets','games','pokemon','starwars','dc','lotr','harrypotter'];
const pools=Object.fromEntries(ids.map(id=>[id,{id,name:id,short:id,entries:[]}]));
const candidates=Object.fromEntries(ids.map(id=>[id,[{id:id+':alpha',n:id+' alpha'}]]));
candidates.games=[{id:'games:shared',n:'Pikachu'},{id:'games:alpha',n:'games alpha'}];
candidates.pokemon=[{id:'pokemon:shared',n:'Pikachu'},{id:'pokemon:alpha',n:'pokemon alpha'}];
const context={POOLS:pools,S:{custom:{}},poolCandidates:p=>candidates[p.id]};
vm.runInNewContext(poolSource+';this.testAPI={mashupSources,mashupPoolId,isMashupId,getPool,getCands};',context);
const {mashupSources,mashupPoolId,isMashupId,getPool,getCands}=context.testAPI;
test('mashup starts with all pools and filters selected universes deterministically',()=>{
 assert.deepEqual([...mashupSources('mashup')],ids);
 assert.equal(mashupPoolId(ids),'mashup');
 const custom=mashupPoolId(['mcu','nba','mcu','not-a-pool']);
 assert.equal(custom,'mashup:nba,mcu');
 assert.deepEqual(getCands(custom).map(c=>c.id),['nba:alpha','mcu:alpha']);
 assert.equal(getPool(custom).name,'All-Star Mashup · 2 pools');
 assert.equal(isMashupId(custom),true);
});
test('empty mashup is invalid for starting a draft and has no candidates',()=>{
 const empty=mashupPoolId([]);
 assert.equal(empty,'mashup:');
 assert.equal(getCands(empty).length,0);
 assert.equal(getPool(empty).id,empty);
});
test('Pokemon duplicates are only suppressed when Games is included',()=>{
 const combo=getCands(mashupPoolId(['games','pokemon']));
 assert.equal(combo.filter(x=>x.n==='Pikachu').length,1);
 const pokemonOnly=getCands(mashupPoolId(['pokemon']));
 assert.equal(pokemonOnly.filter(x=>x.n==='Pikachu').length,1);
 assert.equal(pokemonOnly.find(x=>x.n==='Pikachu').id,'pokemon:shared');
});
test('all draft surfaces expose Mashup controls and persisted multiplayer selection',()=>{
 assert.match(html,/function poolPicker\(cur, act, sportKey\)/);
 assert.match(html,/Customize your Mashup/);
 assert.match(html,/case 'mashup-toggle': case 'mashup-all': case 'mashup-clear':/);
 assert.match(html,/h\.form\.poolId=next; lsSet\('da\.h2hform',h\.form\)/);
 assert.match(html,/const U = isMashupId\(userPoolId\) \? mashupSources\(userPoolId\)/);
 assert.match(html,/const okPool = BUILTIN\.includes\(st\.poolId\) \|\| isMashupId\(st\.poolId\)/);
});

const test=require('node:test');
const assert=require('node:assert/strict');
const expansion=require('../data/campaign-variant-expansion.js');
const {variantAbilityProfile}=require('../data/variant-abilities.js');
const {brawlAbilityOf}=require('../data/brawl-attack-profiles.js');
const {apexRankOf,resolveBrawlCombat}=require('../data/brawl-combat.js');
const base={pool:'mcu',id:'mcu:Odin',n:'Odin',a:[72,62,94,76,82,82,88,92,82,96,86,94]};
const keys=['spd','agi','str','siz','lep','end','tch','acc','ref','iq','clu','ldr'];
function form(c,f){return {...c,n:f.name,variantBase:c.n,variantAbilities:variantAbilityProfile(c,f),a:c.a.map((v,i)=>Math.min(99,Math.max(1,v+(f.changes[keys[i]]||0))))};}
function solo(c){return {rating:95,rows:[{pos:{id:'tk1',tank:true},fit:95,cand:c}]};}
function rng(seed){return ()=>((seed=(Math.imul(1664525,seed)+1013904223)>>>0)/4294967296);}
test('Odin base and both selectable forms have separate sourced powers',()=>{
 const forms=expansion['mcu:Odin'];
 assert.equal(forms.length,2);
 assert.equal(brawlAbilityOf(base).move,'Odinforce discharge');
 assert.equal(apexRankOf(base,brawlAbilityOf(base)),0);
 const young=form(base,forms[0]),destroyer=form(base,forms[1]);
 assert.equal(apexRankOf(young,brawlAbilityOf(young)),1);
 assert.equal(apexRankOf(destroyer,brawlAbilityOf(destroyer)),2);
 assert.equal(brawlAbilityOf(destroyer).move,'Destroyer energy discharge');
 for(const c of [young,destroyer])assert.match(brawlAbilityOf(c).source,/^https:\/\//);
 assert.equal(brawlAbilityOf({...base,n:forms[1].name,variantBase:'Odin'}),null);
});
test('Destroyer and Melkor use the same Apex class; no guaranteed winner or attack protection',()=>{
 const destroyer=form(base,expansion['mcu:Odin'][1]);
 const melkorBase={pool:'lotr',id:'lotr:Morgoth (Melkor)',n:'Morgoth (Melkor)',a:[85,80,93,90,85,94,93,95,90,99,95,95]};
 const melkor=form(melkorBase,expansion['lotr:Morgoth (Melkor)'][0]);
 for(let seed=1;seed<=100;seed++){
  const result=resolveBrawlCombat(solo(destroyer),solo(melkor),[95,95],rng(seed));
  const [a,b]=result.sides.map(s=>s.fighters[0]);
  assert.equal(a.apexHp,730);assert.equal(b.apexHp,730);
  assert.equal(a.wardHp,130);assert.equal(b.wardHp,130);
  assert.ok(a.maxHp>1100&&a.attacks>0);
  assert.equal(a.dmg-b.abs,a.overkill);
  assert.equal(b.dmg-a.abs,b.overkill);
 }
});

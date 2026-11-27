// Regression tests for the 2026-11-27 audit: battle reports reconcile damage and explain hits and support.
const test=require('node:test');
const assert=require('node:assert/strict');
const {daComparison}=require('../data/after-action.js');
global.esc=global.esc||(v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'));
const lcg=seed=>{let s=seed>>>0;return()=>((s=Math.imul(s,1664525)+1013904223>>>0)/4294967296);};
const hero=(pool,n,a,extra={})=>({id:pool+':'+n,pool,n,a,...extra});
function loadCombat(globals={}){
  for(const [k,v] of Object.entries(globals))globalThis[k]=v;
  const file=require.resolve('../data/brawl-combat.js');
  delete require.cache[file];
  return require(file);
}

test('battle report reconciles every point of damage and explains hits and support',()=>{
  const {resolveBrawlCombat}=loadCombat();
  const pos=['tk1','tk2','d1','d2','d3'];
  const team=(tag,base)=>({rating:85,rows:pos.map((id,i)=>({pos:{id,ab:id.startsWith('t')?'TNK':'DPS',tank:id.startsWith('t')},
    cand:hero('mcu',tag+i,Array(12).fill(base+3*i)),fit:70+3*i}))});
  let fourTargets=null;
  for(let seed=1;seed<=40;seed++){
    const A=team('A',62),B=team('B',70),r=resolveBrawlCombat(A,B,[85,85],lcg(seed));
    for(const f of r.sides.flatMap(s=>s.fighters)){
      const listed=Object.values(f.targets).reduce((sum,t)=>sum+t.dmg,0);
      assert.equal(listed,f.dmg,'target damage must add up to total DMG');
      if(f.attacks)assert.ok(f.avgHitChance>=.53&&f.avgHitChance<=.97);
      if(f.koRound)assert.ok(f.koBy,'a knocked-out fighter records who finished them');
      if(!fourTargets&&Object.keys(f.targets).length>=4)fourTargets={A,B,r,f};
    }
  }
  assert.ok(fourTargets,'fixture should produce a fighter with four or more targets');
  const {A,B,r,f}=fourTargets;
  const html=daComparison('brawl',A,B,r.sides[0].kos,r.sides[1].kos,'Us','Them','audit',{combat:r});
  for(const t of Object.values(f.targets))assert.ok(html.includes(`${t.name} (${t.dmg} DMG`),'every target is listed: '+t.name);
  assert.match(html,/average chance to hit \d+%/);
  assert.match(html,/Took \d+ damage from \d+ hits; blocked \d+\./);
  assert.match(html,/Total \d+ DMG/);
});

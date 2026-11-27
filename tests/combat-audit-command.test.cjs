// Decision 2026-11-27: sporting leadership counts partly for a Battle Royale commander.
const test=require('node:test');
const assert=require('node:assert/strict');
const {combatTransfer,commandAttributes,combatAttributes}=require('../data/brawl-combat-transfer.js');
const KEYS=['spd','agi','str','siz','lep','end','tch','acc','ref','iq','clu','ldr'];
const at=(a,k)=>a[KEYS.indexOf(k)];
const hero=(pool,n,a)=>({id:pool+':'+n,pool,n,a});
const russell=hero('nba','Bill Russell',[70,72,80,90,85,90,65,60,85,95,95,97]);
const leonidas=hero('actionmovies','Leonidas',[75,75,88,70,80,93,93,85,88,88,97,98]);

test('sporting leadership is partly carried into command; combat leadership in full',()=>{
  assert.equal(combatTransfer(russell).command,.5);
  const a=commandAttributes(russell);
  assert.equal(at(a,'ldr'),50+.5*(97-50));
  assert.equal(commandAttributes(leonidas),leonidas.a,'combat-domain characters are untouched');
  assert.deepEqual(russell.a,[70,72,80,90,85,90,65,60,85,95,95,97],'stored attributes are never modified');
});
test('command only lowers sporting leadership above baseline and never raises anything',()=>{
  const low=hero('nba','Quiet Veteran',[60,60,60,60,60,60,60,60,60,60,60,40]);
  assert.equal(at(commandAttributes(low),'ldr'),40);
  const hi=commandAttributes(russell),base=combatAttributes(russell);
  hi.forEach((v,i)=>assert.ok(v<=russell.a[i]&&v>=0));
  assert.deepEqual(hi.filter((v,i)=>KEYS[i]!=='ldr'),base.filter((v,i)=>KEYS[i]!=='ldr'),'only leadership differs from the combat vector');
});
test('documented trained sporting individuals keep more of their leadership',()=>{
  const kareem=hero('nba','Kareem Abdul-Jabbar',[70,72,78,91,82,92,85,88,82,92,90,85]);
  assert.equal(combatTransfer(kareem).command,.65);
});

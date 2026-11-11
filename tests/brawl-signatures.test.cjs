const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {resolveBrawlCombat}=require('../data/brawl-combat.js');
const {brawlAbilityOf}=require('../data/brawl-attack-profiles.js');
const KEYS=['spd','agi','str','siz','lep','end','tch','acc','ref','iq','clu','ldr'];
function rngFrom(seed){
  let state=seed>>>0;
  return ()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296;};
}
function hero(pool,n,attrs={},extra={}){
  return {pool,n,id:pool+':'+n,a:KEYS.map(k=>attrs[k]??77),...extra};
}
const hellbat=hero('dc','Hellbat Armor Batman',
  {str:93,spd:90,end:90,siz:80,acc:88,ref:86,iq:96},
  {variantBase:'Batman',variantAbilities:{
    move:'Hellbat Counteroffensive',domains:['tech','melee'],
    guards:['tech','melee'],weakTo:['magic'],tier:3,
    limit:'Hellbat armor drains the wearer.'
  }});
const joker=hero('dc','Joker',
  {str:44,spd:53,end:52,siz:47,acc:65,ref:62,iq:97});
const warlock=hero('mcu','Adam Warlock',
  {str:86,spd:86,end:90,siz:82,acc:92,ref:84,iq:89});
const darkseid=hero('dc','Darkseid',
  {str:99,spd:84,end:99,siz:99,acc:93,ref:86,iq:90});
function solo(c,fit=85){
  return {rating:80,rows:[{pos:{id:'d1',tank:false},fit,cand:c}]};
}
function summarize(a,b,count=100){
  const runs=Array.from({length:count},(_,i)=>resolveBrawlCombat(solo(a),solo(b),[80,80],rngFrom(i*37+31)));
  const mean=(index,key)=>runs.reduce((sum,r)=>sum+r.sides[index].fighters[0][key],0)/count;
  return {runs,aDamage:mean(0,'dmg'),bDamage:mean(1,'dmg'),
    aWin:runs.filter(r=>r.winner===0).length};
}
test('curated powers and reviewed variants are strictly scoped to their identity',()=>{
  assert.equal(brawlAbilityOf(joker),null);
  assert.equal(brawlAbilityOf(darkseid).move,'Omega Beams');
  assert.equal(brawlAbilityOf(warlock).domain,'cosmic');
  const hell=brawlAbilityOf(hellbat);
  assert.equal(hell.move,'Hellbat Counteroffensive');
  assert.equal(hell.wearStart,5);
  assert.ok(hell.pierce>0);
  assert.equal(brawlAbilityOf(hero('dc','Hellbat Armor Batman',{}, {variantBase:'Batman'})),null,
    'unreviewed variant must not silently acquire Hellbat powers');
  assert.equal(brawlAbilityOf(hero('toons','Darkseid')),null,
    'cross-pool name collisions must never gain another pool power');
});

test('all seeded matchups preserve damage, overkill and KO arithmetic',()=>{
  for(const [left,right] of [[hellbat,joker],[warlock,joker],[hellbat,darkseid]]){
    for(let seed=1;seed<=100;seed++){
      const r=resolveBrawlCombat(solo(left),solo(right),[80,80],rngFrom(seed*71));
      assert.equal(r.version,2);
      assert.equal(r.sides[0].damage,r.sides[0].fighters[0].dmg);
      assert.equal(r.sides[1].damage,r.sides[1].fighters[0].dmg);
      for(let side=0;side<2;side++){
        const f=r.sides[side].fighters[0];
        assert.ok(f.hits<=f.attacks);
        assert.ok(f.powerUses<=f.attacks);
        assert.ok(f.powerDmg<=f.dmg);
        assert.ok(f.hp>=0&&f.hp<=f.maxHp);
        assert.equal(r.sides[side].damage-r.sides[1-side].absorbed,f.overkill);
        assert.equal(r.sides[side].kos,f.kos);
      }
      assert.ok(r.sides.some(s=>s.survivors===0));
    }
  }
});

test('Hellbat and Adam Warlock make coherent contributions against baseline Joker across 100 seeds',()=>{
  const h=summarize(hellbat,joker);
  const w=summarize(warlock,joker);
  assert.ok(h.aDamage>h.bDamage,
    'Hellbat should materially outperform an ordinary Joker in a fair isolated fight');
  assert.ok(w.aDamage>w.bDamage,
    'Adam Warlock should materially outperform ordinary Joker in a fair isolated fight');
  assert.ok(h.aWin>50&&w.aWin>50,
    'cross-tier distinction should survive randomized variance without prescribing a single result');
  console.log('100-seed Hellbat/Joker DMG means:',h.aDamage.toFixed(1),h.bDamage.toFixed(1),'Hellbat wins:',h.aWin);
  console.log('100-seed Warlock/Joker DMG means:',w.aDamage.toFixed(1),w.bDamage.toFixed(1),'Warlock wins:',w.aWin);
});

test('Hellbat vs Darkseid remains a simulated match, not a scripted canonical winner',()=>{
  const h=summarize(hellbat,darkseid);
  assert.ok(h.aDamage>0&&h.bDamage>0);
  console.log('100-seed Hellbat/Darkseid DMG means:',h.aDamage.toFixed(1),h.bDamage.toFixed(1),'Hellbat wins:',h.aWin);
});

test('opt-in trace identifies named attacks, mitigation, targets, knockouts and metabolic wear',()=>{
  const r=resolveBrawlCombat(solo(hellbat),solo(darkseid),[80,80],rngFrom(37),{trace:true});
  assert.ok(Array.isArray(r.events));
  assert.ok(r.events.some(e=>e.type==='hit'&&e.raw>0&&e.incoming>0));
  assert.ok(r.events.some(e=>e.move==='Hellbat Counteroffensive'));
  assert.ok(r.events.some(e=>e.move==='Omega Beams'));
  const left=r.sides[0].fighters[0];
  assert.ok(left.attacks>0);
  assert.ok(Object.keys(left.targets).length>=1);
  assert.equal(left.powerMove,'Hellbat Counteroffensive');
  assert.ok(!Number.isNaN(left.roundsAlive));
  const repeat=resolveBrawlCombat(solo(hellbat),solo(darkseid),[80,80],rngFrom(37),{trace:true});
  assert.deepEqual(r,repeat);
  const quiet=resolveBrawlCombat(solo(hellbat),solo(darkseid),[80,80],rngFrom(37));
  assert.equal(quiet.events,undefined,'seasons should not store large event timelines by default');
  assert.deepEqual(quiet.sides,r.sides);
});

test('browser and match report wire combat ability profiles and expandable DMG explanation',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  const reports=fs.readFileSync(path.join(__dirname,'../data/after-action.js'),'utf8');
  const p=html.indexOf('<script src="data/brawl-attack-profiles.js"></script>');
  const q=html.indexOf('<script src="data/brawl-combat.js"></script>');
  assert.ok(p>0&&q>p);
  assert.match(reports,/Why this DMG\?/);
  assert.match(reports,/rounds alive/);
  assert.match(reports,/log\.powerDmg/);
});

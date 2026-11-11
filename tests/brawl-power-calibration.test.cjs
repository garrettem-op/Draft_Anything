const test=require('node:test');
const assert=require('node:assert/strict');
const {CORE,brawlAbilityOf}=require('../data/brawl-attack-profiles.js');
const {BRAWL_EXCEPTIONAL_POWER}=require('../data/brawl-exceptional-power.js');
const {resolveBrawlCombat}=require('../data/brawl-combat.js');
const keys=['spd','agi','str','siz','lep','end','tch','acc','ref','iq','clu','ldr'];
function rngFrom(seed){let x=seed>>>0;return ()=>((x=(Math.imul(1664525,x)+1013904223)>>>0)/4294967296);}
const hero=(pool,n,attrs={},extra={})=>({id:pool+':'+n,pool,n,
  a:keys.map(k=>attrs[k]??78),...extra});
const solo=(c,fit=80)=>({rating:80,rows:[{pos:{id:'d1',tank:false},fit,cand:c}]});
const duel=(a,b,seed,options)=>resolveBrawlCombat(solo(a),solo(b),[80,80],rngFrom(seed),options);
const hellbat=hero('dc','Hellbat Armor Batman',{str:93,spd:90,end:90,siz:80,acc:88,ref:86,iq:96},
 {variantBase:'Batman',variantAbilities:{
   move:'Hellbat Counteroffensive',domains:['tech','melee'],guards:['tech','melee'],
   weakTo:['magic'],tier:3,limit:'Hellbat armor drains the wearer.'
 }});
const joker=hero('dc','Joker',{str:44,spd:53,end:52,siz:47,acc:65,ref:62,iq:97});
const darkseid=hero('dc','Darkseid',{str:99,spd:84,end:99,siz:99,acc:93,ref:86,iq:90});
const warlock=hero('mcu','Adam Warlock',{str:86,spd:86,end:90,siz:82,acc:92,ref:84,iq:89});
const franklin=hero('mcu','Franklin Richards',
 {spd:1,agi:1,str:1,siz:10,lep:1,end:40,tch:12,acc:1,ref:20,iq:20,clu:45,ldr:1});
test('all registered exceptional-power identities have separately reviewed combat techniques',()=>{
  const special=Object.keys(BRAWL_EXCEPTIONAL_POWER);
  assert.ok(special.length>=20);
  assert.ok(Object.keys(CORE).length>=30);
  for(const key of special){
    assert.ok(CORE[key],key+' lacks ability profile');
  }
  for(const [key,p] of Object.entries(CORE)){
    assert.match(key,/^(dc|mcu|lotr):./);
    assert.ok(p.move.length>=5&&p.limit.length>=25,key);
    assert.ok(['toxin','melee','tech','cosmic','magic','reality','elemental'].includes(p.domain),key);
    assert.ok(p.pierce>=0&&p.pierce<=.45,key);
    assert.ok(p.tier>=1&&p.tier<=5,key);
    assert.ok(p.cooldown>=2&&p.cooldown<=5,key);
    assert.match(p.source,/^https:\/\//,key);
  }
});
test('base profiles cannot inherit unsupported forms, and publisher namespaces do not collide',()=>{
  const baseline=brawlAbilityOf(joker);
  assert.equal(baseline.move,'Joker toxin');
  assert.equal(baseline.tier,1,'baseline Joker is not Emperor Joker');
  assert.equal(brawlAbilityOf(hero('toons','Joker')),null);
  assert.equal(brawlAbilityOf(hero('dc','Emperor Joker',{},{variantBase:'Joker'})),null);
  assert.equal(brawlAbilityOf(hero('dc','Hellbat Armor Batman',{},{variantBase:'Batman'})),null);
  const emperor=brawlAbilityOf(hero('dc','Emperor Joker',{},{
    variantBase:'Joker',variantAbilities:{move:'Emperor Joker Reality Prank',
      domains:['reality'],guards:['reality'],tier:5,limit:'Borrowed fifth-dimensional powers.'}
  }));
  assert.equal(emperor.tier,5);
  assert.equal(emperor.move,'Emperor Joker Reality Prank');
  assert.equal(brawlAbilityOf(hellbat).wearStart,5);
});
test('reality-class attack has a gameplay floor even for low physical attributes',()=>{
  const result=duel(franklin,joker,31,{trace:true});
  const first=result.events.find(e=>e.type==='hit'&&e.attacker===franklin.id);
  assert.ok(first,'Franklin should execute a successful attack in controlled duel');
  assert.equal(first.move,'Reality reshape','documented power not reflected');
  assert.ok(first.raw>=90,'reality-class ability should not use infant punch strength as its ceiling');
  assert.ok(first.raw>first.prevented);
});
test('death and other metaphysical entities are ordinary arena knockout proxies, not guaranteed kills',()=>{
  const death=brawlAbilityOf(hero('dc','Death of the Endless'));
  assert.match(death.limit,/arena manifestation/);
  assert.ok(death.tier<=5&&death.cooldown>=3,'meta ability cannot instant-win by identity alone');
});
test('multiple matchup families preserve accounting, source metadata and reproducible outcomes',()=>{
  const pairs=[[hellbat,joker],[warlock,joker],[darkseid,joker],[hellbat,darkseid],
    [warlock,darkseid],[franklin,joker]];
  let runs=0;
  for(let i=0;i<pairs.length;i++){
    let winners=[0,0];
    for(let seed=0;seed<250;seed++){
      const [a,b]=pairs[i];
      const res=duel(a,b,91001+i*10101+seed);
      winners[res.winner]++;
      runs++;
      assert.ok(res.sides.some(s=>s.survivors===0));
      assert.equal(res.attacks,res.sides.flatMap(s=>s.fighters).reduce((n,f)=>n+f.attacks,0));
      for(let side=0;side<2;side++){
        const f=res.sides[side].fighters[0];
        assert.equal(res.sides[side].damage,f.dmg);
        assert.equal(res.sides[side].damage-res.sides[1-side].absorbed,f.overkill);
        assert.ok(f.powerUses<=f.attacks&&f.powerDmg<=f.dmg);
        assert.ok(f.hp>=0&&f.hp<=f.maxHp);
        assert.ok(f.powerMove&&f.powerSource&&f.powerLimit);
        assert.ok(f.roundsAlive>=1&&f.roundsAlive<=res.rounds);
      }
    }
    if(i<3)assert.ok(winners[0]>winners[1],pairs[i][0].n+' should outperform Joker over repeated isolated trials');
    if(i===3)assert.ok(winners[0]>0&&winners[1]>0,'Hellbat and Darkseid must not be scripted automatic winners');
    console.log('Power calibration',pairs[i][0].n,'vs',pairs[i][1].n,JSON.stringify(winners));
  }
  assert.equal(runs,1500);
});
test('full trace is optional and preserves exact scalar statistics',()=>{
  const a=duel(hellbat,darkseid,123,{trace:true}),b=duel(hellbat,darkseid,123);
  assert.deepEqual(a.sides,b.sides);
  assert.equal(b.events,undefined);
  assert.ok(a.events.some(e=>e.type==='hit'&&e.raw>0&&e.incoming>0));
  assert.match(a.sides[0].fighters[0].powerSource,/^https:\/\/www\.dc\.com\/blog\/2014/);
  assert.ok(a.sides[1].fighters[0].powerSource.startsWith('https://www.dc.com/'));
});


test('reviewed power-domain guard and weakness change mitigation on the same seeded attack',()=>{
 const caster=hero('test','Caster',{str:82,spd:85,end:88,acc:89,ref:84},{
   variantBase:'Caster',variantAbilities:{
     move:'Cosmic Surge',domains:['cosmic'],guards:[],weakTo:[],tier:4,limit:'Test variant.'
   }
 });
 const target=(guard,weakTo)=>hero('test','Target',{str:80,end:85,ref:75,spd:75},{
   variantBase:'Target',variantAbilities:{
     move:'Melee defense',domains:['melee'],guards:guard,weakTo,tier:2,limit:'Test variant.'
   }
 });
 function first(seed,guard,weakTo){
   const r=duel(caster,target(guard,weakTo),seed,{trace:true});
   return r.events.find(e=>e.type==='hit'&&e.attacker===caster.id&&e.move==='Cosmic Surge');
 }
 let found=false;
 for(let seed=1;seed<=60;seed++){
   const plain=first(seed,[],[]);
   if(!plain)continue;
   const protectedHit=first(seed,['cosmic'],[]);
   const exposed=first(seed,[],['cosmic']);
   if(!protectedHit||!exposed)continue;
   assert.equal(plain.raw,protectedHit.raw);
   assert.equal(plain.raw,exposed.raw);
   assert.ok(protectedHit.prevented>plain.prevented,'matching domain guard should protect against the strike');
   assert.ok(exposed.prevented<plain.prevented,'matching weakness should increase damage taken');
   found=true;break;
 }
 assert.equal(found,true,'seeded attacks should expose both guard and weakness effects');
});
test('finite high-order wards and Hellbat metabolic wear are separately recorded',()=>{
 assert.ok(duel(franklin,joker,11).sides[0].fighters[0].wardHp>0);
 assert.equal(duel(hellbat,joker,11).sides[0].fighters[0].wardHp,0);
 let found=false;
 for(let seed=1;seed<=40;seed++){
   // Apex Hellbat now wins a conventional duel before round five. Four
   // resilient targets prolong the fight so its metabolic cost can trigger.
   const targets={rating:80,rows:Array.from({length:4},(_,i)=>({
     pos:{id:i<2?'tk'+i:'d'+i,tank:i<2},fit:80,
     cand:hero('test','Durable Target '+i,{str:25,spd:1,acc:1,end:99,siz:99,ref:1})
   }))};
   const r=resolveBrawlCombat(solo(hellbat),targets,[80,80],rngFrom(seed),{trace:true});
   const strain=r.events.filter(e=>e.type==='wear'&&e.fighter===hellbat.id);
   if(!strain.length)continue;
   assert.ok(strain.every(e=>e.amount>0&&e.round>=5));
   assert.equal(strain.reduce((a,e)=>a+e.amount,0),r.sides[0].fighters[0].wear);
   assert.ok(r.sides[0].fighters[0].powerUses>0);
   found=true;break;
 }
 assert.equal(found,true,'Hellbat metabolic cost should activate in suitably long battles');
});

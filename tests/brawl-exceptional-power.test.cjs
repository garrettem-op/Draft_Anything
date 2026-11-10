const test=require('node:test');
const assert=require('node:assert/strict');
const {BRAWL_EXCEPTIONAL_POWER,brawlExceptionalPower}=require('../data/brawl-exceptional-power.js');

const sample=(pool,n)=>({pool,n,a:Array(12).fill(80)});
const fighter={id:'d1'},coach={id:'cmd',coach:true},bench={id:'bn',bench:true};
test('the feat-based cosmic register is limited, source-labeled and independently bounded',()=>{
  assert.ok(Object.keys(BRAWL_EXCEPTIONAL_POWER).length>=20);
  for(const [key,entry]of Object.entries(BRAWL_EXCEPTIONAL_POWER)){
    assert.match(key,/^(?:dc|mcu|lotr):\S/);
    assert.ok(Number.isFinite(entry[0])&&entry[0]>=30&&entry[0]<=65,key);
    assert.ok(entry[1].length>=30&&entry[3].length>=20,key);
    assert.match(entry[2],/^https:\/\//,key);
  }
});
test('world-scale narrative power improves Battle Royale only, never normal attributes or coach spots',()=>{
  const doom=sample('mcu','God Emperor Doom');
  const regularDoom=sample('mcu','Doctor Doom');
  const bugs=sample('toons','Bugs Bunny');
  const cosmic=sample('dc','Doctor Manhattan');
  const original=cosmic.a.slice();
  assert.equal(brawlExceptionalPower(doom,'brawl',fighter),64);
  assert.equal(brawlExceptionalPower(regularDoom,'brawl',fighter),0,'Temporary godhood is not permanent');
  assert.equal(brawlExceptionalPower(cosmic,'brawl',fighter),51);
  assert.equal(brawlExceptionalPower(cosmic,'basketball',fighter),0);
  assert.equal(brawlExceptionalPower(cosmic,'soccer',fighter),0);
  assert.equal(brawlExceptionalPower(cosmic,'brawl',coach),0);
  assert.equal(brawlExceptionalPower(cosmic,'brawl',bench),0);
  assert.equal(brawlExceptionalPower(bugs,'brawl',fighter),0,'ToonForce uses a distinct mechanic');
  assert.deepEqual(cosmic.a,original,'A cosmic ability is not an invented physical 13th attribute');
});
test('documented cosmic users compete with ToonForce without making other sports supernatural',()=>{
  for(const name of ['Anti-Monitor','Mister Mxyzptlk','Lucifer Morningstar','Doctor Manhattan','The Spectre'])
    assert.ok(brawlExceptionalPower(sample('dc',name),'brawl',fighter)>=50,name);
  for(const name of ['Franklin Richards','Scarlet Witch','Galactus'])
    assert.ok(brawlExceptionalPower(sample('mcu',name),'brawl',fighter)>=46,name);
});

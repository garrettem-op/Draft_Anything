/* Run with: node tests/daily-grid.test.cjs */
(function runTests() {
  'use strict';
  const assert=require('node:assert/strict');
  const fs=require('node:fs');
  const path=require('node:path');
  const grid=require('../data/daily-grid.js');
  const first=grid.puzzle('2026-11-09');
  assert.equal(first.number,1);
  assert.equal(first.rows.length,3);
  assert.equal(first.cols.length,3);
  assert.equal(new Set(first.rows).size,3);
  assert.equal(new Set(first.cols.map(x=>x.key)).size,3);
  assert.equal(grid.puzzle('2026-11-08'),null);
  assert.equal(grid.validDay('2026-11-09','2026-11-10'),true);
  assert.equal(grid.validDay('2026-11-11','2026-11-10'),false);
  assert.equal(grid.validDay('2026-02-31','2026-11-10'),false);
  assert.equal(grid.today(new Date('2026-11-09T04:59:59Z')),'2026-11-08');
  assert.equal(grid.today(new Date('2026-11-09T05:00:00Z')),'2026-11-09');
  // Daily pairs do not repeat within the first 1,540 days.
  const seen=new Set();
  for(let i=0;i<1540;i++) {
    const date=grid.isoDay(i),p=grid.puzzle(date);
    assert.equal(p.number,i+1);
    const signature=p.rows.slice().sort().join(',')+'/'+p.cols.map(x=>x.key).sort().join(',');
    assert.equal(seen.has(signature),false,'Repeated puzzle '+date);
    seen.add(signature);
  }
  // Each square has valid answers in every original talent pool; never publish an impossible grid.
  const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8');
  const positions={spd:0,agi:1,str:2,siz:3,lep:4,end:5,tch:6,acc:7,ref:8,iq:9,clu:10,ldr:11};
  for(const pool of grid.POOL_IDS) {
    const start=html.indexOf('POOLS.'+pool+' = ');
    assert.ok(start>=0,'Missing pool '+pool);
    const end=html.indexOf('\n]};',start);
    assert.ok(end>start,'Missing pool terminator '+pool);
    const section=html.slice(start,end);
    const vectors=[...section.matchAll(/\[(\d+(?:,\d+){11})\]/g)].map(m=>m[1].split(',').map(Number));
    for(const trait of grid.TRAITS) {
      const eligible=vectors.filter(a=>a[positions[trait.key]]>=trait.min).length;
      assert.ok(eligible>=8,'Too few answers: '+pool+' '+trait.key+' '+trait.min+' has '+eligible);
    }
  }
  const record={puzzle:first,cells:{}};
  const make=(id,name,pool,score)=>({id,name,n:name,pool,a:Array(12).fill(score)});
  const answer=make('nba:correct','Unique Hero',first.rows[0],99);
  let response=grid.attempt(record,0,answer);
  assert.equal(response.accepted,true);
  assert.equal(response.result.ok,true);
  assert.equal(grid.attempt(record,0,make('x:other','Someone',first.rows[0],99)).accepted,false,'Square was reused');
  assert.equal(grid.attempt(record,1,make('other:same','Unique Hero',first.rows[0],99)).accepted,false,'Character was reused');
  const wrong=grid.attempt(record,1,make('mismatch:low','Wrong Guess',first.rows[1],1));
  assert.equal(wrong.accepted,true);
  assert.equal(wrong.result.ok,false);
  assert.equal(grid.score(record).correct,1);
  assert.equal(grid.score(record).missed,1);
  assert.equal(grid.score(record).remaining,7);
  global.localStorage={getItem:key=>key.endsWith(first.date)?JSON.stringify(record):null};
  const text=grid.shareText(first.date);
  assert.ok(text.includes('1/9 correct'));
  assert.ok(text.includes('🟩🟥'));
  console.log('Daily Grid: deterministic puzzles, eligibility, scoring, uniqueness, and archive checks passed.');
})();

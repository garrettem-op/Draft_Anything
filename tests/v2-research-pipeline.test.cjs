'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const pipe=require('../tools/v2-research-pipeline.cjs');
test('manifest uses exact base and variant identities',()=>{
 const ids=pipe.rosterIds();assert.ok(ids.length>1200);assert.ok(ids.includes('mcu:Iron Man'));assert.ok(ids.some(id=>id.includes('|')));assert.equal(new Set(ids).size,ids.length);
});
test('unreviewed records cannot impersonate reviewed sources or transfer variants',()=>{
 const id='mcu:Iron Man',roster=new Set([id,id+'|Test Suit']);
 const p={id,continuity:'MCU motion pictures',summary:'A high-tech armored airborne combatant with constrained suit power.',offense:{domains:['energy']},defense:{mechanisms:['armor']},weaknesses:['power loss'],sources:[{url:'https://www.marvel.com/characters/iron-man-tony-stark/on-screen',supports:'Supports character identity and suit equipment'}],researchStatus:'provisional'};
 const b={batchId:'MCU research batch 01',schemaVersion:1,characters:[p]};
 assert.deepEqual(pipe.checkBatch('sample.json',b,roster),[]);
 b.characters[0].researchStatus='reviewed';assert.match(pipe.checkBatch('sample.json',b,roster).join(' '),/reviewer identity/);
 b.characters[0].reviewedBy='Independent reviewer';b.characters[0].reviewNotes='Verified scene evidence separately';
 assert.deepEqual(pipe.checkBatch('sample.json',b,roster),[]);
 b.characters[0].id=id+'|Test Suit';assert.match(pipe.checkBatch('sample.json',b,roster).join(' '),/formDifferences/);
 b.characters[0].formDifferences='Adds a distinct armor configuration';assert.deepEqual(pipe.checkBatch('sample.json',b,roster),[]);
});
test('queue never reassigns a recorded identity',()=>{
 const ids=['dc:A','dc:B','mcu:X'],records=new Map([['dc:A',{status:'provisional'}]]);
 assert.deepEqual(pipe.nextBatch({ids,records},2),{complete:false,pool:'dc',ids:['dc:B']});
});
test('queue skips identities claimed by open PRs',()=>{
 const ids=['dc:A','dc:B','dc:C','mcu:X'],records=new Map([['dc:A',{status:'provisional'}]]);
 assert.deepEqual(pipe.nextBatch({ids,records},2,new Set(['dc:B'])),{complete:false,pool:'dc',ids:['dc:C']});
 assert.deepEqual(pipe.nextBatch({ids,records},2,new Set(['dc:B','dc:C'])),{complete:false,pool:'mcu',ids:['mcu:X']});
});
test('evidence indexes must point at real sources and supports must not echo the URL',()=>{
 const id='mcu:Iron Man',roster=new Set([id]);
 const url='https://www.marvel.com/characters/iron-man-tony-stark/on-screen';
 const p={id,continuity:'MCU motion pictures',summary:'A high-tech armored airborne combatant.',offense:{domains:['energy']},defense:{mechanisms:['armor']},weaknesses:['power loss'],sources:[{url,supports:'Suit-based flight and repulsors'}],researchStatus:'provisional',feats:[{claim:'Flies the suit',source:0}]};
 const b={batchId:'MCU research batch 09',schemaVersion:1,characters:[p]};
 assert.deepEqual(pipe.checkBatch('x.json',b,roster),[]);
 p.feats[0].source=1;assert.match(pipe.checkBatch('x.json',b,roster).join(' '),/index an existing sources/);
 p.feats[0].source=0;p.sources[0].supports=url;assert.match(pipe.checkBatch('x.json',b,roster).join(' '),/not repeat the URL/);
});

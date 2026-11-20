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
test('Action Movies identities are in the research manifest and queue first',()=>{
 const a=pipe.audit();
 const am=a.ids.filter(id=>id.startsWith('actionmovies:'));
 assert.equal(am.length,100);
 assert.ok(am.includes('actionmovies:Achilles'));
 const next=pipe.nextBatch(a,10);
 if(!am.every(id=>a.records.has(id)))assert.equal(next.pool,'actionmovies');
 // Ability and Campaign audits keep their scope: the default loadGame() still excludes the pool.
 const {loadGame}=require('../tools/ability-audit-lib.cjs');
 assert.ok(!loadGame().roster.some(r=>r.pool==='actionmovies'));
});
test('film-pool records must name the roster film, say it is the film, and give its year',()=>{
 const {loadGame,RESEARCH_EXTRA_POOL_IDS}=require('../tools/ability-audit-lib.cjs');
 const films=pipe.filmAnchors(loadGame({extraPools:RESEARCH_EXTRA_POOL_IDS}));
 assert.equal(films.size,100);
 for(const id of ['actionmovies:Achilles','actionmovies:Conan','actionmovies:The Bride (Beatrix Kiddo)','actionmovies:Rama'])assert.ok(films.has(id),id+' must be a real roster id so the checks below are not vacuous');
 const roster=new Set(['actionmovies:Achilles','actionmovies:Conan','actionmovies:The Bride (Beatrix Kiddo)','actionmovies:Rama','mcu:Iron Man']);
 const rec=(id,continuity)=>({id,continuity,summary:'A documented fighter whose combat record comes from one film.',offense:{domains:['melee']},defense:{mechanisms:['armor']},weaknesses:['not established'],sources:[{url:'https://en.wikipedia.org/wiki/Troy_(film)',supports:'Plot summary of the film describing the character'}],researchStatus:'provisional'});
 const errs=(id,c)=>pipe.checkBatch('x.json',{batchId:'Film continuity check',schemaVersion:1,characters:[rec(id,c)]},roster,undefined,films);
 // Correct film versions pass, including punctuation and abbreviation differences.
 assert.deepEqual(errs('actionmovies:Achilles','Troy (2004 film), directed by Wolfgang Petersen'),[]);
 assert.deepEqual(errs('actionmovies:Conan','Conan the Barbarian (1982 film) starring Arnold Schwarzenegger'),[]);
 assert.deepEqual(errs('actionmovies:The Bride (Beatrix Kiddo)','Kill Bill: Vol. 1 (2003 film)'),[]);
 assert.deepEqual(errs('actionmovies:Rama','The Raid (2011 film), released in the US as The Raid: Redemption'),[]);
 // The myth, the comics, and a remake fail.
 assert.match(errs('actionmovies:Achilles','Greek mythology: Homer\'s Iliad and the fall of Troy').join(' '),/say it is the film/);
 assert.match(errs('actionmovies:Achilles','Homer\'s Iliad (epic poem), Trojan War cycle').join(' '),/name the roster film "Troy"/);
 assert.match(errs('actionmovies:Conan','Robert E. Howard stories and Marvel comics').join(' '),/name the roster film "Conan the Barbarian"/);
 assert.match(errs('actionmovies:Conan','Conan the Barbarian (2011 film) starring Jason Momoa').join(' '),/year .*1982/);
 // Other pools are untouched by the film rule.
 assert.deepEqual(errs('mcu:Iron Man','MCU motion pictures (Iron Man through Endgame)'),[]);
 // Without the film map (the pinned tick validator calls checkBatch with four arguments) nothing changes.
 assert.deepEqual(pipe.checkBatch('x.json',{batchId:'Film continuity check',schemaVersion:1,characters:[rec('actionmovies:Achilles','Greek mythology and the Iliad')]},roster),[]);
});
test('every Action Movies film yields a usable title key',()=>{
 const {loadGame,RESEARCH_EXTRA_POOL_IDS}=require('../tools/ability-audit-lib.cjs');
 const films=pipe.filmAnchors(loadGame({extraPools:RESEARCH_EXTRA_POOL_IDS}));
 for(const [id,f] of films){
  assert.ok(f.keys.length&&f.keys.every(k=>k.trim().length>=3),id+' has a weak film key');
  // The roster's own title, written as a film, always passes its own check.
  const c=f.title+' ('+(f.year?f.year+' ':'')+'feature film)';
  assert.deepEqual(pipe.checkBatch('x.json',{batchId:'Film key self-check',schemaVersion:1,characters:[{id,continuity:c,summary:'A documented fighter whose combat record comes from one film.',offense:{domains:['melee']},defense:{mechanisms:['armor']},weaknesses:['not established'],sources:[{url:'https://en.wikipedia.org/wiki/Film',supports:'Plot summary of the film describing the character'}],researchStatus:'provisional'}]},new Set([id]),undefined,films),[],id+': '+c);
 }
});

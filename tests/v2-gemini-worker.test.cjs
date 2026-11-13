'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const w=require('../tools/v2-gemini-worker.cjs');
const pipe=require('../tools/v2-research-pipeline.cjs');
const res=(status,body,type='application/json')=>({status,ok:status<300,json:async()=>body,text:async()=>typeof body==='string'?body:JSON.stringify(body),headers:{get:()=>type}});

test('prompt carries exact ids and separates forms',()=>{
 const p=w.buildPrompt(['dc:Batman','dc:Batman|Hellbat Armor Batman']);
 assert.match(p,/"dc:Batman"/);assert.match(p,/"Hellbat Armor Batman" form\/version of Batman/);assert.match(p,/Never invent or guess URLs/);
});
test('callGemini requests schema-constrained JSON and parses it',async()=>{
 let sent;const out=await w.callGemini({apiKey:'k',prompt:'x',fetchImpl:async(url,opt)=>{sent={url,opt};return res(200,{candidates:[{content:{parts:[{text:'{"characters":[]}'}]}}]});}});
 assert.deepEqual(out,{characters:[]});
 const body=JSON.parse(sent.opt.body);assert.equal(body.generationConfig.responseMimeType,'application/json');assert.ok(body.generationConfig.responseSchema.properties.characters);
 assert.equal(sent.opt.headers['x-goog-api-key'],'k');assert.ok(!sent.url.includes('key='),'key never in URL/logs');
});
test('daily quota stops, per-minute limit backs off, bad request is fatal',async()=>{
 const daily={error:{message:'Quota exceeded',details:[{'@type':'type.googleapis.com/google.rpc.QuotaFailure',violations:[{quotaId:'GenerateRequestsPerDayPerProjectPerModel-FreeTier'}]}]}};
 await assert.rejects(w.callGemini({apiKey:'k',prompt:'x',fetchImpl:async()=>res(429,daily)}),e=>e instanceof w.QuotaError&&e.daily);
 const minute={error:{message:'slow down',details:[{'@type':'type.googleapis.com/google.rpc.RetryInfo',retryDelay:'37s'}]}};
 await assert.rejects(w.callGemini({apiKey:'k',prompt:'x',fetchImpl:async()=>res(429,minute)}),e=>e instanceof w.QuotaError&&!e.daily&&e.retryMs===37000);
 await assert.rejects(w.callGemini({apiKey:'k',prompt:'x',fetchImpl:async()=>res(404,{error:{message:'model not found'}})}),w.FatalError);
 await assert.rejects(w.callGemini({apiKey:'',prompt:'x'}),w.FatalError);
});
test('source check drops dead pages and pages that never name the character',async()=>{
 assert.equal((await w.checkSource('https://x.test/a','dc:Bane',async()=>res(404,'nope','text/html'))).keep,false);
 assert.equal((await w.checkSource('https://x.test/a','dc:Bane',async()=>res(200,'<p>Bane broke the Bat</p>','text/html'))).keep,true);
 assert.equal((await w.checkSource('https://x.test/a','dc:Bane',async()=>res(200,'<p>Something else</p>','text/html'))).keep,false);
 assert.equal((await w.checkSource('https://x.test/a','dc:Bane',async()=>res(403,'blocked','text/html'))).note.includes('not machine-checkable'),true);
 assert.equal((await w.checkSource('https://x.test/a','dc:Bane',async()=>{throw Object.assign(Error('t'),{name:'TimeoutError'});})).keep,false);
});
test('normalize forces provisional, remaps feat sources, drops unsourced and stray records',async()=>{
 const known=new Set(['dc:Bane','dc:Batman','dc:Batman|Hellbat Armor Batman']);
 const good={id:'dc:Bane',continuity:'Mainline DC Comics, Knightfall era',summary:'Venom-enhanced strongman and tactician.',offense:{domains:['physical'],techniques:['backbreaker']},defense:{mechanisms:['Venom-boosted toughness']},weaknesses:['Venom dependence'],
  sources:[{url:'https://dead.test/x',supports:'Nothing that survives the check'},{url:'https://ok.test/bane',supports:'Knightfall and the broken back'}],
  feats:[{claim:'Broke Batman\'s back',citation:'Batman #497',source:1},{claim:'Dead-linked feat',citation:'?',source:0}],researchStatus:'reviewed',reviewedBy:'the model itself',numericTier:9};
 const variantNoDiff={id:'dc:Batman|Hellbat Armor Batman',continuity:'Mainline DC Comics, Hellbat suit',summary:'Batman in the Hellbat armor built with the League.',offense:{domains:['tech']},defense:{mechanisms:['armor']},weaknesses:['short operating time'],sources:[{url:'https://ok.test/hellbat',supports:'Hellbat suit capabilities'}]};
 const unsourced={id:'dc:Batman',continuity:'Mainline DC Comics',summary:'World-class detective and martial artist.',offense:{domains:['physical']},defense:{mechanisms:['armor']},weaknesses:['human'],sources:[{url:'https://dead.test/y',supports:'Gone'}]};
 const stray={...good,id:'mcu:Not Requested'};
 const checkUrl=async u=>u.startsWith('https://dead')?{keep:false,note:'HTTP 404'}:{keep:true,note:'ok'};
 const out=await w.normalize({characters:[good,variantNoDiff,unsourced,stray]},['dc:Bane','dc:Batman','dc:Batman|Hellbat Armor Batman'],{checkUrl,checkBatch:pipe.checkBatch,known});
 assert.deepEqual(out.characters.map(c=>c.id),['dc:Bane']);
 const b=out.characters[0];
 assert.equal(b.researchStatus,'provisional');assert.equal(b.reviewedBy,undefined);assert.equal(b.numericTier,undefined);
 assert.deepEqual(b.sources.map(s=>s.url),['https://ok.test/bane']);
 assert.deepEqual(b.feats,[{claim:'Broke Batman\'s back',citation:'Batman #497',source:0}]);
 assert.match(b.unknowns.join(),/Unverified.*Dead-linked feat/);
 assert.deepEqual(out.dropped.map(d=>d.id).sort(),['dc:Batman','dc:Batman|Hellbat Armor Batman']);
 assert.match(out.dropped.find(d=>d.id==='dc:Batman|Hellbat Armor Batman').why,/formDifferences/);
 assert.ok(out.flags.some(f=>f.includes('dead.test')));
});
test('a normalized record passes the batch validator and is offered to nobody else',async()=>{
 const a=pipe.audit();const ids=pipe.nextBatch(a,2).ids;assert.equal(ids.length,2);
 const again=pipe.nextBatch(a,2,new Set(ids));assert.ok(again.ids.every(id=>!ids.includes(id)));
});
test('snapshot round-trips and rejects malformed or hostile data',()=>{
 const snap=pipe.snapshot({ids:['dc:Bane','dc:Batman|Hellbat Armor Batman'],records:new Map([['dc:Bane',{file:'dc-batch-01.json',status:'provisional'}]]),errors:[]});
 const a=pipe.fromSnapshot(JSON.parse(JSON.stringify(snap)));
 assert.deepEqual(a.ids,['dc:Bane','dc:Batman|Hellbat Armor Batman']);assert.equal(a.records.get('dc:Bane').file,'dc-batch-01.json');
 assert.throws(()=>pipe.fromSnapshot({...snap,schemaVersion:2}),/bad shape/);
 assert.throws(()=>pipe.fromSnapshot({...snap,ids:['no-colon']}),/bad identity/);
 assert.throws(()=>pipe.fromSnapshot({...snap,records:[{id:'dc:Bane',file:'../../.github/workflows/x.yml'}]}),/bad record/);
 assert.throws(()=>pipe.fromSnapshot({...snap,ids:[{toString(){return 'dc:x'}}]}),/bad identity/);
});
test('privileged tick never shells out to git or executes branch code when given a snapshot',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const src=fs.readFileSync(path.join(__dirname,'../tools/v2-research-tick.cjs'),'utf8');
 assert.doesNotMatch(src,/execFileSync\('git'|\bgit\(\[/);
 const tick=require('../tools/v2-research-tick.cjs');
 const tmp=path.join(require('node:os').tmpdir(),'da-snap-'+process.pid+'.json');
 fs.writeFileSync(tmp,JSON.stringify(pipe.snapshot({ids:['dc:Bane'],records:new Map(),errors:[]})));
 const orig=pipe.audit;pipe.audit=()=>{throw Error('audit must not run with --snapshot');};
 try{assert.deepEqual(tick.state(['generate','--snapshot',tmp]).ids,['dc:Bane']);}finally{pipe.audit=orig;fs.unlinkSync(tmp);}
});

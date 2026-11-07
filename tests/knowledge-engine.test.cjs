const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const client=fs.readFileSync(path.join(__dirname,'../data/knowledge-engine.js'),'utf8');

function environment(options={}){
  const cache=new Map(options.cache||[]);
  const localStorage={
    getItem:key=>cache.get(key)||null,
    setItem:(key,value)=>cache.set(key,String(value))
  };
  const calls=[];
  const response=(status,body)=>({ok:status>=200&&status<300,status,json:async()=>body});
  const fetch=async (url,opts={})=>{
    calls.push({url,opts});
    if(opts.method==='POST')return response(options.postStatus||200,options.ruling||{status:'inconclusive',rationale:'More evidence needed',sources:[]});
    if(String(url).includes('my_reviews'))return response(200,{reviews:options.reviewStatuses||[]});
    return response(options.getStatus||200,{facts:options.facts||[],research_ready:options.researchReady!==false});
  };
  const auth={getSession:async()=>({data:{session:{access_token:'fake-auth-session'}}}),
    signInAnonymously:async()=>({data:{session:{access_token:'fake-anonymous-session'}},error:null})};
  const window={DA_SUPA:{url:'https://project.supabase.co',key:'sb_publishable_example'},
    supabase:{createClient:()=>({auth})}};
  const context={window,localStorage,fetch,Date,JSON,Map,Error,Set,Object,String,Promise};
  vm.runInNewContext(client+'\nthis.engine=KnowledgeEngine;',context);
  return {engine:context.engine,calls,cache};
}
const katara={pool:'toons',n:'Katara'},sameNameOtherPool={pool:'mcu',n:'Katara'};
test('approved global facts are fetched and scoped to the exact universe/name',async()=>{
  const e=environment({facts:[{pool:'toons',name:'Katara',tag:'healing',feat:'Waterbending healing'}]});
  assert.equal(await e.engine.load(),true);
  assert.equal(e.engine.has(katara,'healing'),true);
  assert.equal(e.engine.kind(katara,'healing'),'approved');
  assert.equal(e.engine.has(sameNameOtherPool,'healing'),false);
  assert.equal(e.engine.has(katara,'flight'),false);
  assert.equal(e.calls.length,1);
  assert.equal(await e.engine.load(),true);
  assert.equal(e.calls.length,1,'Repeated checks should reuse the in-memory cache');
});
test('sourced provisional rulings are stored locally and never inserted into global facts',async()=>{
  const e=environment({ruling:{status:'accepted_provisional',dispute_id:'99999999-9999-4999-8999-999999999999',
    rationale:'Canonical waterbending healer',feat:'Heals Aang',sources:['https://nick.com/katara']}});
  const result=await e.engine.challenge(katara,'healing','Katara healed Aang');
  assert.equal(result.status,'accepted_provisional');
  assert.equal(e.engine.has(katara,'healing'),true);
  assert.equal(e.engine.kind(katara,'healing'),'provisional');
  assert.equal(e.engine.status().count,0,'A provisional ruling is not globally approved');
  assert.ok(e.cache.get('da.knowledge.provisional.v1')?.includes('99999999'));
  assert.equal(e.calls.find(c=>c.opts.method==='POST')?.opts.headers.Authorization,'Bearer fake-auth-session');
  const afterReload=environment({cache:[...e.cache]});
  assert.equal(afterReload.engine.has(katara,'healing'),true,'Local ruling should survive reload');
  assert.equal(afterReload.engine.has(sameNameOtherPool,'healing'),false);
});
test('inconclusive and rejected challenges never change eligibility',async()=>{
  for(const status of ['rejected','inconclusive']){
    const e=environment({ruling:{status,dispute_id:'88888888-8888-4888-8888-888888888888',rationale:'Insufficient proof',sources:[]}});
    await e.engine.challenge(katara,'healing');
    assert.equal(e.engine.has(katara,'healing'),false);
    assert.equal(e.engine.status().count,0);
  }
});
test('server outage retains the claim as a local pending draft',async()=>{
  const e=environment({postStatus:503,ruling:{error:'Research temporarily unavailable'}});
  await assert.rejects(e.engine.challenge(katara,'healing','healed Aang'));
  assert.equal(e.engine.has(katara,'healing'),false);
  assert.equal(e.engine.history()[0].status,'pending_local');
  assert.ok(e.cache.get('da.knowledge.dispute-drafts.v1')?.includes('healed Aang'));
});
test('no secret keys are present in browser source',()=>{
  assert.ok(!/OPENAI_API_KEY\s*=|sk-[A-Za-z0-9]{20}/.test(client));
  assert.ok(!/SUPABASE_SERVICE_ROLE_KEY\s*=/.test(client));
});

test('moderator rejection of a provisional dispute revokes its persisted local override',async()=>{
  const id='99999999-9999-4999-8999-999999999999';
  const first=environment({ruling:{status:'accepted_provisional',dispute_id:id,rationale:'Temporary test acceptance',sources:['https://www.nick.com']}});
  await first.engine.challenge(katara,'healing');
  assert.equal(first.engine.has(katara,'healing'),true);
  const second=environment({cache:[...first.cache],reviewStatuses:[{id,status:'rejected'}]});
  assert.equal(await second.engine.load(),true);
  assert.equal(second.engine.has(katara,'healing'),false);
  assert.equal(second.engine.kind(katara,'healing'),null);
});

test('unconfigured research saves evidence locally without calling paid API',async()=>{
 const e=environment({researchReady:false});
 await assert.rejects(e.engine.challenge(katara,'healing','Waterbending heals injuries'),/Live research is not activated yet/);
 assert.ok(e.cache.get('da.knowledge.dispute-drafts.v1')?.includes('Waterbending heals injuries'));
 assert.equal(e.calls.filter(c=>c.opts.method==='POST').length,0,'Offline status must not trigger paid API requests');
});

test('a saved offline dispute is available with its original explanation and source for retry',async()=>{
 const e=environment({researchReady:false});
 await assert.rejects(e.engine.challenge(katara,'healing','She healed Aang','https://avatar.fandom.com/wiki/Healing'));
 const saved=e.engine.latestDraft(katara,'healing');
 assert.equal(saved?.claim,'She healed Aang');
 assert.equal(saved?.source_url,'https://avatar.fandom.com/wiki/Healing');
 const reload=environment({cache:[...e.cache],researchReady:true});
 assert.equal(reload.engine.latestDraft(katara,'healing')?.claim,'She healed Aang');
 assert.equal(reload.engine.latestDraft(sameNameOtherPool,'healing'),null);
});

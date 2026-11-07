/* AI Character Knowledge Engine — user-side cache and dispute workflow.
   All paid research happens on a server; API credentials NEVER belong here.
   Global facts are authoritative only after moderator approval. */
const KnowledgeEngine = (() => {
  const PRIVATE_KEY='da.knowledge.provisional.v1';
  const DRAFT_KEY='da.knowledge.dispute-drafts.v1';
  const MAX_AGE=30*864e5;
  const read=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key));return v&&typeof v==='object'?v:fallback;}catch{return fallback;}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
  const facts=new Map();
  const provisional=new Map();
  const draftHistory=read(DRAFT_KEY,[]);
  const saved=read(PRIVATE_KEY,{});
  for(const [key,record] of Object.entries(saved)){
    if(record?.at && Date.now()-record.at<MAX_AGE && record?.disputeId)provisional.set(key,record);
  }
  const keyOf=(candidate,tag)=>candidate?.pool+':'+candidate?.n+'|'+tag;
  let state='idle',loaded=false,inFlight=null,client=null,error='';
  const endpoint=()=>window.DA_SUPA?.url?window.DA_SUPA.url.replace(/\/$/,'')+'/functions/v1/character-knowledge':null;
  const headers=()=>({'apikey':window.DA_SUPA?.key||'','Content-Type':'application/json'});
  function has(candidate,tag){const key=keyOf(candidate,tag);return facts.has(key)||provisional.has(key);}
  function kind(candidate,tag){const key=keyOf(candidate,tag);return facts.has(key)?'approved':provisional.has(key)?'provisional':null;}
  function rememberProvisional(candidate,tag,disputeId){
    const entry={at:Date.now(),disputeId};
    provisional.set(keyOf(candidate,tag),entry);
    write(PRIVATE_KEY,Object.fromEntries(provisional));
  }
  async function load(){
    if(loaded)return state==='ready';
    if(inFlight)return inFlight;
    if(!endpoint()){state='unavailable';error='Supabase is not configured.';return false;}
    state='loading';
    inFlight=(async()=>{
      try{
        const response=await fetch(endpoint()+'?action=approved',{headers:headers()});
        if(!response.ok)throw new Error('Knowledge service unavailable (HTTP '+response.status+').');
        const data=await response.json();
        if(!Array.isArray(data.facts))throw new Error('Invalid knowledge service response.');
        facts.clear();
        for(const fact of data.facts){
          if(typeof fact.pool==='string'&&typeof fact.name==='string'&&typeof fact.tag==='string')
            facts.set(fact.pool+':'+fact.name+'|'+fact.tag,fact);
        }
        loaded=true;state='ready';error='';
        return true;
      }catch(e){state='unavailable';error=e.message||'Knowledge service unavailable.';return false;}
      finally{inFlight=null;}
    })();
    return inFlight;
  }
  async function authenticatedToken(){
    if(!window.supabase?.createClient)throw new Error('Supabase Auth is unavailable.');
    if(!client)client=window.supabase.createClient(window.DA_SUPA.url,window.DA_SUPA.key,{
      auth:{persistSession:true,autoRefreshToken:true,storageKey:'da-knowledge-user'}
    });
    let {data:{session}}=await client.auth.getSession();
    if(!session?.access_token){
      const result=await client.auth.signInAnonymously();
      if(result.error)throw new Error('Anonymous sign-in must be enabled in Supabase before AI challenges can run: '+result.error.message);
      session=result.data.session;
    }
    if(!session?.access_token)throw new Error('Could not establish a secure review session.');
    return session.access_token;
  }
  async function challenge(candidate,tag,claim='',sourceUrl=''){
    if(!candidate?.pool||!candidate?.n||!tag)throw new Error('Missing character or challenge.');
    if(!endpoint())throw new Error('AI research service has not been configured.');
    const input={pool:candidate.pool,name:candidate.n,tag,claim:String(claim).slice(0,700),source_url:String(sourceUrl).slice(0,500)};
    const draft={...input,createdAt:new Date().toISOString(),status:'pending_local'};
    draftHistory.unshift(draft);
    if(draftHistory.length>40)draftHistory.length=40;
    write(DRAFT_KEY,draftHistory);
    try{
      const token=await authenticatedToken();
      const response=await fetch(endpoint(),{method:'POST',headers:{...headers(),Authorization:'Bearer '+token},body:JSON.stringify({action:'dispute',...input})});
      const body=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(body.error||('Research failed (HTTP '+response.status+').'));
      if(!['approved','accepted_provisional','rejected','inconclusive'].includes(body.status))
        throw new Error('Research service returned an unexpected ruling.');
      draft.status=body.status;draft.disputeId=body.dispute_id||null;draft.rationale=body.rationale||'';
      write(DRAFT_KEY,draftHistory);
      if(body.status==='accepted_provisional'&&body.dispute_id)rememberProvisional(candidate,tag,body.dispute_id);
      if(body.status==='approved'){
        facts.set(keyOf(candidate,tag),{pool:candidate.pool,name:candidate.n,tag,sources:body.sources||[]});
        loaded=true;state='ready';
      }
      return body;
    }catch(e){draft.status='pending_local';draft.error=e.message;write(DRAFT_KEY,draftHistory);throw e;}
  }
  function clearProvisional(candidate,tag){
    provisional.delete(keyOf(candidate,tag));write(PRIVATE_KEY,Object.fromEntries(provisional));
  }
  return {has,kind,load,challenge,clearProvisional,history:()=>draftHistory.slice(),status:()=>({state,error,count:facts.size,pending:draftHistory.filter(d=>d.status==='pending_local').length})};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=KnowledgeEngine;

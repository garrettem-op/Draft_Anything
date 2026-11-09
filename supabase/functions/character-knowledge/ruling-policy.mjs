// Shared decision policy for provisional eligibility. This never grants permanent
// knowledge: confirmed facts still require a separate audited moderator approval.
//
// The LLM's verdict is only one input. Citations must be real URLs encountered in
// its web-search response, tied to a concrete feat and the named continuity.
// Two independent sources can support a SINGLE-PLAYER provisional exception even
// when a primary document is mirrored outside its publisher's official domain.
export function evaluateAbilityEvidence({verdict,confidence,feat,cited},isOfficial=(_host)=>false){
  const sources=[...new Set((Array.isArray(cited)?cited:[]).filter(u=>{
    try{const x=new URL(u);return x.protocol==='https:'&&!!x.hostname;}catch{return false;}
  }))];
  const domains=new Set(sources.map(u=>new URL(u).hostname.toLowerCase().replace(/^www\./,'')));
  const official=sources.some(u=>isOfficial(new URL(u).hostname.toLowerCase().replace(/^www\./,'')));
  const score=Math.max(0,Math.min(1,Number(confidence)||0));
  const documented=typeof feat==='string'&&feat.trim().length>=18;
  if(verdict==='does_not_support')return {status:'rejected',reason:'The research did not establish the claimed ability for this version of the character.'};
  if(verdict!=='supports')return {status:'inconclusive',reason:'The research could not establish a qualifying ability. This ruling remains open for human review.'};
  if(!documented||sources.length===0)return {status:'inconclusive',reason:'The research suggests a qualifying ability but did not provide a sufficiently specific, traceable feat.'};
  // We accept either two independent corroborating sources, or one first-party
  // source with exceptionally strong model confidence. Publisher domain is not a
  // mandatory requirement: official Nintendo/Prima documents can be mirrored.
  if((score>=.85&&domains.size>=2)||(score>=.92&&official)){
    return {status:'accepted_provisional',reason:'Supported by specific, cited evidence. This character is eligible for this single-player Campaign while permanent knowledge awaits review.'};
  }
  if(domains.size<2&&!official)return {status:'inconclusive',reason:'A qualifying feat was found, but only one independent non-official source could be verified. Add a second source or await manual review.'};
  return {status:'inconclusive',reason:'The feat may qualify, but corroboration or confidence is below the provisional-acceptance threshold. It is queued for manual review.'};
}

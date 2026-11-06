/* Derived, deterministic per-outing box scores. No claims of tracked play-by-play. */
function daAllocate(total, weights) {
  const n=Math.max(0,Math.round(Number(total)||0)),sum=weights.reduce((a,b)=>a+b,0);
  if(!weights.length)return [];
  const raw=weights.map(w=>n*(sum>0?w/sum:1/weights.length));
  const out=raw.map(Math.floor),remaining=n-out.reduce((a,b)=>a+b,0);
  const order=raw.map((v,i)=>({i,frac:v-out[i]})).sort((a,b)=>b.frac-a.frac||a.i-b.i);
  for(let j=0;j<remaining;j++)out[order[j%order.length].i]++;
  return out;
}
function daBoxScore(sport,score,points,seed) {
  const rows=(score?.rows||[]).filter(r=>r.cand);
  const active=rows.filter(r=>!r.pos.coach&&!r.pos.bench);
  const weights=active.map(r=>Math.max(1,(r.fit||50)*(r.pos.imp||1)));
  const total=Math.max(0,Math.round(Number(points)||0));
  const main=daAllocate(total,weights);
  const extra=(factor,shift=0)=>daAllocate(Math.max(0,Math.round(total*factor)),active.map((r,i)=>Math.max(1,(r.cand.a?.[(i+shift)%12]||50)*Math.max(.2,r.pos.imp||1))));
  const aux=extra(.42,2),aux2=extra(.26,7),aux3=extra(.12,8);
  return rows.map(r=>{
    const i=active.indexOf(r),support=i<0,fit=Math.round(r.fit||0);
    let stats=[];
    if(sport==='basketball')stats=support?[['Team boost',Math.max(0,Math.round((fit-50)/10))]]:[['PTS',main[i]],['REB',aux[i]],['AST',aux2[i]],['STL',aux3[i]]];
    else if(sport==='football')stats=support?[['Team boost',Math.max(0,Math.round((fit-50)/10))]]:[['Points contributed',main[i]],['YDS',aux[i]*5],['TD',Math.floor(main[i]/7)],['TACK',aux2[i]],['SACK',Math.floor(aux3[i]/3)]];
    else if(sport==='brawl')stats=support?[['Buff',Math.max(0,Math.round((fit-50)/8))]]:[['Damage dealt',main[i]*12],['Absorbed',aux[i]*16],['Mitigated',aux2[i]*8],['Elims',Math.floor(aux3[i]/4)]];
    else if(sport==='soccer'||sport==='hockey')stats=support?[['Team boost',Math.max(0,Math.round((fit-50)/10))]]:[['Goals',main[i]],['Assists',aux2[i]]];
    else if(sport==='baseball')stats=support?[['Team boost',Math.max(0,Math.round((fit-50)/10))]]:[['Runs',main[i]],['Hits',aux[i]],['RBI',aux2[i]]];
    else stats=support?[['Team boost',Math.max(0,Math.round((fit-50)/10))]]:[['Scoring share',main[i]],['Key plays',aux2[i]]];
    return {name:r.cand.n,role:r.pos.ab,fit,stats,support};
  });
}
function daReport(sport,score,points,title) {
  if(!score?.rows)return '';
  const data=daBoxScore(sport,score,points,title);
  const best=data.filter(r=>!r.support).sort((a,b)=>b.fit-a.fit)[0];
  return `<div class="panel" style="padding:14px;margin-top:14px"><div class="sec"><h3 class="h">${esc(title||'After-action report')}</h3><span class="note">Simulated estimates · ratings-based allocation</span></div>
  <div class="tbl-wrap"><table class="t"><thead><tr><th>Character</th><th>Role</th><th>Fit</th><th>Contributions</th></tr></thead><tbody>${data.map(r=>`<tr><td>${esc(r.name)}</td><td>${esc(r.role)}</td><td class="num">${r.fit}</td><td>${r.stats.map(([k,v])=>`${esc(k)}: <b class="num">${v}</b>`).join(' · ')}</td></tr>`).join('')}</tbody></table></div>
  <p class="note" style="margin:10px 0 0">${best?'Top positional fit: '+esc(best.name)+'. ':''}Figures distribute the simulated result using positional fit and existing attributes; they are not tracked in-game events. Non-scoring estimates are indicative only.</p></div>`;
}
function daGameReport(sport,teamA,teamB,game,teamIndex) {
  if(!game||!teamA?.score||!teamB?.score)return '';
  const winning=game.w===game.a?game.a:game.w===game.b?game.b:null;
  if(winning==null)return '';
  const aPts=game.w===game.a?game.line[0]:game.line[1],bPts=game.w===game.b?game.line[0]:game.line[1];
  return daReport(sport,teamA.score,aPts,teamA.name)+daReport(sport,teamB.score,bPts,teamB.name);
}

/* Ratings-based simulated per-outing reports. Event values are estimates, not logged play-by-play. */
function daAllocate(total, weights) {
  const count=Math.max(0,Math.floor(Number(total)||0));
  if(!weights.length)return [];
  const safe=weights.map(w=>Number.isFinite(w)&&w>0?w:0),sum=safe.reduce((a,b)=>a+b,0);
  const raw=safe.map(w=>sum?count*w/sum:count/safe.length);
  const values=raw.map(Math.floor);
  let left=count-values.reduce((a,b)=>a+b,0);
  const order=raw.map((x,i)=>({i,f:x-values[i]})).sort((a,b)=>b.f-a.f||a.i-b.i);
  for(let j=0;j<left;j++)values[order[j%order.length].i]++;
  return values;
}

function daHash(value) {
  let h=2166136261;
  for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}
  return ((h>>>0)%10001)/10000;
}

function daFootballBreakdown(points) {
  const total=Math.max(0,Math.floor(Number(points)||0));
  for(let td=Math.floor(total/7);td>=0;td--) {
    let rem=total-7*td;
    for(let fg=Math.floor(rem/3);fg>=0;fg--) {
      const rest=rem-3*fg;
      if(rest%2===0)return {td,fg,safeties:rest/2,unassigned:0,total};
    }
  }
  return {td:0,fg:0,safeties:0,unassigned:total,total};
}

function daVolleyballPoints(setsWon,note,side) {
  const pairs=[...String(note||'').matchAll(/(\d+)-(\d+)/g)];
  if(pairs.length)return pairs.reduce((sum,m)=>sum+Number(m[side===1?2:1]),0);
  return Math.max(0,Math.round(Number(setsWon)||0))*25;
}

function daBoxScore(sport,score,points,seed='',options={}) {
  const entries=(score?.rows||[]).filter(r=>r.cand).map(r=>({
    id:r.cand.id,name:r.cand.n,role:r.pos.ab,position:r.pos.id,fit:Math.round(r.fit||0),
    active:!r.pos.coach&&!r.pos.bench,attrs:r.cand.a||[],imp:r.pos.imp||.8,
    stats:[],impact:0,delta:0
  }));
  const attrs=['spd','agi','str','siz','lep','end','tch','acc','ref','iq','clu','ldr'];
  const val=(r,k)=>r.attrs[attrs.indexOf(k)]||50;
  const pulse=r=>.81+.38*daHash(seed+':'+r.id+':'+r.position);
  for(const r of entries){r.impact=Math.max(0,Math.round(r.fit*pulse(r)));r.delta=r.impact-r.fit;}
  const active=entries.filter(r=>r.active);
  function metric(label,total,eligible,weight,salt) {
    const candidates=active.filter(eligible||(()=>true));
    if(!candidates.length)return 0;
    const recipients=candidates;
    const allocation=daAllocate(total,recipients.map(r=>Math.max(.01,(weight?weight(r):r.fit)*pulse(r))));
    recipients.forEach((r,i)=>r.stats.push([label,allocation[i]]));
    return allocation.reduce((a,b)=>a+b,0);
  }
  function only(ids){return r=>ids.includes(r.position);}
  const total=Math.max(0,Math.round(Number(points)||0));
  const summary={sport,teamPoints:total};
  switch(sport) {
    case 'basketball': {
      const offense=r=>((val(r,'acc')*1.6+val(r,'tch')+val(r,'clu'))/3.6)*({pg:1.12,sg:1.40,sf:1.20,pf:.98,c:1.03}[r.position]||1);
      metric('PTS',total,null,offense,'pts');
      metric('REB',Math.round(35+total*.12),null,r=>val(r,'siz')*.5+val(r,'str')*.3+val(r,'lep')*.2+({c:70,pf:45,sf:16,pg:0,sg:0}[r.position]||0),'reb');
      metric('AST',Math.round(total*.22),null,r=>val(r,'iq')+val(r,'tch')+({pg:130,sg:35,sf:20,c:10}[r.position]||0),'ast');
      metric('STL',Math.max(1,Math.round(total*.062)),null,r=>val(r,'ref')+val(r,'agi'),'stl');
      metric('BLK',Math.max(1,Math.round(total*.043)),null,r=>val(r,'siz')+val(r,'lep')+({c:90,pf:65}[r.position]||0),'blk');
      metric('TOV',Math.max(1,Math.round(total*.105)),null,r=>val(r,'tch')+({pg:40,sg:25}[r.position]||0),'tov');
      break;
    }
    case 'football': {
      const b=daFootballBreakdown(total);
      summary.scoring=b;
      const receiving=only(['wr1','wr2','slot','te']),runner=only(['rb','qb']);
      const skill=only(['qb','rb','wr1','wr2','slot','te']);
      summary.unassignedTD=b.td?0:0;
      const assignedTD=metric('TD',b.td,skill,r=>val(r,'spd')+val(r,'tch')+({rb:85,wr1:60,wr2:50,te:35,slot:45,qb:18}[r.position]||0),'td');
      summary.unassignedTD=b.td-assignedTD;
      metric('Pass YDS',Math.round(145+total*5),only(['qb']),r=>val(r,'acc')+val(r,'iq'),'pass');
      metric('Rush YDS',Math.round(55+total*2.7),runner,r=>val(r,'spd')+val(r,'agi')+({rb:90,qb:5}[r.position]||0),'rush');
      metric('Rec YDS',Math.round(145+total*5),receiving,r=>val(r,'tch')+val(r,'spd')+({wr1:40,wr2:30,slot:25,te:20}[r.position]||0),'rec');
      const defense=only(['de1','de2','dt1','dt2','olb1','olb2','mlb','cb1','cb2','fs','ss']);
      const pressure=only(['de1','de2','dt1','dt2','olb1','olb2','mlb']);
      const coverage=only(['cb1','cb2','fs','ss','olb1','olb2','mlb']);
      metric('TACK',Math.round(37+total*.15),defense,r=>val(r,'ref')+val(r,'str')+({mlb:55,olb1:25,olb2:25}[r.position]||0),'tack');
      metric('SACK',Math.max(0,Math.min(5,Math.round((score.rating||70)/28))),pressure,r=>val(r,'str')+val(r,'spd')+({de1:50,de2:50}[r.position]||0),'sack');
      metric('INT',Math.max(0,Math.min(3,Math.round((score.rating||70)/68))),coverage,r=>val(r,'ref')+val(r,'iq')+({cb1:45,cb2:45,fs:35,ss:25}[r.position]||0),'int');
      break;
    }
    case 'brawl': {
      const tank=only(['tk1','tk2']),dps=only(['d1','d2','d3']);
      metric('KOs',total,null,r=>(r.position.startsWith('d')?2.4:1)*val(r,'str'),'kos');
      metric('DMG',total*210+350,null,r=>val(r,'str')+val(r,'acc')+val(r,'spd')+({d1:145,d2:145,d3:145,tk1:20,tk2:20}[r.position]||0),'dmg');
      metric('ABS',Math.round(430+Math.max(0,Number(options.opponentPoints)||0)*85),tank,r=>val(r,'end')+val(r,'siz')+val(r,'str'),'abs');
      metric('MIT',Math.round(110+total*18),tank,r=>val(r,'end')+val(r,'ref'),'mit');
      break;
    }
    case 'soccer':case 'hockey': {
      const scorer=sport==='soccer'?r=>!['gk','lb','rb','lcb','rcb'].includes(r.position):r=>r.position!=='g';
      const w=r=>val(r,'acc')+val(r,'spd')+({st:120,lw:75,rw:75,c:75}[r.position]||0);
      metric('G',total,scorer,w,'goals');
      metric('A',Math.round(total*(sport==='soccer'?.8:1.5)),r=>!['gk','g'].includes(r.position),r=>val(r,'iq')+val(r,'tch'),'assists');
      metric(sport==='soccer'?'SAVES':'SV',sport==='soccer'?4:29,r=>['gk','g'].includes(r.position),r=>val(r,'ref'),'saves');
      break;
    }
    case 'baseball': {
      const bats=r=>r.position!=='p';
      metric('R',total,bats,r=>val(r,'spd')+val(r,'tch'),'runs');
      metric('H',Math.round(4+total*.95),bats,r=>val(r,'tch')+val(r,'acc'),'hits');
      metric('RBI',Math.max(0,total-1),bats,r=>val(r,'acc')+val(r,'str'),'rbi');
      metric('K',Math.round(5+(score.rating||70)/16),only(['p']),r=>val(r,'acc')+val(r,'str'),'strikeouts');
      break;
    }
    case 'volleyball': {
      const estimatedPoints=daVolleyballPoints(total,options.note,options.side||0);
      summary.teamRallyPoints=estimatedPoints;
      metric('KILLS',Math.round(estimatedPoints*.51),r=>['oh1','oh2','mb1','mb2','opp','s'].includes(r.position),r=>val(r,'str')+val(r,'lep')+({oh1:65,opp:60,oh2:50,mb1:38,mb2:38}[r.position]||0),'kills');
      metric('AST',Math.round(estimatedPoints*.46),only(['s']),r=>val(r,'acc')+val(r,'iq'),'assists');
      metric('DIG',Math.round(estimatedPoints*.54),null,r=>val(r,'ref')+val(r,'agi')+({lib:120,oh2:45,oh1:25}[r.position]||0),'digs');
      metric('BLK',Math.round(estimatedPoints*.075),null,r=>val(r,'siz')+val(r,'lep')+({mb1:95,mb2:95,opp:40}[r.position]||0),'blocks');
      metric('ACE',Math.round(estimatedPoints*.05),null,r=>val(r,'acc')+val(r,'str'),'aces');
      break;
    }
    default:metric('Scoring',total,null,r=>r.fit,'scoring');
  }
  entries.forEach(r=>{
    if(!r.active)r.stats.push([r.position==='cmd'?'Leadership impact':r.position==='hc'||r.position==='mgr'?'Coaching impact':'Bench impact',Math.max(0,Math.round((r.impact-50)/7))]);
    delete r.attrs;delete r.imp;delete r.active;
  });
  entries.summary=summary;
  return entries;
}

function daReport(sport,score,points,title='',options={}) {
  if(!score?.rows)return '';
  const result=daBoxScore(sport,score,points,options.seed||title,options);
  const active=result.filter(r=>!['hc','mgr','cmd','bn'].includes(r.position));
  const top=[...active].sort((a,b)=>b.delta-a.delta)[0];
  const low=[...active].sort((a,b)=>a.delta-b.delta)[0];
  const scoring=result.summary?.scoring;
  const footer=scoring?`<p class="note">Scoring allocation: ${scoring.td} TD × 7 + ${scoring.fg} FG × 3 + ${scoring.safeties} safeties × 2${scoring.unassigned?' + '+scoring.unassigned+' other':''} = ${scoring.total}. Field goals are team special-teams points; no kicker position exists on this roster.${result.summary.unassignedTD?' '+result.summary.unassignedTD+' touchdown(s) cannot be assigned because this lineup has no eligible scorer.':''}</p>`:
    sport==='volleyball'?`<p class="note">Estimated rally points: ${result.summary.teamRallyPoints}. Kills, blocks and aces are projected from rally totals, not official recorded events.</p>`:'';
  return `<div class="panel" style="padding:14px;margin-top:14px"><div class="sec"><h3 class="h">${esc(title||'After-action report')}</h3><span class="note">Simulated box score · not tracked play-by-play</span></div>
  <div class="tbl-wrap"><table class="t"><thead><tr><th>Character</th><th>Role</th><th>Fit</th><th>Form</th><th>Estimated contributions</th></tr></thead><tbody>${result.map(r=>`<tr><td>${esc(r.name)}</td><td>${esc(r.role)}</td><td class="num">${r.fit}</td><td class="num">${r.impact} (${r.delta>=0?'+':''}${r.delta})</td><td>${r.stats.map(([k,v])=>`${esc(k)}: <b class="num">${v}</b>`).join(' · ')}</td></tr>`).join('')}</tbody></table></div>
  ${footer}<p class="note" style="margin:10px 0 0">${top?'Strongest simulated form vs baseline: '+esc(top.name)+'. ':''}${low&&low!==top?'Below baseline: '+esc(low.name)+'. ':''}Form varies deterministically by matchup; use these as scouting estimates, not observed statistics.</p></div>`;
}

function daGameReport(sport,teamA,teamB,game,seed='') {
  if(!game||!teamA?.score||!teamB?.score||!Array.isArray(game.line))return '';
  const winner=game.w;
  const aPoints=winner===-1?game.line[0]:winner===game.a?game.line[0]:game.line[1];
  const bPoints=winner===-1?game.line[1]:winner===game.b?game.line[0]:game.line[1];
  return daReport(sport,teamA.score,aPoints,teamA.name,{seed:seed+':a',note:game.line[2],side:winner===game.a?0:1,opponentPoints:bPoints})+
    daReport(sport,teamB.score,bPoints,teamB.name,{seed:seed+':b',note:game.line[2],side:winner===game.b?0:1,opponentPoints:aPoints});
}

if(typeof module!=='undefined'&&module.exports)module.exports={daAllocate,daHash,daFootballBreakdown,daVolleyballPoints,daBoxScore,daReport,daGameReport};

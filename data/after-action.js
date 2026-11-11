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
  // New Battle Royale bouts store the actual simulated exchanges. Individual
  // damage and mitigation are sourced from those exchanges, never from KOs.
  if(sport==='brawl'&&Array.isArray(options.combatSide?.fighters)){
    const logs=new Map(options.combatSide.fighters.map(f=>[f.id,f]));
    active.forEach(r=>{
      const log=logs.get(r.id)||{};
      r.stats.push(['DMG',Math.max(0,Math.round(log.dmg||0))]);
      r.stats.push(['KOs',Math.max(0,Math.round(log.kos||0))]);
      if(r.position.startsWith('tk')){
        r.stats.push(['ABS',Math.max(0,Math.round(log.abs||0))]);
        r.stats.push(['MIT',Math.max(0,Math.round(log.mit||0))]);
      }
    });
    summary.combatLogged=true;
  } else switch(sport) {
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
      // Historical results without a combat log can show estimated KOs only.
      // Do not fabricate damage, absorption or mitigation from the final score.
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
      // Calibrated against 50 distinct 2025 men's NCAA/VNL matches (100 team box
      // scores). Actual leading-scorer share: p25 26.4%, median 29.7%, p75
      // 33.3%, p90 36.6%; 17% of teams under 25% and 14% above 35%.
      // data/research/mens-vb-2025-results.json
      const pinRoles=['oh1','oh2','opp'],pins=active.filter(r=>pinRoles.includes(r.position));
      const focusRoll=daHash(seed+':vb:focus'),balanced=focusRoll<.17,dominant=focusRoll>.86;
      // Balanced games spread attempts across three pins and give middles more
      // opportunities. Typical games favor high-volume pins and a featured hitter.
      const roleAttack=balanced
        ? {oh1:1.25,oh2:1.25,opp:1.25,mb1:.70,mb2:.70,s:.10}
        : {oh1:1.55,oh2:1.32,opp:1.68,mb1:.52,mb2:.52,s:.10};
      const focusWeights=pins.map(r=>(roleAttack[r.position]||1)*Math.pow(Math.max(25,r.fit)/70,.8));
      const focusTotal=focusWeights.reduce((sum,w)=>sum+w,0);
      let focusIndex=-1,needle=daHash(seed+':vb:featured')*focusTotal;
      for(let i=0;i<focusWeights.length;i++){needle-=focusWeights[i];if(needle<=0){focusIndex=i;break;}}
      if(focusIndex<0&&pins.length)focusIndex=pins.length-1;
      const featuredId=pins[focusIndex]?.id;
      const usageRoll=daHash(seed+':vb:usage');
      const featureMultiplier=balanced?1.06:focusRoll>.985?2.6:dominant
        ? 1.70+.45*usageRoll
        : 1.15+.33*usageRoll;
      const attackWeight=r=>{
        const base=roleAttack[r.position]||.1;
        const ability=Math.pow(Math.max(25,r.fit)/70,.85);
        const nightly=.78+.44*daHash(seed+':vb:attack:'+r.position+':'+r.id);
        return Math.max(.01,base*ability*nightly*(r.id===featuredId?featureMultiplier:1));
      };
      summary.attackFeatured=balanced?null:featuredId;
      summary.attackBalanced=balanced;
      // Strict position eligibility: liberos only DIG/AST/ACE; middles only KILLS/BLK/ACE.
      metric('KILLS',Math.round(estimatedPoints*.51),only(['oh1','oh2','mb1','mb2','opp','s']),attackWeight,'kills');
      metric('AST',Math.round(estimatedPoints*.46),only(['s','lib','oh1','oh2','opp']),
        r=>(val(r,'acc')+val(r,'iq'))*({s:9,lib:.36,oh1:.22,oh2:.22,opp:.18}[r.position]||.1),'assists');
      metric('DIG',Math.round(estimatedPoints*.54),only(['lib','s','oh1','oh2','opp']),
        r=>(val(r,'ref')+val(r,'agi'))*({lib:2.9,s:.85,oh1:1.25,oh2:1.55,opp:.62}[r.position]||1),'digs');
      metric('BLK',Math.round(estimatedPoints*.075),only(['mb1','mb2','opp','oh1','oh2','s']),
        r=>(val(r,'siz')+val(r,'lep'))*({mb1:3.2,mb2:3.2,opp:1.15,oh1:.55,oh2:.55,s:.25}[r.position]||1),'blocks');
      // Serving aces are sporadic and may be concentrated on one hot server.
      const serverIndex=Math.floor(daHash(seed+':vb:server')*active.length);
      const serverId=active[serverIndex]?.id;
      metric('ACE',Math.round(estimatedPoints*.05),null,
        r=>(val(r,'acc')+val(r,'str'))*(r.id===serverId?2.25:1)*(.65+.7*daHash(seed+':vb:serve:'+r.id)),'aces');
      // Individual scoring points exclude opposition errors and do not include
      // digs or assists. Sum of player PTS = team kills + blocks + aces.
      for(const r of active){
        const stat=k=>r.stats.find(([name])=>name===k)?.[1]||0;
        r.stats.unshift(['PTS',stat('KILLS')+stat('BLK')+stat('ACE')]);
      }
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
  const weakest=[...active].sort((a,b)=>a.fit-b.fit)[0];
  const primary=({basketball:'PTS',football:'TD',brawl:'DMG',soccer:'G',hockey:'G',baseball:'R',volleyball:'PTS'})[sport]||'Scoring';
  const getMetric=r=>r.stats.find(x=>x[0]===primary)?.[1]||0;
  const leader=[...active].sort((a,b)=>getMetric(b)-getMetric(a))[0];
  const scouting=leader&&weakest?`<p class="note"><b>Scouting takeaway:</b> ${esc(leader.name)} led the roster in projected ${esc(primary)} (${getMetric(leader)}). Lowest positional fit: ${esc(weakest.name)} (${weakest.fit}) at ${esc(weakest.role)}; consider that slot first when evaluating possible upgrades. These are model estimates, not evidence of actual poor play.</p>`:'';
  const scoring=result.summary?.scoring;
  const footer=scoring?`<p class="note">Scoring allocation: ${scoring.td} TD × 7 + ${scoring.fg} FG × 3 + ${scoring.safeties} safeties × 2${scoring.unassigned?' + '+scoring.unassigned+' other':''} = ${scoring.total}. Field goals are team special-teams points; no kicker position exists on this roster.${result.summary.unassignedTD?' '+result.summary.unassignedTD+' touchdown(s) cannot be assigned because this lineup has no eligible scorer.':''}</p>`:
    sport==='volleyball'?`<p class="note">Estimated rally points: ${result.summary.teamRallyPoints}. Kills, blocks and aces are projected from rally totals, not official recorded events.</p>`:'';
  return `<div class="panel" style="padding:14px;margin-top:14px"><div class="sec"><h3 class="h">${esc(title||'After-action report')}</h3><span class="note">Simulated box score · not tracked play-by-play</span></div>
  <div class="tbl-wrap"><table class="t"><thead><tr><th>Character</th><th>Role</th><th>Fit</th><th>Form</th><th>Estimated contributions</th></tr></thead><tbody>${result.map(r=>`<tr><td>${esc(r.name)}</td><td>${esc(r.role)}</td><td class="num">${r.fit}</td><td class="num">${r.impact} (${r.delta>=0?'+':''}${r.delta})</td><td>${r.stats.map(([k,v])=>`${esc(k)}: <b class="num">${v}</b>`).join(' · ')}</td></tr>`).join('')}</tbody></table></div>
  ${footer}${scouting}<p class="note" style="margin:10px 0 0">${top?'Strongest simulated form vs baseline: '+esc(top.name)+'. ':''}${low&&low!==top?'Below baseline: '+esc(low.name)+'. ':''}Form varies deterministically by matchup; use these as scouting estimates, not observed statistics.</p></div>`;
}

function daGameReport(sport,teamA,teamB,game,seed='') {
  if(!game||!teamA?.score||!teamB?.score||!Array.isArray(game.line))return '';
  const winner=game.w;
  const aPoints=winner===-1?game.line[0]:winner===game.a?game.line[0]:game.line[1];
  const bPoints=winner===-1?game.line[1]:winner===game.b?game.line[0]:game.line[1];
  return daReport(sport,teamA.score,aPoints,teamA.name,{seed:seed+':a',note:game.line[2],side:winner===game.a?0:1,opponentPoints:bPoints,combatSide:game.combat?.sides?.[0]})+
    daReport(sport,teamB.score,bPoints,teamB.name,{seed:seed+':b',note:game.line[2],side:winner===game.b?0:1,opponentPoints:aPoints,combatSide:game.combat?.sides?.[1]});
}

/* Explain the actual pre-score calculation, not a reconstructed combat narrative.
   The base rating already includes coach quality, chemistry, signature lifts and
   style modifiers. Each later adjustment is the value actually used to decide. */
function daMatchBreakdown(detail,scoreA,scoreB,nameA='Your team',nameB='Opponent',outcome=null,combat=null) {
  if(!detail)return '<p class="note">Detailed match adjustments were not saved for this older result.</p>';
  const fix=n=>Number.isFinite(Number(n))?Number(n):0;
  const signed=n=>(fix(n)>=0?'+':'')+fix(n).toFixed(2);
  const num=n=>fix(n).toFixed(2);
  const A=esc(nameA),B=esc(nameB);
  const row=(label,key,showSigned=true)=>`<tr><td>${label}</td><td class="num">${showSigned? signed(detail[key]?.[0]):num(detail[key]?.[0])}</td><td class="num">${showSigned? signed(detail[key]?.[1]):num(detail[key]?.[1])}</td></tr>`;
  const coachInfo=(sc,name)=>{
    if(!sc)return '';
    const st=sc.syn?.style,quality=sc.coachFit==null?'':` Coach quality: ${num(sc.coachFit)}/99 (multiplier ×${num(.9+.2*sc.coachFit/99)}).`;
    if(!st)return `<p class="note"><b>${esc(name)}:</b> No specialized coaching system was assigned.${quality}</p>`;
    const fit=st.match||(st.pts>.15?'Good fit':st.pts<-.15?'Poor fit':'Neutral');
    return `<p class="note"><b>${esc(name)}:</b> ${esc(st.name)} — ${esc(st.label)}: <b>${esc(fit)} (${signed(st.pts)} rating)</b>. System-priority attributes average ${num(st.focusAvg)} versus overall roster attributes ${num(st.baseline)}.${quality}</p>`;
  };
  const diff=fix(detail.final?.[0])-fix(detail.final?.[1]),baseGap=fix(detail.base?.[0])-fix(detail.base?.[1]);
  const favourite=baseGap>0.001?nameA:baseGap<-.001?nameB:null;
  const winner=diff>0?nameA:diff<0?nameB:null;
  const upset=favourite&&winner&&favourite!==winner;
  const summary=combat
    ?`${combat.winner===0?nameA:nameB} knocked out all ${combat.sides?.[1-combat.winner]?.fighters?.length||5} opposing fighters in ${combat.rounds} simulated combat rounds. ${nameA} dealt ${fix(combat.sides?.[0]?.damage)} damage; ${nameB} dealt ${fix(combat.sides?.[1]?.damage)}. A higher effective rating helps but does not guarantee victory.`
    :outcome==='draw'?'The match ended in a draw under the sport\'s draw threshold, even though the adjusted ratings differed.':(upset?'Upset: ':'')+String(winner||'Neither team')+' '+(upset?'overcame a pre-match disadvantage of '+num(Math.abs(baseGap))+' rating points':'finished with the higher effective match rating')+(winner?' (margin '+num(Math.abs(diff))+').':'');
  return `<section class="panel" style="padding:14px;margin-top:14px"><div class="sec"><h3 class="h">Why this match ended this way</h3><span class="note">Actual simulation adjustments</span></div>
    <div class="tbl-wrap"><table class="t"><thead><tr><th>Rating stage</th><th>${A}</th><th>${B}</th></tr></thead><tbody>
    ${row('Team rating · roster + chemistry + coaching','base',false)}
    ${row('Opponent disruption','chaos')}
    ${row('Clutch / signature surges','spark')}
    ${detail.toon?row('ToonForce · situational comic physics','toon'):''}
    ${detail.variant?row('Variant ability · form-specific matchup','variant'):''}
    ${row('Match-day variation','random')}
    <tr><th>Effective match rating</th><th class="num">${num(detail.final?.[0])}</th><th class="num">${num(detail.final?.[1])}</th></tr>
    </tbody></table></div>
    <p class="note" style="margin:10px 0">${esc(summary)} ${combat?'Damage, defenses and knockouts come directly from simulated hits.':'The score uses the sport\'s scoring rules; other per-character statistics are modeled estimates.'}</p>
    ${Array.isArray(detail.toonEvents)&&detail.toonEvents.length?`<div class="note" style="margin:10px 0"><b>ToonForce moments (triggered in this match):</b><ul>${detail.toonEvents.map(e=>`<li>${esc(e.side===0?nameA:nameB)} · ${esc(e.character)} ${esc(e.note)} (+${num(e.points)} rating). Situational gag, not blanket immunity.</li>`).join("")}</ul></div>`:""}
    ${Array.isArray(detail.variantEvents)&&detail.variantEvents.length?`<div class="note" style="margin:10px 0"><b>Variant abilities in this matchup:</b><ul>${detail.variantEvents.map(e=>`<li>${esc(e.side===0?nameA:nameB)} · ${esc(e.character)} used ${esc(e.move)} (+${num(e.points)} rating)${e.defended?.length?' · resisted: '+esc(e.defended.join(', ')):''}${e.exposed?.length?' · vulnerability: '+esc(e.exposed.join(', ')):''}. ${esc(e.limit||'')}</li>`).join("")}</ul></div>`:""}
    ${coachInfo(scoreA,nameA)}${coachInfo(scoreB,nameB)}
    </section>`;
}

function daUserMatches(sim) {
  const games=[];
  (sim?.games||[]).forEach((g,i)=>{if(g.a===0||g.b===0)games.push({...g,label:'Regular season · Match '+(i+1),key:'reg-'+i});});
  (sim?.rounds||[]).forEach((round,ri)=>(round||[]).forEach((g,gi)=>{
    if(g.a!==0&&g.b!==0)return;
    if(Array.isArray(g.games)&&g.games.length)g.games.forEach((match,mi)=>games.push({a:g.a,b:g.b,w:match.w,line:match.line,breakdown:match.breakdown,combat:match.combat,label:'Playoffs · Round '+(ri+1)+' · Game '+(mi+1),key:'po-'+ri+'-'+gi+'-'+mi}));
    else games.push({...g,label:'Playoffs · Round '+(ri+1),key:'po-'+ri+'-'+gi});
  }));
  return games;
}


/* One comparison for both teams; match totals and simulated contributions are
   never a second roster. All character numbers are model estimates. */
function daMetricKey(sport) {
  return ({basketball:'PTS',football:'TD',brawl:'DMG',soccer:'G',hockey:'G',baseball:'R',volleyball:'KILLS'})[sport]||'Scoring';
}
function daLineupMetric(row,sport) {
  const primary=daMetricKey(sport);
  if(!row)return null;
  const base=row.stats.find(x=>x[0]===primary);
  if(sport==='brawl'&&base)return base;
  if(sport==='football'&&(!base||!base[1])) {
    const priority=['Pass YDS','Rush YDS','Rec YDS','TACK','SACK','INT'];
    return priority.map(k=>row.stats.find(x=>x[0]===k)).find(x=>x&&x[1])||base||row.stats[0]||null;
  }
  if((!base||!base[1])&&row.stats.length)return row.stats.find(x=>x[1])||row.stats[0];
  return base||null;
}
function daPointsFor(game,teamIndex) {
  if(!game||!Array.isArray(game.line))return 0;
  return Number(game.line[game.w===-1?(teamIndex===game.a?0:1):(game.w===teamIndex?0:1)])||0;
}
function daComparison(sport,leftScore,rightScore,leftPoints,rightPoints,leftName='Your team',rightName='Opponent',seed='',options={}) {
  if(!leftScore?.rows||!rightScore?.rows)return '';
  const left=daBoxScore(sport,leftScore,leftPoints,seed+':left',{note:options.note,side:options.leftSide||0,opponentPoints:rightPoints,combatSide:options.combat?.sides?.[0]});
  const right=daBoxScore(sport,rightScore,rightPoints,seed+':right',{note:options.note,side:options.rightSide||0,opponentPoints:leftPoints,combatSide:options.combat?.sides?.[1]});
  const primary=sport==='brawl'&&!options.combat?'KOs':daMetricKey(sport);
  const total=(rows,key)=>rows.reduce((sum,row)=>sum+(row.stats.find(x=>x[0]===key)?.[1]||0),0);
  const leftTotal=total(left,primary),rightTotal=total(right,primary),denom=Math.max(1,leftTotal+rightTotal);
  const lPct=Math.round(100*leftTotal/denom);
  const fighterLogs=(options.combat?.sides||[]).map(side=>new Map((side?.fighters||[]).map(f=>[f.id,f])));
  const cell=(r,side=0)=>{
    if(!r)return '<span class="muted">—</span>';
    const main=daLineupMetric(r,sport);
    const log=sport==='brawl'?fighterLogs[side]?.get(r.id):null;
    // Native nested details avoid an additional dialog and explain the actual
    // per-character outcome; never claim DMG is an immutable lore attribute.
    let explanation='';
    if(log&&typeof log.attacks==='number'){
      const hits=Number(log.hits)||0,attempts=Number(log.attacks)||0;
      const targets=Object.values(log.targets||{}).sort((a,b)=>b.dmg-a.dmg).slice(0,3);
      const why=[
        log.apexRank===2?`Apex form: exceptional damage, a second attack per round and +${Number(log.apexHp)||0} combat HP.`:
          log.apexRank===1?`Empowered form: enhanced damage, a second attack per round and +${Number(log.apexHp)||0} combat HP.`:'',
        `${hits} hits from ${attempts} attacks over ${Number(log.roundsAlive)||0} rounds alive.`,
        log.powerUses?`${esc(log.powerMove||'Signature move')}: ${log.powerUses} attempts, ${Number(log.powerDmg)||0} DMG (already in total).`:'',
        targets.length?'Targets: '+targets.map(t=>`${esc(t.name)} (${t.dmg} DMG)`).join(', ')+'.':'No successful hits recorded.',
        log.wardHp?`Bounded power ward: +${log.wardHp} protective HP at start.`:'',
        log.wear?`Ability strain: ${log.wear} HP lost (not credited as opponent DMG).`:'',
        log.koRound?`Knocked out in round ${log.koRound}.`:
          `Remaining HP: ${Number(log.hp)||0}/${Number(log.maxHp)||0}.`,
        log.powerLimit?`Limit: ${esc(log.powerLimit)}`:''
      ].filter(Boolean).join(' ');
      // Source links are shown only for allowlisted editorial publishers.
      // Variant metadata is not assumed safe to interpolate into a URL.
      const source=String(log.powerSource||'');
      const trusted=/^https:\/\/(?:www\.)?(?:dc\.com|marvel\.com|tolkiengateway\.net)\//.test(source);
      const sourceHTML=trusted?` <a href="${esc(source)}" target="_blank" rel="noopener noreferrer">Source material</a>`:'';
      explanation=`<details class="da-fighter-why"><summary>Why this DMG?</summary><div>${why}${sourceHTML}</div></details>`;
    }
    return `<div class="da-player"><span class="da-name">${esc(r.name)}</span><span class="da-primary">${main?`<b class="num">${main[1]}</b> <small>${esc(main[0])}</small>`:'—'}</span>
      <span class="da-secondary">${r.stats.filter(x=>x!==main).map(([key,value])=>`<span>${esc(key)} <b class="num">${value}</b></span>`).join('')}</span>${explanation}</div>`;
  };
  const pairs=Array.from({length:Math.max(left.length,right.length)},(_,i)=>{
    const a=left[i],b=right[i],role=a?.role||b?.role||'';
    return `<tr><td class="da-side">${cell(a,0)}</td><th scope="row" class="da-role">${esc(role)}</th><td class="da-side">${cell(b,1)}</td></tr>`;
  }).join('');
  const active=rows=>rows.filter(r=>!['hc','mgr','cmd','bn'].includes(r.position));
  const leading=rows=>active(rows).slice().sort((a,b)=>(daLineupMetric(b,sport)?.[1]||0)-(daLineupMetric(a,sport)?.[1]||0))[0];
  const winner=leftPoints===rightPoints?'draw':leftPoints>rightPoints?'left':'right';
  const leader=leading(winner==='right'?right:left);
  const leadMetric=leader&&daLineupMetric(leader,sport);
  const versions=[
    `${esc(leftName)} and ${esc(rightName)} finished ${leftPoints}–${rightPoints}.`,
    `The final score was ${leftPoints}–${rightPoints}, ${winner==='draw'?'with neither team ahead':winner==='left'?esc(leftName)+' on top':esc(rightName)+' on top'}.`,
    `${winner==='draw'?'Neither side separated itself':esc(winner==='left'?leftName:rightName)+' finished ahead'} in a ${leftPoints}–${rightPoints} matchup.`
  ];
  const narrative=versions[Math.floor(daHash(seed||leftName+rightName)*versions.length)] +
    (leader&&leadMetric?` ${esc(leader.name)} led the ${esc(winner==='right'?rightName:leftName)} projections with ${leadMetric[1]} ${esc(leadMetric[0])}.`:'') +
    (sport==='brawl'&&options.combat?' These gameplay contributions came from the simulated combat exchanges, not canonical fight footage.':' Player contributions are simulated estimates, not recorded play-by-play.');
  const extra=options.breakdown?`<details class="da-inner-details"><summary>How the match was calculated</summary>${options.breakdown}</details>`:'';
  const story=options.summaryHTML||'';
  return `<section class="panel da-result" aria-label="Match statistics comparison">
    <div class="da-totals" role="group" aria-label="Team comparison">
      <div><span class="da-team-name">${esc(leftName)}</span><strong class="num">${leftPoints}</strong><small>${esc(primary)}: <b class="num">${leftTotal}</b></small></div>
      <div><span class="da-team-name">${esc(rightName)}</span><strong class="num">${rightPoints}</strong><small>${esc(primary)}: <b class="num">${rightTotal}</b></small></div>
    </div>
    <div class="da-sharebar" role="img" aria-label="${esc(primary)} estimate: ${leftTotal} for ${esc(leftName)} and ${rightTotal} for ${esc(rightName)}"><span style="width:${lPct}%"></span></div>
    <p class="da-estimate">${sport==='brawl'?(options.combat?'Damage, absorption, mitigation and KOs come from simulated attacks; DMG includes any excess on a finishing blow. These are gameplay values, not canonical feats.':'Legacy match: no combat exchange log was recorded. KOs are estimated; damage statistics are unavailable.'):'Player contributions are simulated estimates.'}</p>
    <details class="da-toggle da-detail-toggle">
      <summary>View Detailed Stats</summary>
      <div class="tbl-wrap"><table class="t da-player-table"><thead><tr><th scope="col">${esc(leftName)}</th><th scope="col">Role</th><th scope="col">${esc(rightName)}</th></tr></thead><tbody>${pairs}</tbody></table></div>
      ${extra}
    </details>
    <details class="da-toggle da-summary-toggle"><summary>Read Summary</summary><div class="da-story"><p>${narrative}</p>${story}</div></details>
  </section>`;
}
function daMatchBrowser(sport,sim,teams,selected,summaryHTML='') {
  const matches=daUserMatches(sim);
  if(!matches.length)return '<div class="panel" style="padding:14px">No matches available for this team.</div>';
  const ix=selected==null||selected===''?matches.length-1:Math.min(matches.length-1,Math.max(0,Math.floor(Number(selected)||0)));
  const game=matches[ix],opp=game.a===0?game.b:game.a,left=teams[0],right=teams[opp];
  const aPts=daPointsFor(game,0),bPts=daPointsFor(game,opp);
  const sideA=game.w===-1?(game.a===0?0:1):(game.w===0?0:1);
  const sideB=game.w===-1?(game.a===opp?0:1):(game.w===opp?0:1);
  const firstIndex=game.a===0?0:1;
  const factors=daMatchBreakdown(game.breakdown,teams[game.a]?.score,teams[game.b]?.score,teams[game.a]?.name,teams[game.b]?.name,game.w===-1?'draw':null,game.combat);
  const orderedCombat=game.combat&&(game.a===0?game.combat:{...game.combat,sides:[...game.combat.sides].reverse(),winner:1-game.combat.winner});
  const recap=ix===matches.length-1?summaryHTML:'';
  return `<section class="da-match-browser">
    <label class="field-label"><span>Match</span><select data-input="report-match" id="report-match">${matches.map((g,i)=>`<option value="${i}" ${i===ix?'selected':''}>${esc(g.label)} · ${esc(teams[g.a===0?g.b:g.a].name)}</option>`).join('')}</select></label>
    <p class="da-match-outcome"><b>${game.w===-1?'Draw':game.w===0?'Win':'Loss'}</b> vs ${esc(right.name)} · <span class="num">${aPts}–${bPts}</span></p>
    ${daComparison(sport,left.score,right.score,aPts,bPts,left.name,right.name,game.key,{note:game.line[2],leftSide:sideA,rightSide:sideB,breakdown:factors,combat:orderedCombat,summaryHTML:recap})}
  </section>`;
}


if(typeof module!=='undefined'&&module.exports)module.exports={daAllocate,daHash,daFootballBreakdown,daVolleyballPoints,daBoxScore,daReport,daGameReport,daUserMatches,daMatchBreakdown,daComparison,daMetricKey,daLineupMetric,daPointsFor,daMatchBrowser};

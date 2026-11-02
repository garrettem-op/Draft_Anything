/* Draft Anything: Championship Campaign. Ten must-win challenges, persisted on this device. */
const CAMPAIGN_STAGES = [
  {name:'The Fast Lane',rule:'fast',blurb:'Only speedsters. Every pick must have Speed 85 or higher.',rival:'The Blitz'},
  {name:'Queens of the Court',rule:'women',blurb:'Women and female characters only. The roster is curated from established character identities.',rival:'The Queensguard'},
  {name:'Seeing Red',rule:'red',blurb:'Red-themed characters only: red costumes, red bodies, or a distinctly red design.',rival:'The Crimson Crew'},
  {name:'The Young Guns',rule:'kids',blurb:'Only children and teenage characters. No adult versions.',rival:'The Veterans'},
  {name:'No Powers Allowed',rule:'mortal',blurb:'No supernatural powers or superhuman bodies. Human athleticism and skill still count.',rival:'The Supernaturals'},
  {name:'Big Brain Energy',rule:'brain',blurb:'Every pick must have Game IQ 87 or higher.',rival:'The Masterminds'},
  {name:'Heavy Hitters',rule:'strong',blurb:'Only characters with Strength 87 or higher.',rival:'The Juggernauts'},
  {name:'The Underdogs',rule:'underdog',blurb:'Everyone must have an average attribute rating of 73 or lower.',rival:'The Favorites'},
  {name:'Down Two',rule:'short',blurb:'Play with only 60% of your starting lineup. On a five-starter team, that means just three players; no bench or coach.',rival:'The Full Strength'},
  {name:'The Final Gauntlet',rule:'final',blurb:'Again play short-handed, and you cannot reuse ANY character from a previous winning roster.',rival:'The Final Boss'}
];
const CAMPAIGN_WOMEN=new Set('Black Widow|Scarlet Witch|Captain Marvel|Gamora|Nebula|Mantis|The Wasp|Janet van Dyne|Kate Bishop|Okoye|Ayo|Shuri|Nakia|Ironheart|Valkyrie|Hela|Sif|Pepper Potts|Ms. Marvel|She-Hulk|Yelena Belova|Taskmaster|Sharon Carter|Agatha Harkness|Maria Hill|Peggy Carter|Darcy Lewis|Ghost|MJ|Aunt May|Thena|Makkari|Ajak|Sersi|Sprite|Monica Rambeau|America Chavez|Echo|Jessica Jones|Elektra|Jean Grey|Invisible Woman|Silver Surfer|Captain Carter|Lola Bunny|Minnie Mouse|Daisy Duck|Elsa|Moana|Mulan|Violet|Elastigirl|Sandy Cheeks|Lisa Simpson|Marge Simpson|Velma|Lucy van Pelt|Peppermint Patty|Blossom|Bubbles|Buttercup|Katara|Toph Beifong|Tigress|Bluey|Anna|Vanellope von Schweetz|Princess Peach|Princess Daisy|Rosalina|Samus Aran|Zelda|Princess Zelda|Lara Croft|Chun-Li|Sonya Blade|Kitana|Mileena|Bayonetta|Jill Valentine|Ada Wong|Ellie|Aloy'.split('|'));
const CAMPAIGN_RED=new Set('Iron Man|Spider-Man|Scarlet Witch|Vision|Red Guardian|Red Skull|Daredevil|Deadpool|Human Torch|Star-Lord|Carnage|Mario|Knuckles|Diddy Kong|Donkey Kong|Raphael|Lightning McQueen|Mr. Incredible|Elastigirl|Blossom|Optimus Prime|Zuko|Po|Yosemite Sam|Mr. Krabs|Anger|Incineroar|Scorpion|Flash|The Flash|Ant-Man|Wreck-It Ralph|Mickey Mouse'.split('|'));
const CAMPAIGN_KIDS=new Set('Spider-Man|Ms. Marvel|Kate Bishop|Ironheart|America Chavez|Sprite|Franklin Richards|Dash|Violet|Jack-Jack|Blossom|Bubbles|Buttercup|Bluey|Bingo|Bart Simpson|Lisa Simpson|Charlie Brown|Lucy van Pelt|Peppermint Patty|Snoopy|Aang|Toph Beifong|Zuko|Katara|Sokka|Mickey Mouse|Minnie Mouse|Morty|Ned Leeds|MJ|Vanellope von Schweetz|Ness|Lucas|Ash Ketchum|Pokémon Trainer|Young Link|Kid Link|Baby Mario|Baby Luigi|Dora the Explorer|Jimmy Neutron|Dexter|Timmy Turner|Penny Proud|Phineas|Ferb|Stewie Griffin|Maggie Simpson|Huey|Dewey|Louie|Lincoln Loud|Courage the Cowardly Dog'.split('|'));
const CAMPAIGN_MORTAL=new Set('Black Widow|Hawkeye|Kate Bishop|Falcon|Winter Soldier|Happy Hogan|Howard Stark|Nick Fury|Maria Hill|Phil Coulson|Peggy Carter|Jimmy Woo|Darcy Lewis|Sharon Carter|Yelena Belova|Zemo|Katy|MJ|Ned Leeds|Aunt May|Kingpin|The Punisher|John Walker|Mulan|Phil|Tarzan|Fred Jones|Velma|Shaggy|Hank Hill|Bob Belcher|Sokka|Marge Simpson|Lisa Simpson|Bart Simpson|Charlie Brown|Peppermint Patty|Moana|Edna Mode|Porky Pig|Minnie Mouse|Lola Bunny'.split('|'));
function campaignDefault(){return {status:'setup',step:0,sport:'basketball',teamName:'The Challengers',roster:{},selected:null,query:'',history:[],result:null};}
function loadCampaign(){
  const saved=lsGet('da.campaign.v1',{}),v={...campaignDefault(),...saved};
  if(!SPORTS[v.sport]||!Number.isInteger(v.step)||v.step<0||v.step>10||!Array.isArray(v.history)){return campaignDefault();}
  v.history=v.history.slice(0,10);
  v.roster=Object.fromEntries(Object.entries(v.roster||{}).map(([id,cid])=>[id,candById('mashup',typeof cid==='string'?cid:cid?.id)]).filter(([,c])=>!!c));
  v.selected=null;v.query='';
  if(v.status==='results'&&!v.result)v.status='draft';
  return v;
}
function saveCampaign(){
  const v=S.campaign;
  lsSet('da.campaign.v1',{status:v.status,step:v.step,sport:v.sport,teamName:v.teamName,roster:Object.fromEntries(Object.entries(v.roster||{}).map(([p,c])=>[p,c.id])),history:v.history,result:v.result});
}
function campaignStage(){return CAMPAIGN_STAGES[Math.min(9,S.campaign.step)];}
function campaignSlots(sport,rule){
  const slots=SPORTS[sport].pos;
  if(rule!=='short'&&rule!=='final')return slots;
  const starters=slots.filter(p=>!p.side&&!p.coach&&!p.bench);
  return starters.slice(0,Math.max(1,Math.ceil(starters.length*0.6)));
}
function campaignUsed(){return new Set(S.campaign.history.flatMap(h=>h.ids||[]));}
function campaignAllowed(c,rule){
  switch(rule){
    case 'fast':return c.a[0]>=85;
    case 'women':return CAMPAIGN_WOMEN.has(c.n);
    case 'red':return CAMPAIGN_RED.has(c.n);
    case 'kids':return CAMPAIGN_KIDS.has(c.n);
    case 'mortal':return c.pool==='nba'||CAMPAIGN_MORTAL.has(c.n);
    case 'brain':return c.a[9]>=87;
    case 'strong':return c.a[2]>=87;
    case 'underdog':return c.a.reduce((n,v)=>n+v,0)/c.a.length<=73;
    case 'final':return !campaignUsed().has(c.id);
    default:return true;
  }
}
function campaignCandidates(rule){return getCands('mashup').filter(c=>campaignAllowed(c,rule));}
function campaignSportValid(sport){return CAMPAIGN_STAGES.every(ch=>campaignCandidates(ch.rule).length>=campaignSlots(sport,ch.rule).length);}
function campaignReady(){
  const v=S.campaign,st=campaignStage(),slots=campaignSlots(v.sport,st.rule),pick=slots.map(p=>v.roster[p.id]);
  return pick.every(c=>c&&campaignAllowed(c,st.rule))&&new Set(pick.map(c=>c.id)).size===slots.length&&Object.keys(v.roster).every(id=>slots.some(p=>p.id===id));
}
function campaignProgress(){
  const v=S.campaign,done=v.status==='complete'?10:v.step;
  return `<div class="panel" style="padding:14px 16px;margin-bottom:14px">
    <div class="row" style="justify-content:space-between;align-items:center"><b>Campaign progress</b><span class="num">${{done} / 10 wins</span></div>
    <div class="meter" role="progressbar" aria-label="Campaign wins" aria-valuenow="${{done}" aria-valuemin="0" aria-valuemax="10"><i style="width:${{done*10}%"></i></div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">${{CAMPAIGN_STAGES.map((ch,i)=>`<span class="chip" title="${{esc(ch.name)}" style="${{i<done?'border-color:var(--good);color:var(--good)':i===v.step&&v.status!=='complete'?'border-color:var(--accent-strong)':''}">${{i+1}. ${{esc(ch.name)}</span>`).join('')}</div>
  </div>`;
}
function renderCampaignSetup(){
  const v=S.campaign,existing=v.step>0||v.status!=='setup';
  return `<section class="setup">
    <div class="mode-intro panel"><b>Championship · Campaign</b><span>Win ten different challenges in order to claim the campaign crown. Every stage changes who you can draft or how many players you get. A loss means retrying that stage; completed wins remain saved on this device.</span></div>
    <div class="panel rules" style="margin-bottom:16px"><div class="field-label"><span>Championship mode</span><div class="seg"><button data-act="c-kind" data-v="classic">Perfect Season</button><button data-act="c-kind" data-v="campaign" aria-pressed="true">Campaign · 10 challenges</button></div></div></div>
    ${{campaignProgress()}
    <div class="step"><div class="step-head"><span class="n">1</span><h2 class="h">Pick a sport</h2></div>
      <div class="sports">${{SPORT_ORDER.map(k=>`<button class="sport" data-act="camp-sport" data-sport="${{k}" aria-pressed="${{v.sport===k}" ${{campaignSportValid(k)?'':'disabled title="Not enough eligible characters for all ten challenges"'}><span class="glyph">${{sportGlyph(k)}</span><b>${{esc(SPORTS[k].name)}</b><span>${{campaignSportValid(k)?'10 campaign challenges':'Not enough eligible characters'}</span></button>`).join('')}</div>
      <p class="note">Campaign drafts from the All-Star Mashup (all built-in universes), so themed rounds always have a broad selection. Changing sports starts a new campaign.</p>
    </div>
    <div class="step"><div class="step-head"><span class="n">2</span><h2 class="h">Your team</h2></div><div class="panel rules"><label class="field-label"><span>Team name</span><input data-input="camp-team" maxlength="32" value="${{esc(v.teamName)}" placeholder="The Challengers"></label></div></div>
    <div class="cta-row"><button class="btn primary big" data-act="camp-start">${{existing?'Resume campaign':'Begin the campaign'}</button>${{existing?'<button class="btn" data-act="camp-reset">Restart from challenge 1</button>':''}<span class="note">Win all ten matchups to become Campaign Champion.</span></div>
  </section>`;
}
function renderCampaignDraft(){
  const v=S.campaign,st=campaignStage(),slots=campaignSlots(v.sport,st.rule),allowedSet=new Set(slots.map(p=>p.id));
  const filled=slots.filter(p=>v.roster[p.id]).length,valid=campaignReady(),all=campaignCandidates(st.rule),taken=new Set(Object.values(v.roster).map(c=>c.id));
  const pos=SPORTS[v.sport].pos.find(p=>p.id===v.selected);
  const pool=getPool('mashup'),q=v.query.toLowerCase().trim();
  const matches=all.filter(c=>!q||c.n.toLowerCase().includes(q)||c.t.toLowerCase().includes(q)).sort((a,b)=>a.n.localeCompare(b.n));
  const picker=pos?`<div class="panel picker open">
    <div class="picker-head"><div class="row" style="justify-content:space-between"><div><div class="eyebrow">Campaign draft</div><h3 class="h">${{esc(pos.nm)}</h3></div><button class="btn small" data-act="camp-close">Done</button></div><div class="needs">${{needsText(pos).map(t=>`<span>${{esc(t)}</span>`).join('')}</div></div>
    <div class="picker-tools"><input id="camp-query" data-input="camp-query" type="text" value="${{esc(v.query)}" placeholder="Search ${{all.length} eligible characters" autocomplete="off"></div>
    <div class="plist">${{matches.length?matches.map(c=>`<button class="cand" data-act="camp-pick" data-cid="${{esc(c.id)}" ${{taken.has(c.id)&&v.roster[pos.id]?.id!==c.id?'disabled':''}>${{avatar(c)}<span class="who"><b>${{esc(c.n)}</b><small>${{esc(c.t)}</small></span>${{taken.has(c.id)?'<span class="meta muted">On roster</span>':''}</button>`).join(''):'<div class="empty-state">No eligible characters match your search.</div>'}</div>
  </div><div class="sheet-backdrop open" data-act="camp-close"></div>`:
  `<div class="panel"><div class="sec"><h3 class="h">Your lineup</h3><span class="num muted">${{filled}/${{slots.length}</span></div>
    <div class="roster-list">${{SPORTS[v.sport].pos.map(p=>`<button class="rl ${{v.roster[p.id]?'':'empty'}" data-act="camp-slot" data-slot="${{p.id}" ${{allowedSet.has(p.id)?'':'disabled'}><span class="ab">${{p.ab}</span><span class="who"><b>${{!allowedSet.has(p.id)?'Locked for this challenge':v.roster[p.id]?esc(v.roster[p.id].n):'Open — tap to fill'}</b><small>${{esc(p.nm)}</small></span>${{v.roster[p.id]?avatar(v.roster[p.id]):''}</button>`).join('')}</div>
    <div class="sec"><span class="note">${{filled===slots.length?'Ready to play.':'Fill every available position.'}</span><button class="linkish" data-act="camp-random">Fill available spots</button></div>
  </div>`;
  return `<section>${{campaignProgress()}
    <div class="panel" style="padding:16px;margin-bottom:14px"><div class="eyebrow">Challenge ${{v.step+1} / 10 · ${{esc(SPORTS[v.sport].name)}</div><h2 class="h" style="margin:4px 0 8px">${{esc(st.name)}</h2><p style="margin:0">${{esc(st.blurb)}</p><p class="note" style="margin:8px 0 0">${{all.length} eligible candidates · ${{slots.length} roster spots · Opponent: ${{esc(st.rival)}.</p></div>
    <div class="board-head"><div class="title"><span class="eyebrow">Campaign · All-Star Mashup</span><h2 class="h">${{esc(v.teamName||'Your team')}</h2></div><span class="chip num">${{filled}/${{slots.length}</span><button class="btn" data-act="camp-setup">Campaign overview</button><button class="btn primary" data-act="camp-play" ${{valid?'':'disabled'}>Play challenge</button></div>
    <div class="board"><div>${{renderField(v.sport,v.roster,{sel:v.selected,interactive:true,eligibleSlots:allowedSet})}</div><div class="board-side">${{picker}</div></div>
  </section>`;
}
function campaignOpponent(sport,excluded,target,rng){
  const P=SPORTS[sport].pos.length;
  const a=getCands('mashup').filter(c=>!excluded.has(c.id)).sort((x,y)=>candVal(sport,x)-candVal(sport,y));
  let best=null,lo=P,hi=a.length;
  for(let i=0;i<9&&lo<=hi;i++){
    const n=Math.max(P,Math.floor((lo+hi)/2));
    const roster=aiStackDraft(sport,a.slice(0,n),1,false)[0];
    if(!roster)break;
    const score=teamScore(sport,roster);
    const diff=Math.abs(score.rating-target);
    if(!best||diff<best.diff)best={roster,score,diff};
    if(score.rating<target)lo=n+1;else hi=n-1;
  }
  return best||{roster:{},score:teamScore(sport,{}),diff:999};
}
function campaignPlay(){
  if(!campaignReady())return toast('Fill the eligible roster spots first.');
  const v=S.campaign,st=campaignStage(),rng=rngFrom(Date.now()+':'+Math.random());
  const score=teamScore(v.sport,v.roster),excluded=new Set(Object.values(v.roster).map(c=>c.id));
  // Each opponent is a complete team, generally stronger than your restricted roster.
  const target=score.rating+1.5+v.step*0.7;
  const opp=campaignOpponent(v.sport,excluded,target,rng);
  const game=playGame(v.sport,score,opp.score,SEASONS[v.sport].sigma*1.1,rng,true);
  const win=game.winner===0,ourPoints=win?game.line[0]:game.line[1],theirPoints=win?game.line[1]:game.line[0];
  v.result={win,ourPoints,theirPoints,note:game.line[2]||'',ourRating:+score.rating.toFixed(1),theirRating:+opp.score.rating.toFixed(1),opponent:st.rival,names:Object.values(v.roster).map(c=>c.n),ids:Object.values(v.roster).map(c=>c.id)};
  v.status='results';saveCampaign();
}
function renderCampaignResults(){
  const v=S.campaign,r=v.result,st=campaignStage();
  if(!r){v.status='draft';return renderCampaignDraft();}
  return `<section>${{campaignProgress()}<div class="result-hero ${{r.win?'perfect':''}">
    <span class="eyebrow" style="color:inherit">Challenge ${{v.step+1} / 10 · ${{esc(st.name)}</span>
    <div class="big">${{r.win?'<em>Challenge won</em>':'Challenge lost'}</div>
    <p>${{r.win?'You cleared this stage.':'Your completed campaign wins are safe. Rework your lineup or retry this matchup.'}</p>
    <div class="scorebug"><div style="background:var(--you);color:#fff">${{esc(v.teamName||'Your team')} <span class="s">${{r.ourPoints}</span></div><div style="background:var(--opp);color:#fff">${{esc(r.opponent)} <span class="s">${{r.theirPoints}</span></div></div>
  </div>
  <div class="panel" style="padding:16px;margin-top:14px"><p style="margin:0">Your team rating: <b class="num">${{r.ourRating}</b> · Rival rating: <b class="num">${{r.theirRating}</b></p><p class="note" style="margin:8px 0 0">Roster: ${{esc(r.names.join(', '))}</p></div>
  <div class="cta-row">${{r.win?`<button class="btn primary big" data-act="camp-next">${{v.step===9?'Claim campaign championship':'Unlock challenge '+(v.step+2)}</button>`:`<button class="btn primary" data-act="camp-retry">Retry this challenge</button><button class="btn" data-act="camp-edit">Edit your lineup</button>`}<button class="btn" data-act="camp-setup">Campaign overview</button></div></section>`;
}
function renderCampaignComplete(){
  const v=S.campaign;
  return `<section>${{campaignProgress()}<div class="result-hero perfect"><span class="eyebrow" style="color:inherit">10 / 10 challenges won</span><div class="big"><em>Campaign Champion</em></div><p>${{esc(v.teamName)} completed all ten restricted-roster matchups. Every stage has been cleared.</p></div>
    <div class="panel" style="padding:16px;margin-top:14px"><h2 class="h">Your ten victories</h2><div class="roster-list">${{v.history.map((x,i)=>`<div class="rl"><span class="ab">${{i+1}</span><span class="who"><b>${{esc(x.name)}</b><small>${{esc(x.names.join(', '))}</small></span></div>`).join('')}</div></div>
    <div class="cta-row"><button class="btn primary" data-act="camp-reset">Start a new campaign</button><button class="btn" data-act="camp-setup">Campaign overview</button></div></section>`;
}
function renderCampaign(){
  const status=S.campaign.status;
  return status==='draft'?renderCampaignDraft():status==='results'?renderCampaignResults():status==='complete'?renderCampaignComplete():renderCampaignSetup();
}
function campaignReset(){S.campaign=campaignDefault();saveCampaign();}
function campaignAdvance(){
  const v=S.campaign;
  if(v.status!=='results'||!v.result?.win)return;
  v.history.push({name:campaignStage().name,names:v.result.names,ids:v.result.ids});
  v.step++;
  v.roster={};v.selected=null;v.query='';v.result=null;
  v.status=v.step>=CAMPAIGN_STAGES.length?'complete':'draft';
  saveCampaign();
}

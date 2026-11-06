/* Draft Anything: Championship Campaign. Ten must-win challenges, persisted on this device. */
const CAMPAIGN_STAGES = [
  {name:'The Fast Lane',rule:'fast',blurb:'Only speedsters. Every pick must have Speed 90 or higher.',rival:'The Blitz'},
  {name:'Queens of the Court',rule:'women',blurb:'Women and female characters only. Use your knowledge of character identities to select your team.',rival:'The Queensguard'},
  {name:'Seeing Red',rule:'red',blurb:'Red-themed characters only: red costumes, red bodies, or a distinctly red design.',rival:'The Crimson Crew'},
  {name:'The Young Guns',rule:'kids',blurb:'Only children and teenage characters. No adult versions.',rival:'The Veterans'},
  {name:'No Powers Allowed',rule:'mortal',blurb:'No supernatural powers or superhuman bodies. Human athleticism and skill still count.',rival:'The Supernaturals'},
  {name:'Big Brain Energy',rule:'brain',blurb:'Every pick must have Game IQ 87 or higher.',rival:'The Masterminds'},
  {name:'Heavy Hitters',rule:'strong',blurb:'Only characters with Strength 87 or higher.',rival:'The Juggernauts'},
  {name:'The Underdogs',rule:'underdog',blurb:'Everyone must have an average attribute rating of 73 or lower.',rival:'The Favorites'},
  {name:'Short-Handed',rule:'short',blurb:'Play with only 60% of your starting lineup. On a five-starter team, that means just three players; no bench or coach.',rival:'The Full Strength'},
  {name:'The Final Gauntlet',rule:'final',blurb:'Again play short-handed, and you cannot reuse ANY character from a previous winning roster.',rival:'The Final Boss'}
];
const CAMPAIGN_EXTRA = [
{name:'Skyborne',rule:'flight',blurb:'Every pick must be a known flyer or aerial combatant.',rival:'The Air Armada'},
{name:'Arcane Assembly',rule:'magic',blurb:'Every pick must wield magic or supernatural sorcery.',rival:'The Spellbinders'},
{name:'Mind Games',rule:'psychic',blurb:'Every pick must have telepathy, telekinesis, or psychic powers.',rival:'The Mind Readers'},
{name:'Under the Sea',rule:'aquatic',blurb:'Every pick must thrive underwater or have aquatic powers.',rival:'The Deep'},
{name:'Inferno',rule:'fire',blurb:'Every pick must command fire or flames.',rival:'The Wildfire'},
{name:'Cold Front',rule:'ice',blurb:'Every pick must command ice or freezing powers.',rival:'The Frostguard'},
{name:'Shock Troopers',rule:'electric',blurb:'Every pick must wield electricity or lightning.',rival:'The Thunderbolts'},
{name:'Tech Titans',rule:'tech',blurb:'Every pick must rely on advanced technology or armor.',rival:'The Engineers'},
{name:'Ghost Protocol',rule:'stealth',blurb:'Every pick must be known for stealth or invisibility.',rival:'The Shadows'},
{name:'Blink and Miss',rule:'teleport',blurb:'Every pick must be able to teleport.',rival:'The Jumpers'},
{name:'The Medics',rule:'healing',blurb:'Every pick must have healing or regenerative abilities.',rival:'The Lifesavers'},
{name:'Giant Problems',rule:'giants',blurb:'Every pick must be capable of becoming enormous or already be giant-sized.',rival:'The Colossi'}
];
const CAMPAIGN_TAGS = {
flight:'Iron Man|Thor|Captain Marvel|Vision|Falcon|War Machine|Superman|Goku|Vegeta|Buzz Lightyear|Charizard|Dragonite|Rayquaza|Mewtwo|Storm|Silver Surfer|Ikaris',
magic:'Doctor Strange|Scarlet Witch|Loki|Agatha Harkness|Wong|Doctor Fate|Zatanna|Raven|Elsa|Maleficent|Gandalf|Dumbledore|Harry Potter|Hermione Granger|Zelda',
psychic:'Jean Grey|Professor X|Mewtwo|Mew|Psyduck|Alakazam|Scarlet Witch|Vision|Martian Manhunter|Raven|Mob|Saiki Kusuo',
aquatic:'Aquaman|Namor|Ariel|SpongeBob SquarePants|Patrick Star|Squidward Tentacles|Mr. Krabs|Squirtle|Wartortle|Blastoise|Magikarp|Gyarados|Kyogre|Dory|Nemo',
fire:'Human Torch|Ghost Rider|Charizard|Charmander|Charmeleon|Magmar|Flareon|Moltres|Infernape|Bowser|Zuko|Iroh|Azula|Fire Mario',
ice:'Elsa|Iceman|Sub-Zero|Articuno|Glaceon|Lapras|Jynx|Frozone|Kyurem|Regice|Mr. Freeze',
electric:'Thor|Pikachu|Raichu|Jolteon|Zapdos|Electabuzz|Electivire|Magneto|Storm|Palpatine|Darth Sidious|Shazam',
tech:'Iron Man|War Machine|Ironheart|Batman|Cyborg|Ultron|Vision|Rocket Raccoon|Black Panther|Shuri|Samus Aran|Mega Man|RoboCop|Master Chief|Darth Vader|R2-D2',
stealth:'Black Widow|Hawkeye|Batman|Solid Snake|Sam Fisher|Invisible Woman|Ghost|Elektra|Ninja|Greninja|The Mandalorian|Boba Fett|Predator',
teleport:'Nightcrawler|Doctor Strange|Loki|Scarlet Witch|America Chavez|Deadpool|Mewtwo|Abra|Kadabra|Alakazam|Hoopa|Sasuke Uchiha|Minato Namikaze',
healing:'Wolverine|Deadpool|Hulk|She-Hulk|Groot|Mewtwo|Chansey|Blissey|Mercy|Kiriko|Baymax|Rapunzel|Senzu Bean',
giants:'Hulk|Ant-Man|Giant-Man|Goliath|Godzilla|King Kong|Bowser|Donkey Kong|Groudon|Wailord|Snorlax|Galactus|The Thing'
};
for(const k in CAMPAIGN_TAGS) CAMPAIGN_TAGS[k]=new Set(CAMPAIGN_TAGS[k].split('|'));
function campaignStages(){return S.campaign?.stageOrder?.map(i=>CAMPAIGN_STAGES[i]||CAMPAIGN_EXTRA[i-CAMPAIGN_STAGES.length]).filter(Boolean)||CAMPAIGN_STAGES;}
function campaignNewOrder(sport='basketball'){
 const eligible=ch=>ch.rule==='final'||campaignCandidates(ch.rule).length>=campaignLimit(sport,ch.rule);
 const fixed=CAMPAIGN_STAGES.length-1, pool=CAMPAIGN_STAGES.slice(0,-1).map((_,i)=>i).concat(CAMPAIGN_EXTRA.map((_,i)=>CAMPAIGN_STAGES.length+i)).filter(i=>eligible(i<CAMPAIGN_STAGES.length?CAMPAIGN_STAGES[i]:CAMPAIGN_EXTRA[i-CAMPAIGN_STAGES.length]));
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 return pool.slice(0,9).concat(fixed);
}
const CAMPAIGN_WOMEN=new Set('Black Widow|Scarlet Witch|Captain Marvel|Gamora|Nebula|Mantis|The Wasp|Janet van Dyne|Kate Bishop|Okoye|Ayo|Shuri|Nakia|Ironheart|Valkyrie|Hela|Sif|Pepper Potts|Ms. Marvel|She-Hulk|Yelena Belova|Taskmaster|Sharon Carter|Agatha Harkness|Maria Hill|Peggy Carter|Darcy Lewis|Ghost|MJ|Aunt May|Thena|Makkari|Ajak|Sersi|Sprite|Monica Rambeau|America Chavez|Echo|Jessica Jones|Elektra|Jean Grey|Invisible Woman|Silver Surfer|Captain Carter|Lola Bunny|Minnie Mouse|Daisy Duck|Elsa|Moana|Mulan|Violet|Elastigirl|Sandy Cheeks|Lisa Simpson|Marge Simpson|Velma|Lucy van Pelt|Peppermint Patty|Blossom|Bubbles|Buttercup|Katara|Toph Beifong|Tigress|Bluey|Anna|Vanellope von Schweetz|Princess Peach|Princess Daisy|Rosalina|Samus Aran|Zelda|Princess Zelda|Lara Croft|Chun-Li|Sonya Blade|Kitana|Mileena|Bayonetta|Jill Valentine|Ada Wong|Ellie|Aloy'.split('|'));
const CAMPAIGN_RED=new Set('Iron Man|Spider-Man|Scarlet Witch|Vision|Red Guardian|Red Skull|Daredevil|Deadpool|Human Torch|Star-Lord|Carnage|Mario|Knuckles|Diddy Kong|Donkey Kong|Raphael|Lightning McQueen|Mr. Incredible|Elastigirl|Blossom|Optimus Prime|Zuko|Yosemite Sam|Mr. Krabs|Anger|Incineroar|Scorpion|Flash|The Flash|Ant-Man|Wreck-It Ralph|Mickey Mouse'.split('|'));
const CAMPAIGN_KIDS=new Set('Spider-Man|Ms. Marvel|Ironheart|America Chavez|Sprite|Franklin Richards|Dash|Violet|Jack-Jack|Blossom|Bubbles|Buttercup|Bluey|Bingo|Bart Simpson|Lisa Simpson|Charlie Brown|Lucy van Pelt|Peppermint Patty|Aang|Toph Beifong|Zuko|Katara|Sokka|Morty|Ned Leeds|MJ|Vanellope von Schweetz|Ness|Lucas|Ash Ketchum|Pokémon Trainer|Young Link|Kid Link|Baby Mario|Baby Luigi|Dora the Explorer|Jimmy Neutron|Dexter|Timmy Turner|Penny Proud|Phineas|Ferb|Stewie Griffin|Maggie Simpson|Huey|Dewey|Louie|Lincoln Loud'.split('|'));
const CAMPAIGN_MORTAL=new Set('Black Widow|Hawkeye|Kate Bishop|Falcon|Happy Hogan|Howard Stark|Nick Fury|Maria Hill|Phil Coulson|Peggy Carter|Jimmy Woo|Darcy Lewis|Sharon Carter|Yelena Belova|Zemo|Katy|MJ|Ned Leeds|Aunt May|Kingpin|The Punisher|Mulan|Phil|Tarzan|Fred Jones|Velma|Shaggy|Hank Hill|Bob Belcher|Sokka|Marge Simpson|Lisa Simpson|Bart Simpson|Charlie Brown|Peppermint Patty|Moana|Edna Mode|Porky Pig|Minnie Mouse|Lola Bunny'.split('|'));
// Pokémon and Star Wars characters for the themed stages.
for (const n of ['Leia Organa','Padmé Amidala','Rey','Ahsoka Tano','Aayla Secura','Asajj Ventress','Reva','Jyn Erso','Mon Mothma','Hera Syndulla','Sabine Wren','Rose Tico','Admiral Holdo','Maz Kanata','Bo-Katan Kryze','Fennec Shand','Aurra Sing','Cara Dune','Captain Phasma','Omega',"Qi'ra",'Enfys Nest','Nidoran♀','Nidorina','Nidoqueen','Chansey','Kangaskhan','Jynx']) CAMPAIGN_WOMEN.add(n);
for (const n of ['Darth Maul','Savage Opress','Charmander','Charmeleon','Krabby','Kingler','Magmar','Voltorb','Electrode','Paras','Parasect','Vileplume','Jynx','Flareon']) CAMPAIGN_RED.add(n);
for (const n of ['Grogu','Omega','Ezra Bridger']) CAMPAIGN_KIDS.add(n);
for (const n of ['Han Solo','Lando Calrissian','Wedge Antilles','Nien Nunb','Admiral Ackbar','Mon Mothma','Bail Organa','Padmé Amidala','Jyn Erso','Cassian Andor','Saw Gerrera','Baze Malbus','Hera Syndulla','Sabine Wren','Poe Dameron','Finn','Rose Tico','Admiral Holdo','Grand Moff Tarkin','Grand Admiral Thrawn','Director Krennic','Moff Gideon','Stormtrooper','Death Trooper','Captain Phasma','General Hux','Boba Fett','Jango Fett','The Mandalorian','Bo-Katan Kryze','Cad Bane','Fennec Shand','Aurra Sing','Greedo','Cara Dune','Cobb Vanth','Greef Karga','Kuiil','Migs Mayfeld','Captain Rex','Commander Cody',"Qi'ra",'Tobias Beckett','Enfys Nest']) CAMPAIGN_MORTAL.add(n);
function campaignDefault(){return {status:'setup',step:0,sport:'basketball',teamName:'The Challengers',roster:{},selected:null,query:'',infoId:null,history:[],result:null,stageOrder:null};}
function loadCampaign(){
  const saved=lsGet('da.campaign.v1',{}),v={...campaignDefault(),...saved};
  if(!SPORTS[v.sport]||!Number.isInteger(v.step)||v.step<0||v.step>10||!Array.isArray(v.history)){return campaignDefault();}
  v.history=v.history.slice(0,10);
  if(!Array.isArray(v.stageOrder)||v.stageOrder.length!==10)v.stageOrder=v.step>0?CAMPAIGN_STAGES.map((_,i)=>i):null;
  v.roster=Object.fromEntries(Object.entries(v.roster||{}).map(([id,cid])=>[id,candById('mashup',typeof cid==='string'?cid:cid?.id)]).filter(([,c])=>!!c));
  v.selected=null;v.query='';v.infoId=null;
  if(v.status==='results'&&!v.result)v.status='draft';
  return v;
}
function saveCampaign(){
  const v=S.campaign;
  lsSet('da.campaign.v1',{status:v.status,step:v.step,sport:v.sport,teamName:v.teamName,roster:Object.fromEntries(Object.entries(v.roster||{}).map(([p,c])=>[p,c.id])),history:v.history,result:v.result,stageOrder:v.stageOrder});
}
function campaignStage(){return campaignStages()[Math.min(9,S.campaign.step)];}
function campaignSlots(sport,rule){
  const slots=SPORTS[sport].pos;
  if(rule!=='short'&&rule!=='final')return slots;
  const starters=slots.filter(p=>!p.side&&!p.coach&&!p.bench);
  return starters;
}
function campaignLimit(sport,rule){
  const eligible=campaignSlots(sport,rule);
  return rule==='short'||rule==='final'?Math.max(1,Math.ceil(eligible.length*0.6)):eligible.length;
}
function campaignUsed(){return new Set(S.campaign.history.flatMap(h=>h.ids||[]));}
function campaignAllowed(c,rule){
  switch(rule){
    case 'fast':return c.a[0]>=90;
    case 'women':return CAMPAIGN_WOMEN.has(c.n);
    case 'red':return CAMPAIGN_RED.has(c.n);
    case 'kids':return CAMPAIGN_KIDS.has(c.n);
    case 'mortal':return c.pool==='nba'||CAMPAIGN_MORTAL.has(c.n);
    case 'brain':return c.a[9]>=87;
    case 'strong':return c.a[2]>=87;
    case 'underdog':return c.a.reduce((n,v)=>n+v,0)/c.a.length<=73;
    case 'final':return !campaignUsed().has(c.id);
    default:if(CAMPAIGN_TAGS[rule])return CAMPAIGN_TAGS[rule].has(c.n);return true;

  }
}
function campaignCandidates(rule){return getCands('mashup').filter(c=>campaignAllowed(c,rule));}
function campaignSportValid(sport){return [...CAMPAIGN_STAGES,...CAMPAIGN_EXTRA].filter(ch=>ch.rule==='final'||campaignCandidates(ch.rule).length>=campaignLimit(sport,ch.rule)).length>=10&&CAMPAIGN_STAGES.every(ch=>campaignCandidates(ch.rule).length>=campaignLimit(sport,ch.rule));}
function campaignQualified(){
  const v=S.campaign,st=campaignStage();
  return Object.values(v.roster).every(c=>campaignAllowed(c,st.rule));
}
function campaignReady(){
  const v=S.campaign,st=campaignStage(),slots=campaignSlots(v.sport,st.rule),pick=slots.map(p=>v.roster[p.id]).filter(Boolean);
  return pick.length===campaignLimit(v.sport,st.rule)&&new Set(pick.map(c=>c.id)).size===pick.length&&Object.keys(v.roster).every(id=>slots.some(p=>p.id===id));
}
function campaignProgress(){
  const v=S.campaign,done=v.status==='complete'?10:v.step;
  return `<div class="panel" style="padding:14px 16px;margin-bottom:14px">
    <div class="row" style="justify-content:space-between;align-items:center"><b>Campaign progress</b><span class="num">${done} / 10 wins</span></div>
    <div class="meter" role="progressbar" aria-label="Campaign wins" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="10"><i style="width:${done*10}%"></i></div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">${campaignStages().map((ch,i)=>`<span class="chip" title="${esc(ch.name)}" style="${i<done?'border-color:var(--good);color:var(--good)':i===v.step&&v.status!=='complete'?'border-color:var(--accent-strong)':''}">${i+1}. ${esc(ch.name)}</span>`).join('')}</div>
  </div>`;
}
function renderCampaignSetup(){
  const v=S.campaign,existing=v.step>0||v.status!=='setup';
  return `<section class="setup">
    <div class="mode-intro panel"><b>Championship · Campaign</b><span>Win ten different challenges in order to claim the campaign crown. Every stage changes who qualifies or how many players you get. The list never reveals eligibility; you must know your picks. A loss means retrying that stage; completed wins remain saved on this device.</span></div>
    <div class="panel rules" style="margin-bottom:16px"><div class="field-label"><span>Championship mode</span><div class="seg"><button data-act="c-kind" data-v="classic">Perfect Season</button><button data-act="c-kind" data-v="campaign" aria-pressed="true">Campaign · 10 challenges</button></div></div></div>
    ${campaignProgress()}
    <div class="step"><div class="step-head"><span class="n">1</span><h2 class="h">Pick a sport</h2></div>
      <div class="sports">${SPORT_ORDER.map(k=>`<button class="sport" data-act="camp-sport" data-sport="${k}" aria-pressed="${v.sport===k}" ${campaignSportValid(k)?'':'disabled title="Not enough eligible characters for all ten challenges"'}><span class="glyph">${sportGlyph(k)}</span><b>${esc(SPORTS[k].name)}</b><span>${campaignSportValid(k)?'10 campaign challenges':'Not enough eligible characters'}</span></button>`).join('')}</div>
      <p class="note">Campaign drafts from the All-Star Mashup (all built-in universes), so themed rounds always have a broad selection. Changing sports starts a new campaign.</p>
    </div>
    <div class="step"><div class="step-head"><span class="n">2</span><h2 class="h">Your team</h2></div><div class="panel rules"><label class="field-label"><span>Team name</span><input data-input="camp-team" maxlength="32" value="${esc(v.teamName)}" placeholder="The Challengers"></label></div></div>
    <div class="cta-row"><button class="btn primary big" data-act="camp-start">${existing?'Resume campaign':'Begin the campaign'}</button>${existing?'<button class="btn" data-act="camp-reset">Restart from challenge 1</button>':''}<span class="note">Win all ten matchups to become Campaign Champion.</span></div>
  </section>`;
}
function renderCampaignDraft(){
  const v=S.campaign,st=campaignStage(),slots=campaignSlots(v.sport,st.rule),allowedSet=new Set(slots.map(p=>p.id));
  const filled=slots.filter(p=>v.roster[p.id]).length,limit=campaignLimit(v.sport,st.rule),valid=campaignReady(),all=getCands('mashup'),taken=new Set(Object.values(v.roster).map(c=>c.id));
  const pos=SPORTS[v.sport].pos.find(p=>p.id===v.selected);
  const pool=getPool('mashup'),q=v.query.toLowerCase().trim();
  const matches=all.filter(c=>!q||c.n.toLowerCase().includes(q)||c.t.toLowerCase().includes(q)).sort((a,b)=>a.n.localeCompare(b.n));
  const previouslyUsed=st.rule==='final'?campaignUsed():new Set();
  const picker=pos?`<div class="panel picker open">
    <div class="picker-head"><div class="row" style="justify-content:space-between"><div><div class="eyebrow">Campaign draft</div><h3 class="h">${esc(pos.nm)}</h3></div><div class="row"><button class="btn small" data-act="camp-remove" ${v.roster[pos.id]?"":"disabled"}>Remove</button><button class="btn small" data-act="camp-close">Done</button></div></div><div class="needs">${needsText(pos).map(t=>`<span>${esc(t)}</span>`).join('')}</div></div>
    <div class="picker-tools"><input id="camp-query" data-input="camp-query" type="text" value="${esc(v.query)}" placeholder="Search all ${all.length} characters" autocomplete="off"></div>
    <div class="row" style="gap:3px;flex-wrap:wrap;padding:6px">${"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(letter=>`<button class="btn small" type="button" data-act="camp-letter" data-letter="${letter}" style="padding:3px 6px">${letter}</button>`).join("")}</div><div class="plist" id="camp-plist">${matches.length?matches.map(c=>`<div class="row" style="gap:4px;padding:0 6px"><button class="cand" style="min-width:0;flex:1" data-act="camp-pick" data-cid="${esc(c.id)}" ${previouslyUsed.has(c.id)||taken.has(c.id)&&v.roster[pos.id]?.id!==c.id?'disabled':''}>${avatar(c)}<span class="who"><b>${esc(c.n)}</b><small>${esc(c.t)}</small></span>${previouslyUsed.has(c.id)?'<span class="meta muted">Previously used</span>':taken.has(c.id)?'<span class="meta muted">On roster</span>':''}</button><button type="button" class="btn small" style="flex:none;padding:6px 10px" data-act="camp-info" data-cid="${esc(c.id)}" aria-label="Where is ${esc(c.n)} from?" title="Character origin">ⓘ</button></div>`).join(''):'<div class="empty-state">No characters match your search.</div>'}</div>
  </div><div class="sheet-backdrop open" data-act="camp-close"></div>`:
  `<div class="panel"><div class="sec"><h3 class="h">Your lineup</h3><span class="num muted">${filled}/${limit}</span></div>
    <div class="roster-list">${SPORTS[v.sport].pos.map(p=>`<button class="rl ${v.roster[p.id]?'':'empty'}" data-act="camp-slot" data-slot="${p.id}" ${allowedSet.has(p.id)?'':'disabled'}><span class="ab">${p.ab}</span><span class="who"><b>${!allowedSet.has(p.id)?'Locked for this challenge':v.roster[p.id]?esc(v.roster[p.id].n):'Open — tap to fill'}</b><small>${esc(p.nm)}</small></span>${v.roster[p.id]?avatar(v.roster[p.id]):''}</button>`).join('')}</div>
    <div class="sec"><span class="note">${filled===limit?'Ready to play.':'Choose '+limit+' positions from the available starters.'}</span><button class="linkish" data-act="camp-random">Fill available spots</button></div>
  </div>`;
  return `<section>${campaignProgress()}
    <div class="panel" style="padding:16px;margin-bottom:14px"><div class="eyebrow">Challenge ${v.step+1} / 10 · ${esc(SPORTS[v.sport].name)}</div><h2 class="h" style="margin:4px 0 8px">${esc(st.name)}</h2><p style="margin:0">${esc(st.blurb)}</p><p class="note" style="margin:8px 0 0">${all.length} characters to choose from · ${limit} roster spots · Opponent: ${esc(st.rival)}.</p></div>
    ${v.validation?`<div class="panel" role="alert" style="padding:12px 16px;border:1px solid var(--bad);margin-bottom:12px"><b>Lineup rejected</b><p style="margin:4px 0 0">${esc(v.validation)}</p></div>`:''}
    <div class="board-head"><div class="title"><span class="eyebrow">Campaign · All-Star Mashup</span><h2 class="h">${esc(v.teamName||'Your team')}</h2></div><span class="chip num">${filled}/${limit}</span><button class="btn" data-act="camp-setup">Campaign overview</button><button class="btn primary" data-act="camp-play" ${valid?'':'disabled'}>Submit lineup & play</button></div>
    <div class="board"><div>${renderField(v.sport,v.roster,{sel:v.selected,interactive:true,eligibleSlots:allowedSet})}</div><div class="board-side">${picker}</div></div>
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
  if(!campaignReady())return toast('Fill all available roster spots first.');
  if(!campaignQualified()){
    S.campaign.validation='Some picks do not meet this challenge’s restrictions. Reconsider your lineup.';
    return;
  }
  S.campaign.validation='';
  const v=S.campaign,st=campaignStage(),gameSeed=Date.now()+':'+Math.random(),rng=rngFrom(gameSeed);
  const score=teamScore(v.sport,v.roster),excluded=new Set(Object.values(v.roster).map(c=>c.id));
  // Each opponent is a complete team, generally stronger than your restricted roster.
  const target=score.rating+1.5+v.step*0.7;
  const opp=campaignOpponent(v.sport,excluded,target,rng);
  const game=playGame(v.sport,score,opp.score,SEASONS[v.sport].sigma*1.1,rng,true);
  const win=game.winner===0,ourPoints=win?game.line[0]:game.line[1],theirPoints=win?game.line[1]:game.line[0];
  v.result={win,ourPoints,theirPoints,report:daReport(v.sport,score,ourPoints,v.teamName,{seed:gameSeed,note:game.line[2],side:win?0:1,opponentPoints:theirPoints}),opponentReport:daReport(v.sport,opp.score,theirPoints,st.rival,{seed:gameSeed+':rival',note:game.line[2],side:win?1:0,opponentPoints:ourPoints}),note:game.line[2]||'',ourRating:+score.rating.toFixed(1),theirRating:+opp.score.rating.toFixed(1),opponent:st.rival,names:Object.values(v.roster).map(c=>c.n),ids:Object.values(v.roster).map(c=>c.id)};
  v.status='results';saveCampaign();
}
function campaignOrigin(c){
  if(!c)return {universe:'Unknown',work:'Unknown origin'};
  const universe=universeLabel(c.pool);
  const guide=window.DA_CHARACTER_GUIDES?.[c.pool]?.[c.n];
  if(guide?.works?.length)return {universe,work:guide.works.slice(0,3).join(' · ')};
  const entry=POOLS[c.pool]?.entries?.find(x=>x[0]===c.n);
  const tags=Array.isArray(entry?.[4])?entry[4]:[];
  if(c.pool==='games'&&tags.length)return {universe,work:tags[0].replace(/ Franchise$/,' franchise')};
  const groupNames=(c.g||[]).map(id=>GROUPS[id]?.name).filter(Boolean);
  const preferred=groupNames.find(n=>/Sesame Street|Fraggle Rock|The Muppet Show|The Simpsons|Looney Tunes|SpongeBob|Avatar|Kung Fu Panda|Tom and Jerry|Scooby|Peanuts|Mario|Zelda|Sonic|Disney|Pixar|Rick and Morty|Powerpuff|Transformers|Teenage Mutant|Mickey|Ralph|Incredibles|Shrek|Bluey/i.test(n));
  if(preferred)return {universe,work:preferred};
  return {universe,work:c.pool==='mcu'?'Marvel Cinematic Universe':c.pool==='nba'?'National Basketball Association':universe};
}
function renderCampaignInfo(){
  const id=S.campaign.infoId;
  if(!id||S.mode!=='champ'||!S.champ.campaignMode)return '';
  const c=candById('mashup',id);
  if(!c)return '';
  const o=campaignOrigin(c);
  return `<div class="modal-back" data-act="camp-info-close"><div class="modal" role="dialog" aria-modal="true" aria-label="Character origin" data-stop="1">
    <div class="row" style="justify-content:space-between"><h2 class="h">${esc(c.n)}</h2><button class="btn small" data-act="camp-info-close">Close</button></div>
    <p class="note">Where this character is from</p><p><b>${esc(o.work)}</b></p><p class="muted">Talent pool: ${esc(o.universe)}</p>
  </div></div>`;
}
function renderCampaignResults(){
  const v=S.campaign,r=v.result,st=campaignStage();
  if(!r){v.status='draft';return renderCampaignDraft();}
  return `<section>${campaignProgress()}<div class="result-hero ${r.win?'perfect':''}">
    <span class="eyebrow" style="color:inherit">Challenge ${v.step+1} / 10 · ${esc(st.name)}</span>
    <div class="big">${r.win?'<em>Challenge won</em>':'Challenge lost'}</div>
    <p>${r.win?'You cleared this stage.':'Your completed campaign wins are safe. Rework your lineup or retry this matchup.'}</p>
    <div class="scorebug"><div style="background:var(--you);color:#fff">${esc(v.teamName||'Your team')} <span class="s">${r.ourPoints}</span></div><div style="background:var(--opp);color:#fff">${esc(r.opponent)} <span class="s">${r.theirPoints}</span></div></div>
  </div>
  <div class="panel" style="padding:16px;margin-top:14px"><p style="margin:0">Your team rating: <b class="num">${r.ourRating}</b> · Rival rating: <b class="num">${r.theirRating}</b></p><p class="note" style="margin:8px 0 0">Roster: ${esc(r.names.join(', '))}</p></div>
  ${r.report||""}<details class="panel" style="padding:14px;margin:12px 0"><summary>Opponent box score</summary>${r.opponentReport||""}</details>
  <div class="cta-row">${r.win?`<button class="btn primary big" data-act="camp-next">${v.step===9?'Claim campaign championship':'Unlock challenge '+(v.step+2)}</button>`:`<button class="btn primary" data-act="camp-retry">Retry this challenge</button><button class="btn" data-act="camp-edit">Edit your lineup</button>`}<button class="btn" data-act="camp-setup">Campaign overview</button></div></section>`;
}
function renderCampaignComplete(){
  const v=S.campaign;
  return `<section>${campaignProgress()}<div class="result-hero perfect"><span class="eyebrow" style="color:inherit">10 / 10 challenges won</span><div class="big"><em>Campaign Champion</em></div><p>${esc(v.teamName)} completed all ten restricted-roster matchups. Every stage has been cleared.</p></div>
    <div class="panel" style="padding:16px;margin-top:14px"><h2 class="h">Your ten victories</h2><div class="roster-list">${v.history.map((x,i)=>`<div class="rl"><span class="ab">${i+1}</span><span class="who"><b>${esc(x.name)}</b><small>${esc(x.names.join(', '))}</small></span></div>`).join('')}</div></div>
    <div class="cta-row"><button class="btn primary" data-act="camp-reset">Start a new campaign</button><button class="btn" data-act="camp-setup">Campaign overview</button></div></section>`;
}
function renderCampaign(){
  const status=S.campaign.status;
  return status==='draft'?renderCampaignDraft():status==='results'?renderCampaignResults():status==='complete'?renderCampaignComplete():renderCampaignSetup();
}
function campaignReset(){S.campaign=campaignDefault();S.campaign.stageOrder=campaignNewOrder(S.campaign.sport);saveCampaign();}
function campaignAdvance(){
  const v=S.campaign;
  if(v.status!=='results'||!v.result?.win)return;
  v.history.push({name:campaignStage().name,names:v.result.names,ids:v.result.ids,report:v.result.report,score:v.result.ourPoints+'–'+v.result.theirPoints});
  v.step++;
  v.roster={};v.selected=null;v.query='';v.result=null;
  v.status=v.step>=campaignStages().length?'complete':'draft';
  saveCampaign();
}

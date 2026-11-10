// Browser-level smoke test: navigation, modal scroll retention, drafting, results.
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname==='/'
   ?'/index.html':new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
 fs.readFile(file,(err,content)=>{
  if(err){res.writeHead(404).end('Not found');return;}
  res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'}).end(content);
 });
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 try{
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'domcontentloaded',timeout:30000});
  // Daily Grid: exercise the actual mobile interface, answer validation, and local persistence.
  await page.locator('button[data-act="mode"][data-mode="grid"]').click();
  assert.equal(await page.locator('.dg-board button[data-act="grid-cell"]').count(),9,'Daily Grid does not render nine playable squares');
  const daily=await page.evaluate(()=>{
    const date=DailyGrid.today(),p=DailyGrid.puzzle(date);
    const column=p.cols[0],idx=AK.indexOf(column.key);
    const candidate=getCands(p.rows[0]).find(c=>c.a[idx]>=column.min);
    if(!candidate)throw Error('Impossible daily-grid intersection');
    return {date,id:candidate.id,name:candidate.n};
  });
  await page.locator('.dg-board button[data-i="0"]').click();
  await page.locator('#dg-query').fill(daily.name.slice(0,Math.min(5,daily.name.length)));
  await page.locator('.dg-result[data-cid="'+daily.id+'"]').click();
  assert.equal(await page.locator('.dg-board button[data-i="0"].dg-good').count(),1,'Eligible Daily Grid answer was rejected');
  const dailySaved=await page.evaluate(date=>JSON.parse(localStorage.getItem('da.daily-grid.v1.'+date)||'null'),daily.date);
  assert.equal(dailySaved.cells[0].id,daily.id,'Daily Grid did not save the pick');
  await page.locator('.dg-board button[data-i="1"]').click();
  await page.locator('#dg-query').fill(daily.name.slice(0,Math.min(5,daily.name.length)));
  await page.locator('.dg-result[data-cid="'+daily.id+'"]').click();
  assert.equal(await page.locator('.dg-board button[data-i="1"].dg-empty').count(),1,'A character was used twice');
  await page.locator('button[data-act="grid-close"]').click();
  await page.locator('button[data-act="grid-archive"]').click();
  assert.equal(await page.locator('.dg-archive').count(),1,'Archive failed to open');
  await page.locator('button[data-act="mode"][data-mode="champ"]').click();
  // The rating explanation reconciles with the exact simulation arithmetic.
  const engineCheck=await page.evaluate(()=>{
    const A={rating:105.3,sig:{chaos:0,spark:[]}},B={rating:106.9,sig:{chaos:0,spark:[]}};
    const result=playGame('brawl',A,B,7,rngFrom('breakdown-fixture'),true);
    const d=result.breakdown;
    const sum=i=>d.base[i]+d.chaos[i]+d.spark[i]+d.random[i];
    return {actual:d.final,reconstructed:[sum(0),sum(1)],margin:result.margin,who:result.winner};
  });
  assert.ok(engineCheck.actual.every((v,i)=>Math.abs(v-engineCheck.reconstructed[i])<1e-9),'Match explanation did not reconcile');
  assert.ok(Math.abs(Math.abs(engineCheck.actual[0]-engineCheck.actual[1])-engineCheck.margin)<1e-9,'Match margin inconsistent');
  assert.equal(engineCheck.actual[0]>engineCheck.actual[1]?0:1,engineCheck.who,'Trace indicates a different winner');
  // Verify that the same named coach can suit one roster but hurt another.
  const styles=await page.evaluate(()=>{
    const team=fast=>{
      const roster={};
      for(const p of SPORTS.basketball.pos){
        const attrs=Array(12).fill(80);
        for(const key of ['spd','acc','agi'])attrs[AK.indexOf(key)]=fast?98:24;
        roster[p.id]={id:'fixture:'+p.id,pool:'mcu',n:'Player '+p.id,a:attrs,g:[]};
      }
      roster.hc={id:'nba:coach-fixture',pool:'nba',n:"Mike D'Antoni",a:Array(12).fill(80),g:[]};
      return synergyOf('basketball',roster).style;
    };
    return {good:team(true),poor:team(false)};
  });
  assert.ok(styles.good.pts>0.15&&styles.good.match==='Good fit','Expected compatible roster to get a positive style fit');
  assert.ok(styles.poor.pts<-.15&&styles.poor.match==='Poor fit','Expected mismatched roster to be penalized');
  await page.locator('button[data-act="c-kind"][data-v="campaign"]').click();
  await page.locator('button[data-act="camp-start"]').click();
  // Opening a candidate picker must preserve page scroll and must not enable a stale
  // fixed-viewport mode left over from other Championship drafts.
  const opening=await page.evaluate(()=>{
    const max=document.documentElement.scrollHeight-innerHeight;
    window.scrollTo(0,Math.min(220,Math.max(0,max)));
    const before=window.scrollY;
    const btn=document.querySelector('.field button[data-act="slot"]:not([disabled])');
    btn.click();
    return {before,after:window.scrollY,scrollable:max,locked:document.documentElement.classList.contains('draft-active')};
  });
  assert.equal(opening.locked,false,'Campaign inherited fixed draft layout from another mode');
  assert.ok(Math.abs(opening.after-opening.before)<2,'Opening the character picker jumped the page: '+JSON.stringify(opening));
  await page.locator('#camp-plist .cand').first().waitFor({timeout:10000});
  const scroll=await page.evaluate(()=>{
   const el=document.getElementById('camp-plist');el.scrollTop=470;return el.scrollTop;
  });
  await page.evaluate(()=>{
   const list=document.getElementById('camp-plist'),rect=list.getBoundingClientRect();
   const visible=[...list.querySelectorAll('button[data-act="camp-info"]')].find(btn=>{
    const r=btn.getBoundingClientRect();return r.top>=rect.top&&r.bottom<=rect.bottom;
   });
   if(!visible)throw Error('No visible character information button');
   visible.click();
  });
  await page.locator('.modal button[data-act="camp-info-close"]').click();
  const after=await page.evaluate(()=>document.getElementById('camp-plist').scrollTop);
  assert.ok(Math.abs(after-scroll)<4,'Info dialog changed talent list scroll position: '+scroll+' -> '+after);
  const rail=page.locator('[data-az-list="camp-plist"]');
  await rail.waitFor();
  const bounds=await rail.boundingBox();
  assert.ok(bounds&&bounds.width<40,'Vertical alphabetical rail is not visible or too wide');
  await page.mouse.move(bounds.x+bounds.width/2,bounds.y+6);
  await page.mouse.down();
  await page.mouse.move(bounds.x+bounds.width/2,bounds.y+bounds.height*12.5/26,{steps:15});
  await page.mouse.up();
  assert.equal(await rail.locator('.az-letter.active').textContent(),'M','A-Z drag did not jump to M');
  assert.ok(await page.evaluate(()=>document.getElementById('camp-plist').scrollTop)>scroll,'Alphabet jump did not advance the list');
  const nameFont=await page.locator('#camp-plist .cand .who b').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  assert.ok(nameFont>=16,'Mobile character rows are too small: '+nameFont);
  await page.evaluate(()=>{
   const stage=campaignStage();
   const eligible=getCands('mashup').find(c=>campaignAllowed(c,stage.rule));
   if(!eligible)throw Error('No eligible character in '+stage.rule);
   const btn=[...document.querySelectorAll('#camp-plist button[data-act="camp-pick"]')].find(b=>b.dataset.cid===eligible.id);
   if(!btn)throw Error('Eligible character not rendered in picker');
   btn.click();
  });
  const positionAfterPick=await page.evaluate(()=>window.scrollY);
  assert.ok(Math.abs(positionAfterPick-opening.before)<2,'Selecting a character reset the page position');
  // Selecting a filled field position pins its current character above the scrolling list.
  const chosen=await page.evaluate(()=>Object.values(S.campaign.roster)[0].n);
  await page.locator('.field-wrap button[data-act="slot"].filled:not([disabled])').first().click();
  assert.equal((await page.locator('.picker-current .who b').textContent()).trim(),chosen);
  await page.evaluate(()=>{document.getElementById('camp-plist').scrollTop=850;});
  assert.equal((await page.locator('.picker-current .who b').textContent()).trim(),chosen);
  await page.locator('[data-act="camp-close"]').first().click();
  assert.equal(await page.getByRole('heading',{name:'Your lineup'}).count(),0,'Redundant lineup list is still visible');
  // Fill remaining roster slots with eligible characters, keeping one manual pick.
  await page.evaluate(()=>{
   const v=S.campaign,st=campaignStage(),taken=new Set(Object.values(v.roster).map(x=>x.id));
   const limit=campaignLimit(v.sport,st.rule);
   for(const slot of campaignSlots(v.sport,st.rule)){
    if(Object.keys(v.roster).length>=limit)break;
    if(v.roster[slot.id])continue;
    const candidate=getCands('mashup').find(x=>!taken.has(x.id)&&campaignAllowed(x,st.rule));
    if(!candidate)throw Error('Could not fill eligible campaign roster for '+st.rule);
    v.roster[slot.id]=candidate;taken.add(candidate.id);
   }
   render();
  });
  // Long-hold a character and move it to a different filled field spot.
  const slots=await page.locator('.field button[data-act="slot"].filled:not([disabled])').all();
  assert.ok(slots.length>=2,'Need at least two drafted characters for swapping');
  const from=await slots[0].getAttribute('data-slot'),to=await slots[1].getAttribute('data-slot');
  const beforeSwap=await page.evaluate(ids=>[S.campaign.roster[ids[0]].id,S.campaign.roster[ids[1]].id],[from,to]);
  const a=await slots[0].boundingBox(),b=await slots[1].boundingBox();
  await page.mouse.move(a.x+a.width/2,a.y+a.height/2);
  await page.mouse.down();
  await page.waitForTimeout(470);
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:10});
  await page.mouse.up();
  const afterSwap=await page.evaluate(ids=>[S.campaign.roster[ids[0]].id,S.campaign.roster[ids[1]].id],[from,to]);
  assert.deepEqual(afterSwap,[beforeSwap[1],beforeSwap[0]],'Long-press drag failed to swap the field positions');
  // Exercise actual touch input rather than relying only on mouse-pointer emulation.
  const cdp=await page.context().newCDPSession(page);
  const c=await page.locator('.field button[data-slot="'+to+'"]').boundingBox();
  const d=await page.locator('.field button[data-slot="'+from+'"]').boundingBox();
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:c.x+c.width/2,y:c.y+c.height/2}]});
  await page.waitForTimeout(490);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:d.x+d.width/2,y:d.y+d.height/2}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  const afterTouch=await page.evaluate(ids=>[S.campaign.roster[ids[0]].id,S.campaign.roster[ids[1]].id],[from,to]);
  assert.deepEqual(afterTouch,beforeSwap,'Touch hold-and-drag failed to restore original positions');

  // A rejected roster triggers a centered dialog and leaves the offending field
  // positions marked red until they are replaced, without jumping the page.
  const rejected=await page.evaluate(()=>{
    const v=S.campaign;
    v.stageOrder[0]=0; // No Powers Allowed: reliably test an eligibility restriction.
    const rule=campaignStage().rule;
    const used=new Set(Object.values(v.roster).map(c=>c.id));
    // A previously randomized short-handed stage may have drafted fewer slots.
    // Fill the full unrestricted stage before testing eligibility rejection.
    for(const p of campaignSlots(v.sport,rule)){
      if(v.roster[p.id])continue;
      const next=getCands('mashup').find(c=>campaignAllowed(c,rule)&&!used.has(c.id));
      if(!next)throw Error('Cannot complete rejection test roster');
      v.roster[p.id]=next;used.add(next.id);
    }
    const slot=campaignSlots(v.sport,rule)[0].id;
    const existing=new Set(Object.values(v.roster).map(c=>c.id));
    const bad=getCands('mashup').find(c=>!campaignAllowed(c,rule)&&!existing.has(c.id));
    if(!bad)throw Error('Could not select a failing candidate');
    v.roster[slot]=bad;
    v.selected=null;v.validation='';v.validationOpen=false;
    render();
    const max=document.documentElement.scrollHeight-window.innerHeight;
    window.scrollTo(0,Math.min(180,Math.max(0,max)));
    const before=window.scrollY;
    const invalid=[...campaignInvalidSlots()];
    document.querySelector('[data-act="camp-play"]').click();
    return {before,after:window.scrollY,invalid,slot,bad:bad.n};
  });
  assert.ok(rejected.invalid.includes(rejected.slot),'Intentionally ineligible character not detected');
  assert.ok(Math.abs(rejected.after-rejected.before)<2,'Submitting a rejected lineup jumped the page');
  const modal=page.locator('[role="alertdialog"][aria-modal="true"]');
  await modal.waitFor();
  assert.ok((await modal.textContent()).includes(rejected.bad),'Rejection dialog did not identify offending character');
  const dialogBox=await modal.boundingBox();
  assert.ok(Math.abs(dialogBox.y+dialogBox.height/2-844/2)<110,'Rejected lineup dialog is not centered');
  assert.equal(await page.locator('.field-wrap button.invalid').count(),rejected.invalid.length,'Not all ineligible positions marked red');
  assert.ok(await page.locator('.field-wrap button.invalid[data-slot="'+rejected.slot+'"]').count(),'Ineligible field slot not highlighted');
  // Clicking the message text is NOT a backdrop click.
  await modal.locator('#campaign-reject-description').click();
  assert.equal(await modal.count(),1,'Tap inside rejection modal dismissed it');
  await page.locator('button[data-act="camp-reject-close"]').click();
  assert.equal(await modal.count(),0,'Rejection dialog did not close');
  assert.ok(await page.locator('.field-wrap button.invalid').count(),'Red field indicators disappeared before correction');

  // A thematic rejection exposes the research appeal without revealing eligibility
  // before the player submits their lineup.
  const disputed=await page.evaluate(()=>{
    const v=S.campaign;
    v.stageOrder[0]=20; // The Medics, a theme with evidence-based qualification.
    const slot=campaignSlots(v.sport,campaignStage().rule)[0].id;
    const nonhealer=getCands('mashup').find(c=>c.n==='Sokka');
    if(!nonhealer)throw Error('Missing Sokka test fixture');
    v.roster[slot]=nonhealer;
    v.validation='The highlighted characters do not meet this challenge.';
    v.validationOpen=true;
    render();
    return {slot,candidate:nonhealer.id};
  });
  await page.locator('[role="alertdialog"] [data-act="camp-dispute-open"]').first().click();
  const disputeDialog=page.locator('[role="dialog"][aria-label="Challenge character eligibility"]');
  await disputeDialog.waitFor();
  assert.ok((await disputeDialog.textContent()).includes('AI Character Knowledge Engine'));
  // Reproduce the iPhone bug: a real pointer click into the textarea and source
  // field must neither dismiss nor re-render the dialog and steal input focus.
  const claim=page.locator('[data-input="camp-dispute-claim"]');
  const source=page.locator('[data-input="camp-dispute-source"]');
  await claim.click();
  assert.equal(await disputeDialog.count(),1,'Tapping inside the textarea closed the popup');
  assert.equal(await claim.evaluate(el=>document.activeElement===el),true,'The textarea did not receive focus');
  await page.keyboard.type('Sokka can treat battle wounds in this alternative storyline');
  assert.ok((await claim.inputValue()).includes('Sokka'));
  await source.click();
  assert.equal(await disputeDialog.count(),1,'Tapping inside the source field closed the popup');
  assert.equal(await source.evaluate(el=>document.activeElement===el),true,'The source field did not receive focus');
  await page.keyboard.type('https://example.org/character-feat');
  assert.equal(await source.inputValue(),'https://example.org/character-feat');
  assert.ok((await claim.inputValue()).includes('Sokka'),'Switching fields reset the written claim');
  await disputeDialog.locator('.field-label span').first().click();
  assert.equal(await disputeDialog.count(),1,'Clicking the form label dismissed the dialog');
  // Intercept the external research method to verify game state transitions locally.
  await page.evaluate(()=>{
    const previous=KnowledgeEngine.has.bind(KnowledgeEngine);
    KnowledgeEngine.challenge=async(c,tag)=>{
      KnowledgeEngine.has=(who,t)=>previous(who,t)||(who.pool===c.pool&&who.n===c.n&&t===tag);
      return {status:'accepted_provisional',dispute_id:'00000000-0000-4000-8000-000000000001',rationale:'Test verdict only',feat:'Test evidence',sources:['https://www.starwars.com']};
    };
  });
  await page.locator('[data-act="camp-dispute-submit"]').click();
  await page.locator('text=Accepted — eligible in this Campaign').first().waitFor();
  assert.ok((await page.locator('.knowledge-dialog').textContent()).includes('character is now eligible on this device'),'Appeal failed to communicate that the player can continue');
  await page.locator('.knowledge-dialog [data-act="camp-dispute-close"]').last().click();
  assert.equal(await page.locator('.field-wrap button.invalid[data-slot="'+disputed.slot+'"]').count(),0,'Successful provisional appeal should clear this particular invalid marker');
  assert.equal(await page.locator('button[data-act="camp-play"]').isEnabled(),true,'A valid lineup should remain submittable after the appeal');

  // Correct the roster using eligible selections only, with the same position.
  await page.evaluate(()=>{
    const v=S.campaign,st=campaignStage(),used=new Set();
    for(const slot of campaignSlots(v.sport,st.rule)){
      if(!v.roster[slot.id])continue;
      let chosen=v.roster[slot.id];
      if(!campaignAllowed(chosen,st.rule)||used.has(chosen.id)){
        chosen=getCands('mashup').find(c=>campaignAllowed(c,st.rule)&&!used.has(c.id));
        if(!chosen)throw Error('Insufficient valid options to correct roster');
        v.roster[slot.id]=chosen;
      }
      used.add(chosen.id);
    }
    v.validationOpen=false;
    if(campaignQualified())v.validation='';
    render();
  });
  assert.equal(await page.locator('.field-wrap button.invalid').count(),0,'Corrected lineup remains marked invalid');
  // Labels are unselectable, including during long-hold gestures.
  const textRules=await page.locator('.field-wrap .node .tag').first().evaluate(el=>({
    select:getComputedStyle(el).userSelect,webkit:getComputedStyle(el).webkitUserSelect
  }));
  assert.equal(textRules.select,'none','Field token labels can still be text selected');
  const selected=await page.locator('.field-wrap .node .tag').first().evaluate(el=>{
    const r=document.createRange();r.selectNodeContents(el);
    getSelection().removeAllRanges();getSelection().addRange(r);
    const ev=new Event('selectstart',{bubbles:true,cancelable:true});
    const allowed=el.dispatchEvent(ev);
    getSelection().removeAllRanges();
    return allowed;
  });
  assert.equal(selected,false,'Selecting field text was not prevented');
  await page.locator('button[data-act="camp-play"]').click();
  await page.locator('.da-result').first().waitFor({timeout:12000});
  assert.equal(await page.locator('.da-player-table').count(),1,'Match must have one roster/stat comparison');
  assert.equal(await page.locator('.da-detail-toggle[open]').count(),0,'Detailed stats should start collapsed');
  assert.ok(await page.locator('.da-totals .da-team-name').count()===2,'Missing side-by-side teams');
  assert.equal(await page.locator('text=Opponent box score').count(),0,'Old duplicate opponent report is still shown');
  await page.locator('.da-detail-toggle > summary').click();
  assert.equal(await page.locator('.da-detail-toggle[open]').count(),1,'View Detailed Stats did not open');
  assert.ok(await page.locator('.da-player-table .da-player').count()>1,'Missing player-by-player contributions');
  await page.locator('.da-inner-details > summary').click();
  assert.ok(await page.locator('text=Effective match rating').count(),'Match calculation hidden or missing');
  assert.ok(await page.locator('text=Match-day variation').count(),'Match variation detail missing');
  await page.locator('.da-summary-toggle > summary').click();
  assert.equal(await page.locator('.da-summary-toggle[open]').count(),1,'Read Summary did not open');
  assert.ok(await page.locator('.da-story').isVisible(),'Summary did not become visible');
  // An unchanged lineup gets identical scores, enemy roster, and result on retry.
  const replay=await page.evaluate(()=>{
    const original=S.campaign.result;
    const snapshot=r=>({win:r.win,score:[r.ourPoints,r.theirPoints],enemy:r.opponentNames,
      ratings:[r.ourRating,r.theirRating],tactics:r.tactics});
    const first=snapshot(original);
    S.campaign.status='draft';S.campaign.result=null;
    campaignPlay();
    return {first,again:snapshot(S.campaign.result)};
  });
  assert.deepEqual(replay.again,replay.first,'Retrying the unchanged team rerolled the match or opponent');
  // The active campaign has a one-shot variant control, which locks its result
  // and survives a page reload. Use a known legal flight-themed roster.
  await page.evaluate(()=>{
    const v=S.campaign,flight=CAMPAIGN_STAGES.length,slots=campaignSlots(v.sport,'flight');
    v.step=0;v.stageOrder[0]=flight;v.seed='mobile-surge-fixture';v.opponents={};
    v.surge=null;v.status='draft';v.result=null;v.validation='';
    const thor=getCands('mashup').find(c=>c.pool==='mcu'&&c.n==='Thor');
    if(!thor||!campaignAllowed(thor,'flight'))throw Error('Thor should qualify as a flying character');
    const chosen=new Set([thor.id]);
    v.roster={};
    for(const [i,p] of slots.entries()){
      const c=i===0?thor:getCands('mashup').find(c=>!chosen.has(c.id)&&campaignAllowed(c,'flight'));
      if(!c)throw Error('Unable to fill flight variant test');
      chosen.add(c.id);v.roster[p.id]=c;
    }
    saveCampaign();render();
  });
  const variantButton=page.locator('button[data-act="camp-variant"]');
  assert.equal(await variantButton.isEnabled(),true,'Variant button not enabled with Thor on legal roster');
  await variantButton.click();
  const variant=await page.evaluate(()=>{
    const v=S.campaign,active=campaignVariantForm(v),preview=campaignVariantRoster(v);
    return {surge:v.surge,active:!!active,changed:Object.values(preview).some(c=>c.n===v.surge?.name)};
  });
  assert.ok(variant.surge&&variant.active&&variant.changed,'Variant generator did not transform an eligible character');
  assert.equal(await variantButton.isDisabled(),true,'A second variant roll should not be available');
  await page.reload({waitUntil:'domcontentloaded'});
  const persisted=await page.evaluate(()=>({surge:S.campaign.surge,stage:S.campaign.step}));
  assert.equal(JSON.stringify(persisted.surge),JSON.stringify(variant.surge),'Variant result did not persist on reload');
  assert.equal(persisted.stage,0);
  // Previously missing DC / Doom variants must be selectable in the actual
  // mobile UI, and the final Siege must simulate two bosses for one full team.
  await page.evaluate(()=>{
    const v=S.campaign;
    v.step=0;v.stageOrder[0]=CAMPAIGN_STAGES.length-1;
    v.seed='multiverse-siege-mobile-fixture';v.opponents={};
    v.history=[];v.status='draft';v.surge=null;v.variantTarget=null;v.result=null;
    const rosterNames=[['dc','Batman'],['mcu','Doctor Doom'],['games','Mario'],['mcu','Thor'],
      ['lotr','Gandalf'],['dc','Superman'],['mcu','Ultron'],['toons','Bugs Bunny']];
    // Live candidate IDs are slugged. Research uses pool:display-name keys.
    const characters=rosterNames.map(([pool,name])=>getCands('mashup').find(c=>c.pool===pool&&c.n===name));
    if(characters.some(c=>!c))throw Error('Missing a Variant Surge mobile fixture');
    v.roster=Object.fromEntries(SPORTS[v.sport].pos.map((slot,i)=>[slot.id,characters[i]]));
    if(!campaignReady())throw Error('Three-universe final lineup is not ready');
    saveCampaign();render();
  });
  const variantTarget=page.locator('#camp-variant-target');
  await variantTarget.waitFor();
  assert.equal(await page.locator('button[data-act="camp-variant"]').isEnabled(),true,
    'Variant Surge should activate with Batman, Doom and other documented forms');
  const doomId=await page.evaluate(()=>getCands('mashup').find(c=>c.pool==='mcu'&&c.n==='Doctor Doom').id);
  await variantTarget.selectOption(doomId);
  await page.locator('button[data-act="camp-variant"]').click();
  const targeted=await page.evaluate(()=>S.campaign.surge);
  assert.equal(targeted.id,doomId,'User-targeted Doom should receive the variant');
  await page.locator('button[data-act="camp-play"]').click();
  const finalInfo=await page.evaluate(()=>({
    win:S.campaign.result?.win,rounds:S.campaign.result?.finalRounds,
    status:S.campaign.status
  }));
  assert.equal(finalInfo.status,'results','Finale should enter result screen');
  assert.equal(finalInfo.rounds?.length,2,'Finale should simulate two different bosses');
  assert.equal(await page.getByText('Multiverse Siege · Two bosses').count(),1,
    'Two-boss results should render in the mobile Campaign UI');
  // The Dealt Hand choices each expose origin info without selecting a card.
  await page.locator('button[data-act="mode"][data-mode="deal"]').click();
  await page.locator('button[data-act="c-start"]').click();
  await page.locator('.hand-option').first().waitFor();
  assert.equal(await page.locator('.hand-option [data-act="hand-info"]').count(),3,'Missing a Dealt Hand information icon');
  const selectedBefore=await page.evaluate(()=>S.champ.handSel);
  await page.locator('.hand-option [data-act="hand-info"]').first().click();
  await page.locator('.modal [data-act="hand-info-close"]').first().waitFor();
  assert.equal(await page.evaluate(()=>S.champ.handSel),selectedBefore,'Opening Info selected the hand card');
  await page.locator('.modal [data-act="hand-info-close"]').first().click();
  assert.equal(errors.length,0,'Browser JS errors: '+errors.join('; '));
  process.stdout.write('Browser gameplay smoke test passed: mobile campaign draft, A-Z, info scroll, simulated result.\\n');
 } finally {
  await browser.close(); await new Promise(resolve=>server.close(resolve));
 }
})().catch(error=>{console.error(error);process.exitCode=1;});

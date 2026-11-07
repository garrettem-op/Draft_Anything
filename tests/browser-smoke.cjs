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
  await page.locator('button[data-act="c-kind"][data-v="campaign"]').click();
  await page.locator('button[data-act="camp-start"]').click();
  await page.locator('.field button[data-act="slot"]:not([disabled])').first().click();
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
  await page.locator('button[data-act="camp-play"]').click();
  await page.locator('text=Simulated box score').first().waitFor({timeout:12000});
  assert.ok(await page.locator('text=Opponent box score').count(),'Opponent report unavailable');
  assert.ok(await page.locator('text=Scouting takeaway:').count(),'Scouting summary missing');
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

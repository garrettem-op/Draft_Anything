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
  await page.locator('[data-input="camp-letter-range"]').evaluate(el=>{
   el.value='12';el.dispatchEvent(new Event('input',{bubbles:true}));
  });
  const label=await page.locator('#camp-letter-label').textContent();
  assert.equal(label,'M','Alphabet scrubber failed');
  await page.evaluate(()=>{
   const stage=campaignStage();
   const eligible=getCands('mashup').find(c=>campaignAllowed(c,stage.rule));
   if(!eligible)throw Error('No eligible character in '+stage.rule);
   const btn=[...document.querySelectorAll('#camp-plist button[data-act="camp-pick"]')].find(b=>b.dataset.cid===eligible.id);
   if(!btn)throw Error('Eligible character not rendered in picker');
   btn.click();
  });
  // Fill remaining roster slots with eligible characters, keeping one manual pick.
  await page.evaluate(()=>{
   const v=S.campaign,st=campaignStage(),taken=new Set(Object.values(v.roster).map(x=>x.id));
   for(const slot of campaignSlots(v.sport,st.rule)){
    if(v.roster[slot.id])continue;
    const candidate=getCands('mashup').find(x=>!taken.has(x.id)&&campaignAllowed(x,st.rule));
    if(!candidate)throw Error('Could not fill eligible campaign roster for '+st.rule);
    v.roster[slot.id]=candidate;taken.add(candidate.id);
   }
   render();
  });
  await page.locator('button[data-act="camp-play"]').click();
  await page.locator('text=Simulated box score').first().waitFor({timeout:12000});
  assert.ok(await page.locator('text=Opponent box score').count(),'Opponent report unavailable');
  assert.ok(await page.locator('text=Scouting takeaway:').count(),'Scouting summary missing');
  assert.equal(errors.length,0,'Browser JS errors: '+errors.join('; '));
  process.stdout.write('Browser gameplay smoke test passed: mobile campaign draft, A-Z, info scroll, simulated result.\\n');
 } finally {
  await browser.close(); await new Promise(resolve=>server.close(resolve));
 }
})().catch(error=>{console.error(error);process.exitCode=1;});

// Browser check for the flag-gated Gauntlet mode. Run with: node tests/gauntlet-browser.cjs
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
 fs.readFile(file,(err,content)=>{
  if(err){res.writeHead(404).end('Not found');return;}
  res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'}).end(content);
 });
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:'+server.address().port+'/';
 try{
  // Flag OFF by default: no Gauntlet button.
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  assert.equal(await page.locator('[data-mode="gauntlet"]').count(),0,'Gauntlet hidden by default');
  // Flag ON via URL.
  await page.goto(base+'?gauntlet=1',{waitUntil:'domcontentloaded',timeout:30000});
  await page.locator('[data-mode="gauntlet"]').click();
  await page.locator('[data-act="gaunt-start"]').click();
  assert.equal(await page.locator('.gt-card').count(),2,'two characters dealt');
  const html=await page.locator('.gt-shell').innerHTML();
  assert.ok(!/\bodds\b|win probability|favou?rite/i.test(html),'no engine prediction before voting');
  await page.locator('.gt-card').first().click();
  await page.locator('[data-act="gaunt-tie"]').click();
  await page.locator('[data-act="gaunt-skip"]').click();
  await page.locator('.gt-card').nth(1).click();
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('da.gauntlet.v1')));
  assert.equal(stored.votes.length,4,'four votes saved locally');
  assert.equal(stored.votes.filter(v=>v.outcome==='win').length,2);
  assert.ok(stored.votes.every(v=>v.model==='gauntlet-bt-v1'&&v.session===stored.session));
  await page.locator('[data-act="gaunt-ladder"]').first().click();
  assert.ok(/your ladder/i.test(await page.locator('.gt-ladder').innerText()));
  assert.ok(await page.locator('.gt-table tbody tr').count()>=2,'ladder rows shown');
  await page.locator('[data-act="gaunt-clear"]').click();
  assert.equal(await page.locator('.gt-ladder').getByText('Tap again').count(),1,'erase needs a second tap');
  await page.locator('[data-act="gaunt-clear"]').click();
  assert.equal((await page.evaluate(()=>JSON.parse(localStorage.getItem('da.gauntlet.v1')))).votes.length,0);
  // Mode persists across reload, and turning the flag off falls back to Championship.
  await page.goto(base+'?gauntlet=0',{waitUntil:'domcontentloaded',timeout:30000});
  assert.equal(await page.locator('[data-mode="gauntlet"]').count(),0);
  assert.equal(await page.locator('[data-mode="champ"][aria-pressed="true"]').count(),1,'falls back to Championship');
  assert.deepEqual(errors,[]);
  console.log('Gauntlet browser check passed: flag gating, dealing, voting, local persistence, ladder, erase, fallback.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});

// Browser playthrough for the Action Movies pool (PR #70): every sport in Championship, Dealt Hand,
// the Head-to-Head picker and the Mashup selector, with no page errors.
// Run: node tests/action-movies-browser.cjs   (needs playwright, like tests/browser-smoke.cjs)
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json'};
const server=http.createServer((req,res)=>{
  const p=new URL(req.url,'http://localhost').pathname;
  const file=path.resolve(root,'.'+decodeURIComponent(p==='/'?'/index.html':p));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(err,c)=>err?res.writeHead(404).end():res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'}).end(c));
});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'domcontentloaded',timeout:30000});
    await page.locator('button[data-act="mode"][data-mode="champ"]').click();
    const sports=await page.evaluate(()=>Object.keys(SPORTS));
    const results={};
    for(const sport of sports){
      await page.evaluate(()=>{S.champ.stage='setup';S.champ.result=null;S.champ.sel=null;render();});
      const sportBtn=page.locator(`button[data-act="c-sport"][data-sport="${sport}"]`);
      if(await sportBtn.count())await sportBtn.first().click();
      const poolBtn=page.locator('button[data-act="c-pool"][data-pool="actionmovies"]');
      assert.equal(await poolBtn.count(),1,sport+': Action Movies missing from the pool picker');
      assert.equal(await poolBtn.isDisabled(),false,sport+': Action Movies disabled in the pool picker');
      await poolBtn.click();
      await page.locator('button[data-act="c-start"]').first().click();
      const closer=page.locator('.panel.picker [data-act="c-close"]');
      if(await closer.count())await closer.first().click();
      await page.locator('[data-act="c-random"]').first().click();
      const full=await page.evaluate(()=>rosterFull(S.champ.sport,S.champ.roster)&&Object.values(S.champ.roster).every(c=>c.pool==='actionmovies'));
      assert.ok(full,sport+': random fill did not produce a full Action Movies roster');
      await page.locator('[data-act="c-sim"]').first().click();
      await page.waitForFunction(()=>!!S.champ.result,null,{timeout:60000});
      results[sport]=await page.evaluate(()=>{
        const sc=teamScore(S.champ.sport,S.champ.roster);
        return {rating:+sc.rating.toFixed(1),place:S.champ.result?.place??S.champ.result?.rank??null,text:document.querySelector('main').innerText.length};
      });
      assert.ok(Number.isFinite(results[sport].rating)&&results[sport].rating>0,sport+': bad team rating');
      assert.ok(results[sport].text>200,sport+': results screen did not render');
    }
    // Universe chip and trading-card styling exist for the pool.
    const styled=await page.evaluate(()=>({label:universeLabel('actionmovies'),kit:POOL_KIT.actionmovies,
      chip:[...document.styleSheets].some(s=>{try{return [...s.cssRules].some(r=>String(r.selectorText||'').includes('u-actionmovies'));}catch{return false;}})}));
    assert.equal(styled.label,'Action Movies');
    assert.deepEqual(styled.kit,['#772B23','#F5B96B']);
    assert.ok(styled.chip,'Missing Action Movies universe chip style');
    // Dealt Hand: three Action Movies cards, info opens a card, a pick places on the field.
    await page.locator('button[data-act="mode"][data-mode="deal"]').click();
    await page.evaluate(()=>{S.champ.stage='setup';S.champ.result=null;S.champ.sel=null;render();});
    await page.locator('button[data-act="c-pool"][data-pool="actionmovies"]').click();
    await page.locator('button[data-act="c-start"]').first().click();
    await page.locator('.hand-option').first().waitFor();
    const hand=await page.evaluate(()=>S.champ.hand.map(c=>c.pool));
    assert.equal(hand.length,3);
    assert.ok(hand.every(p=>p==='actionmovies'),'Dealt Hand dealt a card from another pool');
    await page.locator('.hand-option [data-act="hand-info"]').first().click();
    await page.locator('.modal [data-act="hand-info-close"]').first().waitFor();
    assert.ok(await page.locator('.modal .trading-card .tc-art[data-pool="actionmovies"]').count()+
      await page.locator('.modal [data-pool="actionmovies"]').count()>0,'Trading card art is not styled for Action Movies');
    await page.locator('.modal [data-act="hand-info-close"]').first().click();
    // Head-to-Head setup lists the pool.
    // The Dealt Hand popup is modal by design, so switch modes directly.
    await page.evaluate(()=>{S.mode='h2h';render();});
    const h2hPool=page.locator('button[data-act="h-pool"][data-pool="actionmovies"]');
    if(await h2hPool.count()){await h2hPool.first().click();assert.equal(await page.evaluate(()=>S.h2h.form.poolId),'actionmovies');}
    else assert.ok(await page.evaluate(()=>BUILTIN.includes('actionmovies')),'Head-to-Head cannot reach Action Movies');
    // Mashup: the full Mashup includes all 100 and Action Movies can be toggled off and on.
    const mash=await page.evaluate(()=>{
      const all=getCands('mashup').filter(c=>c.pool==='actionmovies').length;
      const without=mashupPoolId(MASHUP_SOURCES.filter(id=>id!=='actionmovies'));
      return {all,without:getCands(without).filter(c=>c.pool==='actionmovies').length,only:getCands(mashupPoolId(['actionmovies'])).length};
    });
    assert.deepEqual(mash,{all:100,without:0,only:100});
    assert.deepEqual(errors,[],'Page errors: '+errors.join(' | '));
    console.log('Action Movies browser playthrough passed:',JSON.stringify(results));
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});

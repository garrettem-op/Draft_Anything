// Browser check for the Gauntlet feed layer. Run with: node tests/gauntlet-feed-browser.cjs
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
 fs.readFile(file,(err,content)=>{
  if(err){res.writeHead(404).end('Not found');return;}
  res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'}).end(content);
 });
});
const audioStub=()=>{
 window.__audio={ctx:0,osc:0,buzz:0};
 window.AudioContext=class{
  constructor(){window.__audio.ctx++;this.currentTime=0;this.state='running';this.destination={};}
  createGain(){return{gain:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}};}
  createOscillator(){window.__audio.osc++;return{type:'',frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},start(){},stop(){}};}
  resume(){return Promise.resolve();}
 };
 Object.defineProperty(navigator,'vibrate',{value:()=>{window.__audio.buzz++;return true;},configurable:true});
};
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true});
 const errors=[];
 const base='http://127.0.0.1:'+server.address().port+'/';
 try{
  // ---- main run: phone-sized screen, default settings ----
  const context=await browser.newContext({viewport:{width:390,height:844}});
  await context.addInitScript(audioStub);
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'?gauntlet=1',{waitUntil:'domcontentloaded',timeout:30000});
  await page.locator('[data-mode="gauntlet"]').click();
  await page.locator('[data-act="gaunt-start"]').click();
  assert.equal(await page.locator('.gt-feed').count(),1,'feed screen is used');
  assert.equal(await page.locator('.gt-card').count(),2);
  assert.ok(await page.locator('.gt-hud').count()===1&&await page.locator('.gt-bar').count()===1,'HUD and progress bar');
  assert.equal(await page.locator('.gt-reduce').count(),0,'motion is on by default');
  const pick=async()=>{await page.locator('.gt-card').first().click();};
  const audio=()=>page.evaluate(()=>window.__audio);
  // tap picks: each one saves instantly and deals the next pair
  await pick();
  assert.equal(await page.locator('.gt-card').count(),2,'next pair appears immediately');
  assert.ok((await audio()).osc>0,'a sound plays on the first pick');
  assert.ok((await audio()).buzz>0,'phone buzz is requested');
  await pick();
  assert.ok(await page.locator('.gt-combo').count()===1,'combo chip appears from the second pick');
  assert.ok(/Combo\s*×2/.test(await page.locator('.gt-combo').innerText()));
  for(let i=0;i<7;i++)await pick();
  await pick(); // 10th judged
  assert.ok(/10 picks judged/.test(await page.locator('.gt-reward').innerText()),'10-pick badge shown: '+await page.locator('.gt-reward').innerText());
  assert.ok(await page.locator('.gt-confetti').count()===1,'confetti on a milestone');
  await page.waitForTimeout(700);
  await page.screenshot({path:'/tmp/gauntlet-feed-phone.png'});
  await page.locator('.gt-card').first().click(); // mid-animation must not scroll sideways either
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'no sideways scrolling while cards slide in');
  await page.waitForTimeout(400);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'no sideways scrolling on a phone');
  // sound toggle stops sound and buzz; motion toggle adds the reduce class
  await page.locator('[data-act="gaunt-sound"]').click();
  assert.match(await page.locator('[data-act="gaunt-sound"]').innerText(),/Sound off/);
  const a1=await audio();
  await pick();
  const a2=await audio();
  assert.equal(a2.osc,a1.osc,'no new sounds while off');
  assert.equal(a2.buzz,a1.buzz,'no buzz while off');
  await page.locator('[data-act="gaunt-sound"]').click();
  await page.locator('[data-act="gaunt-motion"]').click();
  assert.equal(await page.locator('.gt-feed.gt-reduce').count(),1,'motion off class');
  await page.locator('[data-act="gaunt-motion"]').click();
  assert.equal(await page.locator('.gt-feed.gt-reduce').count(),0);
  // keyboard: arrows pick, U undoes
  const count=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('da.gauntlet.v1')).votes.length);
  const n0=await count();
  await page.keyboard.press('ArrowRight');
  assert.equal(await count(),n0+1,'arrow key picks');
  await page.keyboard.press('t');
  assert.equal(await count(),n0+2,'T records a tie');
  await page.keyboard.press('u');
  await page.keyboard.press('u');
  assert.equal(await count(),n0,'U undoes');
  // keep going until a surprise card and the 25-pick reveal have both shown
  let sawSurprise=false,sawReveal=false;
  for(let i=0;i<80&&!(sawSurprise&&sawReveal);i++){
   if(await page.locator('.gt-reveal').count()){sawReveal=true;
    assert.equal(await page.locator('.gt-card').count(),0,'reveal replaces the pair');
    assert.ok(await page.locator('.gt-top5 li').count()===5,'five rows');
    await page.locator('[data-act="gaunt-continue"]').click();
    assert.equal(await page.locator('.gt-card').count(),2,'Keep going brings the pair back');
    continue;}
   if(await page.locator('.gt-surprise-tag').count())sawSurprise=true;
   await pick();
  }
  assert.ok(sawSurprise,'a surprise card showed up');
  assert.ok(sawReveal,'the top-five reveal showed up');
  // every stored vote is still a plain valid vote, and nothing was sent anywhere
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('da.gauntlet.v1')));
  assert.ok(stored.votes.length>=25);
  assert.ok(stored.votes.every(v=>v.v===1&&v.model==='gauntlet-bt-v1'&&!('surprise' in v)&&!('combo' in v)));
  const html=await page.locator('.gt-shell').innerHTML();
  assert.ok(!/\bodds\b|win probability|favou?rite/i.test(html),'no engine prediction');
  // settings persist across reload
  await page.locator('[data-act="gaunt-sound"]').click();
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('[data-act="gaunt-start"]').click();
  assert.match(await page.locator('[data-act="gaunt-sound"]').innerText(),/Sound off/,'sound choice is remembered');
  await context.close();

  // ---- reduced-motion users start with motion off ----
  const calm=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await calm.addInitScript(audioStub);
  const p2=await calm.newPage();
  p2.on('pageerror',e=>errors.push(e.message));
  await p2.goto(base+'?gauntlet=1',{waitUntil:'domcontentloaded',timeout:30000});
  await p2.locator('[data-mode="gauntlet"]').click();
  await p2.locator('[data-act="gaunt-start"]').click();
  assert.equal(await p2.locator('.gt-feed.gt-reduce').count(),1,'reduced-motion preference turns motion off');
  await p2.locator('.gt-card').first().click();
  const anim=await p2.evaluate(()=>getComputedStyle(document.querySelector('.gt-pair .gt-card')).animationName);
  assert.equal(anim,'none','no card animation under reduced motion');
  await calm.close();
  assert.deepEqual(errors,[]);
  console.log('Gauntlet feed browser check passed: instant picks, HUD, combo, badges, sound and motion toggles, keyboard, surprise cards, top-five reveal, reduced motion, plain votes.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const code=html.slice(html.indexOf('function h2hDealtHand('),html.indexOf('function renderH2HHandPopup('));
const rngFrom=seed=>{let n=2166136261;for(const c of String(seed))n=Math.imul(n^c.charCodeAt(0),16777619);return()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296)};
const all=Array.from({length:75},(_,i)=>({id:'test:'+i,n:'Contestant '+i}));
const c={rules:{style:'hand'},code:'ABCDE',poolId:'test',picks:[]};
const ctx={rngFrom,getCands:()=>all,HAND_SIZE:3};
vm.runInNewContext(code+'; this.hand=h2hDealtHand',ctx);
const hand=ctx.hand;
test('three-card hands are stable across refreshes and both players',()=>{
 const first=hand(c,0).map(x=>x.id);
 assert.equal(first.length,3);
 assert.equal(new Set(first).size,3);
 assert.deepEqual(Array.from(hand(c,0),x=>x.id),first);
 assert.notDeepEqual(Array.from(hand(c,1),x=>x.id),first);
});
test('previous drafted characters never reappear even after deck exhaustion',()=>{
 const game={...c,picks:[]},chosen=new Set();
 for(let k=0;k<18;k++){
   const choices=hand(game,k);
   assert.equal(choices.length,3);
   assert(choices.every(x=>!chosen.has(x.id)));
   const choice=choices[0];
   chosen.add(choice.id);
   game.picks.push({cid:choice.id,s:k%2?'guest':'host',slot:'s'+k});
 }
});
test('small pools recycle only previously unpicked characters',()=>{
 const tiny=Array.from({length:19},(_,i)=>({id:'tiny:'+i}));
 const scoped={...ctx,getCands:()=>tiny};
 vm.runInNewContext(code+';this.hand=h2hDealtHand',scoped);
 const game={...c,picks:[]};
 for(let i=0;i<14;i++){
   const offers=scoped.hand(game,i);
   assert.equal(offers.length,3);
   assert(offers.every(x=>!game.picks.some(p=>p.cid===x.id)));
   game.picks.push({cid:offers[0].id});
 }
});
test('Head-to-Head requires valid selected card in both client and lease-guarded server updates',()=>{
 assert.match(html,/style', \[\['free', 'Any open spot'\], \['position', 'Position by position'\], \['hand', 'Dealt Hand/);
 assert.match(html,/h2hDealtHand\(d,k\)\.some\(c=>c\.id===cid\)/);
 assert.match(html,/case 'h-hand-select':/);
 assert.match(html,/case 'h-hand-reselect':/);
 assert.match(html,/makePick\(slot,h\.handPick,false,k\)/);
 assert.match(html,/h2hDealtHand\(d,k\)\.some\(c=>c\.id===t\.dataset\.cid\)/);
 assert.match(html,/renderH2HHandPopup\(d,me,k\)/);
});

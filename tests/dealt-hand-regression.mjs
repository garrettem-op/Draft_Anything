// Run: node tests/dealt-hand-regression.mjs
// Tests the production CSS anchors and recovered draft state without npm dependencies.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const html=fs.readFileSync('index.html','utf8');

assert.match(html,/html\.draft-active \.board\.hand \{[\s\S]*?grid-template-rows:\s*minmax\(0,\s*1fr\) auto/,'Dealt Hand requires two explicit mobile rows');
assert.match(html,/html\.draft-active \.board\.hand > \.board-side > \.hand-panel \{[\s\S]*?display:\s*flex/,'Mobile Dealt Hand panel must override the generic hidden-panel rule');
assert.match(html,/html\.draft-active \.board\.hand \.hand-card \{[\s\S]*?flex:\s*0 0 calc/,'Mobile layout must show three separate cards');
assert.match(html,/function renderChampDraft\(\) \{\s*ensureDealtHand\(\);/,'Draft rendering must repair empty hands');
assert.match(html,/case 'hand-restart': initHandDraft\(\);/,'Empty-hand recovery button needs an action');

function extractFunction(name) {
  const head='function '+name+'(';
  const start=html.indexOf(head);
  assert(start>=0,'Function missing: '+name);
  const open=html.indexOf('{',start+head.length);
  assert(open>=0);
  let depth=0, end=-1;
  for(let i=open;i<html.length;i++) {
    if(html[i]==='{')depth++;
    if(html[i]==='}'&&--depth===0){end=i+1;break;}
  }
  assert(end>open,'Unbalanced function braces '+name);
  return html.slice(start,end);
}

const code=extractFunction('handDraftReady')+'\n'+extractFunction('ensureDealtHand')+'\nensureDealtHand();';
function fixture({hand=[],queue=[0,1,0,1],pickIdx=0,ai=[{}],draftOpps=1,opps=1,stage='draft',roster={}}={}) {
 const state={stage,hand,queue,pickIdx,ai,draftOpps,opps,sport:'test',roster};
 const events=[];
 const context={
  S:{champ:state},
  SPORTS:{test:{pos:[{id:'a'},{id:'b'}]}},
  handMode:()=>true,
  rosterFull:(sport,r)=>Object.keys(r).length===2,
  dealHand:()=>{events.push('deal');state.hand=[{id:'new-card'}];},
  advanceDraft:()=>{events.push('advance');state.hand=[{id:'next-card'}];},
  initHandDraft:()=>{events.push('restart');state.hand=[{id:'new-draft'}];},
 };
 vm.runInNewContext(code,context);
 return {state,events};
}
assert.deepEqual(fixture().events,['deal'],'Resume a valid player turn by dealing, not resetting the draft');
assert.deepEqual(fixture({hand:[{id:'still-here'}]}).events,[],'Do not replace valid saved cards');
assert.deepEqual(fixture({queue:null}).events,['restart'],'An invalid saved draft must initialize');
assert.deepEqual(fixture({queue:[1,0,1,0],pickIdx:0}).events,['advance'],'Finish pending AI turns before dealing player hand');
assert.deepEqual(fixture({roster:{a:1,b:1}}).events,[],'Do not deal a full roster');
assert.deepEqual(fixture({stage:'setup'}).events,[],'Do not start drafting while in setup');
console.log('PASS — Dealt Hand mobile panel selectors, 3-card arrangement and restored-hand recovery.');

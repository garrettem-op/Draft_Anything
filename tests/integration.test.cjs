const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
// Cache-busted scripts carry ?v=TOKEN; scriptIndex accepts that and still requires exactly one load.
const {scriptIndex,scriptVersion}=require('./lib/html-scripts.cjs');
test('main browser script remains syntactically valid',()=>{
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
 const main=scripts.sort((a,b)=>b.length-a.length)[0];
 assert.ok(main.length>50000);
 assert.doesNotThrow(()=>new Function(main));
});
test('curated ability evidence loads before Campaign and is not revealed by picker',()=>{
 const abilities=scriptIndex(html,'data/character-abilities.js');
 const campaign=scriptIndex(html,'data/campaign.js');
 assert.ok(abilities>0&&campaign>abilities);
 assert.ok(!html.includes('data-act="camp-abilities"'),'Campaign should not reveal answers before selection');
});
test('report module is loaded after campaign helpers and before main app',()=>{
 const campaign=scriptIndex(html,'data/campaign.js');
 const reports=scriptIndex(html,'data/after-action.js');
 const main=html.indexOf('const POOLS = {}');
 assert.ok(campaign>0&&reports>campaign&&main>reports);
});
test('report picker and alphabet scrubber are wired in app handlers',()=>{
 assert.match(html,/daMatchBrowser\(c\.sport,sim,teams,c\.reportMatch,/);
 assert.match(html,/else if \(k === 'report-match'\)/);
 assert.match(html,/function jumpTalentPoolLetter\(/);
 assert.match(html,/data-az-list/);
 assert.match(html,/data-az-letter/);
 assert.match(html,/function azTrack\(/);
});
test('campaign on-field slots use the campaign picker, not the normal draft',()=>{
 assert.match(html,/if \(S\.mode === 'champ' && c\.campaignMode\)/);
 assert.match(html,/v\.selected=t\.dataset\.slot/);
 assert.match(html,/v\.surgeDialog=t\.dataset\.slot/);
});

test('dealt hand shows one origin information control per deal card',()=>{
 assert.match(html,/data-act="hand-info"/);
 assert.match(html,/data-act="hand-info-close"/);
 assert.match(html,/renderHandInfo\(\)/);
});
test('current character is fixed above the scrollable talent list',()=>{
 assert.match(html,/function pickerCurrentHTML\(/);
 assert.match(html,/picker-current/);
 assert.match(html,/picker-list-shell/);
});
test('field swaps use deliberate long press and are not allowed in multiplayer',()=>{
 assert.match(html,/function swapDraftSlots\(/);
 assert.match(html,/setTimeout\(\(\)=>\{/);
 assert.match(html,/if\(S\.mode==='h2h'\)return null/);
});

test('knowledge engine loads before campaign and cannot change numerical challenge rules',()=>{
 const knowledge=scriptIndex(html,'data/knowledge-engine.js');
 const campaign=scriptIndex(html,'data/campaign.js');
 assert.ok(knowledge>0&&knowledge<campaign,'Knowledge engine must load first');
 assert.match(html,/function campaignSubmitKnowledgeDispute\(/);
 assert.match(html,/case 'camp-dispute-open'/);
 assert.match(html,/case 'camp-dispute-submit'/);
 assert.match(html,/renderCampaignDispute\(\)/);
 assert.ok(!html.includes('OPENAI_API_KEY='),'Do not embed provider secrets in the frontend');
});

test('cache-busted Campaign scripts stay versioned and load in dependency order',()=>{
 // Campaign and its CPU strategy are versioned so returning players never run a stale copy
 // against new eligibility rules. Bump the token whenever either file changes.
 for(const src of ['data/campaign.js','data/campaign-strategy.js'])
  assert.match(scriptVersion(html,src)||'',/^\d{8}-[a-z0-9-]+$/,src+' must carry a ?v= cache-busting token');
 const order=['data/character-abilities.js','data/campaign-eligibility.js','data/knowledge-engine.js','data/variant-form-research.js','data/campaign.js',
  'data/campaign-variant-expansion.js','data/variant-abilities.js','data/campaign-strategy.js','data/after-action.js'];
 const at=order.map(src=>scriptIndex(html,src));
 for(let i=1;i<at.length;i++) assert.ok(at[i-1]<at[i],order[i-1]+' must load before '+order[i]);
 assert.ok(at[at.length-1]<html.indexOf('const POOLS = {}'),'all modules load before the main app');
});

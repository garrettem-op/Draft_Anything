const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
test('main browser script remains syntactically valid',()=>{
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
 const main=scripts.sort((a,b)=>b.length-a.length)[0];
 assert.ok(main.length>50000);
 assert.doesNotThrow(()=>new Function(main));
});
test('curated ability evidence loads before Campaign and is not revealed by picker',()=>{
 const abilities=html.indexOf('<script src="data/character-abilities.js"></script>');
 const campaign=html.indexOf('<script src="data/campaign.js"></script>');
 assert.ok(abilities>0&&campaign>abilities);
 assert.ok(!html.includes('data-act="camp-abilities"'),'Campaign should not reveal answers before selection');
});
test('report module is loaded after campaign helpers and before main app',()=>{
 const campaign=html.indexOf('<script src="data/campaign.js"></script>');
 const reports=html.indexOf('<script src="data/after-action.js"></script>');
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
 assert.match(html,/S\.campaign\.selected=t\.dataset\.slot/);
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
 const knowledge=html.indexOf('<script src="data/knowledge-engine.js"></script>');
 const campaign=html.indexOf('<script src="data/campaign.js"></script>');
 assert.ok(knowledge>0&&knowledge<campaign,'Knowledge engine must load first');
 assert.match(html,/function campaignSubmitKnowledgeDispute\(/);
 assert.match(html,/case 'camp-dispute-open'/);
 assert.match(html,/case 'camp-dispute-submit'/);
 assert.match(html,/renderCampaignDispute\(\)/);
 assert.ok(!html.includes('OPENAI_API_KEY='),'Do not embed provider secrets in the frontend');
});

const test=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const policyPromise=import(pathToFileURL(path.resolve(__dirname,'../supabase/functions/character-knowledge/ruling-policy.mjs')).href);
const official=host=>host==='nintendo.com'||host.endsWith('.nintendo.com')||host==='starwars.com';
const feat='In Twilight Princess, Dark Beast Ganon teleports through portals during the final battle and avoids incoming arrows.';
test('supported teleportation from mirrored Nintendo guide plus independent walkthrough qualifies provisionally',async()=>{
  const {evaluateAbilityEvidence}=await policyPromise;
  const result=evaluateAbilityEvidence({
    verdict:'supports',confidence:.98,feat,
    cited:['https://repo.mariocube.com/Game%20Guides/Twilight%20Princess.pdf',
      'https://www.gamespot.com/articles/twilight-princess-guide/']
  },official);
  assert.equal(result.status,'accepted_provisional');
  assert.match(result.reason,/eligible|Supported/i);
});
test('publisher domain is NOT a mandatory requirement with two sources',async()=>{
  const {evaluateAbilityEvidence}=await policyPromise;
  assert.equal(evaluateAbilityEvidence({verdict:'supports',confidence:.9,feat,cited:[
    'https://primagames.com/guides/zelda','https://www.gamespot.com/guides/zelda']},official).status,'accepted_provisional');
});
test('one genuine primary source can support exceptionally confident provisional ruling',async()=>{
  const {evaluateAbilityEvidence}=await policyPromise;
  assert.equal(evaluateAbilityEvidence({verdict:'supports',confidence:.94,feat,cited:[
    'https://www.nintendo.com/story/guides/zelda']},official).status,'accepted_provisional');
});
test('confidence alone never grants an ability without citations',async()=>{
  const {evaluateAbilityEvidence}=await policyPromise;
  assert.equal(evaluateAbilityEvidence({verdict:'supports',confidence:1,feat,cited:[]},official).status,'inconclusive');
});
test('two links from the SAME website are not independent corroboration',async()=>{
  const {evaluateAbilityEvidence}=await policyPromise;
  const r=evaluateAbilityEvidence({verdict:'supports',confidence:.99,feat,cited:[
    'https://example.com/page1','https://www.example.com/page2']},official);
  assert.equal(r.status,'inconclusive');
  assert.match(r.reason,/second source|independent source/i);
});
test('an explicit negative verdict is never auto accepted',async()=>{
  const {evaluateAbilityEvidence}=await policyPromise;
  assert.equal(evaluateAbilityEvidence({verdict:'does_not_support',confidence:.99,feat,cited:[
    'https://www.nintendo.com/zelda','https://www.gamespot.com/zelda']},official).status,'rejected');
});
test('an ambiguous model conclusion stays under review',async()=>{
  const {evaluateAbilityEvidence}=await policyPromise;
  assert.equal(evaluateAbilityEvidence({verdict:'inconclusive',confidence:.98,feat,cited:[
    'https://www.nintendo.com/zelda','https://www.gamespot.com/zelda']},official).status,'inconclusive');
});
test('nonspecific/empty feats do not get approved',async()=>{
  const {evaluateAbilityEvidence}=await policyPromise;
  assert.equal(evaluateAbilityEvidence({verdict:'supports',confidence:.98,feat:'',cited:[
    'https://www.nintendo.com/zelda','https://www.gamespot.com/zelda']},official).status,'inconclusive');
});

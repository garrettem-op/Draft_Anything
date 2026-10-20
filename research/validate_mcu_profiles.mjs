// Run from repository root: node research/validate_mcu_profiles.mjs
// Read-only structural QA for research records. It does NOT validate factual scene claims.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('index.html', 'utf8');
const start = html.indexOf('POOLS.mcu =');
const end = html.indexOf('POOLS.toons =', start);
assert(start >= 0 && end > start, 'MCU pool section not found');
const regex = /\["([^"]+)","([^"]*)","([^"]*)",\[([0-9,\s]+)\]\]/g;
const roster = [...html.slice(start, end).matchAll(regex)].map(m => m[1]);
const keys = ['spd','agi','str','siz','lep','end','tch','acc','ref','iq','clu','ldr'];
const files = [1,2,3,4,5].map(i => 'research/MCU_PROFILES_BATCH_0' + i + '.json');
const batches = files.map(p => JSON.parse(fs.readFileSync(p, 'utf8')));
const entries = batches.flatMap(p => p.characters);
const consolidated = JSON.parse(fs.readFileSync('research/MCU_ALL_143_PROFILES.json','utf8'));
const unique = new Set(entries.map(c => c.name));
assert.equal(roster.length, 143, 'Expected 143 MCU roster entries');
assert.equal(entries.length, roster.length, 'Batch count mismatch');
assert.equal(unique.size, roster.length, 'Duplicate character in batches');
assert.equal(consolidated.characters.length, roster.length, 'Consolidated count mismatch');
for (let i=0;i<roster.length;i++) {
  const name = roster[i];
  const record = entries.find(p => p.name === name);
  const normalized = consolidated.characters[i];
  assert(record, 'Missing batch character ' + name);
  assert.equal(normalized.name, name, 'Wrong consolidated order at ' + name);
  assert.equal(normalized.roster_index, i+1, 'Roster index mismatch for '+name);
  for (const k of keys) {
    assert(Number.isInteger(record.scores?.[k]) && record.scores[k]>=1 && record.scores[k]<=99, name+' invalid batch score '+k);
    assert(Number.isInteger(normalized.scores?.[k]) && normalized.scores[k]>=1 && normalized.scores[k]<=99, name+' invalid normalized score '+k);
    assert.equal(record.scores[k],normalized.scores[k], name+' changed score for '+k);
    assert((normalized.attribute_rationales?.[k] || normalized.score_rationales?.[k])?.trim(), name+' missing rationale '+k);
  }
  assert(normalized.screen_feats?.length, name+' lacks feat reference');
  assert(normalized.limits_and_losses?.length, name+' lacks weaknesses');
  assert(normalized.screen_sources?.length, name+' lacks source works');
}
// Ensure the shipped MCU arrays match the researched scores, including pending approvals.
const rosterSlice = html.slice(start,end);
// Reuse the same roster matcher as the original pool integrity check.
const shipped = [...rosterSlice.matchAll(regex)].map(m => [m[1],m[4].split(',').map(Number)]);
assert.equal(shipped.length, roster.length, 'App roster count mismatch');
for (const [name, attrs] of shipped) {
 const row = entries.find(x=>x.name===name);
 assert(row, 'Game character missing research profile: '+name);
 assert.deepEqual(attrs, keys.map(k=>row.scores[k]), 'Game attribute mismatch for '+name);
}
const guide = fs.readFileSync('data/mcu-profiles.js','utf8');
assert(guide.includes('DA_CHARACTER_GUIDES.mcu='), 'MCU guide asset missing');
console.log('PASS: '+entries.length+' unique MCU profiles, roster IDs, 12 attributes, rationales, feats, losses, source works.');
console.log('NOTE: This script does not verify film scenes or establish that ratings are defensible.');

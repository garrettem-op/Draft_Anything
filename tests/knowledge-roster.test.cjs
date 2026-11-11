const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildRoster } = require('../tools/sync-knowledge-roster.cjs');

const root = path.resolve(__dirname, '..');
const rosterFile = path.join(root, 'supabase/functions/character-knowledge/roster.json');

test('server research roster exactly matches all playable pool seed files', () => {
  const actual = fs.readFileSync(rosterFile, 'utf8');
  const expected = JSON.stringify(buildRoster()) + '\n';
  assert.equal(actual, expected,
    'Run node tools/sync-knowledge-roster.cjs and redeploy the Edge Function after any pool update');
});

test('AI appeals recognize DC, Middle-earth, and Harry Potter characters', () => {
  const roster = JSON.parse(fs.readFileSync(rosterFile, 'utf8'));
  assert.ok(roster.dc.includes('Captain Atom'), 'Captain Atom must be available for Tech Titans appeals');
  assert.ok(roster.lotr.includes('Gandalf'), 'Middle-earth appeals must reach the backend');
  assert.ok(roster.harrypotter.includes('Harry Potter'), 'Wizarding World appeals must reach the backend');
  for (const names of Object.values(roster)) {
    assert.equal(names.length, new Set(names).size, 'No duplicate names within a talent pool');
  }
});

test('the server accepts the Tech Titans ability category', () => {
  const edge = fs.readFileSync(path.join(root, 'supabase/functions/character-knowledge/index.ts'), 'utf8');
  assert.match(edge, /const TAGS = new Set\(\[[^\]]*'tech'/,
    'The server must recognize the tech challenge tag');
});

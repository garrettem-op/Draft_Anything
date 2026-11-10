/* Regression tests for the roster-wide source audit (2026-11-10). No network, no paid AI. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  CHARACTER_ABILITIES, CHARACTER_ABILITY_TAGS, CHARACTER_ABILITY_SOURCE_TIERS, CHARACTER_ABILITY_CONFIRMING_TIERS,
  characterAbilitySourceTier, characterAbilityVerification, characterAbilityProvenance
} = require('../data/character-abilities.js');
const { POOL_IDS, POWER_TAGS } = require('../tools/ability-audit-lib.cjs');
const { sourceAudit, outputs, STATUSES } = require('../tools/ability-source-audit.cjs');

const ROOT = path.join(__dirname, '..');
const URL_FIELDS = ['source', 'verifiedBy', 'dialogueSource', 'speciesSource', 'officialSource'];
const records = Object.entries(CHARACTER_ABILITIES).flatMap(([id, rs]) => rs.map(r => [id, r]));

test('every host cited by an evidence record has a source tier', () => {
  const tiers = new Set(['community', ...CHARACTER_ABILITY_CONFIRMING_TIERS]);
  for (const t of Object.values(CHARACTER_ABILITY_SOURCE_TIERS)) assert.ok(tiers.has(t), t);
  for (const [id, r] of records) for (const k of URL_FIELDS) for (const u of [].concat(r[k] || []))
    assert.ok(characterAbilitySourceTier(u), id + ' ' + r.tag + ' cites an unclassified host: ' + u);
});

test('verification follows the cited tiers, and an explicit label wins', () => {
  assert.equal(characterAbilitySourceTier('https://en.wikipedia.org/wiki/X'), 'community');
  assert.equal(characterAbilitySourceTier('https://starwars.fandom.com/wiki/X'), 'community');
  assert.equal(characterAbilitySourceTier('https://www.starwars.com/databank/x'), 'official');
  assert.equal(characterAbilitySourceTier('not a url'), null);
  assert.equal(characterAbilityVerification({ source: 'https://en.wikipedia.org/wiki/X' }), 'provisional');
  assert.equal(characterAbilityVerification({ source: 'https://pokemondb.net/pokedex/mew/moves/1' }), 'official-cited');
  assert.equal(characterAbilityVerification({ source: 'https://en.wikipedia.org/wiki/X', dialogueSource: 'https://imsdb.com/x' }), 'official-cited');
  // officialSource only confirms identity, never the feat.
  assert.equal(characterAbilityVerification({ source: 'https://en.wikipedia.org/wiki/X', officialSource: 'https://d23.com/a-to-z/x/' }), 'provisional');
  assert.equal(characterAbilityVerification({ source: 'https://en.wikipedia.org/wiki/X', verification: 'owner-ruling' }), 'owner-ruling');
});

test('no record is labelled verified without a confirming source, and no wiki-only record is cited as official', () => {
  for (const [id, r] of records) {
    const confirming = ['source', 'verifiedBy', 'dialogueSource', 'speciesSource'].flatMap(k => [].concat(r[k] || []))
      .some(u => CHARACTER_ABILITY_CONFIRMING_TIERS.includes(characterAbilitySourceTier(u)));
    const v = characterAbilityVerification(r);
    assert.ok(['verified', 'owner-ruling', 'official-cited', 'provisional'].includes(v), id + ' ' + r.tag + ': ' + v);
    if (v === 'verified') assert.ok(confirming && r.verifiedBy, id + ' ' + r.tag + ' is verified without verifiedBy');
    if (v === 'official-cited') assert.ok(confirming, id + ' ' + r.tag);
  }
});

test('the audit covers every power grant in every pool exactly once', () => {
  const a = sourceAudit();
  let expected = 0;
  for (const pool of POOL_IDS) for (const tags of Object.values(CHARACTER_ABILITY_TAGS[pool] || {}))
    expected += tags.filter(t => POWER_TAGS.includes(t)).length;
  assert.equal(a.grants, expected);
  assert.equal(a.rows.length, expected);
  assert.equal(new Set(a.rows.map(r => r.id + '/' + r.tag)).size, expected);
  assert.equal(STATUSES.reduce((n, s) => n + a.totals[s], 0), expected);
  for (const r of a.rows) assert.ok(STATUSES.includes(r.status), r.id + ' ' + r.tag);
  // Provenance exposes the same status the audit reports.
  for (const r of a.rows.slice(0, 200))
    assert.equal(characterAbilityProvenance({ pool: r.pool, n: r.character }, r.tag).verification, r.status, r.id + ' ' + r.tag);
});

test('owner rulings stay labelled as such (Peter Pan flight is settled)', () => {
  const pp = CHARACTER_ABILITIES['toons:Peter Pan'].find(r => r.tag === 'flight');
  assert.equal(characterAbilityVerification(pp), 'owner-ruling');
  assert.ok(CHARACTER_ABILITY_TAGS.toons['Peter Pan'].includes('flight'));
});

test('the source-audit report and JSON are up to date (run tools/ability-source-audit.cjs --write)', () => {
  for (const [file, body] of Object.entries(outputs()))
    assert.equal(fs.readFileSync(path.join(ROOT, file), 'utf8'), body, file + ' is stale');
});

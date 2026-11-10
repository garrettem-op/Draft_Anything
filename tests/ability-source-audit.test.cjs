/* Regression tests for the roster-wide evidence audit (2026-11-10, revised to the owner's evidence standard).
   The standard: accuracy, not source type. A specific, well-documented community entry is credible evidence;
   independent sources that agree are corroboration; entries without supporting detail, contradictions and
   form/item dependencies still get checked. No network, no paid AI. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  CHARACTER_ABILITIES, CHARACTER_ABILITY_TAGS, CHARACTER_ABILITY_SOURCE_TIERS, CHARACTER_ABILITY_SOURCE_TYPES,
  CHARACTER_ABILITY_STATUSES, characterAbilitySourceTier, characterAbilityFeatUrls, characterAbilityIndependentSources,
  characterAbilityFeatIsSpecific, characterAbilityVerification, characterAbilityProvenance
} = require('../data/character-abilities.js');
const { POOL_IDS, POWER_TAGS } = require('../tools/ability-audit-lib.cjs');
const { sourceAudit, outputs, STATUSES } = require('../tools/ability-source-audit.cjs');

const ROOT = path.join(__dirname, '..');
const URL_FIELDS = ['source', 'verifiedBy', 'dialogueSource', 'speciesSource', 'officialSource'];
const records = Object.entries(CHARACTER_ABILITIES).flatMap(([id, rs]) => rs.map(r => [id, r]));
const WIKI = 'https://dc.fandom.com/wiki/Raven_(Rachel_Roth)';
const WIKI_2 = 'https://en.wikipedia.org/wiki/Raven_(DC_Comics)';
const OFFICIAL = 'https://www.dc.com/characters/raven';
const SPECIFIC = 'Teleports the Titans out of Azarath inside her soul-self (The New Teen Titans #3, 1980).';
const THIN = 'Levitates and flies.';

test('every host cited by an evidence record has a source type', () => {
  const types = new Set(CHARACTER_ABILITY_SOURCE_TYPES);
  for (const t of Object.values(CHARACTER_ABILITY_SOURCE_TIERS)) assert.ok(types.has(t), t);
  for (const [id, r] of records) for (const k of URL_FIELDS) for (const u of [].concat(r[k] || []))
    assert.ok(characterAbilitySourceTier(u), id + ' ' + r.tag + ' cites an unclassified host: ' + u);
  assert.equal(characterAbilitySourceTier('https://starwars.fandom.com/wiki/X'), 'community');
  assert.equal(characterAbilitySourceTier('not a url'), null);
});

test('source type never lowers a rating: the same specific feat rates the same from a wiki or an official site', () => {
  const fromWiki = characterAbilityVerification({ feat: SPECIFIC, source: WIKI });
  const fromOfficial = characterAbilityVerification({ feat: SPECIFIC, source: OFFICIAL });
  assert.equal(fromWiki, 'credible', 'specific, well-documented community lore is credible evidence');
  assert.equal(fromOfficial, 'credible', 'an official source with a clear feat is credible evidence');
  assert.equal(characterAbilityVerification({ feat: SPECIFIC, source: 'https://tvtropes.org/pmwiki/x' }), 'credible');
  assert.equal(characterAbilityVerification({ feat: SPECIFIC, source: 'https://comicvine.gamespot.com/x' }), 'credible');
  // No record anywhere is rated by the retired, source-based vocabulary.
  for (const [id, r] of records) assert.ok(!['provisional', 'official-cited', 'verified'].includes(characterAbilityVerification(r)), id + ' ' + r.tag);
});

test('independent sources that agree are corroboration; one site twice is not', () => {
  assert.equal(characterAbilityVerification({ feat: SPECIFIC, source: WIKI, verifiedBy: WIKI_2 }), 'corroborated');
  assert.equal(characterAbilityVerification({ feat: SPECIFIC, source: WIKI, verifiedBy: OFFICIAL }), 'corroborated');
  // Two community wikis are still two independent sources.
  assert.equal(characterAbilityVerification({ feat: SPECIFIC, source: WIKI, dialogueSource: 'https://tvtropes.org/pmwiki/x' }), 'corroborated');
  assert.equal(characterAbilityIndependentSources({ source: WIKI, verifiedBy: WIKI + '#Powers' }), 1);
  assert.equal(characterAbilityVerification({ feat: SPECIFIC, source: WIKI, verifiedBy: WIKI + '#Powers' }), 'credible');
  // officialSource confirms identity only, never the feat.
  assert.ok(!characterAbilityFeatUrls({ source: WIKI, officialSource: OFFICIAL }).includes(OFFICIAL));
  assert.equal(characterAbilityVerification({ feat: SPECIFIC, source: WIKI, officialSource: OFFICIAL }), 'credible');
});

test('an entry without supporting detail needs review, whoever published it', () => {
  assert.equal(characterAbilityFeatIsSpecific({ feat: THIN }), false);
  assert.equal(characterAbilityVerification({ feat: THIN, source: WIKI }), 'needs-review');
  assert.equal(characterAbilityVerification({ feat: THIN, source: OFFICIAL }), 'needs-review');
  // Any one of a scene, a cited instance or a substantive description is enough.
  assert.equal(characterAbilityVerification({ feat: THIN, scene: 'The New Teen Titans #1 (1980), first mission', source: WIKI }), 'credible');
  assert.equal(characterAbilityFeatIsSpecific({ feat: 'Commands all waters and seas (Silm. Valaquenta).' }), true);
  assert.equal(characterAbilityFeatIsSpecific({ feat: "In 'Karate Star' he regrows an arm." }), true);
  assert.equal(characterAbilityFeatIsSpecific({ feat: 'Heals allies by absorbing their wounds into her own body.' }), true);
  // The live data keeps the check meaningful: bare one-liners are flagged, rich entries are not.
  const status = (id, tag) => characterAbilityVerification(CHARACTER_ABILITIES[id].find(r => r.tag === tag));
  assert.equal(status('dc:Raven', 'flight'), 'needs-review');
  assert.equal(status('dc:King Shark', 'healing'), 'needs-review');
  assert.equal(status('dc:Batman', 'stealth'), 'credible');
  assert.equal(status('lotr:Gandalf', 'fire'), 'credible');
  assert.equal(status('toons:Jafar', 'fire'), 'needs-review', 'the fire scene itself is unconfirmed');
});

test('contradictions surface for investigation; owner rulings stay final', () => {
  const conflict = 'Pre-Crisis comics give him flight; post-Crisis he only leaps';
  assert.equal(characterAbilityVerification({ feat: SPECIFIC, source: WIKI, verifiedBy: OFFICIAL, conflict }), 'investigate');
  assert.equal(characterAbilityVerification({ feat: SPECIFIC, source: WIKI, verification: 'credible', conflict }), 'investigate');
  assert.equal(characterAbilityVerification({ feat: THIN, source: WIKI, verification: 'owner-ruling', conflict }), 'owner-ruling');
});

test('hand-review labels use the current vocabulary, and "corroborated" really has a second site', () => {
  for (const [id, r] of records) {
    if (!r.verification) continue;
    assert.ok(CHARACTER_ABILITY_STATUSES.includes(r.verification), id + ' ' + r.tag + ': ' + r.verification);
    if (r.verification === 'corroborated') assert.ok(characterAbilityIndependentSources(r) >= 2, id + ' ' + r.tag);
    if (r.verification === 'owner-ruling') assert.ok(r.ruling, id + ' ' + r.tag + ' needs the ruling it rests on');
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
  // Community-only grants are rated on their own detail, and most of them stand.
  const co = a.communityOnly;
  assert.ok(co.credible > co['needs-review'] * 5, 'community-only grants are mostly credible');
});

test("Peter Pan's flight is an owner ruling: Skyborne, granted, and not reopened as a pixie-dust gate", () => {
  const pp = CHARACTER_ABILITIES['toons:Peter Pan'].find(r => r.tag === 'flight');
  assert.equal(characterAbilityVerification(pp), 'owner-ruling');
  assert.ok(CHARACTER_ABILITY_TAGS.toons['Peter Pan'].includes('flight'));
  const row = sourceAudit().rows.find(r => r.id === 'toons:Peter Pan' && r.tag === 'flight');
  assert.equal(row.status, 'owner-ruling');
  assert.equal(row.gate, undefined, 'settled: not listed among form/item conditions');
});

test('the evidence-audit report and JSON are up to date (run tools/ability-source-audit.cjs --write)', () => {
  for (const [file, body] of Object.entries(outputs()))
    assert.equal(fs.readFileSync(path.join(ROOT, file), 'utf8'), body, file + ' is stale');
});

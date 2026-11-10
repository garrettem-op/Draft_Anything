/* Regression tests for the roster-wide evidence audit (2026-11-10), revised to the owner's evidence standard and to
   the PR #57 integration review. The standard: accuracy, not source type. A specific, traceable community entry is
   credible evidence; corroboration needs a reviewed agreement marker; the automation says what it checked and no
   more; conditions and equipment sit on their own worklist; no grant changes. No network, no paid AI. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const {
  CHARACTER_ABILITIES, CHARACTER_ABILITY_TAGS, CHARACTER_ABILITY_SOURCE_TIERS, CHARACTER_ABILITY_SOURCE_TYPES,
  CHARACTER_ABILITY_STATUSES, characterAbilitySourceTier, characterAbilityFeatUrls, characterAbilityIndependentSources,
  characterAbilityHasReviewedAgreement, characterAbilityFeatIsSpecific, characterAbilityVerification,
  characterAbilityCheckedBy, characterAbilityReviewReason, characterAbilityProvenance
} = require('../data/character-abilities.js');
const { POOL_IDS, POWER_TAGS } = require('../tools/ability-audit-lib.cjs');
const { sourceAudit, outputs, staleOutputs, indexDigest, HANDLING, STATUSES, DOC, JSON_FILE } = require('../tools/ability-source-audit.cjs');

const ROOT = path.join(__dirname, '..');
const TOOL = path.join(ROOT, 'tools/ability-source-audit.cjs');
const URL_FIELDS = ['source', 'verifiedBy', 'dialogueSource', 'speciesSource', 'officialSource'];
const records = Object.entries(CHARACTER_ABILITIES).flatMap(([id, rs]) => rs.map(r => [id, r]));
const status = (id, tag) => characterAbilityVerification(CHARACTER_ABILITIES[id].find(r => r.tag === tag));
const WIKI = 'https://dc.fandom.com/wiki/Raven_(Rachel_Roth)';
const WIKI_2 = 'https://en.wikipedia.org/wiki/Raven_(DC_Comics)';
const OFFICIAL = 'https://www.dc.com/characters/raven';
const SPECIFIC = 'Teleports the Titans out of Azarath inside her soul-self (The New Teen Titans #3, 1980).';
const SCENE = 'The New Teen Titans #3 (1980), escape from Azarath';
const THIN = 'Levitates and flies.';
const VAGUE_LONG = 'He has the power to fly through the sky at will.';
// Digest of CHARACTER_ABILITY_TAGS for this PR. The audit must never move it. Update it only in a PR that
// deliberately changes grants, and say so in that PR.
const PINNED_INDEX_DIGEST = 'd8e3b17f0966960e323462dfa8bca049ad16dc4792152422def4a171c546876c';

test('every host cited by an evidence record has a source type', () => {
  const types = new Set(CHARACTER_ABILITY_SOURCE_TYPES);
  for (const t of Object.values(CHARACTER_ABILITY_SOURCE_TIERS)) assert.ok(types.has(t), t);
  for (const [id, r] of records) for (const k of URL_FIELDS) for (const u of [].concat(r[k] || []))
    assert.ok(characterAbilitySourceTier(u), id + ' ' + r.tag + ' cites an unclassified host: ' + u);
  assert.equal(characterAbilitySourceTier('https://starwars.fandom.com/wiki/X'), 'community');
  assert.equal(characterAbilitySourceTier('not a url'), null);
});

test('source type never lowers a rating: identical specific evidence rates the same from a wiki or an official site', () => {
  for (const source of [WIKI, OFFICIAL, 'https://tvtropes.org/pmwiki/x', 'https://comicvine.gamespot.com/x'])
    assert.equal(characterAbilityVerification({ feat: SPECIFIC, source }), 'credible', source);
  for (const source of [WIKI, OFFICIAL]) assert.equal(characterAbilityVerification({ feat: THIN, source }), 'needs-review', source);
  // Retired, source-based vocabulary appears nowhere.
  for (const [id, r] of records) assert.ok(!['provisional', 'official-cited', 'verified'].includes(characterAbilityVerification(r)), id + ' ' + r.tag);
});

test('a vague claim is not traceable evidence, however long, and a URL field is not a feat', () => {
  // Negative: >= 8 words, no occurrence, umbrella continuity.
  assert.equal(characterAbilityFeatIsSpecific({ feat: VAGUE_LONG, continuity: 'DC mainline comics' }), false);
  assert.equal(characterAbilityVerification({ feat: VAGUE_LONG, source: OFFICIAL, continuity: 'DC mainline comics' }), 'needs-review');
  assert.equal(characterAbilityVerification({ feat: VAGUE_LONG, source: WIKI }), 'needs-review');
  // Negative: a bare label stays untraceable even inside a specific run.
  assert.equal(characterAbilityFeatIsSpecific({ feat: THIN, continuity: 'The New Teen Titans (1980) onward' }), false);
  // Negative: the presence of verifiedBy or dialogueSource, or a stub scene, does not make a feat specific.
  assert.equal(characterAbilityFeatIsSpecific({ feat: THIN, verifiedBy: WIKI_2, dialogueSource: 'https://imsdb.com/x' }), false);
  assert.equal(characterAbilityFeatIsSpecific({ feat: THIN, scene: 'a comic' }), false);
  // Positive: a scene, a cited occurrence, or a specific work with a real description.
  assert.equal(characterAbilityFeatIsSpecific({ feat: THIN, scene: SCENE }), true);
  assert.equal(characterAbilityFeatIsSpecific({ feat: 'Commands all waters and seas (Silm. Valaquenta).' }), true);
  assert.equal(characterAbilityFeatIsSpecific({ feat: "In 'Karate Star' he regrows an arm." }), true);
  assert.equal(characterAbilityFeatIsSpecific({ feat: 'In Halo 2 the Arbiter cloaks with active camouflage.' }), true);
  assert.equal(characterAbilityFeatIsSpecific({ feat: 'Alduin knows the Frost Breath shout.', continuity: 'The Elder Scrolls V: Skyrim' }), true);
  // Live data.
  assert.equal(status('dc:Raven', 'flight'), 'needs-review');
  assert.equal(status('dc:Superman', 'healing'), 'needs-review');
  assert.equal(status('dc:Batman', 'stealth'), 'credible');
  assert.equal(status('lotr:Gandalf', 'fire'), 'credible');
  assert.equal(status('toons:Jafar', 'fire'), 'needs-review', 'the fire scene itself is unconfirmed');
});

test('corroboration needs a reviewed agreement marker, never just two URLs', () => {
  // Negative: two unrelated sites, no review: credible, not corroborated.
  assert.equal(characterAbilityIndependentSources({ source: WIKI, dialogueSource: 'https://imsdb.com/x' }), 2);
  assert.equal(characterAbilityVerification({ feat: SPECIFIC, source: WIKI, dialogueSource: 'https://imsdb.com/x' }), 'credible');
  assert.equal(characterAbilityVerification({ feat: SPECIFIC, source: WIKI, speciesSource: OFFICIAL }), 'credible');
  // Negative: verifiedBy without a reviewed scene.
  assert.equal(characterAbilityVerification({ feat: SPECIFIC, source: WIKI, verifiedBy: WIKI_2 }), 'credible');
  // Negative: one site twice, and sites that share an owner, are not independent.
  assert.equal(characterAbilityHasReviewedAgreement({ scene: SCENE, source: WIKI, verifiedBy: WIKI + '#Powers' }), false);
  assert.equal(characterAbilityHasReviewedAgreement({ scene: SCENE, source: 'https://d23.com/a-to-z/x/', verifiedBy: 'https://www.starwars.com/databank/x' }), false);
  assert.equal(characterAbilityHasReviewedAgreement({ scene: SCENE, source: 'https://comicvine.gamespot.com/x', verifiedBy: 'https://www.gamespot.com/y' }), false);
  // Negative: a hand label of 'corroborated' without the marker does not stand.
  assert.equal(characterAbilityVerification({ feat: SPECIFIC, source: WIKI, verification: 'corroborated' }), 'credible');
  // Positive: reviewed scene plus a second owner. Two community wikis can corroborate each other.
  assert.equal(characterAbilityVerification({ feat: SPECIFIC, scene: SCENE, source: WIKI, verifiedBy: WIKI_2 }), 'corroborated');
  assert.equal(characterAbilityVerification({ feat: SPECIFIC, scene: SCENE, source: WIKI, verifiedBy: OFFICIAL }), 'corroborated');
  // officialSource confirms identity only, never the feat.
  assert.ok(!characterAbilityFeatUrls({ source: WIKI, officialSource: OFFICIAL }).includes(OFFICIAL));
  // Live data: every corroborated record carries the reviewed marker.
  for (const [id, r] of records) if (characterAbilityVerification(r) === 'corroborated')
    assert.ok(characterAbilityHasReviewedAgreement(r), id + ' ' + r.tag);
});

test('labels say who checked them, and review reasons name an actual gap', () => {
  assert.equal(characterAbilityCheckedBy({ feat: SPECIFIC, source: WIKI }), 'automated');
  assert.equal(characterAbilityCheckedBy({ feat: SPECIFIC, source: WIKI, verification: 'credible' }), 'review');
  assert.equal(characterAbilityCheckedBy({ feat: THIN, source: WIKI, verification: 'owner-ruling' }), 'owner');
  assert.equal(characterAbilityReviewReason({ feat: VAGUE_LONG, source: WIKI }), 'untraceable');
  assert.equal(characterAbilityReviewReason({ feat: SPECIFIC, source: WIKI, verification: 'needs-review' }), 'unconfirmed-scene');
  assert.equal(characterAbilityReviewReason({ feat: SPECIFIC, source: WIKI, conflict: 'x' }), 'conflict');
  assert.equal(characterAbilityReviewReason({ feat: SPECIFIC, source: WIKI }), null);
  const a = sourceAudit();
  for (const r of a.rows) {
    if (['needs-review', 'investigate', 'unsourced'].includes(r.status)) assert.ok(r.reviewReason, r.id + ' ' + r.tag);
    else assert.equal(r.reviewReason, undefined, r.id + ' ' + r.tag);
  }
  // The report must not present automated triage as fact-checking.
  const doc = outputs()[DOC];
  assert.match(doc, /documentation is complete, not that the feat was fact-checked/);
  assert.match(doc, /Only \d+ were checked by a person/);
});

test('contradictions surface for investigation; owner rulings stay final', () => {
  const conflict = 'Pre-Crisis comics give him flight; post-Crisis he only leaps';
  assert.equal(characterAbilityVerification({ feat: SPECIFIC, scene: SCENE, source: WIKI, verifiedBy: OFFICIAL, conflict }), 'investigate');
  assert.equal(characterAbilityVerification({ feat: SPECIFIC, source: WIKI, verification: 'credible', conflict }), 'investigate');
  assert.equal(characterAbilityVerification({ feat: THIN, source: WIKI, verification: 'owner-ruling', conflict }), 'owner-ruling');
});

test('hand-review labels use the current vocabulary, and owner rulings cite their ruling', () => {
  for (const [id, r] of records) {
    if (!r.verification) continue;
    assert.ok(CHARACTER_ABILITY_STATUSES.includes(r.verification), id + ' ' + r.tag + ': ' + r.verification);
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
  assert.equal(Object.values(a.checkedBy).reduce((n, k) => n + k, 0), expected);
  for (const r of a.rows) assert.ok(STATUSES.includes(r.status), r.id + ' ' + r.tag);
  for (const r of a.rows.slice(0, 200))
    assert.equal(characterAbilityProvenance({ pool: r.pool, n: r.character }, r.tag).verification, r.status, r.id + ' ' + r.tag);
});

test('the audit changes no grant: the tag index digest is pinned and the audit does not mutate it', () => {
  const before = indexDigest();
  const snapshot = JSON.stringify(CHARACTER_ABILITY_TAGS);
  const a = sourceAudit();
  outputs();
  assert.equal(indexDigest(), before, 'running the audit changed the tag index');
  assert.equal(JSON.stringify(CHARACTER_ABILITY_TAGS), snapshot);
  assert.equal(a.indexDigest, before);
  assert.equal(before, PINNED_INDEX_DIGEST, 'CHARACTER_ABILITY_TAGS changed. Only a deliberate grant change may update PINNED_INDEX_DIGEST.');
  // The digest ignores key order but catches a real change.
  const reordered = Object.fromEntries(Object.entries(CHARACTER_ABILITY_TAGS).reverse());
  assert.equal(indexDigest(reordered), before);
  const changed = JSON.parse(snapshot); changed.dc.Batman = [...changed.dc.Batman, 'flight'];
  assert.notEqual(indexDigest(changed), before);
});

test('form, power-up and item dependencies form a stable, actionable worklist that strips nothing', () => {
  const a = sourceAudit(), again = sourceAudit();
  assert.deepEqual(a.conditions, again.conditions, 'worklist is deterministic');
  assert.equal(new Set(a.conditions.map(c => c.conditionId)).size, a.conditions.length, 'conditionIds are unique');
  const handlings = new Set(Object.values(HANDLING).map(h => h[0]));
  for (const c of a.conditions) {
    assert.equal(c.conditionId, 'condition:' + c.id + ':' + c.tag);
    assert.ok(HANDLING[c.dependencyType], c.conditionId + ' ' + c.dependencyType);
    assert.ok(handlings.has(c.proposedHandling) && c.handlingBasis && c.dependency, c.conditionId);
    assert.match(c.eligibility, /^unchanged/);
    const [pool, ...rest] = c.id.split(':');
    assert.ok(CHARACTER_ABILITY_TAGS[pool][rest.join(':')].includes(c.tag), c.conditionId + ' must stay granted');
  }
  const has = id => a.conditions.some(c => c.conditionId === id);
  assert.ok(has('condition:games:Mario:fire'));
  assert.ok(has('condition:lotr:Frodo Baggins:stealth'));
  assert.equal(a.conditions.find(c => c.conditionId === 'condition:toons:Jafar:giants').proposedHandling, 'variant-only');
  // Already ruled, so not conditions: a character's own glide counts for Skyborne.
  assert.ok(!has('condition:games:Knuckles:flight'));
  assert.ok(!has('condition:games:Spyro:flight'));
});

test("Peter Pan's flight is an owner ruling: Skyborne, granted, and not reopened as a pixie-dust condition", () => {
  const pp = CHARACTER_ABILITIES['toons:Peter Pan'].find(r => r.tag === 'flight');
  assert.equal(characterAbilityVerification(pp), 'owner-ruling');
  assert.ok(CHARACTER_ABILITY_TAGS.toons['Peter Pan'].includes('flight'));
  const a = sourceAudit();
  const row = a.rows.find(r => r.id === 'toons:Peter Pan' && r.tag === 'flight');
  assert.equal(row.status, 'owner-ruling');
  assert.equal(row.gate, undefined);
  assert.ok(!a.conditions.some(c => c.id === 'toons:Peter Pan'));
});

test('--check passes when outputs are current and fails when they drift or go missing', () => {
  const ok = spawnSync(process.execPath, [TOOL, '--check'], { encoding: 'utf8' });
  assert.equal(ok.status, 0, ok.stderr);
  assert.deepEqual(staleOutputs(ROOT), []);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ability-audit-'));
  try {
    for (const f of [DOC, JSON_FILE]) { fs.mkdirSync(path.dirname(path.join(tmp, f)), { recursive: true }); fs.copyFileSync(path.join(ROOT, f), path.join(tmp, f)); }
    assert.equal(spawnSync(process.execPath, [TOOL, '--check', '--root', tmp]).status, 0);
    fs.appendFileSync(path.join(tmp, DOC), '\nhand edit\n');
    const drift = spawnSync(process.execPath, [TOOL, '--check', '--root', tmp], { encoding: 'utf8' });
    assert.equal(drift.status, 1);
    assert.match(drift.stderr, /character-ability-source-audit\.md/);
    fs.rmSync(path.join(tmp, JSON_FILE));
    assert.deepEqual(staleOutputs(tmp).sort(), [DOC, JSON_FILE].sort());
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});

test('the evidence-audit report and JSON are up to date (run tools/ability-source-audit.cjs --write)', () => {
  for (const [file, body] of Object.entries(outputs()))
    assert.equal(fs.readFileSync(path.join(ROOT, file), 'utf8'), body, file + ' is stale');
});

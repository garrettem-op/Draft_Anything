/* Roster-wide evidence audit for character ability grants (2026-11-10, revised to the owner's evidence
   standard and to the PR #57 integration review the same day). For every power a roster character holds in
   CHARACTER_ABILITY_TAGS, records how well the record documents it (characterAbilityVerification in
   data/character-abilities.js), who or what checked that, which kinds of source it cites, and whether the power
   depends on a form, power-up or item. Accuracy, not source type, decides the status. Read-only: it never
   changes a grant, and the test suite pins the tag index digest to prove it.

   node tools/ability-source-audit.cjs --write                regenerate the report and JSON
   node tools/ability-source-audit.cjs --check [--root DIR]   exit 1 if either file is missing or out of date */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {
  CHARACTER_ABILITY_TAGS, CHARACTER_ABILITIES, CHARACTER_ABILITY_CARRYOVER, CHARACTER_ABILITY_STATUSES,
  characterAbilitySourceTier, characterAbilityFeatUrls, characterAbilityIndependentSources,
  characterAbilityVerification, characterAbilityCheckedBy, characterAbilityReviewReason
} = require('../data/character-abilities.js');
const { POOL_IDS, POWER_TAGS } = require('./ability-audit-lib.cjs');

const ROOT = path.resolve(__dirname, '..');
const DOC = 'docs/character-ability-source-audit.md';
const JSON_FILE = 'research/ABILITY_SOURCE_AUDIT_2026-11.json';
// Tags whose challenges turn on a threshold or an owner ruling (size, stealth feat, mind powers,
// healing others vs resting, true teleport). A wrong grant here is the likeliest, so they go first.
const PRIORITY_TAGS = ['stealth', 'giants', 'psychic', 'healing', 'teleport'];
// Words that point at a form, power-up or item (not a mere condition such as contact or available water).
// Pokémon TM moves are excluded: the owner ruled that learnable moves count.
const GATE_PATTERN = /\bforms?\b|power-?up|transform|\bwish|stolen|borrow|copy ability|materia|only (while|as) (wearing|transformed|super|in)|only in [a-z]+ form|\b(requires?|needs?) (the|a|an|equipped)\b|\bitem\b|\barmou?r\b|\bmask\b|\bring\b|\bsuit\b|\bhabit\b|wings\b|jetpack|carpet|necrosword|gauntlet|stone\b|pill\b|super (sonic|grover|knuckles)/i;
const GATE_EXCLUDE = /\bTM\d+|TM-only/;
// Carry-overs ('unsourced') have a reviewed description but no link yet; every other status is per record.
const STATUSES = [...CHARACTER_ABILITY_STATUSES, 'unsourced'];
// Statuses that need someone to look at the grant again.
const REVIEW = ['investigate', 'needs-review', 'unsourced'];
const POOL_NAMES = { nba: 'NBA', mcu: 'MCU', toons: 'Cartoons', muppets: 'Muppets', games: 'Video games', pokemon: 'Pokémon',
  starwars: 'Star Wars', dc: 'DC', lotr: 'Middle-earth', harrypotter: 'Harry Potter' };

/* Digest of the reviewed tag index. Key order is normalised so only a real grant change moves it. */
function indexDigest(tags = CHARACTER_ABILITY_TAGS) {
  const norm = Object.fromEntries(Object.keys(tags).sort().map(p =>
    [p, Object.fromEntries(Object.keys(tags[p]).sort().map(n => [n, [...tags[p][n]].sort()]))]));
  return crypto.createHash('sha256').update(JSON.stringify(norm)).digest('hex');
}

/* Form, power-up and item dependencies: what kind, and a proposed handling for the owner to rule on.
   Proposals only. Eligibility is unchanged until the owner rules and the engine (ChatGPT) implements it. */
const HANDLING = {
  'owned-item': ['count-base', 'Signature gear the character carries in normal play; follows the ruling that armor counts for tech.'],
  'equipment': ['count-base', 'Signature gear the character carries in normal play; follows the ruling that armor counts for tech.'],
  'self-transformation': ['count-base', 'A form the character takes at will, by their own power.'],
  'power-up': ['owner-ruling-needed', 'A temporary pickup or consumable. Either count it as a signature move, or move it to a variant.'],
  'granted-form': ['variant-only', 'The power belongs to a form granted by someone else (a wish, a Vala) or to a later form, so the base character does not hold it.'],
  'stolen-item': ['variant-only', "The power needs someone else's item, held only briefly."],
  'wish-form': ['variant-only', 'The power exists only after a wish is granted.'],
};
function classifyDependency(record) {
  if (record.formGate?.type) return record.formGate.type;
  const t = String(record.limitation || '');
  if (/borrow|given by|stolen/i.test(t)) return /stolen/i.test(t) ? 'stolen-item' : 'granted-form';
  if (/boss form|dark beast/i.test(t)) return 'self-transformation';
  if (/power-?up|flower|mushroom|leaf|shell|pill|copy ability|materia|chaos emerald|super sonic|super knuckles|temporary|time-limited/i.test(t)) return 'power-up';
  if (/\bforms?\b|transform|devil|demonic|bear|animal|super grover|sandstorm|boss|dark beast/i.test(t)) return 'self-transformation';
  return 'equipment';
}

function sourceAudit() {
  const grants = [];
  for (const pool of POOL_IDS) {
    for (const [n, tags] of Object.entries(CHARACTER_ABILITY_TAGS[pool] || {})) {
      for (const tag of tags.filter(t => POWER_TAGS.includes(t))) {
        const id = pool + ':' + n;
        const record = (CHARACTER_ABILITIES[id] || []).find(r => r.tag === tag);
        const carried = record ? null : CHARACTER_ABILITY_CARRYOVER.find(x => x.id === id && x.tag === tag);
        if (!record && !carried) throw new Error('No provenance for ' + id + ' ' + tag);
        const urls = record ? characterAbilityFeatUrls(record) : [];
        const sourceTypes = [...new Set(urls.map(characterAbilitySourceTier))].sort();
        const sites = record ? characterAbilityIndependentSources(record) : 0;
        const status = record ? characterAbilityVerification(record) : 'unsourced';
        // Already ruled, so not candidates: tech gear and armor (armor counts for tech), aerial mounts, owner rulings,
        // and a character's own glide (the owner ruled a glide counts for Skyborne).
        const ruled = tag === 'tech' || record?.kind === 'mount' || record?.verification === 'owner-ruling' ||
          (record?.kind === 'glide' && /glide only/i.test(String(record.limitation || '')));
        const gate = record?.formGate?.type || (!ruled && record?.limitation && GATE_PATTERN.test(record.limitation) &&
          !GATE_EXCLUDE.test(record.limitation) ? 'candidate' : null);
        grants.push({
          id, pool, character: n, tag, status,
          checkedBy: record ? characterAbilityCheckedBy(record) : 'none',
          ...(record ? (characterAbilityReviewReason(record) ? { reviewReason: characterAbilityReviewReason(record) } : {})
            : { reviewReason: 'missing-source' }),
          priority: PRIORITY_TAGS.includes(tag) ? 1 : 2,
          sourceTypes, source: record?.source || null,
          // Two or more owners cited, but no reviewer has confirmed they describe the same feat.
          ...(sites >= 2 && status !== 'corroborated' ? { multipleSitesUnchecked: sites } : {}),
          ...(record?.conflict ? { conflict: record.conflict } : {}),
          // An owner policy ruling settles eligibility, not whether the feat occurred; the status stays as rated.
          ...(record?.policyRuling ? { policyRuling: record.policyRuling } : {}),
          ...(gate ? { gate, gateNote: record.formGate?.note || record.limitation } : {}),
          ...(carried ? { basis: carried.basis } : {})
        });
      }
    }
  }
  const conditions = grants.filter(g => g.gate).map(g => {
    const record = CHARACTER_ABILITIES[g.id].find(r => r.tag === g.tag);
    const dependencyType = classifyDependency(record);
    const [proposedHandling, handlingBasis] = HANDLING[dependencyType];
    return { conditionId: 'condition:' + g.id + ':' + g.tag, id: g.id, character: g.character, tag: g.tag,
      continuity: record.continuity || null, dependencyType, dependency: g.gateNote, typed: g.gate !== 'candidate',
      proposedHandling, handlingBasis, eligibility: 'unchanged: granted until the owner rules' };
  });
  const count = rows => Object.fromEntries(STATUSES.map(s => [s, rows.filter(g => g.status === s).length]));
  const byPool = Object.fromEntries(POOL_IDS.map(p => [p, count(grants.filter(g => g.pool === p))]));
  const byTag = Object.fromEntries(POWER_TAGS.map(t => [t, count(grants.filter(g => g.tag === t))]));
  const checked = Object.fromEntries(['owner', 'review', 'automated', 'none'].map(k => [k, grants.filter(g => g.checkedBy === k).length]));
  const hosts = {};
  for (const rs of Object.values(CHARACTER_ABILITIES)) for (const r of rs) {
    for (const u of characterAbilityFeatUrls(r)) {
      const h = new URL(u).hostname.replace(/^www\./, '');
      const key = characterAbilitySourceTier(u) + '\t' + (/(^|\.)fandom\.com$/.test(h) ? '*.fandom.com' : h);
      hosts[key] = (hosts[key] || 0) + 1;
    }
  }
  // Grants whose record cites community sites only. The first audit called these all "provisional"; the
  // revised standard rates each on its own documentation, so this shows where they actually landed.
  const communityOnly = count(grants.filter(g => g.sourceTypes.length && g.sourceTypes.every(t => t === 'community')));
  return { audited: '2026-11-10', standard: 'accuracy-first (owner, 2026-11-10)', indexDigest: indexDigest(),
    grants: grants.length, totals: count(grants), checkedBy: checked, byPool, byTag, communityOnly, hosts,
    conditions, rows: grants };
}

function markdown(a) {
  const L = [];
  const pct = (n, d) => d ? Math.round(100 * n / d) + '%' : '-';
  const sum = c => STATUSES.reduce((t, s) => t + c[s], 0);
  const documented = c => c['owner-ruling'] + c.corroborated + c.credible;
  L.push('# Character ability evidence audit (2026-11-10)', '',
    'Generated by `node tools/ability-source-audit.cjs --write`. Do not edit by hand.', '',
    'This covers every power grant in `CHARACTER_ABILITY_TAGS`, for every character in all ten pools. It reports how well the record behind each grant documents it, and who or what checked that. **It changes no eligibility:** every status below is still granted, and a test pins the tag index digest (`' + a.indexDigest.slice(0, 12) + '…`). Machine-readable rows: `' + JSON_FILE + '`.', '');
  L.push('## Evidence standard', '',
    'Owner ruling, 2026-11-10: the goal is an accurate character knowledge database, not a source hierarchy. For comics and fantasy universes, dedicated community databases are often the most complete record of decades of storylines, alternate continuities and obscure feats. **Community-sourced does not mean unreliable.** Source type and evidence quality are separate: type is recorded for transparency and never lowers a rating; quality (specificity, traceability, continuity, consistency, corroboration) decides the status.', '',
    '| Evidence | Treatment | Status |', '| --- | --- | --- |',
    '| Specific, traceable claim from a community source | Credible evidence | `credible` |',
    '| Specific, traceable claim from an official source | Credible evidence | `credible` |',
    '| Reviewer confirmed an independent second source describes the same feat | Strong corroboration | `corroborated` |',
    '| No traceable occurrence, or a scene a reviewer could not confirm | Needs review | `needs-review` |',
    '| Contradictory accounts, mixed continuities, disputed interpretation | Requires investigation | `investigate` |',
    '| Equipment-dependent or transformed abilities | Evaluate eligibility conditions | *Eligibility conditions* worklist below, whatever the status |',
    '| Settled by the owner | Final | `owner-ruling` |',
    '| Reviewed pre-audit carry-over with no link yet | Add a source | `unsourced` |', '',
    '### What the automation checked, and what it did not', '',
    '- **`credible` means documentation is complete, not that the feat was fact-checked.** The rules confirm the record points at where the feat happens: a named scene, an occurrence cited in the feat (work, year, chapter, issue, episode or quoted title), or a continuity naming a specific work or run rather than an umbrella ("DC mainline comics", "Sonic series"). Description length and the mere presence of a URL field do not count.',
    '- **`corroborated` is never inferred from URLs.** It needs a reviewed marker: a `scene` and a `verifiedBy` source, from a different owner than the main source, checked to describe the same feat. Sites that share one editorial voice count as one owner (the Disney-owned official sites; GameSpot and Comic Vine). Separate Fandom wikis are separate communities. Records citing two or more owners without that review are flagged `multipleSitesUnchecked`, not corroborated.',
    '- **A recorded `conflict`** always surfaces as `investigate` unless the owner has ruled.',
    '- **Not automated:** whether a cited page actually supports the claim, circular sourcing (wikis citing each other), and continuity mismatches. Those come from human review of flagged and sampled records, prioritized by risk and dispute, never by domain.', '');
  L.push('## Totals', '', '| Status | Grants | Share |', '| --- | ---: | ---: |');
  for (const s of STATUSES) L.push('| ' + s + ' | ' + a.totals[s] + ' | ' + pct(a.totals[s], a.grants) + ' |');
  L.push('| **all** | **' + a.grants + '** | |', '');
  L.push('### Who checked it', '', '| Checked by | Grants | Meaning |', '| --- | ---: | --- |',
    '| owner | ' + a.checkedBy.owner + ' | An owner ruling. Final. |',
    '| review | ' + a.checkedBy.review + ' | A person read the sources and set the label. |',
    '| automated | ' + a.checkedBy.automated + ' | Rules only: documentation triage, not a fact-check. |',
    '| none | ' + a.checkedBy.none + ' | Carry-over with no source link. |', '',
    '**' + documented(a.totals) + ' grants are documented (owner-ruling, corroborated or credible).** That is documentation triage. Only ' + (a.checkedBy.owner + a.checkedBy.review) + ' were checked by a person; the rest are traceable claims that have not been independently fact-checked.', '');
  const co = a.communityOnly, coN = sum(co);
  L.push('### Grants that cite community sources only (' + coN + ')', '',
    'The first version of this audit labelled every one of these "provisional" because of where its source was published. That figure was never a share of unreliable claims. Rated on their own documentation instead:', '',
    '| Status | Grants |', '| --- | ---: |');
  for (const s of STATUSES) if (co[s]) L.push('| ' + s + ' | ' + co[s] + ' |');
  L.push('', 'The "provisional" label is retired.', '');
  L.push('## By pool', '', '| Pool | ' + STATUSES.join(' | ') + ' | Total | Documented |', '| --- |' + ' ---: |'.repeat(STATUSES.length + 2));
  for (const [p, c] of Object.entries(a.byPool)) {
    const t = sum(c); if (!t) continue;
    L.push('| ' + POOL_NAMES[p] + ' | ' + STATUSES.map(s => c[s]).join(' | ') + ' | ' + t + ' | ' + pct(documented(c), t) + ' |');
  }
  L.push('', '"Documented" counts owner rulings, corroborated and credible grants. NBA players hold no powers, so the NBA row is omitted.', '');
  L.push('## By power', '', '| Power | ' + STATUSES.join(' | ') + ' | Total |', '| --- |' + ' ---: |'.repeat(STATUSES.length + 1));
  for (const [t, c] of Object.entries(a.byTag)) L.push('| ' + t + ' | ' + STATUSES.map(s => c[s]).join(' | ') + ' | ' + sum(c) + ' |');
  L.push('');
  L.push('## Source hosts by type', '', 'For transparency only: type never lowers a rating. Every host is classified in `CHARACTER_ABILITY_SOURCE_TIERS`, so a test catches a typo\'d or unknown host.', '',
    '| Type | Host | Citations |', '| --- | --- | ---: |');
  for (const [k, n] of Object.entries(a.hosts).sort((x, y) => x[0].split('\t')[0].localeCompare(y[0].split('\t')[0]) || y[1] - x[1])) {
    const [tier, host] = k.split('\t'); L.push('| ' + tier + ' | ' + host + ' | ' + n + ' |');
  }
  L.push('');
  const multi = a.rows.filter(r => r.multipleSitesUnchecked);
  L.push('## Multiple sources, agreement unchecked (' + multi.length + ')', '',
    'These cite two or more independent owners, but no reviewer has confirmed the sources describe the same feat, so they are not counted as corroborated.', '');
  for (const r of multi) L.push('- ' + r.id + ': ' + r.tag + ' (' + r.multipleSitesUnchecked + ' owners, ' + r.status + ')');
  L.push('');
  const conflicts = a.rows.filter(r => r.status === 'investigate');
  L.push('## Requires investigation (' + conflicts.length + ')', '',
    'Records with a `conflict` note: contradictory accounts, mixed continuities or a disputed interpretation. ' + (conflicts.length ? '' : 'None recorded yet. Add `conflict: "<what disagrees>"` to a record when sources or continuities disagree on a feat.'), '');
  for (const r of conflicts) L.push('- ' + r.id + ': ' + r.tag + '. ' + r.conflict);
  if (conflicts.length) L.push('');
  const policy = a.rows.filter(r => r.policyRuling);
  L.push('## Owner policy rulings, sourcing still open (' + policy.length + ')', '',
    'The owner ruled that the feat, as described, qualifies for the power. That settles eligibility, not whether the feat canonically occurred, so these keep the status their sourcing earns (not `owner-ruling`) and stay on the worklist until a specific occurrence is pinned. The grant stays.', '');
  for (const r of policy) L.push('- ' + r.id + ': ' + r.tag + ' (' + r.status + (r.reviewReason ? ', ' + r.reviewReason : '') + '). ' + r.policyRuling);
  L.push('');
  const byHandling = h => a.conditions.filter(c => c.proposedHandling === h).length;
  L.push('## Eligibility conditions: form, power-up and item dependencies (' + a.conditions.length + ')', '',
    'Campaign counts every indexed tag for the base character. These grants depend on a form, power-up or item, so the open question is the eligibility condition, not the evidence. Each has a stable `conditionId` and a **proposed** handling for the owner to rule on: ' +
    byHandling('count-base') + ' count-base, ' + byHandling('variant-only') + ' variant-only, ' + byHandling('owner-ruling-needed') + ' owner-ruling-needed. **Nothing is stripped:** every grant stays eligible until the owner rules and the engine implements it. `typed` = the dependency is recorded in `formGate`; otherwise it was detected from the record\'s `limitation` text.', '');
  for (const [type, [handling, basis]] of Object.entries(HANDLING)) {
    const rows = a.conditions.filter(c => c.dependencyType === type);
    if (!rows.length) continue;
    L.push('### ' + type + ' → proposed ' + handling + ' (' + rows.length + ')', '', basis, '',
      '| conditionId | Continuity | Dependency | Typed |', '| --- | --- | --- | --- |');
    for (const c of rows) L.push('| `' + c.conditionId + '` | ' + String(c.continuity || '').replace(/\|/g, '/') + ' | ' + String(c.dependency).replace(/\|/g, '/') + ' | ' + (c.typed ? 'yes' : 'no') + ' |');
    L.push('');
  }
  L.push('## Worklist: grants to check', '',
    'Ordered by risk and dispute, not by source domain: `investigate` first, then `needs-review` (`unconfirmed-scene` before `untraceable`), then `unsourced` carry-overs that need a link. Priority 1 covers the powers whose challenges turn on a threshold or an owner ruling: ' + PRIORITY_TAGS.join(', ') + '. Priority 2 is everything else. Being on this list does not mean a grant is wrong; it means the record does not yet show where the feat happens.', '');
  const order = r => REVIEW.indexOf(r.status) * 2 + (r.reviewReason === 'unconfirmed-scene' ? 0 : 1);
  for (const pr of [1, 2]) {
    const rows = a.rows.filter(r => r.priority === pr && REVIEW.includes(r.status));
    L.push('### Priority ' + pr + ' (' + rows.length + ')', '');
    for (const p of POOL_IDS) {
      const pr_rows = rows.filter(r => r.pool === p).sort((x, y) => order(x) - order(y) || x.character.localeCompare(y.character));
      if (!pr_rows.length) continue;
      L.push('<details><summary>' + POOL_NAMES[p] + ' (' + pr_rows.length + ')</summary>', '');
      for (const r of pr_rows) L.push('- ' + r.character + ': ' + r.tag + ' (' + r.status + (r.reviewReason ? ', ' + r.reviewReason : '') + ')');
      L.push('', '</details>', '');
    }
  }
  return L.join('\n') + '\n';
}

function outputs() {
  const a = sourceAudit();
  return { [DOC]: markdown(a), [JSON_FILE]: JSON.stringify(a, null, 1) + '\n' };
}
/* Files under root that are missing or differ from what the current data generates. */
function staleOutputs(root = ROOT) {
  return Object.entries(outputs()).filter(([f, body]) => {
    const p = path.join(root, f);
    return !fs.existsSync(p) || fs.readFileSync(p, 'utf8') !== body;
  }).map(([f]) => f);
}

if (require.main === module) {
  const i = process.argv.indexOf('--root');
  const root = i > -1 ? path.resolve(process.argv[i + 1]) : ROOT;
  if (process.argv.includes('--write')) for (const [f, body] of Object.entries(outputs())) fs.writeFileSync(path.join(root, f), body);
  else if (process.argv.includes('--check')) {
    const stale = staleOutputs(root);
    if (stale.length) { console.error('Out of date: ' + stale.join(', ') + '. Run --write.'); process.exit(1); }
    console.log('Source audit is up to date.');
  } else { console.log('Usage: --write or --check [--root DIR]'); process.exit(2); }
}
module.exports = { sourceAudit, outputs, staleOutputs, indexDigest, classifyDependency, HANDLING, PRIORITY_TAGS, STATUSES, REVIEW, DOC, JSON_FILE };

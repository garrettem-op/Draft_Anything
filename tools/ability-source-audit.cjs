/* Roster-wide evidence audit for character ability grants (2026-11-10, revised to the owner's evidence
   standard the same day). For every power a roster character holds in CHARACTER_ABILITY_TAGS, records how
   well the record supports it (characterAbilityVerification in data/character-abilities.js), which kinds of
   source it cites, and whether the power depends on a form, power-up or item. Accuracy, not source type,
   decides the status. Read-only: it never changes a grant.

   node tools/ability-source-audit.cjs --write   regenerate the report and JSON
   node tools/ability-source-audit.cjs --check   exit 1 if either file is out of date */
const fs = require('node:fs');
const path = require('node:path');
const {
  CHARACTER_ABILITY_TAGS, CHARACTER_ABILITIES, CHARACTER_ABILITY_CARRYOVER,
  CHARACTER_ABILITY_STATUSES, characterAbilitySourceTier, characterAbilityFeatUrls, characterAbilityVerification
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
// Statuses that need someone to look at the grant again. The rest stand as they are.
const REVIEW = ['investigate', 'needs-review', 'unsourced'];
const POOL_NAMES = { nba: 'NBA', mcu: 'MCU', toons: 'Cartoons', muppets: 'Muppets', games: 'Video games', pokemon: 'Pokémon',
  starwars: 'Star Wars', dc: 'DC', lotr: 'Middle-earth', harrypotter: 'Harry Potter' };

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
        // Already ruled, so not candidates: tech gear and armor (armor counts for tech), aerial mounts, owner rulings.
        const ruled = tag === 'tech' || record?.kind === 'mount' || record?.verification === 'owner-ruling';
        const gate = record?.formGate?.type || (!ruled && record?.limitation && GATE_PATTERN.test(record.limitation) &&
          !GATE_EXCLUDE.test(record.limitation) ? 'candidate' : null);
        grants.push({
          id, pool, character: n, tag,
          status: record ? characterAbilityVerification(record) : 'unsourced',
          priority: PRIORITY_TAGS.includes(tag) ? 1 : 2,
          sourceTypes, source: record?.source || null,
          ...(record?.conflict ? { conflict: record.conflict } : {}),
          ...(gate ? { gate, gateNote: record.formGate?.note || record.limitation } : {}),
          ...(carried ? { basis: carried.basis } : {})
        });
      }
    }
  }
  const count = rows => Object.fromEntries(STATUSES.map(s => [s, rows.filter(g => g.status === s).length]));
  const byPool = Object.fromEntries(POOL_IDS.map(p => [p, count(grants.filter(g => g.pool === p))]));
  const byTag = Object.fromEntries(POWER_TAGS.map(t => [t, count(grants.filter(g => g.tag === t))]));
  const hosts = {};
  for (const rs of Object.values(CHARACTER_ABILITIES)) for (const r of rs) {
    for (const u of characterAbilityFeatUrls(r)) {
      const h = new URL(u).hostname.replace(/^www\./, '');
      const key = characterAbilitySourceTier(u) + '\t' + (/(^|\.)fandom\.com$/.test(h) ? '*.fandom.com' : h);
      hosts[key] = (hosts[key] || 0) + 1;
    }
  }
  // Grants whose record cites community sites only. The first audit called these all "provisional"; the
  // revised standard rates each on its own detail, so this shows where they actually landed.
  const communityOnly = count(grants.filter(g => g.sourceTypes.length && g.sourceTypes.every(t => t === 'community')));
  return { audited: '2026-11-10', standard: 'accuracy-first (owner, 2026-11-10)', grants: grants.length,
    totals: count(grants), byPool, byTag, communityOnly, hosts, rows: grants };
}

function markdown(a) {
  const L = [];
  const pct = (n, d) => d ? Math.round(100 * n / d) + '%' : '-';
  const sum = c => STATUSES.reduce((t, s) => t + c[s], 0);
  const standing = c => c['owner-ruling'] + c.corroborated + c.credible;
  L.push('# Character ability evidence audit (2026-11-10)', '',
    'Generated by `node tools/ability-source-audit.cjs --write`. Do not edit by hand.', '',
    'This covers every power grant in `CHARACTER_ABILITY_TAGS`, for every character in all ten pools. It asks whether the record behind each grant supports it accurately. **It changes no eligibility:** every status below is still granted. Machine-readable rows: `' + JSON_FILE + '`.', '');
  L.push('## Evidence standard', '',
    'Owner ruling, 2026-11-10: the goal is an accurate character knowledge database, not a source hierarchy. For comics and fantasy universes, dedicated community databases are often the most complete record of decades of storylines, alternate continuities and obscure feats. **Community-sourced does not mean unreliable.**', '',
    '| Evidence | Treatment | Status |', '| --- | --- | --- |',
    '| Specific, well-documented community lore | Credible evidence | `credible` |',
    '| Official source with clear supporting feats | Credible evidence | `credible` |',
    '| Multiple independent sources agreeing | Strong corroboration | `corroborated` |',
    '| Community or official entry without supporting details | Needs review | `needs-review` |',
    '| Contradictory accounts or mixed continuities | Requires investigation | `investigate` |',
    '| Equipment-dependent or transformed abilities | Evaluate eligibility conditions | listed under *Eligibility conditions* below, whatever the status |',
    '| Settled by the owner | Final | `owner-ruling` |',
    '| Reviewed pre-audit carry-over with no link yet | Add a source | `unsourced` |', '',
    'How a record is rated (`characterAbilityVerification`):', '',
    '- **Specific** means the record names a scene, cites dialogue or a second source, points at an instance (a work, year, chapter, issue, episode or quoted title), or describes the feat in at least eight words. A bare one-liner such as "Levitates and flies." is not specific, whoever published it.',
    '- **Independent** means a different site. Two pages on one site count once; separate Fandom wikis count separately. `officialSource` confirms identity only and does not count toward a feat.',
    '- A recorded `conflict` (contradictory accounts, mixed continuities) always surfaces as `investigate` unless the owner has ruled.',
    '- Source type (official, game-data, dialogue, editorial, community) is reported for information only. It never lowers a rating.', '');
  L.push('## Totals', '', '| Status | Grants | Share |', '| --- | ---: | ---: |');
  for (const s of STATUSES) L.push('| ' + s + ' | ' + a.totals[s] + ' | ' + pct(a.totals[s], a.grants) + ' |');
  L.push('| **all** | **' + a.grants + '** | |', '');
  const co = a.communityOnly, coN = sum(co);
  L.push('### Grants that cite community sources only (' + coN + ')', '',
    'The first version of this audit labelled every one of these "provisional" because of where its source was published. Rated on their own detail instead:', '',
    '| Status | Grants |', '| --- | ---: |');
  for (const s of STATUSES) if (co[s]) L.push('| ' + s + ' | ' + co[s] + ' |');
  L.push('', 'The "provisional" label is retired. It never meant a grant was doubtful.', '');
  L.push('## By pool', '', '| Pool | ' + STATUSES.join(' | ') + ' | Total | Standing as is |', '| --- |' + ' ---: |'.repeat(STATUSES.length + 2));
  for (const [p, c] of Object.entries(a.byPool)) {
    const t = sum(c); if (!t) continue;
    L.push('| ' + POOL_NAMES[p] + ' | ' + STATUSES.map(s => c[s]).join(' | ') + ' | ' + t + ' | ' + pct(standing(c), t) + ' |');
  }
  L.push('', '"Standing as is" counts owner rulings, corroborated and credible grants. NBA players hold no powers, so the NBA row is omitted.', '');
  L.push('## By power', '', '| Power | ' + STATUSES.join(' | ') + ' | Total |', '| --- |' + ' ---: |'.repeat(STATUSES.length + 1));
  for (const [t, c] of Object.entries(a.byTag)) L.push('| ' + t + ' | ' + STATUSES.map(s => c[s]).join(' | ') + ' | ' + sum(c) + ' |');
  L.push('');
  L.push('## Source hosts by type', '', 'For information only: type never lowers a rating. Every host is classified in `CHARACTER_ABILITY_SOURCE_TIERS`, so a test catches a typo\'d or unknown host.', '',
    '| Type | Host | Citations |', '| --- | --- | ---: |');
  for (const [k, n] of Object.entries(a.hosts).sort((x, y) => x[0].split('\t')[0].localeCompare(y[0].split('\t')[0]) || y[1] - x[1])) {
    const [tier, host] = k.split('\t'); L.push('| ' + tier + ' | ' + host + ' | ' + n + ' |');
  }
  L.push('');
  const conflicts = a.rows.filter(r => r.status === 'investigate');
  L.push('## Requires investigation (' + conflicts.length + ')', '',
    'Records with a `conflict` note: contradictory accounts or mixed continuities. ' + (conflicts.length ? '' : 'None recorded yet. Add `conflict: "<what disagrees>"` to a record when sources or continuities disagree on a feat.'), '');
  for (const r of conflicts) L.push('- ' + r.id + ': ' + r.tag + '. ' + r.conflict);
  if (conflicts.length) L.push('');
  const gated = a.rows.filter(r => r.gate);
  L.push('## Eligibility conditions: form, power-up and item dependencies (' + gated.length + ')', '',
    'Campaign counts every indexed tag for the base character. These grants depend on a form, power-up or item, so the question is the eligibility condition, not the evidence. `candidate` means the record\'s `limitation` text suggests a dependency and nobody has typed it yet. One owner ruling on forms and items (see `docs/disney-additions.md`) should apply to all of them, not only the Disney ones.', '',
    '| Character | Power | Gate | Note |', '| --- | --- | --- | --- |');
  for (const r of gated) L.push('| ' + r.id + ' | ' + r.tag + ' | ' + r.gate + ' | ' + String(r.gateNote).replace(/\|/g, '/') + ' |');
  L.push('');
  L.push('## Worklist: grants to check', '',
    'Only grants with a real question: `investigate` first, then `needs-review` (no supporting detail, or an unconfirmed scene), then `unsourced` carry-overs that need a link. Priority 1 covers the powers whose challenges turn on a threshold or an owner ruling: ' + PRIORITY_TAGS.join(', ') + '. Priority 2 is everything else.', '');
  for (const pr of [1, 2]) {
    const rows = a.rows.filter(r => r.priority === pr && REVIEW.includes(r.status));
    L.push('### Priority ' + pr + ' (' + rows.length + ')', '');
    for (const p of POOL_IDS) {
      const pr_rows = rows.filter(r => r.pool === p).sort((x, y) => REVIEW.indexOf(x.status) - REVIEW.indexOf(y.status) || x.character.localeCompare(y.character));
      if (!pr_rows.length) continue;
      L.push('<details><summary>' + POOL_NAMES[p] + ' (' + pr_rows.length + ')</summary>', '');
      for (const r of pr_rows) L.push('- ' + r.character + ': ' + r.tag + ' (' + r.status + ')');
      L.push('', '</details>', '');
    }
  }
  return L.join('\n') + '\n';
}

function outputs() {
  const a = sourceAudit();
  return { [DOC]: markdown(a), [JSON_FILE]: JSON.stringify(a, null, 1) + '\n' };
}

if (require.main === module) {
  const files = outputs();
  if (process.argv.includes('--write')) for (const [f, body] of Object.entries(files)) fs.writeFileSync(path.join(ROOT, f), body);
  else if (process.argv.includes('--check')) {
    const stale = Object.entries(files).filter(([f, body]) => !fs.existsSync(path.join(ROOT, f)) || fs.readFileSync(path.join(ROOT, f), 'utf8') !== body);
    if (stale.length) { console.error('Out of date: ' + stale.map(s => s[0]).join(', ') + '. Run --write.'); process.exit(1); }
    console.log('Source audit is up to date.');
  } else console.log('Usage: --write or --check');
}
module.exports = { sourceAudit, outputs, PRIORITY_TAGS, STATUSES, REVIEW };

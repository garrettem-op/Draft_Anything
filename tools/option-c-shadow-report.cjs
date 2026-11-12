#!/usr/bin/env node
/* Option C shadow evaluator — comparison and coverage report.
 *
 *   node tools/option-c-shadow-report.cjs            print a summary
 *   node tools/option-c-shadow-report.cjs --write    also write docs/option-c/SHADOW_COMPARISON_REPORT.md
 *   node tools/option-c-shadow-report.cjs --golden <checkout>
 *        regenerate tests/fixtures/option-c-v1-golden.json from a checkout
 *        that does NOT contain the Option C change (the Version 1 baseline).
 *
 * The report runs the REAL Version 1 engine on private seeded RNGs and sets
 * its win frequency beside Option C's shadow estimate. It is a diagnostic:
 * nothing here is read by the game.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { loadApp, root } = require('../tests/helpers/option-c-app-harness.cjs');
const { runBenchmarks } = require('../tests/helpers/option-c-benchmark-runner.cjs');
const { runParityFixtures } = require('../tests/helpers/option-c-parity-fixtures.cjs');

const args = process.argv.slice(2);
if (args[0] === '--golden') {
  const dir = path.resolve(args[1] || '');
  if (fs.existsSync(path.join(dir, 'data/option-c/evaluator.js'))) throw new Error('--golden needs a checkout WITHOUT the Option C evaluator');
  const { digests } = runParityFixtures(loadApp({ root: dir }), false);
  const file = path.join(root, 'tests/fixtures/option-c-v1-golden.json');
  const prev = JSON.parse(fs.readFileSync(file, 'utf8'));
  fs.writeFileSync(file, JSON.stringify({ ...prev, digests }, null, 2) + '\n');
  console.log('Wrote', Object.keys(digests).length, 'digests from', dir);
  process.exit(0);
}

const SEEDS = 300;
const SCENARIOS = `[
  { id: 'screenshot-lineup', sport: 'brawl', names: ['The Chungus', 'The Crossover'], example: true,
    a: { tk1: ['mcu', 'Abomination'], tk2: ['mcu', 'Adam Warlock'], d1: ['dc', 'Batman', 'Hellbat Armor Batman'], d2: ['dc', 'Joker'], d3: ['dc', 'Lucifer Morningstar'], bn: ['mcu', 'Captain Carter'], cmd: ['mcu', 'Captain America'] },
    b: { tk1: ['dc', 'Ares (DC)'], tk2: ['mcu', 'The Watcher'], d1: ['dc', 'Death of the Endless'], d2: ['mcu', 'Scarlet Witch'], d3: ['dc', 'Darkseid'], bn: ['dc', 'Wonder Woman'], cmd: ['dc', 'Trigon'] } },
  { id: 'batman-vs-hellbat', sport: 'brawl', names: ['Batman crew', 'Hellbat crew'], fill: 'actionmovies', example: true, a: { d1: ['dc', 'Batman'] }, b: { d1: ['dc', 'Batman', 'Hellbat Armor Batman'] } },
  { id: 'thanos-vs-king-thanos', sport: 'brawl', names: ['Thanos crew', 'King Thanos crew'], fill: 'actionmovies', a: { d1: ['mcu', 'Thanos'] }, b: { d1: ['mcu', 'Thanos', 'King Thanos'] } },
  { id: 'franklin-vs-abomination', sport: 'brawl', names: ['Franklin Richards crew', 'Abomination crew'], fill: 'actionmovies', a: { d1: ['mcu', 'Franklin Richards'] }, b: { d1: ['mcu', 'Abomination'] } },
  { id: 'darkseid-vs-spectre', sport: 'brawl', names: ['Darkseid crew', 'Spectre crew'], fill: 'actionmovies', a: { d1: ['dc', 'Darkseid'] }, b: { d1: ['dc', 'The Spectre'] } },
  { id: 'black-adam-vs-silver-surfer', sport: 'brawl', names: ['Black Adam crew', 'Silver Surfer crew'], fill: 'actionmovies', example: true, a: { d1: ['dc', 'Black Adam'] }, b: { d1: ['mcu', 'Silver Surfer'] } },
  { id: 'toons-vs-avengers', sport: 'brawl', names: ['Looney crew', 'Avengers'], a: { tk1: ['toons', 'Tasmanian Devil'], tk2: ['toons', 'Popeye'], d1: ['toons', 'Bugs Bunny'], d2: ['toons', 'Daffy Duck'], d3: ['toons', 'Road Runner'], bn: ['toons', 'Porky Pig'], cmd: ['toons', 'Mickey Mouse'] }, bFill: 'mcu', b: {} },
  { id: 'muppets-vs-justice-league', sport: 'brawl', names: ['Muppets', 'DC roster'], aFill: 'muppets', a: {}, bFill: 'dc', b: {} },
  { id: 'superman-kermit-basketball', sport: 'basketball', names: ['Superman + Kermit + NBA', 'NBA legends'], example: true, aFill: 'nba', a: { c: ['dc', 'Superman'], pg: ['muppets', 'Kermit the Frog'], bn: ['dc', 'Robin (Damian Wayne)'], hc: ['dc', 'Batman'] }, bFill: 'nba', b: {} },
  { id: 'spider-man-libero', sport: 'volleyball', names: ['Spider-Man libero + NBA', 'Star Wars'], example: true, aFill: 'nba', a: { lib: ['mcu', 'Spider-Man'] }, bFill: 'starwars', b: {} },
  { id: 'strange-quarterback', sport: 'football', names: ['Doctor Strange QB + NBA', 'Middle-earth'], aFill: 'nba', a: { qb: ['mcu', 'Doctor Strange'] }, bFill: 'lotr', b: {} },
  { id: 'muppets-vs-nba-basketball', sport: 'basketball', names: ['Muppets', 'NBA legends'], aFill: 'muppets', a: {}, bFill: 'nba', b: {} },
  { id: 'toons-vs-games-soccer', sport: 'soccer', names: ['Cartoons', 'Video Games'], aFill: 'toons', a: {}, bFill: 'games', b: {} },
  { id: 'wizards-vs-pokemon-hockey', sport: 'hockey', names: ['Wizarding World', 'Pokemon'], aFill: 'harrypotter', a: {}, bFill: 'pokemon', b: {} },
  { id: 'dc-vs-mcu-baseball', sport: 'baseball', names: ['DC', 'Marvel'], aFill: 'dc', a: {}, bFill: 'mcu', b: {} },
]`;

const app = loadApp();
const compared = JSON.parse(app.run(`JSON.stringify(${SCENARIOS}.map(s => {
  const A = ocTeam(s.sport, s.a, s.aFill || s.fill), B = ocTeam(s.sport, s.b, s.bFill || s.fill);
  const sigma = s.sport === 'brawl' ? 0 : 2.5;
  const c = DA_OPTION_C.shadow.compare(s.sport, A, B, { seeds: ${SEEDS}, sigma, teamNames: s.names, label: s.id });
  return { id: s.id, sport: s.sport, names: s.names, example: !!s.example, seeds: c.seeds, sigma, legacy: c.legacyWinRateA, p: c.optionCProbabilityA, range: c.optionCRangeA,
    sameFavorite: c.sameFavorite, withinRange: c.withinRange, status: c.status, basis: c.basis, coverage: c.assessment.evidence.typedCoverage,
    ratings: [A.rating, B.rating], assessment: c.assessment };
}))`));
const coverage = JSON.parse(app.run(`JSON.stringify((() => {
  const rows = [];
  for (const pool of Object.keys(POOLS)) {
    if (isMashupId(pool)) continue;
    const r = { pool, total: 0, reviewed: 0, provisional: 0, unknown: 0, forms: 0, formsReviewed: 0, continuityOpen: 0 };
    for (const c of getCands(pool)) {
      const p = DA_OPTION_C.getProfile(c);
      r.total++; r[p.evidence.combat]++;
      if (p.continuity.status === 'needs-review') r.continuityOpen++;
      for (const f of variantOptions(c)) { r.forms++; if (DA_VARIANT_ABILITY_PROFILES[c.pool + ':' + c.n + '|' + f.name]) r.formsReviewed++; }
    }
    rows.push(r);
  }
  return rows;
})())`));
const benchmarks = runBenchmarks(app);
const golden = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/option-c-v1-golden.json'), 'utf8'));
const off = runParityFixtures(loadApp(), false), on = runParityFixtures(loadApp(), true);
const parity = Object.keys(golden.digests).map(id => ({ id, off: off.digests[id] === golden.digests[id], on: on.digests[id] === golden.digests[id] }));

const pct = x => Math.round(x * 100) + '%';
const sum = (rows, k) => rows.reduce((s, r) => s + r[k], 0);
function renderAssessment(c) {
  const a = c.assessment, out = [];
  out.push('### ' + c.names[0] + ' vs ' + c.names[1] + ' (' + c.sport + ')', '');
  out.push('**' + a.headline + '**', '');
  out.push('Estimate range for ' + c.names[0] + ': ' + pct(a.sides[0].probabilityRange[0]) + '–' + pct(a.sides[0].probabilityRange[1]) + '. Version 1 engine over ' + c.seeds + ' private seeds: ' + c.names[0] + ' won ' + pct(c.legacy) + '.', '');
  for (const s of a.sides) {
    out.push('**' + s.name + '** (Version 1 rating ' + s.rating.toFixed(2) + ')', '');
    out.push('What each starter can do:');
    for (const row of s.lineup.filter(r => r.role === 'starter').slice(0, 7)) out.push('- ' + row.displayName + ' [' + row.position + ', evidence: ' + row.combatEvidence + ']: ' + row.summary);
    if (s.lineup.filter(r => r.role === 'starter').length > 7) out.push('- …and ' + (s.lineup.filter(r => r.role === 'starter').length - 7) + ' more starters.');
    out.push('', 'Paths to victory:');
    for (const w of s.winConditions) out.push('- ' + w.text + (w.counteredBy ? ' ' + w.counteredBy : '') + (w.threatenedBy ? ' ' + w.threatenedBy : '') + (w.limitation ? ' Limit: ' + w.limitation : ''));
    if (s.risks.length) { out.push('', 'What could stop them:'); for (const r of s.risks) out.push('- ' + r.text); }
    if (s.constraints.length) { out.push('', 'Rules that still bind:'); for (const r of s.constraints) out.push('- ' + r.text); }
    out.push('');
  }
  out.push('Uncertainties that could change this:');
  for (const u of a.uncertainties) out.push('- (' + u.impact + ') ' + u.text);
  out.push('');
  return out.join('\n');
}

const pass = benchmarks.filter(b => b.outcome === 'pass').length, review = benchmarks.filter(b => b.outcome === 'needs-review').length, fail = benchmarks.filter(b => b.outcome === 'fail').length;
const disagree = compared.filter(c => !c.sameFavorite), outside = compared.filter(c => !c.withinRange);
const md = [];
md.push('# Option C shadow evaluator — comparison and coverage report', '');
md.push('Generated by `node tools/option-c-shadow-report.cjs --write` against the real Version 1 engine (model `' + compared[0].assessment.modelVersion + '`). Regenerate after any evaluator or data change.', '');
md.push('> Every probability below is an **editorial estimate from an uncalibrated first-pass model**. Version 1 win rates are seeded simulation frequencies of the current game, not canon. Disagreements are findings to review, not errors to tune away.', '');
md.push('## 1. Benchmark scenarios (' + benchmarks.length + ')', '');
md.push('**' + pass + ' pass · ' + review + ' need review (correctly left unresolved) · ' + fail + ' fail.**', '');
md.push('| Case | Mode | Registry state | Outcome | What still needs a decision |', '| --- | --- | --- | --- | --- |');
for (const b of benchmarks) md.push('| `' + b.id + '` | ' + b.mode + ' | ' + b.registryState + ' | **' + b.outcome + '**' + (b.failed.length ? ' (' + b.failed.join(', ') + ')' : '') + ' | ' + (b.uncertainty || '—') + ' |');
md.push('', '`needs-review` means the evaluator ran the structural guards and **reported the case as unresolved**; it becomes `pass` only after an owner ruling or reviewed research is recorded in `data/option-c/benchmark-scenarios.json`.', '');
md.push('## 2. Option C estimate beside Version 1 outcomes', '');
md.push('Version 1 column: share of ' + SEEDS + ' private seeded games won by the first team (upset setting "low" for sports; Battle Royale uses its own combat randomness). Option C column: shadow estimate for the first team and its uncertainty range.', '');
md.push('| Matchup | Sport | V1 ratings | V1 win rate | Option C | Range | Same favorite | V1 inside range | Status / basis | Typed coverage |', '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const c of compared) md.push('| ' + c.names[0] + ' vs ' + c.names[1] + ' | ' + c.sport + ' | ' + c.ratings.map(r => r.toFixed(1)).join(' / ') + ' | ' + pct(c.legacy) + ' | ' + pct(c.p) + ' | ' + pct(c.range[0]) + '–' + pct(c.range[1]) + ' | ' + (c.sameFavorite ? 'yes' : '**no**') + ' | ' + (c.withinRange ? 'yes' : '**no**') + ' | ' + c.status + ' / ' + (c.basis === 'numeric-baseline-only' ? 'numeric only' : 'numeric + typed') + ' | ' + (c.coverage == null ? 'n/a' : pct(c.coverage)) + ' |');
md.push('', '**Same favorite in ' + (compared.length - disagree.length) + ' of ' + compared.length + '; Version 1 frequency inside the Option C range in ' + (compared.length - outside.length) + ' of ' + compared.length + '.**', '');
if (disagree.length) { md.push('Different favorite:'); for (const c of disagree) md.push('- ' + c.names[0] + ' vs ' + c.names[1] + ': Version 1 ' + pct(c.legacy) + ', Option C ' + pct(c.p) + '.'); md.push(''); }
if (outside.length) { md.push('Version 1 frequency outside the Option C range:'); for (const c of outside) md.push('- ' + c.names[0] + ' vs ' + c.names[1] + ': Version 1 ' + pct(c.legacy) + ', Option C ' + pct(c.p) + ' (' + pct(c.range[0]) + '–' + pct(c.range[1]) + ').'); md.push(''); }
md.push('## 3. Baseline parity (shadow cannot change a result)', '');
md.push('Digests of fixed seeded Version 1 results, compared with those generated from the untouched base commit `' + golden.baseCommit.slice(0, 12) + '`:', '');
md.push('| Fixture | Shadow OFF = baseline | Shadow ON = baseline |', '| --- | --- | --- |');
for (const p of parity) md.push('| `' + p.id + '` | ' + (p.off ? 'identical' : '**DIFFERS**') + ' | ' + (p.on ? 'identical' : '**DIFFERS**') + ' |');
md.push('', 'Shadow ON evaluated ' + on.recorded + '+ games beside the live engine during these fixtures (the recorder keeps the latest ' + on.recorded + '); shadow OFF recorded ' + off.recorded + '.', '');
md.push('## 4. Evidence coverage of the playable roster', '');
md.push('Combat evidence per base character: **reviewed** = a typed, sourced battle profile exists; **provisional** = only ability tags or ToonForce/MuppetForce facets; **unknown** = nothing on record. Forms: alternate forms with a reviewed ability profile.', '');
md.push('| Pool | Characters | Reviewed | Provisional | Unknown | Continuity open | Forms | Forms reviewed |', '| --- | --- | --- | --- | --- | --- | --- | --- |');
for (const r of coverage) md.push('| ' + r.pool + ' | ' + r.total + ' | ' + r.reviewed + ' | ' + r.provisional + ' | ' + r.unknown + ' | ' + r.continuityOpen + ' | ' + r.forms + ' | ' + r.formsReviewed + ' |');
md.push('| **Total** | **' + sum(coverage, 'total') + '** | **' + sum(coverage, 'reviewed') + '** | **' + sum(coverage, 'provisional') + '** | **' + sum(coverage, 'unknown') + '** | **' + sum(coverage, 'continuityOpen') + '** | **' + sum(coverage, 'forms') + '** | **' + sum(coverage, 'formsReviewed') + '** |');
md.push('', 'Typed combat coverage is ' + pct(sum(coverage, 'reviewed') / sum(coverage, 'total')) + ' of base characters and ' + pct(sum(coverage, 'formsReviewed') / sum(coverage, 'forms')) + ' of alternate forms. Issues #82 (research) and #83 (combat atlas) remain open; this PR does not close or advance them.', '');
md.push('## 5. Example assessments', '');
for (const c of compared.filter(x => x.example)) md.push(renderAssessment(c));

const text = md.join('\n').replace(/\n{3,}/g, '\n\n') + '\n';
console.log('Benchmarks: ' + pass + ' pass, ' + review + ' needs-review, ' + fail + ' fail');
console.log('Comparison: same favorite ' + (compared.length - disagree.length) + '/' + compared.length + ', V1 inside range ' + (compared.length - outside.length) + '/' + compared.length);
console.log('Parity: ' + parity.filter(p => p.off && p.on).length + '/' + parity.length + ' fixtures identical with shadow off and on');
console.log('Coverage: ' + sum(coverage, 'reviewed') + '/' + sum(coverage, 'total') + ' characters typed, ' + sum(coverage, 'formsReviewed') + '/' + sum(coverage, 'forms') + ' forms reviewed');
if (args.includes('--write')) {
  fs.writeFileSync(path.join(root, 'docs/option-c/SHADOW_COMPARISON_REPORT.md'), text);
  console.log('Wrote docs/option-c/SHADOW_COMPARISON_REPORT.md');
}
if (fail || parity.some(p => !p.off || !p.on)) process.exitCode = 1;

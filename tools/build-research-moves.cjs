#!/usr/bin/env node
'use strict';
/* Builds data/option-c/research-moves-data.js: one Battle Royale signature move per character
   whose V2 research record documents a non-physical way to fight (owner decision 2026-11-20,
   "research powers join the fight", on by default in V2).

   Rules (each one is checked by tests/research-moves.test.cjs):
   - The power type comes from the record's own offense domains, mapped by the closed table in
     data/option-c/research-profile.js. Physical, tech and toxin are not moves: plain attacks
     already model them from the 12 attributes.
   - Guards and weaknesses come from the same derivation (explicit wording only).
   - The move name is the record's own technique that matches the power type. When a technique
     matches another of the record's power types instead, that type is used, so name and type
     agree. With no match the first technique is used; with no techniques, a plain label
     ("Magic power"). Nothing is invented: no tier, no number, no new claims.
   - Skipped: characters with a V1 combat profile or a reviewed form profile (V1 always wins),
     NBA players, records marked needs-review, and records with no usable power type.
   Usage: node tools/build-research-moves.cjs           write the file
          node tools/build-research-moves.cjs --check   report entries that differ from the
                                                        current research (exit 0; --strict exits 1) */
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'data/option-c/research-moves-data.js');
const pipe = require('./v2-research-pipeline.cjs');
const { deriveFromRecord } = require('../data/option-c/research-profile.js');
const { CORE } = require('../data/brawl-attack-profiles.js');
const { VARIANT_ABILITY_PROFILES } = require('../data/variant-abilities.js');

const EXCLUDED_POOLS = new Set(['nba']);
const USABLE_STATUS = new Set(['reviewed', 'provisional']);
// Technique words that mark a technique as belonging to a power type (for the move name only).
const NAME_HINTS = {
  energy: /\b(energy|blast|beam|bolt|lightning|thunder|electric\w*|laser|plasma|light\w*|fire|flame|ray|shock)/i,
  magic: /\b(magic\w*|spell\w*|sorcer\w*|hex|curse|incant\w*|enchant\w*|the force|force (choke|push|pull|lightning|grip)|ritual|wand|charm|jinx)/i,
  elemental: /\b(fire|flame|water|ice|frost|wind|earth|storm|lightning|lava|sand|weather)/i,
  psychic: /\b(telepath\w*|telekine\w*|psychic|psionic|mind)/i,
  control: /\b(control\w*|trap\w*|disguise|illusion\w*|decept\w*|hypno\w*|bind\w*|stun\w*)/i,
  cosmic: /\b(cosmic|star\w*|galax\w*|power cosmic)/i,
  reality: /\b(reality|rewrite|warp\w*)/i,
  time: /\b(time|chrono\w*|temporal)/i,
  sonic: /\b(sonic|sound|scream|cry|voice|song)/i,
  shadow: /\b(shadow\w*|dark\w*)/i,
};
const MAX = 42;
const TRAILING = /\s+(and|or|of|on|to|the|a|an|in|into|with|at|by|for|from|against|used|who|which|that|its|his|her|their|as|such|all)$/i;
const firstClause = (t) => String(t).split(/;|:| \(| — | - |, (?=[a-z])/)[0].trim().replace(/[.,]+$/, '');
const shortName = (t) => {
  let s = firstClause(t), cut = false;
  if (s.length > MAX) { s = s.slice(0, MAX).replace(/\s+\S*$/, '').trim(); cut = true; }
  while (TRAILING.test(s)) { s = s.replace(TRAILING, '').trim(); cut = true; }
  s = s.charAt(0).toUpperCase() + s.slice(1);
  return cut ? s + '…' : s;
};
const LABEL = { energy: 'Energy', magic: 'Magic', elemental: 'Elemental', psychic: 'Psychic', control: 'Control', cosmic: 'Cosmic', reality: 'Reality', time: 'Time', sonic: 'Sonic', shadow: 'Shadow' };
/* Pick the move: the primary type's matching technique, else another type's matching technique
   (that type then becomes the move's type), else the first technique under the primary type. */
function pickMove(derived, techniques) {
  const list = techniques.filter((t) => typeof t === 'string' && t.trim() && !/^\s*not established/i.test(t));
  for (const domain of derived.domains) {
    const hint = NAME_HINTS[domain], matches = hint ? list.filter((x) => hint.test(x)) : [];
    // Prefer a technique short enough to name in full.
    const t = matches.find((x) => firstClause(x).length <= MAX) || matches[0];
    if (t) return { domain, name: shortName(t) };
  }
  const domain = derived.primaryDomain;
  return { domain, name: list.length ? shortName(list[0]) : (LABEL[domain] || 'Signature') + ' power' };
}
const moveName = (derived, techniques = derived.techniques) => pickMove(derived, techniques).name;

function build() {
  const ids = new Set(pipe.rosterIds());
  const rows = [], skipped = { v1Profile: 0, nba: 0, needsReview: 0, physicalOnly: 0 };
  for (const { batch } of pipe.loadBatches()) for (const r of batch.characters || []) {
    if (!ids.has(r.id)) continue;
    if (EXCLUDED_POOLS.has(r.id.split(':')[0])) { skipped.nba++; continue; }
    if (CORE[r.id] || VARIANT_ABILITY_PROFILES[r.id]) { skipped.v1Profile++; continue; }
    if (!USABLE_STATUS.has(r.researchStatus)) { skipped.needsReview++; continue; }
    const d = deriveFromRecord(r);
    if (!d || !d.primaryDomain) { skipped.physicalOnly++; continue; }
    const move = pickMove(d, (r.offense && r.offense.techniques) || []);
    const continuity = String(r.continuity || '').replace(/\s+/g, ' ').trim().slice(0, 110);
    rows.push([r.id, move.name, move.domain, d.guards, d.weakTo, d.source || '', continuity]);
  }
  rows.sort((a, b) => a[0].localeCompare(b[0]));
  return { rows, skipped };
}

function render({ rows }) {
  return [
    '/* GENERATED by tools/build-research-moves.cjs from research/option-c/batches. Do not edit by hand:',
    '   re-run the tool after research merges. One row per character:',
    '   [identity, move name (from the record\'s own techniques), power type, guards, weaknesses, source, continuity]. */',
    '(function (root) {',
    "  'use strict';",
    '  const ROWS = [',
    ...rows.map((r) => '    ' + JSON.stringify(r) + ','),
    '  ];',
    "  const api = { version: 'research-moves-v1', rows: ROWS };",
    '  if (root) root.DA_RESEARCH_MOVES_DATA = api;',
    "  if (typeof module !== 'undefined' && module.exports) module.exports = api;",
    "})(typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : null);",
    '',
  ].join('\n');
}

if (require.main === module) {
  const built = build();
  if (process.argv.includes('--check')) {
    const current = fs.existsSync(OUT) ? require(OUT).rows : [];
    const key = (r) => JSON.stringify(r);
    const have = new Set(current.map(key)), want = new Set(built.rows.map(key));
    const added = built.rows.filter((r) => !have.has(key(r))).length, removed = current.filter((r) => !want.has(key(r))).length;
    console.log((added || removed ? 'Stale: ' : 'Up to date: ') + added + ' row(s) to add or change, ' + removed + ' to remove or change. Re-run without --check to refresh.');
    if ((added || removed) && process.argv.includes('--strict')) process.exitCode = 1;
  } else {
    fs.writeFileSync(OUT, render(built));
    const byDomain = {};
    for (const r of built.rows) byDomain[r[2]] = (byDomain[r[2]] || 0) + 1;
    console.log('Wrote ' + path.relative(ROOT, OUT) + ': ' + built.rows.length + ' moves ' + JSON.stringify(byDomain) + '; skipped ' + JSON.stringify(built.skipped));
  }
}
module.exports = { build, render, pickMove, moveName, shortName, NAME_HINTS };

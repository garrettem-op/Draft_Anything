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
// "fire" never matches inside "firearm": a gun skill is not an energy or elemental power.
const NAME_HINTS = {
  energy: /\b(energy|blast|beam|bolt|lightning|thunder|electric\w*|laser|plasma|light\w*|fire(?!arm)|flame|ray|shock)/i,
  magic: /\b(magic\w*|spell\w*|sorcer\w*|hex|curse|incant\w*|enchant\w*|the force|force (choke|push|pull|lightning|grip)|ritual|wand|charm|jinx)/i,
  elemental: /\b(fire(?!arm)|flame|water|ice|frost|wind|earth|storm|lightning|lava|sand|weather)/i,
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

/* Combat extras (2026-11-27): for EVERY usable record, V1-profiled and physical-only characters
   included, the record's own guards, weaknesses, power barrier and fighting proficiency
   (data/option-c/research-profile.js, explicit wording only). One row per identity that has any:
   [identity, guards, weaknesses, [shield kind, wording] | null, [proficiency level, technique] | null, source]. */
const clip = (t) => { const x = String(t).replace(/\s+/g, ' ').trim(); return x.length > 70 ? x.slice(0, 69).replace(/\s+\S*$/, '') + '…' : x; };
function buildCombat() {
  const ids = new Set(pipe.rosterIds());
  const byId = new Map();
  /* Reviewed proficiency (2026-11-27): the level word is otherwise read from the technique wording, which
     leaves Gimli "trained" beside Legolas "master". A review may set the level, citing one of the record's
     own techniques, exactly as a reviewed tier cites a feat. */
  const reviewed = (loadTiers().proficiency) || {};
  for (const { batch } of pipe.loadBatches()) for (const r of batch.characters || []) {
    if (!ids.has(r.id) || EXCLUDED_POOLS.has(r.id.split(':')[0]) || !USABLE_STATUS.has(r.researchStatus)) continue;
    const d = deriveFromRecord(r);
    if (!d) continue;
    let prof = d.proficiency ? [d.proficiency.level, clip(d.proficiency.technique)] : null;
    const rp = reviewed[r.id];
    if (rp) {
      if (!['trained', 'expert', 'master'].includes(rp.level)) throw new Error(r.id + ': reviewed proficiency level must be trained, expert or master');
      if (!((r.offense && r.offense.techniques) || []).includes(rp.technique)) throw new Error(r.id + ': reviewed proficiency must cite a technique in the record: ' + rp.technique);
      prof = [rp.level, clip(rp.technique), 1];
    }
    if (!(d.guards.length || d.weakTo.length || d.shield || prof || d.armor)) continue;
    byId.set(r.id, [r.id, d.guards, d.weakTo, d.shield ? [d.shield.kind, clip(d.shield.mechanism)] : null,
      prof, d.source || '', d.armor ? [d.armor.grade, clip(d.armor.mechanism)] : null]);
  }
  for (const id of Object.keys(reviewed)) if (!byId.has(id)) throw new Error(id + ': reviewed proficiency for an identity with no usable record');
  return [...byId.values()].sort((a, b) => a[0].localeCompare(b[0]));
}

/* Reviewed power tiers (research/option-c/power-tiers.json, docs/option-c/POWER_TIERS.md). The overlay
   says how strong a research move is (tier 1-4; unlisted = the standard tier 2), may pick another of the
   record's own power types, and lists records whose "technique" is not an arena attack (no move).
   Every listed tier is tied to the record's own words: the feat it names (default: the first feat) or
   a technique. A tier with nothing in the record to cite is refused. */
const TIERS_FILE = path.join(ROOT, 'research/option-c/power-tiers.json');
const loadTiers = () => (fs.existsSync(TIERS_FILE) ? JSON.parse(fs.readFileSync(TIERS_FILE, 'utf8')) : { reviewedPools: [], tiers: {}, noMove: {} });
function tierBasis(r, t) {
  const feats = Array.isArray(r.feats) ? r.feats : [], techniques = (r.offense && r.offense.techniques) || [];
  if (t.technique) {
    if (!techniques.includes(t.technique)) throw new Error(r.id + ': cited technique is not in the record: ' + t.technique);
    return 'Technique on record: ' + t.technique;
  }
  const f = feats[Number.isInteger(t.feat) ? t.feat : 0];
  if (!f || !f.claim) throw new Error(r.id + ': tier ' + t.tier + ' has no feat in the record to cite');
  return clip2(String(f.claim).replace(/\s+/g, ' ').trim() + (f.citation ? ' (' + f.citation + ')' : ''));
}
const clip2 = (x) => (x.length > 180 ? x.slice(0, 179).replace(/\s+\S*$/, '') + '…' : x);

function build() {
  const ids = new Set(pipe.rosterIds());
  const overlay = loadTiers();
  const rows = [], skipped = { v1Profile: 0, nba: 0, needsReview: 0, physicalOnly: 0, noMove: 0 }, used = new Set();
  for (const { batch } of pipe.loadBatches()) for (const r of batch.characters || []) {
    if (!ids.has(r.id)) continue;
    if (EXCLUDED_POOLS.has(r.id.split(':')[0])) { skipped.nba++; continue; }
    if (CORE[r.id] || VARIANT_ABILITY_PROFILES[r.id]) { skipped.v1Profile++; continue; }
    if (!USABLE_STATUS.has(r.researchStatus)) { skipped.needsReview++; continue; }
    const d = deriveFromRecord(r);
    /* A reviewed MELEE signature (2026-11-27): a physical powerhouse whose record lists physical offense
       can be given a melee signature move by review, named after one of its own techniques and tied to a
       feat like any other tier. Version 1 does the same by hand for Superman, Doomsday and Abomination. */
    const tm = overlay.tiers && overlay.tiers[r.id];
    if (d && tm && tm.domain === 'melee') {
      const tokens = ((r.offense && r.offense.domains) || []).map((x) => String(x).toLowerCase());
      if (!tokens.includes('physical') && !tokens.includes('melee')) throw new Error(r.id + ': a melee signature needs physical offense in the record');
      if (!tm.move || !((r.offense && r.offense.techniques) || []).includes(tm.move)) throw new Error(r.id + ': a melee signature must name a technique in the record');
      if (!(Number.isInteger(tm.tier) && tm.tier >= 1 && tm.tier <= 4)) throw new Error(r.id + ': reviewed tier must be 1-4');
      const continuity = String(r.continuity || '').replace(/\s+/g, ' ').trim().slice(0, 110);
      rows.push([r.id, shortName(tm.move), 'melee', d.guards, d.weakTo, d.source || '', continuity, tm.tier, tierBasis(r, tm)]);
      used.add(r.id); continue;
    }
    if (!d || !d.primaryDomain) { skipped.physicalOnly++; continue; }
    if (overlay.noMove && overlay.noMove[r.id]) { skipped.noMove++; used.add(r.id); continue; }
    const t = overlay.tiers && overlay.tiers[r.id];
    let move = pickMove(d, (r.offense && r.offense.techniques) || []);
    if (t && t.domain) {
      if (!d.domains.includes(t.domain)) throw new Error(r.id + ': reviewed power type ' + t.domain + ' is not in the record (' + d.domains.join(', ') + ')');
      move = pickMove({ domains: [t.domain], primaryDomain: t.domain }, (r.offense && r.offense.techniques) || []);
    }
    if (t && t.move) {
      // The review may name the move after another of the record's own techniques (never an invented one).
      if (!((r.offense && r.offense.techniques) || []).includes(t.move)) throw new Error(r.id + ': reviewed move is not a technique in the record: ' + t.move);
      move = { domain: move.domain, name: shortName(t.move) };
    }
    if (t && !(Number.isInteger(t.tier) && t.tier >= 1 && t.tier <= 4)) throw new Error(r.id + ': reviewed tier must be 1-4 (tier 5 is for individual profiles only)');
    const continuity = String(r.continuity || '').replace(/\s+/g, ' ').trim().slice(0, 110);
    const row = [r.id, move.name, move.domain, d.guards, d.weakTo, d.source || '', continuity];
    if (t) { row.push(t.tier, tierBasis(r, t)); used.add(r.id); }
    /* A power that takes the opponent out of the fight rather than wounding (mind control, enchanted sleep,
       petrification, a killing gaze). Reviewed only: tier 3+, a mind or magic power type, and a label. */
    if (t && t.overcome) {
      if (!(t.tier >= 3) || !['psychic', 'control', 'magic'].includes(move.domain) || String(t.overcome).length < 8) throw new Error(r.id + ': overcome needs tier 3+, a psychic, control or magic move and a label');
      row.push(String(t.overcome));
    }
    rows.push(row);
  }
  for (const id of [...Object.keys(overlay.tiers || {}), ...Object.keys(overlay.noMove || {})]) {
    if (!used.has(id)) throw new Error('power-tiers.json lists ' + id + ', which has no research move to tier (unknown identity, V1-profiled or physical-only)');
  }
  rows.sort((a, b) => a[0].localeCompare(b[0]));
  return { rows, skipped, combat: buildCombat(), counters: buildCounters(), reviewedPools: (overlay.reviewedPools || []).slice() };
}

/* Named counters (research/option-c/counters.json, 2026-11-27). A counter is a specific thing that drives off
   a specific creature. Nothing is hand-assigned: the target's own record must name the counter among its
   weaknesses, and a holder is any identity in the listed pools whose own record names it too.
   Row: [name, chance per use, [target identities], [[holder identity, wording from its record], ...]]. */
const COUNTERS_FILE = path.join(ROOT, 'research/option-c/counters.json');
function buildCounters() {
  if (!fs.existsSync(COUNTERS_FILE)) return [];
  const spec = JSON.parse(fs.readFileSync(COUNTERS_FILE, 'utf8')), ids = new Set(pipe.rosterIds()), recs = new Map();
  for (const { batch } of pipe.loadBatches()) for (const r of batch.characters || []) if (ids.has(r.id) && USABLE_STATUS.has(r.researchStatus)) recs.set(r.id, r);
  const out = [];
  for (const c of spec.counters || []) {
    const re = new RegExp(String(c.term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (!(c.chance > 0 && c.chance <= 0.75)) throw new Error(c.name + ': chance must be in (0, 0.75]');
    for (const t of c.targets) {
      const r = recs.get(t);
      if (!r || !(r.weaknesses || []).some((w) => re.test(String(w)))) throw new Error(c.name + ': ' + t + ' does not name it among its weaknesses');
    }
    const holders = [];
    for (const [id, r] of recs) {
      if (!c.pools.includes(id.split(':')[0]) || c.targets.includes(id)) continue;
      const texts = [...((r.offense && r.offense.techniques) || []), ...((r.defense && r.defense.mechanisms) || []), ...((r.feats || []).map((f) => f.claim))].map(String);
      const hit = texts.find((x) => re.test(x));
      if (hit) {
        // Keep the wording around the counter's name, so the basis shown always names it.
        const flat = hit.replace(/\s+/g, ' ').trim(), at = flat.search(re);
        const start = Math.max(0, at - 30), piece = start > 0 ? flat.slice(start, start + 68).replace(/^\S*\s/, '') : flat.slice(0, 68);
        holders.push([id, flat.length <= 70 ? flat : (start > 0 ? '…' : '') + piece.trim() + (start + 68 < flat.length ? '…' : '')]);
      }
    }
    if (!holders.length) throw new Error(c.name + ': no holder names it in its own record');
    out.push([c.name, c.chance, c.targets.slice(), holders.sort((a, b) => a[0].localeCompare(b[0]))]);
  }
  return out;
}

function render({ rows, combat = [], counters = [], reviewedPools = [] }) {
  return [
    '/* GENERATED by tools/build-research-moves.cjs from research/option-c/batches. Do not edit by hand:',
    '   re-run the tool after research merges. One row per character:',
    '   [identity, move name (from the record\'s own techniques), power type, guards, weaknesses, source, continuity,',
    '    reviewed tier, basis from the record] (the last two only where research/option-c/power-tiers.json lists a tier). */',
    '(function (root) {',
    "  'use strict';",
    '  const ROWS = [',
    ...rows.map((r) => '    ' + JSON.stringify(r) + ','),
    '  ];',
    '  /* Combat extras, one row per identity: [identity, guards, weaknesses, [shield kind, wording] | null,',
    '     [proficiency level, technique, 1 if reviewed] | null, source, [armour grade, wording] | null]. */',
    '  const COMBAT = [',
    ...combat.map((r) => '    ' + JSON.stringify(r) + ','),
    '  ];',
    '  /* Named counters: [name, chance per use, [targets], [[holder, wording from its record], ...]]. */',
    '  const COUNTERS = [',
    ...counters.map((r) => '    ' + JSON.stringify(r) + ','),
    '  ];',
    '  const REVIEWED_POOLS = ' + JSON.stringify(reviewedPools) + ';',
    "  const api = { version: 'research-moves-v3', rows: ROWS, combat: COMBAT, counters: COUNTERS, reviewedPools: REVIEWED_POOLS };",
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
module.exports = { build, render, pickMove, moveName, shortName, NAME_HINTS, loadTiers, tierBasis };

#!/usr/bin/env node
/* Seeded before/after measurement for the archetype and tag chemistry groups (data/archetype-groups.js).
 *
 *   node tools/archetype-impact.cjs                  # 400 rosters per pool and sport, seed 20261118
 *   node tools/archetype-impact.cjs --rosters 100    # quicker
 *   node tools/archetype-impact.cjs --seed 7 --json  # different seed, raw JSON instead of a Markdown table
 *
 * For every pool and sport it draws the same random rosters (fixed seed), scores them through the real page code
 * (tests/helpers/option-c-app-harness.cjs) once with and once without data/archetype-groups.js, and reports the
 * average and largest change in capped team chemistry, the share of rosters that changed, and how many were
 * already at the cap. Ratings are pre-game team ratings, not match outcomes.
 */
'use strict';
const path = require('path');
const { loadApp } = require(path.join(__dirname, '../tests/helpers/option-c-app-harness.cjs'));

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const N = Number(opt('--rosters', 400));
const SEED = Number(opt('--seed', 20261118));
const asJson = args.includes('--json');

function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const withG = loadApp();
const without = loadApp({ skip: s => s.includes('archetype-groups') });
const J = (app, code) => JSON.parse(app.run('JSON.stringify(' + code + ')'));
const sports = J(without, 'Object.keys(SPORTS)');
const pools = ['nba', 'mcu', 'toons', 'muppets', 'games', 'pokemon', 'starwars', 'dc', 'lotr', 'harrypotter', 'actionmovies', 'mashup'];
const cap = J(without, 'LINK_CAP');

function evaluate(app, pool, sk, rosters) {
  return JSON.parse(app.run(`(function(){
    const pool = ${JSON.stringify(pool)}, sk = ${JSON.stringify(sk)}, rosters = ${JSON.stringify(rosters)};
    const by = {}; for (const c of getCands(pool)) by[c.id] = c;
    const pos = SPORTS[sk].pos, out = [];
    for (const ids of rosters) {
      const r = {}; pos.forEach((p, i) => { if (ids[i]) r[p.id] = by[ids[i]]; });
      const s = synergyOf(sk, r);
      out.push([Math.min(${cap}, s.links.reduce((x, l) => x + l.pts, 0)), teamScore(sk, r).rating]);
    }
    return JSON.stringify(out);
  })()`));
}

const rows = [];
for (const pool of pools) {
  const players = J(without, 'getCands(' + JSON.stringify(pool) + ').filter(c => !c.coach).map(c => c.id)');
  const coaches = J(without, 'getCands(' + JSON.stringify(pool) + ').filter(c => c.coach).map(c => c.id)');
  const row = { pool, sports: {} };
  for (const sk of sports) {
    const rng = mulberry32(SEED + pool.length * 131 + sk.length * 7919 + sk.charCodeAt(0));
    const isCoach = J(without, 'SPORTS[' + JSON.stringify(sk) + '].pos.map(p => !!p.coach)');
    const rosters = [];
    for (let k = 0; k < N; k++) {
      const pp = players.slice(), cp = coaches.slice(), ids = [];
      for (const c of isCoach) { const src = c && cp.length ? cp : pp; ids.push(src.splice(Math.floor(rng() * src.length), 1)[0]); }
      rosters.push(ids);
    }
    const base = evaluate(without, pool, sk, rosters), after = evaluate(withG, pool, sk, rosters);
    let changed = 0, dc = 0, mc = 0, dr = 0, atCap = 0;
    for (let i = 0; i < N; i++) {
      const c = after[i][0] - base[i][0];
      if (c > 1e-9) changed++;
      dc += c; mc = Math.max(mc, c); dr += after[i][1] - base[i][1];
      if (base[i][0] >= cap - 1e-9) atCap++;
    }
    row.sports[sk] = { changed, avgChem: +(dc / N).toFixed(3), maxChem: +mc.toFixed(2), avgRating: +(dr / N).toFixed(3), atCap };
  }
  rows.push(row);
}

if (asJson) { console.log(JSON.stringify({ rosters: N, seed: SEED, cap, sports, rows }, null, 1)); process.exit(0); }
const pct = x => Math.round(100 * x.changed / N) + '%';
console.log(`Average capped team-chemistry change (share of ${N} seeded rosters changed), seed ${SEED}, cap ${cap}.\n`);
console.log('| Pool | ' + sports.join(' | ') + ' |');
console.log('|---|' + sports.map(() => '---').join('|') + '|');
for (const r of rows) console.log('| ' + r.pool + ' | ' + sports.map(s => (r.sports[s].avgChem >= 0 ? '+' : '') + r.sports[s].avgChem + ' (' + pct(r.sports[s]) + ')').join(' | ') + ' |');
console.log('\nLargest single change per pool: ' + rows.map(r => r.pool + ' +' + Math.max(...sports.map(s => r.sports[s].maxChem))).join(', '));

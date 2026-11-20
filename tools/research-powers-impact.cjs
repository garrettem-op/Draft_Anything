#!/usr/bin/env node
'use strict';
/* Measures what V2 research powers do to Battle Royale (docs/option-c/RESEARCH_POWERS.md).
   For each pool (and a mixed all-pool sample) it builds the same seeded random crews, plays the same
   seeded fights with the switch off (Version 1 behaviour) and on, and reports:
     fighters with a move  share of fighting slots that get a research move
     V1 profile            share of fighting slots with a Version 1 combat profile
     winner changed        share of fights whose winner differs between off and on
     research damage       share of all damage dealt by research moves (switch on)
   Usage: node tools/research-powers-impact.cjs [--fights 200] [--seed 20261120] [--json] */
const path = require('node:path');
const { loadApp } = require('../tests/helpers/option-c-app-harness.cjs');
const arg = (name, d) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : d; };
const FIGHTS = Number(arg('--fights', 200)), SEED = String(arg('--seed', '20261120'));
const POOLS = ['mcu', 'dc', 'toons', 'muppets', 'games', 'pokemon', 'starwars', 'lotr', 'harrypotter', 'actionmovies', 'nba', 'mixed'];

const PAGE = (pool) => `JSON.stringify((() => {
  const pools = ${JSON.stringify(POOLS.filter((p) => p !== 'mixed'))};
  const r = rngFrom(${JSON.stringify(SEED)} + ':' + ${JSON.stringify(pool)});
  const cands = ${JSON.stringify(pool)} === 'mixed' ? pools.filter(p => p !== 'nba').flatMap(p => getCands(p)) : getCands(${JSON.stringify(pool)});
  const base = cands.filter(c => !c.variantBase && !c.variantAbilities);
  const crew = () => { const used = new Set(), R = {}; for (const p of SPORTS.brawl.pos) { let c; do { c = base[Math.floor(r() * base.length)]; } while (used.has(c.id)); used.add(c.id); R[p.id] = c; } return teamScore('brawl', R); };
  let slots = 0, moves = 0, v1 = 0, dmg = 0, rdmg = 0; const winners = [];
  for (let k = 0; k < ${FIGHTS}; k++) {
    const A = crew(), B = crew();
    const g = playGame('brawl', A, B, 2.5, rngFrom(${JSON.stringify(SEED)} + ':' + ${JSON.stringify(pool)} + ':' + k), true);
    winners.push(g.winner);
    for (const s of g.combat.sides) for (const f of s.fighters) {
      slots++; dmg += f.dmg;
      if (/Research move/.test(f.powerLimit || '')) { moves++; rdmg += f.powerDmg || 0; } else if (f.powerMove) v1++;
    }
  }
  return { slots, moves, v1, dmg, rdmg, winners };
})())`;

function run() {
  const on = loadApp(), off = loadApp({ search: '?researchPowers=0' });
  const rows = [];
  for (const pool of POOLS) {
    let a, b;
    try { a = JSON.parse(on.run(PAGE(pool))); b = JSON.parse(off.run(PAGE(pool))); }
    catch (e) { rows.push({ pool, error: String(e.message).slice(0, 120) }); continue; }
    const changed = a.winners.filter((w, i) => w !== b.winners[i]).length;
    rows.push({ pool, fights: FIGHTS, withMove: a.moves / a.slots, v1Profile: a.v1 / a.slots, winnerChanged: changed / FIGHTS, researchDamage: a.dmg ? a.rdmg / a.dmg : 0 });
  }
  return rows;
}

if (require.main === module) {
  const rows = run();
  if (process.argv.includes('--json')) { console.log(JSON.stringify(rows, null, 1)); return; }
  const pct = (x) => (100 * x).toFixed(0) + '%';
  console.log('| Pool | Fighters with a research move | With a V1 profile | Winner changed | Damage from research moves |');
  console.log('|---|---|---|---|---|');
  for (const r of rows) console.log(r.error ? `| ${r.pool} | error: ${r.error} | | | |` : `| ${r.pool} | ${pct(r.withMove)} | ${pct(r.v1Profile)} | ${pct(r.winnerChanged)} | ${pct(r.researchDamage)} |`);
  console.log(`\n${FIGHTS} seeded fights per pool, random crews, low upsets (SD 2.5), seed ${SEED}. "mixed" draws from every pool except NBA.`);
}
module.exports = { run };

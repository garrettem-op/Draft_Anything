#!/usr/bin/env node
/* Gauntlet ranking report.
 *
 *   node tools/gauntlet-rank.cjs votes.json [more.json ...] [--top 25] [--json] [--write-aggregates out.json] [--csv out.csv]
 *
 * Inputs: files exported from the Gauntlet screen ({schema:'draft-anything.gauntlet.votes'}) or aggregate files
 * ({schema:'draft-anything.gauntlet.aggregates'}). Votes are merged and deduplicated by vote id. Nothing is sent anywhere.
 * Rankings are a calibration signal, not ground truth.
 */
'use strict';
const fs = require('node:fs');
const G = require('../data/gauntlet.js');

const args = process.argv.slice(2), files = [];
let top = 25, asJson = false, aggOut = null, csvOut = null;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--top') top = Number(args[++i]) || 25;
  else if (a === '--json') asJson = true;
  else if (a === '--write-aggregates') aggOut = args[++i];
  else if (a === '--csv') csvOut = args[++i];
  else files.push(a);
}
if (!files.length) { console.error('usage: gauntlet-rank.cjs <votes-or-aggregates.json> [...] [--top N] [--json] [--write-aggregates f] [--csv f]'); process.exit(2); }

const lists = [], aggs = [];
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (data && data.schema === 'draft-anything.gauntlet.votes' && Array.isArray(data.votes)) lists.push(data.votes);
  else if (data && data.schema === G.AGG_SCHEMA) { const v = G.validateAggregates(data); if (!v.ok) throw new Error(f + ': ' + v.errors[0]); aggs.push(data); }
  else throw new Error(f + ': unrecognized Gauntlet file');
}
// Raw votes are deduplicated by id. Aggregate files are already deduplicated, so their pair counts are added together;
// do not feed the same votes in twice as both a votes file and an aggregate file.
let agg = G.aggregate(lists.flat());
if (aggs.length) {
  const byKey = new Map(agg.pairs.map(p => [p.key, { ...p }]));
  for (const other of aggs) for (const p of other.pairs) {
    const e = byKey.get(p.key);
    if (!e) byKey.set(p.key, { ...p });
    else for (const f of ['aWins', 'bWins', 'ties', 'skips', 'decisive', 'aLeftDecisive']) e[f] += p[f];
  }
  agg = { ...agg, pairs: [...byKey.values()].sort((x, y) => (x.key < y.key ? -1 : 1)) };
  agg.totals.pairs = agg.pairs.length;
  for (const other of aggs) for (const f of ['votes', 'decisive', 'ties', 'skips', 'sessions']) agg.totals[f] += (other.totals && other.totals[f]) || 0;
  const bias = { decisiveVotes: agg.positionBias.decisiveVotes, leftWins: agg.positionBias.leftWins };
  for (const other of aggs) { bias.decisiveVotes += other.positionBias.decisiveVotes || 0; bias.leftWins += other.positionBias.leftWins || 0; }
  agg.positionBias = { ...bias, leftShare: bias.decisiveVotes ? bias.leftWins / bias.decisiveVotes : null, wilson95: bias.decisiveVotes ? G.wilson(bias.leftWins, bias.decisiveVotes) : null };
}
const ranking = G.rank(agg), cov = G.coverage(agg), cyc = G.contradictions(agg);
if (aggOut) fs.writeFileSync(aggOut, JSON.stringify(agg, null, 1) + '\n');
if (csvOut) fs.writeFileSync(csvOut, G.aggregatesToCSV(agg));
if (asJson) { console.log(JSON.stringify({ totals: agg.totals, positionBias: agg.positionBias, coverage: cov, contradictions: cyc, ranking: { ...ranking, rows: ranking.rows.slice(0, top) } }, null, 1)); process.exit(0); }

const pct = x => (x == null ? 'n/a' : (100 * x).toFixed(0) + '%');
console.log('Gauntlet ranking (' + G.MODEL_VERSION + ')');
console.log('votes ' + agg.totals.votes + ' · decisive ' + agg.totals.decisive + ' · ties ' + agg.totals.ties + ' · skips ' + agg.totals.skips + ' · pairs ' + agg.totals.pairs + ' · sessions ' + agg.totals.sessions);
if (agg.totals.droppedInvalid || agg.totals.droppedDuplicate) console.log('dropped: ' + agg.totals.droppedInvalid + ' invalid, ' + agg.totals.droppedDuplicate + ' duplicate');
const b = agg.positionBias;
console.log('left-side picks ' + pct(b.leftShare) + (b.wilson95 ? ' (95% ' + pct(b.wilson95[0]) + '-' + pct(b.wilson95[1]) + '; 50% means no position bias)' : ''));
console.log('coverage: ' + cov.votedCharacters + ' characters voted · within-pool pairs ' + cov.withinPoolPairs + ' · cross-pool pairs ' + cov.crossPoolPairs + ' · linked groups ' + ranking.components);
console.log('contradiction loops: ' + cyc.cycles.length + ' · contested pairs: ' + cyc.contestedPairs.length);
for (const c of cyc.cycles.slice(0, 5)) console.log('  loop: ' + c.join(' ~ '));
console.log('');
console.log('rank  rating  ±95   W-L-T     group  character');
for (const r of ranking.rows.slice(0, top)) {
  const half = Math.round((r.ci95[1] - r.ci95[0]) / 2);
  console.log(String(r.rank).padStart(4) + '  ' + String(Math.round(r.rating)).padStart(6) + '  ' + String(half).padStart(3) + '  ' + (r.wins + '-' + r.losses + '-' + r.ties).padEnd(8) + '  ' + String(r.component).padStart(5) + '  ' + r.id);
}

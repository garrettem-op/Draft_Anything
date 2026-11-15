#!/usr/bin/env node
/* Turns the server summary (the gauntlet_public_aggregate() response) into data/gauntlet/aggregates-v1.json.
 *
 *   node tools/gauntlet-publish.cjs summary.json [--out data/gauntlet/aggregates-v1.json]
 *
 * Output is deterministic (no timestamps), so the file only changes when the votes do. Exits 3 and writes
 * nothing when the summary has no votes yet. Rejects any summary whose numbers do not add up.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const G = require('../data/gauntlet.js');

function build(summary) {
  if (!summary || !Array.isArray(summary.pairs) || !Number.isInteger(summary.sessions) || summary.sessions < 0) throw new Error('summary has the wrong shape');
  const nat = n => Number.isInteger(n) && n >= 0;
  const pairs = summary.pairs.map(p => {
    if (![p.aWins, p.bWins, p.ties, p.skips, p.decisive, p.aLeftDecisive, p.leftWins].every(nat)) throw new Error('bad counts for ' + p.key);
    if (p.decisive !== p.aWins + p.bWins) throw new Error('decisive does not match wins for ' + p.key);
    if (p.aLeftDecisive > p.decisive || p.leftWins > p.decisive) throw new Error('left counts exceed decisive votes for ' + p.key);
    return { key: p.key, a: p.a, b: p.b, aWins: p.aWins, bWins: p.bWins, ties: p.ties, skips: p.skips, aLeftDecisive: p.aLeftDecisive, decisive: p.decisive, leftWins: p.leftWins };
  }).sort((x, y) => (x.key < y.key ? -1 : x.key > y.key ? 1 : 0));
  let decisive = 0, ties = 0, skips = 0, leftWins = 0, repeatPairs = 0, unanimousRepeatPairs = 0;
  for (const p of pairs) {
    decisive += p.decisive; ties += p.ties; skips += p.skips; leftWins += p.leftWins;
    if (p.aWins + p.bWins + p.ties >= 2) { repeatPairs++; if (p.ties === 0 && (p.aWins === 0 || p.bWins === 0)) unanimousRepeatPairs++; }
  }
  const agg = {
    schema: G.AGG_SCHEMA, version: 1, model: G.MODEL_VERSION,
    totals: { votes: decisive + ties + skips, decisive, ties, skips, pairs: pairs.length, repeatPairs, unanimousRepeatPairs, sessions: summary.sessions, droppedInvalid: 0, droppedDuplicate: 0 },
    positionBias: { decisiveVotes: decisive, leftWins, leftShare: decisive ? leftWins / decisive : null, wilson95: decisive ? G.wilson(leftWins, decisive) : null },
    pairs: pairs.map(p => ({ key: p.key, a: p.a, b: p.b, aWins: p.aWins, bWins: p.bWins, ties: p.ties, skips: p.skips, aLeftDecisive: p.aLeftDecisive, decisive: p.decisive }))
  };
  const check = G.validateAggregates(agg);
  if (!check.ok) throw new Error('invalid aggregate: ' + check.errors[0]);
  return agg;
}

// One pair per line, so a change shows up as a small diff.
function serialize(agg) {
  const head = JSON.stringify({ schema: agg.schema, version: agg.version, model: agg.model, totals: agg.totals, positionBias: agg.positionBias }, null, 1);
  return head.slice(0, -2) + ',\n "pairs": [\n' + agg.pairs.map(p => '  ' + JSON.stringify(p)).join(',\n') + '\n ]\n}\n';
}

if (require.main === module) {
  const args = process.argv.slice(2);
  let input = null, out = 'data/gauntlet/aggregates-v1.json';
  for (let i = 0; i < args.length; i++) { if (args[i] === '--out') out = args[++i]; else input = args[i]; }
  if (!input) { console.error('usage: gauntlet-publish.cjs summary.json [--out file]'); process.exit(2); }
  const agg = build(JSON.parse(fs.readFileSync(input, 'utf8')));
  if (!agg.totals.votes) { console.log('No votes yet; nothing to publish.'); process.exit(3); }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, serialize(agg));
  console.log('Wrote ' + out + ': ' + agg.totals.votes + ' votes, ' + agg.totals.pairs + ' pairs, ' + agg.totals.sessions + ' sessions.');
}
module.exports = { build, serialize };

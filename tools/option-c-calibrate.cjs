#!/usr/bin/env node
'use strict';
/* Calibrates the Option C probability model against the game's own simulated results (Version 2:
   research powers on). Nothing here changes a game result: it measures and fits two numbers.

   Battle Royale
     For random crews in every pool (and a mixed all-pool sample) it records the evaluator's two inputs,
       dR = effective-rating difference (A − B)
       dQ = coverage factor × interaction-index difference, where coverage factor = 0.5 + 0.5 × typed coverage,
     then plays K seeded fights and fits   P(A wins) = logistic(a·dR + b·dQ)   by maximum likelihood
     (no intercept, so the model stays side-symmetric). brawlScale = 1/a, qWeight = b.
   Sports
     Same idea with one input, P(A wins) = logistic(dR / s), fitted per sport at the low and high upset
     settings; sigmaToScale = s / sigma.

   Matchups are split by index parity: even ones fit, odd ones score. The report gives log loss, Brier
   score and a calibration table for the current constants and the fitted ones, on the held-out half.
   Usage: node tools/option-c-calibrate.cjs [--per-pool 60] [--fights 100] [--seed 20261121] [--json] */
const { loadApp } = require('../tests/helpers/option-c-app-harness.cjs');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const PER_POOL = Number(arg('--per-pool', 60)), FIGHTS = Number(arg('--fights', 100)), SEED = String(arg('--seed', '20261121'));
const POOLS = ['mcu', 'dc', 'toons', 'muppets', 'games', 'pokemon', 'starwars', 'lotr', 'harrypotter', 'actionmovies', 'nba', 'mixed'];
const SPORTS = ['basketball', 'football', 'soccer', 'baseball', 'hockey', 'volleyball'];
const SIGMAS = { low: 2.5, high: 6 };

const COLLECT = (sport, pool, n, k, sigma) => `JSON.stringify((() => {
  const sport = ${JSON.stringify(sport)}, pool = ${JSON.stringify(pool)};
  const all = ${JSON.stringify(POOLS.filter((p) => p !== 'mixed' && p !== 'nba'))};
  const r = rngFrom(${JSON.stringify(SEED)} + ':' + sport + ':' + pool);
  const cands = (pool === 'mixed' ? all.flatMap(p => getCands(p)) : getCands(pool)).filter(c => !c.variantBase && !c.variantAbilities);
  const crew = () => { const used = new Set(), R = {}; for (const p of SPORTS[sport].pos) { let c; do { c = cands[Math.floor(r() * cands.length)]; } while (used.has(c.id)); used.add(c.id); R[p.id] = c; } return teamScore(sport, R); };
  const rows = [];
  for (let m = 0; m < ${n}; m++) {
    const A = crew(), B = crew();
    const a = DA_OPTION_C.evaluateMatchup({ sportKey: sport, teamA: A, teamB: B, mode: 'shadow', context: { sigma: ${sigma} } });
    const pm = a.probabilityModel, s = a.sides.map(x => x.model);
    const dR = s[0].effectiveRating - s[1].effectiveRating;
    const dI = s[0].interactionIndex == null ? 0 : s[0].interactionIndex - s[1].interactionIndex;
    const cov = pm.basis === 'numeric-baseline-plus-typed-interactions' ? pm.qualitativeWeight / DA_OPTION_C_MODULES.probability.MODEL.qWeight : 0;
    let wins = 0;
    for (let k = 0; k < ${k}; k++) if (playGame(sport, A, B, ${sigma}, rngFrom(${JSON.stringify(SEED)} + ':' + sport + ':' + pool + ':' + m + ':' + k)).winner === 0) wins++;
    // The fight's support multiplier stops rising at a team score of 99.2 (rating / 80, capped at 1.24).
    const cap = x => Math.min(x, 99.2), dRcap = cap(s[0].effectiveRating) - cap(s[1].effectiveRating);
    rows.push({ dR, dRcap, dRover: dR - dRcap, dQ: cov * dI, logit: s[0].logit, p: a.sides[0].probability, range: a.sides[0].probabilityRange, wins, n: ${k} });
  }
  return rows;
})())`;

const sig = (x) => 1 / (1 + Math.exp(-x));
/* Solve H·x = g by Gaussian elimination with partial pivoting (small systems only). */
function solve(H, g) {
  const n = g.length, M = H.map((row, i) => [...row, g[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
  }
  return M.map((row, i) => row[n] / row[i]);
}
/* Maximum-likelihood logistic fit without intercept (Newton–Raphson), binomial counts. */
function fit(rows, feats) {
  let w = feats.map(() => 0);
  for (let it = 0; it < 50; it++) {
    const g = feats.map(() => 0), H = feats.map(() => feats.map(() => 0));
    for (const r of rows) {
      const x = feats.map((f) => r[f]), z = x.reduce((s, xi, i) => s + xi * w[i], 0), p = sig(z);
      for (let i = 0; i < x.length; i++) { g[i] += (r.wins - r.n * p) * x[i]; for (let j = 0; j < x.length; j++) H[i][j] -= r.n * p * (1 - p) * x[i] * x[j]; }
    }
    const step = solve(H, g);
    w = w.map((wi, i) => wi - step[i]);
    if (step.every((s) => Math.abs(s) < 1e-10)) break;
  }
  return w;
}
function score(rows, prob) {
  let ll = 0, brier = 0, fights = 0;
  for (const r of rows) {
    const p = Math.min(1 - 1e-6, Math.max(1e-6, prob(r)));
    ll -= r.wins * Math.log(p) + (r.n - r.wins) * Math.log(1 - p);
    brier += r.wins * (1 - p) ** 2 + (r.n - r.wins) * p ** 2; fights += r.n;
  }
  return { logLoss: ll / fights, brier: brier / fights };
}
function bins(rows, prob) {
  const edges = [0, 0.2, 0.4, 0.6, 0.8, 1.0001];
  return edges.slice(0, -1).map((lo, i) => {
    const hi = edges[i + 1], inBin = rows.filter((r) => { const p = prob(r); return p >= lo && p < hi; });
    const n = inBin.reduce((s, r) => s + r.n, 0);
    return { range: lo.toFixed(1) + '–' + Math.min(1, hi).toFixed(1), matchups: inBin.length,
      predicted: inBin.length ? inBin.reduce((s, r) => s + prob(r) * r.n, 0) / n : null,
      observed: inBin.length ? inBin.reduce((s, r) => s + r.wins, 0) / n : null };
  });
}

function run() {
  const app = loadApp();
  const out = { seed: SEED, perPool: PER_POOL, fights: FIGHTS, inUse: JSON.parse(app.run('JSON.stringify(DA_OPTION_C_MODULES.probability.MODEL)')) };
  // Battle Royale
  const br = [];
  for (const pool of POOLS) br.push(...JSON.parse(app.run(COLLECT('brawl', pool, PER_POOL, FIGHTS, 2.5))).map((r, i) => ({ ...r, pool, i })));
  const train = br.filter((r) => r.i % 2 === 0), test = br.filter((r) => r.i % 2 === 1);
  const [a, b] = fit(train, ['dR', 'dQ']);
  const current = (r) => sig(r.logit), fitted = (r) => sig(a * r.dR + b * r.dQ);
  const observed = (r) => r.wins / r.n;
  out.brawl = {
    matchups: br.length, fitted: { brawlScale: 1 / a, qWeight: b },
    heldOut: { current: score(test, current), fitted: score(test, fitted), numericOnly: score(test, (r) => sig(fit(train, ['dR'])[0] * r.dR)) },
    // Alternative: rating points above the fight's support cap (99.2) weighted separately.
    capAware: (() => { const w = fit(train, ['dRcap', 'dRover', 'dQ']); return { weights: { belowCap: w[0], aboveCap: w[1], qWeight: w[2] },
      heldOut: score(test, (r) => sig(w[0] * r.dRcap + w[1] * r.dRover + w[2] * r.dQ)) }; })(),
    withinRange: test.filter((r) => observed(r) >= r.range[0] - 1e-9 && observed(r) <= r.range[1] + 1e-9).length / test.length,
    // How far held-out results land from the fitted estimate (absolute difference in win rate).
    residual: (() => { const d = test.map((r) => Math.abs(observed(r) - fitted(r))).sort((x, y) => x - y), q = (f) => d[Math.min(d.length - 1, Math.floor(f * d.length))];
      return { p50: q(0.5), p80: q(0.8), p90: q(0.9) }; })(),
    calibration: { current: bins(test, current), fitted: bins(test, fitted) },
    byPool: POOLS.map((pool) => { const t = test.filter((r) => r.pool === pool); return { pool, current: score(t, current).brier, fitted: score(t, fitted).brier }; }),
  };
  // Sports
  out.sports = [];
  for (const sport of SPORTS) for (const [level, sigma] of Object.entries(SIGMAS)) {
    const rows = [];
    for (const pool of ['mcu', 'nba', 'mixed']) rows.push(...JSON.parse(app.run(COLLECT(sport, pool, Math.round(PER_POOL / 3), Math.round(FIGHTS / 2), sigma))).map((r, i) => ({ ...r, pool, i })));
    const tr = rows.filter((r) => r.i % 2 === 0), te = rows.filter((r) => r.i % 2 === 1);
    const [k] = fit(tr, ['dR']);
    out.sports.push({ sport, upsets: level, sigma, fittedScale: 1 / k, sigmaToScale: 1 / k / sigma,
      current: score(te, (r) => sig(r.logit)).brier, fitted: score(te, (r) => sig(k * r.dR)).brier });
  }
  return out;
}

if (require.main === module) {
  const o = run();
  if (process.argv.includes('--json')) { console.log(JSON.stringify(o, null, 1)); return; }
  const f3 = (x) => x == null ? '–' : x.toFixed(3), pct = (x) => x == null ? '–' : Math.round(100 * x) + '%';
  const b = o.brawl;
  console.log(`Battle Royale: ${b.matchups} matchups × ${o.fights} fights (seed ${o.seed}); fit on even matchups, scored on odd ones.`);
  console.log(`Fitted: brawlScale ${b.fitted.brawlScale.toFixed(2)} rating points per logit (in use ${o.inUse.brawlScale}), qWeight ${b.fitted.qWeight.toFixed(3)} (in use ${o.inUse.qWeight}).`);
  console.log(`Held-out log loss: current ${f3(b.heldOut.current.logLoss)}, fitted ${f3(b.heldOut.fitted.logLoss)}, rating only ${f3(b.heldOut.numericOnly.logLoss)}. Brier: current ${f3(b.heldOut.current.brier)}, fitted ${f3(b.heldOut.fitted.brier)}.`);
  console.log(`Cap-aware alternative: ${(1 / b.capAware.weights.belowCap).toFixed(2)} points per logit below a score of 99.2, ${(1 / b.capAware.weights.aboveCap).toFixed(2)} above it, qWeight ${b.capAware.weights.qWeight.toFixed(3)}; held-out log loss ${f3(b.capAware.heldOut.logLoss)}, Brier ${f3(b.capAware.heldOut.brier)}.`);
  console.log(`Observed win rate inside the current reported range: ${pct(b.withinRange)} of held-out matchups.`);
  console.log(`Held-out distance from the fitted estimate: median ${pct(b.residual.p50)}, 80% within ${pct(b.residual.p80)}, 90% within ${pct(b.residual.p90)}.\n`);
  console.log('| Predicted (held out) | Matchups | Current: predicted → observed | Fitted: predicted → observed |\n|---|---|---|---|');
  b.calibration.current.forEach((c, i) => { const f = b.calibration.fitted[i]; console.log(`| ${c.range} | ${c.matchups} / ${f.matchups} | ${pct(c.predicted)} → ${pct(c.observed)} | ${pct(f.predicted)} → ${pct(f.observed)} |`); });
  console.log('\n| Pool | Brier, current | Brier, fitted |\n|---|---|---|');
  for (const p of b.byPool) console.log(`| ${p.pool} | ${f3(p.current)} | ${f3(p.fitted)} |`);
  console.log('\n| Sport | Upsets (sigma) | Fitted scale | Scale ÷ sigma | Brier, current | Brier, fitted |\n|---|---|---|---|---|---|');
  for (const s of o.sports) console.log(`| ${s.sport} | ${s.upsets} (${s.sigma}) | ${s.fittedScale.toFixed(2)} | ${s.sigmaToScale.toFixed(2)} | ${f3(s.current)} | ${f3(s.fitted)} |`);
}
module.exports = { run, fit, score, bins };

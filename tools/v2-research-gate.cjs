#!/usr/bin/env node
'use strict';
/* Merge gate for research-only V2 PRs. No model/API calls beyond the GitHub REST API via `gh`.
   Fails closed: any missing, partial or ambiguous signal means "not eligible".
   Usage: node tools/v2-research-gate.cjs <repo> <pr> [--dry-run]                      */
const cp = require('node:child_process');

const BASE = 'develop/v2-option-c';
const LABEL = 'v2-research-approved';
const RESEARCH_FILE = /^research\/option-c\/batches\/[a-z0-9][a-z0-9_-]*\.json$/i;
const GATE_CHECK = 'research-merge-gate';
const OK_CONCLUSIONS = new Set(['success', 'neutral', 'skipped']);

/* ---------- pure decision logic (unit tested) ---------- */

function latestDecisiveReviews(reviews) {
  // Only APPROVED / CHANGES_REQUESTED / DISMISSED change a reviewer's standing;
  // a later COMMENTED review must not erase an approval or a change request.
  const latest = new Map();
  const ordered = [...reviews].sort((a, b) => String(a.submitted_at || '').localeCompare(String(b.submitted_at || '')) || (a.id || 0) - (b.id || 0));
  for (const r of ordered) {
    const login = r.user && r.user.login;
    if (!login || !['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'].includes(r.state)) continue;
    latest.set(login, r);
  }
  return latest;
}

function evaluate({ pr, files, reviews, checkRuns, combinedStatus }) {
  const reasons = [];
  const no = (m) => reasons.push(m);
  if (!pr || pr.state !== 'open') no('PR is not open');
  if (pr.base.ref !== BASE) no('base is not ' + BASE);
  if (pr.draft) no('PR is a draft');
  if (pr.head.repo && pr.base.repo && pr.head.repo.full_name !== pr.base.repo.full_name) no('PR comes from a fork');
  if (!(pr.labels || []).some((l) => l.name === LABEL)) no('label ' + LABEL + ' is absent');

  if (!files.length) no('PR changes no files');
  if (files.length !== pr.changed_files) no('file list incomplete (' + files.length + ' of ' + pr.changed_files + ')');
  const bad = files.filter((f) => f.status === 'removed' || f.status === 'renamed' || !RESEARCH_FILE.test(f.filename));
  if (bad.length) no('changes outside research/option-c/batches/*.json: ' + bad.map((f) => f.filename).slice(0, 5).join(', '));

  const latest = latestDecisiveReviews(reviews);
  const author = pr.user.login;
  const blocking = [...latest].filter(([, r]) => r.state === 'CHANGES_REQUESTED');
  if (blocking.length) no('changes requested by ' + blocking.map(([l]) => l).join(', '));
  const approvers = [...latest]
    .filter(([login, r]) => login !== author && !/\[bot\]$/.test(login) && r.state === 'APPROVED' && r.commit_id === pr.head.sha)
    .map(([login]) => login);
  if (!approvers.length) no('no independent APPROVED review on the current head ' + pr.head.sha.slice(0, 7));

  const others = checkRuns.filter((c) => c.name !== GATE_CHECK);
  const validations = others.filter((c) => c.name === 'validate-research');
  if (!validations.length) no('validate-research has not run on this head');
  const pending = others.filter((c) => c.status !== 'completed');
  const failing = others.filter((c) => c.status === 'completed' && !OK_CONCLUSIONS.has(c.conclusion));
  if (pending.length) no('checks still running: ' + pending.map((c) => c.name).join(', '));
  if (failing.length) no('checks not green: ' + failing.map((c) => c.name + '=' + c.conclusion).join(', '));
  if (validations.length && !validations.every((c) => c.status === 'completed' && c.conclusion === 'success')) no('validate-research is not green');
  if (combinedStatus && combinedStatus.total_count > 0 && combinedStatus.state !== 'success') no('commit status is ' + combinedStatus.state);

    // Worth waiting only when running checks are the sole obstacle.
  const waitable = pending.length > 0 && reasons.every((r) => /^(checks still running|validate-research)/.test(r));
  return { eligible: reasons.length === 0, reasons, approvers, pending: waitable };
}

/* ---------- GitHub I/O ---------- */

function gh(args) { return cp.execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }); }
function api(path) { return JSON.parse(gh(['api', path])); }
function apiAll(path) {
  // --slurp returns one array element per page; flatten list or {check_runs:[...]} pages.
  const pages = JSON.parse(gh(['api', '--paginate', '--slurp', path]));
  return pages.flatMap((p) => (Array.isArray(p) ? p : p.check_runs || []));
}

function load(repo, n) {
  const pr = api('/repos/' + repo + '/pulls/' + n);
  const sha = pr.head.sha;
  const runsTotal = api('/repos/' + repo + '/commits/' + sha + '/check-runs?per_page=1').total_count;
  const checkRuns = apiAll('/repos/' + repo + '/commits/' + sha + '/check-runs?per_page=100');
  if (checkRuns.length !== runsTotal) throw Error('check-run pagination incomplete (' + checkRuns.length + '/' + runsTotal + ')');
  return {
    pr,
    files: apiAll('/repos/' + repo + '/pulls/' + n + '/files?per_page=100'),
    reviews: apiAll('/repos/' + repo + '/pulls/' + n + '/reviews?per_page=100'),
    checkRuns,
    combinedStatus: api('/repos/' + repo + '/commits/' + sha + '/status'),
  };
}

function sleep(ms) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }

function main(argv) {
  const [repo, n] = argv;
  const dry = argv.includes('--dry-run');
  if (!repo || !/^\d+$/.test(String(n || ''))) throw Error('Usage: v2-research-gate.cjs <owner/repo> <pr> [--dry-run]');
  // Wait (bounded) for checks that are still running, so an approval given while CI runs is not lost.
  let state, result;
  for (let attempt = 0; attempt < 20; attempt++) {
    state = load(repo, n);
    result = evaluate(state);
    if (!result.pending || dry) break;
    console.log('Waiting for running checks: ' + result.reasons.join('; '));
    sleep(30000);
  }
  if (!result.eligible) {
    console.log('Not eligible for merge: ' + result.reasons.join('; '));
    return { merged: false };
  }
  console.log('Eligible. Independent approval by ' + result.approvers.join(', ') + ' on ' + state.pr.head.sha);
  if (dry) { console.log('Dry run: no merge.'); return { merged: false, eligible: true }; }
  // Pin the merge to the exact head that was approved and validated.
  gh(['pr', 'merge', String(n), '-R', repo, '--squash', '--match-head-commit', state.pr.head.sha]);
  console.log('Merged #' + n + '.');
  return { merged: true };
}

if (require.main === module) {
  const out = main(process.argv.slice(2));
  if (process.env.GITHUB_OUTPUT) require('node:fs').appendFileSync(process.env.GITHUB_OUTPUT, 'merged=' + !!out.merged + '\n');
}
module.exports = { evaluate, latestDecisiveReviews, RESEARCH_FILE, GATE_CHECK };

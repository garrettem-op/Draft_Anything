#!/usr/bin/env node
'use strict';
/* V2 research tick: one idempotent pass of the research pipeline, run by a scheduler.
     reconcile  – for every open research-only PR on develop/v2-option-c: post a
                  validate-research check if its head has none, then run the merge gate.
     generate   – drain the queue with Gemini until it is empty, the free-tier daily quota
                  is used up, or the time budget ends. One PR per batch (opened by the
                  workflow token, so garrettem-op can independently approve it).
   It works by polling, so it does not depend on events that GITHUB_TOKEN actions suppress.

   Trust boundary: in Actions this file runs from a pinned, already-merged commit and is given
   --snapshot <file>, a JSON snapshot of the roster made by an unprivileged job. It never executes
   code from develop/v2-option-c, never checks it out, and writes to GitHub only through the REST API.
   Without --snapshot (local use) it reads the local checkout instead.
   Project vision: generate reads docs/PROJECT_VISION.md from main (the trusted default branch)
   through the REST API and sends it as Gemini's system instruction. No vision, no generation.
   Usage: node tools/v2-research-tick.cjs reconcile [--dry-run] | generate [--budget-minutes N] [--batch-size N] [--vision <file>]
          (both accept --snapshot <file>)                                                          */

const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const pipe = require('./v2-research-pipeline.cjs');
const gate = require('./v2-research-gate.cjs');
const worker = require('./v2-gemini-worker.cjs');

const BASE = 'develop/v2-option-c';
const MANUAL_TITLE = '[V2 Research] Needs manual research';
const VISION_PATH = 'docs/PROJECT_VISION.md';
const REPO = process.env.GITHUB_REPOSITORY || 'garrettem-op/Draft_Anything';

const gh = (args, opts = {}) => cp.execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...opts });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const summary = [];
const say = (line) => { console.log(line); summary.push(line); };

function argValue(argv, name, dflt) { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : dflt; }
function state(argv) {
  const file = argValue(argv, '--snapshot');
  return file ? pipe.fromSnapshot(JSON.parse(fs.readFileSync(file, 'utf8'))) : pipe.audit();
}

function openResearchPRs() {
  return gate.apiAll('/repos/' + REPO + '/pulls?state=open&base=' + encodeURIComponent(BASE) + '&per_page=100')
    .filter((pr) => pr.head.repo && pr.head.repo.full_name === pr.base.repo.full_name);
}
function prFiles(n) { return gate.apiAll('/repos/' + REPO + '/pulls/' + n + '/files?per_page=100'); }
function fileAt(file, sha) {
  return JSON.parse(gh(['api', '-H', 'Accept: application/vnd.github.raw+json', '/repos/' + REPO + '/contents/' + encodeURI(file) + '?ref=' + sha]));
}

/* Identities claimed by open PRs (any author) – these are not offered again. */
function claimedIds(prs) {
  const ids = new Set();
  for (const pr of prs) {
    for (const f of prFiles(pr.number)) {
      if (!gate.RESEARCH_FILE.test(f.filename) || f.status === 'removed') continue;
      try { for (const c of fileAt(f.filename, pr.head.sha).characters || []) if (c && typeof c.id === 'string') ids.add(c.id); }
      catch (e) { console.error('#' + pr.number + ' ' + f.filename + ': unreadable'); }
    }
  }
  return ids;
}

/* The owner's master directive, from main (or a local file for testing). Returns {text, ref}. */
function loadVision(argv) {
  const file = argValue(argv, '--vision');
  if (file) return { text: fs.readFileSync(file, 'utf8'), ref: 'local file ' + path.basename(file) };
  const meta = JSON.parse(gh(['api', '/repos/' + REPO + '/contents/' + VISION_PATH + '?ref=main']));
  if (meta.encoding !== 'base64' || typeof meta.content !== 'string') throw new worker.FatalError(VISION_PATH + ' on main is unreadable');
  return { text: Buffer.from(meta.content, 'base64').toString('utf8'), ref: VISION_PATH + '@main blob ' + String(meta.sha).slice(0, 12) };
}

/* ---------- manual-research issue (identities the model could not source) ---------- */
function manualIssue() {
  // REST only (no GraphQL), so the same code runs in Actions and in Claude sessions.
  const list = gate.apiAll('/repos/' + REPO + '/issues?state=open&per_page=100');
  const hit = list.find((i) => !i.pull_request && i.title === MANUAL_TITLE);
  return hit ? { number: hit.number, title: hit.title, body: hit.body || '' } : null;
}
function manualIds(issue) { return new Set(issue ? [...issue.body.matchAll(/^- `([^`]+)`/gm)].map((m) => m[1]) : []); }
function addManual(entries) {
  if (!entries.length) return;
  const issue = manualIssue();
  const lines = entries.map((d) => '- `' + d.id + '` — ' + String(d.why).replace(/\s+/g, ' ').slice(0, 200)).join('\n');
  if (issue) restWrite('PATCH', '/repos/' + REPO + '/issues/' + issue.number, { body: issue.body.trimEnd() + '\n' + lines + '\n' });
  else restWrite('POST', '/repos/' + REPO + '/issues', { title: MANUAL_TITLE, body:
    'The automated Gemini worker could not produce a validator-clean profile with a working source for these identities. They are skipped by the automatic queue. Research them by hand (Claude review sessions pick from this list) and delete the line once a PR covers it.\n\n' + lines + '\n' });
}

/* ---------- reconcile ---------- */
function validatePR(pr, files, known, mergedRecords, tags) {
  const errors = [];
  const ids = new Set();
  for (const f of files) {
    let batch;
    try { batch = fileAt(f.filename, pr.head.sha); } catch (e) { errors.push(f.filename + ': unreadable or invalid JSON'); continue; }
    errors.push(...pipe.checkBatch(path.basename(f.filename), batch, known, tags));
    for (const c of Array.isArray(batch.characters) ? batch.characters : []) {
      if (!c || typeof c.id !== 'string') continue;
      if (ids.has(c.id)) errors.push(f.filename + ': duplicate ' + c.id);
      const prior = mergedRecords.get(c.id);
      // A changed existing file may restate its own ids; a new file may not duplicate merged ids.
      if (prior && prior.file !== path.basename(f.filename)) errors.push(f.filename + ': ' + c.id + ' already merged in ' + prior.file);
      ids.add(c.id);
    }
  }
  return { errors, count: ids.size };
}

function restWrite(method, url, payload) {
  return JSON.parse(gh(['api', '-X', method, url, '--input', '-'], { input: JSON.stringify(payload) }) || '{}');
}
function postCheck(sha, ok, title, text) {
  restWrite('POST', '/repos/' + REPO + '/check-runs', { name: 'validate-research', head_sha: sha, status: 'completed', conclusion: ok ? 'success' : 'failure', output: { title, summary: text.slice(0, 60000) } });
}

function reconcile(audit, { dry = false } = {}) {
  const known = new Set(audit.ids);
  const tags = new Set(audit.tags);
  let merged = 0;
  for (const pr of openResearchPRs()) {
    if (pr.draft) continue;
    const files = prFiles(pr.number);
    if (!files.length || files.some((f) => f.status === 'removed' || !gate.RESEARCH_FILE.test(f.filename))) continue;
    const runs = gate.apiAll('/repos/' + REPO + '/commits/' + pr.head.sha + '/check-runs?per_page=100');
    if (!runs.some((r) => r.name === 'validate-research')) {
      const v = validatePR(pr, files, known, audit.records, tags);
      if (dry) { say('#' + pr.number + ': would post validate-research ' + (v.errors.length ? 'FAILURE: ' + v.errors.slice(0, 3).join(' | ') : 'success (' + v.count + ' records)')); }
      else {
        postCheck(pr.head.sha, !v.errors.length, v.errors.length ? v.errors.length + ' validation error(s)' : v.count + ' record(s) valid',
          v.errors.length ? v.errors.join('\n') : 'Schema, roster identity, source and duplicate checks passed (tick validator).');
        say('#' + pr.number + ': posted validate-research ' + (v.errors.length ? 'FAILURE' : 'success'));
      }
    }
    try { if (gate.runGate(REPO, pr.number, { waits: 0, dry }).merged) { merged++; say('#' + pr.number + ': merged by gate'); } }
    catch (e) { say('#' + pr.number + ': gate error: ' + e.message.split('\n')[0]); }
  }
  say('Reconcile: ' + merged + ' PR(s) merged.');
}

/* ---------- generate ---------- */
async function generate(argv) {
  const budgetMs = Number(argValue(argv, '--budget-minutes', '25')) * 60000;
  const size = Number(argValue(argv, '--batch-size', '10'));
  const model = process.env.GEMINI_MODEL || worker.DEFAULT_MODEL;
  const started = Date.now();
  const baseSha = JSON.parse(gh(['api', '/repos/' + REPO + '/git/ref/heads/' + encodeURIComponent(BASE)])).object.sha;
  const audit = state(argv);
  if (audit.errors.length) throw Error('Research ledger has errors; fix before generating: ' + audit.errors.join('; '));
  let vision;
  try { vision = loadVision(argv); } catch (e) { say('Stopped: fatal: cannot read ' + VISION_PATH + ' (' + String(e.message).split('\n')[0].slice(0, 160) + ')'); process.exitCode = 1; return; }
  const system = worker.systemInstruction(vision.text);
  const tagList = audit.tags || [];
  const tagSet = new Set(tagList);
  const schema = worker.responseSchema(tagList);
  say('Instructions: ' + vision.ref + '; ' + tagList.length + ' campaign tags in vocabulary.');
  const skip = new Set([...claimedIds(openResearchPRs()), ...manualIds(manualIssue())]);
  const transient = new Set();
  const failures = new Map();
  let networkFailures = 0, calls = 0, prs = 0, records = 0, stop = 'queue empty', lastCall = 0;
  const manual = [];

  while (true) {
    if (Date.now() - started > budgetMs) { stop = 'time budget reached'; break; }
    const next = pipe.nextBatch(audit, size, new Set([...skip, ...transient]));
    if (next.complete) break;
    const wait = 4500 - (Date.now() - lastCall);
    if (wait > 0) await sleep(wait);
    let raw;
    try {
      lastCall = Date.now(); calls++;
      raw = await worker.callGemini({ apiKey: process.env.GEMINI_API_KEY, model, system, schema, prompt: worker.buildPrompt(next.ids, { tags: tagList }) });
    } catch (e) {
      if (e instanceof worker.QuotaError && e.daily) { stop = 'Gemini free-tier daily quota reached'; break; }
      if (e instanceof worker.QuotaError) {
        say('Transient Gemini error, backing off: ' + e.message.slice(0, 160));
        await sleep(Math.min(Math.max(e.retryMs, 10000), 120000));
        // Third failure on the same batch: set those ids aside until the next tick.
        const key = next.ids.join('|'), n = (failures.get(key) || 0) + 1;
        failures.set(key, n);
        if (n >= 3) next.ids.forEach((id) => transient.add(id));
        continue;
      }
      if (e instanceof worker.FatalError) { stop = 'fatal: ' + e.message.slice(0, 200); break; }
      say('Unparseable Gemini output for ' + next.ids.length + ' ids; retrying next tick.');
      next.ids.forEach((id) => transient.add(id));
      continue;
    }
    const out = await worker.normalize(raw, next.ids, { checkUrl: (u, id) => worker.checkSource(u, id), checkBatch: pipe.checkBatch, known: new Set(audit.ids), tags: tagSet });
    if (!out.characters.length && out.flags.length && out.flags.every((f) => f.includes('unreachable'))) {
      // Every link unreachable looks like a runner network problem, not bad research: retry later.
      next.ids.forEach((id) => transient.add(id));
      if (++networkFailures >= 3) { stop = 'source checks unreachable 3 times in a row (network?)'; break; }
      continue;
    }
    networkFailures = 0;
    out.dropped.forEach((d) => { skip.add(d.id); manual.push(d); });
    if (!out.characters.length) continue;

    const slug = next.pool.replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..*/, '').replace('T', '-');
    const name = 'gemini-' + slug + '-' + stamp + '-' + calls;
    const file = 'research/option-c/batches/' + name + '.json';
    const batch = {
      batchId: 'Gemini V2 research ' + next.pool + ' ' + stamp + ' #' + calls,
      schemaVersion: 1,
      pool: next.pool,
      researchedBy: 'Gemini (' + model + '), automated; not independently verified',
      method: 'Structured JSON from the Gemini API, instructed by ' + vision.ref + '. Every cited URL was fetched; dead links and pages that never mention the character were removed, and feats, results, conditions and campaign tags that lost their source were moved to unknowns. All records provisional.',
      characters: out.characters,
    };
    const errors = pipe.checkBatch(name + '.json', batch, new Set(audit.ids), tagSet);
    if (errors.length) { say('Skipped an invalid batch: ' + errors[0]); out.characters.forEach((c) => transient.add(c.id)); continue; }
    // REST only: new branch at develop's head, one added file. No checkout, no git hooks.
    const branch = 'gemini/v2-research/' + name;
    restWrite('POST', '/repos/' + REPO + '/git/refs', { ref: 'refs/heads/' + branch, sha: baseSha });
    restWrite('PUT', '/repos/' + REPO + '/contents/' + file, { message: 'research(option-c): provisional Gemini batch ' + name, branch,
      content: Buffer.from(JSON.stringify(batch, null, 2) + '\n').toString('base64') });
    const body = [
      'Automated research-only batch (' + out.characters.length + ' identities). **All records provisional.**',
      '',
      out.characters.map((c) => '- `' + c.id + '`').join('\n'),
      '',
      out.flags.length ? '**Automatic source check notes**\n' + out.flags.map((f) => '- ' + f).join('\n') : 'Every cited source was reachable and mentions its character.',
      '',
      'Review: a reviewer other than the author checks the cited support for feats, results, conditions and proposed campaign tags (one credible source per ordinary claim), corrects or flags records (`needs-review` / `unknowns`), then approves and adds `v2-research-approved`. The merge gate does the rest. Relates to #83, #101.',
    ].join('\n');
    restWrite('POST', '/repos/' + REPO + '/pulls', { base: BASE, head: branch, body,
      title: 'Gemini V2 research: ' + next.pool + ' ' + out.characters[0].id.split(':')[1] + (out.characters.length > 1 ? ' +' + (out.characters.length - 1) : '') });
    out.characters.forEach((c) => skip.add(c.id));
    prs++; records += out.characters.length;
  }
  addManual(manual);
  const a = audit;
  const remaining = a.ids.filter((id) => !a.records.has(id) && !skip.has(id)).length;
  say('Generate: ' + calls + ' Gemini call(s), ' + prs + ' PR(s), ' + records + ' record(s), ' + manual.length + ' sent to manual research. Stopped: ' + stop + '.');
  say('Backlog: ' + a.ids.length + ' identities, ' + a.records.size + ' merged, ' + (a.ids.length - a.records.size - remaining) + ' in open PRs or manual list, ' + remaining + ' not yet started.');
  if (stop.startsWith('fatal')) process.exitCode = 1;
}

async function main(argv) {
  const cmd = argv[0];
  try {
    if (cmd === 'reconcile') reconcile(state(argv), { dry: argv.includes('--dry-run') });
    else if (cmd === 'generate') await generate(argv);
    else throw Error('Usage: v2-research-tick.cjs reconcile [--dry-run] | generate [--budget-minutes N] [--batch-size N]');
  } finally {
    if (process.env.GITHUB_STEP_SUMMARY && summary.length) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, '### ' + cmd + '\n' + summary.map((l) => '- ' + l).join('\n') + '\n');
  }
}
if (require.main === module) main(process.argv.slice(2)).catch((e) => { console.error(e.stack || e.message); process.exitCode = 1; });
module.exports = { validatePR, claimedIds, state, loadVision };

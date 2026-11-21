#!/usr/bin/env node
'use strict';
/* V2 research tick: one idempotent pass of the research pipeline, run by a scheduler.
     reconcile  – for every open research-only PR on develop/v2-option-c: post a
                  validate-research check if its head has none, then run the merge gate.
     generate   – drain the queue with Gemini until it is empty, the free-tier daily quota
                  is used up, or the time budget ends. One PR per batch (opened by the
                  workflow token, so garrettem-op can independently approve it). Once no new
                  identities are left, it expands records written before the all-depictions
                  scope (owner ruling 2026-11-20) in place, one batch file per PR.
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

/* ---------- refine (needs-review records, edited in place) ---------- */
/* Replace records in a batch file by id. Pure: never adds ids, never reorders, keeps unmatched records byte-for-byte.
   Earlier review notes stay in unknowns so lost claims are not forgotten. */
function mergeRefined(batch, refined) {
  const byId = new Map(refined.map((r) => [r.id, r]));
  const done = [];
  const characters = batch.characters.map((old) => {
    const nu = byId.get(old.id);
    if (!nu || !Array.isArray(nu.sources) || nu.sources.length < 1) return old;
    const carried = (old.unknowns || []).filter((u) => !/^Flagged needs-review/.test(u) && !(nu.unknowns || []).includes(u));
    done.push(old.id);
    return { ...nu, unknowns: [...(nu.unknowns || []), ...carried, 'Refined by Gemini automated pass; not independently verified.'] };
  });
  return { batch: { ...batch, characters }, done };
}

/* ---------- expand (all-depictions scope, edited in place) ---------- */
/* Replace records by id with their all-depictions version, carrying every earlier claim over so nothing that
   was already accepted is lost. Earlier evidence is labelled with an "earlier-record" depiction named after
   the old continuity (its exact depiction was never recorded). Pure: never adds ids, never reorders, keeps
   unmatched records byte-for-byte. */
const EXPAND_NOTE = 'Expanded to all depictions by the Gemini automated pass (owner ruling 2026-11-20). Earlier claims were carried over; new claims are not independently verified.';
function carryOver(old, nu) {
  const rec = JSON.parse(JSON.stringify(nu));
  const key = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  // Depiction for carried evidence: reuse a matching new title, else add the old continuity as an earlier record.
  let earlier = rec.depictions.find((d) => key(d.title) && key(d.title) === key(old.continuity));
  if (!earlier) {
    const title = String(old.continuity || 'Earlier record').trim();
    earlier = { title: rec.depictions.some((d) => d.title === title) ? title + ' (earlier record)' : title, kind: 'earlier-record' };
    rec.depictions.push(earlier);
  }
  const sources = rec.sources, idx = new Map();
  (old.sources || []).forEach((s, i) => {
    let j = sources.findIndex((x) => x.url === s.url);
    if (j < 0) { j = sources.length; sources.push({ url: s.url, supports: s.supports }); }
    // Same page in both records: keep the earlier note too, so evidence it stated is not lost.
    else if (s.supports && !String(sources[j].supports || '').includes(s.supports)) sources[j] = { ...sources[j], supports: (sources[j].supports ? sources[j].supports + ' | Earlier record: ' : '') + s.supports };
    idx.set(i, j);
  });
  const union = (a, b) => { const out = [...(a || [])]; for (const x of b || []) if (typeof x === 'string' && !out.some((y) => String(y).toLowerCase() === x.toLowerCase())) out.push(x); return out; };
  rec.offense = { ...rec.offense, domains: union(rec.offense.domains, old.offense && old.offense.domains), techniques: union(rec.offense.techniques, old.offense && old.offense.techniques) };
  if (!rec.offense.range && old.offense && old.offense.range) rec.offense.range = old.offense.range;
  rec.defense = { ...rec.defense, mechanisms: union(rec.defense.mechanisms, old.defense && old.defense.mechanisms) };
  for (const k of ['mobility', 'limitations', 'support']) { const u = union(rec[k], old[k]); if (u.length) rec[k] = u; }
  let weak = union(rec.weaknesses, old.weaknesses);
  // Drop "not established" placeholders only when a real weakness is listed (never empty the list).
  const real = weak.filter((w) => !/^not established/i.test(w));
  if (real.length) weak = real; else weak = weak.slice(0, 1);
  rec.weaknesses = weak;
  const carry = (list, oldList, id, extra) => {
    const out = [...(list || [])], seen = new Set(out.map(id));
    for (const it of oldList || []) {
      if (!it || typeof it !== 'object' || seen.has(id(it))) continue;
      seen.add(id(it));
      out.push({ ...it, ...extra, ...(Number.isInteger(it.source) && idx.has(it.source) ? { source: idx.get(it.source) } : {}) });
    }
    return out;
  };
  const dep = { depiction: earlier.title };
  const feats = carry(rec.feats, old.feats, (f) => key(f.claim), dep); if (feats.length) rec.feats = feats;
  const results = carry(rec.notableResults, old.notableResults, (r) => key(r.opponent) + '|' + key(r.citation), dep); if (results.length) rec.notableResults = results;
  const cond = carry(rec.conditional, old.conditional, (c) => key(c.ability), dep); if (cond.length) rec.conditional = cond;
  const tags = carry(rec.campaignTags, old.campaignTags, (t) => t.tag, {}); if (tags.length) rec.campaignTags = tags;
  if (typeof old.summary === 'string' && old.summary.trim().length >= 12 && old.summary !== rec.summary) rec.earlierSummary = old.summary;
  if (!rec.formDifferences && old.formDifferences) rec.formDifferences = old.formDifferences;
  for (const [k, v] of Object.entries(old)) if (!(k in rec) && !['reviewedBy', 'reviewNotes', 'researchStatus'].includes(k)) rec[k] = v;
  rec.unknowns = [...(rec.unknowns || []), ...(old.unknowns || []).filter((u) => !(rec.unknowns || []).includes(u) && u !== EXPAND_NOTE), EXPAND_NOTE];
  rec.researchStatus = 'provisional';
  return rec;
}
function mergeExpanded(batch, expanded) {
  const byId = new Map(expanded.map((r) => [r.id, r]));
  const done = [];
  const characters = batch.characters.map((old) => {
    const nu = byId.get(old.id);
    if (!nu || nu.depictionScope !== 'all' || !Array.isArray(nu.depictions) || !nu.depictions.length || !Array.isArray(nu.sources) || !nu.sources.length) return old;
    done.push(old.id);
    return carryOver(old, nu);
  });
  return { batch: { ...batch, characters }, done };
}

async function refine(argv) {
  const size = Number(argValue(argv, '--batch-size', '5'));
  const budgetMs = Number(argValue(argv, '--budget-minutes', '25')) * 60000;
  const model = process.env.GEMINI_MODEL || worker.DEFAULT_MODEL;
  const started = Date.now();
  const baseSha = JSON.parse(gh(['api', '/repos/' + REPO + '/git/ref/heads/' + encodeURIComponent(BASE)])).object.sha;
  const audit = state(argv);
  if (audit.errors.length) throw Error('Research ledger has errors; fix before refining: ' + audit.errors.join('; '));
  let vision;
  try { vision = loadVision(argv); } catch (e) { say('Stopped: fatal: cannot read ' + VISION_PATH); process.exitCode = 1; return; }
  const system = worker.systemInstruction(vision.text);
  const tagList = audit.tags || [], tagSet = new Set(tagList), schema = worker.responseSchema(tagList);
  const skip = new Set(claimedIds(openResearchPRs()));
  let prs = 0, records = 0, calls = 0, stop = 'no needs-review records left', lastCall = 0;
  while (true) {
    if (Date.now() - started > budgetMs) { stop = 'time budget reached'; break; }
    const todo = [...audit.records].filter(([id, r]) => r.status === 'needs-review' && !skip.has(id));
    if (!todo.length) break;
    const file = todo[0][1].file; // one file per PR
    const ids = todo.filter(([, r]) => r.file === file).map(([id]) => id).slice(0, size);
    const path_ = 'research/option-c/batches/' + file;
    const meta = JSON.parse(gh(['api', '/repos/' + REPO + '/contents/' + encodeURI(path_) + '?ref=' + baseSha]));
    const batch = JSON.parse(Buffer.from(meta.content, 'base64').toString('utf8'));
    const old = batch.characters.filter((c) => ids.includes(c.id));
    const wait = 4500 - (Date.now() - lastCall);
    if (wait > 0) await sleep(wait);
    let raw;
    try { lastCall = Date.now(); calls++; raw = await worker.callGemini({ apiKey: process.env.GEMINI_API_KEY, model, system, schema, prompt: worker.buildRefinePrompt(old, { tags: tagList }) }); }
    catch (e) {
      if (e instanceof worker.QuotaError && e.daily) { stop = 'Gemini free-tier daily quota reached'; break; }
      if (e instanceof worker.QuotaError) { await sleep(Math.min(Math.max(e.retryMs, 10000), 120000)); ids.forEach((id) => skip.add(id)); continue; }
      if (e instanceof worker.FatalError) { stop = 'fatal: ' + e.message.slice(0, 200); break; }
      ids.forEach((id) => skip.add(id)); continue;
    }
    // Existing ids are 'known' by design here: refine edits in place and never adds an id.
    const out = await worker.normalize(raw, ids, { checkUrl: (u, id) => worker.checkSource(u, id), checkBatch: pipe.checkBatch, known: new Set(audit.ids), tags: tagSet, films: pipe.filmAnchorsFromContext(audit.context) });
    ids.forEach((id) => skip.add(id));
    const merged = mergeRefined(batch, out.characters);
    if (!merged.done.length) { say('Refine: no usable output for ' + ids.length + ' record(s) in ' + file); continue; }
    const errors = pipe.checkBatch(file, merged.batch, new Set(audit.ids), tagSet, pipe.filmAnchorsFromContext(audit.context));
    if (errors.length) { say('Refine: skipped invalid result for ' + file + ': ' + errors[0]); continue; }
    const branch = 'gemini/v2-refine/' + file.replace(/\.json$/, '') + '-' + Date.now().toString(36);
    restWrite('POST', '/repos/' + REPO + '/git/refs', { ref: 'refs/heads/' + branch, sha: baseSha });
    restWrite('PUT', '/repos/' + REPO + '/contents/' + path_, { message: 'research(option-c): refine ' + merged.done.length + ' needs-review record(s) in ' + file, branch, sha: meta.sha,
      content: Buffer.from(JSON.stringify(merged.batch, null, 2) + '\n').toString('base64') });
    restWrite('POST', '/repos/' + REPO + '/pulls', { base: BASE, head: branch, title: 'Gemini V2 refine: ' + merged.done.length + ' needs-review record(s) in ' + file,
      body: 'Automated in-place refinement of needs-review records (' + vision.ref + '). No new ids. Records become provisional; a reviewer other than the author must verify before `reviewed`.\n\n' +
        merged.done.map((id) => '- `' + id + '`').join('\n') + (out.flags.length ? '\n\n**Source check notes**\n' + out.flags.map((f) => '- ' + f).join('\n') : '') + '\n\nRelates to #101.' });
    prs++; records += merged.done.length;
  }
  say('Refine: ' + calls + ' Gemini call(s), ' + prs + ' PR(s), ' + records + ' record(s). Stopped: ' + stop + '.');
  if (stop.startsWith('fatal')) process.exitCode = 1;
}

/* ---------- reconcile ---------- */
function validatePR(pr, files, known, mergedRecords, tags, films) {
  const errors = [];
  const ids = new Set();
  for (const f of files) {
    let batch;
    try { batch = fileAt(f.filename, pr.head.sha); } catch (e) { errors.push(f.filename + ': unreadable or invalid JSON'); continue; }
    errors.push(...pipe.checkBatch(path.basename(f.filename), batch, known, tags, films));
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
      const v = validatePR(pr, files, known, audit.records, tags, pipe.filmAnchorsFromContext(audit.context));
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
  const context = audit.context || {};
  const films = pipe.filmAnchorsFromContext(context);
  // All-depictions scope (owner ruling 2026-11-20) for every pool it covers; NBA keeps the plain schema.
  const scopeOf = (ids) => (ids.length && pipe.inScope(ids[0]) ? 'all' : null);
  const schemaFor = (scope) => worker.responseSchema(tagList, { depictions: scope === 'all' });
  say('Instructions: ' + vision.ref + '; ' + tagList.length + ' campaign tags in vocabulary.');
  const skip = new Set([...claimedIds(openResearchPRs()), ...manualIds(manualIssue())]);
  const transient = new Set();
  const failures = new Map();
  let networkFailures = 0, calls = 0, prs = 0, records = 0, stop = 'queue empty', lastCall = 0, filmRetries = 0;
  const manual = [];

  while (true) {
    if (Date.now() - started > budgetMs) { stop = 'time budget reached'; break; }
    const next = pipe.nextBatch(audit, size, new Set([...skip, ...transient]));
    if (next.complete) break;
    const scope = scopeOf(next.ids);
    const wait = 4500 - (Date.now() - lastCall);
    if (wait > 0) await sleep(wait);
    let raw;
    try {
      lastCall = Date.now(); calls++;
      raw = await worker.callGemini({ apiKey: process.env.GEMINI_API_KEY, model, system, schema: schemaFor(scope), prompt: worker.buildPrompt(next.ids, { tags: tagList, context, scope }) });
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
    const out = await worker.normalize(raw, next.ids, { checkUrl: (u, id) => worker.checkSource(u, id), checkBatch: pipe.checkBatch, known: new Set(audit.ids), tags: tagSet, scope, films });
    if (!out.characters.length && out.flags.length && out.flags.every((f) => f.includes('unreachable'))) {
      // Every link unreachable looks like a runner network problem, not bad research: retry later.
      next.ids.forEach((id) => transient.add(id));
      if (++networkFailures >= 3) { stop = 'source checks unreachable 3 times in a row (network?)'; break; }
      continue;
    }
    networkFailures = 0;
    // A record that names the wrong film is a model mistake, not missing sources: retry it next tick
    // instead of parking it on the manual-research list.
    const filmMiss = (d) => /continuity must (name the roster film|say it is the film|give the year)/.test(d.why);
    out.dropped.forEach((d) => { if (filmMiss(d)) { transient.add(d.id); filmRetries++; } else { skip.add(d.id); manual.push(d); } });
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
    const errors = pipe.checkBatch(name + '.json', batch, new Set(audit.ids), tagSet, films);
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
  // Expansion: once no new identities are left, bring older records up to the all-depictions scope.
  let expanded = 0, expandPrs = 0;
  if (stop === 'queue empty') {
    stop = 'queue empty; every record expanded';
    while (true) {
      if (Date.now() - started > budgetMs) { stop = 'time budget reached while expanding'; break; }
      const exp = pipe.nextExpansion(audit, 20, new Set([...skip, ...transient]));
      if (exp.complete) break;
      exp.ids.forEach((id) => skip.add(id)); // attempted this tick, whatever happens
      const filePath = 'research/option-c/batches/' + exp.file;
      let meta, batch;
      try { meta = JSON.parse(gh(['api', '/repos/' + REPO + '/contents/' + encodeURI(filePath) + '?ref=' + baseSha])); batch = JSON.parse(Buffer.from(meta.content, 'base64').toString('utf8')); }
      catch (e) { say('Expand: cannot read ' + exp.file + '; skipped.'); continue; }
      const got = [];
      let halt = null;
      for (let i = 0; i < exp.ids.length; i += size) {
        const chunk = exp.ids.slice(i, i + size), old = batch.characters.filter((c) => chunk.includes(c.id));
        const wait = 4500 - (Date.now() - lastCall);
        if (wait > 0) await sleep(wait);
        let raw;
        try { lastCall = Date.now(); calls++; raw = await worker.callGemini({ apiKey: process.env.GEMINI_API_KEY, model, system, schema: schemaFor('all'), prompt: worker.buildExpandPrompt(old, { tags: tagList, context }) }); }
        catch (e) {
          if (e instanceof worker.QuotaError && e.daily) { halt = 'Gemini free-tier daily quota reached'; break; }
          if (e instanceof worker.QuotaError) { await sleep(Math.min(Math.max(e.retryMs, 10000), 120000)); continue; }
          if (e instanceof worker.FatalError) { halt = 'fatal: ' + e.message.slice(0, 200); break; }
          continue; // unparseable output: these ids wait for the next tick
        }
        const out = await worker.normalize(raw, chunk, { checkUrl: (u, id) => worker.checkSource(u, id), checkBatch: pipe.checkBatch, known: new Set(audit.ids), tags: tagSet, scope: 'all', films });
        got.push(...out.characters);
      }
      const merged = mergeExpanded(batch, got);
      if (merged.done.length) {
        const errors = pipe.checkBatch(exp.file, merged.batch, new Set(audit.ids), tagSet, films);
        if (errors.length) say('Expand: skipped invalid result for ' + exp.file + ': ' + errors[0]);
        else {
          const branch = 'gemini/v2-expand/' + exp.file.replace(/\.json$/, '') + '-' + Date.now().toString(36);
          restWrite('POST', '/repos/' + REPO + '/git/refs', { ref: 'refs/heads/' + branch, sha: baseSha });
          restWrite('PUT', '/repos/' + REPO + '/contents/' + filePath, { message: 'research(option-c): expand ' + merged.done.length + ' record(s) in ' + exp.file + ' to all depictions', branch, sha: meta.sha,
            content: Buffer.from(JSON.stringify(merged.batch, null, 2) + '\n').toString('base64') });
          restWrite('POST', '/repos/' + REPO + '/pulls', { base: BASE, head: branch, title: 'Gemini V2 expand: ' + merged.done.length + ' record(s) in ' + exp.file + ' (all depictions)',
            body: 'Automated in-place expansion to the all-depictions scope (owner ruling 2026-11-20: roster source, sequels and continuations, and any comic depiction, all counting equally; ' + vision.ref + '). No new ids. Earlier claims are carried over under an "earlier-record" depiction; records become provisional.\n\n' +
              merged.done.map((id) => '- `' + id + '`').join('\n') + '\n\nReview: check the new depictions and their cited support, then approve and add `v2-research-approved`. Relates to #101.' });
          expandPrs++; expanded += merged.done.length;
        }
      } else say('Expand: no usable output for ' + exp.ids.length + ' record(s) in ' + exp.file);
      if (halt) { stop = halt; break; }
    }
  }
  addManual(manual);
  const a = audit;
  const remaining = a.ids.filter((id) => !a.records.has(id) && !skip.has(id)).length;
  say('Generate: ' + calls + ' Gemini call(s), ' + prs + ' PR(s), ' + records + ' record(s), ' + manual.length + ' sent to manual research, ' + filmRetries + ' wrong-film record(s) left for retry; expanded ' + expanded + ' record(s) in ' + expandPrs + ' PR(s). Stopped: ' + stop + '.');
  say('Backlog: ' + a.ids.length + ' identities, ' + a.records.size + ' merged, ' + (a.ids.length - a.records.size - remaining) + ' in open PRs or manual list, ' + remaining + ' not yet started.');
  if (stop.startsWith('fatal')) process.exitCode = 1;
}

async function main(argv) {
  const cmd = argv[0];
  try {
    if (cmd === 'reconcile') reconcile(state(argv), { dry: argv.includes('--dry-run') });
    else if (cmd === 'generate') await generate(argv);
    else if (cmd === 'refine') await refine(argv);
    else throw Error('Usage: v2-research-tick.cjs reconcile [--dry-run] | generate | refine [--budget-minutes N] [--batch-size N]');
  } finally {
    if (process.env.GITHUB_STEP_SUMMARY && summary.length) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, '### ' + cmd + '\n' + summary.map((l) => '- ' + l).join('\n') + '\n');
  }
}
if (require.main === module) main(process.argv.slice(2)).catch((e) => { console.error(e.stack || e.message); process.exitCode = 1; });
module.exports = { mergeRefined, mergeExpanded, carryOver, EXPAND_NOTE, validatePR, claimedIds, state, loadVision };

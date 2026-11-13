/* Option C research ledger — read-only integration tests.
 * Proves the ledger reports evidence without changing any assessment number,
 * that it is empty/off by default, that ingestion is validated and fail-closed,
 * and that record statuses are reported as record-declared, never as verified
 * independent review. Runs the evaluator inside the real app harness.
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { loadApp, root } = require('./helpers/option-c-app-harness.cjs');
const L = require('../data/option-c/research-ledger.js');

const batchDir = path.join(root, 'research/option-c/batches');
const batches = fs.readdirSync(batchDir).filter(f => f.endsWith('.json')).sort().map(f => JSON.parse(fs.readFileSync(path.join(batchDir, f), 'utf8')));

/* A record that satisfies the canonical schema (tools/v2-research-pipeline.cjs). */
const rec = (id, researchStatus, extra = {}) => ({
  id, continuity: 'Test continuity for ledger fixtures', summary: 'Fixture record used only by the ledger tests.',
  offense: { domains: ['physical'] }, defense: { mechanisms: ['training'] }, weaknesses: ['Fixture weakness entry'],
  sources: [{ url: 'https://example.org/fixture', supports: 'Fixture source supporting the fixture claims.' }],
  ...(id.includes('|') ? { formDifferences: 'Fixture form differs from the base record.' } : {}),
  researchStatus, ...extra,
});
const batch = (batchId, characters) => ({ batchId, schemaVersion: 1, characters });
const FORGED = { reviewedBy: 'Independent Reviewer (forged)', reviewNotes: 'Claims to be verified against every source; nothing proves it.' };

const tmpDirs = [];
test.after(() => { for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true }); });
function tmpDir(files) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'oc-ledger-'));
  tmpDirs.push(d);
  for (const [name, body] of Object.entries(files)) fs.writeFileSync(path.join(d, name), typeof body === 'string' ? body : JSON.stringify(body));
  return d;
}

test('ledger indexes by exact identity, never falls back from a form to its base, and keeps unknowns', () => {
  const lg = L.createLedger();
  assert.equal(lg.register(batch('ledger test batch b1', [
    rec('dc:Batman', 'provisional', { unknowns: ['Removed unsupported claim: x'] }),
    rec('dc:Batman|Hellbat Armor Batman', 'needs-review'),
  ])), 2);
  assert.equal(lg.lookup('dc:Batman').status, 'provisional');
  assert.equal(lg.lookup('dc:Batman').statusBasis, 'record-declared');
  assert.deepEqual(lg.lookup('dc:Batman').unknowns, ['Removed unsupported claim: x']);
  assert.equal(lg.lookup('dc:Batman|Hellbat Armor Batman').status, 'needs-review');
  assert.equal(lg.lookup('dc:Batman|Dark Knight Returns').status, 'none', 'an unlisted form does not inherit the base record');
  assert.equal(lg.lookup('dc:Superman').status, 'none');
  assert.match(lg.lookup('dc:Superman').note, /unknown, not absent/);
  assert.throws(() => { lg.lookup('dc:Batman').record.researchStatus = 'reviewed'; }, TypeError, 'stored records are frozen');
});

test('invented ids, missing evidence and invalid statuses reject the WHOLE batch (no partial registration)', () => {
  const cases = {
    'invented id': rec('dc:Not A Real Roster Hero', 'provisional'),
    'invented form': rec('dc:Batman|Invented Form', 'provisional'),
    'missing sources': rec('dc:Joker', 'provisional', { sources: [] }),
    'source without a claim': rec('dc:Joker', 'provisional', { sources: [{ url: 'https://example.org/x', supports: 'https://example.org/x' }] }),
    'missing weaknesses/defense': rec('dc:Joker', 'provisional', { weaknesses: [], defense: {} }),
    'bogus status': rec('dc:Joker', 'bogus'),
    'evidence points at no source': rec('dc:Joker', 'provisional', { feats: [{ claim: 'x', source: 3 }] }),
    'tag outside vocabulary': rec('dc:Joker', 'provisional', { campaignTags: [{ tag: 'omnipotence', claim: 'Fixture claim text here.', source: 0 }] }),
  };
  for (const [name, bad] of Object.entries(cases)) {
    const lg = L.createLedger();
    const input = batch('ledger negative ' + name, [rec('dc:Batman', 'provisional'), bad]);
    const before = JSON.stringify(input);
    assert.equal(lg.register(input), 0, name + ' must be rejected');
    assert.equal(JSON.stringify(input), before, 'input is not mutated');
    assert.equal(lg.size(), 0, name + ': the valid sibling record is not registered either');
    assert.equal(lg.rejected().length, 1, name + ': diagnostics are visible');
    assert.ok(lg.rejected()[0].reasons.length > 0);
  }
});

test('a forged "reviewed" record is reported as record-declared, never as independently reviewed', () => {
  const thin = L.createLedger();
  assert.equal(thin.register(batch('ledger forged thin', [rec('dc:Joker', 'reviewed', { reviewedBy: 'x', reviewNotes: 'y' })])), 0, 'reviewed with empty-looking metadata fails the canonical schema');
  assert.equal(thin.register(batch('ledger forged none', [rec('dc:Joker', 'reviewed')])), 0, 'reviewed without reviewer metadata fails');

  const lg = L.createLedger();
  assert.equal(lg.register(batch('ledger forged plausible', [rec('dc:Joker', 'reviewed', FORGED)])), 1, 'schema-valid, so it is indexed');
  const v = lg.lookup('dc:Joker');
  assert.equal(v.status, 'reviewed');
  assert.equal(v.statusBasis, 'record-declared');
  assert.doesNotMatch(v.note, /independently reviewed/i);
  assert.match(v.note, /record-declared/i);
  assert.match(v.note, /no GitHub approval or merge provenance/);
  const cov = lg.coverage(['dc:Joker']);
  assert.equal(cov.declaredReviewed, 1);
  assert.equal(cov.statusBasis, 'record-declared');
  assert.equal('reviewed' in cov, false, 'coverage never reports a verified "reviewed" count');
});

test('no validator means nothing is registered (fail-closed), and a validator cannot be swapped', () => {
  const lg = L.createLedger({ validate: false });
  assert.equal(lg.hasValidator(), false);
  assert.equal(lg.register(batch('ledger unvalidated', [rec('dc:Batman', 'provisional')])), 0);
  assert.equal(lg.size(), 0);
  assert.match(lg.rejected()[0].reasons[0], /fail-closed/);
  lg.configure({ validate: L.canonicalValidator() });
  assert.throws(() => lg.configure({ validate: () => [] }), /already configured/);
  assert.equal(lg.register(batch('ledger validated', [rec('dc:Batman', 'provisional')])), 1);
  const thrower = L.createLedger({ validate: () => { throw new Error('boom'); } });
  assert.equal(thrower.register(batch('ledger thrower', [rec('dc:Batman', 'provisional')])), 0, 'a throwing validator rejects, it does not pass');
});

test('duplicate identities are refused, never resolved by first-wins', () => {
  const lg = L.createLedger();
  assert.equal(lg.register(batch('ledger dup within', [rec('dc:Batman', 'provisional'), rec('dc:Batman', 'needs-review')])), 0, 'within-batch duplicate');
  assert.equal(lg.size(), 0);
  assert.equal(lg.register(batch('ledger first', [rec('dc:Batman', 'provisional')])), 1);
  assert.equal(lg.register(batch('ledger second', [rec('dc:Joker', 'provisional'), rec('dc:Batman', 'reviewed', FORGED)])), 0, 'cross-batch duplicate rejects the whole second batch');
  assert.equal(lg.lookup('dc:Joker').status, 'none');
  assert.equal(lg.lookup('dc:Batman').status, 'provisional');
  assert.equal(lg.conflicts().length, 2);
});

test('loadDir is fail-closed: malformed, invalid or duplicate files throw and register nothing', () => {
  const good = batch('ledger dir good', [rec('dc:Batman', 'provisional')]);
  const scenarios = {
    malformed: { 'a.json': good, 'b.json': '{ not json' },
    invalid: { 'a.json': good, 'b.json': batch('ledger dir invalid', [rec('dc:Invented Hero', 'provisional')]) },
    duplicate: { 'a.json': good, 'b.json': batch('ledger dir dup', [rec('dc:Batman', 'needs-review')]) },
  };
  for (const [name, files] of Object.entries(scenarios)) {
    const lg = L.createLedger();
    let err;
    try { lg.loadDir(tmpDir(files)); } catch (e) { err = e; }
    assert.ok(err, name + ' must throw');
    assert.match(err.message, /nothing registered/);
    assert.equal(lg.size(), 0, name + ': nothing registered');
    const diag = err.diagnostics;
    assert.equal(diag.rejected.length + diag.conflicts.length > 0, true, name + ': diagnostics returned to the caller');
    assert.deepEqual(lg.rejected().concat(lg.conflicts()).length, diag.rejected.length + diag.conflicts.length);
  }
  const lg = L.createLedger();
  assert.equal(lg.loadDir(tmpDir({ 'a.json': good, 'b.json': batch('ledger dir other', [rec('dc:Joker', 'provisional')]) })), 2);
});

test('every checked-in research batch passes canonical ingestion with no rejection or duplicate', () => {
  const lg = L.createLedger();
  const n = lg.loadDir(batchDir);
  assert.ok(n > 0, 'batches present');
  assert.deepEqual(lg.rejected(), []);
  assert.deepEqual(lg.conflicts(), []);
  assert.equal(lg.size(), n);
});

test('default ledger is empty: assessments report no research coverage and profiles say "none"', () => {
  const app = loadApp();
  const out = JSON.parse(app.run(`JSON.stringify((() => {
    const A = ocTeam('brawl', { d1: ['dc', 'Batman'] }, 'dc'), B = ocTeam('brawl', { bn: ['mcu', 'Scarlet Witch'] }, 'mcu');
    const r = DA_OPTION_C.evaluateMatchup({ sportKey: 'brawl', teamA: A, teamB: B });
    const L = DA_OPTION_C_MODULES.researchLedger.shared;
    return { size: L.size(), validator: L.hasValidator(), cov: r.researchCoverage, p: DA_OPTION_C.getProfileById('dc:Batman').research.status };
  })())`));
  assert.equal(out.size, 0);
  assert.equal(out.validator, false, 'the page has no validator, so it cannot register research by accident');
  assert.equal(out.cov, null);
  assert.equal(out.p, 'none');
});

/* Give the page's shared ledger the canonical validator (the page has none of its own). */
function appWithValidator() {
  const app = loadApp();
  app.sandbox.__ocValidate = L.canonicalValidator();
  app.run('DA_OPTION_C_MODULES.researchLedger.shared.configure({ validate: __ocValidate }); delete globalThis.__ocValidate;');
  return app;
}

test('loading all research changes no probability, ledger, interaction or explanation (shadow parity)', () => {
  const app = appWithValidator();
  const probe = `JSON.stringify((() => {
    const strip = o => JSON.parse(JSON.stringify(o, (k, v) => (k === 'research' || k === 'researchCoverage') ? undefined : v));
    const cases = [
      ['brawl', ocTeam('brawl', { d1: ['dc', 'Darkseid'], d2: ['toons', 'Bugs Bunny'], cmd: ['mcu', 'Nick Fury'] }, 'dc'), ocTeam('brawl', { d1: ['dc', 'Batman', 'Hellbat Armor Batman'], bn: ['muppets', 'Kermit the Frog'], d3: ['mcu', 'Scarlet Witch'] }, 'mcu')],
      ['basketball', ocTeam('basketball', { c: ['dc', 'Superman'], sg: ['mcu', 'Scarlet Witch'] }, 'nba'), ocTeam('basketball', { pg: ['muppets', 'Kermit the Frog'] }, 'mcu')],
      ['volleyball', ocTeam('volleyball', { lib: ['mcu', 'Spider-Man'] }, 'nba'), ocTeam('volleyball', { s: ['mcu', 'Doctor Strange'] }, 'dc')],
    ];
    return cases.map(([sportKey, A, B]) => strip(DA_OPTION_C.evaluateMatchup({ sportKey, teamA: A, teamB: B, teamNames: ['Home', 'Away'] })));
  })())`;
  const before = app.run(probe);
  const added = batches.map(b => app.run('DA_OPTION_C_MODULES.researchLedger.shared.register(' + JSON.stringify(b) + ')'));
  assert.equal(added.reduce((a, b) => a + b, 0), batches.reduce((a, b) => a + b.characters.length, 0), 'every checked-in record registered through the validator');
  const after = app.run(probe);
  assert.equal(after, before, 'assessments are byte-identical apart from the report-only research fields');
  const cov = JSON.parse(app.run(`JSON.stringify(DA_OPTION_C.evaluateMatchup({ sportKey: 'brawl', teamA: ocTeam('brawl', { d1: ['dc', 'Darkseid'] }, 'dc'), teamB: ocTeam('brawl', { d1: ['dc', 'Batman'] }, 'dc') }).researchCoverage)`));
  assert.ok(cov && cov.identities > 0 && cov.declaredReviewed === 0 && cov.statusBasis === 'record-declared', 'present, and nothing is reported as reviewed');
});

test('researchCoverage counts every evaluated identity exactly once; base and form never collide', () => {
  const app = appWithValidator();
  const fixture = batch('ledger coverage fixture', [
    rec('dc:Batman', 'provisional', { unknowns: ['Fixture unknown'] }),
    rec('dc:Batman|Hellbat Armor Batman', 'needs-review'),
    rec('dc:Joker', 'reviewed', FORGED),
  ]);
  assert.equal(app.run('DA_OPTION_C_MODULES.researchLedger.shared.register(' + JSON.stringify(fixture) + ')'), 3);
  const out = JSON.parse(app.run(`JSON.stringify((() => {
    // Base Batman on A, the Hellbat form on B, and Joker on BOTH teams (mirror identity).
    const A = ocTeam('brawl', { d1: ['dc', 'Batman'], d2: ['dc', 'Joker'] }, 'dc');
    const B = ocTeam('brawl', { d1: ['dc', 'Batman', 'Hellbat Armor Batman'], d2: ['dc', 'Joker'] }, 'mcu');
    const keys = [A, B].flatMap(t => t.rows.filter(r => r && r.cand && r.pos).map(r => DA_OPTION_C.getProfile(r.cand).key));
    const L = DA_OPTION_C_MODULES.researchLedger.shared;
    return { keys, cov: DA_OPTION_C.evaluateMatchup({ sportKey: 'brawl', teamA: A, teamB: B }).researchCoverage,
      statuses: Object.fromEntries([...new Set(keys)].map(k => [k, L.lookup(k).status])) };
  })())`));
  const distinct = new Set(out.keys);
  assert.ok(distinct.has('dc:Batman') && distinct.has('dc:Batman|Hellbat Armor Batman'), 'base and form are separate identities');
  assert.ok(out.keys.length > distinct.size, 'fixture really contains a repeated identity');
  const c = out.cov;
  assert.equal(c.identities, distinct.size, 'each distinct evaluated identity counted once');
  assert.equal(c.declaredReviewed + c.provisional + c.needsReview + c.unknown + c.none, c.identities, 'buckets partition the identities');
  assert.equal(c.declaredReviewed, 1, 'Joker once, despite appearing on both teams');
  assert.equal(c.provisional, 1, 'base Batman');
  assert.equal(c.needsReview, 1, 'Hellbat form keeps its own status, not the base record');
  assert.equal(c.none, distinct.size - 3, 'every unresearched identity is counted as none');
  assert.equal(c.withUnknowns, 1);
  assert.equal(out.statuses['dc:Batman|Hellbat Armor Batman'], 'needs-review');
});

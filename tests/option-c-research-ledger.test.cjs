/* Option C research ledger — read-only integration tests.
 * Proves the ledger reports evidence without changing any assessment number,
 * that it is empty/off by default, and that unreviewed research is never
 * presented as reviewed. Runs the evaluator inside the real app harness.
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp, root } = require('./helpers/option-c-app-harness.cjs');
const L = require('../data/option-c/research-ledger.js');

const batchDir = path.join(root, 'research/option-c/batches');
const batches = fs.readdirSync(batchDir).filter(f => f.endsWith('.json')).sort().map(f => JSON.parse(fs.readFileSync(path.join(batchDir, f), 'utf8')));
const rec = (id, researchStatus, extra = {}) => ({ id, researchStatus, ...extra });

test('ledger indexes by exact identity, never falls back from a form to its base, and keeps unknowns', () => {
  const lg = L.createLedger();
  lg.register({ batchId: 'b1', characters: [
    rec('dc:Batman', 'provisional', { unknowns: ['Removed unsupported claim: x'] }),
    rec('dc:Batman|Hellbat Armor Batman', 'needs-review'),
  ] });
  assert.equal(lg.lookup('dc:Batman').status, 'provisional');
  assert.deepEqual(lg.lookup('dc:Batman').unknowns, ['Removed unsupported claim: x']);
  assert.equal(lg.lookup('dc:Batman|Hellbat Armor Batman').status, 'needs-review');
  assert.equal(lg.lookup('dc:Batman|Dark Knight Returns').status, 'none', 'an unlisted form does not inherit the base record');
  assert.equal(lg.lookup('dc:Superman').status, 'none');
  assert.match(lg.lookup('dc:Superman').note, /unknown, not absent/);
});

test('invalid, unreviewed-"reviewed" and duplicate records are rejected or reported, never silently merged', () => {
  const lg = L.createLedger();
  const input = { batchId: 'b', characters: [rec('dc:A', 'reviewed'), rec('dc:B', 'bogus'), rec('noid', 'provisional'), rec('dc:C', 'provisional'), rec('dc:C', 'reviewed', { reviewedBy: 'x', reviewNotes: 'y' })] };
  const before = JSON.stringify(input);
  assert.equal(lg.register(input), 1);
  assert.equal(JSON.stringify(input), before, 'input is not mutated');
  assert.equal(lg.rejected().length, 3);
  assert.equal(lg.conflicts().length, 1);
  assert.equal(lg.lookup('dc:C').status, 'provisional', 'first registered record is kept');
  assert.throws(() => { lg.lookup('dc:C').record.researchStatus = 'reviewed'; }, TypeError, 'stored records are frozen');
});

test('coverage counts statuses without upgrading provisional work', () => {
  const lg = L.createLedger();
  lg.register({ batchId: 'b', characters: [rec('dc:A', 'provisional', { unknowns: ['u'] }), rec('dc:B', 'needs-review'), rec('dc:D', 'reviewed', { reviewedBy: 'r', reviewNotes: 'n' })] });
  assert.deepEqual(lg.coverage(['dc:A', 'dc:B', 'dc:D', 'dc:Z', 'dc:A']), { identities: 4, reviewed: 1, provisional: 1, needsReview: 1, none: 1, withUnknowns: 1 });
});

test('every checked-in research batch loads with no rejection or duplicate conflict', () => {
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
    return { size: DA_OPTION_C_MODULES.researchLedger.shared.size(), cov: r.researchCoverage, p: DA_OPTION_C.getProfileById('dc:Batman').research.status };
  })())`));
  assert.equal(out.size, 0);
  assert.equal(out.cov, null);
  assert.equal(out.p, 'none');
});

test('loading all research changes no probability, ledger, interaction or explanation (shadow parity)', () => {
  const app = loadApp();
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
  assert.ok(added.some(n => n > 0), 'research was actually loaded');
  const after = app.run(probe);
  assert.equal(after, before, 'assessments are byte-identical apart from the report-only research fields');
  const cov = JSON.parse(app.run(`JSON.stringify(DA_OPTION_C.evaluateMatchup({ sportKey: 'brawl', teamA: ocTeam('brawl', { d1: ['dc', 'Darkseid'] }, 'dc'), teamB: ocTeam('brawl', { d1: ['dc', 'Batman'] }, 'dc') }).researchCoverage)`));
  assert.ok(cov && cov.identities > 0 && cov.reviewed === 0, 'present, and nothing is reported as reviewed');
});

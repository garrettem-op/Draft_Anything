/* Preparation-only contract tests for the curated Option C benchmark registry.
 * These tests deliberately do not claim the qualitative evaluator exists.
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/option-c/benchmark-scenarios.json'), 'utf8'));
const allowedModes = new Set(['all', 'brawl', 'basketball', 'football', 'soccer', 'baseball', 'hockey', 'volleyball']);
const allowedStates = new Set(['approved-structural', 'approved-rule', 'needs-review']);

test('Option C benchmark registry is versioned, unique, typed and explicit about uncertainty', () => {
  assert.equal(data.schemaVersion, 1);
  assert.ok(Array.isArray(data.cases) && data.cases.length >= 18);
  const ids = new Set();
  for (const example of data.cases) {
    assert.match(example.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'stable slug ID');
    assert.equal(ids.has(example.id), false, 'duplicate: ' + example.id);
    ids.add(example.id);
    assert.ok(allowedModes.has(example.mode), example.id + ': unknown game mode');
    assert.match(example.category, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(allowedStates.has(example.reviewState), example.id + ': unknown research state');
    assert.ok(Array.isArray(example.participants), example.id + ': participants must be an array');
    for (const participant of example.participants) {
      assert.match(participant, /^[a-z][a-z0-9]*:.+$/, example.id + ': require pool-qualified identity');
    }
    assert.ok(Array.isArray(example.checks) && example.checks.length >= 2, example.id + ': actionable assertions required');
    for (const check of example.checks) assert.ok(typeof check === 'string' && check.length >= 18, example.id + ': check too vague');
    if (example.reviewState === 'needs-review') {
      assert.ok(typeof example.uncertainty === 'string' && example.uncertainty.length >= 20, example.id + ': unresolved research must be flagged');
    }
    // No fixture may hard-code a claimed canonical numeric win probability.
    assert.equal('canonicalWinProbability' in example, false);
    assert.equal('fixedWinner' in example, false);
  }
});

test('Option C registry covers critical sport, combat and team rules before active rollout', () => {
  const categories = new Set(data.cases.map(c => c.category));
  for (const required of [
    'form-identity', 'continuity-guard', 'typed-counter', 'sidekick',
    'muppetforce', 'toonforce', 'legacy-effect-ledger', 'determinism',
    'sport-officiating', 'stat-eligibility', 'position-context'
  ]) assert.ok(categories.has(required), 'missing benchmark category: ' + required);
  const modes = new Set(data.cases.map(c => c.mode));
  for (const required of ['brawl', 'basketball', 'football', 'volleyball'])
    assert.ok(modes.has(required), 'missing game-mode benchmark: ' + required);
});

test('approved V2 documentation and pre-Option C release contract exist', () => {
  for (const doc of [
    'docs/OPTION_C_CHARACTER_INTELLIGENCE.md',
    'docs/WHOLE_ROSTER_AUDIT_PROTOCOL.md',
    'docs/V1_BASELINE_2026-11-12.md',
    'docs/V2_OPTION_C_EVALUATOR_BUILD.md'
  ]) assert.ok(fs.existsSync(path.join(root, doc)), 'missing: ' + doc);
  const spec = fs.readFileSync(path.join(root, 'docs/V2_OPTION_C_EVALUATOR_BUILD.md'), 'utf8');
  assert.ok(spec.includes('develop/v2-option-c'));
  assert.ok(spec.includes('shadow'));
  assert.ok(spec.includes('22%'));
  assert.ok(spec.includes('8%'));
  assert.ok(spec.includes('No hidden rewrite'));
});

'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { mergeRefined } = require('../tools/v2-research-tick.cjs');
const worker = require('../tools/v2-gemini-worker.cjs');

const mk = (id, extra = {}) => ({ id, summary: 's', sources: [{ url: 'https://a.example/x', supports: 'y' }], unknowns: [], researchStatus: 'needs-review', ...extra });

test('mergeRefined replaces by id, never adds ids, keeps untouched records', () => {
  const batch = { batchId: 'b', characters: [mk('p:A', { unknowns: ['Flagged needs-review: x', 'Removed by review: t'] }), mk('p:B')] };
  const { batch: out, done } = mergeRefined(batch, [mk('p:A', { summary: 'new', researchStatus: 'provisional' }), mk('p:C')]);
  assert.deepStrictEqual(out.characters.map((c) => c.id), ['p:A', 'p:B']);
  assert.deepStrictEqual(done, ['p:A']);
  assert.strictEqual(out.characters[0].summary, 'new');
  assert.strictEqual(out.characters[0].researchStatus, 'provisional');
  assert.ok(out.characters[0].unknowns.includes('Removed by review: t'));
  assert.ok(!out.characters[0].unknowns.some((u) => /^Flagged needs-review/.test(u)));
  assert.strictEqual(out.characters[1], batch.characters[1]);
});

test('mergeRefined ignores output without sources', () => {
  const batch = { characters: [mk('p:A')] };
  const { done, batch: out } = mergeRefined(batch, [{ ...mk('p:A'), sources: [] }]);
  assert.deepStrictEqual(done, []);
  assert.strictEqual(out.characters[0], batch.characters[0]);
});

test('buildRefinePrompt carries removed claims as data and demands cited support', () => {
  const p = worker.buildRefinePrompt([mk('p:A', { unknowns: ['Removed by review (not supported): technique: Foo'] })]);
  assert.match(p, /"p:A"/);
  assert.match(p, /technique: Foo/);
  assert.match(p, /ONLY if a page you cite states it/);
  assert.match(p, /untrusted data/);
});

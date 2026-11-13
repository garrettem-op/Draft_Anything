'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const s = require('../tools/v2-source-support.cjs');

const html = (body) => `<html><head><style>.x{color:red}</style><script>var hidden='Venom';</script></head><body>${body}</body></html>`;
const res = (status, body, type = 'text/html; charset=utf-8') => ({ status, headers: { get: () => type }, text: async () => body });
const rec = (over = {}) => ({
  id: 'dc:Bane', continuity: 'Mainline DC', summary: 's', offense: { domains: ['physical'] }, defense: { mechanisms: ['x'] }, weaknesses: ['w'],
  sources: [{ url: 'https://ok.test/bane', supports: 'bio' }],
  feats: [
    { claim: 'Broke the back of Batman during the Knightfall storyline', citation: 'Batman #497', source: 0 },
    { claim: 'Lifted a continental plate using only sonic resonance', citation: '?', source: 0 },
  ],
  researchStatus: 'provisional', ...over,
});
const page = (text) => s.pageIndex(html(text));

test('key terms drop stopwords, short words and the character name', () => {
  assert.deepEqual(s.keyTerms('Bane broke the back of Batman during Knightfall', 'dc:Bane').sort(), ['back', 'batman', 'broke', 'during', 'knightfall'].filter((t) => t !== 'during').sort());
  assert.deepEqual(s.keyTerms('Is a god', 'x:Y'), []);
  assert.ok(s.keyTerms('Held 10000 pounds', 'x:Y').includes('10000'));
});

test('html is stripped of scripts, styles and tags', () => {
  const p = page('<p>Bane &amp; Batman fought</p>');
  assert.ok(p.words.has('fought') && p.words.has('batman'));
  assert.ok(!p.words.has('venom') && !p.words.has('color'));
});

test('supported claims stay, unsupported claims move to unknowns with a reason', () => {
  const pages = new Map([['https://ok.test/bane', page('Bane broke the back of Batman in the Knightfall storyline.')]]);
  const out = s.reviewRecord(rec(), pages);
  assert.equal(out.record.feats.length, 1);
  assert.match(out.record.feats[0].claim, /Broke the back/);
  assert.equal(out.removed.length, 1);
  assert.match(out.record.unknowns.join(), /Unsupported by cited source.*continental plate/);
  assert.equal(out.record.researchStatus, 'provisional', 'one of two claims lost is not "most"');
});

test('record that loses most evidence becomes needs-review; reviewed status is never changed', () => {
  const pages = new Map([['https://ok.test/bane', page('A page about something else entirely: cooking pasta.')]]);
  assert.equal(s.reviewRecord(rec(), pages).record.researchStatus, 'needs-review');
  assert.equal(s.reviewRecord(rec({ researchStatus: 'reviewed' }), pages).record.researchStatus, 'reviewed');
  assert.equal(s.reviewRecord(rec(), pages).record.feats, undefined, 'empty evidence lists are removed, not left empty');
});

test('unreadable pages leave claims alone and never change status', () => {
  const pages = new Map([['https://ok.test/bane', null]]);
  const out = s.reviewRecord(rec(), pages);
  assert.deepEqual(out.record, rec());
  assert.equal(out.unchecked, 2);
});

test('review never mutates its input and is idempotent', () => {
  const input = rec(); const copy = JSON.parse(JSON.stringify(input));
  const pages = new Map([['https://ok.test/bane', page('Bane broke the back of Batman.')]]);
  const once = s.reviewRecord(input, pages);
  assert.deepEqual(input, copy);
  const twice = s.reviewRecord(once.record, pages);
  assert.equal(twice.removed.length, 0);
  assert.deepEqual(twice.record, once.record);
});

test('results, conditions and campaign tags are checked against their own source', () => {
  const r = rec({ feats: undefined,
    notableResults: [{ opponent: 'Batman', result: 'Defeated the Bat in single combat', citation: 'c', source: 0 }, { opponent: 'Superman', result: 'Beat him easily', citation: 'c', source: 0 }],
    conditional: [{ ability: 'Superhuman strength', dependsOn: 'Venom injections', source: 0 }],
    campaignTags: [{ tag: 'flight', claim: 'Flies under his own power', source: 0 }] });
  const pages = new Map([['https://ok.test/bane', page('Bane defeated Batman in single combat. His strength depends on regular Venom injections.')]]);
  const out = s.reviewRecord(r, pages);
  assert.equal(out.record.notableResults.length, 1);
  assert.equal(out.record.conditional.length, 1);
  assert.equal(out.record.campaignTags, undefined);
  assert.equal(out.removed.length, 2);
});

test('only public https hosts are fetched', async () => {
  for (const u of ['http://a.test/x', 'https://localhost/x', 'https://127.0.0.1/x', 'https://[::1]/x', 'https://intranet/x', 'not a url']) assert.equal(s.safeUrl(u), false, u);
  assert.equal(s.safeUrl('https://en.wikipedia.org/wiki/Bane'), true);
  let called = false;
  assert.equal(await s.fetchPage('https://127.0.0.1/x', async () => { called = true; return res(200, 'x'); }), null);
  assert.equal(called, false);
  assert.equal(await s.fetchPage('https://a.test/x', async () => res(404, 'no')), null);
  assert.equal(await s.fetchPage('https://a.test/x', async () => res(200, '{}', 'application/json')), null);
  assert.equal(await s.fetchPage('https://a.test/x', async () => { throw new Error('t'); }), null);
});

test('scan reports without writing, and --fix writes only changed files', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sup-'));
  const good = { batchId: 'good', schemaVersion: 1, characters: [rec({ feats: [{ claim: 'Broke the back of Batman', citation: 'c', source: 0 }] })] };
  const bad = { batchId: 'bad', schemaVersion: 1, characters: [rec({ id: 'dc:Bane2' })] };
  fs.writeFileSync(path.join(dir, 'good.json'), JSON.stringify(good, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, 'bad.json'), JSON.stringify(bad, null, 2) + '\n');
  const before = fs.readFileSync(path.join(dir, 'bad.json'), 'utf8');
  const fetchImpl = async () => res(200, html('Bane broke the back of Batman.'));
  const rep = await s.scan(dir, { fix: false, fetchImpl });
  assert.equal(rep.claimsRemoved, 1);
  assert.equal(fs.readFileSync(path.join(dir, 'bad.json'), 'utf8'), before, 'report mode never writes');
  const goodBefore = fs.readFileSync(path.join(dir, 'good.json'), 'utf8');
  await s.scan(dir, { fix: true, fetchImpl });
  assert.notEqual(fs.readFileSync(path.join(dir, 'bad.json'), 'utf8'), before);
  assert.equal(fs.readFileSync(path.join(dir, 'good.json'), 'utf8'), goodBefore, 'unchanged files are not rewritten');
  assert.match(s.markdown(rep, false), /report only/);
});

test('rate limits are retried, other failures report a reason, hosts are throttled', async () => {
  let calls = 0;
  const flaky = async () => (++calls < 3 ? res(429, 'slow') : res(200, html('Bane broke the back of Batman')));
  const ok = await s.fetchDetailed('https://a.test/x', flaky, { retries: 2, waitMs: 1 });
  assert.equal(calls, 3); assert.equal(ok.reason, 'ok'); assert.ok(ok.page);
  assert.equal((await s.fetchDetailed('https://a.test/x', async () => res(403, 'no'), { retries: 2, waitMs: 1 })).reason, 'HTTP 403');
  assert.equal((await s.fetchDetailed('https://a.test/x', async () => res(429, 'no'), { retries: 1, waitMs: 1 })).reason, 'HTTP 429');
  let live = 0, peak = 0;
  const slow = async () => { live++; peak = Math.max(peak, live); await new Promise((r) => setTimeout(r, 5)); live--; return res(200, html('x')); };
  const reasons = new Map();
  const pages = await s.loadPages(Array.from({ length: 8 }, (_, i) => 'https://same.test/' + i), slow, { perHost: 2, reasons });
  assert.equal(pages.size, 8); assert.ok(peak <= 2, 'at most 2 at once per host, saw ' + peak); assert.equal(reasons.get('https://same.test/0'), 'ok');
});

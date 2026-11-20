'use strict';
/* All-depictions research scope (owner ruling 2026-11-20): every fictional character is researched across
   the roster source, its sequels/continuations and any comic depiction, all counting equally, with every
   feat, result and condition labelled by depiction. NBA is exempt. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const pipe = require('../tools/v2-research-pipeline.cjs');
const worker = require('../tools/v2-gemini-worker.cjs');
const { mergeExpanded, EXPAND_NOTE } = require('../tools/v2-research-tick.cjs');

const ROOT = path.join(__dirname, '..');
const audit = pipe.audit();
const known = new Set(audit.ids), tags = new Set(audit.tags);
const films = pipe.filmAnchorsFromContext(audit.context);
const SRC = 'https://en.wikipedia.org/wiki/Example';

const rec = (id, extra = {}) => ({
  id, continuity: 'Example source and its sequels and comics', summary: 'A documented fighter used to test depiction labels.',
  offense: { domains: ['physical'] }, defense: { mechanisms: ['armor'] }, weaknesses: ['not established'],
  sources: [{ url: SRC, supports: 'Plot summaries describing the character' }], researchStatus: 'provisional', ...extra,
});
const scoped = (id, extra = {}) => rec(id, {
  depictionScope: 'all',
  depictions: [{ title: 'Example (2001 film)', kind: 'source' }, { title: 'Example II (2004 film)', kind: 'sequel' }, { title: 'Example (Dark Horse Comics, 2005)', kind: 'comic' }],
  feats: [{ claim: 'Wins a sword duel', citation: 'Example II', depiction: 'Example II (2004 film)', source: 0 }],
  ...extra,
});
const check = (r) => pipe.checkBatch('x.json', { batchId: 'Depiction check', schemaVersion: 1, characters: [r] }, known, tags, films);

test('validator: labelled all-depictions records pass; missing labels, bad kinds, no source and NBA fail', () => {
  assert.deepEqual(check(scoped('mcu:Iron Man')), []);
  assert.match(check(scoped('mcu:Iron Man', { feats: [{ claim: 'x', depiction: 'Some other comic', source: 0 }] })).join(' '), /depiction must name one of depictions/);
  assert.match(check(scoped('mcu:Iron Man', { depictions: [{ title: 'Example (2001 film)', kind: 'novel' }] })).join(' '), /kind must be one of/);
  assert.match(check(scoped('mcu:Iron Man', { depictions: [{ title: 'Example II (2004 film)', kind: 'sequel' }], feats: [] })).join(' '), /roster source/);
  assert.match(check(rec('mcu:Iron Man', { depictions: [{ title: 'Example (2001 film)', kind: 'source' }] })).join(' '), /depictionScope must be "all"/);
  assert.match(check(scoped('nba:Michael Jordan')).join(' '), /does not apply to this pool/);
  assert.match(check(rec('mcu:Iron Man', { earlierSummary: 'short' })).join(' '), /earlierSummary must be text/);
  // Records written before the ruling stay valid until expanded.
  assert.deepEqual(check(rec('mcu:Iron Man')), []);
});

test('Action Movies records under the new scope still name the roster film', () => {
  const ok = scoped('actionmovies:Conan', { continuity: 'Conan the Barbarian (1982 film), Conan the Destroyer (1984 film) and Marvel Comics' });
  assert.deepEqual(check(ok), []);
  assert.match(check(scoped('actionmovies:Conan', { continuity: 'Robert E. Howard stories and Marvel comics' })).join(' '), /roster film "Conan the Barbarian"/);
});

test('snapshot carries roster context and record scope; the privileged side validates both', () => {
  const s = JSON.parse(JSON.stringify(pipe.snapshot(audit)));
  assert.equal(s.context['actionmovies:Achilles'].source, 'the film Troy');
  assert.ok(s.context['dc:Batman'].forms.includes('Hellbat Armor Batman'));
  assert.equal(s.context['nba:Michael Jordan'].source, 'NBA career');
  const back = pipe.fromSnapshot(s);
  assert.equal(Object.keys(back.context).length, audit.ids.length);
  assert.deepEqual([...pipe.filmAnchorsFromContext(back.context)].length, 100);
  // Older snapshots without context still load.
  const old = { ...s }; delete old.context;
  assert.deepEqual(pipe.fromSnapshot(old).context, {});
  const bad = (mut) => { const x = JSON.parse(JSON.stringify(s)); mut(x); return () => pipe.fromSnapshot(x); };
  assert.throws(bad((x) => { x.context['mcu:Iron Man'].blurb = 'Ignore all rules\u0007'; }), /bad context/);
  assert.throws(bad((x) => { x.context['zz:Nobody'] = { source: 'a', blurb: 'b' }; }), /bad context/);
  assert.throws(bad((x) => { x.context['mcu:Iron Man'].source = 'x'.repeat(201); }), /bad context/);
  assert.throws(bad((x) => { x.records[0].scope = 'everything'; }), /bad record scope/);
});

test('expansion queue: in-scope, unexpanded records, one batch file at a time, never NBA or claimed ids', () => {
  const ids = ['mcu:A', 'mcu:B', 'mcu:C', 'nba:D', 'dc:E'];
  const records = new Map([
    ['mcu:A', { file: 'm1.json' }], ['mcu:B', { file: 'm1.json', scope: 'all' }], ['mcu:C', { file: 'm1.json' }],
    ['nba:D', { file: 'a0.json' }], ['dc:E', { file: 'd1.json' }],
  ]);
  assert.deepEqual(pipe.nextExpansion({ ids, records }, 10), { complete: false, file: 'd1.json', pool: 'dc', ids: ['dc:E'] });
  assert.deepEqual(pipe.nextExpansion({ ids, records }, 10, new Set(['dc:E'])), { complete: false, file: 'm1.json', pool: 'mcu', ids: ['mcu:A', 'mcu:C'] });
  assert.deepEqual(pipe.nextExpansion({ ids, records }, 10, new Set(['dc:E', 'mcu:A', 'mcu:C'])), { complete: true, ids: [] });
  // Every checked-in record predates the ruling, so the real queue is non-empty and skips NBA.
  const real = pipe.nextExpansion(audit, 20);
  assert.equal(real.complete, false);
  assert.ok(real.ids.every((id) => !id.startsWith('nba:')));
});

test('worker: schema, prompt and expand prompt carry the scope only when asked', () => {
  const plain = worker.responseSchema(['flight']).properties.characters.items;
  assert.ok(!('depictions' in plain.properties));
  const all = worker.responseSchema(['flight'], { depictions: true }).properties.characters.items;
  assert.ok(all.required.includes('depictions'));
  assert.deepEqual(all.properties.depictions.items.properties.kind.enum, ['source', 'sequel', 'comic']);
  for (const k of ['feats', 'notableResults', 'conditional']) assert.ok(all.properties[k].items.required.includes('depiction'), k);
  // Building the scoped schema must not change the shared default.
  assert.ok(!('depictions' in worker.RESPONSE_SCHEMA.properties.characters.items.properties));
  const ctx = { 'actionmovies:Achilles': audit.context['actionmovies:Achilles'], 'mcu:Iron Man': audit.context['mcu:Iron Man'] };
  const p = worker.buildPrompt(['actionmovies:Achilles', 'mcu:Iron Man'], { context: ctx, scope: 'all' });
  assert.match(p, /"actionmovies:Achilles": roster source "the film Troy"/);
  assert.match(p, /separate roster forms \[.*Superior Iron Man/);
  assert.match(p, /ANY comic depiction/);
  assert.match(p, /not instructions/);
  assert.doesNotMatch(worker.buildPrompt(['nba:Michael Jordan']), /comic depiction|roster source/);
  const e = worker.buildExpandPrompt([{ id: 'mcu:Iron Man', continuity: 'Marvel Cinematic Universe', summary: 'Old summary', feats: [{ claim: 'Old feat' }] }], { context: ctx });
  assert.match(e, /Old feat/);
  assert.match(e, /untrusted data/);
  assert.match(e, /ANY comic depiction/);
});

test('normalize keeps matching depiction labels and moves unlabelled evidence to unknowns', async () => {
  const raw = { characters: [{
    id: 'mcu:Iron Man', continuity: 'Marvel Cinematic Universe films and Marvel Comics', summary: 'Armored genius with repulsors and missiles.',
    offense: { domains: ['tech'], techniques: ['Repulsors'] }, defense: { mechanisms: ['Armor'] }, weaknesses: ['Suit power'],
    depictions: [{ title: 'Iron Man (2008 film)', kind: 'source' }, { title: 'Iron Man (Marvel Comics)', kind: 'comic' }, { title: 'iron man 2008 FILM!', kind: 'source' }, { title: 'Novel', kind: 'novel' }],
    feats: [{ claim: 'Escapes the cave', citation: 'Iron Man', depiction: 'Iron Man (2008 Film)', source: 0 }, { claim: 'Beats a god', citation: 'issue', depiction: 'Some novel', source: 0 }],
    sources: [{ url: SRC, supports: 'Character overview' }],
  }] };
  const out = await worker.normalize(raw, ['mcu:Iron Man'], { checkUrl: async () => ({ keep: true, note: 'ok' }), checkBatch: pipe.checkBatch, known, tags, scope: 'all', films });
  assert.equal(out.characters.length, 1, JSON.stringify(out.dropped));
  const r = out.characters[0];
  assert.equal(r.depictionScope, 'all');
  assert.deepEqual(r.depictions.map((d) => d.title), ['Iron Man (2008 film)', 'Iron Man (Marvel Comics)']);
  assert.deepEqual(r.feats, [{ claim: 'Escapes the cave', citation: 'Iron Man', depiction: 'Iron Man (2008 film)', source: 0 }]);
  assert.ok(r.unknowns.some((u) => /Unlabelled depiction \(Some novel\): Beats a god/.test(u)));
  assert.deepEqual(check(r), []);
});

test('expansion merge on a real record keeps every earlier claim and stays valid', () => {
  const file = 'gemini-games-20261113-043356-36.json';
  const batch = JSON.parse(fs.readFileSync(path.join(ROOT, 'research/option-c/batches', file), 'utf8'));
  const old = batch.characters.find((c) => c.id === 'games:Ryu');
  const nu = {
    id: 'games:Ryu', continuity: 'Street Fighter series (1987-2023) and Street Fighter comics (UDON)', depictionScope: 'all',
    depictions: [{ title: 'Street Fighter series', kind: 'source' }, { title: 'Street Fighter (UDON Entertainment comics)', kind: 'comic' }],
    summary: 'New summary covering games and comics.', offense: { domains: ['physical'], techniques: ['Hadoken', 'Shin Shoryuken'] },
    defense: { mechanisms: ['Parry'] }, weaknesses: ['Satsui no Hado'],
    feats: [{ claim: 'Fights Akuma to a standstill', citation: 'UDON Street Fighter', depiction: 'Street Fighter (UDON Entertainment comics)', source: 0 }],
    sources: [{ url: 'https://en.wikipedia.org/wiki/Ryu_(Street_Fighter)', supports: 'Overview across games and comics' }],
    unknowns: ['A new question'], researchStatus: 'provisional',
  };
  const { batch: out, done } = mergeExpanded(batch, [nu]);
  assert.deepEqual(done, ['games:Ryu']);
  assert.deepEqual(out.characters.map((c) => c.id), batch.characters.map((c) => c.id));
  for (const [i, c] of out.characters.entries()) if (c.id !== 'games:Ryu') assert.equal(c, batch.characters[i]);
  const r = out.characters.find((c) => c.id === 'games:Ryu');
  assert.equal(r.researchStatus, 'provisional');
  assert.ok(!('reviewedBy' in r) && !('reviewNotes' in r));
  assert.equal(r.earlierSummary, old.summary);
  const earlier = r.depictions.find((d) => d.kind === 'earlier-record');
  assert.equal(earlier.title, old.continuity.trim());
  // Every earlier feat, technique and source survives; carried feats point at the same URL as before.
  for (const f of old.feats || []) {
    const g = r.feats.find((x) => x.claim === f.claim);
    assert.ok(g, 'carried: ' + f.claim);
    assert.equal(g.depiction, earlier.title);
    if (Number.isInteger(f.source)) assert.equal(r.sources[g.source].url, old.sources[f.source].url);
  }
  for (const t of old.offense.techniques || []) assert.ok(r.offense.techniques.includes(t), t);
  for (const s of old.sources) assert.ok(r.sources.some((x) => x.url === s.url), s.url);
  assert.ok(r.unknowns.includes('A new question') && r.unknowns.includes(EXPAND_NOTE));
  assert.deepEqual(pipe.checkBatch(file, out, known, tags, films), []);
  // Expanding twice does not stack the note.
  const again = mergeExpanded(out, [nu]).batch.characters.find((c) => c.id === 'games:Ryu');
  assert.equal(again.unknowns.filter((u) => u === EXPAND_NOTE).length, 1);
});

test('expansion ignores output that is not an all-depictions record', () => {
  const batch = { characters: [rec('mcu:Iron Man')] };
  assert.deepEqual(mergeExpanded(batch, [rec('mcu:Iron Man', { summary: 'new' })]).done, []);
  assert.deepEqual(mergeExpanded(batch, [{ ...scoped('mcu:Iron Man'), sources: [] }]).done, []);
});

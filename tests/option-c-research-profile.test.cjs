/* Option C — research-derived typed lines of attack (shadow, opt-in).
 * Proves: the derivation is closed-vocabulary and tier-free; it is OFF by default
 * (assessments are byte-identical with research loaded); it never overrides a
 * Version 1 typed profile; a form never inherits its base record; evidence stays
 * provisional; inputs are never mutated; results are deterministic and
 * side-symmetric. Runs the evaluator inside the real app harness.
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./helpers/option-c-app-harness.cjs');
const { loadAppWithResearch } = require('./helpers/option-c-research-app.cjs');
const RP = require('../data/option-c/research-profile.js');
const L = require('../data/option-c/research-ledger.js');

const rec = (id, extra = {}) => ({
  id, continuity: 'Test continuity for derivation fixtures', summary: 'Fixture record.',
  offense: { domains: ['magic', 'physical'], techniques: ['Fireball spell'], range: 'ranged' },
  defense: { mechanisms: ['Magic shield', 'Not established by the cited source'] },
  weaknesses: ['Vulnerable to mind control'],
  limitations: ['Needs a free hand to cast'],
  sources: [{ url: 'https://example.org/fixture', supports: 'Fixture source supporting the fixture claims.' }],
  researchStatus: 'reviewed', ...extra,
});

test('derivation: closed vocabulary, conventional domains dropped, placeholders ignored, no tier', () => {
  const d = RP.deriveFromRecord(rec('mcu:Fixture'));
  assert.deepEqual(d.domains, ['magic']);
  assert.equal(d.primaryDomain, 'magic');
  assert.deepEqual(d.guards, ['magic']);
  assert.deepEqual(d.weakTo, ['psychic']);
  assert.deepEqual(d.unmappedDomains, []);
  for (const k of ['tier', 'ward', 'apexRank', 'numericTier', 'cooldown']) assert.equal(k in d, false, k + ' must never be derived');
  const u = RP.deriveFromRecord(rec('mcu:Fixture2', { offense: { domains: ['tactical', 'physical'] }, defense: { mechanisms: ['Not established by the cited source'] }, weaknesses: ['Not established'] }));
  assert.equal(u.primaryDomain, null);
  assert.deepEqual(u.unmappedDomains, ['tactical']);
  assert.deepEqual(u.guards, []);
  assert.equal(RP.deriveFromRecord(null), null);
  assert.equal(RP.deriveFromRecord({ id: 5 }), null);
});

test('derivation does not mutate its input and is deterministic', () => {
  const r = rec('mcu:Fixture');
  const before = JSON.stringify(r);
  const a = RP.deriveFromRecord(r), b = RP.deriveFromRecord(r);
  assert.equal(JSON.stringify(r), before);
  assert.deepEqual(a, b);
});

const appWithResearch = loadAppWithResearch;

/* Find a roster identity with research and NO Version 1 typed profile, plus one with a Version 1 profile and research. */
function pickIdentities(app) {
  return JSON.parse(app.run(`JSON.stringify((() => {
    const PA = DA_OPTION_C_MODULES.profileAdapter, LG = DA_OPTION_C_MODULES.researchLedger.shared;
    let derived = null, legacy = null;
    for (const pool of ['mcu', 'dc', 'lotr', 'starwars']) {
      for (const c of getCands(pool)) {
        const id = pool + ':' + c.n;
        if (!LG.lookup(id).record) continue;
        const base = PA.getProfile(c);
        const on = PA.getProfile(c, { useResearch: true });
        if (!base.signature && on.signature && !derived) derived = id;
        if (base.signature && !legacy) legacy = id;
      }
    }
    return { derived, legacy };
  })())`));
}

test('adapter: off by default; with the opt-in a research line is provisional, tier-free and never overrides Version 1', () => {
  const app = appWithResearch();
  const { derived, legacy } = pickIdentities(app);
  assert.ok(derived, 'at least one roster identity gains a research-derived line');
  assert.ok(legacy, 'at least one identity keeps its Version 1 typed profile');
  const out = JSON.parse(app.run(`JSON.stringify((() => {
    const PA = DA_OPTION_C_MODULES.profileAdapter;
    const find = id => { const [pool, ...r] = id.split(':'); return getCands(pool).find(c => c.n === r.join(':')); };
    const d = find(${JSON.stringify(derived)}), l = find(${JSON.stringify(legacy)});
    const dFrozen = JSON.stringify(d);
    const off = PA.getProfile(d), on = PA.getProfile(d, { useResearch: true }), explicitOff = PA.getProfile(d, { useResearch: false });
    const lOff = PA.getProfile(l), lOn = PA.getProfile(l, { useResearch: true });
    return { off, on, explicitOff, lOff, lOn, inputUnchanged: JSON.stringify(d) === dFrozen };
  })())`));
  assert.equal(JSON.stringify(out.explicitOff), JSON.stringify(out.off), 'useResearch:false is identical to the default');
  assert.equal('researchDerived' in out.off, false);
  assert.equal(out.off.signature, null);
  const s = out.on.signature;
  assert.equal(s.origin, 'research-record');
  assert.equal(s.tier, null);
  assert.equal(s.evidenceStatus, 'provisional');
  assert.equal(out.on.ward, null, 'research never creates a ward');
  assert.equal(out.on.apexRank, out.off.apexRank, 'research never creates an Apex rank');
  assert.equal(out.on.evidence.combat, 'provisional');
  assert.ok(out.on.evidence.gaps.some(g => /no tier, ward, Apex rank or combat proficiency/.test(g)));
  assert.equal(out.inputUnchanged, true);
  assert.equal(JSON.stringify(out.lOn), JSON.stringify(out.lOff), 'a Version 1 typed profile is never overridden');
});

test('a selected form never inherits its base record', () => {
  const lg = L.createLedger({ validate: () => [] });
  lg.register({ batchId: 'form-fixture', characters: [rec('mcu:Iron Man')] });
  const base = lg.lookup('mcu:Iron Man'), form = lg.lookup('mcu:Iron Man|Hulkbuster');
  assert.ok(base.record);
  assert.equal(form.record, null, 'the ledger gives a form nothing from its base');
  assert.equal(RP.deriveFromRecord(form.record), null);
});

test('evaluator: default output is byte-identical with research loaded; the opt-in adds research-derived coverage reporting', () => {
  const app = appWithResearch();
  const { derived } = pickIdentities(app);
  const [pool, ...rest] = derived.split(':');
  const name = rest.join(':');
  const run = (ctx) => app.run(`JSON.stringify((() => {
    const A = ocTeam('brawl', { d1: [${JSON.stringify(pool)}, ${JSON.stringify(name)}] }, ${JSON.stringify(pool)});
    const B = ocTeam('brawl', { d1: ['dc', 'Darkseid'] }, 'dc');
    return DA_OPTION_C.evaluateMatchup({ sportKey: 'brawl', teamA: A, teamB: B, teamNames: ['A', 'B'], context: ${JSON.stringify(ctx)} });
  })())`);
  const cleanApp = loadApp({ search: '?researchPowers=0' });
  const cleanRun = ctx => cleanApp.run(`JSON.stringify((() => {
    const A = ocTeam('brawl', { d1: [${JSON.stringify(pool)}, ${JSON.stringify(name)}] }, ${JSON.stringify(pool)});
    const B = ocTeam('brawl', { d1: ['dc', 'Darkseid'] }, 'dc');
    return DA_OPTION_C.evaluateMatchup({ sportKey: 'brawl', teamA: A, teamB: B, teamNames: ['A', 'B'], context: ${JSON.stringify(ctx)} });
  })())`);
  const strip = s => JSON.stringify(JSON.parse(s, (k, v) => (k === 'research' || k === 'researchCoverage') ? undefined : v));
  assert.equal(strip(run({})), strip(cleanRun({})), 'default assessments do not change when research is loaded');
  assert.equal(strip(run({ useResearch: false })), strip(cleanRun({})));
  // Determinism.
  assert.equal(run({ useResearch: true }), run({ useResearch: true }));
  const on = JSON.parse(run({ useResearch: true }));
  assert.equal(on.liveImpact, 'none');
  assert.ok(on.evidence.researchDerived >= 1);
  assert.ok(on.evidence.weightedTypedCoverage >= on.evidence.typedCoverage);
  assert.ok(on.uncertainties.some(u => u.kind === 'research-derived-lines'));
  assert.ok(on.uncertainties.some(u => u.kind === 'calibration'), 'still says it is uncalibrated');
});

test('evaluator with research is side-symmetric and consumes no live RNG', () => {
  const app = appWithResearch();
  const { derived } = pickIdentities(app);
  const [pool, ...rest] = derived.split(':');
  const name = rest.join(':');
  const out = JSON.parse(app.run(`JSON.stringify((() => {
    const A = ocTeam('brawl', { d1: [${JSON.stringify(pool)}, ${JSON.stringify(name)}] }, ${JSON.stringify(pool)});
    const B = ocTeam('brawl', { d1: ['dc', 'Darkseid'] }, 'dc');
    let draws = 0; const realRandom = Math.random; Math.random = () => { draws++; return realRandom(); };
    const ab = DA_OPTION_C.evaluateMatchup({ sportKey: 'brawl', teamA: A, teamB: B, context: { useResearch: true } });
    const ba = DA_OPTION_C.evaluateMatchup({ sportKey: 'brawl', teamA: B, teamB: A, context: { useResearch: true } });
    Math.random = realRandom;
    return { draws, pa: ab.sides[0].probability, pbSwapped: ba.sides[1].probability };
  })())`));
  assert.equal(out.draws, 0);
  assert.equal(out.pa, out.pbSwapped);
});

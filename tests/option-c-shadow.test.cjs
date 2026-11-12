/* Option C shadow evaluator — whole-team, benchmark and shadow-mode tests.
 * Runs inside the REAL app (tests/helpers/option-c-app-harness.cjs), so every
 * team is produced by the actual teamScore() and every game by the actual
 * playGame()/simChampionship()/simSeason()/simH2H().
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp, root } = require('./helpers/option-c-app-harness.cjs');
const { registry, runBenchmarks } = require('./helpers/option-c-benchmark-runner.cjs');
const { runParityFixtures } = require('./helpers/option-c-parity-fixtures.cjs');
const golden = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/option-c-v1-golden.json'), 'utf8'));

const app = loadApp();
const page = code => JSON.parse(app.run('JSON.stringify((() => {' + code + '})())'));

test('every benchmark scenario runs; approved rules pass and unresolved cases stay unresolved', () => {
  const results = runBenchmarks(app);
  assert.equal(results.length, registry.cases.length);
  assert.ok(results.length >= 24, 'the original 20 cases plus the PR 1 fixtures');
  for (const r of results) {
    assert.deepEqual(r.failed, [], r.id + ' failed: ' + r.failed.join(', '));
    if (r.registryState === 'needs-review') {
      assert.equal(r.outcome, 'needs-review', r.id + ' must not be marked resolved to pass a test');
      assert.equal(r.checks.reportedUnresolved, true, r.id + ' must surface as unresolved in the assessment');
    } else assert.equal(r.outcome, 'pass', r.id);
  }
  assert.equal(results.filter(r => r.outcome === 'needs-review').length, registry.cases.filter(c => c.reviewState === 'needs-review').length);
});

test('the shadow flag is off by default and nothing is recorded until a developer turns it on', () => {
  const fresh = loadApp();
  assert.equal(fresh.run('DA_OPTION_C.shadow.enabled'), false);
  fresh.run(`(() => { const A = ocTeam('basketball', {}, 'nba'), B = ocTeam('basketball', {}, 'mcu'); const r = rngFrom('off'); for (let k = 0; k < 10; k++) playGame('basketball', A, B, 2.5, r); })()`);
  assert.equal(fresh.run('DA_OPTION_C.shadow.records().length'), 0);
  assert.equal(loadApp({ search: '?optionCShadow=1' }).run('DA_OPTION_C.shadow.enabled'), true, 'developer URL flag opts in for one page load');
  assert.equal(loadApp({ search: '?optionCShadow=0' }).run('DA_OPTION_C.shadow.enabled'), false);
});

test('fixed seeded Version 1 results are byte-identical to the pre-Option-C baseline with shadow OFF and ON', () => {
  const ids = Object.keys(golden.digests);
  assert.ok(ids.length >= 17);
  const off = runParityFixtures(loadApp(), false);
  const on = runParityFixtures(loadApp(), true);
  const without = runParityFixtures(loadApp({ skip: src => src.startsWith('data/option-c/') }), false);
  for (const id of ids) {
    assert.equal(off.digests[id], golden.digests[id], 'shadow OFF changed ' + id);
    assert.equal(on.digests[id], golden.digests[id], 'shadow ON changed ' + id);
    assert.equal(without.digests[id], golden.digests[id], 'page without the evaluator differs for ' + id);
  }
  assert.deepEqual(Object.keys(off.digests).sort(), ids.slice().sort());
  assert.equal(off.recorded, 0);
  assert.ok(on.recorded > 0, 'shadow ON actually ran the evaluator beside the live games');
  assert.equal(on.digests['h2h:volleyball:host'], on.digests['h2h:volleyball:guest'], 'both Head-to-Head clients resolve the same payload');
});

test('shadow mode never consumes randomness, writes storage or adds fields to a result', () => {
  const fresh = loadApp();
  const out = JSON.parse(fresh.run(`JSON.stringify((() => {
    const A = ocTeam('brawl', { d1: ['dc', 'Batman', 'Hellbat Armor Batman'], d2: ['toons', 'Bugs Bunny'] }, 'dc'), B = ocTeam('brawl', { bn: ['muppets', 'Kermit the Frog'] }, 'mcu');
    const keysOff = Object.keys(playGame('brawl', A, B, 6, rngFrom('k'), true)).sort();
    DA_OPTION_C.shadow.enable();
    const realRandom = Math.random; let randomCalls = 0; Math.random = () => { randomCalls++; return realRandom(); };
    let draws = 0; const base = rngFrom('k'), counted = () => { draws++; return base(); };
    const g = playGame('brawl', A, B, 6, counted, true);
    const liveDraws = draws;
    DA_OPTION_C.evaluateMatchup({ sportKey: 'brawl', teamA: A, teamB: B });
    DA_OPTION_C.shadow.report();
    Math.random = realRandom;
    const rec = DA_OPTION_C.shadow.records();
    DA_OPTION_C.shadow.disable();
    let offDraws = 0; const base2 = rngFrom('k'); playGame('brawl', A, B, 6, () => { offDraws++; return base2(); }, true);
    return { keysOff, keysOn: Object.keys(g).sort(), randomCalls, liveDraws, offDraws, drawsAfter: draws, records: rec.length,
      recordKeys: Object.keys(rec[0]).sort(), agrees: rec[0].agrees, legacyWinner: rec[0].legacyWinner, winner: g.winner };
  })())`));
  assert.deepEqual(out.keysOn, out.keysOff, 'the live result object gains no field');
  assert.deepEqual(out.keysOff, ['breakdown', 'combat', 'ev', 'line', 'margin', 'toonEvents', 'winner']);
  assert.equal(out.randomCalls, 0, 'no Math.random');
  assert.equal(out.liveDraws, out.offDraws, 'shadow ON draws exactly as many live RNG values as shadow OFF');
  assert.equal(out.drawsAfter, out.liveDraws, 'evaluating and reporting draw nothing');
  assert.equal(out.records, 1);
  assert.equal(out.legacyWinner, out.winner === 0 ? 'A' : 'B', 'the record reports the legacy winner; it does not choose one');
  assert.deepEqual(fresh.writes, [], 'nothing is written to localStorage');
  assert.deepEqual(Object.keys(fresh.store), []);
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const uses = html.match(/DA_OPTION_C/g) || [];
  assert.equal(uses.length, 2, 'the page touches the evaluator in exactly one guarded hook');
  assert.match(html, /if\(shadow&&shadow\.enabled\)shadow\.observe\(sportKey,A,B,result,\{playoff\}\);\n {2}return result;/);
  assert.ok(!/supabase[^\n]*DA_OPTION_C|DA_OPTION_C[^\n]*(supabase|lsSet|localStorage)/i.test(html), 'no persistence path references the evaluator');
});

test('a failing evaluator cannot disturb a live game', () => {
  const fresh = loadApp();
  const out = JSON.parse(fresh.run(`JSON.stringify((() => {
    const A = ocTeam('hockey', {}, 'nba'), B = ocTeam('hockey', {}, 'mcu');
    const a = JSON.stringify(playGame('hockey', A, B, 2.5, rngFrom('boom')));
    DA_OPTION_C.shadow.enable();
    const broken = { rating: A.rating, sig: A.sig, benchHeat: A.benchHeat, rows: A.rows.map(r => ({ ...r, cand: r.cand ? { ...r.cand, pool: null } : r.cand })) };
    let threw = false, b = null;
    try { b = JSON.stringify(playGame('hockey', A, B, 2.5, rngFrom('boom'))); DA_OPTION_C.shadow.observe('hockey', broken, B, { winner: 0 }, {}); } catch (e) { threw = true; }
    const errors = DA_OPTION_C.shadow.report().errors;
    DA_OPTION_C.shadow.disable();
    return { same: a === b, threw, errors };
  })())`));
  assert.equal(out.threw, false);
  assert.equal(out.same, true);
  assert.equal(out.errors, 1, 'the failure is counted in the developer report only');
});

test('evaluation is deterministic, side-symmetric and leaves frozen inputs untouched', () => {
  const out = page(`
    const deepFreeze = o => { if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); for (const v of Object.values(o)) deepFreeze(v); } return o; };
    const cases = [
      ['brawl', ocTeam('brawl', { d1: ['dc', 'Darkseid'], d2: ['toons', 'Bugs Bunny'], cmd: ['mcu', 'Nick Fury'] }, 'dc'), ocTeam('brawl', { d1: ['dc', 'Batman', 'Hellbat Armor Batman'], bn: ['muppets', 'Kermit the Frog'], d3: ['mcu', 'Scarlet Witch'] }, 'mcu')],
      ['basketball', ocTeam('basketball', { c: ['dc', 'Superman'], sg: ['mcu', 'Scarlet Witch'], bn: ['dc', 'Robin (Damian Wayne)'], hc: ['dc', 'Batman'] }, 'nba'), ocTeam('basketball', { pg: ['muppets', 'Kermit the Frog'], sf: ['toons', 'Bugs Bunny'] }, 'mcu')],
      ['volleyball', ocTeam('volleyball', { lib: ['mcu', 'Spider-Man'] }, 'nba'), ocTeam('volleyball', { lib: ['mcu', 'Spider-Man'], s: ['mcu', 'Doctor Strange'] }, 'dc')],
      ['football', ocTeam('football', { qb: ['mcu', 'Doctor Strange'] }, 'nba'), ocTeam('football', {}, 'starwars')],
    ];
    return cases.map(([sportKey, A, B]) => {
      const before = JSON.stringify([A, B]);
      deepFreeze(A); deepFreeze(B);
      const names = ['Home', 'Away'];
      const r1 = DA_OPTION_C.evaluateMatchup({ sportKey, teamA: A, teamB: B, teamNames: names });
      const r2 = DA_OPTION_C.evaluateMatchup({ sportKey, teamA: A, teamB: B, teamNames: names });
      const sw = DA_OPTION_C.evaluateMatchup({ sportKey, teamA: B, teamB: A, teamNames: ['Away', 'Home'] });
      return { sportKey, same: JSON.stringify(r1) === JSON.stringify(r2), untouched: JSON.stringify([A, B]) === before, r1, sw, roundTrip: JSON.stringify(JSON.parse(JSON.stringify(r1))) === JSON.stringify(r1) };
    });`);
  const relabel = v => JSON.parse(JSON.stringify(v)
    .replace(/"(teamKey|attackerTeam|defenderTeam|favored)":"([AB])"/g, (_, k, s) => '"' + k + '":"' + (s === 'A' ? 'B' : 'A') + '"')
    .replace(/"id":"([AB]):/g, (_, s) => '"id":"' + (s === 'A' ? 'B' : 'A') + ':'));
  const sorted = list => list.map(x => JSON.stringify(x)).sort();
  for (const c of out) {
    assert.ok(c.same, c.sportKey + ': repeat evaluation is identical');
    assert.ok(c.untouched, c.sportKey + ': inputs are not mutated (they were deep-frozen)');
    assert.ok(c.roundTrip, c.sportKey + ': result is plain JSON');
    const r = c.r1, s = relabel(c.sw);
    assert.ok(Math.abs(r.sides[0].probability + r.sides[1].probability - 1) < 1e-12);
    assert.deepEqual(s.sides.slice().reverse(), r.sides, c.sportKey + ': swapping teams swaps the side records and nothing else');
    assert.equal(s.favored, r.favored);
    assert.equal(s.status, r.status);
    assert.equal(s.headline, r.headline);
    assert.deepEqual(s.evidence.conflicts.length, r.evidence.conflicts.length);
    for (const key of ['effectLedger', 'interactions', 'sportRulings', 'positionRestrictions', 'decisiveFactors', 'uncertainties'])
      assert.deepEqual(sorted(s[key]), sorted(r[key]), c.sportKey + ': ' + key + ' are the same facts either way round');
    assert.deepEqual(sorted(s.ledgerChecks.reconciliation), sorted(r.ledgerChecks.reconciliation));
  }
});

test('assessments follow the published schema and never report a bare placeholder', () => {
  const out = page(`
    const A = ocTeam('brawl', { tk1: ['mcu', 'Abomination'], tk2: ['mcu', 'Adam Warlock'], d1: ['dc', 'Batman', 'Hellbat Armor Batman'], d2: ['dc', 'Joker'], d3: ['dc', 'Lucifer Morningstar'], bn: ['mcu', 'Captain Carter'], cmd: ['mcu', 'Captain America'] });
    const B = ocTeam('brawl', { tk1: ['dc', 'Ares (DC)'], tk2: ['mcu', 'The Watcher'], d1: ['dc', 'Death of the Endless'], d2: ['mcu', 'Scarlet Witch'], d3: ['dc', 'Darkseid'], bn: ['dc', 'Wonder Woman'], cmd: ['dc', 'Trigon'] });
    return DA_OPTION_C.evaluateMatchup({ sportKey: 'brawl', teamA: A, teamB: B, teamNames: ['The Chungus', 'The Crossover'], scenarioId: 'screenshot-lineup', rulesetId: 'brawl-v1' });`);
  assert.equal(out.schemaVersion, 1);
  assert.equal(out.modelVersion, 'option-c-shadow-v1');
  assert.equal(out.mode, 'shadow');
  assert.equal(out.liveImpact, 'none');
  assert.equal(out.scenarioId, 'screenshot-lineup');
  assert.equal(out.status, 'provisional');
  assert.equal(out.sides.length, 2);
  assert.deepEqual(out.sides.map(s => s.teamKey), ['A', 'B']);
  assert.equal(out.evidence.typedCoverage, 1);
  assert.equal(out.favored, 'B', 'five high-order beings are favored over one Apex suit and a conventional supporting cast');
  assert.notDeepEqual(out.sides.map(s => s.probability), [0.5, 0.5]);
  for (const s of out.sides) {
    assert.ok(s.winConditions.length >= 1 && s.lineup.length === 7);
    assert.ok(s.probabilityRange[0] <= s.probability && s.probability <= s.probabilityRange[1]);
    for (const row of s.lineup) assert.ok(row.summary.length > 20 && row.character.includes(':'));
  }
  const chungus = out.sides[0], crossover = out.sides[1];
  assert.ok(chungus.winConditions.some(w => /Hellbat Armor Batman/.test(w.text) && w.type === 'pinnacle-form'), 'the underdog still has a named path to victory');
  assert.ok(chungus.risks.some(r => r.type === 'self-limiting') && chungus.risks.some(r => r.type === 'vulnerability' && /Scarlet Witch/.test(r.text)));
  assert.ok(crossover.winConditions.some(w => /Darkseid/.test(w.text)));
  assert.ok(out.interactions.length === 50, '5 x 5 fighters assessed in both directions');
  assert.ok(out.uncertainties.some(u => u.kind === 'continuity') && out.uncertainties.some(u => u.kind === 'calibration'));
  assert.match(out.probabilityModel.label, /not a canonical/);
  assert.ok(out.ledgerChecks.validation.ok && out.ledgerChecks.reconciliation.every(r => r.ok && Math.abs(r.difference) < 1e-4));
  const required = ['id', 'sourceSystem', 'trigger', 'conditions', 'recipients', 'stage', 'appliedBy', 'effectKind', 'value', 'unit', 'capGroup', 'cap', 'stackKey', 'alreadyApplied', 'sourceEvidence', 'continuity', 'reason', 'limitations'];
  for (const e of out.effectLedger) for (const k of required) assert.ok(k in e, 'ledger entry ' + e.id + ' lacks ' + k);
  assert.ok(out.effectLedger.every(e => ['legacy-observed', 'option-c-derived', 'blocked', 'informational'].includes(e.appliedBy)));
  assert.equal(new Set(out.effectLedger.map(e => e.id)).size, out.effectLedger.length, 'no duplicate ledger entry');
  assert.equal(out.effectLedger.filter(e => e.appliedBy === 'blocked').length, 0);
});

test('whole-team effects: every observed bonus is counted once and rebuilds the Version 1 rating', () => {
  const out = page(`
    const specs = [
      ['basketball', { pg: ['muppets', 'Kermit the Frog'], sg: ['muppets', 'Fozzie Bear'], sf: ['toons', 'Bugs Bunny'], pf: ['mcu', 'Iron Man'], bn: ['dc', 'Robin (Damian Wayne)'], hc: ['dc', 'Batman'] }, 'nba'],
      ['brawl', { d1: ['mcu', 'Thanos', 'King Thanos'], d2: ['toons', 'Daffy Duck'], tk1: ['muppets', 'Animal'], bn: ['mcu', 'Falcon'], cmd: ['mcu', 'Captain America'] }, 'mcu'],
      ['soccer', { gk: ['mcu', 'Spider-Man'], bn: ['muppets', 'Gonzo'] }, 'starwars'],
      ['baseball', { p: ['dc', 'Superman'] }, 'games'],
      ['football', {}, 'muppets'], ['hockey', {}, 'toons'], ['volleyball', {}, 'lotr'],
    ];
    return specs.map(([sport, spec, fill]) => {
      const T = ocTeam(sport, spec, fill), O = ocTeam(sport, {}, 'nba');
      const L = DA_OPTION_C.observeTeamEffects({ teamKey: 'A', sportKey: sport, score: T, opponent: O });
      return { sport, rating: T.rating, rec: L.reconciliation, conflicts: L.conflicts, valid: DA_OPTION_C.validateLedger(L.entries),
        muppet: T.muppetTeam, bench: T.benchChem,
        entries: L.entries.map(e => ({ k: e.stackKey, by: e.appliedBy, sys: e.sourceSystem, rec: e.recipients, v: e.value, inR: e.inRating, cap: e.cap, stage: e.stage })) };
    });`);
  for (const t of out) {
    assert.ok(t.rec.ok, t.sport + ': ledger parts ' + t.rec.ledgerSum + ' vs rating ' + t.rec.rating);
    assert.ok(Math.abs(t.rec.ledgerSum - t.rating) < 1e-4);
    assert.deepEqual(t.conflicts, [], t.sport);
    assert.ok(t.valid.ok);
    const keys = t.entries.map(e => e.k);
    assert.equal(new Set(keys).size, keys.length, t.sport + ': unique stack keys');
    assert.ok(t.entries.every(e => e.by === 'legacy-observed'), 'observing a team derives nothing');
    assert.equal(t.entries.filter(e => e.k === 'muppetforce-team').length, 1);
    assert.equal(t.entries.filter(e => e.k === 'bench-chemistry-total').length, 1);
    assert.ok(t.muppet.percent <= 22 && t.bench.percent <= 8);
    for (const e of t.entries.filter(x => x.sys === 'toonforce')) assert.equal(e.rec.length, 1, t.sport + ': ToonForce reaches one character');
    assert.ok(t.entries.filter(e => e.stage === 'match-conditional').every(e => e.v === null && !e.inR), 'seeded events are listed, never rolled or summed');
  }
  const mixed = out[0];
  const team = mixed.entries.find(e => e.k === 'muppetforce-team');
  assert.ok(team.v > 0 && team.cap === 22 && team.rec.includes('mcu:Iron Man') && team.rec.includes('toons:Bugs Bunny') && team.rec.includes('dc:Batman'));
  assert.ok(mixed.entries.some(e => e.k === 'bench-chemistry:sidekick-lock' && e.v === 3));
  assert.ok(mixed.entries.some(e => e.k === 'bench-chemistry:lead-reunion' && e.v === 2), 'Batman as coach reunites with Robin');
  assert.equal(mixed.entries.find(e => e.k === 'bench-chemistry-total').cap, 8);
  const allMuppets = out.find(t => t.sport === 'football');
  assert.equal(allMuppets.muppet.percent, 22, 'a full Muppet roster reaches, and stops at, the 22% cap');
  const brawl = out[1];
  assert.ok(brawl.entries.some(e => e.k === 'apex-form:d1' && e.stage === 'combat'));
  assert.ok(brawl.entries.some(e => e.k === 'variant-surge:d1'));
  assert.ok(brawl.entries.some(e => e.k === 'toonforce-spotlight' && e.rec[0] === 'toons:Daffy Duck'));
  assert.ok(brawl.entries.some(e => e.k === 'coach-multiplier') && brawl.entries.some(e => e.k === 'brawl-variety' && e.inR));
});

test('MuppetForce scales with diminishing returns and ToonForce stays with its owner in a full assessment', () => {
  const out = page(`
    const pct = n => ocTeam('basketball', Object.fromEntries(['pg', 'sg', 'sf', 'pf', 'c'].slice(0, n).map((id, i) => [id, ['muppets', ['Kermit the Frog', 'Fozzie Bear', 'Gonzo', 'Miss Piggy', 'Animal'][i]]])), 'nba').muppetTeam.percent;
    const A = ocTeam('basketball', { pg: ['toons', 'Bugs Bunny'], sg: ['mcu', 'Iron Man'] }, 'nba'), B = ocTeam('basketball', { pg: ['muppets', 'Kermit the Frog'] }, 'nba');
    const r = DA_OPTION_C.evaluateMatchup({ sportKey: 'basketball', teamA: A, teamB: B });
    return { steps: [1, 2, 3, 4, 5].map(pct), solo: muppetForceTeamwork({ pg: ocCand('muppets', 'Kermit the Frog') }, SPORTS.basketball.pos, 80).percent,
      a: r.sides[0], b: r.sides[1], aTeamLine: r.effectLedger.find(e => e.teamKey === 'A' && e.stackKey === 'muppetforce-team'), ledger: r.effectLedger.map(e => ({ t: e.teamKey, k: e.stackKey, sys: e.sourceSystem, rec: e.recipients })) };`);
  for (let i = 1; i < 5; i++) {
    assert.ok(out.steps[i] > out.steps[i - 1], 'each added Muppet helps');
    assert.ok(out.steps[i] - out.steps[i - 1] <= out.steps[0] + 1e-9, 'but never by more than the first one');
  }
  assert.ok(out.steps[4] <= 22);
  assert.equal(out.solo, 0, 'a lone Muppet with no teammate has no ensemble');
  assert.ok(out.ledger.filter(e => e.t === 'A' && e.sys === 'toonforce').every(e => e.rec.join() === 'toons:Bugs Bunny'));
  assert.deepEqual(out.ledger.filter(e => e.t === 'A' && e.sys === 'muppetforce').map(e => e.k), ['muppetforce-team'], 'only the (zero) team line; no performer');
  assert.ok(/No Muppet ensemble/.test(out.aTeamLine.reason) && out.aTeamLine.value === 0, 'the opponent\'s Muppet aura does not leak across teams');
  assert.ok(out.a.winConditions.some(w => w.type === 'conditional-event' && /not a team aura/.test(w.text)));
  assert.ok(out.b.winConditions.some(w => w.type === 'team-effects' && /MuppetForce ensemble lifts the whole team/.test(w.text)));
  assert.equal(out.a.teamEffects.muppetPercent, 0);
});

test('sports assessments keep the numeric baseline, separate legal from unresolved uses and never weight them', () => {
  const out = page(`
    const A = ocTeam('basketball', { c: ['dc', 'Superman'], sg: ['mcu', 'Scarlet Witch'] }, 'nba'), B = ocTeam('basketball', {}, 'nba');
    const plain = ocTeam('basketball', { c: ['nba', 'Shaquille O\\'Neal'] }, 'nba');
    const r = DA_OPTION_C.evaluateMatchup({ sportKey: 'basketball', teamA: A, teamB: B, context: { sigma: 2.5 } });
    const v = DA_OPTION_C.evaluateMatchup({ sportKey: 'volleyball', teamA: ocTeam('volleyball', { lib: ['mcu', 'Spider-Man'] }, 'nba'), teamB: ocTeam('volleyball', {}, 'nba') });
    const f = DA_OPTION_C.evaluateMatchup({ sportKey: 'football', teamA: ocTeam('football', { qb: ['mcu', 'Doctor Strange'] }, 'nba'), teamB: ocTeam('football', {}, 'nba') });
    return { r, v, f, ratingA: A.rating, ratingB: B.rating, fitSuperman: A.rows.find(x => x.pos.id === 'c').fit, fitShaq: plain.rows.find(x => x.pos.id === 'c').fit };`);
  const { r, v, f } = out;
  assert.equal(r.probabilityModel.basis, 'numeric-baseline-only');
  assert.equal(r.evidence.scope, 'sport-capabilities');
  assert.equal(r.sides[0].rating, Math.round(out.ratingA * 1e4) / 1e4, 'Option C reports the Version 1 rating unchanged');
  assert.equal(r.sides[0].model.effectiveRating - r.sides[1].model.effectiveRating > 0, out.ratingA > out.ratingB);
  assert.ok(r.sides[0].constraints.some(c => c.ruleId === 'flight-basketball-carry') && r.sides[0].constraints.some(c => c.ruleId === 'flight-basketball-goaltend'));
  assert.ok(r.uncertainties.some(u => u.kind === 'officiating' && /flight-basketball-air-dribble/.test(u.text)));
  assert.ok(r.uncertainties.some(u => u.kind === 'officiating' && /telekinesis-move-ball/.test(u.text)));
  assert.ok(r.sportRulings.filter(x => x.ruling !== 'allowed').every(x => x.grantsAdvantage === false));
  assert.ok(r.sportRulings.every(x => !x.effect || x.effect.appliedToRating === false));
  assert.ok(r.effectLedger.filter(e => e.sourceSystem === 'option-c-sport-rules').every(e => e.value === null && !e.inRating));
  assert.ok(v.sides[0].winConditions.some(w => w.type === 'legal-ability' && /Spider-Man/.test(w.text) && w.appliedToRating === false));
  assert.ok(v.sides[0].constraints.some(c => c.ruleId === 'volleyball-libero-no-attack-or-block'));
  assert.equal(v.evidence.recognized, 1);
  assert.ok(f.uncertainties.some(u => /portal-football-forward-pass/.test(u.text)));
  assert.ok(f.sportRulings.filter(x => x.capability.kind === 'portals').length >= 1);
  assert.ok(f.sportRulings.filter(x => x.capability.kind === 'portals').every(x => x.advantage === 'none'), 'an unresolved portal play is not an advantage');
  assert.ok(f.evidence.unresolvedRulings >= 1);
});

test('incomplete research is reported, not papered over', () => {
  const out = page(`
    const fill = 'actionmovies';
    const a = DA_OPTION_C.evaluateMatchup({ sportKey: 'brawl', teamA: ocTeam('brawl', { d1: ['dc', 'Black Adam'] }, fill), teamB: ocTeam('brawl', { d1: ['mcu', 'Silver Surfer'] }, fill) });
    const b = DA_OPTION_C.evaluateMatchup({ sportKey: 'brawl', teamA: ocTeam('brawl', { d1: ['dc', 'Batman'] }, fill), teamB: ocTeam('brawl', { d1: ['dc', 'Batman', 'Hellbat Armor Batman'] }, fill) });
    const src = ['evaluator', 'probability', 'interaction-engine', 'explain'].map(n => 'data/option-c/' + n + '.js');
    return { a, b, src };`);
  const { a, b } = out;
  assert.equal(a.status, 'insufficient-evidence');
  assert.equal(a.evidence.reviewed, 0);
  assert.equal(a.probabilityModel.basis, 'numeric-baseline-only');
  assert.ok(a.sides[0].probabilityRange[1] - a.sides[0].probabilityRange[0] >= 0.5, 'a wide range, not false precision');
  assert.ok(a.uncertainties.some(u => u.kind === 'unresearched-kits' && u.impact === 'high' && /Black Adam/.test(u.text) && /Silver Surfer/.test(u.text)));
  assert.ok(a.sides.every(s => s.winConditions.some(w => w.type === 'attrition' && w.evidence === 'unknown')));
  assert.ok(![0.8, 0.2].includes(a.sides[0].probability), 'the conversational 80/20 is not hard-coded');
  for (const file of out.src) assert.ok(!/0\.8\s*[,\]]\s*0\.2|80\s*\/\s*20/.test(fs.readFileSync(path.join(root, file), 'utf8')), file);
  assert.equal(b.status, 'provisional');
  assert.equal(b.favored, 'B');
  assert.ok(b.evidence.typedCoverage < 0.2 && b.evidence.unknown + b.evidence.provisional >= 8);
  assert.ok(b.sides[1].probability < 0.95, 'thin coverage tempers the estimate even for an Apex form');
  assert.ok(b.sides[0].risks.some(r => r.type === 'unanswered-opponent' && /Hellbat/.test(r.text)));
});

test('roster-wide evidence coverage is measured and far from complete', () => {
  const out = page(`
    const counts = { total: 0, reviewed: 0, provisional: 0, unknown: 0, forms: 0, formsReviewed: 0, errors: 0 };
    for (const pool of Object.keys(POOLS)) {
      if (isMashupId(pool)) continue;
      for (const c of getCands(pool)) {
        counts.total++;
        try { counts[DA_OPTION_C.getProfile(c).evidence.combat]++; } catch (e) { counts.errors++; }
        for (const form of variantOptions(c)) { counts.forms++; if (DA_VARIANT_ABILITY_PROFILES[c.pool + ':' + c.n + '|' + form.name]) counts.formsReviewed++; }
      }
    }
    return counts;`);
  assert.equal(out.errors, 0, 'every roster identity yields a profile');
  assert.ok(out.total >= 1300);
  assert.equal(out.reviewed + out.provisional + out.unknown, out.total);
  assert.ok(out.reviewed / out.total < 0.1, 'typed combat coverage is a small sample; the #83 atlas is not done');
  assert.ok(out.formsReviewed < out.forms, 'most alternate forms are unreviewed and stay power-less');
});

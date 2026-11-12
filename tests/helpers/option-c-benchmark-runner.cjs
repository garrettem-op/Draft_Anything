/* Executes every case in data/option-c/benchmark-scenarios.json against the
 * shadow evaluator running inside the REAL app (see option-c-app-harness.cjs).
 *
 * Outcome vocabulary:
 *   pass          — an approved rule/structure behaves as approved.
 *   needs-review  — the case is unresolved in the registry AND the evaluator
 *                   correctly reports it as unresolved (it must not "resolve"
 *                   research or officiating by itself). Structural guards hold.
 *   fail          — a check is violated.
 * A needs-review case can never become `pass` here: that takes an owner
 * ruling or reviewed research, recorded in the registry.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { loadApp, root } = require('./option-c-app-harness.cjs');

const registry = JSON.parse(fs.readFileSync(path.join(root, 'data/option-c/benchmark-scenarios.json'), 'utf8'));

/* Page-side fixtures. Everything runs in the app context and returns plain JSON. */
const PAGE = `
(() => {
  const OC = DA_OPTION_C, fill = 'actionmovies';
  const brawlTeam = spec => ocTeam('brawl', spec, fill);
  const evalB = (A, B) => OC.evaluateMatchup({ sportKey: 'brawl', teamA: A, teamB: B });
  const ledger = (sport, T, O) => OC.observeTeamEffects({ teamKey: 'A', sportKey: sport, score: T, opponent: O || T });
  const entry = (L, key) => L.entries.find(e => e.stackKey === key) || null;
  const prof = (pool, name, form) => OC.getProfile(form ? ocRoster('brawl', { d1: [pool, name, form] }, fill).d1 : ocCand(pool, name));
  const posOf = (sport, id) => SPORTS[sport].pos.find(p => p.id === id);
  const apps = (sport, pool, name, posId, kind) => OC.evaluateSportApplication({ sportKey: sport, profile: OC.getProfile(ocCand(pool, name)), pos: posOf(sport, posId), capabilityKind: kind, opponents: [] });
  const out = {};

  { // Batman vs selected Hellbat
    const base = prof('dc', 'Batman'), hell = prof('dc', 'Batman', 'Hellbat Armor Batman');
    const dark = prof('dc', 'Darkseid');
    const a = evalB(brawlTeam({ d1: ['dc', 'Batman'] }), brawlTeam({ d1: ['dc', 'Batman', 'Hellbat Armor Batman'] }));
    out['combat-identity-form-hellbat'] = {
      distinctKeys: base.key === 'dc:Batman' && hell.key === 'dc:Batman|Hellbat Armor Batman',
      baseNoApex: base.apexRank === 0 && base.signature === null,
      formReviewedApex: hell.variantReviewed && hell.apexRank === 2 && hell.evidence.combat === 'reviewed',
      formLimits: !!hell.signature.selfLimiting && hell.weakTo.includes('magic'),
      counterStillThreatens: OC.assessThreat(dark, hell).score >= 1,
      notGuaranteed: a.sides[1].probability < 1 && a.sides[0].probability > 0,
      favorsForm: a.favored === 'B',
    };
  }
  { // Thanos vs King Thanos
    const base = prof('mcu', 'Thanos'), king = prof('mcu', 'Thanos', 'King Thanos');
    const T = brawlTeam({ d1: ['mcu', 'Thanos', 'King Thanos'] }), L = ledger('brawl', T);
    out['combat-identity-form-king-thanos'] = {
      distinct: base.key !== king.key && king.formId === 'mcu:Thanos|King Thanos',
      baseHasNoFormPower: base.signature === null && base.apexRank === 0 && base.guards.length === 0,
      formPower: king.signature.label === 'End-of-Time Onslaught' && king.apexRank > 0,
      formImpactRecorded: !!entry(L, 'apex-form:d1') && !!entry(L, 'variant-surge:d1'),
      formLimitKept: /does not grant Infinity Stones/.test(king.signature.limitation || ''),
    };
  }
  { // Black Adam vs Silver Surfer (continuity guard)
    const a = evalB(brawlTeam({ d1: ['dc', 'Black Adam'] }), brawlTeam({ d1: ['mcu', 'Silver Surfer'] }));
    const ad = prof('dc', 'Black Adam'), ss = prof('mcu', 'Silver Surfer');
    const cont = a.uncertainties.find(u => u.kind === 'continuity');
    out['combat-continuity-black-adam-surfer'] = {
      poolsPreserved: ad.key === 'dc:Black Adam' && ss.key === 'mcu:Silver Surfer' && ss.pool === 'mcu',
      surferNotGivenComicsKit: ss.signature === null && ss.exceptional === null && ss.evidence.combat !== 'reviewed',
      continuityFlagged: !!cont && /dc:Black Adam/.test(cont.text) && /mcu:Silver Surfer/.test(cont.text),
      notHardCoded: ![0.8, 0.2].includes(a.sides[0].probability),
      reportedUnresolved: a.status === 'insufficient-evidence' && a.probabilityModel.basis === 'numeric-baseline-only',
    };
  }
  { // Reality/cosmic vs physical
    const fr = prof('mcu', 'Franklin Richards'), ab = prof('mcu', 'Abomination');
    const t = OC.assessThreat(fr, ab), back = OC.assessThreat(ab, fr);
    const a = evalB(brawlTeam({ d1: ['mcu', 'Franklin Richards'] }), brawlTeam({ tk1: ['mcu', 'Abomination'] }));
    out['combat-cosmic-vs-physical'] = {
      notReducedToPunch: t.domain === 'reality' && t.rules.includes('high-order-burst') && t.score >= 1,
      physicalMeetsWard: back.rules.includes('finite-ward') && back.score < t.score,
      limitationCarried: /age|depletion|storyline/.test(fr.signature.limitation || ''),
      continuityOpen: fr.continuity.status === 'needs-review' && a.uncertainties.some(u => u.kind === 'continuity' && /Franklin Richards/.test(u.text)),
      reportedUnresolved: a.status !== 'reviewed',
    };
  }
  { // High tier vs high tier
    const dk = prof('dc', 'Darkseid'), sp = prof('dc', 'The Spectre');
    const x = OC.assessThreat(dk, sp), y = OC.assessThreat(sp, dk);
    const a = evalB(brawlTeam({ d1: ['dc', 'Darkseid'] }), brawlTeam({ d1: ['dc', 'The Spectre'] }));
    out['combat-high-tier-vs-high-tier'] = {
      bothHaveCredibleOffense: x.score >= 1 && y.score >= 1,
      noAutomaticInvulnerability: x.leverage !== 'negligible' && y.leverage !== 'negligible',
      countersConsidered: Array.isArray(x.steps) && Array.isArray(y.steps),
      noFixedOdds: a.probabilityModel.calibration === 'uncalibrated' && a.sides[0].probabilityRange[0] < a.sides[0].probabilityRange[1],
      reportedUnresolved: a.status === 'provisional',
    };
  }
  { // Sidekick alone
    const T = ocTeam('basketball', { bn: ['dc', 'Robin (Damian Wayne)'] }, 'nba'), L = ledger('basketball', T);
    const robin = OC.getProfile(ocCand('dc', 'Robin (Damian Wayne)'));
    out['bench-sidekick-no-lead'] = {
      lockWithoutLead: entry(L, 'bench-chemistry:sidekick-lock').value === 3 && !entry(L, 'bench-chemistry:lead-reunion'),
      roleTagNotPower: !!robin.role.sidekick && robin.apexRank === 0 && robin.signature === null && !robin.abilityTags.some(t => t.tag === 'sidekick'),
      observedOnce: L.entries.filter(e => e.stackKey === 'bench-chemistry:sidekick-lock').length === 1 && entry(L, 'bench-chemistry:sidekick-lock').appliedBy === 'legacy-observed',
      reconciles: L.reconciliation.ok && L.conflicts.length === 0,
    };
  }
  { // Sidekick reunion
    const starter = ledger('basketball', ocTeam('basketball', { bn: ['dc', 'Robin (Damian Wayne)'], sg: ['dc', 'Batman'] }, 'nba'));
    const coach = ledger('basketball', ocTeam('basketball', { bn: ['dc', 'Robin (Damian Wayne)'], hc: ['dc', 'Batman'] }, 'nba'));
    const big = ocTeam('basketball', { bn: ['dc', 'Robin (Damian Wayne)'], hc: ['dc', 'Batman'], pg: ['dc', 'Nightwing'], sg: ['dc', 'Batgirl (Barbara Gordon)'], sf: ['dc', 'Red Robin (Tim Drake)'], pf: ['dc', 'Alfred Pennyworth'], c: ['dc', 'Superman'] });
    out['bench-sidekick-reunion'] = {
      reunionWithStarter: entry(starter, 'bench-chemistry:lead-reunion').value === 2,
      coachCountsAsLead: entry(coach, 'bench-chemistry:lead-reunion').value === 2,
      capHeld: big.benchChem.percent <= 8 && entry(ledger('basketball', big), 'bench-chemistry-total').cap === 8,
      capReached: big.benchChem.percent === 8,
    };
  }
  { // Non-sidekick mesh
    const T = ocTeam('basketball', { bn: ['nba', 'Stephen Curry'], sg: ['nba', 'Klay Thompson'] }, 'nba'), L = ledger('basketball', T);
    out['bench-group-mesh-non-sidekick'] = {
      curryIsNotSidekick: !isSidekick(ocCand('nba', 'Stephen Curry')),
      meshWithoutTag: !!entry(L, 'bench-chemistry:group-mesh') && !entry(L, 'bench-chemistry:sidekick-lock') && T.benchChem.mesh.includes('Klay Thompson'),
      capHeld: T.benchChem.percent <= 8,
    };
  }
  { // Muppet cross-pool
    const T = ocTeam('basketball', { pg: ['muppets', 'Kermit the Frog'], sg: ['mcu', 'Iron Man'] }, 'nba'), L = ledger('basketball', T);
    const team = L.entries.filter(e => e.stackKey === 'muppetforce-team');
    out['muppet-cross-pool-ensemble'] = {
      singleTeamEntry: team.length === 1 && team[0].value > 0 && team[0].inRating,
      nonMuppetBenefits: team[0].recipients.includes('mcu:Iron Man') && team[0].recipients.includes('nba:Michael Jordan'),
      noTraitTransfer: OC.getProfile(ocCand('mcu', 'Iron Man')).forces.muppet === null,
      notDoubleApplied: L.reconciliation.ok && !L.entries.some(e => e.sourceSystem === 'muppetforce' && e.appliedBy === 'option-c-derived'),
    };
  }
  { // Muppet weights, diminishing returns, cap
    const pct = spec => ocTeam('basketball', spec, 'nba').muppetTeam.percent;
    const one = pct({ pg: ['muppets', 'Kermit the Frog'] }), coach = pct({ hc: ['muppets', 'Kermit the Frog'] }), bench = pct({ bn: ['muppets', 'Kermit the Frog'] });
    const two = pct({ pg: ['muppets', 'Kermit the Frog'], sg: ['muppets', 'Fozzie Bear'] });
    const all = ocTeam('basketball', {}, 'muppets');
    const L = ledger('basketball', ocTeam('basketball', { pg: ['muppets', 'Kermit the Frog'], hc: ['muppets', 'Fozzie Bear'], bn: ['muppets', 'Gonzo'], sg: ['mcu', 'Iron Man'] }, 'nba'));
    const units = L.entries.filter(e => e.stackKey.startsWith('muppetforce-performer:')).map(e => e.unit);
    out['muppet-contribution-weights'] = {
      roleWeightsOrdered: one > coach && coach > bench && bench > 0,
      weightsReported: units.some(u => /starter weight 1/.test(u)) && units.some(u => /coach weight 0.6/.test(u)) && units.some(u => /bench weight 0.35/.test(u)),
      diminishingReturns: two > one && two < 2 * one,
      capHeld: all.muppetTeam.percent <= 22 && entry(ledger('basketball', all), 'muppetforce-team').cap === 22,
      moduleAgrees: L.conflicts.length === 0,
    };
  }
  { // ToonForce is not a team aura
    const T = ocTeam('basketball', { pg: ['toons', 'Bugs Bunny'], sg: ['mcu', 'Iron Man'] }, 'nba'), L = ledger('basketball', T);
    const toon = L.entries.filter(e => e.sourceSystem === 'toonforce');
    out['toonforce-not-team-aura'] = {
      individualOnly: toon.length === 2 && toon.every(e => e.recipients.length === 1 && e.recipients[0] === 'toons:Bugs Bunny'),
      noTeamEntry: !toon.some(e => e.recipients.includes('mcu:Iron Man')) && !L.entries.some(e => e.stackKey === 'toonforce-team'),
      spotlightConditional: entry(L, 'toonforce-spotlight').stage === 'match-conditional' && entry(L, 'toonforce-spotlight').value === null,
      spotlightOnce: L.entries.filter(e => e.stackKey === 'toonforce-spotlight').length === 1,
      ironManNoToon: OC.getProfile(ocCand('mcu', 'Iron Man')).forces.toon === null,
    };
  }
  { // Named chemistry and signatures
    const withPip = ocTeam('basketball', { sg: ['nba', 'Michael Jordan'], sf: ['nba', 'Scottie Pippen'], hc: ['nba', 'Phil Jackson'] }, 'nba');
    const noCoach = ocTeam('basketball', { sg: ['nba', 'Michael Jordan'], sf: ['nba', 'Scottie Pippen'], hc: ['nba', 'Red Auerbach'] }, 'nba');
    // Same roster and coach, only the named partner changes.
    const without = ocTeam('basketball', { sg: ['nba', 'Michael Jordan'], sf: ['nba', 'Larry Bird'], hc: ['nba', 'Red Auerbach'] }, 'nba');
    const L1 = ledger('basketball', withPip), L2 = ledger('basketball', without), L3 = ledger('basketball', noCoach);
    const bulls = e => e.stackKey === 'chemistry-link:nba:bulls';
    out['legacy-signatures-chemistry'] = {
      bullsLinkObserved: L1.entries.some(bulls) && L1.entries.find(bulls).appliedBy === 'legacy-observed',
      signatureObserved: L1.entries.some(e => e.sourceSystem === 'signature' && e.sourceAbilityId === 'The Flu Game'),
      neverReapplied: !L1.entries.some(e => e.appliedBy === 'option-c-derived') && L1.reconciliation.ok,
      partnerChangeIsLocal: L3.entries.some(bulls) && !L2.entries.some(bulls) && L2.summary.muppetPercent === L3.summary.muppetPercent && entry(L2, 'coach-style').sourceCharacterId === entry(L3, 'coach-style').sourceCharacterId && L2.reconciliation.ok,
      coachChangeIsLocal: entry(L1, 'coach-style').sourceCharacterId === 'nba:Phil Jackson' && entry(L3, 'coach-style').sourceCharacterId === 'nba:Red Auerbach' && L3.entries.some(bulls),
    };
  }
  { // Symmetry and purity
    const A = brawlTeam({ d1: ['dc', 'Darkseid'], d2: ['toons', 'Bugs Bunny'] }), B = brawlTeam({ d1: ['dc', 'Batman', 'Hellbat Armor Batman'], bn: ['muppets', 'Kermit the Frog'] });
    const before = JSON.stringify([A, B]);
    const r1 = evalB(A, B), r2 = evalB(A, B), sw = evalB(B, A);
    out['shadow-symmetry'] = {
      complementary: Math.abs(r1.sides[0].probability + r1.sides[1].probability - 1) < 1e-12 && r1.sides[0].probability === sw.sides[1].probability && r1.sides[1].probability === sw.sides[0].probability,
      deterministic: JSON.stringify(r1) === JSON.stringify(r2),
      noMutation: JSON.stringify([A, B]) === before,
    };
  }
  { // Live results unchanged
    const A = ocTeam('basketball', { pg: ['toons', 'Bugs Bunny'], bn: ['dc', 'Robin (Damian Wayne)'] }, 'nba'), B = ocTeam('basketball', { pg: ['muppets', 'Kermit the Frog'] }, 'mcu');
    const run = on => { on ? OC.shadow.enable() : OC.shadow.disable(); OC.shadow.clear(); const r = rngFrom('bench:parity'); const games = []; for (let k = 0; k < 40; k++) games.push(playGame('basketball', A, B, 2.5, r, k % 2 === 1)); const tail = r(); const n = OC.shadow.records().length; OC.shadow.disable(); return { text: JSON.stringify(games), tail, n }; };
    const off = run(false), on = run(true);
    out['shadow-no-live-result-change'] = {
      offByDefault: DA_OPTION_C.shadow.enabled === false,
      identicalResults: off.text === on.text,
      identicalRngStream: off.tail === on.tail,
      recordedOnlyWhenOn: off.n === 0 && on.n === 40,
      h2hIdentical: (() => { const x = JSON.stringify(simH2H('basketball', A, B, 'low', 'CT492')); OC.shadow.enable(); const y = JSON.stringify(simH2H('basketball', A, B, 'low', 'CT492')); OC.shadow.disable(); OC.shadow.clear(); return x === y; })(),
    };
  }
  { // Superman flight in basketball
    const r = apps('basketball', 'dc', 'Superman', 'c', 'flight'), by = id => r.find(x => x.ruleId === id);
    out['sport-basketball-flight-rules'] = {
      coverageLegal: by('flight-off-ball-coverage').ruling === 'allowed',
      travelingStillApplies: by('flight-basketball-carry').ruling === 'prohibited' && by('flight-basketball-goaltend').ruling === 'prohibited',
      ambiguityIsNeedsReview: by('flight-basketball-air-dribble').ruling === 'needs-review' && by('flight-basketball-air-dribble').grantsAdvantage === false,
      noSilentAdvantage: r.every(x => x.effect === null || x.effect.appliedToRating === false),
      reportedUnresolved: r.some(x => x.ruling === 'needs-review'),
    };
  }
  { // Doctor Strange portals in football
    const r = apps('football', 'mcu', 'Doctor Strange', 'qb', 'portals');
    out['sport-football-portal-rules'] = {
      capabilityOnRecord: r[0].capability.possessed === 'documented',
      notALegalPass: r.every(x => x.ruling === 'needs-review'),
      noBuff: r.every(x => x.grantsAdvantage === false && x.effect === null),
      reportedUnresolved: r.some(x => x.ruleId === 'portal-football-forward-pass'),
    };
  }
  { // Scarlet Witch telekinesis in basketball
    const r = apps('basketball', 'mcu', 'Scarlet Witch', 'sg', 'telekinesis');
    const none = apps('basketball', 'nba', 'Michael Jordan', 'sg', 'telekinesis');
    out['sport-basketball-telekinesis-rules'] = {
      capabilityFromIndex: r[0].capability.possessed === 'documented' && /telekinesis/.test(r[0].capability.basis),
      contactFreeNotAccepted: r.every(x => x.ruling === 'needs-review' && x.grantsAdvantage === false),
      unknownIsNotNo: none[0].capability.possessed === 'unknown' && none.every(x => x.grantsAdvantage === false),
      reportedUnresolved: r.length >= 1,
    };
  }
  { // Spider-Man as libero
    const r = apps('volleyball', 'mcu', 'Spider-Man', 'lib', 'danger-sense')[0];
    const T = ocTeam('volleyball', { lib: ['mcu', 'Spider-Man'] }, 'nba'), O = ocTeam('volleyball', {}, 'mcu');
    const a = OC.evaluateMatchup({ sportKey: 'volleyball', teamA: T, teamB: O });
    const box = daBoxScore('volleyball', T, 3, 'oc-libero', { note: '25-20, 25-22, 25-19' });
    const lib = box.find(x => x.position === 'lib'), labels = lib.stats.map(s => s[0]);
    out['sport-volleyball-libero-restrictions'] = {
      anticipationLegal: r.ruling === 'allowed' && r.advantage === 'recognized' && r.effect.positionRelevance === 'high',
      restrictionReported: a.positionRestrictions.some(x => x.ruleId === 'volleyball-libero-no-attack-or-block' && x.character === 'mcu:Spider-Man' && x.ruling === 'prohibited'),
      boxScoreHasNoKillsOrBlocks: !labels.includes('KILLS') && !labels.includes('BLK'),
      strengthDoesNotUnlockAttack: a.sides[0].constraints.some(c => c.ruleId === 'volleyball-libero-no-attack-or-block'),
      ratingUntouched: r.effect.appliedToRating === false,
    };
  }
  { // Middle blocker restrictions and PTS
    const T = ocTeam('volleyball', {}, 'nba');
    const box = daBoxScore('volleyball', T, 3, 'oc-middle', { note: '25-20, 25-22, 25-19' });
    const stat = (row, k) => { const s = row.stats.find(x => x[0] === k); return s ? s[1] : 0; };
    const mids = box.filter(x => x.position === 'mb1' || x.position === 'mb2');
    const active = box.filter(x => !['bn', 'hc'].includes(x.position));
    out['sport-volleyball-middle-restrictions'] = {
      middlesHaveNoDigs: mids.length === 2 && mids.every(m => !m.stats.some(s => s[0] === 'DIG' || s[0] === 'DIGS')),
      pointsFormula: active.every(r => stat(r, 'PTS') === stat(r, 'KILLS') + stat(r, 'BLK') + stat(r, 'ACE')),
      ruleListed: OC.positionRules.some(r => r.id === 'volleyball-middle-no-digs' && r.statEligibility.digs === false),
    };
  }
  { // Position-specific value
    const rel = (sport, posId) => apps(sport, 'mcu', 'Spider-Man', posId, 'danger-sense')[0].effect;
    const lib = rel('volleyball', 'lib'), set = rel('volleyball', 's'), gk = rel('soccer', 'gk'), st = rel('soccer', 'st');
    const spidey = OC.getProfile(ocCand('mcu', 'Spider-Man'));
    out['sports-position-specific-value'] = {
      differsByPosition: lib.positionRelevance === 'high' && gk.positionRelevance === 'high' && set.positionRelevance === 'low' && lib.positionWeightShare > st.positionWeightShare,
      numericBaselineKept: spidey.attributes.ref === 99 && fitIn('volleyball', ocCand('mcu', 'Spider-Man'), posOf('volleyball', 'lib')) > 0,
      noCombatTierUsed: lib.duty === 'anticipation' && spidey.apexRank === 0,
    };
  }
  { // Added in PR 1: unreviewed form inherits nothing
    const form = CAMPAIGN_VARIANTS['dc:Batman'].find(f => !DA_VARIANT_ABILITY_PROFILES['dc:Batman|' + f.name]);
    const p = prof('dc', 'Batman', form.name);
    out['combat-unreviewed-form-no-powers'] = {
      formExists: !!form,
      noInventedPower: p.variantReviewed === false && p.signature === null && p.apexRank === 0 && p.guards.length === 0,
      markedUnknown: p.evidence.combat === 'unknown',
      baseTagsNotCopiedAsFact: p.abilityTags.every(t => t.status === 'needs-review' && t.inheritedFromBase),
    };
  }
  { // Added in PR 1: undocumented ability is unknown, not absent
    const mj = OC.getProfile(ocCand('nba', 'Michael Jordan'));
    const fl = apps('basketball', 'nba', 'Michael Jordan', 'sg', 'flight');
    const a = evalB(brawlTeam({ d1: ['dc', 'Black Adam'] }), brawlTeam({}));
    out['evidence-undocumented-ability-unknown'] = {
      capabilityUnknown: fl[0].capability.possessed === 'unknown' && fl[0].capability.status === 'unknown',
      noGrant: fl.every(x => x.grantsAdvantage === false),
      gapRecorded: mj.evidence.gaps.length > 0 && mj.evidence.combat !== 'reviewed',
      evaluatorSaysSo: a.uncertainties.some(u => u.kind === 'unresearched-kits'),
    };
  }
  { // Added in PR 1: coach and commander
    const T = brawlTeam({ cmd: ['mcu', 'Nick Fury'] }), L = ledger('brawl', T);
    const B = ocTeam('basketball', { hc: ['nba', 'Phil Jackson'] }, 'nba'), LB = ledger('basketball', B);
    out['coach-commander-effects'] = {
      commanderObserved: entry(L, 'coach-multiplier').sourceCharacterId === 'mcu:Nick Fury' && /Commander/.test(entry(L, 'coach-multiplier').reason),
      coachObserved: /Head coach/.test(entry(LB, 'coach-multiplier').reason) && entry(LB, 'coach-style').inRating,
      insideBaselineOnce: entry(L, 'coach-multiplier').alreadyApplied === 'inside-position-fit-baseline' && !entry(L, 'coach-multiplier').inRating && L.reconciliation.ok && LB.reconciliation.ok,
      noForceInCoachSlot: !ledger('basketball', ocTeam('basketball', { hc: ['toons', 'Bugs Bunny'] }, 'nba')).entries.some(e => e.stackKey.startsWith('toonforce-individual')),
    };
  }
  { // Added in PR 1: derived findings never become rating bonuses
    const a = evalB(brawlTeam({ d1: ['dc', 'Darkseid'] }), brawlTeam({ d1: ['dc', 'The Spectre'] }));
    const derived = a.effectLedger.filter(e => e.appliedBy === 'option-c-derived');
    out['ledger-derived-never-rating'] = {
      hasDerived: derived.length > 0,
      onlyProbabilityKinds: derived.every(e => e.effectKind === 'probability-interaction' && e.inRating === false),
      overlapDeclared: derived.some(e => e.overlaps.some(k => k.startsWith('exceptional-power:'))),
      ledgerValid: a.ledgerChecks.validation.ok && a.ledgerChecks.reconciliation.every(r => r.ok),
    };
  }
  return JSON.stringify(out);
})()`;

function runBenchmarks(app) {
  const page = app || loadApp();
  const raw = JSON.parse(page.run(PAGE));
  return registry.cases.map(c => {
    const checks = raw[c.id];
    if (!checks) return { id: c.id, mode: c.mode, category: c.category, registryState: c.reviewState, outcome: 'fail', failed: ['no executable fixture'], checks: {} };
    const failed = Object.entries(checks).filter(([, ok]) => ok !== true).map(([k]) => k);
    const outcome = failed.length ? 'fail' : c.reviewState === 'needs-review' ? 'needs-review' : 'pass';
    return { id: c.id, mode: c.mode, category: c.category, registryState: c.reviewState, outcome, failed, checks, uncertainty: c.uncertainty || null };
  });
}

module.exports = { registry, runBenchmarks };

/* Option C — Matchup Evaluator and shadow-mode debug adapter.
 *
 *   DA_OPTION_C.evaluateMatchup({ sportKey, teamA, teamB, rulesetId, scenarioId,
 *                                 mode: 'shadow', teamNames, context })
 *
 * teamA / teamB are complete Version 1 `teamScore()` results. The evaluator is
 * a pure function of its arguments: no RNG (live or otherwise), no storage, no
 * network, no mutation of the objects it is given, and a JSON-serializable
 * result. Swapping the teams swaps the side records and nothing else.
 *
 * SHADOW MODE: `DA_OPTION_C.shadow` is OFF by default. When a developer turns
 * it on, the live `playGame()` hands it the finished result to compare; the
 * comparison lives only in page memory. It cannot change a winner, score,
 * statistic, HP, RNG stream, saved game or multiplayer document.
 */
(function (root) {
  'use strict';
  const NS = root.DA_OPTION_C_MODULES || (root.DA_OPTION_C_MODULES = {});
  const isNode = typeof module !== 'undefined' && !!module.exports && typeof require === 'function';
  const need = (name, file) => NS[name] || (isNode ? require(file) : null);
  const RT = need('runtime', './runtime.js');
  const PA = need('profileAdapter', './profile-adapter.js');
  const IE = need('interactionEngine', './interaction-engine.js');
  const SR = need('sportRules', './sport-rules.js');
  const TL = need('teamLedger', './team-ledger.js');
  const PR = need('probability', './probability.js');
  const EX = need('explain', './explain.js');
  const LG = need('researchLedger', './research-ledger.js');
  const { EVIDENCE } = RT;
  const SPORT_KEYS = Object.freeze(['basketball', 'football', 'soccer', 'baseball', 'hockey', 'volleyball', 'brawl']);

  function normalizeTeam(score, label) {
    if (!score || !Array.isArray(score.rows)) throw new Error('Option C: ' + label + ' must be a teamScore() result with rows');
    return score.rows.filter(r => r && r.cand && r.pos).map(r => ({
      pos: r.pos, role: r.pos.coach ? 'coach' : r.pos.bench ? 'bench' : 'starter',
      fit: RT.round(Number(r.fit) || 0, 3), profile: PA.getProfile(r.cand),
    }));
  }
  const num = v => (Number.isFinite(Number(v)) ? Number(v) : 0);

  function evaluateMatchup(input) {
    const { sportKey, teamA, teamB } = input || {};
    if (!SPORT_KEYS.includes(sportKey)) throw new Error('Option C: unknown sportKey ' + sportKey);
    if ((input.mode || 'shadow') !== 'shadow') throw new Error('Option C: only mode "shadow" exists in this version');
    const brawl = sportKey === 'brawl';
    const keys = ['A', 'B'], teams = [teamA, teamB];
    const names = Array.isArray(input.teamNames) && input.teamNames.length === 2 ? input.teamNames.map(String) : ['Team A', 'Team B'];
    const context = input.context || {};
    const rows = [normalizeTeam(teamA, 'teamA'), normalizeTeam(teamB, 'teamB')];
    const active = rows.map(rs => rs.filter(r => r.role === 'starter'));

    /* Whole-team effect ledger (observed partition). */
    const ledgers = [0, 1].map(i => TL.observeTeam({ teamKey: keys[i], sportKey, score: teams[i], opponent: teams[1 - i] }));

    /* Deterministic match-stage effects Version 1 already applies. */
    const val = (i, key) => { const e = ledgers[i].entries.find(x => x.stackKey === key); return e && e.value != null ? e.value : 0; };
    const effectiveRating = [0, 1].map(i => num(teams[i].rating) + val(1 - i, 'signature-chaos-total') + val(i, 'variant-encounter-total'));

    /* Typed interactions (Battle Royale) or officiating (sports). */
    const battle = brawl ? IE.assessBattle(active[0].map(r => r.profile), active[1].map(r => r.profile)) : null;
    const rulings = brawl ? null : [0, 1].map(i => SR.evaluateLineup({ sportKey, rows: active[i], opponents: active[1 - i].map(r => r.profile) }));

    /* Evidence coverage. */
    const fighters = active[0].concat(active[1]);
    const count = s => fighters.filter(r => r.profile.evidence.combat === s).length;
    const typed = count(EVIDENCE.REVIEWED);
    const coverage = fighters.length ? typed / fighters.length : 0;
    // Continuity matters where abilities are being judged: every fighter in
    // Battle Royale; in sports, the players who bring a supernatural capability.
    const continuityOpen = fighters.filter(r => r.profile.continuity.status === EVIDENCE.NEEDS_REVIEW &&
      (brawl || SR.capabilitiesOf(r.profile).length > 0)).map(r => r.profile.key);
    const unresolved = brawl ? [] : rulings.flatMap((r, i) => r.applications.filter(a => a.ruling === SR.RULING.NEEDS_REVIEW)
      .map(a => ({ teamKey: keys[i], character: a.character, ruleId: a.ruleId, action: a.action, reason: a.reason })));
    const pendingEvidence = brawl ? [] : rulings.flatMap((r, i) => r.applications.filter(a => a.advantage === 'pending-capability-review')
      .map(a => ({ teamKey: keys[i], character: a.character, capability: a.capability.kind })));
    const seeded = ledgers.some(l => l.entries.some(e => e.stage === 'match-conditional'));

    const estimate = PR.estimate({
      sportKey, effectiveRating, coverage, sigma: context.sigma,
      interactionIndex: battle ? [battle.a.index, battle.b.index] : null,
      flags: { continuity: continuityOpen.length > 0, seededEvents: seeded, unresolvedRulings: unresolved.length > 0 },
    });
    // No typed profile at all: say so instead of dressing the numeric baseline up as analysis.
    const status = brawl && typed === 0 ? 'insufficient-evidence' : 'provisional';

    /* Derived partition: qualitative findings, never rating bonuses. */
    if (battle) {
      [[battle.ab, 0], [battle.ba, 1]].forEach(([m, i]) => m.forEach((row, x) => row.forEach(t => {
        if (t.score === 0) return;
        const pos = active[i][x].pos.id, overlaps = [];
        if (ledgers[i].has('exceptional-power:' + pos)) overlaps.push('exceptional-power:' + pos);
        if (ledgers[i].has('apex-form:' + pos)) overlaps.push('apex-form:' + pos);
        if (ledgers[i].has('toonforce-individual:' + pos)) overlaps.push('toonforce-individual:' + pos);
        ledgers[i].add({ stackKey: 'interaction:' + t.attacker + '->' + t.defender, sourceSystem: 'option-c-interaction-engine',
          sourceCharacterId: t.attacker, sourceAbilityId: t.via, trigger: 'this attacker against this defender', recipients: [t.attacker],
          stage: 'option-c', appliedBy: TL.APPLIED.DERIVED, effectKind: TL.KIND.PROB, value: t.score, unit: 'leverage steps (-2..2)',
          alreadyApplied: 'no (shadow estimate only)', reason: t.attackerName + ' has ' + t.leverage + ' leverage on ' + t.defenderName + ' via ' + t.via + '.',
          limitations: ['Feeds the shadow probability estimate only; adds nothing to Version 1 ratings, damage or HP.'],
          overlaps });
      })));
    } else {
      rulings.forEach((r, i) => r.applications.forEach(a => {
        ledgers[i].add({ stackKey: 'sport-ruling:' + a.character + ':' + (a.ruleId || a.capability.kind) + ':' + a.position,
          sourceSystem: 'option-c-sport-rules', sourceCharacterId: a.character, sourceAbilityId: a.capability.kind,
          trigger: a.action || 'capability without an officiating entry', recipients: [a.character], stage: 'option-c',
          appliedBy: a.ruling === SR.RULING.ALLOWED ? TL.APPLIED.DERIVED : TL.APPLIED.INFO,
          effectKind: a.ruling === SR.RULING.PROHIBITED ? TL.KIND.PROHIBITED : TL.KIND.TACTICAL, value: null,
          alreadyApplied: 'no (reported only)', sourceEvidence: a.capability.source, continuity: a.capability.continuity,
          reason: '[' + a.ruling + '] ' + a.reason, limitations: [a.advantage === 'recognized' ? 'Recognized qualitatively; unweighted in shadow mode.' : 'No advantage granted.'] });
      }));
    }
    const effectLedger = ledgers[0].entries.concat(ledgers[1].entries);

    /* Explanations per side. */
    const sides = [0, 1].map(i => {
      const o = 1 - i;
      const told = brawl
        ? EX.brawlSide({ rows: active[i], foes: active[o], matrix: i === 0 ? battle.ab : battle.ba, foeMatrix: i === 0 ? battle.ba : battle.ab,
          own: i === 0 ? battle.a : battle.b, summary: ledgers[i].summary, ledgerEntries: ledgers[i].entries, trailing: effectiveRating[i] < effectiveRating[o] })
        : EX.sportSide({ rows: rows[i], foeRows: rows[o], rulings: rulings[i], summary: ledgers[i].summary, ledgerEntries: ledgers[i].entries });
      const edge = effectiveRating[i] - effectiveRating[o];
      if (edge > 0) told.advantages.push({ kind: 'numeric-baseline', character: null, weight: RT.round(Math.abs(estimate.perSide[i].numericLogit), 2),
        text: 'Numeric baseline: +' + RT.round(edge, 2) + ' effective rating points (position fits, coach, bench, chemistry, signatures, variants, MuppetForce and bench chemistry, each counted once).' });
      told.advantages.sort((a, b) => b.weight - a.weight || (a.text < b.text ? -1 : a.text > b.text ? 1 : 0));
      return {
        teamKey: keys[i], name: names[i],
        probability: estimate.probability[i], probabilityRange: estimate.range[i],
        rating: RT.round(num(teams[i].rating), 4), model: estimate.perSide[i],
        lineup: rows[i].map(EX.characterSummary),
        teamEffects: ledgers[i].summary,
        advantages: told.advantages, winConditions: told.winConditions, risks: told.risks, constraints: told.constraints,
      };
    });

    const decisiveFactors = sides.flatMap(s => s.advantages.filter(a => a.weight > 0).map(a => ({ teamKey: s.teamKey, kind: a.kind, weight: a.weight, text: a.text })))
      .sort((a, b) => b.weight - a.weight || (a.text < b.text ? -1 : a.text > b.text ? 1 : 0)).slice(0, 8);

    const uncertainties = [];
    const unknownKits = fighters.filter(r => r.profile.evidence.combat !== EVIDENCE.REVIEWED).map(r => r.profile.displayName);
    if (brawl && unknownKits.length) uncertainties.push({ kind: 'unresearched-kits', impact: 'high', text: 'No typed combat profile for ' + RT.uniq(unknownKits).sort().join(', ') + '. Their real abilities could change this estimate (research issues #82/#83).' });
    if (continuityOpen.length) uncertainties.push({ kind: 'continuity', impact: 'medium', text: 'Continuity is not adjudicated for ' + RT.uniq(continuityOpen).sort().join(', ') + '; feats from another adaptation are not assumed.' });
    for (const u of unresolved) uncertainties.push({ kind: 'officiating', impact: 'medium', teamKey: u.teamKey, text: u.character + ': "' + u.action + '" has no approved ruling (' + u.ruleId + '). ' + u.reason });
    for (const u of pendingEvidence) uncertainties.push({ kind: 'capability-evidence', impact: 'low', teamKey: u.teamKey, text: u.character + ': ' + u.capability + ' is granted in the ability index but its evidence still needs review.' });
    if (seeded) uncertainties.push({ kind: 'seeded-events', impact: 'low', text: 'Bench heat, playoff boom/clutch and ToonForce spotlight are seeded per match and are not rolled here.' });
    uncertainties.push({ kind: 'calibration', impact: 'medium', text: 'The probability model is a first-pass, uncalibrated editorial model.' });
    const conflicts = ledgers.flatMap((l, i) => l.conflicts.map(c => ({ teamKey: keys[i], ...c })))
      .concat(rows.flatMap((rs, i) => rs.flatMap(r => r.profile.deniedTags.map(d => ({ teamKey: keys[i], system: 'ability-index', detail: r.profile.key + ': tag "' + d.tag + '" was reviewed and rejected. ' + d.reason })))));

    return {
      schemaVersion: RT.SCHEMA_VERSION, modelVersion: RT.MODEL_VERSION, mode: 'shadow', liveImpact: 'none',
      status, sportKey, rulesetId: input.rulesetId || (brawl ? 'brawl-v1' : SR.RULESET_ID), scenarioId: input.scenarioId || null,
      headline: EX.headline({ names, probability: estimate.probability, favoredIndex: estimate.favoredIndex, basis: estimate.basis, status }),
      favored: estimate.favoredIndex < 0 ? null : keys[estimate.favoredIndex],
      probabilityModel: { id: estimate.model, calibration: estimate.calibration, basis: estimate.basis, precision: estimate.precision,
        scale: estimate.scale, qualitativeWeight: estimate.qualitativeWeight, label: estimate.label, howToRead: estimate.howToRead },
      sides,
      evidence: brawl ? {
        scope: 'combat-profiles', fighters: fighters.length,
        reviewed: typed, provisional: count(EVIDENCE.PROVISIONAL), unknown: count(EVIDENCE.UNKNOWN),
        needsReview: count(EVIDENCE.NEEDS_REVIEW), contradicted: count(EVIDENCE.CONTRADICTED),
        typedCoverage: RT.round(coverage, 3), continuityNeedsReview: RT.uniq(continuityOpen).length,
        unresolvedRulings: 0, conflicts,
      } : {
        scope: 'sport-capabilities', players: fighters.length,
        playersWithCapabilities: fighters.filter(r => SR.capabilitiesOf(r.profile).length > 0).length,
        applications: rulings.reduce((n, r) => n + r.applications.length, 0),
        recognized: rulings.reduce((n, r) => n + r.applications.filter(a => a.advantage === 'recognized').length, 0),
        pendingCapabilityReview: pendingEvidence.length,
        prohibited: rulings.reduce((n, r) => n + r.applications.filter(a => a.ruling === SR.RULING.PROHIBITED).length, 0),
        unknown: 0, reviewed: 0,
        typedCoverage: null, continuityNeedsReview: RT.uniq(continuityOpen).length,
        unresolvedRulings: unresolved.length, conflicts,
      },
      decisiveFactors, uncertainties,
      /* Report-only (shadow parity): coverage of validated research for the
       * evaluated identities. It does not influence any probability above. */
      researchCoverage: LG.shared.size() === 0 ? null : LG.shared.coverage(rows.flat().map(r => r.profile.key)),
      interactions: battle ? [[battle.ab, 'A', 'B'], [battle.ba, 'B', 'A']].flatMap(([m, at, df]) => m.flat().map(t => ({ attackerTeam: at, defenderTeam: df, ...t }))) : [],
      initiative: battle ? battle.initiative : [],
      sportRulings: rulings ? rulings.flatMap((r, i) => r.applications.map(a => ({ teamKey: keys[i], ...a }))) : [],
      positionRestrictions: rulings ? rulings.flatMap((r, i) => r.restrictions.map(a => ({ teamKey: keys[i], ...a }))) : [],
      effectLedger,
      ledgerChecks: {
        reconciliation: [0, 1].map(i => ({ teamKey: keys[i], ...ledgers[i].reconciliation })),
        validation: TL.validate(effectLedger),
        doubleCountGuard: 'Legacy effects are observed (legacy-observed) and reconcile to the Version 1 rating; Option C findings are probability-interaction/tactical only.',
      },
      notes: [
        'Shadow assessment only: the live Version 1 engine decides every result.',
        'Probabilities are editorial game estimates, not canonical or measured values.',
        'Character research (#82) and the combat atlas (#83) are incomplete; unknown abilities stay unknown.',
      ],
    };
  }

  /* ------------------------------------------------------------------ *
   * Shadow recorder: default OFF, in-memory only, never throws outward. *
   * ------------------------------------------------------------------ */
  const shadowState = { enabled: false, records: [], errors: 0, max: 400, cache: new WeakMap() };
  function cachedAssessment(sportKey, A, B) {
    let m = shadowState.cache.get(A); if (!m) { m = new WeakMap(); shadowState.cache.set(A, m); }
    let bySport = m.get(B); if (!bySport) { bySport = {}; m.set(B, bySport); }
    return bySport[sportKey] || (bySport[sportKey] = evaluateMatchup({ sportKey, teamA: A, teamB: B, mode: 'shadow' }));
  }
  const shadow = {
    get enabled() { return shadowState.enabled; },
    enable() { shadowState.enabled = true; return 'Option C shadow mode ON (this page only; nothing is saved or shared).'; },
    disable() { shadowState.enabled = false; return 'Option C shadow mode OFF.'; },
    clear() { shadowState.records.length = 0; shadowState.errors = 0; shadowState.cache = new WeakMap(); },
    /* Called by playGame() AFTER the live result is final. Reads only. */
    observe(sportKey, A, B, result, meta) {
      if (!shadowState.enabled) return;
      try {
        const a = cachedAssessment(sportKey, A, B);
        const w = result && (result.winner === 0 || result.winner === 1) ? result.winner : null;
        shadowState.records.push({
          sportKey, playoff: !!(meta && meta.playoff), legacyWinner: w === null ? null : w === 0 ? 'A' : 'B',
          legacyLine: result && Array.isArray(result.line) ? result.line.slice(0, 3) : null,
          optionCFavored: a.favored, optionCProbabilityA: a.sides[0].probability, optionCStatus: a.status, optionCBasis: a.probabilityModel.basis,
          agrees: a.favored === null || w === null ? null : a.favored === (w === 0 ? 'A' : 'B'),
          assessment: a,
        });
        if (shadowState.records.length > shadowState.max) shadowState.records.splice(0, shadowState.records.length - shadowState.max);
      } catch (e) { shadowState.errors++; }
    },
    records() { return shadowState.records.slice(); },
    report() {
      const rs = shadowState.records, decided = rs.filter(r => r.agrees !== null);
      return { enabled: shadowState.enabled, games: rs.length, errors: shadowState.errors,
        comparable: decided.length, agree: decided.filter(r => r.agrees).length,
        disagreements: decided.filter(r => !r.agrees).map(r => ({ sportKey: r.sportKey, legacyWinner: r.legacyWinner, optionCFavored: r.optionCFavored, optionCProbabilityA: r.optionCProbabilityA, status: r.optionCStatus })),
        note: 'A single seeded game disagreeing with a probability is expected; compare frequencies with compare().' };
    },
    /* Developer comparison: replays the legacy engine on PRIVATE seeded RNGs
     * (never the live one) and sets the win frequency beside Option C's estimate. */
    compare(sportKey, A, B, options) {
      const play = root.playGame, mk = root.rngFrom;
      if (typeof play !== 'function' || typeof mk !== 'function') throw new Error('compare() needs the game page (playGame/rngFrom)');
      const o = options || {}, n = Math.max(1, Math.min(2000, o.seeds || 200)), sigma = o.sigma == null ? 0 : o.sigma;
      let winsA = 0;
      for (let k = 0; k < n; k++) if (play(sportKey, A, B, sigma, mk('option-c-compare:' + (o.label || '') + ':' + k), !!o.playoff).winner === 0) winsA++;
      const assessment = evaluateMatchup({ sportKey, teamA: A, teamB: B, mode: 'shadow', teamNames: o.teamNames, context: { sigma } });
      const legacy = winsA / n, pA = assessment.sides[0].probability, range = assessment.sides[0].probabilityRange;
      return { sportKey, seeds: n, sigma, legacyWinRateA: RT.round(legacy, 4), optionCProbabilityA: pA, optionCRangeA: range,
        // Compare the raw observed frequency. Clamping it to the model's 5%-95%
        // reporting bounds would falsely mark 0/100% samples as "within range".
        withinRange: PR.withinRange(legacy, range),
        sameFavorite: (legacy > 0.5) === (pA > 0.5) || pA === 0.5 || legacy === 0.5,
        status: assessment.status, basis: assessment.probabilityModel.basis, assessment };
    },
  };
  // Opt-in for a single page load, for developers: ?optionCShadow=1
  try { if (root.location && /[?&]optionCShadow=1(&|$)/.test(String(root.location.search || ''))) shadowState.enabled = true; } catch (e) { /* ignore */ }

  const api = {
    schemaVersion: RT.SCHEMA_VERSION, modelVersion: RT.MODEL_VERSION, SPORT_KEYS,
    evaluateMatchup,
    getProfile: PA.getProfile, getProfileById: PA.getProfileById,
    assessThreat: IE.assessThreat, interactionRules: IE.RULES,
    evaluateSportApplication: SR.evaluateApplication, sportRulebook: SR.RULEBOOK, positionRules: SR.POSITION_RULES,
    observeTeamEffects: TL.observeTeam, validateLedger: TL.validate,
    probabilityModel: PR.MODEL,
    shadow,
  };
  root.DA_OPTION_C = api;
  NS.evaluator = api;
  if (isNode) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

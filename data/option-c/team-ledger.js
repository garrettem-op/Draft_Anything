/* Option C — Team Intelligence Engine: the unified effect ledger.
 *
 * Reads a complete Version 1 `teamScore()` result (starters, coach/commander,
 * bench/reinforcement, selected variants) and records every collective and
 * individual effect ONCE: where it comes from, who receives it, when it
 * activates, its cap and stacking identity, and whether Version 1 has already
 * applied it.
 *
 * Two partitions:
 *   legacy-observed   — effects Version 1 already computed. They are OBSERVED
 *                       here, never re-applied. Team-score-stage entries with
 *                       `inRating: true` must add up to `score.rating` exactly.
 *   option-c-derived  — new qualitative findings. They may only be
 *                       `probability-interaction`/`tactical`; a derived entry
 *                       can never be a rating bonus.
 * A second entry with an existing stack key is recorded as `blocked`.
 *
 * Owner-approved values (8% bench chemistry cap, 22% MuppetForce cap, sidekick
 * lock without the lead, ToonForce as an individual effect) are read from the
 * existing modules and cross-checked against them, not redefined.
 */
(function (root) {
  'use strict';
  const NS = root.DA_OPTION_C_MODULES || (root.DA_OPTION_C_MODULES = {});
  const isNode = typeof module !== 'undefined' && !!module.exports && typeof require === 'function';
  const RT = NS.runtime || (isNode ? require('./runtime.js') : null);

  const APPLIED = Object.freeze({ OBSERVED: 'legacy-observed', DERIVED: 'option-c-derived', BLOCKED: 'blocked', INFO: 'informational' });
  const KIND = Object.freeze({ ADD: 'rating-add', MULT: 'rating-multiplier', PROB: 'probability-interaction', TACTICAL: 'tactical', PROHIBITED: 'rule-prohibited', OTHER: 'other' });
  /* Muppet ensemble contribution weights applied inside muppetForceTeamwork();
   * mirrored for per-performer reporting and verified against that function. */
  const MUPPET_WEIGHT = Object.freeze({ starter: 1, coach: 0.6, bench: 0.35 });
  const TOL = 1e-6;

  const cid = c => (c ? String(c.pool) + ':' + String(c.variantBase || c.n) + (c.variantBase ? '|' + c.n : '') : null);
  const slotRole = pos => (pos.coach ? 'coach' : pos.bench ? 'bench' : 'starter');

  function createLedger(teamKey, sportKey) {
    const entries = [], keys = new Set();
    function add(e) {
      const entry = {
        id: teamKey + ':' + e.stackKey, teamKey, sportKey,
        sourceSystem: e.sourceSystem, sourceCharacterId: e.sourceCharacterId || null, sourceAbilityId: e.sourceAbilityId || null,
        trigger: e.trigger, conditions: e.conditions || [], recipients: e.recipients || [],
        stage: e.stage, appliedBy: e.appliedBy, effectKind: e.effectKind,
        value: e.value == null ? null : e.value, unit: e.unit || null,
        capGroup: e.capGroup || null, cap: e.cap == null ? null : e.cap,
        stackKey: e.stackKey, alreadyApplied: e.alreadyApplied || 'no', inRating: !!e.inRating,
        sourceEvidence: e.sourceEvidence || null, continuity: e.continuity || null,
        reason: e.reason, limitations: e.limitations || [], overlaps: e.overlaps || [],
      };
      if (keys.has(entry.stackKey)) {
        entry.id += '#duplicate';
        entry.appliedBy = APPLIED.BLOCKED; entry.inRating = false;
        entry.reason = 'Blocked: an effect with stack key "' + entry.stackKey + '" is already in the ledger. ' + entry.reason;
      } else {
        // A derived finding may never masquerade as a rating bonus.
        if (entry.appliedBy === APPLIED.DERIVED && (entry.effectKind === KIND.ADD || entry.effectKind === KIND.MULT)) {
          entry.appliedBy = APPLIED.BLOCKED; entry.inRating = false;
          entry.reason = 'Blocked: Option C findings cannot add to Version 1 ratings in shadow mode. ' + entry.reason;
        }
        keys.add(entry.stackKey);
      }
      entries.push(entry);
      return entry;
    }
    return { entries, add, has: k => keys.has(k) };
  }

  /* Observe one team. `score` is a teamScore() result; `opponent` the other. */
  function observeTeam({ teamKey, sportKey, score, opponent }) {
    const L = RT.legacy();
    const ledger = createLedger(teamKey, sportKey);
    const conflicts = [];
    const rows = (score.rows || []).filter(r => r && r.cand);
    const positions = (score.rows || []).map(r => r.pos);
    const roster = Object.fromEntries(rows.map(r => [r.pos.id, r.cand]));
    const active = rows.filter(r => !r.pos.coach && !r.pos.bench);
    const everyone = rows.map(r => cid(r.cand));
    const starters = active.map(r => cid(r.cand));
    const obs = (e) => ledger.add({ appliedBy: APPLIED.OBSERVED, alreadyApplied: 'in-team-rating', ...e });
    const num = v => (Number.isFinite(Number(v)) ? Number(v) : 0);

    /* 1. Position-fit baseline and the coach / bench multipliers. */
    const core = num(score.playerScore) * num(score.mult);
    obs({ stackKey: 'position-fit-baseline', sourceSystem: 'numeric-attributes', trigger: 'always', recipients: starters,
      stage: 'team-score', effectKind: KIND.ADD, value: RT.round(core, 6), unit: 'rating points', inRating: true,
      reason: 'Importance-weighted 12-attribute position fits of the starters (' + RT.round(num(score.playerScore), 3) + ') times the coach and bench multipliers (' + RT.round(num(score.mult), 4) + ').',
      limitations: ['Individual force multipliers and exceptional-power points listed below are already inside these fits.'] });
    const coachRow = rows.find(r => r.pos.coach), benchRow = rows.find(r => r.pos.bench);
    obs({ stackKey: 'coach-multiplier', sourceSystem: 'coach', sourceCharacterId: coachRow ? cid(coachRow.cand) : null,
      trigger: coachRow ? 'coach/commander slot filled' : 'empty coach slot uses the default fit', recipients: starters,
      stage: 'position-fit', effectKind: KIND.MULT, value: null, unit: 'multiplier (inside position-fit-baseline)',
      alreadyApplied: 'inside-position-fit-baseline',
      reason: (sportKey === 'brawl' ? 'Commander' : 'Head coach') + ' fit ' + RT.round(num(score.coachFit), 2) + ' scales every starter; combined coach x bench multiplier is ' + RT.round(num(score.mult), 4) + '.' });
    obs({ stackKey: 'bench-multiplier', sourceSystem: 'bench', sourceCharacterId: benchRow ? cid(benchRow.cand) : null,
      trigger: benchRow ? 'bench/reinforcement slot filled' : 'empty bench slot uses the default fit', recipients: starters,
      stage: 'position-fit', effectKind: KIND.MULT, value: null, unit: 'multiplier (inside position-fit-baseline)',
      alreadyApplied: 'inside-position-fit-baseline',
      reason: (sportKey === 'brawl' ? 'Reinforcement' : 'Bench Spark') + ' fit ' + RT.round(num(score.benchFit), 2) + ' scales every starter (intangibles-based bench multiplier).' });

    /* 2. Individual force multipliers and exceptional power — inside each fit. */
    for (const r of active) {
      const c = r.cand, id = cid(c);
      const tf = L.toon.toonForceMultiplier(c, sportKey, r.pos);
      if (tf !== 1) obs({ stackKey: 'toonforce-individual:' + r.pos.id, sourceSystem: 'toonforce', sourceCharacterId: id,
        trigger: 'curated ToonForce character in an active slot', recipients: [id], stage: 'position-fit', effectKind: KIND.MULT,
        value: tf, unit: 'multiplier on own position fit', alreadyApplied: 'inside-position-fit-baseline',
        reason: 'ToonForce multiplies this character\'s own position fit only.',
        limitations: ['Individual effect: teammates receive nothing from it.', 'No multiplier in coach or bench slots.'] });
      const mf = L.muppet.muppetForceMultiplier(c, sportKey, r.pos);
      if (mf !== 1) obs({ stackKey: 'muppetforce-individual:' + r.pos.id, sourceSystem: 'muppetforce', sourceCharacterId: id,
        trigger: 'Muppet in an active slot', recipients: [id], stage: 'position-fit', effectKind: KIND.MULT,
        value: mf, unit: 'multiplier on own position fit', alreadyApplied: 'inside-position-fit-baseline',
        reason: 'Individual MuppetForce role effect; separate from the team-wide ensemble below.' });
      const ex = L.exceptional.brawlExceptionalPower(c, sportKey, r.pos);
      if (ex) obs({ stackKey: 'exceptional-power:' + r.pos.id, sourceSystem: 'brawl-exceptional-power', sourceCharacterId: id,
        trigger: 'registered exceptional being in an active Battle Royale slot', recipients: [id], stage: 'position-fit', effectKind: KIND.ADD,
        value: ex, unit: 'fit points (inside position-fit-baseline)', alreadyApplied: 'inside-position-fit-baseline',
        sourceEvidence: (L.exceptional.BRAWL_EXCEPTIONAL_POWER[c.pool + ':' + c.n] || [])[2] || null,
        reason: 'Editorial Battle Royale adjustment for a documented realm-scale feat.',
        limitations: [(L.exceptional.BRAWL_EXCEPTIONAL_POWER[c.pool + ':' + c.n] || [])[3] || 'See register.'] });
      if (c.sig && c.sig.kind === 'unbreakable') obs({ stackKey: 'signature-unbreakable:' + r.pos.id, sourceSystem: 'signature', sourceCharacterId: id,
        sourceAbilityId: c.sig.name, trigger: 'always', recipients: [id], stage: 'position-fit', effectKind: KIND.OTHER,
        alreadyApplied: 'inside-position-fit-baseline', reason: '"' + c.sig.name + '": no weakest-trait penalty in this character\'s own fit.' });
    }

    /* 3. Group chemistry, named links and coaching style. */
    const syn = score.syn || { total: 0, links: [], style: null };
    const stylePts = syn.style ? num(syn.style.pts) : 0;
    const linkTotal = num(syn.total) - stylePts;
    for (const link of syn.links || []) {
      const members = rows.filter(r => (r.cand.g || []).includes(link.id)).map(r => cid(r.cand));
      obs({ stackKey: 'chemistry-link:' + link.id, sourceSystem: 'group-chemistry', trigger: 'two or more members of "' + link.name + '" on the roster (coach counts)',
        recipients: members, stage: 'team-score', effectKind: KIND.ADD, value: RT.round(num(link.pts), 6), unit: 'rating points before the chemistry cap',
        capGroup: 'chemistry-links', alreadyApplied: 'inside-chemistry-total',
        reason: link.count + ' members of ' + link.name + ' are together; the bonus grows with diminishing returns.' });
    }
    obs({ stackKey: 'chemistry-total', sourceSystem: 'group-chemistry', trigger: 'sum of active links', recipients: everyone,
      stage: 'team-score', effectKind: KIND.ADD, value: RT.round(linkTotal, 6), unit: 'rating points', capGroup: 'chemistry-links', inRating: true,
      reason: (syn.links || []).length ? 'Named teams, crews, families and partnerships present on this roster (after the chemistry cap).' : 'No shared chemistry group is active on this roster.' });
    obs({ stackKey: 'coach-style', sourceSystem: 'coach', sourceCharacterId: coachRow ? cid(coachRow.cand) : null,
      trigger: 'coach with a defined style', recipients: starters, stage: 'team-score', effectKind: KIND.ADD, value: RT.round(stylePts, 6), unit: 'rating points', inRating: true,
      reason: syn.style ? syn.style.name + ' coaches "' + syn.style.label + '": ' + syn.style.match + ' for this roster.' : 'No coaching-style effect for this roster.',
      limitations: syn.style ? ['Can be negative when the roster does not suit the style.'] : [] });

    /* 4. Signature moves. */
    const sig = score.sig || { list: [], lift: 0, chaos: 0, spark: [] };
    for (const s of sig.list || []) {
      if (s.kind === 'unbreakable') continue;
      const id = cid(s.c);
      obs({ stackKey: 'signature:' + s.kind + ':' + s.i, sourceSystem: 'signature', sourceCharacterId: id, sourceAbilityId: s.name,
        trigger: s.kind === 'clutch' ? 'playoff games only' : 'every game',
        conditions: s.kind === 'clutch' ? ['playoff'] : [],
        recipients: s.kind === 'chaos' ? ['opposing team'] : s.kind === 'lift' ? everyone : [id],
        stage: s.kind === 'lift' ? 'team-score' : s.kind === 'chaos' ? 'match' : 'match-conditional',
        effectKind: KIND.ADD, value: null, unit: null, capGroup: s.kind === 'lift' ? 'signature-lift' : s.kind === 'chaos' ? 'signature-chaos' : null,
        alreadyApplied: s.kind === 'lift' ? 'inside-signature-lift-total' : s.kind === 'chaos' ? 'inside-signature-chaos-total' : 'conditional-live-match',
        reason: '"' + s.name + '" (' + s.kind + ').' });
    }
    obs({ stackKey: 'signature-lift-total', sourceSystem: 'signature', trigger: 'lift signatures on the roster', recipients: everyone,
      stage: 'team-score', effectKind: KIND.ADD, value: RT.round(num(sig.lift), 6), unit: 'rating points', capGroup: 'signature-lift', inRating: true,
      reason: 'Whole-squad lift from signature moves (after its cap).' });
    obs({ stackKey: 'signature-chaos-total', sourceSystem: 'signature', trigger: 'chaos signatures on the roster', recipients: ['opposing team'],
      stage: 'match', effectKind: KIND.ADD, value: -RT.round(num(sig.chaos), 6), unit: 'rating points to the opponent', capGroup: 'signature-chaos',
      alreadyApplied: 'applied-by-gameRatings',
      reason: 'Chaos signatures knock the opposing team off balance every game (after its cap).' });
    const boomers = (sig.spark || []).filter(x => x.boom).map(x => cid((score.rows[x.i] || {}).cand)).filter(Boolean);
    if (boomers.length) obs({ stackKey: 'playoff-boom', sourceSystem: 'playoff-boom', trigger: 'each playoff game, seeded roll per boom player',
      conditions: ['playoff', 'live match RNG'], recipients: boomers, stage: 'match-conditional', effectKind: KIND.ADD, value: null,
      alreadyApplied: 'conditional-live-match', reason: 'Boom players may catch fire or go cold in a playoff game.',
      limitations: ['Not rolled by the shadow evaluator; it never touches the match RNG.'] });

    /* 5. Battle Royale variety. */
    obs({ stackKey: 'brawl-variety', sourceSystem: 'brawl-variety', trigger: 'Battle Royale only', recipients: starters,
      stage: 'team-score', effectKind: KIND.ADD, value: RT.round(score.variety ? num(score.variety.pts) : 0, 6), unit: 'rating points', inRating: true,
      reason: score.variety ? score.variety.n + ' distinct fighting styles covered.' : 'Not a Battle Royale lineup.' });

    /* 6. Variants. */
    let variantSum = 0;
    for (const r of rows) {
      const c = r.cand; if (!c.variantBase) continue;
      const id = cid(c), bonus = num(c.variantRatingBonus); variantSum += bonus;
      const reviewed = !!(c.variantAbilities && Array.isArray(c.variantAbilities.domains) && c.variantAbilities.domains.length);
      obs({ stackKey: 'variant-surge:' + r.pos.id, sourceSystem: 'variant-surge', sourceCharacterId: id, trigger: 'selected alternate form',
        recipients: [id], stage: 'team-score', effectKind: KIND.ADD, value: bonus, unit: 'rating points', alreadyApplied: 'inside-variant-total',
        continuity: (c.variantAbilities && (c.variantAbilities.continuity || c.variantAbilities.origin)) || null,
        reason: c.variantBase + ' is playing as ' + c.n + ': changed attributes' + (reviewed ? ' and a reviewed form profile ("' + c.variantAbilities.move + '").' : '.'),
        limitations: reviewed ? [c.variantAbilities.limit || ''] : ['Unreviewed form: stats change only; no power, guard or Apex rank is inferred.'] });
      if (reviewed && !r.pos.coach && !r.pos.bench) {
        const rank = L.combat && L.combat.apexRankOf ? L.combat.apexRankOf(c, L.attack.brawlAbilityOf(c)) : 0;
        if (rank && sportKey === 'brawl') obs({ stackKey: 'apex-form:' + r.pos.id, sourceSystem: 'brawl-combat', sourceCharacterId: id,
          trigger: 'reviewed selected form in live combat', recipients: [id], stage: 'combat', effectKind: KIND.OTHER,
          alreadyApplied: 'applied-by-brawl-combat', reason: (rank === 2 ? 'Apex' : 'Empowered') + ' combat rank (extra HP, attack and a second action) inside the live combat engine.',
          limitations: ['Only for a selected, reviewed form; never for the base character.'] });
      }
    }
    obs({ stackKey: 'variant-total', sourceSystem: 'variant-surge', trigger: 'selected alternate forms', recipients: starters,
      stage: 'team-score', effectKind: KIND.ADD, value: RT.round(num(score.variantBonus), 6), unit: 'rating points', inRating: true,
      reason: 'Rating bonus of selected alternate forms.' });
    if (Math.abs(variantSum - num(score.variantBonus)) > TOL) conflicts.push({ system: 'variant-surge', detail: 'Per-form bonuses (' + variantSum + ') do not match the team total (' + num(score.variantBonus) + ').' });
    if (opponent && L.variantApi && typeof L.variantApi.variantBattleImpact === 'function') {
      // Pure, deterministic legacy function: read to observe, not to re-apply.
      const impact = L.variantApi.variantBattleImpact(score, opponent, sportKey);
      for (const [k, ev] of impact.events.entries()) obs({ stackKey: 'variant-encounter:' + k, sourceSystem: 'variant-surge', sourceAbilityId: ev.move,
        trigger: 'reviewed form against this specific opponent', recipients: [ev.character], stage: 'match', effectKind: KIND.ADD,
        value: ev.points, unit: 'rating points before the encounter cap', capGroup: 'variant-encounter', alreadyApplied: 'applied-by-gameRatings',
        reason: '"' + ev.move + '" (' + ev.domains.join(', ') + ')' + (ev.defended.length ? '; resisted by an opposing form (' + ev.defended.join(', ') + ')' : '') + (ev.exposed.length ? '; exposed to an opposing form (' + ev.exposed.join(', ') + ')' : '') + '.',
        limitations: [ev.limit || ''] });
      obs({ stackKey: 'variant-encounter-total', sourceSystem: 'variant-surge', trigger: 'reviewed forms against this opponent', recipients: ['own team'],
        stage: 'match', effectKind: KIND.ADD, value: impact.points, unit: 'rating points', capGroup: 'variant-encounter', alreadyApplied: 'applied-by-gameRatings',
        reason: 'Match-stage form effect computed by Version 1 gameRatings().' });
    }

    /* 7. MuppetForce ensemble — whole team, once, capped. */
    const mt = score.muppetTeam || { percent: 0, points: 0, performers: 0, teammates: 0 };
    for (const r of rows) {
      const force = L.muppet.muppetForceOf(r.cand); if (!force) continue;
      const role = slotRole(r.pos), w = MUPPET_WEIGHT[role];
      obs({ stackKey: 'muppetforce-performer:' + r.pos.id, sourceSystem: 'muppetforce', sourceCharacterId: cid(r.cand),
        trigger: 'Muppet on the roster with at least one teammate', recipients: everyone, stage: 'team-score', effectKind: KIND.OTHER,
        value: RT.round(w * force.dimensions.ensemble / 99, 6), unit: 'ensemble strength (' + role + ' weight ' + w + ')',
        capGroup: 'muppetforce-team', alreadyApplied: 'inside-muppetforce-team',
        reason: r.cand.n + ' contributes to the ensemble as a ' + role + '.' });
    }
    obs({ stackKey: 'muppetforce-team', sourceSystem: 'muppetforce', trigger: 'at least one Muppet and at least two roster members',
      recipients: everyone, stage: 'team-score', effectKind: KIND.ADD, value: RT.round(num(mt.points), 6), unit: 'rating points (' + num(mt.percent) + '% of the pre-bonus rating)',
      capGroup: 'muppetforce-team', cap: 22, inRating: true,
      reason: mt.performers ? mt.performers + ' Muppet performer(s) lift the WHOLE team, including teammates from other pools, with diminishing returns.' : 'No Muppet ensemble on this roster.',
      limitations: ['Applied once per team.', 'Teammates gain a chemistry lift; they do not gain MuppetForce powers.', 'Capped at 22% of the pre-bonus rating.'] });

    /* 8. Bench chemistry — sidekick lock, lead reunion, mesh; capped together. */
    const bc = score.benchChem || { percent: 0, points: 0, bench: null, sidekick: false, lock: 0, leads: [], mesh: [] };
    const B = L.bench.BENCH_CHEM;
    const benchId = benchRow ? cid(benchRow.cand) : null;
    const part = (key, value, trigger, reason, limits) => obs({ stackKey: 'bench-chemistry:' + key, sourceSystem: 'bench-chemistry', sourceCharacterId: benchId,
      trigger, recipients: everyone, stage: 'team-score', effectKind: KIND.OTHER, value, unit: '% before the bench-chemistry cap',
      capGroup: 'bench-chemistry', alreadyApplied: 'inside-bench-chemistry-total', reason, limitations: limits || [] });
    if (bc.sidekick) part('sidekick-lock', num(bc.lock), 'sidekick-tagged character in the bench/reinforcement slot',
      bc.bench + ' is a tagged sidekick and thrives in the bench role, with or without a lead on the roster.', ['Sidekick is a role tag, not a power or combat tier.']);
    if ((bc.leads || []).length) part('lead-reunion', B.leadEach * Math.min(B.leadMax, bc.leads.length), 'a named lead of the bench sidekick is on the roster (coach counts)',
      'Reunited with ' + bc.leads.join(' and ') + '.');
    if ((bc.mesh || []).length) part('group-mesh', B.meshEach * Math.min(B.meshMax, bc.mesh.length), 'bench player shares a chemistry group with a teammate (no sidekick tag required)',
      'Meshes with ' + bc.mesh.join(', ') + '.');
    obs({ stackKey: 'bench-chemistry-total', sourceSystem: 'bench-chemistry', sourceCharacterId: benchId, trigger: 'bench/reinforcement slot filled',
      recipients: everyone, stage: 'team-score', effectKind: KIND.ADD, value: RT.round(num(bc.points), 6), unit: 'rating points (' + num(bc.percent) + '% of the pre-bonus rating)',
      capGroup: 'bench-chemistry', cap: B.cap, inRating: true,
      reason: bc.percent ? 'Sidekick lock, lead reunion and group mesh combined.' : 'No bench chemistry on this roster.',
      limitations: ['Combined bench chemistry is capped at ' + B.cap + '%.'] });
    if (score.benchHeat) obs({ stackKey: 'bench-heat', sourceSystem: 'bench', sourceCharacterId: benchId, trigger: 'every game, one seeded roll',
      conditions: ['live match RNG'], recipients: ['own team'], stage: 'match-conditional', effectKind: KIND.ADD, value: null,
      alreadyApplied: 'conditional-live-match', reason: 'The bench player sees minutes and can catch fire or go cold' + (bc.sidekick ? ' (a sidekick rarely goes cold).' : '.'),
      limitations: ['Not rolled by the shadow evaluator.'] });

    /* 9. ToonForce spotlight — conditional, seeded, one per team; never an aura. */
    const toons = active.filter(r => L.toon.toonForceOf(r.cand)).slice().sort((a, b) => (b.w || 0) - (a.w || 0));
    if (toons.length) obs({ stackKey: 'toonforce-spotlight', sourceSystem: 'toonforce', sourceCharacterId: cid(toons[0].cand),
      trigger: 'at most one seeded spotlight gag per team per match', conditions: ['live match RNG', 'not guaranteed'],
      recipients: [cid(toons[0].cand)], stage: 'match-conditional', effectKind: KIND.ADD, value: null, alreadyApplied: 'conditional-live-match',
      reason: toons[0].cand.n + ' is this team\'s spotlight candidate. If the live roll succeeds, one bounded gag adds match-rating points.',
      limitations: ['Not rolled by the shadow evaluator.', 'An individual event: it is not a team-wide ToonForce aura and grants teammates no cartoon physics.'] });

    /* Integrity: the observed team-score parts must rebuild the rating, and the
     * capped systems must agree with their own modules. */
    const inRating = ledger.entries.filter(e => e.inRating);
    const ledgerSum = inRating.reduce((s, e) => s + e.value, 0);
    const reconciliation = { rating: num(score.rating), ledgerSum: RT.round(ledgerSum, 6), difference: RT.round(ledgerSum - num(score.rating), 6),
      ok: Math.abs(ledgerSum - num(score.rating)) < 1e-4, parts: inRating.map(e => ({ stackKey: e.stackKey, value: e.value })) };
    if (!reconciliation.ok) conflicts.push({ system: 'team-rating', detail: 'Observed parts sum to ' + reconciliation.ledgerSum + ' but the team rating is ' + reconciliation.rating + '.' });
    const preBonus = num(score.rating) - num(mt.points) - num(bc.points);
    const mCheck = L.muppet.muppetForceTeamwork(roster, positions, preBonus);
    if (Math.abs(mCheck.percent - num(mt.percent)) > 1e-3) conflicts.push({ system: 'muppetforce', detail: 'Module recomputes ' + mCheck.percent + '% but the score carries ' + num(mt.percent) + '%.' });
    const bCheck = L.bench.benchChemistry(roster, positions, preBonus);
    if (Math.abs(bCheck.percent - num(bc.percent)) > 1e-3) conflicts.push({ system: 'bench-chemistry', detail: 'Module recomputes ' + bCheck.percent + '% but the score carries ' + num(bc.percent) + '%.' });
    if (num(mt.percent) > 22 + TOL) conflicts.push({ system: 'muppetforce', detail: 'Team MuppetForce exceeds its 22% cap.' });
    if (num(bc.percent) > B.cap + TOL) conflicts.push({ system: 'bench-chemistry', detail: 'Bench chemistry exceeds its ' + B.cap + '% cap.' });

    return { teamKey, entries: ledger.entries, add: ledger.add, has: ledger.has, reconciliation, conflicts,
      summary: { muppetPercent: num(mt.percent), benchChemistryPercent: num(bc.percent), sidekickOnBench: !!bc.sidekick, leads: (bc.leads || []).slice(), mesh: (bc.mesh || []).slice(),
        chemistryLinks: (syn.links || []).map(l => l.name), signatureMoves: (sig.list || []).map(s => ({ name: s.name, kind: s.kind })),
        toonSpotlightCandidate: toons.length ? toons[0].cand.n : null, variants: rows.filter(r => r.cand.variantBase).map(r => r.cand.n) } };
  }

  /* Invariants used by tests and reported with every assessment. */
  function validate(entries) {
    const problems = [];
    const seen = new Set();
    for (const e of entries) {
      if (e.appliedBy === APPLIED.BLOCKED) continue;
      const k = e.teamKey + '|' + e.stackKey;
      if (seen.has(k)) problems.push('Duplicate applied stack key: ' + k);
      seen.add(k);
      if (e.appliedBy === APPLIED.DERIVED && (e.effectKind === KIND.ADD || e.effectKind === KIND.MULT)) problems.push('Derived entry adds rating: ' + k);
      if (e.appliedBy === APPLIED.DERIVED && e.inRating) problems.push('Derived entry flagged inRating: ' + k);
    }
    return { ok: problems.length === 0, problems };
  }

  const api = { APPLIED, KIND, MUPPET_WEIGHT, createLedger, observeTeam, validate, candidateKey: cid };
  NS.teamLedger = api;
  if (isNode) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

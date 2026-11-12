# Version 2 / Option C — evaluator build contract

**Status:** Approved engineering brief for a separate Version 2 development line. This is a specification and test handoff, **not** a deployed evaluator.

**Branching:** immutable reference `releases/v1.0.0` (commit `07fbdeb3140e6893f479529188f1c3555b3448cb`); integration branch `develop/v2-option-c`; implementation PRs target **`develop/v2-option-c`**. Never push an incomplete evaluator to `main` or the Version 1 release branch.

Read first:
1. [Option C character-intelligence governing rule](OPTION_C_CHARACTER_INTELLIGENCE.md) — authoritative policy, including the team-wide amendment.
2. [Version 1 release baseline](V1_BASELINE_2026-11-12.md).
3. [Whole-roster audit protocol](WHOLE_ROSTER_AUDIT_PROTOCOL.md) — understand the explicit Phase 1/2 completion gate.
4. [Battle Royale combat model](brawl-combat-model.md) and [ToonForce/MuppetForce scoring](toonforce-muppetforce-scoring.md).
5. [Option C benchmark and rules fixtures](../data/option-c/benchmark-scenarios.json).

## Mission and non-negotiable principles

Build an **offline, evidence-aware, deterministic, context-sensitive qualitative evaluator** shared by Battle Royale and sports. Research and structured rules determine what a character/form can do, what is legal or relevant in the selected mode, how the capabilities interact, how teamwide support changes the outcome, and how numerical win estimates should be calibrated. **Existing 12-attribute scoring remains**; it is the athletic baseline, not the final arbiter of cross-universe power.

> Character abilities are canonically grounded. Sporting applications are rules-constrained. Ratings are derived from resulting competitive advantages, not used as substitutes for them.

> The entire lineup — starters, coach/commander, bench/reinforcement, variants and team relations — must be evaluated before estimating a matchup.

**NO mandatory external AI API during matches; NO server secrets; NO speculative canonical facts; NO new live result behavior in the first PR.** Strong characters may be genuinely dominant; do not impose artificial balance caps. The simulator and explanations must ultimately tell the same story.

## Verified integration seams in Version 1

`index.html` is the browser application and contains `SPORTS` (keys `basketball`, `football`, `soccer`, `baseball`, `hockey`, `volleyball`, `brawl`), positional weights, `teamScore(sportKey, roster)` (~line 1336), `gameRatings(A,B,playoff,rng,sportKey)` (~line 2390), `aiTeamValue` (~2922), `matchRatingBreakdown` (~3026), `playGame(sportKey,A,B,sigma,rng,playoff)` (~3035), `fitIn/fitAI` (~3726) and full team chemistry and signature definitions.

Key source modules:

| Source | Current authority / boundary |
| --- | --- |
| `data/character-abilities.js` | Credible qualitative abilities, indexed evidence and provenance; **tags alone do not confer combat tier** |
| `data/variant-abilities.js` + `data/campaign-variant-expansion.js` | Selected-form identity and contextual variant effects; distinguish base from variants |
| `data/brawl-attack-profiles.js` + `data/brawl-exceptional-power.js` | Typed battle signatures and exceptional powers; evidence is currently partial |
| `data/brawl-combat.js` | Existing HP, wounds, attacks, guards, ward, Apex/Empowered and KOs; only actual combat events determine battle winner |
| `data/bench-chemistry.js` | Sidekick / reunion / bench mesh; combined **8%** bench chemistry cap; bench hot/cold roll |
| `data/muppet-force.js` | Individual MuppetForce and cross-pool **teamwide** ensemble capped **22%**, applies once |
| `data/toon-force.js` | Distinct individual cartoon physics and limited RNG spotlight event, **not** an unconditional team aura |
| `data/after-action.js` | Reporting and sports box scores; role restrictions and cross-client consistency |
| `data/campaign-eligibility.js`, `data/campaign.js` | Separate Campaign eligibility; **do not conflate tags with combat truth or rule legality** |
| `docs/phase1-research/*`, `research/*` | Incomplete evidence ledgers; unknown must stay unknown |

Current `teamScore` computes numeric fit/coach/bench, group synergy, signature effects, battle variety, variant bonus, then separately adds MuppetForce and bench chemistry using **the same pre-team-bonus base rating**. `gameRatings` adds chaos, playoff/bench heat, ToonForce spotlight and variant encounter effects. `playGame` uses those ratings and its RNG for ordinary sports, but for Battle Royale delegates to `resolveBrawlCombat`. **Do not mechanically reapply all those factors again.** There are multiple existing phases and a mix of fixed and seeded effects.

## Architectural target: six modules or equivalent clear boundaries

1. **Profile adapter:** `getProfile(poolQualifiedId, selectedForm)` interprets existing roster identity, numeric attributes, recognized form, documented abilities, limitations and provenance without modifying source datasets. Prefer exact `pool:character` and `pool:character|form` IDs, not display-name-only joins. A missing power is `unknown`, not an automatic `no`.
2. **Sport-and-battle rules engine:** Evaluates use of a specific ability in a specific position/action/arena. Outcomes `allowed`, `prohibited`, `needs-review`, `not-applicable`, each with reason and rule/continuity references. An under-specified supernatural contact/ball manipulation should not silently become a legal sport buff. Different roles and sports map abilities to different outcomes. Battle Royale evaluates attacks, counters, vulnerabilities, protection, win conditions.
3. **Typed interaction engine:** Resolves offense/defense, range/initiative, magic vs protection, control/telepathy, power-source dependencies, restricted forms, unusual resistances and counterplay. Avoid both additive "+10 strength" shortcuts and a hard-coded winner for every `N x N` pair.
4. **Team/effect ledger:** Evaluates complete teams with positions plus coach/commander, bench/reinforcement, named pairs, shared groups, MuppetForce whole-team aura, individual ToonForce and seeded moments, chosen variants, cross-character shielding/healing/coordination, and opposing counters. Each effect has **provenance, recipient(s), activation condition, phase, stacking identity, one-time application key, cap, value and explanatory text**. In shadow mode, capture legacy computed effects as *observed*, not new modifiers.
5. **Matchup evaluator:** Given two complete score/roster objects plus sport, conditions and explicit RNG-independent context, returns a portable JSON assessment: `schemaVersion`, `modelVersion`, normalized sides, evidence-coverage flags, legal/power interactions, team effects, decisive advantages, each side's credible win conditions, uncertainty, and estimated win probabilities summing to 1. Numeric probabilities are **editorial/calibrated estimates**, never canonically measured truths. When source coverage is inadequate, return `insufficient-evidence` or `provisional` and/or lower confidence; do not manufacture precise odds from unverified facts.
6. **Integration/debug adapter:** Browser global (suggest `window.DA_OPTION_C`) plus CommonJS exports for Node tests. No full framework rewrite. Shadow mode only, feature flag **OFF by default** and separate from existing RNG; optional developer diagnostics can compare legacy expected result, actual result and Option C assessment. No user-visible verdict until a later reviewed activation PR.

Suggested interfaces (adjust after inspection, but document any deviation):

```js
const result = DA_OPTION_C.evaluateMatchup({
  sportKey: 'brawl',
  teamA: existingTeamScoreA,
  teamB: existingTeamScoreB,
  rulesetId: 'brawl-v1',
  scenarioId: 'demo',
  mode: 'shadow',
  // no use of, mutation of, or calls into the live match RNG
});
```

```json
{
  "schemaVersion": 1,
  "modelVersion": "option-c-shadow-v1",
  "status": "provisional",
  "sportKey": "brawl",
  "sides": [
    {"teamKey": "A", "probability": 0.50, "winConditions": [], "advantages": []},
    {"teamKey": "B", "probability": 0.50, "winConditions": [], "advantages": []}
  ],
  "evidence": {"reviewed": 0, "unknown": 0, "conflicts": []},
  "effectLedger": [],
  "interactions": [],
  "notes": []
}
```

The example is **shape only**, not a desired default 50/50 outcome. Do not ship a placeholder 50/50 evaluator that pretends to understand matchups.

## Team effect ledger: minimum fields and invariants

Each entry should include:
- `id` / `sourceSystem` / `sourceCharacterId` / optional `sourceAbilityId`
- `trigger`, `conditions`, `recipients`, `mode`, `sportKey`, `stage`
- `appliedBy` (`legacy-observed`, `option-c-derived`, `blocked`, `informational`)
- `effectKind` (`rating-add`, `rating-multiplier`, `probability-interaction`, `tactical`, `rule-prohibited`, `other`)
- `value` and `unit` only when mathematically defined; `capGroup` / `cap` / `stackKey` / `alreadyApplied`
- `sourceEvidence`, `continuity`, `reason`, `limitations`

Must preserve existing semantics:
- Sidekick bench lock is unconditional for an eligible sidekick; presence of named lead(s) gives an additional reunion effect; same-group bench mesh works with non-sidekicks; aggregate bench chemistry **8% cap**.
- MuppetForce influences all eligible teammates **including different talent pools**; multiple Muppets have diminishing returns; coach/bench weighted lower; **22% whole-team cap** applied once. Do not incorrectly assert that non-Muppets gain the Muppet power.
- ToonForce is generally individual; only its properly seeded spotlight can affect a match; never infer teamwide ToonForce aura.
- Preserve signatures, chemistry groups, coach/commander/bench roles, variant surge, exceptional power, counters and negative synergies when supported.
- Preserve NBA sport-specific expert stats and volleyball position/stat eligibility: liberos are not credited with kills/blocks; middles with no digs; PTS = KILLS + BLK + ACE.
- Dedupe derived effects against already-observed legacy contributions. Never double-add a bonus when a team rating already contains it.

## Calibration and research policy

- Begin with a small manually inspected **golden scenario suite** in `data/option-c/benchmark-scenarios.json` and later expand. Never anchor to one manually selected screenshot.
- Source exact continuity. **The existing roster's `mcu:Silver Surfer` is not automatically the same as mainline Marvel Comics Silver Surfer**; do not import a comics-only matchup outcome from a conversational example without reviewing the roster portrayal. Use Black Adam/Surfer as a *research and continuity fidelity* test before an odds benchmark.
- Similarly, distinguish Batman vs selected Hellbat Armor Batman, ordinary Hulk vs World Breaker, King Thanos, and other form identities. Only reviewed selected forms receive Apex/Empowered benefits.
- Calibrate both **directional correctness** (decisive powers and counters recognized) and **quantitative reliability** (holdout outcome frequencies from seeded simulations, probability calibration, log-loss/Brier score where a defensible outcome benchmark exists). Do not call 80% a verified statistic without a reference distribution.
- Capture evidence completeness and unresolved issues instead of resolving all disputes by guess.
- Full roster Phase 1 issue **#82** is not finished; full combat atlas **#83** remains gated until #82, and Gauntlet **#84** remains future work. Building a reusable *engine scaffold* using reviewed fixtures **does not** count as doing or completing the #83 whole-roster power-scaling audit.

## Build order, PR scope and acceptance

### PR 1 — SHADOW EVALUATOR (first deliverable)
- Analyze entry points and map the actual data flow. Write concise architecture decisions and file ownership before changing production code.
- Build pure adapters and a modular evaluator, with a real, typed, explicitly limited interaction vocabulary and structured explanation output for a reviewed sample; no paid API calls.
- Provide side-independent deterministic evaluation (swapping teams swaps probabilities/labels). Repeat identical inputs => identical output. Evaluating the matchup may not consume live `rng`, alter RNG sequence, mutate team/roster/profile arrays, or change `playGame` results, UI or saved documents.
- Distinguish `reviewed`, `provisional`, `unknown`, `contradicted` and `needs-review` evidence. Unreviewed profiles must not silently inherit abilities or Apex tiers.
- Build a complete **observational** team effect ledger based on existing calculated systems; evaluate potential new effects in a separate `derived` partition without applying them to live scores. Verify caps and prevent double counting.
- Add case-based tests, property/metamorphic tests (side order, seeded invariance, repeatability, mutation protection), and at least one basic sports rules example whose legal status is clearly defined. Cases whose supernatural application lacks a sports rule decision should return `needs-review`, not a granted bonus.
- Wire shadow mode behind a **default-disabled developer flag** and compare its output with legacy without changing the actual winner, HP, statistics, RNG consumption, league results, head-to-head sync or scores.
- Produce a report explaining coverage, which judgments are actually backed by reviewed records, limitations, comparative seeded runs and the next required work.

### Later PRs (not part of PR 1)
- Full structured evidence coverage under #82 / #83, more interaction archetypes, cross-pool research and calibration.
- Reviewed battle-resolution integration: qualitative win conditions should govern battle mechanics, and events/HP/KO report coherently agree with actual winner.
- Sports per-rulebook legal abilities and position effects across all six sports; calibrated outcome/statistic generators.
- User-facing explanations, multi-device compatibility testing, phased rollout and optional feature comparison. No live deployment until separate review.

## Required regressions to preserve

Run the repository checks, including:
```sh
node --test tests/*.test.cjs
node tests/volleyball-score-audit.test.js
node tests/browser-smoke.cjs
```

Inspect and run relevant `tests/brawl-*.test.cjs`, `tests/bench-chemistry.test.cjs`, `tests/muppet-force.test.cjs`, `tests/toon-force.test.cjs`, `tests/variant-abilities.test.cjs`, `tests/h2h-consistent-box-scores.test.cjs` and all `tests/campaign*.test.cjs`. The GitHub PR workflow includes Node, browser, Edge typecheck and public-health checks; do not claim completion from a green subset.

The first PR must demonstrate **byte-for-byte unchanged key Version 1 seeded match outputs for selected fixed fixtures** when shadow is OFF and when it is ON. Any extra diagnostic data must be isolated and optional. Compare both Head-to-Head clients' deterministic result payloads. No hidden rewrite of Version 1 damage, ratings, variants, scoring or rules.

## Fable handoff and reporting format

Claude/Fable should create **`claude/option-c-shadow-evaluator` from `develop/v2-option-c`**, implement **PR 1 only**, and open a **non-draft PR targeting `develop/v2-option-c`** when ready. Do not merge automatically. Link the tracking issue and report:
1. Commit and PR URL; modules/files changed; architecture/API signatures.
2. Exact test commands and results; browser smoke status; baseline parity status.
3. Which benchmark scenarios passed, failed, or need evidence/rule decisions.
4. Effects accounted for (especially Sidekick, bench, MuppetForce, ToonForce, variants, coaching, signature moves) and proof no duplication.
5. Confidence/coverage limitations and known blockers.
6. Roadmap for a later active resolver, **without implementing the live flip in PR 1**.

If tools or repository access are unavailable, produce patch/diff and the blocked steps; never claim a remote push or CI run that did not happen.

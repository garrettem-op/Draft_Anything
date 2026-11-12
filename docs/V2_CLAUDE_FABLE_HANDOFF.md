# COPY TO CLAUDE FABLE 5.2 — Draft Anything Option C / Version 2

You have authorized coding access to the GitHub repository `garrettem-op/Draft_Anything`.

## Mission

Build the first production-quality *foundation* of Draft Anything's **Option C Qualitative Evaluator**. The evaluator must use researched character identity, feats, powers, limitations, actual opponent counters, legal sport applications, and **full-team synergies** to derive contextual advantages and calibrated editorial win probabilities. Preserve numeric attributes as athletic/position baselines, but do not use arbitrary numerical stats as substitutes for actual abilities.

**For this first implementation, run in SHADOW MODE ONLY.** The live game continues using its existing V1 simulation and results. Do not turn on new outcomes or change the actual results of any match yet.

## Working branch and non-negotiable release boundary

- Repository: `https://github.com/garrettem-op/Draft_Anything`
- Immutable Version 1 reference: `releases/v1.0.0`, commit `07fbdeb3140e6893f479529188f1c3555b3448cb`.
- Version 2 integration branch: `develop/v2-option-c`.
- **Create your work branch `claude/option-c-shadow-evaluator` from `develop/v2-option-c`, not from `main`.**
- Open a pull request **into `develop/v2-option-c`**, referencing GitHub issue **#93**. Do not merge it automatically. Do not modify the default branch, release branch, production Pages deployment or Supabase configuration.
- Begin by reading this repository's root `CLAUDE.md`, `docs/V2_OPTION_C_EVALUATOR_BUILD.md`, `docs/OPTION_C_CHARACTER_INTELLIGENCE.md`, `docs/WHOLE_ROSTER_AUDIT_PROTOCOL.md`, and `docs/V1_BASELINE_2026-11-12.md`. The build contract takes precedence over architectural assumptions below.

## Accepted governing rules

1. **Character abilities are canonically grounded.** Exact continuity and selected form matter; the same-name superhero or comics character is not automatically the same playable version from a film or video game. Record uncertainty honestly.
2. **Sport use is rules-constrained.** Characters may use all documented abilities consistent with the actual sport's position, possession, contact, movement, equipment and scoring requirements. Do not normalize away flight, telepathy, super-speed or reality powers simply to make everyone competitive. But do not infer that telekinesis, magic ball manipulation or portals are automatically legal if the rules do not address them. Unsettled applications are `needs-review` until an explicit game ruling is approved.
3. **Keep existing numbers.** All 12 attributes, position weights, expert basketball stats, current numeric scores and draft rankings remain available. Qualitative ability/interaction intelligence augments how actual performance is evaluated, without replacing the athletic baseline.
4. **Team composition matters.** Evaluate the entire roster, not a collection of independent 1v1 power scores. Existing named teams, factions, pairs, sidekicks, lead reunions, coaches/commanders, bench/reinforcement, signature abilities, selected variants, ToonForce, MuppetForce and full-team auras/defenses/coordination remain mandatory.
5. **Preserve prior owner-approved mechanics.** Bench Sidekick + reunion + mesh caps at **8%**, sidekick lock applies without lead and reunion adds when lead present. MuppetForce has an individual component **and** a **whole-team** benefit, including non-Muppet teammates, with diminishing returns, coach/bench weights and **22% cap**. ToonForce is individual, with conditional seeded spotlight events, not a universal team aura. Do not apply any existing effect twice.
6. **Explainable and probabilistic.** Qualitative analysis establishes viable win conditions and counterplay first. Numeric odds represent an editorial gameplay estimate consistent with reviewed abilities, not an objectively established canonical win percentage. Do not hardcode an '80% Silver Surfer' rule. The conversation's Silver Surfer example used mainline comics assumptions, while the current roster includes `mcu:Silver Surfer`; research exact continuity.
7. **No AI calls at game runtime.** Players do not need an Anthropic or OpenAI API. Use structured, pre-researched data and JavaScript logic, with modest browser footprint and offline operation.

## Inspect the real Version 1 code first

The application is a single `index.html` with companion `data/*.js` scripts. Important preexisting functions are `teamScore`, `gameRatings`, `matchRatingBreakdown`, `playGame`, `fitIn`, `fitAI`, `SPORTS`, and `DA_BRAWL_COMBAT.resolveBrawlCombat`.

Re-use, rather than fork or overwrite:
- `data/character-abilities.js` for evidence and per-character tags.
- `data/variant-abilities.js`, `data/campaign-variant-expansion.js` for exact alternate forms.
- `data/brawl-attack-profiles.js`, `data/brawl-exceptional-power.js`, `data/brawl-combat.js` for the current battle engine.
- `data/bench-chemistry.js`, `data/muppet-force.js`, `data/toon-force.js` for approved full-team and individual special modifiers.
- `data/after-action.js` for score and individual-stat reporting.
- Current Campaign eligibility and source auditing tools to understand identity tags, **not** to infer undocumented combat skills.

Understand the existing **phase ordering**: `teamScore` already adds position fit, coach, bench, chemistry, signatures, variants, and team MuppetForce/bench chemistry. `gameRatings` adds further match-specific effects; `playGame` handles sports win results and invokes `brawl-combat` for the actual Battle Royale winner. You must not introduce outcome-report inconsistencies or double counting.

## Implement PR 1 only

### 1) Pure character/variant profile adapter
Use stable pool-qualified identities, selected-form keys, existing 12 attributes and sourced qualitative facts. Preserve provenance and statuses (`reviewed`, `provisional`, `unknown`, `needs-review`, `contradicted`). Support all built-in pools, including Action Movies and Disney additions, without inventing coverage. Do not silently grant an ability or Apex rank based on a name string, Campaign tag or raw strength score.

### 2) Typed interaction and rule vocabulary
Implement reusable interaction categories: physical vs defense, cosmic/magic/reality vs resistances, range/flight, initiative, control/telepathy, equipment, conditional transformations, countertypes, limitations, domain-specific group powers. For sports, distinguish legal, illegal, unclear and irrelevant applications; effects on positional duties and counters. Use a compact, extensible rulebook, not hundreds of hard-coded matchup winners.

### 3) Team-context and no-double-count ledger
Normalize full rosters including positions, coach/commander, bench/reinforcement. Produce a detailed ledger with each effect's source, recipients, activation conditions, mode, phase, whether already applied by V1, stack identity/cap, magnitude (where defined), provenance, limitations and human-readable explanation. Capture existing numeric effects as **observations** in shadow mode. Any new derived collective advantages must not be added to V1 totals. Include enemy counters.

### 4) Evaluator and probabilities
Expose a small browser global and a Node-testable CommonJS module, preferably `window.DA_OPTION_C.evaluateMatchup({ sportKey, teamA, teamB, rulesetId, mode: 'shadow' })` or a documented equivalent. Return a JSON-serializable, versioned assessment: both side IDs, comparative advantages, viable win conditions, documented counterplay, evidence gaps, team effect ledger, certainty/uncertainty and estimated probabilities adding to 1. Use an explicit conservative fallback for missing research rather than confident fiction. Ensure swapping A/B reverses results appropriately and equal inputs are deterministic.

### 5) Shadow integration
Use a feature flag that is OFF by default, available to developers only. In shadow mode, run the evaluator alongside the existing engine without altering the outcome. **Do not call the existing match RNG, modify team objects, influence current scores/HP, add unexpected stored fields to shared Head-to-Head results, alter series state or change result rendering.** Capture debug comparison data separately and optionally, in a way that cannot leak into user gameplay.

### 6) Verification
Start by building against `data/option-c/benchmark-scenarios.json` and expand it with carefully reviewed cases. Include Batman vs selected Hellbat form, King Thanos vs base, typed reality-vs-physical power with continuity caveats, Sidekick alone and with lead, non-sidekick bench mesh, cross-pool MuppetForce on non-Muppets, capped ensembles, ToonForce lack of team aura, coach/commander effects, signature/group chemistry, and at least one basketball/football/volleyball legality example.

Property tests must cover identical results on repeat, A/B symmetry, unchanged V1 outcomes and random streams with shadow on/off, no input mutation, no duplicate effects, continuity separation, unknowns not turning into grants, and position legality. Preserve volleyball libero/middle stat restrictions and individual points accounting. Do not mistake a green test for universal lore correctness.

Run and report (do not fabricate execution):
```sh
node --test tests/*.test.cjs
node tests/volleyball-score-audit.test.js
node tests/browser-smoke.cjs
```
Also run focused brawl, team synergy, Head-to-Head, Campaign and variant suites. The PR should trigger GitHub Actions checks.

## Deliverables in your PR

- Architecture and data-flow notes with clear file ownership.
- Committed working shadow evaluator, typed rulebook, data adapters, effect-ledger and test fixtures.
- Test results and reproducible seed/score parity report.
- At least several meaningful manually reviewed qualitative examples, explaining decisive powers/counters, and explicit unknown cases.
- A list of coverage gaps and proposed Phase 2 activation milestones.
- A PR `claude/option-c-shadow-evaluator` **into `develop/v2-option-c`**, linked to issue #93, with **no automatic merge**.

**Do not attempt to fill every character's still-unreviewed evidence in this first PR.** Issue #82's Campaign tag research remains incomplete, and issue #83's comprehensive power atlas remains gated on that research. This task constructs infrastructure and representative reviewed examples only. Issue #84's spectator Gauntlet is also deferred.

Work independently through the coding and tests within this scope. Ask for a decision only if a novel policy ruling or security-sensitive choice cannot be resolved from the existing documents. Otherwise make documented technical choices and complete the first PR end to end. If GitHub push permissions are unavailable, produce an exact patch and tell us what was and wasn't executed instead of claiming a merge or publication.

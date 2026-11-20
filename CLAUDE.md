# Draft Anything — Claude Code instructions (Version 2 development)

This file is intentionally present only on the `develop/v2-option-c` line. It does not apply to `releases/v1.0.0` unless explicitly cherry-picked, which is **not** requested.

## First read

- `docs/V2_OPTION_C_EVALUATOR_BUILD.md` — definitive Option C engineering scope, API direction, rollout gates and test requirements.
- `docs/OPTION_C_CHARACTER_INTELLIGENCE.md` — accepted user design contract, including whole-team effects.
- `docs/V1_BASELINE_2026-11-12.md` — tested Version 1 reference.
- `docs/WHOLE_ROSTER_AUDIT_PROTOCOL.md` — the Phase 1 and 2 research gate; building a shadow evaluator does not close it.
- `data/option-c/benchmark-scenarios.json` — researched and unresolved benchmark cases; no fixed canonical win percentages.

## Mission

**First PR only:** Implement a pure, typed, explainable, no-API qualitative matchup evaluator in **shadow mode**, not an active combat or sports replacement. The live game and published Version 1 continue unchanged.

Start your implementation branch `claude/option-c-shadow-evaluator` **from `develop/v2-option-c`**, not from `main`. Target all implementation PRs at `develop/v2-option-c`. Merge them yourself once CI is green (see **Merge authority** below). `releases/v1.0.0` is the immutable recovery baseline. Do not force-push or alter production Pages/Supabase, API credentials, workflows/secrets, or other unrelated features.

Preserve numerical 12-attribute role fits and existing chemistry, signature, coach, sidekick, bench, MuppetForce, ToonForce and variant effects. Use a typed, provenance-aware, per-effect ledger with exact recipients, conditions, caps and one-time application keys. Existing legacy values are already part of `teamScore` and `gameRatings`: **do not double-add them**.

For the first PR, the evaluator must be deterministic, independently testable in Node and the browser, and must **not consume gameplay RNG, mutate incoming objects, or affect any match outcomes or reports**. Shadow flag OFF by default. Results clearly state missing research and unresolved sports-officiating rules; never invent a power, legal ruling, percentage, source or win condition. Consider all seven SPORTS keys, but Phase 1 focuses on Battle Royale with representative sports legality tests.

Key inspected integration points: `index.html`: `teamScore`, `gameRatings`, `matchRatingBreakdown`, `playGame`, `fitIn` / `fitAI`. Data modules: `data/character-abilities.js`, `data/variant-abilities.js`, `data/brawl-combat.js`, `data/brawl-attack-profiles.js`, `data/brawl-exceptional-power.js`, `data/bench-chemistry.js`, `data/muppet-force.js`, `data/toon-force.js`, `data/after-action.js`.

**Do not equate power tags with confirmed combat proficiency.**

**Research scope (owner ruling 2026-11-20, replaces the earlier film-only rule for MCU entries):** every fictional character is researched across the roster's own source, everything that continues it (sequels, prequels, later seasons, series or games in the same continuity; not remakes or reboots) and **any comic depiction** of the character. All three count equally, and every feat, result and condition names its depiction. A form held as its own roster identity keeps its feats in its own record. NBA players are exempt. Details: `docs/V2_RESEARCH_AUTOMATION.md`.

## Merge authority (owner, 2026-11-13; standing approval restated 2026-11-20)

Claude merges its own PRs into `develop/v2-option-c` without asking the owner each time, once CI is green and the PR states what was and was not tested. This matches the review-and-merging rules in `docs/PROJECT_VISION.md` on `main`.

Still reserved for the owner, never done without his explicit go-ahead in the conversation: merging to `main`, anything touching `releases/v1.0.0` or the live V1 game, deploying or releasing V2, production Pages/Supabase, credentials, secrets and repository security settings, new paid API spend, and force-pushes.

## Verification and delivery

Run:
- `node --test tests/*.test.cjs`
- `node tests/volleyball-score-audit.test.js`
- `node tests/browser-smoke.cjs`
- Other targeted combat, team effect, Campaign and multiplayer stability tests listed in the engineering brief.

Open a PR toward `develop/v2-option-c` after tests; give accurate pass/fail logs, baseline parity evidence, benchmark coverage, architectural decisions and remaining unknowns. Do not claim a test ran if no test environment was available. If the user provides an additional goal or instruction during coding, prefer the user's most recent explicit instruction unless it conflicts with protected release boundaries.

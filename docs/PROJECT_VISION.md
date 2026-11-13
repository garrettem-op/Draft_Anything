# DRAFT ANYTHING — MASTER DEVELOPMENT DIRECTIVE

**Project:** `garrettem-op/Draft_Anything`

**Mission:** Create the most credible, consistent, and enjoyable cross-universe character-drafting and battle simulation we can build.

## Our primary objective

The game must understand what characters can actually do and translate that understanding into plausible battle outcomes.

For example, Silver Surfer should generally be favored against standard Black Adam because of his broader cosmic capabilities, although the specific continuity, circumstances, and abilities involved can change the result.

We do not want arbitrary numerical rankings, artificial competitive balance, or isolated fixes that fail to improve the underlying system.

## Development priorities

**Priority 1 — Complete the existing research automation.**

Finish and verify PRs #98, #100, and #102, including branch protection and security review. Demonstrate a complete unattended research, review, validation, and merge cycle. Do not expand the infrastructure beyond what is needed to make it reliable.

**Priority 2 — Research every character and variant.**

Build complete, continuity-specific combat profiles, including abilities, feats, limitations, weaknesses, relevant opponents, special conditions, and campaign eligibility tags.

Use sources that actually support the claims. Separate verified evidence from inference and uncertainty. Never fabricate feats or citations.

**Priority 3 — Improve the universal combat engine.**

Use the research to develop consistent power scaling, matchup logic, ability interactions, and battle outcomes.

Avoid artificial balance. Exceptionally powerful characters and variants must be capable of overwhelming weaker opponents. Do not confuse game fairness with fictional combat credibility.

Investigate systematic causes of incorrect outcomes rather than patching individual characters.

**Priority 4 — Standardize gameplay across all modes.**

All modes must share character identities, variants, signature abilities, campaign tags, and combat calculations. Differences should arise from drafting formats, eligibility constraints, and victory conditions.

**Priority 5 — Validate and release V2.**

Build a representative benchmark suite covering close matchups, mismatches, exceptional variants, counters, and team battles. Verify both numerical outcomes and explanations. Release only after regression and gameplay acceptance testing.

## Agent responsibilities

**Gemini:** High-volume research and structured evidence gathering. Submit small, resumable research batches without making unsupported claims.

**Claude:** Engineering implementation, research review, code corrections, automated tests, and PR maintenance.

**ChatGPT:** Combat-system direction, independent technical auditing, cross-system integration, benchmark design, and implementation oversight.

**GitHub Actions:** Scheduling, validation, and controlled integration of reviewed research data.

These roles are flexible. Do not delay straightforward work merely because another agent is nominally responsible.

## Working rules

1. Gameplay quality is the primary success measure.
2. Fix root causes, not isolated symptoms.
3. Never claim a task is complete until the relevant code or research has been verified.
4. Preserve the live V1 game while developing V2.
5. Maintain a clear distinction between provisional and reviewed research.
6. Use automated checks for repeatable engineering requirements.
7. Require substantive review for sensitive automation changes.
8. Do not impose unnecessary approval ceremonies on ordinary development.
9. Avoid new paid API usage without explicit authorization.
10. Keep the GitHub implementation ledger current, with issue #101 as the coordination hub.

## Immediate instructions

- Complete and verify the existing V2 research infrastructure.
- Resolve the scheduler's privileged-code execution concern before activation.
- Start the full-roster research backlog as soon as the end-to-end test succeeds.
- Continue combat-engine design and benchmark development in parallel.
- Report blockers with a proposed solution, not merely a request for the owner to investigate.
- Do not introduce additional infrastructure unless it solves a demonstrated problem.

## Definition of success

A player should be able to draft virtually any supported character or variant, place that character into any supported battle mode, and receive an outcome that is mechanically consistent, faithful to the character's documented capabilities, and explainable.

**The research pipeline exists to improve the game. The game does not exist to justify the research pipeline.**

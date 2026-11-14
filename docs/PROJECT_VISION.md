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

## Leadership and division of labor (effective 2026-11-13)

**Claude is the project lead.** The owner, Garrett Minyard, put Claude in charge of Draft Anything end to end: the plan, the priorities, the combat-system design, the research pipeline, the backlog, the PR queue and the release path. The other agents assist at Claude's direction. Claude decides; where a decision is the owner's, it is listed below.

**Claude (lead):** Owns the roadmap and every priority above. Designs and implements the combat engine, the Option C evaluator and the benchmark suite. Reviews, corrects and approves research. Maintains the PR queue and issue #101. Settles disputes between agents, and unblocks work instead of waiting for permission. Reports blockers with a proposed solution.

**Gemini:** High-volume research and structured evidence gathering. Submits small, resumable batches, each claim backed by a cited source. Gemini output is always provisional until Claude has reviewed it.

**ChatGPT:** Advisor and independent auditor. Reviews engineering, scoring and evaluator changes when asked, designs benchmark cases, and challenges Claude's reasoning. ChatGPT's reviews inform decisions and do not block research work. Research approval is no longer waiting on ChatGPT.

**GitHub Actions:** Scheduling, validation, and controlled integration of reviewed research data.

**Owner (Garrett):** Keeps the decisions that are not delegated: new paid API spend or billing, any change to the live V1 game or its deployment, deploying or releasing V2, credentials and repository security settings, and changing this directive.

**Review and merging.** The owner has asked Claude to run development the way a solo developer owns their own game and not to involve him in routine review or merging (2026-11-13).
- Claude merges its own PRs into `develop/v2-option-c` and `main` once the relevant tests pass and the change stays inside the owner's reserved decisions above. It states in the PR what was tested and what was not.
- Research PRs are authored by Gemini through Actions. Claude reviews them (checks cited support, corrects or flags records), then approves and labels, and the tick's merge gate merges them. The source-support check (`tools/v2-source-support.cjs`) backs this up.
- ChatGPT audits are advisory. Claude asks for one when a change touches scoring, the evaluator or security-sensitive automation, weighs the findings, and decides.
- Never touch the V1 release, production Pages or Supabase, or credentials without the owner.

Roles are flexible. Do not delay straightforward work merely because another agent is nominally responsible.

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

# V2 research pipeline: Gemini worker and scheduler tick

Builds on #98 (validator, merge gate). V2 only: nothing here edits V1, deploys, or calls a paid API.

Governing plan: [`docs/PROJECT_VISION.md`](https://github.com/garrettem-op/Draft_Anything/blob/main/docs/PROJECT_VISION.md) on `main`. Every Gemini call receives it (see below).

## The loop

```
scheduler (main: .github/workflows/v2-research-tick.yml, every 30 min)
  └─ snapshot job (unprivileged) reads the roster; privileged jobs run tools/v2-research-tick.cjs from pinned TOOLS_SHA
       1. reconcile  open research-only PRs: post a validate-research check if the head has none,
                     then run the merge gate (label + current-head independent approval + green checks)
       2. generate   (only if vars.GEMINI_FREE_TIER_CONFIRMED == 'true')
                     drain the queue with Gemini until: queue empty | free-tier daily quota | 25-min budget
                     -> one PR per batch of 10 identities, opened by github-actions[bot]
       3. reconcile  again, so new PRs get their validation check in the same tick
Claude review session (scheduled, hourly)
  └─ reviews Gemini PRs, corrects or flags records, approves as garrettem-op, adds v2-research-approved
merge gate (#98)  -> run by the next tick's reconcile step; the only merge path
```

### Trust boundary (fix for ChatGPT's #102 review)

Reading the roster means executing the game's own JavaScript (`index.html`, `data/*.js`), so code from `develop/v2-option-c` only ever runs in an **unprivileged** job:

| Job | Runs code from | Token | Secrets |
|---|---|---|---|
| snapshot | develop/v2-option-c (HEAD) | `contents: read` | none |
| reconcile | pinned `TOOLS_SHA` (reviewed, merged) | contents/pull-requests/checks write | none |
| generate | pinned `TOOLS_SHA` | contents/pull-requests/issues write | `GEMINI_API_KEY` |

The snapshot job outputs JSON only (`--snapshot`: roster ids + merged records). The privileged jobs load it through `fromSnapshot`, which strictly validates its shape and treats it as data. They never check out the development branch, never shell out to git, and write only through the GitHub REST API. `TOOLS_SHA` lives in the main-branch workflow file. Changing it takes a reviewed PR to `main`, and the workflow refuses a SHA that is not already merged into `develop/v2-option-c`.

Polling replaces event chaining on purpose: anything done with `GITHUB_TOKEN` (opening a PR, merging) does not trigger other workflows, so the tick re-checks state every run. Every step is idempotent; a missed or failed tick is picked up by the next one.

## Generation details (`tools/v2-gemini-worker.cjs`)

- **Project vision in every call.** At the start of each run the tick reads `docs/PROJECT_VISION.md` from `main` through the REST API. `main` is the trusted branch the scheduler itself lives on. The tick sends the full text as Gemini's `systemInstruction`, together with Gemini's role under the directive: separate evidence from inference, never fabricate, no artificial balance. If the file can't be read, the run stops before any model call. The batch's `method` field records the exact blob that was used.
- **Priority 2 profile fields.** Besides offense, defense, weaknesses and feats, the schema asks for `limitations` (limits on the character's own powers), `mobility`, `notableResults` (documented fights against named opponents, including losses), `conditional` (abilities that depend on an item, form, power source or circumstance) and `campaignTags`.
- **Campaign tags** are proposals restricted by schema enum to the game's own vocabulary (`CHARACTER_ABILITY_TAG_FAMILIES` in `data/character-abilities.js`: 12 broad families plus their specific tags). The prompt states the owner's tag rulings, for example that gunners don't earn pilot, giants are about 8 ft or taller, and a role or title is not a stealth feat. Each tag must cite a source index. A tag outside the vocabulary is discarded, and one whose source fails the check moves to `unknowns`. Proposals don't change game eligibility; adopting them into `data/character-abilities.js` is a separate reviewed step.

- Gemini REST API with `responseMimeType: application/json` and a response schema, so output is structured JSON, not a prose summary.
- Default model `gemini-2.5-flash-lite`; override with repository variable `GEMINI_MODEL` if Google retires it (a 404 stops the run with a clear error).
- Paced at about 13 requests/minute. A per-minute 429 waits for Google's `retryDelay`; a per-day quota 429 ends generation until the next tick (the quota resets daily). Three transient failures on one batch set it aside until the next tick.
- Every record is forced to `provisional`; reviewer fields and numeric tiers are stripped.
- **Automatic evidence check:** every cited URL is fetched. Dead links and pages that never mention the character are removed; feats that lose their source move to `unknowns`. Bot-blocked pages (401/403/429) are kept and flagged in the PR body.
- Records that still fail validation (no working source, variant without `formDifferences`, missing) are listed in the issue **"[V2 Research] Needs manual research"** and skipped by the queue, so one bad character never blocks the rest.
- Identities already merged, claimed by any open PR, or on the manual list are never offered again.
- No daily cap. Throughput is bounded by the Gemini free-tier quota, the 25-minute budget per tick, and review speed.

## Setup (owner)

1. Merge #98, then this PR, into `develop/v2-option-c` (or merge only this PR, which contains #98). Then set `TOOLS_SHA` in #102 to this PR's merge commit, review that change, and merge #102 into `main`.
2. Settings → Actions → General → Workflow permissions: **Read and write**, and tick **Allow GitHub Actions to create and approve pull requests** (required for the bot to open PRs).
3. Confirm `GEMINI_API_KEY` belongs to a Google AI Studio project with **no billing account**, then add repository variable `GEMINI_FREE_TIER_CONFIRMED = true`. Free-tier prompts may be used by Google to improve its products.
4. Done 2026-11-12: `develop/v2-option-c` has a ruleset (pull requests only, no force push or deletion). Recommended: the same for `main`.

## Verify it is working

- Actions → "V2 research tick" → run manually; the job summary lists Gemini calls, PRs opened, records, manual-research count and the remaining backlog.
- A new `Gemini V2 research: …` PR appears, authored by `github-actions[bot]`, with a green `validate-research` check.
- After approval + label, the gate log says `Eligible … Merged`, and the next tick shows the merged count rising.

## Local commands

```bash
node tools/v2-research-tick.cjs reconcile --dry-run   # what the tick would validate/merge, no writes
node tools/v2-research-tick.cjs generate --vision docs/PROJECT_VISION.md   # local run (needs GEMINI_API_KEY and gh auth; writes PRs)
node --test tests/v2-gemini-worker.test.cjs tests/v2-research-gate.test.cjs tests/v2-research-pipeline.test.cjs
```

## Not tested end to end yet

The live Gemini call, URL fetching from a GitHub runner, check-run creation and PR creation by `GITHUB_TOKEN` can only run in Actions after setup. The first manual tick run is the test.

Rehearsed offline on 2026-11-12 with a fake `gh` and a stubbed Gemini: `generate` read the vision through the contents API, sent it as the system instruction with the 45-tag enum, and produced three batches. Each batch was one branch, one file and one PR, all via REST. An identity whose only source failed the name check went to the manual-research issue.

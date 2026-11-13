# V2 research pipeline: Gemini worker and scheduler tick

Builds on #98 (queue, validator, merge gate). V2 only: nothing here edits V1, deploys, or calls a paid API.

## The loop

```
scheduler (main: .github/workflows/v2-research-tick.yml, every 30 min)
  └─ checks out develop/v2-option-c and runs tools/v2-research-tick.cjs
       1. reconcile  open research-only PRs: post a validate-research check if the head has none,
                     then run the merge gate (label + current-head independent approval + green checks)
       2. generate   (only if vars.GEMINI_FREE_TIER_CONFIRMED == 'true')
                     drain the queue with Gemini until: queue empty | free-tier daily quota | 25-min budget
                     -> one PR per batch of 10 identities, opened by github-actions[bot]
       3. reconcile  again, so new PRs get their validation check in the same tick
Claude review session (scheduled, hourly)
  └─ reviews Gemini PRs, corrects or flags records, approves as garrettem-op, adds v2-research-approved
merge gate (#98)  -> merges on the review event, or on the next tick
```

Polling replaces event chaining on purpose: anything done with `GITHUB_TOKEN` (opening a PR, merging) does not trigger other workflows, so the tick re-checks state every run. Every step is idempotent; a missed or failed tick is picked up by the next one.

## Generation details (`tools/v2-gemini-worker.cjs`)

- Gemini REST API with `responseMimeType: application/json` and a response schema, so output is structured JSON, not a prose summary.
- Default model `gemini-2.5-flash-lite`; override with repository variable `GEMINI_MODEL` if Google retires it (a 404 stops the run with a clear error).
- Paced at about 13 requests/minute. A per-minute 429 waits for Google's `retryDelay`; a per-day quota 429 ends generation until the next tick (the quota resets daily). Three transient failures on one batch set it aside until the next tick.
- Every record is forced to `provisional`; reviewer fields and numeric tiers are stripped.
- **Automatic evidence check:** every cited URL is fetched. Dead links and pages that never mention the character are removed; feats that lose their source move to `unknowns`. Bot-blocked pages (401/403/429) are kept and flagged in the PR body.
- Records that still fail validation (no working source, variant without `formDifferences`, missing) are listed in the issue **"[V2 Research] Needs manual research"** and skipped by the queue, so one bad character never blocks the rest.
- Identities already merged, claimed by any open PR, or on the manual list are never offered again.
- No daily cap. Throughput is bounded by the Gemini free-tier quota, the 25-minute budget per tick, and review speed.

## Setup (owner)

1. Merge #98, then this PR, into `develop/v2-option-c`; merge the scheduler PR into `main`.
2. Settings → Actions → General → Workflow permissions: **Read and write**, and tick **Allow GitHub Actions to create and approve pull requests** (required for the bot to open PRs).
3. Confirm `GEMINI_API_KEY` belongs to a Google AI Studio project with **no billing account**, then add repository variable `GEMINI_FREE_TIER_CONFIRMED = true`. Free-tier prompts may be used by Google to improve its products.
4. Optional: branch ruleset on `develop/v2-option-c` restricting `.github/**` and `tools/**` changes to reviewed PRs.

## Verify it is working

- Actions → "V2 research tick" → run manually; the job summary lists Gemini calls, PRs opened, records, manual-research count and the remaining backlog.
- A new `Gemini V2 research: …` PR appears, authored by `github-actions[bot]`, with a green `validate-research` check.
- After approval + label, the gate log says `Eligible … Merged`, and the next tick shows the merged count rising.

## Local commands

```bash
node tools/v2-research-tick.cjs reconcile --dry-run   # what the tick would validate/merge, no writes
node --test tests/v2-gemini-worker.test.cjs tests/v2-research-gate.test.cjs tests/v2-research-pipeline.test.cjs
```

## Not tested end to end yet

The live Gemini call, URL fetching from a GitHub runner, check-run creation and PR creation by `GITHUB_TOKEN` can only run in Actions after setup. The first manual tick run is the test.

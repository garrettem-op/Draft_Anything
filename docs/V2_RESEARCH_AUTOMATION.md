# V2 continuous research and multi-agent operating procedure

**Branch isolation:** work targets `develop/v2-option-c`; never change `main`, `releases/v1.0.0` or deployment workflows. The validation workflow here does not deploy and does not invoke Gemini, Claude, OpenAI or any paid research API.

## Current operating model
Governing plan: [`docs/PROJECT_VISION.md`](https://github.com/garrettem-op/Draft_Anything/blob/main/docs/PROJECT_VISION.md) on `main`. Coordination hub: issue #101.

- A deterministic, no-cost Node script enumerates every character and named form using the real roster and `CAMPAIGN_VARIANTS`; identities are `pool:Name` or `pool:Name|Form`. The roster is re-enumerated rather than using frozen counts. The manifest is not proof of research.
- Research batches are JSON stored in `research/option-c/batches/*.json`.
- `V2 research validation` (on human-opened PRs) checks schema, exact identities, source claim descriptions, evidence indexes, duplicate records, form-specific differences and the pipeline tests.
- **One merge path.** Merging is done only by the scheduled research tick (`.github/workflows/v2-research-tick.yml` on `main`, #102), which runs the gate (`tools/v2-research-gate.cjs`) from a pinned, already-merged commit. The gate merges a PR only when it touches research batch JSON exclusively, is labeled `v2-research-approved`, has an **APPROVED** review from a non-author, non-bot account **on the current head commit**, has no outstanding `CHANGES_REQUESTED`, and every check on that head completed green, including `validate-research`. It squash-merges through the REST API pinned to the approved head SHA. Any code, workflow, test or scoring change needs manual review and merge. A draft is ineligible. Never apply the approval or label before checking the actual evidence, not just the URL format.
- The earlier event-driven merge workflow and issue-based assignment queue were removed (2026-11-12). The merge workflow ran mutable branch code with a write token. The queue handed out the same identities the automated worker draws from. The tick replaces both: it polls, so it also works for PRs opened with `GITHUB_TOKEN`, which fire no workflows. A merge waits at most one tick (30 minutes).

## Research file format

```json
{
  "batchId": "MCU research batch 02",
  "schemaVersion": 1,
  "characters": [
    {
      "id": "mcu:Iron Man",
      "continuity": "Marvel Cinematic Universe, Phase Three films",
      "summary": "Tony Stark's independently controlled powered armor supplies flight and ranged energy attacks.",
      "offense": {"domains": ["energy", "tech"], "techniques": ["repulsors"]},
      "defense": {"mechanisms": ["armored shell"]},
      "weaknesses": ["Suit damage or loss of power"],
      "sources": [{"url": "https://www.marvel.com/characters/iron-man-tony-stark/on-screen", "supports": "Character identity and suit-based equipment"}],
      "researchStatus": "provisional"
    }
  ]
}
```

Optional fields accepted and partly checked: `feats[]`, `notableResults[]`, `conditional[]` (objects; a `source` value must index an existing `sources[]` entry), `unknowns[]`, `mobility[]`, `support[]`, `range`. A source's `supports` text must describe the claim, not repeat the URL. One credible source is enough for an ordinary claim; flag contradictions with `needs-review` or `unknowns` instead of blocking the batch.

The sample is **not reviewed evidence**. To advance a record to `reviewed`, independently inspect its cited support and add `reviewedBy` and `reviewNotes`. Claims must name the actual scene/issue or other source detail; a movie landing page alone does not prove a fine-grained feat. Record negative findings with an explanation; missing evidence is **unknown**, not a researched no. Forms need `formDifferences` and distinct continuity. Do not add speculative numeric combat tiers or default victories.

Run locally:

```bash
node tools/v2-research-pipeline.cjs --report
node tools/v2-research-pipeline.cjs --validate
node tools/v2-research-pipeline.cjs --next [--size N] [--claimed ids.json]
node tools/v2-research-gate.cjs garrettem-op/Draft_Anything <pr> --dry-run
node --test tests/v2-research-gate.test.cjs
node --test tests/v2-research-pipeline.test.cjs
```

## Manual setup required

1. The label `v2-research-approved` must exist (it does). Only trusted reviewers apply it, and only after checking the evidence.
2. `develop/v2-option-c` has an active ruleset (changes only through pull requests, no force pushes or deletion), so code reaches the branch only through a PR. Recommended: the same protection for `main`, where the scheduler lives.
3. GitHub runs `schedule` triggers only from the default branch, so the scheduler is a single workflow file on `main` (#102). It ships idle until `TOOLS_SHA` is pinned to a reviewed commit on `develop/v2-option-c`.
4. **Identity constraint:** GitHub forbids approving your own PR, and the gate ignores author and bot approvals. Every agent currently acts as `garrettem-op`, so PRs opened by `garrettem-op` can only pass the gate with an approval from a different account. PRs opened by `github-actions[bot]` (the Gemini worker) can be approved by `garrettem-op`. Engineering PRs are merged by hand.
5. **No auto-merge for the existing PR #97**, because it edits adapter, HTML and tests, not just research JSON. It needs manual integration.

## Separation of responsibilities (from PROJECT_VISION.md)

- Gemini: high-volume research and structured evidence gathering, in small, resumable batches without unsupported claims.
- Claude: engineering, research review and correction, automated tests, PR maintenance.
- ChatGPT: combat-system direction, independent technical audit, integration, benchmark design.
- GitHub Actions: scheduling, validation and controlled integration of reviewed research data.
These roles are flexible.

## Known limitations and safety
The queue counts accepted JSON batches, **not** all legacy typed-battle entries. The coverage report must not conflate a provisional description with an approved combat profile. The validator checks syntax, URL presence and metadata, **not** whether every cited source truly supports the claim; that requires a human or trusted independently configured reviewer. Automated research stays `provisional` until a reviewer checks it. Phase 1 #82 and full-combat #83 remain incomplete until their own completion gates are met.

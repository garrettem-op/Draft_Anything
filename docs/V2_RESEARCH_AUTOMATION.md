# V2 continuous research and multi-agent operating procedure

**Branch isolation:** work targets `develop/v2-option-c`; never change `main`, `releases/v1.0.0` or deployment workflows. The two workflows here do not deploy. They do not invoke Gemini, Claude, OpenAI or any paid research API.

## Current operating model
- A deterministic, no-cost Node script enumerates every character and named form using the real roster and `CAMPAIGN_VARIANTS`; identities are `pool:Name` or `pool:Name|Form`.
- Research batches are JSON stored in `research/option-c/batches/*.json`. The roster is re-enumerated rather than using frozen counts. The manifest is not proof of research.
- On a V2 research-data push, the **V2 research queue** workflow validates all batches and opens the next research assignment issue, avoiding duplicate open assignments. GitHub Actions also allows a manual `workflow_dispatch` bootstrap. **It does not launch a model**.
- A worker (human-operated Gemini, Claude or ChatGPT) takes the issue and submits a draft batch PR; another contributor independently verifies sources and status. There is no hidden cross-chat coordination.
- `V2 research validation` checks schema, exact identities, source claim descriptions, duplicate records, form-specific differences and tests.
- **Only** a PR touching research batch JSON exclusively, labeled `v2-research-approved`, having a GitHub **APPROVED** review from a non-author, non-bot account **on the current head commit**, no outstanding `CHANGES_REQUESTED`, and every other check on that head completed green (including `validate-research`) is merged by the gate (`tools/v2-research-gate.cjs`, squash, pinned with `--match-head-commit`). The gate waits up to ~10 minutes for running checks and can be re-run with `workflow_dispatch` (input `pr`). After a merge it dispatches the queue, because merges made with `GITHUB_TOKEN` do not fire push workflows. Any code, workflows, tests or scoring changes require manual review/merge. A draft is ineligible. Reviewer approval and label must not be applied before verifying actual evidence, not merely URL format.
- Even an approved research PR remains subject to GitHub branch protection and repository auto-merge settings. This workflow never deploys or bypasses policies.

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

1. The gate merges directly, so repository auto-merge does not need to be enabled. The label `v2-research-approved` must exist. Strongly recommended: configure ruleset/branch protection on `develop/v2-option-c` to require approvals, successful tests, dismiss stale reviews after pushes, and restrict bypass. An approval label is an extra gate, not a substitute for independent source review. Only trusted maintainers should apply `v2-research-approved`.
2. GitHub Actions must have permission to create issues, read PR reviews/checks, and enable auto-merge (`GITHUB_TOKEN` permissions may be organization-restricted). The queue and merge workflows report permission failures in Actions logs.
3. GitHub **cron schedules run only from the repository default branch**. Since this PR deliberately does not modify V1/default branch, unattended time-based dispatch is **not activated**. V2 push events and manual dispatch work after merge. To get true hourly work with no V1 code changes, arrange a trusted external scheduler/ChatGPT automation to invoke `workflow_dispatch`, or approve a separate minimal default-branch dispatcher PR.
4. **No autonomous Gemini or Claude worker is connected by this PR.** Chat subscriptions do not supply free unattended API access or GitHub token permissions. Gemini CLI/Claude Code Actions require their supported authentication and may generate provider usage costs. Do not insert secrets or claim continuous model research until credentials and budgets are explicitly approved. An external worker may instead submit JSON research through a normal PR at no new API expense when operated under an existing subscription/tool entitlement.
5. Queue deduplication: `--next` skips identities already merged **and** identities present in open PRs' batch files (`--claimed`). One open `[V2 Research Queue]` issue at a time; the queue closes an assignment automatically once all of its identities are merged or claimed by an open PR, then opens the next.
6. The gate runs on label/synchronize/ready events (`pull_request_target`, base-branch YAML) and on submitted reviews (`pull_request_review`, whose YAML comes from the PR merge commit; the gate *script* is still checked out from `develop/v2-option-c`). It waits for running checks. **Identity constraint:** GitHub forbids approving your own PR and the gate ignores author and bot approvals. Every agent currently acts as `garrettem-op`, so PRs opened by `garrettem-op` can only pass with an approval from a different account. PRs opened by `github-actions[bot]` (the Gemini worker) can be approved by `garrettem-op`. **Not yet tested end to end:** dispatching `v2-research-queue.yml` from a branch other than the default branch.
7. **No auto-merge for the existing PR #97**, because it edits adapter, HTML and tests, not just reviewed JSON. That requires manual integration.

## Separation of responsibilities

- Gemini: research independently and submit structured JSON with claim-specific evidence (manual without credentials).
- Claude: V2 evaluator engineering, follow-up test fixes and schema refinements (manual unless separately installed/authenticated).
- ChatGPT: independent audit, evidence discrepancies and repo integration by explicit tool runs or a separately configured automation.
- GitHub: deterministic queue, validation, branch guard and merge orchestration.

## Known limitations and safety
The queue counts accepted JSON batches, **not** all legacy typed-battle entries. The coverage report must not conflate a provisional description with an approved combat profile. The validator checks syntax, URL presence and metadata, **not** whether every cited source truly supports the claim; that requires a human or trusted independently configured reviewer. Because no paid AI calls are allowed, the system cannot autonomously produce verified new lore around the clock without a connected independent research worker. Phase 1 #82 and full-combat #83 remain incomplete until their own completion gates are met.

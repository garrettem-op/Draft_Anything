# Gauntlet shared results server

Collects Gauntlet votes from everyone who opts in, so rankings can be built from many voters instead of one device. Separate Supabase project, so the multiplayer database is never touched.

## What exists
- **Project:** `draft-anything-gauntlet` (ref `xijqendpphnclwthqtfy`, us-east-1), created 2026-11-15. Not the game's production project.
- **Table `public.gauntlet_votes`:** one row per vote (`supabase/gauntlet/migrations/001_gauntlet_votes_v1.sql`). Row-level security is on and `anon`/`authenticated` have no privileges, so only the edge function (service role) can read or write. Constraints mirror the vote schema (canonical pair, orientation, winner rules, id and session formats).
- **View `public.gauntlet_pair_counts`:** pair counts with every vote included. No session keys or timestamps. Also locked to the service role.
- **Edge function `submit-votes`** (`supabase/gauntlet/functions/submit-votes/index.ts`, JWT check off because it does its own checks): POST `{votes:[...]}`, 1-20 votes, one session per request. It validates each vote with the same rules as the client (`tests/gauntlet-server.test.cjs` checks the two validators agree), allows 90 votes per session per minute (429 otherwise), and checks a Cloudflare Turnstile token only when the `TURNSTILE_SECRET` secret is set. It stores no IP address or personal data.
- **Game side:** Gauntlet screen has an opt-in "Share my votes anonymously" button. Nothing is sent until the voter turns it on. The newest vote is held back so Undo works; the rest are sent in batches and on page hide. Rate limits (429) and server errors keep the queue; any other refusal drops the batch so one bad vote cannot block the rest.

## Repeats
Repeated answers to the same matchup are wanted and all count.
- A vote's `id` is the primary key, so only an exact **resend of the same vote** (a retry after a dropped connection) is ignored; the response calls these `alreadyStored`.
- Separate votes on the same matchup, from one voter or many, have different ids and are all stored and counted in the pair counts, rankings and `repeatPairs` / `unanimousRepeatPairs` totals.
- The dealer deliberately re-asks already-voted matchups (about 15% of deals, fewest answers first) with the sides randomly swapped, so agreement cannot be explained by position bias. The voter is not told it is a repeat.
- Different answers to the same matchup show up as contested pairs, not as errors.
- Per-session weighting of repeats from the same voter is a later choice; the raw table keeps the session so it stays possible.

## Publishing (set up, waiting on one owner step)
- **Database function `gauntlet_public_aggregate()`** (`supabase/gauntlet/migrations/002_public_aggregate.sql`) returns pair counts only: no vote ids, session codes or timestamps. The public (publishable) key can call it and nothing else; it cannot read the votes table or the view. Every vote counts, repeats included.
- **`tools/gauntlet-publish.cjs`** turns that response into `data/gauntlet/aggregates-v1.json` (same format the ranking tool already reads). Output has no timestamps, so the file changes only when votes change. It refuses summaries whose numbers do not add up and writes nothing when there are no votes yet.
- **`.github/workflows/gauntlet-publish.yml`** runs it daily (09:23 UTC) and on demand, and commits the file to `develop/v2-option-c` only when it changed. It needs **no GitHub secret**. The job that runs repo code has a read-only token; the job that can write runs no repo code.
- **Owner step:** GitHub only runs scheduled and on-demand workflows from the default branch (`main`), so the file does nothing until it is copied to `main` (same arrangement as `v2-research-tick.yml`). It has not been copied; `main` was not touched. If `develop/v2-option-c` has branch protection that blocks the bot's commit, the run will fail visibly; no data is lost because it can be run again.
- Rankings from the published file: `node tools/gauntlet-rank.cjs data/gauntlet/aggregates-v1.json`.

## Browser access
The function accepts browser requests only from `https://garrettem-op.github.io` (and `localhost` / `127.0.0.1` for local testing). This stops other websites' pages from posting votes through a visitor's browser. It does **not** stop someone calling the endpoint directly from a script; the per-session rate limit and validation are what limit that. If the game moves to a custom domain, add it to `ALLOWED_ORIGINS` in the function and redeploy.

## Not done yet
- **Turnstile:** deliberately left until there is real traffic. It needs a Cloudflare site key (client) and secret (`TURNSTILE_SECRET` on the function).
- **Live test:** the function is deployed, but this environment cannot reach the Supabase domain, so it has not been called end to end from a browser. The validator, SQL constraints, summary function (checked with sample rows), client queue and browser flow (against a mocked endpoint) are tested. Check Supabase function logs after the first real vote.
- **Removal requests:** votes are keyed to a random session code with no identity, so a specific voter's votes cannot be found later unless they keep their session code.
- **Cost:** created under the organization's plan; check the Supabase billing page.

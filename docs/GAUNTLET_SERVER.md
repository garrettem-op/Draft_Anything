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

## Not done yet
- **Publishing job:** reading `gauntlet_pair_counts` into `data/gauntlet/aggregates-v1.json` on a schedule needs a GitHub Action and a stored secret. Workflows and secrets were not touched. Until then: export from the dashboard or ask Claude to query the view.
- **Turnstile:** needs a Cloudflare site key (client) and secret (`TURNSTILE_SECRET` on the function). Without it, only the per-session rate limit protects the endpoint, and a script can make up session codes.
- **Live test:** the function is deployed, but this environment cannot reach the Supabase domain, so it has not been called end to end from here. The validator, the SQL constraints, the client queue and the browser flow (against a mocked endpoint) are tested. Check Supabase function logs after the first real vote.
- **Removal requests:** votes are keyed to a random session code with no identity, so a specific voter's votes cannot be found later unless they keep their session code.
- **Cost:** created under the organization's plan; check the Supabase billing page.

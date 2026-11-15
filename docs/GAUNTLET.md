# Gauntlet (experimental, flag-gated)

Implements the first slice of issue #84 / Phase 3 of `docs/WHOLE_ROSTER_AUDIT_PROTOCOL.md`: a head-to-head voting mode whose results build a ranking ladder and give the Option C evaluator something to be calibrated against.

**Status:** local-only, OFF by default, no effect on any game mode, match outcome, report or the shadow evaluator. Votes are a calibration signal, not training truth.

## Turning it on
Open the game with `?gauntlet=1` (remembered on this device in `localStorage['da.flag.gauntlet']`); `?gauntlet=0` turns it off. With the flag off the mode button does not render and a stored `gauntlet` mode falls back to Championship.

## How it works
- Pick a left pool and a right pool (same pool = rank within a universe; different pools = link universes). One character per side is dealt at random, never the same character or the same name listed in two pools. Orientation (left/right) is randomized.
- Coverage-aware dealing: each draw samples candidate pairs and keeps the least-voted one, preferring rarely seen characters; the last 20 pairs are not repeated.
- Choices: pick a side, "too close to call", skip, plus an optional "lean" marker on the next pick. Undo removes the last vote. Nothing about the engine's prediction is shown before voting.
- Stable IDs are the existing `pool:slug` candidate IDs. Form/variant IDs (`pool:slug#form`) are accepted by the schema but the screen does not deal forms yet.

## Vote record (`data/gauntlet.js`, schema v1)
`id` (session + sequence, the dedupe key) · `session` (random pseudonymous key, no personal data) · `key` (order-independent pair key `a|b`, `a < b`) · `a`, `b`, `left`, `right` · `outcome` (`win` / `tie` / `skip`) · `winner` · `pools` · `ts` · `model` · `confidence` (`null` / `sure` / `lean`). `validateVote` rejects anything inconsistent (self pairs, winner outside the pair, key/pool mismatch, bad timestamps).

## Ranking
Regularized Bradley-Terry fitted by minorization-maximization on deduplicated pair counts. Ratings use an Elo-like scale (1500 average, 400 points = 10:1 odds); ties count half a win. A phantom average opponent (`PRIOR_GAMES = 1`, an uncalibrated editorial constant) keeps sparse data finite, and every row carries a 95% interval, a Wilson win-rate interval, and a `component` number. Characters in different components are not directly or indirectly linked, so their relative order rests on the prior alone.

## Inference and checks
- `winGraph` / `infer`: transitive hints ("A beat B, B beat C, so A probably beats C", up to four steps; conflicts are reported, never resolved). Hints are for choosing pairs and spotting problems, not rulings.
- `contradictions`: loops in the majority-win graph (iterative Tarjan SCC) and pairs where both sides have won.
- Position bias: share of decisive picks that went to the left card, with a Wilson interval.
- `coverage`: characters voted, within-pool vs cross-pool pairs, per-pool share when a roster is supplied.
- `compareToPredictor(agg, predict)`: counts agreement/disagreement with any `predict(a, b)` function. It is **not yet wired to the shadow evaluator**: what "1v1" means in Battle Royale and in each sport needs an owner decision first.

## Export and tooling
- Screen: "Download votes (JSON)" and "Copy aggregate JSON".
- `node tools/gauntlet-rank.cjs votes.json [more.json] [--top N] [--json] [--write-aggregates out.json] [--csv out.csv]` merges votes (deduplicated by id) and aggregate files and prints totals, position bias, coverage, contradictions and the ladder.
- Aggregates (`draft-anything.gauntlet.aggregates`, v1) contain pair counts only: no session keys, timestamps or personal data. Do not feed the same votes in as both a votes file and an aggregate file.

## Repeats
Repeated answers to the same matchup all count. The dealer re-asks already-voted matchups on purpose (about 15% of deals, sides swapped). Aggregates report `repeatPairs` and `unanimousRepeatPairs`.

## Shared server
See `docs/GAUNTLET_SERVER.md` (opt-in anonymous sharing to a separate Supabase project). A daily publishing job writes `data/gauntlet/aggregates-v1.json`; it activates once its workflow file is on `main` (see that doc).

## Not built (owner decisions)
Also not built: bot check (Turnstile), team-level Gauntlet, forms in the dealer, comparison against the shadow evaluator.

## Tests
`node --test tests/gauntlet.test.cjs` (core, ranking, inference, UI flow, CLI) and `node tests/gauntlet-browser.cjs` (flag gating and a real voting flow in Chromium).

The vote screen now has a feed layer (combos, ladder tags, surprise cards, titles, sounds): see `docs/GAUNTLET_FEED.md`. It changes presentation only; votes are unchanged.

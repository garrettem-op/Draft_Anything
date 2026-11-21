# Evaluator calibration (2026-11-21)

The evaluator now gives Battle Royale odds that match the game's own fights. Before this, its constants were first-pass guesses: lopsided matchups it called 84/16 actually went 99/1, and only about a third of results fell inside its reported range. Nothing here changes a game result: the evaluator still runs in shadow mode.

## What changed
1. **The evaluator sees research moves.** Since #423, V2 fights give 617 characters and forms a move from their research record. The evaluator now reads the same moves (origin `research-move`, evidence provisional), counts them as typed coverage, and no longer lists those fighters under "no typed combat profile".
2. **Battle Royale constants are fitted** to the game's own fights:

| Constant | Before | Now | Fitted values (two seeds) |
|---|---|---|---|
| Rating points per logit, team scores up to 99.2 | 20 (one scale for all) | **3.6** | 3.68, 3.58 |
| Rating points per logit, the part of a team score above 99.2 | 20 | **10.6** | 10.66, 10.60 |
| Weight of the matchup-edge (interaction) term | 0.8 | **1.0** | 0.97, 1.09 |
| Range half-width | 2 + up to 3 grid steps, floored at 5%–95% | **4 + up to 2 steps (about ±25%), may reach 0% and 100%** | 80% of held-out results land within 25% of the estimate |

**Why two scales.** In a fight, team score only raises damage until the support multiplier hits its cap, at a team score of 99.2 (`rating / 80`, capped at 1.24, in `data/brawl-combat.js`). Above that, only the fighters' own fits still count, so rating points matter about three times less. A single scale (4.6) fits almost as well on average, but it overrates the stronger side whenever both crews are above the cap.

**The range may reach 0% and 100%.** The 5%–95% limit still applies to the estimate itself. Lopsided fights often end 100–0, and a range that stops at 95% can never contain that result.

3. **Sports are unchanged.** The existing sports scale (0.6 × the upset sigma) already matches simulated games: the fitted values are 0.57–0.70, and fitting them gives no better scores.

## How it was measured
`node tools/option-c-calibrate.cjs --per-pool 80 --fights 100` (seed 20261121, checked again with seed 777):
- **Battle Royale:** 880 random matchups across the 10 pools plus a mixed all-pool sample. Each was played 100 times with seeded randomness on the V2 engine with research powers on.
- **Fitting:** maximum-likelihood logistic regression with no intercept, so the model stays side-symmetric. It was fitted on the even-numbered matchups and scored on the odd ones, which it never saw.
- **Sports:** the same method per sport, at the low (2.5) and high (6) upset settings.

### Battle Royale, held-out matchups

| | Before | Now |
|---|---|---|
| Log loss per fight | 0.523 | **0.402** |
| Brier score | 0.171 | **0.131** |
| Results inside the reported range | 36% | **89%** |

| Estimate band | Before: estimated → actual | Now: estimated → actual |
|---|---|---|
| 0–20% | 15% → 1% | 7% → 8% |
| 20–40% | 32% → 13% | 30% → 29% |
| 40–60% | 50% → 47% | 50% → 51% |
| 60–80% | 69% → 92% | 69% → 64% |
| 80–100% | 84% → 99% | 94% → 93% |

Compared with ratings alone (log loss 0.417), the matchup-edge term adds a small but consistent improvement on both seeds.

**Per pool (Brier, held out):** MCU 0.143, DC 0.164, Toons 0.101, Muppets 0.124, Games 0.074, Pokémon 0.138, Star Wars 0.162, Middle-earth 0.168, Harry Potter 0.140, NBA 0.153, Mixed 0.076. Lower is better; 0.25 is a coin flip.

## Known limits
- **It predicts the game engine, not canon.** The odds describe what this game's fights produce. Because every research move currently has the same standard strength, the odds will need refitting once a strength rule is added.
- **Individual matchups can still miss.** Half of held-out matchups land within 10% of the estimate, and one in ten is more than 35% off. The matchup explainer's example is one of the bigger misses: the evaluator gives Heavy Hitters 80%, while the fights go about 52/48 (48% is inside its 0–50% range). It credits Darkseid's and Scarlet Witch's top-tier powers with more edge against research moves than the fights show. That interaction rule is the next thing to refine.
- **Refit after rule changes.** Run the tool again after any change to fight rules, research moves or the support cap, and update the constants in `data/option-c/probability.js`.
- **Sports power uses are still not valued.** They are reported but not weighted until rulings exist.

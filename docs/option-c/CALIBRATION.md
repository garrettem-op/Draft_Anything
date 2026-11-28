# Evaluator calibration (2026-11-21, refitted 2026-11-28)

The evaluator now gives Battle Royale odds that match the game's own fights. Before this, its constants were first-pass guesses: lopsided matchups it called 84/16 actually went 99/1, and only about a third of results fell inside its reported range. Nothing here changes a game result: the evaluator still runs in shadow mode.

## Refit of 2026-11-28 (after the fight rules and form on the day)
The fight engine changed a great deal after the first fit: power tiers, the five fight rules in `FIGHT_RULES.md`, and form on the day, which makes close fights less decisive. The evaluator was brought level and refitted.

**What the evaluator now reads, from the same sources the engine uses:**
- A reviewed power that overcomes instead of wounding (`overcome-power`), and what stops it: a guard, ward or equal power, a cosmic rank, or a machine with no mind to take.
- Named counters held in a fighter's own record (`named-counter`: the Patronus Charm against a Dementor).
- A reviewed melee signature striking above its owner's stored body.
- Intrinsic cosmic ranks (Galactus, Morgoth, Franklin Richards), which it treated as ordinary fighters before.
- Worn armour and fighting proficiency, reported for context only: their small effect is inside the numeric fit.

**Constants, refitted** (`node tools/option-c-calibrate.cjs`, 720 matchups × 100 fights across the ten pools, NBA and a mixed sample; seeds 20261121 and 20261128):

| Constant | 2026-11-21 | Now | Fitted values (two seeds) |
|---|---|---|---|
| Rating points per logit, team scores up to 99.2 | 3.6 | **4.7** | 4.82, 4.65 |
| Rating points per logit, the part of a team score above 99.2 | 10.6 | **20** | 15.8, 25.4 (a weak signal) |
| Weight of the matchup-edge term | 1.0 | **1.5** | 1.50, 1.48 |

Fights are less decisive per rating point than before (form on the day), and the matchup-edge term carries more weight now that it knows the new rules.

| Held-out matchups (seed 20261121) | Old constants, old rules | Now |
|---|---|---|
| Log loss per fight | 0.440 | **0.420** |
| Brier score | 0.140 | **0.137** |
| Results inside the reported range | 91% | **93%** |

| Estimate band | Old constants: estimated → actual | Now: estimated → actual |
|---|---|---|
| 0–20% | 7% → 11% | 8% → 9% |
| 20–40% | 29% → 37% | 28% → 26% |
| 40–60% | 50% → 45% | 51% → 54% |
| 60–80% | 71% → 65% | 71% → 67% |
| 80–100% | 93% → 92% | 94% → 95% |

**One-on-one checks** (evaluator estimate against 400 real fights): Professor X vs John Wick 90% / 85%; Harry Potter vs a Dementor 95% / 82%; Sam vs Shelob 55% / 55%; Hulk vs Thor 50% / 47%; Gimli vs Legolas 35% / 27%; Galactus vs Thor 95% / 100%.

**Known weakness: lopsided one-on-one fights.** The numeric term was fitted on full seven-fighter crews, where one character moves the team score a little. In a duel it is too cautious: Hedwig vs Harry Potter is estimated 35% and is really 0%; Batman vs Superman 25% against 5%; Professor X vs Ultron 30% against 3%. The direction is right and the reason given is right, but the size is not. The engine's own probe fights (form on the day) would give the evaluator a direct read of the margin; that is not done here.

## What changed (first fit, 2026-11-21)
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
- **Individual matchups can still miss.** Half of held-out matchups land within 10% of the estimate, and one in ten is more than 35% off. The matchup explainer's example is one of the bigger misses: the evaluator gives Heavy Hitters 80%, while the fights go about 50/50 (50% is at the edge of its 0–50% range). It credits Darkseid's and Scarlet Witch's top-tier powers with more edge against research moves than the fights show. That interaction rule is the next thing to refine.
- **Refit after rule changes.** Run the tool again after any change to fight rules, research moves or the support cap, and update the constants in `data/option-c/probability.js`.
- **Sports power uses are still not valued.** They are reported but not weighted until rulings exist.

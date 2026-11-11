# Battle Royale combat model — audit implementation (PR #73)

This document records the first implementation pass for [combat audit #72](https://github.com/garrettem-op/Draft_Anything/issues/72). Lore/ability evidence review is tracked separately in [#75](https://github.com/garrettem-op/Draft_Anything/issues/75).

## Model vs canon
All values are **gameplay estimates**, not canonical numerical measures. Signature attacks and guards are bounded editorial mechanics. One match cannot establish relative canonical strength. Variant abilities require a reviewed profile; unreviewed forms inherit only their documented stat changes.

## Flow (Battle Royale only)
1. Drafted fighters receive active candidate attributes and selected variant form; the team scoring pipeline contributes role fit and support from commander, reinforcement, signatures, exceptional powers, ToonForce/MuppetForce and other modeled adjustments.
2. A fighter's initial attack and armor ratings derive from individual attributes and role fit; HP is determined from endurance, strength, size, fit and tank role. Unlike earlier engine versions, the tank role no longer applies a severe fixed damage penalty, and tanks have 2.2x target selection weight rather than 3.1x.
3. In each round, fighters act by speed/reflex-based initiative. A surviving fighter gets one attempt; successful hits calculate raw damage, typed protection, mitigation, absorbed HP, overkill and knockouts.
4. Reviewed forms and curated baseline profiles can unleash an ability every 3–4 rounds (including the first), carrying attack type, burst magnitude and guard penetration. Defensive power-domain guards and vulnerabilities modify prevention, not automatically grant a win.
5. The Hellbat form can do enhanced tech/melee offense but consumes its wearer's HP starting in round five. That expenditure is tracked under **ability strain**, not credited to enemy DMG. Strain alone cannot cause a knockout or fabricate an opponent KO.
6. Battle reports record attempts, hits, active rounds, signature uses and damage, named targets, HP remaining, knockouts and ability strain. **Signature DMG is part of DMG, not additional damage.** DMG includes finishing-blow overkill. A separate event timeline is available only with `{trace:true}` and is not stored for routine season results.

## Replay and regression results
Reproduce isolated seeded fixtures via:
```sh
node --test tests/brawl-combat.test.cjs tests/brawl-signatures.test.cjs
```

The browser smoke regression uses the **actual roster and variant transformation**, in the order displayed in the user's report:
- The Chungus: Abomination (tank), Adam Warlock (tank), Hellbat Batman (DPS), Joker (DPS), Lucifer Morningstar (DPS), Captain Carter (reinforcement), Captain America (commander)
- The Crossover: Ares (DC) (tank), The Watcher (tank), Death of the Endless (DPS), Scarlet Witch (DPS), Darkseid (DPS), Wonder Woman (reinforcement), Trigon (commander)

The current implementation tested 25 repeatable whole-lineup seeds in Chromium. Observed mean damage (rounded):
| Fighter | Mean DMG |
|---|---:|
| Hellbat Armor Batman | 245.6 |
| Joker | 132.3 |
| Darkseid | 584.8 |

The Crossover won 25/25 whole-team matches in that fixture. These are gameplay outputs for a *specific seeded sample*, not evidence that any team always wins. The original screenshot is one result and its exact random seed is not available.

100-seed **isolated** matchup checks (hand-specified comparison attributes for regression, not exact source-roster stats) produced:
| Matchup | Mean DMG | Win samples |
|---|---|---:|
| Hellbat vs Joker | 320.9 vs 110.8 | Hellbat 100/100 |
| Adam Warlock vs Joker | 311.5 vs 112.2 | Warlock 100/100 |
| Hellbat vs Darkseid | 341.9 vs 350.8 | Hellbat 35/100 |

Do not overfit these samples to force the outcome of future fights. The full-roster replay is a better integration test; the isolated tests are targeted mechanics regressions.

## Remaining audit work
- Validate sourced feats for baseline character profiles and form-specific costs/counters (#75). Distinguish Darkseid avatar from true form, metaphysical characters from ordinary brawlers, and continuity-specific reality powers.
- Improve cross-tier calibration beyond the current 12 ratings and team fit. Add targeted tests for ToonForce, MuppetForce, alternate forms, power counters and short-handed fights.
- Record player-visible battle narrative/event excerpts where useful without multiplying storage or closing the report accordion on mobile.
- Audit longer statistical distributions and fairness by role, damage type, survival, and player expectations.
- Recheck actual live records and known match IDs when available; cannot reproduce the screenshot's exact seed from the image alone.

## Verification
Pull-request CI executes `node --test tests/*.test.cjs`, Chromium mobile browser smoke and Edge Function type checks. A successful run verifies functional integration, not canonical fidelity or comprehensive game balance.

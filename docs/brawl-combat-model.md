# Battle Royale combat model — verified implementation (PR #73)

Implements the audit tracked by [#72](https://github.com/garrettem-op/Draft_Anything/issues/72). Source evidence for the screenshot lineup and all registered exceptional-profile identities is recorded in [brawl-source-audit.md](brawl-source-audit.md); follow-up evidence requests are tracked by [#75](https://github.com/garrettem-op/Draft_Anything/issues/75).

## Model is not canon
These are **editorial gameplay HP and DMG figures**; none are canonical numerical feats. A KO of Death of the Endless or a similar cosmic being means its bounded **arena manifestation** can no longer influence this fight, not that Death has been permanently killed. The existence of a canonical feat does not imply unconditional use or guaranteed victory.

## Resolution rules
1. **Identity and form:** Each drafted fighter uses base or selected reviewed-variant attributes and team role fit, with team support from commander, reinforcement, signature, exceptional-power register, team chemistry, ToonForce/MuppetForce and variance. Unreviewed forms have changed stats only, not invented abilities.
2. **Role and targeting:** Tanks absorb disproportionate incoming targeting pressure (2.2x odds relative to other fighters in a full roster), but their attack multiplier is 1.02 rather than the original 0.88, leaving them able to fight. DPS multiplier 1.14.
3. **Attacks:** Each surviving fighter can attempt an attack in speed/reflex initiative order. A hit computes raw, blocked, absorbed and overkill damage. Individual DMG sums modeled incoming attacks (including finishing-blow excess); absorbed is actual HP removed.
4. **Profile techniques:** 31 documented baseline/exceptional identities and reviewed variants have typed power moves, cooldowns, finite burst and guard/vulnerability counters. Ordinary attacks remain attribute-driven. An exceptional reality/cosmic spell gets a bounded **minimum burst** independent of the attacker's conventional punching strength.
5. **Power-based targeting:** A high-tier reality, cosmic or magical move uses an ability-targeting chance that is not identical to manual hand-eye accuracy. Fragile tier-5 abstract beings can use it more often than their ordinary physical attacks, without gaining a guaranteed hit or a scripted KO.
6. **Physical protection:** Severe strength/endurance gaps modestly reduce the effectiveness of regular punches, toxins and tech/melee bursts. This is not absolute immunity. ToonForce remains a distinct resilience model and bypasses this physical-gap attack reduction when relevant.
7. **Finite cosmic defense:** Characters with documented tier-4 or tier-5 reality/cosmic/magic/elemental abilities start with a capped extra HP ward (26 HP × tier). It is exhausted like ordinary HP and never ensures invulnerability. It is not claimed as a publisher-specified number.
8. **Rare transformation tiers:** A selected, reviewed tier-5 form or a specifically curated exceptional form (including Hellbat) enters **Apex** combat rank 2: +730 combat HP, 2.7× attribute-derived attack, and a second 82%-strength attack after the normal initiative pass. Other reviewed tier-4 forms are **Empowered** rank 1: +570 HP, 2.3× attack, the same second-action cadence. These are intentionally high-impact gameplay rules because a randomly surged pinnacle form is rare, not publisher-given numerical values. Physical protection against baseline attackers is stronger, while upper-tier attacks are less affected. These benefits are exclusive to a *selected reviewed form*; they do not apply to normal Batman, unreviewed variants, or automatically to baseline high-tier characters.
9. **Hellbat cost:** Reviewed Hellbat Armor Batman uses high-output tech attacks but suffers modeled HP metabolic strain after round four. Strain cannot itself create an opponent KO, is logged separately, and does not count toward enemy DMG.
10. **Reports:** Every fighter's log includes attacks, hits, rounds alive, named targets, signature uses/DMG, remaining HP, ward, metabolic wear and knockout round. A compact native 'Why this DMG?' disclosure includes the specific power limitation and allowlisted source URL. Optional `{trace:true}` captures a full attack timeline for debugging, omitted in normal seasons to avoid storage costs.

## Reproduction
```sh
node --test tests/*.test.cjs
node tests/browser-smoke.cjs
```
The Chromium regression uses the **actual browser roster and shared Variant Surge transformation** from the user's screenshot:
- **The Chungus**: Abomination, Adam Warlock, Hellbat Armor Batman, Joker, Lucifer Morningstar; Captain Carter reinforcement; Captain America commander
- **The Crossover**: Ares (DC), The Watcher, Death of the Endless, Scarlet Witch, Darkseid; Wonder Woman reinforcement; Trigon commander

### 250-seed full-roster replay, current tuned model
| Result | Value |
|---|---:|
| Hellbat mean DMG | 243.9 |
| Joker mean DMG | 152.8 |
| Darkseid mean DMG | 597.4 |
| The Chungus victories | 5/250 |
| Joker DMG above Hellbat DMG | 74/250 |
| Hellbat eliminated before any attack | 10/250 |

The team outcome still strongly favors The Crossover. A single bad Hellbat performance is possible: early focus fire, targeting and initiative matter. The new explanatory report lets players distinguish low contribution caused by death, missed attacks or strong mitigation from unsupported character stats. The original screenshot's random seed is unavailable, so this is a reproducible sample, not the historical match.

### 1,500 seeded isolated bouts (six pairs × 250)
| Pair | First fighter victories | Second fighter victories |
|---|---:|---:|
| Hellbat vs Joker | 250 | 0 |
| Adam Warlock vs Joker | 250 | 0 |
| Darkseid vs Joker | 250 | 0 |
| Hellbat vs Darkseid | 22 | 228 |
| Adam Warlock vs Darkseid | 9 | 241 |
| Baby Franklin Richards vs Joker | 105 | 145 |

The baby Franklin example uses intentionally very low physical stats and exceptional reality manipulation; it is not a baseline adult Franklin forecast. All figures are gameplay outcomes for **specific seeded test attributes**, and must not be presented as canon or universal real-world win probabilities.

## Verification
CI: 211 Node tests passing, Chromium mobile browser smoke passing, Edge Function typechecks passing as of the test run on commit `8dfaa8b45f3524731f0922be4863b8d8f920bd42`. The model is still subject to iterative future character research and design changes: no finite list of cross-universe assumptions can settle every disputed feat or continuity.

## Explicitly deferred beyond this audit's acceptance scope
- Recreating the original screenshot without its seed or saved combat event log.
- Inferring full powers for every character from Campaign eligibility tags. A source-linked flight or color tag is **not** sufficient evidence for a combat ability.
- Modeling unrestricted metaphysical omnipotence and a finite five-person HP game simultaneously. The arena proxy convention is an explicit constraint, not a lore truth.


## Rare variant calibration (follow-up to PR #73)

The goal is that an **Apex** transformation often decides a fight against an ordinary, non-Apex lineup (rough design target: **at least 95% in controlled seeded fixtures**), but does not automatically beat other Apex forms or high-order reality/cosmic opposition. This is an asymmetric *game design* objective, not a claim about cross-publisher canon or a universal 95% matchup win rate. The odds of receiving a particular variant are controlled separately by the draft/Variant Surge system.

- **Apex**: all documented tier-5 variants plus curated exceptional lower-tier forms such as Hellbat, World Breaker Hulk, Dark Phoenix and Super Sonic.
- **Empowered**: other documented tier-4 variants, still superior to an ordinary baseline form but not given an automatic win.
- **Unreviewed**: do not acquire Apex advantages from their names or inflated attributes alone.

The combat engine is shared by match modes; the new tiers affect only live combat when the form is selected, not the probability of drafting it. The second attack is placed after all surviving combatants' first initiative turns. Metabolic wear, signature cooldowns, counters and damage-event accounting remain in force. Reports disclose Apex/Empowered effects. Existing stored results are historical and are not recomputed by changing these rules.

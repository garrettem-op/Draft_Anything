# Reviewed power tiers for research moves (Version 2)

Owner direction 2026-11-27: after the engine parity merge, work through the combat profiles for all characters. This is the ledger for that work. Nothing here is deployed; it lives on `develop/v2-option-c`.

## What a reviewed tier is
A research move's power type, name, guards and weaknesses come from the character's research record. The record deliberately has no power level, so every research move starts at one standard strength (tier 2). A **reviewed tier** replaces that standard where the project lead has read the record and tied a tier to one of its own feats or techniques. It is editorial gameplay calibration, not a published measurement.

- Data: `research/option-c/power-tiers.json` (`tiers`, `noMove`, `reviewedPools`).
- Generator: `node tools/build-research-moves.cjs` writes the tier and its basis into `data/option-c/research-moves-data.js`. It refuses a tier with no feat or technique in the record to cite, a power type the record does not list, or an identity that has no research move.
- Engine: tier sets pierce (12 / 17 / 22 / 27%). Tier 4 with a high-order power type brings the same finite ward and damage floor as a Version 1 tier-4 profile. A research move never grants an Apex or intrinsic rank, and tier 5 stays with individual profiles.

## Rubric
| Tier | Meaning | Examples |
| --- | --- | --- |
| no move | The record's "technique" is a scheme, social influence, or an ordinary weapon or blow that plain attacks already model | Amanda Waller (deploying a task force), Killer Croc (a bite) |
| 1 | A delivery-dependent device or toxin with a real effect | Penguin's umbrella, the Grandmaster's melting stick |
| 2 | A real power or powered weapon of ordinary scale: the standard | Iron Man's repulsors, Black Canary's cry |
| 3 | A major power: decisive against ordinary superhumans, city- or army-scale feats, the top duelists and sorcerers of a grounded setting | Thor, Captain Marvel, the Flash, Green Lantern, Black Adam, Shazam, Raven |
| 4 | Planetary or cosmic scale, reality-affecting within limits, or the paramount power of a high-powered setting | Silver Surfer, Ego, Hela, Zeus, Professor X, Parallax Sinestro |

Peers are tiered together: Kryptonians sit with Superman's Version 1 profile (tier 3), Asgardian and Olympian rulers with Odin (tier 4).

## Engine rule added with this ledger
Tier-4+ **psychic** power (Omega-level telekinesis or telepathy) now counts as high-order for the ward and damage floor, as tier-4 elemental power already did. It applies to Jean Grey's individual profile and to tier-4 psychic research moves.

## Progress
| Pool | Research moves | Status | Tier 4 | Tier 3 | Tier 1 | No move |
| --- | --- | --- | --- | --- | --- | --- |
| mcu | 82 | **reviewed** | 6 | 17 | 1 | 12 |
| dc | 76 | **reviewed** | 3 | 32 | 1 | 8 |
| starwars, harrypotter, lotr, toons, games, pokemon, muppets, actionmovies | 565 | not yet | | | | |

## Measured (1,000 seeded duels, research on, before → after this ledger)
| Matchup | Before | After |
| --- | --- | --- |
| Jean Grey vs Achilles | 34.4% | 69.2% |
| Silver Surfer vs Black Adam (the project vision's example) | 75.2% | 89.6% |
| Hela vs Thor | 37.9% | 74.1% |
| Shazam vs Black Adam | 58.3% | 48.3% |
| Silver Surfer vs Thor | 68.0% | 92.2% |
| Thor vs Captain America | 94.3% | 95.0% |

300 random battles: no errors.

## Left at the standard because the record has no feat that supports more
Sentry, Martian Manhunter, Fernus the Burning, King Shazam, Apex Lex, Ikaris, Sersi, Wong, Human Torch. They need a feats pass before they can be tiered.

## Problems this review exposed (not fixed here)
1. **Template attributes in the DC pool.** Batman is stored at Speed 67, Agility 72, Strength 64; John Wick at 86, 93, 76. Batman loses that duel 96% of the time. The DC, Middle-earth and Harry Potter pools were built from the same archetype templates as Action Movies and need the per-character attribute review Action Movies got (#686).
2. **Purely mental powers in an HP fight.** Professor X at tier 4 still loses to John Wick nearly every time: a frail body, and the engine has no way to end a fight by taking a mind. That needs a qualitative win condition, not a bigger number.
3. **Loose `control` typing.** Many dropped moves were tactics the research filed under `control`. The remaining pools will have more.

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
| Pool | Research moves read | Status | Tier 4 | Tier 3 | Tier 1 | No move | Melee signatures added |
| --- | --- | --- | --- | --- | --- | --- | --- |
| mcu | 82 | **reviewed** | 7 | 20 | 1 | 12 | 11 |
| dc | 76 | **reviewed** | 3 | 36 | 1 | 8 | 9 |
| starwars | 56 | **reviewed** | 1 | 6 | 5 | 23 | 1 |
| harrypotter, lotr, toons, games, pokemon, muppets, actionmovies | 509 | not yet | | | | | |

Counts include reviewed melee signatures. Individual profiles re-tiered in Version 2: Yoda and Emperor Palpatine, tier 3 to tier 4 (paramount Force users of their setting; Version 1 keeps tier 3).

## Melee signatures for physical powerhouses
A record that is physical-only gets no research move by default, which left the Hulk fighting with plain attacks while the Abomination had a Version 1 melee profile (Hulk lost that duel 68% of the time, and lost to Iron Man 97%). A review can now give a powerhouse a **melee** signature named after one of the record's own techniques and tied to a feat, exactly as Version 1 does by hand for Superman, Doomsday and the Abomination. Added: Hulk, Green Scar Hulk, The Thing, Cheetah, Giganta, Devastator Batman, Golden Eagle Wonder Woman (tier 3); Thanos (tier 4: beat the Hulk hand to hand without the Stones); Smart Hulk, She-Hulk, Namor, Wolverine and his forms, Luke Cage, Solomon Grundy, Lobo, Bane, King Shark, Hawkman, the Rancor (tier 2).

## Blasters are ordinary weapons
A blaster is the Star Wars sidearm, as a pistol is elsewhere, so blaster "moves" are dropped and plain attacks plus documented proficiency model them (Stormtrooper, Captain Rex, Cad Bane and others). Lightsabers and the Darksaber stay as tier-2 energy weapons; flamethrower gauntlets and droid tools are tier-1 devices.

## Second engine rule added with this ledger
Between signature uses a power user strikes with a lesser use of the power, not with bare hands: a non-physical signature sets a floor under Strength by its tier (65 / 75 / 85 / 95 / 99). Melee, tech and toxin signatures still strike with the body. It applies to individual profiles as well as research moves.

## Measured (1,000 seeded duels, research on)
| Matchup | Before the ledger | Now |
| --- | --- | --- |
| Jean Grey vs Achilles | 34.4% | 79.5% |
| Yoda vs Achilles | 17.1% | 60.8% |
| Silver Surfer vs Black Adam (the project vision's example) | 75.2% | 89.8% |
| Hela vs Thor | 37.9% | 74.1% |
| Hulk vs Abomination | 31.9% | 49.7% |
| Thor vs Thanos | 76.7% | 49.9% |
| Thanos vs Hulk | 85.3% | 83.6% |
| Mace Windu vs Emperor Palpatine | 87.2% | 49.9% |
| Emperor Palpatine vs Darth Vader | 7.0% | 38.3% |
| Darth Vader vs Luke Skywalker | 79.9% | 75.6% |
| Wolverine vs Captain America | 43.7% | 66.3% |

300 random battles: no errors.

## Left at the standard because the record has no feat that supports more
Sentry, Martian Manhunter, Fernus the Burning, King Shazam, Apex Lex, Ikaris, Sersi, Wong, Human Torch, Rey, Lobo (tier 2 only), and the Star Wars forms without feats (Dark Empire Luke, Vader of Mustafar, Ahsoka the White). They need a feats pass before they can be tiered higher.

## Problems this review exposed (not fixed here)
1. **Template attributes in the DC pool.** Batman is stored at Speed 67, Agility 72, Strength 64; John Wick at 86, 93, 76. Batman loses that duel 96% of the time. The DC, Middle-earth and Harry Potter pools were built from the same archetype templates as Action Movies and need the per-character attribute review Action Movies got (#686).
2. **Purely mental powers in an HP fight.** Professor X at tier 4 still loses to John Wick nearly every time: a frail body, and the engine has no way to end a fight by taking a mind. That needs a qualitative win condition, not a bigger number.
3. **Loose `control` typing.** Many dropped moves were tactics the research filed under `control`. The remaining pools will have more.
4. **Compressed attributes at the top.** The Hulk still loses to Thor 85% and to Iron Man 86%: his stored Accuracy 45 and Touch 42 cut his hit rate and strike, and Strength 99 sits only 3 points above Iron Man's 96. That is an attribute-scale problem, not a tier problem.
5. **Palpatine vs Vader (38%).** Palpatine's frail stored body and the single `energy` type (Vader's lightsaber guard and his lightning weakness cancel) keep the master behind the apprentice.

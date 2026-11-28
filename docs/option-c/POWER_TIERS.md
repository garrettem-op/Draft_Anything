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
| lotr | 55 | **reviewed** | 5 | 22 | 1 | 25 | 16 |
| harrypotter | 94 | **reviewed** | 0 | 6 | 12 | 12 | 4 |
| toons, games, pokemon, muppets, actionmovies | 360 | not yet | | | | | |

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

## Middle-earth (reviewed 2026-11-27)
- **Tier 4:** Ancalagon the Black (drove back the Host of the Valar), Ungoliant (drained the Two Trees), Eärendil (slew Ancalagon), Lúthien (put Morgoth and his court to sleep), Oromë (melee: the huntsman of the Valar).
- **Tier 3:** Smaug, Glaurung, Durin's Bane, Gothmog, Elrond (the Bruinen flood), Galadriel (threw down Dol Guldur), Finrod (the contest of songs with Sauron), the Witch-king (broke the gate of Minas Tirith), Tilion, Ossë.
- **Melee signatures** for the duelists and beasts whose records name a feat against a dragon, a Balrog or a Dark Lord: Fingolfin, Fëanor, Glorfindel, Ecthelion, Gil-galad, Elendil, Húrin, Túrin, Thorondor, Huan, Carcharoth, Treebeard (tier 3); Tuor, Quickbeam, Beorn's bear form (tier 2). Ordinary-bodied weapon masters (Aragorn, Boromir, Legolas, Gimli, Éowyn) get none, as in the other pools: plain attacks, attributes and proficiency model them.
- **Dropped (25):** ordinary swordplay and archery filed as "magic" (Celeborn, Círdan, Maglor, Thingol, Isildur, Beleg, Frodo), leadership and decrees (Finarfin, Amandil, Tar-Palantir, Tar-Míriel), craft and foresight (Celebrimbor, Idril), defences and escapes (Melian, Elwing), schemes (Gríma, Annatar), and the Valar whose gift is not an attack (Estë, Irmo, Námo, Nienna, Vairë, Vána, Yavanna).
- **Fire is one type.** Dragon-fire and Balrog-fire are typed `elemental`, as Smaug's already was. Ancalagon's record listed only `energy` although both of its techniques are dragon-fire; `fire` was added to the record's power types.
- **Record corrected:** Fëanor's technique named Ringil, which is Fingolfin's sword; it now reads "Swordsmanship with his own blade".
- Attributes were reviewed in the same change: `docs/middle-earth-attribute-review.md` (22 characters).

Measured (1,000 seeded duels, before to after): Tar-Míriel vs Aragorn 72.4% to 0.0%; Arwen vs Aragorn 91.7% to 52.5%; Idril vs Tuor 92.2% to 12.1%; Aragorn vs John Wick 40.2% to 53.1%; Aragorn vs Captain America 20.3% to 35.8%; Legolas vs Aragorn 81.1% to 67.6%; Gandalf vs Durin's Bane 64.9% to 55.6%; Ancalagon vs Smaug 47.0% to 81.4%; Ecthelion vs Gothmog 28.9% to 54.0%; Azog vs Thorin 5.1% to 60.4%; Ungoliant vs Sauron 15.5% to 36.7%; Huan vs Carcharoth 49.3% to 61.5%.

Not solved in Middle-earth: Gimli vs Legolas 4.9% (see problem 6); Lúthien vs Sauron 7.7% and Witch-king vs Éowyn 98.9% (see problem 2: the engine has no enchantment or prophecy win condition); Eärendil vs Ancalagon 33% (he won with the Eagles' help).

## Harry Potter (reviewed 2026-11-27)
Wand magic is this setting's ordinary power, so a trained adult witch or wizard is the standard (tier 2). Dumbledore and Voldemort are the Version 1 tier-3 profiles and stay the top of the pool.
- **Tier 3:** Grindelwald and his Elder Wand form (Protego Diabolica across a Paris amphitheatre; Dumbledore's peer), the Obscurus and Credence Barebone (levelled New York streets), the Thunderbird (a storm over New York), the Basilisk (a gaze that kills on eye contact).
- **Tier 1:** spellwork the record itself calls student-level or without any combat: Cho Chang, Lavender Brown, Padma and Parvati Patil, Pansy Parkinson, Winky, Madam Hooch, Narcissa Malfoy, Rita Skeeter, Sybill Trelawney, Gilderoy Lockhart (the Memory Charm, his one real spell), and the hatchling Norbert.
- **Stay at the standard:** McGonagall, Snape, Bellatrix and the other senior duellists. Voldemort held off McGonagall, Kingsley and Slughorn together, so none of them is tiered with him.
- **Melee signatures (tier 2):** Hagrid, Aragog, the Zouwu, Lupin's werewolf form.
- **Dropped (12):** the four ghosts and Peeves (a ghost cannot touch the living; thrown objects are plain attacks), healing and wandlore (Pomfrey, Ollivander), founders with no combat magic on record (Hufflepuff, Ravenclaw), and authority or spying (Fudge, Picquery, Rita Skeeter's beetle form).
- **Moves renamed to an attack in the record:** Snape (Sectumsempra), Hermione (Stupefy), Lupin, Aberforth, Fleur, McGonagall (statue animation), Grindelwald (Protego Diabolica).
- **Record corrected:** the Basilisk's power types were `physical, venom, gaze`; `gaze` is not a type the engine knows, so its killing stare produced no move. `magic` was added.
- Attributes were reviewed in the same change: `docs/harry-potter-attribute-review.md` (25 characters).

Measured (1,000 seeded duels, before to after): Hedwig vs Harry Potter 72.2% to 0.2%; Crookshanks vs Ron 70.1% to 0.9%; Bowtruckle vs Harry 48.9% to 0.1%; Nearly Headless Nick vs Harry 77.8% to 1.6%; Ollivander vs Bellatrix 52.1% to 1.0%; Lockhart vs Harry 32.6% to 0.9%; Fudge vs Harry 43.0% to 8.1%; Krum vs Harry 85.5% to 44.8%; Harry vs Draco 58.4% to 75.1%; Madame Maxime vs Hagrid 7.8% to 47.0%; Dumbledore vs Grindelwald 65.7% to 58.5%; Obscurus-hosting Credence vs Dumbledore 0.3% (Dumbledore beat him outright in Berlin).

Not solved in Harry Potter: Dementor vs Harry 94% (see problem 7); Flitwick vs Lucius Malfoy 47% and Dobby vs Lucius 22% (problem 6); Molly Weasley vs Bellatrix 25% (she won their one duel); the generic Obscurus beats Dumbledore 71% on its template body.

## Left at the standard because the record has no feat that supports more
Sentry, Martian Manhunter, Fernus the Burning, King Shazam, Apex Lex, Ikaris, Sersi, Wong, Human Torch, Rey, Lobo (tier 2 only), and the Star Wars forms without feats (Dark Empire Luke, Vader of Mustafar, Ahsoka the White). They need a feats pass before they can be tiered higher.

## Problems this review exposed (not fixed here)
1. **Template attributes.** *DC fixed 2026-11-27*: 79 DC characters corrected one by one, each with a reason and a source, in `docs/dc-attribute-review.md` (Batman from Speed 67 / Agility 72 / Strength 64 to 80 / 92 / 84). Measured over 1,000 seeded duels, before to after: Batman vs John Wick 3.7% to 60.7%; Bane vs Batman 100% to 81.5%; Batman vs Captain America 0.7% to 40.5%; Batman vs Deathstroke 2.3% to 39.9%; Batman vs Joker 48.7% to 97.6%; Killer Croc vs Batman 99.9% to 55.5%; Captain Cold vs Flash 48.4% to 5.6%; Hal Jordan vs Sinestro 30.7% to 47.3%. *Middle-earth fixed 2026-11-27* (22 characters, `docs/middle-earth-attribute-review.md`). *Harry Potter fixed 2026-11-27* (25 characters, `docs/harry-potter-attribute-review.md`). All four template-built pools (Action Movies, DC, Middle-earth, Harry Potter) have now had the review. Two DC results to revisit: Cassandra Cain vs Deathstroke fell from 36.6% to 6.8% (her small body now counts against her and the engine has no credit for pure skill against a stronger expert), and Green Arrow beats Hawkeye 88% (the assassin template is more generous than the hand-authored Marvel humans).
2. **Purely mental powers in an HP fight.** Professor X at tier 4 still loses to John Wick nearly every time: a frail body, and the engine has no way to end a fight by taking a mind. That needs a qualitative win condition, not a bigger number.
3. **Loose `control` typing.** Many dropped moves were tactics the research filed under `control`. The remaining pools will have more.
4. **Compressed attributes at the top.** The Hulk still loses to Thor 85% and to Iron Man 86%: his stored Accuracy 45 and Touch 42 cut his hit rate and strike, and Strength 99 sits only 3 points above Iron Man's 96. That is an attribute-scale problem, not a tier problem.
5. **Palpatine vs Vader (38%).** Palpatine's frail stored body and the single `energy` type (Vader's lightsaber guard and his lightning weakness cancel) keep the master behind the apprentice.
6. **No credit for armour or pure skill in a small body.** Gimli killed one more Orc than Legolas at Helm's Deep and loses to him 95% of the time; Cassandra Cain loses to Deathstroke 93%. Their attributes are right; the engine reads Speed, Agility and Size and has nothing for mail, or for skill that outweighs reach. That needs an engine rule (armour from the research record, or a larger share for proficiency), not inflated attributes.
7. **No named counters.** Harry Potter's record feat is driving off a hundred Dementors with a Patronus, and a Dementor still beats him 94%; Sam drove off Shelob with the Phial of Galadriel and loses every time. Guards and weaknesses work by power type, so a specific counter to a specific creature has nowhere to go.
8. **Speed reads as fighting ability.** Lowering Speed for a limp or a heavy build moves duel results by tens of points (Moody 40% to 24% against Lucius Malfoy for his wooden leg alone), so Moody, Gandalf and Saruman keep template Speed and Agility that their bodies do not really have. A fight-specific mobility rule would let the stored attribute be honest.

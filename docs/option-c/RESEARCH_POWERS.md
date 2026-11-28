# Research powers in Battle Royale (Version 2)

**Owner decision, 2026-11-20:** option A, "research powers join the fight", **on by default in Version 2**. Version 1 (`main`, `releases/v1.0.0`) is untouched.

## What changes
Before this, only 26 base characters and 88 reviewed forms used a real power in a Battle Royale fight (their V1 combat profile). Everyone else fought with plain attacks built from the 12 attributes. Now a character with **no V1 profile** gets one signature move from its V2 research record:

| Part of the move | Where it comes from |
|---|---|
| Power type (energy, magic, elemental, psychic, control, sonic, time, shadow) | The record's own `offense.domains`, mapped by the closed table in `data/option-c/research-profile.js` |
| Guards and weaknesses | The record's defense and weakness wording, matched only where it names the type explicitly |
| Move name | The record's own technique that matches the power type. When a technique matches another of the record's types instead, that type is used so name and type agree. If nothing matches: the first technique. With no techniques: a plain label ("Magic power"). Names longer than 42 characters are cut and end in "…". A gun skill never names a move: "fire" does not match inside "firearm" (fixed 2026-11-23; Black Widow, Yelena Belova, Penguin and Dante were renamed). |
| Strength | **One fixed standard for every research move**: tier 2, pierces 17% of defense, used every third round. |

**Why a fixed strength.** The research records no power level on purpose. Tier 2 is the ordinary signature level. It never triggers the tier-4 and higher ward, damage floor or Apex/Empowered rules, so research alone never promotes a character into the cosmic class.

**What does not get a move:**
- Characters with a V1 profile or a reviewed form profile: the V1 kit always wins.
- NBA players.
- Records marked needs-review.
- Records whose powers are only physical, tech or toxin (545 records, for example MCU Hulk). Plain attacks already model those from the attributes.

The fight engine change is one line in `data/brawl-combat.js`: ask the V1 profiles first, then the research moves. A page without the two research-move files fights exactly as Version 1.

## Who gets a move
751 research moves (634 base characters and 117 forms), last regenerated on 2026-11-27, when 1,376 of 1,413 non-NBA identities had their sequels-and-comics expansion. Earlier counts: 750 from the evening of 2026-11-22 to the morning of 2026-11-23, 747 on the morning of 2026-11-22, 651 on 2026-11-21, 617 on 2026-11-20.

| Pool | Moves | | Power type | Moves |
|---|---|---|---|---|
| Pokémon | 131 | | Energy | 315 |
| Video Games | 125 | | Magic | 210 |
| Harry Potter | 96 | | Control | 96 |
| MCU | 87 | | Elemental | 90 |
| DC | 79 | | Psychic | 32 |
| Star Wars | 61 | | Sonic | 4 |
| Toons | 59 | | Shadow | 3 |
| Middle-earth | 58 | | Time | 1 |
| Muppets | 43 | | | |
| Action Movies | 12 | | | |

Most Action Movies characters fight physically (swords, guns, martial arts), so only 12 of its researched characters get a research move.

**Re-measured 2026-11-22, evening** (750 moves; table below): the winner changes in 5–16% of fights depending on the pool (mixed 9%). Research moves reach 12% (Action Movies) to 88% (Harry Potter) of fighters. The evaluator's calibration was rechecked on two seeds and holds, so it was not refitted:

| | Seed 1 | Seed 2 |
|---|---|---|
| Points per logit, below the cap | 3.72 | 3.63 |
| Points per logit, above the cap | 10.33 | 10.95 |
| Interaction weight | 0.91 | 1.05 |
| Results inside the reported range | 88% | 90% |

## The switch
- **On by default** on the V2 branch.
- `?researchPowers=0` turns it off on that device (remembered), so V2 fights can be compared with Version 1. `?researchPowers=1` turns it back on.
- **Head-to-Head:** a new room records the host's setting (`rules.researchPowers`), and both players replay the final fight with it, so their results can't disagree. Rooms created before this change count as on.
- In code: `DA_RESEARCH_MOVES.enabled()`, `setEnabled(on)`, `withEnabled(on, fn)`.

## What it does to fights (measured)
`node tools/research-powers-impact.cjs`: 200 seeded fights per pool between random crews, the same crews and seeds with the switch off and on. Measured 2026-11-22 (evening) with 750 moves:

| Pool | Fighters with a research move | With a V1 profile | Winner changed | Damage from research moves |
|---|---|---|---|---|
| MCU | 49% | 4% | 13% | 26% |
| DC | 58% | 13% | 14% | 30% |
| Toons | 43% | 0% | 10% | 24% |
| Muppets | 42% | 0% | 11% | 22% |
| Video Games | 71% | 0% | 12% | 39% |
| Pokémon | 70% | 0% | 5% | 38% |
| Star Wars | 57% | 0% | 11% | 30% |
| Middle-earth | 49% | 6% | 12% | 28% |
| Harry Potter | 88% | 0% | 16% | 44% |
| Action Movies | 12% | 0% | 7% | 7% |
| NBA | 0% | 0% | 0% | 0% |
| Mixed (all but NBA) | 52% | 2% | 9% | 28% |

**Example from the matchup explainer.** Crossover (Hulk, Superman, Gandalf, Bugs Bunny, Darth Vader) against Heavy Hitters (Doomsday, Thanos, Scarlet Witch, Pikachu, Darkseid), 400 seeded fights:
- Crossover wins **34%** with the switch off. With it on, it won **48%** on 2026-11-20 and **50%** after the 2026-11-21 research refresh.
- Gandalf casts magic about 2.6 times a fight. His move's name follows his record: "Fire magic" at first, then "Spells of closing" once the sequels-and-comics expansion added more of his writings. Bugs Bunny uses Disguise and deception, Darth Vader Lightsaber combat, and Pikachu Thunderbolt.
- Pikachu's damage rises from 136 to 177 per fight. His attributes still make him the weakest fighter there: a move adds a power type, not raw strength.

## Unchanged
- **Sports:** all six sports are byte-identical to Version 1. A test re-proves this on every run against the frozen V1 results.
- Team scores, chemistry, coach, bench, signatures, ToonForce, MuppetForce, forms and luck.
- **Frozen V1 results:** with the switch off, all 17 match Version 1 exactly. With it on, only `championship:brawl` and `season:brawl` change. The other fight fixtures use crews whose fighters all have V1 profiles.

## Keeping it current
The moves are generated from the research: `node tools/build-research-moves.cjs`. Run it after research merges. `--check` reports how many rows differ from the current research; add `--strict` to make that an error.

The research tick merges records without regenerating, so the file can lag a little behind the research. The test reports drift but does not fail on it. Expect regular regenerations while the sequels-and-comics expansion runs, because those expanded records will add power types (for example, comic Thanos).

## Known limits
- **Every research move hits equally hard.** A strength rule (for example from attributes, or a reviewed tier) is a later decision.
- **Evaluator (resolved 2026-11-21).** The evaluator now reads the same research moves and its Battle Royale odds are fitted to these fights. See `docs/option-c/CALIBRATION.md`.
- **Some move names are descriptive.** For example "Herbology as a weapon" and "Banjo strike". They are the record's own words.
- **Not separately reviewed.** The moves inherit each record's sourcing. No one has checked a move against its sources separately.

## Combat extras from the same record (2026-11-27)

Owner direction 2026-11-27: Version 1 stays as it is, and Version 2 must cover weapon mastery from researched techniques and durability from documented powers. The research record now supplies four more things to the live fight, for **every** researched identity (V1-profiled and physical-only characters included, NBA exempt), under the same switch as research moves.

| Extra | Read from | Rule (explicit wording only) | Fixed strength |
| --- | --- | --- | --- |
| Guards | `defense.mechanisms` | The closed guard patterns (energy shield or deflection, magic ward, psychic barrier) | 13% of a matching signature hit, as V1 guards |
| Weaknesses | `weaknesses` | "weak / vulnerable / susceptible to [one intensity word] magic, psychic, energy or electricity". An energy *drain* is not a weakness to energy attacks | 12%, as V1 weaknesses |
| Power barrier | `defense.mechanisms` | Force field, energy shield, magical ward or aura, telekinetic shield. A mental shield or a carried shield does not count | The weakest V1 shield: pool 30, catches 60% of what gets through, stops any attack |
| Fighting proficiency | `offense.techniques` | A technique that names a weapon or fighting skill. Level only from a level word in that same technique: master, expert (or a named form), otherwise trained | A floor under Strength for the strike only: trained 70, expert 80, master 88 |

Precedence: an individual Version 1 shield entry wins over a research barrier; guards and weaknesses are the union of the V1 profile's and the record's. Proficiency never changes a team rating, fit, credibility, HP or armor: it only stops a documented weapon from hitting like bare hands. A form uses its own record, never its base's.

Counts when generated: 720 identities carry extras (236 barriers; 538 with proficiency: 487 trained, 22 expert, 29 master; 56 with a weakness; 208 with a guard).

**Measured (1,000 seeded duels each, research on):** Yoda vs Achilles 10.0% → 17.1%; Yoda vs Palpatine 81.5% → 71.8%; Vader vs Luke 86.8% → 79.9%; Dumbledore vs Voldemort 49.8% → 52.7%; Obi-Wan vs Darth Maul 28.3% → 43.6%; Leia vs Bryan Mills 1.9% → 8.5%. 300 random battles: no errors.

**Known limits.** The research `energy` type covers blasters, lightsabers and electricity alike, so Vader's guard (lightsaber deflection) and his weakness (electrical discharge) land on the same type and nearly cancel; a separate electric type would fix that. Armor wording (356 records) is not used: stored Endurance and Size may already include it. Levels follow the record's wording, so a great fighter whose techniques carry no level word reads as trained (Achilles).

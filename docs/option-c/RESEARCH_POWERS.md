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
751 research moves (634 base characters and 117 forms), last regenerated on 2026-11-23 (afternoon), when 1,373 of 1,413 non-NBA identities had their sequels-and-comics expansion. Earlier counts: 750 from the evening of 2026-11-22 to the morning of 2026-11-23, 747 on the morning of 2026-11-22, 651 on 2026-11-21, 617 on 2026-11-20.

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

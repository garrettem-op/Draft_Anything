# Research powers in Battle Royale (Version 2)

**Owner decision, 2026-11-20:** option A, "research powers join the fight", **on by default in Version 2**. Version 1 (`main`, `releases/v1.0.0`) is untouched.

## What changes
Before this, only 26 base characters and 88 reviewed forms used a real power in a Battle Royale fight (their V1 combat profile). Everyone else fought with plain attacks built from the 12 attributes. Now a character with **no V1 profile** gets one signature move from its V2 research record:

| Part of the move | Where it comes from |
|---|---|
| Power type (energy, magic, elemental, psychic, control, sonic, time, shadow) | The record's own `offense.domains`, mapped by the closed table in `data/option-c/research-profile.js` |
| Guards and weaknesses | The record's defense and weakness wording, matched only where it names the type explicitly |
| Move name | The record's own technique that matches the power type. When a technique matches another of the record's types instead, that type is used so name and type agree. If nothing matches: the first technique. With no techniques: a plain label ("Magic power"). Names longer than 42 characters are cut and end in "…". |
| Strength | **One fixed standard for every research move**: tier 2, pierces 17% of defense, used every third round. |

**Why a fixed strength.** The research records no power level on purpose. Tier 2 is the ordinary signature level. It never triggers the tier-4 and higher ward, damage floor or Apex/Empowered rules, so research alone never promotes a character into the cosmic class.

**What does not get a move:**
- Characters with a V1 profile or a reviewed form profile: the V1 kit always wins.
- NBA players.
- Records marked needs-review.
- Records whose powers are only physical, tech or toxin (582 records, for example MCU Hulk and the film-only MCU Thanos). Plain attacks already model those from the attributes.

The fight engine change is one line in `data/brawl-combat.js`: ask the V1 profiles first, then the research moves. A page without the two research-move files fights exactly as Version 1.

## Who gets a move
617 research moves (515 base characters and 102 forms) from the research merged as of 2026-11-20:

| Pool | Moves | | Power type | Moves |
|---|---|---|---|---|
| Pokémon | 117 | | Energy | 239 |
| Video Games | 104 | | Magic | 211 |
| Harry Potter | 94 | | Elemental | 77 |
| DC | 74 | | Control | 49 |
| MCU | 72 | | Psychic | 32 |
| Middle-earth | 49 | | Sonic | 5 |
| Star Wars | 45 | | Time | 2 |
| Toons | 39 | | Shadow | 2 |
| Muppets | 23 | | | |

Action Movies has no research yet; its characters get moves once their records merge and the file is regenerated.

## The switch
- **On by default** on the V2 branch.
- `?researchPowers=0` turns it off on that device (remembered), so V2 fights can be compared with Version 1. `?researchPowers=1` turns it back on.
- **Head-to-Head:** a new room records the host's setting (`rules.researchPowers`), and both players replay the final fight with it, so their results can't disagree. Rooms created before this change count as on.
- In code: `DA_RESEARCH_MOVES.enabled()`, `setEnabled(on)`, `withEnabled(on, fn)`.

## What it does to fights (measured)
`node tools/research-powers-impact.cjs`: 200 seeded fights per pool between random crews, the same crews and seeds with the switch off and on.

| Pool | Fighters with a research move | With a V1 profile | Winner changed | Damage from research moves |
|---|---|---|---|---|
| MCU | 41% | 4% | 10% | 23% |
| DC | 56% | 13% | 17% | 29% |
| Toons | 29% | 0% | 10% | 18% |
| Muppets | 23% | 0% | 9% | 13% |
| Video Games | 57% | 0% | 12% | 32% |
| Pokémon | 61% | 0% | 6% | 35% |
| Star Wars | 40% | 0% | 12% | 24% |
| Middle-earth | 41% | 6% | 14% | 24% |
| Harry Potter | 87% | 0% | 17% | 44% |
| Action Movies | 0% | 0% | 0% | 0% |
| NBA | 0% | 0% | 0% | 0% |
| Mixed (all but NBA) | 41% | 2% | 9% | 23% |

**Example from the matchup explainer.** Crossover (Hulk, Superman, Gandalf, Bugs Bunny, Darth Vader) against Heavy Hitters (Doomsday, Thanos, Scarlet Witch, Pikachu, Darkseid), 400 seeded fights:
- Crossover wins **34%** with the switch off and **48%** with it on.
- Gandalf casts Fire magic about 2.6 times a fight. Bugs Bunny uses Disguise and deception, Darth Vader Lightsaber combat, and Pikachu Thunderbolt.
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
- **The evaluator lags behind.** It doesn't yet count research moves in its estimate: it still says "no typed combat profile" for those characters. Bringing it in line is part of calibration.
- **Some move names are descriptive.** For example "Herbology as a weapon" and "Banjo strike". They are the record's own words.
- **Not separately reviewed.** The moves inherit each record's sourcing. No one has checked a move against its sources separately.

# Version 2 fight rules (2026-11-27)

The character review (`POWER_TIERS.md`) left four results that data could not fix. These rules fix them in the fight engine (`data/brawl-combat.js`). All of them follow the research switch: with `?researchPowers=0` none acts and the engine is Version 1's, which the golden fixtures prove byte for byte. Version 1 itself is not changed.

Every rule reads reviewed data that is tied to a character's own research record. Nothing is assigned to a character by hand without a citation, and no rule names a character in code.

## 1. Powers that overcome instead of wounding
A telepath does not win by trading punches. A reviewed move can be marked **overcome** in `research/option-c/power-tiers.json` when it is tier 3 or higher, its power type is psychic, control or magic, and the record shows it takes the opponent out of the fight: mind control, enchanted sleep, petrification, a killing gaze.

Each time the move lands there is a chance the opponent's fight ends:
- 30% at tier 3, 50% at tier 4, moved by 0.6 points for each point of difference between the two wills (the average of IQ and Clutch), within 5% and 85%.
- Cut to about a third by a guard against that power type, halved by a high-order ward, halved by an equal or higher power of the same type, cut to 15% by an Apex or intrinsic rank.
- Raised by 30% where the target's record lists that power type as a weakness.
- Zero for mind powers against a machine (the reviewed `robot-or-ai` tag).

Marked so far: Professor X, Cassandra Nova, Druig, Gorilla Grodd (take control of the mind), Lúthien (enchanted sleep), the Basilisk (kills on eye contact), the White Witch (turns to stone).

## 2. Named counters
`research/option-c/counters.json` lists a specific thing that drives off specific creatures. The generator refuses a counter unless each target's own record names it among its weaknesses, and it finds the holders itself: every identity in the listed pools whose own record names the counter. On the holder's first attack of every third round, a hit on that creature has the listed chance to drive it off.
- **Patronus Charm** against the Dementor (65%): 16 holders found in the Harry Potter records, from Harry to Umbridge. Draco Malfoy's record has none, so he has no counter.
- **Phial of Galadriel** against Shelob (40%): Frodo and Sam.

## 3. Reviewed melee signatures: strength above the scale, and a brawler's aim
A reviewed melee signature (an individual profile, or a research move with a reviewed tier) is tied to a feat.
- **It carries the blow** between signature uses, with the same floor under Strength that a power has (65 / 75 / 85 / 95 by tier). Sonic's Spin Dash is not a Strength-50 punch.
- **Strength above 99.** For a beyond-human body it adds 8 points of striking Strength per tier above the standard, and the matching health. The Hulk and Thor no longer share one number.
- **A brawler's aim.** Landing a blow is fighting skill, not ball skill. The signature sets a floor under Accuracy in a fight (84 / 90 / 96 by tier), in the hit roll, in striking power and in the role fit. The Hulk's Accuracy 45 describes his jump shot.
- **It strikes above its owner's stored body** when judged against a tougher opponent's body.

## 4. Skill and armour
- **Documented proficiency** (trained, expert, master, from the record's techniques) now also sets a floor under Accuracy in a fight (84 / 88 / 92), makes the fighter harder to hit with bodily blows (5 / 6 / 7 points), and lets skill work around part of a tougher human-range body (15 / 20 / 30% of the gap). The steps between levels are deliberately small, because the level word comes from the record's wording and has not been reviewed fighter by fighter.
- **Reviewed proficiency.** A review may set the level, citing one of the record's own techniques: Gimli ("killed 42 Orcs at Helm's Deep, one more than Legolas"), Aragorn, Cassandra Cain and Deathstroke are masters.
- **Worn armour** named in the record's defence wording (mail, plate, kevlar, body armour, a carried shield; not hides or power barriers) turns a share of bodily blows: 4% light, 7% standard, 10% heavy. 149 identities have it.
- **Limits.** Parrying and armour count half against a beyond-human body one tier above the defender's and not at all two tiers above, and skill does not work around an extreme body. A power user's strikes are not bodily blows.

## Measured (1,000 seeded duels, before to after)
| Duel | Before | After |
| --- | --- | --- |
| Professor X vs John Wick | 3.1% | 73.0% |
| Professor X vs Hulk | 0.3% | 84.1% |
| Professor X vs Ultron | 0.1% | 0.1% |
| Lúthien vs Sauron | 7.7% | 14.6% |
| Harry Potter vs Dementor | 6.4% | 76.1% |
| Sam vs Shelob | 0.0% | 46.7% |
| Hulk vs Thor | 14.7% | 38.9% |
| Hulk vs Iron Man | 14.4% | 35.8% |
| Captain America vs Hulk | 22.3% | 11.9% |
| Sonic vs Shadow | 15.6% | 30.7% |
| Gimli vs Legolas | 4.9% | 13.5% |
| Cassandra Cain vs Deathstroke | 6.8% | 14.5% |

Earlier fixtures after the change: Batman vs John Wick 72.6% (60.7%; his armoured suit now counts), Bane vs Batman 80.1% (81.5%), Jean Grey vs Achilles 79.5% (unchanged), Thor vs Thanos 39.7% (49.9%; Thanos's strength above the scale), Legolas vs Aragorn 70.2% (67.6%).

## What is still not right
- **Gimli vs Legolas (13.5%) and Cassandra Cain vs Deathstroke (14.5%)** are better, not fixed. What remains is the stored attributes: Legolas is faster, more agile and more accurate on every score, and a 40% edge in damage per round becomes a 95% win rate because fights are long and luck averages out.
- **Proficiency levels are unreviewed** for all but four fighters. A full pass (as was done for power tiers) would let the steps between levels be larger.
- **Prophecy** (the Witch-king and Éowyn) is not modelled.
- **Only two named counters** exist. Kryptonite, sunlight and the like work through the ordinary weakness rule, which is mild.
- **Cloud vs Sephiroth (28%)** is the stored attributes: Sephiroth is rated higher on almost every score.

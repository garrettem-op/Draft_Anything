# Archetype chemistry groups (MCU)

Built after the owner confirmed on 2026-11-15 that these should change live scores. Idea and option 2 come from `MUA3_TEAM_BONUS_RESEARCH.md`.

## What changed
Five new Marvel chemistry groups, defined in `data/archetype-groups.js` and added to the game's existing chemistry table at load time. They use the same rule as every other group: points = strength x tier for the number of members on the roster (2 members 0.45, 3 1.0, 4 1.55, 5 2.0, 6 2.3), summed with all other groups and capped at 2.8. No new effect type, no new cap.

| Group | Members (all show the trait on screen in the MCU) | Idea from MUA3 affiliation |
|---|---|---|
| Martial Artists | Daredevil, Iron Fist, Gamora, Shang-Chi, Black Widow, Yelena Belova, Elektra, Stick | Martial Artists |
| Agile Fighters | Spider-Man, Black Panther, Black Widow, Daredevil, Iron Fist, Hawkeye | Agile Fighters |
| Blades & Claws | Wolverine, Deadpool, Drax, Gamora, Black Panther, Killmonger, Elektra, Valkyrie | Cutting Edge |
| Anti-Heroes | Deadpool, Wolverine, The Punisher, Moon Knight, Winter Soldier | Anti-Heroes |
| Wisecracking Warriors | Deadpool, Rocket, Star-Lord, Spider-Man, Iron Man | Wise Cracking Warriors |

Strength is 0.5 for all five, the same as the game's other trait groups (Sharpshooters, Airborne, Heavyweights). Each member has a one-line on-screen basis in the data file and a flag for whether the MUA3 fan guide also lists them. MUA3 lists are comics lore, so membership follows the MCU portrayal instead; no comics feat is copied to an MCU entry.

**Membership is an editorial judgment** like the game's other groups and has not been through the whole-roster audit. Tell me to move, add or drop anyone.

## What it does to scores (measured, not assumed)
400 random MCU rosters per sport, same rosters with and without the groups, seeded:

| Sport | Rosters whose team chemistry changed | Avg chemistry change | Largest change | Avg rating change | Largest rating change |
|---|---|---|---|---|---|
| Basketball | 49 / 400 | +0.035 | +0.73 | +0.051 | +1.60 |
| Football | 0 / 400 | 0 | 0 | +0.060 | +1.98 |
| Soccer | 54 / 400 | +0.036 | +0.94 | +0.071 | +1.27 |
| Baseball | 73 / 400 | +0.051 | +1.10 | +0.086 | +2.16 |
| Hockey | 67 / 400 | +0.053 | +1.00 | +0.094 | +2.48 |
| Volleyball | 76 / 400 | +0.062 | +1.00 | +0.090 | +2.19 |
| Battle Royale | 55 / 400 | +0.042 | +1.22 | +0.075 | +2.67 |

Things to know:
- **Football barely feels it.** 391 of 400 random football rosters already sit at the 2.8 chemistry cap, so extra groups cannot add team chemistry there.
- **Bench Chemistry no longer reacts to groups.** An earlier version of this note said the bench player lifted teammates sharing a group, roughly doubling the rating change. That group lift is removed by the bench rework (PR #404, owner ruling 2026-11-15), so archetype groups affect team chemistry only. The rating change from this PR is the team-chemistry change alone. Numbers measured before that change overstate the effect.
- Averages are small because most random rosters have no two members of the same archetype. A roster built on purpose (for example Daredevil + Iron Fist + Black Widow + Elektra) gets noticeably more.
- Ratings in this table are the pre-game team rating, not match outcomes.

## Not done
- No sources beyond the on-screen basis lines; whole-roster audit not run on these members.
- Other MUA3 ideas (Femme Fatales, Women of Marvel, New Avengers, Forces of Nature, Heavy Hitters) and the Mjolnir/Phoenix "wielder" groups were not built.
- The Option C shadow evaluator is untouched. It treats legacy effects as already counted in the live rating (its `doubleCountGuard`), so these groups are not added a second time; its parity tests and the browser parity check pass.

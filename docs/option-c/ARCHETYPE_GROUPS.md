# Archetype chemistry groups (MCU)

Built after the owner confirmed on 2026-11-15 that these should change live scores. Idea and option 2 come from `MUA3_TEAM_BONUS_RESEARCH.md`. On 2026-11-18 the owner chose to build them with **sourced membership** and a bonus **on the same footing as the film chemistry groups** (not the weaker cross-film tier), so this revision adds a checked source for every member and raises strength from 0.5 to 1.

## What changed
Five Marvel chemistry groups, defined in `data/archetype-groups.js` and added to the game's existing chemistry table at load time. They use the same rule as every other group: points = strength x tier for the number of members on the roster (2 members 0.45, 3 1.0, 4 1.55, 5 2.0, 6 2.3), summed with all other groups and capped at 2.8. No new effect type, no new cap.

| Group | Members (all show the trait on screen in the MCU) | Idea from MUA3 affiliation |
|---|---|---|
| Martial Artists | Daredevil, Iron Fist, Gamora, Shang-Chi, Black Widow, Yelena Belova, Elektra, Stick | Martial Artists |
| Agile Fighters | Spider-Man, Black Panther, Black Widow, Daredevil, Iron Fist, Hawkeye | Agile Fighters |
| Blades & Claws | Wolverine, Deadpool, Drax, Gamora, Black Panther, Killmonger, Elektra, Valkyrie | Cutting Edge |
| Anti-Heroes | Deadpool, Wolverine, The Punisher, Moon Knight, Winter Soldier | Anti-Heroes |
| Wisecracking Warriors | Deadpool, Rocket, Star-Lord, Spider-Man, Iron Man | Wise Cracking Warriors |

Strength is **1** for all five, the same as the film groups (Guardians, Wakandans and so on). The earlier 0.5 matched Sharpshooters, Airborne and Heavyweights; the owner picked the stronger footing. MUA3 lists are comics lore, so membership follows the MCU portrayal instead; no comics feat is copied to an MCU entry.

## Sources (checked 2026-11-18)
Every member carries one or more pages in `data/archetype-groups.js`, each fetched and read against the specific trait. Labels follow the owner's evidence standard (2026-11-10).

| Label | Count of member entries | Meaning |
|---|---|---|
| corroborated | 3 | A second source on a different site agrees: Yelena Belova (TV Tropes + Wikipedia), Stick (Wikipedia + TV Tropes), Drax (TV Tropes + MCU Wiki). |
| credible | 28 | One page documents the specific trait. |
| needs-review | 1 | Valkyrie in Blades & Claws: one community wiki says she wields a sword called Dragonfang in the MCU but names no film or scene, and Wikipedia and TV Tropes do not mention it. Still a member; a second source would settle it. |

Sources are mostly TV Tropes character pages, the MCU Wiki and Wikipedia. Reading each page against its claim changed the data in several places, so the basis lines were reworded to say no more than the pages do:
- **Gamora's "Godslayer in Guardians Vol. 2"** was not confirmed: Wikipedia ties the Godslayer to the comics and the MCU Wiki page has no film appearances. TV Tropes does show her with a sword, so she stays in Blades & Claws as "signature sword shown in the Guardians films" with no sword name or film.
- **Deadpool "amoral"** was wrong as worded: TV Tropes says he has a (warped) moral code. He stays in Anti-Heroes as a mercenary anti-hero.
- **Daredevil "rooftop fighting"** was not shown on the page; the line now says parkour and corridor fighting.
- **Elektra "ninja"** is not literally stated; the line now says martial artist trained by the Chaste.
- **Stick "blind"** is not stated for the TV version; he is now "mentor who trains Matt Murdock to fight".
- **Yelena** is confirmed as Red Room-trained (Wikipedia) and as fighting hand-to-hand in both productions (TV Tropes), so she is corroborated.
- **Drax's twin knives** were missing from the first page checked but confirmed on two others.
- **Hawkeye** is a single-source acrobatics entry: the page says the MCU shows more acrobatics in his own series, and also notes his close combat used to be only fair.

## What it does to scores (measured, not assumed)
400 seeded random MCU rosters per sport, the same rosters scored with no archetype groups, at the earlier strength 0.5, and at the new strength 1. Measured on the current develop line (after the bench rework, PR #404).

| Sport | Rosters changed (of 400) | Avg chemistry change at 1 (at 0.5) | Largest change at 1 (at 0.5) | Avg rating change at 1 (at 0.5) |
|---|---|---|---|---|
| Basketball | 46 | +0.060 (+0.031) | +1.45 (+0.73) | +0.061 (+0.031) |
| Football | 0 | 0 | 0 | 0 |
| Soccer | 59 | +0.063 (+0.041) | +1.39 (+1.23) | +0.064 (+0.042) |
| Baseball | 68 | +0.076 (+0.050) | +1.52 (+1.00) | +0.077 (+0.050) |
| Hockey | 77 | +0.102 (+0.052) | +1.45 (+0.95) | +0.102 (+0.053) |
| Volleyball | 85 | +0.119 (+0.063) | +1.45 (+0.73) | +0.120 (+0.064) |
| Battle Royale | 49 | +0.066 (+0.033) | +1.18 (+0.73) | +0.066 (+0.034) |

Things to know:
- **Doubling the strength about doubles the effect** on rosters that share a group, and leaves the same rosters changed (strength scales points, not who qualifies). The average is still small because most random rosters have no two members of one archetype.
- **Football feels nothing.** All 400 random football rosters already sit at the 2.8 chemistry cap, so extra groups cannot add team chemistry there.
- **Soccer and baseball** also have many rosters at the cap before the groups (259 and 183 of 400), which holds their change down.
- **Archetype groups affect team chemistry only.** Bench Chemistry no longer lifts teammates through shared groups (PR #404, owner ruling 2026-11-15), which is why the average rating change tracks the chemistry change almost exactly.
- A roster built on purpose (for example Daredevil + Iron Fist + Black Widow + Elektra) gets noticeably more; two members of one archetype add exactly strength x 0.45.
- Ratings in this table are the pre-game team rating, not match outcomes.
- The measuring script is not part of the repo. It scores the same seeded rosters through the real page code (`tests/helpers/option-c-app-harness.cjs`), so rerunning it needs only that harness.

## Not done
- No sources beyond the pages above; the whole-roster audit has not been run on these members, and membership remains an editorial judgment that can change.
- Only the MCU pool has archetype groups. The owner's request named the Marvel Ultimate Alliance 3 style; other pools (DC, Middle-earth, Harry Potter, Action Movies) have none yet.
- Other MUA3 ideas (Femme Fatales, Women of Marvel, New Avengers, Forces of Nature, Heavy Hitters) and the Mjolnir/Phoenix "wielder" groups were not built.
- The Option C shadow evaluator is untouched. It treats legacy effects as already counted in the live rating (its `doubleCountGuard`), so these groups are not added a second time; its parity tests pass.

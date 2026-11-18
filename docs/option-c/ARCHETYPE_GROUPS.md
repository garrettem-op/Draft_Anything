# Archetype chemistry groups (all pools)

Built after the owner confirmed on 2026-11-15 that these should change live scores. Idea and option 2 come from `MUA3_TEAM_BONUS_RESEARCH.md`. Owner rulings on 2026-11-18:
1. **Sourced membership** for every member.
2. **Film-group strength:** a bonus on the same footing as the MCU film chemistry groups (strength 1), not the weaker 0.5 cross-film tier.
3. **One shared set across all talent pools**, so the same archetypes link characters from different universes in Mashup.

The MCU version shipped first (PR #403). This revision extends the same five archetypes to all eleven built-in pools.

## How it works
`data/archetype-groups.js` defines five groups. `index.html` registers each once as `arch:<slug>` (for example `arch:martial`) and adds that id to the group list of every member candidate in that member's pool. Points use the same rule as every other group: strength x tier for the number of members on the roster (2 members 0.45, 3 1.0, 4 1.55, 5 2.0, 6 2.3), summed with all other groups and capped at 2.8. No new effect type, no new cap.

Because Mashup reuses each pool's candidates, the shared id is what makes cross-universe links work. Batman (DC) and Po (Toons) are both Martial Artists, so a Mashup roster with both gets the same +0.45 as two MCU martial artists would.

## Membership
| Group | MUA3 idea | Members per pool |
|---|---|---|
| Martial Artists | Martial Artists | MCU 8, DC 8, Games 7, Star Wars 3, Toons 8, Muppets 1, Pokémon 7, Action Movies 8 |
| Agile Fighters | Agile Fighters | MCU 6, DC 8, Games 7, Star Wars 8, Toons 6, Middle-earth 1, Action Movies 3 |
| Blades & Claws | Cutting Edge | MCU 8, DC 7, Games 8, Middle-earth 8, Star Wars 8, Toons 8, Harry Potter 3, Pokémon 4, Action Movies 8 |
| Anti-Heroes | Anti-Heroes | MCU 5, DC 4, Games 2, Star Wars 4, Toons 3, Action Movies 4 |
| Wisecracking Warriors | Wise Cracking Warriors | MCU 5, Muppets 5, NBA 3, Toons 6, Games 1, Star Wars 2, Harry Potter 1, Action Movies 2 |

198 member entries in total. The full list with a basis line and sources per member is in the data file.

**Selection rule.** Groups take characters **defined** by the trait, at most 10 per pool. Most of Middle-earth carries a sword and nearly every Jedi a lightsaber, so a loose group would bump almost every roster and stop meaning anything. Blades & Claws takes signature blade fighters only (Aragorn, Túrin, Gimli, Thorin...; Maul, Dooku, Grievous, Ahsoka...).

**Pools that barely fit.** NBA only has trash talkers in Wisecracking Warriors (Larry Bird, Gary Payton, Reggie Miller). Harry Potter has the Gryffindor sword wielders and Fred Weasley. Muppets has Miss Piggy's karate and the comedians/hecklers. These are honest fits, not filler.

**Form-based traits** count for the base character (owner ruling 2026-11-10): Zelda is an Agile Fighter through Sheik, Zuko a Blade/Anti-Hero through the Blue Spirit.

## Sources
| Label | Entries | Meaning |
|---|---|---|
| credible | 190 | One source documents the trait. |
| corroborated | 7 | Two independent origins agree (for example Puss in Boots: the repo record and TV Tropes). |
| needs-review | 1 | Valkyrie (MCU) in Blades & Claws: one community wiki names her sword but no film or scene. |

Two kinds of source:
- **Reviewed research records in this repo** (`research/option-c/batches/...`, cited by file and record id), for most non-MCU members. Each was found by searching the record text for the trait, then read and accepted or dropped by hand. When the record cites a page whose own "supports" note names the trait, that page is attached too. The test re-reads every referenced record and fails if it no longer states the trait.
- **Web pages fetched and read against the claim on 2026-11-18**, for the MCU members, all of Action Movies (which has no research records yet) and a few iconic characters the records do not cover: Han Solo, Bugs Bunny, Rick Sanchez, Kratos, Nathan Drake, Lobo, Shrek, Donkey, Larry Bird, Rambo.

**Dropped during checking**, because the source did not support the claim: Jack Sparrow (anti-hero, quips), Harley Quinn (quips), Dante (quips), the Genie (only indirect support), the Joker (record shows joke-themed gadgets, not quips), Amy Rose ("agility" was generic), Tulkas and Elendil (brawling or a single fight, not a martial art), Sheik as a martial artist (a ninja disguise is not enough, matching the owner's stealth ruling), Trinity (her page did not describe her fighting), and bounty hunters Samus Aran, Captain Falcon and Cad Bane (bounty hunter alone is not anti-hero).

## What it does to scores (measured, not assumed)
400 seeded random rosters per pool and sport, the same rosters scored with and without the archetype groups, through the real page code. Cells are the average team-chemistry change; the share of rosters that changed is in brackets.

| Pool | Basketball | Football | Soccer | Baseball | Hockey | Volleyball | Battle Royale |
|---|---|---|---|---|---|---|---|
| NBA | +0.005 (1%) | +0.002 (1%) | +0.008 (2%) | +0.006 (1%) | +0.007 (2%) | +0.002 (1%) | +0.003 (1%) |
| MCU | +0.076 (13%) | 0 | +0.076 (16%) | +0.090 (19%) | +0.089 (17%) | +0.107 (19%) | +0.094 (15%) |
| Toons | +0.085 (15%) | 0 | +0.184 (34%) | +0.199 (36%) | +0.097 (18%) | +0.126 (22%) | +0.082 (16%) |
| Muppets | +0.020 (5%) | 0 | +0.010 (4%) | +0.021 (6%) | +0.020 (5%) | +0.024 (5%) | +0.020 (5%) |
| Video Games | +0.119 (22%) | 0 | +0.100 (25%) | +0.137 (31%) | +0.115 (23%) | +0.130 (25%) | +0.101 (19%) |
| Pokémon | +0.024 (5%) | 0 | +0.020 (7%) | +0.034 (9%) | +0.037 (8%) | +0.033 (8%) | +0.022 (5%) |
| Star Wars | +0.086 (16%) | 0 | +0.005 (1%) | +0.011 (4%) | +0.089 (20%) | +0.083 (20%) | +0.105 (20%) |
| DC | +0.108 (21%) | 0 | +0.116 (30%) | +0.148 (33%) | +0.157 (27%) | +0.169 (29%) | +0.116 (20%) |
| Middle-earth | +0.045 (10%) | 0 | +0.008 (3%) | +0.033 (9%) | +0.043 (9%) | +0.065 (13%) | +0.041 (8%) |
| Harry Potter | +0.003 (1%) | 0 | +0.003 (1%) | +0.001 (1%) | +0.007 (2%) | +0.010 (3%) | +0.002 (1%) |
| Action Movies | +0.124 (20%) | +0.389 (74%) | +0.397 (52%) | +0.316 (44%) | +0.139 (23%) | +0.159 (25%) | +0.127 (19%) |
| **Mashup** | +0.052 (10%) | **+0.455 (55%)** | +0.159 (26%) | +0.134 (21%) | +0.071 (13%) | +0.089 (17%) | +0.052 (10%) |

Things to know:
- **Mashup is where this matters most.** Before, random Mashup rosters almost never shared a group, because every franchise group belongs to one pool (only 8 of 400 football rosters reached the cap). Archetypes are now the main way a cross-universe team earns chemistry. The largest single Mashup change was +2.48.
- **Action Movies also moves a lot.** Its rosters were never near the cap, and its own film groups run at 0.7, so a strength-1 archetype counts for more there than a film group does. This follows the owner's "film-group footing" ruling as applied to the MCU groups; if Action Movies should instead match its own 0.7 film groups, that needs a per-pool strength.
- **Football is unchanged in every other pool** because those rosters were already at the 2.8 cap. Soccer and baseball in Star Wars, Middle-earth and Harry Potter change little for the same reason.
- **NBA, Muppets and Harry Potter barely move** (around +0.01 to +0.02), since they have few members.
- Average rating change tracks the chemistry change almost exactly; Bench Chemistry no longer lifts teammates through shared groups (PR #404).
- Ratings here are the pre-game team rating, not match outcomes. The measuring script is not in the repo; it scores the same seeded rosters through `tests/helpers/option-c-app-harness.cjs`.

## Not done
- No whole-roster audit has been run on these members; membership remains an editorial judgment and can change.
- Most non-MCU members rest on one reviewed research record. A second source would move them to corroborated.
- Action Movies is web-sourced only; it has no research records yet.
- Other MUA3 ideas (Femme Fatales, Women of Marvel, Forces of Nature, Heavy Hitters) and the Mjolnir/Phoenix "wielder" groups were not built.
- The Option C shadow evaluator is untouched. It treats legacy effects as already counted in the live rating (its `doubleCountGuard`), so these groups are not added a second time.

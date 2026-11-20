# Archetype and tag chemistry groups

Built after the owner confirmed on 2026-11-15 that these should change live scores. Idea and option 2 come from `MUA3_TEAM_BONUS_RESEARCH.md`.

Owner rulings:
- **2026-11-18:** sourced membership; archetypes at **film-group strength (1)**; **one shared set across all talent pools**, so groups link characters from different universes in Mashup.
- **2026-11-19:** **NBA takes no part** (it runs on its own terms). Broader **tags** added at **strength 0.25**: **Sorcerers** (spellcasters only) and **one group per colour**. Archetypes stay at **1 in every pool**, including Action Movies, whose own film groups run at 0.7.

The MCU archetypes shipped first (PR #403). PR #413 extends them to every pool and adds the tags.

## How it works
`data/archetype-groups.js` defines thirteen groups of two kinds. `index.html` registers each once, as `arch:<slug>` (archetypes) or `tag:<slug>` (tags), and adds that id to the group list of every member candidate in that member's pool. Points use the same rule as every other group: strength x tier for the number of members on the roster (2 members 0.45, 3 1.0, 4 1.55, 5 2.0, 6 2.3), summed with all other groups and capped at 2.8. No new effect type, no new cap.

Because Mashup reuses each pool's candidates, the shared id makes cross-universe links work: Batman (DC) and Po (Toons) link as Martial Artists (+0.45), Kermit (Muppets) and Hulk (MCU) as Greens (+0.1125), Gandalf (Middle-earth) and Doctor Strange (MCU) as Sorcerers.

## Membership
**Archetypes** (strength 1), at most 10 per pool, characters **defined** by the trait:

| Group | MUA3 idea | Members per pool |
|---|---|---|
| Martial Artists | Martial Artists | MCU 8, DC 8, Games 7, Star Wars 3, Toons 8, Muppets 1, Pokémon 7, Action Movies 8 |
| Agile Fighters | Agile Fighters | MCU 6, DC 8, Games 7, Star Wars 8, Toons 6, Middle-earth 1, Action Movies 3 |
| Blades & Claws | Cutting Edge | MCU 8, DC 7, Games 8, Middle-earth 8, Star Wars 8, Toons 8, Harry Potter 3, Pokémon 4, Action Movies 8 |
| Anti-Heroes | Anti-Heroes | MCU 5, DC 4, Games 2, Star Wars 4, Toons 3, Action Movies 4 |
| Wisecracking Warriors | Wise Cracking Warriors | MCU 5, Muppets 5, Toons 6, Games 1, Star Wars 2, Harry Potter 1, Action Movies 2 |

**Tags** (strength 0.25):

| Group | Rule | Members per pool |
|---|---|---|
| Sorcerers | Casts spells or practises magic; not Force users, psychics or innate powers (so no Elsa, Ciri, Shazam, Pokémon) | MCU 8, DC 6, Harry Potter 10, Middle-earth 7, Games 8, Toons 4, Muppets 2, Star Wars 1, Action Movies 3 |
| Greens | One colour per character: body colour, or the signature colour their identity is built on; Pokémon use the Pokédex colour | Muppets 2, Toons 6, Pokémon 9, DC 3, MCU 1 |
| Blues | same | Muppets 5, Toons 3, Games 1 |
| Reds | same | Muppets 1, Games 2, DC 1 |
| Yellows | same | Muppets 2, Toons 4, Pokémon 10, Games 1 |
| Oranges | same | Muppets 4 |
| Purples | same | Muppets 2, Games 1 |
| Pinks | same | Toons 1, Games 1, Pokémon 10 |

314 member entries in total; the data file lists each with a basis line and sources.

**Why the cap of 10 per pool matters.** Most of Middle-earth carries a sword, nearly every Jedi a lightsaber, and nearly everyone in Harry Potter casts spells. A loose group would bump almost every roster there and stop meaning anything, so each group takes only the characters most defined by the trait (Sorcerers in Harry Potter: Dumbledore, Voldemort, Harry, Hermione, Snape, McGonagall, Bellatrix, Grindelwald, Flitwick, Ron).

**Colours are a first sourced set, not complete.** Only characters whose colour a fetched page or research record states are in. Iconic gaps that need a source before they join: Shrek, Yoda, Grogu, Gamora, Thanos, Nebula, Mario, Luigi, Yoshi, Kirby, SpongeBob, Patrick, Miss Piggy, Beast Boy, Starfire. Red Fraggle is not a Red: her page gives her a yellowish-orange body (only her hair is red).

## Sources
| Label | Entries | Meaning |
|---|---|---|
| credible | 299 | One source documents the trait. |
| corroborated | 12 | Two independent origins agree. |
| needs-review | 3 | Valkyrie (Blades & Claws): one community wiki names her sword but no film. The Count (Purples): Wikipedia names his "Large Lavender" puppet pattern but not his colour outright. Imhotep (Sorcerers): his page documents plagues and sand powers but does not call them spellcasting. All stay members, flagged for a second source. |

Two kinds of source:
- **Reviewed research records in this repo** (`research/option-c/batches/...`, cited by file and record id), plus the page the record cites when its own "supports" note names the trait. The test re-reads every referenced record and fails if it does not state the trait.
- **Web pages fetched and read against the claim** (2026-11-18 and 2026-11-19): the MCU archetypes, all of Action Movies, iconic gaps (Han Solo, Bugs Bunny, Kratos, Lobo, Rambo...), most colours (Wikipedia, TV Tropes, Serebii and RankedBoost for Pokémon colours), and Mickey, Thulsa Doom, the White Witch and Imhotep for Sorcerers.

**Dropped during checking** because the source did not support the claim: Jack Sparrow, Harley Quinn's quips, Dante's quips, the Genie, the Joker, Amy Rose as an agile fighter, Tulkas, Elendil, Sheik as a martial artist, Trinity, and Samus / Captain Falcon / Cad Bane as anti-heroes. **Removed by owner ruling:** Larry Bird, Gary Payton and Reggie Miller (NBA).

## What it does to scores (measured, reproducible)
`node tools/archetype-impact.cjs` (400 seeded rosters per pool and sport, seed 20261118). It scores the same rosters with and without the data file through the real page code. Cells are the average capped team-chemistry change; the share of rosters that changed is in brackets.

| Pool | Basketball | Football | Soccer | Baseball | Hockey | Volleyball | Battle Royale |
|---|---|---|---|---|---|---|---|
| NBA | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| MCU | +0.083 (19%) | 0 | +0.080 (20%) | +0.095 (23%) | +0.097 (23%) | +0.119 (28%) | +0.100 (19%) |
| Toons | +0.091 (20%) | 0 | +0.198 (42%) | +0.218 (47%) | +0.107 (24%) | +0.137 (29%) | +0.088 (20%) |
| Muppets | +0.028 (11%) | 0 | +0.019 (12%) | +0.037 (17%) | +0.031 (13%) | +0.036 (15%) | +0.028 (11%) |
| Video Games | +0.129 (29%) | 0 | +0.113 (33%) | +0.154 (41%) | +0.128 (32%) | +0.141 (32%) | +0.109 (25%) |
| Pokémon | +0.048 (23%) | 0 | +0.037 (20%) | +0.065 (28%) | +0.068 (30%) | +0.075 (35%) | +0.050 (25%) |
| Star Wars | +0.086 (16%) | 0 | +0.005 (1%) | +0.011 (4%) | +0.089 (20%) | +0.083 (20%) | +0.105 (20%) |
| DC | +0.116 (27%) | 0 | +0.126 (37%) | +0.160 (41%) | +0.168 (35%) | +0.181 (36%) | +0.122 (25%) |
| Middle-earth | +0.052 (14%) | 0 | +0.010 (5%) | +0.040 (14%) | +0.053 (18%) | +0.076 (22%) | +0.046 (12%) |
| Harry Potter | +0.017 (11%) | 0 | +0.011 (7%) | +0.015 (11%) | +0.026 (16%) | +0.029 (17%) | +0.014 (11%) |
| Action Movies | +0.126 (21%) | +0.395 (76%) | +0.402 (54%) | +0.320 (46%) | +0.142 (24%) | +0.162 (27%) | +0.128 (20%) |
| **Mashup** | +0.057 (14%) | **+0.491 (68%)** | +0.176 (37%) | +0.141 (28%) | +0.076 (16%) | +0.095 (22%) | +0.056 (12%) |

Things to know:
- **Mashup is where this matters most.** Franchise groups never span universes, so archetypes and tags are now the main way a cross-universe team earns chemistry (football +0.49 average; largest single change +2.48).
- **Action Movies also moves a lot**, because its rosters were never near the cap and archetypes outweigh its 0.7 film groups. The owner confirmed keeping strength 1 there (2026-11-19).
- **Football is unchanged in every other pool** because those rosters were already at the 2.8 cap.
- **Tags are small on their own.** Two members of one tag add 0.25 x 0.45 = 0.1125; they matter most where archetypes were thin (Muppets, Pokémon, Harry Potter).
- **NBA is untouched** by construction; a test asserts NBA rosters score exactly as before.
- Average rating change tracks the chemistry change almost exactly; Bench Chemistry no longer lifts teammates through shared groups (PR #404). Ratings are the pre-game team rating, not match outcomes.

## Baselines
`tests/fixtures/option-c-v1-golden.json` records two revisions for these groups (2026-11-18 archetypes, 2026-11-19 tags and NBA removal), each regenerated from the same checkout with `data/option-c/` not loaded, after proving that restoring the previous data file reproduces the previous digests exactly. A test re-proves on every run that skipping `data/archetype-groups.js` reproduces the pre-archetype digests.

## Not done
- No whole-roster audit has been run on these members; membership remains an editorial judgment.
- Most non-MCU members rest on one reviewed research record; a second source would make them corroborated.
- The colour groups need sources for the iconic gaps listed above.
- Other MUA3 ideas (Femme Fatales, Women of Marvel, Forces of Nature, Heavy Hitters) and the Mjolnir/Phoenix "wielder" groups were not built.
- The Option C shadow evaluator is untouched. It treats legacy effects as already counted in the live rating (its `doubleCountGuard`), so these groups are not added a second time.

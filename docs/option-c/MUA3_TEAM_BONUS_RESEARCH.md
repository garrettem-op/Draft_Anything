# Marvel Ultimate Alliance 3 team-bonus model vs Draft Anything chemistry

**Status:** research note. Option 2 below was built after the owner's go-ahead on 2026-11-15; see `docs/option-c/ARCHETYPE_GROUPS.md`. The rest of this note is unchanged. It describes a published video game's team-bonus system from web sources and compares its shape with the game's existing MCU chemistry groups. It proposes nothing as accepted, changes no rating, and does not touch the evaluator. Sources are listed at the end; the member lists below come from one fan guide and were already marked "work in progress" by their author.

Scope: the Switch title is *Marvel Ultimate Alliance 3: The Black Order* (July 19, 2019). The older games had similar bonuses (for example Think Tanks with +15% max health and Agile Warriors with 10% reduced energy cost in the first game), but this note covers only the Switch game.

## How MUA3 team bonuses work (from sources)
- **Affiliations.** Guides count 29 team affiliations, from 2 to 12 members each. Membership is based on comics lore; the Original Avengers bonus, for example, fires for Hulk, Iron Man, Thor and Wasp but not Captain America.
- **Trigger.** Two to four characters from one affiliation on the four-hero squad give that affiliation's bonus; a bigger share is more pronounced than a pair. You do not need a full squad from one team.
- **What it buffs.** Six stats (STR, DUR, MAS, RES, VIT, ENE). Individual boosts run from about 3% to 18% on a stat; one guide says some teams give up to 10%, another reports 18% on strength for an X-Men and Women of Marvel heavy squad. The exact scaling formula with member count is not published in anything I found.
- **Stacking.** Characters belong to several affiliations at once, and the bonuses stack. Guides recommend checking bonuses against a hard boss rather than building a team around them; they matter most on high difficulty after levelling.
- **Source conflict.** One article says every character has exactly four affiliations. The member lists in two other guides give Wolverine seven, Gamora eight and Black Widow seven. I treat "four" as unreliable.

## The 29 affiliations and how the game's MCU groups already cover them
"In roster" counts members who exist in the Draft Anything MCU pool. "Pairs sharing a group" is the share of those members' pairs that already sit together in at least one existing MCU chemistry group. It is generous: the broad Avengers group (strength 0.6) links most heroes, so a high number does not mean the affiliation's *theme* is modelled.

| MUA3 affiliation | Members | In roster | Pairs sharing a game group | Not in the MCU roster |
|---|---|---|---|---|
| Agents of S.H.I.E.L.D | 6 | 6 | 10/15 (67%) | none |
| Agile Fighters | 10 | 7 | 8/21 (38%) | Miles Morales, Nightcrawler, Spider-Gwen |
| Anti-Heroes | 4 | 2 | 1/1 (100%) | Ghost Rider, Venom |
| Avengers | 11 | 10 | 45/45 (100%) | Crystal |
| Back in Black | 4 | 2 | 1/1 (100%) | Ghost Rider, Venom |
| Big Brains | 6 | 6 | 11/15 (73%) | none |
| The Crew | 4 | 3 | 1/3 (33%) | Storm |
| Cutting Edge | 7 | 5 | 2/10 (20%) | Nightcrawler, Psylocke |
| Defenders | 5 | 5 | 5/10 (50%) | none |
| Family Values | 2 | 2 | 0/1 (0%) | none |
| Femme Fatales | 3 | 2 | 0/1 (0%) | Psylocke |
| Forces of Nature | 3 | 1 | n/a (fewer than 2 in roster) | Crystal, Storm |
| Generations | 6 | 5 | 7/10 (70%) | Miles Morales |
| Gods and Demons | 4 | 2 | 1/1 (100%) | Ghost Rider, Storm |
| Guardians of the Galaxy | 6 | 6 | 11/15 (73%) | none |
| Heavy Hitters | 6 | 5 | 6/10 (60%) | Venom |
| Martial Artists | 5 | 4 | 1/6 (17%) | Psylocke |
| Marvel Royalty | 7 | 5 | 7/10 (70%) | Crystal, Storm |
| Midnight Sons | 3 | 2 | 1/1 (100%) | Ghost Rider |
| New Avengers | 6 | 6 | 4/15 (27%) | none |
| Original Avengers | 4 | 4 | 6/6 (100%) | none |
| Partners | 7 | 6 | 11/15 (73%) | Venom |
| Ultimate Alliance 3 | 11 | 8 | 16/28 (57%) | Crystal, Miles Morales, Spider-Gwen |
| Villains | 3 | 1 | n/a (fewer than 2 in roster) | Magneto, Venom |
| Web Warriors | 5 | 2 | 1/1 (100%) | Miles Morales, Spider-Gwen, Venom |
| Wise Cracking Warriors | 4 | 4 | 3/6 (50%) | none |
| Women of Marvel | 11 | 6 | 6/15 (40%) | Crystal, Elsa Bloodstone, Psylocke, Spider-Gwen, Storm |
| X-Force | 5 | 2 | 1/1 (100%) | Nightcrawler, Psylocke, Storm |
| X-Men | 5 | 2 | 1/1 (100%) | Nightcrawler, Psylocke, Storm |

## What the comparison shows
- **Franchise-membership teams are already covered.** Avengers, Original Avengers, Guardians, Defenders and the S.H.I.E.L.D. and Stark-style circles have close matches in the game's 38 MCU groups (strengths 0.5-1.0, count tiers 2 → 0.45, 3 → 1.0, 4 → 1.55, 5 → 2.0, 6 → 2.3 times strength, summed and capped at 2.8).
- **MUA3's extra layer is archetype and trait teams**, and these are what the game mostly lacks: Agile Fighters, The Crew, Cutting Edge, Family Values, Femme Fatales, Martial Artists, New Avengers, Women of Marvel have low coverage by existing groups (affiliations with fewer than two members in the roster are left out of this judgment). Examples of the idea: Agile Fighters, Martial Artists, Cutting Edge (blades or claws), Anti-Heroes, Femme Fatales, Wise Cracking Warriors, Forces of Nature. The game does have a few trait-style groups (Sharpshooters, Geniuses, Airborne, Heavyweights, Next Generation).
- **Some names mean something different.** MUA3's Web Warriors is a set of Spider-people; the game's Friendly Neighborhood is Spider-Man's supporting cast. Family Values (Gamora and Thor) is a relationship tag for a very small set.
- **Mechanics differ.** MUA3 gives per-stat percentage buffs to each member. The game gives one team-rating contribution per group with diminishing count tiers and a hard cap. The game's version is simpler and already cap-limited; copying MUA3's six-stat model would be a larger redesign and cannot be calibrated yet.
- **Overlap is by design in both.** Characters sit in many groups. The existing caps and one-time application keys in the Option C ledger are what stop double counting.

## Your examples
- *Villains, X-Men, Avengers*: all three exist as MUA3 teams. Villains is tiny there (Deadpool, Magneto, Venom in the list I found); X-Men has Deadpool, Nightcrawler, Psylocke, Storm and Wolverine in the base list. The game already has Villains (0.6), Avengers (0.6), Original Avengers (1.0), Mutants (0.8) and Airborne (0.5).
- *Flyers, Phoenix Force wielders, Mjolnir wielders*: **I did not find these as named MUA3 teams.** The only Phoenix content I found is the paid X-Men DLC (Phoenix, Gambit, Iceman, Cable) and a Phoenix Force boss mode; I found no source naming a Phoenix Force team bonus, a Mjolnir-wielder team bonus or a flyers team bonus, and the DLC characters' team memberships were not in the lists I found. These may come from another Marvel game or from memory. They are good ideas for the Draft Anything game, but they would be our own tags, each needing sourced membership.

## Options for the owner (nothing built)
1. **Leave chemistry as is.** The existing groups already cover the franchise teams.
2. **Add archetype/trait groups** (Agile Fighters, Martial Artists, Cutting Edge, Anti-Heroes and similar) as low-strength groups, each with source-tagged membership, using the existing group, tier and cap machinery.
3. **Add "wielder/host" groups** (Mjolnir wielders, Phoenix Force hosts, Infinity Stone bearers) as our own conditional tags, with membership only where a source shows it on screen or in comics for the chosen version.
4. **Per-stat team buffs** like MUA3's six-stat percentages. Larger redesign; I would hold it until the evaluator is calibrated.

## Sources
- RPG Site, "Marvel Ultimate Alliance 3: Team Bonuses and Bonus Effects listed" (rpgsite.net/feature/8742-marvel-ultimate-alliance-3-team-bonuses-and-bonus-effects-listed): team and member lists, trigger rules.
- Digital Trends, "How to assemble the best squad in Marvel Ultimate Alliance 3": 29 affiliations, six stat categories, 2-4 trigger, up to 10% boosts, "four affiliations" claim.
- Gameranx, team-bonus combo findings (gameranx.com/?p=177260): six stat names, 3%-18% range, example teams.
- TheGamer, MUA3 team bonus tips: Wolverine's list of bonuses; Original Avengers example.
- Nintendo Wire, MUA3 page: Expansion Pass DLC (Marvel Knights, X-Men: Rise of the Phoenix, Fantastic Four).
- Game Revolution, first Marvel: Ultimate Alliance team bonuses: older-game examples.

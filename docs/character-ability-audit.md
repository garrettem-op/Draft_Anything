# Character ability audit and complete tag index (2026-11)

Owner: Claude (character knowledge). Engine, UI and integration: ChatGPT.

## What changed

1. **Every roster character now has reviewed ability tags.** `CHARACTER_ABILITY_TAGS` in
   `data/character-abilities.js` lists all 848 characters across the seven pools. Each list holds the 12 Campaign
   power ids. An empty list means **audited, no qualifying power**, which is different from unknown.
   `characterAbilityTags(candidate)` returns a character's tags. It returns `[]` for audited non-powered characters
   and `null` for a name outside the roster.
2. **353 new source-linked evidence records for 226 characters** (`CHARACTER_ABILITY_RECORDS_AUDIT`). Each record holds:
   - the power tag
   - the `kind`, e.g. `pilot` vs `self-flight` vs `glide` vs `mount`, or `gen1-level-up-move`
   - a specific feat
   - the source URL opened during research
   - the `continuity` (film, episode, game or Pokédex version)
   - a `limitation` when the power depends on a power-up, device, vehicle or alternate form

   These records take effect immediately through the existing `characterAbilityEvidence()` hook. No change to
   `campaign.js` is needed.
3. **14 disputed grants.** These are powers the engine currently accepts but the audit could not support
   (`incorrect`) or that need a design decision (`ruling`).
4. **48 research-queue items.** These are plausible powers that are deliberately **not granted** yet.
5. **Tooling.**
   - `tools/ability-audit.cjs --write-index` regenerates the index.
   - `--report` regenerates `docs/character-ability-coverage.md`, which has full per-pool tables, lists, and the
     roster entries that still have no tags.
6. **Tests.**
   - New: `tests/character-ability-index.test.cjs`, which runs against the real roster parsed from `index.html`.
   - Fixed: `tests/campaign.test.cjs` and `tests/character-abilities.test.cjs`, which had been failing (11 tests)
     since PR #38. Their harnesses did not load `campaign-eligibility.js`, and one still expected 12 extra
     challenges instead of 13.

Raw research, including rejected claims and researcher notes, is preserved in `research/ABILITY_AUDIT_2026-11.json`.

## Coverage, before → after (characters accepted per theme)

| Theme | Before | After |
| --- | ---: | ---: |
| Skyborne (flight) | 87 | 159 |
| Arcane Assembly (magic) | 15 | 38 |
| Mind Games (psychic) | 29 | 71 |
| Under the Sea (aquatic) | 38 | 50 |
| Inferno (fire) | 18 | 37 |
| Cold Front (ice) | 11 | 24 |
| Shock Troopers (electric) | 17 | 39 |
| Tech Titans (tech) | 34 | 95 |
| Ghost Protocol (stealth) | 36 | 49 |
| Blink and Miss (teleport) | 18 | 56 |
| The Medics (healing) | 23 | 38 |
| Giant Problems (giants) | 11 | 22 |
| **Character–power pairs** | **337** | **678** |

Non-NBA characters with no power at all went from 454 to 316. Most of the remainder are canonically non-powered
(e.g. Kermit, Han Solo outside the cockpit, Homer Simpson).

## Biggest gaps closed

- **Name-alias bugs.** `CAMPAIGN_TAGS` matches names, and several of its names are not the roster's names. The
  following characters were being rejected for their signature power:
  - `Iroh` (roster: **Uncle Iroh**)
  - `Squidward Tentacles` (roster: **Squidward**)
  - `Palpatine` / `Darth Sidious` (roster: **Emperor Palpatine**)
  - `Fire Mario` (roster: **Mario**)

  Evidence records now cover each one under its real roster name.
- **Mind Games had only 2 Star Wars characters.** 27 now qualify (25 newly documented), each with a specific on-screen
  feat: telekinesis, mind trick, or telepathy.
- **Pokémon** move and Pokédex evidence, all checked against the Generation I learnset pages:
  - Teleport via TM30, following the existing Mew precedent.
  - Recover by level-up (Staryu, Porygon, Kadabra, Alakazam).
  - Confusion and Psybeam by level-up (Butterfree, Venonat, Venomoth, Psyduck, Golduck).
  - Pokédex stealth (Ekans, the Gastly line, Mew's invisibility, Vaporeon).
- **Video games:**
  - Power-up and copy abilities, recorded as limitations (Mario, Kirby, Mega Man).
  - Pilots (Fox, Samus, Master Chief).
  - Signature teleports (Tracer, Chell, Scorpion, Ciri, Shadow).
  - Spellcasters (Sora, Geralt, Aerith, Dovahkiin).
- **Droids, cyborgs and Mandalorian kit** for Tech Titans. **Pilots and jetpacks** for Skyborne.
- **Muppets:** the Gorgs are giants, Abby Cadabby (magic, flight, teleport), and Super Grover (flight).

## Changes ChatGPT needs to make for integration

1. **Honor `incorrect` disputes in the engine.** Today these five are still accepted, because the grants come
   from the name list, roster-description patterns, or guide text:
   - The Thing → giants
   - Garfield → stealth
   - Popeye → healing
   - Mr. Mime → stealth (the blurb says "Invisible-wall")
   - IG-88 → stealth (the blurb says "Assassin droid")

   The smallest change is a guard at the top of the `default:` branch in `campaignAllowed`:
   ```js
   if (typeof CHARACTER_ABILITY_DISPUTES !== 'undefined' &&
       CHARACTER_ABILITY_DISPUTES.some(d => d.verdict === 'incorrect' && d.id === c.pool + ':' + c.n && d.tag === rule)) return false;
   ```
   The alternative is to drive themed rules from `characterAbilityTags(c).includes(rule)`, keeping
   `KnowledgeEngine.has` for approved appeals. `tests/character-ability-index.test.cjs` already asserts that every
   index tag is honored. Once the engine excludes disputes, the index and the engine will match exactly.
2. **Optional:** retire or pool-scope the stale names in `CAMPAIGN_TAGS`. 60 of its names are not on the roster,
   such as Superman, Goku and Batman. Because matching is by name only, any future character with the same name in
   another pool would inherit the power.
3. **Generalize the `rule === 'psychic'` guard in `campaignGuideEvidence`.** It already rejects technology clauses.
   Consider the same treatment for role words such as "ninja" and "assassin" in the stealth description pattern,
   pending the ruling below.

## Design rulings needed (not decided by this audit)

- **Giant Problems size threshold.** Thog (9.5 ft), the Gorgs, Onix and the Rancor clearly qualify. Pending:
  - Hulk (~8 ft, name-listed)
  - Smart Hulk (queued)
  - Donkey Kong (name-listed)
  - Big Bird (8 ft 2 in, queued)
  - Gyarados (6.5 m, queued)
  - Sweetums and Snuffleupagus (queued)

  Abomination was accepted as larger than Hulk.
- **Skyborne edge cases:**
  - Glide-only flight (Buzz Lightyear, Knuckles, Rayman, Steve's Elytra)
  - Ice-path skating (Frozone)
  - Gunners (Finn accepted; Chopper queued)
- **Ghost Protocol: role only.** "Ninja" or "assassin" with no stealth feat (Scorpion, Widowmaker).
- **Tech Titans: armor only.** Stormtrooper, Death Trooper, Captain Phasma (queued).
- **Inferno: weapon flamethrowers.** Jango Fett, Boba Fett, The Mandalorian (queued).
- **Player-choice traits.** Commander Shepard's biotics depend on the class the player picks (queued).
- **Edge-case moves:**
  - Rest as healing (Slowbro, queued)
  - TM-only moves other than Teleport (Mew's Softboiled, queued)
  - Thunder Wave as electricity (Dratini line, accepted with limitation)
- **The Marvels location swap** counts as teleport (accepted, limitation recorded).

## Unverified or rejected

The research queue (48) is listed in `CHARACTER_ABILITY_RESEARCH_QUEUE` and in the coverage report. The following
were rejected after research and are protected by tests:
- Ms. Marvel → giants (fists only)
- Crazy Harry → fire (explosives)
- Clefairy and Clefable → healing
- Porygon and Clefable → flight
- Captain Falcon → flight
- Lara Croft → aquatic
- Chirrut Îmwe → psychic
- Asajj Ventress → electric
- Savage Opress → magic

## Source policy and caveats

Sources were preferred in this order:
1. Official sources: StarWars.com databank, Pokédex text, marvel.com
2. Generation-specific learnset pages
3. The franchise's main wiki: Wookieepedia, Super Mario Wiki, Zelda Wiki, Muppet Wiki, MCU wiki and similar
4. Screenplays or press

Some wikis refused automated fetches, so a few claims cite StrategyWiki, Wikipedia or mirror wikis instead.
Several fan-wiki citations are general ability summaries rather than single scenes; those records say so in the
feat. A follow-up pass could replace wiki citations with official or scene-level sources where they exist.

## Maintaining the index

1. Add or edit evidence in `CHARACTER_ABILITY_RECORDS_AUDIT`, or a dispute or queue entry.
2. Run `node tools/ability-audit.cjs --write-index --report`.
3. Run `node --test tests/*.test.cjs`.

The sync test fails if the index drifts from the evidence. It also fails when a roster rename orphans a record, or
when a dispute goes stale.

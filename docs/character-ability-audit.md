# Character ability audit and complete tag index (2026-11)

Owner: Claude (character knowledge). Engine, UI and integration: ChatGPT.

## What changed

1. **Every roster character now has reviewed ability tags.** `CHARACTER_ABILITY_TAGS` in
   `data/character-abilities.js` lists every character in every pool: the 848 in the original seven pools, plus
   the DC, Middle-earth and Harry Potter pools from PR #42 (1,173 in total). For the new pools, the index reflects
   ChatGPT's seeded power data until their lore research lands. Each list holds the 12 Campaign
   power ids. An empty list means **audited, no qualifying power**, which is different from unknown.
   `characterAbilityTags(candidate)` returns a character's tags. It returns `[]` for audited non-powered characters
   and `null` for a name outside the roster.
2. **554 new source-linked evidence records for 303 characters** (`CHARACTER_ABILITY_RECORDS_AUDIT`). Each record holds:
   - the power tag
   - the `kind`, e.g. `pilot` vs `self-flight` vs `glide` vs `mount`, or `gen1-level-up-move`
   - a specific feat
   - the source URL opened during research
   - the `continuity` (film, episode, game or Pokédex version)
   - a `limitation` when the power depends on a power-up, device, vehicle or alternate form

   These records take effect immediately through the existing `characterAbilityEvidence()` hook. No change to
   `campaign.js` is needed.
3. **14 disputed grants.** These are powers the engine currently accepts. All 14 are `incorrect`: the audit found
   no support, or they fail an owner ruling.
4. **37 research-queue items.** These are plausible powers that are deliberately **not granted** yet.
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

## Coverage, before → after (characters per theme)

"After" counts the reviewed index. It is what the game will accept once the engine honors the `incorrect`
disputes (see integration item 1). Until then the engine accepts the same characters plus those 14.

| Theme | Before | After |
| --- | ---: | ---: |
| Skyborne (flight) | 87 | 160 |
| Arcane Assembly (magic) | 15 | 38 |
| Mind Games (psychic) | 29 | 86 |
| Under the Sea (aquatic) | 38 | 57 |
| Inferno (fire) | 18 | 75 |
| Cold Front (ice) | 11 | 77 |
| Shock Troopers (electric) | 17 | 85 |
| Tech Titans (tech) | 34 | 96 |
| Ghost Protocol (stealth) | 36 | 39 |
| Blink and Miss (teleport) | 18 | 70 |
| The Medics (healing) | 23 | 40 |
| Giant Problems (giants) | 11 | 23 |
| **Character–power pairs** | **337** | **846** |

Ghost Protocol barely grows on purpose. Under the role-word ruling, 7 role-only grants come out (8 counting
IG-88), and 14 existing grants now rest on a sourced feat instead of a job title.

Counts cover the original seven pools. Most of the jump in fire, ice and electric comes from Pokémon that can learn
elemental TM moves, under the owner's learnable-move ruling.

Non-NBA characters with no power at all went from 454 to 288. Most of the remainder are canonically
non-powered (e.g. Kermit, Han Solo outside the cockpit, Homer Simpson).

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

1. **Honor `incorrect` disputes in the engine.** The engine still accepts 14 grants the audit removes. They come
   from the `CAMPAIGN_TAGS` name list, roster-description patterns, or guide text:
   - The Thing → giants
   - Donkey Kong → giants
   - Hawkeye → stealth
   - Gamora → stealth
   - Valentina → stealth
   - Bullseye → stealth
   - Master Splinter → stealth
   - Scorpion → stealth
   - Widowmaker → stealth
   - Mr. Mime → stealth
   - IG-88 → stealth
   - Garfield → stealth
   - Popeye → healing
   - Vision → psychic

   The smallest change is a guard at the top of the `default:` branch in `campaignAllowed`:
   ```js
   if (typeof CHARACTER_ABILITY_DISPUTES !== 'undefined' &&
       CHARACTER_ABILITY_DISPUTES.some(d => d.verdict === 'incorrect' && d.id === c.pool + ':' + c.n && d.tag === rule)) return false;
   ```
   The alternative is to drive themed rules from `characterAbilityTags(c).includes(rule)`, keeping
   `KnowledgeEngine.has` for approved appeals. The tests already assert that every index tag is honored. Once the
   guard is in place, the index and the engine will match exactly.
2. **Stealth description pattern.** Under the owner's ruling, role words (`ninja`, `assassin`, `spy`, `agent`,
   `operative`) no longer prove stealth. Remove them from the stealth pattern in `campaign-eligibility.js` and from
   the stealth entries in `CAMPAIGN_TAGS`. Every character with a real stealth feat now has its own evidence
   record, so nobody legitimate loses eligibility.
3. **Optional:** retire or pool-scope the 60 `CAMPAIGN_TAGS` names that are not on the roster, such as Superman,
   Goku and Batman. Because matching is by name only, any future character with the same name in another pool
   would inherit the power.

## Owner rulings applied (2026-11-09)

- **Giant Problems:** about 8 ft or taller counts, but the height must be documented.
  - In: Hulk, Smart Hulk, Abomination, Big Bird (8 ft 2 in), Gyarados (6.5 m).
  - Out: The Thing (human height), Donkey Kong (no documented height).
  - Queued until a height is found: Sweetums, Mr. Snuffleupagus, Big Mean Carl, The Watcher.
- **Skyborne:** a documented glide counts. Buzz Lightyear, Frozone, Knuckles, Rayman, Spyro and Steve (Elytra)
  keep or gain flight. Only pilots and flyers count, so gunners are out: Finn and Chopper are not Skyborne.
- **Ghost Protocol:** a role or job title is not enough; the character needs a stealth or invisibility feat.
  - Verified with a specific scene: Black Widow, Winter Soldier, Nebula, Nakia, Yelena, Sharon Carter, Nick Fury,
    Elektra, all four Turtles, Raiden, Ezio, Altaïr, Ventress, Cassian, Boba Fett, Din Djarin, Fennec Shand.
  - Removed: Hawkeye, Gamora, Valentina, Bullseye, Master Splinter, Scorpion, Widowmaker.
  - Sharon Carter and Din Djarin rest on disguised infiltration rather than staying unseen.
- **Tech Titans:** advanced or powered armor counts (Iron Man, War Machine); standard-issue armor does not.
  - Death Trooper is in, because its armor has a sensor suite, a stealth coating and voice scramblers.
  - Stormtrooper, Captain Phasma and Marcus Fenix stay queued.
- **Inferno:** Mandalorian wrist flamethrowers count. The Mandalorian, Boba Fett and Jango Fett are in. Bo-Katan
  and Sabine are queued because no canon scene shows either one using a flamethrower or fire.

### Owner rulings from the voice review (2026-11-09)

- **Pokémon learnable moves count.** Any move a Pokémon can learn in Generation I, by level-up or TM/HM, earns
  the matching tag. The data comes from Pokémon Showdown's Gen I learnsets (`@pkmn/dex`), and each record cites the
  pokemondb Gen I learnset page. The move-to-tag map is in the next section.
  - Doduo and Dodrio are now Skyborne (HM02 Fly).
  - Snorlax, Nidoking and others are Under the Sea (HM03 Surf).
- **Rest is not healing.** Nearly every Pokémon can learn it, so Slowbro stays out.
- **Commander Shepard counts for Mind Games.** The roster doesn't fix a class, so every canonical option counts.
- **Tracer counts for The Medics** (Recall restores her health) and keeps teleport (Blink).
- **Magneton keeps Skyborne.** It hovers like the linked Magnemite it is made of.
- **Vision does not count for Mind Games.** This is now an `incorrect` dispute.
- **Echo counts for The Medics.** In the Echo finale she uses her healing power on Wilson Fisk's mind. The effect
  does not last into Daredevil: Born Again.

### Pokémon move-to-tag map (Gen I)

| Tag | Moves |
| --- | --- |
| flight | Fly (HM02) |
| aquatic | Surf (HM03) |
| teleport | Teleport (TM30) |
| healing | Recover, Softboiled (TM41). Not Rest. |
| psychic | Psychic (TM29), Psybeam, Confusion, Psywave (TM46), Kinesis, Hypnosis, Dream Eater (TM42) |
| fire | Flamethrower, Fire Blast (TM38), Ember, Fire Punch, Fire Spin |
| ice | Ice Beam (TM13), Blizzard (TM14), Aurora Beam, Ice Punch |
| electric | Thunderbolt (TM24), Thunder (TM25), Thunder Shock, Thunder Punch, Thunder Wave (TM45) |

Moves never grant magic, tech, stealth or giants. A Flying or Water *type* alone still grants nothing beyond the
existing curated type rules.

## Still open (small)

- Specific sub-tags (see `docs/tag-based-eligibility-plan.md`). This is the next data step.

## Unverified or rejected

The research queue (37) is listed in `CHARACTER_ABILITY_RESEARCH_QUEUE` and in the coverage report. The following
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

# MCU research coverage — 143 / 143 draft profiles

**Snapshot:** 2026-10-19  
**Scope:** Exactly the 143 entries in `index.html` `POOLS.mcu`.  
**Status:** ALL CHARACTER PROFILES DRAFTED. Scene-by-scene evidence verification remains outstanding. **Do not mistake roster completion for factual verification or score approval.**

## Deliverables
- `MCU_ALL_143_PROFILES.json` — ordered canonical working catalog, one record per MCU entry; powers, variant, screen works, notable feats, defeats/limits, sport-specific relevance, power tier, twelve proposed attributes and twelve written rationales, source URLs where located, continuity caveats.
- `MCU_PROFILES_BATCH_01.json` through `MCU_PROFILES_BATCH_05.json` — smaller editable source files for all 143, retained for iterative revisions.
- `MCU_RATING_MODEL.md` — shared methodology for this and all future talent pools.
- `validate_mcu_profiles.mjs` — structural validation: run `node research/validate_mcu_profiles.mjs` from repository root.

## Completed structural QA
- Exactly **143 characters** in research files, **143 distinct names**.
- All names match existing MCU pool, no duplicates or missing characters.
- Each profile has all **12 scores** between 1 and 99.
- Full-power rule included: standard controllable magic, telekinesis, flight, portals, suit technology and shapeshifting allowed.
- A **provisional** rating differs from existing game data for **52 characters / 223 attribute cells**. The other 91 character score rows currently match the baseline, even though their narrative profiles are new.
- **0 individual screen-scene claims formally signed off.** This is the remaining substantial QA task, as opposed to source titles being listed.

## Source policy
A named film or series is a **primary work citation**, but without episode/timecode and external scene confirmation, a written feat remains unverified. Official Marvel overview pages anchor character/cast context but usually don't independently substantiate exact combat outcome. Comics support context only, not automatic MCU powers.

Useful independently located source entry points:
- [Avengers: Endgame](https://www.marvel.com/movies/avengers-untitled)
- [Doctor Strange in the Multiverse of Madness](https://www.marvel.com/movies/doctor-strange-in-the-multiverse-of-madness)
- [Guardians of the Galaxy Vol. 3](https://www.marvel.com/movies/guardians-of-the-galaxy-volume-3/)
- [Thunderbolts*](https://www.marvel.com/movies/thunderbolts)
- [The Fantastic Four: First Steps](https://www.marvel.com/movies/the-fantastic-four-first-steps)
- [Marvel Television index](https://www.marvel.com/tv-shows)
- [Sentry / Void comics reading list](https://www.marvel.com/comics/guides/2463/sentry/)
- [Fantastic Four enemies, comics (Doom/Mole Man/Galactus)](https://www.marvel.com/comics/guides/2514/fantastic-four-s-first-major-villains)
- [Official Silver Surfer comics guide](https://www.marvel.com/articles/comics/who-is-silver-surfer-the-official-marvel-guide)

These URLs are **general references**; do not present them as proof of an unsourced scene description.

## Priority continuity concerns
- **Doctor Doom:** 2025 First Steps mid-credits tease does not establish physical combat or mystical feats; current numerical values are a comics-derived **hypothesis**. MCU verified rating unavailable.
- **Franklin Richards:** Film shows involuntary infant healing/resurrection; do not use adult comics Franklin as a fully coordinated athlete.
- **Silver Surfer:** First Steps features **Shalla-Bal**; classic Marvel comics Surfer is principally **Norrin Radd**. Never combine their biographies without labeling the variant.
- **Jean Grey, Wolverine, Professor X, Cassandra Nova, Elektra:** distinguish the Fox legacy and multiverse incarnations from core MCU appearances. Fox Jean profile is a speculative transferable record, not established main-MCU Jean.
- **Captain Carter:** What If animated variant and Earth-838 Illuminati Captain Carter must remain separate in win/loss analysis.
- **Loki:** timeline-restructuring finale power is not the repeatable normal Loki combat loadout unless the game selects that specific end-state.
- **Thanos:** Infinity Gauntlet and Infinity Stones are special equipment/variants, not default barehanded Thanos capabilities.
- **Hercules and H.E.R.B.I.E.:** limited direct fighting evidence; confidence should be low.
- **Phil Coulson:** resurrection / Agents of SHIELD continuity requires an explicit decision before importing series feats.
- **Echo:** MCU spiritual powers should not be confused with comics' photographic reflex ability, despite the current game's descriptor.

## Next evidence gate before live game update
For each character, attach actual film/episode references to each feat, with actor/victim, result, solo vs team assistance, equipment, conditions, repeatability, and independent confirmation. Add explicit direct win/loss graph edges and counterexamples. Re-score attributes from those verified feats. Compare all characters and test position effects. Then patch MCU arrays in `index.html` on a separate PR. The current PR does **not** modify live ratings.

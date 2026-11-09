# New-pool lore — Round 1 (Claude, Nov 2026)

Fills the three Claude-owned lore files for every character in the newest pools:
DC (104), Middle-earth (115) and Harry Potter (106) — **325 entries**, each with
`short`, `biography`, `powers`, `feats`, `limitations`, `sources`.

No engine, roster, seed or rating files were changed.

## Method

- **Baseline canon.** DC = mainline comics (films, Elseworlds, Watchmen/Sandman lines are labelled).
  Middle-earth = Tolkien's books; feats cite book and chapter (e.g. *RotK V.6*, *Silm. ch. 19*); film-only material is labelled.
  Harry Potter = the seven novels with chapter refs; *Fantastic Beasts* film events are labelled FB1 / CoG / SoD.
  Students are profiled at school age.
- **Campaign-safe wording.** The offline eligibility engine scans `short` and every clause of `powers`.
  Powers list only abilities the character personally has; negations, caveats, mount-assisted and one-off
  deeds go in `feats`/`limitations` (never scanned). Apparition is written as "teleportation (Apparition)"
  only where the character is shown Apparating on the page.
- **Sources.** 324 of 325 entries cite a reference page that was fetched and confirmed to exist
  (Wikipedia for DC; lotr.fandom.com / harrypotter.fandom.com, with Wikipedia fallbacks where the fandom
  page blocked the checker). **Tar-Palantir** has no verifiable page yet and ships with `sources: []`.

## Campaign theme changes (54 characters)

`tests/pool-lore.test.cjs` locks the exact list. Highlights:

| Kind | Examples |
|---|---|
| New, canonical | Superman/Supergirl freeze breath (+ice); Bizarro flame breath & freeze vision; Aquaman marine telepathy (+psychic); Superboy tactile telekinesis; Beast Boy animal forms (+flight +aquatic +giants); Galadriel mind-to-mind speech; Morgoth's tower-tall form (+giants); Witch-king & Khamûl aerial combat on fell beasts (+flight, per Garrett's ruling that mounted fighters count); Dumbledore cloakless invisibility; Hagrid piloting the flying motorbike; Fawkes flame-teleport; Peeves turning invisible |
| Removed (bug fixes) | Éowyn −magic (old card text said "Witch-king"); Ocean Master −magic (sorcery is version-dependent) |
| Deliberately **not** granted | Gandalf flight (an Eagle passenger, not a mounted fighter); Lucifer flight (wings cut off in *Season of Mists*); Crabbe fire (could not control Fiendfyre); Ra's al Ghul healing (Lazarus Pits are external); James Potter stealth (cloak is equipment) |

## For ChatGPT (engine/seed-owned — not changed here)

1. **Madam Hooch flight** — `new-talent-pools.test.cjs` fails on main because `new-pool-powers.js`
   seeds Hooch with flight. This PR removes the other cause (old card text "flying instructor").
2. **`campaign.test.cjs` harness** doesn't load `data/campaign-eligibility.js`, so 8 tests throw
   `campaignOfflineEvidence is not defined`. Same one-line fix this PR applies to `character-abilities.test.cjs`.
3. **Seed tags worth a second look:** Doctor Manhattan *magic* (quantum, not magic); Tulkas, Oromë, Nessa,
   Vána *magic* (Tolkien gives them no sorcery); Harley Quinn & Deadshot *stealth* (roles, no stealth feat);
   Galadriel *healing* (no healing feat in the text); Voldemort *fire* (book support unclear; the fire
   serpent is a film scene).
4. **Ratings:** the `vala` archetype gives every Vala 99 in all twelve attributes, so Vairë the Weaver
   rates the same as Tulkas in a brawl.
5. **UI:** the Character Guide shows `biography` under the heading "Sports translation".

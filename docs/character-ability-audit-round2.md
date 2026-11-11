# Character ability audit — round 2 (review response for PR #45)

Responds to the 2026-11-09 review of PR #45. Owner: Claude (character data, evidence, tests).
No engine file changed (`data/campaign.js`, `data/campaign-eligibility.js`, `index.html` untouched).

## 1. Disputed grants corrected

`CHARACTER_ABILITY_DISPUTES` now holds **32 `incorrect` grants** (15 → 32). They are excluded from
the reviewed index and have no provenance, and under the PR #44 tag criteria every one is rejected. New this round:

- **Older pools:** Snorlax giants (Pokédex height 2.1 m / 6 ft 11 in, under the ~8 ft ruling).
- **DC:** Firestorm, Captain Atom and Amanda Waller tech; Harley Quinn, Deadshot and Ra's al Ghul stealth
  (role-only); Ocean Master magic (version-dependent); Doctor Manhattan magic (quantum, not magic).
- **Middle-earth:** Galadriel healing; Tulkas, Oromë, Nessa, Tilion and Arien magic.
- **Harry Potter:** Norbert flight and giants (the baseline is a hatchling).

Vision psychic, Éowyn magic and the other round-1 disputes are unchanged and now have explicit
regression tests under the #44 criteria (`tests/character-ability-index.test.cjs` → "every incorrect
dispute is rejected under the PR #44 tag criteria").

## 2. The 328 provisional DC / Middle-earth / Harry Potter grants

Every one was re-audited against my PR #46 lore research (book chapters, issue numbers, verified reference pages):

| Outcome | Grants |
| --- | ---: |
| Kept, now backed by a source-linked record | 273 |
| Removed: disputed as `incorrect` (no canonical support) | 16 |
| Removed: moved to the research queue (plausible, no specific scene yet) | 39 |
| Added: evidenced grants the seed list missed (e.g. Superman freeze breath, Witch-king's fell beast, Hagrid's motorbike, Dumbledore's cloakless invisibility) | 62 |
| **New-pool grants now in the index** | **335, all with source-linked records** |

**Remaining unsupported, identified explicitly:**

- **Research queue (not granted):** 39 new-pool items, for example:
  - Bat-family stealth (Nightwing, Damian, Tim, Red Hood, Barbara, Batwoman, Cassandra, Huntress, Talia, Deathstroke)
  - Ent/Balrog/Carcharoth giants with no documented size
  - adult-wizard Apparition with no on-page scene (McGonagall, Sirius, Lupin, Bellatrix, Kingsley, Moody, Tonks, Winky)
  - Dumbledore Legilimency and healing
  - Voldemort fire (a film scene)
  - Swamp Thing, Death of the Endless and Obscurus magic (these need an owner ruling)
- **Role-based records:** 8 Harry Potter `magic` grants (Fudge, Scrimgeour, Thicknesse, Karkaroff,
  Pansy, Goyle, Hooch, Madame Maxime) are witches and wizards by canon but have no specific spell scene. They are labelled
  `kind: "role-based"` and counted separately in the coverage report.
- **Tar-Palantir** has no verifiable reference page and no tags.

## 3. Specific ability tags

- **Families.** `CHARACTER_ABILITY_TAG_FAMILIES` defines the 33 specific tags agreed in PR #44.
- **Index format.** The index now writes each broad tag followed by its specific tags, for example
  `Superman: ["flight","natural-flight","ice","ice-control","healing","self-regeneration"]`.
- **Contract (tested):**
  - Every broad tag a character holds has at least one specific tag from its own family.
  - Every specific tag implies its broad tag.
  - The families equal #44's `acceptedTags` exactly.
  - No tag can qualify another theme; for example, freeze breath can never prove fire.
- **Classification:**
  - Specific tags come from each record's explicit `tags`, or from its `kind` and feat text.
  - Classification rules live in `tools/ability-tag-families.cjs`.
  - About 50 reviewed overrides were added after a manual pass over all 582 older records (e.g. Lapras telepathy, Geralt's Axii as mind control, Plankton as inventor, not robot).
- **Totals:** 1,179 broad and 1,284 specific tag assignments.
- **`kind` metadata** stays on every evidence record. `characterAbilityProvenance(c, tag)` exposes it to the engine and UI.

## 4. Coordination with PR #44: eligibility comes from reviewed tags only

- **Index generation.**
  - `tools/ability-audit.cjs --write-index` now builds the index **only from explicit records**: source-linked
    evidence plus `CHARACTER_ABILITY_CARRYOVER`, minus disputes.
  - It no longer runs the Campaign engine, the `CAMPAIGN_TAGS` name lists or description/guide keyword matching.
  - A test runs the generator with every description blanked and the engine disabled, and gets an identical index.
- **Carry-overs.**
  - The 263 older-pool grants that had no evidence record (from name lists, guides, descriptions, Pokémon typing
    and the curated aerial list) are now explicit, reviewed `CHARACTER_ABILITY_CARRYOVER` records with their origin and basis.
  - They reproduce the previous index exactly; the only change is Snorlax.
  - `characterAbilityProvenance()` reports them as `carry-over`, so the UI can tell them apart from source-linked evidence.
  - They are the next candidates for sourced records.
- **Engine check.** With #44 merged locally, `data/campaign.js` contains no reference to `CAMPAIGN_TAGS`,
  keyword/description evidence or the seed power lists. Themed eligibility reads `characterAbilityTags()` only.
  The existing test "tag-criteria engine grants exactly the reviewed index" passes for all 1,173 characters × 12 themes.
- **Regeneration under #44.** Running `--write-index` there gives a byte-identical index.
- **Two other sources remain by design** (they are not character tags):
  - curated Commander specialties;
  - locally stored, approved player appeals (`KnowledgeEngine.has`).

  An approved appeal saved before this audit could still re-admit a disputed grant (e.g. Vision psychic).
  Suggestion for #44: ignore appeals that match an `incorrect` dispute.
- **Trait challenges** (women, red, kids, non-powered) still use the legacy name lists. Moving them to tags is a separate step.

## 5. Test results

Commands (Node 22.23; no network):

```
node --test tests/*.test.cjs
node --test tests/browser-smoke.cjs
node tests/battle-royale-tank-regression.mjs && node tests/dealt-hand-regression.mjs
```

| Run | Result |
| --- | --- |
| This branch alone (legacy engine) | **140 pass, 0 fail** (138 node:test + 2 .mjs scripts) |
| This branch with `feat/campaign-tag-criteria-engine` (#44) merged locally | **140 pass, 0 fail** |
| `node tools/ability-audit.cjs --write-index` under #44 | identical index |

The `character-ability-index` suite covers:

- Pokémon rules: Fly gives flight, Surf gives aquatic, and Rest is never healing.
- Owner rulings: giants ≈8 ft, stealth needs a feat, armor counts as tech, a glide counts, pilots and aerial mounts count.
- Commander exceptions: Ackbar, D'Antoni, Gandalf and Madam Hooch as commanders.
- Every incorrect dispute, and the new-pool corrections.

The Campaign, new-pool and Skyborne suites cover the Commander-only exceptions.

## 6. Unresolved

1. **Factual spot-check of sources.**
   - All new-pool source URLs were opened and confirmed to exist during the PR #46 research.
   - This round I started a manual check that the page content supports specific high-impact claims. The pages
     were Snorlax's height, Dodrio's Fly, Hagrid's height, Treebeard's height, Beorn's giant size, the Witch-king's
     fell beast, Superman's freeze breath, Madame Maxime's height, Doctor Manhattan's size and teleporting, and
     the Vision article.
   - The fetches needed approval that was not available, so that sample is **not done yet**.
   - Feats cite the books and issues directly; fan-wiki pages are used as reference links, not as the authority.
2. **Owner rulings needed:**
   - Swamp Thing, Death of the Endless and Obscurus for Arcane Assembly.
   - Whether Valar and Maiar "powers" count as magic. They are currently granted as spellcaster, with a limitation note, where a supernatural working is documented.
3. **Carry-overs:** 263 older-pool grants still lack per-feat sources.
4. **Merge order with PR #46.** PR #46 (lore files) also touches `tests/character-abilities.test.cjs`. If #45 merges first, #46 needs a trivial rebase.

## Round 3 (2026-11-10): disputed areas — DC stealth, then flight and giants

Owner chose to source the disputed areas first. Round 3 resolves the 17 research-queue items Round 2 removed
"pending a specific scene". Every cited page was opened and the feat confirmed on it. Records are in
`CHARACTER_ABILITY_RECORDS_ROUND3` (`audit: "2026-11-r3"`).

**Granted (10)** (Trigon flight was granted in the first push and went back to the queue after review; the last
three rows and the Durin's Bane scope come from the owner's 2026-11-11 rulings)

| Character | Tag | Scene | Mode | Continuity |
|---|---|---|---|---|
| Nightwing | stealth | Undercover in Spyral as Agent 37, reporting to Batman in secret (Grayson #1–4) | undercover | DC comics (New 52) |
| Red Hood | stealth | Hides at Duela Dent's funeral until the Titans leave (Countdown #43, "The Funeral"); breaks into Titans Tower (Teen Titans v3 #29) | undetected | DC comics |
| Batwoman | stealth | Inside Arkham Tower as psychiatrist "Dr. Lisa Frow" ("Shadows of the Bat") | undercover | DC comics |
| Cassandra Cain | stealth | Infiltrates a hired-killers tournament and frees Red Robin (Red Robin #25) | unspecified | DC comics |
| Huntress | stealth | Undercover in Arkham Tower as a patient (Detective Comics #1049) | undercover | DC comics |
| Talia al Ghul | stealth | On the Wayne Enterprises board as Miranda Tate (The Dark Knight Rises) | undercover | Nolan films only |
| Durin's Bane | giants | At least 20 ft tall on the Bridge of Khazad-dûm | | All continuities (owner ruling) |
| Batgirl (Barbara Gordon) | stealth | Hacks into, then breaks into, JSA headquarters; Wildcat catches her (Batgirl: Year One) | discovered | DC comics |
| Hermione Granger | flight (mount) | Rides her own Thestral to London (OotP ch. 33) | | Harry Potter novels |
| Gothmog | giants | Species-level Balrog size, "double his stature" against an Elf (Lost Tales) | | Tolkien legendarium |

**Still queued (7), notes updated:** Robin (Damian) and Red Robin stealth (candidate scenes, no page naming
the issue); Deathstroke stealth (only group ambushes or Terra's infiltration); Darkseid flight (infobox only);
Trigon flight (power summary only, no issue); Quickbeam and Carcharoth giants (no size).
A test names all seven, so a regenerated index cannot quietly regrant one.

### PR #56 review follow-up (2026-11-10)

- **Trigon flight:** no issue, story or episode was found where he flies; Wikipedia lists flight only in a
  power summary. Back in the research queue and out of the tag index.
- **Durin's Bane:** the record carries `continuityScope: "film-only"` and a `conflict` note (film 20 ft, book
  gives no size), so the PR #57 source audit will rate it `investigate`. A test checks the limit survives
  `characterAbilityProvenance` and does not widen to Tolkien's books.
- **Stealth:** every record now has a `scene` and a `stealthMode`. Only Red Hood has a scene of staying
  unseen; Nightwing, Batwoman, Huntress and Talia hold undercover identities; Cassandra's method is not
  stated. Sources stay as they were (Wikipedia, DCU Guide, a fan wiki): under the owner's 2026-11-10 standard
  they are credible when the claim is specific. Issue-number disagreements are recorded in `citationNote`
  (Batwoman: Urban Legends #8–9 vs Detective Comics #1048; Red Hood's funeral: Countdown #43 vs #51).
- Undercover identities count today by precedent (Nakia, Sharon Carter and Cassian Andor hold stealth for
  undercover work), so no grant changed. Whether undercover-only feats should count for Ghost Protocol is
  listed below for the owner.

**Owner rulings, 2026-11-11 (Garrett).** These answer the questions this review raised. Each affected record
carries `ruling` and `verification: "owner-ruling"`, and a test pins them.
A ruling is a policy decision about what counts for a tag, not independent canonical proof. Each record keeps
its cited scene and source, and `verification: "owner-ruling"` keeps the two apart: the PR #57 audit rates these
records `owner-ruling`, never as source-confirmed or corroborated.
- **Undercover identities count for Ghost Protocol** (Nightwing, Batwoman, Huntress, Talia). No grant changed.
  `stealthMode` stays as descriptive metadata.
- **Durin's Bane is a giant in every continuity.** The film-only scope (`continuityScope`) and the `conflict` note
  are removed. The book/film size difference is kept in `citationNote` for transparency. Because the owner has
  ruled, the PR #57 audit rates it `owner-ruling`, not `investigate`. Nothing is left for the engine to enforce.
- **A discovered break-in counts:** Batgirl (Barbara Gordon) gains stealth.
- **Solo riders of a flying mount count:** Hermione gains flight as a `mount`, not as a flyer of her own.
- **A species-level Balrog size counts for a named Balrog:** Gothmog gains giants.

The earlier "Gameplay limitations" note (film-only and undercover metadata not enforced) is superseded by these
rulings and was removed.

### Merge sequence (#55, then #56, then #57)

A local simulation of that order (2026-11-10, not pushed):
- **#56 after #55:** conflicts in `data/character-abilities.js` and the generated `docs/character-ability-coverage.md`.
  Both PRs add a record block before `CHARACTER_ABILITIES` and append it to the same merge list. To resolve, keep
  both blocks, list `CHARACTER_ABILITY_RECORDS_DISNEY, CHARACTER_ABILITY_RECORDS_ROUND3`, then run
  `node tools/ability-audit.cjs --report`. `--write-index` produces no further change.
- **#57 on top:** merges cleanly. Three follow-ups are needed before its checks pass:
  1. Classify `dcuguide.com` (DCU Guide, a fan-run chronology database) as `community`.
  2. Update `PINNED_INDEX_DIGEST` to the post-#56 index. That is a deliberate grant change from Round 3 and the
     2026-11-11 rulings.
  3. Run `node tools/ability-source-audit.cjs --write`.

  In the 2026-11-10 simulation (before the 2026-11-11 rulings), those three fixes made 213/213 tests pass, made
  `--check` clean and let the browser smoke test pass. The digest value changes again with the new grants.

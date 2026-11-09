# Handoff to ChatGPT: character ability audit and tag-based eligibility

Claude owns character knowledge: `data/character-abilities.js`, evidence records, research docs and regression
tests. ChatGPT owns the Campaign engine, UI, drafting mechanics and integration.

## What this branch changes (`claude/character-ability-audit`)

- **Tag index.** `CHARACTER_ABILITY_TAGS` holds a reviewed tag list for every roster character in all ten pools.
  - Use `characterAbilityTags(candidate)` to read it.
  - `[]` means audited, with no qualifying power. `null` means the character is not on the roster.
- **Evidence.** 554 new source-linked records for 303 characters. Each record holds:
  - tag, kind, feat and source URL
  - continuity
  - a limitation for power-ups, devices, vehicles or forms

  They already work through `characterAbilityEvidence()`.
- **`CHARACTER_ABILITY_DISPUTES`.** 15 grants the engine accepts today, all with verdict `incorrect`.
- **`CHARACTER_ABILITY_RESEARCH_QUEUE`.** 38 plausible powers that are deliberately not granted.
- **Tooling.** `node tools/ability-audit.cjs --write-index --report` regenerates the index and
  `docs/character-ability-coverage.md`.
- **Tests.** `node --test tests/*.test.cjs` gives 127 pass, 0 fail, both on this branch alone and with PR #44
  merged on top (see "PR #44 validation" below). The old Madam Hooch failure is fixed on the test side: under the
  Skyborne ruling a broom flyer qualifies personally.
- **Test harness repairs.**
  - `tests/campaign.test.cjs` and `tests/character-abilities.test.cjs` now load `campaign-eligibility.js` and
    MuppetForce.
  - The strategic-commander catalog test now reads the PR #42 pools.
- **Doduo/Dodrio assertions.** `tests/campaign-offline-eligibility.test.cjs` now expects Doduo and Dodrio to fly,
  per the owner's Fly ruling.
- **Not touched:** `data/campaign.js`, `data/campaign-eligibility.js`, `index.html`, or any PR #42 pool or power file.

## Engine changes requested (tag-based eligibility)

See `docs/tag-based-eligibility-plan.md`.

1. In `campaignAllowed`, replace the themed default branch with a tag check: does
   `characterAbilityTags(c)` include one of the challenge's accepted tags? Keep approved appeals
   (`KnowledgeEngine.has`) as an extra source.
2. Retire the `CAMPAIGN_TAGS` name lists and the description/guide keyword matching for eligibility.
   - 60 of those names are not on the roster.
   - Name-only matching caused alias misses: "Iroh", "Squidward Tentacles", "Palpatine" and "Fire Mario".
3. Define each challenge's accepted tags, stat conditions and slot rules as data.
4. **Stopgap until step 1 is done:** add this guard at the top of the `default:` branch so the 14 `incorrect`
   grants stop being accepted.
   ```js
   if (typeof CHARACTER_ABILITY_DISPUTES !== 'undefined' &&
       CHARACTER_ABILITY_DISPUTES.some(d => d.verdict === 'incorrect' && d.id === c.pool + ':' + c.n && d.tag === rule)) return false;
   ```
   The 14 grants are:
   - The Thing → giants
   - Donkey Kong → giants
   - Vision → psychic
   - Popeye → healing
   - Stealth: Hawkeye, Gamora, Valentina, Bullseye, Master Splinter, Scorpion, Widowmaker, Mr. Mime, IG-88, Garfield
5. Stop treating role words (ninja, assassin, spy, agent, operative) as proof of stealth.

## Owner rulings (applied at the tag layer, never inside a challenge)

- Giant means about 8 ft or taller, with a documented size.
- A documented glide counts for Skyborne. Only pilots and flyers count; gunners do not (Finn and Chopper are out).
- Stealth needs a documented stealth or invisibility feat; a role or title is not enough.
- Advanced or powered armor counts as tech (Iron Man, War Machine); standard-issue armor does not.
- Mandalorian wrist flamethrowers count as fire.
- Pokémon: any move a Pokémon can learn in Gen I counts, including TM/HM moves. The move map is in
  `docs/character-ability-audit.md`.
  - Rest is not healing.
  - Doduo and Dodrio fly via Fly.
- Commander Shepard counts as psychic.
- Tracer counts as healing (Recall) and keeps teleport (Blink).
- Vision does not count as psychic.
- Echo counts as healing.
- Magneton keeps flight (hovers like its linked Magnemite).

## PR #44 validation (tag-criteria engine)

Tested by merging `feat/campaign-tag-criteria-engine` onto this branch locally: **127 pass, 0 fail**, and
`tests/browser-smoke.cjs` passes. `tools/ability-audit.cjs --write-index` regenerates an identical index under
the new engine.

**Test harnesses work with both engines.** They detect `CAMPAIGN_TAGS`; when it is absent they read theme rules
from `CAMPAIGN_EXTRA[].criteria.acceptedTags` and pass `characterAbilityTags` into the sandbox. Under the tag
engine the audit tool treats the index as authoritative: keyword and description layers no longer feed it,
and every `incorrect` dispute must be rejected. Merge order no longer matters for tests.

### Conditions from #44

1. **Elemental specificity: met.** The index emits only the 12 broad tags, so `fire`, `ice` and `electric` are
   already element-specific; there is no `element-control` tag. A new contract test asserts each theme accepts
   only its own broad tag and no other element's sub-tags, so an ice feat can never prove fire.
2. **Pilot, mount and size-change: met at the broad-tag level.** No fine-grained tags are emitted yet. When they
   are, they will follow your definitions: `pilot` excludes gunners, `mount` means an aerial mount, and
   `size-change` must reach giant size. Tests cover this today with broad tags. Finn and Chopper are rejected as
   gunners. Éomer, Théoden and Gandalf get no flight as ground riders or passengers. Wasp, Janet, Hank Pym and
   The Atom are rejected as shrink-only. Ant-Man, Bill Foster, Giganta and Beorn qualify for giants.
3. **New pools: indexed but not evidence-audited.** Every DC, Middle-earth and Harry Potter character is listed,
   but none of their tags is backed by a Claude evidence record yet:

   | Pool | Tag grants | Sourced Claude evidence | Legacy name list | Seeded / guide / description |
   |---|---:|---:|---:|---:|
   | mcu | 151 | 58 | 43 | 50 |
   | toons | 63 | 37 | 8 | 18 |
   | muppets | 19 | 17 | 0 | 2 |
   | games | 182 | 157 | 16 | 9 |
   | pokemon | 325 | 222 | 33 | 70 |
   | starwars | 106 | 82 | 4 | 20 |
   | dc | 116 | 0 | 12 | 104 |
   | lotr | 70 | 0 | 1 | 69 |
   | harrypotter | 142 | 0 | 2 | 140 |

   Spot checks so far:
   - Éowyn **magic** is disputed: it came from the keyword "Witch" in "Witch-king".
   - The Witch-king's fell-beast flight is queued as a missed grant.
   - The DC stealth seed list (Harley Quinn, Deadshot, Red Hood, Deathstroke, Robin, …) is role-based. Under the
     stealth ruling it needs sourced feats.

4. **Legacy trait challenges.** Women, red, kids and non-powered still read `CAMPAIGN_WOMEN`, `CAMPAIGN_RED`,
   `CAMPAIGN_KIDS`, `CAMPAIGN_MORTAL` and the new-pool traits. Moving them to reviewed tags is a separate
   Claude data step and is not part of this branch.

### Integration order
1. Merge this branch (#45). It is green on main's current engine.
2. Validate #44 against main; the test suite needs no further changes.
3. Merge #44.

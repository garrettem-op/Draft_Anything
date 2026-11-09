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
- **`CHARACTER_ABILITY_DISPUTES`.** 15 grants the engine accepts today. 14 have verdict `incorrect`; 1 is a `ruling`.
- **`CHARACTER_ABILITY_RESEARCH_QUEUE`.** 37 plausible powers that are deliberately not granted.
- **Tooling.** `node tools/ability-audit.cjs --write-index --report` regenerates the index and
  `docs/character-ability-coverage.md`.
- **Tests.** `node --test tests/*.test.cjs` gives 122 pass and 1 fail. The failure is
  `new-talent-pools.test.cjs › Commanders may qualify…` and fails the same way on main.
  `data/new-pool-powers.js` lists Madam Hooch under flight, but the test says teaching broom flying must not grant
  personal flight. One of the two needs to change.
  - Under the owner's Skyborne ruling (pilots and flyers count), a broom rider who actually flies qualifies. The
    test is probably the side to change.
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

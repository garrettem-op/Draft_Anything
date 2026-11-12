# Draft Anything — whole-roster audit protocol

## Governing character intelligence principle (Option C)

> **Character abilities are canonically grounded. Sporting applications are rules-constrained. Ratings are derived from the resulting competitive advantages, not used as substitutes for them.**

The full policy is [Option C — character-intelligence governing rule](OPTION_C_CHARACTER_INTELLIGENCE.md). Universal numeric athletic attributes and weighted sports positions remain in use, but researched character/form powers must be evaluated for legal sporting use and competitive effects. This is a cross-mode design requirement, **not** a declaration that Phase 1 research is complete, Phase 2 is unblocked, or gameplay has already been migrated.

## Order of operations (mandatory)

**Phase 1: Campaign eligibility tags** → **Phase 2: Combatant power scaling** → **Phase 3: Gauntlet**.

Do not declare Phase 1 complete because every roster character appears in an index. A complete
index is *coverage*, not the same as a character-by-character affirmative **and negative** research review.

### Phase 1: derive tags from the live Campaign challenge definitions

Run `node tools/full-campaign-tag-audit.cjs --write` to produce
`docs/campaign-tag-audit-ledger.json`. This combines the actual 34 challenges,
the actual roster in all loaded talent pools, the existing power audit, and existing
identity/appearance evidence. It lists every alternate form from the live variant catalog.

Every Campaign requirement belongs to exactly one class:

- **Individual descriptive tags:** women (female character), red (distinctive red design), kids
  (child/teen in selected continuity), mortal (no supernatural power or superhuman body);
  12 broad power tags and their existing specific ability tags.
- **Numeric eligibility, not lore tags:** Speed >= 90, Game IQ >= 87, Strength >= 87,
  average stats <= 73, IQ >= 85 with Strength <= 85, MuppetForce >= 65.
  Compute these from the selected character/form and relevant authoritative attribute.
- **Universe affiliation, not lore tags:** source-pool filters.
- **Team or match rules, not lore tags:** shortened roster, unused-character finale,
  3-pool minimum, two separate final opponents. Do NOT tag an individual character
  as `short-handed` or `final`.

All 12 broad ability families already have detailed sub-tags in
`data/character-abilities.js` and `tools/ability-tag-families.cjs`.
Do not fork a second contradictory tag catalog.

### Review every character and EVERY form

For each `pool:character` and each documented `pool:character|form`, answer all 16
qualitative questions (four traits + twelve power families). Answer from
individual character research: in-universe descriptions, depictions, feats,
publisher profiles, reputable community summaries, or qualified expert ruling.
No particular source type is mandatory; **record what observation led to the decision**.

Per tag:
- `yes` + concrete supporting reason and appropriate continuity;
- `no` + concrete reason or reviewed absence in the canonical profile;
- `needs-review` while ambiguous, disputed or not actually assessed.

Never convert **lack of evidence** to a researched `no`. Correctly handle
different ages/identities, equipment-only abilities, temporary transformations,
alternating universes and mutually inconsistent continuities. A variant may gain
or lose an ability or an identity tag; it is not a copy of its base character.

Legacy sources are an initial shortlist only. `characterAbilityTags()` provides
current accepted grants but does not supply negative research justifications.
Where existing evidence contradicts the engine, write a specific regression,
update the approved grant/denial and preserve the decision in the ledger.

**Acceptance gate:** Every roster character and form has a decision for every
applicable qualitative tag, all unresolved cases are explicitly adjudicated,
current Campaign outcomes match the ledger, and no tag is granted because its
name merely resembles a character or because numerical stats are high. Only
then begin Phase 2.

### Phase 2: combat scaling (after Phase 1)

Review base characters AND variants independently for offense, defense,
speed, battle IQ, agility, special powers, durability, type counters, standard
equipment, weaknesses, transformations and continuity. Record canonical feats
and limits separately from **editorial gameplay numbers**. Ensure that high-tier
magic, cosmic and reality powers have typed abilities, not physical-attribute
placeholders. Audit flagship/Apex powers with bounded modelled counters, no
automatic victory. Compare 100+ controlled seeds for important matchups and
test all domains, including ToonForce/MuppetForce. Link combat profiles back
to audited identities and ability tags. Do not fake canonically exact DMG.

### Phase 3: Gauntlet (after Phase 2)

A spectator-mode head-to-head: the player chooses **one shared talent pool**
or **distinct pool A and pool B**. Randomly deal one character from each
selected pool and ask the player to pick A or B. Reveal the poll outcome and
advance to the next pair. Avoid displaying pre-combat ratings before a vote.

Store each submission with stable `pool:character` IDs and optional selected
form IDs; retain vote choice, pool pair, randomized assignment, matchup ID,
timestamp, model version, and pseudonymous session ID, without personal data.
Protect from repeat votes and bot flooding. Sample both left/right orders.
Provide data export plus deduplicated aggregate statistics and confidence
intervals. Distinguish user preferences from canonical feat evidence; Gauntlet
is a calibration signal, **not automatically training truth**.

**Security:** Never embed a GitHub write token in a public browser. Store live
submissions on an authenticated server/backend with rate limiting and export
approved, privacy-reviewed aggregates as versioned JSON/CSV into the repository
using server-side GitHub credentials. Repository history is not suitable as
the direct database for every public vote.

### Collaboration and review ownership

ChatGPT currently owns Phase 1 individual character/variant research, evidence,
negative decisions, Campaign engine, integration and regression testing. Claude
can optionally resume independent research later, but completion does not rely
on Claude usage or availability.
Batch changes by talent pool; don't make a separate PR for each character.
New roster additions and new Campaign challenges must automatically fail
coverage checks until included in the research ledger.

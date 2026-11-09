# New Talent Pool Editing and Research

## Ownership

ChatGPT owns the game wiring, 12-attribute balance, ID stability, source pool rows, Campaign classifications, and shared frontend:

- index.html
- data/new-pool-core.js
- data/pools-dc.js
- data/pools-middle-earth.js
- data/pools-harry-potter.js
- data/new-pool-traits.js
- data/new-pool-powers.js
- data/campaign-eligibility.js
- data/campaign.js
- tests/new-talent-pools.test.cjs

Claude owns detailed researched prose and citations, in **three separate files**:

- data/pool-lore-dc.js
- data/pool-lore-middle-earth.js
- data/pool-lore-harry-potter.js

Create a branch from current main. Edit those three lore files and add evidence-only tests/docs as needed. Do not modify the game engine or base pool files unless an explicit GitHub issue says to.

## Lore schema

Each file must define its universe map. For example:

~~~javascript
window.DA_POOL_LORE=window.DA_POOL_LORE||{};
window.DA_POOL_LORE.dc={
  'Superman':{
    short:'Kryptonian guardian whose flight, strength, and compassion protect Earth',
    biography:'Original, concise 2–4 sentence character portrait.',
    powers:['Flight','Heat vision','Superhuman strength'],
    feats:['A short, specific, independently verifiable canonical feat'],
    limitations:['Kryptonite and red-sun radiation can diminish his abilities'],
    sources:['https://www.dc.com/characters/superman']
  }
};
~~~

The key **must match the exact full in-game name** in the pool's entries. Do not rename records or create duplicate alternate forms. Keep short readable on mobile trading cards (prefer 55–95 characters); biography can add richer flavor. All prose must be original rather than copied from copyrighted sources.

The app reads short as the candidate's draft-card description and displays biography, powers, feats, limitations, and sources in the Character Guide. The free offline Campaign eligibility engine also reads supported powers statements when the character is not already classified by existing evidence. Thus power labels must be **canonical, character-appropriate and precise**, not speculative.

## Accuracy rules

- **DC:** Make clear what is generally established in the mainline comics versus films, Elseworlds or special forms. Do not silently conflate Barry Allen and Wally West.
- **Middle-earth:** Cover *The Hobbit*, *The Lord of the Rings*, the First and Second Ages including *The Silmarillion*, and divine Ainur. Separate written Tolkien lore from adaptations; Valar and Maiar are not ordinary combatants. Canonical variants such as Gandalf the White and Annatar belong to a variant system, not new duplicate identities.
- **Harry Potter:** Include Harry Potter and the wider Wizarding World/*Fantastic Beasts* continuity. Baseline school-age versions are not automatically entitled to adult-era feats. Nagini's Maledictus/serpent stages are one identity for future variants.
- Verify feats using official DC, Wizarding World and Tolkien Estate materials where possible, plus specific book or scene references. Do not invent scene citations or unverified official links.
- Identify uncertainties explicitly; omit dubious claims instead of granting unearned Campaign powers.
- Preserve scene-specific caveats and dependencies (uses a broom, wears armor, requires a ring).
- Keep canonical powers separate from feats achieved with one-off external help, equipment or crossovers.
- Avoid paid LLM research calls from the game or introducing new server-side secrets.
- Existing numerical ratings are provisional. Claude should note potential discrepancies in PR descriptions, not change them in lore-only PRs.

## Review and handoff

Open a PR for each franchise (or one PR covering only the three lore files). Include counts of enriched characters and missing credible sources, unresolved continuity disagreements and requests for ChatGPT-owned engine changes. Do not merge automatically. ChatGPT's hourly PR watch will inspect new PRs when GitHub is accessible.

## Acceptance criteria

A lore PR should have valid JavaScript, keys matching the live roster, original descriptive copy, accurate canon, real citation URLs, no alternate forms presented as baseline feats, no duplicate character identity, and zero gameplay/API regressions. Long names must remain readable on trading cards.

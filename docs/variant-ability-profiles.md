# Alternate-form ability profiles — Draft Anything

## Gameplay contract
Variant Surge is shared by Perfect Season, Dealt Hand, Campaign and Head-to-Head. The draft format determines who is available, but character mechanics use the same `variantRoster` and `gameRatings` pipeline.

Each **explicitly reviewed form** in `data/variant-abilities.js` supplies:
- an alternate signature move and its existing move type (replacing, **not stacking**, the base move);
- concrete offensive power domains and defensive resistances;
- combat weaknesses, continuity, and a limitation;
- an editorial power tier from 1–5, used in a **bounded**, explainable matchup adjustment.

Stat deltas and the existing bounded team rating bonus still apply once. Additionally, each activated form's domain-based matchup ability modifies effective team rating each match. A rival's reviewed form can resist that power or exploit an explicit vulnerability. The feature matters most for **Battle Royale**, where physical stats alone fail to express cosmic powers; normal sports apply less impact. There is **no random extra ability roll**, no auto-win and no OpenAI/API call. Existing saved Surge selections resolve the same way.

## Source and honesty rules
`data/campaign-variant-expansion.js` and `data/campaign-strategy.js` remain the source of original names, stat deltas and continuity. Ability definitions are keyed by **pool + original identity + exact form name**, so variants cannot accidentally borrow powers from an unrelated character with a similar name. Source links are inherited when recorded in the form catalog.

An existing variant lacking an audited power profile **continues to modify attributes only**. It retains its base signature until its abilities are reviewed. Do not generate powers from form name substrings or raw attribute numbers. This avoids inventing undocumented powers while research continues.

## Match transparency
Every match breakdown now has a `Variant ability · form-specific matchup` row and, when applicable, named move events with rating points, resistances and vulnerabilities. The Variant Surge panel shows the activated form's move, domains, defenses and limitations, or explicitly says the form is awaiting ability review.

## Collaboration
Claude continues to own base-character knowledge, evidence records and audits in `data/character-abilities.js`. This addition is deliberately isolated to `data/variant-abilities.js` and the shared simulation/UI. Further source-backed form profiles can be appended to the data catalog without changing match mechanics.

## Tests
`node --test tests/*.test.cjs` and `node tests/browser-smoke.cjs` cover cross-mode simulation, identity, signature replacement, noninvented unreviewed forms, matchup resistance, scoring and transparency.

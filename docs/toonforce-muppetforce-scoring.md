# ToonForce & MuppetForce: roster balancing (November 2026)

Both force systems operate **after the 12-attribute position-fit formula**. They are neither a thirteenth player stat nor a substitute for a required attribute, a canonical feat, or a campaign ability tag.

## Position fit

For a candidate in a particular sport/position:

1. Compute the existing role fit from speed, agility, strength, size, leaping, endurance, technique, accuracy, reflexes, game IQ, clutch, leadership; the weighted average / weakest-key-trait penalty / Tank formula remain unchanged.
2. Apply existing basketball expertise and signature exemptions as before.
3. Multiply the resulting fit by a **universe-scoped force multiplier**:
   - **MuppetForce:** for *every* one of the 101 official Muppet pool characters, a documented, character-specific score (0–99) weights puppet impact recovery, prop manipulation, stage improvisation, mayhem and ensemble interaction. The multiplier is `1 + maxLift * (0.55 * score/99 + 0.45 * weightedDimensions/99)`. `maxLift` is 0.36 in regulated sports and 0.52 in Battle Royale. Coaches and bench spots get no personal force multiplier.
   - **ToonForce:** only for 42 individually curated cartoon characters with established reality-defying slapstick. The multiplier is `1 + maxLift * score/99`, with `maxLift=0.26` in regulated sports and `0.42` in Battle Royale. Ordinary cartoon heroes like Aang are not granted ToonForce by mere animation or by a superpower they already possess.
   - Other talent pools are `×1.00`; different force types never stack on the same candidate.
4. For **baseball**, the batter-specific fit receives the same multiplier as fielding. AI predictions and player score calculations use the same helper functions. Traditional stats themselves are never mutated; a 50 center-fit Muppet with ×1.30 has **65 effective center fit**, not 65 strength or 65 size.

This is game-balance modeling, not an assertion of canonical numerical superhero power. Numbers and caps can be tuned against live match distributions.

## Team camaraderie — unique to MuppetForce

Muppets also contribute an additional **single capped team-rating boost**, even on mixed-universe squads.

- Every Muppet starter contributes its ensemble dimension / 99 to a shared cohesion pool. Muppet coaches contribute 60% and Muppet bench members 35% of this amount.
- With two or more filled roster positions, total team bonus percent is **min(8%, 2.8% × √cohesion)**.
- The bonus is applied **once** to the team rating **after** standard player-fit, coach, bench, existing team chemistry, signature and fight-variety adjustments. It raises the performance of the *whole team*, including non-Muppet partners.
- It never changes raw character attributes, grants eligibility for a themed challenge, or stacks a separate boost for every teammate. A one-character roster receives no camaraderie. Multiple Muppets have diminishing returns, capped at +8%.
- ToonForce applies only to the individual cartoon character and gives **no team-wide aura**. This differentiates solo cartoon physics from Muppet ensemble camaraderie.

## Coverage & display

- **101/101** Muppet roster entries now have individualized force ratings and stated limits. Some lower-scoring Muppets still fall short of the separate `MuppetForce ≥65` Campaign challenge threshold; having a force rating does **not** mean qualifying for every special challenge.
- **42/103** cartoon characters have curated ToonForce profiles. Other cartoons remain at ×1.00 until supported research warrants more.
- The Character Guide shows both force ratings and role multipliers. Championship/Dealt Hand, Campaign, and Head-to-Head results identify earned **MuppetForce camaraderie** points explicitly.
- The AI draft polishing function and final scoring functions use the same camaraderie formula; both forced character-level multipliers are used in AI position fit.

## Regression coverage

`tests/muppet-force.test.cjs`: roster exhaustiveness, rating bounds, per-position multipliers, no attribute mutation, crew diminishing returns and AI/game wiring.

`tests/toon-force.test.cjs`: curated-only cartoon powers, same multiplicative mechanism, no cross-pool leakage and no toon team aura.

`tests/browser-smoke.cjs`: live 101/101 profile coverage, role-fit arithmetic, AI/real scoring, ToonForce behavior and the team-wide bonus's reconciliation to simulated team rating.

Source-work descriptions are provisional interpretations, not official numerical power data; feats in fictional roles are not automatically inherited in other continuities.

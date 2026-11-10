# ToonForce and MuppetForce: game-balance specification (Nov 2026)

Both are **meta-abilities applied after** the 12 traditional character attributes and positional suitability. Neither changes Strength, Size, Speed, Game IQ, etc., nor proves eligibility for evidence-based Campaign challenges.

## ToonForce: individually powerful cartoon physics

ToonForce is the stronger individual force, particularly in Battle Royale. A curated character must have documented, recurring cartoon-physics behavior; simply being drawn or having conventional superpowers is insufficient. The 42 existing ToonForce characters are now assessed in six **separate editorial dimensions**:

1. **Rule of Funny (comedy)** — scene reversal and comedic initiative, not control of the author
2. **Gag resilience** — recovery after explosions, flattening or impossible falls, not universal immortality
3. **Body control** — elastic deformation, cartoon reshaping and impact avoidance
4. **Props/environment** — improbable props, environmental staging and sight-gag spatial manipulation
5. **Fourth-wall awareness** — interaction with the medium or audience (separate from control over reality)
6. **Sports translation** — actual or well-grounded sport-relevant performance (not automatically basketball skills for every cartoon)

The existing subjective 0–99 ToonForce score and per-character limitation remain in place. The new facet ratings are **original gameplay estimates** supported by the named source work in each profile, not canonical values.

### Individual multiplier

All 12 attributes are scored with their existing position weight/floor rules, then ToonForce adjusts the *resulting position fit*. ToonForce and MuppetForce cannot stack on one character.

- **Battle Royale:** `×[1 + 0.43×(score/99) + 0.22×(weighted combat facets/99)]`. Combat facets weight recovery, environment, Rule of Funny, body control and fourth-wall awareness. Maximum theoretical lift **×1.65**, well above MuppetForce's **×1.52** individual limit.
- **Basketball:** `×[1 + 0.34×(score/99) + 0.20×(weighted sport facets/99)]`, theoretical maximum **×1.54**. Basketball gets special consideration because the *Space Jam* films depict Looney Tunes using cartoon physics against enhanced players.
- **Other sports:** the basketball formula's bonus is multiplied by **0.84**, for a maximum theoretical **×1.454**. The same idea transfers to the relevant sport (elastic catch, improbable save or dribble), but never assumes the character is a real professional athlete or can violate every rule of competition.
- Coach and bench slots get **no individual ToonForce multiplier**. ToonForce does not grant a shared team aura.

### Conditional ToonForce match events

A general multiplier alone cannot explain why Daffy shrugs off an explosive hit or Wile E. Coyote gets up after an anvil drop. Matches now have at most **one conditional ToonForce spotlight event per team** (for combat and sports). It is *not guaranteed*, is seeded with the game's match RNG, and uses the character's specific capabilities.

- **Battle Royale:** approximately 16–56% trigger chance, depending on the character's Cartoon Physics rating, comedic initiative and situation. On success, one gag grants up to **+5.0 match-rating points**; use resilience or body control to model a cartoon escape from injury, or environment/Rule of Funny for an opportunistic trick.
- **Sports:** approximately 8–30% trigger chance, granting up to **+2.2 match-rating points**. Basketball descriptions use a cartoon rebound/rim gag; analogous events are available for the other sports.
- The matching character's active role matters. A non-canonical cape, fan meme, or an external animator controlling the scene does not grant permanent self-controlled reality rewriting.
- Events are transparently displayed in match explanation rows and have explicit per-match names and magnitude. They are not blanket immunity to Iron Man, Doctor Doom, Scarlet Witch or any other character.

These events represent the *unusual survival and tactical advantage* of cartoon characters rather than modifying permanent core stats.

**Primary contextual references:** [Warner Bros. official Space Jam: A New Legacy site](https://ownnow.spacejam.com/) and [original Space Jam behind-the-scenes site](https://www.spacejam.com/1996/cmp/behind/behind.html). Neither source canonically quantifies a numeric ToonForce power level.

## MuppetForce: individually weaker, collectively stronger

- Every one of the **101 official Muppets** retains its differentiated force rating and dimensions (impact recovery, props, stage improvisation, mayhem, ensemble interaction).
- Individual role multiplier remains up to **×1.36** in regulated sports / **×1.52** in Battle Royale, both lower than the strongest ToonForce user.
- MuppetForce has an additional, distinct **team-wide camaraderie effect**, including *other characters from different talent pools*. This raises the **entire team's composite rating**, not just Muppet attributes or individual contributions.
- The new percent formula is `min(22%, 4.8% × (weighted Muppet ensemble strength)^0.90)`. Muppet starters have weight 1, coaches 0.6 and bench 0.35. A second teammate must be present; no solo bonus.
- The team bonus scales as more Muppets join: roughly **+3–4%** for one, **+10–12%** for three, and **+15–18%** for five, depending on their teamwork ratings, hard-capped at **22%**.
- The team bonus is added **once after** role fits, coaching, existing chemistry, signature moves and variety. Diminishing returns and a hard cap prevent unlimited stacking.

In pure Muppet drafts this can help close the gap with other talent pools. In mixed-roster drafts it rewards placing a Muppet beside heroes and athletes, including entirely non-Muppet teammates. No character acquires canonical MuppetForce powers from this aura; this is a performance/chemistry abstraction.

## Verification

- `tests/toon-force.test.cjs` validates individual six-facet ratings, bigger multiplier, bounded random events, lack of automatic invulnerability, and sports continuity.
- `tests/muppet-force.test.cjs` verifies exhaustive Muppet ratings and monotonic 1–5 Muppet ensemble scaling.
- `tests/browser-smoke.cjs` checks live player fit, simulated scores, actual ToonForce events with full arithmetic reconciliation, and a **Bugs Bunny single-character Battle Royale ranking audit** against the entire drafted base roster.
- Numeric ratings and exact balance are game-design estimates and should be revisited against actual match statistics. No user-facing claim of canonical omnipotence follows from any numeric value.

# Option C — character-intelligence governing rule

> **Character abilities are canonically grounded. Sporting applications are rules-constrained. Ratings are derived from the resulting competitive advantages, not used as substitutes for them.**

**Status:** Adopted project design principle. This document governs new character research, position/scoring work, supernatural officiating, matchup evaluation, and future simulation changes. It is a specification, not a claim that the current game engines already implement every rule.

## Design intent

Draft Anything evaluates characters as the versions that actually exist in their chosen continuity. It does **not** remove supernatural powers to make characters ordinary athletes. Every character may use their documented abilities in sport **to the extent that their specific application complies with that sport's rules, field/court constraints and game mechanics**. A legal power can produce a tremendous advantage; do not arbitrarily normalize or cap the strongest characters to create parity.

The same reviewed character/form knowledge must inform **sports** and **Battle Royale**, but a sport-specific evaluation is not the same as a free-for-all combat judgment. Preserve the distinctions among *what an ability does*, *what the rules allow*, *how the ability affects the position*, and *whether the opponent can counter it*.

## Three layers; keep the numbers

1. **Universal athletic/mental attributes (numeric).** Preserve the 12 existing dimensions: speed, agility, strength, size, leaping, endurance, touch, accuracy, reflexes, IQ, clutch and leadership. They remain the shared quantitative baseline for positions, roster strategy, card displays and season simulations. Review and recalibrate scores where documented feats warrant it; do not infer powers from a number alone.
2. **Continuity-aware character and form intelligence (qualitative/typed).** For each base character and variant, record demonstrated powers, scale, specific feats, constraints, weaknesses, defenses, counters, equipment dependencies, battle/competitive intelligence, and evidence/continuity. An unreviewed ability is **unknown**, not automatically absent. Never treat a selected form as if it were identical to its base character.
3. **Mode/position evaluation (derived numeric and contextual).** Retain position-weighted athletic ratings, then evaluate *legal* power effects, team roles/chemistry, opponents and environment in the relevant mode. Convert the resulting competitive advantage into transparent ratings, performance forecasts and seeded simulation outcomes. A powerful ability can alter mechanics or achievable outcomes, not merely add a fixed number of rating points.

**No single combat power score determines every sports position.** Conversely, a high sports position rating does not imply that a character can defeat a cosmic or reality-manipulating opponent in combat.

## The supernatural-officiating test

For every consequential or disputed power application:

1. **Capability:** Does the selected character/form actually possess the ability in the selected continuity, with applicable conditions met?
2. **Attempted action:** What does the player do, to what or whom, with what range/timing/equipment?
3. **Rules compliance:** Does it respect the actual rules and intended constraints of the sport (possession, legal touches/contacts, movement, player interference, scoring, position restrictions, equipment and boundaries)? Ordinary rules apply even when supernatural powers are involved.
4. **Competitive effect:** If legal, how does it affect the specific position, play, teammate, opponent or probability of success? What can resist or counter it?
5. **Recorded ruling:** Store the decision, reasoning, relevant rule, continuity and version. When a sport's rules do not clearly address a supernatural mechanism, flag `needs-review` and adopt a documented game-specific interpretation before treating the action as legal or illegal. Do not silently invent permissions or prohibitions.

**Illustrations, not blanket legality rulings:**
- Superman's flight can increase court coverage and reach, but does not waive basketball traveling, possession or scoring requirements.
- Spider-Man's spider-sense can aid volleyball anticipation; he must still respect net, rotation and legal-contact rules. A libero cannot gain an otherwise prohibited action simply through powers.
- Doctor Strange's portals may affect passing geometry, but ball movement and player actions still require a consistent football rules interpretation.
- Telekinesis may alter what a character *can* do; it does not automatically establish that manipulating a ball without a permitted contact is legal.

## Team intelligence and collective effects (required)

**The unit of evaluation is the full drafted lineup, not just five isolated characters.** Option C must incorporate established team-building mechanics *before* it judges win probability, positional performance, combat resolution, or final team results. Individual matchup judgments must not override an otherwise valid coach, bench, sidekick, reunion, chemistry, support, or team-wide effect.

Preserve the currently implemented systems as initial compatibility requirements, even while migrating their implementation into a shared qualitative/contextual evaluator:

1. **Sidekick / Bench Spark / Reinforcement:** Maintain `data/bench-chemistry.js`'s approved sidekick-role tag, guaranteed bench-sidekick lift even without the lead present, additional lead-reunion lift when an eligible lead appears on the roster (including coach), shared-group mesh for *any* bench player, and the existing **8% combined bench chemistry cap**. Keep the separately modeled bench minutes, clutch-driven hot streaks and cold games, including sidekicks' lower cold-game chance. Do not make Sidekick a supernatural ability tag.
2. **MuppetForce ensemble:** Maintain `data/muppet-force.js`'s **team-wide camaraderie effect** for an eligible Muppet alongside at least one teammate, including teammates from *other pools*. Preserve starter/coach/bench contribution weights, diminishing returns and the **22% team-wide cap**; its individual role effects are separate. This is an advantage for the **whole team**, not a claim that other characters acquire MuppetForce powers. See [ToonForce/MuppetForce scoring](toonforce-muppetforce-scoring.md).
3. **Established character combinations:** Retain existing faction, crew, family, named partnership, signature-teamup, group chemistry and other documented roster relationships. Assess who is present, the role each occupies, and whether the documented interaction is actually applicable in this sport or fight. A known partnership can add an advantage beyond individual scores; do not invent unsupported relationships or treat shared franchise membership as automatic synergy.
4. **Coach / commander / reinforcement / other support:** Preserve existing role-specific support, coaching, commander and reinforcement effects. A support character's legal, demonstrated team-boosting powers can also have situational effects, but the same source of influence must not be counted twice merely because it appears in both character research and a legacy numeric bonus.
5. **ToonForce and conditional team events:** Keep ToonForce distinct from MuppetForce: documented individual cartoon physics and its seeded spotlight events are not automatically a permanent team-wide aura. The specific event's actual effect on teammates/opponents should be represented when applicable, without granting unsupported cartoon powers to everyone.
6. **Contextual collective powers:** Research legitimate team-wide buffs, morale/coordination, healing, shields, tactical foresight, shared equipment, debuffs, and counters. Identify affected recipients, activation conditions, range/duration, mode-specific legality, interaction with opposing powers, and ability/form continuity. These are **in addition to**, not substitutes for, established relationship and team chemistry bonuses.

### Evaluation and accounting contract

1. Build the *entire* roster with selected forms, field positions, coach, bench/reinforcement and opponents.
2. Calculate existing individual and positional baselines; resolve legal ability use, named pair/group synergies, team auras, support roles and opposing counters in context.
3. Apply each established bonus **once**, with its existing stacking semantics, individual limits and team-wide caps. Preserve numeric behavior during migration unless explicitly approved as a separate balance change.
4. Use the fully adjusted team's capabilities to derive matchup advantages, predicted probabilities and coherent seeded events. A qualitative evaluation that ignores a team's bench or MuppetForce is **incomplete**.
5. Report a transparent contribution ledger: individual attributes/abilities, named partnership/reunion, bench-sidekick/mesh, MuppetForce ensemble, ToonForce spotlight (if triggered), coach/support, other team-wide ability, counters, and final total. Do not double-count benefits represented in multiple categories.

**Required regressions:** sidekick alone vs lead reunion, ordinary bench with group mesh, non-Muppet receiving the MuppetForce team effect, multi-Muppet diminishing returns/cap, coach and bench contribution weights, mixed-pool teams, ToonForce's lack of unconditional team aura, team-combo activation/deactivation, support/ability countering, no repeated bonus, and final score/damage/report reconciliation.

## Character interactions, matchup outcomes and explanations

- Evaluate **power-to-power and power-to-rule interactions**, not only additive stat bonuses. Range, flight, regeneration, magic, matter manipulation, telepathy, ToonForce, counters, physical durability and special forms may completely change a matchup.
- Use researched, versioned matchup benchmarks where available. Otherwise derive outcomes from shared capability/interaction rules and position/context evaluation. Avoid a million independently hard-coded matchup overrides.
- Keep probabilistic judgments labeled **editorial game estimates**, not canonical percentages. A qualitative “80%” is a reasoned estimate until validated by calibrated tests.
- Preserve seeded variability, reproducibility, and coherent event/score reporting. The model must produce battle or play events that **actually explain** the outcome; do not choose a winner with one system and display unrelated damage/statistics from another.
- Exceptional characters can dominate when the evidence and rules support it. Document true limitations and counters; do not enforce arbitrary artificial parity.
- Ensure all numeric results are inspectable: underlying athletic baseline, permitted power/ability effects, important opponent interactions, sport/position rules and model version.

## Implementation and verification requirements

- **No mandatory AI inference during gameplay.** Research may occur beforehand with human/AI assistance and be stored as versioned data; the shipped evaluator runs on those reviewed records. Optional live research is a separate, secured service, never assumed to be included in browser-only hosting.
- Do not replace existing 12-attribute values, position formulas, or live simulation logic solely by adopting this principle. Migrate incrementally, with reviewed changes and regression tests.
- Add sport-specific officiating decisions and ability-to-position interaction evaluations before applying supernatural effects in production.
- Test exemplary legal/illegal plays, base-vs-variant distinctions, position-specific value, obvious mismatches, unusual counters, Apex/ToonForce behavior and repeatable seeded simulations.
- When evidence is incomplete or conflicting, report uncertainty and queue review; do not manufacture feats or declare canonically exact athletic/damage numbers.
- Preserve the [whole-roster audit protocol](WHOLE_ROSTER_AUDIT_PROTOCOL.md): Phase 1 Campaign eligibility review and Phase 2 combat-scaling review remain separate, with shared character intelligence usable across both.

## Acceptance for future Option C implementation

A completed integration must be able to answer for a given draft, in plain language: **Who is this version of the character? What can they do? Which uses are legal in this mode? Why are they effective (or ineffective) at this position against these opponents? How did those judgments determine the numerical result and reported events?**

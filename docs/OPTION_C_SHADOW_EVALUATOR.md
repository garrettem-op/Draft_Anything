# Option C shadow evaluator — architecture (PR 1)

**Status:** first implementation, **shadow mode only**, default OFF. The Version 1 engine still decides every result. Tracking issue [#93](https://github.com/garrettem-op/Draft_Anything/issues/93). Contract: [V2_OPTION_C_EVALUATOR_BUILD.md](V2_OPTION_C_EVALUATOR_BUILD.md) and [OPTION_C_CHARACTER_INTELLIGENCE.md](OPTION_C_CHARACTER_INTELLIGENCE.md). Latest numbers: [option-c/SHADOW_COMPARISON_REPORT.md](option-c/SHADOW_COMPARISON_REPORT.md).

This is an engine that can consume character research. It is **not** the research: issues #82 (character/variant research) and #83 (combat atlas) remain open, and #84 (Gauntlet) is not started.

## What it does

Give it two complete `teamScore()` results and a sport, and it returns one JSON assessment that says, for each team: what each character can do on the evidence on record, which abilities matter against this opponent and which are countered, which partnerships and group effects are already lifting the team, the credible paths to victory, the editorial win estimate with a range, and the uncertainties that could change it.

```js
const a = DA_OPTION_C.evaluateMatchup({
  sportKey: 'brawl',            // any of the seven SPORTS keys
  teamA: teamScore('brawl', rosterA),
  teamB: teamScore('brawl', rosterB),
  teamNames: ['The Chungus', 'The Crossover'],   // optional
  rulesetId: 'brawl-v1', scenarioId: 'demo',     // optional labels
  mode: 'shadow',               // the only mode that exists
  context: { sigma: 2.5 },      // optional: the match's upset setting, for sports
});
```

It is a pure function: no RNG, no storage, no network, no AI service, no mutation of its inputs, and the same inputs always give the same output.

## Data flow

```
 Version 1 (unchanged)                         Option C (read-only)
 ---------------------                         --------------------
 roster ─► teamScore() ─► score ──────────────► profile-adapter   one profile per character/form
                           │                    team-ledger       observed effects, reconciled to score.rating
 score A, score B ─► playGame(rng) ─► result    interaction-engine (Battle Royale) / sport-rules (sports)
                           │                    probability       numeric baseline + typed interactions
                           │                    explain           win conditions, risks, uncertainties
                           └─ if shadow ON ───► evaluator.shadow.observe(result)  ─► in-memory comparison only
```

Version 1's phases are respected rather than replayed: `teamScore` already contains position fits (with individual ToonForce/MuppetForce multipliers and exceptional-power points), coach and bench multipliers, chemistry, signature lift, variety, variant bonus, the MuppetForce ensemble and bench chemistry. `gameRatings` then applies opposing chaos, reviewed-form encounter effects and the seeded events. Option C **observes** all of these and applies none of them again.

## Modules (`data/option-c/`)

| File | Responsibility | Main exports |
| --- | --- | --- |
| `runtime.js` | Versions, evidence vocabulary, read-only access to the existing data modules (browser globals or `require`) | `SCHEMA_VERSION`, `MODEL_VERSION`, `EVIDENCE`, `legacy()` |
| `reviewed-capabilities.js` | A tiny, sourced, `provisional` sample of capabilities the ability index does not model yet (currently Spider-Man's danger sense) | `REVIEWED_CAPABILITIES` |
| `profile-adapter.js` | **Character Profile Adapter.** `pool:Character` / `pool:Character|Form` identity, 12 attributes, typed battle signature, guards, weaknesses, ward, Apex rank, ToonForce/MuppetForce, sidekick role, ability tags with evidence status, continuity, gaps | `getProfile(candidate)`, `getProfileById(id)` |
| `interaction-engine.js` | **Ability Interaction Engine.** General typed rules for who has a documented way to hurt whom | `assessThreat(att, def)`, `assessBattle(as, bs)`, `RULES` |
| `sport-rules.js` | **Sport Rules Evaluator.** Five-step officiating test per character, capability and position | `evaluateApplication()`, `evaluateLineup()`, `RULEBOOK`, `POSITION_RULES` |
| `team-ledger.js` | **Team Intelligence Engine.** The unified effect ledger with reconciliation and double-count guards | `observeTeam()`, `validate()` |
| `probability.js` | **Probability Evaluator.** Transparent, uncalibrated first-pass model | `estimate()`, `MODEL` |
| `explain.js` | **Explanation Engine.** Plain-language win conditions, risks, constraints | `brawlSide()`, `sportSide()`, `characterSummary()` |
| `evaluator.js` | Facade `DA_OPTION_C` and the shadow recorder | `evaluateMatchup()`, `shadow.*` |

Each file is a classic browser script and a CommonJS module. `tests/helpers/option-c-app-harness.cjs` loads the real page scripts into a Node `vm`, so tests use the actual `teamScore`, `playGame`, `simChampionship`, `simSeason` and `simH2H`.

### Changes to existing files (and why)

| File | Change | Why |
| --- | --- | --- |
| `index.html` | Nine `<script>` tags after `data/after-action.js`; four lines at the end of `playGame()` | Load the evaluator; hand it the **finished** result when a developer has turned shadow on. The returned result object is the same object with the same fields. |
| `data/brawl-combat.js` | Export the existing `apexRankOf` beside `resolveBrawlCombat` | So Option C reports the same Apex/Empowered ranks the live engine applies, instead of keeping a second list of forms. No behavior change. |
| `tests/browser-smoke.cjs` | One added block | Checks the evaluator in real Chromium: present, off by default, seeded results and RNG stream identical with shadow on. |
| `data/option-c/benchmark-scenarios.json` | Four added cases (24 total) | Fixtures for unreviewed forms, unknown abilities, coach/commander and the ledger's derived partition. |

## Evidence vocabulary

`reviewed` · `provisional` · `unknown` · `needs-review` · `contradicted`.

- Combat evidence of a character: `reviewed` when a typed, sourced battle or form profile exists; `provisional` when only ability tags or ToonForce/MuppetForce facets exist; `unknown` otherwise. **Unknown is never treated as "has no powers".**
- Ability tags map from the ability index: owner-ruling/corroborated → `reviewed`; credible or an unsourced reviewed grant → `provisional`; needs-review or an unadjudicated evidence conflict → `needs-review`. Only expressly rejected grants (`CHARACTER_ABILITY_DISPUTES`) appear as `contradicted`; a record under investigation is not treated as disproven.
- A selected form is its own identity. An unreviewed form gets no power, guard, weakness or Apex rank, and the base character's tags are downgraded to `needs-review` for it.
- Continuity is `needs-review` unless a record states it. `mcu:Silver Surfer` is not given a comics kit.

## Typed interaction rules (Battle Royale)

Thirteen general rules over typed capabilities; no character names, no pairwise winners:
`durability-gap`, `physical-overmatch`, `toon-physics-ignores-gap`, `high-order-burst`, `typed-bypass`, `domain-guard`, `domain-weakness`, `finite-ward`, `apex-shell`, `apex-counter`, `apex-pressure`, `high-order-passive-defense`, `self-limiting`, plus the informational `initiative` and `unknown-kit`.

Each attacker→defender pair gets the attacker's best documented line of attack, the rules that fired and an ordinal leverage (`negligible`, `blunted`, `even`, `strong`, `decisive`). A team's **interaction index** is `0.6 × pressure + 0.4 × carry`: pressure is its best answer to each opposing fighter, carry is its single most effective fighter across the opposing lineup.

Not weighted yet, by design: range, flight and control in combat. The ability index records that a character *has* flight; it does not record combat proficiency or prove that an opponent lacks an answer.

## Sport officiating (initial framework)

For each player, capability and position: (1) is the capability on record for this identity, (2) can it operate here, (3) ruling `allowed | prohibited | needs-review | not-applicable`, (4) effect at this position, (5) can the opposing lineup counter it.

| Ruling | Entries in PR 1 | Basis |
| --- | --- | --- |
| `allowed` | Off-ball flight for coverage and reach; danger-sense anticipation | Stated in the design contract |
| `prohibited` | Flying while holding a basketball without dribbling; hovering to goaltend; libero attack above the net or block | Ordinary rules the brief says still apply; existing position rule |
| `needs-review` | Airborne dribbling; flight with possession in the other five sports; telekinetic ball movement; telekinetic interference; portal passes and relocation | No approved interpretation |

Position value comes from the position's own existing weight formula (share of weight on reflexes for anticipation; speed, leaping and agility for coverage), so one ability is `high` at libero and goalkeeper and `low` at setter without adding any number to a rating. A legal use of a capability whose own evidence still needs review is reported as `pending-capability-review`, not as an advantage. **No sport ruling changes a probability or a rating in this PR.**

## Effect ledger

Every entry carries `id`, `sourceSystem`, `sourceCharacterId`, `sourceAbilityId`, `trigger`, `conditions`, `recipients`, `stage`, `appliedBy`, `effectKind`, `value`, `unit`, `capGroup`, `cap`, `stackKey`, `alreadyApplied`, `sourceEvidence`, `continuity`, `reason`, `limitations`, `overlaps`.

- **`legacy-observed`**: position-fit baseline, coach and bench multipliers, individual ToonForce and MuppetForce multipliers, exceptional power, chemistry links and total, coaching style, signature moves (lift, chaos, clutch, unbreakable), Playoff Boom, Battle Royale variety, Variant Surge, Apex/Empowered rank, form encounter effects, MuppetForce performers and team ensemble (cap 22%), bench chemistry (sidekick lock, lead reunion, group mesh; cap 8%), bench heat, ToonForce spotlight.
- **`option-c-derived`**: typed interactions (`probability-interaction`) and sport rulings (`tactical` / `rule-prohibited`). Never a rating bonus.

Safeguards, all tested: the `inRating` entries add up to `score.rating` (within 1e-4); MuppetForce and bench chemistry are recomputed through their own modules and must agree; a second entry with an existing stack key is recorded as `blocked`; a derived entry of kind `rating-add`/`rating-multiplier` is `blocked`; a derived entry that restates a legacy effect names it in `overlaps`. Seeded effects are listed with `value: null` and are never rolled.

## Probability model (uncalibrated)

```
numeric      = (effective rating A − effective rating B) / scale      scale: 20 Battle Royale; 0.6 × sigma (min 1.5) or 4 for sports
qualitative  = 0.8 × (0.5 + 0.5 × typed coverage) × (interaction index A − interaction index B)     Battle Royale only
P(favored)   = logistic(|numeric + qualitative|), reported on a 5% grid between 5% and 95%, with a range
```

- Effective rating = Version 1 rating, minus the opponent's chaos signatures, plus Version 1's deterministic form-encounter effect.
- With no typed profile on either side the qualitative term is withheld and the status is `insufficient-evidence`; otherwise the status is `provisional`. Nothing in PR 1 is ever reported as final.
- The range widens with missing typed evidence, open continuity, unresolved rulings and seeded events.
- The constants are first-pass editorial choices. Two changes followed the first comparison run and are disclosed here: the brawl rating scale was widened from 10 to 20 (Version 1 ratings predict Version 1 combat only loosely), and the `physical-overmatch` rule was added. No other constant or rule was fitted to results. The Black Adam / Silver Surfer 80/20 is not encoded anywhere.

## Shadow mode

OFF by default. A developer turns it on for the current page only:

```js
DA_OPTION_C.shadow.enable();        // or open the game with ?optionCShadow=1
// …play or simulate…
DA_OPTION_C.shadow.report();        // games seen, agreement with the legacy winner, disagreements
DA_OPTION_C.shadow.records();       // each comparison with its full assessment
DA_OPTION_C.shadow.compare('brawl', scoreA, scoreB, { seeds: 300 });   // legacy win frequency on private seeds vs the estimate
DA_OPTION_C.shadow.disable();
```

Guarantees, each covered by a test:

| Guarantee | How it is enforced |
| --- | --- |
| Off by default | Flag is `false` until `enable()` or the URL flag |
| Never consumes the live RNG | The hook passes no `rng`; draws are counted with shadow on and off |
| Never mutates teams or characters | Inputs are deep-frozen in tests |
| Never changes a winner, score, stat, HP or event | 17 seeded fixtures (championships in all seven modes, seasons, Head-to-Head, 25 repeated brawls) match SHA-256 digests taken from the untouched base commit, with shadow off and on |
| Head-to-Head stays in sync | Both clients' payloads are identical; the result object gains no field |
| Nothing persisted or shared | No storage or network API in any Option C file; `localStorage` writes are counted |
| A failing evaluator cannot break a game | `observe()` catches and counts its own errors |

Not covered by the hook: regular-season games in the six sports are resolved inside `simSeason` without calling `playGame`, so shadow records championship, playoff, Head-to-Head and all Battle Royale games. `shadow.compare()` works for any sport.

## Tests

| File | Covers |
| --- | --- |
| `tests/option-c-modules.test.cjs` (21) | Profiles, form identity, unknown vs no, typed rules, sport rulings, ledger guards, probability symmetry and bounds, no network/storage/RNG in any module |
| `tests/option-c-shadow.test.cjs` (11) | All 24 benchmark cases, default-off flag, baseline parity, RNG and storage isolation, failure isolation, determinism and side symmetry on frozen inputs, schema, whole-team ledger in all seven modes, MuppetForce/ToonForce semantics, sports assessments, incomplete research, roster coverage |
| `tests/option-c-benchmark-registry.test.cjs` (3, existing) | Registry shape |
| `tests/browser-smoke.cjs` (added block) | Real Chromium: load, default off, parity, symmetry, reconciliation |

Reports and baselines: `node tools/option-c-shadow-report.cjs --write` regenerates the comparison report; `--golden <checkout>` regenerates `tests/fixtures/option-c-v1-golden.json` from a checkout without this change.

## Known limits

1. **Coverage.** 26 of 1,304 base characters and 88 of 243 alternate forms have a typed combat profile. Most matchups therefore lean on the numeric baseline and say so.
2. **Uncalibrated.** Estimates agree with Version 1 on the favorite in most sampled matchups, but several Battle Royale magnitudes differ; see the report.
3. **Sports are unweighted.** Legal ability uses are reported, not valued.
4. **No environment model.** Step 2 of the officiating test assumes a standard venue.
5. **Reviewed-capability sample has one record**, marked `provisional` pending review.

## Decisions for the owner

1. Sport rulings now marked `needs-review`: airborne dribbling, flight with possession (five sports), telekinetic ball movement and interference, portal passes and relocation.
2. Whether a legal ability whose evidence is still `needs-review` in the ability index (for example Superman's flight) should count as a recognized advantage.
3. Whether the three Battle Royale disagreements in the report reflect Version 1 or Option C being closer to intent: the Apex Hellbat lineup against five high-order beings, Franklin Richards against Abomination in a team, and a full Muppet crew against DC heavyweights.
4. Sign-off of the Spider-Man danger-sense record.

## Roadmap (not in this PR)

1. Typed profiles and continuity for more characters as #82/#83 land; the adapter picks them up without code changes.
2. Calibration against benchmark matchups and repeated seeds (Brier score/log-loss on a holdout), then range, flight and control interaction rules.
3. Approved sport rulings with position effects, valued and calibrated per sport.
4. A reviewed activation PR in which qualitative win conditions drive Battle Royale events so that HP, KOs and the report tell the same story as the winner. No live flip before that review.

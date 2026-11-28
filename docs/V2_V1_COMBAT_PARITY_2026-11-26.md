# V2 carry-forward contract — V1 combat and campaign, 2026-11-26

Owner direction: retain the approved V1 gameplay improvements in V2; finish full character/form research in V2, not an emergency whole-roster V1 patch. This supplements the [Option C build contract](V2_OPTION_C_EVALUATOR_BUILD.md) and is a release acceptance checklist, not an activation or an instruction to blindly transplant legacy numeric coefficients. No live V2 deployment.

## Merge ledger (November 26 UTC; ET is UTC−5)
All below are confirmed merged into main except stacked #660, incorporated through #659; #663 is the separate Odin proposal pending CI at initial writing. #647/#649 merged before the trailing 24-hour window; #648 was not merged at inspection. Links are to repository PRs.

| PR | UTC | Requirement to preserve |
| --- | --- | --- |
| [#650](https://github.com/garrettem-op/Draft_Anything/pull/650) | 05:17 | Identical slot-aware player/CPU challenge eligibility; no inverted underdog/kid/mortal filters, hidden CPU difficulty rating boosts or illegal fallback. Same commander specialties; validate roster size, history and diversity. |
| [#651](https://github.com/garrettem-op/Draft_Anything/pull/651) | 05:18 | Test-only storage stub fix, not a mechanic. |
| [#652](https://github.com/garrettem-op/Draft_Anything/pull/652) | 05:45 | Unlimited distinct character surges per draft, once per base identity, seeded weighted rarity with possible depowering, guaranteed sole form, near-tie sharing, same rules for CPU/H2H; persist legacy records. |
| [#653](https://github.com/garrettem-op/Draft_Anything/pull/653) | 06:01 | Actual commander/reinforcement marginal team rating by removing exactly one support slot and re-scoring; role, chemistry, signature, MuppetForce, variant and campaign specialty explanations; opponent penalty separate; no randomized attribution. |
| [#654](https://github.com/garrettem-op/Draft_Anything/pull/654) | 06:35 | Defensive ToonForce not interchangeable with offensive damage; credibility limits speed-only DPS, physical-tier bypass proportional to body manipulation; speed still governs initiative/evasion. Underdogs effective starter fit <=100 and mean <=73 before surge for both sides. Marvin, Rayman, Bowser signatures and Fury Bowser Apex; expose attack fit, credibility and team support. |
| [#655](https://github.com/garrettem-op/Draft_Anything/pull/655) | 15:27 | Three-pool alliance diversity counts all legal roster slots, including commander/reinforcement; same for both finale bosses and Triple Crossover. |
| [#656](https://github.com/garrettem-op/Draft_Anything/pull/656) | 15:29 | Surge eligibility independent of finished/legal lineup; draft phase and eligible unsurgered identity required. Submit still validates. |
| [#657](https://github.com/garrettem-op/Draft_Anything/pull/657) | 15:33 | Mystery surge interaction on eligible board character, confirm, shake/glow, reveal only after roll; hide odds and possible forms before roll; unchanged seeded weights. |
| [#658](https://github.com/garrettem-op/Draft_Anything/pull/658) | 15:36 | Cache versioning for updated campaign scripts; no gameplay change. |
| [#660](https://github.com/garrettem-op/Draft_Anything/pull/660) / [#659](https://github.com/garrettem-op/Draft_Anything/pull/659) | 17:16 | Identity-ordered RNG and row-order invariance; intentional slot geometry, not slot-swap invariance. Board-relative 3:2 lanes: tk1/d1/d2 target tk1; tk2/d3 target tk2. Living front tank fallback before rear lane priority. Character-specific scoped targeting: random, lowest HP%, backline, mirror mark, taunt, short-range rear restrictions, one interception per defender per round. Taunt > mark > signature > lane; mark/taunt rounds 1,4,7... Trace targeting and skips/intercepts. Cosmic anti-Apex modifier 1.25–1.5x for Apex attacker, 2–2.5x for baseline attacker vs tier-5 form, 3–4x for baseline vs lower-tier form. Retry seed per attempt; fixed opponent/tactics/surge; unique finale rosters. #660 supersedes #659's weighted-only targeting proposal. |
| [#661](https://github.com/garrettem-op/Draft_Anything/pull/661) | 17:57 | Shared ABBA snake, alternating first pick by stage, visible immediate CPU reservations, no same-round overlap, CPU cannot reuse any prior completed round identity; player default two wins max and no prior winners in finale. Optional single-use both sides across completed rounds, retry does not consume use; identity across forms/support, no boss overlap, save/recover state; fail closed on exhausted pool. |
| [#662](https://github.com/garrettem-op/Draft_Anything/pull/662) | 20:32 | Commander system compatibility: 50% absolute proficiency, 30% curated philosophy, 20% relative specialization; ±1.4 rating cap, half-weight reinforcement, unknown philosophy neutral; explain each member. Separate commander quality from fit, preserve history. |
| [#663](https://github.com/garrettem-op/Draft_Anything/pull/663) | 21:33 | Base Odin's own Odinforce, prehistoric form and Destroyer form distinct. Destroyer tier-5 Apex, artifact/collective-life-force limits (Thor #300), no auto win. Full V2 research remains authoritative. |

| [#666](https://github.com/garrettem-op/Draft_Anything/pull/666) | subsequent correction | Separate supernatural power classification from transformation status; supersedes the indiscriminate anti-Apex multipliers in #659 for high-order peer matchups. See acceptance rule below. |
| [#679](https://github.com/garrettem-op/Draft_Anything/pull/679) | 2026-11-27 | Campaign eligibility judged in the actually rolled Variant Surge form. See the active-form section below. |

## Actual V2 snapshot audit
> **Superseded 2026-11-27:** the engine parity merge below brought every module listed here level with `main` at `e078533`. Kept for the record.

Inspected develop/v2-option-c legacy modules at this audit:
- data/brawl-combat.js (blob a747b86d59fb5d967da38383ff4965c4529e779b): old raw*4 anti-Apex counter, no laneTarget/formationTarget, no offensiveCredibility, no scoped tactics/row-order handling from #659/#660. Existing initiative and Apex action model remain. V2 qualitative specification already calls for range/initiative, typed interactions, selected form distinctions and team effects, but does not specify these new mechanics or tests.
- data/campaign-strategy.js (c710e40dfa6ef2be6b9b1cad346e82db0ef0147b) and data/campaign.js (a08f47a51946c8750f233eaecffcbaca5e1e961a): old match seed, no current multi-surge/snake/single-use indicators. Do not assume parity.
- data/after-action.js (13117d01e96a3186f5c7782cb863484b94b03236) and index.html (bc529591f64b73a06979f117632b0baa9ec3df34): no new support explanation/commander philosophy indicators; need full integration audit.
- data/variant-abilities.js (8b373d88c5fc58b91399520e69c706edc2efebc4) and data/brawl-attack-profiles.js (c491633af0555f5140c48c684e168ee98e04999d): missing Odin additions; source from reviewed V2 research. This does not establish absence from all newer V2 research/evaluator modules. Audit those independently before implementing.
- V2 already plans full form-specific research, matchup/typed counters, team effect provenance, uncertainty, calibration and no duplicate effects. Preserve that design; do not duplicate the full atlas or mechanically overwrite research.

## New explicit V2 acceptance tests / gaps
1. **Ability coverage and intrinsic power:** every roster identity and selectable form evaluated against reviewed profiles; unknown/missing combat technique clearly flagged and never silently modeled as an ordinary fist fighter. Compare powerful baseline entities with enhanced forms; transformation does not automatically outrank intrinsic power. Review accumulated HP, action count, attack scaling, wards, resistance and counter multipliers jointly, avoiding double-counting. Calibrate using source-backed fixtures, not screenshot fitting.
2. **First-round knockout and action economy:** Odin Destroyer vs Melkor Unbound and the five-on-five screenshot roster (Odin, Manwe, Genie, Namo, Aslan vs Spectre, Mxyzptlk, Melkor, Lucifer, Aule). Include lineup placements, support effects and many seeds, track attack opportunities, first-round KO frequency, actual HP loss and overkill. Do not guarantee everyone a turn or impose artificial parity; concentrated damage and legitimate early KOs remain valid.
3. **Formation:** seeded row permutations yield identical outcomes, position swaps intentionally alter target lanes; verify both lane counts, fallback, range, guard interception, mark/taunt precedence, mirrored side rules and actual trace. Only documented/approved tactics; no inferred abilities from domain tags.
4. **Damage/accounting:** record incoming post-mitigation damage, actual HP removed, overkill, mitigation, misses, action opportunities and KO attribution separately. Damage credited can exceed HP removed; explanations must distinguish these. Preserve existing totals or version them explicitly; test trace/accounting invariants and report equivalence across modes.
5. **Support/leadership:** counterfactual marginal attribution, separate enemy penalties, commander fit weights/cap and per-character rationale. Unknown philosophy is neutral; no double application of already observed rating effects. Use documented V2 character/team evidence to refine taxonomy.
6. **Campaign and variant parity:** verify all #650–#661 rules above including fair eligibility before surge, mystery selection and persistence, seeded retries, unique identities, shared snake, all-slot diversity, no hidden handicaps, stage exhaustion and save migration.
7. **Release gate:** map each ledger item to a V2 implementation PR + test(s) + result; document deliberate design supersession explicitly and obtain owner approval where it changes approved gameplay. Existing V2 shadow mode must stay non-mutating/default off until release approval. No V2 deployment authorized here.

## Mandatory clarification: supernatural power is not transformation status (owner approved 2026-11-26)
- Track reviewed intrinsic/selected-form supernatural capability and transformation bonuses as distinct dimensions. A high-order cosmic/magic/reality/time/elemental signature in V1 (tier 4+) is a provisional typed classification, not a canonical assertion of equivalence. V2 should use the reviewed full profile, relevant ability, actual counters and limitations to improve this classification; unknown is not conventional by default.
- High-order peer attacks must not receive extra anti-Apex damage, a blanket baseline-only 50% guard, or special form-shell resistance solely because one combatant is transformed. Equal-tier interactions should use the same rules regardless of form label. Preserve ordinary armor, domain-specific resistance, pierce, weaknesses and evidence-backed power differences. Do not guarantee equal final damage, survivability or outcomes; existing form action/HP/attack effects are separate and must not be counted twice.
- Conventional enhanced forms remain vulnerable to credible supernatural counters. Normalize any counter coefficient for attack boosts already applied rather than stacking multiple versions of the same effect. V1 keeps 3–4x against conventional Apex for baseline high-order signatures, 1.25–1.5x for already-enhanced attackers, and a baseline high-order guard against conventional enhanced attackers. V2 may recalibrate magnitude on evidence and regression results, not reinstate the transformation-status shortcut for supernatural peers.
- Acceptance tests: tier/form-status matrix across baseline and transformed high-order peers; Odin Destroyer vs Spectre, Mxyzptlk, Lucifer, Melkor; Hellbat vs Darkseid conventional counter; domain guards/weaknesses and ordinary strikes; mirrored seeded formation traces, actual HP vs overkill accounting, and first-round KO distribution. Preserve formation lanes, initiative, legitimate early elimination and existing historical results. No forced attacks or character-specific outcome overrides.
- Carry forward [V1 PR #666](https://github.com/garrettem-op/Draft_Anything/pull/666) as a required integration and test item, not an instruction to copy legacy coefficients verbatim. No V2 runtime activation or deployment in this PR.

## Campaign active-form eligibility (V1 PR #679, 2026-11-27)
V1 now judges a surged character in the form it actually rolled. V2 must carry these rules forward and test them against its own reviewed character and form profiles.
- **Reviewed form evidence only.** A form gains or loses a challenge only through a reviewed, source-linked decision for that exact form, keyed by canonical pool ID, base name and exact catalog form name (V1: `data/variant-form-research.js`, the same records the Phase 1 research audit reads). Unreviewed forms keep the base classification and are listed for follow-up (V1: `docs/variant-eligibility-coverage.md`, 160 of 243 forms had no reviewed decision at merge). V2's form-specific research should replace that list, not copy base tags onto forms.
- **Gain and loss both apply.** For example, Dawnbreaker Batman qualifies for Skyborne, Red Death Batman no longer qualifies for No Powers Allowed, Alolan Ninetales loses Inferno.
- **Numerical challenges** read transformed attributes.
- **Tied to the base identity:** talent pool, Queens of the Court (identity), campaign history, single use, CPU reservations and The Underdogs (pre-surge limits apply in both directions).
- **One roll per character per challenge;** several characters may surge in a round; a spent roll cannot qualify through another form.
- **CPU parity without previews.** The CPU decides from eligibility and the shared published odds, never from a roll's outcome. It may gamble on a character who qualifies only through a surge: it rolls when it commits, the roll is recorded, and a failed roll burns that character for the round, as for the player. It does not risk a legal pick on a surge that could disqualify it, and every finale opponent follows that policy.
- **Exhaustion** counts untried qualifying surges for both sides, so a round never ends while a transformation could still produce a legal lineup.
- **No early reveal** of form names, odds or eligibility answers before selection.
- Held for review in #679 (not granted): Devastator Batman giants (sources give 6'8"), Dreamy Bowser magic, Hellverine magic, Phoenix Wolverine flight.
- Acceptance tests: V1 `tests/campaign-active-form-production.test.cjs` (live roster, real catalog and odds) is the reference: gain/loss matrix, stat thresholds in both directions, Underdogs both directions, identity/pool/history, multi-surge, CPU makes no roll while choosing, one roll per committed attempt, choices before a roll independent of its outcome, finale surge policy, exhaustion with untried and spent surges, and no pre-selection leaks.

This audit identifies gaps and defines requirements; it does not claim the V2 implementation is already complete.

## Combat audit carry-forward, 2026-11-27 (#685, #686, #687)
V1 `main` now carries corrections from the Battle Royale audit ([full write-up](COMBAT_AUDIT_2026-11-27.md)). V2's legacy `data/brawl-combat.js` predates even the lane/credibility mechanics above, so the engine changes are carried as requirements for the Option C evaluator, not transplanted code (a mechanical port conflicts in `brawl-combat.js`, `toon-force.js`, `after-action.js` and `index.html`). Only the Action Movies attribute data is applied here, because it is data, not engine.

Acceptance rules to add to the release checklist:
1. **Skill domain:** each technique and rated skill carries a domain (combat, sport, craft, command). Physical traits transfer to a fight in full; skill transfers only as far as it was earned in combat. No pool, profession or athlete-wide penalty; exceptions are individual and sourced (V1: Kareem Abdul-Jabbar, Shaquille O'Neal).
2. **Combat proficiency** (none, trained, expert, master) is a researched field separate from physical attributes. Strength without delivery is not full offense.
3. **Durability separate from strength:** ordinary human bodies never receive beyond-human durability or damage-reduction tiers.
4. **ToonForce:** defensive/durability effect in a fight is gated by how well-evidenced the cartoon physics is; household slapstick is not tank durability. Sport rulings are unchanged.
5. **Leadership and support** are researched blocks (quality, domain, style, named flaws), never archetype templates. Sporting leadership in a battle is an open owner ruling.
6. **Reports** list every target and reconcile credited damage with HP removed; commander and reinforcement impact shows the counterfactual rating with and without the character.
7. Regression fixtures: every before/after row in section 4 of the audit, plus the Action Movies evidence table.

## V1 freeze and remaining carry-forward, 2026-11-27 (#648, #674, #690, #691, #692)
Owner direction (2026-11-27): V1 stays as it is; V2 must cover the remaining ground. These V1 merges are the last V1 combat changes and must reach V2 parity:

| PR | Requirement to preserve |
| --- | --- |
| [#648](https://github.com/garrettem-op/Draft_Anything/pull/648) | Battle Royale Reinforcement is rated on clutch, reflexes, agility, endurance, accuracy and a little leadership (command belongs to the Commander); it reads combat-transfer Accuracy. Pokémon Pikachu counts Games Ash Ketchum as his lead. |
| [#674](https://github.com/garrettem-op/Draft_Anything/pull/674) | Mewtwo Psystrike kits (both pools); Armored Mewtwo armour HP and physical guard; games-pool Mewtwo forms match the Pokémon pool. |
| [#690](https://github.com/garrettem-op/Draft_Anything/pull/690) | Commander slot counts sporting leadership partly (`command` share by skill domain). |
| [#691](https://github.com/garrettem-op/Draft_Anything/pull/691) | A reviewed attacking power (spellcaster, elemental control, telekinesis) is never modelled as an ordinary fist fighter: at minimum a modest generic attack until an individual profile exists. Jean Grey individual profile. |
| [#692](https://github.com/garrettem-op/Draft_Anything/pull/692) | Sourced profiles for 14 iconic casters; documented power shields as a separate depleting defense, scoped to what each source shows (`powers` vs `all`). |

### Additional acceptance rules (gaps V1 deliberately leaves open)
1. **Weapon and fighting mastery** comes from researched techniques, not Touch/Accuracy alone. V2 research already lists them (e.g. Yoda "Form IV (Ataru)", Vader "Form V (Djem So)"); the evaluator must turn each into a proficiency level (none, trained, expert, master) with its source.
2. **Durability is not body size.** A small or frail body protected by a documented power (Yoda's Force barrier and energy absorption, Jean Grey's force fields) is judged by that power. Research `defense.mechanisms` and `weaknesses` (e.g. Vader's vulnerability to electrical discharge) must feed the resolver.
3. **Stored attributes are reviewed per character against the depiction**, as Action Movies were (#686). Star Wars first: Yoda (Size 10), Luke Skywalker and Darth Vader.
4. **Era-specific portrayals:** a matchup must know which depiction it is judging (Empire Strikes Back Luke loses to Vader; Return of the Jedi Luke overpowers him).

### Benchmark fixtures to add (V1 values on 2026-11-27, 1,000 seeded duels)
| Matchup | V1 | Expected direction for V2 |
| --- | --- | --- |
| Jean Grey vs Achilles | 35% | Jean favored (Omega-level telekinetic, force fields, range) |
| Yoda vs Achilles | 9% | Yoda favored (Force mastery, lightsaber, barrier) |
| Yoda vs Emperor Palpatine | 82% | Close (Revenge of the Sith duel was a standoff) |
| Darth Vader vs Luke (Return of the Jedi) | 86% | Close or Luke favored |
| Dumbledore vs Voldemort | 53% | Dumbledore slightly favored (won the Ministry duel) |
| Doctor Strange vs Scarlet Witch | 38% | Scarlet Witch favored, not overwhelming |
| Stephen Curry vs Hawkeye (DPS) | see audit | Hawkeye favored (sporting skill is not combat skill) |

## Engine parity merge, 2026-11-27 (main `e078533` → develop/v2-option-c)
The whole Version 1 line since the baseline (50 commits: lane targeting and formation, attack credibility, intrinsic power rank, commander system v2, multi-surge and snake-draft Campaign, active-form eligibility, the 2026-11-27 combat audit, generic attacks, caster profiles and power shields, Tap One) is merged into V2. Every "Requirement to preserve" row above is now met by the same code that runs on `main`.

**Proof of exact parity.** With `data/option-c/` and `data/archetype-groups.js` not loaded and `main`'s `data/bench-chemistry.js` put back, the merged checkout reproduces all 17 fixed seeded fixtures of `main` `e078533` byte for byte (championship, season, series and Head-to-Head in six sports plus Battle Royale). The only live differences from Version 1 are the documented Version 2 rules: bench rework (2026-11-15), archetype and tag chemistry groups (2026-11-18/19) and research moves (2026-11-20). `tests/fixtures/option-c-v1-golden.json` records the re-pin as a revision.

**How the two attack sources combine.** An individual Version 1 profile or reviewed form wins; otherwise the Version 2 research move (tier 2, 17% pierce); otherwise Version 1's generic tag-derived attack (tier 2, 12% pierce). The shadow evaluator reads the same order and treats the generic attack as a live move with provisional evidence, never as a reviewed profile. 28 generated research moves were dropped because their characters now have individual profiles (Gandalf, Dumbledore, Yoda, Jean Grey, Mewtwo and others).

**Evaluator gaps the merge exposed (not fixed here).** The shadow evaluator does not yet read intrinsic power rank, attack credibility, power shields, skill-domain transfer or the ToonForce combat gate, and its Battle Royale constants were fitted to the old engine (2026-11-21). The regenerated comparison report shows it: Franklin Richards crew vs Abomination crew (engine 100%, evaluator 30%), Darkseid crew vs Spectre crew (0% vs 45%), Looney crew vs Avengers (53% vs 90%). Next: teach the adapter those engine facts, then re-run `tools/option-c-calibrate.cjs`.

## Research combat extras, 2026-11-27 (status of the additional acceptance rules)
- Rule 1 (weapon and fighting mastery from researched techniques): **first version live in V2 fights** (`research-moves.js` `researchCombatOf`, `docs/option-c/RESEARCH_POWERS.md`). Levels come from the record's own wording; proficiency sets a floor under Strength for the strike.
- Rule 2 (durability is not body size): **first version live**: a power barrier named in the record is a depleting shield at the weakest V1 strength; research weaknesses and guards now reach V1-profiled and physical-only characters.
- Rules 3 and 4 (per-character attribute review; era-specific portrayals): open.
- Fixtures after this change (research on): Jean Grey vs Achilles 34%, Yoda vs Achilles 17%, Yoda vs Palpatine 72%, Vader vs Luke 80%, Dumbledore vs Voldemort 53%, Doctor Strange vs Scarlet Witch 32%. Jean and Yoda are still not favored over Achilles: that needs reviewed power tiers per character and the attribute review, not a stronger generic rule.

## Reviewed power tiers, 2026-11-27
`docs/option-c/POWER_TIERS.md` is the ledger for the per-character combat profile review. Marvel and DC research moves are reviewed (2 of 10 pools). Fixtures now met: Jean Grey vs Achilles 69% (Jean favored), Silver Surfer vs Black Adam 90%. Still open: Yoda vs Achilles 17% and Vader vs Luke 80% (Star Wars pool not yet reviewed), Professor X vs John Wick 0% (no mental win condition), Batman vs John Wick 4% (template attributes in the DC pool).

## Reviewed power tiers, second round, 2026-11-27
Star Wars reviewed (3 of 10 pools). Reviewed melee signatures for physical powerhouses; Yoda and Palpatine tier 4 in V2; power users strike with their power between signature uses. Fixtures now met: Jean Grey vs Achilles 80%, Yoda vs Achilles 61%, Hulk vs Abomination 50%, Windu vs Palpatine 50%. Still open: Vader vs Luke 76%, Palpatine vs Vader 38%, Thor vs Hulk 85% (compressed attributes), Professor X vs John Wick 3% (no mental win condition), Batman vs John Wick 4% and Bane vs Batman 100% (template attributes in the DC pool).

## DC attribute review, 2026-11-27
79 DC characters corrected from archetype-template attributes (`docs/dc-attribute-review.md`, one reason and one source per row; `tests/dc-attribute-review.test.cjs` checks the table against the pool data and three in-fight outcomes). Version 2 only; Version 1 is not changed. The cosmic entities and Darkseid, Doomsday, Ares and Brainiac are untouched (owner's cosmic rulings). Fixtures now met: Batman vs John Wick 61%, Bane vs Batman 82%, Batman vs Captain America 41%. Stored attributes feed every mode, so 14 of the 17 golden digests changed (sports fixtures with DC rosters as well as Battle Royale); the baseline was re-pinned with a recorded revision after proving that putting the previous `data/pools-dc.js` back reproduces the previous digests 17/17. Still open: the same review for Middle-earth and Harry Potter.

## Middle-earth review, 2026-11-27
Attributes: 22 characters corrected (`docs/middle-earth-attribute-review.md`); the Valar and Morgoth untouched. Tiers: Middle-earth is the fourth reviewed pool (5 tier 4, 22 tier 3, 1 tier 1, 25 dropped, 16 melee signatures; `docs/option-c/POWER_TIERS.md`). Two research records corrected (Fëanor's sword; Ancalagon's fire). Golden baseline re-pinned with a recorded revision after proving that putting the previous `data/pools-middle-earth.js` back reproduces the previous digests 17/17. New open item: no engine credit for armour or pure skill in a small body (Gimli vs Legolas 5%).

## Harry Potter review, 2026-11-27
Attributes: 25 characters corrected (`docs/harry-potter-attribute-review.md`): pets and small creatures, ghosts, and adults the template rated as duellists. Tiers: fifth reviewed pool (6 tier 3, 12 tier 1, 12 dropped, 4 melee signatures). One research record corrected (the Basilisk's gaze). The Harry Potter pool is not in the golden fixtures, so no digest changed (17/17 unchanged). New open items: no named counters (Patronus against Dementors); Speed reads as fighting ability.

## Tier review: cartoons, Muppets, Action Movies, 2026-11-27
Eight of ten pools reviewed. Comedy, performance and management moves dropped (MuppetForce and ToonForce unchanged); gods and reality-benders tiered (Hades, Rick Sanchez, Aslan at 4). No stored attribute changed, so the golden baseline is untouched (17/17). Remaining: games and Pokémon (248 research moves).

## Tier review complete: games and Pokémon, 2026-11-27
All ten pools reviewed (`research/option-c/power-tiers.json`: every research move is tiered from a record feat or technique, kept at the standard, or dropped with a reason). Games: 2 tier 4, 45 tier 3, 10 tier 1, 14 dropped, 5 melee signatures. Pokémon: tiers follow evolution and legend (39 tier 1, 19 tier 3). No stored attribute changed: golden baseline untouched (17/17). Finding: attributes outweigh tiers in a duel, so the remaining calibration is the top-end attribute scale.

## Version 2 fight rules, 2026-11-27
Four engine rules for the results data could not fix (`docs/option-c/FIGHT_RULES.md`): overcome powers, named counters, reviewed melee signatures (strike floor, strength above 99, a brawler's aim), and proficiency and worn armour as defence. All follow the research switch. With the switch off the engine is byte-identical to Version 1: the golden baseline passes unchanged (17/17, no re-pin), because the new report fields are written only while the rules are on. `tests/fight-rules.test.cjs` pins the data rules, the in-fight results and the switch.

## Form on the day, 2026-11-28
Rule 5 in `docs/option-c/FIGHT_RULES.md`: one damage-form draw per fighter per fight, sized by how close two private probe fights come out (their own fixed random stream; the game's dice are untouched). Follows the research switch; switched off, the engine is byte-identical to Version 1 (golden baseline unchanged, 17/17, no re-pin). Three test thresholds moved because favourites now win a little less often: Bugs Bunny over Batman (75% to 70%, browser smoke), Harry over Draco and Ancalagon over Smaug (60% to 52%).

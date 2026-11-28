# Combat, character data and leadership audit (2026-11-27)

Audit of Battle Royale after a campaign battle in which Stephen Curry dealt 441 damage on 7 of 8 hits, Maximus dealt 63 on 1 of 5, Marge Simpson out-mitigated John Rambo, and Colonel Bagley out-led Leonidas. Baseline is `main` at `d40cf47`. Every number below comes from the real game code running in headless Chrome, 1,000 seeded battles per row, same seeds before and after.

**Delivery:** shipped as three PRs: #685 (engine: skill-domain transfer, ordinary bodies, ToonForce combat gate), #686 (Action Movies attributes and leadership from the films) and this one (battle-report reconciliation and this write-up).

The original battle's seed and campaign tactic were not available, so this is a reconstruction, not a replay. The reconstruction reproduces the reported pre-match numbers exactly (leadership +8.27 / +13.55, reinforcement +4.32 / +7.71, attack fit 83.4 / 95.1). Campaign tactic points and the stage's commander specialty are not included.

Positions used: Aladdin tk1, Rambo tk2, Maximus d1, Wick d2, Achilles d3, Bourne reinforcement, Leonidas commander; Conan tk1, Marge tk2, Curry d1, Mills d2, Hawkeye d3, Russell reinforcement, Bagley commander.

## 1. Root causes of the reported battle

1. **Sporting skill was read as combat skill.** The twelve attributes are shared by every mode. Curry's Accuracy 99, Touch 96 and Game IQ 94 are basketball ratings, but the Precision damage style (`DPS_STYLES`, index.html) weights exactly those, so he scored a 95.1 damage fit, level with Hawkeye (95.0) and above John Wick (91.3). `offensiveCredibility` (data/brawl-combat.js) took the best of strength or skill, so he also read 100%.
2. **Leadership data was an archetype template.** The Action Movies pool builds every character from a template (`data/new-pool-core.js`). Leonidas is a generic "fighter" (Leadership 77, the same row as Deputy Galt and Iosef Tarasov). Bagley is a generic "commander" (Leadership 99, IQ 96, Clutch 95, the same row as Katsumoto). Commander impact is only `coachMult(fit)` on those three attributes; there is no compatibility term unless the commander has a curated style, and neither does.
3. **Every profiled cartoon got at least +31% Tank fit.** `toonForceMultiplier` was `1 + 0.32*(score/99) + 0.14*combat`, which spans only 1.31 to 1.46 across all 43 profiled cartoons. Marge (score 71, "household slapstick", tier "situational") went from a 75.0 base Tank fit to 98.4, above Conan (98.2). `defense()` then added a flat cartoon block of about 16 per hit on top.
4. **Human strength was treated as superhuman physiology.** Strength 90+ with Endurance 85+ gave physical tier 3, which blocks up to 22% of every conventional hit. 26 characters the game itself classifies as ordinary humans had it, including Conan, Achilles, LeBron James and Shaquille O'Neal.
5. **The damage report hid targets.** `data/after-action.js` listed only the top three targets. Curry's missing 69 damage was a fourth target.

Maximus landing 1 of 5 was bad luck, not a defect: his chance per attack was 79%, so one hit or fewer in five happens about once in 120 battles. Curry's 7 of 8 is ordinary at the same 79%.

## 2. Findings by area

| # | Area | Finding | Class | Status |
| --- | --- | --- | --- | --- |
| 1 | Offensive capability / attack fit | Sport skill counted as combat skill. `brawlRoleFit` (index.html), `offensiveCredibility`, `fighter()` (data/brawl-combat.js) | Architectural limitation with a data cause | Fixed: `data/brawl-combat-transfer.js` |
| 2 | Offensive capability | Strength alone gave an ordinary human 100% capability; the Power style had no skill term | Calibration | Fixed: strength needs skill for ordinary bodies; Power style scaled like Speed |
| 3 | Hit probability | `.79 + .0014*(acc - reflex) + .0011*(speed - agility)`, clamped .53 to .97. A 49-point accuracy gap moves it 7 points; every fighter in this matchup hit between 69% and 87% | Intended mechanic, weak signal | Unchanged; now shown per fighter |
| 4 | Hit probability | Maximus 1 of 5 | Legitimate randomness (about 1 in 120) | None needed |
| 5 | Damage | Attack is `9 + .31*power + .32*fit + .10*speed`; fit already contains accuracy and IQ, and power counts accuracy and IQ again | Calibration (partial double count) | Open; reduced for sport skill by fix 1 |
| 6 | Damage | Bryan Mills' lead over Wick and Hawkeye: IQ 96 adds 4 fit points over Wick, his team multiplier was 1.28 vs 1.13, he sits in the protected d2 slot, and his first targets were the softest tanks | Legitimate | None needed |
| 7 | Damage | A damage fit also raises that fighter's own HP (`.24*fit`) and block (`.052*fit`) | Calibration (double count) | Open, documented |
| 8 | Tanking | ToonForce Tank multiplier floor of +31% and flat block for every profiled cartoon | Calibration | Fixed: `toonForceCombatGate` |
| 9 | Tanking | Tier-3 physiology for ordinary humans | Engineering defect | Fixed |
| 10 | Tanking | Marge's stored Size 70 and Endurance 86 (equal to John Wick's) | Character data | Open; V2 research says "normal human physiology" |
| 11 | Tanking | Tank fit is purely Size/Strength/Endurance on a shared 1 to 99 scale, so Wilt Chamberlain (97.7) and Shaquille O'Neal (93.4) tank like Conan (98.2) | Architectural limitation | Open; decision needed |
| 12 | Commander | Leonidas and Bagley data | Character data | Fixed with 57 other Action Movies entries |
| 13 | Commander | Impact is one multiplier from IQ, Leadership and Clutch. Roster compatibility is only computed for commanders with a curated command style (philosophy evidence exists for 9); everyone else is "neutral" | Architectural limitation | Open; now stated in the report |
| 14 | Commander | The multiplier scales the fighters' score, so the same commander is worth more points on a stronger roster (16% more on Team B than on Team A here) | Intended mechanic | Documented |
| 15 | Commander / reinforcement | Sporting leadership counts in full: Bill Russell, Magic Johnson and Larry Bird rate 97 as battle commanders, level with Captain America | Balance question | Open; decision needed |
| 16 | Reinforcement | Role rating is Endurance, Leadership, Clutch and Agility. No tactical help, healing, buffs or intel are modeled; bench chemistry was 0 for both teams | Architectural limitation | Open |
| 17 | Team multiplier | Team rating sets one combat effect, a damage multiplier clamped .70 to 1.35. It does not touch accuracy, mitigation or HP, so support does not snowball across several stats | Intended mechanic | Verified |
| 18 | Team multiplier | Fighters' own fit feeds their attack and, through team rating, everyone's damage | Calibration (partial double count) | Open |
| 19 | Team variety | Untagged characters get styles from stats: Curry was "Ranged", Conan is a "Flyer" (Leaping 92) | Defect (ranged), intended-but-loose (flyer) | Ranged fixed; flyer open |
| 20 | Targeting | Lanes work as specified in #660: tk1/d1/d2 attack tk1 first, tk2/d3 attack tk2 first. No dead fighter acts; attack counts match rounds alive | Verified | None needed |
| 21 | Targeting | d1 is the most exposed damage slot (three attackers reach it third), d2 the safest. Maximus lived 6.6 rounds at d1 and 10.2 at d2 | Intended asymmetry, not disclosed to players | Open; consider telling players |
| 22 | Targeting | No side bias: mirrored lineups give 49.6% and 49.8% | Verified | None needed |
| 23 | Reporting | Target list truncated to three | Reporting defect | Fixed |
| 24 | Reporting | Support explanation showed only the total | Reporting gap | Improved |
| 25 | Roster | 319 characters carry reviewed power tags (magic, psychic, elemental control) but only 31 have a combat profile, so their powers do nothing in a fight. Jean Grey loses to Achilles 99% of the time, Elsa to John Wick 99% | Architectural limitation / research gap | Open; highest-value V2 item |
| 26 | Roster | Other template commanders with Leadership 99: Denethor II, Commissioner Gordon, Amandil, Seraphina Picquery | Character data | Open; needs per-character review |

## 3. What changed

**Skill domain.** `data/brawl-combat-transfer.js` records what a character's skill ratings were earned doing. The default is `combat` and changes nothing. NBA ratings are basketball ratings, so in a fight above-baseline Touch and Accuracy count 30% and Game IQ 50%. Speed, agility, strength, size, leaping, endurance, reflexes, clutch and leadership count in full. Two players have individual sourced records for fight training (Kareem Abdul-Jabbar, Shaquille O'Neal) and count 60% / 65%. Stored attributes are never modified and no other mode is affected. Characters with reviewed powers are unaffected, because a power already bypasses conventional skill.

This is a statement about what the ratings measure, applied per character. It is not a penalty on athletes: NBA Tank fits are untouched, and the NBA pool's mean damage fit moved from 83.4 to 75.4.

**Delivering force.** For an ordinary human body, strength counts toward offensive capability only alongside fighting skill. The Power style is now scaled by offensive capability the way Speed already was.

**Physical tier.** Tier 3 requires a body that is not classified as ordinary human (the existing No Powers Allowed trait).

**ToonForce.** Battle Royale effects are scaled by `toonForceCombatGate(score) = clamp((score - 65) / 25, 0, 1)`. Extraordinary profiles (90+) are unchanged. Sports are unchanged.

**Action Movies data.** 59 characters corrected from the films, each with its evidence in [action-movies-attribute-review.md](action-movies-attribute-review.md). Leonidas: Leadership 77 to 98. Bagley: Leadership 99 to 58, IQ 96 to 66, Clutch 95 to 50.

**Reports.** All targets listed with hit counts, reconciled to total DMG; average chance to hit; damage taken and blocked; who landed the knockout; a note when skill ratings come from sport; commander and reinforcement working shown.

## 4. Before and after (1,000 seeded battles each)

Team A is The Children of Chungus.

| Experiment | A wins before | A wins after |
| --- | ---: | ---: |
| Reported matchup | 16.4% | 65.8% |
| Swap Curry and Maximus | 24.0% | 34.7% |
| Swap Leonidas and Bagley | 22.5% | 45.1% |
| Swap Marge and Rambo | 17.5% | 31.6% |
| Swap Bourne and Russell | 21.2% | 76.0% |
| No commanders or reinforcements | 7.7% | 51.8% |
| No commanders | 5.9% | 46.3% |
| No reinforcements | 10.5% | 66.7% |
| Sides mirrored (A's win rate) | 19.6% | 64.1% |
| Both lineups rotated through other slots | 22.8% | 69.4% |

Before the fix, giving Team A Curry in place of Maximus *raised* its win rate by 7.6 points, and trading Rambo for Marge cost nothing. After, each swap costs about 31 to 34 points.

The skill-domain, ToonForce and physical-tier changes alone (before any character data changed) moved the reported matchup from 16.4% to 41.5%. The Action Movies corrections account for most of the rest, chiefly through the two commanders.

Reported matchup, per fighter (mean damage / hit rate / damage per hit / rounds alive):

| Fighter | Before | After |
| --- | --- | --- |
| Maximus (d1) | 258 / 79% / 54 / 6.6 | 413 / 79% / 72 / 8.0 |
| John Wick (d2) | 471 / 82% / 61 / 9.7 | 592 / 81% / 73 / 10.3 |
| Achilles (d3) | 500 / 82% / 62 / 10.1 | 635 / 82% / 77 / 10.2 |
| Stephen Curry (d1) | 497 / 79% / 71 / 9.3 | 317 / 74% / 61 / 7.6 |
| Bryan Mills (d2) | 674 / 80% / 83 / 10.3 | 666 / 80% / 83 / 10.4 |
| Hawkeye (d3) | 417 / 78% / 58 / 9.8 | 417 / 77% / 65 / 9.2 |
| Marge Simpson (tk2), mitigated | 337 | 166 |
| John Rambo (tk2), mitigated | 232 | 240 |
| Conan (tk1), mitigated | 373 | 230 |

Leadership impact: Leonidas +8.27 to +11.01, Bagley +13.55 to +5.15. Reinforcement: Bourne +4.32 to +4.53, Russell +7.71 to +6.76.

One-on-one duels at d1 (first fighter's win rate):

| Duel | Before | After |
| --- | ---: | ---: |
| John Wick vs Stephen Curry | 76% | 95% |
| Hawkeye vs Ray Allen | 31% | 66% |
| Maximus vs LeBron James | 13% | 55% |
| Leonidas vs Giannis Antetokounmpo | 14% | 55% |
| Bryan Mills vs Kobe Bryant | 52% | 73% |
| Black Widow vs Kareem Abdul-Jabbar | 32% | 47% |
| Conan vs Shaquille O'Neal | 86% | 88% |
| Scarlet Witch vs John Wick (innate power) | 99% | 99% |
| Franklin Richards vs John Wick (innate power) | 100% | 100% |
| Jean Grey vs Achilles (power not modeled) | 0% | 1% |
| Elsa vs John Wick (power not modeled) | 1% | 1% |
| Tom vs Marge Simpson (Tank) | 99% | 100% |
| Homer Simpson vs Marge Simpson (Tank) | 88% | 100% |
| Marge Simpson vs John Rambo (Tank) | 0% | 0% |
| Batman vs Hellbat Armor Batman | 0% | 0% |
| Hulk vs World Breaker Hulk | 0% | 0% |

## 5. Remaining anomalies

- **Elite athletes are still close to elite warriors one-on-one.** Maximus beats LeBron 55% of the time. V1 has no weapons, armor, lethality or combat-experience attribute, so a 6'9" athlete with Strength 90 and Endurance 95 is physically the equal of a film gladiator. The skill half of the problem is fixed; the physical half needs a combat-proficiency dimension (section 6).
- **Powers without a combat profile do nothing** (finding 25).
- **NBA players as Tanks and as commanders** (findings 11 and 15) are unchanged pending a decision.
- **Marge's stored Size and Endurance** are unchanged.

## 6. V2 implications

| V1 finding | V2 status at `develop/v2-option-c` `49072b1` | Needs |
| --- | --- | --- |
| Sport skill as combat skill | Inherits. NBA research records list basketball techniques under `offense` (Curry: "Deep three-point pull-up", range "ranged"). The evaluator would read that as a documented line of attack at half weight | A `domain` on every technique (combat, sport, craft, command) and a `transfer` judgement; evaluator must ignore non-combat techniques for offense |
| Strength without delivery | Partially addressed: the adapter states tags are not combat proficiency | A structured `combatProficiency` (none, trained, expert, master) with evidence, separate from physical attributes |
| ToonForce Tank floor | Inherits (V2's `toon-force.js` has the old formula) | Port `toonForceCombatGate`; V2 research already says Marge has "no superhuman durability" |
| Tier 3 for ordinary humans | Inherits | Separate `durability` (physiology) from `strength` |
| Template leadership | Inherits the same pool file | `leadership` block per character: quality, domain (battlefield, political, sporting, criminal), style, and named flaws |
| Commander compatibility only for commanders with a curated style | Partially addressed: the team ledger records the commander effect with provenance | Compatibility from research (style vs each teammate's stance on authority), with unknown staying neutral |
| Reinforcement is generic attributes | Inherits | `support` block: what the character does for a team (tactics, healing, intel, morale) and its domain |
| Powers without profiles | Partially addressed: research-derived lines of attack count at half weight | Finish typed profiles for the 319 power-tagged characters; regression duels for each |
| Target list truncated | Inherits | Port the report fix |
| Lanes, credibility, intrinsic rank | Not yet ported (see V2_V1_COMBAT_PARITY_2026-11-26.md) | Port, then apply this audit's changes on top |

Regression fixtures V2 should carry: every row of the two tables in section 4.

## 7. Verification

- `node --test tests/*.test.cjs`: 425 pass (417 existing plus 8 new in `tests/combat-audit-engine.test.cjs`, `tests/combat-audit-action-movies.test.cjs` and `tests/combat-audit-report.test.cjs`).
- `node tests/browser-smoke.cjs`, `tests/battle-royale-tank-regression.mjs`, `tests/dealt-hand-regression.mjs`, `tests/volleyball-score-audit.test.js`: pass.
- Not tested: the campaign tactic layer and commander specialty for this battle; saved results from before the change are not recomputed.

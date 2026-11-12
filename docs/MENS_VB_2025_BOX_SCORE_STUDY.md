# Men's volleyball scoring distribution — 2025 empirical calibration

**Status:** Completed extraction and record validation: **50 distinct matches, 100 team box scores, 1,092 individual player records**. All 100 teams contain six or more individual records; every extracted player's points reconcile with kills + service aces + credited blocks. Four candidate sources were rejected; see `data/research/mens-vb-audit-status.json`.

## Sampling design

- **25 NCAA men's matches:** 12 from [Long Beach State's official 2025 schedule](https://longbeachstate.com/sports/mens-volleyball/schedule/2025) and 13 from [Pepperdine's official 2025 schedule](https://pepperdinewaves.com/sports/mens-volleyball/schedule/2025). The two programs' head-to-head matches were excluded from the candidate pool to prevent a fixture from being sampled twice. Both teams' individual box scores are counted for every selected match.
- **25 international men's matches:** from the [2025 Volleyball Nations League](https://voleinfo.com/matches/mens-volleyball-nations-league-2025-match-1), sourced through VoleInfo's mirrored Volleyball World player match records. Both teams' player records included.
- The selector uses a fixed random seed `20251110`, evaluates candidate URLs, and accepts the first 12/13/25 passing validation. This is a **convenience-based frame** with reproducible randomization, not a representative random draw from every NCAA or professional men's match in 2025.
- No repeated source URL, no fabricated box scores or unverified fallback values.

## Scoring definitions

- **NCAA:** player PTS = kills + service aces + solo blocks + 0.5 × block assists. NCAA player point totals may contain half-points. A team's aggregate credited points are not equal to all rally points because opponent mistakes also score rallies.
- **VNL:** player PTS = attack points + service points + blocking points.
- These two definitions yield comparable individually credited scoring volumes, but NCAA assisted blocks and VNL blocking points are not identical statistics. This is a source-dependent measurement limitation.
- Player rows include reserves; **position-specific medians should not be interpreted as full-match starter averages**. NCAA positions are marked `unknown` because the box score does not reliably identify roles.

## Empirical distributions (100 team performances)

| Measure | 25th percentile | Median | 75th percentile | 90th percentile |
| --- | ---: | ---: | ---: | ---: |
| Leading scorer share of player points | 26.41% | **29.68%** | 33.33% | 36.55% |
| Top two scorers' combined share | 46.64% | **51.81%** | 56.90% | 61.44% |
| Gini coefficient (including players who scored 0) | 0.5296 | 0.5689 | 0.6159 | 0.6502 |
| Leading scorer's match points | 14 | **17** | 20 | 22.5 |
| Total team credited player points | 50.75 | **58** | 67 | 74 |

**17%** of sampled teams had a leading scorer below 25% of individual points (relatively balanced). **14%** had a leading scorer above 35% (strong concentration). Actual observed top-scorer shares ranged from 19.74% to 47.73%.

### Score totals depend on match length

The following are **medians within source/length groups**; sample sizes are team box scores, not independent matches:

| Competition | Sets | Team scores | Median credited team points | Median leading scorer's points |
| --- | ---: | ---: | ---: | ---: |
| NCAA | 3 | 24 | 47.25 | 13.75 |
| NCAA | 4 | 20 | 60.5 | 17.5 |
| NCAA | 5 | 6 | 76 | 21.5 |
| VNL | 3 | 20 | 50 | 14.5 |
| VNL | 4 | 22 | 65.5 | 18.5 |
| VNL | 5 | 8 | 73 | 23 |

These point counts are **per match**, not per set.

## Draft Anything changes

The shared volleyball box score now distinguishes balanced, typical, and high-concentration usage regimes. Match seed and individual player attributes together determine opportunity; serving and blocks use separate position-sensitive allocations. The output remains deterministic across Head-to-Head clients.

- **Balanced target:** approx. 17% of matches, where pin opportunity is comparatively even and middles receive a modestly larger share.
- **Dominant scorer tail:** approx. 14%, with stronger featured-attacker volume (including rare exceptional nights).
- **Typical matches:** clear but non-extreme hierarchy among OH, OPP and MB.
- These are **calibration parameters** rather than guaranteed exact frequencies for every draft roster, matchup, set count, or stat profile.
- Existing game-specific role exclusions are preserved: libero receives DIG, AST, ACE only plus computed PTS; middles receive KILLS, BLK, ACE plus PTS. The study does **not** claim that real middles cannot dig.
- PTS remains KILLS + BLK + ACE; team rallies may exceed credited individual points because of opponents' errors.

## Reproduce

```bash
python -m pip install requests beautifulsoup4
python scripts/mens_vb_box_score_study.py
node tests/volleyball-score-audit.test.js
```

The run writes:
- `data/research/mens-vb-2025-matches.json`: individual player observations with exact source URLs
- `data/research/mens-vb-2025-players.csv`: player-level audit sheet
- `data/research/mens-vb-2025-teams.csv`: team-level concentration metrics
- `data/research/mens-vb-2025-results.json`: empirical quantiles and calibration benchmarks
- `data/research/mens-vb-audit-status.json`: accepted and rejected sources

The GitHub Actions workflow runs the extraction and scoring regression test. The next model calibration should use a broader NCAA sampling frame and a professional domestic league (such as Italian SuperLega) as a genuine external-validation dataset, rather than treating 25 VNL matches as universal men's volleyball scoring behavior.

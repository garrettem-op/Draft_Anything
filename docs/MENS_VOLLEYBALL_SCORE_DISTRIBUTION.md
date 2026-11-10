# Men's volleyball score distribution — initial calibration (November 2026)

**Scope and limitation:** The requested 50 individually reviewed NCAA/pro men’s box scores have **not** been completed. The 2025 VNL schedule indexes 116 match box-score pages, but repeated live-page timeouts prevented a complete 50-game extraction. Do not describe this note as a 50-match study. This is a provisional model calibration based on the verified examples below and season-level player statistics. A complete sample should subsequently be audited before claiming empirically estimated percentiles.

## Verifiable match examples

Source | Sets | Team | Top scorers / shape
--- | --- | --- | ---
[2025 VNL final, Poland v Italy](https://vblineup.com/men-vnl2025/matches/poland-vs-italy-2025-08-03) | 3 | Poland | León (OH) 16, Semeniuk (OH) 14, Kochanowski (MB) 7, Sasak (OPP) 6, Jakubiszak (MB) 4, Komenda (S) 3; 50 recorded individual points
[2025 VNL bronze, Brazil v Slovenia](https://vblineup.com/men-vnl2025/matches/brazil-vs-slovenia-2025-08-03) | 4 | Brazil | Alan (OPP) 18, Matheus (MB) 11, Arthur (OH) 9, Flávio (MB) 8, Lucarelli (OH) 7, Honorato (OH) 5; 64 team individual points
[2025 VNL bronze, Brazil v Slovenia](https://vblineup.com/men-vnl2025/matches/brazil-vs-slovenia-2025-08-03) | 4 | Slovenia | Možič (OH) 21, Štern (OPP) 10, Mujanović (OPP) 9, Kozamernik (MB) 5, Štalekar (MB) 5; 58 team individual points
[2025 VNL QF, Japan v Poland](https://vblineup.com/men-vnl2025/matches/japan-vs-poland-2025-07-31) | 3 | Japan | Miyaura (OPP) 17, Ishikawa (OH) 11, Takahashi (OH) 4; 43 team individual points
[2025 VNL QF, Japan v Poland](https://vblineup.com/men-vnl2025/matches/japan-vs-poland-2025-07-31) | 3 | Poland | Sasak (OPP) 15, Fornal (OH) 11, Kochanowski (MB) 7, Semeniuk (OH) 6; 52 team individual points
[2025 VNL, Bulgaria v Iran](https://vblineup.com/men-vnl2025/matches/bulgaria-vs-iran-2025-07-20) | 3 | Iran | Esmaeilnezhad (OPP) 19, Esfandiar (OH) 14, Sharifi (OH) 9, Valizadeh (MB) 9; 58 team individual points
[2025 VNL, Bulgaria v Iran](https://vblineup.com/men-vnl2025/matches/bulgaria-vs-iran-2025-07-20) | 3 | Bulgaria | Antov (OPP) 11, Nikolov (OH) 8, Grozdanov (MB) 7, Asparuhov (OH) 3; 33 team individual points
[2025 NCAA MVB national final, UCLA v Long Beach State](https://uclabruins.com/news/2025/05/12/ucla-falls-in-ncaa-title-match-to-long-beach-state) | 3 | UCLA / LBSU | UCLA Robinson 10 kills, Rama 8 kills; LBSU Kandev 13 kills. Official match recap, not complete team player points.

**These are selected examples, not a random sample or population estimates.** The two teams in a single fixture are separate box scores, not separate matches.

## Season context

- [2025 men's VNL player totals](https://vblineup.com/men-vnl2025/players): Marlon Yant 257 PTS / 13 matches (~19.8 per match), Théo Faure 241 / 13 (~18.5), Agustín Loser 113 / 12 (~9.4). These are player-season averages, **not** direct estimates of within-team concentration.
- [2025 NCAA MVB season stats](https://pepperdinewaves.com/sports/mens-volleyball/stats/2025) and [2026 NCAA men's season analysis](https://www.maydaystats.com/posts/volleyball/2026-07-08-mens-year-in-review/): support role and player workload variability, but neither is a substitute for the full requested 50-match individual distribution study.

## Simulation changes

The existing simulator distributed kills to every eligible hitter using similar athlete attribute weights, which tends to make box scores too even. The updated distribution:

1. Gives the pin hitters (two OH and OPP) far greater attack volume than setter or middles.
2. Selects a featured pin attacker from attributes/position and deterministic match seed; most matches have a clear featured role, while approximately 18% take the more balanced path.
3. Gives middles a larger fraction of blocking points; setter takes the bulk of assists; libero takes the bulk of digs.
4. Allows match-specific outlier serve ace production.
5. Maintains role exclusions requested for the game: libero no kills/blocks; middles no digs/assists, even though real players sometimes record them.
6. Preserves PTS = KILLS + BLK + ACE and deterministic identical stats across clients. Match win/loss simulation is unchanged.

The numeric role multipliers and the ~18% balanced-match frequency are **design priors**, not measurements from a completed 50-box-score audit. A future empirical audit would calculate per-match top-scorer share, top-two share, HHI/Gini of scoring, and distributions by set count and position, then fit the priors against observed quantiles.

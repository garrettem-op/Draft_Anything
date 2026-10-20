# Battle Royale Tank — consolidated physical resilience (2026-10-20)

**Applies:** Both Battle Royale Tank slots in every candidate pool. **Not applied:** DPS, Commander, other sports, or the raw 12-character ratings.

## Rules
Let \(S=\text{Size}\), \(P=\text{Strength}\), and \(E=\text{Endurance}\), on the game's existing 1–99 scale.

1. **Triple elite:** If all three attributes are **strictly greater than 90**, physical resilience = \(\min(99,1.03\times(S+P+E)/3)\).
2. **One weak third:** Otherwise, let \(L\) be the lowest of the three and \(A\) be the average of the other two. If \(A-L\geq 10\), physical resilience = \(0.97\times A\). This replaces the previous no-penalty outlier exclusion.
3. **Ordinary case:** physical resilience = \((S+P+E)/3\).

The physical score is **80% of Tank role fit**. Reflexes account for 10%, and Leadership 10%. The ordinary `fitScore` weakest-trait floor **does not apply** to Tank. The `unbreakable` signature uses the same Tank function, preventing accidental removal of the special penalty/bonus.

## Concrete examples (same game values)
| Character | Size | Strength | Endurance | Physical resilience | Full Tank role fit |
|---|---:|---:|---:|---:|---:|
| Sentry | 62 | 99 | 97 | **95.06** (low-Size penalty) | **89.45** |
| Thanos | 94 | 99 | 99 | **99** (triple elite; capped) | **97.80** |
| Hulk | 98 | 99 | 99 | **99** (triple elite; capped) | **91.20** |
| Thor | 85 | 99 | 99 | **96.03** (low-Size penalty) | **94.42** |
| Captain Marvel | 69 | 99 | 99 | **96.03** (low-Size penalty) | **94.62** |

Compared with the old generic Tank formula Sentry scored roughly **76.18**; the outlier-trimmed draft without a deduction produced **91.80**; the final owner-defined model scores **89.45**.

## Narrative behavior
The postgame narrative must not assert that Sentry or another Tank was *physically overpowered for lack of size* based only on an attribute difference. It describes a weak physical composite only if that composite is truly below a comparison, and otherwise may note Reflex or Leadership limitations. A matchup result in a simulation is not an on-screen victory/defeat.

## Regression
Run `node tests/battle-royale-tank-regression.mjs` from repository root. It checks exact threshold, no penalty just under threshold, strength/endurance as low cases, 90-vs-91 bonus boundary, cap 99, Sentry score, both Tank slots, and recap/UI integration. The static and in-session calculations were additionally checked against actual embedded app functions.

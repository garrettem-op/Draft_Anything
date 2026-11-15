# Bench rework (owner ruling, 2026-11-15)

## The rule now
1. **Group chemistry counts the bench player** like every other roster member. Unchanged.
2. **The bench no longer lifts teammates through shared groups.** A benched Sharpshooter does not lift every other Sharpshooter. This removes the old "mesh" (0.75% per teammate sharing a group, up to 4).
3. **Sidekick lock (3%) and named-lead reunion (+2% per lead, up to 2) are unchanged.** A sidekick lifts the whole squad from the bench no matter who else is on the roster, and more for a lead who is.
4. **New: bench specialist.** A player with a *documented* record as a reserve gets a smaller lift for holding the bench slot: 1.5% for one Sixth Man of the Year award, 2.5% for two or more. If the player is also a sidekick the larger of the two applies once, never both, so Ginóbili and McHale (already sidekicks) stay at the 3% lock. Total bench chemistry is still capped at 8%.
5. **Unchanged:** bench fit multiplier, MuppetForce, the wild-card heat roll (any bench player can go hot or cold in a game).

## Why there is no new "base lift for every bench player"
Every bench player already affects the whole team. The bench slot's fit becomes a team multiplier, `benchMult = 0.95 + 0.10 x fit/99` (0.95 to 1.05). The coach's is `coachMult = 0.90 + 0.20 x fit/99` (0.90 to 1.10). So the bench's full swing is **half the coach's**, and it is driven by the bench player's own Stamina, Leadership, Clutch and Agility (weights 4, 3, 2, 1). A second base lift scaled by the same traits would count the same thing twice, so I did not add one. If you want the bench to matter more, the honest knob is the `benchMult` range, not a new bonus.

How the pieces compare (as a share of the pre-bonus team rating):

| Piece | Range |
|---|---|
| Coach fit multiplier | 0.90 to 1.10 (20% span) |
| Bench fit multiplier | 0.95 to 1.05 (10% span) |
| Bench chemistry: sidekick lock / with a lead | 3% / 5% |
| Bench chemistry: bench specialist (new) | 1.5% to 2.5%, below the sidekick lock |
| Bench chemistry cap | 8% |
| Coach style | up to about +/-1.4 rating points |

## Bench specialists (evidence only)
Source for all four: NBA.com's year-by-year Sixth Man of the Year winners (https://www.nba.com/news/history-sixth-man-of-the-year-winners), read 2026-11-15. The award goes to the league's best reserve each season.

| Player | Documented awards | Result |
|---|---|---|
| Kevin McHale | 1983-84, 1984-85 | already a sidekick: stays at the 3% lock |
| Manu Ginóbili | 2007-08 | already a sidekick: stays at the 3% lock (+2% with Tim Duncan) |
| Bill Walton | 1985-86 | new: 1.5% |
| James Harden | 2011-12 | new: 1.5% |

Basketball only for now, and only players in the NBA pool who won the award. Other reserve records (career starts versus bench games, super-sub goals, closers) were not used because I did not source them. Other sports need their own evidence; add them to `BENCH_SPECIALISTS` in `data/bench-chemistry.js` with a source.

## What removing the mesh does to scores
Measured on 300 seeded random rosters per case (6 pools x 4 sports with a bench slot): the mesh was giving **26% to 79%** of rosters some bench lift, averaging **0.2 to 1.0 rating points** (0.2 to 1.0%). Smallest in NBA rosters (0.21 points, basketball), largest in DC (0.99 points, volleyball). Bench chemistry for non-sidekicks is now 0 unless they are a documented specialist. Sidekick rosters lose only the mesh part of their bonus.

## Verification notes
- 17 fixed seeded parity fingerprints in `tests/fixtures/option-c-v1-golden.json` changed, as they must when a live rule changes. Before regenerating, I put the old bench file back and confirmed all 17 matched the old fingerprints exactly, so this change alone moved them. The old values are kept in the fixture under `revisions`.
- The Option C ledger and explanations mirror the new rule, reconcile to the rating, and show the specialist as its own line.

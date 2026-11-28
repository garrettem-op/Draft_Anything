/* Option C — Probability Evaluator (transparent model; Battle Royale constants FITTED 2026-11-21).
 *
 * Turns reviewed qualitative findings plus the existing numeric baseline into
 * an editorial win estimate. The whole model is three documented lines:
 *
 *   numeric   = (effective rating A - effective rating B) / SCALE[mode]           (sports)
 *   numeric   = (capped A - capped B) / BELOW + (excess A - excess B) / ABOVE     (Battle Royale)
 *               capped = min(rating, 99.2), the score where the fight's support multiplier stops
 *               rising (rating / 80, capped at 1.24); excess = rating - capped
 *   qualitative (Battle Royale, when any typed profile is on record)
 *             = Q_WEIGHT * (0.5 + 0.5 * typed coverage) * (interaction index A - interaction index B)
 *   P(favored) = logistic(|numeric + qualitative|), reported on a 5% grid
 *
 * "Effective rating" is the Version 1 team rating with the deterministic
 * match-stage effects Version 1 itself applies (opposing chaos signatures and
 * reviewed-form encounter effects). Seeded effects (bench heat, playoff boom,
 * ToonForce spotlight, upset variance) are never rolled here; they widen the
 * reported range instead.
 *
 * Battle Royale's scale and qualitative weight were refitted on 2026-11-28, after the Version 2 fight rules
 * and form on the day (docs/option-c/FIGHT_RULES.md), to the game's own seeded Version 2 fights (research
 * powers on): tools/option-c-calibrate.cjs, 720 random matchups x 100
 * fights, fitted on half and scored on the other half (docs/option-c/CALIBRATION.md). The sports scale
 * already matched simulated games and is unchanged. The fit describes the game engine, not canon:
 * an estimate is never a canonical statistic, and status stays provisional.
 */
(function (root) {
  'use strict';
  const NS = root.DA_OPTION_C_MODULES || (root.DA_OPTION_C_MODULES = {});
  const isNode = typeof module !== 'undefined' && !!module.exports && typeof require === 'function';
  const RT = NS.runtime || (isNode ? require('./runtime.js') : null);

  const MODEL = Object.freeze({
    id: 'logistic-baseline-plus-typed-interactions-v2',
    calibration: 'fitted-to-v2-fights-2026-11-28',
    brawlScale: 5.7,         // single-scale fit, kept for reference (5.59 and 5.74 on two seeds; was 4.6 before form on the day)
    brawlSupportCap: 99.2,   // team score where Battle Royale support stops rising (80 x 1.24, data/brawl-combat.js)
    brawlScaleBelowCap: 4.7, // rating points per logit up to the cap (fitted: 4.82 and 4.65; was 3.6)
    brawlScaleAboveCap: 20,  // rating points per logit above it: only fits still matter there (fitted: 15.8 and 25.4, a weak signal; was 10.6)
    sportScale: 4,           // rating points per logit in sports when the match variance is not supplied
    sigmaToScale: 0.6,       // logistic scale ~ 0.6 x the Gaussian upset sigma, when supplied
    minSportScale: 1.5,
    qWeight: 1.5,            // logits per unit of interaction-index difference (fitted with the cap: 1.50 and 1.48; was 1.0)
    coverageFloor: 0.5,      // qualitative weight = qWeight x (coverageFloor + (1 - coverageFloor) x typed coverage)
    grid: 0.05, floor: 0.05, // reported precision and the least/most certain estimate (5% / 95%)
    // Range half-width in grid steps. Battle Royale: 4 + up to 2 for missing typed evidence, so the range is
    // about ±25%, where 80% of held-out fight results landed. Sports: 2 (unchanged).
    brawlRangeSteps: 4, brawlCoverageSteps: 2, sportRangeSteps: 2,
  });

  // Calibration must compare the *observed* frequency, including exact 0% and
  // 100% samples, against the range. The 5%-95% reporting floor does not
  // justify clipping experimental evidence to that floor.
  function withinRange(observed, range) {
    return Number.isFinite(observed) && Array.isArray(range) && range.length === 2 &&
      observed >= range[0] - 1e-9 && observed <= range[1] + 1e-9;
  }

  function estimate({ sportKey, effectiveRating, interactionIndex, coverage, sigma, flags }) {
    const brawl = sportKey === 'brawl';
    const scale = brawl ? MODEL.brawlScale
      : Number(sigma) > 0 ? Math.max(MODEL.minSportScale, MODEL.sigmaToScale * Number(sigma)) : MODEL.sportScale;
    const cap = (x) => Math.min(x, MODEL.brawlSupportCap);
    const diff = brawl
      ? (cap(effectiveRating[0]) - cap(effectiveRating[1])) / MODEL.brawlScaleBelowCap +
        ((effectiveRating[0] - cap(effectiveRating[0])) - (effectiveRating[1] - cap(effectiveRating[1]))) / MODEL.brawlScaleAboveCap
      : (effectiveRating[0] - effectiveRating[1]) / scale;
    const numeric = [diff, -diff];
    // With no typed profile on either side there is no documented power
    // interaction to weigh, so the estimate rests on the numeric baseline.
    const useQual = brawl && !!interactionIndex && coverage > 0;
    const q = useQual ? MODEL.qWeight * (MODEL.coverageFloor + (1 - MODEL.coverageFloor) * coverage) : 0;
    const qualitative = useQual
      ? [q * (interactionIndex[0] - interactionIndex[1]), q * (interactionIndex[1] - interactionIndex[0])]
      : [0, 0];
    // Each side's own-perspective logit; exactly antisymmetric by construction.
    const logit = [numeric[0] + qualitative[0], numeric[1] + qualitative[1]];
    const strength = Math.abs(logit[0]);
    const raw = 1 / (1 + Math.exp(-strength));
    const maxSteps = Math.round((0.5 - MODEL.floor) / MODEL.grid);
    const steps = Math.min(maxSteps, Math.round((raw - 0.5) / MODEL.grid));
    const favoredIndex = steps === 0 ? -1 : logit[0] > 0 ? 0 : 1;
    const half = Math.round(0.5 / MODEL.grid);
    const pFav = (half + steps) / (2 * half), pDog = (half - steps) / (2 * half);
    const probability = favoredIndex === 0 ? [pFav, pDog] : favoredIndex === 1 ? [pDog, pFav] : [0.5, 0.5];

    // Uncertainty half-width, in grid steps: base + missing typed evidence + open flags.
    let widthSteps = brawl ? MODEL.brawlRangeSteps + Math.round(MODEL.brawlCoverageSteps * (1 - coverage)) : MODEL.sportRangeSteps;
    if (flags && flags.continuity) widthSteps += 1;
    if (flags && flags.seededEvents) widthSteps += 1;
    if (flags && flags.unresolvedRulings) widthSteps += 1;
    // The 5%–95% floor applies to the estimate, not to the range of results it allows: a lopsided fight can
    // end 100–0, so in Battle Royale the range may reach 0% and 100% (calibration, 2026-11-21).
    const range = probability.map(p => {
      const edge = brawl ? 0 : Math.round(MODEL.floor / MODEL.grid);
      const lo = Math.max(edge, Math.round(p / MODEL.grid) - widthSteps), hi = Math.min(2 * half - edge, Math.round(p / MODEL.grid) + widthSteps);
      return [lo / (2 * half), hi / (2 * half)];
    });
    const basis = useQual ? 'numeric-baseline-plus-typed-interactions' : 'numeric-baseline-only';
    return {
      model: MODEL.id, calibration: MODEL.calibration, basis, precision: MODEL.grid,
      probability, range, favoredIndex,
      perSide: [0, 1].map(i => ({
        effectiveRating: RT.round(effectiveRating[i], 4),
        numericLogit: RT.round(numeric[i], 4),
        interactionIndex: interactionIndex ? interactionIndex[i] : null,
        qualitativeLogit: RT.round(qualitative[i], 4),
        logit: RT.round(logit[i], 4),
      })),
      scale, qualitativeWeight: RT.round(q, 4),
      label: brawl
        ? 'Game estimate fitted to simulated Version 2 fights (2026-11-28); provisional, not a canonical win rate.'
        : 'Game estimate from the rating model, which matches simulated games; provisional, not a canonical win rate.',
      howToRead: [
        brawl
          ? 'Numeric term: rating difference up to a score of ' + MODEL.brawlSupportCap + ' at ' + MODEL.brawlScaleBelowCap + ' points per logit, and above it at ' + MODEL.brawlScaleAboveCap + ' (past that score team bonuses no longer raise fight damage; only fighters\' fits still count).'
          : 'Numeric term: effective rating difference divided by ' + scale + ' rating points per logit.',
        useQual
          ? 'Qualitative term: ' + RT.round(q, 3) + ' logits per unit of interaction-index difference (who has a documented way to hurt whom); the weight shrinks as typed-evidence coverage (' + RT.round(coverage, 2) + ') falls.'
          : brawl
            ? 'Qualitative term withheld: no fighter on either side has a typed combat profile, so the estimate rests on the numeric baseline alone.'
            : 'Legal ability applications are reported but not weighted: position effects have no approved, calibrated value yet.',
        'Reported on a ' + Math.round(MODEL.grid * 100) + '% grid, never below ' + Math.round(MODEL.floor * 100) + '% or above ' + Math.round((1 - MODEL.floor) * 100) + '%.',
      ],
    };
  }

  const api = { MODEL, estimate, withinRange };
  NS.probability = api;
  if (isNode) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

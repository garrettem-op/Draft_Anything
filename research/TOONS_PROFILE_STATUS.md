# Cartoon research deployment — 104 / 104

**Date:** 2026-10-19

## Complete implementation
- **104 character profiles** covering every character in `POOLS.toons`. Each has primary animation/movie titles, powers, notable feats, limitations, sports transfer rationale, power tier, and 12 proposed athletic attributes.
- **104 characters revised**, encompassing **495 changed attribute cells** relative to the original in-game roster (after absolute-scale calibration).
- Three working research files: `TOONS_PROFILES_BATCH_01.json`, `TOONS_PROFILES_BATCH_02.json`, `TOONS_PROFILES_BATCH_03.json`.
- Consolidated `TOONS_ALL_104_PROFILES.json` with per-attribute rationales and continuity warnings.
- **32 contextual matchup/feat records**: `TOONS_MATCHUP_EVIDENCE.json`.
- `TOONS_RATING_MODEL.md` documents treatment of repeatable toon-force, normal equipment, special conditions, and universal cross-pool 1–99 calibration.
- `index.html` now uses the revised 104 numeric vectors. The existing role-fit computation, simulated games, Championship, Dealt Hand, Head-to-Head, and Mashup all draw from them.
- `data/toons-profiles.js` adds the entire pool to the on-screen Character Guide alongside MCU. Numeric rating spoilers are opt-in.
- Validator `node research/validate_toons_profiles.mjs` checks all character IDs, score arrays, consistency and guide coverage.

## Static QA checks performed
- Count exactly 104 and 104 distinct names, with no missing/extra characters.
- Each 12-component integer vector is within [1,99].
- All game attribute vectors match the drafted research file and all 104 optional-guide records.
- Main app and data JS parse through JavaScript compiler without syntax error.
- MCU pool names and scoring block were not modified during cartoon research branch patching.

## Research confidence
These are **owner-requested deployed estimates, not certified source-by-source findings or franchise-owned ratings**. Official primary franchise material found for Avatar/Toph, Popeye/Bluto, and Rick's portal gun; most candidate scene events do not yet have a timestamped verification. Profile data labels this uncertainty rather than inventing citations. The game can be improved with further spot-checks without holding the already authorized release.

## Important character versions
Toy Story toys (not human Buzz), cartoon Avatar versus live action, classic Transformers animated universe rather than films, Nickelodeon SpongeBob's inconsistent slapstick, controlled versus episodic reality-bending in Looney Tunes, spinach-boosted Popeye and normally-carried portal-gun Rick.

## Change policy
All differences live in a Git commit on this branch and can be reverted, tested or adjusted. Non-cartoon pools continue using their previous values.

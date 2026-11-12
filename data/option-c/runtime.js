/* Option C (Version 2) — shared runtime for the shadow-mode qualitative evaluator.
 *
 * Owns: module registry, version constants, the evidence-status vocabulary and
 * read-only access to the existing Version 1 data modules. It never copies or
 * rewrites their data: Option C reads the same owner-approved tables the live
 * game uses (see docs/OPTION_C_SHADOW_EVALUATOR.md).
 *
 * Works as a classic browser script (after the data/*.js modules) and as a
 * CommonJS module in Node tests. No network, no RNG, no storage.
 */
(function (root) {
  'use strict';
  const NS = root.DA_OPTION_C_MODULES || (root.DA_OPTION_C_MODULES = {});
  const isNode = typeof module !== 'undefined' && !!module.exports && typeof require === 'function';

  const SCHEMA_VERSION = 1;
  const MODEL_VERSION = 'option-c-shadow-v1';
  const ATTR_KEYS = Object.freeze(['spd', 'agi', 'str', 'siz', 'lep', 'end', 'tch', 'acc', 'ref', 'iq', 'clu', 'ldr']);

  /* Evidence vocabulary required by the build contract. `unknown` is never a "no". */
  const EVIDENCE = Object.freeze({
    REVIEWED: 'reviewed',
    PROVISIONAL: 'provisional',
    UNKNOWN: 'unknown',
    NEEDS_REVIEW: 'needs-review',
    CONTRADICTED: 'contradicted',
  });
  const EVIDENCE_RANK = Object.freeze({ reviewed: 4, provisional: 3, 'needs-review': 2, unknown: 1, contradicted: 0 });

  /* Existing data modules. In the browser they are globals created by the
   * classic scripts loaded before this file; in Node they are required. */
  let cache = null;
  function legacy() {
    if (cache) return cache;
    const req = file => (isNode ? require(file) : null);
    const abilities = typeof characterAbilityTags === 'function'
      ? {
        characterAbilityTags, characterAbilityProvenance, characterAbilityVerification,
        CHARACTER_ABILITIES, CHARACTER_ABILITY_DISPUTES, CHARACTER_ABILITY_BROAD_TAG,
      }
      : req('../character-abilities.js');
    const bench = typeof benchChemistry === 'function'
      ? { benchChemistry, sidekickOf, BENCH_CHEM }
      : req('../bench-chemistry.js');
    const muppet = typeof muppetForceTeamwork === 'function'
      ? { muppetForceOf, muppetForceMultiplier, muppetForceTeamwork }
      : req('../muppet-force.js');
    const toon = typeof toonForceOf === 'function'
      ? { toonForceOf, toonForceMultiplier }
      : req('../toon-force.js');
    const exceptional = typeof brawlExceptionalPower === 'function'
      ? { brawlExceptionalPower, BRAWL_EXCEPTIONAL_POWER }
      : req('../brawl-exceptional-power.js');
    const attack = root.DA_BRAWL_ABILITY_API || req('../brawl-attack-profiles.js');
    const combat = root.DA_BRAWL_COMBAT || req('../brawl-combat.js');
    const variantApi = root.DA_VARIANT_ABILITY_API || req('../variant-abilities.js');
    const variantProfiles = root.DA_VARIANT_ABILITY_PROFILES || (variantApi && variantApi.VARIANT_ABILITY_PROFILES) || {};
    cache = { abilities, bench, muppet, toon, exceptional, attack, combat, variantApi, variantProfiles };
    return cache;
  }

  function moduleOf(name, file) {
    if (NS[name]) return NS[name];
    if (isNode) return require(file);
    throw new Error('Option C module not loaded: ' + name);
  }
  const round = (n, d) => { const f = Math.pow(10, d); return Math.round(n * f) / f; };
  const uniq = list => Array.from(new Set(list));
  const worst = statuses => statuses.reduce((a, b) => (EVIDENCE_RANK[b] < EVIDENCE_RANK[a] ? b : a), EVIDENCE.REVIEWED);

  const api = { SCHEMA_VERSION, MODEL_VERSION, ATTR_KEYS, EVIDENCE, EVIDENCE_RANK, legacy, moduleOf, round, uniq, worst, isNode };
  NS.runtime = api;
  if (isNode) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

/* Option C — research-derived typed lines of attack (shadow only, opt-in).
 *
 * Turns ONE validated research record (research/option-c/batches/*.json, via the
 * research ledger) into the small typed vocabulary the interaction engine
 * already understands: a non-physical line of attack, domain guards and domain
 * weaknesses. It is a pure function of the record.
 *
 * What it will NOT do (these are the boundaries that keep the first PR's
 * guarantees intact):
 *  - It never invents a tier, ward, Apex/Empowered rank, cooldown or HP. The
 *    research schema forbids numeric tiers (`numericTier`), so a derived line of
 *    attack has `tier: null` and the high-order rules (which need tier >= 4)
 *    cannot fire from research alone.
 *  - It never overrides a typed profile that already exists in Version 1.
 *  - It never copies a base record onto a form: callers pass the exact
 *    `pool:Character|Form` record or nothing.
 *  - Its evidence is always `provisional`. A record's declared status (even
 *    `reviewed`) says who accepted the text, not that combat proficiency was
 *    verified, and a tag or technique name is not combat proficiency.
 *  - Text it cannot map with a closed table is reported as `unmapped` and left
 *    out; placeholder text ("Not established ...") is ignored. Nothing is guessed.
 *  - It is a no-op unless a caller opts in (`useResearch`); default assessments
 *    are byte-identical with or without research loaded.
 */
(function (root) {
  'use strict';
  const NS = root.DA_OPTION_C_MODULES || (root.DA_OPTION_C_MODULES = {});
  const isNode = typeof module !== 'undefined' && !!module.exports && typeof require === 'function';
  const DERIVATION_VERSION = 'option-c-research-derivation-v1';

  /* Research `offense.domains` token -> interaction-engine domain. Closed table:
   * a token not listed here is reported as unmapped, never guessed. Conventional
   * (physical-class) domains are kept only for the report: the engine already
   * assesses conventional attacks from the numeric attributes. */
  const DOMAIN_MAP = Object.freeze({
    physical: 'physical', melee: 'physical', tech: 'tech', gadgets: 'tech',
    energy: 'energy', electric: 'energy', sonic: 'sonic',
    magic: 'magic', necromancy: 'magic',
    control: 'control', 'mind-control': 'control',
    psychic: 'psychic', mental: 'psychic',
    cosmic: 'cosmic', reality: 'reality', time: 'time',
    elemental: 'elemental', fire: 'elemental', water: 'elemental', 'water-control': 'elemental',
    ice: 'elemental', earth: 'elemental', wind: 'elemental',
    poison: 'toxin', dark: 'shadow', shadow: 'shadow',
  });
  const CONVENTIONAL = Object.freeze(['physical', 'tech', 'toxin']);

  /* Defense / weakness wording -> domain, only where the text names the domain
   * explicitly. The patterns are deliberately narrow. */
  const GUARD_PATTERNS = Object.freeze([
    { domain: 'psychic', re: /\b(psychic|telepath\w*|mental) (barrier|shield|ward|protection|defen[cs]e|resistance)/i },
    { domain: 'energy', re: /\b(energy (shield|barrier|absorption)|force (field|barrier|shield)|lightsaber deflection|deflects? (blaster|energy))/i },
    { domain: 'magic', re: /\b(magic(al)?|spell) (shield|ward|barrier|protection|resistance)|\bmagic resistance\b/i },
  ]);
  const WEAK_PATTERNS = Object.freeze([
    { domain: 'magic', re: /\b(weak|vulnerable|susceptible)\w*\s+(to|against)\s+magic/i },
    { domain: 'psychic', re: /\b(weak|vulnerable|susceptible)\w*\s+(to|against)\s+(psychic|mind control|telepathy)/i },
    { domain: 'energy', re: /\b(weak|vulnerable|susceptible)\w*\s+(to|against)\s+(energy|electricity|lightning)/i },
  ]);
  const PLACEHOLDER = /^\s*not established\b/i;
  const clean = list => (Array.isArray(list) ? list : []).map(x => String(x == null ? '' : x).trim()).filter(x => x && !PLACEHOLDER.test(x));

  /* Derive from one record. Returns null when the record is unusable; otherwise
   * a plain, deep-copied object (the record is never mutated). */
  function deriveFromRecord(record) {
    if (!record || typeof record !== 'object' || typeof record.id !== 'string') return null;
    const off = record.offense && typeof record.offense === 'object' ? record.offense : {};
    const def = record.defense && typeof record.defense === 'object' ? record.defense : {};
    const tokens = clean(off.domains).map(s => s.toLowerCase());
    const lines = [], unmapped = [];
    for (const t of tokens) {
      const d = DOMAIN_MAP[t];
      if (!d) { if (!unmapped.includes(t)) unmapped.push(t); continue; }
      if (CONVENTIONAL.includes(d)) continue; // already assessed from attributes
      if (!lines.includes(d)) lines.push(d);
    }
    const guards = [], weakTo = [];
    for (const m of clean(def.mechanisms)) for (const p of GUARD_PATTERNS) if (p.re.test(m) && !guards.includes(p.domain)) guards.push(p.domain);
    for (const w of clean(record.weaknesses)) for (const p of WEAK_PATTERNS) if (p.re.test(w) && !weakTo.includes(p.domain)) weakTo.push(p.domain);
    const techniques = clean(off.techniques);
    const src = Array.isArray(record.sources) && record.sources[0] ? record.sources[0] : null;
    return {
      version: DERIVATION_VERSION, id: record.id, declaredStatus: String(record.researchStatus || 'unknown'),
      domains: lines, primaryDomain: lines.length ? lines[0] : null,
      techniques: techniques.slice(0, 3), range: typeof off.range === 'string' ? off.range : null,
      guards, weakTo, unmappedDomains: unmapped,
      source: src && typeof src.url === 'string' ? src.url : null,
      limitation: clean(record.limitations)[0] || null,
      continuity: typeof record.continuity === 'string' ? record.continuity : null,
    };
  }

  const api = { DERIVATION_VERSION, DOMAIN_MAP, CONVENTIONAL, GUARD_PATTERNS, WEAK_PATTERNS, deriveFromRecord };
  NS.researchProfile = api;
  if (isNode) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

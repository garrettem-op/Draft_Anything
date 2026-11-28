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
 *    verified, and a power tag is not combat proficiency.
 *  - Proficiency (v2, owner direction 2026-11-27: weapon and fighting mastery comes from researched
 *    techniques) is read only from a technique that names a fighting or weapon skill, and its level
 *    only from a level word in that same technique. It carries no number of its own.
 *  - Text it cannot map with a closed table is reported as `unmapped` and left
 *    out; placeholder text ("Not established ...") is ignored. Nothing is guessed.
 *  - It is a no-op unless a caller opts in (`useResearch`); default assessments
 *    are byte-identical with or without research loaded.
 */
(function (root) {
  'use strict';
  const NS = root.DA_OPTION_C_MODULES || (root.DA_OPTION_C_MODULES = {});
  const isNode = typeof module !== 'undefined' && !!module.exports && typeof require === 'function';
  const DERIVATION_VERSION = 'option-c-research-derivation-v2';

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
  /* v2 (2026-11-27): also reads the noun forms ("vulnerability to", "weakness against") and one
   * intensity word from a closed list before the domain ("vulnerability to intense electrical
   * discharges"). An energy DRAIN is not a weakness to energy attacks, so it never matches. */
  const WEAK_LEAD = '\\b(?:weak\\w*|vulnerab\\w*|susceptib\\w*)\\s+(?:to|against)\\s+(?:(?:intense|severe|strong|powerful|high-tier|direct|concentrated|sustained)\\s+)?';
  const WEAK_PATTERNS = Object.freeze([
    { domain: 'magic', re: new RegExp(WEAK_LEAD + '(?:magic\\w*|mystic\\w*|sorcer\\w*)(?!\\s+(?:drain|containment))', 'i') },
    { domain: 'psychic', re: new RegExp(WEAK_LEAD + '(?:psychic|psionic|mind control|mental (?:attack|assault|manipulation)\\w*|telepath\\w*)', 'i') },
    { domain: 'energy', re: new RegExp(WEAK_LEAD + '(?:energy|electric\\w*|lightning)(?!\\s+(?:drain|deplet|loss|absor))', 'i') },
  ]);
  /* A power barrier named in the record's own defense wording. Only explicit barrier wording counts;
   * a mental "psychic shield" guards the mind (GUARD_PATTERNS), it is not a barrier against blows. */
  const SHIELD_PATTERNS = Object.freeze([
    { kind: 'telekinetic', re: /\b(telekinetic|psionic) (shield|barrier|force ?field)\w*/i },
    { kind: 'force', re: /\bforce[- ]?(field|barrier|shield)s?\b/i },
    { kind: 'energy', re: /\benergy (shield|barrier)\w*/i },
    { kind: 'magical', re: /\b(magic(al)?|mystic(al)?|protective) (shield|ward|barrier|aura|charm|spell)\w*|\bshield charm\b|\bprotego\b/i },
  ]);
  /* Documented fighting or weapon technique -> proficiency level. The level word must sit in the SAME
   * technique as the fighting word ("Master martial arts", "Green Destiny sword mastery"); "Master of the
   * Mystic Arts" names no fighting technique and gives nothing. A named lightsaber form is formal training. */
  const FIGHT_WORDS = /\b(lightsaber\w*|sword\w*|blade\w*|fencing|spear\w*|axe\w*|archer\w*|bow and arrow\w*|marksm\w*|sniper\w*|sharpshoot\w*|firearm\w*|gun\w*|rifle\w*|pistol\w*|blaster\w*|martial art\w*|hand-to-hand|boxing|wrestl\w*|kung fu|karate|judo|ninjutsu|jeet kune do|duel\w*|combatives|kni(fe|ves)\w*|dagger\w*|quarterstaff|staff fighting)/i;
  const MASTER_WORDS = /\b(grand ?master\w*|master(y|ful|s|ed)?|peerless|unmatched|unrivall?ed|greatest)\b/i;
  const EXPERT_WORDS = /\b(expert\w*|elite|highly (skilled|trained)|accomplished|champion\w*|veteran|form (i|ii|iii|iv|v|vi|vii)\b)/i;
  const PROFICIENCY_LEVELS = Object.freeze(['trained', 'expert', 'master']);
  function proficiencyOf(techniques) {
    let best = null;
    for (const t of techniques) {
      if (!FIGHT_WORDS.test(t)) continue;
      const level = MASTER_WORDS.test(t) ? 'master' : EXPERT_WORDS.test(t) ? 'expert' : 'trained';
      if (!best || PROFICIENCY_LEVELS.indexOf(level) > PROFICIENCY_LEVELS.indexOf(best.level)) best = { level, technique: t };
    }
    return best;
  }
  function shieldOf(mechanisms) {
    for (const m of mechanisms) for (const p of SHIELD_PATTERNS) if (p.re.test(m)) return { kind: p.kind, mechanism: m };
    return null;
  }
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
      shield: shieldOf(clean(def.mechanisms)), proficiency: proficiencyOf(techniques),
      version: DERIVATION_VERSION, id: record.id, declaredStatus: String(record.researchStatus || 'unknown'),
      domains: lines, primaryDomain: lines.length ? lines[0] : null,
      techniques: techniques.slice(0, 3), range: typeof off.range === 'string' ? off.range : null,
      guards, weakTo, unmappedDomains: unmapped,
      source: src && typeof src.url === 'string' ? src.url : null,
      limitation: clean(record.limitations)[0] || null,
      continuity: typeof record.continuity === 'string' ? record.continuity : null,
    };
  }

  const api = { DERIVATION_VERSION, DOMAIN_MAP, CONVENTIONAL, GUARD_PATTERNS, WEAK_PATTERNS, SHIELD_PATTERNS, PROFICIENCY_LEVELS, proficiencyOf, shieldOf, deriveFromRecord };
  NS.researchProfile = api;
  if (isNode) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

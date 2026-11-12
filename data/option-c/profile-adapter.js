/* Option C — Character Profile Adapter.
 *
 * Converts an existing roster candidate (base character or selected variant)
 * into a versioned, read-only evaluation profile. It READS the Version 1
 * tables (12 attributes, ability index + provenance, typed battle profiles,
 * variant profiles, ToonForce/MuppetForce, sidekick roster) and never edits
 * them or the candidate it is given.
 *
 * Rules enforced here:
 *  - identity is `pool:Character` and `pool:Character|Form`, never display name only;
 *  - a selected form is not its base: an unreviewed form inherits NO typed power,
 *    and base ability tags are downgraded to `needs-review` for the form;
 *  - a missing ability is `unknown`, never a researched "no";
 *  - campaign/ability tags are capabilities-with-evidence, not combat tiers.
 */
(function (root) {
  'use strict';
  const NS = root.DA_OPTION_C_MODULES || (root.DA_OPTION_C_MODULES = {});
  const isNode = typeof module !== 'undefined' && !!module.exports && typeof require === 'function';
  const RT = NS.runtime || (isNode ? require('./runtime.js') : null);
  const REVIEWED = NS.reviewedCapabilities || (isNode ? require('./reviewed-capabilities.js') : null);
  const { EVIDENCE, ATTR_KEYS } = RT;
  const PROFILE_VERSION = 'option-c-profile-v1';

  /* Damage-domain classes shared with the interaction engine. They mirror the
   * groupings the existing combat model already uses (docs/brawl-combat-model.md). */
  const DOMAIN_CLASS = Object.freeze({
    physical: 'physical', melee: 'physical', tech: 'physical', toxin: 'physical',
    reality: 'high-order', cosmic: 'high-order', magic: 'high-order', elemental: 'high-order', time: 'high-order',
    psychic: 'typed', shadow: 'typed', speed: 'typed', energy: 'typed', control: 'typed',
    sonic: 'typed', toon: 'typed', regeneration: 'typed',
  });
  const domainClass = d => DOMAIN_CLASS[d] || 'typed';

  /* Ability-index verification -> Option C evidence status. */
  function tagStatus(verification) {
    switch (verification) {
      case 'owner-ruling':
      case 'corroborated': return EVIDENCE.REVIEWED;
      case 'credible':
      case 'unsourced': return EVIDENCE.PROVISIONAL; // reviewed grant; no source-linked feat yet
      // An investigation flag means the grant's evidence conflicts; it is not a researched denial.
      // Explicitly rejected grants are tracked separately in deniedTags as CONTRADICTED.
      case 'investigate': return EVIDENCE.NEEDS_REVIEW;
      default: return EVIDENCE.NEEDS_REVIEW;
    }
  }

  function parseId(text) {
    const s = String(text || '');
    const colon = s.indexOf(':');
    if (colon < 1) throw new Error('Option C requires a pool-qualified id (pool:Character[|Form]): ' + s);
    const bar = s.indexOf('|', colon);
    return {
      pool: s.slice(0, colon),
      base: bar < 0 ? s.slice(colon + 1) : s.slice(colon + 1, bar),
      form: bar < 0 ? null : s.slice(bar + 1),
    };
  }

  /* Minimal candidate for an id when no roster object is supplied (benchmarks,
   * tools). Attributes are NOT invented: they stay null. A form receives its
   * reviewed variant profile only when one exists in the catalog. */
  function candidateFromId(id) {
    const { pool, base, form } = parseId(id);
    if (!form) return { pool, n: base };
    const entry = RT.legacy().variantProfiles[pool + ':' + base + '|' + form] || null;
    return {
      pool, n: form, variantBase: base,
      variantAbilities: entry ? { ...entry, source: '', origin: '', continuity: '' } : null,
    };
  }

  function physicalTierOf(attrs) {
    if (!attrs) return null;
    // Same thresholds the live combat engine uses for conventional bodies.
    return attrs.str >= 90 && attrs.end >= 85 ? 3 : attrs.str >= 75 && attrs.end >= 70 ? 2 : 1;
  }

  function abilityTagRecords(pool, baseName, isVariant) {
    const L = RT.legacy().abilities;
    const base = { pool, n: baseName };
    const tags = L.characterAbilityTags(base);
    const out = [];
    if (Array.isArray(tags)) {
      for (const tag of tags) {
        const prov = L.characterAbilityProvenance(base, tag);
        const record = prov && prov.record ? prov.record : null;
        let status = prov ? tagStatus(prov.verification) : EVIDENCE.PROVISIONAL;
        const notes = [];
        if (prov && prov.basis === 'carry-over') notes.push('Reviewed pre-audit grant without a source-linked feat.');
        if (isVariant && EVIDENCE_RANK_GT(status, EVIDENCE.NEEDS_REVIEW)) {
          status = EVIDENCE.NEEDS_REVIEW;
          notes.push('Recorded for the base character; not yet confirmed for the selected form.');
        }
        out.push({
          tag, family: L.CHARACTER_ABILITY_BROAD_TAG[tag] || tag, status,
          verification: prov ? prov.verification : null, basis: prov ? prov.basis : 'index',
          source: record && record.source ? [].concat(record.source)[0] : null,
          continuity: record && record.continuity ? record.continuity : null,
          limitation: record && record.limitation ? record.limitation : null,
          inheritedFromBase: !!isVariant, notes,
        });
      }
    }
    const denied = (L.CHARACTER_ABILITY_DISPUTES || [])
      .filter(d => d.id === pool + ':' + baseName)
      .map(d => ({ tag: d.tag, status: EVIDENCE.CONTRADICTED, verdict: d.verdict, reason: d.reason, source: d.source || null }));
    return { audited: Array.isArray(tags), tags: out, denied };
  }
  function EVIDENCE_RANK_GT(a, b) { return RT.EVIDENCE_RANK[a] > RT.EVIDENCE_RANK[b]; }

  function continuityOf(candidate, isVariant, tagRecords, signature, force) {
    if (!isVariant && candidate.pool === 'nba') {
      return { label: 'Real-world athlete or coach', basis: 'roster pool', status: EVIDENCE.REVIEWED, note: null };
    }
    if (!isVariant && force) {
      return { label: force.feat, basis: (force.type === 'toonforce' ? 'ToonForce' : 'MuppetForce') + ' profile source work', status: EVIDENCE.PROVISIONAL, note: null };
    }
    if (isVariant) {
      const v = candidate.variantAbilities;
      const label = (v && (v.continuity || v.origin)) || null;
      return {
        label, basis: label ? 'selected-form record' : 'none',
        status: label ? EVIDENCE.PROVISIONAL : EVIDENCE.NEEDS_REVIEW,
        note: 'A selected form is evaluated as its own identity; base-character feats are not transferred.',
      };
    }
    const labels = RT.uniq(tagRecords.map(t => t.continuity).filter(Boolean));
    if (labels.length === 1) {
      return { label: labels[0], basis: 'ability-evidence records', status: EVIDENCE.PROVISIONAL, note: null };
    }
    return {
      label: labels.length ? labels.join(' / ') : null,
      basis: labels.length ? 'ability-evidence records (mixed)' : 'none',
      status: EVIDENCE.NEEDS_REVIEW,
      note: (labels.length
        ? 'Evidence cites more than one continuity; '
        : 'No continuity is recorded for this roster entry; ') +
        'feats from another adaptation of the same name are not assumed' +
        (signature ? ' (the typed battle profile cites: ' + (signature.source || 'no source') + ').' : '.'),
    };
  }

  function getProfile(candidate) {
    if (!candidate || !candidate.pool || !candidate.n) throw new Error('Option C profile requires a pool and name');
    const L = RT.legacy();
    const pool = String(candidate.pool);
    const isVariant = !!candidate.variantBase;
    const baseName = String(isVariant ? candidate.variantBase : candidate.n);
    const formName = isVariant ? String(candidate.n) : null;
    const id = pool + ':' + baseName;
    const formId = isVariant ? id + '|' + formName : null;

    const attributes = Array.isArray(candidate.a) && candidate.a.length === ATTR_KEYS.length
      ? Object.fromEntries(ATTR_KEYS.map((k, i) => [k, Number(candidate.a[i])]))
      : null;
    const physicalTier = physicalTierOf(attributes);

    const tagInfo = abilityTagRecords(pool, baseName, isVariant);
    const variantReviewed = isVariant && !!(candidate.variantAbilities && Array.isArray(candidate.variantAbilities.domains) && candidate.variantAbilities.domains.length);

    // Typed battle signature: the reviewed form profile for a selected form,
    // otherwise the documented baseline profile. Never the base kit for a form.
    const ability = L.attack.brawlAbilityOf(candidate);
    const signature = ability ? {
      id: 'signature', label: ability.move, domain: ability.domain, domainClass: domainClass(ability.domain),
      tier: ability.tier, pierce: ability.pierce, cooldown: ability.cooldown,
      selfLimiting: ability.wearStart ? { fromRound: ability.wearStart, note: 'Use carries a modeled metabolic cost to the user.' } : null,
      source: ability.source || null, limitation: ability.limit || null,
      continuity: ability.continuity || ability.origin || null,
      origin: isVariant ? 'variant-ability-profile' : 'brawl-attack-profile',
      evidenceStatus: EVIDENCE.REVIEWED,
    } : null;
    const guards = ability ? (ability.guard || []).slice() : [];
    const weakTo = ability ? (ability.weakTo || []).slice() : [];
    const ward = ability && ability.tier >= 4 && ['reality', 'cosmic', 'magic', 'elemental'].includes(ability.domain)
      ? { tier: ability.tier, note: 'Finite protective ward of a documented tier-4+ power; it depletes and is not invulnerability.' }
      : null;
    const apexRank = L.combat && typeof L.combat.apexRankOf === 'function' ? L.combat.apexRankOf(candidate, ability) : 0;

    const exceptionalRec = !isVariant ? L.exceptional.BRAWL_EXCEPTIONAL_POWER[id]
      : L.exceptional.BRAWL_EXCEPTIONAL_POWER[pool + ':' + formName];
    const exceptional = exceptionalRec ? {
      points: exceptionalRec[0], feat: exceptionalRec[1], source: exceptionalRec[2], limitation: exceptionalRec[3],
      note: 'Editorial Battle Royale adjustment already inside the position fit; not a canonical measurement.',
    } : null;

    const toon = L.toon.toonForceOf(candidate);
    const muppet = L.muppet.muppetForceOf(candidate);
    const sidekick = L.bench.sidekickOf({ pool, n: baseName });

    const sportCapabilities = REVIEWED.reviewedCapabilitiesFor(id).map(r => ({
      kind: r.capability, label: r.label, status: isVariant ? EVIDENCE.NEEDS_REVIEW : r.status,
      source: r.source, continuity: r.continuity, limitation: r.limitation, feat: r.feat, origin: 'option-c-reviewed-sample',
    }));

    const gaps = [];
    let combat;
    if (isVariant && !variantReviewed) {
      combat = EVIDENCE.UNKNOWN;
      gaps.push('Selected form has no reviewed ability profile: attributes change, but no power, defense or Apex rank is inferred.');
    } else if (signature) {
      combat = EVIDENCE.REVIEWED;
    } else if (toon || muppet) {
      combat = EVIDENCE.PROVISIONAL;
      gaps.push('Combat behavior is modeled through ' + (toon ? 'ToonForce' : 'MuppetForce') + ' facets only; no typed attack profile is on record.');
    } else if (tagInfo.tags.length) {
      combat = EVIDENCE.PROVISIONAL;
      gaps.push('Ability tags exist, but tags are not combat proficiency: no typed attack/defense profile has been researched.');
    } else {
      combat = EVIDENCE.UNKNOWN;
      gaps.push(tagInfo.audited
        ? 'No power is recorded and no typed combat profile exists; treated as conventional and UNKNOWN, not as proven powerless.'
        : 'Character is outside the audited ability index; abilities are unknown.');
    }
    if (!attributes) gaps.push('Numeric attributes were not supplied with this identity.');
    for (const t of tagInfo.tags) if (t.status === EVIDENCE.NEEDS_REVIEW && !t.inheritedFromBase) gaps.push('Ability "' + t.tag + '" is granted but its evidence still needs review.');
    const continuity = continuityOf(candidate, isVariant, tagInfo.tags, signature, toon || muppet);
    if (continuity.status === EVIDENCE.NEEDS_REVIEW) gaps.push('Continuity is not adjudicated for this entry.');

    return {
      schemaVersion: RT.SCHEMA_VERSION, profileVersion: PROFILE_VERSION,
      id, formId, key: formId || id, pool, baseName, formName,
      displayName: String(candidate.n), isVariant, variantReviewed,
      continuity, attributes, physicalTier,
      signature, guards, weakTo, ward, apexRank,
      apexLabel: apexRank === 2 ? 'Apex' : apexRank === 1 ? 'Empowered' : null,
      exceptional,
      forces: {
        toon: toon ? { score: toon.score, tier: toon.tier, dimensions: { ...toon.dimensions }, feat: toon.feat, limitation: toon.limit } : null,
        muppet: muppet ? { score: muppet.score, tier: muppet.tier, dimensions: { ...muppet.dimensions }, feat: muppet.feat, limitation: muppet.limit } : null,
      },
      role: {
        sidekick: sidekick ? { leads: sidekick.leads.slice(), note: sidekick.note, kind: 'role tag, not a power' } : null,
        signatureMove: candidate.sig ? { name: candidate.sig.name, kind: candidate.sig.kind } : null,
        playoffBoom: !!candidate.boom,
        chemistryGroups: Array.isArray(candidate.g) ? candidate.g.slice() : [],
      },
      abilityTags: tagInfo.tags, deniedTags: tagInfo.denied, tagsAudited: tagInfo.audited,
      sportCapabilities,
      evidence: { combat, gaps },
    };
  }

  const getProfileById = id => getProfile(candidateFromId(id));

  const api = { PROFILE_VERSION, DOMAIN_CLASS, domainClass, parseId, candidateFromId, getProfile, getProfileById, physicalTierOf, tagStatus };
  NS.profileAdapter = api;
  if (isNode) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

/* Option C — typed Ability Interaction Engine (Battle Royale).
 *
 * Answers, for an attacker profile against a defender profile: which of the
 * attacker's DOCUMENTED ways of attacking has a realistic path to hurting
 * this defender, and what stands in the way. It is a small set of general
 * rules over typed capabilities — not a tier ladder, not additive stat
 * bonuses and not a table of pairwise winners.
 *
 * Every rule fires only on recorded facts (typed battle/variant profiles,
 * attribute-derived body tier, ToonForce). When a fact is missing the result
 * says so; nothing is invented. The step values are ordinal "leverage" steps,
 * an editorial vocabulary, not damage numbers.
 */
(function (root) {
  'use strict';
  const NS = root.DA_OPTION_C_MODULES || (root.DA_OPTION_C_MODULES = {});
  const isNode = typeof module !== 'undefined' && !!module.exports && typeof require === 'function';
  const RT = NS.runtime || (isNode ? require('./runtime.js') : null);
  const { EVIDENCE } = RT;

  /* The rulebook. `id` is stable and appears in every explanation. */
  const RULES = Object.freeze({
    'durability-gap': {
      title: 'Conventional attack into a tougher body',
      text: 'Punches, gadgets and toxins lose effect against a body one or more physical tiers above the attacker.',
    },
    'physical-overmatch': {
      title: 'Physical overmatch',
      text: 'A conventional attacker two physical tiers above an unwarded, non-cartoon defender overpowers them.',
    },
    'toon-physics-ignores-gap': {
      title: 'Cartoon physics is not a conventional blow',
      text: 'A ToonForce character\'s gags are not reduced by the ordinary physical-durability gap (still no guaranteed hit).',
    },
    'high-order-burst': {
      title: 'High-order power does not scale with punching strength',
      text: 'A documented tier-4+ reality, cosmic, magical, elemental or temporal technique has a bounded effect that bypasses conventional durability.',
    },
    'typed-bypass': {
      title: 'Typed power is not judged as a punch',
      text: 'A documented non-physical technique is not reduced by the defender\'s physical tier; its own guards and weaknesses decide.',
    },
    'domain-guard': {
      title: 'Specific resistance',
      text: 'The defender has a documented guard against this domain, which weakens (does not nullify) the technique.',
    },
    'domain-weakness': {
      title: 'Specific vulnerability',
      text: 'The defender has a documented vulnerability to this domain.',
    },
    'finite-ward': {
      title: 'Finite high-order ward',
      text: 'A documented tier-4+ being carries a depletable protective ward that conventional attacks must first exhaust.',
    },
    'apex-shell': {
      title: 'Selected Apex/Empowered form',
      text: 'A reviewed pinnacle form shrugs off most conventional and low-tier attacks; it is not invincible.',
    },
    'apex-counter': {
      title: 'High-order counter to a pinnacle form',
      text: 'A documented tier-4+ high-order technique remains a credible threat to an Apex/Empowered form.',
    },
    'apex-pressure': {
      title: 'Pinnacle form on offense',
      text: 'A reviewed Apex/Empowered form attacks far above its base profile and acts again after the normal initiative pass.',
    },
    'high-order-passive-defense': {
      title: 'High-order passive defense',
      text: 'A baseline tier-4+ reality/cosmic/magic being blunts even a pinnacle form\'s attacks.',
    },
    'self-limiting': {
      title: 'Self-limiting technique',
      text: 'Using this form or technique costs the user over time; a long fight favors the opponent.',
    },
    'initiative': {
      title: 'Initiative',
      text: 'A clear speed-and-reflex edge lets a fighter act first each round (numeric attributes; informational).',
    },
    'unknown-kit': {
      title: 'Unresearched kit',
      text: 'No typed profile is on record for this fighter. Only conventional, attribute-driven attacks are assessed; real abilities may exist.',
    },
  });

  const LEVERAGE = Object.freeze(['negligible', 'blunted', 'even', 'strong', 'decisive']);
  const leverageLabel = score => LEVERAGE[Math.max(-2, Math.min(2, score)) + 2];
  const HIGH = ['reality', 'cosmic', 'magic', 'elemental', 'time'];

  function optionsOf(p) {
    const list = [{
      id: 'conventional', label: 'Conventional attacks', domain: 'physical', domainClass: 'physical',
      tier: p.physicalTier, signature: false,
    }];
    if (p.signature) list.push({ ...p.signature, signature: true });
    return list;
  }

  function assessOption(o, att, def) {
    const steps = [];
    let score = 0;
    const add = (rule, delta, detail) => { steps.push({ rule, delta, detail }); score += delta; };
    const highOrder = o.signature && HIGH.includes(o.domain) && o.tier >= 4;

    if (o.domainClass === 'physical') {
      if (att.forces.toon) {
        add('toon-physics-ignores-gap', 0, att.displayName + ' fights with cartoon physics.');
      } else if (att.physicalTier != null && def.physicalTier != null) {
        const gap = def.physicalTier - att.physicalTier;
        if (gap > 0) add('durability-gap', -Math.min(2, gap), def.displayName + ' is ' + gap + ' physical tier(s) above ' + att.displayName + '.');
        // Cartoon resilience and high-order wards are their own defenses, so no overmatch there.
        if (gap <= -2 && !def.ward && !def.forces.toon) add('physical-overmatch', 1, att.displayName + ' is ' + (-gap) + ' physical tiers above ' + def.displayName + '.');
      }
      if (def.ward) add('finite-ward', -1, def.displayName + ' has a tier-' + def.ward.tier + ' ward to exhaust first.');
    } else if (highOrder) {
      add('high-order-burst', 1, o.label + ' (' + o.domain + ', tier ' + o.tier + ').');
    } else if (o.signature) {
      add('typed-bypass', 0, o.label + ' (' + o.domain + ', tier ' + o.tier + ').');
    }
    if (o.signature && def.guards.includes(o.domain)) add('domain-guard', -1, def.displayName + ' guards against ' + o.domain + '.');
    if (o.signature && def.weakTo.includes(o.domain)) add('domain-weakness', 1, def.displayName + ' is vulnerable to ' + o.domain + '.');

    if (def.apexRank && !att.apexRank) {
      if (highOrder) {
        add('apex-counter', 0, o.label + ' can still threaten ' + def.displayName + ' (' + def.apexLabel + ').');
      } else {
        const threat = Math.max(o.signature ? o.tier : 0, att.physicalTier === 3 ? 3 : 0);
        add('apex-shell', def.apexRank === 2 || threat < 3 ? -2 : -1, def.displayName + ' is a selected ' + def.apexLabel + ' form.');
      }
    }
    if (att.apexRank && !def.apexRank) {
      add('apex-pressure', att.apexRank === 2 ? 2 : 1, att.displayName + ' is a selected ' + att.apexLabel + ' form.');
      if (def.signature && def.signature.tier >= 4 && ['reality', 'cosmic', 'magic'].includes(def.signature.domain)) {
        add('high-order-passive-defense', -1, def.displayName + ' holds a tier-' + def.signature.tier + ' ' + def.signature.domain + ' defense.');
      }
    }
    if (o.signature && o.selfLimiting) add('self-limiting', 0, 'Cost begins in round ' + o.selfLimiting.fromRound + '.');
    return { option: o.id, label: o.label, domain: o.domain, tier: o.tier, score, steps };
  }

  /* Attacker -> defender: best documented line of attack and what resists it. */
  function assessThreat(att, def) {
    const assessed = optionsOf(att).map(o => assessOption(o, att, def));
    // Prefer the higher leverage; on a tie prefer the documented signature.
    assessed.sort((a, b) => b.score - a.score || (a.option === 'signature' ? -1 : b.option === 'signature' ? 1 : 0));
    const best = assessed[0];
    const unknownKit = !att.signature && att.evidence.combat !== EVIDENCE.REVIEWED;
    const steps = best.steps.slice();
    if (unknownKit) steps.push({ rule: 'unknown-kit', delta: 0, detail: att.displayName + ' has no typed attack profile on record.' });
    const score = Math.max(-2, Math.min(2, best.score));
    let evidence = unknownKit ? (att.evidence.combat === EVIDENCE.UNKNOWN ? EVIDENCE.UNKNOWN : EVIDENCE.PROVISIONAL) : EVIDENCE.REVIEWED;
    if (att.physicalTier == null || def.physicalTier == null) evidence = EVIDENCE.UNKNOWN;
    return {
      attacker: att.key, defender: def.key, attackerName: att.displayName, defenderName: def.displayName,
      via: best.label, domain: best.domain, tier: best.tier,
      score, leverage: leverageLabel(score), rules: steps.map(s => s.rule), steps, evidence,
      alternatives: assessed.slice(1).map(a => ({ via: a.label, score: Math.max(-2, Math.min(2, a.score)) })),
    };
  }

  /* Informational, attribute-based initiative note (not weighted separately:
   * speed and reflexes are already part of the numeric baseline). */
  function initiativeNote(a, b) {
    if (!a.attributes || !b.attributes) return null;
    const ia = 0.57 * a.attributes.spd + 0.43 * a.attributes.ref;
    const ib = 0.57 * b.attributes.spd + 0.43 * b.attributes.ref;
    if (Math.abs(ia - ib) < 18) return null; // inside the engine's per-round initiative swing
    const first = ia > ib ? a : b;
    return { rule: 'initiative', holder: first.key, holderName: first.displayName, edge: RT.round(Math.abs(ia - ib), 1) };
  }

  /* Team view: every fighter of each side against every opposing fighter. */
  function assessBattle(profilesA, profilesB) {
    const matrix = (xs, ys) => xs.map(x => ys.map(y => assessThreat(x, y)));
    const ab = matrix(profilesA, profilesB), ba = matrix(profilesB, profilesA);
    const side = (m, own, foes) => {
      if (!own.length || !foes.length) return { pressure: 0, carry: 0, index: 0, carryFighter: null, unanswered: [] };
      // pressure: for each opposing fighter, our best documented answer.
      const answers = foes.map((_, j) => Math.max(...m.map(row => row[j].score)));
      const pressure = answers.reduce((s, v) => s + v, 0) / answers.length;
      // carry: our single most effective fighter across their whole lineup.
      const means = m.map(row => row.reduce((s, c) => s + c.score, 0) / row.length);
      const carry = Math.max(...means);
      const carryFighter = own[means.indexOf(carry)];
      return {
        pressure: RT.round(pressure, 4), carry: RT.round(carry, 4),
        index: RT.round(0.6 * pressure + 0.4 * carry, 4),
        carryFighter: carryFighter ? carryFighter.key : null,
        unanswered: foes.filter((_, j) => answers[j] <= -1).map(f => f.key),
      };
    };
    const initiative = [];
    for (const a of profilesA) for (const b of profilesB) { const n = initiativeNote(a, b); if (n) initiative.push({ ...n, pair: [a.key, b.key] }); }
    return { ab, ba, a: side(ab, profilesA, profilesB), b: side(ba, profilesB, profilesA), initiative };
  }

  const api = { RULES, LEVERAGE, leverageLabel, assessThreat, assessBattle };
  NS.interactionEngine = api;
  if (isNode) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

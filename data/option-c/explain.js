/* Option C — Explanation Engine.
 *
 * Turns the structured findings (profiles, typed interactions, sport rulings,
 * the effect ledger and the probability model) into plain-language win
 * conditions, risks, decisive factors and uncertainties. It only restates
 * recorded findings: it never adds a power, ruling, source or number.
 */
(function (root) {
  'use strict';
  const NS = root.DA_OPTION_C_MODULES || (root.DA_OPTION_C_MODULES = {});
  const isNode = typeof module !== 'undefined' && !!module.exports && typeof require === 'function';
  const RT = NS.runtime || (isNode ? require('./runtime.js') : null);
  const IE = NS.interactionEngine || (isNode ? require('./interaction-engine.js') : null);
  const { EVIDENCE } = RT;

  const list = xs => (xs.length <= 1 ? xs.join('') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1]);
  const ruleTitles = ids => RT.uniq(ids).filter(id => IE.RULES[id]).map(id => IE.RULES[id].title);

  /* What a character can actually do, from the profile alone. */
  function characterSummary(row) {
    const p = row.profile, bits = [];
    if (p.isVariant) bits.push(p.variantReviewed ? 'Selected form of ' + p.baseName + ' with a reviewed form profile' + (p.apexLabel ? ' (' + p.apexLabel + ')' : '') + '.' : 'Selected form of ' + p.baseName + '; unreviewed, so only its attributes differ.');
    if (p.signature) bits.push('Documented technique: ' + p.signature.label + ' (' + p.signature.domain + ', tier ' + p.signature.tier + ').' + (p.signature.limitation ? ' Limit: ' + p.signature.limitation : ''));
    if (p.guards.length) bits.push('Guards against ' + list(p.guards) + '.');
    if (p.weakTo.length) bits.push('Vulnerable to ' + list(p.weakTo) + '.');
    if (p.exceptional) bits.push('Registered exceptional power: ' + p.exceptional.feat + ' Limit: ' + p.exceptional.limitation);
    if (p.forces.toon) bits.push('ToonForce ' + p.forces.toon.score + ' (' + p.forces.toon.tier + '): individual cartoon physics. Limit: ' + p.forces.toon.limitation);
    if (p.forces.muppet) bits.push('MuppetForce ' + p.forces.muppet.score + ' (' + p.forces.muppet.tier + '). Limit: ' + p.forces.muppet.limitation);
    const tags = p.abilityTags.filter(t => t.tag === t.family);
    if (tags.length) bits.push('Ability index: ' + tags.map(t => t.tag + ' [' + t.status + ']').join(', ') + '.');
    if (p.role.sidekick) bits.push('Sidekick role tag (supports ' + list(p.role.sidekick.leads) + ').');
    if (p.role.signatureMove) bits.push('Signature move "' + p.role.signatureMove.name + '" (' + p.role.signatureMove.kind + ').');
    if (!bits.length) bits.push('No power or typed profile is on record; assessed on the 12 numeric attributes only.');
    return { character: p.key, displayName: p.displayName, position: row.pos.id, role: row.role, fit: row.fit,
      combatEvidence: p.evidence.combat, continuity: p.continuity.status, summary: bits.join(' '), gaps: p.evidence.gaps.slice() };
  }

  function teamEffectsText(summary, ledgerEntries) {
    const out = [];
    const val = key => { const e = ledgerEntries.find(x => x.stackKey === key); return e ? e.value : 0; };
    if (summary.muppetPercent) out.push('MuppetForce ensemble lifts the whole team ' + summary.muppetPercent + '% (' + RT.round(val('muppetforce-team'), 2) + ' rating points, cap 22%)');
    if (summary.benchChemistryPercent) out.push('bench chemistry ' + summary.benchChemistryPercent + '%' + (summary.sidekickOnBench ? ' (sidekick lock' + (summary.leads.length ? ' + reunion with ' + list(summary.leads) : '') + ')' : '') + (summary.mesh.length ? ' meshing with ' + list(summary.mesh) : '') + ', cap 8%');
    if (summary.chemistryLinks.length) out.push('chemistry: ' + list(summary.chemistryLinks) + ' (' + RT.round(val('chemistry-total'), 2) + ' pts)');
    const lift = val('signature-lift-total'), chaos = val('signature-chaos-total');
    if (lift) out.push('signature lift +' + RT.round(lift, 2));
    if (chaos) out.push('chaos signatures cost the opponent ' + RT.round(-chaos, 2));
    if (val('coach-style')) out.push('coaching style ' + (val('coach-style') > 0 ? '+' : '') + RT.round(val('coach-style'), 2));
    if (val('variant-total')) out.push('selected form bonus +' + RT.round(val('variant-total'), 2));
    return out;
  }

  function brawlSide({ rows, foes, matrix, foeMatrix, own, summary, ledgerEntries, trailing }) {
    const win = [], risks = [], advantages = [];
    rows.forEach((row, i) => {
      const hits = matrix[i].filter(t => t.score >= 1);
      if (!hits.length) return;
      const p = row.profile, top = hits.slice().sort((a, b) => b.score - a.score)[0];
      const answers = foes.filter((f, j) => matrix[i][j].score < 0).map(f => f.profile.displayName);
      const threats = foes.filter((f, j) => foeMatrix[j][i].score >= 1).map(f => f.profile.displayName);
      win.push({
        type: p.apexRank ? 'pinnacle-form' : top.domain === 'physical' && top.via === 'Conventional attacks' ? 'physical-advantage' : 'typed-power', character: p.key,
        text: p.displayName + ' can win exchanges with ' + top.via + ' against ' + list(hits.map(h => h.defenderName)) + ' (' + list(ruleTitles(hits.flatMap(h => h.steps.filter(s => s.delta > 0).map(s => s.rule)))).toLowerCase() + ').',
        counteredBy: answers.length ? 'Blunted against ' + list(answers) + '.' : null,
        threatenedBy: threats.length ? list(threats) + ' can hurt ' + p.displayName + ' in return.' : null,
        limitation: p.signature ? p.signature.limitation : null,
        evidence: RT.worst(hits.map(h => h.evidence)),
      });
      advantages.push({ kind: 'interaction', character: p.key, weight: hits.reduce((s, h) => s + h.score, 0),
        text: p.displayName + ': ' + top.leverage + ' leverage via ' + top.via + ' on ' + hits.length + ' of ' + foes.length + ' opponents.' });
    });
    const effects = teamEffectsText(summary, ledgerEntries);
    if (effects.length) win.push({ type: 'team-effects', text: 'Team-wide support already inside the rating: ' + effects.join('; ') + '.', evidence: EVIDENCE.REVIEWED, alreadyInRating: true });
    if (summary.toonSpotlightCandidate) win.push({ type: 'conditional-event', text: summary.toonSpotlightCandidate + ' may land one seeded ToonForce spotlight gag (not guaranteed; an individual event, not a team aura).', evidence: EVIDENCE.REVIEWED });
    if (!win.some(w => w.type === 'typed-power' || w.type === 'pinnacle-form')) {
      const unknown = rows.some(r => r.profile.evidence.combat === EVIDENCE.UNKNOWN || r.profile.evidence.combat === EVIDENCE.PROVISIONAL);
      win.push({ type: 'attrition', text: 'No reviewed typed win condition on record: this side must win through conventional attrition, focus fire, initiative and seeded variance' + (unknown ? '. Some fighters are unresearched, so real abilities may exist.' : '.'),
        evidence: unknown ? EVIDENCE.UNKNOWN : EVIDENCE.PROVISIONAL });
    }
    if (own.unanswered.length) risks.push({ type: 'unanswered-opponent', text: 'No documented way to seriously hurt ' + list(foes.filter(f => own.unanswered.includes(f.profile.key)).map(f => f.profile.displayName)) + '.' });
    rows.forEach(row => {
      const p = row.profile;
      if (p.signature && p.signature.selfLimiting) risks.push({ type: 'self-limiting', text: p.displayName + ': ' + p.signature.label + ' taxes the user from round ' + p.signature.selfLimiting.fromRound + '; a long fight favors the opponent.' });
      const exploiters = foes.filter(f => f.profile.signature && p.weakTo.includes(f.profile.signature.domain)).map(f => f.profile.displayName);
      if (exploiters.length) risks.push({ type: 'vulnerability', text: p.displayName + ' is vulnerable to ' + list(p.weakTo) + ', which ' + list(exploiters) + ' can bring.' });
    });
    if (trailing) risks.push({ type: 'numeric-deficit', text: 'Trails on the numeric position-fit baseline.' });
    return { winConditions: win, risks, advantages, constraints: [] };
  }

  function sportSide({ rows, foeRows, rulings, summary, ledgerEntries }) {
    const win = [], risks = [], advantages = [], constraints = [];
    const byPos = Object.fromEntries(foeRows.map(r => [r.pos.id, r]));
    const edges = rows.filter(r => r.role === 'starter' && byPos[r.pos.id]).map(r => ({ r, d: r.fit - byPos[r.pos.id].fit, o: byPos[r.pos.id] }))
      .sort((a, b) => b.d - a.d);
    for (const e of edges.filter(x => x.d >= 6).slice(0, 3)) {
      win.push({ type: 'position-edge', character: e.r.profile.key, evidence: EVIDENCE.REVIEWED,
        text: e.r.profile.displayName + ' holds a ' + RT.round(e.d, 1) + '-point fit edge at ' + (e.r.pos.ab || e.r.pos.id) + ' over ' + e.o.profile.displayName + ' (existing 12-attribute position formula).' });
      advantages.push({ kind: 'position-fit', character: e.r.profile.key, weight: RT.round(e.d / 10, 2), text: (e.r.pos.ab || e.r.pos.id) + ': ' + e.r.profile.displayName + ' +' + RT.round(e.d, 1) + ' fit.' });
    }
    for (const e of edges.filter(x => x.d <= -6).slice(-2)) risks.push({ type: 'position-deficit', text: 'Gives up ' + RT.round(-e.d, 1) + ' fit points at ' + (e.r.pos.ab || e.r.pos.id) + ' to ' + e.o.profile.displayName + '.' });
    for (const a of rulings.applications) {
      const who = rows.find(r => r.profile.key === a.character);
      const name = who ? who.profile.displayName : a.character;
      if (a.advantage === 'recognized') {
        win.push({ type: 'legal-ability', character: a.character, evidence: a.capability.status,
          text: name + ' may legally use ' + a.capability.label + ' to: ' + a.action.toLowerCase() + ' (' + a.effect.positionRelevance + ' relevance at ' + a.position + '). ' + a.reason,
          counteredBy: a.counter && a.counter.status === 'mirrored' ? 'Mirrored by ' + list(a.counter.by) + '.' : null, appliedToRating: false });
        advantages.push({ kind: 'legal-ability', character: a.character, weight: 0, text: name + ': ' + a.capability.label + ' is legal for ' + a.effect.duty + ' (unweighted in shadow mode).' });
      } else if (a.advantage === 'pending-capability-review') {
        risks.push({ type: 'pending-evidence', text: name + '\'s ' + a.capability.label + ' would be legal here, but its evidence still needs review, so no advantage is recognized yet.' });
      } else if (a.ruling === 'prohibited') {
        constraints.push({ type: 'prohibited-use', character: a.character, ruleId: a.ruleId, text: name + ' may not ' + a.action.charAt(0).toLowerCase() + a.action.slice(1) + '. ' + a.rule });
      }
    }
    for (const r of rulings.restrictions) constraints.push({ type: 'position-restriction', character: r.character, ruleId: r.ruleId, text: r.position + ': ' + r.rule });
    const effects = teamEffectsText(summary, ledgerEntries);
    if (effects.length) win.push({ type: 'team-effects', text: 'Team-wide support already inside the rating: ' + effects.join('; ') + '.', evidence: EVIDENCE.REVIEWED, alreadyInRating: true });
    if (summary.toonSpotlightCandidate) win.push({ type: 'conditional-event', text: summary.toonSpotlightCandidate + ' may land one seeded ToonForce spotlight moment (not guaranteed; individual, not a team aura).', evidence: EVIDENCE.REVIEWED });
    if (!win.length) win.push({ type: 'numeric-baseline', text: 'No standout edge on record; relies on overall position fit and match variance.', evidence: EVIDENCE.PROVISIONAL });
    return { winConditions: win, risks, advantages, constraints };
  }

  function headline({ names, probability, favoredIndex, basis, status }) {
    if (favoredIndex < 0) return 'Too close to separate on the evidence on record (' + status + ').';
    const f = favoredIndex, d = 1 - f;
    return names[f] + ' is favored over ' + names[d] + ', roughly ' + Math.round(probability[f] * 100) + '/' + Math.round(probability[d] * 100) +
      ' (editorial estimate, ' + status + '; ' + (basis === 'numeric-baseline-only' ? 'numeric baseline only' : 'numeric baseline plus typed interactions') + ').';
  }

  const api = { characterSummary, brawlSide, sportSide, teamEffectsText, headline };
  NS.explain = api;
  if (isNode) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

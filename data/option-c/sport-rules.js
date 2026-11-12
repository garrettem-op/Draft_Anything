/* Option C — Sport Rules Evaluator (initial framework).
 *
 * Applies the five-step supernatural-officiating test from
 * docs/OPTION_C_CHARACTER_INTELLIGENCE.md to one character, one capability and
 * one position:
 *   1 capability  — does this roster identity have it (with what evidence)?
 *   2 environment — can it operate in this venue?
 *   3 legality    — allowed | prohibited | needs-review | not-applicable
 *   4 effect      — what it does for THIS position (qualitative)
 *   5 counter     — can the opposing lineup meaningfully answer it?
 *
 * PR 1 scope: a compact rulebook with a few rulings whose status is clear from
 * the owner's design documents or from ordinary rules that plainly still
 * apply, and explicit `needs-review` for everything the owner has not ruled
 * on. A `needs-review` or `prohibited` application never produces an
 * advantage, and in shadow mode NO application changes any number.
 */
(function (root) {
  'use strict';
  const NS = root.DA_OPTION_C_MODULES || (root.DA_OPTION_C_MODULES = {});
  const isNode = typeof module !== 'undefined' && !!module.exports && typeof require === 'function';
  const RT = NS.runtime || (isNode ? require('./runtime.js') : null);
  const { EVIDENCE } = RT;

  const RULESET_ID = 'option-c-officiating-v1';
  const SPORT_KEYS = Object.freeze(['basketball', 'football', 'soccer', 'baseball', 'hockey', 'volleyball']);
  const RULING = Object.freeze({ ALLOWED: 'allowed', PROHIBITED: 'prohibited', NEEDS_REVIEW: 'needs-review', NOT_APPLICABLE: 'not-applicable' });

  /* Ability-index tags that establish each Option C capability kind. Vehicle
   * and mount flight is deliberately excluded: it is equipment, not the
   * player's own ability on a court or field. */
  const CAPABILITY_TAGS = Object.freeze({
    flight: ['natural-flight', 'powered-flight', 'glide'],
    telekinesis: ['telekinesis'],
    portals: ['portals', 'teleports-others', 'self-teleport'],
  });
  const CAPABILITY_LABEL = Object.freeze({
    flight: 'Personal flight', telekinesis: 'Telekinesis', portals: 'Portals / teleportation',
    'danger-sense': 'Danger sense / anticipation',
  });

  /* Which numeric position weights say a duty matters at a position. This
   * reuses the existing 12-attribute position formulas to express position
   * differences; it adds no new numbers to any rating. */
  const DUTY_ATTRS = Object.freeze({ coverage: ['spd', 'lep', 'agi'], anticipation: ['ref'] });

  /* The rulebook. basis: where the ruling comes from.
   *   owner-design-doc   — stated in docs/OPTION_C_CHARACTER_INTELLIGENCE.md
   *   ordinary-rule      — a normal rule of the sport that the owner's brief says still applies
   *   position-rule      — an existing position restriction of the game
   *   unresolved         — no approved interpretation yet
   */
  const RULEBOOK = Object.freeze([
    { id: 'flight-off-ball-coverage', capability: 'flight', sports: '*', positions: '*', duty: 'coverage',
      action: 'Move through the air without the ball to cover ground, contest and reach',
      ruling: RULING.ALLOWED, basis: 'owner-design-doc',
      rule: 'No rule of these sports limits how a player moves without the ball inside the playing area.',
      reason: 'The design contract states flight can increase coverage and reach; ordinary possession, contact and scoring rules still apply.',
      effect: 'Wider coverage and higher reach at this position.' },
    { id: 'flight-basketball-carry', capability: 'flight', sports: ['basketball'], positions: '*',
      action: 'Fly while holding the ball without dribbling',
      ruling: RULING.PROHIBITED, basis: 'ordinary-rule',
      rule: 'Traveling: a player may not move with the ball without dribbling.',
      reason: 'Flight does not waive traveling or possession rules.' },
    { id: 'flight-basketball-goaltend', capability: 'flight', sports: ['basketball'], positions: '*',
      action: 'Hover at the rim to take shots off their downward flight or off the cylinder',
      ruling: RULING.PROHIBITED, basis: 'ordinary-rule',
      rule: 'Goaltending and basket interference.',
      reason: 'Flight does not waive scoring or interference rules.' },
    { id: 'flight-basketball-air-dribble', capability: 'flight', sports: ['basketball'], positions: '*',
      action: 'Dribble while airborne for an extended time',
      ruling: RULING.NEEDS_REVIEW, basis: 'unresolved',
      rule: 'Dribble and traveling rules do not contemplate sustained flight.',
      reason: 'Needs an approved game-specific officiating interpretation before it is treated as legal or illegal.' },
    { id: 'flight-with-possession', capability: 'flight', sports: ['football', 'soccer', 'hockey', 'baseball', 'volleyball'], positions: '*',
      action: 'Carry or play the ball/puck while flying above the playing surface',
      ruling: RULING.NEEDS_REVIEW, basis: 'unresolved',
      rule: 'Boundary, possession and contact rules do not contemplate flight.',
      reason: 'No approved interpretation yet for this sport.' },
    { id: 'telekinesis-move-ball', capability: 'telekinesis', sports: '*', positions: '*',
      action: 'Move the ball or puck without an ordinary legal contact',
      ruling: RULING.NEEDS_REVIEW, basis: 'unresolved',
      rule: 'Handling, contact and possession rules assume physical touches.',
      reason: 'Telekinesis changes what a character can do; it does not establish that a contact-free play is legal.' },
    { id: 'telekinesis-affect-opponent', capability: 'telekinesis', sports: '*', positions: '*',
      action: 'Move or restrain an opposing player at a distance',
      ruling: RULING.NEEDS_REVIEW, basis: 'unresolved',
      rule: 'Foul and interference rules assume physical contact.',
      reason: 'No approved interpretation of contact-free interference.' },
    { id: 'portal-football-forward-pass', capability: 'portals', sports: ['football'], positions: '*',
      action: 'Send a pass or ball carrier through a portal',
      ruling: RULING.NEEDS_REVIEW, basis: 'unresolved',
      rule: 'Forward-pass, line-of-scrimmage and boundary rules do not contemplate portals.',
      reason: 'A portal is not assumed to be equivalent to a legal forward pass.' },
    { id: 'portal-relocation', capability: 'portals', sports: ['basketball', 'soccer', 'hockey', 'baseball', 'volleyball'], positions: '*',
      action: 'Relocate the ball or a player through a portal',
      ruling: RULING.NEEDS_REVIEW, basis: 'unresolved',
      rule: 'Possession, boundary and substitution rules do not contemplate portals.',
      reason: 'No approved interpretation yet for this sport.' },
    { id: 'danger-sense-anticipation', capability: 'danger-sense', sports: '*', positions: '*', duty: 'anticipation',
      action: 'Read and react to an opponent\'s play earlier than ordinary senses allow',
      ruling: RULING.ALLOWED, basis: 'owner-design-doc',
      rule: 'Perception involves no contact with the ball or an opponent; no rule of these sports regulates it.',
      reason: 'The design contract states a danger sense can aid anticipation; the player must still respect every contact, net, rotation and position rule.',
      effect: 'Earlier reads on attacks, shots and passes at this position.' },
  ]);

  /* Position restrictions that hold whatever a character's powers are.
   * Volleyball entries match the existing box-score model in data/after-action.js. */
  const POSITION_RULES = Object.freeze([
    { id: 'volleyball-libero-no-attack-or-block', sport: 'volleyball', positions: ['lib'],
      ruling: RULING.PROHIBITED, basis: 'position-rule',
      action: 'Complete an attack above the net or block',
      rule: 'A libero is a back-row specialist and may not block or attack the ball above net height.',
      statEligibility: { kills: false, blocks: false },
      reason: 'Powers do not grant a libero an otherwise prohibited action; the box score credits a libero no kills or blocks.' },
    { id: 'volleyball-middle-no-digs', sport: 'volleyball', positions: ['mb1', 'mb2'],
      ruling: RULING.NOT_APPLICABLE, basis: 'position-rule',
      action: 'Be credited with digs',
      rule: 'Draft Anything\'s box-score model does not assign digs to middle blockers.',
      statEligibility: { digs: false },
      reason: 'Existing stat-eligibility rule of the game; individual PTS = KILLS + BLK + ACE.' },
  ]);

  function capabilitiesOf(profile) {
    const out = [];
    for (const [kind, tags] of Object.entries(CAPABILITY_TAGS)) {
      const hits = profile.abilityTags.filter(t => tags.includes(t.tag));
      if (!hits.length) continue;
      const best = hits.slice().sort((a, b) => RT.EVIDENCE_RANK[b.status] - RT.EVIDENCE_RANK[a.status])[0];
      out.push({ kind, label: CAPABILITY_LABEL[kind], status: best.status, source: best.source, continuity: best.continuity,
        limitation: best.limitation, basis: 'ability index tag "' + best.tag + '"' });
    }
    for (const c of profile.sportCapabilities) {
      out.push({ kind: c.kind, label: c.label, status: c.status, source: c.source, continuity: c.continuity, limitation: c.limitation, basis: c.origin });
    }
    return out;
  }

  function dutyRelevance(pos, duty) {
    const w = pos && pos.w;
    if (!duty || !w) return { level: 'unrated', share: null };
    const total = Object.values(w).reduce((s, v) => s + v, 0);
    if (!total) return { level: 'unrated', share: null };
    const share = DUTY_ATTRS[duty].reduce((s, k) => s + (w[k] || 0), 0) / total;
    // Share of the position's own weight formula devoted to the duty's attributes.
    return { level: share >= 0.25 ? 'high' : share >= 0.1 ? 'moderate' : 'low', share: RT.round(share, 3) };
  }

  function positionRulesFor(sportKey, posId) {
    return POSITION_RULES.filter(r => r.sport === sportKey && r.positions.includes(posId));
  }

  /* Five-step test for one (profile, capability kind, position). `capability`
   * may be omitted, in which case the profile is searched. */
  function evaluateApplication({ sportKey, profile, pos, capabilityKind, opponents }) {
    if (!SPORT_KEYS.includes(sportKey)) {
      return [{ ruling: RULING.NOT_APPLICABLE, reason: 'Sport rules apply to the six regulated sports, not ' + sportKey + '.' }];
    }
    const cap = capabilitiesOf(profile).find(c => c.kind === capabilityKind) || null;
    const capability = cap
      ? { kind: capabilityKind, label: cap.label, possessed: cap.status === EVIDENCE.CONTRADICTED ? 'contradicted' : 'documented', status: cap.status,
        source: cap.source, continuity: cap.continuity, limitation: cap.limitation, basis: cap.basis }
      : { kind: capabilityKind, label: CAPABILITY_LABEL[capabilityKind] || capabilityKind, possessed: 'unknown', status: EVIDENCE.UNKNOWN,
        source: null, continuity: null, limitation: null,
        basis: 'No record for ' + profile.key + '. Missing research is not proof the character lacks the ability.' };
    const rules = RULEBOOK.filter(r => r.capability === capabilityKind && (r.sports === '*' || r.sports.includes(sportKey)));
    const restrictions = positionRulesFor(sportKey, pos && pos.id);
    const mirrors = (opponents || []).filter(o => capabilitiesOf(o).some(c => c.kind === capabilityKind)).map(o => o.displayName);
    if (!rules.length) {
      return [{
        ruleId: null, rulesetId: RULESET_ID, sportKey, position: pos ? pos.id : null, character: profile.key, capability,
        action: null, ruling: RULING.NEEDS_REVIEW, basis: 'unresolved', rule: null,
        reason: 'No officiating entry exists yet for this capability in this sport.', grantsAdvantage: false, advantage: 'none',
        effect: null, counter: null, positionRestrictions: restrictions.map(r => r.id),
      }];
    }
    return rules.map(r => {
      const relevance = dutyRelevance(pos, r.duty);
      // An advantage is only ever recognized for a legal use of a capability
      // that is actually on record for this identity.
      const legalAndOnRecord = r.ruling === RULING.ALLOWED && capability.possessed === 'documented';
      // Evidence that itself still needs review does not earn a recognized advantage yet.
      const usable = legalAndOnRecord && (capability.status === EVIDENCE.REVIEWED || capability.status === EVIDENCE.PROVISIONAL);
      const advantage = usable ? 'recognized' : legalAndOnRecord ? 'pending-capability-review' : 'none';
      return {
        ruleId: r.id, rulesetId: RULESET_ID, sportKey, position: pos ? pos.id : null, character: profile.key, capability,
        environment: { operable: 'assumed', note: 'Standard venue; no environmental dependency is recorded for this capability.' },
        action: r.action, ruling: r.ruling, basis: r.basis, rule: r.rule, reason: r.reason,
        grantsAdvantage: usable, advantage,
        effect: usable ? { description: r.effect, duty: r.duty || null, positionRelevance: relevance.level, positionWeightShare: relevance.share,
          appliedToRating: false, note: 'Reported qualitatively; shadow mode changes no rating.' } : null,
        counter: usable
          ? (mirrors.length ? { status: 'mirrored', by: mirrors, note: 'Opposing lineup has the same capability on record.' }
            : { status: 'none-on-record', by: [], note: 'No counter is recorded for the opposing lineup; absence of evidence is not proof of absence.' })
          : null,
        positionRestrictions: restrictions.map(x => x.id),
      };
    });
  }

  /* All applications for one lineup against its opponents. rows: [{pos, profile}] (active players only). */
  function evaluateLineup({ sportKey, rows, opponents }) {
    const applications = [];
    for (const row of rows) {
      for (const cap of capabilitiesOf(row.profile)) {
        applications.push(...evaluateApplication({ sportKey, profile: row.profile, pos: row.pos, capabilityKind: cap.kind, opponents }));
      }
    }
    const restrictions = rows.flatMap(row => positionRulesFor(sportKey, row.pos.id).map(r => ({
      ruleId: r.id, sportKey, position: row.pos.id, character: row.profile.key, action: r.action, ruling: r.ruling,
      basis: r.basis, rule: r.rule, reason: r.reason, statEligibility: { ...r.statEligibility },
    })));
    return { rulesetId: RULESET_ID, applications, restrictions };
  }

  const api = { RULESET_ID, SPORT_KEYS, RULING, RULEBOOK, POSITION_RULES, CAPABILITY_TAGS, capabilitiesOf, dutyRelevance, positionRulesFor, evaluateApplication, evaluateLineup };
  NS.sportRules = api;
  if (isNode) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

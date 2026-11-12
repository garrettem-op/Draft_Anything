/* Option C shadow evaluator — module-level tests (plain Node `require`, no page).
 * Covers the profile adapter, typed interaction engine, sport rules evaluator,
 * ledger safeguards and the probability model in isolation.
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PA = require('../data/option-c/profile-adapter.js');
const IE = require('../data/option-c/interaction-engine.js');
const SR = require('../data/option-c/sport-rules.js');
const TL = require('../data/option-c/team-ledger.js');
const PR = require('../data/option-c/probability.js');
const OC = require('../data/option-c/evaluator.js');
const { REVIEWED_CAPABILITIES } = require('../data/option-c/reviewed-capabilities.js');
const { variantAbilityProfile } = require('../data/variant-abilities.js');

const freeze = o => { if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); Object.values(o).forEach(freeze); } return o; };
const A = (o = {}) => ['spd', 'agi', 'str', 'siz', 'lep', 'end', 'tch', 'acc', 'ref', 'iq', 'clu', 'ldr'].map(k => o[k] ?? 70);
const cand = (pool, n, attrs, extra = {}) => ({ id: pool + ':' + n.toLowerCase(), pool, n, a: A(attrs), g: [], ...extra });
const form = (pool, base, name, attrs) => cand(pool, name, attrs, { variantBase: base, variantAbilities: variantAbilityProfile({ pool, n: base }, { name }) });
const P = c => PA.getProfile(c);

test('profile ids are pool-qualified and a selected form is a separate identity', () => {
  const batman = P(cand('dc', 'Batman')), hellbat = P(form('dc', 'Batman', 'Hellbat Armor Batman', { str: 84, end: 88 }));
  assert.equal(batman.key, 'dc:Batman');
  assert.equal(hellbat.key, 'dc:Batman|Hellbat Armor Batman');
  assert.equal(hellbat.id, 'dc:Batman');
  assert.equal(batman.signature, null, 'base Batman gets no Hellbat technique');
  assert.equal(batman.apexRank, 0, 'base Batman gets no Apex gear');
  assert.equal(hellbat.apexLabel, 'Apex');
  assert.equal(hellbat.signature.label, 'Hellbat Counteroffensive');
  assert.ok(hellbat.signature.selfLimiting, 'Hellbat keeps its metabolic cost');
  assert.deepEqual(hellbat.weakTo, ['magic']);
  assert.throws(() => PA.parseId('Batman'), /pool-qualified/);
  assert.deepEqual(PA.parseId('mcu:Thanos|King Thanos'), { pool: 'mcu', base: 'Thanos', form: 'King Thanos' });
});

test('an unreviewed form inherits no power, guard or Apex rank from its name or its base', () => {
  const p = P(cand('dc', 'Kingdom Come Batman', { str: 99, end: 99 }, { variantBase: 'Batman', variantAbilities: null }));
  assert.equal(p.variantReviewed, false);
  assert.equal(p.signature, null);
  assert.equal(p.apexRank, 0);
  assert.equal(p.evidence.combat, 'unknown');
  assert.ok(p.abilityTags.length > 0 && p.abilityTags.every(t => t.status === 'needs-review' && t.inheritedFromBase));
  // A base character with a typed kit does not lend it to an unreviewed form.
  const ghost = P(cand('dc', 'Some Unreviewed Darkseid', {}, { variantBase: 'Darkseid', variantAbilities: null }));
  assert.equal(ghost.signature, null);
  assert.equal(ghost.ward, null);
});

test('King Thanos differs from base Thanos and keeps its documented limitation', () => {
  const base = P(cand('mcu', 'Thanos')), king = P(form('mcu', 'Thanos', 'King Thanos'));
  assert.equal(base.signature, null);
  assert.equal(king.signature.domain, 'melee');
  assert.ok(king.apexRank > 0);
  assert.deepEqual(king.guards, ['melee', 'cosmic']);
  assert.match(king.signature.limitation, /does not grant Infinity Stones/);
});

test('missing research is unknown, never a researched "no"; tags are not combat tiers', () => {
  const nobody = P(cand('nowhere', 'Unlisted Person'));
  assert.equal(nobody.tagsAudited, false);
  assert.equal(nobody.evidence.combat, 'unknown');
  assert.match(nobody.evidence.gaps.join(' '), /unknown/i);
  const surfer = P(cand('mcu', 'Silver Surfer'));
  assert.ok(surfer.abilityTags.some(t => t.tag === 'flight'));
  assert.equal(surfer.signature, null, 'a flight tag does not create a combat technique');
  assert.equal(surfer.exceptional, null, 'no comics-scale feat is imported for the mcu roster entry');
  assert.equal(surfer.evidence.combat, 'provisional');
  assert.equal(surfer.continuity.status, 'needs-review');
});

test('rejected grants surface as contradicted and evidence statuses map from the ability index', () => {
  const eowyn = P(cand('lotr', 'Éowyn'));
  assert.ok(eowyn.deniedTags.some(d => d.tag === 'magic' && d.status === 'contradicted'));
  assert.equal(PA.tagStatus('owner-ruling'), 'reviewed');
  assert.equal(PA.tagStatus('corroborated'), 'reviewed');
  assert.equal(PA.tagStatus('credible'), 'provisional');
  assert.equal(PA.tagStatus('needs-review'), 'needs-review');
  assert.equal(PA.tagStatus('investigate'), 'contradicted');
  const superman = P(cand('dc', 'Superman'));
  assert.equal(superman.abilityTags.find(t => t.tag === 'flight').status, 'needs-review');
});

test('profiles never mutate the candidate they are given', () => {
  const c = freeze(form('dc', 'Batman', 'Hellbat Armor Batman'));
  const before = JSON.stringify(c);
  const p = P(c);
  p.guards.push('everything'); p.abilityTags.length = 0;
  assert.equal(JSON.stringify(c), before);
  assert.deepEqual(P(c).guards, ['tech', 'melee'], 'a second profile is unaffected by edits to the first');
});

test('reality and cosmic powers are not judged as punches', () => {
  const franklin = P(cand('mcu', 'Franklin Richards', { str: 20, end: 30, siz: 20 }));
  const abomination = P(cand('mcu', 'Abomination', { str: 97, end: 95, siz: 92 }));
  const t = IE.assessThreat(franklin, abomination), back = IE.assessThreat(abomination, franklin);
  assert.equal(t.domain, 'reality');
  assert.ok(t.rules.includes('high-order-burst'));
  assert.equal(t.leverage, 'strong');
  assert.ok(back.rules.includes('finite-ward'));
  assert.ok(back.score < t.score, 'a stronger body does not out-leverage a documented reality power');
  assert.equal(franklin.physicalTier, 1);
});

test('conventional attackers are blunted by tougher bodies and pinnacle forms; high-order counters remain', () => {
  const joker = P(cand('dc', 'Joker', { str: 50, end: 55 }));
  const darkseid = P(cand('dc', 'Darkseid', { str: 97, end: 97 }));
  const hellbat = P(form('dc', 'Batman', 'Hellbat Armor Batman', { str: 84, end: 88 }));
  const batman = P(cand('dc', 'Batman', { str: 64, end: 72 }));
  assert.equal(IE.assessThreat(joker, darkseid).leverage, 'negligible');
  const shell = IE.assessThreat(batman, hellbat);
  assert.ok(shell.rules.includes('apex-shell') && shell.score === -2);
  assert.ok(shell.rules.includes('unknown-kit'), 'an unresearched attacker is labeled, not assumed powerless');
  assert.equal(IE.assessThreat(hellbat, batman).leverage, 'decisive');
  const counter = IE.assessThreat(darkseid, hellbat);
  assert.ok(counter.rules.includes('apex-counter') && counter.score >= 1, 'Apex is not invincible to a tier-4 cosmic technique');
  const vsDarkseid = IE.assessThreat(hellbat, darkseid);
  assert.ok(vsDarkseid.rules.includes('high-order-passive-defense'));
  assert.ok(vsDarkseid.score < IE.assessThreat(hellbat, batman).score, 'no guaranteed win against high-order opposition');
  assert.ok(vsDarkseid.rules.includes('self-limiting'));
});

test('specific guards and vulnerabilities change a matchup; high tier does not mean invulnerable', () => {
  const witch = P(cand('mcu', 'Scarlet Witch'));
  const hellbat = P(form('dc', 'Batman', 'Hellbat Armor Batman', { str: 84, end: 88 }));
  const exploit = IE.assessThreat(witch, hellbat);
  assert.ok(exploit.rules.includes('domain-weakness'));
  assert.equal(exploit.leverage, 'decisive');
  const darkseid = P(cand('dc', 'Darkseid', { str: 97, end: 97 })), spectre = P(cand('dc', 'The Spectre', { str: 80, end: 80 }));
  const lucifer = P(cand('dc', 'Lucifer Morningstar'));
  assert.ok(IE.assessThreat(darkseid, spectre).score >= 1 && IE.assessThreat(spectre, darkseid).score >= 1);
  const guarded = IE.assessThreat(spectre, lucifer); // Lucifer guards magic
  assert.ok(guarded.rules.includes('domain-guard'));
  assert.ok(guarded.score < IE.assessThreat(spectre, darkseid).score);
});

test('ToonForce attackers skip the durability gap but gain no automatic win', () => {
  const bugs = P(cand('toons', 'Bugs Bunny', { str: 40, end: 60 }));
  const hulk = P(cand('mcu', 'Abomination', { str: 97, end: 95 }));
  const t = IE.assessThreat(bugs, hulk);
  assert.ok(t.rules.includes('toon-physics-ignores-gap'));
  assert.ok(!t.rules.includes('durability-gap'));
  assert.equal(t.leverage, 'even');
});

test('the interaction engine holds general rules, not named pairwise winners', () => {
  const src = fs.readFileSync(path.join(__dirname, '../data/option-c/interaction-engine.js'), 'utf8')
    + fs.readFileSync(path.join(__dirname, '../data/option-c/probability.js'), 'utf8');
  for (const name of ['Batman', 'Hellbat', 'Thanos', 'Darkseid', 'Superman', 'Silver Surfer', 'Black Adam', 'Franklin', 'Spectre', 'Joker', 'Bugs'])
    assert.ok(!src.includes(name), 'no character-specific rule or odds for ' + name);
  assert.ok(Object.keys(IE.RULES).length >= 10);
  for (const [id, r] of Object.entries(IE.RULES)) assert.ok(r.title && r.text.length > 20, id);
});

const posBB = { id: 'c', ab: 'C', w: { siz: 4, str: 3, lep: 2, ref: 1, tch: 1, iq: 1 } };
const posLib = { id: 'lib', ab: 'L', w: { ref: 4, agi: 3, tch: 3, clu: 1, ldr: 1 } };
const posSet = { id: 's', ab: 'S', w: { acc: 4, ldr: 4, tch: 3, iq: 3, agi: 2, clu: 1 } };
const posQB = { id: 'qb', ab: 'QB', w: { acc: 4, iq: 4, clu: 3, ldr: 2, tch: 1, siz: 1, agi: 1 } };
const app = (sportKey, c, pos, kind, opponents = []) => SR.evaluateApplication({ sportKey, profile: P(c), pos, capabilityKind: kind, opponents });

test('Superman may fly within basketball rules, never around them', () => {
  const r = app('basketball', cand('dc', 'Superman'), posBB, 'flight'), by = id => r.find(x => x.ruleId === id);
  assert.equal(by('flight-off-ball-coverage').ruling, 'allowed');
  assert.equal(by('flight-basketball-carry').ruling, 'prohibited');
  assert.match(by('flight-basketball-carry').rule, /Traveling/);
  assert.equal(by('flight-basketball-goaltend').ruling, 'prohibited');
  assert.equal(by('flight-basketball-air-dribble').ruling, 'needs-review');
  // The index grants flight but its evidence still needs review: legal, yet not a recognized advantage.
  assert.equal(by('flight-off-ball-coverage').advantage, 'pending-capability-review');
  assert.ok(r.every(x => x.ruling === 'allowed' || x.grantsAdvantage === false));
});

test('unresolved supernatural plays are needs-review and grant nothing', () => {
  const portal = app('football', cand('mcu', 'Doctor Strange'), posQB, 'portals');
  assert.ok(portal.length >= 1 && portal.every(x => x.ruling === 'needs-review' && x.grantsAdvantage === false && x.effect === null));
  assert.equal(portal[0].ruleId, 'portal-football-forward-pass');
  const tk = app('basketball', cand('mcu', 'Scarlet Witch'), posBB, 'telekinesis');
  assert.ok(tk.every(x => x.ruling === 'needs-review' && x.advantage === 'none'));
  assert.equal(tk[0].capability.possessed, 'documented');
  for (const r of SR.RULEBOOK) if (r.ruling === 'needs-review') assert.equal(r.basis, 'unresolved', r.id);
  for (const r of SR.RULEBOOK) if (r.ruling === 'allowed') assert.ok(r.effect && r.duty, r.id + ': a legal use states its effect');
});

test('Spider-Man gains legal libero anticipation but no prohibited libero action', () => {
  const spidey = cand('mcu', 'Spider-Man', { ref: 99, str: 96 });
  const [lib] = app('volleyball', spidey, posLib, 'danger-sense');
  assert.equal(lib.ruling, 'allowed');
  assert.equal(lib.advantage, 'recognized');
  assert.equal(lib.effect.positionRelevance, 'high');
  assert.equal(lib.effect.appliedToRating, false);
  assert.deepEqual(lib.positionRestrictions, ['volleyball-libero-no-attack-or-block']);
  const [setter] = app('volleyball', spidey, posSet, 'danger-sense');
  assert.equal(setter.effect.positionRelevance, 'low', 'the same ability is worth less at setter');
  const lineup = SR.evaluateLineup({ sportKey: 'volleyball', rows: [{ pos: posLib, profile: P(spidey) }], opponents: [] });
  assert.equal(lineup.restrictions[0].ruling, 'prohibited');
  assert.deepEqual(lineup.restrictions[0].statEligibility, { kills: false, blocks: false });
  const mirrored = app('volleyball', spidey, posLib, 'danger-sense', [P(cand('mcu', 'Spider-Man'))]);
  assert.equal(mirrored[0].counter.status, 'mirrored');
});

test('a capability with no record is unknown and earns nothing; vehicles are not personal flight', () => {
  const r = app('basketball', cand('nba', 'Michael Jordan'), posBB, 'flight');
  assert.ok(r.every(x => x.capability.possessed === 'unknown' && x.grantsAdvantage === false));
  assert.match(r[0].capability.basis, /not proof/);
  assert.ok(!SR.CAPABILITY_TAGS.flight.includes('pilot') && !SR.CAPABILITY_TAGS.flight.includes('mount'));
  assert.equal(app('brawl', cand('dc', 'Superman'), posBB, 'flight')[0].ruling, 'not-applicable');
  assert.deepEqual(SR.SPORT_KEYS.slice().sort(), ['baseball', 'basketball', 'football', 'hockey', 'soccer', 'volleyball']);
});

test('the reviewed capability sample is small, sourced and provisional', () => {
  assert.ok(REVIEWED_CAPABILITIES.length >= 1 && REVIEWED_CAPABILITIES.length <= 10, 'a sample, not a roster atlas');
  for (const r of REVIEWED_CAPABILITIES) {
    assert.match(r.id, /^[a-z]+:.+/);
    assert.match(r.source, /^https:\/\//);
    assert.equal(r.status, 'provisional');
    assert.ok(r.feat.length > 30 && r.limitation.length > 20 && r.continuity.length > 5);
  }
});

test('the ledger blocks duplicate stack keys and derived rating bonuses', () => {
  const L = TL.createLedger('A', 'brawl');
  const base = { sourceSystem: 'x', trigger: 't', stage: 'team-score', reason: 'r' };
  const first = L.add({ ...base, stackKey: 'muppetforce-team', appliedBy: 'legacy-observed', effectKind: 'rating-add', value: 5, inRating: true });
  const again = L.add({ ...base, stackKey: 'muppetforce-team', appliedBy: 'legacy-observed', effectKind: 'rating-add', value: 5, inRating: true });
  const sneaky = L.add({ ...base, stackKey: 'new-bonus', appliedBy: 'option-c-derived', effectKind: 'rating-add', value: 9, inRating: true });
  assert.equal(first.appliedBy, 'legacy-observed');
  assert.equal(again.appliedBy, 'blocked');
  assert.equal(again.inRating, false);
  assert.match(again.reason, /already in the ledger/);
  assert.equal(sneaky.appliedBy, 'blocked');
  assert.equal(TL.validate(L.entries).ok, true);
  assert.equal(L.entries.filter(e => e.inRating).reduce((s, e) => s + e.value, 0), 5, 'the bonus counts once');
  const bad = TL.validate([{ teamKey: 'A', stackKey: 'k', appliedBy: 'option-c-derived', effectKind: 'rating-add', inRating: false }]);
  assert.equal(bad.ok, false);
});

test('the probability model is symmetric, bounded, coarse and explains itself', () => {
  for (const [ra, rb, qa, qb, cov] of [[100, 92, 0.5, -0.7, 0.8], [80, 80.01, 0, 0, 0], [150, 60, 2, -2, 1], [70, 70, 0, 0, 1], [90, 95, 1.2, -0.4, 0.3]]) {
    const x = PR.estimate({ sportKey: 'brawl', effectiveRating: [ra, rb], interactionIndex: [qa, qb], coverage: cov, flags: {} });
    const y = PR.estimate({ sportKey: 'brawl', effectiveRating: [rb, ra], interactionIndex: [qb, qa], coverage: cov, flags: {} });
    assert.ok(Math.abs(x.probability[0] + x.probability[1] - 1) < 1e-12);
    assert.deepEqual(x.probability, y.probability.slice().reverse());
    assert.deepEqual(x.range, y.range.slice().reverse());
    for (const p of x.probability) {
      assert.ok(p >= 0.05 && p <= 0.95, 'no claimed certainty');
      assert.ok(Math.abs(p * 20 - Math.round(p * 20)) < 1e-9, 'reported on a 5% grid: ' + p);
    }
    assert.ok(x.range[0][0] <= x.probability[0] && x.probability[0] <= x.range[0][1]);
  }
  const none = PR.estimate({ sportKey: 'brawl', effectiveRating: [90, 80], interactionIndex: [2, -2], coverage: 0, flags: {} });
  assert.equal(none.basis, 'numeric-baseline-only', 'no typed evidence: qualitative term withheld');
  assert.equal(none.perSide[0].qualitativeLogit, 0);
  const sport = PR.estimate({ sportKey: 'basketball', effectiveRating: [90, 80], interactionIndex: null, coverage: 0, flags: {} });
  assert.equal(sport.basis, 'numeric-baseline-only');
  assert.equal(PR.MODEL.calibration, 'uncalibrated');
  assert.ok(sport.howToRead.length >= 3);
  const wide = PR.estimate({ sportKey: 'brawl', effectiveRating: [90, 80], interactionIndex: [1, 0], coverage: 0.2, flags: { continuity: true, seededEvents: true } });
  const tight = PR.estimate({ sportKey: 'brawl', effectiveRating: [90, 80], interactionIndex: [1, 0], coverage: 1, flags: {} });
  assert.ok(wide.range[0][1] - wide.range[0][0] > tight.range[0][1] - tight.range[0][0], 'missing evidence widens the range');
});

test('the public interface is stable, shadow-only and off by default', () => {
  assert.equal(OC.schemaVersion, 1);
  assert.equal(OC.modelVersion, 'option-c-shadow-v1');
  assert.equal(OC.shadow.enabled, false);
  for (const fn of ['evaluateMatchup', 'getProfile', 'getProfileById', 'assessThreat', 'evaluateSportApplication', 'observeTeamEffects', 'validateLedger'])
    assert.equal(typeof OC[fn], 'function', fn);
  assert.throws(() => OC.evaluateMatchup({ sportKey: 'brawl', teamA: { rows: [] }, teamB: { rows: [] }, mode: 'live' }), /only mode "shadow"/);
  assert.throws(() => OC.evaluateMatchup({ sportKey: 'curling', teamA: { rows: [] }, teamB: { rows: [] } }), /unknown sportKey/);
  assert.throws(() => OC.evaluateMatchup({ sportKey: 'brawl', teamA: {}, teamB: { rows: [] } }), /teamScore\(\) result/);
});

test('no Option C module can reach a network, AI service, storage or random source', () => {
  const dir = path.join(__dirname, '../data/option-c');
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.js'))) {
    const src = fs.readFileSync(path.join(dir, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    for (const banned of ['fetch(', 'XMLHttpRequest', 'WebSocket', 'localStorage', 'sessionStorage', 'indexedDB', 'Math.random', 'Date.now', 'new Date', 'supabase', 'openai', 'anthropic', 'navigator.sendBeacon', 'document.cookie'])
      assert.ok(!src.toLowerCase().includes(banned.toLowerCase()), file + ' must not use ' + banned);
  }
});

/* Draft Anything: Tap One. Eight rounds, one category each. Every round deals four characters; tap the one
 * who is best at that category. Your score is how far your picks fall from the best of each hand, golf-style
 * (0 is a perfect build, 24 is the worst possible).
 *
 * Ratings are computed from the existing character data and are NEVER shown to the player. No paid AI calls.
 * Pools: DC Comics and MCU. Villainy needs an alignment signal: DC uses its affiliation groups and MCU its
 * "villains" group. Other pools can join once they have the same signal.
 *
 * PROVISIONAL: the Martial Arts and Villainy mappings below are heuristics built from the 12 universal
 * attributes, archetypes and affiliations. They should be audited against reviewed character research
 * (PROJECT_VISION Priority 2) before this mode leaves the experimental flag. */
const TapOne = (function tapOneFactory() {
  'use strict';
  const POOLS = Object.freeze([{id: 'dc', label: 'DC'}, {id: 'mcu', label: 'MCU'}]);
  const poolLabel = id => (POOLS.find(p => p.id === id) || POOLS[0]).label;
  const ROUNDS = 8;
  const HAND = 4;
  const BEST_KEY = 'da.tap-one.best.v1';   // + '.' + pool
  const RUN_KEY = 'da.tap-one.run.v1';     // + '.' + pool
  const POOL_KEY = 'da.tap-one.pool.v1';
  // Attribute order matches ATTRS in index.html.
  const I = {spd:0, agi:1, str:2, siz:3, lep:4, end:5, tch:6, acc:7, ref:8, iq:9, clu:10, ldr:11};
  const MAGIC_TAGS = ['magic', 'spellcaster', 'magic-item'];
  // Same accepted list as the Campaign "Tech Titans" challenge, so the two modes agree on who counts as tech.
  const TECH_TAGS = ['tech', 'powered-armor', 'robot-or-ai', 'cyborg', 'gadgets', 'inventor'];
  const VILLAIN_GROUP = /(foes|rogues|threats|villains|legion of doom|suicide squad|league of assassins)/i;

  const avg = (c, keys) => keys.reduce((t, k) => t + c.a[I[k]], 0) / keys.length;
  const weighted = (c, w) => { let t = 0, n = 0; for (const [k, x] of Object.entries(w)) { t += c.a[I[k]] * x; n += x; } return t / n; };
  function isVillain(c) {
    if (c.pool === 'mcu') return Array.isArray(c.g) && c.g.includes('mcu:villains');
    return Array.isArray(c.taxonomy) && c.taxonomy.some(g => VILLAIN_GROUP.test(g));
  }
  // Trained-fighter credit for Martial Arts. DC uses archetypes; MCU uses its affiliation groups.
  // PROVISIONAL: heuristics pending a research audit.
  function fighterBonus(c) {
    if (c.pool === 'mcu') {
      const g = Array.isArray(c.g) ? c.g : [];
      return g.some(x => ['mcu:redroom', 'mcu:tenrings', 'mcu:defenders'].includes(x)) ? 20 : g.some(x => ['mcu:shield', 'mcu:soldiers'].includes(x)) ? 8 : 0;
    }
    return /^(assassin|fighter)$/.test(c.archetype) ? 20 : c.archetype === 'tactician' ? 8 : 0;
  }
  const holdsTag = (c, tags) => typeof campaignHoldsAcceptedTag === 'function' ? campaignHoldsAcceptedTag(c, tags) : false;

  // score(c) -> hidden rating, higher is better. qualifies(c) marks the signal categories (tag based) so every
  // hand can hold at least two real candidates instead of four who all score zero.
  const CATEGORIES = Object.freeze([
    {id:'martial', label:'Martial Arts',
      score: c => avg(c, ['agi', 'ref', 'tch', 'acc']) + fighterBonus(c)},
    {id:'strength', label:'Strength', score: c => weighted(c, {str:8, siz:2})},
    {id:'intellect', label:'Intellect', score: c => c.a[I.iq]},
    {id:'magic', label:'Magic',
      qualifies: c => holdsTag(c, MAGIC_TAGS),
      score: c => holdsTag(c, MAGIC_TAGS) ? 50 + (c.a[I.iq] + c.a[I.clu]) / 4 : 0},
    {id:'villainy', label:'Villainy',
      qualifies: c => isVillain(c),
      score: c => isVillain(c) ? 40 + 0.6 * avg(c, ['iq', 'clu', 'ldr']) : 0},
    {id:'durability', label:'Durability', score: c => weighted(c, {end:5, str:3, siz:2})},
    {id:'speed', label:'Speed', score: c => c.a[I.spd]},
    {id:'tech', label:'Tech',
      qualifies: c => holdsTag(c, TECH_TAGS),
      score: c => holdsTag(c, TECH_TAGS) ? 50 + c.a[I.iq] / 2 : 0}
  ]);

  // ----- deterministic randomness -----
  function rng(seed) {
    let x = (seed >>> 0) || 1;
    return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
  }
  function shuffled(items, rand) {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
    return out;
  }
  function newSeed() { return (Math.floor(Math.random() * 4294967295) + 1) >>> 0; }

  // Build all eight hands up front so a run is a plain serializable object. Nobody appears twice in a run.
  function buildRun(seed, candidates, poolId) {
    const rand = rng(seed);
    const valid = candidates.filter(c => c && Array.isArray(c.a) && c.a.length >= 12);
    let left = shuffled(valid, rand);
    const dealt = {};
    const take = hand => {
      if (hand.length < HAND) throw new Error('Not enough characters to deal a Tap One run.');
      const used = new Set(hand.map(c => c.id));
      left = left.filter(c => !used.has(c.id));
      return hand;
    };
    // Deal the scarce, tag-based categories first so earlier rounds can never use up their qualified characters.
    for (const cat of CATEGORIES) if (cat.qualifies) {
      const yes = left.filter(cat.qualifies), no = left.filter(c => !cat.qualifies(c));
      let hand = yes.slice(0, 2).concat(no.slice(0, HAND - 2));
      if (hand.length < HAND) hand = hand.concat(yes.slice(2, 2 + HAND - hand.length));
      dealt[cat.id] = shuffled(take(hand), rand);
    }
    for (const cat of CATEGORIES) if (!cat.qualifies) dealt[cat.id] = take(left.slice(0, HAND));
    const rounds = CATEGORIES.map(cat => ({cat: cat.id, hand: dealt[cat.id].map(c => c.id), pick: null, gap: null}));
    return {version: 1, seed, pool: poolId || POOLS[0].id, rounds};
  }

  function catById(id) { return CATEGORIES.find(c => c.id === id); }
  // gap = how many of the four scored strictly higher than your pick. 0 means you took the best (ties share it).
  function gapFor(catId, handCands, pickId) {
    const cat = catById(catId), picked = handCands.find(c => c.id === pickId);
    if (!cat || !picked) return null;
    const mine = cat.score(picked);
    return handCands.filter(c => cat.score(c) > mine + 1e-9).length;
  }
  function current(run) { return run.rounds.findIndex(r => r.pick == null); }
  function total(run) { return run.rounds.reduce((t, r) => t + (r.gap == null ? 0 : r.gap), 0); }
  function done(run) { return current(run) === -1; }
  function titleFor(score) {
    return score === 0 ? 'Perfect build' : score <= 3 ? 'Elite build' : score <= 7 ? 'Solid build' : score <= 12 ? 'Rough build' : 'Wrong multiverse';
  }
  // Applies one pick to a run in place. `lookup` maps a character id to its candidate.
  function pick(run, id, lookup) {
    const i = current(run);
    if (i === -1) return {accepted: false, reason: 'This build is finished.'};
    const round = run.rounds[i];
    if (!round.hand.includes(id)) return {accepted: false, reason: 'Pick one of the four shown.'};
    const gap = gapFor(round.cat, round.hand.map(lookup), id);
    if (gap == null) return {accepted: false, reason: 'Character unavailable.'};
    round.pick = id; round.gap = gap;
    return {accepted: true, round: i, gap};
  }
  const SQUARE = ['🟩', '🟨', '🟧', '🟥'];
  function shareText(run, lookup) {
    const names = run.rounds.map(r => lookup(r.pick)?.n || '?').join(', ');
    return 'Draft Anything · Tap One (' + poolLabel(run.pool) + ') · ' + total(run) + ' (0 is perfect)\n'
      + run.rounds.map(r => SQUARE[Math.min(3, r.gap || 0)]).join('') + '\n' + names;
  }

  // ----- persistence (this device only) -----
  function readJSON(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } }
  function writeJSON(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { } }
  function validRun(run, poolId) {
    return !!run && run.version === 1 && run.pool === (poolId || POOLS[0].id) && Array.isArray(run.rounds) && run.rounds.length === ROUNDS
      && run.rounds.every((r, i) => r && r.cat === CATEGORIES[i].id && Array.isArray(r.hand) && r.hand.length === HAND);
  }
  function best(poolId) { const b = readJSON(BEST_KEY + '.' + poolId); return Number.isInteger(b) ? b : null; }
  function recordBest(poolId, score) { const b = best(poolId); if (b == null || score < b) writeJSON(BEST_KEY + '.' + poolId, score); }
  function fresh(poolId) { return buildRun(newSeed(), getCands(poolId), poolId); }
  function loadRun(poolId) {
    const run = readJSON(RUN_KEY + '.' + poolId);
    const ids = new Set(getCands(poolId).map(c => c.id));
    return validRun(run, poolId) && run.rounds.every(r => r.hand.every(id => ids.has(id))) ? run : fresh(poolId);
  }
  function newState() {
    const saved = readJSON(POOL_KEY), pool = POOLS.some(p => p.id === saved) ? saved : POOLS[0].id;
    return {pool, run: loadRun(pool), copied: false};
  }
  function save(state) { writeJSON(RUN_KEY + '.' + state.pool, state.run); }
  function lookupFn(poolId) { const map = new Map(getCands(poolId || POOLS[0].id).map(c => [c.id, c])); return id => map.get(id); }
  function choose(state, id) {
    const result = pick(state.run, id, lookupFn(state.pool));
    if (result.accepted) { if (done(state.run)) recordBest(state.pool, total(state.run)); save(state); }
    return result;
  }
  function again(state) { state.run = fresh(state.pool); state.copied = false; save(state); }
  function setPool(state, poolId) {
    if (!POOLS.some(p => p.id === poolId) || poolId === state.pool) return;
    state.pool = poolId; state.run = loadRun(poolId); state.copied = false; writeJSON(POOL_KEY, poolId);
  }

  // ----- rendering -----
  // Original generic glyphs, one per category (24x24, drawn with currentColor).
  const EMBLEMS = {
    martial: '<path d="M5 4l7 8M10 3l7 9M15 3l5 7M5 20l14-4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    strength: '<path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
    intellect: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round" stroke-linecap="round"/>',
    magic: '<path d="M12 2l2.3 7.7L22 12l-7.7 2.3L12 22l-2.3-7.7L2 12l7.7-2.3z" fill="currentColor"/>',
    villainy: '<path d="M12 3a8 8 0 0 0-5 14v3h10v-3a8 8 0 0 0-5-14z" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/><circle cx="9" cy="11.5" r="1.8" fill="currentColor"/><circle cx="15" cy="11.5" r="1.8" fill="currentColor"/><path d="M10 20v-2.5M14 20v-2.5" stroke="currentColor" stroke-width="1.8"/>',
    durability: '<path d="M12 2.5l8 3v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10v-6z" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"/><path d="M12 7v10" stroke="currentColor" stroke-width="2"/>',
    speed: '<path d="M13.5 2L5 13.5h6L9.5 22 19 9.5h-6z" fill="currentColor"/>',
    tech: '<circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-dasharray="3.3 2.4"/>'
  };
  const emblem = id => '<svg class="to-emblem" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (EMBLEMS[id] || '') + '</svg>';
  const reducedMotion = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };
  function progressHTML(run) {
    const now = current(run);
    return '<ol class="to-steps" aria-label="Categories">' + run.rounds.map((r, i) => {
      const cls = r.pick != null ? 'to-done' : i === now ? 'to-now' : '';
      return '<li class="' + cls + '"><span>' + esc(catById(r.cat).label) + '</span></li>';
    }).join('') + '</ol>';
  }
  function cardHTML(c, i) {
    return '<button type="button" class="to-card" style="--i:' + i + '" data-act="tap-pick" data-cid="' + esc(c.id) + '" aria-label="' + esc(c.n) + '">'
      + avatar(c, 'av to-av') + '<strong>' + esc(c.n) + '</strong></button>';
  }
  function playHTML(run, look) {
    const i = current(run), r = run.rounds[i], cat = catById(r.cat);
    return '<div class="to-head"><div class="eyebrow">Round ' + (i + 1) + ' of ' + ROUNDS + '</div>'
      + emblem(r.cat) + '<h2 class="h to-cat">' + esc(cat.label) + '</h2><p class="note">Tap the best.</p></div>'
      + '<div class="to-hand" role="group" aria-label="' + esc(cat.label) + ' choices">' + r.hand.map((id, n) => cardHTML(look(id), n)).join('') + '</div>'
      + progressHTML(run);
  }
  function resultHTML(run, state, look) {
    const score = total(run), b = best(state.pool);
    const rows = run.rounds.map((r, n) => {
      const c = look(r.pick), g = r.gap;
      return '<li class="to-row to-g' + Math.min(3, g) + '" style="--i:' + n + '"><span class="to-rc">' + esc(catById(r.cat).label) + '</span>'
        + '<span class="to-rp">' + avatar(c, 'av to-mini') + '<b>' + esc(c.n) + '</b></span>'
        + '<span class="to-rg">' + (g === 0 ? '✓ Best of four' : 'Off by ' + g) + '</span></li>';
    }).join('');
    return '<div class="panel to-result' + (score === 0 ? ' to-perfect' : '') + '">' + (score === 0 ? confettiHTML() : '')
      + '<div class="eyebrow">Your build</div><div class="to-score" data-score="' + score + '">' + score + '</div>'
      + '<h2 class="h">' + esc(titleFor(score)) + '</h2><p class="note">Golf-style: 0 is perfect. Best on this device: ' + (b == null ? score : b) + '</p>'
      + '<ul class="to-rows">' + rows + '</ul>'
      + '<div class="row"><button class="btn" data-act="tap-share">' + (state.copied ? 'Copied' : 'Copy result') + '</button>'
      + '<button class="btn primary" data-act="tap-again">Play again</button></div></div>';
  }
  // Deterministic confetti burst (no randomness, so renders are stable). Pure CSS motion.
  function confettiHTML() {
    const colors = ['var(--accent)', 'var(--you)', 'var(--opp)', 'var(--good)'];
    let out = '<div class="to-confetti" aria-hidden="true">';
    for (let i = 0; i < 28; i++) {
      const ang = (i / 28) * Math.PI * 2 + (i % 3) * 0.2, dist = 90 + (i * 37) % 110;
      out += '<i style="--dx:' + Math.round(Math.cos(ang) * dist) + 'px;--dy:' + Math.round(Math.sin(ang) * dist - 30) + 'px;--r:' + ((i * 83) % 540) + 'deg;--c:' + colors[i % 4] + ';--d:' + ((i % 7) * 0.04).toFixed(2) + 's"></i>';
    }
    return out + '</div>';
  }
  // Tap feedback: pop the chosen card and fade the rest. Returns how long to wait before committing (0 = no motion).
  function flash(btn) {
    if (reducedMotion() || !btn || !btn.parentElement) return 0;
    btn.classList.add('to-picked');
    for (const sib of btn.parentElement.children) if (sib !== btn) sib.classList.add('to-fade');
    return 360;
  }
  // Count the score up from 0 after the result renders.
  function afterRender() {
    const el = document.querySelector('.to-score[data-score]');
    if (!el || reducedMotion()) return;
    const target = Number(el.dataset.score), start = performance.now(), ms = 650;
    if (!target) return;
    el.textContent = '0';
    const tick = now => {
      const t = Math.min(1, (now - start) / ms);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1 && el.isConnected) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  function poolSwitchHTML(state) {
    return '<div class="to-pools" role="group" aria-label="Roster">' + POOLS.map(p =>
      '<button type="button" class="btn small" data-act="tap-pool" data-pool="' + p.id + '" aria-pressed="' + (state.pool === p.id) + '">' + esc(p.label) + '</button>').join('') + '</div>';
  }
  function render(state) {
    const look = lookupFn(state.pool), run = state.run;
    return '<section class="to-shell">'
      + '<div class="mode-intro panel"><b>Tap One</b><span>Eight categories, four characters each. Tap the one who is best at it. Your score is how far you land from the best pick, so 0 is a perfect build.</span></div>'
      + poolSwitchHTML(state)
      + (done(run) ? resultHTML(run, state, look) : playHTML(run, look)) + '</section>';
  }

  return {POOLS, ROUNDS, HAND, CATEGORIES, isVillain, setPool, buildRun, gapFor, pick, current, total, done, titleFor, shareText,
    validRun, newState, choose, again, render, best, lookupFn, flash, afterRender};
})();
if (typeof module !== 'undefined' && module.exports) module.exports = TapOne;

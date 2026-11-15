/* Draft Anything: Gauntlet feed layer. Makes voting feel like an endless feed: instant next card, combo streaks,
 * ladder-move tags, surprise cards, titles, a personal top five, synthesized sounds and a motion/sound toggle.
 *
 * It is presentation only. It never changes what a vote is, how votes are stored or shared, or how the ladder is
 * computed (it calls Gauntlet.aggregate / Gauntlet.rank). It never touches gameplay RNG or match outcomes: surprise
 * timing and card choice use their own seeded stream (mulberry32 from the session's sample seed and the vote count).
 *
 * Rewards are cosmetic and cannot be farmed for better data or a better ladder:
 *  - a combo counts picks made without a long pause; skips and ties neither add to it nor break it, so nobody is
 *    pushed to guess when they do not know;
 *  - titles and badges come from the number of judged matchups, not from which side was picked;
 *  - the "taste" line (underdog lover / chalk picker) is a description shown on the top-five card, never a reward.
 * The game's own matchup prediction is never shown here.
 *
 * Pure parts run in Node (tests) and the browser. Browser-only parts (Web Audio, vibration, localStorage) are
 * reached through small injectable wrappers and fail quietly.
 */
const GauntletFeed = (function feedFactory() {
  'use strict';
  const G = typeof Gauntlet !== 'undefined' ? Gauntlet : (typeof require === 'function' ? require('./gauntlet.js') : null);
  const SETTINGS_KEY = 'da.gauntlet.feed.v1';
  const CROWD_URL = 'data/gauntlet/aggregates-v1.json';
  const PAUSE_MS = 45000;          // a pause longer than this ends a combo run
  const DAY_MIN_PICKS = 10;        // judged matchups needed for a day to count toward the day streak
  const CROWD_MIN = 8;             // decisive picks on one matchup before any "% agree" line is shown
  const REVEAL_EVERY = 25;         // judged matchups between "your top five" cards
  const SURPRISE_GAP = [6, 12];    // a special card appears after this many votes (varies, seeded)
  const PICK_BADGES = Object.freeze([
    { at: 10, label: '10 picks' }, { at: 25, label: '25 picks', title: 'Regular' }, { at: 50, label: '50 picks' },
    { at: 100, label: '100 picks', title: 'Judge of the Court' }, { at: 250, label: '250 picks', title: 'Arbiter' },
    { at: 500, label: '500 picks', title: 'High Arbiter' }, { at: 1000, label: '1,000 picks', title: 'Grand Arbiter' }
  ]);
  const COMBO_BADGES = Object.freeze([10, 25, 50]);
  const TITLES = Object.freeze([
    { at: 0, name: 'Newcomer' }, { at: 25, name: 'Regular' }, { at: 100, name: 'Judge of the Court' },
    { at: 250, name: 'Arbiter' }, { at: 500, name: 'High Arbiter' }, { at: 1000, name: 'Grand Arbiter' }
  ]);
  const SURPRISE_INFO = Object.freeze({
    clash: { label: 'Cross-universe clash', sub: 'Two different worlds, one fight' },
    dream: { label: 'Dream final', sub: 'Two of your top picks, head to head' },
    tiebreak: { label: 'Tiebreaker', sub: 'You have gone both ways on this one' }
  });

  // ---------- pure helpers ----------
  const tsOf = v => Date.parse(v.ts);
  const isJudged = v => v.outcome !== 'skip';
  function judgedCount(votes) { let n = 0; for (const v of votes) if (isJudged(v)) n++; return n; }

  /** Consecutive picks ending at index end-1. A gap longer than PAUSE_MS ends the run. Skips and ties neither add nor break. */
  function runCombo(votes, end) {
    end = end == null ? votes.length : end;
    let n = 0;
    for (let i = end - 1; i >= 0; i--) {
      if (votes[i].outcome === 'win') n++;
      if (i === 0) break;
      const gap = tsOf(votes[i]) - tsOf(votes[i - 1]);
      if (!(gap >= 0 && gap <= PAUSE_MS)) break;
    }
    return n;
  }
  /** The combo as the voter would see it now: an old run counts for nothing once the pause has passed. */
  function comboNow(votes, nowMs) {
    if (!votes.length) return 0;
    const last = tsOf(votes[votes.length - 1]);
    if (!(nowMs - last <= PAUSE_MS)) return 0;
    return runCombo(votes);
  }
  function dayIndex(ms, offsetMinutes) { return Math.floor((ms - (offsetMinutes || 0) * 60000) / 86400000); }
  /** Consecutive local days with at least DAY_MIN_PICKS judged matchups. Today may still be in progress. */
  function dayStreak(votes, nowMs, offsetMinutes) {
    const per = new Map();
    for (const v of votes) if (isJudged(v)) { const d = dayIndex(tsOf(v), offsetMinutes); per.set(d, (per.get(d) || 0) + 1); }
    const today = dayIndex(nowMs, offsetMinutes), todayCount = per.get(today) || 0;
    let d = todayCount >= DAY_MIN_PICKS ? today : today - 1, days = 0;
    while ((per.get(d) || 0) >= DAY_MIN_PICKS) { days++; d--; }
    return { days, todayCount, todayDone: todayCount >= DAY_MIN_PICKS, need: Math.max(0, DAY_MIN_PICKS - todayCount) };
  }
  function titleFor(picks) {
    let cur = TITLES[0], next = null;
    for (let i = 0; i < TITLES.length; i++) if (picks >= TITLES[i].at) { cur = TITLES[i]; next = TITLES[i + 1] || null; }
    return { name: cur.name, at: cur.at, next: next ? { name: next.name, at: next.at } : null };
  }
  /** Badges crossed between two states. prev/next: { picks, combo }. */
  function badgesCrossed(prev, next) {
    const out = [];
    for (const b of PICK_BADGES) if (prev.picks < b.at && next.picks >= b.at) out.push({ id: 'picks-' + b.at, kind: 'picks', label: b.label, title: b.title || null });
    for (const c of COMBO_BADGES) if (prev.combo < c && next.combo >= c) out.push({ id: 'combo-' + c, kind: 'combo', label: 'Combo ×' + c, title: null });
    return out;
  }
  function computeRows(votes) { return G.rank(G.aggregate(votes)).rows; }
  function ranksMap(rows) { return new Map(rows.map(r => [r.id, r.rank])); }
  /** How far the winner and loser moved on the personal ladder. delta > 0 means up. */
  function ladderMoves(beforeMap, afterRows, vote) {
    if (!vote || vote.outcome !== 'win') return null;
    const after = ranksMap(afterRows), loserId = vote.winner === vote.a ? vote.b : vote.a;
    const side = id => {
      const to = after.get(id), from = beforeMap.has(id) ? beforeMap.get(id) : null;
      return { id, from, to: to == null ? null : to, delta: from == null || to == null ? 0 : from - to, debut: from == null };
    };
    return { winner: side(vote.winner), loser: side(loserId), ranked: afterRows.length };
  }
  function topFive(rows) {
    return rows.filter(r => r.games >= 2).slice(0, 5).map((r, i) => ({ id: r.id, pool: r.pool, place: i + 1, rating: Math.round(r.rating), wins: r.wins, losses: r.losses, ties: r.ties }));
  }
  /** Describes (never rewards) how often recent picks went to the lower-rated side of the voter's own ladder. */
  function tasteOf(votes, rows, lastN) {
    const rating = new Map(rows.filter(r => r.games >= 2).map(r => [r.id, r.rating]));
    let seen = 0, under = 0;
    for (let i = votes.length - 1; i >= 0 && seen < (lastN || 40); i--) {
      const v = votes[i];
      if (v.outcome !== 'win') continue;
      const loser = v.winner === v.a ? v.b : v.a;
      if (!rating.has(v.winner) || !rating.has(loser) || rating.get(v.winner) === rating.get(loser)) continue;
      seen++; if (rating.get(v.winner) < rating.get(loser)) under++;
    }
    if (seen < 15) return null;
    const share = under / seen;
    return { share, n: seen, label: share >= 0.6 ? 'Underdog lover' : share <= 0.25 ? 'Chalk picker' : 'Balanced judge' };
  }
  // ---- crowd (published anonymous pair counts; absent until real votes exist) ----
  function buildCrowd(agg) {
    if (!agg || !G.validateAggregates(agg).ok) return null;
    return new Map(agg.pairs.map(p => [p.key, { aWins: p.aWins, bWins: p.bWins, ties: p.ties }]));
  }
  function crowdLine(crowd, vote) {
    if (!crowd || !vote || vote.outcome !== 'win') return null;
    const p = crowd.get(vote.key);
    if (!p || p.aWins + p.bWins < CROWD_MIN) return null;
    const mine = vote.winner === vote.a ? p.aWins : p.bWins, pct = Math.round(100 * mine / (p.aWins + p.bWins));
    if (pct <= 15) return { pct, tone: 'bold', text: 'Bold. Only ' + pct + '% of picks on this matchup agree' };
    if (pct >= 70) return { pct, tone: 'nice', text: 'Nice. ' + pct + '% of picks on this matchup agree' };
    return { pct, tone: 'plain', text: pct + '% of picks on this matchup agree' };
  }
  /** Your own history on this exact matchup. Needs an earlier decisive answer. */
  function ownLine(votes, vote) {
    if (!vote || vote.outcome !== 'win') return null;
    let n = 0, agree = 0;
    for (let i = 0; i < votes.length; i++) {
      const v = votes[i];
      if (v.id === vote.id || v.key !== vote.key || v.outcome !== 'win') continue;
      n++; if (v.winner === vote.winner) agree++;
    }
    if (!n) return null;
    if (agree === n) return { tone: 'steady', text: n === 1 ? 'Same pick as last time' : 'Consistent: ' + (n + 1) + ' of ' + (n + 1) + ' picks for them' };
    if (agree === 0) return { tone: 'switch', text: 'You changed your mind on this one. Noted' };
    return { tone: 'mixed', text: 'Mixed history: ' + agree + ' of ' + n + ' earlier picks agreed' };
  }
  function gapFor(seed, n) { const r = G.mulberry32((seed ^ 0x9e3779b9 ^ Math.imul(n + 1, 40503)) >>> 0)(); return SURPRISE_GAP[0] + Math.floor(r * (SURPRISE_GAP[1] - SURPRISE_GAP[0] + 1)); }

  // ---------- sound (Web Audio, synthesized; no files) ----------
  /** Pure tone recipes: [{ f, at, dur, type, gain, to? }] with times in seconds from the moment of play. */
  function toneSet(name, level) {
    const lv = Math.max(0, Math.min(16, level | 0));
    switch (name) {
      case 'pick': return [{ f: 392 * Math.pow(2, lv / 12), at: 0, dur: 0.09, type: 'triangle', gain: 0.5 }];
      case 'soft': return [{ f: 247, at: 0, dur: 0.1, type: 'sine', gain: 0.3 }];
      case 'combo': return [523, 659, 784].map((f, i) => ({ f: f * Math.pow(2, Math.min(lv, 12) / 24), at: 0.07 + i * 0.07, dur: 0.12, type: 'triangle', gain: 0.45 }));
      case 'milestone': return [523, 659, 784, 1047, 1319].map((f, i) => ({ f, at: 0.06 + i * 0.08, dur: i === 4 ? 0.45 : 0.16, type: i % 2 ? 'sine' : 'triangle', gain: 0.5 }));
      case 'surprise': return [{ f: 220, to: 880, at: 0.02, dur: 0.28, type: 'sawtooth', gain: 0.18 }, { f: 988, at: 0.3, dur: 0.1, type: 'triangle', gain: 0.35 }];
      case 'reveal': return [[392, 494, 587], [523, 659, 784]].flatMap((chord, ci) => chord.map(f => ({ f, at: 0.05 + ci * 0.22, dur: 0.3, type: 'triangle', gain: 0.3 })));
      case 'undo': return [{ f: 440, at: 0, dur: 0.07, type: 'sine', gain: 0.3 }, { f: 330, at: 0.07, dur: 0.1, type: 'sine', gain: 0.3 }];
      default: return [];
    }
  }
  const BUZZ = Object.freeze({ pick: 8, soft: 5, combo: [10, 30, 10], milestone: [20, 40, 20, 40, 60], surprise: [15, 30, 15], reveal: [20, 30, 20], undo: 5 });
  /** env: { getContext(): AudioContext|null, vibrate(pattern), enabled(): boolean }. */
  function createSound(env) {
    let ctx = null, master = null;
    function ready() {
      if (!ctx) {
        ctx = env.getContext();
        if (!ctx) return false;
        master = ctx.createGain(); master.gain.value = 0.22; master.connect(ctx.destination);
      }
      try { if (ctx.state === 'suspended' && typeof ctx.resume === 'function') { const p = ctx.resume(); if (p && p.catch) p.catch(() => { }); } } catch { }
      return true;
    }
    return {
      /** Call from a tap handler so the browser allows sound afterwards. Does nothing while sound is off. */
      unlock() { try { if (env.enabled()) ready(); } catch { } },
      play(name, level) {
        try {
          if (!env.enabled()) return false;
          const b = BUZZ[name]; if (b != null && env.vibrate) env.vibrate(b);
          const tones = toneSet(name, level);
          if (!tones.length || !ready()) return false;
          const t0 = ctx.currentTime || 0;
          for (const t of tones) {
            const osc = ctx.createOscillator(), g = ctx.createGain(), s = t0 + t.at, e = s + t.dur;
            osc.type = t.type; osc.frequency.setValueAtTime(t.f, s);
            if (t.to) osc.frequency.exponentialRampToValueAtTime(t.to, e);
            g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(t.gain, s + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, e);
            osc.connect(g); g.connect(master); osc.start(s); osc.stop(e + 0.03);
          }
          return true;
        } catch { return false; }
      }
    };
  }
  function browserEnv(getSettings) {
    return {
      enabled: () => getSettings().sound,
      getContext() {
        const C = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
        return C ? new C() : null;
      },
      vibrate(p) { try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(p); } catch { } }
    };
  }

  // ---------- settings (this device only) ----------
  function storage() { try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch { return null; } }
  function prefersReducedMotion() { try { return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } }
  function loadPersist() {
    let s = null;
    try { const st = storage(); s = st ? JSON.parse(st.getItem(SETTINGS_KEY) || 'null') : null; } catch { s = null; }
    return {
      sound: s && typeof s.sound === 'boolean' ? s.sound : true,
      motion: s && typeof s.motion === 'boolean' ? s.motion : !prefersReducedMotion(),
      seen: new Set(s && Array.isArray(s.seen) ? s.seen.filter(x => typeof x === 'string') : []),
      bestCombo: s && Number.isInteger(s.bestCombo) && s.bestCombo > 0 ? s.bestCombo : 0
    };
  }
  function savePersist(p) { try { const st = storage(); if (st) st.setItem(SETTINGS_KEY, JSON.stringify({ sound: p.sound, motion: p.motion, seen: [...p.seen], bestCombo: p.bestCombo })); } catch { } }

  // ---------- per-state feed data ----------
  function ensure(state) {
    if (state.feed) return state.feed;
    const persist = loadPersist();
    const F = state.feed = { persist, reward: null, interstitial: null, freshAt: 0, rows: null, ranksCache: null, crowd: null, crowdTried: false, nextSurpriseAt: 0, sound: null };
    F.sound = createSound(browserEnv(() => F.persist));
    F.nextSurpriseAt = state.ctx.store.votes.length + gapFor(state.sampleSeed, state.ctx.store.votes.length);
    return F;
  }
  function loadCrowd(F) {
    if (F.crowdTried) return;
    F.crowdTried = true;
    try {
      if (typeof fetch !== 'function' || typeof location === 'undefined') return;
      fetch(CROWD_URL, { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(agg => { const c = buildCrowd(agg); if (c) F.crowd = c; }).catch(() => { });
    } catch { }
  }

  // ---------- surprise cards ----------
  function pairObject(a, b, rng, extra) {
    const x = a < b ? a : b, y = a < b ? b : a, flip = rng() < 0.5;
    return Object.assign({ key: x + '|' + y, a: x, b: y, left: flip ? y : x, right: flip ? x : y }, extra);
  }
  function surpriseClash(state, host, rng, votes, recent) {
    const others = host.poolIds.filter(p => p !== state.poolA);
    if (!others.length) return null;
    const rightPool = others[Math.floor(rng() * others.length)];
    const pair = G.nextPair(host.candsOf(state.poolA), host.candsOf(rightPool), { rng, counts: G.buildCounts(votes), avoidKeys: recent, repeatRate: 0 });
    return pair ? Object.assign(pair, { surprise: 'clash' }) : null;
  }
  function surpriseDream(state, host, rng, votes, recent, F) {
    const rows = F.rows || computeRows(votes);
    const top = rows.filter(r => r.games >= 3 && host.cardById(r.id)).slice(0, 8);
    if (top.length < 4) return null;
    const counts = G.buildCounts(votes);
    let best = null;
    for (let i = 0; i < top.length; i++) for (let j = i + 1; j < top.length; j++) {
      const key = G.pairKey(top[i].id, top[j].id);
      if (recent.has(key)) continue;
      const score = (counts.pair.get(key) || 0) * 1000 + i + j + rng() * 0.5;
      if (!best || score < best.score) best = { score, a: top[i].id, b: top[j].id };
    }
    return best ? pairObject(best.a, best.b, rng, { surprise: 'dream' }) : null;
  }
  function surpriseTiebreak(state, host, rng, votes, recent) {
    const contested = G.contradictions(G.aggregate(votes)).contestedPairs
      .filter(p => !recent.has(p.key) && host.cardById(p.key.split('|')[0]) && host.cardById(p.key.split('|')[1]))
      .sort((x, y) => (x.aWins + x.bWins) - (y.aWins + y.bWins) || (x.key < y.key ? -1 : 1));
    if (!contested.length) return null;
    const [a, b] = contested[0].key.split('|');
    return pairObject(a, b, rng, { surprise: 'tiebreak' });
  }
  /** Hook: maybe return a special card instead of the ordinary pair. Uses its own seeded stream. */
  function chooseCard(state, host, info) {
    const F = ensure(state), votes = state.ctx.store.votes;
    if (votes.length < F.nextSurpriseAt) return null;
    const rng = G.mulberry32((state.sampleSeed ^ Math.imul(votes.length + 1, 2654435761)) >>> 0);
    const recent = (info && info.recent) || new Set(votes.slice(-20).map(v => v.key));
    const r = rng(), order = r < 0.4 ? ['clash', 'dream', 'tiebreak'] : r < 0.7 ? ['dream', 'tiebreak', 'clash'] : ['tiebreak', 'clash', 'dream'];
    const make = { clash: surpriseClash, dream: surpriseDream, tiebreak: surpriseTiebreak };
    for (const type of order) {
      const pair = make[type](state, host, rng, votes, recent, F);
      if (pair && host.cardById(pair.left) && host.cardById(pair.right)) {
        F.nextSurpriseAt = votes.length + gapFor(state.sampleSeed, votes.length + 1);
        return pair;
      }
    }
    F.nextSurpriseAt = votes.length + 3;
    return null;
  }

  // ---------- hooks ----------
  function onStart(state, host) {
    const F = ensure(state);
    F.reward = null; F.interstitial = null; F.freshAt = host.now();
    F.sound.unlock();
    loadCrowd(F);
  }
  function afterVote(state, host, vote) {
    const F = ensure(state), votes = state.ctx.store.votes, n = votes.length;
    const judged = isJudged(vote), picks = judgedCount(votes), picksBefore = picks - (judged ? 1 : 0);
    const combo = runCombo(votes), comboBefore = runCombo(votes, n - 1);
    F.sound.unlock();
    // personal ladder before / after (one ranking per vote; skips change nothing)
    const cacheOk = !!(F.ranksCache && F.rows && F.ranksCache.n === n - 1);
    const beforeRows = cacheOk ? F.rows : computeRows(votes.slice(0, -1));
    const before = cacheOk ? F.ranksCache.map : ranksMap(beforeRows);
    const rows = vote.outcome === 'skip' ? beforeRows : computeRows(votes);
    const moves = ladderMoves(before, rows, vote);
    F.rows = rows; F.ranksCache = { n, map: ranksMap(rows) };
    // badges (celebrated once per device)
    const fresh = badgesCrossed({ picks: picksBefore, combo: comboBefore }, { picks, combo }).filter(b => !F.persist.seen.has(b.id));
    for (const b of fresh) F.persist.seen.add(b.id);
    if (combo > F.persist.bestCombo) F.persist.bestCombo = combo;
    savePersist(F.persist);
    const badge = fresh.find(b => b.title) || fresh.find(b => b.kind === 'picks') || fresh[fresh.length - 1] || null; // a title beats a pick count beats a combo
    // choose the headline
    const crowd = crowdLine(F.crowd, vote), own = ownLine(votes, vote);
    let headline = null, tone = 'plain', sound = vote.outcome === 'win' ? 'pick' : 'soft';
    if (badge) {
      headline = badge.title ? 'Title unlocked: ' + badge.title : badge.kind === 'combo' ? badge.label + '!' : badge.label + ' judged';
      tone = 'badge'; sound = 'milestone';
    } else if (vote.outcome === 'win' && combo >= 5 && combo % 5 === 0) { headline = 'Combo ×' + combo; tone = 'combo'; sound = 'combo'; }
    else if (crowd) { headline = crowd.text; tone = crowd.tone; }
    else if (own) { headline = own.text; tone = own.tone; }
    else if (vote.outcome === 'tie') headline = 'Too close to call. Noted';
    else if (vote.outcome === 'skip') headline = 'Skipped';
    const tags = [];
    if (moves) {
      const nameOf = id => { const c = host.cardById(id); return c ? c.n : id; };
      for (const [role, s] of [['up', moves.winner], ['down', moves.loser]]) {
        if (s.to == null) continue;
        if (s.debut) { if (role === 'up' && moves.ranked >= 3) tags.push({ role: 'debut', text: nameOf(s.id) + ' debuts at #' + s.to }); } // only the winner debuts, or every pick would show two
        else if (s.delta > 0) tags.push({ role, text: nameOf(s.id) + ' climbs ' + s.delta + (s.delta === 1 ? ' spot' : ' spots') + ' to #' + s.to });
        else if (s.delta < 0) tags.push({ role, text: nameOf(s.id) + ' drops ' + (-s.delta) + (s.delta === -1 ? ' spot' : ' spots') + ' to #' + s.to });
      }
    }
    F.reward = (headline || tags.length) ? { headline, tone, tags, confetti: !!badge, key: n } : null;
    // every REVEAL_EVERY judged matchups: a soft pause with the personal top five
    F.interstitial = null;
    if (judged && picks > 0 && picks % REVEAL_EVERY === 0) {
      const top = topFive(rows);
      if (top.length >= 5) {
        F.interstitial = { type: 'top5', picks, top, taste: tasteOf(votes, rows), checkIn: picks % 50 === 0 };
        sound = 'reveal';
      }
    }
    F.freshAt = host.now();
    F.sound.play(vote.outcome === 'win' ? 'pick' : 'soft', combo);
    if (sound !== 'pick' && sound !== 'soft') F.sound.play(sound, combo);
  }
  function afterUndo(state, host) {
    const F = ensure(state);
    F.reward = null; F.interstitial = null; F.ranksCache = null; F.rows = null; F.freshAt = host.now();
    F.sound.play('undo');
  }
  function afterClear(state) {
    const F = ensure(state);
    F.reward = null; F.interstitial = null; F.ranksCache = null; F.rows = null;
    F.nextSurpriseAt = gapFor(state.sampleSeed, 0);
  }
  function dismiss(state) { const F = ensure(state); F.interstitial = null; F.freshAt = Date.now(); return true; }
  function toggle(state, which) {
    const F = ensure(state);
    if (which !== 'sound' && which !== 'motion') return false;
    F.persist[which] = !F.persist[which];
    savePersist(F.persist);
    if (which === 'sound' && F.persist.sound) { F.sound.unlock(); F.sound.play('pick', 4); }
    return F.persist[which];
  }

  // ---------- markup ----------
  function hudHTML(state, host, F) {
    const votes = state.ctx.store.votes, now = host.now(), esc = host.esc;
    const picks = judgedCount(votes), title = titleFor(picks), combo = comboNow(votes, now), streak = dayStreak(votes, now, host.tzOffsetMinutes());
    const prevAt = title.at, span = title.next ? title.next.at - prevAt : 1, pct = title.next ? Math.min(100, Math.round(100 * (picks - prevAt) / span)) : 100;
    const justPopped = F.reward && F.reward.key === votes.length && combo >= 2 && now - F.freshAt < 600;
    return '<div class="gt-hud">'
      + '<div class="gt-hud-row">'
      + '<span class="gt-chip gt-rank-chip">' + esc(title.name) + '<small> ' + picks + ' judged</small></span>'
      + (combo >= 2 ? '<span class="gt-chip gt-combo' + (justPopped ? ' gt-pop' : '') + '" aria-label="Combo ' + combo + '">Combo ×' + combo + '</span>' : '')
      + (streak.days ? '<span class="gt-chip gt-streak">Day streak ' + streak.days + (streak.todayDone ? '' : '<small> ' + streak.need + ' to keep it</small>') + '</span>' : '')
      + '<span class="gt-hud-controls">'
      + '<button type="button" class="chip gt-toggle" data-act="gaunt-sound" aria-pressed="' + F.persist.sound + '" title="Sounds and phone buzz">Sound ' + (F.persist.sound ? 'on' : 'off') + '</button>'
      + '<button type="button" class="chip gt-toggle" data-act="gaunt-motion" aria-pressed="' + F.persist.motion + '" title="Animations">Motion ' + (F.persist.motion ? 'on' : 'off') + '</button>'
      + '</span></div>'
      + '<div class="gt-bar" role="img" aria-label="' + (title.next ? (title.next.at - picks) + ' more judged matchups to ' + esc(title.next.name) : 'Top title reached') + '"><i style="width:' + pct + '%"></i></div>'
      + '</div>';
  }
  function rewardHTML(state, host, F) {
    const R = F.reward, esc = host.esc, fresh = host.now() - F.freshAt < 600;
    if (!R) return '<div class="gt-reward gt-empty" role="status" aria-live="polite"></div>';
    const confetti = R.confetti && F.persist.motion && fresh ? '<span class="gt-confetti" aria-hidden="true">' + Array.from({ length: 16 }, (_, i) => '<i style="--x:' + (i * 6.4 - 48).toFixed(1) + 'px;--d:' + (0.9 + (i % 5) * 0.12).toFixed(2) + 's;--h:' + (i * 23 % 360) + '"></i>').join('') + '</span>' : '';
    return '<div class="gt-reward gt-tone-' + esc(R.tone) + (fresh ? ' gt-fresh' : ' gt-old') + '" role="status" aria-live="polite">' + confetti
      + (R.headline ? '<b class="gt-headline">' + esc(R.headline) + '</b>' : '')
      + (R.tags.length ? '<span class="gt-tags">' + R.tags.map(t => '<span class="gt-ladder-tag gt-' + esc(t.role) + '"><span aria-hidden="true">' + (t.role === 'up' ? '▲' : t.role === 'down' ? '▼' : '★') + '</span> ' + esc(t.text) + '</span>').join('') + '</span>' : '')
      + '</div>';
  }
  function revealHTML(state, host, F) {
    const I = F.interstitial, esc = host.esc;
    const items = I.top.map(r => { const c = host.cardById(r.id); return '<li><b>' + r.place + '</b><span>' + esc(c ? c.n : r.id) + '<small> ' + esc(host.poolTitle(r.pool)) + '</small></span><em>' + r.rating + '</em></li>'; }).join('');
    return '<div class="panel gt-reveal gt-fresh"><h3 class="h">Your top five so far</h3>'
      + '<ol class="gt-top5">' + items + '</ol>'
      + (I.taste ? '<p class="note">Your taste: <b>' + esc(I.taste.label) + '</b> (' + Math.round(I.taste.share * 100) + '% of your last ' + I.taste.n + ' picks went to the lower-rated side of your own ladder).</p>' : '')
      + '<p class="note">' + (I.checkIn ? 'That is ' + I.picks + ' judged matchups. Stop whenever you like: your ladder is saved on this device. ' : I.picks + ' judged matchups. ') + 'These ratings come only from your picks.</p>'
      + '<div class="row"><button class="btn primary" data-act="gaunt-continue">Keep going</button><button class="btn" data-act="gaunt-ladder">Full ladder</button></div></div>';
  }
  function voteHTML(state, host) {
    const F = ensure(state), c = state.current, esc = host.esc;
    if (!c) return null;
    const now = host.now(), fresh = now - F.freshAt < 600, info = SURPRISE_INFO[c.surprise] || null;
    const n = state.ctx.store.votes.length, motionClass = F.persist.motion ? '' : ' gt-reduce';
    const body = F.interstitial ? revealHTML(state, host, F)
      : (info ? '<div class="gt-surprise-tag' + (fresh ? ' gt-fresh' : '') + '"><b>' + esc(info.label) + '</b><small>' + esc(info.sub) + '</small></div>' : '')
        + '<div class="gt-pair' + (fresh ? ' gt-fresh' : '') + (info ? ' gt-surprise' : '') + '">' + host.cardHTML(host.cardById(c.left), 'left') + '<span class="gt-vs" aria-hidden="true">VS</span>' + host.cardHTML(host.cardById(c.right), 'right') + '</div>'
        + '<div class="row gt-actions"><button class="btn" data-act="gaunt-tie">Too close to call</button><button class="btn" data-act="gaunt-skip">Skip / don’t know</button>'
        + '<button class="btn" data-act="gaunt-lean" aria-pressed="' + state.lean + '">' + (state.lean ? 'Next pick is a lean ✓' : 'Mark next pick as a lean') + '</button></div>';
    return '<div class="gt-vote gt-feed' + motionClass + '">' + hudHTML(state, host, F) + rewardHTML(state, host, F) + body
      + '<div class="row gt-actions"><button class="btn small" data-act="gaunt-undo"' + (n ? '' : ' disabled') + '>Undo last</button><button class="btn small" data-act="gaunt-ladder">Ladder</button><button class="btn small" data-act="gaunt-setup">Change pools</button></div>'
      + '<p class="note">The game’s own prediction is hidden on purpose. ' + (state.sync && state.sync.share ? 'Votes are saved here and shared anonymously.' : 'Votes are saved on this device only.') + ' Keys: ← → pick, T tie, S skip, U undo.</p></div>';
  }

  const api = {
    PAUSE_MS, DAY_MIN_PICKS, CROWD_MIN, REVEAL_EVERY, SURPRISE_GAP, PICK_BADGES, COMBO_BADGES, TITLES, SURPRISE_INFO, SETTINGS_KEY,
    runCombo, comboNow, dayIndex, dayStreak, titleFor, badgesCrossed, ladderMoves, topFive, tasteOf, buildCrowd, crowdLine, ownLine, gapFor,
    toneSet, createSound, judgedCount, computeRows,
    ensure, chooseCard, onStart, afterVote, afterUndo, afterClear, dismiss, toggle, voteHTML,
    install(gauntlet) { (gauntlet || G).setFeed(api); return api; }
  };
  return api;
})();
if (typeof module !== 'undefined' && module.exports) module.exports = GauntletFeed;
if (typeof Gauntlet !== 'undefined' && typeof Gauntlet.setFeed === 'function' && typeof document !== 'undefined') GauntletFeed.install(Gauntlet);

/* Draft Anything: Gauntlet. Head-to-head "who wins?" votes that build a ranking ladder.
 *
 * Pure core (Node + browser): seeded pair sampling, vote schema + validation, order-independent pair keys,
 * deduplicated aggregates, regularized Bradley-Terry ranking, transitive inference and contradiction checks.
 * A small UI layer sits at the bottom and only touches browser globals when render() is called.
 *
 * Votes are a calibration signal, not training truth. Nothing here reads the engine's prediction before a vote,
 * consumes gameplay RNG, calls an API or touches match outcomes. Storage is local-only (this device).
 */
const Gauntlet = (function gauntletFactory() {
  'use strict';
  const SCHEMA_VERSION = 1;
  const MODEL_VERSION = 'gauntlet-bt-v1';
  const AGG_SCHEMA = 'draft-anything.gauntlet.aggregates';
  const STORE_KEY = 'da.gauntlet.v1';
  const MAX_LOCAL_VOTES = 20000;
  const ID_RE = /^[a-z0-9][a-z0-9_-]*:[a-z0-9][a-z0-9_.-]*(?:#[a-z0-9_.-]+)?$/;
  const SESSION_RE = /^[a-z0-9]{8,32}$/;
  const OUTCOMES = Object.freeze(['win', 'tie', 'skip']);
  const CONFIDENCE = Object.freeze([null, 'sure', 'lean']);
  const ELO_PER_NAT = 400 / Math.LN10;
  const PRIOR_GAMES = 1; // phantom average opponent, split evenly: keeps sparse results finite and ordered

  // ---------- small helpers ----------
  function mulberry32(seed) {
    let a = (seed >>> 0) || 1;
    return function rng() {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashSeed(text) {
    let h = 2166136261;
    const s = String(text);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }
  function poolOf(id) { return String(id).split(':')[0]; }
  function nameSlug(c) { return String(c && c.n != null ? c.n : c && c.id ? String(c.id).split(':').slice(1).join(':') : '').toLowerCase().replace(/[^a-z0-9]+/g, ''); }
  // Canonical, order-independent key. IDs never contain '|', so the key splits unambiguously.
  function pairKey(x, y) { return x < y ? x + '|' + y : y + '|' + x; }
  function wilson(successes, n, z) {
    z = z || 1.96;
    if (!(n > 0)) return [0, 1];
    const p = Math.min(1, Math.max(0, successes / n)), z2 = z * z;
    const denom = 1 + z2 / n, center = (p + z2 / (2 * n)) / denom;
    const half = z * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n) / denom;
    return [Math.max(0, center - half), Math.min(1, center + half)];
  }
  function newSession(rng) {
    const r = rng || Math.random;
    let s = '';
    while (s.length < 16) s += Math.floor(r() * 36).toString(36);
    return s;
  }

  // ---------- votes ----------
  function validateVote(v, opts) {
    const errors = [], known = opts && opts.known;
    const bad = m => errors.push(m);
    if (!v || typeof v !== 'object') return { ok: false, errors: ['not an object'] };
    if (v.v !== SCHEMA_VERSION) bad('unsupported schema version');
    if (typeof v.id !== 'string' || v.id.length < 3 || v.id.length > 80) bad('bad vote id');
    if (typeof v.session !== 'string' || !SESSION_RE.test(v.session)) bad('bad session key');
    for (const f of ['a', 'b', 'left', 'right']) if (typeof v[f] !== 'string' || !ID_RE.test(v[f])) bad('bad character id in ' + f);
    if (!errors.length) {
      if (v.a === v.b) bad('self pair');
      if (!(v.a < v.b)) bad('a/b not in canonical order');
      if (v.key !== v.a + '|' + v.b) bad('pair key mismatch');
      if (!((v.left === v.a && v.right === v.b) || (v.left === v.b && v.right === v.a))) bad('orientation does not match pair');
      if (!OUTCOMES.includes(v.outcome)) bad('bad outcome');
      if (v.outcome === 'win') { if (v.winner !== v.a && v.winner !== v.b) bad('winner not in pair'); } else if (v.winner != null) bad('winner set without a decisive outcome');
      const pools = [...new Set([poolOf(v.a), poolOf(v.b)])].sort();
      if (!Array.isArray(v.pools) || v.pools.join(',') !== pools.join(',')) bad('pools do not match ids');
      if (known && (!known.has(v.a) || !known.has(v.b))) bad('unknown character id');
    }
    if (typeof v.ts !== 'string' || !Number.isFinite(Date.parse(v.ts))) bad('bad timestamp');
    if (typeof v.model !== 'string' || !v.model || v.model.length > 40) bad('bad model version');
    if (!CONFIDENCE.includes(v.confidence == null ? null : v.confidence)) bad('bad confidence');
    return { ok: errors.length === 0, errors };
  }
  /** Build a vote from the pair that was shown. choice: 'left' | 'right' | 'tie' | 'skip'. */
  function makeVote(pair, choice, ctx) {
    ctx = ctx || {};
    const left = pair.left, right = pair.right;
    const a = left < right ? left : right, b = left < right ? right : left;
    let outcome, winner = null;
    if (choice === 'left' || choice === 'right') { outcome = 'win'; winner = choice === 'left' ? left : right; }
    else if (choice === 'tie') outcome = 'tie';
    else if (choice === 'skip') outcome = 'skip';
    else return null;
    const session = ctx.session || newSession();
    const seq = Number.isInteger(ctx.seq) ? ctx.seq : 0;
    return {
      v: SCHEMA_VERSION,
      id: session + '-' + String(seq).padStart(6, '0'),
      session, key: a + '|' + b, a, b, left, right, outcome, winner,
      pools: [...new Set([poolOf(a), poolOf(b)])].sort(),
      ts: ctx.ts || new Date().toISOString(),
      model: ctx.model || MODEL_VERSION,
      confidence: ctx.confidence || null
    };
  }
  function newStore(votes) { const s = { version: SCHEMA_VERSION, votes: [], ids: new Set() }; for (const v of votes || []) addVote(s, v); return s; }
  function addVote(store, vote, opts) {
    const check = validateVote(vote, opts);
    if (!check.ok) return { added: false, reason: 'invalid: ' + check.errors[0] };
    if (store.ids.has(vote.id)) return { added: false, reason: 'duplicate' };
    store.ids.add(vote.id); store.votes.push(vote);
    return { added: true };
  }
  function undoLast(store) {
    const v = store.votes.pop();
    if (v) store.ids.delete(v.id);
    return v || null;
  }
  /** Merge several vote arrays, dropping invalid and duplicate (same id) votes. Order-independent result. */
  function mergeVotes(lists, opts) {
    const store = newStore(), dropped = { invalid: 0, duplicate: 0 };
    for (const list of lists) for (const v of list || []) {
      const r = addVote(store, v, opts);
      if (!r.added) dropped[r.reason === 'duplicate' ? 'duplicate' : 'invalid']++;
    }
    store.votes.sort((x, y) => (x.id < y.id ? -1 : x.id > y.id ? 1 : 0));
    return { store, dropped };
  }

  // ---------- sampling ----------
  function buildCounts(votes) {
    const pair = new Map(), item = new Map(), decisive = new Map();
    for (const v of votes || []) {
      pair.set(v.key, (pair.get(v.key) || 0) + 1);
      if (v.outcome !== 'skip') decisive.set(v.key, (decisive.get(v.key) || 0) + 1);
      item.set(v.a, (item.get(v.a) || 0) + 1);
      item.set(v.b, (item.get(v.b) || 0) + 1);
    }
    return { pair, item, decisive };
  }
  /**
   * Pick the next pair. sideA / sideB are arrays of { id, n? } for the left-pool and right-pool pickers
   * (identical arrays for a one-pool Gauntlet). Coverage-aware: samples a handful of candidate pairs and
   * keeps the least-voted one, preferring rarely seen characters. Orientation is randomized.
   */
  function nextPair(sideA, sideB, opts) {
    opts = opts || {};
    const rng = opts.rng || Math.random, counts = opts.counts || { pair: new Map(), item: new Map() };
    const avoid = opts.avoidKeys || new Set(), tries = opts.tries || 40;
    if (!sideA || !sideA.length || !sideB || !sideB.length) return null;
    const seen = id => counts.item.get(id) || 0;
    // Repeats are wanted: the same matchup answered the same way again strengthens the case, and a different
    // answer exposes a shaky one. A share of deals re-asks an already-voted pair (fewest answers first), with
    // the sides randomly swapped so position bias cannot masquerade as agreement.
    const repeatRate = opts.repeatRate != null ? opts.repeatRate : 0.15;
    if (repeatRate > 0 && counts.decisive && counts.decisive.size && rng() < repeatRate) {
      const inA = new Set(sideA.map(c => c.id)), inB = new Set(sideB.map(c => c.id));
      let pick = null;
      for (const [key, n] of counts.decisive) {
        if (avoid.has(key)) continue;
        const [x, y] = key.split('|');
        if (!((inA.has(x) && inB.has(y)) || (inA.has(y) && inB.has(x)))) continue;
        const score = n + rng() * 0.5;
        if (!pick || score < pick.score) pick = { score, key, x, y };
      }
      if (pick) {
        const flip = rng() < 0.5;
        return { key: pick.key, a: pick.x, b: pick.y, left: flip ? pick.y : pick.x, right: flip ? pick.x : pick.y, repeat: true };
      }
    }
    function pick(list) {
      let best = null;
      for (let i = 0; i < 3; i++) {
        const c = list[Math.floor(rng() * list.length)];
        if (!best || seen(c.id) < seen(best.id)) best = c;
      }
      return best;
    }
    let best = null;
    for (let i = 0; i < tries; i++) {
      const x = pick(sideA), y = pick(sideB);
      if (x.id === y.id) continue;
      if (nameSlug(x) && nameSlug(x) === nameSlug(y)) continue; // the same character listed in two pools
      const key = pairKey(x.id, y.id);
      if (avoid.has(key)) continue;
      const score = (counts.pair.get(key) || 0) * 1000 + seen(x.id) + seen(y.id) + rng() * 0.5;
      if (!best || score < best.score) best = { score, x, y, key };
    }
    if (!best) return null;
    const flip = rng() < 0.5;
    const left = flip ? best.y : best.x, right = flip ? best.x : best.y;
    const a = left.id < right.id ? left.id : right.id, b = left.id < right.id ? right.id : left.id;
    return { key: best.key, a, b, left: left.id, right: right.id };
  }

  // ---------- aggregation (deduplicated, no session keys or timestamps) ----------
  function aggregate(votes, opts) {
    const { store, dropped } = mergeVotes([votes], opts);
    const pairs = new Map();
    let decisive = 0, ties = 0, skips = 0, leftWins = 0;
    const sessions = new Set();
    for (const v of store.votes) {
      sessions.add(v.session);
      let p = pairs.get(v.key);
      if (!p) { p = { key: v.key, a: v.a, b: v.b, aWins: 0, bWins: 0, ties: 0, skips: 0, aLeftDecisive: 0, decisive: 0 }; pairs.set(v.key, p); }
      if (v.outcome === 'skip') { p.skips++; skips++; continue; }
      if (v.outcome === 'tie') { p.ties++; ties++; continue; }
      p.decisive++; decisive++;
      if (v.winner === v.a) p.aWins++; else p.bWins++;
      if (v.left === v.a) p.aLeftDecisive++;
      if (v.winner === v.left) leftWins++;
    }
    const list = [...pairs.values()].sort((x, y) => (x.key < y.key ? -1 : x.key > y.key ? 1 : 0));
    // Repeated answers to the same matchup are kept and counted; these show how often they agree.
    let repeatPairs = 0, unanimousRepeatPairs = 0;
    for (const p of list) {
      if (p.aWins + p.bWins + p.ties < 2) continue;
      repeatPairs++;
      if (p.ties === 0 && (p.aWins === 0 || p.bWins === 0)) unanimousRepeatPairs++;
    }
    const bias = { decisiveVotes: decisive, leftWins, leftShare: decisive ? leftWins / decisive : null, wilson95: decisive ? wilson(leftWins, decisive) : null };
    return {
      schema: AGG_SCHEMA, version: SCHEMA_VERSION, model: MODEL_VERSION,
      totals: { votes: store.votes.length, decisive, ties, skips, pairs: list.length, repeatPairs, unanimousRepeatPairs, sessions: sessions.size, droppedInvalid: dropped.invalid, droppedDuplicate: dropped.duplicate },
      positionBias: bias,
      pairs: list
    };
  }
  function aggregatesToCSV(agg) {
    const head = 'pair_key,a,b,a_wins,b_wins,ties,skips,decisive,a_left_decisive';
    return [head].concat(agg.pairs.map(p => [p.key, p.a, p.b, p.aWins, p.bWins, p.ties, p.skips, p.decisive, p.aLeftDecisive].join(','))).join('\n') + '\n';
  }
  function validateAggregates(agg) {
    const errors = [];
    if (!agg || agg.schema !== AGG_SCHEMA) errors.push('wrong schema');
    else if (agg.version !== SCHEMA_VERSION) errors.push('unsupported version');
    else if (!Array.isArray(agg.pairs)) errors.push('pairs missing');
    else for (const p of agg.pairs) {
      if (!ID_RE.test(p.a) || !ID_RE.test(p.b) || !(p.a < p.b) || p.key !== p.a + '|' + p.b) { errors.push('bad pair ' + p.key); break; }
      if (![p.aWins, p.bWins, p.ties, p.skips].every(n => Number.isInteger(n) && n >= 0)) { errors.push('bad counts ' + p.key); break; }
    }
    return { ok: errors.length === 0, errors };
  }

  // ---------- coverage ----------
  /** universe: optional { poolId: [characterId, ...] } so coverage is measured against the full roster. */
  function coverage(agg, universe) {
    const voted = new Map(), pools = new Map();
    let within = 0, cross = 0;
    const touch = id => { const p = poolOf(id); if (!pools.has(p)) pools.set(p, { pool: p, characters: 0, voted: 0 }); return pools.get(p); };
    for (const p of agg.pairs) {
      if (p.aWins + p.bWins + p.ties === 0) continue;
      (poolOf(p.a) === poolOf(p.b) ? within++ : cross++);
      for (const id of [p.a, p.b]) voted.set(id, (voted.get(id) || 0) + p.aWins + p.bWins + p.ties);
    }
    if (universe) for (const [pool, ids] of Object.entries(universe)) { const e = touch(pool + ':x'); e.characters = ids.length; }
    for (const id of voted.keys()) { const e = touch(id); e.voted++; if (!universe) e.characters++; }
    const rows = [...pools.values()].sort((x, y) => (x.pool < y.pool ? -1 : 1)).map(r => ({ ...r, share: r.characters ? r.voted / r.characters : null }));
    return { votedCharacters: voted.size, withinPoolPairs: within, crossPoolPairs: cross, pools: rows };
  }

  // ---------- ranking: regularized Bradley-Terry ----------
  function components(pairs) {
    const parent = new Map();
    const find = x => { let r = x; while (parent.get(r) !== r) r = parent.get(r); while (parent.get(x) !== r) { const n = parent.get(x); parent.set(x, r); x = n; } return r; };
    for (const p of pairs) {
      if (p.aWins + p.bWins + p.ties === 0) continue;
      for (const id of [p.a, p.b]) if (!parent.has(id)) parent.set(id, id);
      const ra = find(p.a), rb = find(p.b);
      if (ra !== rb) parent.set(ra < rb ? rb : ra, ra < rb ? ra : rb);
    }
    const roots = new Map(), out = new Map();
    for (const id of [...parent.keys()].sort()) {
      const r = find(id);
      if (!roots.has(r)) roots.set(r, roots.size + 1);
      out.set(id, roots.get(r));
    }
    return out;
  }
  /**
   * Ratings on an Elo-like scale (1500 = an average character; 400 points = 10:1 odds). Ties count half a win each.
   * A phantom average opponent adds PRIOR_GAMES of evidence so sparse data stays finite and ordered; with few votes
   * everyone stays near 1500 and the interval says so. `component` marks groups that are directly or indirectly
   * linked; ratings across different components rest on the prior alone and are not comparable evidence.
   */
  function rank(agg, opts) {
    opts = opts || {};
    const prior = opts.priorGames != null ? opts.priorGames : PRIOR_GAMES;
    const games = agg.pairs.filter(p => p.aWins + p.bWins + p.ties > 0);
    const ids = [...new Set(games.flatMap(p => [p.a, p.b]))].sort();
    const idx = new Map(ids.map((id, i) => [id, i]));
    const n = ids.length;
    const W = new Array(n).fill(prior / 2), G = new Array(n).fill(0), WIN = new Array(n).fill(0), LOSS = new Array(n).fill(0), TIE = new Array(n).fill(0);
    const edges = [];
    for (const p of games) {
      const i = idx.get(p.a), j = idx.get(p.b), m = p.aWins + p.bWins + p.ties;
      W[i] += p.aWins + p.ties / 2; W[j] += p.bWins + p.ties / 2;
      G[i] += m; G[j] += m;
      WIN[i] += p.aWins; LOSS[i] += p.bWins; TIE[i] += p.ties;
      WIN[j] += p.bWins; LOSS[j] += p.aWins; TIE[j] += p.ties;
      edges.push([i, j, m]);
    }
    const s = new Array(n).fill(1);
    let iterations = 0;
    for (; iterations < 1000; iterations++) {
      const denom = new Array(n).fill(0);
      for (let i = 0; i < n; i++) denom[i] = prior / (s[i] + 1);
      for (const [i, j, m] of edges) { const d = m / (s[i] + s[j]); denom[i] += d; denom[j] += d; }
      let delta = 0;
      for (let i = 0; i < n; i++) { const next = W[i] / denom[i]; delta = Math.max(delta, Math.abs(Math.log(next / s[i]))); s[i] = next; }
      if (delta < 1e-10) break;
    }
    const fisher = new Array(n).fill(0);
    for (let i = 0; i < n; i++) fisher[i] = prior * (s[i] / (s[i] + 1)) * (1 / (s[i] + 1));
    for (const [i, j, m] of edges) { const q = (s[i] / (s[i] + s[j])) * (s[j] / (s[i] + s[j])) * m; fisher[i] += q; fisher[j] += q; }
    const comp = components(games);
    const rows = ids.map((id, i) => {
      const theta = Math.log(s[i]), se = 1 / Math.sqrt(fisher[i]);
      const rating = 1500 + ELO_PER_NAT * theta, half = 1.96 * ELO_PER_NAT * se;
      const total = WIN[i] + LOSS[i] + TIE[i], score = WIN[i] + TIE[i] / 2;
      return { id, pool: poolOf(id), rating, ci95: [rating - half, rating + half], lower: rating - half, wins: WIN[i], losses: LOSS[i], ties: TIE[i], games: total,
        winRate: total ? score / total : null, winRateWilson95: total ? wilson(score, total) : null, component: comp.get(id) };
    });
    // Rank by rating; the conservative lower bound breaks ties so thinly-tested characters do not leapfrog.
    rows.sort((x, y) => y.rating - x.rating || y.lower - x.lower || (x.id < y.id ? -1 : 1));
    rows.forEach((r, i) => { r.rank = i + 1; });
    return { model: MODEL_VERSION, priorGames: prior, iterations, characters: rows.length, components: new Set(comp.values()).size, rows };
  }

  // ---------- transitive inference + contradictions ----------
  /** Majority-win graph: edge x -> y means x has beaten y more often than y beat x. Ties and even splits make no edge. */
  function winGraph(agg, minMargin) {
    const margin = minMargin || 1, out = new Map();
    const add = (x, y) => { if (!out.has(x)) out.set(x, new Set()); out.get(x).add(y); if (!out.has(y)) out.set(y, new Set()); };
    for (const p of agg.pairs) {
      if (p.aWins - p.bWins >= margin) add(p.a, p.b);
      else if (p.bWins - p.aWins >= margin) add(p.b, p.a);
      else { if (!out.has(p.a)) out.set(p.a, new Set()); if (!out.has(p.b)) out.set(p.b, new Set()); }
    }
    return out;
  }
  function pathFrom(graph, from, to, maxDepth) {
    if (!graph.has(from) || !graph.has(to)) return null;
    const prev = new Map([[from, null]]);
    let frontier = [from];
    for (let depth = 0; depth < maxDepth && frontier.length; depth++) {
      const nextFrontier = [];
      for (const x of frontier) for (const y of [...graph.get(x)].sort()) {
        if (prev.has(y)) continue;
        prev.set(y, x);
        if (y === to) { const path = [y]; let c = x; while (c != null) { path.unshift(c); c = prev.get(c); } return path; }
        nextFrontier.push(y);
      }
      frontier = nextFrontier;
    }
    return null;
  }
  /**
   * Predict x vs y from other results: if x beat someone who beat someone ... who beat y, x probably beats y.
   * Returns { predicted: 'x'|'y'|null, source: 'direct'|'chain'|'conflict'|'none', path }.
   * Chains weaken with length; this is a hint for choosing pairs and for spotting contradictions, never a ruling.
   */
  function infer(graph, x, y, maxDepth) {
    maxDepth = maxDepth || 4;
    const xy = pathFrom(graph, x, y, maxDepth), yx = pathFrom(graph, y, x, maxDepth);
    if (xy && yx) return { predicted: null, source: 'conflict', path: null, other: null };
    if (xy) return { predicted: 'x', source: xy.length === 2 ? 'direct' : 'chain', path: xy };
    if (yx) return { predicted: 'y', source: yx.length === 2 ? 'direct' : 'chain', path: yx };
    return { predicted: null, source: 'none', path: null };
  }
  /** Cycles in the majority graph (A beats B beats C beats A) via iterative Tarjan SCC. */
  function contradictions(agg, minMargin) {
    const graph = winGraph(agg, minMargin), nodes = [...graph.keys()].sort();
    const index = new Map(), low = new Map(), onStack = new Set(), stack = [], cycles = [];
    let counter = 0;
    for (const root of nodes) {
      if (index.has(root)) continue;
      const work = [[root, [...graph.get(root)].sort(), 0]];
      index.set(root, counter); low.set(root, counter); counter++; stack.push(root); onStack.add(root);
      while (work.length) {
        const frame = work[work.length - 1], [v, nbrs] = frame;
        if (frame[2] < nbrs.length) {
          const w = nbrs[frame[2]++];
          if (!index.has(w)) { index.set(w, counter); low.set(w, counter); counter++; stack.push(w); onStack.add(w); work.push([w, [...graph.get(w)].sort(), 0]); }
          else if (onStack.has(w)) low.set(v, Math.min(low.get(v), index.get(w)));
        } else {
          if (low.get(v) === index.get(v)) {
            const comp = []; let w;
            do { w = stack.pop(); onStack.delete(w); comp.push(w); } while (w !== v);
            if (comp.length > 1) cycles.push(comp.sort());
          }
          work.pop();
          if (work.length) { const parent = work[work.length - 1][0]; low.set(parent, Math.min(low.get(parent), low.get(v))); }
        }
      }
    }
    cycles.sort((x, y) => y.length - x.length || (x[0] < y[0] ? -1 : 1));
    const contested = agg.pairs.filter(p => p.aWins > 0 && p.bWins > 0).map(p => ({ key: p.key, aWins: p.aWins, bWins: p.bWins }));
    return { cycles, contestedPairs: contested };
  }
  /** Compare decisive human results with another predictor (for example the atlas): predict(a, b) -> 'a' | 'b' | null. */
  function compareToPredictor(agg, predict, minMargin) {
    const margin = minMargin || 1, out = { compared: 0, agree: 0, disagree: 0, abstained: 0, disagreements: [] };
    for (const p of agg.pairs) {
      const diff = p.aWins - p.bWins;
      if (Math.abs(diff) < margin) continue;
      const human = diff > 0 ? 'a' : 'b', guess = predict(p.a, p.b);
      if (guess !== 'a' && guess !== 'b') { out.abstained++; continue; }
      out.compared++;
      if (guess === human) out.agree++; else { out.disagree++; out.disagreements.push({ key: p.key, human, predicted: guess, aWins: p.aWins, bWins: p.bWins }); }
    }
    out.agreement = out.compared ? out.agree / out.compared : null;
    out.agreementWilson95 = out.compared ? wilson(out.agree, out.compared) : null;
    return out;
  }

  // ---------- local persistence (this device only) ----------
  function loadLocal() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch { saved = null; }
    const session = saved && typeof saved.session === 'string' && SESSION_RE.test(saved.session) ? saved.session : newSession();
    const store = newStore(saved && Array.isArray(saved.votes) ? saved.votes.slice(-MAX_LOCAL_VOTES) : []);
    return { store, session, seq: store.votes.filter(v => v.session === session).length };
  }
  function saveLocal(ctx) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ version: SCHEMA_VERSION, session: ctx.session, votes: ctx.store.votes })); } catch { }
  }

  // ---------- optional shared submission (opt-in, anonymous, never blocks voting) ----------
  const SYNC_KEY = 'da.gauntlet.sync.v1';
  const SYNC_BATCH = 20;
  let syncUrl = null;
  function configureSync(url) { syncUrl = typeof url === 'string' && /^https:\/\//.test(url) ? url : null; }
  function syncConfigured() { return !!syncUrl; }
  function loadSync() {
    try {
      const s = JSON.parse(localStorage.getItem(SYNC_KEY) || 'null');
      return { share: !!(s && s.share), pending: Array.isArray(s && s.pending) ? s.pending.filter(x => typeof x === 'string') : [] };
    } catch { return { share: false, pending: [] }; }
  }
  function saveSync(sy) { try { localStorage.setItem(SYNC_KEY, JSON.stringify({ share: sy.share, pending: sy.pending })); } catch { } }
  /** Turn sharing on or off. Turning it on also queues the votes already saved on this device. */
  function setShare(state, on) {
    state.sync.share = !!on;
    if (on) for (const v of state.ctx.store.votes) if (!state.sync.pending.includes(v.id) && !(state.sync.sent || new Set()).has(v.id)) state.sync.pending.push(v.id);
    saveSync(state.sync);
  }
  /**
   * Send queued votes. The newest vote is held back (unless includeLatest) so Undo still works. Identical vote ids are
   * idempotent on the server, but separate votes on the same matchup are all stored and counted. 429 and 5xx keep
   * the queue for later; any other refusal drops that batch so a bad vote cannot block the queue forever.
   */
  async function flush(state, opts) {
    opts = opts || {};
    const doFetch = state.fetchImpl || (typeof fetch === 'function' ? fetch : null), sy = state.sync;
    if (!syncUrl || !sy || !sy.share || !doFetch || state.syncBusy) return { sent: 0 };
    const byId = new Map(state.ctx.store.votes.map(v => [v.id, v]));
    sy.pending = sy.pending.filter(id => byId.has(id)); // undone votes leave the queue
    const hold = opts.includeLatest ? 0 : 1;
    const ready = sy.pending.slice(0, Math.max(0, sy.pending.length - hold)).map(id => byId.get(id));
    if (!ready.length) return { sent: 0 };
    const session = ready[0].session, batch = ready.filter(v => v.session === session).slice(0, SYNC_BATCH);
    state.syncBusy = true;
    try {
      const res = await doFetch(syncUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ votes: batch }) });
      if (res.status === 429 || res.status >= 500) return { sent: 0, retry: true, status: res.status };
      let data = {};
      if (res.status === 200 || res.status === 422) { try { data = await res.json(); } catch { data = {}; } }
      const done = new Set(batch.map(v => v.id));
      sy.pending = sy.pending.filter(id => !done.has(id));
      sy.sent = sy.sent || new Set(); for (const id of done) sy.sent.add(id);
      saveSync(sy);
      return { sent: batch.length, stored: data.accepted || 0, alreadyStored: data.alreadyStored || 0, rejected: (data.rejected || []).length };
    } catch { return { sent: 0, retry: true }; } finally { state.syncBusy = false; }
  }

  // ---------- UI (browser only; reads host globals: POOLS, getCands, esc, avatar, getPool) ----------
  function poolIds() {
    if (typeof POOLS === 'undefined') return [];
    return Object.keys(POOLS).filter(id => id !== 'mashup' && POOLS[id] && Array.isArray(POOLS[id].entries) && POOLS[id].entries.length);
  }
  function poolTitle(id) { const p = typeof getPool === 'function' ? getPool(id) : null; return (p && (p.short || p.name)) || id.toUpperCase(); }
  function newState() {
    const ids = poolIds(), first = ids[0] || 'nba';
    return { stage: 'setup', poolA: first, poolB: first, current: null, lean: false, ctx: loadLocal(), sampleSeed: hashSeed(newSession()), draws: 0, flash: '', armedClear: false, sync: loadSync(), syncBusy: false };
  }
  function sides(state) {
    const toList = pool => getCands(pool).map(c => ({ id: c.id, n: c.n }));
    return [toList(state.poolA), toList(state.poolB)];
  }
  function deal(state) {
    const [A, B] = sides(state);
    const counts = buildCounts(state.ctx.store.votes.filter(v => v.pools.includes(state.poolA) && v.pools.includes(state.poolB)));
    const rng = mulberry32(state.sampleSeed + (state.draws++) * 7919);
    const recent = new Set(state.ctx.store.votes.slice(-20).map(v => v.key));
    state.current = nextPair(A, B, { rng, counts, avoidKeys: recent });
    return state.current;
  }
  function start(state) { state.stage = 'vote'; state.flash = ''; deal(state); }
  function cardById(id) { const pool = poolOf(id); return getCands(pool).find(c => c.id === id) || null; }
  function vote(state, choice) {
    if (!state.current) return { accepted: false, reason: 'No pair on screen.' };
    const v = makeVote(state.current, choice, { session: state.ctx.session, seq: state.ctx.seq, confidence: choice === 'left' || choice === 'right' ? (state.lean ? 'lean' : null) : null });
    if (!v) return { accepted: false, reason: 'Unknown choice.' };
    const r = addVote(state.ctx.store, v);
    if (!r.added) return { accepted: false, reason: r.reason };
    state.ctx.seq++; saveLocal(state.ctx);
    if (state.sync && state.sync.share) { state.sync.pending.push(v.id); saveSync(state.sync); flush(state).catch(() => { }); }
    state.lean = false;
    state.flash = choice === 'skip' ? 'Skipped.' : choice === 'tie' ? 'Recorded as too close to call.' : 'Vote saved.';
    deal(state);
    return { accepted: true, vote: v };
  }
  function undo(state) {
    const v = undoLast(state.ctx.store);
    if (!v) return false;
    state.ctx.seq = Math.max(0, state.ctx.seq - (v.session === state.ctx.session ? 1 : 0));
    if (state.sync) { state.sync.pending = state.sync.pending.filter(id => id !== v.id); saveSync(state.sync); }
    saveLocal(state.ctx);
    state.current = { key: v.key, a: v.a, b: v.b, left: v.left, right: v.right };
    state.stage = 'vote'; state.flash = 'Last vote undone.';
    return true;
  }
  function clearAll(state) { state.ctx.store = newStore(); state.ctx.seq = 0; saveLocal(state.ctx); state.current = null; state.flash = 'Cleared.'; state.armedClear = false; }
  function exportJSON(state) { return JSON.stringify({ schema: 'draft-anything.gauntlet.votes', version: SCHEMA_VERSION, votes: state.ctx.store.votes }, null, 1) + '\n'; }

  function cardHTML(c, side) {
    if (!c) return '<div class="gt-card panel">Unknown</div>';
    return '<button type="button" class="gt-card" data-act="gaunt-pick" data-side="' + side + '" aria-label="Pick ' + esc(c.n) + '">'
      + avatar(c) + '<strong>' + esc(c.n) + '</strong><small>' + esc(poolTitle(c.pool)) + '</small>'
      + (c.t ? '<span class="gt-tag">' + esc(c.t) + '</span>' : '') + '</button>';
  }
  function setupHTML(state) {
    const ids = poolIds();
    const chips = (field, current) => ids.map(id => '<button type="button" class="chip" data-act="gaunt-pool" data-field="' + field + '" data-pool="' + id + '" aria-pressed="' + (current === id) + '">' + esc(poolTitle(id)) + '</button>').join('');
    const same = state.poolA === state.poolB;
    return '<div class="panel gt-setup"><h3 class="h">Choose the arena</h3>'
      + '<p class="note">Pick one pool to rank within a universe, or two different pools to link universes. Characters are dealt at random; you pick who wins.</p>'
      + '<div class="gt-field"><b>Left pool</b><div class="row gt-chips">' + chips('A', state.poolA) + '</div></div>'
      + '<div class="gt-field"><b>Right pool</b><div class="row gt-chips">' + chips('B', state.poolB) + '</div></div>'
      + '<p class="note">' + (same ? 'Matchups: ' + esc(poolTitle(state.poolA)) + ' vs ' + esc(poolTitle(state.poolA)) + '.' : 'Matchups: ' + esc(poolTitle(state.poolA)) + ' vs ' + esc(poolTitle(state.poolB)) + ' (cross-pool).') + '</p>'
      + (syncConfigured() ? '<div class="gt-field"><button type="button" class="chip" data-act="gaunt-share" aria-pressed="' + state.sync.share + '">' + (state.sync.share ? 'Sharing votes anonymously \u2713' : 'Share my votes anonymously') + '</button><p class="note">Sends only your picks and a random session code to the shared ladder, including votes already saved here. No name, email or location. You can switch it off any time; votes already sent stay.</p></div>' : '')
      + '<div class="row"><button class="btn primary" data-act="gaunt-start">Start voting</button><button class="btn" data-act="gaunt-ladder">View ladder</button></div></div>';
  }
  function voteHTML(state) {
    const c = state.current;
    if (!c) return '<div class="panel"><p>Could not deal a pair from this selection.</p><button class="btn" data-act="gaunt-setup">Back</button></div>';
    const n = state.ctx.store.votes.length;
    return '<div class="gt-vote"><div class="gt-status"><span>' + esc(state.flash || 'Who wins a fair fight?') + '</span><span>' + n + ' saved on this device</span></div>'
      + '<div class="gt-pair">' + cardHTML(cardById(c.left), 'left') + '<span class="gt-vs" aria-hidden="true">VS</span>' + cardHTML(cardById(c.right), 'right') + '</div>'
      + '<div class="row gt-actions"><button class="btn" data-act="gaunt-tie">Too close to call</button><button class="btn" data-act="gaunt-skip">Skip / don’t know</button>'
      + '<button class="btn" data-act="gaunt-lean" aria-pressed="' + state.lean + '">' + (state.lean ? 'Next pick is a lean ✓' : 'Mark next pick as a lean') + '</button></div>'
      + '<div class="row gt-actions"><button class="btn small" data-act="gaunt-undo"' + (n ? '' : ' disabled') + '>Undo last</button><button class="btn small" data-act="gaunt-ladder">Ladder</button><button class="btn small" data-act="gaunt-setup">Change pools</button></div>'
      + '<p class="note">The game’s own prediction is hidden on purpose. ' + (state.sync && state.sync.share ? 'Votes are saved here and shared anonymously.' : 'Votes are saved on this device only.') + '</p></div>';
  }
  function ladderHTML(state) {
    const agg = aggregate(state.ctx.store.votes), r = rank(agg), bias = agg.positionBias, cyc = contradictions(agg);
    const name = id => { const c = cardById(id); return c ? c.n : id; };
    const rows = r.rows.slice(0, 25).map(x => '<tr><td>' + x.rank + '</td><td>' + esc(name(x.id)) + '<small> ' + esc(poolTitle(x.pool)) + '</small></td><td>' + Math.round(x.rating) + '</td><td>±' + Math.round((x.ci95[1] - x.ci95[0]) / 2) + '</td><td>' + x.wins + '-' + x.losses + '-' + x.ties + '</td></tr>').join('');
    return '<div class="panel gt-ladder"><div class="row" style="justify-content:space-between"><h3 class="h">Your ladder</h3><button class="btn small" data-act="gaunt-setup">Back</button></div>'
      + '<p class="note">Provisional ranking from ' + agg.totals.decisive + ' decisive votes on this device (ties count half). Wide ± means few results. This is calibration data, not a ruling.</p>'
      + (rows ? '<table class="gt-table"><thead><tr><th>#</th><th>Character</th><th>Rating</th><th>95%</th><th>W-L-T</th></tr></thead><tbody>' + rows + '</tbody></table>' : '<p class="note">No decisive votes yet.</p>')
      + '<p class="note">Left-side picks: ' + (bias.leftShare == null ? 'n/a' : Math.round(bias.leftShare * 100) + '% (50% is no position bias)') + ' · Repeated matchups: ' + (agg.totals.repeatPairs || 0) + ' (' + (agg.totals.unanimousRepeatPairs || 0) + ' unanimous)' + ' · Contradiction loops: ' + cyc.cycles.length + '</p>'
      + '<div class="row"><button class="btn small" data-act="gaunt-export">Download votes (JSON)</button><button class="btn small" data-act="gaunt-copy">Copy aggregate JSON</button><button class="btn small" data-act="gaunt-clear">' + (state.armedClear ? 'Tap again to erase all' : 'Erase my votes') + '</button></div></div>';
  }
  function render(state) {
    const body = state.stage === 'vote' ? voteHTML(state) : state.stage === 'ladder' ? ladderHTML(state) : setupHTML(state);
    return '<section class="gt-shell"><div class="mode-intro panel"><b>Gauntlet</b><span>Pick who wins, one matchup at a time. Your picks build a ranking ladder that helps calibrate the game’s matchup model. Experimental.</span></div>' + body + '</section>';
  }

  return {
    SCHEMA_VERSION, MODEL_VERSION, AGG_SCHEMA, STORE_KEY, PRIOR_GAMES,
    mulberry32, hashSeed, pairKey, wilson, newSession, poolOf,
    validateVote, makeVote, newStore, addVote, undoLast, mergeVotes,
    buildCounts, nextPair, aggregate, aggregatesToCSV, validateAggregates, coverage,
    rank, winGraph, infer, contradictions, compareToPredictor,
    configureSync, syncConfigured, loadSync, setShare, flush,
    loadLocal, saveLocal, newState, start, deal, vote, undo, clearAll, exportJSON, render, poolIds
  };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = Gauntlet;

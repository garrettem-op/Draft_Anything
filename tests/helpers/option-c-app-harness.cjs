/* Loads the REAL Draft Anything page scripts (every data module and the main
 * index.html script, in page order) into an isolated Node vm context with inert
 * DOM stubs, so tests exercise the actual teamScore/playGame/simChampionship
 * code rather than a re-implementation. Nothing here ships to players.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..', '..');

function inert(name) {
  const f = function () { return inert(name); };
  return new Proxy(f, {
    get(_, k) {
      if (k === Symbol.toPrimitive) return () => '';
      if (k === Symbol.iterator) return function* () {};
      if (k === 'then') return undefined;
      if (k === 'length') return 0;
      return inert(name);
    },
    set() { return true; },
    apply() { return inert(name); },
    construct() { return inert(name); },
  });
}

function loadApp(options = {}) {
  const base = options.root || root; // options.root: load another checkout (e.g. the pristine Version 1 baseline)
  const html = fs.readFileSync(path.join(base, 'index.html'), 'utf8');
  const store = {};
  const writes = [];
  const observer = function () { return { observe() {}, disconnect() {} }; };
  const sandbox = {
    console, URL, URLSearchParams, Intl, TextEncoder, TextDecoder, structuredClone, AbortController, AbortSignal, performance,
    setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {}, requestAnimationFrame: () => 0,
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); writes.push(k); },
      removeItem: k => { delete store[k]; },
    },
    document: inert('document'),
    navigator: { userAgent: 'node', onLine: true },
    location: { href: 'http://localhost/', search: options.search || '', hash: '', origin: 'http://localhost', pathname: '/' },
    history: { replaceState() {}, pushState() {} },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    addEventListener() {}, removeEventListener() {}, scrollTo() {}, alert() {}, confirm: () => false,
    fetch: () => Promise.reject(new Error('network disabled in tests')),
    crypto: require('node:crypto').webcrypto,
    getComputedStyle: () => inert('style'),
    IntersectionObserver: observer, ResizeObserver: observer, MutationObserver: observer,
    innerWidth: 390, innerHeight: 844,
  };
  sandbox.window = sandbox; sandbox.globalThis = sandbox; sandbox.self = sandbox;
  vm.createContext(sandbox);
  const tags = [...html.matchAll(/<script(?:\s+src="([^"]+)")?[^>]*>([\s\S]*?)<\/script>/g)];
  for (const [, src, inline] of tags) {
    if (src && src.startsWith('vendor/')) continue; // network client, not needed offline
    if (src && options.skip && options.skip(src)) continue;
    vm.runInContext(src ? fs.readFileSync(path.join(base, src), 'utf8') : inline, sandbox, { filename: src || 'index.html#inline' });
  }
  const run = code => vm.runInContext(code, sandbox);
  // Helpers defined INSIDE the page context so objects keep page prototypes.
  run(`
    function ocCand(pool, name) {
      const c = getCands(pool).find(x => x.n === name);
      if (!c) throw new Error('No roster entry ' + pool + ':' + name);
      return c;
    }
    /* spec: { posId: [pool, name] | [pool, name, formName] }; unfilled slots are
       filled from fillPool in roster order (skipping used names). */
    function ocRoster(sportKey, spec, fillPool) {
      const roster = {}, used = new Set();
      for (const [slot, ref] of Object.entries(spec)) { roster[slot] = ocCand(ref[0], ref[1]); used.add(ref[0] + ':' + ref[1]); }
      if (fillPool) {
        const pool = getCands(fillPool).filter(c => !used.has(c.pool + ':' + c.n));
        if (!pool.length) throw new Error('Unknown or empty pool ' + fillPool);
        let k = 0;
        for (const p of SPORTS[sportKey].pos) if (!roster[p.id]) roster[p.id] = pool[k++];
      }
      let out = roster;
      for (const [slot, ref] of Object.entries(spec)) {
        if (!ref[2]) continue;
        const v = { sport: sportKey, roster: out, surge: { id: out[slot].id, name: ref[2] } };
        if (!variantForm(v)) throw new Error('No documented form ' + ref[2] + ' for ' + ref[1]);
        out = variantRoster(v);
      }
      return out;
    }
    function ocTeam(sportKey, spec, fillPool) { return teamScore(sportKey, ocRoster(sportKey, spec, fillPool)); }
  `);
  return { sandbox, run, store, writes, call: (fn, ...args) => sandbox[fn](...args) };
}

module.exports = { loadApp, root };

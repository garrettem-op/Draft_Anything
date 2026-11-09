/* Shared, read-only loader for the character ability audit.
   Loads the real roster from index.html plus every bundled evidence layer exactly as the
   browser does (no network, no OpenAI, no Supabase), so reports and tests measure what
   players actually experience. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const LEGACY_POOL_IDS = ['nba', 'mcu', 'toons', 'muppets', 'games', 'pokemon', 'starwars'];
// Pools registered by data/new-pool-core.js (DC, Middle-earth, Harry Potter, ...).
const ADDED_POOL_IDS = ['dc', 'lotr', 'harrypotter'];
const POOL_IDS = [...LEGACY_POOL_IDS, ...ADDED_POOL_IDS];
const POWER_TAGS = ['flight', 'magic', 'psychic', 'aquatic', 'fire', 'ice', 'electric',
  'tech', 'stealth', 'teleport', 'healing', 'giants'];
// Same order as the <script> tags in index.html.
const DATA_FILES = ['data/mcu-profiles.js', 'data/toons-profiles.js', 'data/games-profiles.js',
  'data/new-pool-core.js', 'data/pools-dc.js', 'data/pools-middle-earth.js', 'data/pools-harry-potter.js',
  'data/new-pool-traits.js', 'data/new-pool-powers.js',
  'data/pool-lore-dc.js', 'data/pool-lore-middle-earth.js', 'data/pool-lore-harry-potter.js',
  'data/character-abilities.js', 'data/campaign-eligibility.js', 'data/campaign.js'];

function read(p) { return fs.readFileSync(path.join(ROOT, p), 'utf8'); }

function loadGame() {
  const ctx = vm.createContext({
    window: { DA_CHARACTER_GUIDES: {} },
    S: { campaign: { history: [], roster: {}, step: 0, stageOrder: [] } },
    KnowledgeEngine: { has: () => false },
    muppetForceOf: () => null, MUPPET_FORCE_RULE: { campaignMinimum: 65 },
    lsGet: (_, v) => v, lsSet: () => {}, SPORTS: {}
  });
  for (const f of DATA_FILES) vm.runInContext(read(f), ctx, { filename: f });
  const html = read('index.html');
  vm.runInContext('var POOLS=Object.assign({}, window.DA_ADDED_POOLS);', ctx);
  for (const id of LEGACY_POOL_IDS) {
    const start = html.indexOf('POOLS.' + id + ' =');
    const end = html.indexOf('};', start);
    if (start < 0 || end < start) throw new Error('Missing pool ' + id + ' in index.html');
    vm.runInContext(html.slice(start, end + 2), ctx, { filename: 'index.html/' + id });
  }
  const pools = vm.runInContext('POOLS', ctx);
  const lore = vm.runInContext('window.DA_POOL_LORE || {}', ctx);
  const roster = [];
  for (const pool of POOL_IDS) {
    if (!pools[pool]) throw new Error('Pool ' + pool + ' did not load');
    for (const e of pools[pool].entries) {
      // Mirrors buildCandidates in index.html: lore "short" replaces the roster blurb when present.
      const short = lore[pool]?.[e[0]]?.short;
      roster.push({ id: pool + ':' + e[0], pool, n: e[0], t: (typeof short === 'string' && short.trim()) || e[2], a: e[3],
        taxonomy: Array.isArray(e[4]) ? e[4] : [], archetype: typeof e[5] === 'string' ? e[5] : null });
    }
  }
  const call = (expr, vars) => { Object.assign(ctx, vars); return vm.runInContext(expr, ctx); };
  return {
    ctx, roster,
    /** Which evidence layer accepts this candidate for the power, or null. */
    layer(c, tag) {
      if (call('CAMPAIGN_TAGS[__t].has(__c.n)', { __c: c, __t: tag })) return 'campaign-tag';
      const ab = call('characterAbilityEvidence(__c,__t)', { __c: c, __t: tag });
      if (ab) return 'character-abilities';
      const off = call('campaignOfflineEvidence(__c,__t)', { __c: c, __t: tag });
      if (off) return off.kind;
      return null;
    },
    allowed(c, tag) { return call('campaignAllowed(__c,__t)', { __c: c, __t: tag }); },
    abilities: call('CHARACTER_ABILITIES', {}),
    tagIndex: call('CHARACTER_ABILITY_TAGS', {}),
    disputes: call('CHARACTER_ABILITY_DISPUTES', {}),
    research: call('CHARACTER_ABILITY_RESEARCH_QUEUE', {}),
    campaignTags: call('CAMPAIGN_TAGS', {})
  };
}

/** Every power the live engine accepts for every roster character, with the layer used. */
function engineMatrix(game) {
  const out = new Map();
  for (const c of game.roster) {
    const row = {};
    for (const tag of POWER_TAGS) { const l = game.layer(c, tag); if (l) row[tag] = l; }
    out.set(c.id, row);
  }
  return out;
}

module.exports = { ROOT, POOL_IDS, LEGACY_POOL_IDS, ADDED_POOL_IDS, POWER_TAGS, loadGame, engineMatrix, read };

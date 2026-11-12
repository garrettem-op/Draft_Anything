/* Fixed seeded Version 1 fixtures used to prove the shadow evaluator changes
 * nothing. Each fixture runs the REAL engine (championship, season, series and
 * Head-to-Head paths in six sports plus Battle Royale) and is reduced to a
 * SHA-256 of its complete JSON result plus the next value of the live RNG.
 *
 * tests/fixtures/option-c-v1-golden.json holds the digests produced from the
 * untouched develop/v2-option-c base commit (see tools/option-c-shadow-report.cjs
 * --golden <checkout>). Any change to a winner, score, box-score input, combat
 * log, event or RNG position changes a digest.
 */
'use strict';
const crypto = require('node:crypto');

const PAGE = `
(shadowOn => {
  const OC = typeof DA_OPTION_C !== 'undefined' ? DA_OPTION_C : null;
  if (OC) { OC.shadow.clear(); shadowOn ? OC.shadow.enable() : OC.shadow.disable(); }
  const pools = ['nba', 'mcu', 'toons', 'muppets', 'dc', 'games', 'starwars', 'lotr'];
  const league = (sport, extra) => pools.map((pool, i) => ({ name: 'T' + i, score: ocTeam(sport, (extra && extra[i]) || {}, pool) }));
  const out = {};
  const keep = (id, value, rng) => { out[id] = JSON.stringify({ value, next: rng ? rng() : null }); };
  for (const sport of ['basketball', 'volleyball', 'football', 'soccer', 'baseball', 'hockey']) {
    const teams = league(sport), r = rngFrom('golden:champ:' + sport);
    keep('championship:' + sport, simChampionship(sport, teams, 2.5, r), r);
  }
  {
    const extra = { 4: { d1: ['dc', 'Batman', 'Hellbat Armor Batman'], bn: ['dc', 'Robin (Damian Wayne)'] }, 1: { d1: ['mcu', 'Thanos', 'King Thanos'] }, 2: { d2: ['mcu', 'Iron Man'] } };
    const teams = league('brawl', extra), r = rngFrom('golden:champ:brawl');
    keep('championship:brawl', simChampionship('brawl', teams, 6, r), r);
    const r2 = rngFrom('golden:season:brawl');
    keep('season:brawl', simSeason('brawl', league('brawl', extra), r2), r2);
  }
  for (const sport of ['basketball', 'hockey', 'soccer']) {
    const r = rngFrom('golden:season:' + sport);
    keep('season:' + sport, simSeason(sport, league(sport), r), r);
  }
  {
    const A = ocTeam('volleyball', { lib: ['mcu', 'Spider-Man'], bn: ['nba', 'Stephen Curry'] }, 'nba'), B = ocTeam('volleyball', { s: ['muppets', 'Kermit the Frog'], oh1: ['toons', 'Bugs Bunny'] }, 'mcu');
    // Both Head-to-Head clients resolve the same contest from the same seed.
    keep('h2h:volleyball:host', simH2H('volleyball', A, B, 'low', 'CT492'));
    keep('h2h:volleyball:guest', simH2H('volleyball', A, B, 'low', 'CT492'));
    keep('h2h:volleyball:high', simH2H('volleyball', A, B, 'high', 'NORWALK7'));
    const X = ocTeam('brawl', { tk1: ['mcu', 'Abomination'], tk2: ['mcu', 'Adam Warlock'], d1: ['dc', 'Batman', 'Hellbat Armor Batman'], d2: ['dc', 'Joker'], d3: ['dc', 'Lucifer Morningstar'], bn: ['mcu', 'Captain Carter'], cmd: ['mcu', 'Captain America'] });
    const Y = ocTeam('brawl', { tk1: ['dc', 'Ares (DC)'], tk2: ['mcu', 'The Watcher'], d1: ['dc', 'Death of the Endless'], d2: ['mcu', 'Scarlet Witch'], d3: ['dc', 'Darkseid'], bn: ['dc', 'Wonder Woman'], cmd: ['dc', 'Trigon'] });
    keep('h2h:brawl', simH2H('brawl', X, Y, 'off', 'CHUNGUS'));
    const r = rngFrom('golden:brawl:repeat'), games = [];
    for (let k = 0; k < 25; k++) games.push(playGame('brawl', X, Y, 6, r, k % 3 === 0));
    keep('playGame:brawl:x25', games, r);
    keep('teamScore:brawl', [X, Y].map(t => ({ rating: t.rating, playerScore: t.playerScore, mult: t.mult, muppet: t.muppetTeam, bench: t.benchChem, syn: t.syn.total, fits: t.rows.map(x => x.fit) })));
  }
  const recorded = OC ? OC.shadow.records().length : 0;
  if (OC) { OC.shadow.disable(); OC.shadow.clear(); }
  return JSON.stringify({ out, recorded });
})`;

function runParityFixtures(app, shadowOn) {
  const { out, recorded } = JSON.parse(app.run(PAGE + '(' + (shadowOn ? 'true' : 'false') + ')'));
  const digests = {};
  for (const [id, text] of Object.entries(out)) digests[id] = crypto.createHash('sha256').update(text).digest('hex');
  return { digests, recorded };
}

module.exports = { runParityFixtures };

(function (root) {
  'use strict';

  // Only single-universe drafts use these. Mashup and cross-universe seasons
  // intentionally retain their existing city + mascot naming convention.
  // Names are place-led and pool-specific; keep user-entered names unchanged.
  const POOL_TEAM_NAMES = Object.freeze({
    nba: Object.freeze([
      'New York Skyliners', 'Chicago Lakefront', 'Los Angeles Lights',
      'Boston Harbor Guard', 'Miami Breakers', 'Philadelphia Founders',
      'San Francisco Bay', 'Dallas Lone Stars', 'Houston Orbit',
      'Denver Summit', 'Phoenix Firebirds', 'Detroit Motorworks',
      'Atlanta Flight', 'Cleveland Rock', 'Brooklyn Bridges',
      'Milwaukee Lakefront', 'Toronto North', 'Memphis Blues',
      'New Orleans Brass', 'Portland Pioneers', 'Sacramento Gold',
      'Seattle Sound', 'Minneapolis Frost', 'Indianapolis Racers'
    ]),
    mcu: Object.freeze([
      'Wakanda Sentinels', 'Asgard Thunder', 'New York Defenders',
      'Knowhere Drifters', 'Sokovia Guardians', 'Kamar-Taj Mystics',
      'Madripoor Shadows', 'Xandar Nova', 'Sakaar Gladiators',
      'Ta Lo Dragons', 'Westview Hex', 'Titan Survivors',
      'New Asgard Valkyries', 'Talokan Tides', 'Lagos Shield',
      'Vormir Watchers', "Hell's Kitchen Heroes", 'Stark Tower Iron',
      'Queens Webslingers', 'Latveria Legion', 'Sanctum Sorcerers',
      'The Raft Wardens'
    ]),
    toons: Object.freeze([
      'Springfield Sidewinders', 'Bikini Bottom Brawlers',
      'Bedrock Boulders', 'Townsville Guardians', 'Gravity Falls Pines',
      'Quahog Clams', 'Duckburg Gold', 'Radiator Springs Racers',
      'Arendelle Blizzard', 'Pride Rock Royals', 'Elmore Oddballs',
      'Adventure Bay Rescuers', 'Halloween Town Ghouls',
      'Ooo Adventurers', 'Neverland Flyers', 'Zootopia Trailblazers',
      'The Boiling Isles Owls', "Wakko's Warner Lot", 'Hill Valley Time',
      'Ninjago City Ninjas', 'Atlantica Tides', 'Corona Lanterns'
    ]),
    muppets: Object.freeze([
      'Sesame Street Stars', 'Fraggle Rock Miners', 'Grouchland Grumps',
      'Muppet Theater Players', 'Happiness Hotel House Band',
      'Muppet Labs Experiments', "Kermit's Swamp Croakers",
      "Hooper's Store Neighbors", 'Muppet Studios Headliners',
      "Bear's Big Blue House", 'The Electric Mayhem',
      'Sesame Street Monsters', 'Fraggle Rock Doozers',
      'Muppet Island Castaways', 'The Muppet Newsroom',
      "Gonzo's Stunt Troupe", 'Muppet Treasure Island',
      'The Happiness Hotel Crew', 'The Muppet Show Balcony',
      'The Muppet Christmas Carol', 'Sesame Street Countdowns',
      'The Muppet Theater Orchestra'
    ]),
    games: Object.freeze([
      'Mushroom Kingdom Stars', 'Hyrule Guardians', 'Green Hill Runners',
      'Dream Land Defenders', 'Raccoon City Survivors',
      'Midgar SOLDIERs', 'City 17 Resistance', 'Night City Edgerunners',
      'Skyrim Dragonborn', 'Azeroth Champions', 'Sanctuary Wanderers',
      'Vice City Outlaws', 'Los Santos Legends', 'Silent Hill Phantoms',
      'Pelican Town Growers', 'Stormwind Knights', 'Spira Guardians',
      'Tristram Wanderers', 'Kingdom Hearts Keepers',
      'Zebes Explorers', 'New Donk City Jumpers', 'Rapture Riveters'
    ]),
    pokemon: Object.freeze([
      'Pallet Town Pioneers', 'Viridian Forest Rangers',
      'Pewter City Rockbreakers', 'Cerulean City Currents',
      'Vermilion City Sparks', 'Lavender Town Spirits',
      'Celadon City Blooms', 'Saffron City Psychics',
      'Fuchsia City Ninjas', 'Cinnabar Island Flames',
      'Indigo Plateau Champions', 'Mt. Moon Mystics',
      'Seafoam Islands Frost', 'Safari Zone Trackers',
      'Victory Road Veterans', 'Kanto Coast Surfers',
      'Diglett Cave Diggers', 'Rock Tunnel Rovers',
      'Power Plant Chargers', 'Pokémon Tower Haunters',
      'Cerulean Cape Waves', 'Viridian City Vanguards'
    ]),
    starwars: Object.freeze([
      'Coruscant Sentinels', 'Tatooine Suns', 'Naboo Royals',
      'Hoth Rebels', 'Endor Scouts', 'Mandalore Warriors',
      'Kashyyyk Guardians', 'Kamino Cloners', 'Mustafar Flames',
      'Bespin Cloudriders', 'Corellia Pilots', 'Jakku Scavengers',
      'Dagobah Mystics', 'Scarif Shoreguard', 'Jedha Protectors',
      'Lothal Ghosts', 'Alderaan Starlights', 'Geonosis Foundries',
      'Dathomir Nightsisters', 'Exegol Shadows', 'Yavin Starfighters',
      'Ahch-To Keepers'
    ]),
    dc: Object.freeze([
      'Gotham Knights', 'Metropolis Guardians', 'Central City Speedsters',
      'Coast City Lanterns', 'Atlantis Tridents',
      'Themyscira Amazons', 'Star City Archers',
      'Smallville Sentinels', 'Blüdhaven Blades',
      'Apokolips Furies', 'New Genesis Champions',
      'Kahndaq Thunder', 'Keystone City Comets',
      'Fawcett City Champions', 'Oa Guardians',
      'Arkham Shadows', 'Belle Reve Breakers',
      'Gorilla City Royals', 'Happy Harbor Heroes',
      'Midway City Hawks', 'Nanda Parbat Mystics',
      'Hub City Watchmen'
    ]),
    lotr: Object.freeze([
      'Gondor Shield', 'Rohan Riders', 'Shire Folk',
      'Rivendell Rangers', 'Lothlórien Wardens',
      'Moria Hammers', 'Mordor Shadows', 'Isengard Ironhands',
      'Erebor Mountain Guard', 'Dale Bowmen', 'Harad Serpents',
      'Númenor Mariners', 'Angband Flames', 'Valinor Stars',
      'Beleriand Blades', 'Minas Tirith Sentinels',
      'Edoras Horsemen', 'Osgiliath Watch', 'Pelargir Mariners',
      'Fangorn Ents', "Helm's Deep Defenders",
      'Dol Amroth Swans', 'Mirkwood Archers', 'Mithlond Shipwrights'
    ]),
    harrypotter: Object.freeze([
      'Hogwarts Spellcasters', 'Hogsmeade Howlers',
      'Diagon Alley Duelists', "Godric's Hollow Guardians",
      'Azkaban Wardens', 'Durmstrang Dragons',
      'Beauxbatons Enchanters', 'Ilvermorny Thunderbirds',
      'Forbidden Forest Centaurs', 'Knockturn Alley Shades',
      'Little Hangleton Serpents', 'Shell Cottage Seabirds',
      'Ottery St Catchpole Otters', "King's Cross Porters",
      'Grimmauld Place Phoenixes', 'Malfoy Manor Serpents',
      'Hogwarts Express Riders', 'Hogsmeade Station Guard',
      'The Burrow Broomsticks', 'Hogwarts Lake Merfolk',
      'Ministry of Magic Aurors', 'Hogsmeade High Street'
    ])
  });

  function suggestion(poolId, index) {
    const list = POOL_TEAM_NAMES[poolId];
    if (!list || !list.length) return null;
    const i = Number.isFinite(index) ? Math.trunc(index) : 0;
    return list[((i % list.length) + list.length) % list.length];
  }

  function generate(poolId, count, rng, legacy, reserved) {
    const list = POOL_TEAM_NAMES[poolId];
    if (!list) return typeof legacy === 'function' ? legacy(count, rng) : [];
    const needed = Math.max(0, Math.trunc(Number(count) || 0));
    if (!needed) return [];
    const random = typeof rng === 'function' ? rng : Math.random;
    const names = list.slice();
    // Fisher-Yates: deterministic with the supplied draft RNG.
    for (let i = names.length - 1; i > 0; i--) {
      const j = Math.floor(Math.min(0.999999999, Math.max(0, random())) * (i + 1));
      [names[i], names[j]] = [names[j], names[i]];
    }
    const used = new Set((reserved || []).map(s => String(s || '').trim().toLowerCase()).filter(Boolean));
    const result = [];
    for (const name of names) {
      if (used.has(name.toLowerCase())) continue;
      result.push(name);
      used.add(name.toLowerCase());
      if (result.length === needed) return result;
    }
    // Leagues can grow beyond the curated list: retain a themed name, never
    // silently switch a single-pool match to cross-universe city names.
    for (let suffix = 2; result.length < needed; suffix++) {
      for (const name of names) {
        const candidate = name + ' ' + suffix;
        if (used.has(candidate.toLowerCase())) continue;
        result.push(candidate);
        used.add(candidate.toLowerCase());
        if (result.length === needed) break;
      }
    }
    return result;
  }

  const api = Object.freeze({ POOL_TEAM_NAMES, suggestion, generate });
  root.DA_TEAM_NAMING = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

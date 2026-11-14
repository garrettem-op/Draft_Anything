/* Option C research batch 01 — MCU film-continuity baseline profiles.
 * These descriptions are provisional research notes, not owner-approved battle tiers.
 * No effect on V1 gameplay; do not upgrade evidence based on source URL alone.
 */
(function(root){ 'use strict';
const NS=root.DA_OPTION_C_MODULES||(root.DA_OPTION_C_MODULES={});
const PROFILES=Object.freeze({
  "mcu:Iron Man": {
    "id": "mcu:Iron Man",
    "name": "Iron Man",
    "schemaVersion": 1,
    "profileKind": "typed-combat-research",
    "continuity": "Marvel Cinematic Universe (film portrayal)",
    "summary": "Tony Stark's armored flight, repulsors and adaptable engineering make him a mobile ranged combatant.",
    "works": [
      "Iron Man (2008)",
      "The Avengers (2012)",
      "Avengers: Infinity War (2018)"
    ],
    "sources": [
      {
        "url": "https://www.marvel.com/movies/iron-man",
        "kind": "publisher-film-page",
        "verification": "reference-link; specific feat not independently confirmed by page"
      }
    ],
    "offense": {
      "domains": [
        "energy",
        "tech"
      ],
      "techniques": [
        "armored-flight",
        "repulsors",
        "missiles",
        "unibeam"
      ],
      "range": "mixed-ranged-and-melee"
    },
    "defense": {
      "mechanisms": [
        "powered-armor",
        "evasion"
      ]
    },
    "weaknesses": [
      "unarmored-human",
      "power-and-suit-dependence"
    ],
    "featNotes": [
      "His first powered suit escapes captivity; later suits support aerial energy attacks and emergency tactical adaptation."
    ],
    "limitations": [
      "Suit-dependent; Hulkbuster and Infinity Stone effects are not assumed for ordinary Iron Man."
    ],
    "evidenceStatus": "provisional",
    "reviewStatus": "initial-research-needs-independent-fact-check",
    "numericTier": null,
    "matchupClaims": [],
    "conditionalEquipment": true
  },
  "mcu:Captain America": {
    "id": "mcu:Captain America",
    "name": "Captain America",
    "schemaVersion": 1,
    "profileKind": "typed-combat-research",
    "continuity": "Marvel Cinematic Universe (film portrayal)",
    "summary": "Steve Rogers combines super-soldier conditioning, exceptional shield technique and small-unit leadership.",
    "works": [
      "Captain America: The First Avenger (2011)",
      "Captain America: The Winter Soldier (2014)"
    ],
    "sources": [
      {
        "url": "https://www.marvel.com/movies/captain-america-the-first-avenger",
        "kind": "publisher-film-page",
        "verification": "reference-link; specific feat not independently confirmed by page"
      }
    ],
    "offense": {
      "domains": [
        "physical"
      ],
      "techniques": [
        "shield-strike",
        "shield-throw",
        "hand-to-hand"
      ],
      "range": "primarily-close-range"
    },
    "defense": {
      "mechanisms": [
        "shield-block",
        "agility"
      ]
    },
    "weaknesses": [
      "no-ranged-superpower",
      "human-scale-vulnerability"
    ],
    "featNotes": [
      "Uses a shield in close combat and interception; fights trained opponents and leads field teams."
    ],
    "limitations": [
      "Shield possession matters; lifting Mjolnir is a later conditional event, not a standard ability."
    ],
    "evidenceStatus": "provisional",
    "reviewStatus": "initial-research-needs-independent-fact-check",
    "numericTier": null,
    "matchupClaims": [],
    "conditionalEquipment": true
  },
  "mcu:Thor": {
    "id": "mcu:Thor",
    "name": "Thor",
    "schemaVersion": 1,
    "profileKind": "typed-combat-research",
    "continuity": "Marvel Cinematic Universe (film portrayal)",
    "summary": "Thor is an Asgardian thunder wielder and durable close-range combatant; his baseline differs from Rune King Thor.",
    "works": [
      "Thor (2011)",
      "Thor: Ragnarok (2017)",
      "Avengers: Infinity War (2018)"
    ],
    "sources": [
      {
        "url": "https://www.marvel.com/movies/thor",
        "kind": "publisher-film-page",
        "verification": "reference-link; specific feat not independently confirmed by page"
      }
    ],
    "offense": {
      "domains": [
        "elemental",
        "physical"
      ],
      "techniques": [
        "lightning",
        "melee-weapon",
        "flight-with-weapon"
      ],
      "range": "mixed-ranged-and-melee"
    },
    "defense": {
      "mechanisms": [
        "asgardian-durability",
        "lightning-resistance"
      ]
    },
    "weaknesses": [
      "weapon-and-era-variation",
      "not-omnipotent"
    ],
    "featNotes": [
      "Conjures lightning in Ragnarok and confronts powerful Asgardian opponents; earlier hammer flight depends on Mjolnir."
    ],
    "limitations": [
      "Do not attach comic Rune King Thor feats or assume Stormbreaker is equipped in every era."
    ],
    "evidenceStatus": "provisional",
    "reviewStatus": "initial-research-needs-independent-fact-check",
    "numericTier": null,
    "matchupClaims": [],
    "conditionalEquipment": true
  },
  "mcu:Doctor Strange": {
    "id": "mcu:Doctor Strange",
    "name": "Doctor Strange",
    "schemaVersion": 1,
    "profileKind": "typed-combat-research",
    "continuity": "Marvel Cinematic Universe (film portrayal)",
    "summary": "Stephen Strange uses learned mystic techniques for shields, spatial portals, bindings and battlefield control.",
    "works": [
      "Doctor Strange (2016)",
      "Avengers: Infinity War (2018)"
    ],
    "sources": [
      {
        "url": "https://www.marvel.com/movies/doctor-strange",
        "kind": "publisher-film-page",
        "verification": "reference-link; specific feat not independently confirmed by page"
      }
    ],
    "offense": {
      "domains": [
        "magic",
        "control"
      ],
      "techniques": [
        "portals",
        "mystic-shields",
        "bindings",
        "illusions"
      ],
      "range": "mixed-ranged-and-melee"
    },
    "defense": {
      "mechanisms": [
        "mystic-barrier",
        "positioning"
      ]
    },
    "weaknesses": [
      "casting-and-concentration",
      "physical-vulnerability"
    ],
    "featNotes": [
      "Uses sling-ring portals and protective magical constructs; contests Thanos with spells in Infinity War."
    ],
    "limitations": [
      "Time Stone, Darkhold and other externally supplied artifacts are not assumed as standard equipment."
    ],
    "evidenceStatus": "provisional",
    "reviewStatus": "initial-research-needs-independent-fact-check",
    "numericTier": null,
    "matchupClaims": [],
    "conditionalEquipment": true
  },
  "mcu:Black Panther": {
    "id": "mcu:Black Panther",
    "name": "Black Panther",
    "schemaVersion": 1,
    "profileKind": "typed-combat-research",
    "continuity": "Marvel Cinematic Universe (film portrayal)",
    "summary": "T'Challa blends enhanced agility, stealth, martial technique and protective Wakandan vibranium technology.",
    "works": [
      "Captain America: Civil War (2016)",
      "Black Panther (2018)"
    ],
    "sources": [
      {
        "url": "https://www.marvel.com/movies/black-panther",
        "kind": "publisher-film-page",
        "verification": "reference-link; specific feat not independently confirmed by page"
      }
    ],
    "offense": {
      "domains": [
        "physical",
        "tech"
      ],
      "techniques": [
        "claws",
        "close-combat",
        "stealth-infiltration"
      ],
      "range": "primarily-close-range"
    },
    "defense": {
      "mechanisms": [
        "vibranium-suit",
        "agility"
      ]
    },
    "weaknesses": [
      "suit-and-tech-dependence",
      "finite-kinetic-absorption"
    ],
    "featNotes": [
      "Pursues and fights Winter Soldier in Civil War; uses suit and enhanced movement in Black Panther."
    ],
    "limitations": [
      "The kinetic-energy discharge is suit-generation-specific; not every appearance features it."
    ],
    "evidenceStatus": "provisional",
    "reviewStatus": "initial-research-needs-independent-fact-check",
    "numericTier": null,
    "matchupClaims": [],
    "conditionalEquipment": true
  },
  "mcu:Black Widow": {
    "id": "mcu:Black Widow",
    "name": "Black Widow",
    "schemaVersion": 1,
    "profileKind": "typed-combat-research",
    "continuity": "Marvel Cinematic Universe (film portrayal)",
    "summary": "Natasha Romanoff is a trained infiltrator and combat tactician using martial skill and standard spy equipment.",
    "works": [
      "The Avengers (2012)",
      "Captain America: The Winter Soldier (2014)",
      "Black Widow (2021)"
    ],
    "sources": [
      {
        "url": "https://www.marvel.com/movies/black-widow",
        "kind": "publisher-film-page",
        "verification": "reference-link; specific feat not independently confirmed by page"
      }
    ],
    "offense": {
      "domains": [
        "physical",
        "tech"
      ],
      "techniques": [
        "grappling",
        "widows-bite",
        "firearms",
        "infiltration"
      ],
      "range": "primarily-close-range"
    },
    "defense": {
      "mechanisms": [
        "evasion",
        "deception"
      ]
    },
    "weaknesses": [
      "ordinary-human-durability",
      "gear-dependence"
    ],
    "featNotes": [
      "Defeats trained human opposition through tactics, agility and close-quarters combat; uses Widow's Bite stun devices."
    ],
    "limitations": [
      "No superhuman regeneration or comic-only physiology assumed for the MCU portrayal."
    ],
    "evidenceStatus": "provisional",
    "reviewStatus": "initial-research-needs-independent-fact-check",
    "numericTier": null,
    "matchupClaims": [],
    "conditionalEquipment": true
  }
});
function profileFor(id){return PROFILES[id]||null;}
const api={PROFILES,profileFor}; NS.mcuResearchBatch01=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

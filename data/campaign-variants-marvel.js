/* Curated Marvel alternate forms. Evidence points to publisher-owned pages. */
const CAMPAIGN_VARIANTS_MARVEL = Object.freeze({
  "mcu:Spider-Man": [
    {
      "name": "Symbiote Spider-Man",
      "changes": {
        "str": 8,
        "agi": 8,
        "spd": 6,
        "clu": -7
      },
      "origin": "Marvel Comics · Alien Costume Saga",
      "source": "https://www.marvel.com/comics/guides/1859/spidermans_greatest_black_suit_moments",
      "kind": "symbiote",
      "feat": "Peter Parker bonds with the black alien suit; stronger, more aggressive, and able to generate organic webbing."
    },
    {
      "name": "Iron Spider",
      "changes": {
        "str": 5,
        "end": 9,
        "ref": 12,
        "tch": 7
      },
      "origin": "Marvel Comics · Civil War-era Stark armor",
      "source": "https://www.marvel.com/articles/comics/iron-spider-suit-history-explained",
      "kind": "suit",
      "feat": "Tony Stark equips Peter Parker with advanced spider armor featuring mechanical appendages and upgraded protection."
    }
  ],
  "mcu:Iron Man": [
    {
      "name": "Hulkbuster Iron Man",
      "changes": {
        "str": 13,
        "siz": 12,
        "end": 11,
        "agi": -9
      },
      "origin": "Marvel Comics · Hulkbuster armor",
      "source": "https://www.marvel.com/characters/iron-man-tony-stark/in-comics",
      "kind": "suit",
      "feat": "Tony uses oversized specialized anti-Hulk armor for heavy fighting at the cost of agility."
    },
    {
      "name": "Superior Iron Man",
      "changes": {
        "iq": 11,
        "tch": 12,
        "clu": -9,
        "ldr": -6
      },
      "origin": "Marvel Comics · Superior Iron Man (2014)",
      "source": "https://www.marvel.com/comics/series/19164/superior_iron_man_2014_2015",
      "kind": "alternate-persona",
      "feat": "A morally inverted Tony deploys advanced armor and technology while behaving ruthlessly."
    }
  ],
  "mcu:Captain Marvel": [
    {
      "name": "Binary Captain Marvel",
      "changes": {
        "str": 11,
        "end": 12,
        "spd": 9,
        "acc": 11
      },
      "origin": "Marvel Comics · X-Men #164",
      "source": "https://www.marvel.com/articles/comics/why-captain-marvel-is-the-most-powerful-hero-in-the-marvel-universe-an-infographic",
      "kind": "empowerment",
      "feat": "Carol Danvers accesses an energy-rich Binary state with extraordinary cosmic energy output."
    }
  ],
  "mcu:Doctor Doom": [
    {
      "name": "God Emperor Doom",
      "changes": {
        "iq": 14,
        "tch": 14,
        "ref": 13,
        "ldr": 12
      },
      "origin": "Marvel Comics · Secret Wars (2015)",
      "source": "https://www.marvel.com/comics/guides/2184/the-dark-side-of-doctor-strange",
      "kind": "empowerment",
      "feat": "Doom rules Battleworld with cosmic powers after the collapse of the multiverse."
    },
    {
      "name": "Infamous Iron Man Doom",
      "changes": {
        "tch": 11,
        "ref": 9,
        "agi": 6,
        "ldr": 5
      },
      "origin": "Marvel Comics · Infamous Iron Man (2016)",
      "source": "https://www.marvel.com/comics/series/22596/infamous_iron_man_2016_2017",
      "kind": "suit",
      "feat": "Victor von Doom becomes an armored Iron Man successor with advanced technology and a different moral outlook."
    }
  ],
  "mcu:Moon Knight": [
    {
      "name": "Mr. Knight",
      "changes": {
        "iq": 8,
        "agi": 8,
        "tch": 9,
        "str": -5
      },
      "origin": "Marvel Studios · Moon Knight",
      "source": "https://www.marvel.com/articles/culture-lifestyle/mr-knight-avengers-campus",
      "kind": "persona",
      "feat": "Steven Grant's suited Mr. Knight guise has a different combat approach and temperament from Moon Knight."
    }
  ],
  "mcu:Sentry": [
    {
      "name": "The Void",
      "changes": {
        "str": 12,
        "ref": 14,
        "tch": 12,
        "clu": -14
      },
      "origin": "Marvel Comics · The Void",
      "source": "https://www.marvel.com/comics/guides/2463/sentry/",
      "kind": "alter-ego",
      "feat": "Bob Reynolds's destructive dark alter ego, the Void, manifests at enormous psychological and physical cost."
    }
  ],
  "mcu:Hawkeye": [
    {
      "name": "Ronin Clint Barton",
      "changes": {
        "agi": 9,
        "tch": 12,
        "ref": 9,
        "acc": -5
      },
      "origin": "Marvel Comics · New Avengers / Ronin",
      "source": "https://www.marvel.com/comics/guides/2214/the-hawkeyes-best-team-ups",
      "kind": "persona",
      "feat": "Clint Barton operates as masked Ronin, prioritizing close combat and covert engagement over archery."
    }
  ],
  "mcu:Thanos": [
    {
      "name": "Infinity Gauntlet Thanos",
      "changes": {
        "str": 12,
        "ref": 14,
        "iq": 12,
        "tch": 13
      },
      "origin": "Marvel Comics · Infinity Gauntlet (1991)",
      "source": "https://www.marvel.com/comics/discover/1023/thanos-victories",
      "kind": "artifact",
      "feat": "Thanos assembles the Infinity Gems and wields reality-altering power through the Gauntlet."
    }
  ],
  "mcu:Wolverine": [
    {
      "name": "Old Man Logan",
      "changes": {
        "iq": 11,
        "end": 7,
        "ref": 9,
        "spd": -8
      },
      "origin": "Marvel Comics · Old Man Logan",
      "source": "https://www.marvel.com/comics/collection/27188/wolverine_old_man_logan_2009",
      "kind": "alternate-timeline",
      "feat": "An older Logan survives a devastated future with accumulated experience but reduced youthful speed."
    },
    {
      "name": "Weapon X Wolverine",
      "changes": {
        "str": 8,
        "ref": 9,
        "clu": -10,
        "ldr": -7
      },
      "origin": "Marvel Comics · Weapon X",
      "source": "https://www.marvel.com/comics/characters/1009718/wolverine",
      "kind": "physical-state",
      "feat": "Logan's Weapon X experimentation and conditioning heighten brutality while severely compromising autonomy."
    }
  ],
  "mcu:Mister Fantastic": [
    {
      "name": "The Maker",
      "changes": {
        "iq": 14,
        "tch": 11,
        "clu": -12,
        "ldr": 7
      },
      "origin": "Marvel Comics · Ultimate Reed Richards",
      "source": "https://www.marvel.com/articles/comics/the-maker-explained-mister-fantastic-doppelganger-ultimate-universe",
      "kind": "alternate-incarnation",
      "feat": "The Ultimate Universe Reed Richards turns villainous and uses his elastic physiology and intellect to dominate others."
    }
  ],
  "mcu:Galactus": [
    {
      "name": "Lifebringer Galactus",
      "changes": {
        "iq": 9,
        "tch": 10,
        "ref": 12,
        "clu": 10
      },
      "origin": "Marvel Comics · Ultimates",
      "source": "https://www.marvel.com/teams-and-groups/heralds-of-galactus",
      "kind": "transformation",
      "feat": "Galactus sheds his world-consuming hunger and becomes the Lifebringer, restoring worlds."
    }
  ],
  "mcu:Groot": [
    {
      "name": "Baby Groot",
      "changes": {
        "siz": -14,
        "str": -11,
        "agi": 13,
        "spd": 9
      },
      "origin": "Marvel Studios · Guardians of the Galaxy Vol. 2",
      "source": "https://www.marvel.com/characters/groot/on-screen",
      "kind": "physical-state",
      "feat": "The regenerated juvenile Groot is smaller and more agile, with substantially less physical force."
    }
  ],
  "mcu:Vision": [
    {
      "name": "White Vision",
      "changes": {
        "iq": 10,
        "end": 9,
        "clu": -10,
        "ref": 7
      },
      "origin": "Marvel Studios · WandaVision",
      "source": "https://www.marvel.com/characters/vision/on-screen",
      "kind": "reconstruction",
      "feat": "Vision's rebuilt white synthezoid body initially operates without his former emotional attachment."
    }
  ],
  "mcu:Ultron": [
    {
      "name": "Infinity Ultron",
      "changes": {
        "ref": 14,
        "tch": 13,
        "iq": 11,
        "str": 10
      },
      "origin": "Marvel Studios · What If...? Season 1",
      "source": "https://www.marvel.com/characters/ultron/on-screen",
      "kind": "alternate-incarnation",
      "feat": "In an alternate timeline, Ultron succeeds in obtaining Vision's body and all six Infinity Stones."
    }
  ],
  "mcu:Doctor Strange": [
    {
      "name": "Strange Supreme",
      "changes": {
        "tch": 14,
        "iq": 10,
        "ref": 12,
        "clu": -10
      },
      "origin": "Marvel Studios · What If...? Season 1",
      "source": "https://www.marvel.com/characters/doctor-strange-stephen-strange/on-screen",
      "kind": "alternate-incarnation",
      "feat": "An alternate Strange absorbs mystical creatures while trying to reverse a personal tragedy."
    }
  ]
});
if(typeof module!=='undefined'&&module.exports)module.exports=CAMPAIGN_VARIANTS_MARVEL;

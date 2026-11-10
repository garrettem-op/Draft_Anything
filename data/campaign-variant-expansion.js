/* Reviewed, continuity-labelled alternate forms for Draft Anything Campaign.
 * These are temporary gameplay transformations of roster characters, NOT new independently draftable characters.
 * Origin specifies where the form appears; ratings are GAME DESIGN deltas, not canonical measurements.
 * Film/comics and alternate timelines are explicitly labeled; distinguish people who share aliases.
 */
(function(root){
  const DATA = {
  "mcu:Iron Man": [
    {
      "name": "Model Prime Iron Man",
      "changes": {
        "tch": 10,
        "agi": 9,
        "ref": 8
      },
      "origin": "Invincible Iron Man (2015) · Model Prime armor",
      "continuity": "Earth-616"
    },
    {
      "name": "Superior Iron Man",
      "changes": {
        "iq": 8,
        "clu": -8,
        "acc": 11
      },
      "origin": "Superior Iron Man (2014) · Endo-Sym armor / AXIS",
      "continuity": "Earth-616"
    },
    {
      "name": "Godbuster Iron Man",
      "changes": {
        "str": 15,
        "end": 13,
        "tch": 11
      },
      "origin": "Tony Stark: Iron Man (2018) #10 · Godbuster armor",
      "continuity": "Earth-616"
    },
    {
      "name": "Nanotech Mark L",
      "changes": {
        "tch": 9,
        "agi": 8,
        "ref": 9
      },
      "origin": "Avengers: Infinity War (2018) · Mark L armor",
      "continuity": "Marvel Cinematic Universe"
    }
  ],
  "mcu:Captain America": [
    {
      "name": "Hydra Supreme (Steve Rogers)",
      "changes": {
        "iq": 12,
        "ldr": 12,
        "clu": -12,
        "tch": 5
      },
      "origin": "Secret Empire (2017) · Kobik-altered Hydra Steve Rogers",
      "continuity": "Earth-616 cosmic-cube alteration",
      "source": "https://www.marvel.com/comics/discover/964/secret-empire"
    }
  ],
  "mcu:Thor": [
    {
      "name": "Herald of Thunder Thor",
      "changes": {
        "str": 13,
        "end": 11,
        "iq": 6
      },
      "origin": "Thor (2020) #1–6 · Galactus's herald",
      "continuity": "Earth-616"
    },
    {
      "name": "Necrosword Thor",
      "changes": {
        "str": 14,
        "clu": -8,
        "tch": 11
      },
      "origin": "King Thor (2019) · All-Black / Necrosword",
      "continuity": "Alternate future"
    }
  ],
  "mcu:Hulk": [
    {
      "name": "Maestro Hulk",
      "changes": {
        "str": 12,
        "iq": 12,
        "clu": -12,
        "ldr": 8
      },
      "origin": "Hulk: Future Imperfect (1992) · dystopian future Banner",
      "continuity": "Alternate future"
    },
    {
      "name": "Green Scar Hulk",
      "changes": {
        "str": 12,
        "end": 11,
        "ldr": 8
      },
      "origin": "Planet Hulk / World War Hulk (2006–07)",
      "continuity": "Earth-616"
    },
    {
      "name": "Titan Hulk",
      "changes": {
        "str": 15,
        "siz": 14,
        "end": 10,
        "clu": -15
      },
      "origin": "Hulk (2021–23) · Titan form",
      "continuity": "Earth-616"
    }
  ],
  "mcu:Spider-Man": [
    {
      "name": "Symbiote Spider-Man",
      "changes": {
        "str": 9,
        "agi": 8,
        "clu": -5
      },
      "origin": "Secret Wars (1984) / Amazing Spider-Man · black symbiote",
      "continuity": "Marvel Comics",
      "source": "https://www.marvel.com/articles/comics/secret-wars-official-marvel-guide"
    },
    {
      "name": "Cosmic Spider-Man (Captain Universe)",
      "changes": {
        "str": 15,
        "tch": 15,
        "end": 14
      },
      "origin": "Amazing Spider-Man (1989) #326–329 · Enigma Force",
      "continuity": "Earth-616"
    },
    {
      "name": "Iron Spider",
      "changes": {
        "tch": 11,
        "agi": 8,
        "end": 6
      },
      "origin": "Civil War (2006) / Avengers: Infinity War (2018) · Stark armor",
      "continuity": "Comics and MCU equipment"
    }
  ],
  "mcu:Doctor Strange": [
    {
      "name": "Strange Supreme",
      "changes": {
        "iq": 13,
        "tch": 14,
        "clu": -7
      },
      "origin": "What If...? (2021), episode 4 · absorbed magical beings",
      "continuity": "Marvel Studios What If...?"
    },
    {
      "name": "God of Magic Strange",
      "changes": {
        "tch": 13,
        "iq": 12,
        "ref": 8
      },
      "origin": "Doctor Strange (2018) · mystical godhood / sorcery power-up",
      "continuity": "Marvel Comics; power-up continuity"
    },
    {
      "name": "Defender Strange",
      "changes": {
        "tch": 9,
        "ref": 8,
        "end": 5
      },
      "origin": "Doctor Strange in the Multiverse of Madness (2022) · alternate Strange",
      "continuity": "Marvel Cinematic Multiverse"
    }
  ],
  "mcu:Black Panther": [
    {
      "name": "King of the Dead Black Panther",
      "changes": {
        "iq": 11,
        "ref": 9,
        "end": 8
      },
      "origin": "Fantastic Four (2012) #608 / New Avengers (2013) · Bast's title",
      "continuity": "Earth-616"
    },
    {
      "name": "Black Panther with Infinity Gauntlet",
      "changes": {
        "tch": 15,
        "iq": 14,
        "end": 11
      },
      "origin": "Secret Wars (2015) #9 · T'Challa wields the Gauntlet",
      "continuity": "Battleworld",
      "source": "https://www.marvel.com/articles/comics/secret-wars-official-marvel-guide"
    },
    {
      "name": "Intergalactic Emperor T'Challa",
      "changes": {
        "ldr": 13,
        "iq": 12,
        "str": 6
      },
      "origin": "Black Panther (2018) · Intergalactic Empire of Wakanda",
      "continuity": "Marvel Comics"
    }
  ],
  "mcu:Scarlet Witch": [
    {
      "name": "Scarlet Witch of Wundagore",
      "changes": {
        "tch": 11,
        "iq": 9,
        "clu": 8
      },
      "origin": "The Trial of Magneto (2021) · post-resurrection Wanda",
      "continuity": "Earth-616"
    }
  ],
  "mcu:War Machine": [
    {
      "name": "Iron Patriot (Rhodey)",
      "changes": {
        "tch": 10,
        "ldr": 8,
        "acc": 7
      },
      "origin": "Iron Man 3 (2013) · Iron Patriot armor",
      "continuity": "Marvel Cinematic Universe"
    }
  ],
  "mcu:Falcon": [
    {
      "name": "Captain America (Sam Wilson)",
      "changes": {
        "ldr": 11,
        "tch": 8,
        "end": 6
      },
      "origin": "Captain America: Brave New World (2025) · shield-bearing Sam Wilson",
      "continuity": "Marvel Cinematic Universe"
    }
  ],
  "mcu:Winter Soldier": [
    {
      "name": "White Wolf (Bucky Barnes)",
      "changes": {
        "ref": 9,
        "ldr": 8,
        "clu": 8
      },
      "origin": "Avengers: Infinity War (2018) · Wakandan name and recovery",
      "continuity": "Marvel Cinematic Universe; alias / equipment, not the comics' Hunter"
    },
    {
      "name": "Captain America (Bucky Barnes)",
      "changes": {
        "ldr": 12,
        "tch": 8,
        "end": 7
      },
      "origin": "Captain America (2008) #34 · Bucky bears the shield",
      "continuity": "Earth-616"
    }
  ],
  "mcu:Loki": [
    {
      "name": "God of Stories Loki (TVA)",
      "changes": {
        "iq": 14,
        "tch": 14,
        "ldr": 11
      },
      "origin": "Loki (2023), season 2 finale · holds the branching timelines",
      "continuity": "Marvel Cinematic Universe"
    }
  ],
  "mcu:Odin": [
    {
      "name": "Young Odin (Prehistoric Avengers)",
      "changes": {
        "str": 10,
        "agi": 10,
        "spd": 9
      },
      "origin": "Marvel Legacy (2017) #1 / Avengers (2018) · Avengers of 1,000,000 BC",
      "continuity": "Marvel Comics, prehistoric Odin"
    },
    {
      "name": "Odin in Destroyer Armor",
      "changes": {
        "end": 14,
        "str": 13,
        "tch": 9
      },
      "origin": "Thor comics · Odin's enchanted Destroyer construct",
      "continuity": "Marvel Comics; artifact-dependent"
    }
  ],
  "mcu:Thanos": [
    {
      "name": "Infinity Gauntlet Thanos",
      "changes": {
        "tch": 15,
        "iq": 14,
        "clu": 8
      },
      "origin": "The Infinity Gauntlet (1991) · six Gems",
      "continuity": "Earth-616"
    },
    {
      "name": "King Thanos",
      "changes": {
        "str": 11,
        "end": 11,
        "iq": 10
      },
      "origin": "Thanos (2017) #13–18 · Thanos Wins",
      "continuity": "Alternate future"
    },
    {
      "name": "Heart of the Universe Thanos",
      "changes": {
        "tch": 15,
        "ref": 15,
        "iq": 14
      },
      "origin": "Marvel: The End (2003) · Heart of the Universe",
      "continuity": "Alternate continuity"
    }
  ],
  "mcu:Ultron": [
    {
      "name": "Infinity Ultron",
      "changes": {
        "tch": 15,
        "str": 14,
        "end": 14
      },
      "origin": "What If...? (2021), episodes 8–9 · Infinity Stones",
      "continuity": "Marvel Studios What If...?"
    },
    {
      "name": "Phalanx Ultron",
      "changes": {
        "tch": 11,
        "iq": 11,
        "end": 9
      },
      "origin": "Annihilation: Conquest (2007) · Ultron / Phalanx merger",
      "continuity": "Earth-616"
    },
    {
      "name": "Ultron Pym",
      "changes": {
        "iq": 11,
        "str": 9,
        "tch": 11
      },
      "origin": "Avengers: Rage of Ultron (2015) · fused with Hank Pym",
      "continuity": "Earth-616"
    }
  ],
  "mcu:Doctor Doom": [
    {
      "name": "God Emperor Doom",
      "changes": {
        "tch": 15,
        "iq": 15,
        "ldr": 14
      },
      "origin": "Secret Wars (2015) · stolen Beyonders power / Battleworld",
      "continuity": "Earth-616 / Battleworld",
      "source": "https://www.marvel.com/articles/comics/secret-wars-official-marvel-guide"
    },
    {
      "name": "Sorcerer Supreme Doctor Doom",
      "changes": {
        "tch": 14,
        "iq": 13,
        "ldr": 10
      },
      "origin": "Blood Hunt (2024) / One World Under Doom (2025)",
      "continuity": "Earth-616",
      "source": "https://www.marvel.com/comics/guides/2493/one-world-under-doom"
    },
    {
      "name": "Infamous Iron Man (Victor von Doom)",
      "changes": {
        "tch": 11,
        "ref": 9,
        "acc": 9
      },
      "origin": "Infamous Iron Man (2016) · Doom takes up Iron Man armor",
      "continuity": "Earth-616"
    },
    {
      "name": "Doom 2099",
      "changes": {
        "tch": 11,
        "iq": 12,
        "clu": 8
      },
      "origin": "Doom 2099 (1993) · future displaced Victor von Doom",
      "continuity": "Marvel 2099"
    },
    {
      "name": "Beyonder-Powered Doom",
      "changes": {
        "tch": 15,
        "iq": 14,
        "end": 12
      },
      "origin": "Secret Wars (1984) #10–12 · siphoned Beyonder's power",
      "continuity": "Earth-616, temporary",
      "source": "https://www.marvel.com/articles/comics/secret-wars-official-marvel-guide"
    }
  ],
  "mcu:Wolverine": [
    {
      "name": "Old Man Logan",
      "changes": {
        "end": 9,
        "ref": 8,
        "clu": 7
      },
      "origin": "Wolverine: Old Man Logan (2008–09) · alternate future",
      "continuity": "Earth-807128"
    },
    {
      "name": "Hellverine (Logan)",
      "changes": {
        "str": 11,
        "end": 12,
        "tch": 10
      },
      "origin": "Ghost Rider/Wolverine: Weapons of Vengeance (2023) · hellfire possession",
      "continuity": "Marvel Comics; possession"
    },
    {
      "name": "Phoenix Wolverine",
      "changes": {
        "tch": 14,
        "ref": 10,
        "end": 11
      },
      "origin": "Thor (2018) · far-future Wolverine wielding Phoenix",
      "continuity": "Alternate future"
    },
    {
      "name": "Weapon X Wolverine",
      "changes": {
        "str": 9,
        "ref": 10,
        "clu": -8
      },
      "origin": "Weapon X (1991) · Weapon X conditioning / adamantium",
      "continuity": "Marvel Comics; historical period"
    }
  ],
  "mcu:Jean Grey": [
    {
      "name": "Phoenix Force Jean Grey",
      "changes": {
        "tch": 14,
        "ref": 11,
        "iq": 9
      },
      "origin": "Uncanny X-Men (1980) / Phoenix Saga · Phoenix host",
      "continuity": "Marvel Comics"
    }
  ],
  "mcu:Sentry": [
    {
      "name": "The Void (Sentry)",
      "changes": {
        "str": 14,
        "tch": 13,
        "clu": -15
      },
      "origin": "The Sentry (2000) / Siege (2010) · Void manifestation",
      "continuity": "Earth-616"
    },
    {
      "name": "Death Seed Sentry",
      "changes": {
        "str": 12,
        "end": 14,
        "ref": 9
      },
      "origin": "Uncanny Avengers (2013) · Apocalypse Twin resurrection",
      "continuity": "Earth-616"
    }
  ],
  "mcu:Deadpool": [
    {
      "name": "Zenpool",
      "changes": {
        "clu": 14,
        "iq": 9,
        "str": -6
      },
      "origin": "AXIS (2014) · inverted pacifist Deadpool",
      "continuity": "Earth-616"
    }
  ],
  "mcu:Captain Marvel": [
    {
      "name": "Binary (Carol Danvers)",
      "changes": {
        "str": 12,
        "end": 13,
        "spd": 11
      },
      "origin": "Uncanny X-Men (1982) #164 · Binary transformation",
      "continuity": "Earth-616"
    }
  ],
  "mcu:Namor": [
    {
      "name": "Phoenix Five Namor",
      "changes": {
        "tch": 14,
        "str": 11,
        "clu": -12
      },
      "origin": "Avengers vs. X-Men (2012) · Phoenix Force shard",
      "continuity": "Earth-616"
    }
  ],
  "mcu:Silver Surfer": [
    {
      "name": "Silver Surfer Black",
      "changes": {
        "tch": 14,
        "ref": 12,
        "clu": 9
      },
      "origin": "Silver Surfer: Black (2019) · cosmic struggle against Knull",
      "continuity": "Earth-616"
    }
  ],
  "mcu:Adam Warlock": [
    {
      "name": "Magus (Corrupted Warlock)",
      "changes": {
        "tch": 13,
        "iq": 10,
        "clu": -10
      },
      "origin": "Warlock (1970s) / Infinity War (1992) · dark future self",
      "continuity": "Alternate/future self"
    }
  ],
  "mcu:Moon Knight": [
    {
      "name": "Mr. Knight",
      "changes": {
        "iq": 10,
        "tch": 10,
        "clu": 8
      },
      "origin": "Moon Knight (2014) #1 · Marc Spector's Mr. Knight persona",
      "continuity": "Marvel Comics"
    },
    {
      "name": "Jake Lockley (Moon Knight)",
      "changes": {
        "ref": 10,
        "iq": 8,
        "clu": 7
      },
      "origin": "Moon Knight (2022) · third alter Jake Lockley",
      "continuity": "Marvel Cinematic Universe; alter/persona"
    }
  ],
  "dc:Batman": [
    {
      "name": "The Batman Who Laughs",
      "changes": {
        "iq": 14,
        "ref": 11,
        "clu": -15
      },
      "origin": "Dark Nights: Metal (2017) · Joker-toxin-corrupted Bruce Wayne",
      "continuity": "Earth -22"
    },
    {
      "name": "The Darkest Knight",
      "changes": {
        "tch": 15,
        "iq": 15,
        "end": 14
      },
      "origin": "Dark Nights: Death Metal (2020) · Manhattan-powered Batman Who Laughs",
      "continuity": "Dark Multiverse"
    },
    {
      "name": "Red Death Batman",
      "changes": {
        "spd": 15,
        "ref": 14,
        "clu": -11
      },
      "origin": "Dark Nights: Metal (2017) · Bruce Wayne merged with the Flash",
      "continuity": "Earth -52"
    },
    {
      "name": "Dawnbreaker Batman",
      "changes": {
        "tch": 14,
        "end": 9,
        "clu": -12
      },
      "origin": "Dark Nights: Metal (2017) · Green Lantern Bruce Wayne",
      "continuity": "Earth -32"
    },
    {
      "name": "Murder Machine Batman",
      "changes": {
        "tch": 13,
        "end": 13,
        "iq": 10
      },
      "origin": "Dark Nights: Metal (2017) · Alfred AI merged into Bruce",
      "continuity": "Earth -44"
    },
    {
      "name": "Devastator Batman",
      "changes": {
        "str": 15,
        "siz": 13,
        "clu": -13
      },
      "origin": "Dark Nights: Metal (2017) · Doomsday-virus Bruce Wayne",
      "continuity": "Earth -1"
    },
    {
      "name": "Hellbat Armor Batman",
      "changes": {
        "str": 14,
        "spd": 11,
        "end": 8
      },
      "origin": "Batman and Robin (2014) #35–37 · Justice League-forged armor",
      "continuity": "Earth-0; armor drains Bruce"
    },
    {
      "name": "Kingdom Come Batman",
      "changes": {
        "iq": 12,
        "tch": 9,
        "ldr": 10
      },
      "origin": "Kingdom Come (1996) · future Bruce in powered exoskeleton",
      "continuity": "Earth-22 alternate future"
    }
  ],
  "dc:Superman": [
    {
      "name": "Superman Prime One Million",
      "changes": {
        "str": 15,
        "spd": 14,
        "end": 14
      },
      "origin": "DC One Million (1998) · Kal-El after millennia in the sun",
      "continuity": "Future DC"
    },
    {
      "name": "Kingdom Come Superman",
      "changes": {
        "str": 10,
        "end": 12,
        "ldr": 10
      },
      "origin": "Kingdom Come (1996) · alternate future Kal-El",
      "continuity": "Earth-22"
    },
    {
      "name": "Superman Blue",
      "changes": {
        "tch": 13,
        "spd": 12,
        "end": 9
      },
      "origin": "Superman (1997) #123–125 · electric transformation",
      "continuity": "Earth-0"
    },
    {
      "name": "Superman Red",
      "changes": {
        "tch": 12,
        "ref": 12,
        "spd": 10
      },
      "origin": "Superman Red / Superman Blue (1998) · split energy form",
      "continuity": "Earth-0"
    },
    {
      "name": "Superman Doomed",
      "changes": {
        "str": 14,
        "siz": 10,
        "end": 12,
        "clu": -13
      },
      "origin": "Superman: Doomed (2014) · Doomsday infection",
      "continuity": "Prime Earth"
    }
  ],
  "dc:Wonder Woman": [
    {
      "name": "Witching Hour Wonder Woman",
      "changes": {
        "tch": 14,
        "iq": 11,
        "end": 9
      },
      "origin": "Justice League Dark / Wonder Woman: The Witching Hour (2018) · Hecate mark",
      "continuity": "Prime Earth"
    },
    {
      "name": "Flashpoint Wonder Woman",
      "changes": {
        "str": 11,
        "ldr": 10,
        "clu": -9
      },
      "origin": "Flashpoint (2011) · Amazon warlord Diana",
      "continuity": "Flashpoint timeline"
    },
    {
      "name": "Golden Eagle Armor Wonder Woman",
      "changes": {
        "end": 11,
        "acc": 9,
        "tch": 7
      },
      "origin": "Wonder Woman 1984 (2020) · Golden Eagle armor",
      "continuity": "DC film continuity"
    }
  ],
  "dc:The Flash (Barry Allen)": [
    {
      "name": "Black Racer Barry Allen",
      "changes": {
        "spd": 14,
        "end": 13,
        "ref": 11
      },
      "origin": "Justice League: Darkseid War (2015) · avatar of Black Racer",
      "continuity": "Prime Earth"
    },
    {
      "name": "Future Flash (Barry Allen)",
      "changes": {
        "spd": 12,
        "iq": 8,
        "clu": -8
      },
      "origin": "The Flash (2014) · future Barry with blue Speed Force suit",
      "continuity": "New 52 alternate future"
    }
  ],
  "dc:The Flash (Wally West)": [
    {
      "name": "Mobius Chair Wally West",
      "changes": {
        "iq": 15,
        "tch": 13,
        "ref": 13
      },
      "origin": "Flash Forward (2019) #6 / Generation Zero (2020)",
      "continuity": "DC Rebirth"
    },
    {
      "name": "Doctor Manhattan-Powered Wally",
      "changes": {
        "tch": 15,
        "spd": 14,
        "iq": 13
      },
      "origin": "Flash Forward (2019–20) · Manhattan's power",
      "continuity": "DC Rebirth"
    }
  ],
  "dc:Green Lantern (Hal Jordan)": [
    {
      "name": "Parallax Hal Jordan",
      "changes": {
        "str": 12,
        "tch": 14,
        "clu": -13
      },
      "origin": "Emerald Twilight (1994) / Zero Hour (1994) · Parallax host",
      "continuity": "Post-Crisis"
    },
    {
      "name": "The Spectre (Hal Jordan)",
      "changes": {
        "tch": 15,
        "iq": 12,
        "clu": 7
      },
      "origin": "Day of Judgment (1999) / The Spectre (2001) · divine host",
      "continuity": "DC Comics"
    },
    {
      "name": "White Lantern Hal Jordan",
      "changes": {
        "tch": 13,
        "ldr": 10,
        "ref": 9
      },
      "origin": "Brightest Day (2010) · White Lantern ring",
      "continuity": "DC Comics"
    }
  ],
  "dc:Green Lantern (John Stewart)": [
    {
      "name": "Ascended John Stewart",
      "changes": {
        "tch": 14,
        "iq": 12,
        "ldr": 10
      },
      "origin": "Green Lantern: War Journal (2023–24) · ascended powers",
      "continuity": "Prime Earth"
    }
  ],
  "dc:Aquaman": [
    {
      "name": "Water-Hand Aquaman",
      "changes": {
        "tch": 11,
        "ref": 8,
        "end": 7
      },
      "origin": "Aquaman (2003) · Lady of the Lake water hand",
      "continuity": "DC Comics"
    }
  ],
  "dc:Martian Manhunter": [
    {
      "name": "Fernus the Burning",
      "changes": {
        "str": 12,
        "tch": 14,
        "clu": -12
      },
      "origin": "JLA: Trial by Fire (2003) · Fernus persona",
      "continuity": "Post-Crisis"
    }
  ],
  "dc:Shazam": [
    {
      "name": "King Shazam",
      "changes": {
        "tch": 11,
        "str": 10,
        "clu": -12
      },
      "origin": "The Infected: King Shazam! (2019) · Batman Who Laughs corruption",
      "continuity": "Prime Earth"
    }
  ],
  "dc:Raven": [
    {
      "name": "White Raven",
      "changes": {
        "tch": 12,
        "iq": 10,
        "clu": 12
      },
      "origin": "Teen Titans (1980s) · purified spirit form",
      "continuity": "DC Comics"
    },
    {
      "name": "The Unkindness",
      "changes": {
        "tch": 15,
        "ldr": 14,
        "clu": -12
      },
      "origin": "Future State: Teen Titans (2021) · Raven's apocalyptic future",
      "continuity": "Future State"
    }
  ],
  "dc:Beast Boy": [
    {
      "name": "Starro Beast Boy",
      "changes": {
        "str": 12,
        "siz": 14,
        "tch": 10
      },
      "origin": "Titans: Beast World (2023) · giant Starro transformation",
      "continuity": "Prime Earth"
    }
  ],
  "dc:Joker": [
    {
      "name": "Emperor Joker",
      "changes": {
        "tch": 15,
        "iq": 14,
        "clu": -13
      },
      "origin": "Superman: Emperor Joker (2000) · Mxyzptlk's reality-warping powers",
      "continuity": "Post-Crisis"
    }
  ],
  "dc:Lex Luthor": [
    {
      "name": "Apex Lex",
      "changes": {
        "iq": 12,
        "str": 11,
        "end": 10
      },
      "origin": "Justice League (2019) · Lex as Apex Predator",
      "continuity": "Prime Earth"
    },
    {
      "name": "Superman-Lex in Apokolips Armor",
      "changes": {
        "str": 10,
        "tch": 10,
        "ldr": 10
      },
      "origin": "Justice League (2016) / Rebirth · Apokoliptian armor",
      "continuity": "Prime Earth"
    }
  ],
  "dc:Darkseid": [
    {
      "name": "Infinite Frontier Darkseid",
      "changes": {
        "str": 14,
        "tch": 13,
        "ldr": 12
      },
      "origin": "Infinite Frontier (2021) · consolidated incarnations",
      "continuity": "DC Omniverse"
    }
  ],
  "dc:Sinestro": [
    {
      "name": "White Lantern Sinestro",
      "changes": {
        "tch": 13,
        "iq": 10,
        "clu": 8
      },
      "origin": "Blackest Night (2010) · temporary White Lantern",
      "continuity": "DC Comics"
    },
    {
      "name": "Parallax Sinestro",
      "changes": {
        "tch": 13,
        "str": 9,
        "clu": -10
      },
      "origin": "Sinestro Corps War (2007) / Green Lantern (2011) · Parallax host",
      "continuity": "DC Comics"
    }
  ],
  "dc:Supergirl (Kara Zor-El)": [
    {
      "name": "Red Lantern Supergirl",
      "changes": {
        "str": 12,
        "clu": -11,
        "tch": 10
      },
      "origin": "Supergirl (2014) #28–30 · Red Lantern ring",
      "continuity": "Prime Earth"
    }
  ],
  "dc:Swamp Thing": [
    {
      "name": "Parliament of Trees Swamp Thing",
      "changes": {
        "tch": 13,
        "end": 13,
        "iq": 9
      },
      "origin": "Swamp Thing (1980s) · expanded Green elemental connection",
      "continuity": "DC Comics"
    }
  ],
  "dc:Blue Beetle (Jaime Reyes)": [
    {
      "name": "Khaji Da Full-Control Beetle",
      "changes": {
        "tch": 11,
        "ref": 10,
        "str": 9
      },
      "origin": "Blue Beetle (2006 / 2016) · Scarab fully synchronized",
      "continuity": "DC Comics"
    }
  ],
  "dc:Deathstroke": [
    {
      "name": "Godkiller Deathstroke",
      "changes": {
        "str": 9,
        "tch": 12,
        "acc": 12
      },
      "origin": "Deathstroke (2014) · Godkiller sword",
      "continuity": "New 52; weapon-dependent"
    }
  ],
  "games:Mario": [
    {
      "name": "Starman Mario",
      "changes": {
        "spd": 13,
        "end": 14,
        "ref": 10
      },
      "origin": "Super Mario Bros. (1985) · invincibility star",
      "continuity": "Nintendo"
    },
    {
      "name": "Metal Mario",
      "changes": {
        "end": 15,
        "str": 13,
        "spd": -7
      },
      "origin": "Super Mario 64 (1996) · Metal Cap",
      "continuity": "Nintendo"
    },
    {
      "name": "Mega Mario",
      "changes": {
        "siz": 15,
        "str": 14,
        "end": 14
      },
      "origin": "New Super Mario Bros. (2006) · Mega Mushroom",
      "continuity": "Nintendo"
    },
    {
      "name": "Ice Mario",
      "changes": {
        "acc": 10,
        "tch": 11
      },
      "origin": "New Super Mario Bros. Wii (2009) · Ice Flower",
      "continuity": "Nintendo"
    },
    {
      "name": "Tanooki Mario",
      "changes": {
        "agi": 11,
        "lep": 12,
        "ref": 8
      },
      "origin": "Super Mario Bros. 3 (1988) · Tanooki Suit",
      "continuity": "Nintendo"
    }
  ],
  "games:Luigi": [
    {
      "name": "Ice Luigi",
      "changes": {
        "tch": 11,
        "acc": 11,
        "ref": 6
      },
      "origin": "New Super Mario Bros. Wii (2009) · Ice Flower",
      "continuity": "Nintendo"
    },
    {
      "name": "Super Star Luigi",
      "changes": {
        "spd": 12,
        "end": 14
      },
      "origin": "Super Mario Bros. · Starman power-up",
      "continuity": "Nintendo"
    }
  ],
  "games:Princess Peach": [
    {
      "name": "Radiant Peach",
      "changes": {
        "tch": 13,
        "ldr": 11,
        "ref": 11
      },
      "origin": "Princess Peach: Showtime! (2024) · Radiant Peach",
      "continuity": "Nintendo"
    },
    {
      "name": "Swordfighter Peach",
      "changes": {
        "tch": 11,
        "acc": 12,
        "agi": 9
      },
      "origin": "Princess Peach: Showtime! (2024) · Swordfighter transformation",
      "continuity": "Nintendo"
    },
    {
      "name": "Elephant Peach",
      "changes": {
        "str": 13,
        "siz": 12,
        "end": 10
      },
      "origin": "Super Mario Bros. Wonder (2023) · Elephant Fruit",
      "continuity": "Nintendo"
    }
  ],
  "games:Bowser": [
    {
      "name": "Dreamy Bowser",
      "changes": {
        "tch": 14,
        "str": 12,
        "ref": 9
      },
      "origin": "Mario & Luigi: Dream Team (2013) · Dream Stone powers",
      "continuity": "Nintendo"
    },
    {
      "name": "Giga Bowser",
      "changes": {
        "siz": 15,
        "str": 15,
        "end": 13
      },
      "origin": "Super Smash Bros. Melee (2001) · Giga Bowser",
      "continuity": "Nintendo"
    },
    {
      "name": "Dry Bowser",
      "changes": {
        "end": 12,
        "ref": 10,
        "agi": 9
      },
      "origin": "New Super Mario Bros. (2006) · skeletal Bowser",
      "continuity": "Nintendo"
    }
  ],
  "games:Link": [
    {
      "name": "Wolf Link",
      "changes": {
        "agi": 13,
        "spd": 11,
        "ref": 10
      },
      "origin": "The Legend of Zelda: Twilight Princess (2006) · cursed wolf form",
      "continuity": "Nintendo"
    },
    {
      "name": "Ancient Hero's Aspect Link",
      "changes": {
        "str": 9,
        "end": 10,
        "ref": 9
      },
      "origin": "Tears of the Kingdom (2023) · Ancient Hero's Aspect",
      "continuity": "Nintendo; relic-dependent"
    }
  ],
  "games:Zelda": [
    {
      "name": "Sheik (Princess Zelda)",
      "changes": {
        "agi": 12,
        "spd": 10,
        "ref": 11
      },
      "origin": "Ocarina of Time (1998) · Zelda's Sheik disguise",
      "continuity": "Nintendo"
    },
    {
      "name": "Light Dragon Zelda",
      "changes": {
        "siz": 15,
        "end": 14,
        "tch": 13
      },
      "origin": "Tears of the Kingdom (2023) · draconification",
      "continuity": "Nintendo"
    }
  ],
  "games:Ganondorf": [
    {
      "name": "Demon King Ganondorf",
      "changes": {
        "str": 12,
        "tch": 13,
        "clu": -10
      },
      "origin": "Tears of the Kingdom (2023) · Secret Stone",
      "continuity": "Nintendo"
    },
    {
      "name": "Demon Dragon Ganondorf",
      "changes": {
        "siz": 15,
        "end": 14,
        "str": 14
      },
      "origin": "Tears of the Kingdom (2023) · dragon transformation",
      "continuity": "Nintendo"
    }
  ],
  "games:Samus Aran": [
    {
      "name": "Metroid Suit Samus",
      "changes": {
        "end": 14,
        "str": 11,
        "tch": 12
      },
      "origin": "Metroid Dread (2021) · Metroid DNA awakening",
      "continuity": "Nintendo"
    },
    {
      "name": "Phazon Suit Samus",
      "changes": {
        "end": 12,
        "tch": 11,
        "ref": 9
      },
      "origin": "Metroid Prime (2002) · Phazon Suit",
      "continuity": "Nintendo"
    },
    {
      "name": "Gravity Suit Samus",
      "changes": {
        "end": 10,
        "agi": 8,
        "ref": 8
      },
      "origin": "Super Metroid (1994) · Gravity Suit",
      "continuity": "Nintendo"
    }
  ],
  "games:Kirby": [
    {
      "name": "Hypernova Kirby",
      "changes": {
        "str": 13,
        "tch": 11,
        "end": 9
      },
      "origin": "Kirby: Triple Deluxe (2014) · Miracle Fruit Hypernova",
      "continuity": "Nintendo"
    },
    {
      "name": "Ultra Sword Kirby",
      "changes": {
        "str": 12,
        "acc": 12,
        "tch": 11
      },
      "origin": "Kirby's Return to Dream Land (2011) · Ultra Sword",
      "continuity": "Nintendo"
    },
    {
      "name": "Star Rod Kirby",
      "changes": {
        "tch": 13,
        "acc": 11,
        "ref": 8
      },
      "origin": "Kirby's Adventure (1993) · Star Rod",
      "continuity": "Nintendo"
    }
  ],
  "games:Sonic the Hedgehog": [
    {
      "name": "Hyper Sonic",
      "changes": {
        "spd": 15,
        "ref": 14,
        "end": 13
      },
      "origin": "Sonic 3 & Knuckles (1994) · Super Emeralds",
      "continuity": "Sega"
    },
    {
      "name": "Darkspine Sonic",
      "changes": {
        "str": 12,
        "spd": 12,
        "tch": 10
      },
      "origin": "Sonic and the Secret Rings (2007) · World Rings",
      "continuity": "Sega"
    },
    {
      "name": "Excalibur Sonic",
      "changes": {
        "tch": 13,
        "acc": 12,
        "end": 9
      },
      "origin": "Sonic and the Black Knight (2009) · sacred sword",
      "continuity": "Sega"
    },
    {
      "name": "Sonic the Werehog",
      "changes": {
        "str": 13,
        "end": 11,
        "spd": -9
      },
      "origin": "Sonic Unleashed (2008) · Dark Gaia transformation",
      "continuity": "Sega"
    }
  ],
  "games:Shadow the Hedgehog": [
    {
      "name": "Doom Wings Shadow",
      "changes": {
        "agi": 12,
        "ref": 11,
        "spd": 10
      },
      "origin": "Sonic X Shadow Generations (2024) · Doom Powers",
      "continuity": "Sega"
    }
  ],
  "games:Tails": [
    {
      "name": "Super Tails",
      "changes": {
        "spd": 13,
        "end": 12,
        "agi": 10
      },
      "origin": "Sonic 3 & Knuckles (1994) · Super Emeralds",
      "continuity": "Sega"
    }
  ],
  "games:Knuckles": [
    {
      "name": "Hyper Knuckles",
      "changes": {
        "str": 13,
        "spd": 11,
        "ref": 11
      },
      "origin": "Sonic 3 & Knuckles (1994) · Super Emeralds",
      "continuity": "Sega"
    }
  ],
  "games:Ryu": [
    {
      "name": "Evil Ryu",
      "changes": {
        "str": 11,
        "clu": -13,
        "tch": 12
      },
      "origin": "Street Fighter Alpha series · Satsui no Hado",
      "continuity": "Capcom"
    },
    {
      "name": "Power of Nothingness Ryu",
      "changes": {
        "clu": 13,
        "tch": 12,
        "iq": 8
      },
      "origin": "Street Fighter V (2016) · Mu no Ken",
      "continuity": "Capcom"
    }
  ],
  "games:Jin Kazama": [
    {
      "name": "Devil Jin",
      "changes": {
        "str": 13,
        "tch": 12,
        "clu": -10
      },
      "origin": "Tekken 5 onwards · Devil Gene",
      "continuity": "Bandai Namco"
    },
    {
      "name": "Angel Jin",
      "changes": {
        "tch": 14,
        "clu": 11,
        "ref": 10
      },
      "origin": "Tekken 8 (2024) · Angel form",
      "continuity": "Bandai Namco"
    }
  ],
  "games:Liu Kang": [
    {
      "name": "Fire God Liu Kang",
      "changes": {
        "tch": 14,
        "ldr": 12,
        "end": 11
      },
      "origin": "Mortal Kombat 11 (2019) · Raiden's power",
      "continuity": "Mortal Kombat"
    }
  ],
  "games:Sephiroth": [
    {
      "name": "Safer Sephiroth",
      "changes": {
        "tch": 14,
        "spd": 11,
        "end": 12
      },
      "origin": "Final Fantasy VII (1997) · final boss form",
      "continuity": "Square Enix"
    },
    {
      "name": "Bizarro Sephiroth",
      "changes": {
        "str": 12,
        "end": 12,
        "siz": 11
      },
      "origin": "Final Fantasy VII (1997) · Bizarro form",
      "continuity": "Square Enix"
    }
  ],
  "games:Dante": [
    {
      "name": "Devil Trigger Dante",
      "changes": {
        "str": 12,
        "spd": 11,
        "end": 12
      },
      "origin": "Devil May Cry series · Devil Trigger",
      "continuity": "Capcom"
    },
    {
      "name": "Sin Devil Trigger Dante",
      "changes": {
        "str": 14,
        "end": 14,
        "tch": 12
      },
      "origin": "Devil May Cry 5 (2019) · Sin Devil Trigger",
      "continuity": "Capcom"
    }
  ],
  "games:Bayonetta": [
    {
      "name": "Demon Masquerade Bayonetta",
      "changes": {
        "spd": 11,
        "tch": 13,
        "ref": 10
      },
      "origin": "Bayonetta 3 (2022) · Demon Masquerade",
      "continuity": "PlatinumGames"
    }
  ],
  "games:Arthas Menethil": [
    {
      "name": "Death Knight Arthas",
      "changes": {
        "str": 10,
        "end": 10,
        "clu": -10
      },
      "origin": "Warcraft III: Reign of Chaos (2002) · Frostmourne",
      "continuity": "Blizzard"
    },
    {
      "name": "The Lich King",
      "changes": {
        "str": 13,
        "tch": 13,
        "ldr": 12
      },
      "origin": "Warcraft III: The Frozen Throne (2003) / Wrath of the Lich King",
      "continuity": "Blizzard"
    }
  ],
  "games:Illidan Stormrage": [
    {
      "name": "Metamorphosis Illidan",
      "changes": {
        "str": 12,
        "end": 12,
        "tch": 13
      },
      "origin": "Warcraft III / World of Warcraft · demon form",
      "continuity": "Blizzard"
    }
  ],
  "games:Mega Man": [
    {
      "name": "Super Adapter Mega Man",
      "changes": {
        "str": 11,
        "agi": 10,
        "lep": 10
      },
      "origin": "Mega Man 7 (1995) · Rush Super Adapter",
      "continuity": "Capcom"
    }
  ],
  "games:Winston": [
    {
      "name": "Primal Rage Winston",
      "changes": {
        "str": 14,
        "end": 13,
        "clu": -10
      },
      "origin": "Overwatch (2016) · Primal Rage ultimate",
      "continuity": "Blizzard"
    }
  ],
  "games:Mewtwo": [
    {
      "name": "Armored Mewtwo",
      "changes": {
        "end": 11,
        "tch": 10,
        "spd": -5
      },
      "origin": "Pokémon: The First Movie (1998) · Giovanni's restraint armor",
      "continuity": "Pokémon anime"
    }
  ],
  "games:Charizard": [
    {
      "name": "Gigantamax Charizard",
      "changes": {
        "siz": 15,
        "str": 13,
        "end": 12
      },
      "origin": "Pokémon Sword/Shield (2019) · Gigantamax",
      "continuity": "Pokémon"
    }
  ],
  "pokemon:Venusaur": [
    {
      "name": "Mega Venusaur",
      "changes": {
        "str": 11,
        "tch": 10,
        "end": 8
      },
      "origin": "Pokémon X/Y (2013) and subsequent games · Mega Evolution",
      "continuity": "Pokémon games"
    },
    {
      "name": "Gigantamax Venusaur",
      "changes": {
        "siz": 15,
        "str": 12,
        "end": 12
      },
      "origin": "Pokémon Sword/Shield (2019) · Gigantamax",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Blastoise": [
    {
      "name": "Mega Blastoise",
      "changes": {
        "str": 11,
        "tch": 10,
        "end": 8
      },
      "origin": "Pokémon X/Y (2013) and subsequent games · Mega Evolution",
      "continuity": "Pokémon games"
    },
    {
      "name": "Gigantamax Blastoise",
      "changes": {
        "siz": 15,
        "str": 12,
        "end": 12
      },
      "origin": "Pokémon Sword/Shield (2019) · Gigantamax",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Charizard": [
    {
      "name": "Mega Charizard X",
      "changes": {
        "str": 13,
        "tch": 10,
        "end": 9
      },
      "origin": "Pokémon X/Y · Mega Evolution X",
      "continuity": "Pokémon games"
    },
    {
      "name": "Mega Charizard Y",
      "changes": {
        "acc": 13,
        "spd": 10,
        "tch": 11
      },
      "origin": "Pokémon X/Y · Mega Evolution Y",
      "continuity": "Pokémon games"
    },
    {
      "name": "Gigantamax Charizard",
      "changes": {
        "siz": 15,
        "str": 12,
        "end": 12
      },
      "origin": "Pokémon Sword/Shield (2019) · Gigantamax",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Mewtwo": [
    {
      "name": "Mega Mewtwo X",
      "changes": {
        "str": 14,
        "end": 9,
        "tch": 10
      },
      "origin": "Pokémon X/Y · Mega Evolution X",
      "continuity": "Pokémon games"
    },
    {
      "name": "Mega Mewtwo Y",
      "changes": {
        "tch": 14,
        "spd": 13,
        "iq": 11
      },
      "origin": "Pokémon X/Y · Mega Evolution Y",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Pikachu": [
    {
      "name": "Gigantamax Pikachu",
      "changes": {
        "siz": 14,
        "str": 12,
        "end": 12
      },
      "origin": "Pokémon Sword/Shield (2019) · Gigantamax",
      "continuity": "Pokémon games"
    },
    {
      "name": "Partner Pikachu",
      "changes": {
        "spd": 9,
        "ref": 11,
        "clu": 9
      },
      "origin": "Pokémon: Let's Go, Pikachu! (2018) · partner techniques",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Eevee": [
    {
      "name": "Gigantamax Eevee",
      "changes": {
        "siz": 15,
        "str": 12,
        "end": 12
      },
      "origin": "Pokémon Sword/Shield (2019) · Gigantamax",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Gengar": [
    {
      "name": "Mega Gengar",
      "changes": {
        "str": 11,
        "tch": 10,
        "end": 8
      },
      "origin": "Pokémon X/Y (2013) and subsequent games · Mega Evolution",
      "continuity": "Pokémon games"
    },
    {
      "name": "Gigantamax Gengar",
      "changes": {
        "siz": 15,
        "str": 12,
        "end": 12
      },
      "origin": "Pokémon Sword/Shield (2019) · Gigantamax",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Alakazam": [
    {
      "name": "Mega Alakazam",
      "changes": {
        "str": 11,
        "tch": 10,
        "end": 8
      },
      "origin": "Pokémon X/Y (2013) and subsequent games · Mega Evolution",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Gyarados": [
    {
      "name": "Mega Gyarados",
      "changes": {
        "str": 11,
        "tch": 10,
        "end": 8
      },
      "origin": "Pokémon X/Y (2013) and subsequent games · Mega Evolution",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Pidgeot": [
    {
      "name": "Mega Pidgeot",
      "changes": {
        "str": 11,
        "tch": 10,
        "end": 8
      },
      "origin": "Pokémon X/Y (2013) and subsequent games · Mega Evolution",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Beedrill": [
    {
      "name": "Mega Beedrill",
      "changes": {
        "str": 11,
        "tch": 10,
        "end": 8
      },
      "origin": "Pokémon X/Y (2013) and subsequent games · Mega Evolution",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Pinsir": [
    {
      "name": "Mega Pinsir",
      "changes": {
        "str": 11,
        "tch": 10,
        "end": 8
      },
      "origin": "Pokémon X/Y (2013) and subsequent games · Mega Evolution",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Kangaskhan": [
    {
      "name": "Mega Kangaskhan",
      "changes": {
        "str": 11,
        "tch": 10,
        "end": 8
      },
      "origin": "Pokémon X/Y (2013) and subsequent games · Mega Evolution",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Aerodactyl": [
    {
      "name": "Mega Aerodactyl",
      "changes": {
        "str": 11,
        "tch": 10,
        "end": 8
      },
      "origin": "Pokémon X/Y (2013) and subsequent games · Mega Evolution",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Machamp": [
    {
      "name": "Gigantamax Machamp",
      "changes": {
        "siz": 15,
        "str": 12,
        "end": 12
      },
      "origin": "Pokémon Sword/Shield (2019) · Gigantamax",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Snorlax": [
    {
      "name": "Gigantamax Snorlax",
      "changes": {
        "siz": 15,
        "str": 12,
        "end": 12
      },
      "origin": "Pokémon Sword/Shield (2019) · Gigantamax",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Lapras": [
    {
      "name": "Gigantamax Lapras",
      "changes": {
        "siz": 15,
        "str": 12,
        "end": 12
      },
      "origin": "Pokémon Sword/Shield (2019) · Gigantamax",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Kingler": [
    {
      "name": "Gigantamax Kingler",
      "changes": {
        "siz": 15,
        "str": 12,
        "end": 12
      },
      "origin": "Pokémon Sword/Shield (2019) · Gigantamax",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Butterfree": [
    {
      "name": "Gigantamax Butterfree",
      "changes": {
        "siz": 15,
        "str": 12,
        "end": 12
      },
      "origin": "Pokémon Sword/Shield (2019) · Gigantamax",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Meowth": [
    {
      "name": "Alolan Meowth",
      "changes": {
        "agi": 10,
        "iq": 8
      },
      "origin": "Pokémon Sun/Moon (2016) · Alolan form",
      "continuity": "Pokémon games"
    },
    {
      "name": "Galarian Meowth",
      "changes": {
        "str": 10,
        "end": 11
      },
      "origin": "Pokémon Sword/Shield (2019) · Galarian form",
      "continuity": "Pokémon games"
    },
    {
      "name": "Gigantamax Meowth",
      "changes": {
        "siz": 15,
        "str": 12,
        "end": 12
      },
      "origin": "Pokémon Sword/Shield (2019) · Gigantamax",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Vulpix": [
    {
      "name": "Alolan Vulpix",
      "changes": {
        "tch": 9,
        "ref": 9
      },
      "origin": "Pokémon Sun/Moon (2016) · Alolan Ice type",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Ninetales": [
    {
      "name": "Alolan Ninetales",
      "changes": {
        "tch": 12,
        "ref": 10
      },
      "origin": "Pokémon Sun/Moon (2016) · Alolan Ice/Fairy type",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Raichu": [
    {
      "name": "Alolan Raichu",
      "changes": {
        "spd": 11,
        "agi": 11,
        "tch": 10
      },
      "origin": "Pokémon Sun/Moon (2016) · Alolan Psychic/Electric form",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Sandshrew": [
    {
      "name": "Alolan Sandshrew",
      "changes": {
        "end": 12,
        "spd": -6
      },
      "origin": "Pokémon Sun/Moon (2016) · Alolan Ice/Steel form",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Sandslash": [
    {
      "name": "Alolan Sandslash",
      "changes": {
        "end": 12,
        "acc": 10
      },
      "origin": "Pokémon Sun/Moon (2016) · Alolan Ice/Steel form",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Marowak": [
    {
      "name": "Alolan Marowak",
      "changes": {
        "tch": 12,
        "ref": 10
      },
      "origin": "Pokémon Sun/Moon (2016) · Alolan Fire/Ghost form",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Exeggutor": [
    {
      "name": "Alolan Exeggutor",
      "changes": {
        "siz": 15,
        "tch": 10
      },
      "origin": "Pokémon Sun/Moon (2016) · Alolan Grass/Dragon form",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Muk": [
    {
      "name": "Alolan Muk",
      "changes": {
        "end": 11,
        "str": 10
      },
      "origin": "Pokémon Sun/Moon (2016) · Alolan Poison/Dark form",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Slowbro": [
    {
      "name": "Mega Slowbro",
      "changes": {
        "end": 14,
        "str": 10
      },
      "origin": "Pokémon Omega Ruby/Alpha Sapphire (2014) · Mega Evolution",
      "continuity": "Pokémon games"
    },
    {
      "name": "Galarian Slowbro",
      "changes": {
        "acc": 11,
        "tch": 10
      },
      "origin": "Pokémon Sword/Shield Isle of Armor (2020) · Galarian form",
      "continuity": "Pokémon games"
    }
  ],
  "pokemon:Farfetch'd": [
    {
      "name": "Galarian Farfetch'd",
      "changes": {
        "str": 10,
        "end": 9
      },
      "origin": "Pokémon Sword/Shield (2019) · Galarian Fighting type",
      "continuity": "Pokémon games"
    }
  ],
  "starwars:Luke Skywalker": [
    {
      "name": "Grand Master Luke Skywalker",
      "changes": {
        "iq": 12,
        "tch": 13,
        "ldr": 13
      },
      "origin": "Star Wars Legends · Grand Master era",
      "continuity": "Legends"
    },
    {
      "name": "Dark Empire Luke",
      "changes": {
        "tch": 10,
        "clu": -11,
        "iq": 9
      },
      "origin": "Star Wars: Dark Empire (1991) · temporarily serves Emperor",
      "continuity": "Legends"
    }
  ],
  "starwars:Emperor Palpatine": [
    {
      "name": "Sith Eternal Palpatine",
      "changes": {
        "tch": 14,
        "end": 11,
        "clu": -10
      },
      "origin": "The Rise of Skywalker (2019) · Exegol rejuvenation",
      "continuity": "Star Wars canon"
    },
    {
      "name": "Clone Emperor Palpatine",
      "changes": {
        "end": 11,
        "tch": 10
      },
      "origin": "Dark Empire (1991) · clone bodies",
      "continuity": "Star Wars Legends"
    }
  ],
  "starwars:Ahsoka Tano": [
    {
      "name": "Ahsoka the White",
      "changes": {
        "iq": 10,
        "clu": 11,
        "ldr": 9
      },
      "origin": "Ahsoka (2023) episode 5 · post-World Between Worlds",
      "continuity": "Star Wars canon; symbolic/mental transformation"
    }
  ],
  "starwars:Rey": [
    {
      "name": "Rey with Dyad Empowerment",
      "changes": {
        "tch": 13,
        "iq": 9,
        "clu": 9
      },
      "origin": "The Rise of Skywalker (2019) · dyad / Jedi spirits",
      "continuity": "Star Wars canon; temporary"
    }
  ],
  "starwars:Obi-Wan Kenobi": [
    {
      "name": "Force Spirit Obi-Wan",
      "changes": {
        "tch": 9,
        "iq": 12,
        "clu": 11
      },
      "origin": "The Empire Strikes Back (1980) · Force ghost",
      "continuity": "Star Wars canon; cannot physically fight"
    }
  ],
  "starwars:Darth Vader": [
    {
      "name": "Vader of Mustafar (Fully Restored)",
      "changes": {
        "tch": 10,
        "ref": 10,
        "clu": -8
      },
      "origin": "Darth Vader (2017) / Mustafar visions · peak Sith fury",
      "continuity": "Star Wars comics, temporary state"
    }
  ],
  "lotr:Gandalf": [
    {
      "name": "Gandalf the White",
      "changes": {
        "tch": 13,
        "ldr": 13,
        "end": 11
      },
      "origin": "The Two Towers · returned as the White Rider",
      "continuity": "Tolkien books"
    },
    {
      "name": "Olórin (Uncloaked Maia)",
      "changes": {
        "tch": 14,
        "iq": 12
      },
      "origin": "The Silmarillion / Unfinished Tales · Maia of Valinor",
      "continuity": "Pre-Istari; unconstrained spirit depiction"
    }
  ],
  "lotr:Sauron": [
    {
      "name": "Annatar, Lord of Gifts",
      "changes": {
        "iq": 12,
        "tch": 10,
        "clu": 12
      },
      "origin": "The Silmarillion / Of the Rings of Power · fair guise",
      "continuity": "Tolkien books; deception form"
    },
    {
      "name": "Sauron with the One Ring",
      "changes": {
        "tch": 14,
        "end": 12,
        "ldr": 13
      },
      "origin": "The Lord of the Rings / The Silmarillion · One Ring worn",
      "continuity": "Second Age; artifact-bound"
    }
  ],
  "lotr:Saruman": [
    {
      "name": "Saruman of Many Colours",
      "changes": {
        "iq": 11,
        "tch": 10,
        "clu": -9
      },
      "origin": "The Fellowship of the Ring · Saruman of Many Colours",
      "continuity": "Tolkien books"
    }
  ],
  "lotr:Beorn": [
    {
      "name": "Beorn (Bear Form)",
      "changes": {
        "str": 14,
        "siz": 12,
        "end": 12,
        "agi": 8
      },
      "origin": "The Hobbit · skin-changer bear form",
      "continuity": "Tolkien books"
    }
  ],
  "lotr:Morgoth (Melkor)": [
    {
      "name": "Melkor Unbound",
      "changes": {
        "str": 14,
        "tch": 14,
        "iq": 10
      },
      "origin": "The Silmarillion · undiminished Vala before dispersal",
      "continuity": "First Age / Valinor; original state"
    }
  ],
  "lotr:Gollum (Sméagol)": [
    {
      "name": "Sméagol (Before the Ring)",
      "changes": {
        "clu": 10,
        "end": -7,
        "ref": 8
      },
      "origin": "The Return of the King · Sméagol before Ring-corruption",
      "continuity": "Tolkien books; historical"
    }
  ],
  "harrypotter:Albus Dumbledore": [
    {
      "name": "Dumbledore with Elder Wand",
      "changes": {
        "tch": 12,
        "iq": 10,
        "ref": 9
      },
      "origin": "Harry Potter and the Deathly Hallows · mastery of Elder Wand",
      "continuity": "Wizarding World; wand-dependent"
    }
  ],
  "harrypotter:Lord Voldemort": [
    {
      "name": "Voldemort with Elder Wand",
      "changes": {
        "tch": 11,
        "acc": 9,
        "clu": -8
      },
      "origin": "Harry Potter and the Deathly Hallows · stolen Elder Wand",
      "continuity": "Wizarding World; wand's allegiance did not accept him"
    }
  ],
  "harrypotter:Severus Snape": [
    {
      "name": "Snape as Half-Blood Prince",
      "changes": {
        "tch": 8,
        "iq": 10,
        "ref": 9
      },
      "origin": "Harry Potter and the Half-Blood Prince · inventor of spells",
      "continuity": "Wizarding World; younger-era skill set"
    }
  ],
  "harrypotter:Minerva McGonagall": [
    {
      "name": "McGonagall (Animagus Cat)",
      "changes": {
        "agi": 13,
        "spd": 8,
        "siz": -13
      },
      "origin": "Harry Potter and the Philosopher's Stone · Animagus cat",
      "continuity": "Wizarding World"
    }
  ],
  "harrypotter:Sirius Black": [
    {
      "name": "Sirius (Animagus Dog)",
      "changes": {
        "agi": 11,
        "spd": 9,
        "ref": 9
      },
      "origin": "Harry Potter and the Prisoner of Azkaban · Animagus dog",
      "continuity": "Wizarding World"
    }
  ],
  "harrypotter:Remus Lupin": [
    {
      "name": "Werewolf Remus Lupin",
      "changes": {
        "str": 13,
        "spd": 9,
        "clu": -14
      },
      "origin": "Harry Potter and the Prisoner of Azkaban · full moon transformation",
      "continuity": "Wizarding World; involuntary"
    }
  ],
  "harrypotter:Peter Pettigrew": [
    {
      "name": "Scabbers (Animagus Rat)",
      "changes": {
        "siz": -13,
        "agi": 11,
        "ref": 10
      },
      "origin": "Harry Potter and the Prisoner of Azkaban · Animagus rat",
      "continuity": "Wizarding World"
    }
  ],
  "harrypotter:Rita Skeeter": [
    {
      "name": "Rita Skeeter (Beetle Animagus)",
      "changes": {
        "siz": -15,
        "agi": 12,
        "ref": 11
      },
      "origin": "Harry Potter and the Goblet of Fire · beetle Animagus",
      "continuity": "Wizarding World"
    }
  ],
  "harrypotter:Nagini": [
    {
      "name": "Nagini (Human Maledictus)",
      "changes": {
        "iq": 11,
        "ldr": 7,
        "str": -12
      },
      "origin": "Fantastic Beasts: The Crimes of Grindelwald (2018) · pre-curse human form",
      "continuity": "Wizarding World; before permanent snake transformation"
    }
  ],
  "harrypotter:Gellert Grindelwald": [
    {
      "name": "Grindelwald with Elder Wand",
      "changes": {
        "tch": 12,
        "iq": 11,
        "ldr": 9
      },
      "origin": "Fantastic Beasts / Deathly Hallows · Elder Wand",
      "continuity": "Wizarding World; equipment-dependent"
    }
  ],
  "harrypotter:Harry Potter": [
    {
      "name": "Harry Potter with Elder Wand",
      "changes": {
        "tch": 11,
        "clu": 9,
        "ref": 8
      },
      "origin": "Harry Potter and the Deathly Hallows · Elder Wand's true master",
      "continuity": "Wizarding World; weapon not permanently retained"
    }
  ],
  "harrypotter:Credence Barebone": [
    {
      "name": "Obscurial Credence",
      "changes": {
        "tch": 14,
        "end": 11,
        "clu": -12
      },
      "origin": "Fantastic Beasts and Where to Find Them (2016) · Obscurus release",
      "continuity": "Wizarding World"
    }
  ],
  "toons:Bugs Bunny": [
    {
      "name": "Big Chungus (Bugs Bunny)",
      "changes": {
        "siz": 15,
        "str": 12,
        "clu": 6
      },
      "origin": "Wabbit Twouble (1941) · exaggerated rotund Bugs",
      "continuity": "Looney Tunes; gag form"
    }
  ],
  "toons:Popeye": [
    {
      "name": "Spinach-Powered Popeye",
      "changes": {
        "str": 15,
        "end": 14,
        "ref": 9
      },
      "origin": "Popeye cartoons · spinach transformation",
      "continuity": "King Features cartoons"
    }
  ],
  "toons:Mickey Mouse": [
    {
      "name": "Sorcerer's Apprentice Mickey",
      "changes": {
        "tch": 13,
        "iq": 8,
        "clu": -5
      },
      "origin": "Fantasia (1940) · enchanted broom / sorcerer's hat",
      "continuity": "Disney animation; borrowed magic"
    }
  ],
  "toons:Shrek": [
    {
      "name": "Human Shrek",
      "changes": {
        "agi": 10,
        "str": -9,
        "clu": 8
      },
      "origin": "Shrek 2 (2004) · Happily Ever After potion",
      "continuity": "DreamWorks"
    }
  ],
  "toons:Simba": [
    {
      "name": "Adult King Simba",
      "changes": {
        "ldr": 12,
        "str": 10,
        "end": 8
      },
      "origin": "The Lion King (1994) · adult Simba",
      "continuity": "Disney animation; age progression"
    }
  ],
  "toons:Aang": [
    {
      "name": "Avatar State Aang",
      "changes": {
        "tch": 15,
        "spd": 12,
        "ref": 12
      },
      "origin": "Avatar: The Last Airbender · Avatar State",
      "continuity": "Nickelodeon"
    }
  ],
  "toons:Zuko": [
    {
      "name": "Blue Spirit Zuko",
      "changes": {
        "agi": 10,
        "acc": 11,
        "clu": 9
      },
      "origin": "Avatar: The Last Airbender · masked Blue Spirit",
      "continuity": "Nickelodeon; trained identity, not new powers"
    }
  ],
  "toons:Optimus Prime": [
    {
      "name": "Jetfire-Powered Optimus Prime",
      "changes": {
        "spd": 12,
        "tch": 11,
        "end": 9
      },
      "origin": "Transformers: Revenge of the Fallen (2009) · Jetfire parts",
      "continuity": "Paramount films"
    }
  ],
  "toons:Megatron": [
    {
      "name": "Galvatron (Megatron Reborn)",
      "changes": {
        "str": 12,
        "tch": 11,
        "end": 11
      },
      "origin": "The Transformers: The Movie (1986) · Unicron reformats Megatron",
      "continuity": "Transformers G1"
    }
  ],
  "toons:SpongeBob SquarePants": [
    {
      "name": "Invincibubble SpongeBob",
      "changes": {
        "str": 12,
        "end": 13,
        "ref": 10
      },
      "origin": "The SpongeBob Movie: Sponge Out of Water (2015) · superhero form",
      "continuity": "Nickelodeon"
    }
  ],
  "toons:Elsa": [
    {
      "name": "Fifth Spirit Elsa",
      "changes": {
        "tch": 13,
        "clu": 11,
        "ref": 9
      },
      "origin": "Frozen II (2019) · fifth spirit revealed",
      "continuity": "Disney animation"
    }
  ],
  "toons:Stitch": [
    {
      "name": "Experiment 626 Unrestrained",
      "changes": {
        "str": 12,
        "end": 11,
        "clu": -9
      },
      "origin": "Lilo & Stitch (2002) · instinctive destructive state",
      "continuity": "Disney animation"
    }
  ]
};
  root.DA_CAMPAIGN_VARIANT_EXPANSION = Object.freeze(Object.fromEntries(Object.entries(DATA).map(([id,forms])=>[id,Object.freeze(forms.map(f=>Object.freeze(f)))])));
  if(typeof module!=='undefined'&&module.exports) module.exports=root.DA_CAMPAIGN_VARIANT_EXPANSION;
})(typeof window!=='undefined'?window:globalThis);

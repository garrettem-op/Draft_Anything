/* Curated video-game power-up forms. Each entry includes a supporting source and an actual gameplay-relevant change. */
const CAMPAIGN_VARIANTS_GAMES = Object.freeze({
  "games:Mario": [
    {
      "name": "Elephant Mario",
      "changes": {
        "str": 12,
        "siz": 11,
        "end": 6,
        "agi": -4
      },
      "origin": "Super Mario Bros. Wonder · Elephant Fruit",
      "source": "https://www.nintendo.com/us/store/products/super-mario-bros-wonder-switch/",
      "kind": "power-up",
      "feat": "Elephant Fruit enlarges Mario and gives him a powerful trunk for smashing barriers."
    },
    {
      "name": "Drill Mario",
      "changes": {
        "tch": 9,
        "agi": 10,
        "ref": 8
      },
      "origin": "Super Mario Bros. Wonder · Drill Mushroom",
      "source": "https://www.nintendo.com/us/store/products/super-mario-bros-wonder-switch/",
      "kind": "power-up",
      "feat": "Mario can drill into floors and ceilings, gaining evasive movement and close-range attacks."
    },
    {
      "name": "Bubble Mario",
      "changes": {
        "acc": 11,
        "tch": 9,
        "ref": 6
      },
      "origin": "Super Mario Bros. Wonder · Bubble Flower",
      "source": "https://www.nintendo.com/us/store/products/super-mario-bros-wonder-switch/",
      "kind": "power-up",
      "feat": "Mario fires bubbles that trap enemies and create temporary platforms."
    },
    {
      "name": "Tanooki Mario",
      "changes": {
        "agi": 10,
        "lep": 10,
        "ref": 7
      },
      "origin": "Super Mario Bros. 3 · Super Leaf",
      "source": "https://www.nintendo.com/jp/character/mario/en/history/wonder/index.html",
      "kind": "power-up",
      "feat": "The raccoon/Tanooki transformation grants tail attacks and expanded airborne mobility."
    }
  ],
  "games:Luigi": [
    {
      "name": "Elephant Luigi",
      "changes": {
        "str": 12,
        "siz": 11,
        "end": 6,
        "agi": -4
      },
      "origin": "Super Mario Bros. Wonder · Elephant Fruit",
      "source": "https://www.nintendo.com/us/store/products/super-mario-bros-wonder-switch/",
      "kind": "power-up",
      "feat": "The Elephant Fruit gives Luigi an elephant form with powerful trunk attacks."
    },
    {
      "name": "Fire Luigi",
      "changes": {
        "acc": 11,
        "tch": 8,
        "ref": 7
      },
      "origin": "Super Mario games · Fire Flower",
      "source": "https://www.nintendo.com/jp/character/mario/en/history/wonder/index.html",
      "kind": "power-up",
      "feat": "The Fire Flower gives Luigi a fireball projectile attack."
    }
  ],
  "games:Princess Peach": [
    {
      "name": "Elephant Peach",
      "changes": {
        "str": 11,
        "siz": 10,
        "end": 7,
        "agi": -4
      },
      "origin": "Super Mario Bros. Wonder · Elephant Fruit",
      "source": "https://www.nintendo.com/us/store/products/super-mario-bros-wonder-switch/",
      "kind": "power-up",
      "feat": "Peach can use the Elephant Fruit and wield trunk-based attacks."
    },
    {
      "name": "Fire Peach",
      "changes": {
        "acc": 10,
        "tch": 9,
        "ref": 7
      },
      "origin": "Super Mario Bros. Wonder · Fire Flower",
      "source": "https://www.nintendo.com/us/store/products/super-mario-bros-wonder-switch/",
      "kind": "power-up",
      "feat": "Peach can equip the Fire Flower and throw fireballs."
    }
  ],
  "games:Kirby": [
    {
      "name": "Car-Mouth Kirby",
      "changes": {
        "spd": 12,
        "siz": 10,
        "agi": -6
      },
      "origin": "Kirby and the Forgotten Land · Mouthful Mode",
      "source": "https://www.nintendo.com/us/store/products/kirby-and-the-forgotten-land-switch/",
      "kind": "transformation",
      "feat": "Kirby inhales a car in Mouthful Mode, increasing speed and ramming capability."
    },
    {
      "name": "Vending-Mouth Kirby",
      "changes": {
        "acc": 12,
        "tch": 8,
        "siz": 8,
        "agi": -6
      },
      "origin": "Kirby and the Forgotten Land · Mouthful Mode",
      "source": "https://www.nintendo.com/us/store/products/kirby-and-the-forgotten-land-switch/",
      "kind": "transformation",
      "feat": "Kirby inhales a vending machine and fires projectiles as canned drinks."
    },
    {
      "name": "Drill Kirby",
      "changes": {
        "tch": 10,
        "ref": 9,
        "agi": 9
      },
      "origin": "Kirby and the Forgotten Land · Drill Copy Ability",
      "source": "https://www.nintendo.com/us/store/products/kirby-and-the-forgotten-land-switch/",
      "kind": "power-up",
      "feat": "Kirby can burrow underground to dodge attacks and strike enemies."
    },
    {
      "name": "Ranger Kirby",
      "changes": {
        "acc": 12,
        "ref": 8,
        "tch": 7
      },
      "origin": "Kirby and the Forgotten Land · Ranger Copy Ability",
      "source": "https://www.nintendo.com/us/store/products/kirby-and-the-forgotten-land-switch/",
      "kind": "power-up",
      "feat": "Kirby acquires long-range, chargeable projectile attacks with the Ranger ability."
    }
  ],
  "games:Samus Aran": [
    {
      "name": "Varia Suit Samus",
      "changes": {
        "end": 12,
        "str": 5,
        "ref": 5
      },
      "origin": "Metroid Dread · Varia Suit",
      "source": "https://metroid.nintendo.com/dread/samus/",
      "kind": "suit",
      "feat": "Varia armor adds improved defense and protection from extreme heat."
    },
    {
      "name": "Gravity Suit Samus",
      "changes": {
        "end": 11,
        "agi": 10,
        "spd": 7
      },
      "origin": "Metroid Dread · Gravity Suit",
      "source": "https://metroid.nintendo.com/dread/samus/",
      "kind": "suit",
      "feat": "Gravity Suit increases protection and reduces environmental movement impediments."
    },
    {
      "name": "Zero Suit Samus",
      "changes": {
        "agi": 12,
        "spd": 9,
        "ref": 9,
        "str": -11,
        "end": -12
      },
      "origin": "Metroid · Zero Mission / Smash",
      "source": "https://www.nintendo.com/en-gb/News/2021/July/Metroid-Dread-Report-Vol-3-Seven-points-that-define-the-2D-saga-2007780.html",
      "kind": "suit",
      "feat": "Samus without her Power Suit trades armor and firepower for agility and evasive movement."
    },
    {
      "name": "Phantom Cloak Samus",
      "changes": {
        "ref": 13,
        "agi": 8,
        "tch": 5
      },
      "origin": "Metroid Dread · Aeion camouflage",
      "source": "https://metroid.nintendo.com/dread/samus/",
      "kind": "power-up",
      "feat": "Phantom Cloak hides Samus from optical sensors and suppresses sound."
    }
  ],
  "games:Link": [
    {
      "name": "Wolf Link",
      "changes": {
        "spd": 9,
        "agi": 11,
        "ref": 12,
        "tch": -7
      },
      "origin": "The Legend of Zelda · Twilight Princess",
      "source": "https://www.nintendo.com/us/store/characters/zelda/",
      "kind": "transformation",
      "feat": "Twilight magic transforms Link into a wolf with heightened senses and animal movement."
    },
    {
      "name": "Goron Link",
      "changes": {
        "str": 12,
        "siz": 10,
        "end": 11,
        "agi": -6
      },
      "origin": "The Legend of Zelda · Majora's Mask",
      "source": "https://www.nintendo.com/us/store/characters/zelda/",
      "kind": "transformation",
      "feat": "The Goron Mask transforms Link into a durable Goron body with rolling attacks."
    },
    {
      "name": "Zora Link",
      "changes": {
        "spd": 8,
        "agi": 10,
        "end": 8
      },
      "origin": "The Legend of Zelda · Majora's Mask",
      "source": "https://www.nintendo.com/us/store/characters/zelda/",
      "kind": "transformation",
      "feat": "The Zora Mask grants Link aquatic speed, swimming, and specialized attacks."
    }
  ],
  "games:Zelda": [
    {
      "name": "Sheik",
      "changes": {
        "agi": 11,
        "ref": 10,
        "tch": 11,
        "ldr": -5
      },
      "origin": "The Legend of Zelda · Ocarina of Time",
      "source": "https://www.nintendo.com/us/store/characters/zelda/",
      "kind": "persona",
      "feat": "Zelda assumes the Sheik identity and practices covert Sheikah-style movement."
    },
    {
      "name": "Light Dragon Zelda",
      "changes": {
        "siz": 14,
        "end": 14,
        "spd": 8,
        "tch": -10
      },
      "origin": "The Legend of Zelda · Tears of the Kingdom",
      "source": "https://www.nintendo.com/us/store/products/the-legend-of-zelda-tears-of-the-kingdom-switch/",
      "kind": "transformation",
      "feat": "Zelda becomes the Light Dragon, a huge immortal draconic body carrying the restored Master Sword."
    }
  ],
  "games:Ganondorf": [
    {
      "name": "Demon King Ganondorf",
      "changes": {
        "str": 12,
        "end": 12,
        "tch": 11,
        "iq": 8
      },
      "origin": "The Legend of Zelda · Tears of the Kingdom",
      "source": "https://www.nintendo.com/us/store/products/the-legend-of-zelda-tears-of-the-kingdom-switch/",
      "kind": "empowerment",
      "feat": "A Secret Stone amplifies Ganondorf's powers as the Demon King."
    }
  ],
  "games:Bowser": [
    {
      "name": "Meowser",
      "changes": {
        "agi": 12,
        "lep": 10,
        "ref": 10,
        "str": 6
      },
      "origin": "Super Mario 3D World · Super Bell",
      "source": "https://www.nintendo.com/us/store/products/super-mario-3d-world-plus-bowsers-fury-switch/",
      "kind": "power-up",
      "feat": "Bowser uses the Super Bell to gain an agile cat transformation."
    },
    {
      "name": "Dreamy Bowser",
      "changes": {
        "tch": 12,
        "ref": 11,
        "iq": 9,
        "str": 10
      },
      "origin": "Mario & Luigi: Dream Team · Dream Stone",
      "source": "https://www.nintendo.com/us/store/characters/mario/",
      "kind": "empowerment",
      "feat": "Bowser draws in the Dream Stone's energy to become Dreamy Bowser."
    }
  ],
  "games:Sonic the Hedgehog": [
    {
      "name": "Hyper Sonic",
      "changes": {
        "spd": 13,
        "agi": 12,
        "ref": 12,
        "end": 11
      },
      "origin": "Sonic 3 & Knuckles · Super Emeralds",
      "source": "https://sonic.sega.jp/",
      "kind": "empowerment",
      "feat": "The Super Emeralds transform Sonic beyond Super Sonic into Hyper Sonic."
    }
  ],
  "games:Shadow the Hedgehog": [
    {
      "name": "Doom Powers Shadow",
      "changes": {
        "tch": 12,
        "agi": 10,
        "spd": 8,
        "ref": 9
      },
      "origin": "Sonic X Shadow Generations · Doom Powers",
      "source": "https://sonic.sega.jp/SonicXShadowGenerations/feature.html",
      "kind": "empowerment",
      "feat": "Shadow unlocks Doom Spear, Doom Blast, Doom Surf, and Doom Morph abilities."
    }
  ],
  "games:Tails": [
    {
      "name": "Super Tails",
      "changes": {
        "spd": 12,
        "ref": 12,
        "agi": 9,
        "end": 8
      },
      "origin": "Sonic 3 & Knuckles · Super Emeralds",
      "source": "https://sonic.sega.jp/",
      "kind": "empowerment",
      "feat": "Collecting the Super Emeralds enables Tails's invincible Super transformation."
    }
  ],
  "games:Knuckles": [
    {
      "name": "Super Knuckles",
      "changes": {
        "str": 10,
        "spd": 12,
        "end": 11,
        "ref": 9
      },
      "origin": "Sonic & Knuckles · Chaos Emeralds",
      "source": "https://sonic.sega.jp/",
      "kind": "empowerment",
      "feat": "Knuckles can achieve a glowing Super state using Chaos Emeralds."
    }
  ],
  "games:Sora": [
    {
      "name": "Valor Form Sora",
      "changes": {
        "str": 11,
        "spd": 10,
        "tch": 8,
        "iq": -5
      },
      "origin": "Kingdom Hearts II · Drive Form",
      "source": "https://www.khwiki.com/Drive_Form",
      "kind": "transformation",
      "feat": "Valor Form dual-wields Keyblades and emphasizes physical combat instead of magic."
    },
    {
      "name": "Wisdom Form Sora",
      "changes": {
        "tch": 12,
        "acc": 11,
        "agi": 7,
        "str": -6
      },
      "origin": "Kingdom Hearts II · Drive Form",
      "source": "https://www.khwiki.com/Drive_Form",
      "kind": "transformation",
      "feat": "Wisdom Form strengthens magical projectiles and ground mobility."
    },
    {
      "name": "Master Form Sora",
      "changes": {
        "tch": 11,
        "lep": 11,
        "agi": 11
      },
      "origin": "Kingdom Hearts II · Drive Form",
      "source": "https://www.khwiki.com/Drive_Form",
      "kind": "transformation",
      "feat": "Master Form mixes physical and magical offense with aerial movement."
    },
    {
      "name": "Final Form Sora",
      "changes": {
        "tch": 13,
        "ref": 13,
        "spd": 9,
        "clu": 9
      },
      "origin": "Kingdom Hearts II · Drive Form",
      "source": "https://www.khwiki.com/Drive_Form",
      "kind": "transformation",
      "feat": "Final Form grants advanced Keyblade control and glide-based mobility."
    },
    {
      "name": "Anti Form Sora",
      "changes": {
        "spd": 14,
        "agi": 14,
        "ref": 12,
        "iq": -8,
        "tch": -13
      },
      "origin": "Kingdom Hearts II · Anti Form",
      "source": "https://www.khwiki.com/Drive_Form",
      "kind": "transformation",
      "feat": "Antiform is a fast feral state that sacrifices magic, Keyblade access, and defense."
    }
  ],
  "games:Jin Kazama": [
    {
      "name": "Devil Jin",
      "changes": {
        "str": 11,
        "spd": 10,
        "tch": 11,
        "clu": -12
      },
      "origin": "Tekken · Devil Gene",
      "source": "https://tekken.com/fighters/devil-jin",
      "kind": "transformation",
      "feat": "Jin loses control of his devil blood and gains wings and superhuman abilities."
    }
  ],
  "games:Sarah Kerrigan": [
    {
      "name": "Primal Kerrigan",
      "changes": {
        "str": 11,
        "tch": 13,
        "spd": 9,
        "end": 9
      },
      "origin": "StarCraft II · Heart of the Swarm",
      "source": "https://worldofwarcraft.blizzard.com/en-us/news/10452532/new-licensed-products-announced-sdcc",
      "kind": "transformation",
      "feat": "Kerrigan acquires her Primal Zerg form on Zerus, with enhanced psionic and physical capabilities."
    }
  ]
});
if(typeof module!=='undefined'&&module.exports)module.exports=CAMPAIGN_VARIANTS_GAMES;

/* Publisher-verified Mega Evolution and Gigantamax forms. Regional variants are deliberately excluded: they are not mid-battle transformations. */
const CAMPAIGN_VARIANTS_POKEMON = Object.freeze({
  "pokemon:Venusaur": [
    {
      "name": "Mega Venusaur",
      "changes": {
        "str": 8,
        "end": 12,
        "siz": 7,
        "agi": -4
      },
      "origin": "Pokémon · Mega Evolution",
      "source": "https://mega.pokemon.com/en-us/",
      "kind": "mega-evolution",
      "feat": "Mega Venusaur develops a massive protective plant growth and increased durability."
    },
    {
      "name": "Gigantamax Venusaur",
      "changes": {
        "siz": 14,
        "end": 10,
        "str": 7,
        "agi": -5
      },
      "origin": "Pokémon Sword/Shield · Gigantamax",
      "source": "https://www.pokemon.com/us/features/the-great-pokemon-go-guide-to-winning-max-battles-and-catching-gigantamax-pokemon",
      "kind": "gigantamax",
      "feat": "Venusaur grows to enormous size and gains access to a species-specific G-Max move."
    }
  ],
  "pokemon:Blastoise": [
    {
      "name": "Mega Blastoise",
      "changes": {
        "acc": 12,
        "tch": 11,
        "end": 8
      },
      "origin": "Pokémon · Mega Evolution",
      "source": "https://mega.pokemon.com/en-us/",
      "kind": "mega-evolution",
      "feat": "Mega Blastoise gains an immense centralized cannon and strengthened water attacks."
    },
    {
      "name": "Gigantamax Blastoise",
      "changes": {
        "siz": 14,
        "acc": 11,
        "end": 9,
        "agi": -5
      },
      "origin": "Pokémon Sword/Shield · Gigantamax",
      "source": "https://www.pokemon.com/us/features/the-great-pokemon-go-guide-to-winning-max-battles-and-catching-gigantamax-pokemon",
      "kind": "gigantamax",
      "feat": "Blastoise's massive shell gains multiple cannons and a unique G-Max move."
    }
  ],
  "pokemon:Beedrill": [
    {
      "name": "Mega Beedrill",
      "changes": {
        "spd": 13,
        "agi": 11,
        "str": 10,
        "end": -7
      },
      "origin": "Pokémon · Mega Evolution",
      "source": "https://mega.pokemon.com/en-us/",
      "kind": "mega-evolution",
      "feat": "Mega Beedrill trades bulk for exceptional attack and speed."
    }
  ],
  "pokemon:Pidgeot": [
    {
      "name": "Mega Pidgeot",
      "changes": {
        "spd": 11,
        "acc": 12,
        "agi": 8
      },
      "origin": "Pokémon · Mega Evolution",
      "source": "https://mega.pokemon.com/en-us/",
      "kind": "mega-evolution",
      "feat": "Mega Pidgeot enhances its flying performance and precision attacks."
    }
  ],
  "pokemon:Alakazam": [
    {
      "name": "Mega Alakazam",
      "changes": {
        "iq": 13,
        "tch": 13,
        "ref": 12,
        "str": -6
      },
      "origin": "Pokémon · Mega Evolution",
      "source": "https://mega.pokemon.com/en-us/",
      "kind": "mega-evolution",
      "feat": "Mega Alakazam further concentrates its psychic power."
    }
  ],
  "pokemon:Slowbro": [
    {
      "name": "Mega Slowbro",
      "changes": {
        "end": 14,
        "ref": 8,
        "siz": 9,
        "spd": -8
      },
      "origin": "Pokémon · Mega Evolution",
      "source": "https://mega.pokemon.com/en-us/",
      "kind": "mega-evolution",
      "feat": "Mega Slowbro gains extraordinary protective shell bulk at the expense of mobility."
    }
  ],
  "pokemon:Gengar": [
    {
      "name": "Mega Gengar",
      "changes": {
        "spd": 11,
        "tch": 11,
        "agi": 9
      },
      "origin": "Pokémon · Mega Evolution",
      "source": "https://mega.pokemon.com/en-us/",
      "kind": "mega-evolution",
      "feat": "Mega Gengar becomes a more dangerous supernatural attacker."
    },
    {
      "name": "Gigantamax Gengar",
      "changes": {
        "siz": 14,
        "tch": 11,
        "ref": 8,
        "agi": -4
      },
      "origin": "Pokémon Sword/Shield · Gigantamax",
      "source": "https://swordshield.pokemon.com/en-us/expansionpass/gigantamax-festival/",
      "kind": "gigantamax",
      "feat": "Gigantamax Gengar gains a huge spectral maw and a unique G-Max move."
    }
  ],
  "pokemon:Kangaskhan": [
    {
      "name": "Mega Kangaskhan",
      "changes": {
        "str": 11,
        "tch": 8,
        "ref": 10
      },
      "origin": "Pokémon · Mega Evolution",
      "source": "https://mega.pokemon.com/en-us/",
      "kind": "mega-evolution",
      "feat": "Mega Kangaskhan fights in a parent-and-child combination through its Mega form."
    }
  ],
  "pokemon:Pinsir": [
    {
      "name": "Mega Pinsir",
      "changes": {
        "spd": 10,
        "lep": 13,
        "str": 9
      },
      "origin": "Pokémon · Mega Evolution",
      "source": "https://mega.pokemon.com/en-us/",
      "kind": "mega-evolution",
      "feat": "Mega Pinsir sprouts wings and gains improved aerial mobility."
    }
  ],
  "pokemon:Gyarados": [
    {
      "name": "Mega Gyarados",
      "changes": {
        "str": 11,
        "end": 10,
        "siz": 7,
        "agi": -5
      },
      "origin": "Pokémon · Mega Evolution",
      "source": "https://mega.pokemon.com/en-us/",
      "kind": "mega-evolution",
      "feat": "Mega Gyarados becomes a bulkier, more ferocious attacker with a different typing."
    }
  ],
  "pokemon:Aerodactyl": [
    {
      "name": "Mega Aerodactyl",
      "changes": {
        "spd": 12,
        "str": 8,
        "ref": 10
      },
      "origin": "Pokémon · Mega Evolution",
      "source": "https://mega.pokemon.com/en-us/",
      "kind": "mega-evolution",
      "feat": "Mega Aerodactyl grows more jagged rock protrusions and attacks with greater speed."
    }
  ],
  "games:Charizard": [
    {
      "name": "Gigantamax Charizard",
      "changes": {
        "siz": 14,
        "acc": 11,
        "tch": 10,
        "agi": -5
      },
      "origin": "Pokémon Sword/Shield · Gigantamax",
      "source": "https://swordshield.pokemon.com/en-us/pokemon-galar-region/",
      "kind": "gigantamax",
      "feat": "Charizard's immense Gigantamax body is wreathed in powerful flames."
    }
  ],
  "games:Pikachu": [
    {
      "name": "Gigantamax Pikachu",
      "changes": {
        "siz": 14,
        "end": 9,
        "acc": 11,
        "agi": -6
      },
      "origin": "Pokémon Sword/Shield · Gigantamax",
      "source": "https://swordshield.pokemon.com/en-us/pokemon-galar-region/",
      "kind": "gigantamax",
      "feat": "Pikachu becomes enormous and fires a massive electric attack through its tail."
    }
  ],
  "pokemon:Eevee": [
    {
      "name": "Gigantamax Eevee",
      "changes": {
        "siz": 14,
        "end": 11,
        "ref": 8,
        "agi": -4
      },
      "origin": "Pokémon Sword/Shield · Gigantamax",
      "source": "https://swordshield.pokemon.com/en-us/pokemon-galar-region/",
      "kind": "gigantamax",
      "feat": "Gigantamax Eevee becomes gigantic and gains a special G-Max move."
    }
  ],
  "pokemon:Meowth": [
    {
      "name": "Gigantamax Meowth",
      "changes": {
        "siz": 14,
        "spd": 8,
        "agi": 5,
        "end": 8
      },
      "origin": "Pokémon Sword/Shield · Gigantamax",
      "source": "https://swordshield.pokemon.com/en-us/pokemon-galar-region/",
      "kind": "gigantamax",
      "feat": "Meowth's Gigantamax form stretches into a towering elongated body."
    }
  ],
  "pokemon:Butterfree": [
    {
      "name": "Gigantamax Butterfree",
      "changes": {
        "siz": 14,
        "tch": 12,
        "acc": 8,
        "agi": -4
      },
      "origin": "Pokémon Sword/Shield · Gigantamax",
      "source": "https://swordshield.pokemon.com/en-us/expansionpass/gigantamax-festival/",
      "kind": "gigantamax",
      "feat": "Gigantamax Butterfree gains huge wings and a powerful species-specific move."
    }
  ],
  "pokemon:Snorlax": [
    {
      "name": "Gigantamax Snorlax",
      "changes": {
        "siz": 14,
        "end": 14,
        "str": 9,
        "spd": -12
      },
      "origin": "Pokémon Sword/Shield · Gigantamax",
      "source": "https://swordshield.pokemon.com/en-us/pokemon-galar-region/gigantamax-snorlax/",
      "kind": "gigantamax",
      "feat": "Gigantamax Snorlax becomes mountain-sized and unleashes G-Max Replenish."
    }
  ],
  "pokemon:Kingler": [
    {
      "name": "Gigantamax Kingler",
      "changes": {
        "siz": 14,
        "str": 11,
        "end": 9,
        "agi": -5
      },
      "origin": "Pokémon Sword/Shield · Gigantamax",
      "source": "https://swordshield.pokemon.com/en-us/expansionpass/gigantamax-festival/",
      "kind": "gigantamax",
      "feat": "Kingler expands into a colossal crustacean and uses G-Max Foam Burst."
    }
  ],
  "pokemon:Lapras": [
    {
      "name": "Gigantamax Lapras",
      "changes": {
        "siz": 14,
        "end": 12,
        "tch": 10,
        "agi": -6
      },
      "origin": "Pokémon Sword/Shield · Gigantamax",
      "source": "https://swordshield.pokemon.com/en-us/expansionpass/gigantamax-festival/",
      "kind": "gigantamax",
      "feat": "Gigantamax Lapras gains a vast shell and defensive G-Max Resonance."
    }
  ],
  "pokemon:Machamp": [
    {
      "name": "Gigantamax Machamp",
      "changes": {
        "siz": 14,
        "str": 13,
        "end": 10,
        "agi": -5
      },
      "origin": "Pokémon Sword/Shield · Gigantamax",
      "source": "https://swordshield.pokemon.com/en-us/expansionpass/gigantamax-festival/",
      "kind": "gigantamax",
      "feat": "Gigantamax Machamp gains enormous strength and a powerful G-Max Chi Strike."
    }
  ]
});
if(typeof module!=='undefined'&&module.exports)module.exports=CAMPAIGN_VARIANTS_POKEMON;

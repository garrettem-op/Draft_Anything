/* Curated animation and Star Wars states. Character forms must depict an actual story-recognized transformation, persona, equipment, or age state. */
const CAMPAIGN_VARIANTS_OTHERS = Object.freeze({
  "toons:Aang": [
    {
      "name": "Avatar State Aang",
      "changes": {
        "tch": 14,
        "str": 11,
        "ref": 11,
        "iq": 10,
        "clu": -8
      },
      "origin": "Avatar: The Last Airbender · Avatar State",
      "source": "https://www.paramountplus.com/shows/avatar-the-last-airbender/episodes/2/",
      "kind": "empowerment",
      "feat": "Aang accesses the Avatar State's enormous elemental power, initially with limited emotional control."
    }
  ],
  "toons:Katara": [
    {
      "name": "Bloodbending Katara",
      "changes": {
        "tch": 13,
        "ref": 10,
        "iq": 5,
        "clu": -10
      },
      "origin": "Avatar: The Last Airbender · Bloodbending",
      "source": "https://www.avatarstudiosofficial.com/characters/",
      "kind": "technique-state",
      "feat": "Katara can control the water in another living body using a forbidden waterbending technique."
    }
  ],
  "toons:Zuko": [
    {
      "name": "Blue Spirit Zuko",
      "changes": {
        "agi": 12,
        "ref": 10,
        "tch": 10,
        "ldr": -5
      },
      "origin": "Avatar: The Last Airbender · Blue Spirit",
      "source": "https://www.avatarstudiosofficial.com/timeline/",
      "kind": "persona",
      "feat": "Zuko assumes the anonymous Blue Spirit masked identity for stealthy twin-sword combat."
    }
  ],
  "toons:Mickey Mouse": [
    {
      "name": "Sorcerer's Apprentice Mickey",
      "changes": {
        "tch": 12,
        "iq": 8,
        "ref": 8,
        "clu": -8
      },
      "origin": "Disney · Fantasia / Sorcerer's Apprentice",
      "source": "https://books.disney.com/book/the-sorcerers-apprentice/",
      "kind": "empowerment",
      "feat": "Mickey borrows a sorcerer's enchanted hat and commands magic he struggles to control."
    }
  ],
  "toons:Rick Sanchez": [
    {
      "name": "Pickle Rick",
      "changes": {
        "siz": -14,
        "str": -9,
        "agi": 10,
        "iq": 7,
        "ref": 12
      },
      "origin": "Rick and Morty · Pickle Rick",
      "source": "https://www.adultswim.com/videos/rick-and-morty",
      "kind": "transformation",
      "feat": "Rick transfers himself into a pickle body and compensates through improvisational engineering."
    }
  ],
  "toons:Elsa": [
    {
      "name": "Fifth Spirit Elsa",
      "changes": {
        "tch": 12,
        "iq": 9,
        "clu": 11,
        "ref": 7
      },
      "origin": "Disney · Frozen II",
      "source": "https://movies.disney.com/frozen-2",
      "kind": "empowerment",
      "feat": "Elsa discovers her connection to the elemental spirits and a more controlled use of her powers."
    }
  ],
  "toons:Shrek": [
    {
      "name": "Human Shrek",
      "changes": {
        "str": -12,
        "siz": -12,
        "agi": 10,
        "ref": 5
      },
      "origin": "DreamWorks · Shrek 2",
      "source": "https://www.dreamworks.com/movies/shrek-2",
      "kind": "transformation",
      "feat": "Happily Ever After potion turns Shrek into a human, reducing his ogre strength and size."
    }
  ],
  "toons:Megatron": [
    {
      "name": "Galvatron",
      "changes": {
        "tch": 11,
        "str": 10,
        "end": 11,
        "clu": -8
      },
      "origin": "Transformers · The Movie (1986)",
      "source": "https://transformers.hasbro.com/en-us",
      "kind": "reconstruction",
      "feat": "Unicron rebuilds the defeated Megatron as the more heavily armed Galvatron."
    }
  ],
  "starwars:Rey": [
    {
      "name": "All the Jedi Rey",
      "changes": {
        "iq": 11,
        "tch": 13,
        "ref": 12,
        "clu": 12
      },
      "origin": "Star Wars · The Rise of Skywalker",
      "source": "https://www.starwars.com/databank/rey",
      "kind": "empowerment",
      "feat": "Rey draws strength from Jedi spirits during her final duel with Palpatine on Exegol."
    }
  ],
  "starwars:Emperor Palpatine": [
    {
      "name": "Sith Eternal Palpatine",
      "changes": {
        "tch": 14,
        "ref": 12,
        "str": 8,
        "clu": -7
      },
      "origin": "Star Wars · The Rise of Skywalker",
      "source": "https://www.starwars.com/databank/emperor-palpatine-darth-sidious/",
      "kind": "empowerment",
      "feat": "Palpatine drains the Force dyad to restore his body and unleash devastating lightning."
    }
  ],
  "starwars:Darth Maul": [
    {
      "name": "Cybernetic Maul",
      "changes": {
        "agi": 10,
        "spd": 9,
        "end": 7,
        "ref": 7
      },
      "origin": "Star Wars · The Clone Wars",
      "source": "https://www.starwars.com/news/star-wars-maul-shadow-lord-leg-list",
      "kind": "reconstruction",
      "feat": "Maul returns after Naboo with successive mechanical legs and renewed agility."
    }
  ],
  "starwars:The Mandalorian": [
    {
      "name": "Full Beskar Din Djarin",
      "changes": {
        "end": 13,
        "ref": 9,
        "str": 6,
        "agi": -3
      },
      "origin": "Star Wars · The Mandalorian",
      "source": "https://www.starwars.com/news/the-acolyte-cortosis-the-mandalorian-beskar",
      "kind": "suit",
      "feat": "Din Djarin upgrades to armor made from exceptionally resilient pure beskar."
    }
  ],
  "starwars:Kylo Ren": [
    {
      "name": "Supreme Leader Kylo Ren",
      "changes": {
        "ldr": 11,
        "iq": 8,
        "tch": 5,
        "clu": -6
      },
      "origin": "Star Wars · The Last Jedi / Rise of Skywalker",
      "source": "https://www.starwars.com/databank/kylo-ren",
      "kind": "persona",
      "feat": "Kylo assumes supreme command of the First Order and directs his Knights of Ren."
    },
    {
      "name": "Redeemed Ben Solo",
      "changes": {
        "clu": 12,
        "ldr": 10,
        "ref": 9,
        "str": -5
      },
      "origin": "Star Wars · The Rise of Skywalker",
      "source": "https://www.starwars.com/databank/kylo-ren",
      "kind": "persona",
      "feat": "Ben Solo abandons the dark side to aid Rey in the confrontation with Palpatine."
    }
  ],
  "starwars:Luke Skywalker": [
    {
      "name": "Jedi Master Luke",
      "changes": {
        "iq": 12,
        "tch": 11,
        "ldr": 13,
        "spd": -8
      },
      "origin": "Star Wars · The Last Jedi",
      "source": "https://www.starwars.com/databank/luke-skywalker-biography-gallery",
      "kind": "life-stage",
      "feat": "An older Luke has decades of Jedi knowledge and immense Force discipline but diminished physical speed."
    }
  ]
});
if(typeof module!=='undefined'&&module.exports)module.exports=CAMPAIGN_VARIANTS_OTHERS;

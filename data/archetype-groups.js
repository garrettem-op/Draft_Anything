/* Shared archetype and tag chemistry groups across the talent pools.
 *
 * Idea from the Marvel Ultimate Alliance 3 research note (docs/option-c/MUA3_TEAM_BONUS_RESEARCH.md): besides
 * franchise teams, a squad also gets a bonus for sharing a fighting archetype. Owner rulings 2026-11-18: sourced
 * membership, film-group strength, and ONE shared set across all pools, so members link across universes in Mashup.
 * Owner rulings 2026-11-19: NBA takes no part (it runs on its own terms); broader tags join at strength 0.25:
 * Sorcerers (spellcasters only: no Force users, psychics or innate powers) and one group per colour.
 *
 * Two kinds of group:
 *  - kind 'archetype' (strength ARCHETYPE_STRENGTH = 1): Martial Artists, Agile Fighters, Blades & Claws,
 *    Anti-Heroes, Wisecracking Warriors.
 *  - kind 'tag' (strength TAG_STRENGTH = 0.25): Sorcerers, Greens, Blues, Reds, Yellows, Oranges, Purples, Pinks.
 *    Sorcerers has no per-pool cap (perPoolCap: null, owner ruling 2026-11-20): every sourced spellcaster joins, but
 *    creatures, ghosts, Squibs/Muggles, Force users, psychics and innate or item-only powers stay out.
 *    A character belongs to at most one colour: the body colour (skin, fur, feathers) or the signature colour their
 *    identity is built on (Green Lantern's ring), as a source states it. Pokémon use their Pokédex colour.
 *
 * Wiring (index.html): each group registers once as GROUPS['arch:' + slug] (archetypes) or GROUPS['tag:' + slug]
 * (tags), and its id is added to the `g` list of every member candidate in that member's pool. A group's points are strength x LINK_TIER[count], summed with every
 * other group and capped by LINK_CAP. No new effect type and no new cap. In a single pool only that pool's members
 * can link; in Mashup, a Martial Artist from any universe links with one from any other.
 *
 * Membership rules:
 *  - `pool` + `name` must be a playable roster entry in that pool. Groups stay selective (at most 10 per pool, except Sorcerers) and
 *    take characters DEFINED by the trait, so the bonus does not become universal (most of Middle-earth carries a
 *    sword; only its signature blade fighters are in Blades & Claws).
 *  - MCU members follow on-screen MCU portrayal; `mua3` (MCU only) records that the MUA3 fan guide lists them.
 *    Comics feats are not copied to an MCU entry.
 *  - Form-based traits count for the base character (owner ruling 2026-11-10), e.g. Zelda through Sheik.
 *  - `basis` is worded no more strongly than its sources.
 *  - `sources` entries are either a web page fetched and read against the basis on 2026-11-18 ({ title, url }), or a
 *    reviewed research record in this repo ({ record, id }) whose text states the trait, plus the page that record
 *    cites (`url`) when that page's own "supports" note names the trait. tests/archetype-groups.test.cjs re-checks
 *    every record reference against the record text.
 *  - `evidence` follows the owner's evidence standard (2026-11-10): 'corroborated' = two independent origins agree;
 *    'credible' = one source documents the trait; 'needs-review' = a source names the detail without placing it in a
 *    work (still a member; flagged for a second source).
 *  - Archetype strength is 1, the same footing as the MCU film chemistry groups (owner ruling 2026-11-18), in every
 *    pool, including Action Movies whose own film groups run at 0.7 (owner confirmed "keep 1 everywhere", 2026-11-19).
 */
(function (root) {
  'use strict';
  const ARCHETYPE_STRENGTH = 1;   // film-group footing (owner ruling 2026-11-18)
  const TAG_STRENGTH = 0.25;      // broad tags: Sorcerers and colours (owner ruling 2026-11-19)
  const PER_POOL_CAP = 10;        // default members per pool per group; a group with perPoolCap: null is uncapped
  const groups = [
    {
      kind: "archetype",
      slug: "martial",
      name: "Martial Artists",
      strength: ARCHETYPE_STRENGTH,
      mua3Affiliation: "Martial Artists",
      members: [
        {
          pool: "mcu",
          name: "Daredevil",
          mua3: true,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: MCU Daredevil",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUDaredevil"
            }
          ],
          basis: "Trained martial artist shown across the Daredevil series."
        },
        {
          pool: "mcu",
          name: "Iron Fist",
          mua3: true,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: MCU Iron Fist",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/MCUIronFist"
            }
          ],
          basis: "K'un-Lun martial arts training shown in the Iron Fist series."
        },
        {
          pool: "mcu",
          name: "Gamora",
          mua3: true,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: MCU Gamora",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/MCUGamora"
            }
          ],
          basis: "Deadly hand-to-hand fighter shown across the Guardians films."
        },
        {
          pool: "mcu",
          name: "Shang-Chi",
          mua3: false,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: MCU Shang-Chi",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/MCUShangChi"
            }
          ],
          basis: "Ten Rings martial arts training shown in Shang-Chi and the Legend of the Ten Rings."
        },
        {
          pool: "mcu",
          name: "Black Widow",
          mua3: false,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: MCU Black Widow",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUBlackWidow"
            }
          ],
          basis: "Red Room hand-to-hand training shown across her MCU appearances."
        },
        {
          pool: "mcu",
          name: "Yelena Belova",
          mua3: false,
          evidence: "corroborated",
          sources: [
            {
              title: "TV Tropes: MCU Yelena Belova",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUYelenaBelova"
            },
            {
              title: "Wikipedia: Yelena Belova (MCU section)",
              url: "https://en.wikipedia.org/wiki/Yelena_Belova"
            }
          ],
          basis: "Red Room-trained fighter shown in Black Widow and Hawkeye."
        },
        {
          pool: "mcu",
          name: "Elektra",
          mua3: false,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: MCU Elektra Natchios",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/MCUElektraNatchios"
            }
          ],
          basis: "Martial artist trained from childhood by the Chaste, shown in Daredevil season 2."
        },
        {
          pool: "mcu",
          name: "Stick",
          mua3: false,
          evidence: "corroborated",
          sources: [
            {
              title: "Wikipedia: Stick (character)",
              url: "https://en.wikipedia.org/wiki/Stick_(character)"
            },
            {
              title: "TV Tropes: MCU Daredevil",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUDaredevil"
            }
          ],
          basis: "Mentor who trains Matt Murdock to fight, shown in Daredevil season 1."
        },
        {
          pool: "dc",
          name: "Batman",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/dc-batch-01.json",
              id: "dc:Batman",
              url: "https://dc.com/characters/batman"
            }
          ],
          basis: "Publisher profile: master of virtually every martial art."
        },
        {
          pool: "dc",
          name: "Cassandra Cain",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042337-4.json",
              id: "dc:Cassandra Cain",
              url: "https://en.wikipedia.org/wiki/Cassandra_Cain"
            }
          ],
          basis: "Martial arts mastery and body-language reading."
        },
        {
          pool: "dc",
          name: "Black Canary",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042317-3.json",
              id: "dc:Black Canary",
              url: "https://en.wikipedia.org/wiki/Black_Canary"
            }
          ],
          basis: "Trained in a long list of martial arts."
        },
        {
          pool: "dc",
          name: "Nightwing",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042507-9.json",
              id: "dc:Nightwing",
              url: "https://en.wikipedia.org/wiki/Nightwing"
            }
          ],
          basis: "Martial arts mastery with escrima sticks."
        },
        {
          pool: "dc",
          name: "Talia al Ghul",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042646-14.json",
              id: "dc:Talia al Ghul",
              url: "https://en.wikipedia.org/wiki/Talia_al_Ghul"
            }
          ],
          basis: "League of Assassins-trained expert martial artist."
        },
        {
          pool: "dc",
          name: "Batgirl (Barbara Gordon)",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/dc-batch-01.json",
              id: "dc:Batgirl (Barbara Gordon)",
              url: "https://weirdsciencedccomics.com/2018/09/retro-review-detective-comics-359-1967.html"
            }
          ],
          basis: "Fights thugs with judo from her first appearance."
        },
        {
          pool: "dc",
          name: "Huntress",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042428-7.json",
              id: "dc:Huntress",
              url: "https://en.wikipedia.org/wiki/Huntress_(Helena_Bertinelli)"
            }
          ],
          basis: "Martial artist and markswoman."
        },
        {
          pool: "dc",
          name: "Deathstroke",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042353-5.json",
              id: "dc:Deathstroke"
            }
          ],
          basis: "Master of martial arts, swords and firearms."
        },
        {
          pool: "games",
          name: "Heihachi Mishima",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/claude-gamesA-20261115-missing.json",
              id: "games:Heihachi Mishima",
              url: "https://en.wikipedia.org/wiki/Heihachi_Mishima"
            }
          ],
          basis: "Fights with Mishima-ryu karate in Tekken."
        },
        {
          pool: "games",
          name: "Jin Kazama",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/claude-gamesA-20261115-missing.json",
              id: "games:Jin Kazama",
              url: "https://en.wikipedia.org/wiki/Jin_Kazama"
            }
          ],
          basis: "Fights with Kazama/Mishima karate, later Kyokushin."
        },
        {
          pool: "games",
          name: "Tifa Lockhart",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-043513-40.json",
              id: "games:Tifa Lockhart",
              url: "https://en.wikipedia.org/wiki/Tifa_Lockhart"
            }
          ],
          basis: "Barehanded martial artist."
        },
        {
          pool: "games",
          name: "Big Boss",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-042852-20.json",
              id: "games:Big Boss",
              url: "https://metalgear.fandom.com/wiki/Big_Boss"
            }
          ],
          basis: "Master of CQC close-quarters combat."
        },
        {
          pool: "games",
          name: "Liu Kang",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-043204-30.json",
              id: "games:Liu Kang"
            }
          ],
          basis: "Shaolin martial artist and Mortal Kombat champion."
        },
        {
          pool: "games",
          name: "Ryu",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-043356-36.json",
              id: "games:Ryu"
            }
          ],
          basis: "Wandering Ansatsuken martial artist."
        },
        {
          pool: "games",
          name: "Sub-Zero",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-043457-39.json",
              id: "games:Sub-Zero"
            }
          ],
          basis: "Combines martial arts with cryomancy."
        },
        {
          pool: "starwars",
          name: "Chirrut Îmwe",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-starwars-20261113-125432-33.json",
              id: "starwars:Chirrut Îmwe"
            }
          ],
          basis: "Expert martial artist with staff, shown in Rogue One."
        },
        {
          pool: "starwars",
          name: "Qi'ra",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-starwars-20261113-125623-39.json",
              id: "starwars:Qi'ra",
              url: "https://starwars.fandom.com/wiki/Qi%27ra"
            }
          ],
          basis: "Crimson Dawn-trained in Teräs Käsi combat."
        },
        {
          pool: "starwars",
          name: "Darth Maul",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-starwars-20261113-125432-33.json",
              id: "starwars:Darth Maul"
            }
          ],
          basis: "Combines acrobatic martial arts with lightsaber combat."
        },
        {
          pool: "toons",
          name: "Po",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-130005-52.json",
              id: "toons:Po",
              url: "https://en.wikipedia.org/wiki/Kung_Fu_Panda_(franchise)"
            }
          ],
          basis: "Kung fu master, the Dragon Warrior."
        },
        {
          pool: "toons",
          name: "Tigress",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-130234-59.json",
              id: "toons:Tigress",
              url: "https://kungfupanda.fandom.com/wiki/Tigress"
            }
          ],
          basis: "Tiger Style kung fu master."
        },
        {
          pool: "toons",
          name: "Master Shifu",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-125849-48.json",
              id: "toons:Master Shifu",
              url: "https://en.wikipedia.org/wiki/Master_Shifu"
            }
          ],
          basis: "Kung fu master and teacher."
        },
        {
          pool: "toons",
          name: "Master Splinter",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-125849-48.json",
              id: "toons:Master Splinter",
              url: "https://en.wikipedia.org/wiki/Splinter_(Teenage_Mutant_Ninja_Turtles)"
            }
          ],
          basis: "Ninjutsu master."
        },
        {
          pool: "toons",
          name: "Leonardo",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-125830-47.json",
              id: "toons:Leonardo",
              url: "https://en.wikipedia.org/wiki/Leonardo_(Teenage_Mutant_Ninja_Turtles)"
            }
          ],
          basis: "Ninjutsu-trained Turtle."
        },
        {
          pool: "toons",
          name: "Raphael",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261114-002721-1.json",
              id: "toons:Raphael"
            }
          ],
          basis: "Highly trained ninjutsu practitioner."
        },
        {
          pool: "toons",
          name: "Sandy Cheeks",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261114-002721-1.json",
              id: "toons:Sandy Cheeks",
              url: "https://en.wikipedia.org/wiki/Sandy_Cheeks"
            }
          ],
          basis: "Karate expert."
        },
        {
          pool: "toons",
          name: "SpongeBob SquarePants",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-130214-58.json",
              id: "toons:SpongeBob SquarePants",
              url: "https://en.wikipedia.org/wiki/SpongeBob_SquarePants_(character)"
            }
          ],
          basis: "Karate is a running skill of his."
        },
        {
          pool: "muppets",
          name: "Miss Piggy",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-muppets-20261113-064410-29.json",
              id: "muppets:Miss Piggy",
              url: "https://en.wikipedia.org/wiki/Miss_Piggy"
            }
          ],
          basis: "Signature karate chop."
        },
        {
          pool: "pokemon",
          name: "Machop",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-pokemon-20261113-065817-73.json",
              id: "pokemon:Machop"
            }
          ],
          basis: "Fighting-type that trains in close-range martial arts."
        },
        {
          pool: "pokemon",
          name: "Machoke",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-pokemon-20261113-065817-73.json",
              id: "pokemon:Machoke"
            }
          ],
          basis: "Fighting-type using martial arts strikes."
        },
        {
          pool: "pokemon",
          name: "Machamp",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-pokemon-20261113-065653-70.json",
              id: "pokemon:Machamp"
            }
          ],
          basis: "Four-armed martial arts master."
        },
        {
          pool: "pokemon",
          name: "Hitmonchan",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-pokemon-20261113-125125-21.json",
              id: "pokemon:Hitmonchan"
            }
          ],
          basis: "Fighting-type specialising in boxing technique."
        },
        {
          pool: "pokemon",
          name: "Primeape",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-pokemon-20261113-125224-25.json",
              id: "pokemon:Primeape"
            }
          ],
          basis: "Fighting-type attacking with martial arts strikes."
        },
        {
          pool: "pokemon",
          name: "Mankey",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-pokemon-20261113-065817-73.json",
              id: "pokemon:Mankey"
            }
          ],
          basis: "Fighting-type with swift martial arts strikes."
        },
        {
          pool: "pokemon",
          name: "Poliwrath",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-pokemon-20261113-125209-24.json",
              id: "pokemon:Poliwrath"
            }
          ],
          basis: "Water/Fighting-type with martial arts strikes."
        },
        {
          pool: "actionmovies",
          name: "Lee",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Enter the Dragon",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Film/EnterTheDragon"
            }
          ],
          basis: "Shaolin-trained fighter who dominates the tournament in Enter the Dragon."
        },
        {
          pool: "actionmovies",
          name: "Rama",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: The Raid characters",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/TheRaid"
            }
          ],
          basis: "Fights through the tower with martial arts in The Raid."
        },
        {
          pool: "actionmovies",
          name: "Mad Dog",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: The Raid characters",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/TheRaid"
            }
          ],
          basis: "Bare-knuckle hand-to-hand fighter in The Raid."
        },
        {
          pool: "actionmovies",
          name: "Li Mu Bai",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Crouching Tiger, Hidden Dragon",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Film/CrouchingTigerHiddenDragon"
            }
          ],
          basis: "Master swordsman and martial artist in Crouching Tiger, Hidden Dragon."
        },
        {
          pool: "actionmovies",
          name: "Jen Yu",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Crouching Tiger, Hidden Dragon",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Film/CrouchingTigerHiddenDragon"
            }
          ],
          basis: "Gifted kung fu fighter in Crouching Tiger, Hidden Dragon."
        },
        {
          pool: "actionmovies",
          name: "The Bride (Beatrix Kiddo)",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Kill Bill",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Film/KillBill"
            }
          ],
          basis: "Martial arts learned from Pai Mei, shown in Kill Bill."
        },
        {
          pool: "actionmovies",
          name: "Neo",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: The Matrix",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Film/TheMatrix"
            }
          ],
          basis: "Learns martial arts by upload and spars with Morpheus in The Matrix."
        },
        {
          pool: "actionmovies",
          name: "John Wick",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: John Wick",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Film/JohnWick"
            }
          ],
          basis: "Mixes judo and jiu-jitsu with gunfighting in John Wick."
        }
      ]
    },
    {
      kind: "archetype",
      slug: "agile",
      name: "Agile Fighters",
      strength: ARCHETYPE_STRENGTH,
      mua3Affiliation: "Agile Fighters",
      members: [
        {
          pool: "mcu",
          name: "Spider-Man",
          mua3: true,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: MCU Spider-Man",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUSpiderMan"
            }
          ],
          basis: "Wall-crawling, web-swinging acrobatic fighter shown across the MCU films."
        },
        {
          pool: "mcu",
          name: "Black Panther",
          mua3: true,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: MCU T'Challa",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUTChalla"
            }
          ],
          basis: "Parkour-style acrobatic combat shown in Black Panther."
        },
        {
          pool: "mcu",
          name: "Black Widow",
          mua3: true,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: MCU Black Widow",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUBlackWidow"
            }
          ],
          basis: "Flips-and-slides acrobatic fighting style shown across the MCU films."
        },
        {
          pool: "mcu",
          name: "Daredevil",
          mua3: true,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: MCU Daredevil",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUDaredevil"
            }
          ],
          basis: "Parkour and acrobatic corridor fighting shown in the Daredevil series."
        },
        {
          pool: "mcu",
          name: "Iron Fist",
          mua3: true,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: MCU Iron Fist",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/MCUIronFist"
            }
          ],
          basis: "Parkour and free-running combat shown in the Iron Fist series."
        },
        {
          pool: "mcu",
          name: "Hawkeye",
          mua3: true,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: MCU Hawkeye",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUHawkeye"
            }
          ],
          basis: "Acrobatic fighting shown in the Hawkeye series."
        },
        {
          pool: "dc",
          name: "Nightwing",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042507-9.json",
              id: "dc:Nightwing",
              url: "https://en.wikipedia.org/wiki/Nightwing"
            }
          ],
          basis: "Acrobatic former Robin."
        },
        {
          pool: "dc",
          name: "Catwoman",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042337-4.json",
              id: "dc:Catwoman",
              url: "https://en.wikipedia.org/wiki/Catwoman"
            }
          ],
          basis: "Expert burglar and gymnast."
        },
        {
          pool: "dc",
          name: "Cassandra Cain",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042337-4.json",
              id: "dc:Cassandra Cain"
            }
          ],
          basis: "Acrobatic runner and fighter."
        },
        {
          pool: "dc",
          name: "Black Canary",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042317-3.json",
              id: "dc:Black Canary"
            }
          ],
          basis: "Exceptional acrobatic evasion."
        },
        {
          pool: "dc",
          name: "Robin (Damian Wayne)",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042545-11.json",
              id: "dc:Robin (Damian Wayne)"
            }
          ],
          basis: "League-trained in swordsmanship and acrobatics."
        },
        {
          pool: "dc",
          name: "Harley Quinn",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042428-7.json",
              id: "dc:Harley Quinn"
            }
          ],
          basis: "Gymnast agility in erratic melee combat."
        },
        {
          pool: "dc",
          name: "Mister Miracle",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042507-9.json",
              id: "dc:Mister Miracle"
            }
          ],
          basis: "Escape artist with exceptional acrobatics."
        },
        {
          pool: "dc",
          name: "Batwoman",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042258-2.json",
              id: "dc:Batwoman"
            }
          ],
          basis: "Evasive acrobatics."
        },
        {
          pool: "games",
          name: "Altaïr",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-042833-19.json",
              id: "games:Altaïr",
              url: "https://assassinscreed.fandom.com/wiki/Altair_Ibn-La'Ahad"
            }
          ],
          basis: "Free-running Assassin."
        },
        {
          pool: "games",
          name: "Ezio Auditore",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-043003-24.json",
              id: "games:Ezio Auditore"
            }
          ],
          basis: "Rooftop free-running escapes."
        },
        {
          pool: "games",
          name: "Zelda",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-043527-41.json",
              id: "games:Zelda|Sheik (Princess Zelda)"
            }
          ],
          basis: "Acrobatic dodging in her Sheik form (form-based ability counts for the base character)."
        },
        {
          pool: "games",
          name: "Dante",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-042927-22.json",
              id: "games:Dante"
            }
          ],
          basis: "Trickster style built on dodging and agility."
        },
        {
          pool: "games",
          name: "Sly Cooper",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-043415-37.json",
              id: "games:Sly Cooper"
            }
          ],
          basis: "Master thief built on stealth and acrobatics."
        },
        {
          pool: "games",
          name: "Nathan Drake",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-043234-32.json",
              id: "games:Nathan Drake"
            }
          ],
          basis: "Free-running and climbing."
        },
        {
          pool: "games",
          name: "Sam Fisher",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-043356-36.json",
              id: "games:Sam Fisher"
            }
          ],
          basis: "Climbing and parkour movement."
        },
        {
          pool: "starwars",
          name: "Ahsoka Tano",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-starwars-20261113-125351-31.json",
              id: "starwars:Ahsoka Tano"
            }
          ],
          basis: "High acrobatic mobility with reverse-grip lightsabers."
        },
        {
          pool: "starwars",
          name: "Yoda",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-starwars-20261113-125653-41.json",
              id: "starwars:Yoda"
            }
          ],
          basis: "Swift acrobatic lightsaber style."
        },
        {
          pool: "starwars",
          name: "Darth Maul",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-starwars-20261113-125432-33.json",
              id: "starwars:Darth Maul"
            }
          ],
          basis: "Acrobatic martial arts with a double-bladed lightsaber."
        },
        {
          pool: "starwars",
          name: "Anakin Skywalker",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-starwars-20261113-125351-31.json",
              id: "starwars:Anakin Skywalker"
            }
          ],
          basis: "Acrobatic leaps in combat."
        },
        {
          pool: "starwars",
          name: "Cal Kestis",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-starwars-20261113-125410-32.json",
              id: "starwars:Cal Kestis"
            }
          ],
          basis: "Agile acrobatic movement in lightsaber combat."
        },
        {
          pool: "starwars",
          name: "Asajj Ventress",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-starwars-20261113-125351-31.json",
              id: "starwars:Asajj Ventress"
            }
          ],
          basis: "Acrobatic evasion."
        },
        {
          pool: "starwars",
          name: "Aayla Secura",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-starwars-20261113-125351-31.json",
              id: "starwars:Aayla Secura"
            }
          ],
          basis: "Relies on acrobatic movement in combat."
        },
        {
          pool: "starwars",
          name: "Ezra Bridger",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-starwars-20261113-125505-35.json",
              id: "starwars:Ezra Bridger"
            }
          ],
          basis: "Agile evasion and acrobatics."
        },
        {
          pool: "toons",
          name: "Aang",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-125710-42.json",
              id: "toons:Aang"
            }
          ],
          basis: "Evasive, agile Air Nomad combat."
        },
        {
          pool: "toons",
          name: "Zuko",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-130246-60.json",
              id: "toons:Zuko"
            }
          ],
          basis: "Acrobatic agility, most of all as the Blue Spirit."
        },
        {
          pool: "toons",
          name: "Puss in Boots",
          evidence: "corroborated",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261114-002721-1.json",
              id: "toons:Puss in Boots"
            },
            {
              title: "TV Tropes: Shrek main characters",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/ShrekMainCharacters"
            }
          ],
          basis: "Agile acrobat and rapier fighter."
        },
        {
          pool: "toons",
          name: "Tarzan",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-130214-58.json",
              id: "toons:Tarzan",
              url: "https://en.wikipedia.org/wiki/Tarzan"
            }
          ],
          basis: "Jungle-raised agility."
        },
        {
          pool: "toons",
          name: "Aladdin",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-125710-42.json",
              id: "toons:Aladdin",
              url: "https://en.wikipedia.org/wiki/Aladdin_(Disney_character)"
            }
          ],
          basis: "Relies on wit and agility."
        },
        {
          pool: "toons",
          name: "Esmeralda",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-125759-45.json",
              id: "toons:Esmeralda",
              url: "https://en.wikipedia.org/wiki/Esmeralda_(The_Hunchback_of_Notre_Dame)"
            }
          ],
          basis: "Acrobatic street performer."
        },
        {
          pool: "lotr",
          name: "Legolas",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-lotr-20261113-044155-63.json",
              id: "lotr:Legolas"
            }
          ],
          basis: "Superhuman Elven agility as archer and scout."
        },
        {
          pool: "actionmovies",
          name: "Li Mu Bai",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Crouching Tiger, Hidden Dragon",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Film/CrouchingTigerHiddenDragon"
            }
          ],
          basis: "Wire-fu leaps and wall jumps in Crouching Tiger, Hidden Dragon."
        },
        {
          pool: "actionmovies",
          name: "Jen Yu",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Crouching Tiger, Hidden Dragon",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Film/CrouchingTigerHiddenDragon"
            }
          ],
          basis: "Combat parkour, wall jumps and water-walking in Crouching Tiger, Hidden Dragon."
        },
        {
          pool: "actionmovies",
          name: "Yu Shu Lien",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Crouching Tiger, Hidden Dragon",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Film/CrouchingTigerHiddenDragon"
            }
          ],
          basis: "Roof-hopping and wall jumps in Crouching Tiger, Hidden Dragon."
        }
      ]
    },
    {
      kind: "archetype",
      slug: "blades",
      name: "Blades & Claws",
      strength: ARCHETYPE_STRENGTH,
      mua3Affiliation: "Cutting Edge",
      members: [
        {
          pool: "mcu",
          name: "Wolverine",
          mua3: true,
          evidence: "credible",
          sources: [
            {
              title: "MCU Wiki: Wolverine",
              url: "https://marvelcinematicuniverse.fandom.com/wiki/Wolverine"
            }
          ],
          basis: "Retractable adamantium claws shown in Deadpool & Wolverine."
        },
        {
          pool: "mcu",
          name: "Deadpool",
          mua3: true,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Deadpool (X-Men film series)",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/XMenFilmSeriesDeadpool"
            }
          ],
          basis: "Twin katanas shown in the Deadpool films."
        },
        {
          pool: "mcu",
          name: "Drax",
          mua3: true,
          evidence: "corroborated",
          sources: [
            {
              title: "TV Tropes: MCU Drax the Destroyer",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/MCUDraxTheDestroyer"
            },
            {
              title: "MCU Wiki: Drax the Destroyer",
              url: "https://marvelcinematicuniverse.fandom.com/wiki/Drax_the_Destroyer"
            }
          ],
          basis: "Twin knives shown in the Guardians films."
        },
        {
          pool: "mcu",
          name: "Gamora",
          mua3: true,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: MCU Gamora",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/MCUGamora"
            }
          ],
          basis: "Signature sword shown in the Guardians films."
        },
        {
          pool: "mcu",
          name: "Black Panther",
          mua3: true,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: MCU T'Challa",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUTChalla"
            }
          ],
          basis: "Vibranium suit claws shown in Black Panther."
        },
        {
          pool: "mcu",
          name: "Killmonger",
          mua3: false,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: MCU Erik Stevens",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUErikStevens"
            }
          ],
          basis: "Vibranium suit claws shown in Black Panther."
        },
        {
          pool: "mcu",
          name: "Elektra",
          mua3: false,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: MCU Elektra Natchios",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/MCUElektraNatchios"
            }
          ],
          basis: "Sai-wielding fighter shown in Daredevil season 2."
        },
        {
          pool: "mcu",
          name: "Valkyrie",
          mua3: false,
          evidence: "needs-review",
          sources: [
            {
              title: "Marvel Codex: Valkyrie (MCU)",
              url: "https://marvelcodex.com/valkyrie_mcu"
            }
          ],
          basis: "Wields a sword she calls Dragonfang per one community wiki; no film or scene named."
        },
        {
          pool: "dc",
          name: "Wonder Woman",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042710-15.json",
              id: "dc:Wonder Woman",
              url: "https://dc.fandom.com/wiki/Wonder_Woman_(Diana_Prince)"
            }
          ],
          basis: "Hephaestus-forged sword."
        },
        {
          pool: "dc",
          name: "Catwoman",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042337-4.json",
              id: "dc:Catwoman",
              url: "https://en.wikipedia.org/wiki/Catwoman"
            }
          ],
          basis: "Fights with whip and claws."
        },
        {
          pool: "dc",
          name: "Cheetah",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042337-4.json",
              id: "dc:Cheetah",
              url: "https://en.wikipedia.org/wiki/Cheetah_(DC_Comics)"
            }
          ],
          basis: "Claws that cut Kryptonian skin."
        },
        {
          pool: "dc",
          name: "Talia al Ghul",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042646-14.json",
              id: "dc:Talia al Ghul",
              url: "https://en.wikipedia.org/wiki/Talia_al_Ghul"
            }
          ],
          basis: "Expert swordswoman."
        },
        {
          pool: "dc",
          name: "Deathstroke",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042353-5.json",
              id: "dc:Deathstroke"
            }
          ],
          basis: "Master of swords, knives and martial arts."
        },
        {
          pool: "dc",
          name: "Ra's al Ghul",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042526-10.json",
              id: "dc:Ra's al Ghul"
            }
          ],
          basis: "Exceptional swordsmanship."
        },
        {
          pool: "dc",
          name: "Killer Croc",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042447-8.json",
              id: "dc:Killer Croc"
            }
          ],
          basis: "Sharp claws and teeth."
        },
        {
          pool: "games",
          name: "Link",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-043148-29.json",
              id: "games:Link",
              url: "https://www.zeldadungeon.net/wiki/Link_(Breath_of_the_Wild)"
            }
          ],
          basis: "Extremely capable swordsman."
        },
        {
          pool: "games",
          name: "Cloud Strife",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-042927-22.json",
              id: "games:Cloud Strife",
              url: "https://squareenix.fandom.com/wiki/Cloud_Strife"
            }
          ],
          basis: "Enormous sword that can cut almost anything in two."
        },
        {
          pool: "games",
          name: "Sephiroth",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-043415-37.json",
              id: "games:Sephiroth"
            }
          ],
          basis: "Master swordsman with the Masamune."
        },
        {
          pool: "games",
          name: "Geralt of Rivia",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-043022-25.json",
              id: "games:Geralt of Rivia",
              url: "https://witcher-games.gamepedia.com/The_Witcher_3_skills"
            }
          ],
          basis: "Witcher sword fighting."
        },
        {
          pool: "games",
          name: "Kratos",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-043148-29.json",
              id: "games:Kratos",
              url: "https://en.wikipedia.org/wiki/Kratos_(God_of_War)"
            }
          ],
          basis: "Blades of Chaos and the Leviathan Axe."
        },
        {
          pool: "games",
          name: "Dante",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-042927-22.json",
              id: "games:Dante"
            }
          ],
          basis: "Swordmaster style."
        },
        {
          pool: "games",
          name: "Meta Knight",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-043219-31.json",
              id: "games:Meta Knight",
              url: "https://wikirby.com/wiki/Meta_Knight"
            }
          ],
          basis: "Wields the sword Galaxia."
        },
        {
          pool: "games",
          name: "Raiden",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-063918-11.json",
              id: "games:Raiden",
              url: "https://en.wikipedia.org/wiki/Raiden_(Metal_Gear)"
            }
          ],
          basis: "Cyborg ninja with high-frequency swords."
        },
        {
          pool: "lotr",
          name: "Aragorn",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-lotr-20261113-043920-55.json",
              id: "lotr:Aragorn"
            }
          ],
          basis: "Fights with the sword Andúril."
        },
        {
          pool: "lotr",
          name: "Túrin Turambar",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-lotr-20261113-044303-67.json",
              id: "lotr:Túrin Turambar"
            }
          ],
          basis: "Armed with the black sword Gurthang."
        },
        {
          pool: "lotr",
          name: "Gimli",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-lotr-20261113-044119-61.json",
              id: "lotr:Gimli"
            }
          ],
          basis: "Dwarf axe-fighter."
        },
        {
          pool: "lotr",
          name: "Thorin Oakenshield",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/claude-lotr-20261115-missing.json",
              id: "lotr:Thorin Oakenshield"
            }
          ],
          basis: "Wields the Elven sword Orcrist."
        },
        {
          pool: "lotr",
          name: "Boromir",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-lotr-20261113-043957-57.json",
              id: "lotr:Boromir"
            }
          ],
          basis: "Sword and shield fighter."
        },
        {
          pool: "lotr",
          name: "Glorfindel",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-lotr-20261113-044119-61.json",
              id: "lotr:Glorfindel"
            }
          ],
          basis: "Peerless swordsmanship."
        },
        {
          pool: "lotr",
          name: "Éowyn",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-lotr-20261113-044016-58.json",
              id: "lotr:Éowyn"
            }
          ],
          basis: "Sword and shield fighter who slew the Witch-king."
        },
        {
          pool: "lotr",
          name: "Beleg Cúthalion",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-lotr-20261113-043937-56.json",
              id: "lotr:Beleg Cúthalion"
            }
          ],
          basis: "Bears the sword Anglachel."
        },
        {
          pool: "starwars",
          name: "Darth Maul",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-starwars-20261113-125432-33.json",
              id: "starwars:Darth Maul",
              url: "https://en.wikipedia.org/wiki/Maul_(Star_Wars)"
            }
          ],
          basis: "Double-bladed lightsaber duelist."
        },
        {
          pool: "starwars",
          name: "Count Dooku",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-starwars-20261113-125432-33.json",
              id: "starwars:Count Dooku",
              url: "https://en.wikipedia.org/wiki/Count_Dooku"
            }
          ],
          basis: "Renowned lightsaber combat style."
        },
        {
          pool: "starwars",
          name: "General Grievous",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-starwars-20261113-125505-35.json",
              id: "starwars:General Grievous",
              url: "https://en.wikipedia.org/wiki/General_Grievous"
            }
          ],
          basis: "Cyborg multi-lightsaber fighter."
        },
        {
          pool: "starwars",
          name: "Ahsoka Tano",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-starwars-20261113-125351-31.json",
              id: "starwars:Ahsoka Tano",
              url: "https://starwars.fandom.com/wiki/Ahsoka_Tano"
            }
          ],
          basis: "Dual-lightsaber fighter."
        },
        {
          pool: "starwars",
          name: "Mace Windu",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-starwars-20261113-125604-38.json",
              id: "starwars:Mace Windu",
              url: "https://starwars.fandom.com/wiki/Mace_Windu"
            }
          ],
          basis: "Vaapad lightsaber master."
        },
        {
          pool: "starwars",
          name: "Asajj Ventress",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-starwars-20261113-125351-31.json",
              id: "starwars:Asajj Ventress",
              url: "https://starwars.fandom.com/wiki/Asajj_Ventress"
            }
          ],
          basis: "Dual curved lightsabers."
        },
        {
          pool: "starwars",
          name: "Yoda",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-starwars-20261113-125653-41.json",
              id: "starwars:Yoda",
              url: "https://starwars.fandom.com/wiki/Yoda"
            }
          ],
          basis: "Lightsaber feats against Sith Lords."
        },
        {
          pool: "starwars",
          name: "Obi-Wan Kenobi",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-starwars-20261113-125604-38.json",
              id: "starwars:Obi-Wan Kenobi"
            }
          ],
          basis: "Soresu lightsaber master."
        },
        {
          pool: "toons",
          name: "Leonardo",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-125830-47.json",
              id: "toons:Leonardo"
            }
          ],
          basis: "Twin ninjato swords."
        },
        {
          pool: "toons",
          name: "Raphael",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261114-002721-1.json",
              id: "toons:Raphael"
            }
          ],
          basis: "Twin sai."
        },
        {
          pool: "toons",
          name: "Puss in Boots",
          evidence: "corroborated",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261114-002721-1.json",
              id: "toons:Puss in Boots"
            },
            {
              title: "TV Tropes: Shrek main characters",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/ShrekMainCharacters"
            }
          ],
          basis: "Master swordsman with a rapier."
        },
        {
          pool: "toons",
          name: "Captain Hook",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-125743-44.json",
              id: "toons:Captain Hook"
            }
          ],
          basis: "Rapier and hook hand."
        },
        {
          pool: "toons",
          name: "Mulan",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-125949-51.json",
              id: "toons:Mulan"
            }
          ],
          basis: "Jian swordplay."
        },
        {
          pool: "toons",
          name: "Shan Yu",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-130159-57.json",
              id: "toons:Shan Yu"
            }
          ],
          basis: "Expert swordsmanship."
        },
        {
          pool: "toons",
          name: "Zuko",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-130246-60.json",
              id: "toons:Zuko|Blue Spirit Zuko",
              url: "https://en.wikipedia.org/wiki/Zuko"
            }
          ],
          basis: "Dual broadswords as the Blue Spirit (form-based skill counts for the base character)."
        },
        {
          pool: "toons",
          name: "Sokka",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-130159-57.json",
              id: "toons:Sokka",
              url: "https://en.wikipedia.org/wiki/Sokka"
            }
          ],
          basis: "Sword and boomerang fighter."
        },
        {
          pool: "harrypotter",
          name: "Godric Gryffindor",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043659-46.json",
              id: "harrypotter:Godric Gryffindor",
              url: "https://www.harrypotter.com/features/famous-gryffindors-through-the-ages"
            }
          ],
          basis: "Famed dueller whose sword is a treasured artefact."
        },
        {
          pool: "harrypotter",
          name: "Neville Longbottom",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043802-50.json",
              id: "harrypotter:Neville Longbottom"
            }
          ],
          basis: "Wields the Sword of Gryffindor in battle."
        },
        {
          pool: "harrypotter",
          name: "Harry Potter",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043716-47.json",
              id: "harrypotter:Harry Potter"
            }
          ],
          basis: "Killed the Basilisk with the Sword of Gryffindor."
        },
        {
          pool: "pokemon",
          name: "Scyther",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-pokemon-20261113-125241-26.json",
              id: "pokemon:Scyther",
              url: "https://bulbapedia.bulbagarden.net/wiki/Scyther_(Pok%C3%A9mon)"
            }
          ],
          basis: "Scythe-armed Bug-type."
        },
        {
          pool: "pokemon",
          name: "Kabutops",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-pokemon-20261113-065635-69.json",
              id: "pokemon:Kabutops",
              url: "https://bulbapedia.bulbagarden.net/wiki/Kabutops_(Pok%C3%A9mon)"
            }
          ],
          basis: "Scythe arms."
        },
        {
          pool: "pokemon",
          name: "Farfetch'd",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-pokemon-20261113-065312-60.json",
              id: "pokemon:Farfetch'd"
            }
          ],
          basis: "Uses its leek stalk as a sword."
        },
        {
          pool: "pokemon",
          name: "Sandslash",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-pokemon-20261113-125241-26.json",
              id: "pokemon:Sandslash"
            }
          ],
          basis: "Massive sharp claws for slashing."
        },
        {
          pool: "actionmovies",
          name: "The Bride (Beatrix Kiddo)",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Kill Bill",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Film/KillBill"
            }
          ],
          basis: "Hattori Hanzo katana in Kill Bill."
        },
        {
          pool: "actionmovies",
          name: "O-Ren Ishii",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Kill Bill",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Film/KillBill"
            }
          ],
          basis: "Iaijutsu swordswoman in Kill Bill."
        },
        {
          pool: "actionmovies",
          name: "Li Mu Bai",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Crouching Tiger, Hidden Dragon",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Film/CrouchingTigerHiddenDragon"
            }
          ],
          basis: "Wields the Green Destiny sword."
        },
        {
          pool: "actionmovies",
          name: "Jen Yu",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Crouching Tiger, Hidden Dragon",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Film/CrouchingTigerHiddenDragon"
            }
          ],
          basis: "Fights with the stolen Green Destiny."
        },
        {
          pool: "actionmovies",
          name: "Katsumoto",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: The Last Samurai characters",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/TheLastSamurai"
            }
          ],
          basis: "Master swordsman with katana and wakizashi."
        },
        {
          pool: "actionmovies",
          name: "Ujio",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: The Last Samurai characters",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/TheLastSamurai"
            }
          ],
          basis: "The samurai's sword instructor."
        },
        {
          pool: "actionmovies",
          name: "Nathan Algren",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: The Last Samurai characters",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/TheLastSamurai"
            }
          ],
          basis: "Trains into a dual-wielding swordsman."
        },
        {
          pool: "actionmovies",
          name: "Ardeth Bay",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: The Mummy (1999) characters",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/TheMummy1999"
            }
          ],
          basis: "Dual-wields curved Medjai blades."
        }
      ]
    },
    {
      kind: "archetype",
      slug: "antiheroes",
      name: "Anti-Heroes",
      strength: ARCHETYPE_STRENGTH,
      mua3Affiliation: "Anti-Heroes",
      members: [
        {
          pool: "mcu",
          name: "Deadpool",
          mua3: true,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Deadpool (X-Men film series)",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/XMenFilmSeriesDeadpool"
            }
          ],
          basis: "Mercenary anti-hero with a warped moral code, shown in the Deadpool films."
        },
        {
          pool: "mcu",
          name: "Wolverine",
          mua3: true,
          evidence: "credible",
          sources: [
            {
              title: "MCU Wiki: Wolverine",
              url: "https://marvelcinematicuniverse.fandom.com/wiki/Wolverine"
            }
          ],
          basis: "Gruff, violent loner who reluctantly teams up, shown in Deadpool & Wolverine."
        },
        {
          pool: "mcu",
          name: "The Punisher",
          mua3: false,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: MCU The Punisher",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/MCUThePunisher"
            }
          ],
          basis: "Lethal vigilante shown in Daredevil season 2 and The Punisher."
        },
        {
          pool: "mcu",
          name: "Moon Knight",
          mua3: false,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: MCU Moon Knight",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/MCUMoonKnight"
            }
          ],
          basis: "Brutal, lethal vigilante shown in the Moon Knight series."
        },
        {
          pool: "mcu",
          name: "Winter Soldier",
          mua3: false,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: MCU Bucky Barnes",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUBuckyBarnes"
            }
          ],
          basis: "Brainwashed HYDRA assassin turned atoning ally, shown across the MCU films."
        },
        {
          pool: "dc",
          name: "Red Hood",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042526-10.json",
              id: "dc:Red Hood"
            }
          ],
          basis: "Brutal vigilante and former Robin."
        },
        {
          pool: "dc",
          name: "Huntress",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042428-7.json",
              id: "dc:Huntress"
            }
          ],
          basis: "Lethal, uncompromising vigilante."
        },
        {
          pool: "dc",
          name: "Peacemaker",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/claude-dc-20261114-01.json",
              id: "dc:Peacemaker"
            }
          ],
          basis: "Non-powered soldier-vigilante."
        },
        {
          pool: "dc",
          name: "Lobo",
          evidence: "corroborated",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042447-8.json",
              id: "dc:Lobo",
              url: "https://en.wikipedia.org/wiki/L.E.G.I.O.N."
            },
            {
              title: "Wikiwand (Wikipedia): Lobo (DC Comics)",
              url: "https://www.wikiwand.com/en/articles/Lobo_(DC_Comics)"
            }
          ],
          basis: "Antihero bounty hunter created to parody grim 1990s anti-heroes."
        },
        {
          pool: "games",
          name: "Kratos",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Kratos (Greek era)",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/GodOfWarSeriesKratosGreekEra"
            }
          ],
          basis: "Byronic anti-hero of the Greek-era games."
        },
        {
          pool: "games",
          name: "Cloud Strife",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-042927-22.json",
              id: "games:Cloud Strife",
              url: "https://squareenix.fandom.com/wiki/Cloud_Strife"
            }
          ],
          basis: "Mercenary \"who will take any job\"."
        },
        {
          pool: "starwars",
          name: "Han Solo",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Star Wars Rebel heroes",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/StarWarsRebelHeroes"
            }
          ],
          basis: "Roguish smuggler, in it for the money at first."
        },
        {
          pool: "starwars",
          name: "The Mandalorian",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-starwars-20261113-125640-40.json",
              id: "starwars:The Mandalorian"
            }
          ],
          basis: "Battle-hardened bounty hunter."
        },
        {
          pool: "starwars",
          name: "Boba Fett",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-starwars-20261113-125410-32.json",
              id: "starwars:Boba Fett"
            }
          ],
          basis: "Legendary bounty hunter."
        },
        {
          pool: "starwars",
          name: "Migs Mayfeld",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-starwars-20261113-125604-38.json",
              id: "starwars:Migs Mayfeld"
            }
          ],
          basis: "Cynical ex-Imperial turned mercenary."
        },
        {
          pool: "toons",
          name: "Rick Sanchez",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Rick Sanchez",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/RickAndMortyRickSanchez"
            }
          ],
          basis: "Amoral, nihilistic anti-hero."
        },
        {
          pool: "toons",
          name: "Shrek",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Shrek main characters",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/ShrekMainCharacters"
            }
          ],
          basis: "Grumpy ogre who starts as an anti-hero."
        },
        {
          pool: "toons",
          name: "Zuko",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-130246-60.json",
              id: "toons:Zuko|Blue Spirit Zuko"
            }
          ],
          basis: "Silent vigilante as the Blue Spirit (form counts for the base character)."
        },
        {
          pool: "actionmovies",
          name: "John Wick",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: John Wick",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Film/JohnWick"
            }
          ],
          basis: "Morally grey retired hitman on a revenge rampage."
        },
        {
          pool: "actionmovies",
          name: "Max Rockatansky",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Mad Max: Fury Road characters",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/MadMaxFuryRoad"
            }
          ],
          basis: "Self-interested loner survivor in Fury Road."
        },
        {
          pool: "actionmovies",
          name: "Imperator Furiosa",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Mad Max: Fury Road characters",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/MadMaxFuryRoad"
            }
          ],
          basis: "Ruthless rescuer driven partly by revenge on Immortan Joe."
        },
        {
          pool: "actionmovies",
          name: "John Rambo",
          evidence: "corroborated",
          sources: [
            {
              title: "Wikipedia: John Rambo",
              url: "https://en.wikipedia.org/wiki/John_Rambo"
            },
            {
              title: "Crooked Marquee: How Rambo Turned a Complicated Antihero into Agitprop",
              url: "https://crookedmarquee.com/how-rambo-turned-a-complicated-antihero-into-agitprop/"
            }
          ],
          basis: "Traumatized veteran who fights the police in First Blood."
        }
      ]
    },
    {
      kind: "archetype",
      slug: "quips",
      name: "Wisecracking Warriors",
      strength: ARCHETYPE_STRENGTH,
      mua3Affiliation: "Wise Cracking Warriors",
      members: [
        {
          pool: "mcu",
          name: "Deadpool",
          mua3: true,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Deadpool (X-Men film series)",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/XMenFilmSeriesDeadpool"
            }
          ],
          basis: "Constant jokes and fourth-wall breaks shown in the Deadpool films."
        },
        {
          pool: "mcu",
          name: "Rocket",
          mua3: true,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: MCU Guardians of the Galaxy",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUGuardiansOfTheGalaxy"
            }
          ],
          basis: "Sarcastic quips shown throughout the Guardians films."
        },
        {
          pool: "mcu",
          name: "Star-Lord",
          mua3: true,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: MCU Guardians of the Galaxy",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUGuardiansOfTheGalaxy"
            }
          ],
          basis: "Jokey talk-his-way-out style shown throughout the Guardians films."
        },
        {
          pool: "mcu",
          name: "Spider-Man",
          mua3: false,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: MCU Spider-Man",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUSpiderMan"
            }
          ],
          basis: "Talks and quips through fights, shown across the MCU films."
        },
        {
          pool: "mcu",
          name: "Iron Man",
          mua3: false,
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: MCU Iron Man",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/MCUIronMan"
            }
          ],
          basis: "Sarcastic quips during fights, shown across the MCU films."
        },
        {
          pool: "muppets",
          name: "Fozzie Bear",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-muppets-20261113-064334-26.json",
              id: "muppets:Fozzie Bear",
              url: "https://en.wikipedia.org/wiki/Fozzie_Bear"
            }
          ],
          basis: "Stand-up comic: \"Wocka wocka!\""
        },
        {
          pool: "muppets",
          name: "Statler",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-muppets-20261113-064435-31.json",
              id: "muppets:Statler"
            }
          ],
          basis: "Balcony heckler of sarcastic commentary."
        },
        {
          pool: "muppets",
          name: "Waldorf",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-muppets-20261113-064449-32.json",
              id: "muppets:Waldorf"
            }
          ],
          basis: "Balcony heckler of scathing verbal wit."
        },
        {
          pool: "muppets",
          name: "Floyd Pepper",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-muppets-20261113-064334-26.json",
              id: "muppets:Floyd Pepper",
              url: "https://muppet.fandom.com/wiki/Floyd_Pepper"
            }
          ],
          basis: "Known for hip sarcasm."
        },
        {
          pool: "muppets",
          name: "Rowlf the Dog",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-muppets-20261113-064421-30.json",
              id: "muppets:Rowlf the Dog"
            }
          ],
          basis: "Dry wit."
        },
        {
          pool: "toons",
          name: "Bugs Bunny",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Bugs Bunny",
              url: "https://Tvtropes.org/pmwiki/pmwiki.php/WesternAnimation/BugsBunny"
            }
          ],
          basis: "Iconic snarker: \"What's up, Doc?\""
        },
        {
          pool: "toons",
          name: "Aladdin",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-125710-42.json",
              id: "toons:Aladdin",
              url: "https://en.wikipedia.org/wiki/Aladdin_(Disney_character)"
            }
          ],
          basis: "Relies on wit."
        },
        {
          pool: "toons",
          name: "Timon",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-130234-59.json",
              id: "toons:Timon"
            }
          ],
          basis: "Quick wit over direct combat."
        },
        {
          pool: "toons",
          name: "Donkey",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Shrek main characters",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/ShrekMainCharacters"
            }
          ],
          basis: "Motor-mouthed comic relief."
        },
        {
          pool: "toons",
          name: "Rick Sanchez",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Rick Sanchez",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/RickAndMortyRickSanchez"
            }
          ],
          basis: "Deadpan snarker."
        },
        {
          pool: "toons",
          name: "Garfield",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-125815-46.json",
              id: "toons:Garfield"
            }
          ],
          basis: "Cynical wit and insults."
        },
        {
          pool: "games",
          name: "Nathan Drake",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Uncharted characters",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/Uncharted"
            }
          ],
          basis: "Quips and one-liners mid-fight."
        },
        {
          pool: "starwars",
          name: "Han Solo",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Star Wars Rebel heroes",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/StarWarsRebelHeroes"
            }
          ],
          basis: "Deadpan snarker."
        },
        {
          pool: "starwars",
          name: "Migs Mayfeld",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-starwars-20261113-125604-38.json",
              id: "starwars:Migs Mayfeld"
            }
          ],
          basis: "Survives on quick wit."
        },
        {
          pool: "harrypotter",
          name: "Fred Weasley",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043659-46.json",
              id: "harrypotter:Fred Weasley"
            }
          ],
          basis: "Prankster and joke-shop inventor."
        },
        {
          pool: "actionmovies",
          name: "John McClane",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Die Hard characters",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/DieHard"
            }
          ],
          basis: "Snarky hero with a steady stream of wisecracks."
        },
        {
          pool: "actionmovies",
          name: "Rick O'Connell",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: The Mummy (1999) characters",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/TheMummy1999"
            }
          ],
          basis: "Deadpan snarker."
        }
      ]
    },
    {
      kind: "tag",
      slug: "sorcerers",
      name: "Sorcerers",
      strength: TAG_STRENGTH,
      members: [
        {
          pool: "mcu",
          name: "Doctor Strange",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-mcu-20261113-044449-73.json",
              id: "mcu:Doctor Strange",
              url: "https://en.wikipedia.org/wiki/Doctor_Strange_(Marvel_Cinematic_Universe)"
            }
          ],
          basis: "Master of the mystic arts."
        },
        {
          pool: "mcu",
          name: "Scarlet Witch",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/claude-mcu-20261115-missing.json",
              id: "mcu:Scarlet Witch",
              url: "https://en.wikipedia.org/wiki/Wanda_Maximoff_(Marvel_Cinematic_Universe)"
            }
          ],
          basis: "Chaos magic and spellcasting."
        },
        {
          pool: "mcu",
          name: "Agatha Harkness",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-mcu-20261113-044354-70.json",
              id: "mcu:Agatha Harkness",
              url: "https://en.wikipedia.org/wiki/WandaVision"
            }
          ],
          basis: "Witch who drains magic and casts spells."
        },
        {
          pool: "mcu",
          name: "Wong",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-mcu-20261113-064240-22.json",
              id: "mcu:Wong",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUWong"
            }
          ],
          basis: "Kamar-Taj sorcerer."
        },
        {
          pool: "mcu",
          name: "The Ancient One",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-mcu-20261113-064148-19.json",
              id: "mcu:The Ancient One"
            }
          ],
          basis: "Sorcerer Supreme of Kamar-Taj."
        },
        {
          pool: "mcu",
          name: "Kaecilius",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-mcu-20261113-044705-80.json",
              id: "mcu:Kaecilius",
              url: "https://en.wikipedia.org/wiki/Doctor_Strange_(2016_film)"
            }
          ],
          basis: "Renegade mystic-arts sorcerer."
        },
        {
          pool: "mcu",
          name: "Mordo",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-mcu-20261113-064007-13.json",
              id: "mcu:Mordo",
              url: "https://hero.fandom.com/wiki/Karl_Mordo"
            }
          ],
          basis: "Kamar-Taj sorcerer."
        },
        {
          pool: "mcu",
          name: "Loki",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-mcu-20261113-044725-81.json",
              id: "mcu:Loki",
              url: "https://marvelcinematicuniverse.fandom.com/wiki/Loki"
            }
          ],
          basis: "Magic and illusions."
        },
        {
          pool: "dc",
          name: "Zatanna",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042722-16.json",
              id: "dc:Zatanna",
              url: "https://en.wikipedia.org/wiki/Zatanna"
            }
          ],
          basis: "Backward-spoken spellcaster."
        },
        {
          pool: "dc",
          name: "Doctor Fate",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042353-5.json",
              id: "dc:Doctor Fate",
              url: "https://en.wikipedia.org/wiki/Doctor_Fate"
            }
          ],
          basis: "Lord of Order sorcerer."
        },
        {
          pool: "dc",
          name: "John Constantine",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042428-7.json",
              id: "dc:John Constantine",
              url: "https://en.wikipedia.org/wiki/John_Constantine"
            }
          ],
          basis: "Occult magician."
        },
        {
          pool: "dc",
          name: "Raven",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042526-10.json",
              id: "dc:Raven",
              url: "https://en.wikipedia.org/wiki/Raven_(DC_Comics)"
            }
          ],
          basis: "Demonic magic user."
        },
        {
          pool: "dc",
          name: "Circe",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042337-4.json",
              id: "dc:Circe"
            }
          ],
          basis: "Sorceress of Hecate with transmutation spells."
        },
        {
          pool: "dc",
          name: "Etrigan",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042411-6.json",
              id: "dc:Etrigan",
              url: "https://en.wikipedia.org/wiki/Etrigan_the_Demon"
            }
          ],
          basis: "Rhyming demon with high command of magic."
        },
        {
          pool: "harrypotter",
          name: "Albus Dumbledore",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043607-43.json",
              id: "harrypotter:Albus Dumbledore",
              url: "https://wiki.krisyotam.com/content/wikipedia_en_all_nopic_2026-03/Dumbledore"
            }
          ],
          basis: "Greatest wizard of his age."
        },
        {
          pool: "harrypotter",
          name: "Lord Voldemort",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043732-48.json",
              id: "harrypotter:Lord Voldemort",
              url: "https://harrypotter.fandom.com/wiki/Tom_Riddle"
            }
          ],
          basis: "Dark wizard."
        },
        {
          pool: "harrypotter",
          name: "Harry Potter",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043716-47.json",
              id: "harrypotter:Harry Potter",
              url: "https://en.wikipedia.org/wiki/Harry_Potter_(character)"
            }
          ],
          basis: "Wizard and duellist."
        },
        {
          pool: "harrypotter",
          name: "Hermione Granger",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043716-47.json",
              id: "harrypotter:Hermione Granger",
              url: "https://harrypotter.fandom.com/wiki/Hermione_Granger"
            }
          ],
          basis: "Spell-perfect witch."
        },
        {
          pool: "harrypotter",
          name: "Severus Snape",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043849-53.json",
              id: "harrypotter:Severus Snape"
            }
          ],
          basis: "Dark-curse specialist."
        },
        {
          pool: "harrypotter",
          name: "Minerva McGonagall",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043746-49.json",
              id: "harrypotter:Minerva McGonagall"
            }
          ],
          basis: "Master of Transfiguration."
        },
        {
          pool: "harrypotter",
          name: "Bellatrix Lestrange",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043624-44.json",
              id: "harrypotter:Bellatrix Lestrange",
              url: "https://potterlex.com/bellatrix_lestrange"
            }
          ],
          basis: "Dark witch."
        },
        {
          pool: "harrypotter",
          name: "Gellert Grindelwald",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043659-46.json",
              id: "harrypotter:Gellert Grindelwald",
              url: "https://potterlex.com/grindelwald"
            }
          ],
          basis: "Dark wizard."
        },
        {
          pool: "harrypotter",
          name: "Filius Flitwick",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043641-45.json",
              id: "harrypotter:Filius Flitwick",
              url: "https://www.hp-lexicon.org/?p=109"
            }
          ],
          basis: "Charms master."
        },
        {
          pool: "harrypotter",
          name: "Ron Weasley",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043834-52.json",
              id: "harrypotter:Ron Weasley"
            }
          ],
          basis: "Wizard relying on hexes and jinxes."
        },
        {
          pool: "lotr",
          name: "Gandalf",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-lotr-20261113-044059-60.json",
              id: "lotr:Gandalf",
              url: "https://en.wikipedia.org/wiki/Gandalf"
            }
          ],
          basis: "Istar wizard."
        },
        {
          pool: "lotr",
          name: "Saruman",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-lotr-20261113-044228-65.json",
              id: "lotr:Saruman",
              url: "https://en.wikipedia.org/wiki/Wizards_in_Middle-earth"
            }
          ],
          basis: "Istar wizard and spell-weaver."
        },
        {
          pool: "lotr",
          name: "Sauron",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-lotr-20261113-044228-65.json",
              id: "lotr:Sauron"
            }
          ],
          basis: "Master sorcerer."
        },
        {
          pool: "lotr",
          name: "Witch-king of Angmar",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-lotr-20261113-044314-68.json",
              id: "lotr:Witch-king of Angmar",
              url: "https://en.wikipedia.org/wiki/Witch-king_of_Angmar"
            }
          ],
          basis: "Sorcerer-king."
        },
        {
          pool: "lotr",
          name: "Radagast",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-lotr-20261113-044211-64.json",
              id: "lotr:Radagast"
            }
          ],
          basis: "Istar wizard."
        },
        {
          pool: "lotr",
          name: "Lúthien Tinúviel",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-lotr-20261113-044155-63.json",
              id: "lotr:Lúthien Tinúviel",
              url: "https://en.wikipedia.org/wiki/L%C3%BAthien"
            }
          ],
          basis: "Enchantress who sang Morgoth to sleep."
        },
        {
          pool: "lotr",
          name: "Melian",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-lotr-20261113-044155-63.json",
              id: "lotr:Melian",
              url: "https://en.wikipedia.org/wiki/Melian_(Middle-earth)"
            }
          ],
          basis: "Maia enchantress, maker of the Girdle."
        },
        {
          pool: "games",
          name: "Yennefer",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-043527-41.json",
              id: "games:Yennefer",
              url: "https://en.wikipedia.org/wiki/The_Witcher_3:_Wild_Hunt"
            }
          ],
          basis: "Sorceress."
        },
        {
          pool: "games",
          name: "Zelda",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-043527-41.json",
              id: "games:Zelda",
              url: "https://en.wikipedia.org/wiki/The_Legend_of_Zelda:_Breath_of_the_Wild"
            }
          ],
          basis: "Light magic."
        },
        {
          pool: "games",
          name: "Ganondorf",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-043003-24.json",
              id: "games:Ganondorf",
              url: "https://gamicus.fandom.com/wiki/Ganondorf"
            }
          ],
          basis: "Dark sorcery."
        },
        {
          pool: "games",
          name: "Bayonetta",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-042852-20.json",
              id: "games:Bayonetta",
              url: "https://bayonetta.fandom.com/wiki/Bayonetta_(character)"
            }
          ],
          basis: "Umbra Witch."
        },
        {
          pool: "games",
          name: "Sora",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-043457-39.json",
              id: "games:Sora",
              url: "https://en.wikipedia.org/wiki/Sora_(Kingdom_Hearts)"
            }
          ],
          basis: "Keyblade wielder who casts magic."
        },
        {
          pool: "games",
          name: "Aerith Gainsborough",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-042833-19.json",
              id: "games:Aerith Gainsborough"
            }
          ],
          basis: "Magic-focused caster."
        },
        {
          pool: "games",
          name: "Dovahkiin",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-042945-23.json",
              id: "games:Dovahkiin",
              url: "https://elderscrolls.fandom.com/wiki/Thu%27um"
            }
          ],
          basis: "Thu'um Shouts, a form of magic."
        },
        {
          pool: "games",
          name: "Thrall",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-043513-40.json",
              id: "games:Thrall"
            }
          ],
          basis: "Orc shaman wielding elemental magic."
        },
        {
          pool: "toons",
          name: "Jafar",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-125815-46.json",
              id: "toons:Jafar",
              url: "https://en.wikipedia.org/wiki/Jafar_(Disney)"
            }
          ],
          basis: "Royal vizier and sorcerer."
        },
        {
          pool: "toons",
          name: "Maleficent",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-125849-48.json",
              id: "toons:Maleficent",
              url: "https://en.wikipedia.org/wiki/Maleficent"
            }
          ],
          basis: "Evil fairy and sorceress."
        },
        {
          pool: "toons",
          name: "Ursula",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-130234-59.json",
              id: "toons:Ursula",
              url: "https://en.wikipedia.org/wiki/Ursula_(The_Little_Mermaid)"
            }
          ],
          basis: "Sea witch who trades in spells."
        },
        {
          pool: "toons",
          name: "Mickey Mouse",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia: List of Fantasia (franchise) characters",
              url: "https://en.wikipedia.org/wiki/List_of_Fantasia_(franchise)_characters"
            }
          ],
          basis: "Animates a broom with the sorcerer's hat in The Sorcerer's Apprentice (item-based, counts for the base character)."
        },
        {
          pool: "muppets",
          name: "Abby Cadabby",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-muppets-20261113-064253-23.json",
              id: "muppets:Abby Cadabby",
              url: "https://muppet.fandom.com/wiki/Abby_Cadabby"
            }
          ],
          basis: "Fairy-in-training who casts spells."
        },
        {
          pool: "muppets",
          name: "The Amazing Mumford",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-muppets-20261113-064435-31.json",
              id: "muppets:The Amazing Mumford",
              url: "https://muppet.fandom.com/wiki/The_Amazing_Mumford"
            }
          ],
          basis: "Magician with wand and spells."
        },
        {
          pool: "starwars",
          name: "Asajj Ventress",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-starwars-20261113-125351-31.json",
              id: "starwars:Asajj Ventress"
            }
          ],
          basis: "Former Nightsister."
        },
        {
          pool: "actionmovies",
          name: "Thulsa Doom",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Conan the Barbarian (1982)",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Film/ConanTheBarbarian1982"
            }
          ],
          basis: "Evil sorcerer: hypnotic gaze, snakes turned into arrows, shapeshifting in Conan the Barbarian."
        },
        {
          pool: "actionmovies",
          name: "White Witch (Jadis)",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia: White Witch",
              url: "https://en.wikipedia.org/wiki/White_Witch"
            }
          ],
          basis: "Spellcaster whose wand turns foes to stone."
        },
        {
          pool: "actionmovies",
          name: "Imhotep",
          evidence: "needs-review",
          sources: [
            {
              title: "Wikipedia: Imhotep (The Mummy)",
              url: "https://en.wikipedia.org/wiki/Imhotep_(The_Mummy)"
            }
          ],
          basis: "Undead high priest who unleashes the Plagues of Egypt and commands sand; the page does not call it spellcasting."
        },
        {
          pool: "harrypotter",
          name: "Aberforth Dumbledore",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043607-43.json",
              id: "harrypotter:Aberforth Dumbledore",
              url: "https://fanlore.org/wiki/Aberforth_Dumbledore"
            }
          ],
          basis: "Skilled wizard with a corporeal Patronus."
        },
        {
          pool: "harrypotter",
          name: "Alastor Moody",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043607-43.json",
              id: "harrypotter:Alastor Moody",
              url: "https://www.hp-lexicon.org/?p=25697"
            }
          ],
          basis: "Veteran Auror and duellist."
        },
        {
          pool: "harrypotter",
          name: "Amelia Bones",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043607-43.json",
              id: "harrypotter:Amelia Bones"
            }
          ],
          basis: "Powerful witch, head of Magical Law Enforcement."
        },
        {
          pool: "harrypotter",
          name: "Arthur Weasley",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043607-43.json",
              id: "harrypotter:Arthur Weasley",
              url: "https://www.hp-lexicon.org/?p=297"
            }
          ],
          basis: "Order wizard with a corporeal Patronus."
        },
        {
          pool: "harrypotter",
          name: "Barty Crouch Jr.",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043607-43.json",
              id: "harrypotter:Barty Crouch Jr.",
              url: "https://www.potterlex.com/bartemius_crouch_jr"
            }
          ],
          basis: "Duellist who cast the Imperius Curse."
        },
        {
          pool: "harrypotter",
          name: "Bill Weasley",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043624-44.json",
              id: "harrypotter:Bill Weasley",
              url: "https://potterlex.com/_export/xhtml/bill_weasley"
            }
          ],
          basis: "Gringotts Curse-Breaker."
        },
        {
          pool: "harrypotter",
          name: "Cedric Diggory",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043624-44.json",
              id: "harrypotter:Cedric Diggory",
              url: "https://harrypotter.fandom.com/wiki/Cedric_Diggory"
            }
          ],
          basis: "Triwizard champion wizard."
        },
        {
          pool: "harrypotter",
          name: "Charlie Weasley",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043624-44.json",
              id: "harrypotter:Charlie Weasley"
            }
          ],
          basis: "Wizard dragonologist."
        },
        {
          pool: "harrypotter",
          name: "Cho Chang",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043624-44.json",
              id: "harrypotter:Cho Chang",
              url: "https://harrypotter.fandom.com/wiki/Cho_Chang"
            }
          ],
          basis: "Dumbledore's Army spellcaster."
        },
        {
          pool: "harrypotter",
          name: "Dobby",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043641-45.json",
              id: "harrypotter:Dobby",
              url: "https://harrypotter.fandom.com/wiki/Dobby"
            }
          ],
          basis: "Wandless house-elf magic and Apparition."
        },
        {
          pool: "harrypotter",
          name: "Dolores Umbridge",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043641-45.json",
              id: "harrypotter:Dolores Umbridge"
            }
          ],
          basis: "Ministry witch using dark magic."
        },
        {
          pool: "harrypotter",
          name: "Draco Malfoy",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043641-45.json",
              id: "harrypotter:Draco Malfoy",
              url: "https://www.hp-lexicon.org/?p=4339"
            }
          ],
          basis: "Wizard duellist."
        },
        {
          pool: "harrypotter",
          name: "Fleur Delacour",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043641-45.json",
              id: "harrypotter:Fleur Delacour",
              url: "https://www.hp-lexicon.org/?p=5512"
            }
          ],
          basis: "Beauxbatons Triwizard champion witch."
        },
        {
          pool: "harrypotter",
          name: "Fred Weasley",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043659-46.json",
              id: "harrypotter:Fred Weasley"
            }
          ],
          basis: "Fights with jinxes and magical pranks."
        },
        {
          pool: "harrypotter",
          name: "George Weasley",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043659-46.json",
              id: "harrypotter:George Weasley"
            }
          ],
          basis: "Wizard relying on charms and trick magic."
        },
        {
          pool: "harrypotter",
          name: "Gilderoy Lockhart",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043659-46.json",
              id: "harrypotter:Gilderoy Lockhart",
              url: "https://www.harrypotter.com/writing-by-jk-rowling/gilderoy-lockhart"
            }
          ],
          basis: "Wizard whose one real skill is the Memory Charm."
        },
        {
          pool: "harrypotter",
          name: "Ginny Weasley",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043659-46.json",
              id: "harrypotter:Ginny Weasley",
              url: "https://www.harrypotter.com/fact-file/characters-and-pets/ginny-weasley"
            }
          ],
          basis: "Talented with a wand; Bat-Bogey Hex specialist."
        },
        {
          pool: "harrypotter",
          name: "Gregory Goyle",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043659-46.json",
              id: "harrypotter:Gregory Goyle",
              url: "https://weirdspace.info/HarryPotter/GregoryGoyle.htm"
            }
          ],
          basis: "Mediocre but practising wizard."
        },
        {
          pool: "harrypotter",
          name: "Helga Hufflepuff",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043716-47.json",
              id: "harrypotter:Helga Hufflepuff",
              url: "https://harrypotter.fandom.com/wiki/Helga_Hufflepuff"
            }
          ],
          basis: "Founder known for food charms."
        },
        {
          pool: "harrypotter",
          name: "James Potter",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043716-47.json",
              id: "harrypotter:James Potter",
              url: "https://harrypotter.fandom.com/wiki/James_Potter_I"
            }
          ],
          basis: "Duellist and Animagus."
        },
        {
          pool: "harrypotter",
          name: "Karkaroff",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043716-47.json",
              id: "harrypotter:Karkaroff",
              url: "https://harrypotter.fandom.com/wiki/Igor_Karkaroff"
            }
          ],
          basis: "Dark wizard using nonverbal spells."
        },
        {
          pool: "harrypotter",
          name: "Kingsley Shacklebolt",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043732-48.json",
              id: "harrypotter:Kingsley Shacklebolt",
              url: "https://harrypotter.fandom.com/wiki/Kingsley_Shacklebolt"
            }
          ],
          basis: "Auror duellist."
        },
        {
          pool: "harrypotter",
          name: "Kreacher",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043732-48.json",
              id: "harrypotter:Kreacher",
              url: "https://harrypotter.fandom.com/wiki/Kreacher"
            }
          ],
          basis: "Wandless house-elf magic."
        },
        {
          pool: "harrypotter",
          name: "Lavender Brown",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043732-48.json",
              id: "harrypotter:Lavender Brown"
            }
          ],
          basis: "Dumbledore's Army spellcaster."
        },
        {
          pool: "harrypotter",
          name: "Lee Jordan",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043732-48.json",
              id: "harrypotter:Lee Jordan"
            }
          ],
          basis: "Dumbledore's Army wand combat."
        },
        {
          pool: "harrypotter",
          name: "Leta Lestrange",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043732-48.json",
              id: "harrypotter:Leta Lestrange"
            }
          ],
          basis: "Powerful witch in the dark and protective arts."
        },
        {
          pool: "harrypotter",
          name: "Lily Potter",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043732-48.json",
              id: "harrypotter:Lily Potter"
            }
          ],
          basis: "Accomplished charms witch."
        },
        {
          pool: "harrypotter",
          name: "Lucius Malfoy",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043732-48.json",
              id: "harrypotter:Lucius Malfoy",
              url: "https://harrypotter.fandom.com/wiki/Lucius_Malfoy"
            }
          ],
          basis: "Dark wizard and nonverbal duellist."
        },
        {
          pool: "harrypotter",
          name: "Luna Lovegood",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043732-48.json",
              id: "harrypotter:Luna Lovegood",
              url: "https://harrypotter.fandom.com/wiki/Luna_Lovegood"
            }
          ],
          basis: "Patronus caster and duellist."
        },
        {
          pool: "harrypotter",
          name: "Madam Hooch",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043746-49.json",
              id: "harrypotter:Madam Hooch",
              url: "https://harrypotter.fandom.com/wiki/Rolanda_Hooch"
            }
          ],
          basis: "Hogwarts witch and flying instructor."
        },
        {
          pool: "harrypotter",
          name: "Madam Poppy Pomfrey",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043746-49.json",
              id: "harrypotter:Madam Poppy Pomfrey"
            }
          ],
          basis: "Healing magic."
        },
        {
          pool: "harrypotter",
          name: "Madame Maxime",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043746-49.json",
              id: "harrypotter:Madame Maxime",
              url: "https://harrypotter.fandom.com/wiki/Olympe_Maxime"
            }
          ],
          basis: "Cast Conjunctivitis Curses on giants."
        },
        {
          pool: "harrypotter",
          name: "Molly Weasley",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043746-49.json",
              id: "harrypotter:Molly Weasley",
              url: "https://harrypotter.fandom.com/wiki/Molly_Weasley"
            }
          ],
          basis: "Nonverbal duellist who killed Bellatrix."
        },
        {
          pool: "harrypotter",
          name: "Narcissa Malfoy",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043746-49.json",
              id: "harrypotter:Narcissa Malfoy",
              url: "https://hp-lexicon.org/?p=6936"
            }
          ],
          basis: "Witch who lost her wand to Dobby."
        },
        {
          pool: "harrypotter",
          name: "Newt Scamander",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043802-50.json",
              id: "harrypotter:Newt Scamander",
              url: "https://harrypotter.fandom.com/wiki/Newton_Scamander"
            }
          ],
          basis: "Nonverbal spells and Shield Charms."
        },
        {
          pool: "harrypotter",
          name: "Nymphadora Tonks",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043802-50.json",
              id: "harrypotter:Nymphadora Tonks"
            }
          ],
          basis: "Auror and Metamorphmagus."
        },
        {
          pool: "harrypotter",
          name: "Ollivander",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043802-50.json",
              id: "harrypotter:Ollivander",
              url: "https://harrypotter.fandom.com/wiki/Garrick_Ollivander"
            }
          ],
          basis: "Wandmaker using nonverbal magic."
        },
        {
          pool: "harrypotter",
          name: "Padma Patil",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043802-50.json",
              id: "harrypotter:Padma Patil"
            }
          ],
          basis: "Dumbledore's Army charms."
        },
        {
          pool: "harrypotter",
          name: "Percy Weasley",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043817-51.json",
              id: "harrypotter:Percy Weasley"
            }
          ],
          basis: "Ministry wizard who duelled."
        },
        {
          pool: "harrypotter",
          name: "Peter Pettigrew",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043817-51.json",
              id: "harrypotter:Peter Pettigrew",
              url: "https://harrypotter.fandom.com/wiki/Peter_Pettigrew"
            }
          ],
          basis: "Cast the Killing Curse on Cedric."
        },
        {
          pool: "harrypotter",
          name: "Pius Thicknesse",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043817-51.json",
              id: "harrypotter:Pius Thicknesse",
              url: "https://harrypotter.fandom.com/wiki/Pius_Thicknesse"
            }
          ],
          basis: "Imperiused Minister who duelled."
        },
        {
          pool: "harrypotter",
          name: "Pomona Sprout",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043817-51.json",
              id: "harrypotter:Pomona Sprout"
            }
          ],
          basis: "Herbology witch using specialised magic."
        },
        {
          pool: "harrypotter",
          name: "Queenie Goldstein",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043817-51.json",
              id: "harrypotter:Queenie Goldstein",
              url: "https://harrypotter.fandom.com/wiki/Queenie_Goldstein"
            }
          ],
          basis: "Wandless and nonverbal magic."
        },
        {
          pool: "harrypotter",
          name: "Quirinus Quirrell",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043817-51.json",
              id: "harrypotter:Quirinus Quirrell",
              url: "https://harrypotter.fandom.com/wiki/Quirinus_Quirrell"
            }
          ],
          basis: "Wandless magic and broom jinx."
        },
        {
          pool: "harrypotter",
          name: "Regulus Black",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043834-52.json",
              id: "harrypotter:Regulus Black",
              url: "https://harrypotter.fandom.com/wiki/Regulus_Black"
            }
          ],
          basis: "Dark Arts knowledge."
        },
        {
          pool: "harrypotter",
          name: "Remus Lupin",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043834-52.json",
              id: "harrypotter:Remus Lupin"
            }
          ],
          basis: "Experienced wizard and Defence teacher."
        },
        {
          pool: "harrypotter",
          name: "Rita Skeeter",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043834-52.json",
              id: "harrypotter:Rita Skeeter"
            }
          ],
          basis: "Witch journalist."
        },
        {
          pool: "harrypotter",
          name: "Rodolphus Lestrange",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043834-52.json",
              id: "harrypotter:Rodolphus Lestrange"
            }
          ],
          basis: "Death Eater skilled in curses."
        },
        {
          pool: "harrypotter",
          name: "Rowena Ravenclaw",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043834-52.json",
              id: "harrypotter:Rowena Ravenclaw",
              url: "https://harrypotter.fandom.com/wiki/Rowena_Ravenclaw"
            }
          ],
          basis: "Most brilliant witch of her time."
        },
        {
          pool: "harrypotter",
          name: "Rubeus Hagrid",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043834-52.json",
              id: "harrypotter:Rubeus Hagrid",
              url: "https://harrypotter.fandom.com/wiki/Rubeus_Hagrid"
            }
          ],
          basis: "Casts with an umbrella hiding his wand."
        },
        {
          pool: "harrypotter",
          name: "Rufus Scrimgeour",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043834-52.json",
              id: "harrypotter:Rufus Scrimgeour",
              url: "https://harrypotter.fandom.com/wiki/Rufus_Scrimgeour"
            }
          ],
          basis: "Head Auror and nonverbal duellist."
        },
        {
          pool: "harrypotter",
          name: "Salazar Slytherin",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043849-53.json",
              id: "harrypotter:Salazar Slytherin",
              url: "https://harrypotter.fandom.com/wiki/Salazar_Slytherin"
            }
          ],
          basis: "Founder with extensive magical abilities."
        },
        {
          pool: "harrypotter",
          name: "Seamus Finnigan",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043849-53.json",
              id: "harrypotter:Seamus Finnigan"
            }
          ],
          basis: "General duelling spells."
        },
        {
          pool: "harrypotter",
          name: "Seraphina Picquery",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043849-53.json",
              id: "harrypotter:Seraphina Picquery"
            }
          ],
          basis: "MACUSA President commanding Aurors."
        },
        {
          pool: "harrypotter",
          name: "Sirius Black",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043849-53.json",
              id: "harrypotter:Sirius Black"
            }
          ],
          basis: "Duelling spells."
        },
        {
          pool: "harrypotter",
          name: "Theseus Scamander",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043849-53.json",
              id: "harrypotter:Theseus Scamander",
              url: "https://harrypotter.fandom.com/wiki/Theseus_Scamander"
            }
          ],
          basis: "Head Auror who duelled Grindelwald."
        },
        {
          pool: "harrypotter",
          name: "Tina Goldstein",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043904-54.json",
              id: "harrypotter:Tina Goldstein",
              url: "https://harrypotter.fandom.com/wiki/Porpentina_Goldstein"
            }
          ],
          basis: "MACUSA Auror spellcaster."
        },
        {
          pool: "harrypotter",
          name: "Viktor Krum",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043904-54.json",
              id: "harrypotter:Viktor Krum",
              url: "https://harrypotter.fandom.com/wiki/Viktor_Krum"
            }
          ],
          basis: "Conjunctivitis Curse and Transfiguration."
        },
        {
          pool: "harrypotter",
          name: "Vincent Crabbe",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043904-54.json",
              id: "harrypotter:Vincent Crabbe",
              url: "https://harrypotter.fandom.com/wiki/Vincent_Crabbe"
            }
          ],
          basis: "Cast Fiendfyre."
        },
        {
          pool: "harrypotter",
          name: "Winky",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043904-54.json",
              id: "harrypotter:Winky",
              url: "https://harrypotter.fandom.com/wiki/Winky"
            }
          ],
          basis: "House-elf magic and Apparition."
        },
        {
          pool: "harrypotter",
          name: "Yusuf Kama",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-harrypotter-20261113-043904-54.json",
              id: "harrypotter:Yusuf Kama",
              url: "https://harrypotter.fandom.com/wiki/Yusuf_Kama"
            }
          ],
          basis: "Pure-blood wizard with wandwork."
        },
        {
          pool: "lotr",
          name: "Elrond",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-lotr-20261113-044016-58.json",
              id: "lotr:Elrond"
            }
          ],
          basis: "Ring-bearer of Vilya and master healer."
        },
        {
          pool: "lotr",
          name: "Galadriel",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-lotr-20261113-044059-60.json",
              id: "lotr:Galadriel",
              url: "https://en.wikipedia.org/wiki/Galadriel"
            }
          ],
          basis: "Magical powers; cast down Dol Guldur."
        },
        {
          pool: "lotr",
          name: "Khamûl the Easterling",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-lotr-20261113-044137-62.json",
              id: "lotr:Khamûl the Easterling"
            }
          ],
          basis: "Nazgûl using dark sorcery."
        },
        {
          pool: "lotr",
          name: "Morgoth (Melkor)",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-lotr-20261113-044155-63.json",
              id: "lotr:Morgoth (Melkor)"
            }
          ],
          basis: "Dark sorcery."
        },
        {
          pool: "games",
          name: "Arthas Menethil",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-042833-19.json",
              id: "games:Arthas Menethil"
            }
          ],
          basis: "Lich King wielding necromancy."
        },
        {
          pool: "games",
          name: "Atreus",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-042852-20.json",
              id: "games:Atreus"
            }
          ],
          basis: "Rune magic and magic-imbued arrows."
        },
        {
          pool: "games",
          name: "Bowser",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-042852-20.json",
              id: "games:Bowser",
              url: "https://www.mariowiki.com/Bowser"
            }
          ],
          basis: "Dark magic."
        },
        {
          pool: "games",
          name: "Chrono",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-042927-22.json",
              id: "games:Chrono",
              url: "https://squareenix.fandom.com/wiki/Crono"
            }
          ],
          basis: "Lightning/Heaven magic techs."
        },
        {
          pool: "games",
          name: "Geralt of Rivia",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-043022-25.json",
              id: "games:Geralt of Rivia"
            }
          ],
          basis: "Witcher Signs such as Yrden."
        },
        {
          pool: "games",
          name: "Illidan Stormrage",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-043022-25.json",
              id: "games:Illidan Stormrage"
            }
          ],
          basis: "Demon hunter wielding fel magic."
        },
        {
          pool: "games",
          name: "Sephiroth",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-043415-37.json",
              id: "games:Sephiroth"
            }
          ],
          basis: "Combines swordsmanship with magic."
        },
        {
          pool: "mcu",
          name: "Doctor Doom",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-mcu-20261113-044449-73.json",
              id: "mcu:Doctor Doom"
            }
          ],
          basis: "Scientist and sorcerer."
        },
        {
          pool: "mcu",
          name: "Odin",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-mcu-20261113-064024-14.json",
              id: "mcu:Odin",
              url: "https://marvelcinematicuniverse.fandom.com/wiki/Odin"
            }
          ],
          basis: "Placed the Mjolnir enchantment."
        },
        {
          pool: "mcu",
          name: "Ned Leeds",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-mcu-20261113-064024-14.json",
              id: "mcu:Ned Leeds",
              url: "https://www.looper.com/711703/how-ned-was-able-to-use-doctor-stranges-artifacts-in-spider-man-no-way-home"
            }
          ],
          basis: "Opens portals with a Sling Ring."
        },
        {
          pool: "dc",
          name: "Atrocitus",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/dc-batch-01.json",
              id: "dc:Atrocitus",
              url: "https://www.comicvine.gamespot.com/red-lantern-corps/65-50747/"
            }
          ],
          basis: "Reached the red light of rage through blood magic."
        },
        {
          pool: "toons",
          name: "Hades",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-125815-46.json",
              id: "toons:Hades"
            }
          ],
          basis: "Potent dark magic."
        },
        {
          pool: "toons",
          name: "Minnie Mouse",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-toons-20261113-125931-50.json",
              id: "toons:Minnie Mouse"
            }
          ],
          basis: "White magic in Kingdom Hearts."
        }
      ],
      perPoolCap: null
    },
    {
      kind: "tag",
      slug: "green",
      name: "Greens",
      strength: TAG_STRENGTH,
      members: [
        {
          pool: "muppets",
          name: "Kermit the Frog",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia: Kermit the Frog",
              url: "https://en.wikipedia.org/wiki/Kermit_the_Frog"
            }
          ],
          basis: "Green frog."
        },
        {
          pool: "muppets",
          name: "Oscar the Grouch",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia (IPFS mirror): Oscar the Grouch",
              url: "https://ipfs.ssi.eecc.de/ipns/en.wikipedia-on-ipfs.org/wiki/Oscar_the_Grouch"
            }
          ],
          basis: "Green since his second season (orange at first)."
        },
        {
          pool: "toons",
          name: "Mike Wazowski",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia (IPFS mirror): List of Monsters, Inc. characters",
              url: "https://ipfs.ssi.eecc.de/ipns/en.wikipedia-on-ipfs.org/wiki/List_of_Monsters%2C_Inc._characters"
            }
          ],
          basis: "Green cyclops-like monster."
        },
        {
          pool: "toons",
          name: "Buttercup",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: The Powerpuff Girls heroes",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/ThePowerpuffGirlsTheHeroes"
            }
          ],
          basis: "Her colour is green."
        },
        {
          pool: "toons",
          name: "Leonardo",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: TMNT (1987) characters",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/Teenagemutantninjaturtles1987"
            }
          ],
          basis: "\"Mean green fighting machines\" (1987 series)."
        },
        {
          pool: "toons",
          name: "Raphael",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: TMNT (1987) characters",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/Teenagemutantninjaturtles1987"
            }
          ],
          basis: "\"Mean green fighting machines\" (1987 series)."
        },
        {
          pool: "toons",
          name: "Michelangelo",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: TMNT (1987) characters",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/Teenagemutantninjaturtles1987"
            }
          ],
          basis: "\"Mean green fighting machines\" (1987 series)."
        },
        {
          pool: "toons",
          name: "Donatello",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: TMNT (1987) characters",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/Teenagemutantninjaturtles1987"
            }
          ],
          basis: "\"Mean green fighting machines\" (1987 series)."
        },
        {
          pool: "pokemon",
          name: "Bulbasaur",
          evidence: "credible",
          sources: [
            {
              title: "Serebii: Green Pokédex colour list",
              url: "https://serebii.net/pokedex-xy/green.shtml"
            }
          ],
          basis: "Pokédex colour: green."
        },
        {
          pool: "pokemon",
          name: "Ivysaur",
          evidence: "credible",
          sources: [
            {
              title: "Serebii: Green Pokédex colour list",
              url: "https://serebii.net/pokedex-xy/green.shtml"
            }
          ],
          basis: "Pokédex colour: green."
        },
        {
          pool: "pokemon",
          name: "Venusaur",
          evidence: "credible",
          sources: [
            {
              title: "Serebii: Green Pokédex colour list",
              url: "https://serebii.net/pokedex-xy/green.shtml"
            }
          ],
          basis: "Pokédex colour: green."
        },
        {
          pool: "pokemon",
          name: "Caterpie",
          evidence: "credible",
          sources: [
            {
              title: "Serebii: Green Pokédex colour list",
              url: "https://serebii.net/pokedex-xy/green.shtml"
            }
          ],
          basis: "Pokédex colour: green."
        },
        {
          pool: "pokemon",
          name: "Metapod",
          evidence: "credible",
          sources: [
            {
              title: "Serebii: Green Pokédex colour list",
              url: "https://serebii.net/pokedex-xy/green.shtml"
            }
          ],
          basis: "Pokédex colour: green."
        },
        {
          pool: "pokemon",
          name: "Bellsprout",
          evidence: "credible",
          sources: [
            {
              title: "Serebii: Green Pokédex colour list",
              url: "https://serebii.net/pokedex-xy/green.shtml"
            }
          ],
          basis: "Pokédex colour: green."
        },
        {
          pool: "pokemon",
          name: "Weepinbell",
          evidence: "credible",
          sources: [
            {
              title: "Serebii: Green Pokédex colour list",
              url: "https://serebii.net/pokedex-xy/green.shtml"
            }
          ],
          basis: "Pokédex colour: green."
        },
        {
          pool: "pokemon",
          name: "Victreebel",
          evidence: "credible",
          sources: [
            {
              title: "Serebii: Green Pokédex colour list",
              url: "https://serebii.net/pokedex-xy/green.shtml"
            }
          ],
          basis: "Pokédex colour: green."
        },
        {
          pool: "pokemon",
          name: "Scyther",
          evidence: "credible",
          sources: [
            {
              title: "Serebii: Green Pokédex colour list",
              url: "https://serebii.net/pokedex-xy/green.shtml"
            }
          ],
          basis: "Pokédex colour: green."
        },
        {
          pool: "dc",
          name: "Green Lantern (Hal Jordan)",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-dc-20261113-042411-6.json",
              id: "dc:Green Lantern (Hal Jordan)"
            }
          ],
          basis: "Green Lantern power ring."
        },
        {
          pool: "dc",
          name: "Green Lantern (John Stewart)",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/claude-dc-20261114-01.json",
              id: "dc:Green Lantern (John Stewart)"
            }
          ],
          basis: "Green Lantern power ring."
        },
        {
          pool: "dc",
          name: "Martian Manhunter",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia: Martian Manhunter",
              url: "https://en.wikipedia.org/wiki/Martian_Manhunter"
            }
          ],
          basis: "Green-skinned humanoid from Mars."
        },
        {
          pool: "mcu",
          name: "Hulk",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: MCU The Hulk",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUTheHulk"
            }
          ],
          basis: "Green skin."
        },
        {
          pool: "toons",
          name: "Shrek",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia: Shrek (character)",
              url: "https://en.wikipedia.org/wiki/Shrek_(character)"
            }
          ],
          basis: "Large, green-skinned ogre."
        },
        {
          pool: "starwars",
          name: "Yoda",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia: Yoda",
              url: "https://en.wikipedia.org/wiki/Yoda"
            }
          ],
          basis: "Small, green, elderly humanoid alien."
        },
        {
          pool: "starwars",
          name: "Grogu",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia: Grogu",
              url: "https://en.wikipedia.org/wiki/Grogu"
            }
          ],
          basis: "Signature green skin."
        },
        {
          pool: "mcu",
          name: "Gamora",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia: Gamora (Marvel Cinematic Universe)",
              url: "https://en.wikipedia.org/wiki/Gamora_(Marvel_Cinematic_Universe)"
            }
          ],
          basis: "Zoe Saldaña on playing \"someone green\" through make-up."
        },
        {
          pool: "games",
          name: "Luigi",
          evidence: "credible",
          sources: [
            {
              title: "Super Mario Wiki: Luigi",
              url: "https://www.mariowiki.com/luigi"
            }
          ],
          basis: "Green shirt and cap (\"green instead of red\")."
        },
        {
          pool: "games",
          name: "Yoshi",
          evidence: "credible",
          sources: [
            {
              title: "Super Mario Wiki: Yoshi (species)",
              url: "https://www.mariowiki.com/Green_Yoshi"
            }
          ],
          basis: "The best-known Yoshi is green and simply named Yoshi."
        },
        {
          pool: "dc",
          name: "Beast Boy",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia: Beast Boy",
              url: "https://en.wikipedia.org/wiki/Beast_Boy"
            }
          ],
          basis: "Green skin, hair and eyes."
        }
      ]
    },
    {
      kind: "tag",
      slug: "blue",
      name: "Blues",
      strength: TAG_STRENGTH,
      members: [
        {
          pool: "muppets",
          name: "Grover",
          evidence: "corroborated",
          sources: [
            {
              record: "research/option-c/batches/gemini-muppets-20261113-064334-26.json",
              id: "muppets:Grover"
            },
            {
              title: "TV Tropes: Sesame Street monsters",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/SesameStreetMonsters"
            }
          ],
          basis: "Blue furry monster."
        },
        {
          pool: "muppets",
          name: "Cookie Monster",
          evidence: "credible",
          sources: [
            {
              title: "Wikiwand (Wikipedia): Cookie Monster",
              url: "https://wikiwand.com/en/Cookie_Monster"
            }
          ],
          basis: "Blue fur."
        },
        {
          pool: "muppets",
          name: "Herry Monster",
          evidence: "corroborated",
          sources: [
            {
              record: "research/option-c/batches/gemini-muppets-20261113-064345-27.json",
              id: "muppets:Herry Monster"
            },
            {
              title: "TV Tropes: Sesame Street monsters",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/SesameStreetMonsters"
            }
          ],
          basis: "Large blue monster."
        },
        {
          pool: "muppets",
          name: "Rosita",
          evidence: "corroborated",
          sources: [
            {
              record: "research/option-c/batches/gemini-muppets-20261113-064421-30.json",
              id: "muppets:Rosita"
            },
            {
              title: "TV Tropes: Sesame Street monsters",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/SesameStreetMonsters"
            }
          ],
          basis: "Turquoise / blue-furred monster."
        },
        {
          pool: "muppets",
          name: "Uncle Deadly",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia (IPFS mirror): List of Muppets",
              url: "https://ipfs.ssi.eecc.de/ipns/en.wikipedia-on-ipfs.org/wiki/List_of_Muppets"
            }
          ],
          basis: "Blue dragon-like monster."
        },
        {
          pool: "toons",
          name: "Sulley",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia (IPFS mirror): List of Monsters, Inc. characters",
              url: "https://ipfs.ssi.eecc.de/ipns/en.wikipedia-on-ipfs.org/wiki/List_of_Monsters%2C_Inc._characters"
            }
          ],
          basis: "Light-blue fur with purple spots."
        },
        {
          pool: "toons",
          name: "Stitch",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Stitch (Lilo & Stitch)",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/LiloAndStitchStitch"
            }
          ],
          basis: "Blue fur."
        },
        {
          pool: "toons",
          name: "Bubbles",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: The Powerpuff Girls heroes",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/ThePowerpuffGirlsTheHeroes"
            }
          ],
          basis: "Her colour is blue."
        },
        {
          pool: "games",
          name: "Sonic the Hedgehog",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Sonic main trio",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/SonicTheHedgehogMainTrio"
            }
          ],
          basis: "Blue fur."
        },
        {
          pool: "toons",
          name: "Genie",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia: Genie (Disney)",
              url: "https://en.wikipedia.org/wiki/Genie_(Disney)"
            }
          ],
          basis: "Classic blue skin (\"Blue Genie\")."
        },
        {
          pool: "mcu",
          name: "Nebula",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia: Nebula (Marvel Cinematic Universe)",
              url: "https://en.wikipedia.org/wiki/Nebula_(Marvel_Cinematic_Universe)"
            }
          ],
          basis: "Blue-skinned alien warrior."
        },
        {
          pool: "dc",
          name: "Doctor Manhattan",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia: Doctor Manhattan",
              url: "https://en.wikipedia.org/wiki/Doctor_Manhattan"
            }
          ],
          basis: "Completely blue."
        }
      ]
    },
    {
      kind: "tag",
      slug: "red",
      name: "Reds",
      strength: TAG_STRENGTH,
      members: [
        {
          pool: "muppets",
          name: "Elmo",
          evidence: "corroborated",
          sources: [
            {
              record: "research/option-c/batches/gemini-muppets-20261113-064323-25.json",
              id: "muppets:Elmo"
            },
            {
              title: "TV Tropes: Sesame Street monsters",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/SesameStreetMonsters"
            }
          ],
          basis: "Red monster."
        },
        {
          pool: "games",
          name: "Knuckles",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Sonic main trio",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/SonicTheHedgehogMainTrio"
            }
          ],
          basis: "Red fur."
        },
        {
          pool: "games",
          name: "Blinky",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-042852-20.json",
              id: "games:Blinky"
            }
          ],
          basis: "The red ghost."
        },
        {
          pool: "dc",
          name: "Atrocitus",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/dc-batch-01.json",
              id: "dc:Atrocitus"
            }
          ],
          basis: "Founder of the Red Lantern Corps."
        },
        {
          pool: "toons",
          name: "Mr. Krabs",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia: Mr. Krabs",
              url: "https://en.wikipedia.org/wiki/Mr._Krabs"
            }
          ],
          basis: "Red crab."
        },
        {
          pool: "toons",
          name: "Lightning McQueen",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia: Lightning McQueen",
              url: "https://en.wikipedia.org/wiki/Lightning_McQueen"
            }
          ],
          basis: "Red body with lightning-bolt decals (repainted blue late in Cars 3)."
        },
        {
          pool: "games",
          name: "Mario",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia: Mario",
              url: "https://en.wikipedia.org/wiki/Mario"
            }
          ],
          basis: "Red cap and long-sleeved red shirt."
        },
        {
          pool: "starwars",
          name: "Darth Maul",
          evidence: "credible",
          sources: [
            {
              title: "ComicBook.com: Why Maul is red and Savage Opress is yellow",
              url: "https://comicbook.com/tv-shows/feature/star-wars-why-maul-is-red-when-his-brother-savage-opress-is-yellow/"
            }
          ],
          basis: "Trademark red skin."
        },
        {
          pool: "starwars",
          name: "Ahsoka Tano",
          evidence: "credible",
          sources: [
            {
              title: "/Film: What you should know about Ahsoka's species, the Togruta",
              url: "https://www.slashfilm.com/1251671/what-you-should-know-about-ahsoka-species-togruta"
            }
          ],
          basis: "Red skin, facial markings and horns."
        }
      ]
    },
    {
      kind: "tag",
      slug: "yellow",
      name: "Yellows",
      strength: TAG_STRENGTH,
      members: [
        {
          pool: "muppets",
          name: "Big Bird",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-muppets-20261113-064307-24.json",
              id: "muppets:Big Bird"
            }
          ],
          basis: "Yellow bird."
        },
        {
          pool: "muppets",
          name: "Bert",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia (IPFS mirror): Bert (Sesame Street)",
              url: "https://ipfs.ssi.eecc.de/ipns/en.wikipedia-on-ipfs.org/wiki/Bert_(Sesame_Street)"
            }
          ],
          basis: "Yellow Muppet."
        },
        {
          pool: "toons",
          name: "Homer Simpson",
          evidence: "credible",
          sources: [
            {
              title: "/Film: Why the Simpsons are yellow",
              url: "https://www.slashfilm.com/1093851/theres-a-simple-answer-to-the-question-why-are-the-simpsons-yellow"
            }
          ],
          basis: "Yellow skin, like every Simpson."
        },
        {
          pool: "toons",
          name: "Marge Simpson",
          evidence: "credible",
          sources: [
            {
              title: "/Film: Why the Simpsons are yellow",
              url: "https://www.slashfilm.com/1093851/theres-a-simple-answer-to-the-question-why-are-the-simpsons-yellow"
            }
          ],
          basis: "Yellow skin, like every Simpson."
        },
        {
          pool: "toons",
          name: "Bart Simpson",
          evidence: "credible",
          sources: [
            {
              title: "/Film: Why the Simpsons are yellow",
              url: "https://www.slashfilm.com/1093851/theres-a-simple-answer-to-the-question-why-are-the-simpsons-yellow"
            }
          ],
          basis: "Yellow skin, like every Simpson."
        },
        {
          pool: "toons",
          name: "Lisa Simpson",
          evidence: "credible",
          sources: [
            {
              title: "/Film: Why the Simpsons are yellow",
              url: "https://www.slashfilm.com/1093851/theres-a-simple-answer-to-the-question-why-are-the-simpsons-yellow"
            }
          ],
          basis: "Yellow skin, like every Simpson."
        },
        {
          pool: "pokemon",
          name: "Pikachu",
          evidence: "credible",
          sources: [
            {
              title: "RankedBoost: Yellow Pokémon by colour",
              url: "https://rankedboost.com/pokemon/color/yellow/"
            }
          ],
          basis: "Listed yellow by colour."
        },
        {
          pool: "pokemon",
          name: "Raichu",
          evidence: "credible",
          sources: [
            {
              title: "RankedBoost: Yellow Pokémon by colour",
              url: "https://rankedboost.com/pokemon/color/yellow/"
            }
          ],
          basis: "Listed yellow by colour."
        },
        {
          pool: "pokemon",
          name: "Sandshrew",
          evidence: "credible",
          sources: [
            {
              title: "RankedBoost: Yellow Pokémon by colour",
              url: "https://rankedboost.com/pokemon/color/yellow/"
            }
          ],
          basis: "Listed yellow by colour."
        },
        {
          pool: "pokemon",
          name: "Sandslash",
          evidence: "credible",
          sources: [
            {
              title: "RankedBoost: Yellow Pokémon by colour",
              url: "https://rankedboost.com/pokemon/color/yellow/"
            }
          ],
          basis: "Listed yellow by colour."
        },
        {
          pool: "pokemon",
          name: "Psyduck",
          evidence: "credible",
          sources: [
            {
              title: "RankedBoost: Yellow Pokémon by colour",
              url: "https://rankedboost.com/pokemon/color/yellow/"
            }
          ],
          basis: "Listed yellow by colour."
        },
        {
          pool: "pokemon",
          name: "Meowth",
          evidence: "credible",
          sources: [
            {
              title: "RankedBoost: Yellow Pokémon by colour",
              url: "https://rankedboost.com/pokemon/color/yellow/"
            }
          ],
          basis: "Listed yellow by colour."
        },
        {
          pool: "pokemon",
          name: "Persian",
          evidence: "credible",
          sources: [
            {
              title: "RankedBoost: Yellow Pokémon by colour",
              url: "https://rankedboost.com/pokemon/color/yellow/"
            }
          ],
          basis: "Listed yellow by colour."
        },
        {
          pool: "pokemon",
          name: "Electabuzz",
          evidence: "credible",
          sources: [
            {
              title: "RankedBoost: Yellow Pokémon by colour",
              url: "https://rankedboost.com/pokemon/color/yellow/"
            }
          ],
          basis: "Listed yellow by colour."
        },
        {
          pool: "pokemon",
          name: "Jolteon",
          evidence: "credible",
          sources: [
            {
              title: "RankedBoost: Yellow Pokémon by colour",
              url: "https://rankedboost.com/pokemon/color/yellow/"
            }
          ],
          basis: "Listed yellow by colour."
        },
        {
          pool: "pokemon",
          name: "Zapdos",
          evidence: "credible",
          sources: [
            {
              title: "RankedBoost: Yellow Pokémon by colour",
              url: "https://rankedboost.com/pokemon/color/yellow/"
            }
          ],
          basis: "Listed yellow by colour."
        },
        {
          pool: "games",
          name: "Pikachu",
          evidence: "credible",
          sources: [
            {
              title: "RankedBoost: Yellow Pokémon by colour",
              url: "https://rankedboost.com/pokemon/color/yellow/"
            }
          ],
          basis: "Listed yellow by colour."
        },
        {
          pool: "toons",
          name: "SpongeBob SquarePants",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia: SpongeBob SquarePants (character)",
              url: "https://en.wikipedia.org/wiki/SpongeBob_SquarePants_(character)"
            }
          ],
          basis: "Yellow tube sponge."
        },
        {
          pool: "toons",
          name: "Tweety",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia: Tweety",
              url: "https://en.wikipedia.org/wiki/Tweety"
            }
          ],
          basis: "Yellow canary."
        },
        {
          pool: "games",
          name: "Pac-Man",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia: Pac-Man (character)",
              url: "https://en.wikipedia.org/wiki/Pac-Man_(character)"
            }
          ],
          basis: "Designed yellow."
        }
      ]
    },
    {
      kind: "tag",
      slug: "orange",
      name: "Oranges",
      strength: TAG_STRENGTH,
      members: [
        {
          pool: "muppets",
          name: "Fozzie Bear",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia (IPFS mirror): Fozzie Bear",
              url: "https://ipfs.ssi.eecc.de/ipns/en.wikipedia-on-ipfs.org/wiki/Fozzie_Bear"
            }
          ],
          basis: "An orange bear."
        },
        {
          pool: "muppets",
          name: "Ernie",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia (IPFS mirror): Ernie (Sesame Street)",
              url: "https://ipfs.ssi.eecc.de/ipns/en.wikipedia-on-ipfs.org/wiki/Ernie_(Sesame_Street)"
            }
          ],
          basis: "An orange Muppet."
        },
        {
          pool: "muppets",
          name: "Gobo Fraggle",
          evidence: "corroborated",
          sources: [
            {
              title: "Wikipedia: List of Fraggle Rock characters",
              url: "https://en.wikipedia.org/wiki/List_of_Fraggle_Rock_characters"
            },
            {
              title: "Muppet Wiki: Gobo Fraggle",
              url: "https://muppet.fandom.com/wiki/Gobo_Fraggle"
            }
          ],
          basis: "Orange fur."
        },
        {
          pool: "muppets",
          name: "Murray Monster",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Sesame Street monsters",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/SesameStreetMonsters"
            }
          ],
          basis: "A fluffy orange monster."
        },
        {
          pool: "toons",
          name: "Garfield",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia: Garfield (character)",
              url: "https://en.wikipedia.org/wiki/Garfield_(character)"
            }
          ],
          basis: "Orange tabby cat."
        },
        {
          pool: "games",
          name: "Crash Bandicoot",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia: Crash Bandicoot (character)",
              url: "https://en.wikipedia.org/wiki/Crash_Bandicoot_(character)"
            }
          ],
          basis: "Orange fur, chosen by elimination."
        }
      ]
    },
    {
      kind: "tag",
      slug: "purple",
      name: "Purples",
      strength: TAG_STRENGTH,
      members: [
        {
          pool: "muppets",
          name: "The Count",
          evidence: "needs-review",
          sources: [
            {
              title: "Wikipedia: Count von Count",
              url: "https://en.wikipedia.org/wiki/Count_von_Count"
            }
          ],
          basis: "Built from the Large Lavender Live Hand pattern; the page never names his colour outright."
        },
        {
          pool: "muppets",
          name: "Clifford",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia (IPFS mirror): List of Muppets",
              url: "https://ipfs.ssi.eecc.de/ipns/en.wikipedia-on-ipfs.org/wiki/List_of_Muppets"
            }
          ],
          basis: "Lavender-coloured catfish-faced character."
        },
        {
          pool: "games",
          name: "Spyro",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-games-20261113-043457-39.json",
              id: "games:Spyro"
            }
          ],
          basis: "Young purple dragon."
        },
        {
          pool: "mcu",
          name: "Thanos",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia: Thanos (Marvel Cinematic Universe)",
              url: "https://en.wikipedia.org/wiki/Thanos_(Marvel_Cinematic_Universe)"
            }
          ],
          basis: "Purple skin, lightened for the films."
        }
      ]
    },
    {
      kind: "tag",
      slug: "pink",
      name: "Pinks",
      strength: TAG_STRENGTH,
      members: [
        {
          pool: "toons",
          name: "Blossom",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: The Powerpuff Girls heroes",
              url: "https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/ThePowerpuffGirlsTheHeroes"
            }
          ],
          basis: "Her colour is pink."
        },
        {
          pool: "games",
          name: "Amy Rose",
          evidence: "credible",
          sources: [
            {
              title: "TV Tropes: Sonic Team Rose",
              url: "https://tvtropes.org/pmwiki/pmwiki.php/Characters/SonicTheHedgehogTeamRose"
            }
          ],
          basis: "Fur entirely pink."
        },
        {
          pool: "pokemon",
          name: "Clefairy",
          evidence: "credible",
          sources: [
            {
              title: "Serebii: Pink Pokédex colour list",
              url: "https://www.serebii.net/pokedex-xy/pink.shtml"
            }
          ],
          basis: "Pokédex colour: pink."
        },
        {
          pool: "pokemon",
          name: "Clefable",
          evidence: "credible",
          sources: [
            {
              title: "Serebii: Pink Pokédex colour list",
              url: "https://www.serebii.net/pokedex-xy/pink.shtml"
            }
          ],
          basis: "Pokédex colour: pink."
        },
        {
          pool: "pokemon",
          name: "Jigglypuff",
          evidence: "credible",
          sources: [
            {
              title: "Serebii: Pink Pokédex colour list",
              url: "https://www.serebii.net/pokedex-xy/pink.shtml"
            }
          ],
          basis: "Pokédex colour: pink."
        },
        {
          pool: "pokemon",
          name: "Wigglytuff",
          evidence: "credible",
          sources: [
            {
              title: "Serebii: Pink Pokédex colour list",
              url: "https://www.serebii.net/pokedex-xy/pink.shtml"
            }
          ],
          basis: "Pokédex colour: pink."
        },
        {
          pool: "pokemon",
          name: "Slowpoke",
          evidence: "credible",
          sources: [
            {
              title: "Serebii: Pink Pokédex colour list",
              url: "https://www.serebii.net/pokedex-xy/pink.shtml"
            }
          ],
          basis: "Pokédex colour: pink."
        },
        {
          pool: "pokemon",
          name: "Slowbro",
          evidence: "credible",
          sources: [
            {
              title: "Serebii: Pink Pokédex colour list",
              url: "https://www.serebii.net/pokedex-xy/pink.shtml"
            }
          ],
          basis: "Pokédex colour: pink."
        },
        {
          pool: "pokemon",
          name: "Lickitung",
          evidence: "credible",
          sources: [
            {
              title: "Serebii: Pink Pokédex colour list",
              url: "https://www.serebii.net/pokedex-xy/pink.shtml"
            }
          ],
          basis: "Pokédex colour: pink."
        },
        {
          pool: "pokemon",
          name: "Chansey",
          evidence: "credible",
          sources: [
            {
              title: "Serebii: Pink Pokédex colour list",
              url: "https://www.serebii.net/pokedex-xy/pink.shtml"
            }
          ],
          basis: "Pokédex colour: pink."
        },
        {
          pool: "pokemon",
          name: "Mr. Mime",
          evidence: "credible",
          sources: [
            {
              title: "Serebii: Pink Pokédex colour list",
              url: "https://www.serebii.net/pokedex-xy/pink.shtml"
            }
          ],
          basis: "Pokédex colour: pink."
        },
        {
          pool: "pokemon",
          name: "Mew",
          evidence: "credible",
          sources: [
            {
              title: "Serebii: Pink Pokédex colour list",
              url: "https://www.serebii.net/pokedex-xy/pink.shtml"
            }
          ],
          basis: "Pokédex colour: pink."
        },
        {
          pool: "toons",
          name: "Patrick Star",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia: Patrick Star",
              url: "https://en.wikipedia.org/wiki/Patrick_Star"
            }
          ],
          basis: "Coral-pink starfish."
        },
        {
          pool: "games",
          name: "Kirby",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia: Kirby (character)",
              url: "https://en.wikipedia.org/wiki/Kirby_(character)"
            }
          ],
          basis: "Pink, spherical body."
        },
        {
          pool: "games",
          name: "Princess Peach",
          evidence: "credible",
          sources: [
            {
              title: "Wikipedia: Princess Peach",
              url: "https://en.wikipedia.org/wiki/Princess_Peach"
            }
          ],
          basis: "Signature pink dress and colour scheme."
        }
      ]
    }
  ];

  const api = { STRENGTH: ARCHETYPE_STRENGTH, ARCHETYPE_STRENGTH, TAG_STRENGTH, PER_POOL_CAP, groups };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ArchetypeGroups = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

/* Shared archetype chemistry groups across every talent pool.
 *
 * Idea from the Marvel Ultimate Alliance 3 research note (docs/option-c/MUA3_TEAM_BONUS_RESEARCH.md): besides
 * franchise teams, a squad also gets a bonus for sharing a fighting archetype. Owner rulings 2026-11-18: sourced
 * membership, film-group strength, and ONE shared set across all pools, so members link across universes in Mashup.
 *
 * Wiring (index.html): each group registers once as GROUPS['arch:' + slug] and its id is added to the `g` list of
 * every member candidate in that member's pool. A group's points are strength x LINK_TIER[count], summed with every
 * other group and capped by LINK_CAP. No new effect type and no new cap. In a single pool only that pool's members
 * can link; in Mashup, a Martial Artist from any universe links with one from any other.
 *
 * Membership rules:
 *  - `pool` + `name` must be a playable roster entry in that pool. Groups stay selective (at most 10 per pool) and
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
 *  - Strength is 1, the same footing as the MCU film chemistry groups (owner ruling 2026-11-18). Note that Action
 *    Movies' own film groups run at 0.7.
 */
(function (root) {
  'use strict';
  const STRENGTH = 1;
  const groups = [
    {
      slug: "martial",
      name: "Martial Artists",
      strength: STRENGTH,
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
      slug: "agile",
      name: "Agile Fighters",
      strength: STRENGTH,
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
      slug: "blades",
      name: "Blades & Claws",
      strength: STRENGTH,
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
      slug: "antiheroes",
      name: "Anti-Heroes",
      strength: STRENGTH,
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
      slug: "quips",
      name: "Wisecracking Warriors",
      strength: STRENGTH,
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
          pool: "nba",
          name: "Larry Bird",
          evidence: "credible",
          sources: [
            {
              title: "Newsweek: Larry Bird named best NBA trash talker",
              url: "https://www.newsweek.com/sports/nba/legendary-celtic-named-best-nba-trash-talker-ever-12236581"
            }
          ],
          basis: "Named the best NBA trash talker ever."
        },
        {
          pool: "nba",
          name: "Gary Payton",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-nba-20261113-064635-39.json",
              id: "nba:Gary Payton"
            }
          ],
          basis: "Elite trash-talking point guard."
        },
        {
          pool: "nba",
          name: "Reggie Miller",
          evidence: "credible",
          sources: [
            {
              record: "research/option-c/batches/gemini-nba-20261113-064821-46.json",
              id: "nba:Reggie Miller"
            }
          ],
          basis: "Prolific trash talker."
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
    }
  ];

  const api = { STRENGTH, groups };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ArchetypeGroups = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

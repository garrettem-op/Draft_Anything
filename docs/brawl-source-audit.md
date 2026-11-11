# Source-linked combat evidence review

**Scope:** Battle Royale power profiles and the reported 7-role match between The Chungus and The Crossover. Cross-continuity power differences cannot be canonically quantified. Values in `data/brawl-attack-profiles.js` are deliberately bounded **game rules**, not source claims that a fictional attack deals a specified number of HP.

## Ground rules

1. **Arena knockout is not canonical death.** For abstract entities (notably Death of the Endless and Lucifer), HP represents whether a limited *arena manifestation* can continue affecting this particular contest. Defeating it in the simulation does **not** mean a physical fighter literally killed Death or permanently defeated a cosmic principle.
2. **Base/variant separation.** Baseline Joker may use toxin and devices; he does not possess Emperor Joker's borrowed fifth-dimensional reality power. Batman's base form does not inherit Hellbat's capabilities. Reusable variant powers require a reviewed `variantAbilities` record.
3. **Peak feat is not default repeatable output.** Story-dependent reality creation, world-shaping, deaths, or cosmic effects are not indefinitely repeatable blows. Selected signature moves have cooldowns, typed counters and bounded outcomes.
4. **Support roles are not fighters.** Reinforcements (Captain Carter, Wonder Woman) and commanders (Captain America, Trigon) contribute through team support; they do not get direct fighter DMG or KOs. A tremendously powerful commander can therefore register no personal DMG without being canonically weak.
5. **Source evidence versus model choices.** Sourced details are tagged below. Game abstractions—tier, penetration, cooldown, HP, force and drain percentages—are calibration choices. Any numerical estimate must be validated against seeded matches, never described as a publisher statement.

## Screenshot roster: character-by-character findings

| Character | Role | Publisher-supported abilities and limits | Model treatment |
|---|---|---|---|
| Abomination (Emil Blonsky) | Tank | Gamma radiation gave him strength comparable to Hulk; special temporary grants in later arcs are separate. [Marvel character close-up](https://www.marvel.com/comics/guides/2318/the_abomination). | Gamma-powered melee burst; ordinary version, not Chaos King. |
| Adam Warlock | Tank | Artificially created cosmic being with substantial power; Soul Gem is a featured artifact, and Magus is a distinct alternate self. [Marvel reading guide](https://www.marvel.com/comics/discover/731/adam-warlock). | Cosmic ranged signature and resilience. No default Infinity Gem ownership assumed by the simulator. |
| Hellbat Armor Batman | DPS | The armor let Batman confront Darkseid on Apokolips, but draws energy from Bruce's **metabolism**; he escaped, yet the suit nearly killed him. [DC on Batman and Robin #37](https://www.dc.com/blog/2014/12/19/this-just-happened-robin-rises-batman-falls). | Reviewed Hellbat variant; enhanced tech attacks and armor, metabolic HP wear beginning on round five; no automatic Darkseid victory. |
| Joker | DPS | Normal Joker uses customized weapons and lethal laughing toxin. No innate superhuman physiology. [Official DC profile](https://www.dc.com/characters/the-joker); [DC analysis of his conventional arsenal](https://www.dc.com/blog/2025/11/12/come-out-writing-gothamites-fight-for-the-title-of-king-omega). | Low-tier conditional toxin attack; no Emperor Joker abilities. He can still deal high DMG through positioning and longevity, but should not routinely overshadow cosmic attackers under comparable circumstances. |
| Lucifer Morningstar | DPS | Immortal archangel who attempted universe creation; his character is bound up with will, freedom, and destiny, not routine melee bouts. [Official DC profile](https://www.dc.com/characters/lucifer). | High-order reality signature with bounded cooldown; arena-avatar convention, not unbounded omnipotence. |
| Ares (DC) | Tank | God of War with great strength and combat prowess; power linked to belief and warfare, and identity has undergone revisions. [Official DC profile](https://www.dc.com/characters/ares). | Direct war-god melee profile; not free infinite gains just because battle is underway. |
| The Watcher (Uatu) | Tank | Watchers follow a noninterference oath; Uatu has sometimes intervened. [Marvel reading guide](https://www.marvel.com/comics/guides/2196/when-the-watcher-does-more-than-watch). | If actively drafted as a fighter, assumes voluntary intervention. This assumption should be disclosed, not silently used to strip him of all attacks. |
| Death of the Endless | DPS | Depicted as the personification and universal embodiment of Death, not a conventional assassin. [DC explanation](https://www.dc.com/blog/2022/08/26/the-sandman-deaths-among-us). | Limited arena presence and reality-domain interaction. HP knockout means unable to continue in the arena, **not** literal death of a cosmic constant. |
| Scarlet Witch | DPS | Chaos magic and reality alteration; House of M is a specific exceptional storyline, not the potency of every regular strike. [Marvel House of M guide](https://www.marvel.com/articles/comics/marvel-unlimited-reading-club-comics-to-read-before-house-of-m-event-starring-scarlet-witch). | Baseline hex with a bounded magical signature; House of M is a separate reviewed variant. |
| Darkseid | DPS | Immortal God of Evil with super strength, invulnerability and energy blasts; can be beaten. Omega Beams feature throughout his fights. [Official DC profile](https://www.dc.com/characters/darkseid); [DC on six battles](https://www.dc.com/blog/2026/03/05/six-infamous-darkseid-battles-and-what-they-tell-us-about-beating-him). | Bounded Omega Beam attacks; avatar-level arena encounter, not unbounded true-form intervention. |
| Captain Carter | Reinforcement | Peggy Carter has become an alternate super-soldier Captain America in a documented alternate timeline. [Marvel multiverse Captains guide](https://www.marvel.com/comics/guides/2376/captain-americas-of-the-multiverse). | Bench reinforcement only; no direct attack attribution. |
| Wonder Woman | Reinforcement | Divine/Amazon combat skills and prowess. [DC official character](https://www.dc.com/characters/wonder-woman). | Bench reinforcement only here, despite existing combat-ready source profile if fielded. |
| Captain America | Commander | Enhanced super-soldier and iconic shield use. [Marvel shield history](https://www.marvel.com/items/adamantium). | Leadership role; no personal damage registered. |
| Trigon | Commander | Ruler of hundreds of worlds, extreme cosmic powers and soul manipulation; opposed by Raven and Titans. [Official DC profile](https://www.dc.com/characters/trigon). | Commander/coach here, no direct DMG. If drafted as an active fighter, he has a separate high-order magical profile. |

## Exceptional-power coverage

All identities registered in `data/brawl-exceptional-power.js` now also have a direct, identity-scoped attack profile with a source and **limitation** in `data/brawl-attack-profiles.js`: Anti-Monitor, Mxyzptlk, Lucifer, Doctor Manhattan, Spectre, Darkseid, Dream, Death, Franklin Richards, Scarlet Witch, Galactus, Watcher, Morgoth, Manwë, Varda, Ulmo, Aulë, Tulkas, God Emperor Doom, Rune King Thor, White Phoenix, Infinity Ultron, and Darkest Knight.

For LOTR/Silmarillion figures where publisher feat guides are not accessible, entries rely on [Tolkien Gateway](https://tolkiengateway.net/) as a secondary summary; these are marked as editorial abstractions and may require primary-text review. Generic character-directory citations are not treated as definitive proof of a specific attack; their limitations are called out.

## Outstanding interpretive questions (not code defects)

- Should all baseline Adam Warlock selections include the Soul Gem, or should possession of major artifacts be an explicit variant/equipment choice?
- Should the game offer separate **cosmic avatars** and **unrestricted narrative entities** instead of placing Death, Lucifer or Mxyzptlk into a standard HP arena? The current proxy makes mechanical comparisons possible but cannot simulate metaphysical omnipotence faithfully.
- Should Joker's equipment be constrained by encounter assumptions (prep, sealed armor, poison delivery) rather than treating every toxin attempt as universally applicable?
- Should armor-specific resistance to toxins be curated after a verified Hellbat source, instead of inferring immunity from the existence of a powered suit?

These are game-design decisions needing explicitly stated rules, not assertions about a universal canonical result.

## Maintenance standard
For every future exceptional profile, require identity+continuity, named technique, attack domain, defense/resistance domains, source URL, limitation, and regression coverage. No unsourced narrative claim may silently become a combat multiplier.

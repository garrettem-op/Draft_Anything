/* Archetype chemistry groups for the Marvel (MCU) pool.
 *
 * Idea from the Marvel Ultimate Alliance 3 research note (docs/option-c/MUA3_TEAM_BONUS_RESEARCH.md): besides
 * franchise teams, a squad also gets a bonus for sharing a fighting archetype. These groups plug into the
 * existing chemistry machinery in index.html (SYN_DEF): a group's points are strength x LINK_TIER[count], summed
 * with every other group and capped by LINK_CAP. They add no new effect type and no new cap.
 *
 * Membership rules:
 *  - A member must be playable in the MCU pool and show the trait ON SCREEN in the MCU (film, series or short).
 *    MUA3 lists come from comics lore; `mua3: true` only records that the fan guide lists that character in the
 *    matching affiliation. Comics feats are not copied to the MCU entry.
 *  - `basis` says what is shown on screen, worded no more strongly than the cited pages say it.
 *  - `sources` are pages that were fetched and checked against the basis on 2026-11-18. `evidence` uses the owner's
 *    evidence standard (2026-11-10): 'corroborated' = a second source on a different site agrees; 'credible' = one
 *    source documents the specific trait; 'needs-review' = a source names the detail but does not place it in a
 *    film or scene (still a member; flagged for a second source).
 *  - Strength is 1, the same footing as the film chemistry groups (owner ruling 2026-11-18, chosen over the weaker
 *    0.5 tier used for cross-film trait groups such as Sharpshooters, Airborne and Heavyweights).
 */
(function (root) {
  'use strict';
  const STRENGTH = 1;

  const S = {
    daredevil: { title: 'TV Tropes: MCU Daredevil', url: 'https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUDaredevil' },
    ironFist: { title: 'TV Tropes: MCU Iron Fist', url: 'https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/MCUIronFist' },
    gamora: { title: 'TV Tropes: MCU Gamora', url: 'https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/MCUGamora' },
    shangChi: { title: 'TV Tropes: MCU Shang-Chi', url: 'https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/MCUShangChi' },
    widow: { title: 'TV Tropes: MCU Black Widow', url: 'https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUBlackWidow' },
    yelenaTv: { title: 'TV Tropes: MCU Yelena Belova', url: 'https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUYelenaBelova' },
    yelenaWp: { title: 'Wikipedia: Yelena Belova (MCU section)', url: 'https://en.wikipedia.org/wiki/Yelena_Belova' },
    elektra: { title: 'TV Tropes: MCU Elektra Natchios', url: 'https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/MCUElektraNatchios' },
    stickWp: { title: 'Wikipedia: Stick (character)', url: 'https://en.wikipedia.org/wiki/Stick_(character)' },
    spider: { title: 'TV Tropes: MCU Spider-Man', url: 'https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUSpiderMan' },
    panther: { title: 'TV Tropes: MCU T\'Challa', url: 'https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUTChalla' },
    hawkeye: { title: 'TV Tropes: MCU Hawkeye', url: 'https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUHawkeye' },
    wolverine: { title: 'MCU Wiki: Wolverine', url: 'https://marvelcinematicuniverse.fandom.com/wiki/Wolverine' },
    deadpool: { title: 'TV Tropes: Deadpool (X-Men film series)', url: 'https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/XMenFilmSeriesDeadpool' },
    draxTv: { title: 'TV Tropes: MCU Drax the Destroyer', url: 'https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/MCUDraxTheDestroyer' },
    draxWiki: { title: 'MCU Wiki: Drax the Destroyer', url: 'https://marvelcinematicuniverse.fandom.com/wiki/Drax_the_Destroyer' },
    guardians: { title: 'TV Tropes: MCU Guardians of the Galaxy', url: 'https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUGuardiansOfTheGalaxy' },
    killmonger: { title: 'TV Tropes: MCU Erik Stevens', url: 'https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUErikStevens' },
    valkyrie: { title: 'Marvel Codex: Valkyrie (MCU)', url: 'https://marvelcodex.com/valkyrie_mcu' },
    punisher: { title: 'TV Tropes: MCU The Punisher', url: 'https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/MCUThePunisher' },
    moonKnight: { title: 'TV Tropes: MCU Moon Knight', url: 'https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/MCUMoonKnight' },
    bucky: { title: 'TV Tropes: MCU Bucky Barnes', url: 'https://tvtropes.org/pmwiki/pmwiki.php/Characters/MCUBuckyBarnes' },
    ironMan: { title: 'TV Tropes: MCU Iron Man', url: 'https://www.tvtropes.org/pmwiki/pmwiki.php/Characters/MCUIronMan' }
  };

  const groups = [
    {
      pool: 'mcu', slug: 'martial', name: 'Martial Artists', strength: STRENGTH, mua3Affiliation: 'Martial Artists',
      members: [
        { name: 'Daredevil', mua3: true, evidence: 'credible', sources: [S.daredevil], basis: 'Trained martial artist shown across the Daredevil series.' },
        { name: 'Iron Fist', mua3: true, evidence: 'credible', sources: [S.ironFist], basis: 'K\'un-Lun martial arts training shown in the Iron Fist series.' },
        { name: 'Gamora', mua3: true, evidence: 'credible', sources: [S.gamora], basis: 'Deadly hand-to-hand fighter shown across the Guardians films.' },
        { name: 'Shang-Chi', mua3: false, evidence: 'credible', sources: [S.shangChi], basis: 'Ten Rings martial arts training shown in Shang-Chi and the Legend of the Ten Rings.' },
        { name: 'Black Widow', mua3: false, evidence: 'credible', sources: [S.widow], basis: 'Red Room hand-to-hand training shown across her MCU appearances.' },
        { name: 'Yelena Belova', mua3: false, evidence: 'corroborated', sources: [S.yelenaTv, S.yelenaWp], basis: 'Red Room-trained fighter shown in Black Widow and Hawkeye.' },
        { name: 'Elektra', mua3: false, evidence: 'credible', sources: [S.elektra], basis: 'Martial artist trained from childhood by the Chaste, shown in Daredevil season 2.' },
        { name: 'Stick', mua3: false, evidence: 'corroborated', sources: [S.stickWp, S.daredevil], basis: 'Mentor who trains Matt Murdock to fight, shown in Daredevil season 1.' }
      ]
    },
    {
      pool: 'mcu', slug: 'agile', name: 'Agile Fighters', strength: STRENGTH, mua3Affiliation: 'Agile Fighters',
      members: [
        { name: 'Spider-Man', mua3: true, evidence: 'credible', sources: [S.spider], basis: 'Wall-crawling, web-swinging acrobatic fighter shown across the MCU films.' },
        { name: 'Black Panther', mua3: true, evidence: 'credible', sources: [S.panther], basis: 'Parkour-style acrobatic combat shown in Black Panther.' },
        { name: 'Black Widow', mua3: true, evidence: 'credible', sources: [S.widow], basis: 'Flips-and-slides acrobatic fighting style shown across the MCU films.' },
        { name: 'Daredevil', mua3: true, evidence: 'credible', sources: [S.daredevil], basis: 'Parkour and acrobatic corridor fighting shown in the Daredevil series.' },
        { name: 'Iron Fist', mua3: true, evidence: 'credible', sources: [S.ironFist], basis: 'Parkour and free-running combat shown in the Iron Fist series.' },
        { name: 'Hawkeye', mua3: true, evidence: 'credible', sources: [S.hawkeye], basis: 'Acrobatic fighting shown in the Hawkeye series.' }
      ]
    },
    {
      pool: 'mcu', slug: 'blades', name: 'Blades & Claws', strength: STRENGTH, mua3Affiliation: 'Cutting Edge',
      members: [
        { name: 'Wolverine', mua3: true, evidence: 'credible', sources: [S.wolverine], basis: 'Retractable adamantium claws shown in Deadpool & Wolverine.' },
        { name: 'Deadpool', mua3: true, evidence: 'credible', sources: [S.deadpool], basis: 'Twin katanas shown in the Deadpool films.' },
        { name: 'Drax', mua3: true, evidence: 'corroborated', sources: [S.draxTv, S.draxWiki], basis: 'Twin knives shown in the Guardians films.' },
        { name: 'Gamora', mua3: true, evidence: 'credible', sources: [S.gamora], basis: 'Signature sword shown in the Guardians films.' },
        { name: 'Black Panther', mua3: true, evidence: 'credible', sources: [S.panther], basis: 'Vibranium suit claws shown in Black Panther.' },
        { name: 'Killmonger', mua3: false, evidence: 'credible', sources: [S.killmonger], basis: 'Vibranium suit claws shown in Black Panther.' },
        { name: 'Elektra', mua3: false, evidence: 'credible', sources: [S.elektra], basis: 'Sai-wielding fighter shown in Daredevil season 2.' },
        { name: 'Valkyrie', mua3: false, evidence: 'needs-review', sources: [S.valkyrie], basis: 'Wields a sword she calls Dragonfang per one community wiki; no film or scene named.' }
      ]
    },
    {
      pool: 'mcu', slug: 'antiheroes', name: 'Anti-Heroes', strength: STRENGTH, mua3Affiliation: 'Anti-Heroes',
      members: [
        { name: 'Deadpool', mua3: true, evidence: 'credible', sources: [S.deadpool], basis: 'Mercenary anti-hero with a warped moral code, shown in the Deadpool films.' },
        { name: 'Wolverine', mua3: true, evidence: 'credible', sources: [S.wolverine], basis: 'Gruff, violent loner who reluctantly teams up, shown in Deadpool & Wolverine.' },
        { name: 'The Punisher', mua3: false, evidence: 'credible', sources: [S.punisher], basis: 'Lethal vigilante shown in Daredevil season 2 and The Punisher.' },
        { name: 'Moon Knight', mua3: false, evidence: 'credible', sources: [S.moonKnight], basis: 'Brutal, lethal vigilante shown in the Moon Knight series.' },
        { name: 'Winter Soldier', mua3: false, evidence: 'credible', sources: [S.bucky], basis: 'Brainwashed HYDRA assassin turned atoning ally, shown across the MCU films.' }
      ]
    },
    {
      pool: 'mcu', slug: 'quips', name: 'Wisecracking Warriors', strength: STRENGTH, mua3Affiliation: 'Wise Cracking Warriors',
      members: [
        { name: 'Deadpool', mua3: true, evidence: 'credible', sources: [S.deadpool], basis: 'Constant jokes and fourth-wall breaks shown in the Deadpool films.' },
        { name: 'Rocket', mua3: true, evidence: 'credible', sources: [S.guardians], basis: 'Sarcastic quips shown throughout the Guardians films.' },
        { name: 'Star-Lord', mua3: true, evidence: 'credible', sources: [S.guardians], basis: 'Jokey talk-his-way-out style shown throughout the Guardians films.' },
        { name: 'Spider-Man', mua3: false, evidence: 'credible', sources: [S.spider], basis: 'Talks and quips through fights, shown across the MCU films.' },
        { name: 'Iron Man', mua3: false, evidence: 'credible', sources: [S.ironMan], basis: 'Sarcastic quips during fights, shown across the MCU films.' }
      ]
    }
  ];

  const api = { STRENGTH, groups };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ArchetypeGroups = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

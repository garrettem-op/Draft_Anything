/* Archetype chemistry groups for the Marvel (MCU) pool.
 *
 * Idea from the Marvel Ultimate Alliance 3 research note (docs/option-c/MUA3_TEAM_BONUS_RESEARCH.md): besides
 * franchise teams, a squad also gets a small bonus for sharing a fighting archetype. These groups plug into the
 * existing chemistry machinery in index.html (SYN_DEF): a group's points are strength x LINK_TIER[count], summed
 * with every other group and capped by LINK_CAP. They add no new effect type and no new cap.
 *
 * Membership rules:
 *  - A member must be playable in the MCU pool and show the trait ON SCREEN in the MCU (film, series or short).
 *    MUA3 lists come from comics lore; `mua3: true` only records that the fan guide lists that character in the
 *    matching affiliation. Comics feats are not copied to the MCU entry.
 *  - `basis` says what is shown on screen. Membership is an editorial judgment (like the other chemistry groups)
 *    and has NOT passed the whole-roster audit; it can change without notice.
 *  - Strength is 0.5, the same as the game's other trait groups (Sharpshooters, Airborne, Heavyweights).
 */
(function (root) {
  'use strict';
  const STRENGTH = 0.5;
  const groups = [
    {
      pool: 'mcu', slug: 'martial', name: 'Martial Artists', strength: STRENGTH, mua3Affiliation: 'Martial Artists',
      members: [
        { name: 'Daredevil', mua3: true, basis: 'Trained martial artist shown in the Daredevil series.' },
        { name: 'Iron Fist', mua3: true, basis: 'K\'un-Lun martial arts training shown in the Iron Fist series.' },
        { name: 'Gamora', mua3: true, basis: 'Hand-to-hand fighter shown across the Guardians films.' },
        { name: 'Shang-Chi', mua3: false, basis: 'Ten Rings martial arts shown in Shang-Chi and the Legend of the Ten Rings.' },
        { name: 'Black Widow', mua3: false, basis: 'Red Room hand-to-hand training shown in the Avengers films and Black Widow.' },
        { name: 'Yelena Belova', mua3: false, basis: 'Red Room hand-to-hand training shown in Black Widow and Hawkeye.' },
        { name: 'Elektra', mua3: false, basis: 'Ninja-trained fighter shown in Daredevil season 2.' },
        { name: 'Stick', mua3: false, basis: 'Blind martial arts master shown in Daredevil season 1.' }
      ]
    },
    {
      pool: 'mcu', slug: 'agile', name: 'Agile Fighters', strength: STRENGTH, mua3Affiliation: 'Agile Fighters',
      members: [
        { name: 'Spider-Man', mua3: true, basis: 'Acrobatic wall-crawling fighter shown across the MCU films.' },
        { name: 'Black Panther', mua3: true, basis: 'Acrobatic combat shown in Civil War and Black Panther.' },
        { name: 'Black Widow', mua3: true, basis: 'Acrobatic fighter shown in the Avengers films.' },
        { name: 'Daredevil', mua3: true, basis: 'Acrobatic corridor and rooftop fighting shown in the Daredevil series.' },
        { name: 'Iron Fist', mua3: true, basis: 'Acrobatic martial arts shown in the Iron Fist series.' },
        { name: 'Hawkeye', mua3: true, basis: 'Acrobatic archer shown in the Avengers films and the Hawkeye series.' }
      ]
    },
    {
      pool: 'mcu', slug: 'blades', name: 'Blades & Claws', strength: STRENGTH, mua3Affiliation: 'Cutting Edge',
      members: [
        { name: 'Wolverine', mua3: true, basis: 'Adamantium claws shown on screen.' },
        { name: 'Deadpool', mua3: true, basis: 'Twin katanas shown in the Deadpool films.' },
        { name: 'Drax', mua3: true, basis: 'Twin knives shown in the Guardians films.' },
        { name: 'Gamora', mua3: true, basis: 'Godslayer sword shown in Guardians of the Galaxy Vol. 2.' },
        { name: 'Black Panther', mua3: true, basis: 'Vibranium suit claws shown in Black Panther.' },
        { name: 'Killmonger', mua3: false, basis: 'Vibranium suit claws shown in Black Panther.' },
        { name: 'Elektra', mua3: false, basis: 'Sai shown in Daredevil season 2.' },
        { name: 'Valkyrie', mua3: false, basis: 'Dragonfang sword shown in Thor: Ragnarok and Thor: Love and Thunder.' }
      ]
    },
    {
      pool: 'mcu', slug: 'antiheroes', name: 'Anti-Heroes', strength: STRENGTH, mua3Affiliation: 'Anti-Heroes',
      members: [
        { name: 'Deadpool', mua3: true, basis: 'Amoral mercenary who ends up on the heroes\' side in Deadpool & Wolverine.' },
        { name: 'Wolverine', mua3: true, basis: 'Violent loner shown in Deadpool & Wolverine.' },
        { name: 'The Punisher', mua3: false, basis: 'Lethal vigilante shown in Daredevil season 2 and The Punisher.' },
        { name: 'Moon Knight', mua3: false, basis: 'Violent vigilante shown in the Moon Knight series.' },
        { name: 'Winter Soldier', mua3: false, basis: 'Reformed assassin shown in the Falcon and the Winter Soldier series.' }
      ]
    },
    {
      pool: 'mcu', slug: 'quips', name: 'Wisecracking Warriors', strength: STRENGTH, mua3Affiliation: 'Wise Cracking Warriors',
      members: [
        { name: 'Deadpool', mua3: true, basis: 'Constant fourth-wall-breaking jokes in the Deadpool films.' },
        { name: 'Rocket', mua3: true, basis: 'Sarcastic quips throughout the Guardians films.' },
        { name: 'Star-Lord', mua3: true, basis: 'Joking style throughout the Guardians films.' },
        { name: 'Spider-Man', mua3: false, basis: 'Quips while fighting, shown across the MCU films.' },
        { name: 'Iron Man', mua3: false, basis: 'Sarcastic quips while fighting, shown across the MCU films.' }
      ]
    }
  ];

  const api = { STRENGTH, groups };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ArchetypeGroups = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

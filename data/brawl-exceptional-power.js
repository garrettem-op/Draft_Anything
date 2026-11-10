/* Canon-work-grounded EXCEPTIONAL REALITY-LEVEL combat effects.
 * This is intentionally NOT a generic 'magic' or 'psychic' multiplier.
 * A documented realm-creating or multiverse-changing feat is separate from
 * 12 physical/athletic attributes, and should keep such characters competitive
 * with substantial ToonForce. All bonuses are editorial Battle Royale points,
 * not official canonical numeric measurements. Variant forms remain separate.
 */
const BRAWL_EXCEPTIONAL_POWER=Object.freeze({
  "dc:Anti-Monitor": [
    60,
    "Crisis on Infinite Earths: annihilates universes with antimatter waves.",
    "https://www.dc.com/characters/anti-monitor",
    "Defeated through multiversal resistance and concentrated counteraction."
  ],
  "dc:Mister Mxyzptlk": [
    55,
    "Superman comics: fifth-dimensional reality transformations and spatial manipulation.",
    "https://www.dc.com/blog/2024/05/02/invasion-of-the-imps-five-magical-pranksters-from-the-fifth-dimension",
    "Trickable under the backwards-name banishment rule."
  ],
  "dc:Lucifer Morningstar": [
    55,
    "Lucifer and The Sandman: archangel who attempts to create a new universe.",
    "https://www.dc.com/characters/lucifer",
    "Free will, destiny and narrative context constrain applications."
  ],
  "dc:Doctor Manhattan": [
    51,
    "Watchmen / Doomsday Clock: disintegrates and reconstitutes matter; temporal awareness.",
    "https://www.dc.com/blog/2024/08/28/we-may-have-been-entirely-wrong-about-why-doctor-manhattan-goes-to-mars",
    "Nondeterministic human decisions and prior story limits apply."
  ],
  "dc:The Spectre": [
    52,
    "Crisis on Infinite Earths: divine vengeance entity opposes Anti-Monitor.",
    "https://www.dc.com/characters",
    "Dependent on a human host and divine mission."
  ],
  "dc:Darkseid": [
    42,
    "DC Fourth World: Omega Effect and tremendous godlike destructive force.",
    "https://www.dc.com/characters/darkseid",
    "Avatars and true form are not interchangeable."
  ],
  "dc:Dream of the Endless": [
    45,
    "The Sandman: Dream governs the dream realm and shapes dream reality.",
    "https://www.dc.com/characters",
    "Most potent within dream narrative, not an automatic waking-world win."
  ],
  "dc:Death of the Endless": [
    45,
    "The Sandman: personification of death and endpoint of mortal existence.",
    "https://www.dc.com/blog/2022/08/26/the-sandman-deaths-among-us",
    "Usually a metaphysical function, not an offensive brawler."
  ],
  "mcu:Franklin Richards": [
    55,
    "Fantastic Four: reality creation and cosmic alteration by Franklin Richards.",
    "https://www.marvel.com/comics/discover/2513/the-children-of-the-fantastic-four",
    "Powers vary by age, depletion and comic arc."
  ],
  "mcu:Scarlet Witch": [
    46,
    "House of M and Scarlet Witch stories: alters the fabric of reality through chaos magic.",
    "https://www.marvel.com/comics/discover/606/marvel-mystics",
    "Magical competence, focus and continuity vary."
  ],
  "mcu:Galactus": [
    47,
    "Fantastic Four cosmic stories: world-consuming being powered by the Power Cosmic.",
    "https://www.marvel.com/teams-and-groups/heralds-of-galactus",
    "Power varies with hunger, heralds and particular plot."
  ],
  "mcu:The Watcher": [
    40,
    "What If...? multiverse: Watcher observes and sometimes intervenes across realities.",
    "https://www.marvel.com/characters",
    "Vow of non-interference and screen/comic continuities differ."
  ],
  "lotr:Morgoth (Melkor)": [
    47,
    "The Silmarillion: fallen Vala shapes and corrupts matter and world history.",
    "https://tolkiengateway.net/wiki/Morgoth",
    "Fallen form increasingly diminished and disperses power into Arda."
  ],
  "lotr:Manwë": [
    45,
    "The Silmarillion: lord of the winds and highest authority among Valar in Arda.",
    "https://tolkiengateway.net/wiki/Manw%C3%AB",
    "Authority is not the same as an automatic instant physical knockout."
  ],
  "lotr:Varda (Elbereth)": [
    45,
    "The Silmarillion: kindles the stars and commands great light.",
    "https://tolkiengateway.net/wiki/Varda",
    "Cosmic creation is not a literal repeatable arena attack."
  ],
  "lotr:Ulmo": [
    43,
    "The Silmarillion: great Vala of waters, oceans and seas.",
    "https://tolkiengateway.net/wiki/Ulmo",
    "Domain powers depend on environment and divine form."
  ],
  "lotr:Aulë": [
    40,
    "The Silmarillion: Vala crafts the substance of the world and fathers the Dwarves.",
    "https://tolkiengateway.net/wiki/Aul%C3%AB",
    "Creative power is not unconstrained combat omnipotence."
  ],
  "lotr:Tulkas": [
    40,
    "The Silmarillion: champion of the Valar renowned for direct physical combat.",
    "https://tolkiengateway.net/wiki/Tulkas",
    "Great strength does not automatically counter all magic."
  ],
  "mcu:God Emperor Doom": [
    64,
    "Secret Wars (2015): Doom wields power stolen from the Beyonders over Battleworld.",
    "https://www.marvel.com/articles/comics/secret-wars-official-marvel-guide",
    "Temporary form depends on stolen power; not baseline Doctor Doom."
  ],
  "mcu:Rune King Thor": [
    57,
    "Thor (1998) #80–85: Thor attains runic insight and breaks the Ragnarok cycle.",
    "https://www.marvel.com/characters/thor-thor-odinson/in-comics",
    "Story-specific ascension and not Thor's regular arsenal."
  ],
  "mcu:White Phoenix of the Crown": [
    59,
    "Phoenix Saga / New X-Men: White Phoenix reaches high order Phoenix consciousness.",
    "https://www.marvel.com/characters/jean-grey-phoenix/in-comics",
    "Requires the Phoenix Force; continuity-dependent."
  ],
  "mcu:Infinity Ultron": [
    57,
    "What If...? (2021): Ultron controls Infinity Stones across multiversal encounters.",
    "https://www.marvel.com/tv-shows/animation/what-if/1",
    "Requires Stones and specific What If...? continuity."
  ],
  "dc:The Darkest Knight": [
    61,
    "Dark Nights: Death Metal: Batman Who Laughs assumes Doctor Manhattan-class power.",
    "https://www.dc.com/graphic-novels/dark-nights-death-metal-2020",
    "Temporary alternate-universe transformation."
  ]
});
function brawlExceptionalPower(candidate,sportKey,pos){
 if(!candidate||sportKey!=='brawl'||!pos||pos.coach||pos.bench)return 0;
 const rec=BRAWL_EXCEPTIONAL_POWER[candidate.pool+':'+candidate.n];
 return rec?rec[0]:0;
}
if(typeof module!=='undefined'&&module.exports)module.exports={
 BRAWL_EXCEPTIONAL_POWER,brawlExceptionalPower
};

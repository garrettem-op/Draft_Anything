/* Individually scoped Campaign decisions for documented alternate forms.
 * The form is identified by BOTH original universe/character and exact title.
 * These are not inherited blindly from baseline combatant tags.
 * All other tags remain pending until specifically assessed.
 */
'use strict';
const records=Object.create(null);
function yes(id,name,tag,reason,source){
 const key=id+'|'+name; (records[key]??={})[tag]={decision:'yes',reason,source};
}
function no(id,name,tag,reason,source){
 const key=id+'|'+name; (records[key]??={})[tag]={decision:'no',reason,source};
}
const poke='https://www.pokemon.com/pokedex/';
const galar='https://swordshield.pokemon.com/en-us/pokemon-galar-region/gigantamax-snorlax/';
const sonic='https://sonic.sega.jp/SonicChannel/character/supersonic.html';
const sonicManual='https://manuals.sega.com/wp-content/uploads/2022/06/SM_Sonic_Origin_En_220617.pdf';

// Contrasts are material: a regular Snorlax is under eight feet, but Gigantamax Snorlax is 114+ feet.
yes('pokemon:Snorlax','Gigantamax Snorlax','giants','Official Gigantamax Snorlax height is 114 ft 10 in+, explicitly far beyond the challenge threshold.',galar);
yes('pokemon:Vulpix','Alolan Vulpix','ice','Alolan Vulpix is Ice type and freezes prey with extremely cold breath.','https://sg.portal-pokemon.com/pokedex/0037_1/');
no('pokemon:Vulpix','Alolan Vulpix','fire','Alolan Vulpix is an Ice-type regional form, unlike the Fire-type Kantonian form.','https://www.pokemon.com/br/pokedex/0037');
yes('pokemon:Ninetales','Alolan Ninetales','ice','Alolan Ninetales uses freezing attacks and has Ice/Fairy typing.','https://unite.pokemon.com/en-us/pokemon/alolan-ninetales/');
no('pokemon:Ninetales','Alolan Ninetales','fire','The Alolan form is explicitly Ice/Fairy, unlike the Fire-type Kantonian form.','https://www.pokemon.com/uk/pokedex/ninetales');
yes('games:Sonic the Hedgehog','Super Sonic','flight','SEGA explicitly describes the Chaos Emerald-powered Super Sonic transformation as capable of flight.',sonic);
yes('games:Sonic the Hedgehog','Hyper Sonic','flight','The Hyper form is obtained using Super Emeralds and retains aerial Super Sonic transformation abilities.',sonicManual);
yes('games:Shadow the Hedgehog','Super Shadow','flight','The Chaos Emerald powered Super Shadow form flies in the final battle with Devil Doom.','Sonic the Hedgehog (2005) · The Last Way');
yes('games:Mario','Fire Mario','fire','Fire Flower transformation permits Mario to throw fireballs.','Super Mario Bros. (1985)');
yes('games:Mario','Ice Mario','ice','Ice Flower form enables Mario to throw iceballs that freeze enemies.','New Super Mario Bros. Wii (2009)');
yes('games:Mario','Mega Mario','giants','Mega Mushroom makes Mario enormous relative to his standard size.','New Super Mario Bros. (2006)');
yes('games:Mario','Tanooki Mario','flight','Tanooki Suit grants sustained tail-powered glide and flight when charged.','Super Mario Bros. 3 (1988)');
yes('games:Luigi','Ice Luigi','ice','Ice Flower transforms Luigi into an iceball-throwing character.','New Super Mario Bros. Wii (2009)');
yes('games:Bowser','Giga Bowser','giants','Giga Bowser is an enormous transformed form compared with the baseline fighter.','Super Smash Bros. Melee (2001)');
yes('games:Bowser','Fury Bowser','fire','Fury Bowser fires enormous flame attacks in the Bowser Fury confrontation.','Super Mario 3D World + Bowser’s Fury (2021)');
yes('games:Bowser','Fury Bowser','giants','Fury Bowser is a giant kaiju-sized transformation.','Super Mario 3D World + Bowser’s Fury (2021)');
yes('games:Charizard','Mega Charizard X','fire','Mega Charizard X retains flame breath, shown in its mega form.',poke+'charizard');
yes('games:Charizard','Mega Charizard X','flight','Mega Charizard X retains functional wings and flight.',poke+'charizard');
yes('games:Charizard','Mega Charizard Y','fire','Mega Charizard Y is a Fire/Flying mega evolution with enhanced flame attacks.',poke+'charizard');
yes('games:Charizard','Mega Charizard Y','flight','Mega Charizard Y is a Fire/Flying mega evolution with functional winged flight.',poke+'charizard');
yes('games:Mewtwo','Mega Mewtwo X','psychic','Mega Mewtwo X remains a Psychic-type Pokémon and uses psychic techniques.',poke+'mewtwo');
yes('games:Mewtwo','Mega Mewtwo Y','psychic','Mega Mewtwo Y remains a Psychic-type Pokémon and uses psychic techniques.',poke+'mewtwo');
yes('pokemon:Mewtwo','Mega Mewtwo X','psychic','Mega Mewtwo X retains the Psychic type and psychic powers.',poke+'mewtwo');
yes('pokemon:Mewtwo','Mega Mewtwo Y','psychic','Mega Mewtwo Y retains the Psychic type and psychic powers.',poke+'mewtwo');
for(const id of ['pokemon:Charizard']){
 for(const name of ['Mega Charizard X','Mega Charizard Y','Gigantamax Charizard']){
  yes(id,name,'fire','This Charizard form retains flame-producing attacks.',poke+'charizard');
  yes(id,name,'flight','This form retains Charizard’s functional flying wings and aerial combat.',poke+'charizard');
 }
 yes(id,'Gigantamax Charizard','giants','Gigantamax produces a towering, stadium-scale enlargement.','Pokémon Sword and Shield (2019)');
}
for(const [id,name,src] of [
 ['pokemon:Venusaur','Gigantamax Venusaur',poke+'venusaur'],
 ['pokemon:Blastoise','Gigantamax Blastoise',poke+'blastoise'],
 ['pokemon:Pikachu','Gigantamax Pikachu',poke+'pikachu'],
 ['pokemon:Eevee','Gigantamax Eevee',poke+'eevee'],
 ['pokemon:Gengar','Gigantamax Gengar',poke+'gengar'],
 ['pokemon:Machamp','Gigantamax Machamp',poke+'machamp'],
 ['pokemon:Lapras','Gigantamax Lapras',poke+'lapras'],
 ['pokemon:Kingler','Gigantamax Kingler',poke+'kingler'],
 ['pokemon:Butterfree','Gigantamax Butterfree',poke+'butterfree'],
 ['pokemon:Meowth','Gigantamax Meowth',poke+'meowth']
]){
 yes(id,name,'giants','Gigantamax dramatically enlarges the Pokémon beyond eight feet.',src);
}
for(const [id,name] of [['pokemon:Butterfree','Gigantamax Butterfree'],['pokemon:Pidgeot','Mega Pidgeot'],['pokemon:Beedrill','Mega Beedrill'],['pokemon:Pinsir','Mega Pinsir'],['pokemon:Aerodactyl','Mega Aerodactyl']]){
 yes(id,name,'flight','This transformed species has functional wings or mega-evolution flight capabilities.',poke+id.split(':')[1].toLowerCase());
}
yes('pokemon:Lapras','Gigantamax Lapras','aquatic','Lapras retains its aquatic nature and water-based attacks while Gigantamaxed.',poke+'lapras');
yes('pokemon:Kingler','Gigantamax Kingler','aquatic','Kingler retains its aquatic crab physiology while Gigantamaxed.',poke+'kingler');
yes('pokemon:Pikachu','Gigantamax Pikachu','electric','Gigantamax Pikachu retains its electrical abilities and G-Max Volt Crash.',poke+'pikachu');
yes('pokemon:Raichu','Alolan Raichu','electric','Alolan Raichu remains Electric type.',poke+'raichu');
yes('pokemon:Raichu','Alolan Raichu','psychic','Alolan Raichu is Electric/Psychic rather than standard pure Electric.',poke+'raichu');
for(const [id,name] of [['pokemon:Sandshrew','Alolan Sandshrew'],['pokemon:Sandslash','Alolan Sandslash']])
 yes(id,name,'ice','Alolan form is an Ice/Steel species with freezing abilities.',poke+id.split(':')[1].toLowerCase());
yes('pokemon:Marowak','Alolan Marowak','fire','Alolan Marowak wields a flaming spectral bone; its type is Fire/Ghost.',poke+'marowak');
yes('pokemon:Exeggutor','Alolan Exeggutor','giants','Alolan Exeggutor stands more than 30 feet tall with an elongated neck.',poke+'exeggutor');
yes('pokemon:Alakazam','Mega Alakazam','psychic','Mega Alakazam retains potent psychic abilities.',poke+'alakazam');
yes('pokemon:Slowbro','Mega Slowbro','psychic','Mega Slowbro remains Water/Psychic and possesses Psychic-type powers.',poke+'slowbro');
yes('pokemon:Slowbro','Galarian Slowbro','psychic','Galarian Slowbro retains the Psychic type alongside Poison.',poke+'slowbro');

for(const name of ['Bleeding Edge Iron Man','Model Prime Iron Man','Superior Iron Man','Godbuster Iron Man','Nanotech Mark L']){
 yes('mcu:Iron Man',name,'tech','This Iron Man form is built around advanced engineered armor and onboard weapon systems.','Marvel Comics · '+name);
}
yes('mcu:Captain America','Worthy Captain America','electric','Steve Rogers summons lightning while wielding Mjolnir in the Battle of Earth.','Avengers: Endgame (2019)');
yes('mcu:Captain America','Worthy Captain America','magic','Mjolnir is an enchanted Asgardian weapon used in this form.','Avengers: Endgame (2019)');
yes('mcu:Thor','Rune King Thor','magic','Runic ascension and runic workings are the defining power of this form.','Thor (1998) #84–85');
yes('mcu:Scarlet Witch','House of M Scarlet Witch','magic','Chaos magic performs the large-scale reality rewrite in House of M.','House of M (2005) #7–8');
yes('mcu:Doctor Doom','God Emperor Doom','magic','God Emperor Doom uses his own sorcery with stolen Beyonders’ power.','Secret Wars (2015)');
yes('mcu:Doctor Doom','Sorcerer Supreme Doctor Doom','magic','Doctor Doom is depicted wielding Sorcerer Supreme-class spellcasting.','Marvel Comics · Sorcerer Supreme Doom');
yes('mcu:Hulk','Immortal Hulk','healing','The Immortal Hulk storyline explicitly gives resurrection and regenerative return through the Green Door.','The Immortal Hulk (2018)');
yes('mcu:Spider-Man','Iron Spider','tech','Iron Spider is a technologically advanced armored suit with mechanical legs.','Avengers: Infinity War (2018)');
yes('mcu:Thanos','Infinity Gauntlet Thanos','teleport','With the six Infinity Gems the Gauntlet can instantly relocate its wielder through space.','The Infinity Gauntlet (1991)');
yes('mcu:Ultron','Infinity Ultron','tech','Ultron remains an engineered AI inhabiting synthetic technology even in the Infinity Stone form.','What If...? (2021), episode 8');
yes('dc:Batman','Hellbat Armor Batman','tech','The Hellbat suit is an engineered armor system built for combat against metahuman and cosmic foes.','Batman and Robin (2014) #33–37');
yes('dc:Supergirl (Kara Zor-El)','Red Lantern Supergirl','red','The Red Lantern transformation is visually distinguished by its red Lantern uniform.','Red Lanterns (2014) #28');
yes('dc:Batman','Red Death Batman','red','Red Death is depicted in a distinctive crimson speedster armor.','Dark Nights: Metal (2017)');
yes('dc:Blue Beetle (Jaime Reyes)','Khaji Da Full-Control Beetle','tech','The Khaji Da armor is a fully active alien technological exosuit.','DC Comics · Blue Beetle');
yes('lotr:Gandalf','Gandalf the White','magic','Restored Gandalf uses supernatural Maia power and spells.','The Lord of the Rings · The Two Towers');
yes('lotr:Gandalf','Olórin (Uncloaked Maia)','magic','Olórin is a Maia spirit with supernatural capabilities beyond an ordinary human.','The Silmarillion · Valaquenta');
yes('harrypotter:Albus Dumbledore','Dumbledore with Elder Wand','magic','The Elder Wand is a legendary magical wand wielded by Dumbledore.','Harry Potter and the Deathly Hallows');
yes('harrypotter:Lord Voldemort','Voldemort with Elder Wand','magic','Voldemort attempts curses using the Elder Wand during the Battle of Hogwarts.','Harry Potter and the Deathly Hallows');
yes('harrypotter:Minerva McGonagall','McGonagall (Animagus Cat)','magic','McGonagall’s transformation into a cat is magical Animagus work.','Harry Potter and the Philosopher’s Stone');
yes('harrypotter:Rita Skeeter','Rita Skeeter (Beetle Animagus)','stealth','Rita secretly spies on Hogwarts conversations in unregistered beetle Animagus form.','Harry Potter and the Goblet of Fire');
yes('toons:Mickey Mouse',"Sorcerer's Apprentice Mickey",'magic','Mickey performs supernatural enchantments using his borrowed sorcerer’s hat.','Fantasia (1940)');
yes('toons:Aang','Avatar State Aang','aquatic','Avatar State grants amplified waterbending and water control.','Avatar: The Last Airbender · Book One finale');
yes('toons:Aang','Avatar State Aang','ice','Avatar State can freeze water into large ice structures.','Avatar: The Last Airbender · The Storm');
yes('toons:Elsa','Fifth Spirit Elsa','ice','The Fifth Spirit form preserves Elsa’s powerful ice and snow generation.','Frozen II (2019)');
no('toons:Simba','Adult King Simba','kids','This explicitly is adult Simba, not a child or teenage version.','The Lion King (1994) · adult Simba');
module.exports=Object.freeze(records);

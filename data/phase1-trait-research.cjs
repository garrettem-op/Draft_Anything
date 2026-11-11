/* Character-identity decisions researched from the named narrative continuity.
 * Every key is pool-scoped; group lists are hand-selected canon identities,
 * NOT regular expressions over names or inferred from a missing grant.
 * A positive record can correct a legacy false denial.
 */
'use strict';
const OUT={};
function mark(id,tag,decision,reason,source){
 const rec=OUT[id]??={};
 if(rec[tag])throw Error('Duplicate reviewed trait '+id+' '+tag);
 rec[tag]={decision,reason,source};
}
function group(pool,names,tag,decision,reason,source){
 for(const n of names.split('|').filter(Boolean))
  mark(pool+':'+n,tag,decision,reason.replaceAll('{name}',n),source);
}
group('mcu',
 'Iron Man|Captain America|Thor|Hulk|Bruce Banner|Smart Hulk|Hawkeye|Spider-Man|Doctor Strange|Black Panther|Vision|Ant-Man|Hank Pym|Falcon|Winter Soldier|War Machine|Howard Stark|Happy Hogan|Star-Lord|Drax|Rocket|Groot|Yondu|Adam Warlock|Taserface|M\'Baku|Killmonger|Namor|Attuma|Loki|Odin|Heimdall|Korg|Hercules|Zeus|Gorr the God Butcher|Thanos|Ultron|Red Skull|Vulture|Mysterio|Green Goblin|Doc Ock|Electro|Sandman|Kang the Conqueror|Ego|Ronan the Accuser|Abomination|Whiplash|Obadiah Stane|The Collector|Grandmaster|Kaecilius|Wong|Mordo|Shang-Chi|Xu Wenwu|John Walker|Zemo|Nick Fury|Phil Coulson|Jimmy Woo|Ned Leeds|Ikaris|Gilgamesh|Kingo|Druig|Phastos|Kingpin|Daredevil|Luke Cage|Iron Fist|The Punisher|Deadpool|Wolverine|Professor X|Sentry|Bill Foster|Doctor Doom|Mister Fantastic|Human Torch|The Thing|Galactus|Mole Man|Franklin Richards|Stick|The Watcher|Erik Selvig|Bullseye',
 'women','no','{name} is portrayed as a male character in the Marvel film or comic continuity represented by the roster.','Marvel Cinematic Universe and Marvel Comics character stories');
group('dc',
 'Superman|Batman|The Flash (Barry Allen)|The Flash (Wally West)|Green Lantern (Hal Jordan)|Green Lantern (John Stewart)|Aquaman|Cyborg|Martian Manhunter|Shazam|Black Adam|Green Arrow|Hawkman|Doctor Fate|John Constantine|Swamp Thing|The Atom (Ray Palmer)|Firestorm|Plastic Man|Mister Miracle|Booster Gold|Blue Beetle (Jaime Reyes)|Red Tornado|Captain Atom|Beast Boy|Nightwing|Robin (Damian Wayne)|Red Robin (Tim Drake)|Red Hood|Alfred Pennyworth|Lucius Fox|Commissioner James Gordon|Joker|Lex Luthor|Darkseid|Doomsday|Brainiac|General Zod|Bizarro|Deathstroke|Reverse-Flash (Eobard Thawne)|Zoom (Hunter Zolomon)|Sinestro|Atrocitus|Larfleeze|Saint Walker|Black Manta|Ocean Master|Ares (DC)|Solomon Grundy|Mr. Freeze|Riddler|Penguin|Bane|Ra\'s al Ghul|Scarecrow|Clayface|Killer Croc|Two-Face|Deadshot|Peacemaker|Superboy (Conner Kent)|Jon Kent|Lobo|Etrigan|Trigon|Anti-Monitor|The Spectre|Mister Mxyzptlk|Doctor Manhattan|Lucifer Morningstar|Dream of the Endless|Static|Black Lightning|Captain Cold|Gorilla Grodd',
 'women','no','DC stories portray and refer to {name} as a male character.','DC Comics character stories');
group('starwars',
 'Luke Skywalker|Yoda|Obi-Wan Kenobi|Anakin Skywalker|Mace Windu|Qui-Gon Jinn|Plo Koon|Kit Fisto|Kanan Jarrus|Ezra Bridger|Cal Kestis|Grogu|Kylo Ren|Darth Vader|Emperor Palpatine|Darth Maul|Count Dooku|General Grievous|Savage Opress|Grand Inquisitor|Supreme Leader Snoke|Han Solo|Chewbacca|Lando Calrissian|Wedge Antilles|Nien Nunb|Admiral Ackbar|Bail Organa|Cassian Andor|K-2SO|Chirrut Îmwe|Baze Malbus|Saw Gerrera|Zeb Orrelios|Poe Dameron|Finn|R2-D2|C-3PO|BB-8|IG-11|Grand Moff Tarkin|Grand Admiral Thrawn|Director Krennic|Moff Gideon|General Hux|Boba Fett|Jango Fett|The Mandalorian|Cad Bane|Bossk|IG-88|Greedo|Cobb Vanth|Greef Karga|Kuiil|Migs Mayfeld|Captain Rex|Commander Cody|Hunter|Wrecker|Tech|Crosshair|Tobias Beckett|Dryden Vos|Jabba the Hutt|Wicket|Jar Jar Binks|Watto',
 'women','no','{name} is male or male-coded in the specific Star Wars portrayal; that character is not female.','Star Wars films, television and official character stories');
group('harrypotter',
 'Harry Potter|Ron Weasley|Albus Dumbledore|Lord Voldemort|Severus Snape|Rubeus Hagrid|Sirius Black|Remus Lupin|James Potter|Neville Longbottom|Fred Weasley|George Weasley|Arthur Weasley|Percy Weasley|Bill Weasley|Charlie Weasley|Draco Malfoy|Lucius Malfoy|Rodolphus Lestrange|Barty Crouch Jr.|Peter Pettigrew|Regulus Black|Kingsley Shacklebolt|Alastor Moody|Aberforth Dumbledore|Gellert Grindelwald|Newt Scamander|Jacob Kowalski|Credence Barebone|Theseus Scamander|Yusuf Kama|Dobby|Kreacher|Griphook|Filius Flitwick|Horace Slughorn|Gilderoy Lockhart|Quirinus Quirrell|Argus Filch|Ollivander|Cornelius Fudge|Rufus Scrimgeour|Pius Thicknesse|Cedric Diggory|Viktor Krum|Karkaroff|Oliver Wood|Seamus Finnigan|Dean Thomas|Lee Jordan|Vincent Crabbe|Gregory Goyle|Salazar Slytherin|Godric Gryffindor|Nearly Headless Nick|Bloody Baron|Peeves',
 'women','no','{name} is referred to as male in the Harry Potter novels, films or Fantastic Beasts stories.','Harry Potter novels, companion books and films');
group('lotr',
 'Frodo Baggins|Samwise Gamgee|Meriadoc Brandybuck|Peregrin Took|Bilbo Baggins|Gollum (Sméagol)|Gandalf|Saruman|Radagast|Aragorn|Boromir|Faramir|Denethor II|Elrond|Celeborn|Legolas|Gimli|Thranduil|Glorfindel|Círdan the Shipwright|Gil-galad|Celebrimbor|Isildur|Elendil|Anárion|Théoden|Éomer|Gríma Wormtongue|Treebeard|Quickbeam|Sauron|Witch-king of Angmar|Khamûl the Easterling|Mouth of Sauron|Smaug|Gwaihir|Thorondor|Landroval|Thorin Oakenshield|Balin|Dwalin|Dáin II Ironfoot|Glóin|Bard the Bowman|Beorn|Azog|Bolg|Uglúk|Shagrat|Gorbag|Troll Chieftain|Morgoth (Melkor)|Fëanor|Fingolfin|Finwë|Finarfin|Maedhros|Maglor|Celegorm|Caranthir|Curufin|Amrod|Amras|Finrod Felagund|Turgon|Tuor|Eärendil|Dior Eluchíl|Beren Erchamion|Húrin Thalion|Túrin Turambar|Thingol|Beleg Cúthalion|Mablung|Huan the Hound|Gothmog (Lord of Balrogs)|Ecthelion of the Fountain|Ar-Pharazôn|Amandil|Tar-Palantir|Tar-Aldarion|Manwë|Ulmo|Aulë|Námo (Mandos)|Irmo (Lórien)|Oromë|Tulkas|Ossë|Tilion',
 'women','no','Tolkien describes {name} as male in the relevant Middle-earth narrative or Silmarillion account.','The Lord of the Rings, The Hobbit, The Silmarillion and Tolkien writings');
group('games',
 'Mario|Luigi|Bowser|Toad|Donkey Kong|Diddy Kong|Link|Ganondorf|King Dedede|Meta Knight|Ash Ketchum|Professor Oak|Fox McCloud|Falco Lombardi|Captain Falcon|Ness|Marth|Sonic the Hedgehog|Tails|Knuckles|Dr. Eggman|Shadow the Hedgehog|Master Chief|Arbiter|Marcus Fenix|Kratos|Atreus|Nathan Drake|Sully|Joel Miller|Ratchet|Clank|Sly Cooper|Crash Bandicoot|Dr. Neo Cortex|Spyro|Solid Snake|Big Boss|Raiden|Sam Fisher|Ezio Auditore|Altaïr|Geralt of Rivia|Garrus Vakarian|Mordin Solus|Gordon Freeman|Doomguy|Duke Nukem|Pac-Man|Q*bert|Mega Man|Dr. Wily|Dr. Light|Ryu|M. Bison|Guile|Scorpion|Sub-Zero|Raiden (MK)|Liu Kang|Jin Kazama|Heihachi Mishima|Cloud Strife|Sephiroth|Sora|Chrono|Dante|Leon S. Kennedy|Albert Wesker|Steve|Calamity Ganon|Tom Nook|Rayman|Ezreal|Winston|Reinhardt|Illidan Stormrage|Arthas Menethil|Thrall|Jim Raynor|Agent 47',
 'women','no','{name} is presented as a male character in the identified video game series.','Character biography and story in the relevant video-game franchise');
group('muppets',
 'Kermit the Frog|Fozzie Bear|Gonzo|Animal|Swedish Chef|Rowlf the Dog|Beaker|Dr. Bunsen Honeydew|Statler|Waldorf|Sam Eagle|Pepe the King Prawn|Scooter|Rizzo the Rat|Robin the Frog|Dr. Teeth|Floyd Pepper|Zoot|Lips|Lew Zealand|Crazy Harry|Sweetums|Uncle Deadly|Link Hogthrob|Dr. Julius Strangepork|Marvin Suggs|Mahna Mahna|Bobo the Bear|Clifford|Walter|Constantine|Johnny Fiama|Sal Minella|Spa\'am|Bean Bunny|Beauregard|Thog|Big Mean Carl|Doglion|Seymour|The Newsman|Pops|Big Bird|Mr. Snuffleupagus|Cookie Monster|Elmo|Oscar the Grouch|Grover|The Count|Bert|Ernie|Telly Monster|Herry Monster|Baby Bear|Curly Bear|Two-Headed Monster|Guy Smiley|Mr. Johnson|Murray Monster|Frazzle|Sherlock Hemlock|Roosevelt Franklin|Barkley|Hoots the Owl|Forgetful Jones|Lefty the Salesman|The Amazing Mumford|Bruno the Trashman|Gobo Fraggle|Wembley Fraggle|Boober Fraggle|Uncle Traveling Matt|Sprocket|Doc|Junior Gorg|Pa Gorg|Cantus|Emmet Otter',
 'women','no','{name} is referred to with male pronouns in the relevant Muppet or Sesame Street portrayal.','The Muppets, Sesame Street and Fraggle Rock character appearances');
for(const [id,reason,source] of [
 ['harrypotter:Hedwig','Hedwig is Harry Potter\'s female snowy owl; the books consistently use female pronouns.','Harry Potter and the Philosopher\'s Stone'],
 ['harrypotter:Norbert (Norberta)','Hagrid learns the dragon is female and renames her Norberta.','Harry Potter and the Deathly Hallows'],
 ['lotr:Shelob','Shelob is explicitly female, referred to as she in Tolkien\'s The Two Towers.','The Lord of the Rings · The Two Towers'],
 ['mcu:Cosmo the Spacedog','Cosmo is portrayed as a female talking dog in the Guardians of the Galaxy films.','Guardians of the Galaxy Vol. 3 (2023)']
])mark(id,'women','yes',reason,source);
group('pokemon','Nidoran♂|Nidorino|Nidoking|Tauros|Hitmonlee|Hitmonchan','women','no',
 '{name} is a male-only species in the Pokédex; it is not a female character.','Pokémon National Pokédex · gender ratio');
group('pokemon','Mewtwo|Mew|Ditto|Magnemite|Magneton|Voltorb|Electrode|Staryu|Starmie|Porygon|Articuno|Zapdos|Moltres','women','no',
 '{name} is a gender-unknown or genderless species in the Pokédex, not an individually identified female.','Pokémon National Pokédex · gender information');
module.exports=Object.freeze(OUT);

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
 'Kermit the Frog|Fozzie Bear|Gonzo|Animal|Swedish Chef|Rowlf the Dog|Beaker|Dr. Bunsen Honeydew|Statler|Waldorf|Sam Eagle|Pepe the King Prawn|Scooter|Rizzo the Rat|Robin the Frog|Dr. Teeth|Floyd Pepper|Zoot|Lips|Lew Zealand|Crazy Harry|Sweetums|Uncle Deadly|Link Hogthrob|Dr. Julius Strangepork|Marvin Suggs|Mahna Mahna|Bobo the Bear|Clifford|Walter|Constantine|Johnny Fiama|Sal Minella|Spa\'am|Bean Bunny|Beauregard|Thog|Big Mean Carl|Doglion|Seymour|The Newsman|Pops|Big Bird|Mr. Snuffleupagus|Cookie Monster|Elmo|Oscar the Grouch|Grover|The Count|Bert|Ernie|Telly Monster|Herry Monster|Baby Bear|Two-Headed Monster|Guy Smiley|Mr. Johnson|Murray Monster|Frazzle|Sherlock Hemlock|Roosevelt Franklin|Barkley|Hoots the Owl|Forgetful Jones|Lefty the Salesman|The Amazing Mumford|Bruno the Trashman|Gobo Fraggle|Wembley Fraggle|Boober Fraggle|Uncle Traveling Matt|Sprocket|Doc|Junior Gorg|Pa Gorg|Cantus|Emmet Otter',
 'women','no','{name} is referred to with male pronouns in the relevant Muppet or Sesame Street portrayal.','The Muppets, Sesame Street and Fraggle Rock character appearances');

group('toons',
 'Bugs Bunny|Daffy Duck|Road Runner|Wile E. Coyote|Tasmanian Devil|Porky Pig|Speedy Gonzales|Sylvester|Tweety|Foghorn Leghorn|Yosemite Sam|Marvin the Martian|Pepé Le Pew|Elmer Fudd|Michigan J. Frog|Mickey Mouse|Donald Duck|Goofy|Pluto|Hercules|Phil|Simba|Baloo|Tarzan|Maui|Stitch|Aladdin|Genie|Jafar|King Triton|Sebastian|Beast|Gaston|Lumière|Quasimodo|Frollo|Phoebus|Scar|Mufasa|Timon|Pumbaa|Mushu|Shan Yu|Hades|Olaf|Peter Pan|Captain Hook|Buzz Lightyear|Woody|Mr. Incredible|Dash|Frozone|Sulley|Mike Wazowski|Lightning McQueen|Remy|WALL-E|Shrek|Donkey|Puss in Boots|Po|Master Shifu|SpongeBob SquarePants|Patrick Star|Squidward|Mr. Krabs|Plankton|Homer Simpson|Bart Simpson|Fred Flintstone|Barney Rubble|Scooby-Doo|Shaggy|Fred Jones|Yogi Bear|Popeye|Bluto|Optimus Prime|Megatron|Leonardo|Raphael|Michelangelo|Donatello|Master Splinter|Aang|Zuko|Uncle Iroh|Sokka|Professor Utonium|Mojo Jojo|Johnny Bravo|Dexter|Courage the Cowardly Dog|Snoopy|Charlie Brown|Garfield|Tom|Jerry|Bandit|Hank Hill|Bob Belcher|Rick Sanchez|Morty',
 'women','no','{name} is depicted as a male character in the named animated series or film; the default roster identity is not female.',
 'Original animated film or television character appearances and official franchise character descriptions');


// Adult-status review of named MCU and DC incarnations; exclude teenage/child portrayals.
group('mcu',
 'Iron Man|Captain America|Thor|Hulk|Bruce Banner|Smart Hulk|Black Widow|Hawkeye|Kate Bishop|Doctor Strange|Black Panther|Captain Marvel|Scarlet Witch|Vision|Ant-Man|The Wasp|Janet van Dyne|Hank Pym|Falcon|Winter Soldier|War Machine|Pepper Potts|Howard Stark|Happy Hogan|Star-Lord|Gamora|Drax|Rocket|Mantis|Nebula|Yondu|Cosmo the Spacedog|Adam Warlock|Taserface|Okoye|Ayo|M\'Baku|Nakia|Killmonger|Namor|Attuma|Valkyrie|Loki|Odin|Hela|Heimdall|Sif|Korg|Hercules|Zeus|Gorr the God Butcher|Thanos|Ultron|Red Skull|Vulture|Mysterio|Green Goblin|Doc Ock|Electro|Sandman|Kang the Conqueror|Ego|Ronan the Accuser|Abomination|Whiplash|Obadiah Stane|The Collector|Grandmaster|Kaecilius|Wong|The Ancient One|Mordo|Shang-Chi|Xu Wenwu|Katy|She-Hulk|Moon Knight|Yelena Belova|Red Guardian|Taskmaster|John Walker|Zemo|Sharon Carter|Agatha Harkness|Nick Fury|Maria Hill|Phil Coulson|Peggy Carter|Jimmy Woo|Darcy Lewis|Ghost|Aunt May|Ikaris|Thena|Makkari|Gilgamesh|Ajak|Kingo|Druig|Phastos|Sersi|Monica Rambeau|Echo|Kingpin|Daredevil|Jessica Jones|Luke Cage|Iron Fist|The Punisher|Deadpool|Wolverine|Professor X|Cassandra Nova|Elektra|Sentry|Valentina Allegra de Fontaine|Bill Foster|Jean Grey|Doctor Doom|Mister Fantastic|Invisible Woman|Human Torch|The Thing|H.E.R.B.I.E.|Silver Surfer|Galactus|Mole Man|Stick|The Watcher|Captain Carter|Erik Selvig|Bullseye',
 'kids','no','{name} is depicted as an adult (or adult-presenting immortal/synthetic being), not a child or teenager, in the main Marvel Cinematic Universe continuity used for this roster entry.',
 'Marvel Studios film/series character portrayals and related official Marvel character descriptions');
group('dc',
 'Superman|Batman|Wonder Woman|The Flash (Barry Allen)|The Flash (Wally West)|Green Lantern (Hal Jordan)|Green Lantern (John Stewart)|Aquaman|Mera|Cyborg|Martian Manhunter|Black Adam|Green Arrow|Black Canary|Hawkgirl|Hawkman|Zatanna|Doctor Fate|John Constantine|Swamp Thing|The Atom (Ray Palmer)|Firestorm|Plastic Man|Mister Miracle|Big Barda|Booster Gold|Red Tornado|Captain Atom|Vixen|Power Girl|Nightwing|Red Hood|Batgirl (Barbara Gordon)|Batwoman|Cassandra Cain|Catwoman|Harley Quinn|Huntress|Alfred Pennyworth|Lucius Fox|Commissioner James Gordon|Joker|Lex Luthor|Darkseid|Doomsday|Brainiac|General Zod|Bizarro|Deathstroke|Reverse-Flash (Eobard Thawne)|Zoom (Hunter Zolomon)|Sinestro|Atrocitus|Larfleeze|Saint Walker|Black Manta|Ocean Master|Cheetah|Ares (DC)|Circe|Giganta|Solomon Grundy|Poison Ivy|Mr. Freeze|Riddler|Penguin|Bane|Ra\'s al Ghul|Talia al Ghul|Scarecrow|Clayface|Killer Croc|Two-Face|Deadshot|Peacemaker|Amanda Waller|Lobo|Etrigan|Trigon|Anti-Monitor|The Spectre|Mister Mxyzptlk|Doctor Manhattan|Lucifer Morningstar|Dream of the Endless|Death of the Endless|Perpetua|Black Lightning|King Shark|Killer Frost|Captain Cold|Gorilla Grodd',
 'kids','no','{name} is depicted as an adult (or adult-presenting immortal/synthetic being), not a child or teenager, in the main DC Comics continuity used for this roster entry.',
 'DC Comics character stories and official DC identity biographies');

mark('dc:Shazam','kids','yes','Billy Batson is a teenage boy whose magic-word transformation creates an adult superhero body; his identity remains a child or teen.','https://www.dc.com/characters/shazam');
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

// Phase 1 issue #82 — Star Wars individually checked visual/age/physiology decisions.
// Color means the CHARACTER's distinctive appearance, not a red weapon or rare costume.
// Adult/child status refers to the live base incarnation; ambiguous age portrayals stay pending.
mark('starwars:Yoda','red','no',"Yoda's visible design centers on green skin and earth-toned Jedi robes, not red.","https://www.starwars.com/databank/yoda");
mark('starwars:Yoda','kids','no',"Yoda trained Jedi for centuries before meeting Luke; the roster's master is not a child or teen.","https://www.starwars.com/databank/yoda");
mark('starwars:Darth Vader','red','no',"Vader's signature appearance is black armor, cape and helmet; his red saber does not turn the character design red.","https://www.starwars.com/databank/darth-vader");
mark('starwars:Darth Vader','kids','no',"The armored Sith Lord is adult Anakin after Mustafar, not the younger boy shown in The Phantom Menace.","https://www.starwars.com/databank/darth-vader");
mark('starwars:Han Solo','red','no',"Han's standard vest, shirt and trousers are white, black and dark brown, not a distinctive red design.","https://www.starwars.com/databank/han-solo");
mark('starwars:Han Solo','kids','no',"The Millennium Falcon's captain is a grown smuggler and Rebel, not the childhood Han mentioned in his biography.","https://www.starwars.com/databank/han-solo");
mark('starwars:Chewbacca','red','no',"Chewbacca has characteristic brown fur and a bandolier, not red coloring.","https://www.starwars.com/databank/chewbacca");
mark('starwars:Chewbacca','kids','no',"The long-serving Wookiee co-pilot and veteran is an adult, not a youngling.","https://www.starwars.com/databank/chewbacca");
mark('starwars:R2-D2','red','no',"Artoo's familiar astromech housing is principally white and blue, not a red design.","https://www.starwars.com/databank/r2-d2");
mark('starwars:R2-D2','kids','no',"R2-D2 is the established astromech serving Padmé, Anakin and Luke, not a child or teen persona.","https://www.starwars.com/databank/r2-d2");
mark('starwars:C-3PO','red','no',"Threepio's iconic protocol-droid body is gold-toned rather than distinctively red; an occasional red arm is not his defining design.","https://www.starwars.com/databank/c-3po");
mark('starwars:C-3PO','kids','no',"Threepio is a built and programmed protocol droid, not a child or teen identity.","https://www.starwars.com/databank/c-3po");
mark('starwars:BB-8','red','no',"BB-8's standard spherical shell is white with orange accents, not red.","https://www.starwars.com/databank/bb-8");
mark('starwars:BB-8','kids','no',"BB-8 is Poe Dameron's working astromech droid, not a juvenile biological character.","https://www.starwars.com/databank/bb-8");
mark('starwars:General Grievous','red','no',"The General's pale skeletal cyborg shell and dark joints are not a predominantly red design.","https://www.starwars.com/databank/general-grievous");
mark('starwars:General Grievous','kids','no',"Grievous is a veteran Separatist general and experienced Jedi hunter, not an adolescent.","https://www.starwars.com/databank/general-grievous");
mark('starwars:Captain Phasma','red','no',"Phasma's defining salvaged-chromium armor is reflective silver, not red.","https://www.starwars.com/databank/captain-phasma");
mark('starwars:Captain Phasma','kids','no',"Phasma is a veteran First Order commander and former soldier, not a child or teenage incarnation.","https://www.starwars.com/databank/captain-phasma");
mark('starwars:Kylo Ren','red','no',"Kylo's signature robes, mask and armor are black; the red crossguard saber is equipment, not a red body or costume.","https://www.starwars.com/databank/kylo-ren");
mark('starwars:Kylo Ren','kids','no',"Ben Solo is already a grown leader of the Knights of Ren and First Order, not a school-aged child.","https://www.starwars.com/databank/kylo-ren");
mark('starwars:Grand Admiral Thrawn','red','no',"Thrawn's Chiss skin is blue and his Grand Admiral uniform white, so he lacks a distinctively red appearance.","https://www.starwars.com/databank/grand-admiral-thrawn");
mark('starwars:Grand Admiral Thrawn','kids','no',"Thrawn is an experienced adult Imperial Grand Admiral, not a child or teenage cadet.","https://www.starwars.com/databank/grand-admiral-thrawn");
mark('starwars:Jango Fett','red','no',"Jango's Mandalorian combat suit is silver and blue, rather than red.","https://www.starwars.com/databank/jango-fett");
mark('starwars:Jango Fett','kids','no',"Jango is a professional adult bounty hunter and Boba's father in Attack of the Clones.","https://www.starwars.com/databank/jango-fett");
mark('starwars:Mace Windu','red','no',"Windu wears traditional tan and brown Jedi robes and wields a purple blade, not a distinctive red design.","https://www.starwars.com/databank/mace-windu");
mark('starwars:Mace Windu','kids','no',"Windu sits on the Jedi High Council as an adult Jedi Master, not a Padawan child.","https://www.starwars.com/databank/mace-windu");
mark('starwars:Jabba the Hutt','red','no',"Jabba's standard slug-like body is brownish-green, not red.","https://www.starwars.com/databank/jabba-the-hutt");
mark('starwars:Jabba the Hutt','kids','no',"Jabba is an established adult criminal lord in Return of the Jedi, not a juvenile Hutt.","https://www.starwars.com/databank/jabba-the-hutt");
mark('starwars:Boba Fett','red','no',"Boba's iconic Mandalorian armor is mainly green with mixed accents, not a red signature suit.","https://www.starwars.com/databank/boba-fett");
mark('starwars:Boba Fett','kids','no',"This baseline is the adult bounty hunter of the original trilogy and Book of Boba Fett; his documented Clone Wars childhood is a different age portrayal.","https://www.starwars.com/databank/boba-fett");
mark('starwars:The Mandalorian','red','no',"Din Djarin's default beskar armor is metallic gray and brown, not a red uniform.","https://www.starwars.com/databank/the-mandalorian");
mark('starwars:The Mandalorian','kids','no',"Din is an adult bounty hunter and guardian of Grogu, rather than the childhood version recalled in flashbacks.","https://www.starwars.com/databank/the-mandalorian");
mark('starwars:Chopper','red','no',"The official profile specifies Chopper's orange-and-yellow astromech paint, not red.","https://www.starwars.com/databank/chopper");
mark('starwars:Chopper','kids','no',"The long-serving patched astromech of the Ghost crew is not a child or teen portrayal.","https://www.starwars.com/databank/chopper");
mark('starwars:IG-11','red','no',"IG-11's standard thin assassin-droid chassis is metallic gray, not distinctively red.","https://www.starwars.com/databank/ig-11");
mark('starwars:IG-11','kids','no',"IG-11 is a programmed assassin droid and later nurse droid, not a child or teen character.","https://www.starwars.com/databank/ig-11");
mark('starwars:Battle Droid','red','no',"The standard B1 battle droid has a tan mechanical chassis, not a red signature design.","https://www.starwars.com/databank/battle-droid");
mark('starwars:Battle Droid','kids','no',"The B1 is a manufactured Separatist infantry machine, not a child or adolescent individual.","https://www.starwars.com/databank/battle-droid");
mark('starwars:Droideka','red','no',"The droideka is a dark metallic/brown rolling destroyer robot, not a red-dominant character.","https://www.starwars.com/databank/droideka");
mark('starwars:Droideka','kids','no',"A droideka is a purpose-built destroyer droid, not a child or teen incarnation.","https://www.starwars.com/databank/droideka");
mark('starwars:Grogu','red','no',"Grogu has green skin and generally beige/brown clothing, not a distinctively red design.","https://www.starwars.com/databank/grogu");
mark('starwars:Omega','red','no',"Omega's normal Bad Batch appearance has blonde hair and practical neutral-toned clothes, not a distinctively red design.","https://www.starwars.com/databank/omega");
mark('starwars:R2-D2','mortal','no',"R2-D2 is an astromech robot with mechanical tools and circuitry, not ordinary human physiology.","https://www.starwars.com/databank/r2-d2");
mark('starwars:C-3PO','mortal','no',"C-3PO is a manufactured humanoid protocol droid, not a biologically ordinary human.","https://www.starwars.com/databank/c-3po");
mark('starwars:BB-8','mortal','no',"BB-8 is a rolling astromech robot, so lacks ordinary human physiology.","https://www.starwars.com/databank/bb-8");
mark('starwars:Chopper','mortal','no',"C1-10P is a patched mechanical astromech droid, not a human with ordinary physiology.","https://www.starwars.com/databank/chopper");
mark('starwars:IG-11','mortal','no',"IG-11 is a programmed armored assassin droid, not an ordinary human organism.","https://www.starwars.com/databank/ig-11");
mark('starwars:Battle Droid','mortal','no',"The B1 is a programmed manufactured mechanical soldier, not an ordinary human.","https://www.starwars.com/databank/battle-droid");
mark('starwars:Droideka','mortal','no',"A droideka is a transforming destroyer robot with shields and blasters, not human physiology.","https://www.starwars.com/databank/droideka");
mark('starwars:Gonk Droid','mortal','no',"A Gonk is an ambulatory power-battery droid, not a biological human with ordinary physiology.","https://www.starwars.com/databank/gonk-droid");
mark('starwars:General Grievous','mortal','no',"Grievous is a heavily cybernetically reconstructed organic warrior with extraordinary mechanical limbs, not ordinary human physiology.","https://www.starwars.com/databank/general-grievous");
module.exports=Object.freeze(OUT);

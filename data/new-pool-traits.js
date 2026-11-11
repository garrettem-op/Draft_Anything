/* Explicit, universe-scoped Campaign trait classifications.
   These determine *existing* campaign themes (women, kids, mortal, red)
   without guessing gender, youth or powers from character names or stats.
   Additional power themes use the separate verified offline evidence engine. */
(function(g){
 const raw={
  women:{
    dc:'Wonder Woman|Mera|Black Canary|Hawkgirl|Zatanna|Big Barda|Vixen|Supergirl (Kara Zor-El)|Power Girl|Starfire|Raven|Batgirl (Barbara Gordon)|Batwoman|Cassandra Cain|Catwoman|Harley Quinn|Huntress|Amanda Waller|Cheetah|Circe|Giganta|Poison Ivy|Killer Frost|Death of the Endless|Perpetua',
    lotr:'Arwen Undómiel|Galadriel|Lúthien Tinúviel|Melian|Elwing|Idril Celebrindal|Aredhel|Nienor Níniel|Éowyn|Tar-Míriel|Ungoliant|Varda (Elbereth)|Vairë|Yavanna|Estë|Nienna|Vána|Nessa|Uinen|Arien',
    harrypotter:'Hermione Granger|Minerva McGonagall|Lily Potter|Luna Lovegood|Ginny Weasley|Molly Weasley|Narcissa Malfoy|Bellatrix Lestrange|Dolores Umbridge|Nymphadora Tonks|Tina Goldstein|Queenie Goldstein|Leta Lestrange|Seraphina Picquery|Nagini|Winky|Pomona Sprout|Sybill Trelawney|Madam Poppy Pomfrey|Madam Hooch|Rita Skeeter|Amelia Bones|Cho Chang|Fleur Delacour|Madame Maxime|Lavender Brown|Parvati Patil|Padma Patil|Pansy Parkinson|Rowena Ravenclaw|Helga Hufflepuff|The Grey Lady (Helena Ravenclaw)|Moaning Myrtle'
  },
  kids:{
    dc:'Robin (Damian Wayne)|Red Robin (Tim Drake)|Blue Beetle (Jaime Reyes)|Superboy (Conner Kent)|Jon Kent|Static|Beast Boy|Raven',
    harrypotter:'Harry Potter|Hermione Granger|Ron Weasley|Neville Longbottom|Luna Lovegood|Ginny Weasley|Fred Weasley|George Weasley|Draco Malfoy|Regulus Black|Cho Chang|Cedric Diggory|Seamus Finnigan|Dean Thomas|Lavender Brown|Parvati Patil|Padma Patil|Lee Jordan|Pansy Parkinson|Vincent Crabbe|Gregory Goyle|Oliver Wood'
  },
  mortal:{
    dc:'Batman|Green Arrow|Nightwing|Robin (Damian Wayne)|Red Robin (Tim Drake)|Red Hood|Batgirl (Barbara Gordon)|Batwoman|Cassandra Cain|Catwoman|Harley Quinn|Huntress|Alfred Pennyworth|Lucius Fox|Commissioner James Gordon|Joker|Lex Luthor|Riddler|Penguin|Talia al Ghul|Scarecrow|Two-Face|Deadshot|Peacemaker|Amanda Waller',
    lotr:'Frodo Baggins|Samwise Gamgee|Meriadoc Brandybuck|Peregrin Took|Bilbo Baggins|Aragorn|Boromir|Faramir|Denethor II|Théoden|Éowyn|Éomer|Gríma Wormtongue|Gimli|Thorin Oakenshield|Balin|Dwalin|Dáin II Ironfoot|Glóin|Bard the Bowman|Beren Erchamion|Húrin Thalion|Túrin Turambar|Nienor Níniel|Ar-Pharazôn|Elendil|Isildur|Anárion|Amandil',
    harrypotter:'Jacob Kowalski|Argus Filch'
  },
  red:{
    dc:'Superman|Supergirl (Kara Zor-El)|The Flash (Barry Allen)|The Flash (Wally West)|Shazam|Robin (Damian Wayne)|Red Hood|Atrocitus|Harley Quinn',
    lotr:'Smaug',
    harrypotter:'Fawkes'
  }
 };

 // Cross-universe trait review: the same four rules apply to every talent pool.
 // Universe-scoped keys prevent characters with the same name inheriting each other's traits.
 const expanded={
 women:{
   muppets:"Miss Piggy|Camilla the Chicken|Janice|Hilda|Annie Sue|Gladys the Cow|Abby Cadabby|Zoe|Rosita|Prairie Dawn|Curly Bear|Bernice|Ji-Young|Grundgetta|Mokey Fraggle|Red Fraggle|Ma Gorg|Cotterpin Doozer|Ma Otter",
   games:"Princess Peach|Zelda|Samus Aran|Amy Rose|Cortana|Ellie|Aloy|Lara Croft|Yennefer|Ciri|Jill Valentine|Tifa Lockhart|Aerith Gainsborough|Chun-Li|Ms. Pac-Man|Bayonetta|Isabelle|Jinx|Tracer|Widowmaker|Sarah Kerrigan|Chell|Alyx Vance|GLaDOS",
   toons:"Lola Bunny|Minnie Mouse|Mulan|Moana|Elsa|Anna|Ariel|Ursula|Belle|Esmeralda|Lilo|Snow White|Cinderella|Maleficent|Jasmine|Violet|Elastigirl|Edna Mode|Tigress|Sandy Cheeks|Marge Simpson|Lisa Simpson|Velma|Katara|Toph Beifong|Blossom|Bubbles|Buttercup|Lucy van Pelt|Peppermint Patty|Bluey",
   pokemon:"Nidoran♀|Nidorina|Nidoqueen|Kangaskhan|Jynx|Chansey",
   starwars:"Leia Organa|Padmé Amidala|Rey|Ahsoka Tano|Aayla Secura|Asajj Ventress|Reva|Jyn Erso|Mon Mothma|Hera Syndulla|Sabine Wren|Rose Tico|Admiral Holdo|Maz Kanata|Bo-Katan Kryze|Fennec Shand|Aurra Sing|Cara Dune|Captain Phasma|Omega|Qi'ra|Enfys Nest"
 },
 kids:{
   muppets:"Elmo|Abby Cadabby|Zoe|Baby Bear|Robin the Frog|Curly Bear|Ji-Young|Little Bird",
   games:"Atreus|Ellie|Ness|Ash Ketchum",
   toons:"Dash|Violet|Bluey|Bart Simpson|Lisa Simpson|Morty|Blossom|Bubbles|Buttercup|Aang|Katara|Toph Beifong|Sokka|Zuko|Lilo|Charlie Brown|Lucy van Pelt|Peppermint Patty|Peter Pan|Dexter",
   starwars:"Grogu|Omega|Ezra Bridger"
 },
 mortal:{
   games:"Nathan Drake|Sully|Joel Miller|Ellie|Lara Croft|Sam Fisher|Ezio Auditore|Altaïr|Leon S. Kennedy|Jill Valentine|Aloy|Chell|Alyx Vance",
   toons:"Mulan|Moana|Phil|Tarzan|Shaggy|Velma|Fred Jones|Hank Hill|Bob Belcher|Sokka|Marge Simpson|Lisa Simpson|Bart Simpson|Charlie Brown|Peppermint Patty|Anna|Lilo|Aladdin|Jasmine|Belle|Gaston|Frollo|Phoebus|Cinderella|Snow White|Captain Hook",
   starwars:"Han Solo|Lando Calrissian|Wedge Antilles|Nien Nunb|Admiral Ackbar|Mon Mothma|Bail Organa|Padmé Amidala|Jyn Erso|Cassian Andor|Saw Gerrera|Baze Malbus|Hera Syndulla|Sabine Wren|Poe Dameron|Finn|Rose Tico|Admiral Holdo|Grand Moff Tarkin|Grand Admiral Thrawn|Director Krennic|Moff Gideon|Stormtrooper|Death Trooper|Captain Phasma|General Hux|Boba Fett|Jango Fett|The Mandalorian|Bo-Katan Kryze|Cad Bane|Fennec Shand|Aurra Sing|Greedo|Cara Dune|Cobb Vanth|Greef Karga|Kuiil|Migs Mayfeld|Captain Rex|Commander Cody|Qi'ra|Tobias Beckett|Enfys Nest"
 },
 red:{
   mcu:"Iron Man|Spider-Man|Scarlet Witch|Vision|Red Guardian|Red Skull|Daredevil|Deadpool|Human Torch|Star-Lord",
   toons:"Lightning McQueen|Mr. Incredible|Elastigirl|Blossom|Optimus Prime|Raphael|Mickey Mouse|Minnie Mouse|Yosemite Sam|Mr. Krabs|Mushu|Sebastian|Ariel|Lisa Simpson",
   muppets:"Animal|Elmo|Red Fraggle|Frazzle",
   games:"Mario|Knuckles|Diddy Kong|Amy Rose|Blinky|Dante|M. Bison|Wreck-It Ralph",
   pokemon:"Charmeleon|Krabby|Kingler|Magmar|Voltorb|Electrode|Paras|Parasect|Vileplume|Jynx|Flareon",
   starwars:"Darth Maul",
   dc:"Red Robin (Tim Drake)|Batwoman"
 }
 };
 for(const [trait,groups] of Object.entries(expanded)){
   raw[trait]||={};
   for(const [pool,entries] of Object.entries(groups))
     raw[trait][pool]=[raw[trait][pool],entries].filter(Boolean).join('|');
 }

 g.DA_NEW_POOL_TRAITS=Object.fromEntries(Object.entries(raw).map(([trait,byPool])=>[
   trait,Object.fromEntries(Object.entries(byPool).map(([pool,names])=>[pool,new Set(names.split('|'))]))
 ]));

 const sourceNotes=Object.freeze({
   'red:games:Blinky':{reason:'Blinky is PAC-MAN’s red ghost.',url:'https://www.namcogames.com/_guides/User_Guide_-_PAC-MAN_Plus_by_Namco.pdf'},
   'red:muppets:Red Fraggle':{reason:'Red Fraggle has a distinct red/orange signature design.',url:'https://www.henson.com/fraggle-rock/'},
   'red:muppets:Elmo':{reason:'Elmo is a red-furred Sesame Street Muppet.',url:'https://www.sesameworkshop.org/characters'},
   'red:lotr:Glaurung':{reason:'Glaurung is described as golden, not red.',url:'https://tolkiengateway.net/wiki/Glaurung',excluded:true},
   'red:games:Scorpion':{reason:'Scorpion’s signature design is yellow, not red.',url:'https://www.mortalkombat.com/',excluded:true},
   'red:starwars:Savage Opress':{reason:'Savage Opress has yellow and black markings, not red.',url:'https://www.starwars.com/databank/savage-opress',excluded:true},
   'red:pokemon:Charmander':{reason:'Charmander is orange, not red.',url:'https://www.pokemon.com/us/pokedex/charmander',excluded:true}
 });
 g.DA_CAMPAIGN_TRAIT_EVIDENCE=(candidate,trait)=>{
   if(!candidate?.pool||!candidate?.n||!trait)return null;
   const note=sourceNotes[trait+':'+candidate.pool+':'+candidate.n];
   if(note?.excluded)return {allowed:false,...note,trait,pool:candidate.pool,name:candidate.n};
   if(!g.DA_NEW_POOL_TRAITS?.[trait]?.[candidate.pool]?.has(candidate.n))return null;
   return {allowed:true,trait,pool:candidate.pool,name:candidate.n,
     reason:note?.reason||'Curated '+trait+' classification for this universe.',
     source:note?.url||'built-in-campaign-traits'};
 };
 g.DA_NEW_POOL_HAS_TRAIT=(candidate,trait)=>g.DA_CAMPAIGN_TRAIT_EVIDENCE(candidate,trait)?.allowed===true;
})(window);

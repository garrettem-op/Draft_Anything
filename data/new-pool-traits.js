/* Explicit, universe-scoped starting Campaign identity classifications.
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
 g.DA_NEW_POOL_TRAITS=Object.fromEntries(Object.entries(raw).map(([trait,byPool])=>[
   trait,Object.fromEntries(Object.entries(byPool).map(([pool,names])=>[pool,new Set(names.split('|'))]))
 ]));
 g.DA_NEW_POOL_HAS_TRAIT=(candidate,trait)=>!!g.DA_NEW_POOL_TRAITS?.[trait]?.[candidate?.pool]?.has(candidate?.n);
})(window);

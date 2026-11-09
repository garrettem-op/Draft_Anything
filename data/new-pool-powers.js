/* Hand-curated, conservative initial power tags for the three new pools.
   Each key is scoped to the exact roster identity; unverified and conditional
   variant feats are NOT automatically carried into the base form.
   Claude will supply claim-level sources in data/pool-lore-*.js afterward.
   This file is free, static, offline, and causes NO model/API calls. */
(function(g){
  const raw={
    flight:{
      dc:'Superman|Wonder Woman|Green Lantern (Hal Jordan)|Green Lantern (John Stewart)|Martian Manhunter|Shazam|Black Adam|Hawkgirl|Hawkman|Firestorm|Captain Atom|Supergirl (Kara Zor-El)|Power Girl|Starfire|Raven|Cyborg|Booster Gold|Blue Beetle (Jaime Reyes)|Red Tornado|Superboy (Conner Kent)|Jon Kent|Krypto|Darkseid|General Zod|Bizarro|Sinestro|Atrocitus|Saint Walker|Larfleeze|Anti-Monitor|Trigon|The Spectre|Doctor Manhattan',
      lotr:'Eärendil|Elwing|Smaug|Gwaihir|Thorondor|Landroval|Ancalagon the Black|Arien|Tilion',
      harrypotter:'Harry Potter|Ron Weasley|Hermione Granger|Ginny Weasley|Fred Weasley|George Weasley|Draco Malfoy|Cho Chang|Cedric Diggory|Viktor Krum|Oliver Wood|Madam Hooch|Severus Snape|Lord Voldemort|Fawkes|Hedwig|Buckbeak|Thestral|Norbert (Norberta)|Hungarian Horntail|Thunderbird (Frank)'
    },
    magic:{
      dc:'Wonder Woman|Shazam|Black Adam|Zatanna|Doctor Fate|John Constantine|Raven|Swamp Thing|Etrigan|Circe|The Spectre|Trigon|Mister Mxyzptlk|Lucifer Morningstar|Dream of the Endless|Death of the Endless|Doctor Manhattan',
      lotr:'Gandalf|Saruman|Radagast|Sauron|Morgoth (Melkor)|Melian|Lúthien Tinúviel|Finrod Felagund|Galadriel|Elrond|Varda (Elbereth)|Manwë|Ulmo|Aulë|Yavanna|Námo (Mandos)|Vairë|Irmo (Lórien)|Estë|Nienna|Oromë|Vána|Tulkas|Nessa|Ossë|Uinen|Arien|Tilion',
      harrypotter:'Queenie Goldstein|Dobby|Kreacher|Winky'
    },
    psychic:{
      dc:'Martian Manhunter|Raven|Gorilla Grodd|Trigon|Doctor Fate',
      lotr:'Glaurung|Sauron|Melian',
      harrypotter:'Lord Voldemort|Albus Dumbledore|Severus Snape|Queenie Goldstein'
    },
    aquatic:{
      dc:'Aquaman|Mera|Black Manta|Ocean Master|King Shark',
      lotr:'Ulmo|Ossë|Uinen',
      harrypotter:''
    },
    fire:{
      dc:'Firestorm|Etrigan',
      lotr:'Smaug|Glaurung|Ancalagon the Black|Durin\'s Bane|Gothmog (Lord of Balrogs)|Morgoth (Melkor)|Arien|Gandalf',
      harrypotter:'Lord Voldemort|Albus Dumbledore|Hungarian Horntail|Norbert (Norberta)|Fawkes'
    },
    ice:{
      dc:'Killer Frost|Captain Cold|Mr. Freeze',
      lotr:'',
      harrypotter:''
    },
    electric:{
      dc:'Shazam|Black Adam|Black Lightning|Static',
      lotr:'',
      harrypotter:''
    },
    tech:{
      dc:'Batman|Cyborg|Lex Luthor|Booster Gold|Blue Beetle (Jaime Reyes)|Red Tornado|Captain Atom|Mister Miracle|Black Manta|Mr. Freeze|Captain Cold|Brainiac|Firestorm|Lucius Fox|The Atom (Ray Palmer)|Amanda Waller',
      lotr:'',
      harrypotter:''
    },
    stealth:{
      dc:'Batman|Nightwing|Robin (Damian Wayne)|Red Robin (Tim Drake)|Red Hood|Batgirl (Barbara Gordon)|Batwoman|Cassandra Cain|Catwoman|Huntress|Ra\'s al Ghul|Talia al Ghul|Deathstroke|Deadshot|Harley Quinn',
      lotr:'Gollum (Sméagol)|Frodo Baggins|Bilbo Baggins',
      harrypotter:'Harry Potter|Severus Snape|Dobby|Kreacher'
    },
    teleport:{
      dc:'Doctor Fate|Raven|Darkseid|Mister Mxyzptlk|Lucifer Morningstar|The Spectre|Trigon',
      lotr:'',
      harrypotter:'Albus Dumbledore|Lord Voldemort|Severus Snape|Minerva McGonagall|Sirius Black|Remus Lupin|Bellatrix Lestrange|Kingsley Shacklebolt|Nymphadora Tonks|Alastor Moody|Newt Scamander|Tina Goldstein|Gellert Grindelwald|Dobby|Kreacher|Winky|Hermione Granger|Harry Potter|Ron Weasley'
    },
    healing:{
      dc:'Swamp Thing|Doomsday|Lobo|Solomon Grundy|Clayface|Raven|The Spectre',
      lotr:'Elrond|Galadriel|Aragorn|Estë|Nienna|Melian',
      harrypotter:'Madam Poppy Pomfrey|Fawkes|Severus Snape|Albus Dumbledore'
    },
    giants:{
      dc:'Giganta',
      lotr:'Treebeard|Quickbeam|Smaug|Ancalagon the Black|Glaurung|Durin\'s Bane|Gothmog (Lord of Balrogs)|Ungoliant|Carcharoth|Beorn',
      harrypotter:'Rubeus Hagrid|Madame Maxime|Basilisk|Aragog|Hungarian Horntail|Norbert (Norberta)|Zouwu|Fluffy'
    }
  };
  const tags=Object.create(null);
  for(const [rule,pools] of Object.entries(raw)){
    tags[rule]=Object.create(null);
    for(const [pool,names] of Object.entries(pools)){
      tags[rule][pool]=new Set(names ? names.split('|') : []);
    }
  }
  g.DA_NEW_POOL_POWERS=tags;
  g.DA_NEW_POOL_HAS_POWER=(c,rule)=>!!tags[rule]?.[c?.pool]?.has(c?.n);
})(window);

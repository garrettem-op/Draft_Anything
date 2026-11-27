/* Draft Anything: Championship Campaign. Ten must-win challenges, persisted on this device. */
const CAMPAIGN_STAGES = [
  {name:'The Fast Lane',rule:'fast',criteria:{stats:[{attribute:'spd',op:'gte',value:90}],commanderSpecialty:true},blurb:'Only speedsters. Every pick must have Speed 90 or higher.',rival:'The Blitz'},
  {name:'Queens of the Court',rule:'women',criteria:{trait:'women'},blurb:'Women and female characters only. Use your knowledge of character identities to select your team.',rival:'The Queensguard'},
  {name:'Seeing Red',rule:'red',criteria:{trait:'red'},blurb:'Red-themed characters only: red costumes, red bodies, or a distinctly red design.',rival:'The Crimson Crew'},
  {name:'The Young Guns',rule:'kids',criteria:{trait:'kids'},blurb:'Only children and teenage characters. No adult versions.',rival:'The Young Contenders'},
  {name:'No Powers Allowed',rule:'mortal',criteria:{trait:'mortal'},blurb:'No supernatural powers or superhuman bodies. Human athleticism and skill still count.',rival:'The Mortals'},
  {name:'Big Brain Energy',rule:'brain',criteria:{stats:[{attribute:'iq',op:'gte',value:87}],commanderSpecialty:true},blurb:'Every pick must have Game IQ 87 or higher.',rival:'The Masterminds'},
  {name:'Heavy Hitters',rule:'strong',criteria:{stats:[{attribute:'str',op:'gte',value:87}],commanderSpecialty:true},blurb:'Only characters with Strength 87 or higher.',rival:'The Juggernauts'},
  {name:'The Underdogs',rule:'underdog',criteria:{stats:[{attribute:'average',op:'lte',value:73}]},blurb:'Everyone must average 73 or lower. Battle Royale starters must also have an effective role fit of 100 or lower before surging.',rival:'The Dark Horses'},
  {name:'Short-Handed',rule:'short',criteria:{lineup:{starterFraction:0.6,startersOnly:true}},blurb:'Both teams play with only 60% of their starting lineup. On a five-starter team, that means just three players; no bench or coach.',rival:'The Short-Handed Rivals'},
  {name:'The Multiverse Siege',rule:'final',criteria:{neverPreviouslyWon:true,minDistinctPools:3,encounters:2},blurb:'FINAL BATTLE: Build a full-strength alliance from at least THREE talent pools. Neither side may use characters from its earlier campaign rounds (your winning lineups, CPU opponents). Your same lineup must defeat TWO independently seeded bosses with completely different rosters in a row.',rival:'The Final Boss'}
];
const CAMPAIGN_EXTRA = [
  {name:'Skyborne',rule:'flight',criteria:{acceptedTags:['flight','natural-flight','powered-flight','glide','pilot','mount'],commanderSpecialty:true},blurb:'Every pick must be a known flyer or aerial combatant.',rival:'The Air Armada'},
  {name:'Arcane Assembly',rule:'magic',criteria:{acceptedTags:['magic','spellcaster','magic-item'],commanderSpecialty:true},blurb:'Every pick must wield magic or supernatural sorcery.',rival:'The Spellbinders'},
  {name:'Mind Games',rule:'psychic',criteria:{acceptedTags:['psychic','telepathy','telekinesis','mind-control'],commanderSpecialty:true},blurb:'Every pick must have telepathy, telekinesis, or psychic powers.',rival:'The Mind Readers'},
  {name:'Under the Sea',rule:'aquatic',criteria:{acceptedTags:['aquatic','water-breathing','swimmer','water-control'],commanderSpecialty:true},blurb:'Every pick must thrive underwater or have aquatic powers.',rival:'The Deep'},
  {name:'Inferno',rule:'fire',criteria:{acceptedTags:['fire','fire-control','fire-weapon'],commanderSpecialty:true},blurb:'Every pick must command fire or flames.',rival:'The Wildfire'},
  {name:'Cold Front',rule:'ice',criteria:{acceptedTags:['ice','ice-control','ice-weapon'],commanderSpecialty:true},blurb:'Every pick must command ice or freezing powers.',rival:'The Frostguard'},
  {name:'Shock Troopers',rule:'electric',criteria:{acceptedTags:['electric','electric-control','electric-weapon'],commanderSpecialty:true},blurb:'Every pick must wield electricity or lightning.',rival:'The Thunderbolts'},
  {name:'Tech Titans',rule:'tech',criteria:{acceptedTags:['tech','powered-armor','robot-or-ai','cyborg','gadgets','inventor'],commanderSpecialty:true},blurb:'Every pick must rely on advanced technology or armor.',rival:'The Engineers'},
  {name:'Ghost Protocol',rule:'stealth',criteria:{acceptedTags:['stealth','invisibility','infiltration'],commanderSpecialty:true},blurb:'Every pick must have documented stealth or invisibility feats.',rival:'The Shadows'},
  {name:'Blink and Miss',rule:'teleport',criteria:{acceptedTags:['teleport','self-teleport','portals','teleports-others'],commanderSpecialty:true},blurb:'Every pick must be able to teleport.',rival:'The Jumpers'},
  {name:'The Medics',rule:'healing',criteria:{acceptedTags:['healing','self-regeneration','heals-others'],commanderSpecialty:true},blurb:'Self-healing and regeneration count, as does healing other people. Every pick must have at least one of these abilities; healing teammates is NOT required.',rival:'The Lifesavers'},
  {name:'Giant Problems',rule:'giants',criteria:{acceptedTags:['giants','giant-sized','size-change'],commanderSpecialty:true},blurb:'Every pick must be documented as roughly eight feet tall or capable of giant-sized transformation.',rival:'The Colossi'},
  {name:'The Show Must Go On',rule:'muppetforce',criteria:{muppetForceMin:65},blurb:'Every pick must have documented MuppetForce of at least 65. Puppet-stage resilience, props and escalating environmental comedy count; mere puppet appearance does not.',rival:'The Reality Check'},
  // Source-world restrictions are declarative, unlike roster names. The candidate
  // list stays unfiltered: players must recognize which universes qualify.
  {name:'Saturday Morning Showdown',rule:'toons-muppets',criteria:{poolIds:['toons','muppets']},blurb:'Only cartoon and Muppet characters. No DC or Marvel superheroes. Build a team from Saturday-morning legends.',rival:'The Cartoon Network'},
  {name:'Caped Crossover',rule:'marvel-dc',criteria:{poolIds:['mcu','dc']},blurb:'Only Marvel or DC characters. Rival heroes and villains can team up.',rival:'The Crossover'},
  {name:'Wizards & Wanderers',rule:'fantasy-lands',criteria:{poolIds:['lotr','harrypotter']},blurb:'Choose ONLY from Middle-earth and the Wizarding World. No outsiders.',rival:'The Dark Tower'},
  {name:'Galactic Alliance',rule:'space-opera',criteria:{poolIds:['starwars','mcu']},blurb:'Star Wars and MCU characters only. Space-faring legends must work together.',rival:'The Galactic Fleet'},
  {name:'Pixels & Poké Balls',rule:'arcade-monsters',criteria:{poolIds:['games','pokemon']},blurb:'Video game characters and Pokémon only. Build your ultimate digital crossover.',rival:'The Final Level'},
  {name:"Tolkien's Trials",rule:'middle-earth-only',criteria:{poolIds:['lotr']},blurb:'All picks must come from Middle-earth. No imported heroes.',rival:'The Dark Lord'},
  {name:'Hogwarts Cup',rule:'wizarding-only',criteria:{poolIds:['harrypotter']},blurb:'All picks must come from the Harry Potter / Wizarding World pool.',rival:'The Death Eaters'},
  {name:'Animated Avengers',rule:'animated-party',criteria:{poolIds:['toons','muppets','games']},blurb:'Cartoons, Muppets and video games only — no direct Marvel or DC pool picks.',rival:'The Saturday Squad'},
  {name:'Legends & Monsters',rule:'mythical-three',criteria:{poolIds:['lotr','harrypotter','pokemon']},blurb:'Choose from Tolkien, Harry Potter or Pokémon. Three fantastical worlds, one team.',rival:'The Ancient Beasts'},
  {name:'Triple Crossover',rule:'triple-threat',criteria:{minDistinctPools:3},blurb:'Your lineup must represent at least THREE different talent pools. No single universe can carry the whole team.',rival:'The Multiverse'},
  {name:'Brains Before Brawn',rule:'brains-not-brawn',criteria:{stats:[{attribute:'iq',op:'gte',value:85},{attribute:'str',op:'lte',value:85}]},blurb:'Game IQ 85 or better, but Strength 85 or lower. Win with the mind, not raw power.',rival:'The Think Tank'}
];
// Challenge data is the sole source of accepted tags and numeric constraints.
// Broad tags remain accepted while Claude adds granular ability sub-tags.
// Element-specific sub-tags prevent an ice feat from proving fire powers.
const CAMPAIGN_RULE_CRITERIA = Object.freeze(Object.fromEntries(
  [...CAMPAIGN_STAGES,...CAMPAIGN_EXTRA].map(stage=>[stage.rule,stage.criteria])
));
function campaignCriteria(rule){return CAMPAIGN_RULE_CRITERIA[rule]||null;}
function campaignHasTheme(rule){return !!campaignCriteria(rule)?.acceptedTags?.length;} // Only these currently have server-side AI appeal support.
// A commander may meet a themed challenge through demonstrated tactical expertise
// rather than personal physical traits. Only the actual Commander/Coach slot may
// use these universe-scoped exceptions. Identity, age, power-ban, size and reuse
// constraints remain strict; these records are deliberately curated, not inferred
// from a character's high numerical attributes.
const CAMPAIGN_COMMANDER_SPECIALTIES = Object.freeze({
  "nba:Mike D'Antoni": {
    "fast": {
      "label": "Seven Seconds or Less",
      "focus": "spd",
      "reason": "Coaches a rapid-transition offense built around early attacks."
    }
  },
  "nba:Red Auerbach": {
    "fast": {
      "label": "Fast Break",
      "focus": "spd",
      "reason": "Uses tempo and outlet passing to get the squad moving."
    }
  },
  "nba:Don Nelson": {
    "fast": {
      "label": "Nellie Ball",
      "focus": "spd",
      "reason": "Creates an up-tempo, versatile offense."
    }
  },
  "nba:Phil Jackson": {
    "brain": {
      "label": "Triangle Offense",
      "focus": "iq",
      "reason": "Organizes a read-and-react tactical system."
    }
  },
  "nba:Gregg Popovich": {
    "brain": {
      "label": "Ball Movement",
      "focus": "iq",
      "reason": "Coaches decision-making, spacing, and collective reads."
    }
  },
  "nba:Rick Carlisle": {
    "brain": {
      "label": "Spacing and Reads",
      "focus": "iq",
      "reason": "Optimizes team spacing and situational decisions."
    }
  },
  "nba:Pat Riley": {
    "strong": {
      "label": "Smash-Mouth Defense",
      "focus": "str",
      "reason": "Builds physical, contact-oriented defensive teams."
    }
  },
  "nba:Chuck Daly": {
    "strong": {
      "label": "Bad Boys",
      "focus": "str",
      "reason": "Coordinates a physical, bruising defensive approach."
    }
  },
  "nba:Tom Thibodeau": {
    "strong": {
      "label": "Defense First",
      "focus": "str",
      "reason": "Emphasizes physical defending and contested possessions."
    }
  },
  "mcu:Nick Fury": {
    "stealth": {
      "label": "Covert Operations",
      "focus": "ref",
      "reason": "Coordinates clandestine intelligence and infiltration missions."
    }
  },
  "mcu:Peggy Carter": {
    "stealth": {
      "label": "Strategic Tradecraft",
      "focus": "ref",
      "reason": "Leads covert field operations and espionage tactics."
    }
  },
  "mcu:Maria Hill": {
    "stealth": {
      "label": "SHIELD Coordination",
      "focus": "ref",
      "reason": "Directs intelligence-led field teams and covert operations."
    }
  },
  "mcu:Shuri": {
    "tech": {
      "label": "Wakandan Engineering",
      "focus": "tch",
      "reason": "Supplies advanced Wakandan engineering and tactical systems."
    }
  },
  "mcu:Phastos": {
    "tech": {
      "label": "Eternal Inventor",
      "focus": "tch",
      "reason": "Designs advanced technology to support a team's capabilities."
    }
  },
  "mcu:Mister Fantastic": {
    "tech": {
      "label": "Fantastic Engineering",
      "focus": "tch",
      "reason": "Designs equipment and tactical technology for a team."
    }
  },
  "mcu:Professor X": {
    "psychic": {
      "label": "Telepathic Coordination",
      "focus": "iq",
      "reason": "Coordinates allies through telepathy and mental guidance."
    }
  },
  "mcu:The Ancient One": {
    "magic": {
      "label": "Mystic Instruction",
      "focus": "iq",
      "reason": "Trains and coordinates sorcerers in advanced magical discipline."
    }
  },
  "mcu:Doctor Strange": {
    "teleport": {
      "label": "Portal Coordination",
      "focus": "agi",
      "reason": "Coordinates repositioning using magic portals."
    },
    "magic": {
      "label": "Master of the Mystic Arts",
      "focus": "iq",
      "reason": "Organizes complex sorcery and magical defenses."
    }
  },
  "mcu:Ajak": {
    "healing": {
      "label": "Eternal Healer",
      "focus": "end",
      "reason": "Can sustain and heal allies through cosmic energy."
    }
  },
  "mcu:Namor": {
    "aquatic": {
      "label": "Talokan Commander",
      "focus": "end",
      "reason": "Leads underwater forces and aquatic operations."
    }
  },
  "mcu:Hank Pym": {
    "giants": {
      "label": "Size-Shifting Science",
      "focus": "str",
      "reason": "Uses Pym particle expertise to coordinate size-changing tactics."
    }
  },
  "toons:Edna Mode": {
    "tech": {
      "label": "Super-Suit Engineering",
      "focus": "tch",
      "reason": "Designs advanced equipment for super-powered teammates."
    }
  },
  "toons:Professor Utonium": {
    "tech": {
      "label": "Powerpuff Engineering",
      "focus": "tch",
      "reason": "Uses scientific invention to equip and support a team."
    }
  },
  "toons:Rick Sanchez": {
    "tech": {
      "label": "Multiverse Engineering",
      "focus": "tch",
      "reason": "Provides advanced inventions and improvisational engineering."
    }
  },
  "toons:Uncle Iroh": {
    "fire": {
      "label": "Firebending Master",
      "focus": "tch",
      "reason": "Trains others to channel firebending with control."
    }
  },
  "toons:Elsa": {
    "ice": {
      "label": "Icecraft",
      "focus": "tch",
      "reason": "Can coordinate complex snow and ice structures."
    }
  },
  "games:Dr. Eggman": {
    "tech": {
      "label": "Robotics Arsenal",
      "focus": "tch",
      "reason": "Builds and directs advanced machines and robots."
    }
  },
  "games:Dr. Light": {
    "tech": {
      "label": "Robot Master Engineering",
      "focus": "tch",
      "reason": "Develops advanced robotics and support technology."
    }
  },
  "games:Big Boss": {
    "stealth": {
      "label": "Special Operations Command",
      "focus": "ref",
      "reason": "Directs covert infiltration and special-forces tactics."
    }
  },
  "games:Commander Shepard": {
    "brain": {
      "label": "Squad Command",
      "focus": "iq",
      "reason": "Coordinates squad tactics under battlefield pressure."
    }
  },
  "starwars:Yoda": {
    "psychic": {
      "label": "Jedi Mind Training",
      "focus": "iq",
      "reason": "Teaches control of the Force and mental coordination."
    }
  },
  "starwars:Poe Dameron": {
    "flight": {
      "label": "Ace Squadron Leader",
      "focus": "spd",
      "reason": "Leads high-speed starfighter operations."
    }
  },
  "starwars:Jar Jar Binks": {
    "aquatic": {
      "label": "Gungan Aquatic Mobilization",
      "focus": "ldr",
      "reason": "Jar Jar was appointed a general in the amphibious Gungan Grand Army and helped mobilize Gungan underwater forces to assist Mon Cala. His role connects the team to aquatic allies; it does not imply water-control powers or exceptional tactical skill.",
      "source": "https://www.starwars.com/databank/jar-jar-binks"
    }
  },
  "lotr:Gandalf": {
    "flight": {
      "label": "Alliance of the Great Eagles",
      "focus": "ldr",
      "reason": "Gandalf has a documented relationship with the Great Eagles, who carried him and his companions in aerial rescues. He can coordinate with flying allies without personally having unrestricted flight."
    }
  },
  "harrypotter:Madam Hooch": {
    "flight": {
      "label": "Hogwarts Flight Instructor",
      "focus": "ref",
      "reason": "Teaches and supervises broomstick flying at Hogwarts, supplying coaching expertise for an aerial team. Teaching broom flight does not imply unaided personal flight."
    }
  },
  "starwars:Admiral Ackbar": {
    "flight": {
      "label": "Alliance Fleet Tactics",
      "focus": "iq",
      "reason": "Personally commands warships in the Battle of Endor and coordinates starfighter operations; this is Commander-only aerial/space combat expertise, not personal flight.",
      "source": "https://www.starwars.com/databank/admiral-ackbar"
    }
  },
  "starwars:Grand Admiral Thrawn": {
    "brain": {
      "label": "Strategic Foresight",
      "focus": "iq",
      "reason": "Uses analysis and anticipation to direct battle strategy."
    }
  },
  "starwars:Emperor Palpatine": {
    "electric": {
      "label": "Force Lightning",
      "focus": "tch",
      "reason": "Commands Force lightning and directs Sith attacks."
    }
  }
});
const CAMPAIGN_FOCUS_INDEX = Object.freeze({spd:0,agi:1,str:2,siz:3,lep:4,end:5,tch:6,acc:7,ref:8,iq:9,clu:10,ldr:11});
function campaignCommanderSpecialty(c,rule,pos){
  if(!pos?.coach||!c?.pool||!c?.n)return null;
  return CAMPAIGN_COMMANDER_SPECIALTIES[c.pool+':'+c.n]?.[rule]||null;
}
// Tactical multiplier is calculated from the active players' strength in the
// relevant attribute. Exactly one commander benefit can apply per lineup.
function campaignCommanderEffect(sport,roster,rule,baseRating){
  const slots=SPORTS[sport]?.pos||[];
  const slot=slots.find(p=>p.coach&&roster[p.id]);
  const c=slot&&roster[slot.id],specialty=campaignCommanderSpecialty(c,rule,slot);
  if(!specialty||!Number.isFinite(baseRating))return null;
  const idx=CAMPAIGN_FOCUS_INDEX[specialty.focus];
  if(idx===undefined)return null;
  const active=slots.filter(p=>!p.coach&&!p.bench&&roster[p.id]);
  if(!active.length)return null;
  const focusAverage=active.reduce((sum,p)=>sum+(Number(roster[p.id].a?.[idx])||0),0)/active.length;
  // A bounded 1.5%–4% strategic advantage. No compounding and no raw stat edits.
  const percent=+(1.5+2.5*Math.max(0,Math.min(99,focusAverage))/99).toFixed(2);
  return {name:c.n,label:specialty.label,reason:specialty.reason,focus:specialty.focus,
    focusAverage:+focusAverage.toFixed(1),percent,points:+(baseRating*percent/100).toFixed(3)};
}
function campaignStageById(id){
  return id<CAMPAIGN_STAGES.length?CAMPAIGN_STAGES[id]:CAMPAIGN_EXTRA[id-CAMPAIGN_STAGES.length];
}
function campaignEligibleStageIds(sport){
  const last=CAMPAIGN_STAGES.length-1;
  return [...CAMPAIGN_STAGES.slice(0,-1).map((_,i)=>i),
    ...CAMPAIGN_EXTRA.map((_,i)=>CAMPAIGN_STAGES.length+i)]
    .filter(i=>campaignCandidates(campaignStageById(i).rule).length>=2*campaignLimit(sport,campaignStageById(i).rule));
}
function campaignStages(){
  return S.campaign?.stageOrder?.map(campaignStageById).filter(Boolean)||CAMPAIGN_STAGES;
}
// A campaign always lasts ten levels: nine eligible, varied challenges plus the Final Gauntlet.
// Persist usage *per sport* so a new campaign prioritizes the least-played challenges instead of
// randomly repeating the same selection. Resuming a saved campaign never rerolls its stage order.
function campaignNewOrder(sport='basketball'){
  const pool=campaignEligibleStageIds(sport),last=CAMPAIGN_STAGES.length-1;
  if(pool.length<9)return null;
  const history=lsGet('da.campaign.rotation.v1',{})||{};
  const previous=history[sport]||{},counts=previous.counts||{},lastRound=new Set(previous.last||[]);
  const eligible=pool.map(i=>({id:i,count:Math.max(0,Number(counts[i])||0),recent:lastRound.has(i),jitter:Math.random()}));
  eligible.sort((a,b)=>a.count-b.count||Number(a.recent)-Number(b.recent)||a.jitter-b.jitter);
  const picked=eligible.slice(0,9).map(x=>x.id);
  history[sport]={counts:{...counts},last:picked};
  for(const id of picked)history[sport].counts[id]=(Number(history[sport].counts[id])||0)+1;
  lsSet('da.campaign.rotation.v1',history);
  // Shuffle the selected stages so stage number is not dictated by their usage count.
  for(let i=picked.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[picked[i],picked[j]]=[picked[j],picked[i]];}
  // Avoid a short-handed penultimate before the full-team grand finale.
  if(campaignStageById(picked[8]).rule==='short') [picked[8],picked[7]]=[picked[7],picked[8]];
  return [...picked,last];
}
const CAMPAIGN_WOMEN=new Set('Black Widow|Scarlet Witch|Captain Marvel|Gamora|Nebula|Mantis|The Wasp|Janet van Dyne|Kate Bishop|Okoye|Ayo|Shuri|Nakia|Ironheart|Valkyrie|Hela|Sif|Pepper Potts|Ms. Marvel|She-Hulk|Yelena Belova|Taskmaster|Sharon Carter|Agatha Harkness|Maria Hill|Peggy Carter|Darcy Lewis|Ghost|MJ|Aunt May|Thena|Makkari|Ajak|Sersi|Sprite|Monica Rambeau|America Chavez|Echo|Jessica Jones|Elektra|Jean Grey|Invisible Woman|Silver Surfer|Captain Carter|Lola Bunny|Minnie Mouse|Daisy Duck|Elsa|Moana|Mulan|Violet|Elastigirl|Sandy Cheeks|Lisa Simpson|Marge Simpson|Velma|Lucy van Pelt|Peppermint Patty|Blossom|Bubbles|Buttercup|Katara|Toph Beifong|Tigress|Bluey|Anna|Vanellope von Schweetz|Princess Peach|Princess Daisy|Rosalina|Samus Aran|Zelda|Princess Zelda|Lara Croft|Chun-Li|Sonya Blade|Kitana|Mileena|Bayonetta|Jill Valentine|Ada Wong|Ellie|Aloy|Jasmine|Ariel|Ursula|Belle|Esmeralda|Lilo|Maleficent|Snow White|Cinderella'.split('|'));
const CAMPAIGN_RED=new Set('Iron Man|Spider-Man|Scarlet Witch|Vision|Red Guardian|Red Skull|Daredevil|Deadpool|Human Torch|Star-Lord|Carnage|Mario|Knuckles|Diddy Kong|Raphael|Lightning McQueen|Mr. Incredible|Elastigirl|Blossom|Optimus Prime|Zuko|Yosemite Sam|Mr. Krabs|Anger|Incineroar|Flash|The Flash|Ant-Man|Wreck-It Ralph|Mickey Mouse|Sebastian|Mushu|Captain Hook|Ariel'.split('|'));
const CAMPAIGN_KIDS=new Set('Spider-Man|Ms. Marvel|Ironheart|America Chavez|Sprite|Franklin Richards|Dash|Violet|Jack-Jack|Blossom|Bubbles|Buttercup|Bluey|Bingo|Bart Simpson|Lisa Simpson|Charlie Brown|Lucy van Pelt|Peppermint Patty|Aang|Toph Beifong|Zuko|Katara|Sokka|Morty|Ned Leeds|MJ|Vanellope von Schweetz|Ness|Lucas|Ash Ketchum|Pokémon Trainer|Young Link|Kid Link|Baby Mario|Baby Luigi|Dora the Explorer|Jimmy Neutron|Dexter|Timmy Turner|Penny Proud|Phineas|Ferb|Stewie Griffin|Maggie Simpson|Huey|Dewey|Louie|Lincoln Loud|Lilo|Peter Pan|Ariel'.split('|'));
const CAMPAIGN_MORTAL=new Set('Black Widow|Hawkeye|Kate Bishop|Falcon|Happy Hogan|Howard Stark|Nick Fury|Maria Hill|Phil Coulson|Peggy Carter|Jimmy Woo|Darcy Lewis|Sharon Carter|Yelena Belova|Zemo|Katy|MJ|Ned Leeds|Aunt May|Kingpin|The Punisher|Mulan|Phil|Tarzan|Fred Jones|Velma|Shaggy|Hank Hill|Bob Belcher|Sokka|Marge Simpson|Lisa Simpson|Bart Simpson|Charlie Brown|Peppermint Patty|Moana|Edna Mode|Porky Pig|Minnie Mouse|Lola Bunny|Aladdin|Jasmine|Belle|Gaston|Quasimodo|Esmeralda|Frollo|Phoebus|Shan Yu|Anna|Lilo|Captain Hook|Snow White|Cinderella'.split('|'));
// Pokémon and Star Wars characters for the themed stages.
for (const n of ['Leia Organa','Padmé Amidala','Rey','Ahsoka Tano','Aayla Secura','Asajj Ventress','Reva','Jyn Erso','Mon Mothma','Hera Syndulla','Sabine Wren','Rose Tico','Admiral Holdo','Maz Kanata','Bo-Katan Kryze','Fennec Shand','Aurra Sing','Cara Dune','Captain Phasma','Omega',"Qi'ra",'Enfys Nest','Nidoran♀','Nidorina','Nidoqueen','Chansey','Kangaskhan','Jynx']) CAMPAIGN_WOMEN.add(n);
for (const n of ['Darth Maul','Charmeleon','Krabby','Kingler','Magmar','Voltorb','Electrode','Paras','Parasect','Vileplume','Jynx','Flareon']) CAMPAIGN_RED.add(n);
for (const n of ['Grogu','Omega','Ezra Bridger']) CAMPAIGN_KIDS.add(n);
for (const n of ['Han Solo','Lando Calrissian','Wedge Antilles','Nien Nunb','Admiral Ackbar','Mon Mothma','Bail Organa','Padmé Amidala','Jyn Erso','Cassian Andor','Saw Gerrera','Baze Malbus','Hera Syndulla','Sabine Wren','Poe Dameron','Finn','Rose Tico','Admiral Holdo','Grand Moff Tarkin','Grand Admiral Thrawn','Director Krennic','Moff Gideon','Stormtrooper','Death Trooper','Captain Phasma','General Hux','Boba Fett','Jango Fett','The Mandalorian','Bo-Katan Kryze','Cad Bane','Fennec Shand','Aurra Sing','Greedo','Cara Dune','Cobb Vanth','Greef Karga','Kuiil','Migs Mayfeld','Captain Rex','Commander Cody',"Qi'ra",'Tobias Beckett','Enfys Nest']) CAMPAIGN_MORTAL.add(n);
function campaignDefault(){return {status:'setup',defeat:null,step:0,sport:'basketball',teamName:'The Challengers',roster:{},selected:null,query:'',infoId:null,history:[],result:null,stageOrder:null,seed:Date.now().toString(36)+':'+Math.random().toString(36).slice(2),opponents:{},attempts:{},singleUse:false,snake:null,stageUsage:null,surge:null,variantTarget:null,validation:'',validationOpen:false,disputeSlot:null,disputeClaim:'',disputeSource:'',disputeBusy:false,disputeResult:null,disputeError:''};}
function loadCampaign(){
  const saved=lsGet('da.campaign.v1',{}),v={...campaignDefault(),...saved};
  if(!SPORTS[v.sport]||!Number.isInteger(v.step)||v.step<0||v.step>10||!Array.isArray(v.history)){return campaignDefault();}
  v.history=v.history.slice(0,10);
  if(!Array.isArray(v.stageOrder)||v.stageOrder.length!==10)v.stageOrder=v.step>0?CAMPAIGN_STAGES.map((_,i)=>i):null;
  // Older versions saved the fixed original ten even before the first battle began.
  // Do not let those placeholder stages permanently lock the user's future rotation.
  if(v.step===0&&v.status==='setup'&&!v.history.length&&
    v.stageOrder?.every((id,i)=>id===i))v.stageOrder=null;
  if(!v.seed)v.seed=Date.now().toString(36)+':'+Math.random().toString(36).slice(2);
  if(!v.opponents||typeof v.opponents!=='object')v.opponents={};
  if(!v.attempts||typeof v.attempts!=='object')v.attempts={};
  v.singleUse=v.singleUse===true;
  campaignRecoverHistory(v);
  if(v.result?.ids?.length)campaignRecordUsage(v,v.result);
  v.surge=variantSurgeRecords(v);
  v.roster=Object.fromEntries(Object.entries(v.roster||{}).map(([id,cid])=>[id,candById('mashup',typeof cid==='string'?cid:cid?.id)]).filter(([,c])=>!!c));
  v.selected=null;v.query='';v.infoId=null;v.variantTarget=null;
  if(v.defeat)v.status='defeated';
  else if(v.status==='results'&&!v.result)v.status='draft';
  return v;
}
function saveCampaign(){
  const v=S.campaign;
  lsSet('da.campaign.v1',{status:v.status,defeat:v.defeat||null,step:v.step,sport:v.sport,teamName:v.teamName,roster:Object.fromEntries(Object.entries(v.roster||{}).map(([p,c])=>[p,c.id])),history:v.history,result:v.result,stageOrder:v.stageOrder,seed:v.seed,opponents:v.opponents||{},attempts:v.attempts||{},singleUse:!!v.singleUse,snake:v.snake||null,stageUsage:v.stageUsage||null,surge:v.surge||null});
}
function campaignStage(){return campaignStages()[Math.min(9,S.campaign.step)];}
function campaignSlots(sport,rule){
  const slots=SPORTS[sport].pos;
  return campaignCriteria(rule)?.lineup?.startersOnly
    ?slots.filter(p=>!p.side&&!p.coach&&!p.bench):slots;
}
function campaignLimit(sport,rule){
  const eligible=campaignSlots(sport,rule);
  const fraction=campaignCriteria(rule)?.lineup?.starterFraction;
  return typeof fraction==='number'
    ?Math.max(1,Math.ceil(eligible.length*fraction)):eligible.length;
}
// Older saves omitted IDs from victory history. Recover base identities from
// archived comparison rows and cached opponent drafts; never infer from damage.
function campaignRecoverHistory(v){
  if(!(v.history||[]).some(h=>!h.ids?.length||!h.cpuIds?.length))return;
  const all=getCands('mashup'),byName=new Map();
  const add=(name,id)=>{if(!name)return;const list=byName.get(name)||[];if(!list.includes(id))list.push(id);byName.set(name,list);};
  for(const candidate of all){
    add(esc(candidate.n),candidate.id);
    for(const form of variantOptions(candidate))add(esc(form.name),candidate.id);
  }
  for(let i=0;i<v.history.length;i++){
    const entry=v.history[i],cached=Object.values(v.opponents?.[i]?.roster||{}).map(x=>typeof x==='string'?x:x?.id).filter(Boolean);
    const recovered=[[],[]];
    for(const report of (entry.finalRounds?.length?entry.finalRounds.map(x=>x.report):[entry.report])){
      for(const match of String(report||'').matchAll(/<tr>\s*<td class="da-side">([\s\S]*?)<\/td>\s*<th[^>]*>[\s\S]*?<\/th>\s*<td class="da-side">([\s\S]*?)<\/td>\s*<\/tr>/g)){
        for(let side=0;side<2;side++){
          const name=match[side+1].match(/<span class="da-name">([^<]*)<\/span>/)?.[1];
          if(name)recovered[side].push(...(byName.get(name)||[]));
        }
      }
    }
    if(!entry.ids?.length)entry.ids=[...new Set(recovered[0])];
    if(!entry.cpuIds?.length)entry.cpuIds=[...new Set([...cached,...recovered[1]])];
  }
}
function campaignUsed(v=S.campaign,side='player',allAttempts=false){
  return new Set((v.history||[]).flatMap(h=>side==='cpu'?h.cpuIds||[]:allAttempts?h.playerUsedIds||h.ids||[]:h.ids||[]));
}
function campaignRecordUsage(v,result){
  if(v.stageUsage?.step!==v.step)v.stageUsage={step:v.step,player:[],cpu:[]};
  const u=v.stageUsage;
  u.player=[...new Set([...u.player,...(result.ids||[])])];
  u.cpu=[...new Set([...u.cpu,...(result.cpuIds||Object.values(v.snake?.cpu||{}))])];
}
function campaignWinUses(id,v=S.campaign){return (v.history||[]).filter(h=>(h.ids||[]).includes(id)).length;}
function campaignHistoryReason(c,rule,side='player',v=S.campaign){
  if(!c)return 'Unknown character.';
  const own=campaignUsed(v,side,!!v.singleUse),other=campaignUsed(v,side==='cpu'?'player':'cpu',!!v.singleUse);
  if(v.singleUse&&(own.has(c.id)||other.has(c.id)))return 'Already used by either side in this campaign.';
  if(side==='cpu'&&own.has(c.id))return 'Already used by the CPU in a previous round.';
  if(side==='player'&&rule==='final'&&own.has(c.id))return 'Already appeared in a winning Campaign lineup. Finale requires unused characters.';
  if(side==='player'&&campaignWinUses(c.id,v)>=2)return '2 / 2 winning uses spent.';
  return '';
}
function campaignPickAllowed(c,rule,pos,side='player',v=S.campaign){return !campaignHistoryReason(c,rule,side,v)&&campaignAllowed(c,rule,pos,side,v);}
function campaignReservedIds(v=S.campaign){
  if(v.snake?.step!==v.step)return new Set();
  return new Set([...Object.values(v.snake.cpu||{}),...Object.values(v.snake.second?.roster||{})]);
}
function campaignPlayerPickBlocked(c,v=S.campaign,rule=campaignStage().rule){
  return campaignHistoryReason(c,rule,'player',v)|| (campaignReservedIds(v).has(c.id)?'Drafted by CPU':'');
}
// Identity/color/age classifications remain their own legacy trait source.
// No themed challenge reads a character name, description or research keywords.
const CAMPAIGN_TRAIT_LABELS=Object.freeze({
  women:'Female character',red:'Predominantly red or distinctively red character design',
  kids:'Child or teenage character in the drafted continuity',
  mortal:'Non-superpowered character (ordinary human physiology/skills)'
});
const CAMPAIGN_LEGACY_POOLS=new Set(['mcu','toons','muppets','games','pokemon','starwars']);
// Legacy lists stay as a compatibility layer until each legacy grant has been
// individually promoted to a universe-scoped, documented taxonomy entry.
function campaignTraitEvidence(c,trait){
  if(!c?.n||!c?.pool)return null;
  if(trait==='mortal'&&c.pool==='nba')
    return {allowed:true,source:'nba-pool',reason:'Basketball participants have ordinary human bodies.'};
  const curated=typeof window!=='undefined'?window.DA_CAMPAIGN_TRAIT_EVIDENCE?.(c,trait):null;
  if(curated?.allowed===false)return curated; // Explicit corrections beat legacy lists.
  if(curated?.allowed===true)return curated;
  const legacy={women:CAMPAIGN_WOMEN,red:CAMPAIGN_RED,kids:CAMPAIGN_KIDS,mortal:CAMPAIGN_MORTAL};
  if(CAMPAIGN_LEGACY_POOLS.has(c.pool)&&legacy[trait]?.has(c.n))
    return {allowed:true,source:'legacy-campaign-review',reason:'Existing curated Campaign classification.'};
  if(typeof KnowledgeEngine!=='undefined'&&KnowledgeEngine.has(c,trait))
    return {allowed:true,source:'approved-user-evidence',reason:'A stored eligibility ruling accepts this trait.'};
  return null;
}
function campaignTraitAllowed(c,trait){
  return campaignTraitEvidence(c,trait)?.allowed===true;
}
function campaignStatValue(c,attribute){
  if(!Array.isArray(c?.a)||!c.a.length)return NaN;
  if(attribute==='average')return c.a.reduce((sum,value)=>sum+Number(value),0)/c.a.length;
  const idx=CAMPAIGN_FOCUS_INDEX[attribute];
  return idx===undefined?NaN:Number(c.a[idx]);
}
function campaignPassesStats(c,conditions){
  return conditions.every(({attribute,op,value})=>{
    const actual=campaignStatValue(c,attribute);
    if(!Number.isFinite(actual)||!Number.isFinite(value))return false;
    switch(op){
      case 'gte':return actual>=value;
      case 'gt':return actual>value;
      case 'lte':return actual<=value;
      case 'lt':return actual<value;
      case 'eq':return actual===value;
      default:return false;
    }
  });
}
function campaignHoldsAcceptedTag(c,acceptedTags){
  // null means no roster record; [] means reviewed with no qualifying tags.
  // Both fail closed unless a separate approved player appeal exists.
  const owned=typeof characterAbilityTags==='function'?characterAbilityTags(c):null;
  if(Array.isArray(owned))return acceptedTags.some(tag=>owned.includes(tag));
  if(owned&&typeof owned.has==='function')return acceptedTags.some(tag=>owned.has(tag));
  return false;
}
// Every Campaign stage passes through this same rule evaluator. Its explanation
// drives rejection UI and tests, so the display can never disagree with scoring.
function campaignCriteriaResult(c,criteria,rule,side='player',v=S.campaign){
  const fail=(reason,source='campaign-rule')=>({allowed:false,reason,source});
  if(!c||!criteria)return fail('Character or challenge requirements are unavailable.');
  if(Array.isArray(criteria.poolIds)&&!criteria.poolIds.includes(c.pool))
    return fail('This challenge requires a character from: '+criteria.poolIds.join(', ')+'.');
  if(criteria.trait){
    const record=campaignTraitEvidence(c,criteria.trait);
    if(record?.allowed===false)
      return fail(record.reason||'Documented exclusion from this trait.',record.source||'curated-trait-exclusion');
    if(record?.allowed!==true)
      return fail('No verified '+(CAMPAIGN_TRAIT_LABELS[criteria.trait]||criteria.trait)+' classification is recorded for this character and universe. Missing data is not proof the character fails the theme.','missing-trait-evidence');
  }
  if(criteria.stats){
    for(const condition of criteria.stats){
      const actual=campaignStatValue(c,condition.attribute);
      const passed=campaignPassesStats(c,[condition]);
      if(!passed){
        const label=condition.attribute==='average'?'Average rating':condition.attribute.toUpperCase();
        const operator={gte:'at least',gt:'greater than',lte:'at most',lt:'less than',eq:'equal to'}[condition.op]||condition.op;
        return fail(label+' must be '+operator+' '+condition.value+' (recorded: '+(Number.isFinite(actual)?actual.toFixed(1):'unknown')+').','character-attributes');
      }
    }
  }
  if(criteria.muppetForceMin!==undefined){
    const power=typeof muppetForceOf==='function'?muppetForceOf(c):null;
    if(!power||power.score<criteria.muppetForceMin)
      return fail('MuppetForce must be at least '+criteria.muppetForceMin+' (recorded: '+(power?.score??'unknown')+').','muppet-force');
  }
  if(criteria.neverPreviouslyWon&&campaignHistoryReason(c,rule,side,v))
    return fail(campaignHistoryReason(c,rule,side,v),'campaign-history');
  if(Array.isArray(criteria.acceptedTags)){
    const matches=criteria.acceptedTags.length>0&&campaignHoldsAcceptedTag(c,criteria.acceptedTags);
    if(!matches){
      const isDisputed=typeof CHARACTER_ABILITY_DISPUTES!=='undefined'&&
        CHARACTER_ABILITY_DISPUTES.some(d=>d.verdict==='incorrect'&&d.id===c.pool+':'+c.n&&d.tag===rule);
      if(isDisputed)return fail('A reviewed ability ruling explicitly rejects this tag.','reviewed-ability-dispute');
      if(!(rule&&typeof KnowledgeEngine!=='undefined'&&KnowledgeEngine.has(c,rule)))
        return fail('No verified '+rule+' ability tag or approved appeal is recorded for this character.','missing-ability-evidence');
    }
  }
  return {allowed:true,reason:'Verified against the Campaign criteria.',source:'campaign-eligibility'};
}
function campaignMatchesCriteria(c,criteria,rule){
  return campaignCriteriaResult(c,criteria,rule).allowed;
}
function campaignEligibilityResult(c,rule,pos=null,side='player',v=S.campaign){
  const criteria=campaignCriteria(rule);
  if(!c||!criteria)return {allowed:false,reason:'Unknown character or Campaign rule.',source:'campaign-rule'};
  if(criteria.neverPreviouslyWon&&campaignHistoryReason(c,rule,side,v))return {allowed:false,reason:campaignHistoryReason(c,rule,side,v),source:'campaign-history'};
  if(criteria.commanderSpecialty&&campaignCommanderSpecialty(c,rule,pos))
    return {allowed:true,reason:'Documented Commander/Coach tactical specialty.',source:'commander-specialty'};
  const result=campaignCriteriaResult(c,criteria,rule,side,v);
  // This is a draft restriction, not a suppression of a legitimately rolled
  // variant. Use the same production slot fit for human and CPU starters.
  if(result.allowed&&rule==='underdog'&&pos&&(pos.tank||pos.styles)&&typeof fitIn==='function'){
    const fit=fitIn('brawl',c,pos);
    if(Number.isFinite(fit)&&fit>100)return {allowed:false,reason:'Underdogs starter effective role fit must be 100 or lower (recorded: '+fit.toFixed(1)+').',source:'effective-role-fit'};
  }
  return result;
}
function campaignAllowed(c,rule,pos=null,side='player',v=S.campaign){
  return campaignEligibilityResult(c,rule,pos,side,v).allowed;
}
function campaignCandidates(rule){return getCands('mashup').filter(c=>campaignAllowed(c,rule));}
function campaignSportValid(sport){return campaignEligibleStageIds(sport).length>=9;}
function campaignInvalidSlots(){
  const v=S.campaign,rule=campaignStage().rule;
  const positions=new Map(campaignSlots(v.sport,rule).map(p=>[p.id,p]));
  return new Set(Object.entries(v.roster).filter(([slot,c])=>c&&(!campaignPickAllowed(c,rule,positions.get(slot))||campaignReservedIds(v).has(c.id))).map(([slot])=>slot));
}
function campaignQualified(){return campaignInvalidSlots().size===0;}
function campaignRosterReady(sport,rule,roster){
  const slots=campaignSlots(sport,rule),pick=slots.map(p=>roster[p.id]).filter(Boolean);
  const minimum=campaignCriteria(rule)?.minDistinctPools||0;
  // Every drafted roster role contributes to the universe alliance.
  return pick.length===campaignLimit(sport,rule)&&new Set(pick.map(c=>c.id)).size===pick.length&&Object.keys(roster).every(id=>slots.some(p=>p.id===id))&&
    new Set(pick.map(c=>c.pool)).size>=minimum;
}
function campaignRosterLegal(sport,rule,roster,side='player',v=S.campaign){
  if(!roster||!campaignRosterReady(sport,rule,roster))return false;
  const positions=new Map(campaignSlots(sport,rule).map(p=>[p.id,p]));
  return Object.entries(roster).every(([slot,c])=>c&&campaignPickAllowed(c,rule,positions.get(slot),side,v));
}
// Exact legal-roster feasibility. Min-cost max-flow finds a maximum-size
// assignment and maximizes distinct pools (the first unit per pool earns -1).
// No fit scores, sampled combat outcomes or candidate truncation are used.
function campaignCanFill(sport,rule,all,side,v,reserved=new Set(),fixed={}){
  const slots=campaignSlots(sport,rule),limit=campaignLimit(sport,rule);
  const entries=Object.entries(fixed),bySlot=new Map(slots.map(p=>[p.id,p]));
  const used=new Set(entries.map(([,c])=>c?.id));
  if(entries.length>limit||used.size!==entries.length||entries.some(([id,c])=>!c||!bySlot.has(id)||reserved.has(c.id)||!campaignPickAllowed(c,rule,bySlot.get(id),side,v)))return false;
  const poolsUsed=new Set(entries.map(([,c])=>c.pool));
  const need=limit-entries.length,minimum=campaignCriteria(rule)?.minDistinctPools||0;
  if(!need)return poolsUsed.size>=minimum;
  const remaining=slots.filter(p=>!Object.hasOwn(fixed,p.id));
  const candidates=[...new Map(all.filter(c=>!reserved.has(c.id)&&!used.has(c.id)).map(c=>[c.id,c])).values()];
  if(candidates.length<need)return false;
  const graph=[[],[]],source=0,sink=1;
  const node=()=>{graph.push([]);return graph.length-1;};
  function edge(a,b,cap,cost=0){
    graph[a].push({to:b,rev:graph[b].length,cap,cost});
    graph[b].push({to:a,rev:graph[a].length-1,cap:0,cost:-cost});
  }
  const slotNodes=remaining.map(p=>({p,n:node()})),poolNodes=new Map();
  for(const {n} of slotNodes)edge(source,n,1);
  for(const c of candidates){
    const legal=slotNodes.filter(({p})=>campaignPickAllowed(c,rule,p,side,v));
    if(!legal.length)continue;
    const n=node();
    for(const slot of legal)edge(slot.n,n,1);
    if(!poolNodes.has(c.pool)){
      const pool=node();poolNodes.set(c.pool,pool);
      if(!poolsUsed.has(c.pool))edge(pool,sink,1,-1);
      edge(pool,sink,need,0);
    }
    edge(n,poolNodes.get(c.pool),1);
  }
  let cost=0;
  for(let flow=0;flow<need;flow++){
    const dist=Array(graph.length).fill(Infinity),prev=Array(graph.length),queued=Array(graph.length).fill(false);
    const q=[source];dist[source]=0;queued[source]=true;
    for(let i=0;i<q.length;i++){
      const a=q[i];queued[a]=false;
      for(let j=0;j<graph[a].length;j++){
        const e=graph[a][j],d=dist[a]+e.cost;
        if(e.cap>0&&d<dist[e.to]){
          dist[e.to]=d;prev[e.to]=[a,j];
          if(!queued[e.to]){q.push(e.to);queued[e.to]=true;}
        }
      }
    }
    if(!Number.isFinite(dist[sink]))return false;
    cost+=dist[sink];
    for(let b=sink;b!==source;){
      const [a,j]=prev[b],e=graph[a][j];e.cap--;graph[b][e.rev].cap++;b=a;
    }
  }
  return poolsUsed.size-cost>=minimum;
}
// Only declare exhaustion if the CPU's locked picks can themselves be
// completed legally. In the finale require a fully legal first boss and
// a legal or demonstrably fillable second boss before ruling out the player.
function campaignExhaustion(v,stage,all=getCands('mashup')){
  if(v.status!=='draft'||v.snake?.step!==v.step)return null;
  const rule=stage.rule,byId=new Map(all.map(c=>[c.id,c]));
  const hydrate=ids=>Object.fromEntries(Object.entries(ids||{}).map(([p,id])=>[p,byId.get(id)]));
  const first=hydrate(v.snake.cpu),firstIds=new Set(Object.values(first).map(c=>c?.id));
  if(!campaignCanFill(v.sport,rule,all,'cpu',v,new Set(),first))return null;
  if(stage.criteria?.encounters===2){
    if(!campaignRosterLegal(v.sport,rule,first,'cpu',v))return null;
    const second=hydrate(v.snake.second?.roster);
    if(!campaignCanFill(v.sport,rule,all,'cpu',v,firstIds,second))return null;
  }
  const reserved=campaignReservedIds(v);
  return campaignCanFill(v.sport,rule,all,'player',v,reserved)?null:'roster-exhausted';
}
function campaignEnd(v,reason){
  if(v.status!=='draft'&&v.status!=='results')return false;
  if(v.result?.win)return false;
  v.defeat={reason,step:v.step,challenge:campaignStage().name,at:new Date().toISOString()};
  v.status='defeated';v.selected=null;v.validationOpen=false;v.surgeDialog=null;
  const archive=lsGet('da.campaign.defeats.v1',[]);
  const rows=Array.isArray(archive)?archive:[];
  if(!rows.some(row=>row.seed===v.seed)){
    rows.unshift({seed:v.seed,sport:v.sport,teamName:v.teamName,singleUse:v.singleUse,wins:v.step,stageOrder:v.stageOrder,history:v.history,...v.defeat});
    lsSet('da.campaign.defeats.v1',rows.slice(0,20));
  }
  saveCampaign();return true;
}
function campaignCheckExhaustion(v,stage){
  const reason=campaignExhaustion(v,stage);
  return reason?campaignEnd(v,reason):false;
}
function campaignReady(){
  const v=S.campaign;
  return campaignRosterReady(v.sport,campaignStage().rule,v.roster);
}
function campaignProgress(){
  const v=S.campaign,done=v.status==='complete'?10:v.step;
  if(!v.stageOrder){
    const eligible=campaignEligibleStageIds(v.sport).length;
    return `<div class="panel" style="padding:14px 16px;margin-bottom:14px">
      <div class="row" style="justify-content:space-between;align-items:center"><b>Challenge rotation</b><span class="num">${eligible+1} available</span></div>
      <p class="note" style="margin:8px 0 0">When you begin, 9 challenges will be selected from the ${eligible} eligible themes, prioritizing those you have not played recently. The Multiverse Siege finale is always level 10. Your lineup is saved for the duration of the campaign.</p>
    </div>`;
  }
  return `<div class="panel" style="padding:14px 16px;margin-bottom:14px">
    <div class="row" style="justify-content:space-between;align-items:center"><b>Campaign progress</b><span class="num">${done} / 10 wins</span></div>
    <div class="meter" role="progressbar" aria-label="Campaign wins" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="10"><i style="width:${done*10}%"></i></div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">${campaignStages().map((ch,i)=>`<span class="chip" title="${esc(ch.name)}" style="${i<done?'border-color:var(--good);color:var(--good)':i===v.step&&v.status!=='complete'?'border-color:var(--accent-strong)':''}">${i+1}. ${esc(ch.name)}</span>`).join('')}</div>
  </div>`;
}
function renderCampaignSetup(){
  const v=S.campaign,existing=v.step>0||v.status!=='setup';
  return `<section class="setup">
    <div class="mode-intro panel"><b>Championship · Campaign</b><span>Every new campaign draws nine themed challenges from the eligible pool, prioritizing ones you have not seen recently, then finishes with the two-boss Multiverse Siege. Win ten different challenges in order to claim the campaign crown. Every stage changes who qualifies or how many players you get. The list never reveals eligibility; you must know your picks. Both teams follow the same challenge and campaign-history restrictions. You and the CPU snake draft from one shared pool every challenge; the first pick alternates by round. CPU picks cannot repeat from previous rounds. Your characters can appear in two winning lineups unless Single Use is enabled; the finale always bans your previous winners. Retries use fresh combat randomness against the same drafted opponent. If no legal lineup remains, the campaign ends. You can also concede a campaign. Completed wins remain saved on this device.</span></div>
    <div class="panel rules" style="margin-bottom:16px"><div class="field-label"><span>Championship mode</span><div class="seg"><button data-act="c-kind" data-v="classic">Perfect Season</button><button data-act="c-kind" data-v="campaign" aria-pressed="true">Campaign · 10 challenges</button></div></div></div>
    ${campaignProgress()}
    <div class="step"><div class="step-head"><span class="n">1</span><h2 class="h">Pick a sport</h2></div>
      <div class="sports">${SPORT_ORDER.map(k=>`<button class="sport" data-act="camp-sport" data-sport="${k}" aria-pressed="${v.sport===k}" ${campaignSportValid(k)?'':'disabled title="Not enough eligible characters for all ten challenges"'}><span class="glyph">${sportGlyph(k)}</span><b>${esc(SPORTS[k].name)}</b><span>${campaignSportValid(k)?'10 campaign challenges':'Not enough eligible characters'}</span></button>`).join('')}</div>
      <p class="note">Campaign drafts from the All-Star Mashup (all built-in universes), so themed rounds always have a broad selection. Changing sports starts a new campaign.</p>
    </div>
    <div class="step"><div class="step-head"><span class="n">2</span><h2 class="h">Your team</h2></div><div class="panel rules"><label class="field-label"><span>Team name</span><input data-input="camp-team" maxlength="32" value="${esc(v.teamName)}" placeholder="The Challengers"></label></div></div>
    <div class="panel rules" style="margin-bottom:16px"><div class="field-label"><span>Campaign-wide single use</span><div class="seg"><button data-act="camp-single-use" data-v="0" aria-pressed="${!v.singleUse}" ${existing?'disabled':''}>Off</button><button data-act="camp-single-use" data-v="1" aria-pressed="${!!v.singleUse}" ${existing?'disabled':''}>On</button></div></div><p class="note">On: once either side uses a character in a completed challenge, neither side may draft that identity again. Variants count as the same character. Set before beginning a new campaign.</p></div>
    ${renderCampaignDefeatHistory()}
    <div class="cta-row"><button class="btn primary big" data-act="camp-start">${existing?'Resume campaign':'Begin the campaign'}</button>${existing?'<button class="btn" data-act="camp-reset">Restart from challenge 1</button>':''}<span class="note">Win all ten matchups to become Campaign Champion.</span></div>
  </section>`;
}
// Search state is local to the picker; the campaign roster and eligibility are unchanged.
function campaignPickerPools(v) {
  return new Set(v.pickerPools || []);
}
function campaignPickerMembership(c) {
  // Mashup deduplicates Pokemon also present in Games. Keep that same canonical
  // character selectable under either source, without introducing a second ID.
  const pools=[c.pool];
  if(c.pool==='games' && getCands('pokemon').some(p=>p.n===c.n))pools.push('pokemon');
  return pools.join(' ');
}
function campaignPickerMatches(row,q,pools) {
  return (!q || row.dataset.search.includes(q)) &&
    (!pools.size || row.dataset.pools.split(' ').some(p=>pools.has(p)));
}
function refreshCampaignPicker() {
  const list=document.getElementById('camp-plist');
  if(!list)return;
  const v=S.campaign,q=v.query.trim().toLowerCase(),pools=campaignPickerPools(v);
  let count=0;
  for(const row of list.querySelectorAll('.talent-entry')){
    const show=campaignPickerMatches(row,q,pools);
    if(row.hidden===show)row.hidden=!show;
    if(show)count++;
  }
  list.querySelector('.camp-no-matches').hidden=count!==0;
  list.scrollTop=0;
  const badge=document.getElementById('camp-filter-count');
  if(badge){badge.textContent=pools.size||'';badge.hidden=!pools.size;}
}
function campaignPickerFilterHTML(v) {
  const selected=campaignPickerPools(v);
  return `<details class="camp-filter"><summary class="btn camp-filter-toggle" aria-label="Filter by talent pool" title="Filter by talent pool"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M7 12h10M10 17h4"/></svg><span id="camp-filter-count" class="camp-filter-count" ${selected.size?'':'hidden'}>${selected.size||''}</span></summary><div class="camp-filter-menu"><div class="row" style="justify-content:space-between"><b>Talent pools</b><button type="button" class="btn small" data-act="camp-filter-clear">Clear all</button></div><p class="note">Select one or more pools. None selected shows all.</p>${MASHUP_SOURCES.map(id=>`<label><input type="checkbox" data-input="camp-pool" value="${esc(id)}" ${selected.has(id)?'checked':''}> <span>${esc(getPool(id).name)}</span></label>`).join('')}<button type="button" class="btn small" data-act="camp-filter-done">Done</button></div></details>`;
}
function campaignSurgeSlots(v){
  if(v.status!=='draft')return new Set();
  const candidates=new Set(variantSurgeCandidates(v).map(c=>c.id));
  return new Set(campaignSlots(v.sport,campaignStage().rule).filter(p=>candidates.has(v.roster[p.id]?.id)).map(p=>p.id));
}
function renderCampaignSurgeDialog(v){
  const reveal=v.surgeReveal;
  if(reveal)return `<div class="h2h-variant-shade campaign-surge-reveal"><div class="h2h-variant-dialog" role="dialog" aria-modal="true" aria-label="Variant Surge revealed"><h3>Variant Surge!</h3><p>${esc(reveal.base)} has transformed into</p><h3>${esc(reveal.name)}</h3><p class="note">Transformation locked for this challenge.</p><button class="btn primary" data-act="camp-surge-close">Continue</button></div></div>`;
  const slot=v.surgeDialog,c=v.roster[slot];
  if(!c||!campaignSurgeSlots(v).has(slot))return '';
  return `<div class="h2h-variant-shade"><div class="h2h-variant-dialog" role="dialog" aria-modal="true" aria-label="Variant Surge"><h3>Variant Surge</h3><p><b>${esc(c.n)}</b> is eligible for a Variant Surge. The new form is a surprise and the roll is permanent for this challenge.</p><div class="row"><button class="btn" data-act="camp-surge-close">Cancel</button><button class="btn" data-act="camp-surge-edit">Change character</button><button class="btn primary" data-act="camp-variant">Activate Surge</button></div></div></div>`;
}
function renderCampaignDraft(){
  const v=S.campaign,st=campaignStage(),slots=campaignSlots(v.sport,st.rule),allowedSet=new Set(slots.map(p=>p.id)),opponent=campaignSnakeOpponent(v,st);
  const second=opponent&&campaignReady()&&st.criteria?.encounters===2?campaignSnakeSecond(v,st,opponent):null;
  if(campaignCheckExhaustion(v,st))return renderCampaignDefeat();
  const tactic=CAMPAIGN_TACTICS[opponent?.tactic||v.snake?.tactic]||CAMPAIGN_TACTICS.assault;
  const filled=slots.filter(p=>v.roster[p.id]).length,limit=campaignLimit(v.sport,st.rule),valid=campaignReady(),all=getCands('mashup'),taken=new Set(Object.values(v.roster).map(c=>c.id));
  const distinctPools=new Set(slots.filter(p=>v.roster[p.id]).map(p=>v.roster[p.id].pool)).size,minPools=st.criteria?.minDistinctPools||0;
  const pos=SPORTS[v.sport].pos.find(p=>p.id===v.selected);
  const q=v.query.toLowerCase().trim(),pools=campaignPickerPools(v);
  const matches=pos?[...all].sort((a,b)=>a.n.localeCompare(b.n)):[];
  const blocked=c=>campaignPlayerPickBlocked(c,v,st.rule);
  const picker=pos?`<div class="panel picker open">
    <div class="picker-head"><div class="row" style="justify-content:space-between"><div><div class="eyebrow">Campaign draft</div><h3 class="h">${esc(pos.nm)}</h3></div><div class="row"><button class="btn small" data-act="camp-remove" ${v.roster[pos.id]?"":"disabled"}>Remove</button><button class="btn small" data-act="camp-close">Done</button></div></div><div class="needs">${needsText(pos).map(t=>`<span>${esc(t)}</span>`).join('')}</div></div>
    <div class="picker-tools"><input id="camp-query" data-input="camp-query" type="text" value="${esc(v.query)}" placeholder="Search all ${all.length} characters" autocomplete="off" aria-label="Search characters">${campaignPickerFilterHTML(v)}</div>
    ${v.roster[pos.id]?`<div class="picker-current">${avatar(v.roster[pos.id])}<span class="who"><small>Currently at ${esc(pos.nm)}</small><b>${esc(v.roster[pos.id].n)}</b></span><span class="note">Selected</span></div>`:''}
    <div class="picker-list-shell"><div class="plist" id="camp-plist">${matches.map(c=>{const search=(c.n+" "+c.t).toLowerCase(),sources=campaignPickerMembership(c);const hidden=(q&&!search.includes(q))||(pools.size&&!sources.split(" ").some(p=>pools.has(p)));return `<div class="talent-entry" data-search="${esc(search)}" data-pools="${esc(sources)}" ${hidden?"hidden":""}><button class="cand" data-act="camp-pick" data-cid="${esc(c.id)}" ${blocked(c)||taken.has(c.id)&&v.roster[pos.id]?.id!==c.id?'disabled':''}>${avatar(c)}<span class="who"><b>${esc(c.n)}</b><small>${esc(c.t)}</small>${sigLine(c)}</span>${blocked(c)?'<span class="meta muted">'+esc(blocked(c))+'</span>':taken.has(c.id)?'<span class="meta muted">On roster</span>':''}</button><button type="button" class="btn info-button" data-act="camp-info" data-cid="${esc(c.id)}" aria-label="Where is ${esc(c.n)} from?" title="Character origin">ⓘ</button></div>`}).join('')}<div class="empty-state camp-no-matches" ${matches.some(c=>(!q||(c.n+' '+c.t).toLowerCase().includes(q))&&(!pools.size||campaignPickerMembership(c).split(' ').some(p=>pools.has(p))))?'hidden':''}>No characters match your search.</div></div>${pickerIndexHTML('camp-plist')}</div>
  </div><div class="sheet-backdrop open" data-act="camp-close"></div>`:
  `<div class="panel" style="padding:14px"><b>${filled===limit?'Roster ready':'Select a position on the field'}</b><p class="note" style="margin:6px 0 0">${filled}/${limit} selected. Tap a position to draft or replace; hold a filled position to drag and swap. Eligibility is checked when you submit.</p></div>`;
  return `<section>${campaignProgress()}
    ${v.history.some(h=>!h.ids?.length||!h.cpuIds?.length)?'<p class="note">Some older saved rounds have missing lineup records. Recoverable characters are blocked, but a new campaign is required for fully reliable history enforcement.</p>':''}
    <div class="panel" style="padding:16px;margin-bottom:14px"><div class="eyebrow">Challenge ${v.step+1} / 10 · ${esc(SPORTS[v.sport].name)}</div><h2 class="h" style="margin:4px 0 8px">${esc(st.name)}</h2><p style="margin:0">${esc(st.blurb)}</p><p class="note" style="margin:8px 0 0">${all.length} characters to choose from · ${limit} roster spots · Opponent: ${esc(st.rival)}.</p>${minPools?`<p class="note" style="margin:8px 0 0"><b>Universe alliance: ${distinctPools}/${minPools} pools represented.</b> All roster positions, including commander and reinforcement, count.</p>`:''}<p class="note" style="margin:8px 0 0">Coaches and commanders may qualify through challenge-specific tactics and improve their team. Other roster positions must meet the normal requirements. Tactical specialties are revealed after submission. Your picks: ${v.singleUse?"single use across both sides":"maximum two winning lineups; none repeated in finale"}. CPU picks cannot repeat across rounds.</p></div>
    <div class="panel" style="padding:14px 16px;margin-bottom:14px">
      <div class="eyebrow">Shared snake draft · Opponent picks</div>
      <p class="note">CPU picks: ${Object.keys(v.snake?.cpu||{}).length}/${limit} · ${v.step%2?'CPU':'You'} picked first. Drafted CPU characters are unavailable.</p>
      <div style="display:flex;flex-wrap:wrap;gap:6px">${Object.values(v.snake?.cpu||{}).map(id=>candById('mashup',id)).filter(Boolean).map(c=>'<span class="chip">'+esc(c.n)+'</span>').join('')}</div>
      ${second?'<p class="note">Second boss: '+Object.values(second.roster).map(c=>esc(c.n)).join(' · ')+'</p>':''}
      ${(!opponent||st.criteria?.encounters===2&&!second)&&filled===limit?'<p class="note">No legal CPU lineup is available. Edit picks or restart this round’s draft; challenge rules will not be bypassed.</p>':''}<h3 style="margin:6px 0 4px">${esc(st.rival)} · ${esc(tactic.name)}</h3>
      <p class="note" style="margin:6px 0">${esc(tactic.description)}. Counterplay: <b>${esc(tactic.counterLabel)}</b>.</p>
      <p class="note" style="margin:6px 0 0">Both rosters obey the challenge rules. Once drafted, CPU picks are locked for retries. You can replace your own picks with unclaimed characters.</p>
    </div>
    ${campaignSurgeSlots(v).size?'<p class="note campaign-surge-hint">Tap a glowing character to activate their secret Variant Surge.</p>':''}
    <div class="board-head"><div class="title"><span class="eyebrow">Campaign · All-Star Mashup</span><h2 class="h">${esc(v.teamName||'Your team')}</h2></div><span class="chip num">${filled}/${limit}</span><button class="btn" data-act="camp-concede">Concede campaign</button><button class="btn" data-act="camp-setup">Campaign overview</button><button class="btn primary" data-act="camp-play" ${valid&&opponent&&(st.criteria?.encounters!==2||second)?'':'disabled'}>Submit lineup & play</button></div>
    <div class="board"><div>${renderField(v.sport,campaignVariantRoster(v),{sel:v.selected,interactive:true,eligibleSlots:allowedSet,invalidSlots:v.validation?campaignInvalidSlots():new Set(),variantSlots:campaignSurgeSlots(v),variantAction:'slot',variantShakeSlot:v.surgeReveal?.slot})}</div><div class="board-side">${picker}</div></div>${renderCampaignSurgeDialog(v)}
  </section>`;
}
function campaignPlay(){
  const v=S.campaign,st=campaignStage();
  if(v.status!=='draft'||v.defeat)return;
  if(campaignCheckExhaustion(v,st))return;
  if(!campaignReady())return toast(st.criteria?.minDistinctPools?'Fill the roster and represent at least '+st.criteria.minDistinctPools+' different talent pools.':'Fill all available roster spots first.');
  if(!campaignQualified()){
    v.validation='The highlighted characters do not meet this challenge’s requirements.';
    v.validationOpen=true;
    return;
  }
  v.validation='';v.validationOpen=false;
  const activeRoster=campaignVariantRoster(v);
  const first=campaignSnakeOpponent(v,st);
  if(!first)return toast('No legal opponent is available for this challenge.');
  const encounters=[{name:st.rival,opponent:first}];
  if(st.criteria?.encounters===2){
    const second=campaignSnakeSecond(v,st,first);
    if(!second)return toast('No legal second opponent is available for this challenge.');
    encounters.push({name:'The Nexus Champion',opponent:second});
  }
  const variants=variantForms(v);
  const variant=variants[0]||null;
  // A few documented reality-warping forms would otherwise barely improve
  // already-capped 99-point character attributes. Keep their extra impact
  // explicitly bounded, transparent, and applied once per encounter.
  const variantBonus=variant?Math.max(0,Math.min(5,Number(variant.form.ratingBonus)||0)):0;
  v.attempts=v.attempts||{};
  const attempt=(Number(v.attempts[v.step])||0)+1;
  v.attempts[v.step]=attempt;
  const rounds=encounters.map(({name,opponent:opp},index)=>{
    // Each fight has independently seeded results and tactical scores. The
    // same roster and locked Variant Surges play BOTH fights in the finale.
    const gameSeed=campaignCombatSeed(v,index,attempt);
    const score=teamScore(v.sport,activeRoster);
    const rivalRoster=cpuVariantRoster(v.sport,opp.roster,campaignStageSeed(v)+':cpu:'+index);
    const oppScore=teamScore(v.sport,rivalRoster);
    const commander=campaignCommanderEffect(v.sport,activeRoster,st.rule,score.rating);
    if(commander){score.rating+=commander.points;score.commanderEffect=commander;}
    const rivalCommander=campaignCommanderEffect(v.sport,rivalRoster,st.rule,oppScore.rating);
    if(rivalCommander){oppScore.rating+=rivalCommander.points;oppScore.commanderEffect=rivalCommander;}
    const tactics=campaignTacticalMatch(v.sport,activeRoster,rivalRoster,opp.tactic);
    // Shared teamScore applies the transformed attributes and cosmic bonus once.
    score.rating+=tactics.yourPoints;
    oppScore.rating+=tactics.rivalPoints;
    const game=playGame(v.sport,score,oppScore,SEASONS[v.sport].sigma*1.1,rngFrom(gameSeed),true);
    const win=game.winner===0,ourPoints=win?game.line[0]:game.line[1],theirPoints=win?game.line[1]:game.line[0];

    const breakdownHTML=daMatchBreakdown(game.breakdown,score,oppScore,v.teamName,name,null,game.combat);
    const summary=`<p>${esc(tactics?.label||'')}${tactics?.weakness?` · ${esc(tactics.weakness)}`:''}
      ${commander?` · Commander ${esc(commander.name)} contributed a ${commander.percent}% rating lift.`:''}
      ${variants.map(({base,form})=>' · Variant Surge: '+esc(base.n)+' → '+esc(form.name)).join('')}${Object.values(rivalRoster).filter(x=>x.variantBase).map(x=>' · Rival Surge: '+esc(x.variantBase)+' → '+esc(x.n)).join('')}</p>`;
    const report=daComparison(v.sport,score,oppScore,ourPoints,theirPoints,v.teamName||'Your team',name,gameSeed,{
      note:game.line[2],leftSide:win?0:1,rightSide:win?1:0,combat:game.combat,breakdown:breakdownHTML,summaryHTML:summary
    });
    return {win,name,ourPoints,theirPoints,commander,tactics,muppetTeam:score.muppetTeam,
      opponentNames:Object.values(rivalRoster).map(c=>c.n),cpuIds:Object.values(rivalRoster).map(c=>c.id),
      breakdownHTML,report,reportVersion:2,opponentReport:'',
      note:game.line[2]||'',ourRating:+score.rating.toFixed(1),theirRating:+oppScore.rating.toFixed(1)};
  });
  const success=rounds.every(round=>round.win);
  const deciding=rounds.find(round=>!round.win)||rounds[rounds.length-1];
  v.result={...deciding,win:success,opponent:deciding.name,
    finalRounds:rounds.length>1?rounds.map(round=>({
      name:round.name,win:round.win,ourPoints:round.ourPoints,
      theirPoints:round.theirPoints,ourRating:round.ourRating,
      theirRating:round.theirRating,report:round.report,reportVersion:round.reportVersion
    })):null,
    variant:variant?{base:variant.base.n,form:variant.form.name,ratingBonus:variantBonus}:null,
    variants:variants.map(({base,form})=>({base:base.n,form:form.name,ratingBonus:Math.max(0,Math.min(5,Number(form.ratingBonus)||0))})),
    cpuIds:[...new Set(rounds.flatMap(round=>round.cpuIds))],
    names:Object.values(v.roster).map(c=>c.n),
    ids:Object.values(v.roster).map(c=>c.id)};
  campaignRecordUsage(v,v.result);
  v.status='results';saveCampaign();
}
function campaignOrigin(c){
  if(!c)return {universe:'Unknown',work:'Unknown origin'};
  const universe=universeLabel(c.pool);
  const guide=window.DA_CHARACTER_GUIDES?.[c.pool]?.[c.n];
  if(guide?.works?.length)return {universe,work:guide.works.slice(0,3).join(' · ')};
  const entry=POOLS[c.pool]?.entries?.find(x=>x[0]===c.n);
  const tags=Array.isArray(entry?.[4])?entry[4]:[];
  if(c.pool==='games'&&tags.length)return {universe,work:tags[0].replace(/ Franchise$/,' franchise')};
  const groupNames=(c.g||[]).map(id=>GROUPS[id]?.name).filter(Boolean);
  const preferred=groupNames.find(n=>/Sesame Street|Fraggle Rock|The Muppet Show|The Simpsons|Looney Tunes|SpongeBob|Avatar|Kung Fu Panda|Tom and Jerry|Scooby|Peanuts|Mario|Zelda|Sonic|Disney|Pixar|Rick and Morty|Powerpuff|Transformers|Teenage Mutant|Mickey|Ralph|Incredibles|Shrek|Bluey/i.test(n));
  if(preferred)return {universe,work:preferred};
  return {universe,work:c.pool==='mcu'?'Marvel Cinematic Universe':c.pool==='nba'?'National Basketball Association':universe};
}
function renderCampaignRejected(){
  const v=S.campaign;
  if(!v.validationOpen||!v.validation||v.status!=='draft')return '';
  const bad=campaignInvalidSlots();
  if(!bad.size)return '';
  const offenders=[...bad].map(id=>({slot:id,c:v.roster[id],position:SPORTS[v.sport].pos.find(p=>p.id===id)})).filter(x=>x.c);
  return `<div class="campaign-reject-overlay" data-act="camp-reject-close">
    <div class="campaign-reject-card" role="alertdialog" aria-modal="true" aria-labelledby="campaign-reject-title" aria-describedby="campaign-reject-description" data-stop="1">
      <div class="eyebrow" style="color:var(--bad)">Campaign challenge</div>
      <h2 class="h" id="campaign-reject-title" style="margin:8px 0 12px">Lineup rejected</h2>
      <p id="campaign-reject-description">Your lineup includes ${bad.size} ${bad.size===1?'character who does not':'characters who do not'} qualify for <b>${esc(campaignStage().name)}</b>.</p>
      <p class="note" style="margin:8px 0">Highlighted in red on the field:</p>
      <ul class="campaign-reject-names">${offenders.map(({slot,c,position})=>{const detail=campaignEligibilityResult(c,campaignStage().rule,position);const trait=campaignCriteria(campaignStage().rule)?.trait;const issueUrl="https://github.com/garrettem-op/Draft_Anything/issues/new?"+new URLSearchParams({title:"Campaign eligibility: "+c.n+" / "+campaignStage().name,body:"Character: "+c.pool+":"+c.n+"\\nChallenge: "+campaignStage().name+"\\nCurrent finding: "+detail.reason+"\\nSupporting source / evidence: "}).toString();return `<li><span>${esc(c.n)}</span><small style="display:block;max-width:36ch;margin:4px 0 8px;color:var(--muted)">${esc(detail.reason)}</small>${campaignHasTheme(campaignStage().rule)?`<button class="btn small" data-act="camp-dispute-open" data-slot="${esc(slot)}" aria-label="Challenge rejection of ${esc(c.n)}">Challenge ruling</button>`:trait?`<a class="btn small" target="_blank" rel="noopener noreferrer" href="${esc(issueUrl)}">Report missing evidence</a>`:""}</li>`}).join('')}</ul>
      <p class="note">Unverified evidence is not an automatic denial. Report an incorrect classification without spending AI credits, or challenge an ability ruling through the review service.</p>
      <button class="btn primary" data-act="camp-reject-close" style="width:100%;margin-top:10px">Review highlighted characters</button>
    </div>
  </div>`;
}
// A dispute concerns one currently rejected character and one thematic challenge.
// No eligibility evidence is revealed during drafting before the lineup is submitted.
function renderCampaignDispute(){
  const v=S.campaign,slot=v.disputeSlot;
  if(!slot||v.status!=='draft')return '';
  const c=v.roster[slot],rule=campaignStage().rule;
  if(!c||!campaignHasTheme(rule))return '';
  const result=v.disputeResult,approved=result?.status==='approved',provisional=result?.status==='accepted_provisional';
  const allowed=approved||provisional;
  // The research provider sometimes appends long markdown citations to its prose.
  // Render evidence separately from its source links so mobile dialogs remain readable.
  const readable=value=>String(value||'')
    .replace(/\(\[[^\]\n]+\]\(https?:\/\/[^\s)]+\)\)/g,'')
    .replace(/\[[^\]\n]+\]\(https?:\/\/[^\s)]+\)/g,'')
    .replace(/\(https?:\/\/[^\s)]+\)/g,'')
    .trim();
  const sources=(result?.sources||[]).filter(url=>/^https:\/\/[^\s]+$/i.test(url)).slice(0,8);
  const status=KnowledgeEngine.status();
  const examples={
    healing:'Example: heals injuries or regenerates after taking damage',
    stealth:'Example: becomes invisible or evades detection in a specific scene',
    psychic:'Example: reads minds, controls thoughts or projects mental abilities',
    flight:'Example: flies, pilots a starfighter in combat, or personally commands an aerial/space battle from a Commander slot',
    magic:'Example: casts a spell or performs a supernatural magical feat',
    aquatic:'Example: survives or operates effectively underwater',
    fire:'Example: generates or controls fire in a specific scene',
    ice:'Example: freezes an opponent or controls ice',
    electric:'Example: generates or controls electricity',
    tech:'Example: invents, controls or uses extraordinary technology',
    teleport:'Example: instantly relocates through a teleportation ability',
    giants:'Example: grows to a giant size or is canonically enormous'
  };
  const placeholder=examples[rule]||'Describe a specific documented ability or feat';
  return `<div class="campaign-reject-overlay knowledge-overlay" data-act="camp-dispute-close">
    <div class="campaign-reject-card knowledge-dialog" role="dialog" aria-modal="true" aria-label="Challenge character eligibility" data-stop="1">
      <div class="row" style="align-items:center;justify-content:space-between;gap:12px">
        <div><div class="eyebrow">AI Character Knowledge Engine</div><h2 class="h" style="margin-top:6px">Challenge this ruling</h2></div>
        <button class="btn small" data-act="camp-dispute-close" ${v.disputeBusy?'disabled':''}>Close</button>
      </div>
      <p><b>${esc(c.n)}</b> · ${esc(campaignStage().name)}</p>
      ${!result?`
      <p class="note">This character does not hold an accepted tag or an approved appeal for this challenge. Describe a documented qualifying feat and optionally provide a source. Paid AI research is optional; accepted findings are queued for review.</p>
      <label class="field-label"><span>What ability or feat should qualify?</span><textarea data-input="camp-dispute-claim" rows="3" maxlength="700" placeholder="${esc(placeholder)}" ${v.disputeBusy?'disabled':''}>${esc(v.disputeClaim||'')}</textarea></label>
      <label class="field-label"><span>Optional source URL</span><input type="url" data-input="camp-dispute-source" value="${esc(v.disputeSource||'')}" placeholder="https://..." ${v.disputeBusy?'disabled':''}></label>
      ${!status.researchReady?'<p class="note">Live AI research is not yet activated. Your claim can be saved on this device for later retry, but it cannot be verified or shared until server setup is complete.</p>':'<p class="note"><b>Credit notice:</b> Researching this ruling calls the paid AI service. It is not required to continue your campaign. You will be asked to confirm before any request is sent.</p>'}
      ${v.disputeError?`<p role="alert" class="note" style="color:var(--bad)">${esc(v.disputeError)}</p>${v.disputeErrorCode==='api_credits_exhausted'?'<p><a href="https://platform.openai.com/settings/organization/billing/" target="_blank" rel="noopener noreferrer">Add OpenAI API credits</a></p>':''}`:''}
      <button class="btn primary" data-act="camp-dispute-submit" ${v.disputeBusy?'disabled':''} style="width:100%;margin-top:10px">${v.disputeBusy?'Researching sources…':!status.researchReady?'Save claim locally (offline)':'Run paid AI research'}</button>
      `: `
      <div role="status" style="padding:12px;border:1px solid ${allowed?'var(--good)':'var(--line)'};border-radius:10px;margin-top:14px">
        <b>${approved?'Verified — eligible for everyone':provisional?'Accepted — eligible in this Campaign':result.status==='rejected'?'Not supported — eligibility unchanged':'Pending further review — eligibility unchanged'}</b>
        <p class="note" style="margin:7px 0 0">${esc(result.reason|| (allowed?'You may use this character.':'The finding is in the review queue, but does not yet meet the threshold for provisional acceptance.'))}</p>
      </div>
      <p style="overflow-wrap:anywhere">${esc(readable(result.rationale)||'No additional reasoning available.')}</p>
      ${result.feat?`<p class="note" style="overflow-wrap:anywhere"><b>Demonstrated feat:</b> ${esc(readable(result.feat))}</p>`:''}
      ${sources.length?`<div><b>Research sources</b><ul>${sources.map((url,i)=>`<li><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Source ${i+1}: ${esc(new URL(url).hostname)}</a></li>`).join('')}</ul></div>`:''}
      <p class="note">${approved?'Permanent knowledge updated: this character now qualifies for every player.':provisional?'Your character is now eligible on this device; return to the field and submit once the rest of the lineup qualifies. The permanent knowledge record remains queued for review.':result.status==='rejected'?'This character is not eligible from the evidence currently provided. You can submit a different feat or replace the character.':'No automatic override was granted. Add better evidence to request a new assessment, or use another character while a reviewer examines this case.'}</p>
      ${allowed?'':`<button class="btn" data-act="camp-dispute-revise" style="width:100%;margin-bottom:8px">Add evidence and reassess</button>`}
      <button class="btn primary" data-act="camp-dispute-close" style="width:100%">${allowed?'Return to lineup — character eligible':'Return to lineup'}</button>
      `}
    </div>
  </div>`;
}
function renderCampaignInfo(){
  const id=S.campaign.infoId;
  if(!id||S.mode!=='champ'||!S.champ.campaignMode)return '';
  const c=candById('mashup',id);
  if(!c)return '';
  const o=campaignOrigin(c);
  return `<div class="modal-back" data-act="camp-info-close"><div class="modal" role="dialog" aria-modal="true" aria-label="Character origin" data-stop="1">
    <div class="row" style="justify-content:space-between"><h2 class="h">${esc(c.n)}</h2><button class="btn small" data-act="camp-info-close">Close</button></div>
    <p class="note">Where this character is from</p><p><b>${esc(o.work)}</b></p><p class="muted">Talent pool: ${esc(o.universe)}</p>
  </div></div>`;
}

function renderCampaignResults(){
  const v=S.campaign,r=v.result,st=campaignStage();
  if(!r){v.status='draft';return renderCampaignDraft();}
  const archived=report=>`<details class="panel da-aux"><summary>View archived stats</summary>${report||''}${r.opponentReport||''}${r.breakdownHTML||''}</details>`;
  return `<section class="da-results-screen">
    <div class="result-hero ${r.win?'perfect':''}">
      <span class="eyebrow" style="color:inherit">Campaign · Challenge ${v.step+1} / 10 · ${esc(st.name)}</span>
      <div class="big">${r.win?'<em>You win</em>':'You lose'}</div>
      ${r.finalRounds?.length?`<p>${r.finalRounds.filter(x=>x.win).length} of ${r.finalRounds.length} opponents defeated</p>`:''}
    </div>
    ${r.muppetTeam?.percent?`<div class="panel" style="padding:12px 16px;margin:12px 0"><b>MuppetForce camaraderie · +${r.muppetTeam.percent.toFixed(2)}% team rating</b><p class="note">${r.muppetTeam.performers} Muppet teammate(s) added +${r.muppetTeam.points.toFixed(2)} rating points. This bonus applies to the team, while individual MuppetForce multiplies position fit.</p></div>`:''}
    <div class="cta-row">
      ${r.win?`<button class="btn primary" data-act="camp-next">${v.step===9?'Claim championship':'Next challenge'}</button>`:`<button class="btn primary" data-act="camp-retry">Try again</button><button class="btn" data-act="camp-edit">Edit lineup</button><button class="btn" data-act="camp-concede">Concede campaign</button>`}
      <button class="btn" data-act="camp-setup">Campaign overview</button>
    </div>
    ${r.finalRounds?.length?`<div class="da-rounds">
        <div class="eyebrow">Multiverse Siege · Two bosses</div>
        ${r.finalRounds.map((round,i)=>`<details class="panel da-aux"><summary>${i+1}. ${esc(round.name)} · ${round.win?'Win':'Loss'} · <span class="num">${round.ourPoints}–${round.theirPoints}</span></summary>
           ${round.report||archived(r.report)}
        </details>`).join('')}
      </div>`:r.reportVersion===2?r.report:archived(r.report)}
  </section>`;
}

function renderCampaignComplete(){
  const v=S.campaign;
  return `<section class="da-results-screen"><div class="result-hero perfect">
      <span class="eyebrow" style="color:inherit">10 / 10 challenges won</span><div class="big"><em>Campaign Champion</em></div>
    </div>
    <div class="cta-row"><button class="btn primary" data-act="camp-reset">Start again</button><button class="btn" data-act="camp-setup">Campaign overview</button></div>
    <details class="panel da-aux"><summary>Review ten victories</summary><div class="da-aux-content">
      ${v.history.map((round,i)=>`<details class="panel da-aux"><summary>${i+1}. ${esc(round.name)} · ${esc(round.score||'')}</summary>
        ${round.finalRounds?.length?round.finalRounds.map((fight,k)=>`<details class="panel da-aux"><summary>${k+1}. ${esc(fight.name)} · ${fight.win?'Win':'Loss'}</summary>${fight.report||''}</details>`).join(''):round.report||'<p class="note">No saved report for this challenge.</p>'}
        ${!round.finalRounds?.length&&!round.report?.includes('da-result')?round.breakdownHTML||'':''}
        </details>`).join('')}
    </div></details>
  </section>`;
}
function renderCampaignDefeatHistory(){
  const rows=lsGet('da.campaign.defeats.v1',[]);
  if(!Array.isArray(rows)||!rows.length)return '';
  return `<details class="panel da-aux"><summary>Past campaign losses (${rows.length})</summary>${rows.map(r=>`<p>${esc(r.teamName)} · ${r.wins}/10 wins · ${esc(r.challenge)} · ${r.reason==='roster-exhausted'?'No legal roster':'Conceded'}</p>`).join('')}</details>`;
}
function renderCampaignDefeat(){
  const v=S.campaign,d=v.defeat;
  return `<section class="da-results-screen"><div class="result-hero">
      <span class="eyebrow" style="color:inherit">${v.step} / 10 challenges won</span><div class="big">Campaign lost</div>
      <p>${esc(d?.challenge||campaignStage().name)} · ${d?.reason==='roster-exhausted'?'No remaining lineup meets the challenge requirements after the CPU draft.':'You conceded this campaign.'}</p></div>
    ${campaignProgress()}
    <div class="cta-row"><button class="btn primary" data-act="camp-new">Start new campaign</button></div>
    ${renderCampaignDefeatHistory()}</section>`;
}
function renderCampaign(){
  const status=S.campaign.status;
  return S.campaign.defeat||status==='defeated'?renderCampaignDefeat():status==='draft'?renderCampaignDraft():status==='results'?renderCampaignResults():status==='complete'?renderCampaignComplete():renderCampaignSetup();
}
function campaignReset(){const {sport,teamName,singleUse}=S.campaign;S.campaign={...campaignDefault(),sport,teamName,singleUse};S.campaign.stageOrder=campaignNewOrder(sport);saveCampaign();}
function campaignAdvance(){
  const v=S.campaign;
  if(v.status!=='results'||!v.result?.win)return;
  campaignRecordUsage(v,v.result);
  v.history.push({name:campaignStage().name,ids:v.result.ids||Object.values(v.roster).map(c=>c.id),playerUsedIds:v.stageUsage.player,cpuIds:v.stageUsage.cpu,report:v.result.report,finalRounds:v.result.finalRounds,breakdownHTML:v.result.breakdownHTML,score:v.result.ourPoints+'–'+v.result.theirPoints});
  v.step++;
  v.roster={};v.snake=null;v.stageUsage=null;v.selected=null;v.query='';v.result=null;v.surge=null;v.variantTarget=null;
  v.status=v.step>=campaignStages().length?'complete':'draft';
  saveCampaign();
}

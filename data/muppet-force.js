/* MuppetForce: distinct from ToonForce.
   Model: character-specific puppet-stage physics, not unlimited reality rewriting.
   Scores are editorial/provisional gameplay judgments (0-99) based on recognizable
   recurring portrayals, NOT official canon measurements or automatic immunity.
   Dimensions: impact recovery, prop manipulation, stage-space use, cascading mayhem,
   and ensemble interaction. Absent characters receive no MuppetForce bonus.
   Source context:
   https://interviews.televisionacademy.com/shows/muppet-show-the
   https://www.tvencyclopedia.org/tv-encyclopedia-11/muppet-show-the
*/
/* Source ledger: movies establish a body of work, individual scenes establish feats.
   Research-queued films do NOT confer powers or change numeric ratings.
   A Muppet playing a fictional role can show puppet performance capabilities, but
   cannot automatically transfer that role's special weapons or story-specific magic.
   Scene summaries are derived from linked studio articles and published reviews;
   interpretations are editorial and explicitly narrower than universal feats. */
const MUPPET_FORCE_WORKS = Object.freeze([
  {
    "id": "muppet-show",
    "title": "The Muppet Show",
    "years": "1976–1981",
    "status": "foundational",
    "source": "https://interviews.televisionacademy.com/shows/muppet-show-the"
  },
  {
    "id": "muppet-movie-1979",
    "title": "The Muppet Movie",
    "year": 1979,
    "status": "research-queued",
    "source": "https://movies.disney.com/the-muppet-movie-1979"
  },
  {
    "id": "great-muppet-caper-1981",
    "title": "The Great Muppet Caper",
    "year": 1981,
    "status": "research-queued",
    "source": "https://muppets.disney.com/"
  },
  {
    "id": "muppets-take-manhattan-1984",
    "title": "The Muppets Take Manhattan",
    "year": 1984,
    "status": "research-queued",
    "source": "https://muppets.disney.com/"
  },
  {
    "id": "muppet-christmas-carol-1992",
    "title": "The Muppet Christmas Carol",
    "year": 1992,
    "status": "research-queued",
    "source": "https://muppets.disney.com/"
  },
  {
    "id": "muppet-treasure-island-1996",
    "title": "Muppet Treasure Island",
    "year": 1996,
    "status": "initial-feats-reviewed",
    "source": "https://d23.com/a-to-z/muppet-treasure-island-film/"
  },
  {
    "id": "muppets-from-space-1999",
    "title": "Muppets from Space",
    "year": 1999,
    "status": "research-queued",
    "source": "https://muppets.disney.com/"
  },
  {
    "id": "the-muppets-2011",
    "title": "The Muppets",
    "year": 2011,
    "status": "research-queued",
    "source": "https://muppets.disney.com/"
  },
  {
    "id": "muppets-most-wanted-2014",
    "title": "Muppets Most Wanted",
    "year": 2014,
    "status": "research-queued",
    "source": "https://muppets.disney.com/"
  }
]);
const MUPPET_FORCE_FEATS = Object.freeze([
  {
    "id": "mti-gonzo-torture",
    "workId": "muppet-treasure-island-1996",
    "character": "Gonzo",
    "role": "Gonzo",
    "dimension": "resilience",
    "summary": "During pirate interrogation, Gonzo's reaction to the rack becomes enjoyment rather than ordinary intimidation.",
    "inference": "Supports extraordinary pain tolerance and slapstick adversity, not immunity to injury or all damage.",
    "continuity": "character-portrayal",
    "evidence": "reported-scene",
    "sources": [
      "https://www.grouchoreviews.com/reviews/6334f8a75fe75d1811c62bb4",
      "https://muppet.fandom.com/wiki/Masochism"
    ]
  },
  {
    "id": "mti-gonzo-starfish",
    "workId": "muppet-treasure-island-1996",
    "character": "Gonzo",
    "role": "Gonzo",
    "dimension": "props",
    "summary": "Gonzo uses starfish as throwing-star projectiles during the pirate confrontation.",
    "inference": "A scene-specific example of weaponizing environment objects; does not establish unlimited projectile conjuring.",
    "continuity": "character-portrayal",
    "evidence": "reported-scene",
    "sources": [
      "https://www.splicedwire.com/96reviews/muppet.html"
    ]
  },
  {
    "id": "mti-kermit-duel",
    "workId": "muppet-treasure-island-1996",
    "character": "Kermit the Frog",
    "role": "Captain Smollett",
    "dimension": "props",
    "summary": "Kermit's Captain Smollett engages in staged sword combat against a human pirate antagonist.",
    "inference": "Evidence of choreography, reach and prop handling within this film; not automatic master swordsman status in every role.",
    "continuity": "fictional-role",
    "evidence": "studio-production",
    "sources": [
      "https://d23.com/wda-sailing-for-muppet-y-adventure-on-the-high-seas/"
    ]
  },
  {
    "id": "mti-misspiggy-martial",
    "workId": "muppet-treasure-island-1996",
    "character": "Miss Piggy",
    "role": "Benjamina Gunn",
    "dimension": "mayhem",
    "summary": "Miss Piggy's Benjamina uses her characteristic martial-arts attacks during the pirate battle.",
    "inference": "Supports recurring striking and aggressive environmental disruption; not a limitless strength multiplier.",
    "continuity": "fictional-role",
    "evidence": "studio-production",
    "sources": [
      "https://d23.com/wda-sailing-for-muppet-y-adventure-on-the-high-seas/"
    ]
  },
  {
    "id": "mti-kermit-cliff",
    "workId": "muppet-treasure-island-1996",
    "character": "Kermit the Frog",
    "role": "Captain Smollett",
    "dimension": "resilience",
    "summary": "Kermit and Miss Piggy remain conscious and sing while suspended upside down as a rope burns; a rescue prevents the fall.",
    "inference": "Supports unusual composure and physical performance under peril, but does not prove surviving a fall.",
    "continuity": "fictional-role",
    "evidence": "studio-production",
    "sources": [
      "https://d23.com/muppet-treasure-island-did-you-know-2/",
      "https://www.aol.com/articles/muppet-treasure-island-30-oral-125206000.html"
    ]
  },
  {
    "id": "mti-piggy-cliff",
    "workId": "muppet-treasure-island-1996",
    "character": "Miss Piggy",
    "role": "Benjamina Gunn",
    "dimension": "resilience",
    "summary": "Benjamina and Captain Smollett perform a duet upside down over a cliff; they are rescued.",
    "inference": "Supports resilience and composure while suspended, but neither character is proven fall-proof.",
    "continuity": "fictional-role",
    "evidence": "studio-production",
    "sources": [
      "https://d23.com/muppet-treasure-island-did-you-know-2/"
    ]
  },
  {
    "id": "mti-statler-figurehead",
    "workId": "muppet-treasure-island-1996",
    "character": "Statler",
    "role": "Hispaniola figurehead",
    "dimension": "stage",
    "summary": "Statler appears as a talking figurehead at the ship's bow.",
    "inference": "Supports improbable theatrical placement and the ability to heckle across a set; not literal teleportation.",
    "continuity": "fictional-role",
    "evidence": "contemporary-review",
    "sources": [
      "https://www.washingtonpost.com/archive/lifestyle/1996/02/16/seeworthy-muppets/05904985-76c8-499c-b196-4845fdf15d5f/"
    ]
  },
  {
    "id": "mti-waldorf-figurehead",
    "workId": "muppet-treasure-island-1996",
    "character": "Waldorf",
    "role": "Hispaniola figurehead",
    "dimension": "stage",
    "summary": "Waldorf appears alongside Statler as a talking ship figurehead.",
    "inference": "Supports theatrical scene integration; not invulnerability or instant travel.",
    "continuity": "fictional-role",
    "evidence": "contemporary-review",
    "sources": [
      "https://www.washingtonpost.com/archive/lifestyle/1996/02/16/seeworthy-muppets/05904985-76c8-499c-b196-4845fdf15d5f/"
    ]
  },
  {
    "id": "mti-rizzo-rats",
    "workId": "muppet-treasure-island-1996",
    "character": "Rizzo the Rat",
    "role": "Rizzo",
    "dimension": "ensemble",
    "summary": "Rizzo has vacationing rats aboard the Hispaniola who treat a pirate voyage like a cruise.",
    "inference": "A social and environmental gag that demonstrates ensemble chaos, not physical invulnerability.",
    "continuity": "character-portrayal",
    "evidence": "contemporary-review",
    "sources": [
      "https://www.spokesman.com/stories/1996/feb/16/sail-the-high-seas-with-the-muppets/",
      "https://www.washingtonpost.com/archive/lifestyle/1996/02/16/seeworthy-muppets/05904985-76c8-499c-b196-4845fdf15d5f/"
    ]
  },
  {
    "id": "mti-fozzie-bimbo",
    "workId": "muppet-treasure-island-1996",
    "character": "Fozzie Bear",
    "role": "Squire Trelawney",
    "dimension": "props",
    "summary": "Fozzie's Squire Trelawney repeatedly treats his finger as the home of Mr. Bimbo.",
    "inference": "An absurd role-specific prop/character gag, explicitly not proof of magical creation or a living creature in Fozzie's finger.",
    "continuity": "fictional-role",
    "evidence": "contemporary-review",
    "sources": [
      "https://www.spokesman.com/stories/1996/feb/16/sail-the-high-seas-with-the-muppets/",
      "https://muppet.fandom.com/wiki/Mr._Bimbo"
    ]
  }
]);
function muppetForceHistoryOf(candidate) {
  if (!candidate || candidate.pool !== 'muppets') return [];
  return MUPPET_FORCE_FEATS.filter(f => f.character === candidate.n).map(f => ({...f,work:MUPPET_FORCE_WORKS.find(w => w.id === f.workId)}));
}
const MUPPET_FORCE_DIMENSIONS = Object.freeze([
  {key:'resilience',label:'Puppet resilience',weight:0.30,description:'Returns from impacts, explosions or distortion beyond an ordinary body'},
  {key:'props',label:'Prop manipulation',weight:0.25,description:'Treats food, furniture, inventions or stage props as extraordinary tools'},
  {key:'stage',label:'Stage-space physics',weight:0.15,description:'Exploits theatrical entrances, backstage space, set pieces or concealed mechanics'},
  {key:'mayhem',label:'Chaos escalation',weight:0.20,description:'Turns a simple interaction into an escalating physical chain reaction'},
  {key:'ensemble',label:'Ensemble contagion',weight:0.10,description:'Draws teammates, rivals or bystanders into a gag or coordinated spectacle'}
]);
/* Values below are intentionally individualized. Scores indicate recurring comedy
   affordances, not literal lifting strength or immunity to serious fictional threats.
   Format: [resilience, props, stage, mayhem, ensemble, illustrative feat, limit]. */
const MUPPET_FORCE_PROFILES = Object.freeze({
  'Kermit the Frog':[53,68,95,57,99,'Keeps a collapsing backstage production moving while drawing an ensemble into action.','Usually the straight man; stage control does not grant superhuman force.'],
  'Miss Piggy':[82,58,65,88,68,'Her theatrical karate outbursts send other performers and props flying.','Impulsive reactions can derail coordination and precision.'],
  'Fozzie Bear':[69,50,75,80,90,'Stage mishaps, failed props and heckling fuel recurring physical comedy.','Not a reliable winner of deliberate fights.'],
  'Gonzo':[99,83,80,96,70,'Performs improbable cannonball, stunt and impact routines.','Thrill seeking sacrifices control; he is not immune to every danger.'],
  'Animal':[86,80,55,99,69,'Breaks performance boundaries in explosive, prop-heavy drumming and physical chaos.','Poor impulse control and weak tactical discipline.'],
  'Swedish Chef':[80,99,85,99,48,'Meals, utensils and unruly ingredients become violent slapstick set pieces.','Cooking chaos is unreliable and can backfire.'],
  'Beaker':[99,66,74,90,49,'Repeatedly returns from Muppet Labs disasters, fires and failed experiments.','A frequent victim, not the engineer or controller of the disaster.'],
  'Dr. Bunsen Honeydew':[59,97,70,85,54,'Introduces bizarre inventions that reshape the immediate stage action.','Experiments regularly fail or endanger allies.'],
  'Statler':[70,45,92,69,90,'Balcony interruptions and recurring heckles redirect an act from beyond the stage.','Verbal interference is much stronger than direct physical ability.'],
  'Waldorf':[70,45,92,69,90,'Coordinated balcony heckling repeatedly overwhelms on-stage performers.','Limited physical mobility and direct combat output.'],
  'Lew Zealand':[73,99,61,79,55,'Uses returning boomerang fish as an absurd but repeatable ranged prop.','Highly specialized; not evidence of unlimited projectile control.'],
  'Crazy Harry':[92,94,74,99,49,'Explosive interruptions repeatedly demolish sets in response to a cue.','Blasts are indiscriminate and can hit his own team.'],
  'Scooter':[56,74,95,60,88,'Uses backstage logistics, staging and props to keep acts functioning.','Management advantage is not superhuman bodily resilience.'],
  'Rizzo the Rat':[76,72,74,74,80,'Improvises from small spaces and routinely navigates oversized sets and hazards.','Small size limits physical force and reach.'],
  'Pepe the King Prawn':[67,73,75,78,77,'Turns tiny-scale props and social distractions into disproportionate trouble.','Limited range and physical strength.'],
  'Oscar the Grouch':[72,95,86,77,52,'His trash can functions as an unusually versatile home and prop space.','The can does not make him omnipotent outside that context.'],
  'Cookie Monster':[80,86,65,90,64,'Food-driven gags involve frantic consumption and disorderly handling of objects.','Compulsion for cookies undermines judgment.'],
  'Big Bird':[72,65,78,58,92,'A very large puppet body navigates sets and community ensembles.','Gentle temperament; no basis for extreme destructive feats.'],
  'Grover':[81,75,78,85,77,'Super Grover makes ambitious entrances and slapstick heroic attempts.','Landing and navigation remain famously inconsistent.'],
  'The Count':[66,71,83,55,75,'Counting bits restructure the pacing and interaction of a scene.','A counting compulsion is not temporal or cosmic control.'],
  'Ernie':[72,80,78,76,88,'Toy and prank-based scenes transform ordinary objects into escalating gags.','Impulsiveness, not destructive physical power.'],
  'Elmo':[70,70,77,75,95,'Direct address and playful participation pull the surrounding cast into an act.','Audience participation is situational, not mind control.'],
  'Bert':[56,68,67,52,66,'His meticulous interest in everyday objects enables prop-centered routines.','Rigid habits leave him vulnerable to surprise.'],
  'Marvin Suggs':[74,95,70,82,55,'Uses living Muppaphone performers as an extraordinarily interactive instrument.','Narrow specialty; performances can provoke resistance.'],
  'The Newsman':[94,70,85,82,44,'Physical calamities repeatedly interrupt his news reports.','Nearly always the target rather than the controller of hazards.'],
  'Big Mean Carl':[83,88,72,84,48,'Consumes unexpectedly large objects or creatures during comedy bits.','Capacity for absurd swallowing is not general matter control.'],
  'Sweetums':[70,76,79,70,67,'His enormous stage presence changes how scenery and smaller performers interact.','Most of his power is real size, already accounted for separately.'],
  'Walter':[65,78,89,71,90,'Uses staging and group performance to help reunite a theatrical ensemble.','Not a heavy hitter or invulnerable figure.'],
  'Gobo Fraggle':[65,72,80,65,82,'Moves confidently through unusual interconnected environments with the Fraggle ensemble.','Adaptability, rather than reality manipulation.'],
  'Wembley Fraggle':[72,70,76,77,78,'Misadventures with other Fraggles turn simple chores into ensemble disorder.','Indecision frequently breaks initiative.'],
  'Red Fraggle':[75,65,70,65,73,'Athletic play and slapstick in the Rock create unusual movement opportunities.','Sports skill is not wholesale cartoon physics.'],
  'Marjory the Trash Heap':[79,88,91,71,80,'A speaking trash heap reshapes how discarded matter and advice become stage action.','Largely stationary; cannot transfer that ability to arbitrary matter.'],
  'Cotterpin Doozer':[67,93,75,62,77,'Fraggle Rock structures are quickly created, used and consumed as functional scenery.','Requires materials and work; not spontaneous conjuration.'],
  'Emmet Otter':[57,81,72,58,80,'Turns household objects into inventive performance equipment.','An inventive musician, not a supernatural powerhouse.'],
  "Rowlf the Dog":[69,82,78,65,91,"Pianist and stage-show veteran brings understated physical humor and ensemble musical timing.","Musical improvisation is not reality manipulation."],
  "Sam Eagle":[60,64,78,68,75,"His patriotic lectures routinely lose control of the surrounding Muppet performance.","Authority is comedic, not invulnerability."],
  "Robin the Frog":[57,66,84,61,85,"Small frog participates in stage acts and improbable backstage choreography.","Small size limits physical force."],
  "Camilla the Chicken":[65,70,78,65,80,"Performs with Gonzo amid elaborate ensemble stage gags.","Does not independently replicate Gonzo's most extreme stunts."],
  "Dr. Teeth":[69,90,89,78,93,"Leads the Electric Mayhem through exaggerated performances and prop-heavy shows.","Musical spectacle is not elemental magic."],
  "Floyd Pepper":[65,86,82,70,87,"Electric Mayhem bassist performs in theatrical chaos.","Musical agility does not confer combat invulnerability."],
  "Janice":[62,78,82,63,84,"Electric Mayhem guitarist improvises through the show's ensemble mayhem.","No demonstrated unlimited prop control."],
  "Zoot":[61,70,82,63,83,"Saxophonist stays in absurd stage circumstances with the Electric Mayhem.","Deadpan comedy is not physical supremacy."],
  "Lips":[60,76,82,63,80,"Trumpeter participates in chaotic Electric Mayhem spectacles.","Band participation is not infinite durability."],
  "Uncle Deadly":[70,82,90,78,87,"Theatrical phantom emerges through backstage drama and elaborate stagecraft.","Stage magic does not establish real supernatural powers."],
  "Link Hogthrob":[69,75,84,79,82,"Portrays swaggering space-captain heroics and recurring set-piece chaos.","Space-adventure roles do not grant real spacecraft powers."],
  "Dr. Julius Strangepork":[66,84,85,79,75,"Comedic space scientist manipulates theatrical props and gadgets.","Fictional inventions are role-limited."],
  "Mahna Mahna":[71,69,95,90,90,"Breaks musical rhythm and stage boundaries in an absurd vocal routine.","Song-based behavior is not mind control."],
  "Bobo the Bear":[73,72,73,71,78,"Large Muppet bear participates in slapstick and security mishaps.","Big stature alone is not supernatural strength."],
  "Clifford":[66,77,87,68,90,"Coordinates stage music and ensemble productions amid comic disorder.","Host authority does not guarantee control."],
  "Constantine":[78,85,85,85,76,"Impersonates Kermit while engineering elaborate disguise and caper gags.","Disguise is not shapeshifting or superpowers."],
  "Johnny Fiama":[70,79,88,76,83,"Crooner's melodramatic performances disrupt the surrounding show.","Stage personality does not make attacks superhuman."],
  "Sal Minella":[75,81,82,82,88,"Comic sidekick manages props and overreacts in Johnny Fiama routines.","Pranks are limited to practical sets."],
  "Spa'am":[72,77,80,75,80,"Theatrical island pig turns a pirate adventure into exaggerated performance.","Role-specific action is not general magic."],
  "Bean Bunny":[66,75,84,71,85,"Innocent small rabbit prompts outsized ensemble reactions and visual gags.","Cuteness does not prevent ordinary injury."],
  "Beauregard":[74,85,85,79,76,"Janitor's stage operations accidentally create elaborate physical mishaps.","Clumsy props are not precise technological weapons."],
  "Thog":[82,77,77,75,69,"Towering blue creature interacts with performers and large stage sets.","Large physique already belongs in the size attribute."],
  "Doglion":[77,75,81,75,74,"Unusually large Muppet creature stages surreal visual interactions.","Little evidence for unlimited destructive feats."],
  "Seymour":[66,80,86,73,81,"Partners in absurd stage and character performances.","Narrow repertoire does not imply invincibility."],
  "Pops":[63,73,90,67,87,"Hotel doorman welcomes chaotic visitors into the Muppet venue.","Environment familiarity does not mean teleportation."],
  "Hilda":[65,86,89,72,79,"Wardrobe and backstage organizer manages absurd set-and-costume comedy.","Clothing props are not reality rewriting."],
  "Annie Sue":[64,76,87,64,88,"Young singer participates in the variety show and performer rivalries.","Stage poise does not prove superhuman endurance."],
  "Mr. Snuffleupagus":[78,73,81,61,88,"Immense Snuffleupagus traverses Sesame Street scenery in unlikely gentle gags.","His size is real; gentle comedy is not unlimited force."],
  "Abby Cadabby":[71,91,82,80,88,"Fairy-in-training uses unpredictable wand spells amid Sesame Street routines.","Magic is imperfect and should be separately evaluated as magic."],
  "Zoe":[66,79,80,73,90,"Enthusiastic playful routines pull fellow Sesame Street performers into games.","Games are situational and not combat skills."],
  "Rosita":[67,77,86,71,90,"Multilingual monster engages musical puppetry and coordinated community comedy.","Social skill does not grant mind control."],
  "Telly Monster":[74,75,75,82,87,"Anxious monster reacts dramatically to everyday Sesame Street situations.","Anxiety is not a literal predictive ability."],
  "Herry Monster":[76,76,75,77,83,"Broad monster movement turns everyday events into physical jokes.","Ordinary strength remains separately scored."],
  "Prairie Dawn":[60,79,90,63,88,"Young director stages elaborate skits with recalcitrant monster performers.","Directing acts does not confer instant command."],
  "Baby Bear":[68,75,76,72,83,"Bear cub's domestic play and family antics create exaggerated physical moments.","Child status limits sustained physical capability."],
  "Curly Bear":[63,71,75,71,83,"Energetic bear cub participates in repetitive family-and-stage gags.","Childlike humor is not unstoppable chaos."],
  "Two-Headed Monster":[76,82,83,87,86,"Two coordinated heads turn simple tasks into escalating cooperative confusion.","Both heads still share one ordinary creature's body."],
  "Guy Smiley":[78,93,97,89,90,"Bombastic game-show host transforms mundane activities into elaborate staged competitions.","Television presentation is not literal power over reality."],
  "Mr. Johnson":[78,76,82,81,68,"Repeatedly suffers absurd service mishaps during Grover's waiter routines.","Often the target, not controller, of slapstick."],
  "Slimey the Worm":[63,71,77,67,82,"Tiny worm manages surprisingly elaborate stage activities at his scale.","Miniature props are not human-scale feats."],
  "Honkers":[70,85,80,81,85,"Honk-driven ensemble acts alter scene tempo and character reactions.","Sound gags do not amount to sonic weaponry."],
  "Murray Monster":[68,82,83,73,92,"Street-interview and educational routines involve viewers and performers.","Audience involvement is limited by context."],
  "Frazzle":[76,74,77,81,74,"Furry monster reacts with oversized vocal and stage comedy.","Monster appearance alone is not invulnerability."],
  "Gladys the Cow":[72,72,78,69,83,"Talking cow engages in animated ensemble-style Sesame Street segments.","Talking-animal depiction is not general shapeshifting."],
  "Sherlock Hemlock":[67,82,87,82,79,"Bungling detective turns observations and props into comedic mysteries.","Mystery routines rarely produce actual tactical brilliance."],
  "Roosevelt Franklin":[68,79,82,68,88,"Comedic teacher orchestrates animated classroom interactions.","Teaching does not grant mind control."],
  "Barkley":[74,74,73,76,80,"Shaggy dog negotiates stage props and energetic physical routines.","Canine comedy is not limitless resilience."],
  "Hoots the Owl":[65,78,84,66,85,"Jazz-playing owl joins musical and educational Sesame Street acts.","Bird stage presence does not automatically confer flight."],
  "Little Bird":[61,69,79,64,81,"Small bird participates in Sesame Street's unusual-scale puppetry.","Small-scale physical feats do not scale up."],
  "Bernice":[62,67,71,63,72,"Bert's pigeon appears in playful Sesame Street interactions.","Ordinary pigeon motions remain ordinary."],
  "Forgetful Jones":[70,73,83,86,83,"Forgetfulness repeatedly derails Western-themed educational sketches.","Comic confusion reduces reliable planning."],
  "Ji-Young":[64,77,83,67,90,"Guitar-playing character supports musical community participation.","Musical cohesion is not supernatural skill."],
  "Lefty the Salesman":[69,90,77,80,69,"Prop-driven salesman performs surreal deals with Ernie.","Unusual wares do not imply unlimited conjuring."],
  "The Amazing Mumford":[68,93,88,82,80,"Magician's stage spells frequently produce unforeseen comic outcomes.","Unpredictable magic remains ability-limited."],
  "Grundgetta":[71,80,76,84,82,"Grouch character turns trash and argumentative encounters into stage humor.","Grouch behavior is not literal damage immunity."],
  "Bruno the Trashman":[73,83,77,76,74,"Trashman handles Oscar's unlikely portable trash-can home.","Carrying the can is not interdimensional storage power."],
  "Boober Fraggle":[68,83,81,76,87,"Laundry, worry and household logistics become absurd Fraggle Rock adventures.","Domestic utility is not invulnerability."],
  "Mokey Fraggle":[70,86,83,66,94,"Artistic and empathetic Fraggle redirects friends through theatrical collaboration.","Empathy is not supernatural manipulation."],
  "Uncle Traveling Matt":[72,79,92,84,87,"Adventures in the human world turn ordinary objects into strange discoveries.","Misinterpretations do not confer superhuman intelligence."],
  "Sprocket":[74,69,77,72,84,"Dog attempts to communicate across the human and Fraggle worlds.","Observation and persistence do not alter matter."],
  "Doc":[52,82,76,56,83,"Human inventor engages with the improbable Fraggle setting and practical gadgets.","Human actor in the pool: MuppetForce reflects ensemble comedy, not puppet-body resilience."],
  "Junior Gorg":[81,78,81,83,79,"Giant Gorg's clumsiness transforms ordinary garden work into giant-scale slapstick.","Giant size already captured in size and strength."],
  "Pa Gorg":[79,77,76,80,75,"Parental giant reacts with exaggerated pomp and bumbling theatrical force.","No evidence of infinite strength."],
  "Ma Gorg":[78,80,80,78,85,"Gorg family's bossier member manages large-scale domestic chaos.","Camaraderie is contextual, not universal authority."],
  "Philo and Gunge":[70,85,89,88,90,"Trash Heap attendants echo and escalate absurd theatrical exchanges.","Physical stage duties do not prove omnipotence."],
  "Cantus":[65,87,93,67,96,"Minstrel leads ensemble Fraggles in surprising musical and imaginative rituals.","Musical insight is not unrestricted sorcery."],
  "Ma Otter":[66,85,87,63,91,"Musical ingenuity and family teamwork turn scarce objects into a stage act.","Creative resourcefulness is not magical conjuring."]
});
const MUPPET_FORCE_RULE = Object.freeze({
  id:'muppetforce',
  name:'MuppetForce',
  campaignMinimum:65,
  description:'Puppet-stage physics: abnormal impact recovery, improvised props, set-space tricks, escalating slapstick and ensemble manipulation. Distinct from ToonForce.',
  limitation:'Only observed or reasonably extrapolated stage interactions qualify. No automatic immortality, instant prop creation, reality rewriting or scaled-up cosmic attacks.'
});
function muppetForceOf(candidate) {
  if (!candidate || candidate.pool !== 'muppets') return null;
  const raw=MUPPET_FORCE_PROFILES[candidate.n];
  if (!raw) return null;
  const dimensions=Object.fromEntries(MUPPET_FORCE_DIMENSIONS.map((d,i)=>[d.key,raw[i]]));
  const score=Math.round(MUPPET_FORCE_DIMENSIONS.reduce((total,d)=>total+dimensions[d.key]*d.weight,0));
  return {type:'muppetforce',score,dimensions,feat:raw[5],limit:raw[6],
    tier:score>=85?'extraordinary':score>=70?'established':score>=55?'situational':'minor'};
}
// MuppetForce is a META-RATING that modifies the result of each sport's
// existing role-fit calculation. It never replaces the 12 canonical stats,
// never grants flight, magic or other abilities, and never alters eligibility.
// Every official Muppet pool entry receives its own individualized profile.
function muppetForceMultiplier(candidate,sportKey,pos) {
  const mf=muppetForceOf(candidate);
  if(!mf||!pos||pos.coach||pos.bench)return 1;
  const d=mf.dimensions;
  const support=(0.30*d.resilience+0.25*d.props+0.20*d.mayhem+
    0.15*d.stage+0.10*d.ensemble)/99;
  const intensity=0.55*(mf.score/99)+0.45*support;
  // Brawl embraces wild puppet-stage physics; regulated sports cap the effect.
  const maxLift=sportKey==='brawl'?0.52:0.36;
  return +(1+maxLift*intensity).toFixed(5);
}
// Legacy method name retained for callers; now returns a MULTIPLIER, not an
// additive rating. Use muppetForceMultiplier for new integrations.
function muppetForceFit(candidate,sportKey,pos) {
  return muppetForceMultiplier(candidate,sportKey,pos);
}
// An identity-distinct Muppet benefit: performers make the OTHER members of
// their team work better together. This is a single bounded team-wide rating
// multiplier (not one stack per recipient), including mixed-universe squads.
// Coaches count less than starters; benches count even less.
function muppetForceTeamwork(roster,positions,baseRating) {
  if(!Array.isArray(positions)||!roster||!Number.isFinite(baseRating)||baseRating<=0)
    return {percent:0,points:0,performers:0,teammates:0};
  let ensembleStrength=0,performers=0,teammates=0;
  for(const p of positions){
    const c=roster[p.id];if(!c)continue;
    teammates++;
    if(c.pool!=='muppets')continue;
    const force=muppetForceOf(c);
    if(!force)continue;
    performers++;
    const influence=p.coach?0.6:p.bench?0.35:1;
    ensembleStrength+=influence*(force.dimensions.ensemble/99);
  }
  if(!performers||teammates<2)return {percent:0,points:0,performers,teammates};
  // MuppetForce has less SOLO combat impact than ToonForce, but camaraderie
  // becomes a true equalizer as the number of Muppets on a team rises.
  // One Muppet typically adds ~3-4%, three ~10-12%, five ~15-18%.
  // Power-law returns prevent exponential stacks; absolute cap 22%.
  const percent=+Math.min(22,4.8*Math.pow(ensembleStrength,0.90)).toFixed(3);
  return {percent,points:+(baseRating*percent/100).toFixed(4),performers,teammates};
}
if(typeof module!=='undefined' && module.exports){
  module.exports={MUPPET_FORCE_WORKS,MUPPET_FORCE_FEATS,MUPPET_FORCE_DIMENSIONS,MUPPET_FORCE_PROFILES,MUPPET_FORCE_RULE,muppetForceHistoryOf,muppetForceOf,muppetForceFit,muppetForceMultiplier,muppetForceTeamwork};
}

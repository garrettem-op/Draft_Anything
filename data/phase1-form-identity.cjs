/* Researched same-person identity continuity in the explicitly named Variant Surge
 * catalog. This file addresses the "women" challenge only. It does NOT
 * propagate supernatural abilities, physical powers, color, age or equipment
 * from baseline to variants. Species with variable/unknown sex are omitted.
 */
'use strict';
const identities=Object.create(null);
function add(pool,sex,names,reference){
 for(const n of names.split('|').filter(Boolean)){
  const key=pool+':'+n;
  if(identities[key])throw new Error('Duplicate alternate-form gender identity '+key);
  identities[key]={decision:sex==='female'?'yes':'no',identity:sex,reference};
 }
}
add('mcu','female','Jean Grey|Scarlet Witch|Captain Marvel',
 'Marvel Comics stories identifying Jean Grey, Wanda Maximoff and Carol Danvers');
add('mcu','male','Thor|Hulk|Iron Man|Loki|Doctor Strange|Captain America|Spider-Man|Black Panther|War Machine|Falcon|Winter Soldier|Odin|Thanos|Doctor Doom|Wolverine|Sentry|Deadpool|Namor|Adam Warlock|Moon Knight',
 'Marvel Comics / Marvel Studios stories identifying these characters and their alternate forms');
// Ultron is not represented as a female character; his intelligence is an AI.
add('mcu','male','Ultron','Marvel Comics / What If...? Infinity Ultron robotic identity');
// Silver Surfer Black is the Norrin Radd comics incarnation, not the female
// Shalla-Bal portrayed in the new Fantastic Four film. Form-specific, not base.
add('mcu','male','Silver Surfer','Silver Surfer: Black (2019), Norrin Radd');

add('dc','female','Wonder Woman|Raven|Supergirl (Kara Zor-El)',
 'DC Comics stories depicting Diana, Raven and Kara in the indicated forms');
add('dc','male','Batman|Superman|The Flash (Barry Allen)|The Flash (Wally West)|Green Lantern (Hal Jordan)|Green Lantern (John Stewart)|Aquaman|Martian Manhunter|Shazam|Beast Boy|Joker|Lex Luthor|Darkseid|Sinestro|Swamp Thing|Blue Beetle (Jaime Reyes)|Deathstroke',
 'DC Comics source identity persists in the specific powered-up or equipment form');

add('games','female','Princess Peach|Zelda|Samus Aran|Bayonetta',
 'Nintendo and PlatinumGames portrayals of the named female protagonist in the specified transformation');
add('games','male','Sonic the Hedgehog|Shadow the Hedgehog|Mario|Link|Bowser|Luigi|Ganondorf|Tails|Knuckles|Ryu|Jin Kazama|Liu Kang|Sephiroth|Dante|Arthas Menethil|Illidan Stormrage|Mega Man|Winston',
 'Named video-game series identity persists through each specified in-game powerup or armor state');
// Kirby deliberately omitted; Japanese source treats sex ambiguously.

add('starwars','female','Ahsoka Tano|Rey',
 'Star Wars series portrayal of Ahsoka Tano and Rey in each listed costume/Force state');
add('starwars','male','Luke Skywalker|Emperor Palpatine|Obi-Wan Kenobi|Darth Vader',
 'Star Wars films, TV and Legends narrative portrayals of each named variant');

add('lotr','male','Gandalf|Sauron|Saruman|Beorn|Morgoth (Melkor)|Gollum (Sméagol)',
 'The Hobbit, Lord of the Rings and Silmarillion descriptions of the named male-presenting identities');

add('harrypotter','female','Minerva McGonagall|Rita Skeeter|Nagini',
 'Harry Potter book series and Fantastic Beasts portrayals of the named female identities in Animagus/Maledictus forms');
add('harrypotter','male','Albus Dumbledore|Lord Voldemort|Severus Snape|Sirius Black|Remus Lupin|Peter Pettigrew|Gellert Grindelwald|Harry Potter|Credence Barebone',
 'Harry Potter and Fantastic Beasts portrayals of the same male characters in the specified form');

add('toons','female','Elsa','Frozen II (2019), Elsa the Fifth Spirit');
add('toons','male','Bugs Bunny|Popeye|Mickey Mouse|Shrek|Simba|Aang|Zuko|Optimus Prime|Megatron|SpongeBob SquarePants|Stitch',
 'The corresponding animated films and television episodes portray these same characters in their altered forms');
/** Form-specific decision, not inherited power eligibility. */
function formIdentityFinding(base,form){
 const record=identities[base?.id||base?.pool+':'+base?.n];
 if(!record||!form?.name)return null;
 const source=form.origin||form.continuity||record.reference;
 return {
   decision:record.decision,
   status:'form-identity-reviewed',
   reason:form.name+' is depicted as '+record.identity+' and represents the same character identity as '+base.n+'; the transformation changes powers, form or equipment, not that identity. Grounding: '+record.reference+'.',
   source,
   continuity:form.continuity||''
 };
}
module.exports={identities:Object.freeze(identities),formIdentityFinding};

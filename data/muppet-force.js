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
  'Emmet Otter':[57,81,72,58,80,'Turns household objects into inventive performance equipment.','An inventive musician, not a supernatural powerhouse.']
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
// Preserves the universal 12-attribute model. Moderate, contextual bonuses apply
// to position fit, not to raw strength, speed, damage or durability. AI and player
// evaluations should both call this one function.
function muppetForceFit(candidate,sportKey,pos) {
  const mf=muppetForceOf(candidate);
  if(!mf || !pos || pos.coach || pos.bench || mf.score<55)return 0;
  const d=mf.dimensions, intensity=(mf.score-50)/49;
  if(sportKey==='brawl'){
    const context=0.55+0.25*d.resilience/99+0.20*Math.max(d.props,d.mayhem)/99;
    return Math.min(1.75,1.75*intensity*context);
  }
  // Regulated sports permit a ball and legal coordinated action, but not stage
  // explosives, conjured objects, or theater-only evasions.
  const context=0.32+0.18*d.props/99+0.15*d.ensemble/99;
  return Math.min(0.7,0.7*intensity*context);
}
if(typeof module!=='undefined' && module.exports){
  module.exports={MUPPET_FORCE_DIMENSIONS,MUPPET_FORCE_PROFILES,MUPPET_FORCE_RULE,muppetForceOf,muppetForceFit};
}

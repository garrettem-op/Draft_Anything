/* ToonForce uses the SAME post-attribute role-multiplier interface as MuppetForce,
 * but represents INDIVIDUAL slapstick physics and grants NO team camaraderie aura.
 * Deliberately curated: appearing in a cartoon does not automatically prove toon physics.
 * Ratings are provisional gameplay design and named works, not official canonical stats.
 */
const TOON_FORCE_PROFILES=Object.freeze({
  "Bugs Bunny": [
    99,
    "Looney Tunes shorts: survives and reverses spectacular sight gags through cartoon timing.",
    "Gags are scenario-specific; no unrestricted cosmological powers."
  ],
  "Daffy Duck": [
    97,
    "Duck Amuck and other shorts: recovers from impossible theatrical erasures and distortions.",
    "The animator-controlled gags do not establish self-directed omnipotence."
  ],
  "Road Runner": [
    95,
    "Wile E. Coyote and Road Runner shorts: impossible momentum and near-effortless hazard avoidance.",
    "Exceptional velocity remains separately reflected in speed."
  ],
  "Wile E. Coyote": [
    97,
    "Road Runner shorts: survives catastrophic repeated rocket and cliff mishaps.",
    "Survival gags are not reliable resistance to serious combat damage."
  ],
  "Tasmanian Devil": [
    92,
    "Looney Tunes: whirlwind spins tear through settings and physical obstacles.",
    "Destructive spin is cartoon physicality, not literal meteorology."
  ],
  "Porky Pig": [
    70,
    "Looney Tunes: resets from physical gag consequences across episodic shorts.",
    "Often a straight character without sustained reality bending."
  ],
  "Speedy Gonzales": [
    87,
    "Looney Tunes: improbable speed and escape feats in chase comedy.",
    "Speed is already separately rated; this covers cartoon recovery."
  ],
  "Sylvester": [
    92,
    "Looney Tunes: endlessly recovers from failed pursuits and slapstick impact.",
    "Recurring gag recovery is not immortality."
  ],
  "Tweety": [
    85,
    "Looney Tunes: uses exaggerated timing and traps to evade pursuers.",
    "Comic wit does not establish conventional strength."
  ],
  "Foghorn Leghorn": [
    79,
    "Looney Tunes: large-scale barnyard slapstick and bombastic physical gags.",
    "Most antics remain localized."
  ],
  "Yosemite Sam": [
    86,
    "Looney Tunes: survives comically disastrous explosive pursuits.",
    "Gunplay and cartoon recovery are different skills."
  ],
  "Marvin the Martian": [
    83,
    "Looney Tunes: implausible alien-gadget comedy and explosions.",
    "Weapons and vehicles must be separately scored."
  ],
  "Pepé Le Pew": [
    76,
    "Looney Tunes: survives and reappears through exaggerated chase scenarios.",
    "Persistence is not charm-based mind control."
  ],
  "Elmer Fudd": [
    76,
    "Looney Tunes: bounces back from rabbit-hunting physical comedy.",
    "Gag durability does not imply superior tactics."
  ],
  "Mickey Mouse": [
    82,
    "Classic Disney cartoon shorts: prop gags and improbable physical reset moments.",
    "Sorcerer powers are not universal base-form abilities."
  ],
  "Minnie Mouse": [
    75,
    "Classic Disney shorts: slapstick props and exaggerated cartoon reactions.",
    "Limited evidence for large destructive feats."
  ],
  "Donald Duck": [
    91,
    "Classic Disney shorts: comically explosive tantrums and slapstick endurance.",
    "Anger does not automatically enhance actual strength."
  ],
  "Goofy": [
    96,
    "How-to shorts and classic cartoons: elaborate physical mishaps with persistent recovery.",
    "Clumsiness can reduce tactical accuracy."
  ],
  "Pluto": [
    78,
    "Classic Disney shorts: improbable chase and slapstick reactions.",
    "Canine agility still comes from normal attributes."
  ],
  "SpongeBob SquarePants": [
    98,
    "SpongeBob SquarePants: elastic body deformation, resets and impossible visual gags.",
    "Elasticity and recovery are highly context dependent."
  ],
  "Patrick Star": [
    91,
    "SpongeBob SquarePants: cartoon deformation and resilience after extreme mishaps.",
    "Poor judgment can undermine otherwise powerful gags."
  ],
  "Squidward": [
    89,
    "SpongeBob SquarePants: recurring injury-and-recovery slapstick.",
    "Enduring jokes does not mean effective combat strength."
  ],
  "Mr. Krabs": [
    80,
    "SpongeBob SquarePants: exaggerated money-driven physical reactions.",
    "Situational greed and props limit his powers."
  ],
  "Plankton": [
    81,
    "SpongeBob SquarePants: exaggerated tiny-scale schemes and comedic recovery.",
    "Extreme weakness at normal body scale remains relevant."
  ],
  "Homer Simpson": [
    88,
    "The Simpsons: recurring major physical gags and rapid episodic resets.",
    "Stunts do not establish superhuman fighting skill."
  ],
  "Bart Simpson": [
    81,
    "The Simpsons: practical jokes, wild skateboard stunts and classic slapstick.",
    "Child stature and limitations still apply."
  ],
  "Marge Simpson": [
    71,
    "The Simpsons: household and episodic cartoon slapstick.",
    "Ordinary temperament limits comedic power exploitation."
  ],
  "Fred Flintstone": [
    76,
    "The Flintstones: implausible prehistoric machinery and bodily slapstick.",
    "Stone Age props are not universal technology."
  ],
  "Barney Rubble": [
    74,
    "The Flintstones: exaggerated domestic and prehistoric workplace stunts.",
    "Mostly character comedy, not unlimited physical powers."
  ],
  "Scooby-Doo": [
    87,
    "Scooby-Doo: fear-fueled improbable chase sequences and visual-gag recovery.",
    "Fright frequently impairs judgment."
  ],
  "Shaggy": [
    85,
    "Scooby-Doo: elastic panic running, disguises and exaggerated pursuit gags.",
    "Memes and non-canonical transformations do not count."
  ],
  "Yogi Bear": [
    79,
    "Yogi Bear: ingenious picnic-basket traps and improbable comic escapes.",
    "Usually restricted to localized slapstick."
  ],
  "Popeye": [
    99,
    "Popeye shorts: spinach-powered impossible feats and repeated cartoon physics.",
    "Spinach is an activation condition, not a perpetual base-form boost."
  ],
  "Bluto": [
    84,
    "Popeye cartoons: survives powerful exaggerated slapstick encounters.",
    "Usually outmatched after Popeye's transformation."
  ],
  "Dexter": [
    79,
    "Dexter's Laboratory: bizarre lab mishaps and cartoon gadget recoil.",
    "Technology remains an equipment-dependent ability."
  ],
  "Johnny Bravo": [
    82,
    "Johnny Bravo: exaggerated impact recovery and improbable physical sight gags.",
    "Comic vanity undermines strategic execution."
  ],
  "Courage the Cowardly Dog": [
    92,
    "Courage the Cowardly Dog: survives surreal transformations and extreme danger.",
    "Acts are usually fear-driven and situational."
  ],
  "Snoopy": [
    86,
    "Peanuts cartoons: imagination-based fantasy segments and cartoon slapstick.",
    "Imagined Flying Ace scenes are not literal flight."
  ],
  "Charlie Brown": [
    73,
    "Peanuts: recurring physical gag failures and comic resets.",
    "Persistence does not grant exceptional combat power."
  ],
  "Garfield": [
    85,
    "Garfield: elastic body humor and exaggerated food-centered cartoon actions.",
    "Lifestyle gags do not produce unlimited damage."
  ],
  "Tom": [
    99,
    "Tom and Jerry: survives explosions, flattenings and extreme physical distortions.",
    "Durability is episodic slapstick, not unrestricted immortality."
  ],
  "Jerry": [
    98,
    "Tom and Jerry: survives and outmaneuvers giant threats using improbable props and recovery.",
    "Small size still limits ordinary leverage."
  ]
});
function toonForceOf(candidate){
  if(!candidate||candidate.pool!=='toons')return null;
  const record=TOON_FORCE_PROFILES[candidate.n];
  if(!record)return null;
  return {type:'toonforce',score:record[0],feat:record[1],limit:record[2],
    tier:record[0]>=90?'extraordinary':record[0]>=78?'established':'situational'};
}
function toonForceMultiplier(candidate,sportKey,pos){
  const tf=toonForceOf(candidate);
  if(!tf||!pos||pos.coach||pos.bench)return 1;
  // In regulated sports impossible hazards or contraband are moderated.
  const maxLift=sportKey==='brawl'?0.42:0.26;
  return +(1+maxLift*(tf.score/99)).toFixed(5);
}
if(typeof module!=='undefined'&&module.exports)module.exports={
  TOON_FORCE_PROFILES,toonForceOf,toonForceMultiplier
};

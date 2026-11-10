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

// Separately researched gameplay *facets* of ToonForce. These numbers are
// editorial interpretation of the named work and feat in each base profile,
// not claims of official canon ratings. The fifth column means demonstrated
// fourth-wall interaction, NOT the power to control the author or opponent.
// Six fields: comic control, gag recovery, body deformation, props/space,
// fourth-wall awareness, and translational sports applicability.
const TOON_FORCE_FACETS=Object.freeze({
  "Bugs Bunny": [
    98,
    96,
    91,
    99,
    92,
    99
  ],
  "Daffy Duck": [
    98,
    93,
    89,
    86,
    90,
    96
  ],
  "Road Runner": [
    90,
    89,
    51,
    83,
    21,
    87
  ],
  "Wile E. Coyote": [
    85,
    99,
    79,
    84,
    29,
    85
  ],
  "Tasmanian Devil": [
    86,
    91,
    85,
    67,
    12,
    77
  ],
  "Porky Pig": [
    67,
    77,
    53,
    59,
    24,
    58
  ],
  "Speedy Gonzales": [
    76,
    76,
    47,
    69,
    20,
    82
  ],
  "Sylvester": [
    81,
    94,
    75,
    65,
    28,
    76
  ],
  "Tweety": [
    76,
    84,
    60,
    84,
    26,
    82
  ],
  "Foghorn Leghorn": [
    72,
    78,
    67,
    66,
    18,
    72
  ],
  "Yosemite Sam": [
    77,
    90,
    63,
    75,
    19,
    66
  ],
  "Marvin the Martian": [
    78,
    81,
    43,
    89,
    28,
    68
  ],
  "Pepé Le Pew": [
    70,
    80,
    69,
    62,
    15,
    60
  ],
  "Elmer Fudd": [
    70,
    81,
    58,
    59,
    16,
    57
  ],
  "Mickey Mouse": [
    84,
    79,
    78,
    81,
    46,
    84
  ],
  "Minnie Mouse": [
    74,
    72,
    62,
    68,
    27,
    77
  ],
  "Donald Duck": [
    83,
    91,
    81,
    65,
    27,
    79
  ],
  "Goofy": [
    90,
    99,
    90,
    81,
    26,
    88
  ],
  "Pluto": [
    72,
    82,
    73,
    56,
    14,
    67
  ],
  "SpongeBob SquarePants": [
    92,
    98,
    99,
    91,
    77,
    83
  ],
  "Patrick Star": [
    83,
    94,
    91,
    80,
    38,
    69
  ],
  "Squidward": [
    80,
    94,
    83,
    64,
    26,
    58
  ],
  "Mr. Krabs": [
    71,
    83,
    67,
    67,
    14,
    62
  ],
  "Plankton": [
    77,
    84,
    83,
    85,
    30,
    67
  ],
  "Homer Simpson": [
    75,
    91,
    70,
    56,
    32,
    63
  ],
  "Bart Simpson": [
    78,
    83,
    64,
    68,
    37,
    79
  ],
  "Marge Simpson": [
    63,
    78,
    59,
    52,
    21,
    63
  ],
  "Fred Flintstone": [
    74,
    78,
    61,
    66,
    17,
    68
  ],
  "Barney Rubble": [
    69,
    77,
    57,
    60,
    16,
    68
  ],
  "Scooby-Doo": [
    81,
    85,
    72,
    73,
    22,
    80
  ],
  "Shaggy": [
    80,
    79,
    64,
    68,
    29,
    81
  ],
  "Yogi Bear": [
    72,
    76,
    55,
    70,
    23,
    63
  ],
  "Popeye": [
    90,
    98,
    86,
    87,
    64,
    94
  ],
  "Bluto": [
    76,
    86,
    60,
    59,
    15,
    69
  ],
  "Dexter": [
    66,
    78,
    59,
    92,
    29,
    65
  ],
  "Johnny Bravo": [
    73,
    92,
    72,
    62,
    21,
    64
  ],
  "Courage the Cowardly Dog": [
    88,
    94,
    86,
    85,
    39,
    82
  ],
  "Snoopy": [
    80,
    79,
    72,
    70,
    34,
    70
  ],
  "Charlie Brown": [
    64,
    72,
    54,
    49,
    17,
    64
  ],
  "Garfield": [
    73,
    81,
    67,
    62,
    28,
    65
  ],
  "Tom": [
    85,
    99,
    95,
    85,
    27,
    84
  ],
  "Jerry": [
    91,
    95,
    88,
    93,
    36,
    91
  ]
});
const TOON_FORCE_FACET_KEYS=Object.freeze(["comedy","resilience","body","environment","fourthWall","sports"]);
const TOON_FORCE_SPORT_EVENTS=Object.freeze({
  basketball:'bends the rebound and rim with cartoon timing',
  football:'turns a near-tackle into a cartoon escape',
  soccer:'stretches into an improbable interception',
  baseball:'redirects a wild bounce with a sight gag',
  hockey:'turns a collision into a sliding cartoon recovery',
  volleyball:'makes a near-impossible save with elastic timing'
});
const TOON_FORCE_BRAWL_EVENTS=Object.freeze({
  resilience:'bounces back from an explosive cartoon impact',
  body:'deforms around a hit, then snaps back unharmed',
  environment:'rearranges the arena with a well-timed visual gag',
  comedy:'reverses a bad matchup through comic timing',
  fourthWall:'escapes the scene boundary for a moment'
});

function toonForceOf(candidate){
  if(!candidate||candidate.pool!=='toons')return null;
  const record=TOON_FORCE_PROFILES[candidate.n];
  const facets=TOON_FORCE_FACETS[candidate.n];
  if(!record||!facets)return null;
  return {type:'toonforce',score:record[0],feat:record[1],limit:record[2],
    dimensions:Object.fromEntries(TOON_FORCE_FACET_KEYS.map((key,i)=>[key,facets[i]])),
    tier:record[0]>=90?'extraordinary':record[0]>=78?'established':'situational'};
}
// ToonForce has more individual value than MuppetForce. Its battle strength
// includes documented resilience, body-control and environment bending rather
// than merely boosting muscular strength. Conventional attributes are intact.
function toonForceMultiplier(candidate,sportKey,pos){
  const tf=toonForceOf(candidate);
  if(!tf||!pos||pos.coach||pos.bench)return 1;
  const d=tf.dimensions;
  if(sportKey==='brawl'){
    const combat=(0.25*d.resilience+0.24*d.environment+0.20*d.comedy+
      0.19*d.body+0.12*d.fourthWall)/99;
    return +(1+0.43*(tf.score/99)+0.22*combat).toFixed(5);
  }
  // Space Jam establishes *sports* uses, not an unlimited exemption from
  // every rule. Basketball receives the strongest sporting translation,
  // while other sports receive smaller analogous cartoon-physics benefits.
  const sportSkill=(0.62*d.sports+0.22*d.comedy+0.16*d.body)/99;
  const sportScale=sportKey==='basketball'?1:0.84;
  return +(1+(0.34*(tf.score/99)+0.20*sportSkill)*sportScale).toFixed(5);
}
function toonForceBattleEvent(team,sportKey,rng){
  if(!team||!Array.isArray(team.rows))return null;
  const heroes=team.rows.filter(r=>r.cand&&!r.pos.coach&&!r.pos.bench&&toonForceOf(r.cand));
  if(!heroes.length)return null;
  // A single spotlight gag per team per match. Multiple characters may
  // qualify, but never stack unbounded separate surprise events.
  heroes.sort((a,b)=>(b.w||0)-(a.w||0));
  const row=heroes[0],toon=toonForceOf(row.cand),d=toon.dimensions;
  const isBrawl=sportKey==='brawl';
  const facets=isBrawl?['resilience','body','environment','comedy','fourthWall']:['sports','comedy','body'];
  const pick=facets.reduce((a,b)=>d[b]>d[a]?b:a,facets[0]);
  const agency=(d.comedy+d.environment)/198;
  const chance=Math.min(isBrawl?0.56:0.30,(isBrawl?0.16:0.08)+(isBrawl?0.35:0.19)*(toon.score/99)*(0.6+0.4*agency));
  if(rng()>=chance)return null;
  const spread=Math.max(0.35,Math.min(1.0,(row.w||1)*5));
  const power=isBrawl
    ?Math.min(5,0.8+3.9*(d[pick]/99)*spread)
    :Math.min(2.2,0.4+1.6*(d.sports/99)*spread);
  const note=isBrawl?TOON_FORCE_BRAWL_EVENTS[pick]:TOON_FORCE_SPORT_EVENTS[sportKey]||'uses an unlikely cartoon-physics moment';
  return {character:row.cand.n,facet:pick,points:+power.toFixed(3),note,
    source:toon.feat,continuity:'Cartoon-physics gag; conditional, not guaranteed'};
}
if(typeof module!=='undefined'&&module.exports)module.exports={
  TOON_FORCE_PROFILES,TOON_FORCE_FACETS,TOON_FORCE_FACET_KEYS,toonForceOf,toonForceMultiplier,toonForceBattleEvent
};

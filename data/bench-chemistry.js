/* Bench Chemistry and the Sidekick tag.

   The bench slot (Bench Spark, or Reinforcement in Brawl) is a whole-team MULTIPLIER on top of the
   intangibles-based benchMult(). Whoever sits there lifts the rest of the roster through how they
   connect with it:

   1. Sidekick lock: a character tagged `sidekick` (notoriously a sidekick or a great supporter of a
      main character) thrives in the bench role. Putting one there is a guaranteed lift, whether or
      not their lead is on the roster (owner ruling, 2026-11-10).
   2. Lead reunion: a sidekick whose lead(s) are anywhere on the roster, coach included, adds more.
   3. Mesh: ANY bench player, sidekick or not, adds a little for each teammate they share a
      chemistry group with (same team, crew, faction, family, custom-pool label and so on).
   The total is capped at 8% (owner ruling, 2026-11-10).

   The sidekick tag is a ROLE tag, not a power, so it lives here rather than in the generated ability
   index in character-abilities.js. characterRoleTags() exposes it for challenge criteria.

   On top of the multiplier, the bench player gets real minutes every game: benchHeatRoll() gives them
   a chance to catch fire (driven by Clutch and bench fit) or go cold. Sidekicks rarely go cold. */

// pool -> name -> [leads they support (same pool), why they carry the tag]
const SIDEKICK_ROSTER = Object.freeze({
  nba: {
    'Scottie Pippen': [['Michael Jordan'], 'Jordan\'s running mate for all six Bulls titles.'],
    'Dennis Rodman': [['Michael Jordan', 'Scottie Pippen'], 'Rebounding and defensive enforcer for the second Bulls three-peat.'],
    'Kevin McHale': [['Larry Bird'], 'Bird\'s frontcourt partner and two-time Sixth Man of the Year.'],
    'Robert Parish': [['Larry Bird'], 'The steady center beside Bird on three Celtics title teams.'],
    'Dennis Johnson': [['Larry Bird'], 'Defensive guard Bird called the best teammate he ever had.'],
    'James Worthy': [['Magic Johnson', 'Kareem Abdul-Jabbar'], 'Showtime\'s finisher on the wing behind Magic and Kareem.'],
    'Tony Parker': [['Tim Duncan'], 'Duncan\'s point guard across four Spurs titles.'],
    'Manu Ginóbili': [['Tim Duncan'], 'Hall of Fame sixth man who chose to come off the bench for Duncan\'s Spurs.'],
    'Pau Gasol': [['Kobe Bryant'], 'Kobe\'s co-star on the 2009 and 2010 Lakers title teams.'],
    'Chris Bosh': [['LeBron James', 'Dwyane Wade'], 'Accepted the third-option role on the Heatles\' two title teams.'],
    'Kyrie Irving': [['LeBron James'], 'LeBron\'s co-star on the 2016 Cavaliers.'],
    'Kevin Love': [['LeBron James'], 'Third option beside LeBron on the 2016 Cavaliers.'],
    'Anthony Davis': [['LeBron James'], 'LeBron\'s partner on the 2020 Lakers.'],
    'Klay Thompson': [['Stephen Curry'], 'The other Splash Brother.'],
    'Draymond Green': [['Stephen Curry'], 'Warriors\' defensive anchor and playmaking glue around Curry.'],
    'Andre Iguodala': [['Stephen Curry'], 'Came off the bench and won 2015 Finals MVP for Curry\'s Warriors.'],
    'Robert Horry': [['Shaquille O\'Neal', 'Kobe Bryant', 'Tim Duncan', 'Hakeem Olajuwon'], 'Seven-ring role player famous for clutch shots beside stars.'],
    'John Stockton': [['Karl Malone'], 'Fed Malone through the NBA\'s most famous pick-and-roll partnership.'],
    'Rajon Rondo': [['Paul Pierce', 'Kevin Garnett', 'Ray Allen'], 'Young point guard who set up the 2008 Celtics\' Big Three.'],
    'John Havlicek': [['Bill Russell'], 'Started as Russell\'s sixth man before becoming a star.'],
    'Sam Jones': [['Bill Russell'], 'Ten-ring shooter beside Russell.'],
    'Bill Laimbeer': [['Isiah Thomas'], 'Isiah\'s enforcer on the Bad Boys Pistons.'],
    'Penny Hardaway': [['Shaquille O\'Neal'], 'Shaq\'s backcourt partner on the 1995 Magic.'],
  },
  mcu: {
    'Falcon': [['Captain America'], 'Steve Rogers\' wingman and eventual successor.'],
    'Winter Soldier': [['Captain America'], 'Steve\'s oldest friend and loyal partner.'],
    'War Machine': [['Iron Man'], 'Rhodey, Tony Stark\'s best friend and armored backup.'],
    'Happy Hogan': [['Iron Man', 'Spider-Man'], 'Tony\'s driver, bodyguard and later Peter Parker\'s handler.'],
    'Pepper Potts': [['Iron Man'], 'Tony\'s right hand who suits up as Rescue.'],
    'Ned Leeds': [['Spider-Man'], 'Peter Parker\'s self-declared "guy in the chair".'],
    'Aunt May': [['Spider-Man'], 'Peter\'s steadfast supporter.'],
    'Wong': [['Doctor Strange'], 'Strange\'s ally and keeper of Kamar-Taj.'],
    'Okoye': [['Black Panther'], 'General of the Dora Milaje sworn to protect T\'Challa.'],
    'Shuri': [['Black Panther'], 'T\'Challa\'s sister and the genius behind his suit.'],
    'Korg': [['Thor'], 'Thor\'s gentle Kronan companion from Sakaar onward.'],
    'Miek': [['Korg'], 'Korg\'s knife-handed sidekick.'],
    'Valkyrie': [['Thor'], 'Fought beside Thor from Sakaar to Ragnarok.'],
    'Phil Coulson': [['Nick Fury'], 'Fury\'s most trusted S.H.I.E.L.D. agent.'],
    'Maria Hill': [['Nick Fury'], 'Fury\'s second-in-command.'],
    'Katy': [['Shang-Chi'], 'Shang-Chi\'s best friend who followed him into the fight.'],
    'Kate Bishop': [['Hawkeye'], 'Clint Barton\'s protégé in Hawkeye.'],
    'The Wasp': [['Ant-Man'], 'Hope van Dyne, Scott Lang\'s partner in the field.'],
    'Groot': [['Rocket'], 'Rocket\'s inseparable partner.'],
    'H.E.R.B.I.E.': [['Mister Fantastic'], 'Reed Richards\' robot helper.'],
  },
  toons: {
    'Goofy': [['Mickey Mouse'], 'Mickey\'s loyal pal.'],
    'Pluto': [['Mickey Mouse'], 'Mickey\'s dog.'],
    'Porky Pig': [['Daffy Duck'], 'Daffy\'s eager young space cadet in Duck Dodgers.'],
    'Donkey': [['Shrek'], 'Shrek\'s talkative best friend.'],
    'Puss in Boots': [['Shrek', 'Donkey'], 'Joined Shrek and Donkey on their quests.'],
    'Patrick Star': [['SpongeBob SquarePants'], 'SpongeBob\'s best friend.'],
    'Barney Rubble': [['Fred Flintstone'], 'Fred\'s best friend and neighbor.'],
    'Shaggy': [['Scooby-Doo'], 'Scooby\'s inseparable partner.'],
    'Scooby-Doo': [['Shaggy'], 'Shaggy\'s inseparable partner.'],
    'Sokka': [['Aang', 'Katara'], 'Team Avatar\'s planner who backed Aang throughout.'],
    'Toph Beifong': [['Aang'], 'Aang\'s earthbending teacher and ally.'],
    'Uncle Iroh': [['Zuko'], 'Zuko\'s devoted uncle and guide.'],
    'Morty': [['Rick Sanchez'], 'Rick\'s grandson and adventure partner.'],
    'Frozone': [['Mr. Incredible'], 'Bob Parr\'s best friend and partner in crime-fighting.'],
    'Mike Wazowski': [['Sulley'], 'Sulley\'s best friend and scare assistant.'],
  },
  muppets: {
    'Fozzie Bear': [['Kermit the Frog'], 'Kermit\'s best friend and comedy sidekick.'],
    'Scooter': [['Kermit the Frog'], 'Kermit\'s stage manager on The Muppet Show.'],
    'Robin the Frog': [['Kermit the Frog'], 'Kermit\'s nephew and tagalong.'],
    'Rizzo the Rat': [['Gonzo'], 'Gonzo\'s partner and co-narrator in The Muppet Christmas Carol.'],
    'Beaker': [['Dr. Bunsen Honeydew'], 'Bunsen\'s long-suffering lab assistant.'],
    'Sal Minella': [['Johnny Fiama'], 'Johnny\'s monkey sidekick.'],
    'Mr. Snuffleupagus': [['Big Bird'], 'Big Bird\'s best friend.'],
    'Wembley Fraggle': [['Gobo Fraggle'], 'Gobo\'s best friend and roommate.'],
    'Sprocket': [['Doc'], 'Doc\'s dog in Fraggle Rock.'],
  },
  games: {
    'Luigi': [['Mario'], 'Mario\'s brother and Player 2.'],
    'Yoshi': [['Mario'], 'Mario\'s dinosaur companion.'],
    'Toad': [['Princess Peach', 'Mario'], 'Peach\'s attendant who helps Mario.'],
    'Diddy Kong': [['Donkey Kong'], 'Donkey Kong\'s nephew and partner.'],
    'Tails': [['Sonic the Hedgehog'], 'Sonic\'s best friend and sidekick.'],
    'Falco Lombardi': [['Fox McCloud'], 'Fox\'s ace wingman on Star Fox.'],
    'Clank': [['Ratchet'], 'Ratchet\'s robot partner.'],
    'Sully': [['Nathan Drake'], 'Nate\'s mentor and partner.'],
    'Cortana': [['Master Chief'], 'Master Chief\'s AI partner.'],
    'Arbiter': [['Master Chief'], 'Fought beside Master Chief from Halo 3 on.'],
    'Atreus': [['Kratos'], 'Kratos\' son and archer companion.'],
    'Garrus Vakarian': [['Commander Shepard'], 'Shepard\'s most loyal squadmate.'],
    'Mordin Solus': [['Commander Shepard'], 'Shepard\'s scientist squadmate.'],
    'Alyx Vance': [['Gordon Freeman'], 'Gordon\'s partner through Half-Life 2.'],
    'Tifa Lockhart': [['Cloud Strife'], 'Cloud\'s childhood friend and AVALANCHE teammate.'],
    'Pikachu': [['Ash Ketchum'], 'Ash\'s partner Pokémon.'],
  },
  pokemon: {
    'Pikachu': [[], 'The anime\'s partner Pokémon.'],
  },
  starwars: {
    'Chewbacca': [['Han Solo'], 'Han\'s co-pilot and first mate.'],
    'R2-D2': [['Luke Skywalker', 'Anakin Skywalker'], 'Astromech who saved Anakin and Luke over and over.'],
    'C-3PO': [['Luke Skywalker', 'Anakin Skywalker'], 'Protocol droid built by Anakin who served Luke.'],
    'BB-8': [['Poe Dameron'], 'Poe\'s astromech.'],
    'Ahsoka Tano': [['Anakin Skywalker'], 'Anakin\'s Padawan in The Clone Wars.'],
    'Captain Rex': [['Anakin Skywalker', 'Ahsoka Tano'], 'Anakin and Ahsoka\'s clone captain.'],
    'Commander Cody': [['Obi-Wan Kenobi'], 'Obi-Wan\'s clone commander.'],
    'Wedge Antilles': [['Luke Skywalker'], 'Luke\'s wingman.'],
    'Nien Nunb': [['Lando Calrissian'], 'Lando\'s co-pilot on the Falcon at Endor.'],
    'Grogu': [['The Mandalorian'], 'Din Djarin\'s foundling.'],
    'K-2SO': [['Cassian Andor'], 'Cassian\'s reprogrammed droid partner.'],
    'Baze Malbus': [['Chirrut Îmwe'], 'Chirrut\'s devoted protector.'],
    'Chopper': [['Hera Syndulla'], 'Hera\'s droid on the Ghost.'],
    'Jar Jar Binks': [['Qui-Gon Jinn'], 'Followed Qui-Gon out of his debt.'],
    'Fennec Shand': [['Boba Fett'], 'Boba Fett\'s right hand.'],
    'Omega': [['Hunter'], 'Hunter\'s young charge in The Bad Batch.'],
  },
  dc: {
    'Robin (Damian Wayne)': [['Batman'], 'Batman\'s son and current Robin.'],
    'Red Robin (Tim Drake)': [['Batman', 'Nightwing'], 'The third Robin.'],
    'Nightwing': [['Batman'], 'Dick Grayson, the first Robin.'],
    'Batgirl (Barbara Gordon)': [['Batman', 'Commissioner James Gordon'], 'Bat-Family ally and later Oracle.'],
    'Alfred Pennyworth': [['Batman'], 'Bruce Wayne\'s butler, medic and confidant.'],
    'Lucius Fox': [['Batman'], 'Wayne Enterprises\' gadget man.'],
    'Commissioner James Gordon': [['Batman'], 'Batman\'s ally inside the GCPD.'],
    'The Flash (Wally West)': [['The Flash (Barry Allen)'], 'Barry\'s protégé, the original Kid Flash.'],
    'Krypto': [['Superman', 'Superboy (Conner Kent)', 'Supergirl (Kara Zor-El)'], 'The Super-Dog.'],
    'Superboy (Conner Kent)': [['Superman'], 'Superman\'s clone protégé.'],
    'Harley Quinn': [['Joker'], 'The Joker\'s infamous partner in crime.'],
  },
  lotr: {
    'Samwise Gamgee': [['Frodo Baggins'], 'Frodo\'s gardener and steadfast companion to Mount Doom.'],
    'Meriadoc Brandybuck': [['Frodo Baggins', 'Théoden', 'Peregrin Took'], 'Frodo\'s cousin and Théoden\'s esquire.'],
    'Peregrin Took': [['Frodo Baggins', 'Gandalf', 'Meriadoc Brandybuck'], 'Frodo\'s cousin, who rode with Gandalf to Minas Tirith.'],
    'Gimli': [['Aragorn', 'Legolas'], 'Fellowship member who followed Aragorn to the end.'],
    'Legolas': [['Aragorn', 'Gimli'], 'Fellowship member who followed Aragorn to the end.'],
    'Huan the Hound': [['Lúthien Tinúviel', 'Beren Erchamion'], 'The Valinórean hound who aided Lúthien and Beren.'],
    'Beleg Cúthalion': [['Túrin Turambar'], 'Túrin\'s truest friend.'],
    'Balin': [['Thorin Oakenshield'], 'Thorin\'s loyal elder companion.'],
    'Dwalin': [['Thorin Oakenshield'], 'Thorin\'s loyal companion.'],
    'Gríma Wormtongue': [['Saruman'], 'Saruman\'s servant at Théoden\'s court.'],
    'Mouth of Sauron': [['Sauron'], 'Sauron\'s lieutenant and messenger at the Black Gate.'],
    'Gwaihir': [['Gandalf'], 'The Windlord who rescued Gandalf.'],
  },
  harrypotter: {
    'Ron Weasley': [['Harry Potter', 'Hermione Granger'], 'Harry\'s best friend.'],
    'Hermione Granger': [['Harry Potter', 'Ron Weasley'], 'Harry\'s best friend.'],
    'Rubeus Hagrid': [['Harry Potter', 'Albus Dumbledore'], 'Harry\'s protector and Dumbledore\'s loyal man.'],
    'Dobby': [['Harry Potter'], 'The house-elf devoted to Harry.'],
    'Hedwig': [['Harry Potter'], 'Harry\'s owl.'],
    'Fawkes': [['Albus Dumbledore'], 'Dumbledore\'s phoenix.'],
    'Crookshanks': [['Hermione Granger'], 'Hermione\'s cat.'],
    'Jacob Kowalski': [['Newt Scamander'], 'Newt\'s No-Maj friend.'],
    'Bowtruckle (Pickett)': [['Newt Scamander'], 'Rides in Newt\'s pocket.'],
    'Niffler': [['Newt Scamander'], 'Newt\'s troublesome creature companion.'],
    'Vincent Crabbe': [['Draco Malfoy', 'Gregory Goyle'], 'Draco\'s henchman.'],
    'Gregory Goyle': [['Draco Malfoy', 'Vincent Crabbe'], 'Draco\'s henchman.'],
    'Peter Pettigrew': [['Lord Voldemort'], 'Wormtail, who served Voldemort.'],
    'Bellatrix Lestrange': [['Lord Voldemort'], 'Voldemort\'s most devoted lieutenant.'],
    'Nagini': [['Lord Voldemort'], 'Voldemort\'s snake.'],
    'Kreacher': [['Regulus Black'], 'The Black family house-elf devoted to Regulus.'],
  },
});

const BENCH_CHEM = Object.freeze({
  sidekickLock: 3,     // % team lift for any sidekick holding the bench slot
  leadEach: 2,         // % per lead of theirs on the roster
  leadMax: 2,          // leads that count
  meshEach: 0.75,      // % per other teammate who shares a chemistry group with the bench player
  meshMax: 4,          // teammates that count
  cap: 8,              // matches the MuppetForce ensemble ceiling (owner ruling: keep 8%)
});
// Every game the bench player sees minutes. Heat is in rating points for that one game.
const BENCH_HEAT = Object.freeze({
  hotBase: 0.12, hotClutch: 0.13, playoffHot: 0.05,  // chance to catch fire
  hotPts: 1.0, hotFitPts: 2.0,                         // size of the heater
  cold: 0.06, sidekickCold: 0.02, coldPts: 1.2,        // chance and size of a cold night
});

function sidekickOf(c) {
  if (!c || !c.pool || !c.n) return null;
  const r = SIDEKICK_ROSTER[c.pool] && SIDEKICK_ROSTER[c.pool][c.n];
  return r ? { leads: r[0].slice(), note: r[1] } : null;
}
function isSidekick(c) { return !!sidekickOf(c); }
/* Role tags (not powers) for challenge criteria, e.g. ['sidekick']. */
function characterRoleTags(c) { return isSidekick(c) ? ['sidekick'] : []; }

/* roster: { posId: candidate }, positions: SPORTS[sport].pos.
   Returns { percent, points, bench, sidekick, lock, leads:[names], mesh:[names] }. */
function benchChemistry(roster, positions, baseRating) {
  const none = { percent: 0, points: 0, bench: null, sidekick: false, lock: 0, leads: [], mesh: [] };
  if (!roster || !Array.isArray(positions)) return none;
  const slot = positions.find(p => p.bench && roster[p.id]);
  if (!slot) return none;
  const b = roster[slot.id];
  const mates = positions.filter(p => p !== slot && roster[p.id]).map(p => roster[p.id]).filter(c => c !== b);
  const sk = sidekickOf(b);
  const leads = sk ? mates.filter(c => c.pool === b.pool && sk.leads.includes(c.n)).map(c => c.n) : [];
  const groups = new Set(b.g || []);
  const mesh = groups.size ? mates.filter(c => !leads.includes(c.n) && (c.g || []).some(g => groups.has(g))).map(c => c.n) : [];
  const lock = sk ? BENCH_CHEM.sidekickLock : 0;
  const raw = lock + BENCH_CHEM.leadEach * Math.min(BENCH_CHEM.leadMax, leads.length)
    + BENCH_CHEM.meshEach * Math.min(BENCH_CHEM.meshMax, mesh.length);
  const percent = +Math.min(BENCH_CHEM.cap, raw).toFixed(3);
  const points = Number.isFinite(baseRating) && baseRating > 0 ? +(baseRating * percent / 100).toFixed(4) : 0;
  return { percent, points, bench: b.n, sidekick: !!sk, lock, leads, mesh };
}

/* One game's bench minutes. clutch = the bench player's Clutch (0-99), fit = bench fit (0-99).
   Returns { pts, kind:'boom'|'bust'|null }. Uses exactly one rng() draw. */
function benchHeatRoll(clutch, fit, sidekick, playoff, rng) {
  const H = BENCH_HEAT, u = rng();
  const hot = H.hotBase + H.hotClutch * (clutch / 99) + (playoff ? H.playoffHot : 0);
  if (u < hot) return { pts: +(H.hotPts + H.hotFitPts * (fit / 99)).toFixed(3), kind: 'boom' };
  if (u > 1 - (sidekick ? H.sidekickCold : H.cold)) return { pts: -H.coldPts, kind: 'bust' };
  return { pts: 0, kind: null };
}

if (typeof module !== 'undefined' && module.exports) module.exports = {
  SIDEKICK_ROSTER, BENCH_CHEM, BENCH_HEAT, sidekickOf, isSidekick, characterRoleTags, benchChemistry, benchHeatRoll,
};

/* Alternate-form ability layer for all Draft Anything modes.
 * These are curated, continuity-scoped GAME mechanics, not canonical numerical
 * feats. Unreviewed forms keep their stat changes but receive NO guessed power.
 * A documented form can add its own signature, power domains, defenses and
 * matchup weaknesses. The same pure evaluator runs in all match formats.
 */
(function(root){
  const CATALOG=[
    // base pool/id, form, signature, domains, resists, vulnerability domains, tier, signature kind, limitation
    ['mcu:Thor','Rune King Thor','Unweave the Ragnarok Cycle','reality,magic','magic,reality','',5,'chaos','Runic ascension is a story-specific state, not baseline Thor.'],
    ['mcu:Thor','King Thor','All-Father Thunder','cosmic,elemental','elemental','',4,'lift','King Thor belongs to a future comics continuity.'],
    ['mcu:Thor','Herald of Thunder Thor','Power Cosmic Storm','cosmic,elemental','elemental,cosmic','',4,'chaos','Galactus\'s herald empowerment is temporary.'],
    ['mcu:Thor','Necrosword Thor','All-Black Tempest','shadow,cosmic','shadow','magic',4,'chaos','Necrosword empowerment carries corruption and dependence on the blade.'],
    ['mcu:Jean Grey','White Phoenix of the Crown','White Hot Room Judgment','reality,psychic,cosmic','reality,psychic','',5,'chaos','Requires the Phoenix Force; not Jean\'s ordinary state.'],
    ['mcu:Jean Grey','Dark Phoenix','Phoenix Unbound','cosmic,psychic,elemental','psychic','',4,'chaos','Instability and loss of control can undermine the wielder.'],
    ['mcu:Jean Grey','Phoenix Force Jean Grey','Phoenix Rebirth','cosmic,psychic','psychic','',4,'clutch','Power depends on the Phoenix Force being present.'],
    ['mcu:Scarlet Witch','House of M Scarlet Witch','No More Mutants','reality,magic','magic,reality','',5,'chaos','Reality alteration is context-specific, not an unconditional instant victory.'],
    ['mcu:Scarlet Witch','Darkhold Scarlet Witch','Darkhold Hex','magic,psychic','magic','magic',4,'chaos','Darkhold corruption compromises judgment.'],
    ['mcu:Scarlet Witch','Scarlet Witch of Wundagore','Wundagore Chaos Hex','magic,reality','magic','',4,'chaos','The Darkhold and Wundagore are tied to the depicted feats.'],
    ['mcu:Doctor Doom','God Emperor Doom','Battleworld Decree','reality,cosmic,magic','reality,magic','',5,'chaos','Stolen Beyonder power is temporary and can be severed.'],
    ['mcu:Doctor Doom','Beyonder-Powered Doom','Beyonder Power Siphon','reality,cosmic','cosmic,reality','',5,'chaos','Power is siphoned, not Doom\'s standard arsenal.'],
    ['mcu:Doctor Doom','Sorcerer Supreme Doctor Doom','Supreme Sorcery','magic,control','magic,psychic','',4,'chaos','The Sorcerer Supreme title belongs to a specific storyline.'],
    ['mcu:Doctor Doom','Infamous Iron Man (Victor von Doom)','Infamous Armor Systems','tech,control','tech','magic',3,'lift','Uses an alternate technological role rather than godlike power.'],
    ['mcu:Doctor Strange','Strange Supreme','Mystic Absorption','magic,cosmic','magic,psychic','',5,'chaos','Absorption comes from the What If...? continuity and has severe costs.'],
    ['mcu:Doctor Strange','God of Magic Strange','Mystic Ascendancy','magic,cosmic','magic','',5,'chaos','Ascension is not a permanently available baseline state.'],
    ['mcu:Doctor Strange','Black Priest Doctor Strange','Black Priest Word','magic,control','magic','',4,'chaos','Black Priest affiliation grants specialized magic.'],
    ['mcu:Spider-Man','Cosmic Spider-Man (Captain Universe)','Enigma Force Burst','cosmic,elemental','cosmic','',4,'unbreakable','The Enigma Force is an external empowerment.'],
    ['mcu:Spider-Man','Symbiote Spider-Man','Living Suit Strike','shadow,melee','melee','sonic,elemental',3,'clutch','The symbiote is vulnerable to sonic attacks and intense heat.'],
    ['mcu:Hulk','World Breaker Hulk','World Breaker Shockwave','melee,elemental','melee','psychic',4,'chaos','Rage can overwhelm tactics and restraint.'],
    ['mcu:Hulk','Immortal Hulk','Green Door Return','regeneration,melee','melee,regeneration','magic',4,'unbreakable','Resurrection depends on the Green Door continuity.'],
    ['mcu:Hulk','Titan Hulk','Titan Rampage','melee,elemental','melee','psychic',4,'chaos','Extreme destructive rage limits composure.'],
    ['mcu:Hulk','Maestro Hulk','Maestro Dominion','melee,control','melee','',3,'chaos','Dystopian future version, not standard Hulk.'],
    ['mcu:Loki','God of Stories Loki','Narrative Rewrite','reality,magic','magic,reality','',5,'chaos','Metanarrative agency has contextual limits.'],
    ['mcu:Loki','God of Stories Loki (TVA)','Branches Held Together','time,cosmic','time','',5,'lift','TVA continuity and the time-branch role are distinctive.'],
    ['mcu:Thanos','Infinity Gauntlet Thanos','Infinity Stone Command','reality,time,cosmic','cosmic,time','',5,'chaos','Requires possession and functional use of all Stones.'],
    ['mcu:Thanos','Heart of the Universe Thanos','Heart of the Universe','reality,cosmic','reality,cosmic','',5,'chaos','Temporary cosmic ascension.'],
    ['mcu:Ultron','Infinity Ultron','Infinity Stone Barrage','reality,cosmic,tech','tech,cosmic','',5,'chaos','What If...? Ultron requires the Infinity Stones.'],
    ['mcu:Silver Surfer','Silver Surfer Black','Black Cosmic Alchemy','cosmic,shadow','cosmic','',4,'unbreakable','Dark cosmic struggle is specific to Silver Surfer: Black.'],
    ['mcu:Sentry','The Void (Sentry)','The Void Unleashed','shadow,psychic,melee','melee','psychic',4,'chaos','Void manifestation is unstable and not a controlled ally.'],
    ['mcu:Sentry','Death Seed Sentry','Death Seed Revival','regeneration,cosmic','regeneration','magic',4,'unbreakable','Death Seed is an external resurrection power.'],
    ['mcu:Wolverine','Phoenix Wolverine','Phoenix Claws','cosmic,melee','cosmic,regeneration','',4,'clutch','Far-future Phoenix host, not standard Wolverine.'],
    ['mcu:Wolverine','Hellverine (Logan)','Hellfire Claws','magic,elemental,melee','elemental','magic',3,'chaos','Hellfire depends on supernatural possession.'],
    ['mcu:Black Panther','Black Panther with Infinity Gauntlet','Wakandan Infinity Gambit','reality,cosmic','cosmic','',5,'chaos','Gauntlet use depends on access to the Stones.'],
    ['mcu:Black Panther','King of the Dead Black Panther','Ancestral Command','magic,shadow','magic','',3,'lift','King of the Dead powers depend on the relevant comic continuity.'],
    ['mcu:Captain Marvel','Binary (Carol Danvers)','Binary Energy Storm','cosmic,elemental','elemental,cosmic','',4,'unbreakable','Binary is a specific amplified energy state.'],
    ['mcu:Namor','Phoenix Five Namor','Phoenix Tide','cosmic,elemental','elemental','psychic',4,'chaos','Dependent on a Phoenix Force shard.'],
    ['mcu:Adam Warlock','Magus (Corrupted Warlock)','Magus Dominion','magic,psychic','psychic','',4,'chaos','Corrupted future-self continuity.'],
    ['dc:Batman','The Darkest Knight','Dark Multiverse Rewrite','reality,time,cosmic','reality,time','',5,'chaos','Manhattan-class power is temporary and from a dark-multiverse identity.'],
    ['dc:Batman','Red Death Batman','Red Death Speed Blitz','speed,time','speed','magic',4,'chaos','Dark Multiverse speed-possessed form, not ordinary Bruce.'],
    ['dc:Batman','Dawnbreaker Batman','Dawnbreaker Blackout','cosmic,elemental','cosmic','',3,'chaos','Relies on a corrupted Green Lantern ring.'],
    ['dc:Batman','Hellbat Armor Batman','Hellbat Counteroffensive','tech,melee','tech,melee','magic',3,'unbreakable','Hellbat armor drains the wearer.'],
    ['dc:Superman','Superman Prime One Million','Solar Apex','cosmic,melee','cosmic,melee','magic',5,'unbreakable','Future solar empowerment; no automatic immunity to sorcery.'],
    ['dc:Superman','Superman Blue','Electric Superman','elemental,energy','elemental','magic',3,'chaos','Energy-form continuity is distinct from standard Kryptonian physiology.'],
    ['dc:Superman','Superman Red','Red Energy Surge','elemental,energy','elemental','magic',3,'lift','Split energy form is story-specific.'],
    ['dc:The Flash (Wally West)','Doctor Manhattan-Powered Wally','Temporal Rewrite','time,reality,speed','time,reality','',5,'chaos','Manhattan-class alteration is not baseline Wally.'],
    ['dc:The Flash (Wally West)','Mobius Chair Wally West','Mobius Insight','time,control','time','',4,'lift','The Mobius Chair is an external device.'],
    ['dc:Green Lantern (Hal Jordan)','The Spectre (Hal Jordan)','Spectral Judgment','magic,cosmic','magic','',5,'chaos','Spectre powers depend on host and divine mission.'],
    ['dc:Green Lantern (Hal Jordan)','Parallax Hal Jordan','Parallax Fearstorm','psychic,cosmic','psychic','',4,'chaos','Fear-entity possession changes control.'],
    ['dc:Green Lantern (Hal Jordan)','White Lantern Hal Jordan','White Light of Life','cosmic,regeneration','cosmic,regeneration','',4,'lift','Lantern ring and light spectrum are the enabling tools.'],
    ['dc:Wonder Woman','Witching Hour Wonder Woman','Witching Hour Hex','magic,reality','magic','',5,'chaos','Magic from the Witching Hour is temporary.'],
    ['dc:Raven','The Unkindness','Unkindness Unbound','reality,shadow,magic','shadow,magic','',5,'chaos','A future extreme-Raven continuity.'],
    ['dc:Joker','Emperor Joker','Emperor Joker Reality Prank','reality,psychic','reality','',5,'chaos','Power derives from stolen fifth-dimensional reality-warping.'],
    ['dc:Darkseid','Infinite Frontier Darkseid','Omega Dominion','cosmic,reality','cosmic','',5,'chaos','Reassembled form is continuity-specific.'],
    ['dc:Sinestro','White Lantern Sinestro','White Spectrum','cosmic,regeneration','cosmic','',4,'lift','White Lantern power is not permanent for Sinestro.'],
    ['dc:Swamp Thing','Parliament of Trees Swamp Thing','Green Dominion','regeneration,elemental','regeneration,elemental','',4,'unbreakable','Reach depends on connection to the Green.'],
    ['games:Sonic the Hedgehog','Super Sonic','Chaos Emerald Ascension','speed,cosmic','speed','',4,'unbreakable','Super form requires Chaos Emeralds and a finite power source.'],
    ['games:Sonic the Hedgehog','Hyper Sonic','Hyper Sonic Flash','speed,cosmic','speed,cosmic','',5,'chaos','Hyper form depends on Super Emeralds.'],
    ['games:Shadow the Hedgehog','Super Shadow','Chaos Control Superform','speed,time,cosmic','speed','',4,'clutch','Super state requires the Chaos Emeralds.'],
    ['games:Bowser','Dreamy Bowser','Dream Power Reality Strike','reality,magic','magic','',4,'chaos','Dream Stone is the enabling power source.'],
    ['games:Ganondorf','Demon King Ganondorf','Secret Stone Gloom','magic,shadow','magic','elemental',4,'chaos','Secret Stone empowers this particular Ganondorf.'],
    ['games:Link','Fierce Deity Link','Fierce Deity Blade','magic,melee','melee','',4,'unbreakable','Fierce Deity Mask transformation depends on the mask.'],
    ['games:Samus Aran','Metroid Suit Samus','Metroid Energy Drain','regeneration,tech','tech,regeneration','elemental',4,'unbreakable','Metroid Suit is a specific, unstable late-game condition.'],
    ['games:Kirby','Hypernova Kirby','Hypernova Inhale','magic,cosmic','melee','',4,'chaos','Hypernova requires a Miracle Fruit.'],
    ['games:Sephiroth','Safer Sephiroth','Supernova','cosmic,magic','magic','',4,'chaos','Final-boss form, not ordinary Sephiroth.'],
    ['games:Liu Kang','Fire God Liu Kang','Fire God Temporal Command','time,elemental','elemental,time','',5,'lift','Fire God status is continuity-specific.'],
    ['games:Arthas Menethil','The Lich King','Scourge Dominion','shadow,magic','shadow','elemental',4,'chaos','Crown and Frostmourne powers are tied to the Lich King.'],
    ['pokemon:Mewtwo','Mega Mewtwo Y','Mega Psychic Pressure','psychic,cosmic','psychic','',3,'chaos','Mega Evolution requires the appropriate Mega Stone.'],
    ['pokemon:Mewtwo','Mega Mewtwo X','Mega Psychic Combat','psychic,melee','psychic','',3,'unbreakable','Mega Evolution requires the appropriate Mega Stone.'],
    ['pokemon:Gengar','Mega Gengar','Shadow Trap','shadow,magic','shadow','psychic',3,'chaos','Mega Evolution is a temporary transformation.'],
    ['pokemon:Charizard','Mega Charizard X','Dragon Flame','elemental,melee','elemental','',3,'unbreakable','Mega Evolution is a temporary transformation.'],
    ['pokemon:Charizard','Mega Charizard Y','Solar Inferno','elemental,energy','elemental','',3,'chaos','Mega Evolution is a temporary transformation.'],
    ['starwars:Luke Skywalker','Grand Master Luke Skywalker','Grand Master Force Command','psychic,control','psychic','',4,'lift','Grand Master era belongs to Legends continuity.'],
    ['starwars:Emperor Palpatine','Sith Eternal Palpatine','Sith Eternal Lightning','elemental,psychic','psychic','',4,'chaos','The revived body and Sith ritual are vulnerable.'],
    ['starwars:Rey','Rey with Dyad Empowerment','Force Dyad Resonance','psychic,regeneration','psychic','',3,'clutch','The dyad depends on its relationship and story conditions.'],
    ['lotr:Gandalf','Gandalf the White','White Wizard Return','magic,elemental','magic','',4,'lift','Returned emissary remains limited by his mission.'],
    ['lotr:Gandalf','Olórin (Uncloaked Maia)','Unveiled Maia','cosmic,magic','magic','',5,'chaos','Uncloaked Maia should not be equated with Gandalf\'s embodied Istari restrictions.'],
    ['lotr:Sauron','Sauron with the One Ring','Dominion of the One','magic,psychic','magic','',4,'chaos','Relies on keeping the One Ring.'],
    ['lotr:Morgoth (Melkor)','Melkor Unbound','First Dark Power','cosmic,shadow','cosmic','',5,'chaos','Unbound primordial power differs from his diminished later form.'],
    ['harrypotter:Albus Dumbledore','Dumbledore with Elder Wand','Elder Wand Precision','magic,control','magic','',3,'lift','Mastery of the wand matters; it cannot guarantee victory.'],
    ['harrypotter:Lord Voldemort','Voldemort with Elder Wand','Elder Wand Curse','magic,shadow','magic','magic',3,'chaos','The wand does not answer to Voldemort merely through possession.'],
    ['harrypotter:Credence Barebone','Obscurial Credence','Obscurus Burst','magic,shadow','magic','',3,'chaos','Obscurial state is destructive and difficult to control.'],
    ['toons:Popeye','Spinach-Powered Popeye','Spinach Punch','melee,toon','melee','',4,'unbreakable','Temporary spinach-fueled transformation.'],
    ['toons:Aang','Avatar State Aang','Avatar State Elements','elemental,magic','elemental','psychic',4,'lift','Avatar State can be dangerous if interrupted.'],
    ['toons:Mickey Mouse','Sorcerer\'s Apprentice Mickey','Enchanted Brooms','magic,toon','magic','',3,'chaos','Poor spell control can backfire.'],
    ['toons:Elsa','Fifth Spirit Elsa','Fifth Spirit Elements','elemental,magic','elemental','',4,'lift','Spiritual role and physical combat are not equivalent.'],
    ['toons:SpongeBob SquarePants','Invincibubble SpongeBob','Invincibubble Bounce','toon,regeneration','toon','',3,'unbreakable','Cartoon durability is contextual, not absolute.']
  ];
  const lookup=Object.create(null);
  for(const row of CATALOG){
    const [id,name,move,domains,guards,weakTo,tier,kind,limit]=row;
    lookup[id+'|'+name]=Object.freeze({
      move,domains:Object.freeze(domains.split(',').filter(Boolean)),
      guards:Object.freeze(guards.split(',').filter(Boolean)),
      weakTo:Object.freeze(weakTo.split(',').filter(Boolean)),
      tier,kind,limit
    });
  }
  const VARIANT_ABILITY_PROFILES=Object.freeze(lookup);
  function variantAbilityProfile(base,form){
    if(!base||!form)return null;
    const id=String(base.pool||'')+':'+String(base.variantBase||base.n||'');
    const entry=VARIANT_ABILITY_PROFILES[id+'|'+form.name];
    if(!entry)return null;
    return {...entry,source:form.source||'',origin:form.origin||'',continuity:form.continuity||''};
  }
  // A passive, per-match form power: not a generic unconditional attribute buff.
  // Opposing specialized resistance weakens the relevant power, and an
  // explicitly relevant vulnerability weakens the transforming character.
  // Only active variant forms contribute; no false inference from character names.
  function variantBattleImpact(team,opponent,sport){
    if(!team?.rows||!opponent?.rows)return {points:0,events:[]};
    const enemies=opponent.rows.filter(r=>r.cand?.variantAbilities).map(r=>r.cand.variantAbilities);
    const strength=sport==='brawl'?1:0.32;
    const events=[];
    for(const row of team.rows){
      const form=row.cand?.variantAbilities;
      if(!form||!Array.isArray(form.domains)||!form.domains.length||row.pos?.coach||row.pos?.bench)continue;
      const defended=form.domains.filter(d=>enemies.some(enemy=>enemy.guards?.includes(d)));
      const exposed=form.weakTo?.filter(d=>enemies.some(enemy=>enemy.domains?.includes(d)))||[];
      const base=Math.min(7,0.9+1.22*form.tier)*strength;
      const points=+(base*(defended.length?0.42:1)*(exposed.length?0.72:1)).toFixed(2);
      events.push({character:row.cand.n,move:form.move,points,
        defended,exposed,domains:form.domains,limit:form.limit});
    }
    return {points:+Math.min(9,events.reduce((n,e)=>n+e.points,0)).toFixed(2),events};
  }
  if(typeof module!=='undefined'&&module.exports){
    module.exports={VARIANT_ABILITY_PROFILES,variantAbilityProfile,variantBattleImpact};
  }
  root.DA_VARIANT_ABILITY_PROFILES=VARIANT_ABILITY_PROFILES;
  root.DA_VARIANT_ABILITY_API={variantAbilityProfile,variantBattleImpact};
})(typeof window!=='undefined'?window:globalThis);

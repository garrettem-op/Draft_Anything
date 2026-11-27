/* Battle Royale combat resolution.
 * Simulated exchanges are GAMEPLAY values, not canonical damage measurements.
 * v2 adds typed signature attacks, bounded resistances, Hellbat metabolic wear
 * and explainable per-fighter aggregates. Optional full trace is for debugging.
 */
(function(root) {
  'use strict';
  const KEYS=['spd','agi','str','siz','lep','end','tch','acc','ref','iq','clu','ldr'];
  const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  const attr=(row,key)=>Number(row.cand?.a?.[KEYS.indexOf(key)])||50;
  const active=score=>(score?.rows||[]).filter(r=>r.cand&&!r.pos.coach&&!r.pos.bench);
  const abilityApi=(root&&root.DA_BRAWL_ABILITY_API)||
    (typeof module!=='undefined'&&module.exports?require('./brawl-attack-profiles.js'):null);
  const abilityFor=c=>abilityApi?.brawlAbilityOf?.(c)||null;
  // Rare, reviewed transformations must feel qualitatively different from a
  // mild stat boost. Tier-5 forms and feat-reviewed flagship forms are Apex;
  // other reviewed tier-4 forms are Empowered. Baseline characters and
  // unreviewed variants do not silently inherit this power.
  const FLAGSHIP_FORMS=new Set([
    'dc:Hellbat Armor Batman',
    'mcu:World Breaker Hulk','mcu:Titan Hulk','mcu:Immortal Hulk',
    'mcu:Dark Phoenix','mcu:Phoenix Force Jean Grey',
    'mcu:Cosmic Spider-Man (Captain Universe)','mcu:The Void (Sentry)',
    'mcu:Death Seed Sentry','mcu:Herald of Thunder Thor',
    'mcu:King Thor','mcu:King Thanos','mcu:Silver Surfer Black',
    'dc:Parallax Hal Jordan','dc:White Lantern Hal Jordan',
    'dc:Red Death Batman','games:Super Sonic',
    'games:Super Shadow','games:Dreamy Bowser',
    'games:Fierce Deity Link','games:Safer Sephiroth',
    'games:The Lich King','toons:Spinach-Powered Popeye','games:Fury Bowser'
  ]);
  function apexRankOf(c,ability){
    if(!c?.variantAbilities||!ability)return 0;
    if(ability.tier>=5||FLAGSHIP_FORMS.has(String(c.pool)+':'+String(c.n)))return 2;
    return ability.tier>=4?1:0;
  }

  // Power classification is independent of selected-form action/HP bonuses.
  // The V1 typed atlas exposes one active signature domain; do not infer
  // additional cosmic capabilities from a name, stat score, or Apex label.
  const HIGH_ORDER_DOMAINS=new Set(['cosmic','magic','reality','time','elemental']);
  function highOrderPower(p){
    return !!p&&p.tier>=4&&HIGH_ORDER_DOMAINS.has(p.domain);
  }
  // Reviewed exact identities: intrinsic power is not a transformation.
  // Numeric values are bounded editorial arena calibration, not canonical feats.
  // Require a reviewed high-order kit and never inherit from a base identity.
  const INTRINSIC_POWER=Object.freeze({
    'dc:Perpetua': [2,900,2.9],
    'dc:Anti-Monitor': [2,800,2.75],
    'dc:Mister Mxyzptlk': [2,730,2.7],
    'dc:Lucifer Morningstar': [2,730,2.7],
    'dc:Doctor Manhattan': [2,730,2.7],
    'dc:The Spectre': [2,730,2.7],
    'dc:Trigon': [2,730,2.7],
    'mcu:Franklin Richards': [2,730,2.7],
    'mcu:Galactus': [2,730,2.7],
    'mcu:Odin': [1,570,2.3],
    'mcu:The Watcher': [1,570,2.3],
    'lotr:Morgoth (Melkor)': [1,570,2.3]
  });
  function intrinsicPowerOf(c,ability){
    if(!c||c.variantBase||c.variantAbilities||!highOrderPower(ability))return null;
    const rec=INTRINSIC_POWER[String(c.pool)+':'+String(c.n)];
    return rec&&ability.tier>=rec[0]+3?{rank:rec[0],hp:rec[1],multiplier:rec[2]}:null;
  }
  const combatRank=f=>Math.max(f.apexRank||0,f.intrinsicRank||0);
  // An intrinsic-rank fighter (not an Apex form) facing a high-order supernatural fighter without a rank.
  const unrankedHighOrderPeer=(f,o)=>!!f?.intrinsicRank&&!f.apexRank&&highOrderPower(f.ability)&&
    highOrderPower(o?.ability)&&!combatRank(o);
  function powerInteraction(attacker,target,signature){
    const a=highOrderPower(attacker.ability),b=highOrderPower(target.ability);
    // Comparable supernatural kits resolve through ordinary typed guards,
    // weaknesses, pierce and existing power-tier scaling, not form status.
    const peerSignature=!!signature&&a&&b;
    let counterMultiplier=1;
    if(signature&&a&&target.apexRank&&!b){
      // Preserve the established cosmic counter against conventional forms.
      // Already-enhanced attacks need a smaller multiplier to avoid stacking
      // the entire baseline counter on top of the existing 2.3/2.7x attack.
      counterMultiplier=combatRank(attacker)?1.25+.25*(attacker.ability.tier-4):3+(attacker.ability.tier-4);
    }
    const baselineGuard=attacker.apexRank&&!a&&!target.apexRank&&b&&
      ['cosmic','magic','reality'].includes(target.ability.domain) ? .50 : 0;
    // Intrinsic rank (#676) gives cosmic entities parity with Apex forms. Against a high-order
    // supernatural peer that has no rank, the typed kits (tier, pierce, guards) decide: the rank's
    // attack multiplier does not stack on top of a tier advantage the kit already encodes.
    const peerScale=unrankedHighOrderPeer(attacker,target)?1/(attacker.combatMultiplier||1):1;
    return {counterMultiplier,baselineGuard,peerSignature,peerScale};
  }

  // Strength and demonstrable offensive technique matter; speed alone is
  // not striking power. Reviewed powers provide an alternative to muscle.
  function offensiveCredibility(c){
    const a=k=>Number(c?.a?.[KEYS.indexOf(k)])||50;
    const p=abilityFor(c);
    return clamp(Math.max(a('str'),.60*a('tch')+.40*a('acc'),p?45+11*p.tier:0)/85,.45,1);
  }
  function speedDpsFit(c,fit){
    return fit*(.68+.32*offensiveCredibility(c));
  }
  // Explicit arena tactics are editorial gameplay interpretations, not
  // canonical numeric feats. Forms must be listed independently of base kits.
  const TACTICS=Object.freeze({
    'dc:Darkseid':{signature:'backline'},
    'dc:Infinite Frontier Darkseid':{signature:'backline'},
    'toons:Marvin the Martian':{signature:'random'},
    'dc:Joker':{signature:'lowestHp'},
    'dc:Murder Machine Batman':{mark:true},
    'dc:Doomsday':{shortRange:true,taunt:true},
    'lotr:Tulkas':{shortRange:true},
    'dc:Wonder Woman':{intercept:true},
    'dc:Hellbat Armor Batman':{intercept:true},
    'mcu:Abomination':{shortRange:true}
  });
  const tacticsFor=c=>TACTICS[String(c.pool)+':'+String(c.n)]||{};
  const LEFT_ORDER=['tk1','tk2','d1','d2','d3'];
  const RIGHT_ORDER=['tk2','tk1','d3','d2','d1'];
  const LANE_SLOTS=new Set(LEFT_ORDER);
  function laneTarget(attacker,targets){
    const priority=attacker.position==='tk2'||attacker.position==='d3'?RIGHT_ORDER:LEFT_ORDER;
    return priority.map(pos=>targets.find(t=>t.position===pos)).find(Boolean)||targets[0];
  }
  function formationTarget(attacker,targets,rng,mode='lane',forced=null){
    const living=targets.filter(t=>t.hp>0);
    if(!living.length)return null;
    if(forced&&living.includes(forced))return forced;
    if(mode==='random')return living[Math.floor(rng()*living.length)]||living[0];
    if(mode==='lowestHp')return living.slice().sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp||String(a.id).localeCompare(String(b.id)))[0];
    if(mode==='backline'){
      const rear=living.filter(t=>!t.tank);
      if(rear.length)return laneTarget(attacker,rear);
    }
    return laneTarget(attacker,living);
  }
  function rangeBlocked(attacker,allies){
    return !!attacker.tactics.shortRange&&!attacker.tank&&allies.some(t=>t.tank&&t.hp>0);
  }
  function formationOverrides(fighters,round){
    const marks=new Map(),taunts=new Map(),intercepted=new Set();
    for(let side=0;side<2;side++){
      const own=fighters[side].filter(f=>f.hp>0).sort(byIdentity);
      const enemy=fighters[1-side].filter(f=>f.hp>0);
      // One-round windows every three rounds; no permanent hard lock.
      if((round-1)%3===0){
        const taunter=own.find(f=>f.tactics.taunt&&f.tank);
        if(taunter)taunts.set(side,taunter);
        const marker=own.find(f=>f.tactics.mark);
        if(marker){
          const ally=own.filter(f=>f!==marker).sort((a,b)=>b.attack-a.attack||byIdentity(a,b))[0];
          const target=enemy.find(f=>f.position===marker.position);
          if(ally&&target)marks.set(ally,target);
        }
      }
    }
    return {marks,taunts,intercepted};
  }
  function fighter(row,side) {
    const tank=!!row.pos.tank;
    const a=k=>attr(row,k);
    const fit=clamp(Number(row.fit)||50,1,165);
    const power=.44*a('str')+.18*a('acc')+.16*a('spd')+.12*a('ref')+.10*a('iq');
    const armor=.34*a('end')+.21*a('siz')+.23*a('str')+.13*a('ref')+.09*a('agi');
    // Rating/fit already account for signature team support, selected variants,
    // ToonForce/MuppetForce and registered exceptional-power bonuses.
    const attack=9+.31*power+.32*fit+.10*a('spd');
    const c=row.cand;
    const ability=abilityFor(c);
    const apexRank=apexRankOf(c,ability);
    const apexHp=apexRank===2?730:apexRank?570:0;
    const intrinsic=intrinsicPowerOf(c,ability);
    const intrinsicRank=intrinsic?.rank||0;
    const intrinsicHp=intrinsic?.hp||0;
    const combatMultiplier=Math.max(intrinsic?.multiplier||1,apexRank===2?2.7:apexRank?2.3:1);
    // High-order magic/reality/cosmic entities bring limited protective power
    // even when their human/child physical stats are unexceptional. This is a
    // depleted gameplay ward, not an assertion of literal invulnerability.
    const wardHp=ability&&ability.tier>=4&&
      ['reality','cosmic','magic','elemental'].includes(ability.domain)
      ?Math.round(26*ability.tier):0;
    const maxHp=Math.round(130+1.30*a('end')+.62*a('str')+
      .58*a('siz')+.24*fit+(tank?64:0)+wardHp+Math.max(apexHp,intrinsicHp));
    // A physical combat tier is distinct from magic/reality technique tiers.
    // This reduces conventional blows against opponents with established
    // extreme bodies without accidentally ranking all cosmic spells as fists.
    const physicalTier=a('str')>=90&&a('end')>=85?3:
      a('str')>=75&&a('end')>=70?2:1;
    let toon=null,muppet=null;
    if(typeof toonForceOf==='function')toon=toonForceOf(c);
    if(typeof muppetForceOf==='function')muppet=muppetForceOf(c);
    // Do not translate tank resilience / defensive ToonForce fit into strike
    // damage. Speed remains useful in initiative, accuracy and evasion.
    const credibility=offensiveCredibility(c);
    const attackFit=toon?Math.min(fit,99*credibility):fit;
    const strike=toon?9+.31*power+.32*attackFit+.10*a('spd')*credibility:attack;
    const offenseScale=toon?.dimensions?(.65+.35*credibility):1;
    return {
      id:c.id,name:c.n,position:row.pos.id,side,tank,
      ability,tactics:tacticsFor(c),physicalTier,wardHp,apexRank,apexHp,intrinsicRank,intrinsicHp,combatMultiplier,
      attack:strike*offenseScale*combatMultiplier,armor,fit,maxHp,hp:maxHp,credibility,attackFit,
      accuracy:a('acc'),focus:a('iq'),speed:a('spd'),reflex:a('ref'),agility:a('agi'),
      toon,muppet,
      dmg:0,abs:0,mit:0,overkill:0,kos:0,attacks:0,hits:0,
      powerUses:0,powerDmg:0,wear:0,roundsAlive:0,receivedHits:0,koRound:0,
      rangeSkips:0,intercepts:0,redirected:0,
      targets:Object.create(null)
    };
  }
  function defense(f) {
    const t=f.toon?.dimensions;
    const m=f.muppet?.dimensions;
    const toonBlock=t?Math.min(20,5+13*(Number(t.resilience)||0)/99+2*(Number(t.body)||0)/99):0;
    const muppetBlock=m?Math.min(8,3+5*(Number(m.resilience)||0)/99):0;
    return 6+.18*f.armor+.052*f.fit+toonBlock+muppetBlock;
  }
  // Identity ordering decouples seeded initiative and target draws from
  // equivalent roster slots. Position still determines tank status.
  const byIdentity=(a,b)=>String(a.id).localeCompare(String(b.id));
  function pickTarget(targets,rng) {
    // Tanks reliably draw more attacks, but don't monopolize targets.
    const weights=targets.map(f=>f.tank?2.2:1);
    const sum=weights.reduce((a,b)=>a+b,0);
    let roll=rng()*sum;
    for(let i=0;i<targets.length;i++){roll-=weights[i];if(roll<0)return targets[i];}
    return targets[targets.length-1];
  }
  function resolveBrawlCombat(A,B,effectiveRatings,rng,options={}) {
    const teams=[A,B];
    const fighters=teams.map((t,i)=>active(t).map(row=>fighter(row,i)));
    // Only the actual five-position board (including short-handed subsets)
    // has lane geometry. Custom/legacy fixtures retain weighted targeting.
    const formation=fighters.every(team=>team.every(f=>LANE_SLOTS.has(f.position)));
    if(!fighters[0].length||!fighters[1].length)
      throw new Error('Battle Royale requires fighters on both teams');
    if(typeof rng!=='function')throw new Error('Battle Royale requires a seeded RNG');
    const support=teams.map((t,i)=>{
      const base=Number(t.rating)||70;
      const effective=Number(effectiveRatings?.[i]);
      const delta=Number.isFinite(effective)?effective-base:0;
      const teamSupport=clamp(base/80,.78,1.24);
      return clamp(teamSupport*(1+.018*delta),.70,1.35);
    });
    // Event log is opt-in to avoid retaining hundreds of events per game in seasons.
    const events=options.trace?[]:null;
    const log=event=>{if(events&&events.length<1500)events.push(event);};
    let round=0,attacks=0;
    for(round=1;round<=90;round++) {
      const alive=fighters.flatMap(team=>team.filter(f=>f.hp>0).sort(byIdentity));
      for(const f of alive){
        f.roundsAlive++;
        // Metabolic drain is distinct from opponent damage and cannot finish
        // an opponent or award a fabricated KO on its own.
        const p=f.ability;
        if(p?.wearStart&&round>=p.wearStart&&f.hp>1){
          const amount=Math.min(f.hp-1,Math.max(1,Math.round(f.maxHp*p.wearRate)));
          f.hp-=amount;
          f.wear+=amount;
          log({round,type:'wear',fighter:f.id,side:f.side,amount,hp:f.hp});
        }
      }
      const ordered=alive.map(f=>({
        f,initiative:.57*f.speed+.43*f.reflex+18*rng()
      })).sort((a,b)=>b.initiative-a.initiative);
      const fatigue=round>17?1+Math.min(3,(round-17)*.13):1;
      const overrides=formation?formationOverrides(fighters,round):null;
      // The second enhanced/intrinsic-power action follows the normal initiative pass,
      // preserving an opportunity for enemies to respond or counterattack.
      const actions=ordered.concat(ordered.filter(x=>combatRank(x.f))
        .map(x=>({...x,action:1})));
      for(const {f,action=0} of actions) {
        if(f.hp<=0)continue;
        // The intrinsic second action is Apex parity; it is not taken when every opponent left
        // is an unranked high-order peer.
        if(action&&!f.apexRank&&fighters[1-f.side].every(o=>o.hp<=0||unrankedHighOrderPeer(f,o)))continue;
        const enemies=fighters[1-f.side].filter(x=>x.hp>0).sort(byIdentity);
        if(!enemies.length)break;
        if(formation&&rangeBlocked(f,fighters[f.side])){
          f.rangeSkips++;
          log({round,type:'range',attacker:f.id,side:f.side});
          continue;
        }
        const p=f.ability;
        // Extremely high-tier, non-physical entities primarily act through
        // powers rather than ordinary punches. Their limited spell cadence
        // is quicker; this does not create a free automatic knockout.
        const highOrder=!!p&&p.tier>=5&&
          ['reality','cosmic','magic','elemental'].includes(p.domain);
        const cooldown=highOrder&&(f.physicalTier===1||f.intrinsicRank===2)?Math.min(2,p.cooldown):p?.cooldown;
        const signature=!!p&&action===0&&((round-1)%cooldown===0);
        let target,targeting='weighted';
        if(formation){
          const taunt=overrides.taunts.get(1-f.side),mark=!signature&&overrides.marks.get(f);
          const forced=taunt?.hp>0?taunt:mark?.hp>0?mark:null;
          targeting=forced?(forced===taunt?'taunt':'mark'):(signature&&f.tactics.signature||'lane');
          target=formationTarget(f,enemies,rng,targeting,forced);
          // A reviewed front-line defender can intercept one attack aimed at
          // a rear ally per round. Never intercept an already forced target.
          if(!forced&&!target.tank){
            const guard=enemies.find(g=>g.tank&&g.tactics.intercept&&!overrides.intercepted.has(g));
            if(guard){overrides.intercepted.add(guard);guard.intercepts++;target.redirected++;target=guard;targeting='intercept';}
          }
        }else target=pickTarget(enemies,rng);
        f.attacks++;attacks++;
        if(signature)f.powerUses++;
        let hitChance=clamp(.79+.0014*(f.accuracy-target.reflex)+
          .0011*(f.speed-target.agility),.53,.97);
        // Reality alteration / spellcasting is not hand-eye marksmanship.
        if(signature&&['reality','cosmic','magic'].includes(p.domain))
          hitChance=Math.max(hitChance,clamp(.78+.025*(p.tier-3)+
            .0005*(f.focus-target.reflex),.66,.94));
        if(rng()>hitChance){
          log({round,type:'miss',attacker:f.id,side:f.side,target:target.id,
            move:signature?p.move:'Standard attack',targeting});
          continue;
        }
        f.hits++;
        // Exceptional reality/cosmic abilities should not be reduced to
        // their owner's conventional punch strength (e.g. Franklin Richards).
        // Only reviewed, cooldown-limited signature events receive this floor.
        const rolled=f.attack*(f.tank?1.02:1.14)*support[f.side]*
          (.83+.34*rng())*fatigue*(action?.82:1)*(signature?(1+.19+.06*p.tier):1);
        const elevated=signature&&p.tier>=4&&
          ['reality','cosmic','magic','elemental'].includes(p.domain);
        const floor=elevated?(30+14*p.tier)*support[f.side]*fatigue:0;
        let raw=Math.max(1,Math.round(Math.max(rolled,floor)));
        const domain=signature?p.domain:'physical';
        const interaction=powerInteraction(f,target,signature);
        raw=Math.round(raw*interaction.counterMultiplier*interaction.peerScale);
        let block=defense(target)*(.88+.24*rng())*(signature?1-p.pierce:1);
        // Keep the established defense against conventional empowered strikes,
        // but never halve a cosmic peer's offense merely because it is a form.
        block+=raw*interaction.baselineGuard;
        if(signature&&target.ability?.guard?.includes(domain))block+=raw*.13;
        if(signature&&target.ability?.weakTo?.includes(domain))block-=raw*.12;
        // A non-superhuman punch or gadget does not routinely punch through
        // invulnerable physiology. Toon physics uses its own resilience model.
        // Signature reality/cosmic/magic attacks bypass the *physical* gap;
        // their own specific domain guards still apply above.
        const physicalAttack=!signature||['melee','toxin','tech','physical'].includes(domain);
        if(physicalAttack){
          const gap=Math.max(0,target.physicalTier-f.physicalTier);
          // Cartoon body manipulation mitigates a strength mismatch, but
          // merely surviving slapstick does not erase it.
          const bypass=f.toon?.dimensions?clamp((Number(f.toon.dimensions.body)||0)/99,0,1):0;
          block+=raw*Math.min(.32,.11*gap)*(1-bypass);
        }
        if(combatRank(target)&&!combatRank(f)&&!interaction.peerSignature&&!unrankedHighOrderPeer(target,f)){
          // Standard weapons and punches struggle against empowered forms,
          // but high-order documented abilities remain meaningful counters.
          const threat=Math.max(p?.tier||0,f.physicalTier===3?3:0);
          const shell=combatRank(target)===2?.61:.51;
          const resistance=Math.max(0,shell-.11*Math.min(5,threat));
          const physicalOrDevice=!signature||['physical','melee','tech','toxin'].includes(domain);
          block+=raw*Math.max(0,resistance-(physicalOrDevice?0:.08));
        }
        if(signature&&domain==='toxin'&&target.physicalTier===3)
          block+=raw*.10; // delivery to extreme physiologies is less reliable
        const prevented=Math.min(raw-1,Math.max(0,Math.round(block)));
        const incoming=Math.max(1,raw-prevented);
        const dealt=Math.min(target.hp,incoming);
        target.hp-=dealt;
        f.dmg+=incoming;
        f.overkill+=incoming-dealt;
        if(signature)f.powerDmg+=incoming;
        target.abs+=dealt;
        target.mit+=prevented;
        target.receivedHits++;
        const t=f.targets[target.id]||(f.targets[target.id]={name:target.name,hits:0,dmg:0});
        t.hits++;t.dmg+=incoming;
        if(target.hp===0){
          f.kos++;
          target.koRound=round;
        }
        log({round,type:'hit',attacker:f.id,side:f.side,target:target.id,
          move:signature?p.move:'Standard attack',targeting,domain,raw,prevented,
          counterMultiplier:interaction.counterMultiplier,baselineGuard:interaction.baselineGuard,
          peerSignature:interaction.peerSignature,
          incoming,absorbed:dealt,overkill:incoming-dealt,hp:target.hp,ko:target.hp===0});
      }
      if(!fighters[0].some(f=>f.hp>0)||!fighters[1].some(f=>f.hp>0))break;
    }
    const sideSummary=side=>{
      const list=fighters[side];
      return {
        damage:list.reduce((s,f)=>s+f.dmg,0),
        absorbed:list.reduce((s,f)=>s+f.abs,0),
        mitigated:list.reduce((s,f)=>s+f.mit,0),
        kos:list.reduce((s,f)=>s+f.kos,0),
        survivors:list.filter(f=>f.hp>0).length,
        fighters:list.map(f=>({
          id:f.id,name:f.name,position:f.position,
          dmg:f.dmg,abs:f.abs,mit:f.mit,overkill:f.overkill,kos:f.kos,
          attacks:f.attacks,hits:f.hits,hp:f.hp,maxHp:f.maxHp,
          roundsAlive:f.roundsAlive,receivedHits:f.receivedHits,
          rangeSkips:f.rangeSkips,intercepts:f.intercepts,redirected:f.redirected,
          powerUses:f.powerUses,powerDmg:f.powerDmg,powerMove:f.ability?.move||'',
          physicalTier:f.physicalTier,wardHp:f.wardHp,
          apexRank:f.apexRank,apexHp:f.apexHp,intrinsicRank:f.intrinsicRank,intrinsicHp:f.intrinsicHp,combatMultiplier:f.combatMultiplier,offenseCredibility:f.credibility,attackFit:f.attackFit,teamSupport:support[side],
          powerDomain:f.ability?.domain||'',powerSource:f.ability?.source||'',
          powerLimit:f.ability?.limit||'',powerContinuity:f.ability?.continuity||'',
          wear:f.wear,koRound:f.koRound,targets:f.targets
        }))
      };
    };
    const sides=[sideSummary(0),sideSummary(1)];
    if(sides[0].survivors&&sides[1].survivors)
      throw new Error('Battle Royale combat failed to resolve in 90 rounds');
    const winner=sides[0].survivors?0:1,loser=1-winner;
    const result={
      version:2,model:'typed-signature-v3-intrinsic-peer',winner,rounds:round,attacks,
      line:[sides[winner].kos,sides[loser].kos,
        sides[loser].kos===0?'flawless':sides[winner].survivors===1?'last one standing':''],
      sides
    };
    if(events)result.events=events;
    return result;
  }
  const api={resolveBrawlCombat,apexRankOf,offensiveCredibility,speedDpsFit,formationTarget,rangeBlocked,formationOverrides,highOrderPower,powerInteraction,intrinsicPowerOf};
  if(root)root.DA_BRAWL_COMBAT=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:null);

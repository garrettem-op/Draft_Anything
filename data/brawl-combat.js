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

  function fighter(row,side) {
    const tank=!!row.pos.tank;
    const a=k=>attr(row,k);
    const fit=clamp(Number(row.fit)||50,1,165);
    const power=.44*a('str')+.18*a('acc')+.16*a('spd')+.12*a('ref')+.10*a('iq');
    const armor=.34*a('end')+.21*a('siz')+.23*a('str')+.13*a('ref')+.09*a('agi');
    // Rating/fit already account for signature team support, selected variants,
    // ToonForce/MuppetForce and registered exceptional-power bonuses.
    const attack=9+.31*power+.32*fit+.10*a('spd');
    const maxHp=Math.round(130+1.30*a('end')+.62*a('str')+.58*a('siz')+.24*fit+(tank?64:0));
    const c=row.cand;
    // A physical combat tier is distinct from magic/reality technique tiers.
    // This reduces conventional blows against opponents with established
    // extreme bodies without accidentally ranking all cosmic spells as fists.
    const physicalTier=a('str')>=90&&a('end')>=85?3:
      a('str')>=75&&a('end')>=70?2:1;
    let toon=null,muppet=null;
    if(typeof toonForceOf==='function')toon=toonForceOf(c);
    if(typeof muppetForceOf==='function')muppet=muppetForceOf(c);
    return {
      id:c.id,name:c.n,position:row.pos.id,side,tank,
      ability:abilityFor(c),physicalTier,
      attack,armor,fit,maxHp,hp:maxHp,
      accuracy:a('acc'),speed:a('spd'),reflex:a('ref'),agility:a('agi'),
      toon,muppet,
      dmg:0,abs:0,mit:0,overkill:0,kos:0,attacks:0,hits:0,
      powerUses:0,powerDmg:0,wear:0,roundsAlive:0,receivedHits:0,koRound:0,
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
      const alive=fighters.flat().filter(f=>f.hp>0);
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
      for(const {f} of ordered) {
        if(f.hp<=0)continue;
        const enemies=fighters[1-f.side].filter(x=>x.hp>0);
        if(!enemies.length)break;
        const target=pickTarget(enemies,rng);
        f.attacks++;attacks++;
        const p=f.ability;
        const signature=!!p&&((round-1)%p.cooldown===0);
        if(signature)f.powerUses++;
        const hitChance=clamp(.79+.0014*(f.accuracy-target.reflex)+
          .0011*(f.speed-target.agility),.53,.97);
        if(rng()>hitChance){
          log({round,type:'miss',attacker:f.id,side:f.side,target:target.id,
            move:signature?p.move:'Standard attack'});
          continue;
        }
        f.hits++;
        // Exceptional reality/cosmic abilities should not be reduced to
        // their owner's conventional punch strength (e.g. Franklin Richards).
        // Only reviewed, cooldown-limited signature events receive this floor.
        const rolled=f.attack*(f.tank?1.02:1.14)*support[f.side]*
          (.83+.34*rng())*fatigue*(signature?(1+.19+.06*p.tier):1);
        const elevated=signature&&p.tier>=4&&
          ['reality','cosmic','magic','elemental'].includes(p.domain);
        const floor=elevated?(30+14*p.tier)*support[f.side]*fatigue:0;
        const raw=Math.max(1,Math.round(Math.max(rolled,floor)));
        const domain=signature?p.domain:'physical';
        let block=defense(target)*(.88+.24*rng())*(signature?1-p.pierce:1);
        if(signature&&target.ability?.guard?.includes(domain))block+=raw*.13;
        if(signature&&target.ability?.weakTo?.includes(domain))block-=raw*.12;
        // A non-superhuman punch or gadget does not routinely punch through
        // invulnerable physiology. Toon physics uses its own resilience model.
        // Signature reality/cosmic/magic attacks bypass the *physical* gap;
        // their own specific domain guards still apply above.
        const physicalAttack=!signature||['melee','toxin','tech','physical'].includes(domain);
        if(physicalAttack&&!f.toon){
          const gap=Math.max(0,target.physicalTier-f.physicalTier);
          block+=raw*Math.min(.32,.11*gap);
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
          move:signature?p.move:'Standard attack',domain,raw,prevented,
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
          powerUses:f.powerUses,powerDmg:f.powerDmg,powerMove:f.ability?.move||'',
          physicalTier:f.physicalTier,
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
      version:2,model:'typed-signature-v1',winner,rounds:round,attacks,
      line:[sides[winner].kos,sides[loser].kos,
        sides[loser].kos===0?'flawless':sides[winner].survivors===1?'last one standing':''],
      sides
    };
    if(events)result.events=events;
    return result;
  }
  const api={resolveBrawlCombat};
  if(root)root.DA_BRAWL_COMBAT=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:null);

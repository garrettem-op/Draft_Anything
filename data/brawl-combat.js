/* Battle Royale combat resolution.
 * Uses actual simulated attacks, mitigation, HP depletion and knockouts.
 * These are game-model interactions, NOT claims of canonically measured damage.
 * Other sports retain their existing rating-based score generation.
 */
(function(root) {
  "use strict";
  const KEYS=['spd','agi','str','siz','lep','end','tch','acc','ref','iq','clu','ldr'];
  const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  const attr=(row,key)=>Number(row.cand?.a?.[KEYS.indexOf(key)])||50;
  const active=score=>(score?.rows||[]).filter(r=>r.cand&&!r.pos.coach&&!r.pos.bench);
  function fighter(row,side) {
    const tank=!!row.pos.tank;
    const a=k=>attr(row,k);
    const fit=clamp(Number(row.fit)||50,1,165);
    const power=.44*a('str')+.18*a('acc')+.16*a('spd')+.12*a('ref')+.10*a('iq');
    const armor=.34*a('end')+.21*a('siz')+.23*a('str')+.13*a('ref')+.09*a('agi');
    // Existing position fit already contains documented exceptional powers,
    // role matching, ToonForce/MuppetForce and variant form attributes.
    const attack=9+.31*power+.32*fit+.10*a('spd');
    const maxHp=Math.round(130+1.30*a('end')+.62*a('str')+.58*a('siz')+.24*fit+(tank?64:0));
    const c=row.cand;
    let toon=null,muppet=null;
    if(typeof toonForceOf==='function')toon=toonForceOf(c);
    if(typeof muppetForceOf==='function')muppet=muppetForceOf(c);
    return {
      id:c.id,name:c.n,position:row.pos.id,side,tank,
      attack,armor,fit,maxHp,hp:maxHp,
      accuracy:a('acc'),speed:a('spd'),reflex:a('ref'),agility:a('agi'),
      toon,muppet,
      dmg:0,abs:0,mit:0,kos:0,attacks:0,hits:0
    };
  }
  function defense(f) {
    const t=f.toon?.dimensions;
    const m=f.muppet?.dimensions;
    // Repeated cartoon impact survival helps defense, but is NOT invulnerability.
    const toonBlock=t?Math.min(20,5+13*(Number(t.resilience)||0)/99+2*(Number(t.body)||0)/99):0;
    const muppetBlock=m?Math.min(8,3+5*(Number(m.resilience)||0)/99):0;
    return 6+.18*f.armor+.052*f.fit+toonBlock+muppetBlock;
  }
  function pickTarget(targets,rng) {
    // Tanks absorb pressure while alive; the other fighters are still targetable.
    const weights=targets.map(f=>f.tank?3.1:1);
    const sum=weights.reduce((a,b)=>a+b,0);
    let roll=rng()*sum;
    for(let i=0;i<targets.length;i++){roll-=weights[i];if(roll<0)return targets[i];}
    return targets[targets.length-1];
  }
  function resolveBrawlCombat(A,B,effectiveRatings,rng) {
    const teams=[A,B];
    const fighters=teams.map((t,i)=>active(t).map(row=>fighter(row,i)));
    if(!fighters[0].length||!fighters[1].length)
      throw new Error('Battle Royale requires fighters on both teams');
    const support=teams.map((t,i)=>{
      // Rating adjustments include coaching, chemistry, signature moves,
      // teamwide MuppetForce, matchup-specific variants and match-day variation.
      // Individual attributes/fit are already counted separately.
      const base=Number(t.rating)||70;
      const effective=Number(effectiveRatings?.[i]);
      const delta=Number.isFinite(effective)?effective-base:0;
      const teamSupport=clamp(base/80,.78,1.24);
      return clamp(teamSupport*(1+.018*delta),.70,1.35);
    });
    let round=0,attacks=0;
    for(round=1;round<=90;round++){
      const ordered=fighters.flat().filter(f=>f.hp>0).map(f=>({
        f,initiative:.57*f.speed+.43*f.reflex+18*rng()
      })).sort((a,b)=>b.initiative-a.initiative);
      const fatigue=round>17?1+Math.min(3,(round-17)*.13):1;
      for(const {f} of ordered) {
        if(f.hp<=0)continue;
        const enemies=fighters[1-f.side].filter(x=>x.hp>0);
        if(!enemies.length)break;
        const target=pickTarget(enemies,rng);
        f.attacks++;attacks++;
        const hitChance=clamp(.79+.0014*(f.accuracy-target.reflex)+
          .0011*(f.speed-target.agility),.53,.97);
        if(rng()>hitChance)continue;
        f.hits++;
        const raw=Math.max(1,Math.round(
          f.attack*(f.tank?0.88:1.16)*support[f.side]*
          (.83+.34*rng())*fatigue
        ));
        const prevented=Math.min(raw-1,Math.round(defense(target)*(.88+.24*rng())));
        const incoming=Math.max(1,raw-prevented);
        const dealt=Math.min(target.hp,incoming);
        target.hp-=dealt;
        f.dmg+=dealt;
        target.abs+=dealt;
        target.mit+=prevented;
        if(target.hp===0)f.kos++;
      }
      if(!fighters[0].some(f=>f.hp>0)||!fighters[1].some(f=>f.hp>0))break;
    }
    // Every knockout is assigned at the hit that actually reduced HP to zero.
    // No score-based allocation, fabricated 5-KO bonus or fixed DMG minimum.
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
          dmg:f.dmg,abs:f.abs,mit:f.mit,kos:f.kos,
          attacks:f.attacks,hits:f.hits,hp:f.hp,maxHp:f.maxHp
        }))
      };
    };
    const sides=[sideSummary(0),sideSummary(1)];
    if(sides[0].survivors&&sides[1].survivors)
      throw new Error('Battle Royale combat failed to resolve in 90 rounds');
    const winner=sides[0].survivors?0:1;
    const loser=1-winner;
    return {
      version:1,winner,rounds:round,attacks,
      line:[sides[winner].kos,sides[loser].kos,
        sides[loser].kos===0?'flawless':sides[loser].kos===4?'last one standing':''],
      sides
    };
  }
  const api={resolveBrawlCombat};
  if(root)root.DA_BRAWL_COMBAT=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:null);

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const {offensiveCredibility,speedDpsFit,apexRankOf,resolveBrawlCombat}=require('../data/brawl-combat.js');
const {brawlAbilityOf}=require('../data/brawl-attack-profiles.js');
const {variantAbilityProfile}=require('../data/variant-abilities.js');
const {toonForceMultiplier}=require('../data/toon-force.js');
const hero=(pool,n,a,extra={})=>({id:pool+':'+n,pool,n,a,...extra});
const speedy=hero('toons','Speedy Gonzales',[99,98,20,8,80,90,70,60,99,80,84,72]);
const runner=hero('toons','Road Runner',[99,98,30,30,80,99,40,40,98,72,90,40]);
const bluto=hero('toons','Bluto',[56,50,99,88,50,90,40,40,50,40,52,55]);
const marvin=hero('toons','Marvin the Martian',[70,70,30,30,60,60,94,94,72,95,60,70]);
const rayman=hero('games','Rayman',[72,90,45,40,88,80,92,78,84,60,72,55]);
test('speed remains useful but no longer substitutes entirely for offensive capability',()=>{
 assert.ok(offensiveCredibility(speedy)<offensiveCredibility(bluto));
 assert.ok(speedDpsFit(runner,95)<speedDpsFit(marvin,95));
 assert.ok(toonForceMultiplier(speedy,'brawl',{id:'d1'})<toonForceMultiplier(speedy,'brawl',{tank:true}));
 assert.equal(offensiveCredibility(marvin),1);
 assert.ok(brawlAbilityOf(rayman));
});
test('Fury Bowser is a documented apex transformation, not a baseline perk',()=>{
 const base=hero('games','Bowser',Array(12).fill(80));
 const ability=variantAbilityProfile(base,{name:'Fury Bowser'});
 assert.equal(ability.move,'Fury Blast');
 const transformed={...base,n:'Fury Bowser',variantBase:'Bowser',variantAbilities:ability};
 assert.equal(apexRankOf(transformed,brawlAbilityOf(transformed)),2);
 assert.equal(apexRankOf(base,brawlAbilityOf(base)),0);
});
test('Underdogs effective role ceiling is symmetric and slot-specific',()=>{
 const code=fs.readFileSync(path.join(__dirname,'../data/campaign.js'),'utf8');
 const ctx=vm.createContext({fitIn:(sport,c,p)=>c.fit, S:{campaign:{history:[]}}});
 vm.runInContext(code+';this.allowed=campaignAllowed;',ctx);
 const low={...speedy,a:Array(12).fill(60),fit:101};
 const high={...low,fit:99};
 assert.equal(ctx.allowed(low,'underdog',{id:'d1',styles:[]}),false);
 assert.equal(ctx.allowed(high,'underdog',{id:'d1',styles:[]}),true);
 assert.equal(ctx.allowed(low,'underdog',{id:'cmd',coach:true}),true);
});
test('combat audit reports support, attack fit, action count and KO timing',()=>{
 const roster=c=>({rating:85,rows:[{pos:{id:'d1'},cand:c,fit:85}]});
 let state=123;const rng=()=>((state=Math.imul(state,1664525)+1013904223>>>0)/4294967296);
 const r=resolveBrawlCombat(roster(speedy),roster(marvin),[85,85],rng,{trace:true});
 for(const fighter of r.sides.flatMap(s=>s.fighters)){
   assert.ok(Number.isFinite(fighter.offenseCredibility));
   assert.ok(Number.isFinite(fighter.attackFit));
   assert.ok(fighter.teamSupport>0);
   assert.ok(fighter.hits<=fighter.attacks);
 }
 assert.ok(r.events.some(e=>e.ko));
});

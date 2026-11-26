const test=require('node:test');
const assert=require('node:assert/strict');
const {daSupportImpact,daAllocate,daFootballBreakdown,daVolleyballPoints,daBoxScore,daUserMatches,daComparison,daLineupMetric,daPointsFor}=require('../data/after-action.js');
global.esc=v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function team(ids) {
 return {rating:83,rows:ids.map((id,i)=>({pos:{id,ab:id,imp:1},fit:70+i,cand:{id:'c'+i,n:'Player '+i,a:Array(12).fill(74+i)}}))};
}
function count(rows,key){return rows.reduce((n,r)=>n+(r.stats.find(stat=>stat[0]===key)?.[1]||0),0);}
test('integer allocation reconciles exactly, including uneven and zero weights',()=>{
 for(const amount of [0,1,7,23,111])for(const weights of [[1,2,3],[0,0,0],[1,0,0]]) {
  const allocations=daAllocate(amount,weights);
  assert.equal(allocations.reduce((a,b)=>a+b,0),amount);
  assert.ok(allocations.every(Number.isInteger));
  assert.ok(allocations.every(n=>n>=0));
 }
});
test('football event decomposition always reconciles to final score',()=>{
 for(let points=0;points<=75;points++){
  const b=daFootballBreakdown(points);
  assert.equal(b.td*7+b.fg*3+b.safeties*2+b.unassigned,points);
 }
});
test('football box score never attributes offense to defensive positions',()=>{
 const f=daBoxScore('football',team(['qb','rb','wr1','wr2','te','lt','de1','dt1','mlb','cb1','fs']),27,'game-1');
 const defense=f.filter(r=>['de1','dt1','mlb','cb1','fs'].includes(r.position));
 const quarterback=f.find(r=>r.position==='qb');
 for(const player of defense)assert.ok(player.stats.every(([k])=>!['Pass YDS','Rush YDS','Rec YDS','TD'].includes(k)));
 assert.ok(quarterback.stats.every(([k])=>!['TACK','SACK','INT','Rec YDS'].includes(k)));
 assert.equal(count(f,'TD'),daFootballBreakdown(27).td);
});
test('basketball points reconcile exactly, with role-specific columns',()=>{
 const b=daBoxScore('basketball',team(['pg','sg','sf','pf','c']),112,'final');
 assert.equal(count(b,'PTS'),112);
 assert.ok(count(b,'REB')>0);
 assert.ok(b.every(r=>r.stats.some(([k])=>k==='AST')));
});
test('goals, runs, KOs reconcile to observed match score',()=>{
 const cases=[['soccer',['gk','lb','st','lw','rw'],'G',3],['hockey',['g','ld','c','lw','rw'],'G',5],['baseball',['p','c','ss','1b','lf'],'R',9],['brawl',['tk1','tk2','d1','d2','d3'],'KOs',5]];
 for(const [sport,ids,key,score] of cases) {
  const result=daBoxScore(sport,team(ids),score,'game');
  assert.equal(count(result,key),score,sport);
 }
});
test('volleyball uses per-set rally totals instead of sets as individual points',()=>{
 assert.equal(daVolleyballPoints(3,'25-23, 25-20, 25-17',0),75);
 assert.equal(daVolleyballPoints(0,'25-23, 25-20, 25-17',1),60);
 const result=daBoxScore('volleyball',team(['s','oh1','mb1','opp','oh2','lib','mb2']),3,'rally',{note:'25-23, 25-20, 25-17',side:0});
 assert.equal(result.summary.teamRallyPoints,75);
 assert.ok(count(result,'KILLS')>20);
});
test('identical seeds and matchups produce identical estimated reports',()=>{
 const roster=team(['pg','sg','sf','pf','c']);
 assert.deepEqual(daBoxScore('basketball',roster,105,'repeat-1'),daBoxScore('basketball',roster,105,'repeat-1'));
});
test('match browser includes all regular-season and playoff games, including individual series games',()=>{
 const simulation={games:[{a:0,b:1,w:0,line:[100,90]},{a:1,b:2,w:2,line:[100,90]}],rounds:[[{
  a:0,b:2,w:0,bo:3,line:[2,1],games:[{w:0,line:[102,94]},{w:2,line:[96,92]},{w:0,line:[101,99]}]
 }]]};
 const all=daUserMatches(simulation);
 assert.equal(all.length,4);
 assert.deepEqual(all.map(g=>g.w),[0,0,2,0]);
 assert.ok(all[1].label.includes('Playoffs'));
});

test('a match uses one side-by-side roster-stat chart with summary and detail controls',()=>{
 const A=team(['pg','sg','sf','pf','c']),B=team(['pg','sg','sf','pf','c']);
 const html=daComparison('basketball',A,B,108,103,'Our team','Rivals','fixture-1');
 assert.match(html,/View Detailed Stats/);
 assert.match(html,/Read Summary/);
 assert.match(html,/da-player-table/);
 assert.equal((html.match(/<table /g)||[]).length,1,'do not repeat player rosters in different tables');
 assert.equal((html.match(/Our team/g)||[]).length>=1,true);
 assert.ok(html.includes('108')&&html.includes('103'));
 assert.ok(html.includes('Player 0'));
 assert.match(html,/simulated estimates/i);
 assert.ok(!html.includes('Scouting takeaway:'));
});
test('new brawl comparison uses combat damage, not KOs converted to damage',()=>{
 const A=team(['tk1','tk2','d1','d2','d3']);
 const B=team(['tk1','tk2','d1','d2','d3']);
 const side=(damages,kos)=>({
   fighters:damages.map((d,i)=>({id:'c'+i,dmg:d,kos:kos[i],abs:40+i*10,mit:10+i*5}))
 });
 const combat={version:1,winner:1,rounds:11,sides:[
   side([40,80,95,120,65],[1,0,0,1,1]),
   side([80,50,125,210,155],[1,0,1,2,1])
 ]};
 const html=daComparison('brawl',A,B,3,5,'Us','Them','fixture-brawl',{combat});
 assert.match(html,/DMG/);
 assert.match(html,/simulated combat exchanges/);
 assert.match(html,/400/);
 assert.match(html,/620/);
 assert.match(html,/da-sharebar/);
 assert.match(html,/How the match was calculated|Read Summary/);
 const b=daBoxScore('brawl',A,3,'fixture-brawl:left',{combatSide:combat.sides[0]});
 assert.equal(daLineupMetric(b[2],'brawl')[0],'DMG');
 assert.equal(count(b,'DMG'),400);
 assert.equal(count(b,'KOs'),3);
 assert.equal(count(b,'ABS'),90);
});
test('legacy brawl reports do not invent damage from knockout counts',()=>{
 const A=team(['tk1','tk2','d1','d2','d3']);
 const html=daComparison('brawl',A,A,0,5,'Us','Them','legacy-brawl');
 assert.match(html,/Legacy match/);
 assert.doesNotMatch(html,/DMG: <b/);
 const b=daBoxScore('brawl',A,0,'legacy-brawl');
 assert.equal(count(b,'DMG'),0);
});
test('score attribution keeps the opponent score in either winner ordering',()=>{
 assert.equal(daPointsFor({a:0,b:3,w:3,line:[120,110]},0),110);
 assert.equal(daPointsFor({a:3,b:0,w:3,line:[120,110]},0),110);
 assert.equal(daPointsFor({a:0,b:3,w:0,line:[120,110]},0),120);
 assert.equal(daPointsFor({a:0,b:3,w:-1,line:[2,2]},3),2);
});

test('support impact is actual counterfactual team rating, not randomized form',()=>{
 const cmd={id:'cmd',ab:'CMD',coach:true},bn={id:'bn',ab:'RNF',bench:true};
 const fighter={id:'fighter',n:'Fighter',a:Array(12).fill(75)};
 const kermit={id:'kermit',n:'Kermit',a:Array(12).fill(83)};
 const gonzo={id:'gonzo',n:'Gonzo',a:Array(12).fill(70)};
 const score=(sport,r)=>{
   const base=70,mult=1+(r.cmd?.id==='kermit'?.08:0)+(r.bn?.id==='gonzo'?.04:0);
   const sig={lift:r.cmd?2:0,chaos:0},syn={total:r.cmd&&r.bn?1:0};
   const muppetTeam={points:(r.cmd?4:0)+(r.bn?2:0)},benchChem={points:r.bn?3:0};
   return {rating:base*mult+sig.lift+syn.total+muppetTeam.points+benchChem.points,playerScore:base,mult,sig,syn,muppetTeam,benchChem};
 };
 const roster={d1:fighter,cmd:kermit,bn:gonzo};
 const original={...score('brawl',roster),rows:[{pos:{id:'d1',ab:'DPS',imp:1},cand:fighter,fit:75},{pos:cmd,cand:kermit,fit:83},{pos:bn,cand:gonzo,fit:70}]};
 const a=daBoxScore('brawl',original,5,'seed-a',{supportScorer:score});
 const b=daBoxScore('brawl',original,0,'seed-b',{supportScorer:score});
 const leadership=a.find(r=>r.position==='cmd'),bench=a.find(r=>r.position==='bn');
 assert.equal(leadership.support.points,12.6);
 assert.equal(bench.support.points,8.8);
 assert.equal(leadership.support.parts['MuppetForce teamwork'],4);
 assert.equal(bench.support.parts['Bench chemistry'],3);
 assert.deepEqual(leadership.stats,b.find(r=>r.position==='cmd').stats);
 assert.deepEqual(bench.stats,b.find(r=>r.position==='bn').stats);
 assert.equal(daLineupMetric(leadership,'brawl')[1],12.6);
 assert.equal(original.rows.length,3,'Do not mutate match roster');
 const specialty=daSupportImpact('brawl',{...original,commanderEffect:{percent:3}},'cmd',score);
 assert.ok(specialty.points>leadership.support.points);
 assert.ok(specialty.parts['Campaign commander specialty']>0);
 const html=daComparison('brawl',original,original,5,0,'Us','Them','seed',{supportScorer:score});
 assert.match(html,/Leadership impact \(rating pts\)/);
 assert.match(html,/MuppetForce teamwork: \+4\.00/);
 assert.match(html,/How support impact was calculated/);
});
test('legacy unsupported score data does not fabricate a support statistic',()=>{
 const roster={rating:70,rows:[{pos:{id:'cmd',ab:'CMD',coach:true},cand:{id:'x',n:'Commander',a:Array(12).fill(90)},fit:90}]};
 const row=daBoxScore('brawl',roster,0,'legacy')[0];
 assert.equal(row.support,null);
 assert.equal(row.stats[0][1],'—');
});

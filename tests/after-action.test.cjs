const test=require('node:test');
const assert=require('node:assert/strict');
const {daAllocate,daFootballBreakdown,daVolleyballPoints,daBoxScore,daUserMatches}=require('../data/after-action.js');
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

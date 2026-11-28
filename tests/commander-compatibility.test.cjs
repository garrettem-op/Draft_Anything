const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const start = html.indexOf('const COMMANDER_PHILOSOPHY =');
const end = html.indexOf('// Returns { total, links:',start);
assert.ok(start>=0 && end>start);
const fit = vm.runInNewContext(html.slice(start,end)+'\ncommanderSystemFit;');
const keys = ['spd','agi','str','siz','lep','end','tch','acc','ref','iq','clu','ldr'];
const style = {label:'Balance and Discipline',w:{agi:2,iq:2,ref:1}};
const coach = {pool:'mcu',n:'The Ancient One'};
const candidate = (pool,n,a,extra={})=>({pool,n,a,...extra});
const slot = (c,weight=1)=>({c,weight});
const flat = n=>Array(12).fill(n);
const roster = [
 slot(candidate('lotr','Námo (Mandos)',flat(99))),
 slot(candidate('lotr','Manwë',flat(99))),
 slot(candidate('dc','King Shazam',[96,76,99,95,99,98,76,78,83,64,79,78],{variantBase:'Shazam'})),
 slot(candidate('lotr','Saruman of Many Colours',[94,94,93,89,97,99,99,97,95,99,87,88],{variantBase:'Saruman'})),
 slot(candidate('actionmovies','Aslan',[96,94,99,97,99,99,97,99,97,98,98,99])),
 slot(candidate('lotr','Gandalf the White',[94,94,93,89,97,99,99,97,95,99,96,99],{variantBase:'Gandalf'}),.5)
];
test('reported Ancient One roster is a good fit and exposes each contribution',()=>{
 const r=fit(coach,style,roster,keys);
 assert.equal(r.match,'Good fit');
 assert.equal(r.philosophyKnown,6);
 assert.equal(r.members.find(m=>m.name==='King Shazam').philosophy,-1);
 assert.equal(r.members.find(m=>m.name==='Saruman of Many Colours').philosophy,-.75);
 assert.ok(r.members.find(m=>m.name==='King Shazam').contribution<0);
 assert.equal(r.members.at(-1).weight,.5);
 assert.ok(r.pts>.5 && r.pts<1.4);
});
test('perfect all-rounders are rewarded rather than treated as neutral',()=>{
 const r=fit(coach,style,[slot(candidate('unknown','Perfect',flat(99)))],keys);
 assert.equal(r.match,'Good fit'); assert.ok(Math.abs(r.pts-.7)<1e-10);
 assert.equal(r.philosophyKnown,0); assert.equal(r.philosophy,0);
});
test('weak but relatively specialized rosters do not receive positive fit',()=>{
 const a=flat(10); a[1]=a[8]=a[9]=30;
 const r=fit(coach,style,[slot(candidate('unknown','Weak',a))],keys);
 assert.equal(r.match,'Poor fit');
});
test('reinforcement weight is half an active fighter and score remains capped',()=>{
 const good=candidate('lotr','Manwë',flat(99)),bad=candidate('dc','King Shazam',flat(1));
 const equal=fit(coach,style,[slot(good),slot(bad)],keys);
 const half=fit(coach,style,[slot(good),slot(bad,.5)],keys);
 assert.ok(half.pts>equal.pts);
 assert.ok(Math.abs(half.pts)<=1.4);
 assert.equal(fit(coach,style,[],keys),null);
});
test('unknown philosophy is neutral, base identity used only absent a form-specific entry',()=>{
 const a=flat(90);
 const base=fit(coach,style,[slot(candidate('lotr','Other Gandalf form',a,{variantBase:'Gandalf'}))],keys);
 assert.equal(base.philosophy,1);
 const unknown=fit(coach,style,[slot(candidate('unknown','Gandalf',a))],keys);
 assert.equal(unknown.philosophy,0); assert.equal(unknown.philosophyKnown,0);
 const other=fit({pool:'nba',n:'Phil Jackson'},style,[slot(candidate('lotr','Manwë',a))],keys);
 assert.equal(other.philosophy,0);
});
test('different commander priorities produce different outcomes on the same roster',()=>{
 const a=flat(70); a[1]=a[8]=a[9]=99; a[2]=a[3]=a[5]=40;
 const slots=[slot(candidate('unknown','Specialist',a))];
 const skill=fit(coach,style,slots,keys);
 const strength=fit({pool:'nba',n:'Pat Riley'},{label:'Power',w:{str:2,end:2,siz:1}},slots,keys);
 assert.equal(skill.match,'Good fit'); assert.equal(strength.match,'Poor fit');
});

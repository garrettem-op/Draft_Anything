const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {daComparison}=require('../data/after-action.js');
global.esc=value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const index=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
function team(prefix, names) {
  const positions=['s','oh1','mb1','opp','oh2','lib','mb2','bn','hc'];
  return {rating:83,rows:positions.map((position,i)=>({
    pos:{id:position,ab:position.toUpperCase(),imp:1,coach:position==='hc',bench:position==='bn'},
    fit:60+i*3,
    cand:{id:prefix+':'+names[i],n:names[i],a:Array(12).fill(65+i*2)}
  }))};
}
const host=team('host',['Zeus','Tigress','Abomination','Shrek','Tarzan','Elastigirl','Beast','Timon','Homer Simpson']);
const guest=team('guest',['Zemo','Bubbles','Mister Fantastic','Tasmanian Devil','Pepper Potts','Ginny Weasley','Mantis','Luna Lovegood','Odin']);
function renderedRows(markup) {
  return [...markup.matchAll(/<tr><td class="da-side">([\s\S]*?)<\/td><th scope="row" class="da-role">([\s\S]*?)<\/th><td class="da-side">([\s\S]*?)<\/td><\/tr>/g)]
    .map(m=>({left:m[1],role:m[2],right:m[3]}));
}
test('H2H callsite seeds box scores by persistent host and guest identity',()=>{
  const line=index.split('\n').find(x=>x.includes('daComparison(d.sport,sc[me],sc[opp]'));
  assert.ok(line,'Head-to-Head result must use daComparison');
  assert.match(line,/stableSideKeys:\[me,opp\]/);
  assert.ok(!line.includes("stableSideKeys:['left','right']"));
});
test('both players see identical box-score stat lines when the columns reverse',()=>{
  const seed='same-match-CT492';
  const note='25-23, 24-26, 25-21, 25-20';
  const hostView=daComparison('volleyball',host,guest,3,1,'Norwalk','Away',seed,{
    stableSideKeys:['host','guest'],note,leftSide:0,rightSide:1
  });
  const guestView=daComparison('volleyball',guest,host,1,3,'Away','Norwalk',seed,{
    stableSideKeys:['guest','host'],note,leftSide:1,rightSide:0
  });
  const hostRows=renderedRows(hostView),guestRows=renderedRows(guestView);
  assert.equal(hostRows.length,9);
  assert.equal(guestRows.length,9);
  for(let i=0;i<9;i++){
    assert.equal(hostRows[i].role,guestRows[i].role,'same positions');
    assert.equal(hostRows[i].left,guestRows[i].right,'host player '+i+' has identical stats from either device');
    assert.equal(hostRows[i].right,guestRows[i].left,'guest player '+i+' has identical stats from either device');
  }
  // This used to fail when the box scores were seeded from the screen column.
  const wrongHostView=daComparison('volleyball',host,guest,3,1,'Norwalk','Away',seed,{note,leftSide:0,rightSide:1});
  const wrongGuestView=daComparison('volleyball',guest,host,1,3,'Away','Norwalk',seed,{note,leftSide:1,rightSide:0});
  assert.notEqual(renderedRows(wrongHostView)[1].left,renderedRows(wrongGuestView)[1].right,
    'regression reproduces the old left/right random-seed mismatch');
});
test('standard single-player reports keep their original positional seeds',()=>{
  const baseline=daComparison('volleyball',host,guest,3,1,'Norwalk','Away','ordinary-match');
  const explicit=daComparison('volleyball',host,guest,3,1,'Norwalk','Away','ordinary-match',{
    stableSideKeys:['left','right']
  });
  assert.equal(baseline,explicit);
});

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const start=html.indexOf('function renderField(sportKey, roster, o = {}) {');
const end=html.indexOf('\n// ----- Header + modal -----',start);
assert.ok(start>=0&&end>start,'renderField implementation must exist');
const source=html.slice(start,end);
const SPORTS={
  volleyball:{aspect:'1',pos:[
    {id:'s',ab:'S',nm:'Setter',x:50,y:20},
    {id:'hc',ab:'HC',nm:'Head Coach',side:true,coach:true},
    {id:'bn',ab:'BN',nm:'Bench',side:true,bench:true},
    {id:'mb2',ab:'MB',nm:'Middle 2',side:true}
  ]},
  basketball:{aspect:'1',pos:[
    {id:'pg',ab:'PG',nm:'Point Guard',x:50,y:20},
    {id:'hc',ab:'HC',nm:'Head Coach',side:true,coach:true},
    {id:'bn',ab:'BN',nm:'Bench',side:true,bench:true}
  ]}
};
const renderField=Function('SPORTS','tokenSVG','surfaceSVG','esc',
  source+'\nreturn renderField;')(SPORTS,()=>'',()=>'',x=>String(x));
test('H2H volleyball displays coach before court and once only',()=>{
 const view=renderField('volleyball',{}, {coachFirst:true,interactive:true});
 assert.match(view,/class="sideline h2h-coach-first"/);
 assert.ok(view.indexOf('data-slot="hc"')<view.indexOf('class="field "'));
 assert.ok(view.indexOf('data-slot="hc"')<view.indexOf('data-slot="bn"'));
 assert.equal((view.match(/data-slot="hc"/g)||[]).length,1);
 for(const slot of ['s','hc','bn','mb2'])assert.match(view,new RegExp('data-slot="'+slot+'"'));
 assert.match(view,/aria-label="Head Coach \(empty\)"/);
});
test('other sports and standard view preserve existing coach sideline order',()=>{
 for(const sport of ['volleyball','basketball']){
  const view=renderField(sport,{}, {interactive:true});
  assert.doesNotMatch(view,/h2h-coach-first/);
  assert.equal((view.match(/data-slot="hc"/g)||[]).length,1);
  assert.ok(view.indexOf('class="field "')<view.indexOf('data-slot="hc"'));
 }
});
test('H2H caller passes coach-first only for volleyball and uses local scroll on mobile',()=>{
 assert.match(html,/variantSlots:eligibleSlots,coachFirst:d\.sport==='volleyball'/);
 assert.match(html,/html\.draft-active \.h2h-main-court\{[^}]*overflow-y:auto/);
 assert.match(html,/html\.draft-active \.h2h-opponent-rail\{[^}]*overflow-y:auto/);
 assert.match(html,/\.h2h-main-court \.h2h-coach-first \.side-node\{/);
});

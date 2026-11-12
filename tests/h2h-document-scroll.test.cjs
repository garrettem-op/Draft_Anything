const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const css = html.slice(html.indexOf('<style>'), html.indexOf('</style>'));

test('Head-to-Head drafting unlocks document scroll without unlocking other game modes', () => {
  const expression = html.match(/const h2hScrollable = [^\n]+;/)?.[0];
  assert.ok(expression, 'Head-to-Head scroll state must be set in render()');
  const compute = new Function('S', expression + '\nreturn h2hScrollable;');
  const states = [
    ['h2h', 'room', 'drafting', true],
    ['h2h', 'room', 'powers', false],
    ['h2h', 'lobby', 'drafting', false],
    ['champ', 'room', 'drafting', false],
    ['deal', 'room', 'drafting', false],
  ];
  for (const [mode, stage, status, expected] of states) {
    assert.equal(compute({mode, h2h:{stage, contest:{status}}}), expected);
  }
  assert.match(html, /classList\.toggle\('h2h-scrollable', h2hScrollable\)/);
});

test('H2H scrollable page overrides every fixed-height and clipping ancestor', () => {
  const rules = [
    /html\.draft-active\.h2h-scrollable,\s*html\.draft-active\.h2h-scrollable body\s*\{[^}]*height:auto;[^}]*overflow-y:auto;/,
    /html\.draft-active\.h2h-scrollable \.app\s*\{[^}]*height:auto;[^}]*max-height:none;[^}]*overflow:visible;/,
    /html\.draft-active\.h2h-scrollable main\s*\{[^}]*display:block;[^}]*overflow:visible;/,
    /html\.draft-active\.h2h-scrollable \.h2h-court-layout\s*\{[^}]*height:auto;[^}]*overflow:visible;/,
    /html\.draft-active\.h2h-scrollable \.h2h-main-court\s*\{[^}]*overflow:visible;/,
  ];
  for (const rule of rules) assert.match(css, rule);
  assert.match(html, /window\.scrollTo\(scrollX,scrollY\)/);
});

test('Head-to-Head field buttons permit vertical swipes; other drafts retain their gesture handling', () => {
  assert.match(css, /\.field-wrap \.node, \.field-wrap \.side-node \{ touch-action:none; \}/);
  assert.match(css, /html\.draft-active\.h2h-scrollable \.field-wrap \.node,\s*html\.draft-active\.h2h-scrollable \.field-wrap \.side-node\s*\{\s*touch-action:pan-y;/);
  assert.match(css, /html\.draft-active\.h2h-scrollable \.h2h-main-court \.side-node\s*\{[^}]*flex-basis:auto;[^}]*min-height:42px;/);
});

test('Battle Royale renders reinforcement and commander exactly once, under the court', () => {
  const start = html.indexOf('function renderField(sportKey, roster, o = {}) {');
  const end = html.indexOf('\n// ----- Header + modal -----', start);
  assert.ok(start >= 0 && end > start);
  const SPORTS = {brawl:{aspect:1,pos:[
    {id:'tnk',ab:'TNK',nm:'Tank',x:45,y:32},
    {id:'rn',ab:'RNF',nm:'Reinforcement',side:true,bench:true},
    {id:'cmd',ab:'CMD',nm:'Commander',side:true,coach:true},
  ]}};
  const renderField = new Function('SPORTS','tokenSVG','surfaceSVG','esc',
    html.slice(start,end) + '\nreturn renderField;')(
    SPORTS,()=>'',()=>'',x=>String(x));
  const view = renderField('brawl',{}, {interactive:true});
  for (const id of ['rn','cmd']) {
    assert.equal((view.match(new RegExp('data-slot="'+id+'"','g'))||[]).length,1);
  }
  assert.ok(view.indexOf('data-slot="rn"') < view.indexOf('data-slot="cmd"'));
});

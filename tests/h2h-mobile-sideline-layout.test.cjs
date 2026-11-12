const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const css = html.slice(html.indexOf('<style>'), html.indexOf('</style>'));
const h2hCss = css.slice(css.indexOf('/* Head-to-head: one court'));

test('H2H mobile side slots override the fixed-draft 110px flex-basis', () => {
  assert.match(css, /html\\.draft-active \\.side-node\\s*\\{[^}]*flex-basis:\\s*110px/);
  assert.match(h2hCss, /@media\\(max-width:700px\\)\\s*\\{[\\s\\S]*html\\.draft-active \\.h2h-main-court \\.side-node\\s*\\{[^}]*flex:\\s*0 0 auto/);
  assert.match(h2hCss, /html\\.draft-active \\.h2h-main-court \\.side-node\\s*\\{[^}]*flex-basis:\\s*auto/);
  assert.match(h2hCss, /html\\.draft-active \\.h2h-main-court \\.side-node\\s*\\{[^}]*min-height:\\s*42px/);
});

test('H2H sideline remains inside its own scrollable region on short screens', () => {
  assert.match(h2hCss, /html\\.draft-active \\.h2h-main-court\\s*\\{[^}]*overflow-y:\\s*auto/);
  assert.match(h2hCss, /html\\.draft-active \\.h2h-main-court \\.sideline\\s*\\{[^}]*flex:/);
  assert.match(h2hCss, /html\\.draft-active \\.h2h-main-court \\.field-wrap>\\.field\\s*\\{[^}]*width:min\\(100%,29dvh\\)/);
});

test('Bench and coach are rendered as distinct sideline slots', () => {
  const start = html.indexOf('function renderField(sportKey, roster, o = {}) {');
  const end = html.indexOf('\\n// ----- Header + modal -----', start);
  assert.ok(start >= 0 && end > start);
  const SPORTS = {battle:{
    aspect:1,
    pos:[
      {id:'tnk',ab:'TNK',nm:'Tank',x:50,y:30},
      {id:'rn',ab:'RNF',nm:'Reinforcement',side:true,bench:true},
      {id:'hc',ab:'HC',nm:'Coach',side:true,coach:true}
    ]
  }};
  const renderField = Function('SPORTS','tokenSVG','surfaceSVG','esc',
    html.slice(start,end) + '\\nreturn renderField;')(SPORTS,()=>'',()=>'',String);
  const view = renderField('battle',{}, {interactive:true});
  assert.equal((view.match(/data-slot="rn"/g)||[]).length,1);
  assert.equal((view.match(/data-slot="hc"/g)||[]).length,1);
  assert.ok(view.indexOf('data-slot="rn"') < view.indexOf('data-slot="hc"'));
  assert.match(view,/Reinforcement/);
  assert.match(view,/Coach/);
});

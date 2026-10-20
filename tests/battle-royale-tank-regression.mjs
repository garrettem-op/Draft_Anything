// Run from the repository root: node tests/battle-royale-tank-regression.mjs
// Unit tests use the actual embedded app functions, not a reimplementation.
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');
const AK = ['spd','agi','str','siz','lep','end','tch','acc','ref','iq','clu','ldr'];
function extract(name) {
  const start=html.indexOf('function '+name+'(');
  assert(start >= 0, 'missing '+name);
  const open=html.indexOf('{',start);
  let depth=0;
  for(let i=open;i<html.length;i++){
    if(html[i]==='{')depth++;
    if(html[i]==='}' && --depth===0)return html.slice(start,i+1);
  }
  throw new Error('unclosed '+name);
}
const script=[
  'const AK = '+JSON.stringify(AK)+';',
  ...['TANK_OUTLIER_GAP','TANK_OUTLIER_FACTOR','TANK_ELITE_THRESHOLD','TANK_ELITE_FACTOR','TANK_PHYSICAL']
      .map(name=>html.match(new RegExp('const '+name+' = [^;]+;'))?.[0] || (()=>{throw Error('missing '+name)})()),
  extract('tankPhysical'),extract('tankFit'),
  extract('fitScore'),extract('fitFree'),
  'return {tankPhysical,tankFit,fitScore,fitFree};'
].join('\n');
const {tankPhysical,tankFit,fitScore,fitFree}=new Function(script)();
function attrs(overrides={}) {return AK.map(k=>overrides[k]??50);}
function approx(actual,want,label) {assert(Math.abs(actual-want)<1e-8,label+': '+actual+' != '+want);}
const triple=(size,str,end)=>attrs({siz:size,str,end});
approx(tankPhysical(triple(62,99,97)).value,95.06,'Sentry size outlier penalty');
assert.equal(tankPhysical(triple(62,99,97)).penalized,'siz');
approx(tankPhysical(triple(80,90,90)).value,87.3,'exact 10-point threshold, size');
approx(tankPhysical(triple(90,80,90)).value,87.3,'exact 10-point threshold, strength');
approx(tankPhysical(triple(90,90,80)).value,87.3,'exact 10-point threshold, endurance');
approx(tankPhysical(triple(80.01,90,90)).value,(80.01+90+90)/3,'no penalty below threshold');
approx(tankPhysical(triple(95,95,95)).value,97.85,'3% bonus for all three over 90');
approx(tankPhysical(triple(90,90,90)).value,90,'no bonus at exactly 90');
approx(tankPhysical(triple(91,91,91)).value,93.73,'bonus above 90');
approx(tankPhysical(triple(99,99,99)).value,99,'cap at 99');
assert.equal(tankPhysical(triple(99,99,99)).bonus,true);
const sentry=attrs({siz:62,str:99,end:97,ref:94,ldr:40});
approx(tankFit(sentry),95.007,'Sentry Tank fit (95% physical, 5% reflexes)');
const hulk=attrs({siz:98,str:99,end:99,ref:80,ldr:40});
approx(tankFit(hulk),98.05,'Hulk Tank fit (not punished for Leadership 40)');
approx(tankFit(attrs({siz:98,str:99,end:99,ref:80,ldr:99})),98.05,'Leadership 99 must not inflate Tank fit');
approx(tankFit(attrs({siz:98,str:99,end:99,ref:80,ldr:1})),98.05,'Leadership 1 must not reduce Tank fit');
approx(tankFit(attrs({siz:62,str:99,end:97,ref:94,ldr:99})),95.007,'Sentry stays fixed if leadership changes');
const pos={tank:true};
approx(fitScore(sentry,pos),tankFit(sentry),'live fit must use Tank formula');
approx(fitFree(sentry,pos),tankFit(sentry),'unbreakable signature fit must use Tank formula');
assert.equal([...html.matchAll(/tank: true, w: \{ siz: 19, end: 19, str: 19, ref: 3 \}/g)].length,2,'both Tank roles use the 95% physical / 5% reflex key weights');
assert.match(html,/function rcWeak[\s\S]*?if \(p\.tank\)/,'recap distinguishes Tank weaknesses');
assert.match(html,/if \(pos\.tank\) return \['Physical resilience', 'Reflexes'\]/,'only Tank scoring traits appear in UI');
assert.match(html,/Physical resilience counts 95%, reflexes count 5%, and leadership does not affect Tank fit/,'help text accurately describes updated model');
assert.doesNotMatch(extract('tankFit'),/indexOf\('ldr'\)/,'Tank role must not use the leadership attribute');
assert.doesNotMatch(extract('tankFactors'),/key: 'ldr'/,'Tank recap analysis must not imply leadership affects Tank role');
console.log('PASS: Tank is 95% physical + 5% reflex, independent of leadership; 3% outlier penalty, 3% elite bonus, thresholds, cap, and recap wiring.');

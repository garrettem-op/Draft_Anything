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
approx(tankFit(sentry),89.448,'Sentry Tank fit after reflex/leadership');
const pos={tank:true};
approx(fitScore(sentry,pos),tankFit(sentry),'live fit must use Tank formula');
approx(fitFree(sentry,pos),tankFit(sentry),'unbreakable signature fit must use Tank formula');
assert.equal([...html.matchAll(/tank: true, w: \{ siz: 3/g)].length,2,'both Tank roles use new model');
assert.match(html,/function rcWeak[\s\S]*?if \(p\.tank\)/,'recap distinguishes Tank weaknesses');
assert.match(html,/if \(pos\.tank\) return \['Physical resilience', 'Reflexes', 'Leadership'\]/,'show new Tank traits in UI');
console.log('PASS: 3% Tank outlier penalty, 3% all-elite bonus, thresholds, cap, scoring, and recap wiring.');

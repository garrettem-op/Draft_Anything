// Regression tests for the 2026-11-27 audit: Action Movies attributes follow the films.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const KEYS=['spd','agi','str','siz','lep','end','tch','acc','ref','iq','clu','ldr'];
const at=(a,k)=>a[KEYS.indexOf(k)];

test('Action Movies leadership follows the films, not the archetype template',()=>{
  const cx=vm.createContext({window:{}});
  vm.runInContext(read('data/new-pool-core.js'),cx);
  vm.runInContext(read('data/pools-action-movies.js'),cx);
  const entries=cx.window.DA_ADDED_POOLS.actionmovies.entries;
  assert.equal(entries.length,100);
  const a=n=>entries.find(e=>e[0]===n)[3];
  const commandFit=n=>{const x=a(n);return (4*at(x,'iq')+4*at(x,'ldr')+2*at(x,'clu'))/10;};
  assert.ok(at(a('Leonidas'),'ldr')>=95);
  assert.ok(at(a('Colonel Bagley'),'ldr')<=65);
  assert.ok(commandFit('Leonidas')>commandFit('Colonel Bagley')+20);
  assert.ok(commandFit('Katsumoto')>commandFit('Colonel Bagley')+20,'same film, opposite commanders');
  assert.ok(at(a('Iosef Tarasov'),'tch')<at(a('Leonidas'),'tch')-25,'a mob heir is not a Spartan king');
  assert.ok(at(a('Morpheus'),'tch')>=90,'a commander can also be a master fighter');
  // Every changed character has its film evidence on record.
  const doc=read('docs/action-movies-attribute-review.md');
  const reviewed=[...doc.matchAll(/^\| ([^|]+) \| `([^`]+)` \| (.+) \|$/gm)];
  assert.ok(reviewed.length>=55);
  for(const [,name,changes,evidence] of reviewed){
    const attrs=a(name.trim());
    assert.ok(evidence.trim().length>30,name+' needs evidence');
    for(const pair of changes.split(',')){
      const [k,v]=pair.split('=');
      assert.equal(at(attrs,k),Number(v),name+' '+k);
    }
  }
});

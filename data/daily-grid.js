/* Draft Anything: deterministic daily 3x3 character puzzle and persistent archive. No paid AI calls. */
const DailyGrid = (function dailyGridFactory() {
  'use strict';
  const START = '2026-11-09';
  const PREFIX = 'da.daily-grid.v1.';
  // Stable canonical pool order. Add future pools in a versioned schedule so old puzzle dates never shift.
  const POOL_IDS = Object.freeze(['nba', 'mcu', 'toons', 'muppets', 'games', 'pokemon', 'starwars']);
  // Minimum thresholds chosen against the original roster: every pool has at least eight answers per category.
  const TRAITS = Object.freeze([
    {key:'spd', min:70, label:'Speed'},
    {key:'agi', min:75, label:'Agility'},
    {key:'str', min:75, label:'Strength'},
    {key:'siz', min:70, label:'Size'},
    {key:'lep', min:70, label:'Leap'},
    {key:'end', min:75, label:'Stamina'},
    {key:'tch', min:75, label:'Touch'},
    {key:'acc', min:70, label:'Accuracy'},
    {key:'ref', min:70, label:'Reflexes'},
    {key:'iq', min:75, label:'Game IQ'},
    {key:'clu', min:70, label:'Clutch'},
    {key:'ldr', min:70, label:'Leadership'}
  ]);
  const traitByKey = Object.fromEntries(TRAITS.map(x => [x.key, x]));
  function dayValue(date) {
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NaN;
    const n = Date.parse(date + 'T00:00:00Z');
    return Number.isFinite(n) && new Date(n).toISOString().slice(0,10) === date ? Math.floor(n / 86400000) : NaN;
  }
  function today(now) {
    const parts = new Intl.DateTimeFormat('en-US', {timeZone:'America/New_York', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(now || new Date());
    const part = key => parts.find(p => p.type === key).value;
    return part('year') + '-' + part('month') + '-' + part('day');
  }
  function daysSinceStart(date) { return dayValue(date) - dayValue(START); }
  function validDay(date, currentDate) {
    const n=daysSinceStart(date), max=daysSinceStart(currentDate || today());
    return Number.isInteger(n) && n >= 0 && n <= max;
  }
  function isoDay(n) { return new Date(dayValue(START)*86400000 + n*86400000).toISOString().slice(0,10); }
  function combinations(a) {
    const output=[];
    for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)for(let k=j+1;k<a.length;k++)output.push([a[i],a[j],a[k]]);
    return output;
  }
  function permute(items,seed) {
    const copy=items.slice();
    let x=(seed>>>0)||1;
    for(let i=copy.length-1;i>0;i--) {
      x ^= x<<13; x ^= x>>>17; x ^= x<<5;
      const j=(x>>>0)%(i+1);
      [copy[i],copy[j]]=[copy[j],copy[i]];
    }
    return copy;
  }
  const POOL_TRIPLES=combinations(POOL_IDS), TRAIT_TRIPLES=combinations(TRAITS);
  function puzzle(day) {
    const n=daysSinceStart(day);
    if(!Number.isInteger(n) || n<0) return null;
    // Coprime increments guarantee a new combination every day (1,540 distinct pairs).
    return {version:1,date:day,number:n+1,
      rows:permute(POOL_TRIPLES[(n*17+11)%POOL_TRIPLES.length],(n+101)*2246822519),
      cols:permute(TRAIT_TRIPLES[(n*73+37)%TRAIT_TRIPLES.length],(n+47)*3266489917).map(x=>({key:x.key,min:x.min,label:x.label}))
    };
  }
  function recordFor(day) {
    const fallback={puzzle:puzzle(day),cells:{}};
    if(!fallback.puzzle) return fallback;
    let saved=null;
    try { saved=JSON.parse(localStorage.getItem(PREFIX+day)||'null'); } catch {}
    if(!saved || !saved.puzzle || saved.puzzle.date!==day || !Array.isArray(saved.puzzle.rows) || !Array.isArray(saved.puzzle.cols) || saved.puzzle.rows.length!==3 || saved.puzzle.cols.length!==3 || !saved.cells || typeof saved.cells!=='object') return fallback;
    return {puzzle:saved.puzzle,cells:saved.cells};
  }
  function persist(day,record) { try { localStorage.setItem(PREFIX+day,JSON.stringify(record)); } catch {} }
  function score(record) {
    const cells=Object.values(record.cells||{});
    const attempts=cells.length, correct=cells.filter(x=>x && x.ok).length;
    return {attempts,correct,missed:attempts-correct,remaining:9-attempts,complete:attempts>=9};
  }
  function evaluate(puzzle,index,candidate) {
    if(!puzzle || !Number.isInteger(index) || index<0 || index>8 || !candidate || !Array.isArray(candidate.a)) return null;
    const pool=puzzle.rows[Math.floor(index/3)], trait=puzzle.cols[index%3];
    const attrIndex=({spd:0,agi:1,str:2,siz:3,lep:4,end:5,tch:6,acc:7,ref:8,iq:9,clu:10,ldr:11})[trait.key];
    const rating=candidate.a[attrIndex];
    const poolOk=candidate.pool===pool;
    const ok=poolOk && Number.isFinite(rating) && rating>=trait.min;
    const poolTitle=(typeof POOLS!=='undefined' && POOLS[pool]?.short) || pool.toUpperCase();
    const reason=ok ? 'Correct · '+trait.label+' '+rating+' / '+trait.min+' required'
      : !poolOk ? 'Wrong pool · requires '+poolTitle
      : trait.label+' '+(Number.isFinite(rating)?rating:'unrated')+' · requires '+trait.min+'+';
    return {id:candidate.id,name:candidate.n,pool:candidate.pool,ok,reason,day:puzzle.date};
  }
  function attempt(record,index,candidate) {
    if(!record || !record.puzzle || !Number.isInteger(index) || index<0 || index>8) return {accepted:false,reason:'Select an empty square.'};
    if(record.cells[index]) return {accepted:false,reason:'This square has already been played.'};
    if(!candidate || typeof candidate.id!=='string') return {accepted:false,reason:'Select a character.'};
    const slug=name=>String(name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-');
    if(Object.values(record.cells).some(x=>x && slug(x.name)===slug(candidate.n))) return {accepted:false,reason:'You already used this character. Pick someone else.'};
    const result=evaluate(record.puzzle,index,candidate);
    if(!result) return {accepted:false,reason:'Invalid guess.'};
    record.cells[index]=result;
    return {accepted:true,result};
  }
  function longDate(day) {
    return new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(day+'T12:00:00Z'));
  }
  function newState() { return {date:today(),target:null,query:'',archiveOpen:false,archivePage:0}; }
  function candidates(query) {
    const term=String(query||'').trim().toLowerCase();
    if(term.length<2)return [];
    const all=[];
    for(const id of POOL_IDS) for(const c of getCands(id)) if(c.n.toLowerCase().includes(term)) all.push(c);
    return all.sort((a,b)=>{
      const aStart=a.n.toLowerCase().startsWith(term)?0:1;
      const bStart=b.n.toLowerCase().startsWith(term)?0:1;
      return aStart-bStart || a.n.localeCompare(b.n) || a.pool.localeCompare(b.pool);
    }).slice(0,36);
  }
  function boardHTML(record,state) {
    const p=record.puzzle,sc=score(record),selected=state.target;
    const rowLabel=id=>getPool(id)?.short || getPool(id)?.name || id.toUpperCase();
    const axisTitle=c=>c.label+' '+c.min+'+';
    let html='<div class="dg-board" role="group" aria-label="Nine-square daily character grid">';
    html+='<div class="dg-corner"><span>POOL</span><span>TRAIT →</span></div>';
    for(const c of p.cols)html+='<div class="dg-axis dg-col" title="'+esc(axisTitle(c))+'">'+esc(c.label)+'<small>'+c.min+'+</small></div>';
    for(let r=0;r<3;r++) {
      html+='<div class="dg-axis dg-row" title="'+esc(rowLabel(p.rows[r]))+'">'+esc(rowLabel(p.rows[r]))+'</div>';
      for(let col=0;col<3;col++) {
        const i=r*3+col,cell=record.cells[i],active=selected===i,cls=cell?(cell.ok?'dg-good':'dg-bad'):'dg-empty';
        html+='<button type="button" class="dg-cell '+cls+(active?' dg-current':'')+'" data-act="grid-cell" data-i="'+i+'" aria-label="'+esc(rowLabel(p.rows[r])+' and '+axisTitle(p.cols[col])+(cell?', '+(cell.ok?'correct':'incorrect')+' answer '+cell.name:', empty'))+'" aria-pressed="'+active+'">';
        if(cell)html+='<b class="dg-indicator" aria-hidden="true">'+(cell.ok?'✓':'×')+'</b><strong>'+esc(cell.name)+'</strong>';
        else html+='<span class="dg-add" aria-hidden="true">+</span><small>Pick</small>';
        html+='</button>';
      }
    }
    html+='</div>';
    const status=sc.complete?'<b>Grid complete</b>':'<b>'+sc.remaining+' '+(sc.remaining===1?'guess':'guesses')+' left</b>';
    return '<div class="dg-status"><span>'+status+' · '+sc.correct+'/9 correct</span><span>One attempt per square · No repeats</span></div>'+html;
  }
  function pickerHTML(record,state) {
    if(state.target==null)return '<div class="dg-help panel"><b>How to play</b><p>Select a square and search the existing talent pools for someone who matches both the row and column. You have one guess per square. A wrong answer locks it. Characters cannot be reused.</p></div>';
    const i=state.target,c=record.cells[i],p=record.puzzle,row=getPool(p.rows[Math.floor(i/3)])?.short||p.rows[Math.floor(i/3)],col=p.cols[i%3];
    if(c)return '<div class="dg-help panel"><div class="row" style="justify-content:space-between"><b>'+esc(c.name)+'</b><button class="btn small" data-act="grid-close">Close</button></div><p class="'+(c.ok?'dg-yes':'dg-no')+'">'+esc(c.reason)+'</p></div>';
    const results=candidates(state.query);
    return '<div class="dg-picker panel"><div class="row" style="justify-content:space-between"><b>'+esc(row)+' × '+esc(col.label)+' '+col.min+'+</b><button class="btn small" data-act="grid-close">Cancel</button></div>'
      +'<label class="field-label" for="dg-query"><span>Find a character</span><input id="dg-query" type="text" autocomplete="off" placeholder="Type at least 2 letters..." data-input="grid-query" value="'+esc(state.query)+'"></label>'
      +'<p class="note">Guesses are final. The list does not filter by eligibility.</p>'
      +(state.query.trim().length<2?'<p class="note">Search all seven original talent pools.</p>':results.length
        ?'<div class="dg-results">'+results.map(c=>'<button class="dg-result" data-act="grid-guess" data-cid="'+esc(c.id)+'" type="button">'+avatar(c)+'<span class="dg-result-copy"><b>'+esc(c.n)+'</b><small>'+esc(getPool(c.pool)?.short||c.pool)+'</small></span><span aria-hidden="true">Select</span></button>').join('')+'</div>'
        :'<p class="note">No matching characters.</p>')+'</div>';
  }
  function archiveHTML(state,current) {
    if(!state.archiveOpen)return '';
    const total=daysSinceStart(current),page=Math.max(0,state.archivePage||0),size=30;
    const maxPage=Math.floor(Math.max(0,total-1)/size);
    const safePage=Math.min(page,maxPage);
    if(safePage!==state.archivePage)state.archivePage=safePage;
    let items='';
    for(let i=total-1-safePage*size;i>=Math.max(0,total-(safePage+1)*size);i--) {
      const day=isoDay(i),s=score(recordFor(day)),active=state.date===day;
      const label=s.attempts ? s.correct+'/9'+(s.complete?' complete':' · in progress') : 'Not played';
      items+='<button type="button" class="dg-history" data-act="grid-day" data-date="'+day+'" aria-pressed="'+active+'"><span><b>'+esc(longDate(day))+'</b><small>Grid #'+(i+1)+'</small></span><span>'+esc(label)+'</span></button>';
    }
    return '<div class="panel dg-archive"><div class="row" style="justify-content:space-between"><h3 class="h">Previous grids</h3><span class="note">Available since '+esc(longDate(START))+'</span></div>'
     +(items||'<p class="note">Earlier grids appear after the first day.</p>')
     +'<div class="row dg-pages"><button class="btn small" data-act="grid-newer" '+(!safePage?'disabled':'')+'>Newer</button><span class="note">Page '+(safePage+1)+' of '+(maxPage+1)+'</span><button class="btn small" data-act="grid-older" '+(safePage>=maxPage?'disabled':'')+'>Older</button></div></div>';
  }
  function render(state) {
    const current=today();
    if(!validDay(state.date,current)) { state.date=current;state.target=null;state.query=''; }
    const record=recordFor(state.date),sc=score(record),isToday=state.date===current;
    return '<section class="dg-shell">'
      +'<div class="mode-intro panel"><b>Daily Grid</b><span>One shared nine-square puzzle each day, inspired by intersection trivia. Choose a character who satisfies both clues. New puzzles arrive at midnight Eastern.</span></div>'
      +'<div class="dg-head"><div><div class="eyebrow">Grid #'+record.puzzle.number+' · '+esc(isToday?'Today':'Archive')+'</div><h2 class="h">'+esc(longDate(state.date))+'</h2></div><div class="row"><button class="btn small" data-act="grid-today" '+(isToday?'disabled':'')+'>Today</button><button class="btn small" data-act="grid-archive" aria-pressed="'+state.archiveOpen+'">'+(state.archiveOpen?'Hide archive':'Past grids')+'</button><button class="btn small" data-act="grid-share" '+(!sc.attempts?'disabled':'')+'>Share</button></div></div>'
      +boardHTML(record,state)+pickerHTML(record,state)+archiveHTML(state,current)+'</section>';
  }
  function choose(state,id) {
    if(!validDay(state.date))return {accepted:false,reason:'That day is not available.'};
    const record=recordFor(state.date),candidate=POOL_IDS.flatMap(pool=>getCands(pool)).find(x=>x.id===id);
    const answer=attempt(record,state.target,candidate);
    if(answer.accepted) {persist(state.date,record);state.target=null;state.query='';}
    return answer;
  }
  function shareText(day) {
    const record=recordFor(day),s=score(record);
    return 'Draft Anything · Daily Grid #'+record.puzzle.number+' ('+day+')\n'
      +[0,1,2].map(r=>[0,1,2].map(c=>{const answer=record.cells[r*3+c];return answer?(answer.ok?'🟩':'🟥'):'⬜';}).join('')).join('\n')
      +'\n'+s.correct+'/9 correct · '+s.attempts+'/9 played';
  }
  return {START,POOL_IDS,TRAITS,today,validDay,isoDay,daysSinceStart,puzzle,recordFor,score,evaluate,attempt,newState,render,choose,shareText,longDate};
})();
if (typeof module !== 'undefined' && module.exports) module.exports = DailyGrid;

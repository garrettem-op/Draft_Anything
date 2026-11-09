/* Draft Anything: author-controlled new talent pools.
   Each record is a human-curated starting point, not an AI-generated fact.
   Numerical attributes are PROVISIONAL archetype estimates on the game's
   existing 1–99 scale until character-by-character research is complete.
   Format: Name | short description | archetype | group,group | key=value,...
   Claude's eventual descriptive research lives in separate lore files. */
(function(g){
  'use strict';
  const A=['spd','agi','str','siz','lep','end','tch','acc','ref','iq','clu','ldr'];
  const ARCH=Object.freeze({
    civilian:[53,54,51,53,49,53,59,49,55,65,57,56],
    child:[58,63,34,32,57,47,60,54,64,61,57,38],
    athlete:[83,84,83,73,83,83,76,73,85,69,82,73],
    fighter:[81,86,82,69,82,86,83,84,89,76,86,77],
    assassin:[86,93,76,60,87,86,92,94,96,83,91,67],
    tactician:[67,72,64,64,65,72,87,83,82,97,91,96],
    genius:[61,63,50,56,55,62,88,82,70,99,77,83],
    armored:[85,80,90,79,90,89,87,94,89,93,84,86],
    cyborg:[89,87,92,80,91,91,86,92,93,90,84,84],
    robot:[83,77,87,68,82,95,82,95,94,89,87,76],
    speedster:[99,99,67,59,99,96,91,89,99,89,93,76],
    flyer:[97,92,91,75,98,94,83,92,92,82,89,83],
    metahuman:[91,90,93,81,94,93,84,89,93,83,87,82],
    powerhouse:[86,76,99,95,92,98,65,78,83,64,91,78],
    titan:[78,66,99,99,84,99,58,71,79,72,86,83],
    aquatic:[91,88,94,87,90,97,79,83,89,80,87,89],
    mage:[83,88,55,54,87,82,94,92,88,96,88,82],
    archmage:[92,91,73,65,96,93,98,97,95,99,97,96],
    mystic:[89,89,80,68,93,91,92,94,94,95,91,90],
    psychic:[82,78,61,60,90,82,96,93,93,96,85,78],
    cosmic:[98,96,99,90,99,99,95,99,99,95,97,95],
    deity:[96,94,99,97,99,99,97,99,97,98,98,98],
    commander:[67,72,66,66,65,78,83,86,81,96,95,99],
    hobbit:[63,78,40,28,66,77,77,68,77,74,93,73],
    dwarf:[66,71,83,49,59,92,81,81,77,79,90,85],
    elf:[88,95,81,70,92,93,97,98,99,93,96,86],
    elflord:[94,98,92,75,96,98,99,99,99,98,98,97],
    numenorean:[77,82,87,83,76,89,85,87,87,90,92,89],
    orc:[70,66,72,64,66,68,55,63,71,48,59,56],
    troll:[54,49,93,92,57,89,40,47,50,38,69,40],
    dragon:[90,79,99,99,96,99,62,88,85,82,93,91],
    balrog:[91,84,99,98,94,99,81,91,93,87,95,91],
    maia:[94,94,93,89,97,99,96,97,95,97,96,95],
    vala:[99,99,99,99,99,99,99,99,99,99,99,99],
    wizardStudent:[72,75,47,51,73,71,84,81,82,77,76,63],
    wizard:[73,76,52,57,75,77,91,90,85,88,85,79],
    auror:[83,84,65,63,83,85,95,95,94,89,92,83],
    darkWizard:[83,84,59,61,84,87,96,95,92,94,91,87],
    wizardMaster:[84,87,63,66,88,93,98,98,97,99,98,96],
    elfServant:[80,86,48,31,90,78,94,90,89,88,91,64],
    magicalBeast:[83,80,85,88,79,88,52,61,83,54,75,54],
    monstrousBeast:[91,76,99,99,90,98,52,80,77,56,83,71]
  });
  const EMOJI=Object.freeze({civilian:'',child:'',athlete:'',fighter:'',assassin:'',tactician:'',genius:'',armored:'',cyborg:'',robot:'',speedster:'',flyer:'',metahuman:'',powerhouse:'',titan:'',aquatic:'',mage:'',archmage:'',mystic:'',psychic:'',cosmic:'',deity:'',commander:'',hobbit:'',dwarf:'',elf:'',elflord:'',numenorean:'',orc:'',troll:'',dragon:'',balrog:'',maia:'',vala:'',wizardStudent:'',wizard:'',auror:'',darkWizard:'',wizardMaster:'',elfServant:'',magicalBeast:'',monstrousBeast:''});
  function register(id,name,short,blurb,raw){
    if(!/^[a-z][a-z0-9-]*$/.test(id)||g.DA_ADDED_POOLS?.[id])throw Error('Invalid or duplicated pool '+id);
    const seen=new Set();
    const entries=String(raw).trim().split(/\n+/).map((line,i)=>{
      const parts=line.split('|').map(x=>x.trim());
      if(parts.length<3||parts.length>5)throw Error(id+' invalid line '+(i+1));
      const [character,description,archetype,taxonomy='',adjustments='']=parts;
      if(!character||!description||seen.has(character))throw Error(id+' duplicate or empty character '+character);
      const base=ARCH[archetype];
      if(!base)throw Error(id+' unknown profile for '+character+': '+archetype);
      seen.add(character);
      const score=base.slice();
      if(adjustments)for(const expr of adjustments.split(',')){
        const [key,v]=expr.trim().split('=').map(x=>x.trim());
        const ai=A.indexOf(key),number=Number(v);
        if(ai<0||!Number.isInteger(number)||number<1||number>99)throw Error(id+' bad attribute '+character+':'+expr);
        score[ai]=number;
      }
      return [character,EMOJI[archetype]||'',description,score,taxonomy?taxonomy.split(',').map(x=>x.trim()).filter(Boolean):[],archetype];
    });
    g.DA_ADDED_POOLS[id]={id,name,short,blurb,entries};
    return entries.length;
  }
  g.DA_ADDED_POOLS=Object.create(null);
  g.DA_REGISTER_POOL=register;
})(window);

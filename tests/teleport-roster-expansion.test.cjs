const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ability=require('../data/character-abilities.js');
const ids=[
  "harrypotter:Narcissa Malfoy",
  "harrypotter:Remus Lupin",
  "harrypotter:Kingsley Shacklebolt",
  "harrypotter:Sirius Black",
  "mcu:Electro",
  "games:Sora",
  "games:Sonic the Hedgehog",
  "pokemon:Gengar",
  "toons:Bugs Bunny",
  "dc:Perpetua",
  "dc:Circe",
  "dc:Swamp Thing",
  "dc:Trigon",
  "dc:Dream of the Endless",
  "dc:Ares (DC)",
  "games:Bowser",
  "games:Dante",
  "games:Ryu",
  "mcu:Thor",
  "mcu:Odin",
  "mcu:Cassandra Nova",
  "mcu:Doctor Doom",
  "harrypotter:Winky",
  "harrypotter:Yusuf Kama",
  "harrypotter:Bill Weasley",
  "harrypotter:Percy Weasley",
  "harrypotter:Charlie Weasley"
];
const ctx=vm.createContext({S:{campaign:{history:[],roster:{}}},KnowledgeEngine:{has:()=>false},characterAbilityTags:ability.characterAbilityTags});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../data/campaign.js'),'utf8'),ctx);
test('all newly reviewed teleport picks have evidence and qualify for both sides',()=>{for(const id of ids){const [pool,n]=id.split(/:(.*)/s);const c={id,pool,n};assert.ok(ability.characterAbilityTags(c).includes('teleport'),id);assert.ok(ability.characterAbilityEvidence(c,'teleport').source,id);ctx.c=c;for(const side of ['player','cpu']){ctx.side=side;assert.equal(vm.runInContext("campaignAllowed(c,'teleport',null,side)",ctx),true,id);}}});
test('conditional movement grants retain limits and do not qualify mere speed',()=>{for(const id of ['pokemon:Gengar','games:Ryu','games:Sonic the Hedgehog','toons:Bugs Bunny','mcu:Thor','mcu:Cassandra Nova']){const [pool,n]=id.split(/:(.*)/s);assert.ok(ability.characterAbilityEvidence({pool,n},'teleport').limitation,id);}for(const [pool,n] of [['mcu','Mantis'],['dc','The Flash (Barry Allen)'],['games','Not A Roster Character']])assert.ok(!ability.characterAbilityTags({pool,n})?.includes('teleport'),n);});

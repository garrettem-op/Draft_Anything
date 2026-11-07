/* Evidence-backed abilities. Curated by character AND universe, not a substring
   match. A power can qualify in multiple thematic Campaign challenges. This table
   supplements legacy hand-authored tags and is intended to grow during audits.
   Avoid inferring powers merely from high numerical ratings or generic descriptions.
   Evidence is deliberately NOT shown in the pre-submission picker, because Campaign
   is intended to test the player's knowledge. */
const CHARACTER_ABILITIES = Object.freeze({
  'toons:Katara': [
    {tag:'healing', kind:'heals-others-and-self', feat:'Waterbending can heal physical injuries; Katara healed Aang and other wounded allies.', source:'https://avatar.fandom.com/wiki/Healing'},
    {tag:'ice', kind:'elemental-control', feat:'Advanced waterbending includes freezing and manipulating ice.', source:'https://avatar.fandom.com/wiki/Waterbending'},
  ],
  'mcu:Ajak': [
    {tag:'healing', kind:'heals-others', feat:'The Prime Eternal channels cosmic energy to heal humans, animals and fellow Eternals.', source:'https://d23.com/meet-the-characters-of-marvel-studios-eternals/'},
    {tag:'psychic', kind:'telepathic-communication', feat:'Ajak communicates telepathically with the Celestials.', source:'https://d23.com/meet-the-characters-of-marvel-studios-eternals/'},
  ],
  'starwars:Grogu': [
    {tag:'healing', kind:'heals-others', feat:'Grogu uses Force healing on Greef Karga after he is wounded.', source:'https://www.starwars.com/news/the-mandalorian-and-grogu-everything-we-know'},
    {tag:'psychic', kind:'telekinesis', feat:'Grogu uses the Force to lift a mudhorn.', source:'https://www.starwars.com/news/the-mandalorian-and-grogu-everything-we-know'},
  ],
  'mcu:Abomination': [
    {tag:'healing', kind:'regeneration', feat:'Emil Blonsky has an accelerated healing factor after gamma transformation.', source:'https://hulk.fandom.com/wiki/Abomination'},
  ],
  'starwars:Rey': [
    {tag:'healing', kind:'heals-others', feat:'Rey uses Force healing on the injured vexis and later on Kylo Ren.', source:'https://www.starwars.com/databank/rey'},
  ],
  'starwars:Kylo Ren': [
    {tag:'healing', kind:'heals-others', feat:'As Ben Solo, he transfers life energy through the Force to heal Rey.', source:'https://www.starwars.com/databank/kylo-ren'},
  ],
  'starwars:IG-11': [
    {tag:'healing', kind:'medical-care', feat:'After reprogramming, IG-11 serves as a nurse droid.', source:'https://www.starwars.com/news/kuiil-ig-11'},
  ],
  'mcu:Druig': [
    {tag:'psychic', kind:'mind-control', feat:'Druig can control other people\'s minds using his cosmic energy.', source:'https://d23.com/meet-the-characters-of-marvel-studios-eternals/'},
  ],
  'mcu:Sprite': [
    {tag:'stealth', kind:'invisibility', feat:'Sprite can make herself and others invisible.', source:'https://d23.com/meet-the-characters-of-marvel-studios-eternals/'},
  ],
  'mcu:Phastos': [
    {tag:'tech', kind:'technopathy', feat:'Phastos creates and communicates with advanced machinery.', source:'https://d23.com/meet-the-characters-of-marvel-studios-eternals/'},
  ],
});
function characterAbilityEvidence(candidate, tag) {
  if (!candidate || !candidate.pool || !candidate.n) return null;
  return (CHARACTER_ABILITIES[candidate.pool + ':' + candidate.n] || []).find(x => x.tag === tag) || null;
}
if (typeof module !== 'undefined' && module.exports) module.exports = {CHARACTER_ABILITIES,characterAbilityEvidence};

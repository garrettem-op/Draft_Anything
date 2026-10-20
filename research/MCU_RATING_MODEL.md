# Evidence-based talent-pool ratings: MCU pilot (v0.1)

## Scope and status
The MCU pool has 143 entries. This is the methodology and evidence schema, now supported by draft profiles for all 143 characters. The owner approved deployment of provisional ratings before scene-by-scene verification. The same methodology will apply to NBA, cartoons, Muppets and future pools.

## Rating contract
The game's attributes, in exact array order: speed (spd), agility (agi), strength (str), size/reach (siz), leap (lep), stamina/durability (end), touch/dexterity (tch), accuracy (acc), reflexes (ref), tactical/game IQ (iq), clutch/composure (clu), leadership (ldr). Integer 1–99. Ratings represent *potential to perform a physical team sport* under the character's standard, repeatable equipment and powers, not a raw combat-power leaderboard.

Maintain two separate scales:
- **Power tier** (descriptive only): baseline human, elite human, enhanced, superhuman, high superhuman, planetary/cosmic, reality/abstract. Never convert tier directly into all 12 attributes.
- **Game attributes** (12 distinct sport-specific capabilities): each separately justified with evidence.

Calibration: 50 typical adult human; 65 trained amateur; 75 strong professional; 85 exceptional world-class; 90 historically elite human; 95 demonstrably superhuman; 99 extreme, repeatable ability. A cosmic being can have 99 strength but 40 leadership; magic is not automatically hand-eye coordination. Character height/reach remains distinct from ability to grow or shapeshift, which requires a condition note.

## Evidence and source policy
1. MCU film/series onscreen events, with title, episode if applicable, opponent, outcome, circumstances. Highest priority for MCU version.
2. Marvel official onscreen profiles and Marvel Studios material.
3. Comics primary issues and official Marvel comics profiles: valuable secondary context; **never silently transfer a comics-only feat to the MCU incarnation**.
4. Official Marvel handbooks / Power Grid (six categories, 1–7) for cross-checking only. Grid intelligence is not game IQ; grid fighting skill is not touch; energy projection is not throwing accuracy.
5. Third-party wikis and community discussions for leads only, subject to primary-source verification.

Every claim records: source URL or work reference, universe (MCU/comics), event, direct/indirect observation, equipment/form, reliability (A direct onscreen, B official secondary, C comics corroboration, D uncertain), and confidence. Flag disputed feats and contradictory portrayals. No invented episode or citation.

## Per-character record schema
```json
{
  "id": "stable-existing-pool-name",
  "version": "MCU standard portrayal / explicit equipment",
  "aliases": [],
  "powers": [],
  "limits": [],
  "feats": [{"event":"","source":"","universe":"MCU","condition":"","attribute_implications":{},"confidence":"A"}],
  "wins": [{"opponent":"","context":"","outcome":"","source":"","contribution":"solo/team/conditional"}],
  "losses": [{"opponent":"","context":"","outcome":"","source":"","reason":"outmatched/countered/surprised/restrained/other"}],
  "comic_context": [{"claim":"","source":"","transfer_to_mcu":false}],
  "scores": {"spd":null,"agi":null,"str":null,"siz":null,"lep":null,"end":null,"tch":null,"acc":null,"ref":null,"iq":null,"clu":null,"ldr":null},
  "score_rationales": {"spd":"","agi":"","str":"","siz":"","lep":"","end":"","tch":"","acc":"","ref":"","iq":"","clu":"","ldr":""},
  "confidence": {"spd":null,"agi":null,"str":null,"siz":null,"lep":null,"end":null,"tch":null,"acc":null,"ref":null,"iq":null,"clu":null,"ldr":null},
  "source_urls": [],
  "review_status": "unresearched|researched|verified|approved"
}
```

## Scoring process
1. Establish *identity and version* (e.g. Hulk vs Bruce Banner vs Smart Hulk are separate entries).
2. Assemble direct feats, weaknesses, wins and losses; distinguish personal performance from teammates, equipment, Infinity Stones, narrative one-offs.
3. Build an opponent graph with contextual edges, **not** transitive rankings: A beating B and B beating C does not prove A beats C. Weight solo decisive wins more than assisted or conditional outcomes.
4. For each attribute set a baseline from directly observed capability, then compare with benchmark characters and evidence. Track source reliability, repeatability, contextual applicability and uncertainty. Do not average raw comic Power Grid scores.
5. Evaluate contradictions; choose the repeatable *standard* form, not temporary peak form. Retain peak form as a separate conditional record.
6. Peer-review outliers and relative order, especially character variants. Test how rankings change for positions across each sport.
7. After owner-authorized release, continue verifying source claims and refine existing 12-value MCU arrays, preserving names and IDs, and invalidate cached role rankings if updating in a running app.


## Confirmed game rule: full powers permitted
**Decision:** All characters may use their standard, repeatable supernatural powers during sports, including magic, portals, flight, telekinesis, shapeshifting, and super-speed. This rule applies to every pool.

- Judge **effective on-field capability**, not unpowered human biomechanics. A portal may support speed/positioning and accuracy; telekinesis can support touch, accuracy, and reach.
- Distinguish effects: teleportation is near-instant relocation, but not necessarily faster reaction time; magical shielding boosts defensive endurance, not necessarily muscle strength.
- Standard personal equipment and artifacts are permitted if normally carried in the chosen version; temporary or borrowed Infinity Stones and one-off cosmic enhancements require explicit variant tags.
- Score based on reliable, controllable, repeatable feats. Keep concentration, preparation time, range, energy costs, counters, and demonstrated failures as real limitations.
- Keep the 1–99 scale comparable across pools. A powered 99 means a demonstrably extreme advantage; don't give 99 to every category just because a character is cosmic.
- This is a fictional unrestricted-powers sports simulation; conventional league rules against outside interference or unusual movement do not suppress powers.

Source example: Marvel documents Strange's portals, barriers, astral projection, Cloak of Levitation and Time Stone as distinct capabilities and equipment; each affects different attributes. https://www.marvel.com/characters/doctor-strange-stephen-strange/on-screen

## Evidence-to-sports mapping
- Flight: improves effective movement speed and leap/vertical mobility under the unrestricted-powers rules; it does not imply quick hand skills.
- Teleportation: distinguish instantaneous relocation from straight-line speed and reaction speed; score its effective sports utility under the unrestricted-powers rule.
- Telekinesis: can enhance touch and accuracy if shown controlling objects precisely, but do not equate large-object manipulation with fine motor precision.
- Invulnerability: improves endurance/durability, not automatically stamina, clutch or leadership.
- Combat tactics: may support IQ and reflexes; coaching, reading formations and team decisions need separate evidence.
- Leadership: shown ability to coordinate, inspire and make decisions, not title/rank alone.
- Clutch: repeated performance under high stakes, not a single dramatic victory.

## Pilot evidence notes (not yet numeric ratings)
**Wanda Maximoff / Scarlet Witch:** Marvel's official onscreen overview establishes Avengers involvement and the Multiverse of Madness narrative. Her chaos magic supports extremely high *power potential* and precision with demonstrated telekinesis, but her vulnerability to emotional manipulation and unstable decisions should be considered for clutch/leadership separately. Source: https://www.marvel.com/characters/scarlet-witch-wanda-maximoff/ . Avoid assigning speed/strength 99 merely because of reality manipulation.

**Stephen Strange / Doctor Strange:** Marvel's onscreen report documents binding spells, shields, astral projection, portals, the Cloak of Levitation, and Time Stone use. Time Stone feats must be tagged equipment/era dependent; teleportation should not automatically set running speed 99. Source: https://www.marvel.com/characters/doctor-strange-stephen-strange/on-screen . His strategy and technical precision require independent sport-transfer judgments.

## Quality gates
No score goes live without: at least two grounded relevant pieces of evidence where available; documented counterexamples; all 12 score rationales; source links; variant/equipment assumptions; confidence; a peer-comparison pass. For obscure supporting characters, lower confidence and do not fabricate feats. All changes are reviewable and reversible in version control.

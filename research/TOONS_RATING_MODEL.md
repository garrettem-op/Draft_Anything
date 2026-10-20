# Cartoon character ratings — evidence framework

**Pool:** 104 animated characters in Draft Anything (`POOLS.toons`).  
**Game rule:** Standard repeatable supernatural abilities, cartoon-physics resiliency, magic, elemental bending, portals, shapeshifting and normally carried personal equipment are permitted.

## Scope
Research was prepared for every existing cartoon character. Each profile records named source cartoons or movies, demonstrated powers and feats, weaknesses/defeats, effective sports utility, 12 attribute ratings (1–99), estimated power tier and variant. Each attribute has a brief rationale in `TOONS_ALL_104_PROFILES.json`. Numerical rankings are creative judgments derived from primary works and subject to revision, **not official studio statistics**.

## Source hierarchy and confidence
1. Named on-screen episode/movie actions and franchise-specific continuity; strongest evidence once the precise scene is checked.
2. Studio/channel official character descriptions and videos (e.g. Avatar Studios, Nickelodeon, Popeye.com, Adult Swim).
3. Known recurring abilities observed across episodes, subject to scene-level checks.
4. Comic strips, alternate versions, fan wikis and one-off gags: contextual leads only. Do not import feats without declaring a source universe.
Every individual scene claim not individually checked is flagged in data. Verified ability overview ≠ timestamp-verified precise scene.

## Global calibration
**99** extreme repeatable advantage; **90** historically elite human capability; **75** pro athlete; **50** typical adult; **25** small child baseline; **5** essentially no capability. This is the same absolute scale as MCU, NBA, Muppets and Mashup. Tiny characters remain tiny even if intelligent or nimble; technology enhances reach or effective movement only when normally carried.

**Toon-force principles:**
- Repeated survival of bombs, crashes and crushing supports **Endurance**, not automatically speed, leadership or precision.
- Genre-induced reality bending should be scored only if the character can repeatedly and purposefully deploy it in ordinary competition.
- A one-off visual gag is not unlimited magic. Context matters.
- Powered movement counts toward **effective Speed and Leap**, but teleportation does not automatically guarantee superior Reflexes.
- Comic antagonists can lose repeatedly because of situational trickery; record tactics and counters, not transitive 'X beats Y so X must be stronger'.
- Friendship, mission loyalty, charisma and command are distinct from Clutch or ethical judgment.
- A frightened hero who reliably acts despite terror (Courage) can have strong Clutch even if not emotionally calm.

## Variant / source constraints
- **Buzz Lightyear and Woody:** Default Toy Story toys, not human Space Ranger Buzz from Lightyear. Toy-scale size and actual nonlethal toy laser apply.
- **Snoopy:** Imaginary Red Baron plane is not necessarily physical flight.
- **Moana:** Ocean acts independently; no assumption that she can waterbend at will.
- **Maui:** Recurring shapeshifting requires his magic hook.
- **Popeye:** Recurrent spinach amplification is part of normal kit, but consumption and pre-spinach weakness are meaningful counters.
- **Katara:** Bloodbending requires special conditions; not a default unrestricted ability every turn.
- **Aang:** Season-end four-element skills, spirit state and Avatar State are period-dependent.
- **Toph:** Ground-contact seismic sense is strong but can miss airborne targets.
- **Rick Sanchez:** Standard portal gun and on-person technology allowed; not every one-time cosmic artifact.
- **Bluey:** Pretend play does not equal literal reality alteration.
- **Optimus Prime / Megatron / Ninja Turtles:** Use an identified animated series as default; alternate franchise continuities can contradict each other.
- **SpongeBob, Bugs, Tom and Jerry:** Toon physics are frequently contradictory. Base ratings on repeatable patterns rather than single peaks.

## Works and official references
- [Avatar Studios official characters](https://www.avatarstudiosofficial.com/characters/) and [Nickelodeon Toph](https://www.nick.com/info-page/4tmv8o/toph)
- [Nickelodeon animated Avatar overview](https://www.nickanimation.com/content/avatar-the-last-air-bender/)
- [Popeye official about](https://popeye.com/About/)
- [Adult Swim: Rick and Morty portal-gun production](https://www.adultswim.com/videos/rick-and-morty/rick-and-morty-prop-process)

## Implementation
The game references exactly 104 profiles from `TOONS_PROFILES_BATCH_01..03.json`. `index.html` holds the current numeric arrays and uses them in both draft simulation and role-ranking logic. `data/toons-profiles.js` populates the on-screen optional Character Guide with research context and explicit score reveal. `TOONS_MATCHUP_EVIDENCE.json` catalogs 32 contextual candidate opponent events. MCU scores remain unchanged.

Run `node research/validate_toons_profiles.mjs` from the repository root to verify that all research and shipped values are synchronized.

**Research status:** All 104 drafted and owner-authorized for deployment; primary-scene verification remains incomplete. Treat the profile descriptions and numeric ratings as interpretive/subject to correction.

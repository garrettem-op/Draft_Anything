# Campaign eligibility: 848-character offline audit (2026-11-09)

## Why false denials occurred
Campaign's themed challenges relied on small name-only allowlists and a limited number of character-specific ability records. They did not check the descriptions displayed in character cards, the separate Marvel/cartoon research profiles, or the original 151 Pokémon's structured type labels. A character could plainly be described as flying and still be rejected.

**Fix:** `data/campaign-eligibility.js` is loaded ahead of `data/campaign.js`. Each of the 12 power-theme submissions now checks (1) the previous curated tags, (2) source-linked individual ability records, (3) conservative matches in each existing roster description, (4) the existing researched **Powers** field only—not unstructured feats or opponents' attacks, (5) Pokémon type labels for elemental themes, and (6) curated flight and aerial-combat evidence for Pokémon and Star Wars characters. Existing locally approved knowledge remains supported. Every lookup is deterministic and local: **zero OpenAI calls**.

## Audit counts
The source dataset consists of 848 entries (NBA 134, MCU 143, Cartoons 103, Muppets 101, Games 118, original Kanto Pokémon 151, Star Wars 98). The actual Mashup deduplicates Pokémon names also present in Games, so these figures represent the **source pools audited**, not unique Mashup positions.

The figures below are **character–theme matches**, not unique people, and compare the previous static tag/evidence coverage with the new local evaluation. These are additional *potential eligibility approvals* for represented character records, not newly confirmed canonical facts researched on the internet.

| Theme | Earlier matching records | Additional offline matches | New total |
| --- | ---: | ---: | ---: |
| Skyborne (flight) | 20 | 67 | 87 |
| Arcane Assembly (magic) | 7 | 8 | 15 |
| Mind Games (psychic) | 15 | 14 | 29 |
| Under the Sea (aquatic) | 9 | 29 | 38 |
| Inferno (fire) | 10 | 8 | 18 |
| Cold Front (ice) | 7 | 4 | 11 |
| Shock Troopers (electric) | 7 | 10 | 17 |
| Tech Titans (tech) | 13 | 21 | 34 |
| Ghost Protocol (stealth) | 13 | 23 | 36 |
| Blink and Miss (teleport) | 12 | 6 | 18 |
| The Medics (healing) | 15 | 8 | 23 |
| Giant Problems (giants) | 7 | 4 | 11 |
| **Total** | **135** | **202** | **337** |

Counts are derived from source-roster characters and exclude any additional Supabase/user-approval eligibility not recorded in the repository.

## Examples of fixed false denials
- **Flight:** The Wasp, Namor, Vulture, Human Torch, Sentry, Pepper Potts, Diddy Kong, Snoopy, Falco Lombardi, Poe Dameron, Hera Syndulla, Butterfree and Pidgeot.
- **Magic/psychic:** Kaecilius, The Ancient One, Yennefer, Bayonetta, Cosmo the Spacedog, Ness; Pokémon's existing Psychic type grouping contributes additional evidence.
- **Elements:** Kanto Pokémon types already classified in game as Fire, Water, Ice or Electric now support their matching theme. This catches Ninetales, Arcanine, Rapidash, Omanyte, Cloyster and Voltorb.
- **Equipment and powers:** Rocket's advanced engineering, Pepper Potts's Rescue armor, Rick Sanchez's portal gun, Moon Knight's self-healing, and Thog's giant body.

## Safety and gameplay boundaries
- **No automatic paid research:** validation reads local character data and optional cached approved facts only. AI dispute research remains a separate, explicitly confirmed paid action.
- **No lineup filtering:** the user still needs to choose the correct characters; checks happen on submission.
- **No high-stat guessing:** Leap 99 does not make a character a flyer, high IQ does not imply technology, and magic does not imply psychic powers.
- **No opponent-feat borrowing:** the validator reads the guide's explicit **Powers** field, not narrative Feats, where being hit by fire or seeing a portal would otherwise create false positives.
- **No title/name loopholes:** *Fire Emblem* does not give Marth flame powers, *Electric Mayhem* does not give Dr. Teeth lightning, a shock trooper is not an electricity user, boomerang fish do not grant underwater breathing, and ordinary biological armor is not advanced tech.
- **Flight is not all Flying-type Pokémon:** Doduo/Dodrio are excluded despite their game's Flying-type group, since Skyborne requires actual flight or aerial combat capability.
- **Commander-only exceptions** such as Admiral Ackbar remain restricted to the actual commander slot.

## Validation
- All JavaScript parsed successfully.
- The integrated evaluator checked **10,176 character–theme combinations** (848 × 12), and every return was a boolean.
- A seven-character Skyborne lineup built entirely from previously missed characters was accepted.
- 68 focused positive/negative cases passed, including non-qualifying titles and Commander-only exceptions.
- No paid AI challenge was invoked.
- Node's built-in `node:test` regression file: `tests/campaign-offline-eligibility.test.cjs`, plus the updated `tests/skyborne-evidence.test.cjs`. The standalone Node suite has not been executed in this connector environment; local JavaScript evaluations were completed.

## Further limitations
The existing brief descriptions and research profiles are still editorial data and are not a perfect scene-by-scene canonical audit. Characters whose abilities are absent from **all** stored representations can still be rejected; they require curated evidence updates. Challenges based on gender, costume color, age, or being non-superpowered need independent taxonomy review, rather than speculative keyword matching. The free local checks provide broad, immediate improvements without introducing AI charges or adding unverified powers just to avoid rejection.

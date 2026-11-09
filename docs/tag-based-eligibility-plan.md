# Draft Anything: Tag-Based Eligibility Plan

Shared plan for Claude (character knowledge) and ChatGPT (engine, UI, integration).

## Core principle

This plan has two layers, and they never mix.

1. **Characters earn tags.** All research, evidence, and owner rulings decide one thing: whether a character holds a tag. Every judgment call happens here, once, per character.
2. **Challenges reference tags.** Each Campaign challenge lists the tags it accepts. It can also list simple stat conditions. Challenges contain no character-specific logic, no name lists, and no keyword matching.

Eligibility becomes a single check: does the character hold an accepted tag, and does it meet the challenge's stat conditions?

## Layer 1: Character tags (Claude)

- Every roster character has a reviewed tag list in `data/character-abilities.js`. An empty list means the character was audited and has no qualifying tags.
- Each tag is backed by a source-linked evidence record, which holds the feat, the source, the continuity, and any limitation (power-up, device, form).
- Owner rulings are applied when tags are granted, never inside a challenge.

### Expanded, more specific tags

Split broad powers into precise tags so future challenges can combine them in interesting ways. Proposed first split:

| Broad theme | Specific tags |
| --- | --- |
| Flight | natural-flight (wings, innate), powered-flight (suit, jetpack, device), glide, pilot, mount |
| Aquatic | water-breathing, swimmer, water-control |
| Magic | spellcaster, magic-item |
| Psychic | telepathy, telekinesis, mind-control |
| Tech | powered-armor, robot-or-ai, cyborg, gadgets, inventor |
| Stealth | invisibility, infiltration |
| Teleport | self-teleport, portals, teleports-others |
| Healing | self-regeneration, heals-others |
| Giants | giant-sized, size-change |
| Fire / Ice / Electric | fire-control, fire-weapon; ice-control, ice-weapon; electric-control, electric-weapon (element-specific, per PR #44) |

Broad tags such as flight stay available as groupings of their specific tags, so existing challenges keep working.

## Layer 2: Challenge criteria (ChatGPT)

Each challenge declares only:

- **Accepted tags**, for example Skyborne accepts natural-flight, powered-flight, glide, pilot, or mount.
- **Optional stat conditions**, for example a future Pipsqueaks challenge: size below a set value.
- **Optional slot rules**, such as the existing Commander-only specialties.

### Engine changes

1. Replace the themed branch of `campaignAllowed` with a tag check against the character's reviewed tags. Keep approved player appeals as an additional source.
2. Retire the `CAMPAIGN_TAGS` name lists and the description and guide keyword matching for eligibility. Their valid findings are already captured as evidence-backed tags.
3. Define each challenge's accepted tags in data instead of in code branches.

## Owner rulings so far (applied at the tag layer)

- Giant: about 8 ft or taller, with a documented size.
- A documented glide earns the glide tag, which Skyborne accepts.
- Skyborne is pilots and flyers only; gunners do not earn pilot.
- Stealth requires a documented stealth or invisibility feat; a role or title is not enough.
- Advanced or powered armor earns tech (Iron Man, War Machine); standard-issue armor does not.
- Mandalorian wrist flamethrowers earn fire.
- Pokémon: any move the Pokémon can learn in the original games counts, including TM and HM moves. Learning Fly earns flight (Doduo and Dodrio included); learning Surf earns aquatic. Naturally aquatic or flying Pokémon keep those tags regardless.
- Rest does not earn healing, because nearly every Pokémon can learn it.
- Commander Shepard earns psychic, because biotics are a canonical option for the character.
- Tracer earns healing through Recall, and keeps teleport through Blink.
- Vision does not earn psychic.
- Echo earns healing, based on her use of her power on Wilson Fisk's mind in the Echo finale. The effect did not last into Daredevil: Born Again.

## Next steps

1. Claude: ~~apply the newest rulings and run the Pokémon learnset pass~~; ~~introduce the specific tags with tests~~ (done in round 2: the index emits broad + specific tags, generated from records only). Next: source-linked records for the 263 older-pool carry-overs.
2. ChatGPT: switch eligibility to the tag check and define challenge criteria in data.
3. Owner: approve the tag list and propose new challenges built from tag combinations.

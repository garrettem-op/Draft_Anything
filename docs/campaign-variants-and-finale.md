# Draft Anything — expanded variants and Campaign Siege (November 2026)

## Variant catalog
The new `data/campaign-variant-expansion.js` records **221 alternate forms for 136 roster identities** in addition to the existing Campaign forms. Every new form specifies:
- its universe-scoped base character ID;
- a distinct named form;
- named original media or storyline and continuity (comic, game, film, alternative timeline, etc.);
- bounded gameplay attribute deltas (**not** purported canonical numeric power ratings);
- a URL where a verified official source has been explicitly supplied.

Do not equate shared names with identical characters: for example, **White Wolf (Bucky Barnes)** here is the MCU Bucky nickname, *not* the separate comics character Hunter. **Hydra Supreme Steve Rogers** is the Cosmic Cube-altered version from *Secret Empire*, not ordinary MCU Steve. **God Emperor Doom** belongs to *Secret Wars* (2015), **Sorcerer Supreme Doom** to *Blood Hunt / One World Under Doom*, and **Infinity Ultron** to Marvel Studios' *What If...?*.

New characters are **not** duplicated in the roster. The game only transforms the selected character for one Campaign encounter. The user can choose which eligible character is targeted, then receives a seeded random one of its forms. There is still one Surge per stage, and removing the transformed character does not refund it. When a base character is at an attribute cap of 99, the cap is respected.

The catalog spans MCU/Marvel, DC, video games, original Kanto Pokémon, Star Wars, Middle-earth, the Wizarding World, and cartoons. NBA and Muppets are deliberately omitted from this first expansion rather than inventing noncanonical super-powered forms for every character.

## New challenges
Campaign challenge criteria support `poolIds` and `minDistinctPools` as declarative fields, independent of the existing evidence-based ability tags and statistics. New themes include **Saturday Morning Showdown** (cartoons + Muppets), **Caped Crossover** (DC + Marvel), **Wizards & Wanderers** (Tolkien + Harry Potter), and other constrained-universe categories. The player-facing picker remains deliberately unfiltered; eligibility is enforced on submission. Commander specialties do not override these pool restrictions.

## The Multiverse Siege (level 10)
- Full regular roster (no repeat of 3-versus-5).
- At least three different talent pools in the lineup.
- No character from any previously won stage.
- Defeat **two independently seeded opponents** using the same lineup and the one allowed Surge; both results appear in the score breakdown.
- A stage remains fixed across retries. Character/score calculations do not call any paid API.
- A random run is not permitted to put Short-Handed immediately before the finale; saved runs remain saved and receive the new final rules.

## Testing
Run `node --test tests/*.test.cjs` and `node tests/browser-smoke.cjs`. The new regression suite audits roster keys, form provenance, source links where present, deterministic chosen-target Surge behavior, pool-restricted picks, full-size final requirements, and both seeded bosses.

## Research limitations
These are curated game variants with **named source works**, not individually independently verified numeric power measurements. Alternate timelines and adaptations are labeled to avoid presenting them as the baseline MCU character's own feats. Specific variants should be removed or revised if later source review finds their form or identity unsupported.

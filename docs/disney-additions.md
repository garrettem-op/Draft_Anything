# Disney characters added to Cartoons (2026-11-10)

Garrett asked for 3–5 main characters from the Disney films the Cartoons pool was missing, plus filling out films that only had one or two characters, plus a few classic-era picks. The pool goes from 103 to 134.

## Roster and chemistry groups

| Film (chemistry group, strength 1) | Characters | New |
| --- | --- | --- |
| Aladdin | Aladdin, Jasmine, Genie, Jafar | all 4 |
| The Little Mermaid | Ariel, Ursula, King Triton, Sebastian | all 4 |
| Beauty and the Beast | Belle, Beast, Gaston, Lumière | all 4 |
| The Hunchback of Notre Dame | Quasimodo, Esmeralda, Frollo, Phoebus | all 4 |
| The Lion King | Simba, Mufasa, Scar, Timon, Pumbaa | 4 |
| Mulan | Mulan, Mushu, Shan Yu | 2 |
| Hercules | Hercules, Phil, Hades | 1 |
| Frozen | Elsa, Anna, Olaf | 2 |
| Lilo & Stitch | Lilo, Stitch | 1 |
| Peter Pan | Peter Pan, Captain Hook | 2 |
| (classic, no film group) | Maleficent, Snow White, Cinderella | 3 |

Cross-film groups (weaker links): **Disney Heroes** (0.5, extended with the new heroes), new **Disney Villains** (0.6) and **Disney Princesses** (0.6). Mufasa joins **Mentors**; Beast and Gaston join **Strongmen**. Mufasa gets a coach style, *Remember Who You Are* (ldr 2, clu 1, end 1).

## Ratings

Calibrated against the existing Disney entries (Hercules, Mulan, Simba, Maui, Elsa, Stitch) on the shared scale: 50 typical adult, 75 pro athlete, 90 elite human. Profiles are in `research/TOONS_PROFILES_BATCH_04.json` and `research/TOONS_ALL_PROFILES.json`; every feat links to a plot summary or character page. None is timestamp-verified.

## Campaign powers (reviewed evidence, `CHARACTER_ABILITY_RECORDS_DISNEY`)

| Character | Tags |
| --- | --- |
| Aladdin | flight (mount: rides Carpet) |
| Genie | flight (natural), magic (spellcaster), giants (size-change)\*, teleport (self)\* |
| Jafar | magic, psychic (mind-control via staff), giants (size-change, cobra), fire |
| Ariel, Sebastian | aquatic |
| Ursula | magic, aquatic (incl. water-control with the trident), giants (size-change) |
| King Triton | aquatic, magic (magic-item: trident) |
| Mushu | fire |
| Hades | fire, teleport (self), magic (spellcaster)\* |
| Peter Pan | flight (natural, pixie dust) |
| Maleficent | magic, giants (dragon), fire, teleport (self) |
| Lumière | fire (fire-weapon)\* |
| Beast | giants (giant-sized)\* |
| Esmeralda | stealth (infiltration)\* |

\* Owner rulings, 2026-11-10: Garrett approved all six powers that were first held back (records carry a `ruling` field).

Everyone else is audited with no qualifying power. Jasmine only rides Carpet as a passenger, so she is not Skyborne (same rule as passengers on the Eagles).

Identity rulings in `data/campaign.js`, also worth a look: Ariel is in **Young Guns** (she says she is sixteen) and **Seeing Red** (red hair). Sebastian, Mushu and Captain Hook are in Seeing Red; Gaston is left out. **No Powers Allowed** includes Aladdin, Jasmine, Belle, Gaston, Quasimodo, Esmeralda, Frollo, Phoebus, Shan Yu, Anna, Lilo, Captain Hook, Snow White and Cinderella.

## Evidence review (PR #55, 2026-11-10)

The first pass leaned on Wikipedia, Fandom, TV Tropes and Comic Vine. Every Disney record now says how far its feat is confirmed:

- `verified`: the feat itself is confirmed by an official, editorial or dialogue source (`verifiedBy`).
- `provisional`: only community sources so far. The tag is still granted; these are leads to confirm, not confirmed canon.
- `owner-ruling`: granted or settled by the owner (the six approved powers above, and Peter Pan's flight).

Every verified or provisional record also carries a `scene`: the film and sequence where the feat happens.

| Character | Tag | Status | Confirmed by |
| --- | --- | --- | --- |
| Genie | magic | verified | IMDb dialogue record: Genie's power turns snake-Jafar into a genie |
| Genie | flight | provisional | |
| Aladdin | flight (mount) | provisional | |
| Jafar | giants | verified | IMDb dialogue record: the giant cobra squeezes Aladdin |
| Jafar | magic, psychic | provisional | |
| Jafar | fire | provisional | TV Tropes only. Feat reworded so it no longer reads as confirmed. |
| Ariel | aquatic | verified | Disney+ (mermaid living under the sea) |
| Ursula | aquatic (incl. water control) | verified | Dialogue record of the trident finale; D23 for identity |
| Ursula | magic, giants | provisional | D23 confirms "sea witch" (identity only) |
| King Triton | aquatic | verified | D23 ("ruler of the seas") |
| King Triton | magic (trident) | provisional | |
| Sebastian | aquatic | verified | D23 (Triton's crab court composer) |
| Mushu | fire | provisional | |
| Hades | fire | verified | NBC Los Angeles (his head flame shows his temper) |
| Hades | teleport | provisional | |
| Maleficent | magic, giants, fire, teleport | verified | TCM film synopsis: the christening curse, vanishing in a burst of fire, the dragon's fiery breath |
| Peter Pan | flight | owner-ruling | Settled |
| Genie giants and teleport, Hades magic, Lumière, Beast, Esmeralda | | owner-ruling | Approved 2026-11-10 |

Maleficent's teleport no longer cites Comic Vine. D23 Disney A to Z entries are one-line identity notes, so they confirm what a character is (sea witch, crab, ruler of the seas) but not a specific feat.

## Form and item gates (owner decision needed)

Campaign reads only `CHARACTER_ABILITY_TAGS`, so a tag counts for the base character every time. `limitation` and the new `formGate` field are information only; nothing enforces them. That is the existing practice across the roster (for example Ganondorf's teleport in Beast form and Mario's power-ups). The Disney records now label each dependency:

| Gate | Records |
| --- | --- |
| `owned-item`: an item he always carries | Jafar magic and psychic (cobra staff), King Triton magic (trident) |
| `wish-form`: a form granted by Genie | Jafar giants (cobra) and fire (sorcerer) |
| `stolen-item`: needs Triton's trident | Ursula giants, Ursula water control (her water-breathing and swimming are her own) |
| `self-transformation`: her own magic | Maleficent giants and fire (dragon) |

Options for the owner:
1. Keep all of them (current behavior).
2. Base identity only: wish forms and stolen items move to the research queue until Campaign variants (Genie Jafar, Giant Ursula) carry them. Jafar loses giants and fire; Ursula loses giants.
3. Gate in the engine using `formGate`. This is ChatGPT's area.

## ToonForce

Genie only: score 95, facets comedy 96, resilience 84, body 99, props/environment 95, fourth wall 90, sports 62 (no sports feats, so the sports facet is low). Everyone else stays at ×1.00. He has no Battle Royale exceptional-power entry; his biggest feats need a master's wish.

## Not done (left for ChatGPT / the owner)

- Signature moves (`SIGS.toons`) and Playoff Boom membership for the new characters.
- Campaign variants: Genie Jafar, Giant Ursula, Dragon Maleficent, Prince Adam, Young Simba-style forms.
- Commander specialties (e.g. King Triton for Aquatic, Maleficent for Magic).

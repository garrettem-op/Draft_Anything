# MuppetForce — character-specific puppet-stage physics

MuppetForce is a **separate gameplay attribute** and Campaign condition in Draft Anything. It does not replace ToonForce or the game's 12 universal attributes.

## The fictional rule

A MuppetForce character can exploit the conditions of a live puppet/variety-show world: a felt or foam body can rebound from slapstick; scenery and props become tools or hazards; stage spaces are unusually flexible; social routines bring other characters into running gags. This is **not** unrestricted reality rewriting. An absurd interaction can surpass normal human physical expectations without proving unlimited strength, speed, durability, or cosmic control.

The design is inspired by classic Muppet onstage and backstage chaos, recurring physical comedy and running gags:
- [Television Academy / The Muppet Show overview](https://interviews.televisionacademy.com/shows/muppet-show-the)
- [Encyclopedia of TV & Radio / The Muppet Show](https://www.tvencyclopedia.org/tv-encyclopedia-11/muppet-show-the)

These are sources for the **overall mechanic**, not verification of every individualized feat. Individual profiles and scores are provisional editorial judgments pending scene-by-scene audits.

## Muppet film history and continuity

The history registry now includes **The Muppet Show** and eight major theatrical Muppet movies. The first film with explicitly indexed feats is **Muppet Treasure Island (1996)**. Other films are recorded as **research-queued**: inclusion in a film library alone never grants a power, bonus, or rating change.

Primary Disney references:
- [Muppet Treasure Island — film identification and roles](https://d23.com/a-to-z/muppet-treasure-island-film/)
- [Disney Archives — Muppet Treasure Island fight choreography, Kermit swordplay and Piggy's karate](https://d23.com/wda-sailing-for-muppet-y-adventure-on-the-high-seas/)
- [D23 — Kermit and Piggy's perilous upside-down duet](https://d23.com/muppet-treasure-island-did-you-know-2/)

Additional scene reporting:
- [Groucho Reviews — pirate interrogation and Gonzo's reaction](https://www.grouchoreviews.com/reviews/6334f8a75fe75d1811c62bb4)
- [Splicedwire — Gonzo uses starfish as throwing stars](https://www.splicedwire.com/96reviews/muppet.html)
- [The Washington Post — Statler and Waldorf as figureheads, rats as cruise passengers](https://www.washingtonpost.com/archive/lifestyle/1996/02/16/seeworthy-muppets/05904985-76c8-499c-b196-4845fdf15d5f/)
- [1996 newspaper review — Fozzie's finger gag and Rizzo's vacationing rats](https://www.spokesman.com/stories/1996/feb/16/sail-the-high-seas-with-the-muppets/)

**Interpretive rules:** the film shows puppet-stage capabilities beyond an ordinary human production, but theater staging is not a separate power unless supported by the character's repeated story-world actions. Gonzo's enjoyment of an interrogation is **pain tolerance**, not blanket invulnerability. Kermit and Piggy being rescued from a cliff is **not** proof that they could survive a fatal fall. Fozzie's "Mr. Bimbo" finger is a fictional role-specific joke, not an autonomous magical ally. Statler and Waldorf appearing as ship figureheads does not imply independent teleportation.

Every scene entry stores the work, character, fictional role, relevant MuppetForce dimension, reported event, conservative gameplay inference, role-continuity marker, evidence class and HTTPS references. The Character Guide displays these per-character histories with links and limits. The registry is used to justify and audit proposed ratings; **no numerical scores were changed merely by adding one film**. Additional film scenes should be reviewed individually rather than inferred from a movie's inclusion in the bibliography.

## Five independent dimensions

| Dimension | Weight | Evaluates |
| --- | ---: | --- |
| Puppet resilience | 30% | Damage/deformation recovery and return after slapstick |
| Prop manipulation | 25% | Creative, disproportionate use of physical props, food, tools |
| Stage-space physics | 15% | Entrances, backstage mechanics and scenery |
| Chaos escalation | 20% | Environmental chain reactions and disruptive improvisation |
| Ensemble contagion | 10% | Drawing other characters into an act |

Each dimension is rated 0–99. The weighted composite is MuppetForce / 99, separate from the twelve existing attributes.

Absence from the curated profile table means **unassessed**, not a zero score and not presumed eligibility. Recognition as a puppet alone does not constitute a demonstrated power.

## Gameplay effect

- Role-fit adjustment: at most **+1.75 points** in Battle Royale, where props and chaotic contact are relevant; at most **+0.70** in regulated sports, where on-field prop manipulation is restricted.
- The same adjustment applies to player role fit, AI selection, best-role suggestions and comparative role rankings.
- This does not change base attributes or invoke a free-win effect; Signature Moves and chemistry remain independent.
- Coaches and Bench Spark slots receive no MuppetForce environmental bonus.
- Non-Muppet pools cannot inherit MuppetForce through a matching character name.

## Campaign challenge

**The Show Must Go On** is appended to the rotating pool of optional Campaign challenges, without changing existing stage IDs.

Every character must have a curated **MuppetForce >= 65**. The player drafts from the full All-Star Mashup and is challenged to know who qualifies. Eligibility is checked at lineup submission, with nonqualifying characters flagged.

This new special ability is not yet eligible for the automated ability-dispute workflow. The research backend currently only recognizes its established set of powers, and a new tag requires separate server-side expansion and deployment.

## Character design guardrails

- **Gonzo:** incredible stunt impact tolerance does not prove winning every fight.
- **Swedish Chef:** impossible kitchen chaos is strongest when utensils and ingredients are present, not unlimited matter creation.
- **Beaker:** survival does not imply that Beaker can control the experiment.
- **Animal:** disruption is weakened by poor precision and self-control.
- **Kermit:** stage management and ensemble timing differ from destructive physical power.
- **Statler and Waldorf:** heckling affects the scene socially; it does not grant major physical attacks.
- **Bert:** simply being a Muppet does not meet the challenge threshold.

## Verification

Run: node --test tests/muppet-force.test.cjs

Tests cover the five-dimension rule, character exclusivity, eligibility, context dependence, bonus bounds and unchanged raw attributes.

Further research should link each case to source episodes and films before changing provisional values, and submit contentious facts through moderation rather than automatically inflating scores.

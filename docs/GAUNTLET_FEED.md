# Gauntlet feed layer

The Gauntlet screen now plays like a feed: tap a character, the next matchup is already there, and small rewards keep it moving. This is presentation only. A vote is the same plain schema-v1 vote it always was, and nothing here touches match results, the game's matchup prediction (still hidden while you vote) or the Option C evaluator.

Files: `data/gauntlet-feed.js` (all logic, sound and markup), a handful of hooks in `data/gauntlet.js`, styles and three button actions in `index.html`. If the feed file is missing or throws, the original vote screen is used and no vote is lost.

## What you see

- **Instant next card.** A pick saves and deals the next pair with no confirm step. Cards slide in.
- **Combo.** Picks in a row. A pause of more than 45 seconds ends the run. Skips and "too close to call" neither add to the combo nor break it, so nobody is pushed to guess. Pitch rises with the combo.
- **Ladder tags.** After a pick: "Ripley climbs 3 spots to #4", "Thanos drops 2 spots to #9", "Ripley debuts at #6". These come from your own ladder (the same ranking as the Ladder screen).
- **Same-matchup lines.** "Same pick as last time", "You changed your mind on this one. Noted." Repeats are wanted data, so this makes them feel good rather than hiding them.
- **Crowd lines.** "62% of picks on this matchup agree", "Bold. Only 8% of picks on this matchup agree". Hidden until the published file `data/gauntlet/aggregates-v1.json` exists and that matchup has at least 8 decisive picks. They say "picks", not "voters", because the file counts votes, not people.
- **Surprise cards.** Every 6 to 12 votes (random gap, seeded) a special card replaces the ordinary pair: a **Cross-universe clash** (your pool against a random other one), a **Dream final** (two of your top-rated characters) or a **Tiebreaker** (a matchup you have answered both ways). They are normal votes.
- **Titles and badges.** From judged matchups (skips excluded): Newcomer, Regular (25), Judge of the Court (100), Arbiter (250), High Arbiter (500), Grand Arbiter (1,000). Badges at 10, 25, 50, 100... picks and combos of 10, 25, 50, celebrated once per device, with confetti and a chime.
- **Day streak.** Consecutive local days with at least 10 judged matchups.
- **Top five.** Every 25 judged matchups a card shows your top five with ratings and a one-line description of your taste ("Underdog lover", "Chalk picker", "Balanced judge"). Every 50 it adds a gentle "stop whenever you like, your ladder is saved". One tap on Keep going continues.
- **Sound, buzz, motion.** Sounds are synthesized in the browser (no audio files). Phones that allow it buzz briefly (Android; iPhones do not allow it in web pages). Two toggles at the top, remembered per device. If the phone is set to reduce motion, motion starts off. Keys on a keyboard: arrows pick, T tie, S skip, U undo, Enter continues.

## Why the rewards cannot skew the data

- Nothing rewards a side, a speed or a guess: combos ignore skips and ties, titles count judged matchups only.
- The taste label describes your last 40 picks; it is never a reward, so there is nothing to farm.
- Surprise cards are a minority of deals and use their own seeded random stream, so the ordinary coverage sampling is unchanged. They are stored as ordinary votes.
- Ranking uses the same `Gauntlet.aggregate` and `Gauntlet.rank` as the Ladder screen.

## Honest limits

- Crowd lines do nothing until real votes are published (the daily job only commits once there are some).
- Haptics: Android only. Sound starts after your first tap, which is how phone browsers work.
- Day streak and combos use your device clock and the saved vote timestamps.
- Cost per vote is one ranking of your saved votes: about 30 to 40 ms at the 20,000-vote local cap.
- This is an engagement design, built because the owner asked for a feed that is hard to put down. It deliberately has no hard timer, loss penalty or notification; the top-five card is the only pause.

## Tests

`tests/gauntlet-feed.test.cjs` (15 tests: combo, day streak, badges, ladder moves, crowd and own-history lines, top five, surprise determinism with `Math.random` forbidden, one-time badges, sound with a fake audio engine, settings, markup escaping, hook safety, speed) and `tests/gauntlet-feed-browser.cjs` (phone-sized real browser: instant picks, sound and buzz on and off, motion toggle, keyboard, undo, surprise card, reveal, reduced motion, no sideways scrolling, plain stored votes).

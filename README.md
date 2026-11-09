# Draft Anything

Draft anyone into any sport: all-time NBA legends, Marvel, cartoons, Muppets, video game characters, Pokémon and Star Wars.

- **Championship**: fan-cast a dream lineup, share it as an image, then chase a perfect season against teams from every universe.
- **Dealt Hand**: draft from random three-card hands while rival teams draft alongside you.
- **Head-to-Head**: create a draft, send a friend the invite link, and draft live.
- **Daily Grid**: solve a new 3×3 character trivia puzzle every day at midnight Eastern. Every intersection combines a talent pool and an attribute threshold. Nine guesses maximum, one per cell, no repeated characters. Browse and play historical grids and share your results.

Live at https://garrettem-op.github.io/Draft_Anything/

The page is a single `index.html`. Head-to-Head drafts are stored in Supabase (`docs` table with row-level security; edits go through the `doc_update` and `doc_acquire` functions). NBA prime stats come from Basketball-Reference.

Daily Grid puzzles are generated deterministically from the date so everyone on the same game version sees the same grid. Attempts, scores, and past-grid history are stored locally in the browser (they do not sync across devices). It uses the built-in character ratings, not paid AI research.

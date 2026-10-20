# Draft Anything

Draft anyone into any sport: all-time NBA legends, Marvel, cartoons, Muppets and video game characters.

- **Championship**: fan-cast a dream lineup, share it as an image, then chase a perfect season against teams from every universe.
- **Dealt Hand**: draft from random three-card hands while rival teams draft alongside you.
- **Head-to-Head**: create a draft, send a friend the invite link, and draft live.

Live at https://garrettem-op.github.io/Draft_Anything/

The page is a single `index.html`. Head-to-Head drafts are stored in Supabase (`docs` table with row-level security; edits go through the `doc_update` and `doc_acquire` functions). NBA prime stats come from Basketball-Reference.

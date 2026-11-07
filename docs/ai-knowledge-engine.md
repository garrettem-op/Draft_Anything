# AI Character Knowledge Engine — setup and review

This feature is intentionally split into a **web frontend**, a **Supabase Edge Function** and **private Supabase Postgres tables**. Live AI research cannot work with only GitHub Pages: an OpenAI API key must be configured on the *server*, and the service must be deployed.

## Player experience

1. Draft a roster and submit it. Ineligible picks are marked in red as before.
2. In the resulting "Lineup rejected" dialog, choose **Challenge ruling** next to a character for one of the 12 thematic ability challenges.
3. Optionally provide a specific observed feat and an HTTPS source. The claim is researched by a server-side LLM with live web search.
4. The response is:
   - **Provisionally accepted:** strong corroborated evidence (at least two cited domains, including an official publisher/franchise source, confidence ≥0.85); the player can continue immediately and this browser caches the provisional result for 24 hours.
   - **Rejected:** research does not support the power in that universe.
   - **Inconclusive:** sources are weak or contradict one another; no automatic override.
   - **Approved:** previously approved global knowledge, immediately usable by all players.
5. Research outcomes and citations are logged in `character_disputes`. Pending submissions cannot change global eligibility until a human reviewer explicitly approves a record. Approved facts are stored in `character_knowledge` with an audit trail.
6. Gameplay numeric thresholds and "no repeated characters" challenges are not affected. The talent list stays unfiltered, preserving the knowledge challenge.

### Privacy and access

Disputes use Supabase Auth anonymous sign-in. Enable **Anonymous Sign-Ins** in Supabase Authentication settings for this project. Only the server holds the OpenAI key and Supabase service-role key; **never insert them into HTML, GitHub Pages or git**. Players cannot write approved facts directly; all database tables have RLS enabled and public grants revoked. A strong, separately managed review token protects approval actions. Approved facts are public; private disputes and moderation notes are not.

Live research has variable OpenAI API and search charges. The server enforces an eight-research-per-day quota per network address and a global 15-research daily cap (with a fallback to authenticated user identity). Each search requires an authenticated session, and responses for the same user/character/theme within 12 hours are cached to avoid duplicate AI calls. Actual model usage and costs remain subject to the OpenAI account's pricing and project limits. Add an OpenAI **project monthly budget** to limit financial exposure.

## Deployment

The repository contains a migration and Edge Function sources:

```
supabase/migrations/202611070001_character_knowledge.sql
supabase/functions/character-knowledge/index.ts
supabase/functions/character-knowledge/roster.json
supabase/config.toml
```

1. Ensure the existing Supabase project is **active**, not paused.
2. Apply the SQL migration using the Supabase CLI or the connected Supabase integration.
3. Enable Anonymous Sign-Ins for Auth in the Supabase dashboard.
4. Configure these **server-side Edge Function secrets** in Supabase → Edge Functions → Secrets (or use `supabase secrets set` with the CLI):
   - `OPENAI_API_KEY`: API key with spending limits enabled in the OpenAI project.
   - `KNOWLEDGE_REVIEW_TOKEN`: at least 32 random characters. **Never place it in browser code.**
   - `KNOWLEDGE_IP_SALT`: at least 24 random characters, used for hashed network-based rate limiting.
   - `KNOWLEDGE_RESEARCH_MODEL`: default `gpt-6-astra`, or another web-search-capable Responses model with structured outputs.
5. Deploy the `character-knowledge` function with `verify_jwt=false`, since its GET approved-facts endpoint is intentionally public. **Every POST dispute is authenticated via `supabase.auth.getUser(access_token)` inside the handler; moderation POSTs require the server-side review token.**
6. Confirm the GitHub Pages frontend has updated. Navigate to Campaign → a themed challenge → submit a lineup with an ineligible pick → Challenge ruling.

Typical CLI commands from repo root:

```sh
supabase link --project-ref pbwpyzfgqdcmchfciqeu
supabase db push
supabase functions deploy character-knowledge --no-verify-jwt
```

Do not use `--no-verify-jwt` for other functions without implementing their own access control.

## Reviewing AI rulings

A review operator uses the Edge Function with a server-side review token; there is no public admin button. Retrieve the pending queue with:

```sh
curl -X POST "$SUPABASE_URL/functions/v1/character-knowledge" \
  -H "Content-Type: application/json" \
  -H "apikey: $SUPABASE_PUBLISHABLE_KEY" \
  -H "x-review-token: $KNOWLEDGE_REVIEW_TOKEN" \
  -d '{"action":"list_pending"}'
```

To approve one reviewed dispute (updates the permanent knowledge table):

```sh
curl -X POST "$SUPABASE_URL/functions/v1/character-knowledge" \
  -H "Content-Type: application/json" \
  -H "apikey: $SUPABASE_PUBLISHABLE_KEY" \
  -H "x-review-token: $KNOWLEDGE_REVIEW_TOKEN" \
  -d '{"action":"approve","dispute_id":"DISPUTE_UUID","note":"Verified in canon."}'
```

Use `action: "reject"` with the dispute UUID to deny promotion after review, or `action: "revoke"` with exact `pool`, `name`, `tag` fields to withdraw erroneous approved knowledge. Moderator actions are recorded in `character_knowledge_reviews`.

## Limits and future work

The game currently loads a seed table of abilities, and these live AI challenges help fill gaps. The full roster audit remains tracked by [GitHub Issue #19](https://github.com/garrettem-op/Draft_Anything/issues/19). No AI result should be interpreted as guaranteed canon without checking the cited primary material and the chosen franchise continuity. Moderation still needs a secure admin dashboard; the API is sufficient for the first release. The backend does not automatically commit discovered facts to GitHub: approved facts persist in Postgres, and the frontend loads them from there.

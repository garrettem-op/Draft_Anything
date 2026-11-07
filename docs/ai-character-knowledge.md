# AI Character Knowledge Engine — deployment and review

## What this adds

- A **Challenge ruling** action on rejected thematic Campaign characters only (not numerical, no-reuse, or identity-based restrictions).
- Live web-researched rulings via OpenAI Responses API `web_search` from a **Supabase Edge Function**. No OpenAI key is shipped to browsers.
- Authenticated (anonymous Supabase Auth) player requests, restricted to the actual built-in character roster.
- Research verdicts with specific feats and clickable citations. A strongly sourced verdict can grant **provisional** single-player eligibility on the same device for up to 30 days.
- Moderator approval/rejection and revocation. **Only approved facts** become part of the shared character database. Rejections/inconclusive findings never unlock a character.
- Every ruling and moderator decision remains auditable. Repeat requests within 12 hours reuse stored research.
- A local pending-dispute draft when the external research service is unavailable. These drafts do **not** affect eligibility.

This feature is **not live just because it is merged into GitHub Pages**. Supabase must be configured and the function deployed. Until then, the game displays a clear unavailability message and can retain draft claims locally.

## One-time setup

1. Connect a Supabase account to ChatGPT, or access the existing Supabase project through its dashboard/CLI. The project reference currently used by the web app is visible in `index.html`.
2. Apply `supabase/migrations/202611070001_character_knowledge.sql` using Supabase SQL Editor or `supabase db push`. This creates the protected tables and atomic per-day rate limiter.
3. Enable **Anonymous Sign-Ins** in Supabase Authentication. A user session JWT is required for paid research calls; the public approved-facts endpoint does not require login.
4. In Supabase Edge Function secrets, set:
   - `OPENAI_API_KEY` — OpenAI API key (server-only).
   - `KNOWLEDGE_REVIEW_TOKEN` — random secret of at least 32 characters, used **only** for administrative actions.
   - `KNOWLEDGE_IP_SALT` — separate random value, 24+ characters, for daily quota hashing.
   - `KNOWLEDGE_RESEARCH_MODEL` — optional; defaults to `gpt-6-astra`.
5. Deploy `supabase/functions/character-knowledge/index.ts` with `supabase functions deploy character-knowledge` or through the Supabase dashboard. The included `supabase/config.toml` sets `verify_jwt=false` **only because** the endpoint allows public approved-fact reads. The function **independently verifies a valid Supabase user JWT** for every paid research request.
6. Verify:
   - GET `https://<PROJECT_REF>.supabase.co/functions/v1/character-knowledge?action=approved` with the public `apikey` header returns `{"facts":[]}` before any moderation.
   - A new Campaign submission with a rejected **thematic** character displays **Challenge ruling**, and clicking it lets a player research the claim.
   - No new global fact appears until a moderator approves the dispute.

## Moderation

The administrator's review token is never placed in the website, GitHub, or localStorage. Use secure shell tooling or another private moderator backend to call the API.

```bash
# Authorized list of unresolved research disputes
curl -sS 'https://<PROJECT_REF>.supabase.co/functions/v1/character-knowledge' \
  -H "Content-Type: application/json" -H "x-review-token: $KNOWLEDGE_REVIEW_TOKEN" \
  -d '{"action":"list_pending"}'

# After checking continuity and *actually reading* cited sources:
curl -sS 'https://<PROJECT_REF>.supabase.co/functions/v1/character-knowledge' \
  -H "Content-Type: application/json" -H "x-review-token: $KNOWLEDGE_REVIEW_TOKEN" \
  -d '{"action":"approve","dispute_id":"<DISPUTE_UUID>","note":"Verified against canon"}'

# Reject if wrong/inconclusive; no ability is added globally
curl -sS 'https://<PROJECT_REF>.supabase.co/functions/v1/character-knowledge' \
  -H "Content-Type: application/json" -H "x-review-token: $KNOWLEDGE_REVIEW_TOKEN" \
  -d '{"action":"reject","dispute_id":"<DISPUTE_UUID>","note":"Continuity mismatch"}'

# Revoke a previously approved global ability if later corrected
curl -sS 'https://<PROJECT_REF>.supabase.co/functions/v1/character-knowledge' \
  -H "Content-Type: application/json" -H "x-review-token: $KNOWLEDGE_REVIEW_TOKEN" \
  -d '{"action":"revoke","pool":"toons","name":"Katara","tag":"healing","note":"Example only"}'
```

Review requests and decisions are stored in `character_disputes` and `character_knowledge_reviews`, respectively. The original curated `data/character-abilities.js` still supplies built-in facts, independently of the shared database.

## Security and quality

- Every billable claim must target an entry in the server-side `roster.json`. This prevents prompt requests about arbitrary topics.
- A person can make at most eight new research requests per hashed network address per UTC day. This is not strong abuse prevention against rotating addresses; **enable Supabase Auth abuse protection/CAPTCHA and set OpenAI usage budgets before broad launch**.
- A provisional grant requires: affirmative research, confidence ≥0.85, at least two cited independent domains returned by the search tool, at least one recognized creator/franchise source, and a specific feat. This is **not proof of factual accuracy**; all shared facts still require human moderator approval.
- The LLM is instructed to distinguish continuity, but reviewers must check original material. Do not globally auto-promote disputed claims just because an LLM gives a high confidence score.
- A successful provisional verdict is stored for the browser/device for 30 days. Clearing site storage removes it. An approved record is shared with all players.
- OpenAI and Supabase credentials must stay server-side. Never send the review token to the browser.
- The engine currently handles **themed ability tags only**; eligibility challenges based on fixed score thresholds, no-reuse, age, gender, morality or appearance remain adjudicated by separate rules.
- Updating the static roster requires regenerating `supabase/functions/character-knowledge/roster.json`. Every server-side roster identity is exactly `pool + character display name` (matching the shared knowledge keys), not an unqualified name alone.

## CI

Node regression suites run `node --test tests/*.test.cjs`. The GitHub workflow also type-checks the Deno Edge Function and exercises mobile browser smoke tests. A working server endpoint and OpenAI key are **not** available in CI: validate an end-to-end live research request after production provisioning.

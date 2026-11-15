// Draft Anything Gauntlet: public vote submission endpoint.
// Validates votes with the same rules as data/gauntlet.js (schema v1), rate-limits per session,
// optionally checks a Cloudflare Turnstile token (only when TURNSTILE_SECRET is set), and stores
// votes idempotently by vote id. A resend of the same vote is ignored; separate votes on the same
// matchup are all stored and counted. Stores no IP address or personal data.
import { createClient } from "npm:@supabase/supabase-js@2";

const ID_RE = /^[a-z0-9][a-z0-9_-]*:[a-z0-9][a-z0-9_.-]*(?:#[a-z0-9_.-]+)?$/;
const SESSION_RE = /^[a-z0-9]{8,32}$/;
const MAX_BATCH = 20;
const MAX_BODY = 40_000;
const PER_MINUTE = 90;
const TWO_YEARS = 2 * 365 * 86400 * 1000;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Max-Age": "86400",
};
const json = (status: number, body: unknown, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "content-type": "application/json", ...extra } });

const poolOf = (id: string) => id.split(":")[0];

// VALIDATE-START
// Returns an error string, or null when the vote is valid.
function validate(v: any): string | null {
  if (!v || typeof v !== "object") return "not an object";
  if (v.v !== 1) return "unsupported schema version";
  if (typeof v.id !== "string" || v.id.length < 3 || v.id.length > 80) return "bad vote id";
  if (typeof v.session !== "string" || !SESSION_RE.test(v.session)) return "bad session key";
  for (const f of ["a", "b", "left", "right"]) {
    if (typeof v[f] !== "string" || !ID_RE.test(v[f])) return "bad character id in " + f;
  }
  if (v.a === v.b) return "self pair";
  if (!(v.a < v.b)) return "a/b not in canonical order";
  if (v.key !== v.a + "|" + v.b) return "pair key mismatch";
  if (!((v.left === v.a && v.right === v.b) || (v.left === v.b && v.right === v.a))) return "orientation does not match pair";
  if (!["win", "tie", "skip"].includes(v.outcome)) return "bad outcome";
  if (v.outcome === "win") {
    if (v.winner !== v.a && v.winner !== v.b) return "winner not in pair";
  } else if (v.winner != null) return "winner set without a decisive outcome";
  const pools = [...new Set([poolOf(v.a), poolOf(v.b)])].sort();
  if (!Array.isArray(v.pools) || v.pools.join(",") !== pools.join(",")) return "pools do not match ids";
  if (typeof v.ts !== "string" || !Number.isFinite(Date.parse(v.ts))) return "bad timestamp";
  if (Math.abs(Date.parse(v.ts) - Date.now()) > TWO_YEARS) return "timestamp out of range";
  if (typeof v.model !== "string" || !v.model || v.model.length > 40) return "bad model version";
  if (!(v.confidence == null || v.confidence === "sure" || v.confidence === "lean")) return "bad confidence";
  return null;
}
// VALIDATE-END

async function turnstileOk(token: unknown, secret: string): Promise<boolean> {
  if (typeof token !== "string" || !token || token.length > 2048) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = await res.json();
    return data?.success === true;
  } catch {
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return json(405, { error: "POST only" });

  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > MAX_BODY) return json(413, { error: "body too large" });
  const text = await req.text();
  if (text.length > MAX_BODY) return json(413, { error: "body too large" });
  let body: any;
  try { body = JSON.parse(text); } catch { return json(400, { error: "invalid JSON" }); }
  const votes: any[] = Array.isArray(body?.votes) ? body.votes : [];
  if (votes.length < 1 || votes.length > MAX_BATCH) return json(400, { error: `send 1-${MAX_BATCH} votes` });

  const secret = Deno.env.get("TURNSTILE_SECRET");
  if (secret && !(await turnstileOk(body?.token, secret))) return json(403, { error: "bot check failed" });

  const rejected: { id: unknown; reason: string }[] = [];
  const valid: any[] = [];
  for (const v of votes) {
    const reason = validate(v);
    if (reason) rejected.push({ id: v?.id ?? null, reason });
    else valid.push(v);
  }
  if (!valid.length) return json(422, { accepted: 0, alreadyStored: 0, rejected });
  const session = valid[0].session;
  if (valid.some((v) => v.session !== session)) return json(400, { error: "one session per request" });

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  const since = new Date(Date.now() - 60_000).toISOString();
  const { count, error: countError } = await db
    .from("gauntlet_votes")
    .select("id", { count: "exact", head: true })
    .eq("session", session)
    .gte("received_at", since);
  if (countError) return json(500, { error: "storage unavailable" });
  if ((count ?? 0) + valid.length > PER_MINUTE) return json(429, { error: "slow down" }, { "retry-after": "60" });

  const rows = valid.map((v) => ({
    id: v.id, session: v.session, pair_key: v.key, a: v.a, b: v.b,
    left_id: v.left, right_id: v.right, outcome: v.outcome, winner: v.winner ?? null,
    pools: v.pools, ts: v.ts, model: v.model, confidence: v.confidence ?? null, schema_version: 1,
  }));
  // Same vote id twice is a resend and is ignored; different ids are different votes and all count.
  const { data, error } = await db
    .from("gauntlet_votes")
    .upsert(rows, { onConflict: "id", ignoreDuplicates: true })
    .select("id");
  if (error) return json(500, { error: "could not store votes" });
  const accepted = data?.length ?? 0;
  return json(200, { accepted, alreadyStored: valid.length - accepted, rejected });
});

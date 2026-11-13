#!/usr/bin/env node
'use strict';
/* Gemini research worker for V2 character profiles.
   - Calls the Gemini REST API directly (free tier only; opt-in is enforced by the caller).
   - Forces structured JSON with a response schema, so no prose/summary parsing.
   - Every record is forced to researchStatus "provisional"; the model can never self-certify.
   - Every cited URL is fetched; dead links and pages that never mention the character are
     dropped. A record left without a working source is returned to the caller as "dropped".
   Pure functions are exported for tests; network access is injected (fetchImpl).        */

const DEFAULT_MODEL = 'gemini-2.5-flash-lite';
const API = 'https://generativelanguage.googleapis.com/v1beta/models/';

class QuotaError extends Error {
  constructor(message, { daily = false, retryMs = 0 } = {}) { super(message); this.daily = daily; this.retryMs = retryMs; }
}
class FatalError extends Error {}

const S = (description) => ({ type: 'STRING', description });
const LIST = (description) => ({ type: 'ARRAY', items: { type: 'STRING' }, description });
const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    characters: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: S('Exact identity string from the request, unchanged'),
          continuity: S('The specific continuity these facts come from (films, comic era, game series)'),
          summary: S('Two or three plain sentences on how this character fights'),
          offense: { type: 'OBJECT', properties: { domains: LIST('e.g. physical, energy, magic, tech, control'), techniques: LIST('Named attacks or methods'), range: S('melee / ranged / strategic') }, required: ['domains', 'techniques'] },
          defense: { type: 'OBJECT', properties: { mechanisms: LIST('How the character avoids or survives harm') }, required: ['mechanisms'] },
          weaknesses: LIST('Documented weaknesses; "not established" if none are documented'),
          feats: { type: 'ARRAY', items: { type: 'OBJECT', properties: { claim: S('One concrete feat'), citation: S('Film, episode, issue, game or scene where it happens'), source: { type: 'INTEGER', description: 'Index into sources[]' } }, required: ['claim', 'citation', 'source'] } },
          unknowns: LIST('Open questions, contradictions between versions, or claims you could not support'),
          formDifferences: S('Only for identities containing "|": what this form changes compared with the base character'),
          sources: { type: 'ARRAY', items: { type: 'OBJECT', properties: { url: S('A real https URL you are confident exists, preferably Wikipedia or the franchise wiki page for this character'), supports: S('Which claims this page supports') }, required: ['url', 'supports'] } },
        },
        required: ['id', 'continuity', 'summary', 'offense', 'defense', 'weaknesses', 'sources'],
      },
    },
  },
  required: ['characters'],
};

function describeIdentity(id) {
  const [pool, rest] = [id.slice(0, id.indexOf(':')), id.slice(id.indexOf(':') + 1)];
  const [name, form] = rest.split('|');
  return { id, pool, name, form: form || null };
}

function buildPrompt(ids) {
  const lines = ids.map((id) => {
    const d = describeIdentity(id);
    return '- ' + JSON.stringify(id) + (d.form ? ' (the "' + d.form + '" form/version of ' + d.name + ', researched separately from the base character)' : '');
  });
  return [
    'You are researching fictional characters for "Draft Anything", a game that simulates matchups between characters.',
    'Produce one combat profile for EACH identity below. Copy each id exactly.',
    ...lines,
    '',
    'Rules:',
    '- Describe only what the character has actually done in the stated continuity. Do not invent feats.',
    '- One credible source per ordinary claim is enough. Every feat must point at a sources[] index that supports it.',
    '- Only cite URLs you are confident exist (Wikipedia, the franchise wiki such as Fandom, official sites). Never invent or guess URLs. If unsure, cite fewer sources.',
    '- If versions of the character contradict each other, pick the continuity named in "continuity" and list the conflict in unknowns.',
    '- For identities containing "|", fill formDifferences with what that form changes.',
    '- No numeric power levels, tiers, scores or win percentages.',
  ].join('\n');
}

function parseRetryMs(err) {
  for (const d of (err && err.details) || []) {
    if (d.retryDelay) { const s = parseFloat(String(d.retryDelay)); if (Number.isFinite(s)) return Math.ceil(s * 1000); }
  }
  return 0;
}
function isDailyQuota(err) {
  const text = JSON.stringify(err || {});
  return /PerDay|per day|RequestsPerDay/i.test(text);
}

async function callGemini({ apiKey, model = DEFAULT_MODEL, prompt, fetchImpl = fetch }) {
  if (!apiKey) throw new FatalError('GEMINI_API_KEY is not set');
  const res = await fetchImpl(API + encodeURIComponent(model) + ':generateContent', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', responseSchema: RESPONSE_SCHEMA, temperature: 0.2 },
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 429) {
    throw new QuotaError('Gemini rate limit: ' + ((body.error && body.error.message) || '429'), { daily: isDailyQuota(body.error), retryMs: parseRetryMs(body.error) });
  }
  if (res.status >= 500) throw new QuotaError('Gemini server error ' + res.status, { retryMs: 20000 });
  if (!res.ok) throw new FatalError('Gemini request failed ' + res.status + ': ' + ((body.error && body.error.message) || ''));
  const text = (((body.candidates || [])[0] || {}).content || { parts: [] }).parts.map((p) => p.text || '').join('');
  if (!text) throw new QuotaError('Gemini returned no content (finishReason ' + (((body.candidates || [])[0] || {}).finishReason || 'none') + ')', { retryMs: 5000 });
  return JSON.parse(text);
}

function nameTokens(id) {
  const { name, form } = describeIdentity(id);
  const base = name.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  const words = base.split(/[\s\-.'’]+/).filter((w) => w.length >= 3);
  return { full: base.toLowerCase(), words: words.map((w) => w.toLowerCase()), form };
}

/* Fetch a cited page. Returns {keep, note}. Bot-blocked pages (401/403/429) are kept but flagged. */
async function checkSource(url, id, fetchImpl = fetch, timeoutMs = 15000) {
  let res;
  try {
    res = await fetchImpl(url, { redirect: 'follow', signal: AbortSignal.timeout(timeoutMs), headers: { 'user-agent': 'DraftAnything-V2-research-check/1.0 (+https://github.com/garrettem-op/Draft_Anything)' } });
  } catch (e) { return { keep: false, note: 'unreachable (' + (e.name || 'error') + ')' }; }
  if ([401, 403, 429].includes(res.status)) return { keep: true, note: 'not machine-checkable (HTTP ' + res.status + ')' };
  if (res.status >= 400) return { keep: false, note: 'HTTP ' + res.status };
  const type = (res.headers && res.headers.get && res.headers.get('content-type')) || '';
  if (!/html|text|json/i.test(type)) return { keep: true, note: 'non-HTML page, name not checked' };
  const text = (await res.text()).toLowerCase();
  const t = nameTokens(id);
  if (text.includes(t.full) || (t.words.length && t.words.some((w) => text.includes(w)))) return { keep: true, note: 'ok' };
  return { keep: false, note: 'page never mentions ' + t.full };
}

/* Turn raw model output into a validator-clean batch. Records that cannot be fixed are dropped. */
async function normalize(raw, ids, { checkUrl, checkBatch, known }) {
  const wanted = new Set(ids);
  const seen = new Set();
  const kept = [];
  const dropped = [];
  const flags = [];
  for (const p of (raw && Array.isArray(raw.characters) ? raw.characters : [])) {
    if (!p || typeof p !== 'object' || !wanted.has(p.id) || seen.has(p.id)) continue;
    seen.add(p.id);
    const rec = {
      id: p.id,
      continuity: p.continuity,
      summary: p.summary,
      offense: { domains: (p.offense && p.offense.domains) || [], techniques: (p.offense && p.offense.techniques) || [] },
      defense: { mechanisms: (p.defense && p.defense.mechanisms) || [] },
      weaknesses: p.weaknesses || [],
    };
    if (p.offense && p.offense.range) rec.offense.range = p.offense.range;
    if (p.id.includes('|')) rec.formDifferences = p.formDifferences;
    // Check every source; remap feat indexes; unsupported feats become unknowns.
    const map = new Map();
    const sources = [];
    for (const [i, s] of (Array.isArray(p.sources) ? p.sources : []).entries()) {
      if (!s || typeof s.url !== 'string' || !/^https:\/\//i.test(s.url)) continue;
      const r = await checkUrl(s.url, p.id);
      if (!r.keep) { flags.push(p.id + ': dropped source ' + s.url + ' (' + r.note + ')'); continue; }
      if (r.note !== 'ok') flags.push(p.id + ': ' + s.url + ' ' + r.note);
      map.set(i, sources.length);
      sources.push({ url: s.url, supports: s.supports });
    }
    rec.sources = sources;
    const unknowns = Array.isArray(p.unknowns) ? [...p.unknowns] : [];
    const feats = [];
    for (const f of Array.isArray(p.feats) ? p.feats : []) {
      if (!f || typeof f.claim !== 'string') continue;
      if (map.has(f.source)) feats.push({ claim: f.claim, citation: f.citation, source: map.get(f.source) });
      else unknowns.push('Unverified (cited source failed the automatic check): ' + f.claim);
    }
    if (feats.length) rec.feats = feats;
    if (unknowns.length) rec.unknowns = unknowns;
    rec.researchStatus = 'provisional';
    const errors = checkBatch('candidate.json', { batchId: 'candidate batch', schemaVersion: 1, characters: [rec] }, known);
    if (errors.length) { dropped.push({ id: p.id, why: errors.join('; ').replace(/candidate\.json: characters\[0\] /g, '') }); continue; }
    kept.push(rec);
  }
  for (const id of ids) if (!seen.has(id)) dropped.push({ id, why: 'missing from model output' });
  return { characters: kept, dropped, flags };
}

module.exports = { DEFAULT_MODEL, RESPONSE_SCHEMA, QuotaError, FatalError, buildPrompt, callGemini, checkSource, normalize, nameTokens, describeIdentity, isDailyQuota, parseRetryMs };

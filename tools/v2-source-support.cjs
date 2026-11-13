#!/usr/bin/env node
'use strict';
/* Source-support check for V2 research batches (research/option-c/batches/*.json).

   Why: the Gemini worker only proves a cited page is reachable and mentions the character's
   name. It never checks that the page backs the specific claim. This tool does a conservative
   term-support pass: for every feat, notable result, condition and campaign tag it fetches the
   cited page and checks that the claim's key terms appear there.

   - It only ever REMOVES claims (moving them into `unknowns` with the reason). It never adds,
     rewrites or upgrades anything, and it never touches `reviewed` records' status.
   - Pages it cannot read (blocked, dead, non-HTML) leave their claims untouched ("unchecked").
   - A record that loses most of its evidence is set to `needs-review`.
   - It checks that terms appear, NOT that the prose is semantically right. It is a floor, not
     a substitute for human or model judgment.

   Usage: node tools/v2-source-support.cjs [--dir <batches dir>] [--fix] [--summary <file.md>]
   Without --fix nothing is written. No API keys; only anonymous HTTPS fetches of cited URLs. */
const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_DIR = path.join(__dirname, '..', 'research', 'option-c', 'batches');
const UA = 'DraftAnything-V2-source-support/1.0 (+https://github.com/garrettem-op/Draft_Anything)';
const STOP = new Set(('that this with from into onto over under about after before their there they them then than have has had been being were was are and the for but not nor yet his her its our your who whom whose which what when where while during against between through within without also such very more most much many some any each both other another often only own same just can could would should may might will shall used using use uses able across around among being become became becomes character characters')
  .split(/\s+/));

const stem = (w) => w.slice(0, 5);
function tokens(text) {
  return String(text || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').match(/[a-z0-9]+/g) || [];
}
function nameWords(id) {
  const s = String(id || '').replace(/^[^:]*:/, '').replace(/\|/g, ' ').replace(/\([^)]*\)/g, ' ');
  return new Set(tokens(s));
}
/* Content words of a claim: not stopwords, not part of the character's own name, 4+ chars (or any number). */
function keyTerms(claim, id) {
  const name = nameWords(id);
  const seen = new Set();
  for (const t of tokens(claim)) {
    if (STOP.has(t) || name.has(t)) continue;
    if (t.length < 4 && !/^\d+$/.test(t)) continue;
    seen.add(t);
  }
  return [...seen];
}
function htmlToText(html) {
  return String(html || '')
    .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;|&#34;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&[a-z]+;|&#\d+;/gi, ' ');
}
function pageIndex(text) {
  const words = tokens(htmlToText(text));
  return { words: new Set(words), stems: new Set(words.map(stem)) };
}
/* Returns {supported, hits, need, total}. Terms match by exact word or 5-letter stem. */
function support(claim, id, page) {
  const terms = keyTerms(claim, id);
  if (terms.length === 0) return { supported: true, hits: 0, need: 0, total: 0, judged: false };
  const hits = terms.filter((t) => page.words.has(t) || page.stems.has(stem(t))).length;
  const need = terms.length >= 4 ? Math.max(2, Math.ceil(terms.length * 0.4)) : Math.max(1, Math.ceil(terms.length * 0.5));
  return { supported: hits >= need, hits, need, total: terms.length, judged: true };
}

/* Items of a record that cite a source: [listName, index, claimText, sourceIndex]. */
function evidence(rec) {
  const out = [];
  (rec.feats || []).forEach((f, i) => out.push(['feats', i, f.claim, f.source]));
  (rec.notableResults || []).forEach((r, i) => out.push(['notableResults', i, [r.result, r.opponent, r.note].filter(Boolean).join(' '), r.source]));
  (rec.conditional || []).forEach((c, i) => out.push(['conditional', i, [c.ability, c.dependsOn].filter(Boolean).join(' '), c.source]));
  (rec.campaignTags || []).forEach((t, i) => out.push(['campaignTags', i, t.claim, t.source]));
  return out;
}
function label(list, item) {
  if (list === 'feats') return item.claim;
  if (list === 'notableResults') return item.result + ' vs ' + item.opponent;
  if (list === 'conditional') return item.ability + ' depends on ' + item.dependsOn;
  return item.tag + ': ' + item.claim;
}
/* pages: Map(url -> page index | null when unreadable). Returns {record, removed, unchecked, kept}. */
function reviewRecord(rec, pages) {
  const next = JSON.parse(JSON.stringify(rec));
  const drop = new Map();
  let kept = 0, unchecked = 0;
  const removed = [];
  for (const [list, i, claim, si] of evidence(rec)) {
    const src = (rec.sources || [])[si];
    const page = src ? pages.get(src.url) : null;
    if (!page) { unchecked++; continue; }
    const s = support(claim, rec.id, page);
    if (s.supported) { kept++; continue; }
    if (!drop.has(list)) drop.set(list, new Set());
    drop.get(list).add(i);
    removed.push({ list, claim: label(list, rec[list][i]), hits: s.hits, need: s.need, total: s.total });
  }
  for (const [list, idx] of drop) {
    const left = next[list].filter((_, i) => !idx.has(i));
    if (left.length) next[list] = left; else delete next[list];
  }
  if (removed.length) {
    next.unknowns = [...(next.unknowns || []), ...removed.map((r) => 'Unsupported by cited source (term check, ' + r.hits + '/' + r.total + ' key terms found): ' + r.claim)];
    const total = kept + unchecked + removed.length;
    if (next.researchStatus !== 'reviewed' && (kept + unchecked === 0 || removed.length * 2 > total)) next.researchStatus = 'needs-review';
  }
  return { record: next, removed, unchecked, kept };
}

/* ---------- fetching ---------- */
function safeUrl(u) {
  try {
    const x = new URL(u);
    if (x.protocol !== 'https:') return false;
    const h = x.hostname;
    if (h === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(h) || h.includes(':') || !h.includes('.')) return false;
    return true;
  } catch { return false; }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/* Returns {page, reason}. page is null when unreadable; reason says why (for the report). */
async function fetchDetailed(url, fetchImpl = fetch, { timeoutMs = 20000, retries = 2, waitMs = 4000 } = {}) {
  if (!safeUrl(url)) return { page: null, reason: 'not a public https url' };
  let reason = 'unknown';
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchImpl(url, { redirect: 'follow', signal: AbortSignal.timeout(timeoutMs), headers: { 'user-agent': UA, accept: 'text/html,text/plain;q=0.9' } });
      if (res.status === 429 || res.status >= 500) {
        reason = 'HTTP ' + res.status;
        if (attempt < retries) { await sleep(waitMs * (attempt + 1)); continue; }
        return { page: null, reason };
      }
      if (res.status >= 400) return { page: null, reason: 'HTTP ' + res.status };
      const type = (res.headers && res.headers.get && res.headers.get('content-type')) || '';
      if (!/html|text/i.test(type)) return { page: null, reason: 'non-HTML (' + (type.split(';')[0] || 'no type') + ')' };
      return { page: pageIndex(await res.text()), reason: 'ok' };
    } catch (e) {
      reason = 'network (' + (e && e.name ? e.name : 'error') + ')';
      if (attempt < retries) await sleep(waitMs);
    }
  }
  return { page: null, reason };
}
async function fetchPage(url, fetchImpl = fetch, opts) { return (await fetchDetailed(url, fetchImpl, opts)).page; }
/* At most `perHost` requests at once to any one host; different hosts run in parallel. */
async function loadPages(urls, fetchImpl = fetch, { perHost = 2, reasons = new Map(), opts } = {}) {
  const pages = new Map();
  const byHost = new Map();
  for (const u of urls) { let h; try { h = new URL(u).hostname; } catch { h = ''; } if (!byHost.has(h)) byHost.set(h, []); byHost.get(h).push(u); }
  const workers = [];
  for (const queue of byHost.values()) {
    for (let i = 0; i < Math.min(perHost, queue.length); i++) {
      workers.push((async () => {
        while (queue.length) { const u = queue.pop(); const r = await fetchDetailed(u, fetchImpl, opts); pages.set(u, r.page); reasons.set(u, r.reason); }
      })());
    }
  }
  await Promise.all(workers);
  return pages;
}

/* ---------- batches ---------- */
async function scan(dir, { fix = false, fetchImpl = fetch, scanOpts } = {}) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  const batches = files.map((f) => ({ f, data: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) }));
  const urls = new Set();
  for (const b of batches) for (const r of b.data.characters || []) for (const s of r.sources || []) if (s && s.url) urls.add(s.url);
  const reasons = new Map();
  const pages = await loadPages(urls, fetchImpl, { reasons, opts: scanOpts });
  const failures = new Map();
  for (const [u, why] of reasons) if (!pages.get(u)) { let h = ''; try { h = new URL(u).hostname; } catch {} const k = h + ' — ' + why; failures.set(k, (failures.get(k) || 0) + 1); }
  const report = { unreadableBy: [...failures].sort((a, b) => b[1] - a[1]).slice(0, 12), files: files.length, records: 0, urls: urls.size, unreadable: [...pages.values()].filter((p) => !p).length, claimsKept: 0, claimsUnchecked: 0, claimsRemoved: 0, needsReview: [], changedFiles: [], detail: [] };
  for (const b of batches) {
    let changed = false;
    b.data.characters = (b.data.characters || []).map((rec) => {
      report.records++;
      const r = reviewRecord(rec, pages);
      report.claimsKept += r.kept; report.claimsUnchecked += r.unchecked; report.claimsRemoved += r.removed.length;
      if (r.removed.length) {
        changed = true;
        report.detail.push({ file: b.f, id: rec.id, removed: r.removed.length, status: r.record.researchStatus });
        if (r.record.researchStatus === 'needs-review' && rec.researchStatus !== 'needs-review') report.needsReview.push(rec.id);
      }
      return r.record;
    });
    if (changed) {
      report.changedFiles.push(b.f);
      if (fix) fs.writeFileSync(path.join(dir, b.f), JSON.stringify(b.data, null, 2) + '\n');
    }
  }
  return report;
}
function markdown(rep, fixed) {
  const lines = [
    '## V2 source-support check' + (fixed ? ' (corrections applied)' : ' (report only)'),
    '',
    `Scanned ${rep.files} batch files, ${rep.records} records, ${rep.urls} cited URLs (${rep.unreadable} unreadable by the runner; their claims were left alone).`,
    `Claims: ${rep.claimsKept} supported, ${rep.claimsUnchecked} unchecked, **${rep.claimsRemoved} unsupported**${fixed ? ' (moved to `unknowns`)' : ''}.`,
    `Records newly set to needs-review: ${rep.needsReview.length}.`,
    '',
    'This pass checks that a claim\'s key terms appear on its cited page. It does not judge whether the prose is semantically right.',
  ];
  if (rep.unreadableBy && rep.unreadableBy.length) {
    lines.push('', 'Why pages were unreadable (host — reason: URLs):');
    for (const [k, n] of rep.unreadableBy) lines.push(`- ${k}: ${n}`);
  }
  if (rep.detail.length) {
    lines.push('', '<details><summary>Records with removed claims (' + rep.detail.length + ')</summary>', '');
    for (const d of rep.detail.slice(0, 400)) lines.push(`- \`${d.id}\` (${d.file}): ${d.removed} removed → ${d.status}`);
    lines.push('', '</details>');
  }
  return lines.join('\n') + '\n';
}

async function main(argv) {
  const arg = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
  const dir = path.resolve(arg('--dir') || DEFAULT_DIR);
  const fix = argv.includes('--fix');
  const rep = await scan(dir, { fix });
  const md = markdown(rep, fix);
  process.stdout.write(md);
  const out = arg('--summary');
  if (out) fs.writeFileSync(out, md);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
  return rep;
}
if (require.main === module) main(process.argv.slice(2)).catch((e) => { console.error(e); process.exit(1); });

module.exports = { keyTerms, htmlToText, pageIndex, support, evidence, reviewRecord, safeUrl, fetchPage, fetchDetailed, loadPages, scan, markdown, nameWords };

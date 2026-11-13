/* Option C — research ledger (read-only index of validated research batches).
 *
 * Indexes the JSON batches in research/option-c/batches/ by exact identity
 * (`pool:Character` or `pool:Character|Form`) so profiles and assessments can
 * REPORT what research exists and how much of it is reviewed.
 *
 * Hard boundaries (shadow-mode parity):
 *  - The ledger starts EMPTY. Nothing is loaded unless a caller opts in
 *    (`loadDir` in Node, `register` anywhere), so default behavior is unchanged.
 *  - It only describes evidence. It never supplies a power, tier, rating,
 *    probability or win condition, and nothing here feeds the probability model.
 *  - `provisional` / `needs-review` records are never presented as reviewed;
 *    claims listed in `unknowns` stay unknown, and a missing record is `none`,
 *    not a researched "no".
 *  - Inputs are never mutated; returned records are frozen copies.
 */
(function (root) {
  'use strict';
  const NS = root.DA_OPTION_C_MODULES || (root.DA_OPTION_C_MODULES = {});
  const isNode = typeof module !== 'undefined' && !!module.exports && typeof require === 'function';
  const STATUSES = Object.freeze(['reviewed', 'provisional', 'needs-review']);
  const RANK = Object.freeze({ reviewed: 3, provisional: 2, 'needs-review': 1 });

  function deepFreeze(o) {
    if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); Object.values(o).forEach(deepFreeze); }
    return o;
  }
  const clone = v => JSON.parse(JSON.stringify(v));

  function createLedger() {
    const byId = new Map(); // id -> { record, batchId }
    const conflicts = [];
    const rejected = [];

    function register(batch, label) {
      const batchId = (batch && batch.batchId) || label || 'unnamed-batch';
      if (!batch || !Array.isArray(batch.characters)) { rejected.push({ batchId, reason: 'no characters array' }); return 0; }
      let added = 0;
      for (const rec of batch.characters) {
        if (!rec || typeof rec.id !== 'string' || rec.id.indexOf(':') < 1) { rejected.push({ batchId, reason: 'missing pool-qualified id' }); continue; }
        if (!STATUSES.includes(rec.researchStatus)) { rejected.push({ batchId, id: rec.id, reason: 'unknown researchStatus ' + rec.researchStatus }); continue; }
        if (rec.researchStatus === 'reviewed' && !(rec.reviewedBy && rec.reviewNotes)) {
          rejected.push({ batchId, id: rec.id, reason: 'reviewed without reviewedBy/reviewNotes' }); continue;
        }
        if (byId.has(rec.id)) { conflicts.push({ id: rec.id, batchId, keptFrom: byId.get(rec.id).batchId, reason: 'duplicate id; first registered record kept' }); continue; }
        byId.set(rec.id, { record: deepFreeze(clone(rec)), batchId });
        added++;
      }
      return added;
    }

    /* Node only: load every *.json batch in a directory (sorted for determinism). */
    function loadDir(dir) {
      if (!isNode) throw new Error('loadDir is available in Node only');
      const fs = require('fs'), path = require('path');
      let n = 0;
      for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.json')).sort()) {
        let batch;
        try { batch = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { rejected.push({ batchId: f, reason: 'unparseable JSON' }); continue; }
        n += register(batch, f);
      }
      return n;
    }

    /* Evidence view of one identity. Form ids never fall back to the base record. */
    function lookup(id) {
      const hit = byId.get(String(id));
      if (!hit) return { id: String(id), status: 'none', batchId: null, record: null, unknowns: [], note: 'No research record; abilities are unknown, not absent.' };
      const r = hit.record;
      return {
        id: r.id, status: r.researchStatus, batchId: hit.batchId, record: r,
        unknowns: Array.isArray(r.unknowns) ? r.unknowns.slice() : [],
        note: r.researchStatus === 'reviewed' ? 'Independently reviewed research.' : 'Provisional research: not independently verified; unknowns remain unknown.',
      };
    }

    /* Coverage over a set of identities (counts only; no scoring). */
    function coverage(ids) {
      const list = Array.from(new Set((ids || []).map(String)));
      const out = { identities: list.length, reviewed: 0, provisional: 0, needsReview: 0, none: 0, withUnknowns: 0 };
      for (const id of list) {
        const v = lookup(id);
        if (v.status === 'reviewed') out.reviewed++;
        else if (v.status === 'provisional') out.provisional++;
        else if (v.status === 'needs-review') out.needsReview++;
        else out.none++;
        if (v.unknowns.length) out.withUnknowns++;
      }
      return out;
    }

    return {
      register, loadDir, lookup, coverage,
      size: () => byId.size, conflicts: () => conflicts.slice(), rejected: () => rejected.slice(),
      ids: () => Array.from(byId.keys()).sort(),
    };
  }

  /* Shared default ledger: empty until a caller registers batches. */
  const shared = createLedger();
  const api = { STATUSES, RANK, createLedger, shared };
  NS.researchLedger = api;
  if (isNode) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

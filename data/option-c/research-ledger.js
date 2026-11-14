/* Option C — research ledger (read-only index of validated research batches).
 *
 * Indexes the JSON batches in research/option-c/batches/ by exact identity
 * (`pool:Character` or `pool:Character|Form`) so profiles and assessments can
 * REPORT what research exists and what status each record declares.
 *
 * Hard boundaries (shadow-mode parity):
 *  - The ledger starts EMPTY. Nothing is loaded unless a caller opts in
 *    (`loadDir` in Node, `register` anywhere), so default behavior is unchanged.
 *  - It only describes evidence. It never supplies a power, tier, rating,
 *    probability or win condition, and nothing here feeds the probability model.
 *  - Fail-closed ingestion: a batch is registered only after it passes a
 *    validator. In Node the default validator is the canonical one
 *    (tools/v2-research-pipeline.cjs checkBatch: schema, sources, exact current
 *    roster/form ids, closed tag vocabulary). Elsewhere a validator must be
 *    configured; without one nothing is registered. A batch with ANY error,
 *    duplicate id or id already in the ledger is rejected whole (no partial
 *    registration). `loadDir` throws on any unparseable, invalid or duplicate
 *    file and registers nothing.
 *  - Status is RECORD-DECLARED. `researchStatus`, `reviewedBy` and
 *    `reviewNotes` are claims written inside the record. The ledger has no
 *    GitHub approval or merge provenance, so it never describes a record as
 *    independently reviewed or verified; it reports `statusBasis:
 *    'record-declared'` and counts `declaredReviewed`, not "reviewed".
 *  - A missing record is `none` (unknown), not a researched "no"; a form never
 *    inherits its base record. Inputs are never mutated; stored records are
 *    frozen copies.
 */
(function (root) {
  'use strict';
  const NS = root.DA_OPTION_C_MODULES || (root.DA_OPTION_C_MODULES = {});
  const isNode = typeof module !== 'undefined' && !!module.exports && typeof require === 'function';
  const STATUSES = Object.freeze(['reviewed', 'provisional', 'needs-review', 'unknown']);
  const RANK = Object.freeze({ reviewed: 3, provisional: 2, 'needs-review': 1, unknown: 0 });
  const STATUS_BASIS = 'record-declared';

  function deepFreeze(o) {
    if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); Object.values(o).forEach(deepFreeze); }
    return o;
  }
  const clone = v => JSON.parse(JSON.stringify(v));

  /* Node only: the canonical validator from the research pipeline, bound to the
   * current roster/form ids and campaign tag vocabulary. Built lazily once. */
  let nodeValidator = null;
  function canonicalValidator() {
    if (!isNode) throw new Error('canonicalValidator is available in Node only');
    if (!nodeValidator) {
      const P = require('../../tools/v2-research-pipeline.cjs');
      const roster = new Set(P.rosterIds()), tags = new Set(P.abilityTagVocabulary());
      nodeValidator = (batch, label) => P.checkBatch(label || 'batch', batch, roster, tags);
    }
    return nodeValidator;
  }

  function createLedger(options) {
    const opts = options || {};
    let validate = typeof opts.validate === 'function' ? opts.validate : null;
    const byId = new Map(); // id -> { record, batchId }
    const conflicts = [];
    const rejected = [];

    function validator() {
      if (validate) return validate;
      if (isNode && opts.validate !== false) return (validate = canonicalValidator());
      return null;
    }

    /* Set the validator once (e.g. a browser bundle loader). Never replaced. */
    function configure(cfg) {
      if (!cfg || typeof cfg.validate !== 'function') throw new TypeError('configure needs a validate(batch, label) function');
      if (validate) throw new Error('research ledger validator is already configured');
      validate = cfg.validate;
    }

    /* Everything wrong with a batch, without registering it. `pending` holds ids
     * accepted earlier in the same loadDir pass. */
    function problems(batch, batchId, pending) {
      const v = validator();
      if (!v) return { errors: ['no research validator configured; batch not registered (fail-closed)'], dupes: [] };
      let errors;
      try { errors = v(batch, batchId); } catch (e) { errors = ['validator threw: ' + (e && e.message)]; }
      errors = Array.isArray(errors) ? errors.map(String) : ['validator returned no error list'];
      const dupes = [], seen = new Set();
      for (const rec of (batch && Array.isArray(batch.characters)) ? batch.characters : []) {
        const id = rec && rec.id;
        if (typeof id !== 'string') continue;
        if (seen.has(id)) dupes.push({ id, batchId, keptFrom: batchId, reason: 'duplicate id within batch' });
        else if (byId.has(id)) dupes.push({ id, batchId, keptFrom: byId.get(id).batchId, reason: 'id already registered' });
        else if (pending && pending.has(id)) dupes.push({ id, batchId, keptFrom: pending.get(id), reason: 'duplicate id across batches' });
        seen.add(id);
      }
      return { errors, dupes };
    }

    function commit(batch, batchId) {
      for (const rec of batch.characters) byId.set(rec.id, { record: deepFreeze(clone(rec)), batchId });
      return batch.characters.length;
    }

    /* Register one batch atomically: all of its records or none. Returns the
     * number added; diagnostics are in rejected() / conflicts(). */
    function register(batch, label) {
      const batchId = (batch && typeof batch.batchId === 'string' && batch.batchId) || label || 'unnamed-batch';
      const { errors, dupes } = problems(batch, batchId, null);
      if (errors.length || dupes.length) {
        if (errors.length) rejected.push({ batchId, reasons: errors });
        conflicts.push(...dupes);
        return 0;
      }
      return commit(batch, batchId);
    }

    /* Node only: canonical ingestion of every *.json batch in a directory.
     * Fail-closed: any unparseable, invalid or duplicate file throws and NOTHING
     * from the directory is registered. Diagnostics stay on rejected()/conflicts()
     * and on the thrown error's `.diagnostics`. */
    function loadDir(dir) {
      if (!isNode) throw new Error('loadDir is available in Node only');
      const fs = require('fs'), path = require('path');
      const files = fs.readdirSync(dir).filter(x => x.endsWith('.json')).sort();
      const pending = new Map(), ok = [], bad = [], dup = [];
      for (const f of files) {
        let batch;
        try { batch = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
        catch (e) { bad.push({ batchId: f, reasons: ['unparseable JSON: ' + e.message] }); continue; }
        const { errors, dupes } = problems(batch, f, pending);
        if (errors.length) bad.push({ batchId: f, reasons: errors });
        dup.push(...dupes);
        if (!errors.length && !dupes.length) {
          for (const rec of batch.characters) pending.set(rec.id, f);
          ok.push([batch, f]);
        }
      }
      if (bad.length || dup.length) {
        rejected.push(...bad); conflicts.push(...dup);
        const err = new Error('research ledger refused ' + dir + ': ' + bad.length + ' invalid file(s), ' + dup.length + ' duplicate id(s); nothing registered');
        err.diagnostics = { rejected: bad, conflicts: dup };
        throw err;
      }
      return ok.reduce((n, [batch, f]) => n + commit(batch, f), 0);
    }

    /* Evidence view of one identity. Form ids never fall back to the base record. */
    function lookup(id) {
      const hit = byId.get(String(id));
      if (!hit) return { id: String(id), status: 'none', statusBasis: null, batchId: null, record: null, unknowns: [], note: 'No research record; abilities are unknown, not absent.' };
      const r = hit.record;
      return {
        id: r.id, status: r.researchStatus, statusBasis: STATUS_BASIS, batchId: hit.batchId, record: r,
        unknowns: Array.isArray(r.unknowns) ? r.unknowns.slice() : [],
        note: r.researchStatus === 'reviewed'
          ? 'Record-declared review status: the record names a reviewer, but the ledger holds no GitHub approval or merge provenance to verify it.'
          : 'Record-declared ' + r.researchStatus + ' research: not independently verified; unknowns remain unknown.',
      };
    }

    /* Coverage over a set of identities (counts only; no scoring). Each distinct
     * identity is counted exactly once; base and form ids are distinct. */
    function coverage(ids) {
      const list = Array.from(new Set((ids || []).map(String)));
      const out = { identities: list.length, statusBasis: STATUS_BASIS, declaredReviewed: 0, provisional: 0, needsReview: 0, unknown: 0, none: 0, withUnknowns: 0 };
      for (const id of list) {
        const v = lookup(id);
        if (v.status === 'reviewed') out.declaredReviewed++;
        else if (v.status === 'provisional') out.provisional++;
        else if (v.status === 'needs-review') out.needsReview++;
        else if (v.status === 'unknown') out.unknown++;
        else out.none++;
        if (v.unknowns.length) out.withUnknowns++;
      }
      return out;
    }

    return {
      register, loadDir, lookup, coverage, configure,
      hasValidator: () => !!validator(),
      size: () => byId.size, conflicts: () => conflicts.slice(), rejected: () => rejected.slice(),
      ids: () => Array.from(byId.keys()).sort(),
    };
  }

  /* Shared default ledger: empty until a caller registers batches. */
  const shared = createLedger();
  const api = { STATUSES, RANK, STATUS_BASIS, createLedger, shared };
  if (isNode) api.canonicalValidator = canonicalValidator;
  NS.researchLedger = api;
  if (isNode) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

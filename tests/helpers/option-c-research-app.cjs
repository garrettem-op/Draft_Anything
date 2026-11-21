/* Test/report helper: the real app page whose shared research ledger holds every
 * checked-in research batch (validated by the canonical validator). The default
 * page has an empty ledger; this is only for the opt-in research-derived path. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { loadApp, root } = require('./option-c-app-harness.cjs');
const L = require('../../data/option-c/research-ledger.js');

// The opt-in research-record path is tested with V2 research moves off: a live move would take the
// signature first (tests/research-moves.test.cjs covers that path).
function loadAppWithResearch() {
  const app = loadApp({ search: '?researchPowers=0' });
  app.sandbox.__ocValidate = L.canonicalValidator();
  app.run('DA_OPTION_C_MODULES.researchLedger.shared.configure({ validate: __ocValidate }); delete globalThis.__ocValidate;');
  const dir = path.join(root, 'research/option-c/batches');
  for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.json')).sort()) {
    app.run('DA_OPTION_C_MODULES.researchLedger.shared.register(' + fs.readFileSync(path.join(dir, f), 'utf8') + ', ' + JSON.stringify(f) + ')');
  }
  return app;
}
module.exports = { loadAppWithResearch };

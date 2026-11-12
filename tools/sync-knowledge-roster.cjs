// Keep the Edge Function's server-side allowlist in sync with playable seed pools.
// Usage: node tools/sync-knowledge-roster.cjs [--check]
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const rosterPath = path.join(root, 'supabase/functions/character-knowledge/roster.json');

function buildRoster() {
  const roster = JSON.parse(fs.readFileSync(rosterPath, 'utf8'));
  const dir = path.join(root, 'data');
  const seeds = fs.readdirSync(dir).filter(file => /^pools-.*\.js$/.test(file)).sort();
  for (const file of seeds) {
    let registrations = 0;
    const window = { DA_REGISTER_POOL(id, label, shortLabel, description, raw) {
      if (typeof id !== 'string' || typeof raw !== 'string') {
        throw new Error(file + ': invalid pool seed');
      }
      const names = raw.split('\n').map(row => row.split('|')[0].trim()).filter(Boolean);
      if (!names.length || new Set(names).size !== names.length) {
        throw new Error(file + ': empty or duplicate character name');
      }
      roster[id] = names;
      registrations++;
    }};
    vm.runInNewContext(fs.readFileSync(path.join(dir, file), 'utf8'),
      { window }, { filename: file, timeout: 2000 });
    if (registrations !== 1) throw new Error(file + ': expected one pool registration');
  }
  return roster;
}

if (require.main === module) {
  const next = JSON.stringify(buildRoster()) + '\n';
  const current = fs.readFileSync(rosterPath, 'utf8');
  if (process.argv.includes('--check')) {
    if (next !== current) {
      console.error('Knowledge roster is stale. Run node tools/sync-knowledge-roster.cjs');
      process.exitCode = 1;
    } else {
      console.log('Knowledge roster matches all playable seed pools.');
    }
  } else {
    fs.writeFileSync(rosterPath, next);
    console.log('Updated knowledge roster.');
  }
}

module.exports = { buildRoster };

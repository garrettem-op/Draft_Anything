/* The edge function's validator (supabase/gauntlet/functions/submit-votes/index.ts) must agree with the client's. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const G = require('../data/gauntlet.js');

const src = fs.readFileSync(path.resolve(__dirname, '../supabase/gauntlet/functions/submit-votes/index.ts'), 'utf8');
const between = (a, b) => src.slice(src.indexOf(a) + a.length, src.indexOf(b));
const consts = src.match(/const (ID_RE|SESSION_RE|TWO_YEARS) = [^\n]+;/g).join('\n');
const js = (consts + '\nconst poolOf = id => id.split(":")[0];\n' + between('// VALIDATE-START', '// VALIDATE-END'))
  .replace('function validate(v: any): string | null', 'function validate(v)');
const serverValidate = new Function(js + '\nreturn validate;')();

const base = () => G.makeVote({ left: 'mcu:thor', right: 'dc:batman' }, 'left', { session: 'abcdefgh1', seq: 0 });

test('server validator agrees with the client validator', () => {
  const clone = v => JSON.parse(JSON.stringify(v));
  const cases = [
    v => v,
    v => { v.winner = 'mcu:nobody'; }, v => { v.key = 'wrong'; }, v => { v.pools = ['mcu']; }, v => { v.a = v.b; },
    v => { v.ts = 'never'; }, v => { v.confidence = 'huge'; }, v => { v.session = 'A!'; }, v => { v.outcome = 'maybe'; },
    v => { v.outcome = 'tie'; }, v => { v.outcome = 'tie'; v.winner = null; }, v => { v.outcome = 'skip'; v.winner = null; },
    v => { v.left = v.right; }, v => { v.id = 'x'; }, v => { v.v = 2; }, v => { v.model = ''; }, v => { v.a = 'Bad ID'; },
    v => { [v.a, v.b] = [v.b, v.a]; v.key = v.a + '|' + v.b; }, v => { v.confidence = 'lean'; }, v => { v.confidence = null; },
    v => { v.a = 'mcu:thor#form-1'; v.key = v.a + '|' + v.b; v.left = v.a; v.right = v.b; v.winner = v.a; v.pools = ['dc', 'mcu']; },
  ];
  for (const mutate of cases) {
    const v = clone(base()); mutate(v);
    const client = G.validateVote(v).ok, server = serverValidate(v) === null;
    assert.equal(server, client, 'disagree on ' + JSON.stringify(mutate.toString()));
  }
  for (const junk of [null, 5, 'x', [], {}]) assert.notEqual(serverValidate(junk), null);
});

test('migration keeps the same rules and the repeat policy is documented in the schema', () => {
  const sql = fs.readFileSync(path.resolve(__dirname, '../supabase/gauntlet/migrations/001_gauntlet_votes_v1.sql'), 'utf8');
  assert.match(sql, /id text primary key/);
  assert.match(sql, /enable row level security/);
  assert.match(sql, /revoke all on public\.gauntlet_votes from anon, authenticated/);
  assert.match(sql, /Separate votes on the same\s+-- matchup/);
  assert.ok(sql.includes("'^[a-z0-9]{8,32}$'"));
});

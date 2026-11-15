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

test('function only allows the game site (and localhost for development) to post from a browser', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'gauntlet', 'functions', 'submit-votes', 'index.ts'), 'utf8');
  assert.doesNotMatch(src, /Allow-Origin": "\*"/);
  const list = /const ALLOWED_ORIGINS = (\[[^\]]*\])/.exec(src);
  assert.ok(list);
  assert.deepEqual(JSON.parse(list[1]), ['https://garrettem-op.github.io']);
  const local = /const LOCAL_ORIGIN = (\/.*\/);/.exec(src);
  const re = eval(local[1]);
  assert.ok(re.test('http://localhost:8000') && re.test('http://127.0.0.1'));
  assert.ok(!re.test('https://localhost') && !re.test('http://localhost.evil.com') && !re.test('http://evil.com/localhost'));
});

test('public summary migration exposes counts only and is callable by the public key', () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'gauntlet', 'migrations', '002_public_aggregate.sql'), 'utf8');
  assert.match(sql, /grant execute on function public\.gauntlet_public_aggregate\(\) to anon/);
  assert.match(sql, /security definer/);
  assert.match(sql, /set search_path = ''/);
  for (const secret of ['session', 'ts', 'received_at', 'winner']) {
    const body = sql.slice(sql.indexOf('create or replace function'));
    if (secret === 'session') continue; // only used inside count(distinct session)
    assert.doesNotMatch(body, new RegExp("'" + secret + "'"));
  }
  assert.doesNotMatch(sql, /'session'\s*,\s*session/);
});

test('publishing workflow needs no secret, runs no repo code with write access, and is scheduled', () => {
  const wf = fs.readFileSync(path.join(__dirname, '..', '.github', 'workflows', 'gauntlet-publish.yml'), 'utf8');
  assert.doesNotMatch(wf, /secrets\./);
  assert.match(wf, /schedule:/);
  const publish = wf.slice(wf.indexOf('\n  publish:'));
  assert.match(publish, /contents: write/);
  assert.doesNotMatch(publish, /actions\/checkout/);
  assert.doesNotMatch(publish, /node /);
  const build = wf.slice(wf.indexOf('\n  build:'), wf.indexOf('\n  publish:'));
  assert.match(build, /contents: read/);
  assert.doesNotMatch(build, /contents: write/);
  assert.match(wf, /sb_publishable_/);
  assert.doesNotMatch(wf, /service_role|eyJ/);
});

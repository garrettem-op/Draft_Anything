/* Guards research/option-c/mcu-version-gap.json: every MCU roster entry appears exactly once with valid fields. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const slug = n => String(n).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'x';

test('MCU version gap list covers the roster exactly once', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const start = html.indexOf('POOLS.mcu = '), end = html.indexOf('\n]};', start);
  const roster = [...html.slice(start, end).matchAll(/^\["((?:[^"\\]|\\.)*)","/gm)].map(m => 'mcu:' + slug(m[1]));
  const data = JSON.parse(fs.readFileSync(path.join(root, 'research/option-c/mcu-version-gap.json'), 'utf8'));
  assert.equal(data.schema, 'draft-anything.mcu-version-gap');
  const ids = data.characters.map(c => c.id);
  assert.equal(new Set(ids).size, ids.length, 'no duplicate ids');
  assert.deepEqual([...ids].sort(), [...roster].sort(), 'same characters as the MCU roster');
  for (const c of data.characters) {
    assert.ok(Number.isInteger(c.gap) && c.gap >= 0 && c.gap <= 5, c.id);
    assert.ok(['up', 'side', 'down'].includes(c.direction), c.id);
    assert.ok(c.film && c.comics, c.id);
    assert.ok(['comics', 'hybrid', 'film+notes', 'choose', 'film'].includes(c.suggestedPrimary), c.id);
    assert.ok(c.primary === null || ['comics', 'film', 'hybrid'].includes(c.primary), c.id);
  }
});

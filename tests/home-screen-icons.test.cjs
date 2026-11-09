const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file));
const manifest = JSON.parse(read('manifest.webmanifest').toString('utf8'));
const html = read('index.html').toString('utf8');

function pngDimensions(file) {
  const bytes = read(file);
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], file + ' PNG signature');
  assert.equal(bytes.toString('ascii', 12, 16), 'IHDR', file + ' PNG IHDR');
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

test('Version 1 crest is installed as complete favicon and home-screen files', () => {
  for (const [filename, size] of [
    ['icons/favicon-32.png', 32],
    ['icons/apple-touch-icon.png', 180],
    ['icons/icon-192.png', 192],
    ['icons/icon-512.png', 512]
  ]) {
    assert.deepEqual(pngDimensions(filename), [size, size]);
    assert.ok(read(filename).length > 100, filename + ' should be a nonempty image');
  }
  const ico = read('favicon.ico');
  assert.equal(ico.readUInt16LE(0), 0);
  assert.equal(ico.readUInt16LE(2), 1);
  assert.ok(ico.readUInt16LE(4) >= 3, 'favicon.ico should include several resolutions');
});

test('GitHub Pages manifest scope is correct and every icon is valid', () => {
  assert.equal(manifest.name, 'Draft Anything');
  assert.equal(manifest.start_url, '/Draft_Anything/');
  assert.equal(manifest.scope, '/Draft_Anything/');
  assert.equal(manifest.id, '/Draft_Anything/');
  assert.equal(manifest.display, 'standalone');
  const sizes = new Set(manifest.icons.map(icon => icon.sizes));
  for (const size of ['192x192', '512x512']) assert.ok(sizes.has(size), size);
  for (const icon of manifest.icons) {
    assert.equal(icon.type, 'image/png');
    assert.ok(!icon.src.startsWith('/'), 'relative icon assets work under project path');
    const dimensions = icon.sizes.split('x').map(Number);
    assert.deepEqual(pngDimensions(icon.src), dimensions);
  }
});

test('HTML loads the manifest and distinct Apple/browser icons', () => {
  const head = html.split('</head>')[0];
  assert.match(head, /<link rel="manifest" href="manifest\.webmanifest">/);
  assert.match(head, /<link rel="apple-touch-icon" sizes="180x180" href="icons\/apple-touch-icon\.png">/);
  assert.match(head, /<link rel="icon" href="favicon\.ico" sizes="any">/);
  assert.match(head, /<meta name="apple-mobile-web-app-title" content="Draft Anything">/);
  assert.match(head, /<meta name="theme-color" content="#07142e">/);
  assert.equal((head.match(/rel="manifest"/g) || []).length, 1);
});

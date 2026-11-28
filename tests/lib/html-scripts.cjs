/* Shared helper for tests that check how index.html loads its scripts.
   Deployment cache busting appends a version token to some script URLs
   (e.g. data/campaign.js?v=20261126-terminal-loss). Tests must still verify the
   real integration safeguards: the script is loaded, loaded exactly once, and in the
   right order. They must not depend on whether a given script currently carries a token. */
const fs = require('node:fs');
const path = require('node:path');

const INDEX = path.join(__dirname, '../../index.html');
const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function readIndexHtml() {
  return fs.readFileSync(INDEX, 'utf8');
}

/* Matches <script src="SRC"></script> or <script src="SRC?v=TOKEN"></script>. The token is
   restricted to URL-safe version characters so a malformed or empty token still fails. */
function scriptTagPattern(src, flags = '') {
  return new RegExp('<script src="' + escape(src) + '(?:\\?v=[A-Za-z0-9._-]+)?"></script>', flags);
}

/* Every <script src=...> tag for this exact path, versioned or not. */
function scriptTags(html, src) {
  return [...html.matchAll(scriptTagPattern(src, 'g'))];
}

/* Index of the single <script> tag that loads src. Throws if it is missing, loaded more than once,
   or referenced with a malformed URL, so callers can compare positions safely. */
function scriptIndex(html, src) {
  const tags = scriptTags(html, src);
  if (tags.length !== 1) throw new Error(src + ' must be loaded exactly once; found ' + tags.length);
  const loose = [...html.matchAll(new RegExp('<script[^>]*src="' + escape(src) + '[^"]*"', 'g'))];
  if (loose.length !== 1) throw new Error(src + ' has a malformed or duplicate script reference');
  return tags[0].index;
}

/* The version token on a script URL, or null when it is unversioned. */
function scriptVersion(html, src) {
  const m = html.match(new RegExp('<script src="' + escape(src) + '\\?v=([A-Za-z0-9._-]+)"></script>'));
  return m ? m[1] : null;
}

module.exports = { readIndexHtml, scriptTagPattern, scriptTags, scriptIndex, scriptVersion };

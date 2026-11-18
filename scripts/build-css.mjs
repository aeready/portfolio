#!/usr/bin/env node
// Builds web/site.css: the six page stylesheets joined in load order, comments removed,
// whitespace collapsed. The cascade is unchanged because order is unchanged.
//
//   node scripts/build-css.mjs          write web/site.css
//   node scripts/build-css.mjs --check  exit 1 if web/site.css is stale (used by validate)
//
// Edit the SOURCE sheets (edition.css etc.), never site.css. Upload site.css with the other files.
// 404.html keeps its own sheet list (it never loaded edition.css), so it is not bundled.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..', 'web');
export const ORDER = ['style.css', 'overhaul-v2.css', 'refine.css', 'press.css', 'edition.css', 'fixes.css'];

// String- and url()-aware minifier. Only removes comments and redundant whitespace around { } ; , and newlines.
export function minify(css) {
  let out = '';
  let i = 0;
  const n = css.length;
  const push = s => { out += s; };
  while (i < n) {
    const c = css[i];
    if (c === '/' && css[i + 1] === '*') { // comment
      const end = css.indexOf('*/', i + 2);
      i = end === -1 ? n : end + 2;
      continue;
    }
    if (c === '"' || c === "'") { // string, copied verbatim
      let j = i + 1;
      while (j < n && css[j] !== c) { if (css[j] === '\\') j++; j++; }
      push(css.slice(i, j + 1)); i = j + 1; continue;
    }
    if ((c === 'u' || c === 'U') && /^url\(/i.test(css.slice(i, i + 4))) { // url(...) verbatim
      let j = i + 4;
      if (css[j] === '"' || css[j] === "'") { const q = css[j]; j++; while (j < n && css[j] !== q) { if (css[j] === '\\') j++; j++; } j++; }
      while (j < n && css[j] !== ')') j++;
      push(css.slice(i, j + 1)); i = j + 1; continue;
    }
    if (/\s/.test(c)) { // whitespace run -> single space, or nothing next to { } ; ,
      let j = i; while (j < n && /\s/.test(css[j])) j++;
      const prev = out[out.length - 1];
      const next = css[j];
      if (!(prev === undefined || '{};,'.includes(prev) || next === undefined || '{};,}'.includes(next) || next === '/')) push(' ');
      i = j; continue;
    }
    push(c); i++;
  }
  // a space before a comment that was then removed can survive; tidy " ;" and " }" and " {"
  return out.replace(/\s+([;{}])/g, '$1').replace(/;}/g, '}').trim() + '\n';
}

export function build() {
  return ORDER.map(f => minify(readFileSync(join(web, f), 'utf8'))).join('');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = join(web, 'site.css');
  const built = build();
  if (process.argv.includes('--check')) {
    if (!existsSync(out) || readFileSync(out, 'utf8') !== built) {
      console.error('web/site.css is stale. Run: node scripts/build-css.mjs');
      process.exit(1);
    }
    console.log('site.css is up to date');
  } else {
    writeFileSync(out, built);
    console.log(`web/site.css written, ${built.length} bytes from ${ORDER.length} sheets`);
  }
}

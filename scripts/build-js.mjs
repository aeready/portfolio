#!/usr/bin/env node
// Bundles and minifies the site scripts into ONE hashed file: web/site--<hash>.js.
// press-boot.js stays separate (tiny, render-blocking, prevents the intro/motion flash).
// Each source is a classic script (IIFE or window.* assignment), so files are minified one by one
// and joined in load order; no module semantics change.
//
//   node scripts/build-js.mjs          write the bundle, delete older bundles, update index.html
//   node scripts/build-js.mjs --check  exit 1 if the bundle or index.html is stale
import {readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {transformSync} from 'esbuild';

const web = join(dirname(fileURLToPath(import.meta.url)), '..', 'web');
export const ORDER = ['preview-assets.js', 'projects.js', 'locales.js', 'originals.js', 'downloads.js', 'cards.js', 'app.js', 'press.js', 'edition.js'];

export function bundle() {
  const code = ORDER.map(f => transformSync(readFileSync(join(web, f), 'utf8'), {minify: true, target: 'es2020', legalComments: 'none'}).code.trim().replace(/;?$/, ';')).join('\n');
  const hash = createHash('sha256').update(code).digest('hex').slice(0, 12);
  return {code, name: `site--${hash}.js`};
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const {code, name} = bundle();
  const check = process.argv.includes('--check');
  const path = join(web, name);
  const stale = !existsSync(path) || readdirSync(web).some(f => /^site--[a-f0-9]{12}\.js$/.test(f) && f !== name);
  if (check) { if (stale) { console.error(`${name} is stale: run node scripts/build-js.mjs`); process.exit(1); } console.log(`${name} is current`); process.exit(0); }
  writeFileSync(path, code);
  for (const f of readdirSync(web)) if (/^site--[a-f0-9]{12}\.js$/.test(f) && f !== name) unlinkSync(join(web, f));
  console.log(`web/${name} written, ${code.length} bytes from ${ORDER.length} scripts`);
}

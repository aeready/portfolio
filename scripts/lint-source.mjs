#!/usr/bin/env node
// Source hygiene checks that need no dependencies. Run: node scripts/lint-source.mjs
// Exit code 1 on any failure. Part of the standard checks in CLAUDE.md.
//
// 1. CSS `!important` ratchet: the count per stylesheet may go down, never up.
//    After you reduce it, run with --update-budget to lower the stored number.
// 2. Every web/*.js file parses (node --check) and has no debugger/console.log/eval.
// 3. HTML obeys the Worker's CSP: no inline <script>/<style>, no style="" or on*="" attributes.
// 4. Every target="_blank" link has rel="noopener".
// 5. Every <img> has an alt attribute (alt="" is fine for decoration).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const web = join(root, 'web');
const budgetFile = join(root, 'scripts', 'css-budget.json');
const update = process.argv.includes('--update-budget');
const problems = [];
const notes = [];

// 1. !important ratchet (source sheets only; site.css is generated from them)
const sheets = ['style.css', 'overhaul-v2.css', 'refine.css', 'press.css', 'edition.css', 'fixes.css', 'nf.css'];
const count = {};
for (const f of sheets) {
  const css = readFileSync(join(web, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  count[f] = (css.match(/!important/g) || []).length;
}
let budget = {};
try { budget = JSON.parse(readFileSync(budgetFile, 'utf8')); } catch { /* first run */ }
for (const f of sheets) {
  if (budget[f] === undefined) { if (!update) problems.push(`${f}: no !important budget recorded (run with --update-budget)`); continue; }
  if (budget[f] === undefined) continue;
  if (count[f] > budget[f]) problems.push(`${f}: ${count[f]} !important declarations, budget is ${budget[f]}. Add the rule without !important, or remove another first.`);
  else if (count[f] < budget[f]) notes.push(`${f}: ${count[f]} < budget ${budget[f]}. Run with --update-budget to lock in the improvement.`);
}
if (update) { writeFileSync(budgetFile, JSON.stringify(count, null, 2) + '\n'); notes.push('budget updated'); }

// 2. JS
for (const f of readdirSync(web).filter(n => n.endsWith('.js'))) {
  const file = join(web, f);
  const r = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (r.status !== 0) problems.push(`${f}: does not parse: ${(r.stderr || '').split('\n').find(Boolean)}`);
  if (f === 'preview-assets.js' || f === 'projects.js' || f === 'originals.js') continue; // generated data
  const src = readFileSync(file, 'utf8');
  src.split('\n').forEach((line, i) => {
    const code = line.replace(/\/\/.*$/, '');
    if (/\bdebugger\b/.test(code)) problems.push(`${f}:${i + 1}: debugger statement`);
    if (/\bconsole\.log\(/.test(code)) problems.push(`${f}:${i + 1}: console.log`);
    if (/\beval\(|new Function\(/.test(code)) problems.push(`${f}:${i + 1}: eval/new Function (blocked by CSP anyway)`);
  });
}

// 3-5. HTML
for (const f of ['index.html', '404.html']) {
  const html = readFileSync(join(web, f), 'utf8');
  for (const m of html.matchAll(/<script\b([^>]*)>/gi)) if (!/\bsrc=/.test(m[1])) problems.push(`${f}: inline <script> (CSP script-src 'self')`);
  if (/<style\b/i.test(html)) problems.push(`${f}: inline <style> (CSP style-src 'self')`);
  if (/\sstyle="/i.test(html)) problems.push(`${f}: inline style="" attribute (CSP style-src 'self')`);
  if (/\son[a-z]+="/i.test(html)) problems.push(`${f}: inline event-handler attribute`);
  for (const m of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/gi)) if (!/rel="[^"]*noopener/.test(m[0])) problems.push(`${f}: target=_blank without rel=noopener: ${m[0].slice(0, 60)}`);
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) if (!/\salt=/.test(m[0])) problems.push(`${f}: <img> without alt: ${m[0].slice(0, 70)}`);
}

notes.forEach(n => console.log('note:', n));
if (problems.length) { problems.forEach(p => console.error('FAIL', p)); console.error(`${problems.length} problem(s)`); process.exit(1); }
console.log(JSON.stringify({ status: 'passed', important: count }));

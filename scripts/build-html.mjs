#!/usr/bin/env node
// Rewrites the generated parts of web/index.html (everything between the marker comments):
//   cards    the 7 English project cards, rendered from projects.js + preview-assets.js with the SAME
//            renderer the browser uses (web/cards.js), so no-JS visitors and search engines see them
//            and app.js only has to hydrate them
//   scripts  the single hashed script bundle (run scripts/build-js.mjs first)
//   ko-font  the Korean font files, read by press-boot.js/app.js to warm the font when Korean is chosen
//
//   node scripts/build-html.mjs          rewrite index.html
//   node scripts/build-html.mjs --check  exit 1 if index.html is stale
import {readFileSync, writeFileSync, readdirSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';

const web = join(dirname(fileURLToPath(import.meta.url)), '..', 'web');
const file = join(web, 'index.html');

function cards() {
  const window = {};
  const context = vm.createContext({window, console});
  for (const f of ['preview-assets.js', 'projects.js', 'locales.js', 'cards.js']) vm.runInContext(readFileSync(join(web, f), 'utf8'), context, {filename: f});
  const {renderCard, ORDER} = window.PortfolioCards;
  const ui = window.PORTFOLIO_LOCALES.en.ui;
  const t = (key, vars = {}) => { if (ui[key] === undefined) throw Error('Missing translation: ' + key); return ui[key].replace(/\{(\w+)\}/g, (_, n) => String(vars[n] ?? '')); };
  const projects = [...window.PORTFOLIO_PROJECTS].sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
  if (projects.length !== ORDER.length) throw Error('ORDER in cards.js does not match projects.js');
  return projects.map((p, i) => '      ' + renderCard(p, i, {t, variants: window.PORTFOLIO_PREVIEWS, pending: false})).join('\n');
}
function scripts() {
  const bundle = readdirSync(web).find(f => /^site--[a-f0-9]{12}\.js$/.test(f));
  if (!bundle) throw Error('No script bundle: run node scripts/build-js.mjs first');
  return `  <script defer src="${bundle}"></script>`;
}
function koFonts() {
  const fonts = readdirSync(join(web, 'assets/fonts')).filter(f => /^NotoSans-Korean-site(-Bold)?--[a-f0-9]{12}\.woff2$/.test(f)).sort();
  return `  <meta name="ko-fonts" content="${fonts.map(f => 'assets/fonts/' + f).join(',')}">`;
}
const replaceBlock = (html, name, body) => {
  const re = new RegExp(`(<!--${name}:start-->)[\\s\\S]*?(<!--${name}:end-->)`);
  if (!re.test(html)) throw Error(`index.html has no <!--${name}:start-->…<!--${name}:end--> markers`);
  return html.replace(re, (_, a, b) => `${a}\n${body}\n${b}`);
};
export function build() {
  let html = readFileSync(file, 'utf8');
  html = replaceBlock(html, 'cards', cards());
  html = replaceBlock(html, 'scripts', scripts());
  html = replaceBlock(html, 'ko-font', koFonts());
  return html;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const built = build();
  if (process.argv.includes('--check')) {
    if (built !== readFileSync(file, 'utf8')) { console.error('web/index.html is stale: run node scripts/build-js.mjs && node scripts/build-html.mjs'); process.exit(1); }
    console.log('web/index.html is current'); process.exit(0);
  }
  writeFileSync(file, built);
  console.log('web/index.html updated (7 cards, script bundle, Korean font hints)');
}

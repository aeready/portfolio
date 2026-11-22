# CLAUDE.md

Read first: `AGENTS.md` (bilingual, originals, publishing rules; overrides defaults), then `CHANGELOG.md` (newest first, each entry says how to undo).
Before any visual change: read `docs/overhaul/OWNER_DECISIONS.md` (owner's standing decisions; don't reopen without asking). Background and design rules: `docs/overhaul/WORKPLAN.md`, `MANIFESTO.md`, `DESIGN_DNA.md`, `PRESERVE.md`, `STYLE_GUIDE.md`.

## Git and publishing
- Push to `main` only when the owner says so (fast-forward only); otherwise use a branch. Last push: 21 Nov booklet back cover, page turn and audit fixes, at the owner's word; not yet uploaded to the live site (18 Nov fixes may also still be pending upload).
- We don't publish. Site is on OpenAI Sites (`.openai/hosting.json`), files in the R2 bucket; the owner/ChatGPT uploads and publishes the Worker. After each round, list the files to upload (plus the three current `web/assets/fonts/NotoSans-Korean-site*--*.woff2` if the font was rebuilt; old ones get deleted).
- Owner reviews the live site (may lag `main`) on a Galaxy phone in Chrome: check the code before "fixing" something already fixed.
- Explain changes to the owner in plain language with before/after screenshots.

## Where things live
- **Scripts:** pages load `web/site--<hash>.js`, built from `preview-assets, projects, locales, originals, downloads, cards, app, press, edition` by `scripts/build-js.mjs`; `press-boot.js` is separate. `index.html` has generated blocks (`<!--cards:start-->`, `scripts`, `ko-font`): never hand-edit between the markers, run `npm run build`. Card markup lives in `web/cards.js`.
- **Pages load `web/site.css`**, generated from the six sheets. Edit the sources, then run `node scripts/build-css.mjs` (also after `hash-assets.mjs` or a Korean font rebuild). `404.html` still loads its own sheets.
- `web/edition.css` / `edition.js`: newest work. Prefer editing the rule that actually wins over appending another override; every new `!important` must be paid for by removing one (`scripts/lint-source.mjs`).
- `web/press.css` / `press.js`: motion, bands, gallery sizing (`fitStage`), phone filter, tap-to-zoom.
- `web/app.js`: projects, filters, gallery, booklet spreads, `data-tone`, `projectOrder`.
- `web/projects.js`: project data (JSON in JS; edit via JSON round-trip, indent 2). `web/locales.js`: all EN + KO strings.
- `scripts/build-previews.py`: 160/480/960 px WebP previews + `preview-assets.js`.
- `archive/unused-assets/`: old unreferenced assets, never uploaded.

## Korean text
- Every new Korean syllable must be in the font subset: run `python3 scripts/check-korean-font.py`; if missing, `scripts/build-korean-font.py` (needs npm). If npm is blocked, reword using syllables already in the subset.

## Checks (after every change)
```
npm run build          # site.css + script bundle + index.html (cards, script tag); run after editing any web/*.js or *.css
cd web && python3 -m http.server 8765
node scripts/validate.mjs && PORTFOLIO_TEST_DIRECT_ENTRY=1 node scripts/validate.mjs
node scripts/validate-locales.mjs && node scripts/validate-downloads.mjs
node scripts/build-worker.mjs && node scripts/validate-worker.mjs
python3 scripts/check-korean-font.py
node scripts/build-css.mjs --check && node scripts/lint-source.mjs
node scripts/qa/audit-sizes.cjs   # other QA scripts: scripts/qa/README.md
# CSS refactors: node scripts/qa/visual-regression.cjs capture .qa/before, change, capture .qa/after, compare (must be IDENTICAL)
```
Test phones with Playwright devices (`Galaxy S9+`, `Pixel 7`), not just a narrow viewport.

## Gotchas
- CSP `script-src 'self'; style-src 'self'`: no inline `<script>`/`<style>`.
- `validate.mjs` runs `app.js` in a fake DOM (guard browser-only APIs) and asserts project order and some copy: update it when those change on purpose.
- Many `!important` layers: if a value "doesn't apply", grep all CSS for the selector. The project page `.detail-story > *` rail grid (62ch, column gap) leaks into anything placed inside it.
- `edition.js` decorates project pages via MutationObservers: only set text when it changed, or observers loop.
- Hide-before-reveal uses `opacity`, never `visibility`.
- `main { overflow-x: clip }` hides sideways overflow from `scrollWidth`: a clipped, cut-off element looks like "no overflow". Trust `audit-sizes.cjs` (it measures element edges), not `scrollWidth`.
- `!important` count is capped per sheet in `scripts/css-budget.json` (2,088 total on 18 Nov). After removing some, run `node scripts/lint-source.mjs --update-budget`.
- Removing CSS safely: a declaration is dead only if a later rule has the identical selector, at-rule and property with equal or higher importance (and `404.html` does not load `edition.css`). Prove no-change with `visual-regression.cjs` (byte-identical), not by eye.

## Open items
- USA Camp PDF page order (10/12) unverified. Korean job title is our translation; its trailing "·" (mirrors the English "&") wraps oddly at some widths: needs a native speaker.
- Owner decisions: GitHub repo is public while the site is meant to be private and the repo holds the CV PDF (contact details); Contact email row is not visually primary (17 Nov decision kept).
- To check live: the six R2-only originals/downloads (HEAD, Content-Type, bytes vs `web/originals.js`); Worker bundle is 47 MB and the upload route caps files at 25 MB (`epik-workshop-full.pdf` is 21.5 MB); response compression; real-phone and Safari/Firefox pass.
- USA Camp has no Project brief / Design choices cards and an empty `h2` (needs owner content). Project-page title band (~440 px) pushes the booklet spread below the first screen at 1440×900: owner decision.
- Small: committed `.bak`/draft files (`CLAUDE.md.bak`, `claude-code/`, `design/`) not deleted.
- Résumé PDF (owner's file): Korean pages come first; no Compass job (starts Dec 2026); Teacher Trainer reads "Mar 2026 – Present" (site: Mar–Dec 2026).
- Decor refresh (22 Nov) is in; unused pieces (icons, crop marks, colour bar, graph paper, generated maps) are in `archive/unused-assets/decor-refresh-2026-11/`. Owner rejected a Contact envelope drawing: don't add one.
- Owner to-dos: photos of printed materials, more project context, textbook 첫 출근 했습니다!.

## Planned: hub site
Owner wants a main page with three guides: About, Projects (professional work), Creative Lab (templates, book, guides). Plan: new shared token-based stylesheet and page shell, content moved over page by page (reuse `projects.js`, `locales.js`, Worker, validators, fonts, assets); do not stack more overrides on the current CSS. The Worker serves real files only (`/about` would 404): use `about.html` or add a rewrite. Creative Lab needs a licence decision (site uses CC BY-NC 4.0) and the repo-visibility decision above. Not started.

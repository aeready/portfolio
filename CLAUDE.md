# CLAUDE.md

Read first: `AGENTS.md` (bilingual, originals, publishing rules; overrides defaults), then `CHANGELOG.md` (newest first, each entry says how to undo).
Before any visual change: read `docs/overhaul/OWNER_DECISIONS.md` (owner's standing decisions; don't reopen without asking). Background and design rules: `docs/overhaul/WORKPLAN.md`, `MANIFESTO.md`, `DESIGN_DNA.md`, `PRESERVE.md`, `STYLE_GUIDE.md`.

## Git and publishing
- Push to `main` only when the owner says so (fast-forward only); otherwise use a branch.
- We don't publish. Site is on OpenAI Sites (`.openai/hosting.json`), files in the R2 bucket; the owner/ChatGPT uploads and publishes the Worker. After each round, list the files to upload (plus the three current `web/assets/fonts/NotoSans-Korean-site*--*.woff2` if the font was rebuilt; old ones get deleted).
- Owner reviews the live site (may lag `main`) on a Galaxy phone in Chrome: check the code before "fixing" something already fixed.
- Explain changes to the owner in plain language with before/after screenshots.

## Where things live
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

## Open items
- USA Camp PDF page order (10/12) unverified. Korean job title is our translation.
- Owner to-dos: photos of printed materials, more project context, textbook 첫 출근 했습니다!.

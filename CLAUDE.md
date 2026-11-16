# CLAUDE.md

Start here, in this order:

1. **`AGENTS.md`**: the project rules (bilingual EN/KO, two inks, originals untouched, validators, upload workflow). They override defaults.
2. **This file**: current state, the owner's latest decisions, publishing, gotchas.
3. **`CHANGELOG.md`**: every change, newest first, each with how to undo it.
4. **`docs/overhaul/WORKPLAN.md`**: the Nov 2026 "press run" overhaul background, file map, older decisions.
5. Design rules: `docs/overhaul/MANIFESTO.md` (R1–R7), `DESIGN_DNA.md`, `PRESERVE.md`, `DECISIONS.md`, `STYLE_GUIDE.md`.

## State (18 Nov 2026)

- Working branch: `ccr-099385b1-ewrh8h`. **`main` = the same commit (`f8e4f66`)**; the owner had
  ChatGPT publish from `main`. Pushing to `main` needs the owner's explicit "push to main" each
  time (fast-forward only; an automatic safety check blocks it otherwise).
- **Publishing is not ours.** The site is hosted on OpenAI Sites (`.openai/hosting.json`); files live
  in the Site R2 bucket. The owner/ChatGPT uploads changed files and publishes the Worker. We can't
  reach the live site (private). After each round, tell the owner which files to upload; the Korean
  font files are renamed whenever new Korean characters are added (upload the three current
  `web/assets/fonts/NotoSans-Korean-site*--*.woff2`, delete older ones).
- The owner's screenshots are often of the live site, which may lag behind `main`: check the code
  before "fixing" something already fixed. They review on an Android phone (Galaxy, Chrome).

## Where the newest work lives

| File | Role |
|---|---|
| `web/edition.css` / `edition.js` | **All work since 18 Nov.** Dated blocks appended at the end; later blocks override earlier ones (read bottom-up). Undo a round by removing its block. |
| `web/press.css` / `press.js` | Nov "press run" overhaul (motion, bands, gallery stage sizing `fitStage`, phone filter, tap-to-zoom). |
| `web/app.js` | Core app: projects, filters, gallery, booklet spreads, "The end!" page, `data-tone` on cards, `projectOrder`. |
| `web/projects.js` | Project data (JSON inside JS; edit with a JSON round-trip, it re-serialises identically with indent 2). |
| `web/locales.js` | All UI/page strings, EN + KO paired. |
| `scripts/build-korean-font.py` | Rebuilds the Korean font subsets after adding Korean text (fetches Noto Sans KR from npm). Run `python3 scripts/check-korean-font.py` after any Korean change. |
| `scripts/build-previews.py` | Makes 160/480/960 px WebP copies of work images into `assets/previews/` + `preview-assets.js`. |

## Owner's current decisions (don't reopen without asking)

- **Project order**: Reading for Meaning, Music in English Classes, Clearer Global Communication, then the rest. Band colours cycle **lime → aubergine → cream** by position *as shown* (also when filtered) via `data-tone`.
- **Bands**: one layout for all (work one side, text other, alternating); each fits one screen with View visible; cover plus the two other samples **all fully visible** (no prints hidden behind the cover).
- **Buttons**: title face (condensed caps; Korean: reading face), like the phone menu. View moves only when itself hovered. Contact links are a numbered list.
- **No special cursor.** No "fonts and inks" colophon. Tagline: **"Tested on Monday morning." / "월요일 아침에 검증된 자료."**
- **Project pages**: gallery + controls must be visible together (desktop: controls column left, work right; phones: one-row top bar, compact strip). Sections are a **file cabinet** (coloured cards; "My role" is card 1; Korean spines upright). Foot: files card, then Previous / Next cards.
- **Booklets** (USA Camp, Reading "Being a Bee", Music course guide): spreads on desktop, lime "The end!" / "끝!" facing the last page. USA pages 10 and 12 swapped (gallery only; the PDF in the bucket was not checked).
- **Background**: map of South Korea with job-coloured pins (Seoul = Compass, Seongnam = GIGE, Pyeongchang → Gangneung = teacher; Suwon = home, she lives there). Desktop: map left, timeline left→right on a wavy line, oldest first. No big years. Compass Publishing (웅진컴퍼스) Dec 2026–Present on the right; Teacher Trainer Mar–Dec 2026 left; English Teacher right. Gangneung club removed. Education = one card per degree. Skills = notebook page (EN/KO mixed, tool rows, strengths chips); **owner rejected die-cut stickers**. Map: Suwon = house "SUWON (HOME!)"; Seoul/Seongnam deliberately pulled apart. Registration grid sits on the Contact seam (torn circle removed).
- Earlier (still standing): Noto Sans body, original favicon, two inks only, fine riso pieces only, reduced motion fully static.

## Open items

- USA Camp PDF page order (10/12) unverified. Korean job title is our translation (use the official one if given).
- Owner's own to-dos: photos of printed materials, more project context, the textbook 첫 출근 했습니다!.

## Checks (run after every change)

```
cd web && python3 -m http.server 8765        # local site (keep running)
node scripts/validate.mjs && PORTFOLIO_TEST_DIRECT_ENTRY=1 node scripts/validate.mjs
node scripts/validate-locales.mjs && node scripts/validate-downloads.mjs
node scripts/build-worker.mjs && node scripts/validate-worker.mjs
python3 scripts/check-korean-font.py
node scripts/qa/audit-sizes.cjs              # see scripts/qa/README.md for the rest
```

Test phones with Playwright device emulation (`devices['Galaxy S9+']`, `'Pixel 7'`), not just a narrow viewport.

## Gotchas

- CSP is `script-src 'self'; style-src 'self'`: no inline `<script>`/`<style>`.
- `validate.mjs` runs `app.js` in a fake DOM: guard browser-only APIs; it also asserts project order and some copy (update it when those change on purpose).
- Old layers use many `!important` rules; when a value "doesn't apply", grep all CSS for the selector. The project page has a "rail" grid (`.detail-story > *` with 62ch measure and column gap) that leaks into anything placed inside it.
- `edition.js` decorates the project page through MutationObservers (direct links load before it attaches; a subtree observer rebuilds the cabinet). Only set text when it changed, or observers loop.
- Hidden-before-reveal uses `opacity`, never `visibility`.
- Every new Korean character must be in the font subset: run `build-korean-font.py`.
- Write explanations to the owner in plain language with before/after screenshots.

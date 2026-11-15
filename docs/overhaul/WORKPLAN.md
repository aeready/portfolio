# Work plan — "press run" overhaul (Nov 2026)

Status as of 17 Nov 2026. Branch: `ccr-099385b1-ewrh8h` (pushed; not merged; **not live**).
Full history with "how to undo" for every change: `CHANGELOG.md` (newest first).

## The idea in one line

The site is printed, not designed on screen: two inks on paper (aubergine `#492B51`, lime
`#D6DF66`, paper `#F3EBDD`), riso grain in every field, misregistered display type, and motion
that behaves like a press (plates drop into register, sheets feed, pages turn). The work samples
are the only full colour. Manifesto rules R1–R7 in `MANIFESTO.md` (R6 "Ink moves like ink",
R7 "Texture is the substrate" were added in this overhaul).

## Where things live

| File | Role |
|---|---|
| `web/style.css`, `overhaul-v2.css`, `refine.css` | Older layers (base colour-band layout). Rarely edited now. |
| `web/press.css` | **Everything from this overhaul.** Loads after `refine.css`, before `fixes.css`. Appended in dated blocks; later blocks override earlier ones, so read it bottom-up when debugging. |
| `web/edition.css`, `edition.js` | "Editorial edition" round (18 Nov): fixes, typography, composition, gallery ideas, motion. |
| `web/fixes.css` | Accessibility fixes; stays last. |
| `web/press-boot.js` | Tiny pre-paint gate for the once-per-session opening sequence (external file because the CSP forbids inline scripts). |
| `web/press.js` | Progressive enhancement: opening sequence, motion v2 reveals (`.rv` / `.is-in`), project-page band colours + return stamp, phone filter control, phone menu height, gallery stage sizing + halftone shadow, phone tap-to-zoom viewer, in-page link landing fix, desktop varnish + registration cursor. |
| `web/app.js` | Core app. Changed for: wall labels, filter counts, view-transition morph, route restore only when leaving a project, gallery counter markup, booklet spreads (`isSpread`, `stepSlide`). |
| `web/404.html` + `nf.css` + `nf.js` | "Misprint" 404 (no inline styles: CSP). |
| `web/assets/riso/` | Generated grain/mottle tiles + original small pieces. `riso/lib/` = curated pieces converted from the owner's 58-piece bank in `claude-code/riso-assets/png/` (never edit the bank). |
| `scripts/qa/` | Playwright QA checks (see its README). |

## Decisions the owner has made (do not reopen without asking)

- Poster hero is the default (`hero--poster` on `#home`); "How I work" section removed, its 250+/15+ numbers live in the hero.
- Project pop-up is a full-page view (still the `<dialog>`), dark "viewing room" gallery, strip under the work, label-rail reading layout.
- Print-pile previews with halftone shadows; seven band compositions on desktop.
- Body font stays **Noto Sans / Noto Sans KR** (option A). Favicon stays the **original** `favicon-ar-v2.svg`.
- Fine riso pieces only (registration marks, overprint moon, halftone disc, torn grid, reg-grid). No chunky square/op-art blocks, no checkerboard.
- Hard offset shadows only on primary buttons. Lime language switch on desktop. No gallery "↗" badge.
- Motion: elements print once when they arrive (never scroll-scrubbed); fixed ±2° tilts only; slide changes dissolve; portrait galleries show booklet spreads on desktop; phones get tap-to-zoom.
- Korean: matched to English in meaning ("연락하기", filter label "분류", 404 "오식."). Every new Korean character must be in the font subset (`NotoSans-Korean-site--*.woff2`); e.g. "쇄" is NOT, so it can't be used.

## Before publishing (owner does this; nothing is live yet)

1. Review in a **private window** (opening sequence is once per session; phones cache old CSS).
2. Upload to the Site bucket: `index.html`, `404.html`, `nf.css`, `nf.js`, `press.css`, `press.js`, `press-boot.js`, `edition.css`, `edition.js`, `fixes.css`, `style.css`, `refine.css`, the three new `assets/fonts/NotoSans-Korean-site*--*.woff2`, `app.js`, `locales.js`, `assets/riso/grain-*`, `assets/riso/mottle-*`, all of `assets/riso/lib/`, `assets/share-card--8c00ecbff6ae.jpg`.
3. Delete from the bucket: the old Korean subsets (`NotoSans-Korean-site--56c063187bf8`, `-Bold--9555065860f6`, `-Black--3c9618a2894e`), removed library pieces (checker, target-cream, overprint, letter-u, hazard, corners-lime, op-waves, spiral, halftone-square, letter-crop, torn-layers, wave-band, halftone-fade), `assets/downloads/ordering-game-2025.pptx` and the ordering-game images (older to-do).
4. `node scripts/build-worker.mjs`, publish the Worker, then check live Content-Type headers for the new CSS/JS/WebP/JPG.

## How to continue in a new session

1. Read `AGENTS.md`, this file, then the top of `CHANGELOG.md`.
2. `git checkout ccr-099385b1-ewrh8h` (develop there; commit + push per change).
3. Serve locally: `cd web && python3 -m http.server 8765`.
4. After any change run all of: `node scripts/validate.mjs`, `PORTFOLIO_TEST_DIRECT_ENTRY=1 node scripts/validate.mjs`, `node scripts/validate-locales.mjs`, `node scripts/validate-downloads.mjs`, `node scripts/build-worker.mjs`, `node scripts/validate-worker.mjs`, plus the `scripts/qa/` checks relevant to what changed.
5. Test phones with real device emulation (`devices['Galaxy S9+']`), not just a narrow viewport: real phones exposed bugs narrow desktop viewports hid (sideways overflow, invisible overlays eating taps, scroll-timeline animations not running).
6. Add a dated CHANGELOG entry (what, why, undo) and send the owner before/after screenshots.

## Gotchas learned the hard way

- The CSP is `script-src 'self'; style-src 'self'`: no inline `<script>` or `<style>`.
- `validate.mjs` runs `app.js` in a fake DOM: guard browser-only APIs (`matchMedia`, `insertAdjacentHTML`, `createElement`) and keep `#slide-count` textContent starting with "1 / N".
- Full-bleed bands use `box-shadow: 0 0 0 100vmax` + `clip-path`; pseudo-elements that bleed must be clipped at `main` / `html` (`overflow-x: clip`), not on the bands, or bands stop being full-bleed.
- Hidden-before-reveal must use `opacity`, never `visibility` (keeps cards in Tab order).
- `press.css` has many `!important` layers; when a value "doesn't apply", grep every rule for that selector (an `inset: auto !important` once silently overrode `left`).
- Don't run `scripts/hash-assets.mjs` blindly: it renames every referenced unhashed asset. Hash new files by hand (`name--<sha256[:12]>.ext`).
- The Bash safety check flags heredocs containing `.remove(`; use the Edit tool for JS that contains it.

## Ideas offered, not yet requested

Real photography of printed materials (biggest upgrade); one end-to-end case study (USA Camp);
short screen recording of a deck in use; native Korean copy edit; domain email address;
laptop-width (1280) screenshot set or motion recording for review.

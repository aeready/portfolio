# Style guide — annaready.kr

**Colour-band layout, 15 Nov 2026.** This describes the site as built, so a change or a new project fits without guesswork.

**Stylesheets, in load order:**
`style.css` → `overhaul-v2.css` → **`refine.css`** (the colour-band design, holds the tokens) → **`fixes.css`** (accessibility and phone fixes, motion; loads last).
New design work goes in `refine.css`. Fixes that must win go in `fixes.css`. Never edit the older two except to delete dead rules.

Every rule serves the manifesto: **R1** two inks, one sheet · **R2** the work is the loudest thing · **R3** loud once, then quiet · **R4** print where people look, standard where they click · **R5** both languages at full weight.

---

## 1. Colour (R1)

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#F3EBDD` | page ground, paper bands |
| `--paper-deep` | `#EADFCB` | first band, image mounts |
| `--ink` | `#492B51` | headings, rules, aubergine bands, primary buttons |
| `--ink-text` | `#37243C` | running text |
| `--acid` | `#D6DF66` | lime bands, chips, offset shadows, header Contact, Contact section |

Text pairs: aubergine on paper 10.15:1 · paper on aubergine 10.15:1 · aubergine on lime 8.36:1 · lime on aubergine 8.36:1.
**Lime is never text on paper (1.21:1).**

## 2. The bands (the signature, do not flatten)

Projects alternate by position, so the pattern holds whatever the order:

| Position | Band | Ink on band | Tag chip | Ornament (`--mark`) |
|---|---|---|---|---|
| 1, 5 | deep paper | aubergine | lime on aubergine text | bars and crosshairs |
| 2, 6 | **lime** | aubergine | aubergine chip, lime text | plum target |
| 3, 7 | **aubergine** | paper | lime chip | lime crosshair |
| 4, 8 | paper | aubergine | lime chip | halftone fade |

- Each band runs full width (`box-shadow: 0 0 0 100vmax`), with a 6 px aubergine rule on top.
- Desktop: image and text alternate sides (odd: image left; even: image right), 7/5 columns.
- Up to 900 px wide, each band shows **one cover** plate. The two small slides stay in the pop-up gallery (R2).
- **Outlined numeral:** condensed display, 72 → 128 px, `color: transparent` with a 1.5 px stroke in the band's ink. It fills solid on hover or focus.

## 3. Type (R3, R5)

Three voices.

| Voice | Token | Face | Used for |
|---|---|---|---|
| Display | `--display` | Zine Condensed 700, caps | name, headings, numerals |
| Reading | `--read` | Portfolio Sans (Noto Sans + Noto Sans KR subsets) | running text, all Korean |
| Label | `--label` | Zine Mono | chips, dates, nav, buttons, counts (English only) |

| Step | Token | Size (360 → 1440 px) |
|---|---|---|
| H1 | `--fs-h1` | 52 → 120 |
| H2 | `--fs-h2` | 44 → 80 |
| H3 | `--fs-h3` | 28 → 40 |
| Sub | `--fs-sub` | 24 → 34 |
| Lead | `--fs-lead` | 17 → 20 |
| Body | `--fs-body` | 16 → 17, line height 1.65 (Korean 1.8) |
| Small | `--fs-small` | 14 |
| Button | `--fs-button` | 13 |
| Label | `--fs-label` | **12, the floor for any text** |

- **Korean:** labels switch to `--read`, with no tracking and no caps. Headings match English in weight and size, never in width. `word-break: keep-all`.
- **Korean font subset:** the site's Korean font holds only the syllables the site uses (440). **Before adding Korean text, check every syllable is in the subset** (see section 8), or regenerate the subset.

## 4. Space

8 px scale: `--s1` 8 · `--s2` 16 · `--s3` 24 · `--s4` 32 · `--s5` 48 · `--s6` 64 · `--s7` 96 · `--s8` 128.
Sections: `--section`, 80 → 128 px. Content column `--measure` 1280 px. Side gutter `--gutter`, 20 → 72 px. `--edge` aligns full-bleed band content with the column.

## 5. Controls (R4)

- Square corners. Hard offset shadows, never blurred.
- Primary: aubergine fill, lime shadow. Secondary: paper fill, aubergine border.
- **Press:** the control slides into its shadow (90–100 ms). Image plates lift 2–3 px on card hover.
- Targets: 44 px minimum, 48 px on phones.
- Focus: visible ring on every control (lime alone is invisible on paper, so it pairs with ink).
- **Header Contact (phones):** lime, between language and Menu. It is the one-tap route to email, the site's primary action.

## 6. Ornaments (riso asset bank)

| Where | Rule |
|---|---|
| Hero | unlimited (halftone dots) |
| Each project band | one, set by position (section 2) |
| Section headings | one each: Projects overprint circles · Background moon · How I work tape and bullseye · Contact plum circles |
| Footer | one small cross, top-right |
| Running text, buttons, forms, pop-up | none |

Always decorative (`aria-hidden`), never over a work sample, never within 16 px of text. Source PNGs: `claude-code/riso-assets/png/`. Optimised WebPs in use: `web/assets/riso/`.

## 7. Motion

| What | Duration | Note |
|---|---|---|
| Button press | 90–100 ms | slide into shadow |
| Numeral fill on hover/focus | 220 ms | the fill itself also shows under reduced motion, without the fade |
| Link underline thickening | 150 ms | footer |
| Plate lift on card hover | 160 ms | |

One curve: `cubic-bezier(.2, .7, .3, 1)`. No bounce, parallax or scroll effects. Under `prefers-reduced-motion`, transitions are off and final states show at once.

## 8. Adding a project (content model)

Add a record to `web/projects.js`. The band, numeral, side and ornament follow from its position automatically.

| Field | Required | Notes |
|---|---|---|
| `id` | yes | URL slug: lowercase, hyphens |
| `number` | yes | two digits; display order |
| `title`, `label`, `displayLabel`, `summary` | yes | `summary` ≤ 160 characters; it is the band text |
| `categories` | yes | `training`, `curriculum`, `students`, `research` |
| `audiences`, `audienceLabel`, `format`, `context` | yes | plain language |
| `role`, `contribution`, `decisions`, `evidence` | yes | real facts only; no invented outcomes, quotes or numbers |
| `cover`, `coverAlt` | yes | one hero artefact; WebP with 960 and 480 previews |
| `previewSecondary`, `previewTertiary` | optional | desktop only |
| `slides` | yes | `[src, alt, caption]` per image |
| `documents`, `materialsNote`, `original` | optional | state file type and size |
| `ko` | **yes** | every visible field in Korean (R5) |

**Then:**
1. Add the `id` to `projectOrder` in `web/app.js`.
2. Check the Korean syllables against the font subset.
3. Run `node scripts/validate.mjs`, `validate-locales.mjs` and `validate-downloads.mjs`.
4. Look at 375 and 1280 px in both languages.

**Held slot:** 첫 출근 했습니다! enters as 01 and the lead. Everything moves down one, and the bands re-alternate automatically.

## 9. Do and don't

**Do:** keep the four-band rhythm · one ornament per band · the real artefact, large · Korean at full weight · 12 px minimum.

**Don't:** add a fifth colour · lime text on paper · blurred shadows or rounded corners · ornaments over work · condensed or tracked Hangul · invented proof of any kind.

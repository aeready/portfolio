# Style guide — annaready.kr

**Stage 3, 15 Nov 2026.** Tokens live in `web/system.css`, which loads last. The rendered guide is `web/style-guide.html` (open it from the repo root with any local server; it is `noindex` and not linked from the site).

Every rule cites the manifesto: **R1** two inks, one sheet · **R2** the work is the loudest thing · **R3** loud once, then quiet · **R4** print where people look, standard where they click · **R5** both languages at full weight.

## Colour (R1)

| Token | Hex | Use | On paper |
|---|---|---|---|
| `--paper` | `#F3EBDD` | ground (the 60) | — |
| `--paper-deep` | `#EADFCB` | image mounts | — |
| `--ink` | `#492B51` | headings, rules, fields, buttons (the 30) | 10.15:1 |
| `--ink-text` | `#37243C` | running text | 11.99:1 |
| `--ink-muted` | `#5E4566` | meta, counts, footer | 7.04:1 |
| `--acid` | `#D6DF66` | chips, shadows, focus, Contact field (the 10) | **1.21:1: never text** |
| `--acid-deep` | `#C3CD4A` | pressed states | — |
| `--rule` | ink 45% | hairlines only, never text | 2.4:1 |

On aubergine: paper text 10.15:1, lime text 8.36:1. On lime: aubergine text 8.36:1.

## Type (R3, R5)

Three voices, no more.

| Voice | Token | Face | Used for |
|---|---|---|---|
| Display | `--display` | Zine Condensed 700, caps | name, headings, hero role |
| Text | `--text` | Portfolio Sans (Noto Sans subsets, EN + KO) 400/700 | all running text |
| Label | `--mono` | Zine Mono | labels, chips, dates, nav, buttons, counts |

| Step | Token | Size (360 → 1440 px) | Line height |
|---|---|---|---|
| Display | `--fs-display` | 44 → 112 | 0.9 |
| H1 | `--fs-h1` | 40 → 88 | 0.9 |
| H2 | `--fs-h2` | 36 → 84 | 0.9 |
| H3 | `--fs-h3` | 24 → 36 | 1.0 |
| Lead | `--fs-lead` | 17 → 20 | 1.55 |
| Body | `--fs-body` | 16 | 1.6 |
| Small | `--fs-small` | 14 | 1.4 |
| Button | `--fs-button` | 13 | 1 |
| Label | `--fs-label` | 12, **the floor for any text** | 1.3 |

- Running text: max 62 characters a line (`--measure-text`); `text-wrap: pretty`. Headings: `text-wrap: balance`.
- Labels: caps, letter-spacing 0.1em. Numerals in dates and indexes are tabular.
- **Korean:** `--kr`, `word-break: keep-all`, line height 1.75, letter-spacing 0. H2 32 → 72 px, H3 22 → 32 px, weight 800 requested (renders 700 until a heavier Korean weight is loaded). Never condensed, stretched or tracked.

## Space

8-point scale: 4 · 8 · 16 · 24 · 40 · 64 · 96 · 144 (`--space-2xs` … `--space-3xl`).
Sections: `--section-gap`, 64 → 144 px. Column 1240 px; 12 columns; 24 px gutters; side gutter `clamp(20px, 4vw, 56px)`. Mobile: one left edge per section.

## Lines and depth

Square corners everywhere (`--radius: 0`). Hairline `1px` at 45% ink; strong `2px` ink; band `8px` ink. Shadows are hard offsets only: 4 px at rest, 2 px on hover, 0 when pressed. No blur, ever.

## Image mount (R2)

One frame per picture group. Plate ratio 4:3 (`--mount-ratio`), deep-paper ground, 1 px ink border, 8–12 px padding. Samples keep their original colours; no filters, no grain over them.

## Controls (R4)

- Ranks: primary (aubergine fill, lime shadow) · secondary (outline, quiet shadow) · text link (underline, 0.22em offset).
- One press for all: slide into the shadow, 90 ms, `--ease`.
- Targets: 44 px minimum, 48 px on touch.
- Focus: 3 px lime ring, 2 px offset, plus an ink outer ring (lime alone vanishes on paper).
- States to design for every control: rest, hover, focus-visible, active, disabled (45% opacity), and loading or done where relevant ("Copied").

## Motion

| Token | Duration | Use |
|---|---|---|
| `--dur-press` | 90 ms | control press |
| `--dur-quick` | 150 ms | hover colour, underline |
| `--dur-reveal` | 320 ms | section entrance: rise 12 px and fade, once |
| `--dur-view` | 400 ms | card-to-case-study view transition (maximum) |

One curve: `cubic-bezier(.2, .7, .3, 1)`. No bounce, parallax, scroll-jacking or cursor effects. Under `prefers-reduced-motion`, transforms are off and final states show at once.

## Ornaments (approved: "more")

From `claude-code/riso-assets/png/`.

| Where | Allowed | Family |
|---|---|---|
| Hero | unlimited | any |
| Section heading | 1 | Projects: brackets, crosshair · Background: tape · How I work: moon disc · Contact: none (the lime field is the event) |
| Project entry | at most 1 | crossed tape, field-notes label, small halftone |
| Running text, buttons, forms, dialogs | none | — |

Always: decorative only (`alt=""`, `aria-hidden`), never over a work sample, never within 16 px of text, never reducing any text pair below 4.5:1.

## Content model: adding a project

New projects drop in through `web/projects.js` with no layout work. Each record needs:

| Field | Required | Notes |
|---|---|---|
| `id` | yes | URL slug, lowercase, hyphens: `office-survival-guide` |
| `number` | yes | two digits, display order |
| `title`, `label`, `summary` | yes | `summary` ≤ 160 characters; it is the card text |
| `categories` | yes | any of `training`, `curriculum`, `students`, `research` |
| `audiences`, `audienceLabel`, `format`, `context` | yes | plain language |
| `role`, `contribution`, `decisions`, `evidence` | yes | real facts only: no invented outcomes, quotes or numbers |
| `cover`, `coverAlt` | yes | one hero artefact, 4:3, WebP, 1920 px long edge, plus 960 and 480 previews |
| `slides` | yes | `[src, alt, caption]` per image |
| `documents`, `materialsNote`, `original` | optional | file type and size on every download link |
| `ko` | **yes** | every visible field again in Korean (R5) |

Then: add the `id` to `projectOrder` in `web/app.js`, run the three validators, and check both languages at 375 and 1280 px.

**Held slot:** 첫 출근 했습니다! enters as `01` and the lead when Anna says so; every other project moves down one.

## Do and don't

**Do:** paper, aubergine, lime only · one standout per screen · square corners, hard shadows, hairlines · Korean at full weight · the real artefact, large, on one mount.

**Don't:** lime text on paper · text under 12 px or at 45% ink · rounded corners or blurred shadows · condensed or tracked Hangul · ornaments over work · invented proof of any kind.

# Design DNA

**Status:** approved by Anna, 15 Nov 2026. See `DECISIONS.md` for the choices made. Values are sampled from `web/overhaul-v2.css` and from the rendered page at commit `336d723`. Nothing here is a guess unless marked.

## Colour

| Role | Hex | Where |
|---|---|---|
| Paper | `#F3EBDD` | page ground |
| Paper, deep | `#EADFCB` | image mounts |
| Aubergine (ink) | `#492B51` | headings, rules, buttons, the "How I work" section |
| Aubergine, text | `#37243C` | body copy |
| Lime (acid) | `#D6DF66` | hero name, label chips, offset shadows, the Contact section |
| Lime, deep | `#C3CD4A` | pressed states |

Measured contrast: aubergine on paper 10.15:1 · paper on aubergine 10.15:1 · aubergine on lime 8.36:1 · lime on aubergine 8.36:1 · **lime on paper 1.21:1 (never used for text)**.

Tints in use: ink at 70% (4.45:1 on paper), 45% (2.4:1) and 15% (shadows only).

`style.css` still holds colours from the earlier sage/forest design (`#1D403B`, `#EDF2ED`, `#E1AA32`, `#8195AC`). They are overridden and are not DNA.

## Type

| Role | Face as loaded | Measured at 1280 / 375 |
|---|---|---|
| Display (headings, name) | "Zine Condensed" 700, caps | name 89.6 / 44.3 px · H2 83.2 / 40 px · H3 39.7 / 30 px |
| Labels and, today, body | "Zine Mono" 400/600 | body 16 / 14.7 px, line height 1.7 · labels 9.3–11.5 px |
| Korean, all roles | "Portfolio Sans" (Noto Sans KR subset) 400/700 | H2 56 / 32 px |
| Hero role line | Georgia (system fallback, not a web font) | 33.3 / 26 px |

Not yet verified: the source typefaces and licences behind "Zine Condensed" and "Zine Mono". Only Noto and Bookman licence files are in the repo. Open item for Stage 3.

## Layout patterns

- Square corners everywhere (`border-radius: 0`).
- Hairline rules (1 px ink at 45%) separate; 2 px ink rules close a heading.
- Hard offset shadows, no blur: 4 px lime behind primary buttons, 4 px ink at 15% behind secondary ones.
- Content column 1240 px; gutter `clamp(20px, 4vw, 56px)`.
- Exactly two full-colour sections: "How I work" (aubergine) and Contact (lime).
- Sticky paper masthead with a 2 px ink rule.

## Image style

- Hero: black-and-white photographic collage (leaves, open book, torn paper, graph paper), with "ANNA READY" as live text in lime on an aubergine bar.
- Work samples: shown in their original colours, unfiltered, on a deep-paper mount with a 1 px ink frame.

## Ornaments

In the page today: paper grain, the lime caption chip on the hero, ruled lines in "How I work".

In the asset bank, unused (58 transparent PNGs in `claude-code/riso-assets/`): two-tone "moon" discs, crosshair and registration marks, highlighter-tape bars, halftone fields, corner brackets, grid doodles, torn paper, wave bands, checker and target patterns.

## Motion

One press: a control slides into its own offset shadow, 90 ms, `cubic-bezier(.2,.7,.3,1)`. Sections rise and fade on first view. All of it is off under reduced motion.

## Voice

Warm, precise, practical. First person. Short declaratives: "Good materials get better with use." No superlatives, no invented outcomes.

## Signature elements (what makes it yours)

1. The collage hero with the lime name bar.
2. Cream, aubergine and lime, and nothing else.
3. Condensed caps headings against small mono labels.
4. Hard offset shadows that read as misregistered print.
5. The line "Good materials get better with use."
6. English and Korean side by side.

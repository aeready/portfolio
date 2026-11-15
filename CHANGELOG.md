# Changelog — art direction and UX overhaul

Each entry: what changed, the rule it serves, how to undo it.
Nothing here is live until the owner uploads and publishes.

## 15 Nov 2026 — Stage 1 fixes (branch `claude/stage1-fixes`)

### Remove the ordering-food game project
- **Change:** project record (EN + KO), 21 gallery/preview images, original-file record and order entry removed. Remaining projects renumbered 01–07 in display order.
- **Serves:** rights (third-party brand assets); Rams "honest". Also fixes numerals that ran 01, 03, 02, 04, 07, 06, 05.
- **Undo:** `git revert 336d723`.
- **Owner to do:** the hosted file `assets/downloads/ordering-game-2025.pptx` and the project's images are still in the site file bucket until deleted there.

### Korean "How I work" headings visible
- **Change:** `html[lang="ko"] .trainer-section h2, h3` set to paper; accent word stays acid. Was aubergine on aubergine (1:1), now 10.15:1.
- **Serves:** WCAG 2.2 AA contrast; bilingual parity.
- **Undo:** delete the "Stage 1 fixes" block at the end of `web/overhaul-v2.css`.

### Mobile filters wrap from the left edge
- **Change:** below 760 px the five filters wrap onto rows instead of a centred, unscrollable strip. "All work" was at x = −122 px at 375 px.
- **Serves:** R11 "never confusing menus"; R9 Hick's and Fitts's laws.
- **Undo:** same block.

### Mobile hero copy keeps the page gutter
- **Change:** `.hero-copy` gets the standard side gutter below 760 px; the credentials row wraps inside it. Text was 1 px from both edges.
- **Serves:** R7 white space and alignment.
- **Undo:** same block.

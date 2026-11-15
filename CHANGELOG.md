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

## 15 Nov 2026 — Stage 3 design system (branch `claude/stage3-system`)

### Design tokens in `web/system.css`
- **Change:** one file holding colour roles, three type voices, a fluid type scale, 8-point spacing, mount, lines, controls, motion and ornament limits. Linked last in `index.html`.
- **Serves:** all five manifesto rules; R2 "thorough down to the last detail".
- **Undo:** remove `<link rel="stylesheet" href="system.css">` from `web/index.html`.

### Running text in humanist sans
- **Change:** body copy moves from monospace to Portfolio Sans (Noto Sans, already loaded). Mono stays for labels, nav and buttons. Lead text 17–20 px, body 16 px, 62-character lines.
- **Serves:** Decision 15 Nov; R5 (English now matches the Korean text face).

### Three type voices
- **Change:** the hero role ("Teacher trainer & curriculum designer") moves from Georgia, a system fallback, to the display face. Korean role uses the Korean face at 800.
- **Serves:** R3; R6 "limit font and style variations".

### 12 px text floor and AA contrast
- **Change:** every label, chip, date, nav item and count is 12 px or larger (was 8.6–11.5 px). Project numbers move from 45% ink (2.4:1) to full ink (10.15:1). Counts and footer use `--ink-muted` (7.04:1).
- **Serves:** WCAG 2.2 AA; R9 legibility.

### Korean heading scale
- **Change:** Korean H2 32 → 72 px, H3 22 → 32 px, heavier and tighter.
- **Serves:** R5.

### Approved project order
- **Change:** 01 Clearer Global Communication · 02 Reading for Meaning · 03 Music in English Classes · 04 Beyond Teacher Induction · 05 USA Camp · 06 How Does It Taste? · 07 Advice & Suggestions.
- **Serves:** Decision 15 Nov; R9 serial position.
- **Undo:** revert the `projects.js` and `app.js` changes in this commit.

### Style guide
- **Change:** `docs/overhaul/STYLE_GUIDE.md` and a rendered `web/style-guide.html` (noindex, unlinked). Includes the content model for adding projects. `AGENTS.md` updated to the approved system.
- **Note:** the style guide page shows ornaments from `claude-code/`, which is outside `web/`; those images only appear when previewed from the repo root.

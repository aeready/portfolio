# Changelog — art direction and UX overhaul

Base: the colour-band layout (`claude/wizardly-newton-mtmf99`). This branch: `claude/colour-bands-polish`.
Each entry: what changed, the rule it serves, how to undo it. Nothing here is live until the owner uploads and publishes.

## 15–16 Nov 2026 — "Press run": texture, type, motion, project pages

Approved by Anna on 15 Nov 2026 (game plan, then "go ahead"). Rules R6 and R7 added to the Manifesto. New layer `web/press.css` loads after `refine.css` and before `fixes.css`. Nothing is live until the owner uploads and publishes.

### Phase 0 — fixes
- "My background" link drew two underlines (border plus background line); now one.
- Hero details (Suwon / F-6 / US Citizen / languages): left-aligned two-column list, icon beside its text, instead of centred cells that wrapped away from their icons.
- Project band ornament overlapped the category tag at 375 px; ornaments moved (below).
- USA Camp cover filled only a quarter of its mount on phones and tablets; every cover now fills its mount at its own proportions.

### Phase 1 — texture is the substrate (R7)
- **Change:** riso grain and soft ink mottle printed into the paper, header, footer, every project band (full bleed), the ribbon, How I work, Background and Contact. Aubergine specks on paper and lime; paper specks on aubergine. Backgrounds only: work samples are never textured.
- **Change:** one oversized riso piece per band (moon, target, bullseye, overprint circles, halftone, bars, circles), cropped by the band's top edge and tucked behind the cover mount, replacing the small corner stickers.
- **Change:** each cover mount gets hairline crop marks and a strip of riso tape.
- **Change:** misregistration on display type only: the outlined project numbers and section headings carry a second plate 2–3 px off (lime on paper, paper on lime).
- **New files:** `assets/riso/grain-ink`, `grain-paper`, `mottle-ink`, `mottle-light` (tileable, generated; 12–21 KB each). `press.css` and `fixes.css` added to the Worker package list in `scripts/build-worker.mjs` (fixes.css was missing).
- **Undo:** remove the `press.css` link from `index.html` and `404.html`.

## 15 Nov 2026

### Remove the ordering-food game project
- **Change:** project record (EN + KO), 21 gallery and preview images, original-file record and order entry removed.
- **Serves:** rights (third-party brand assets); Rams "honest".
- **Owner to do:** delete `assets/downloads/ordering-game-2025.pptx` and the project's images from the site file bucket.

### Approved project order
- **Change:** 01 Clearer Global Communication · 02 Reading for Meaning · 03 Music in English Classes · 04 Beyond Teacher Induction · 05 USA Camp · 06 How Does It Taste? · 07 Advice & Suggestions. The bands keep alternating automatically by position.
- **Serves:** Decision 15 Nov; R9 serial position (strongest first, classroom work last).

### Accessibility fixes in `web/fixes.css` (loaded last; no colours, bands, numerals or ornaments touched)
- Language and menu buttons 9.9 → 12 px; footer 10 → 12 px; hero caption and desktop nav 11 → 12 px.
- Logo link 40 → 44 px wide (48 px on phones).
- Phone filters wrap from the left edge; before, "Curriculum & units" was cut mid-word in a sideways strip with no hint it scrolled.
- **Undo:** remove `<link rel="stylesheet" href="fixes.css">` from `web/index.html`.

### Documents
- Manifesto, DNA, preserve list, moodboard translation and decisions in `docs/overhaul/`. `AGENTS.md` now protects the colour-band layout.

Checked in Chrome at 360, 375, 430, 768, 1280 and 1440 px in English and Korean: no text under 12 px, every control at least 44 px, no content cut off. The three site validators pass.

### Korean titles
- **Change:** Reading for Meaning → 의미를 찾는 읽기; USA Camp → 미국 문화 캠프 (Korean mode only). Every character checked against the Korean web-font subset.
- **Serves:** R5 both languages at full weight. **Owner to do:** confirm the wording, ideally with a native speaker.

## 15 Nov 2026 — Stage 4, phones and tablets

### Contact one tap away on phones
- **Change:** a lime "Contact" / "문의" button in the phone header (hidden on desktop, where Contact is already in the nav). Tapping it lands with the email button on screen at 360 and 390 px in both languages.
- **Serves:** Decision "Email me" is the primary action; R8 key action in thumb reach; R11 never hide contact.

### Email first in Contact
- **Change:** "Reveal & copy email address" now comes before résumé and LinkedIn. Still hidden until requested.
- **Serves:** primary action first (R9 serial position).

### One artefact per project, up to 900 px wide
- **Change:** on phones and tablets each band shows its cover plate only; the two small slides (unreadable at that width) remain in the project gallery. Desktop keeps the three-image composition. Band padding tightened.
- **Result:** page height at 375 px 11,400 → 9,990 (English) and 10,940 → 9,500 (Korean); at 768 px 11,940 → 10,000.
- **Serves:** Manifesto R2 and R3.
- **Undo:** delete the "Stage 4" block in `web/fixes.css`; move the email button back to third in `index.html`.

## 15 Nov 2026 — Stages 4 and 5: pop-up, footer, 404, motion; style guide

### Project pop-up
- **Change:** "2 of 7" counter now shows on phones (an old rule hid it). Phone header is one row of controls (back, language, close) with the counter beneath; Close no longer wraps alone. Labels to 12 px; the file-scope note set as a sentence instead of tracked capitals; "View in new tab" and "Download" now 44 px targets; gallery arrows larger.
- **Serves:** R8 show where you are; WCAG target size and legibility.

### Footer
- **Change:** adds the licence line (CC BY-NC 4.0, for Anna's original materials), "Email me" and "Back to top", and the year: © 2026 Anna Ready. Both languages. The small cross ornament moves to the top-right, clear of text.
- **Serves:** brief (contact from every page, licence stated, copyright year); R11.

### 404 page
- **Change:** new `web/404.html` in the house style (lime band, outlined 404, English and Korean, Home and Email me). `worker/index.js` now serves it with status 404 for missing pages; missing files (images, PDFs) still return plain "Not found". Three new checks in `scripts/validate-worker.mjs`.
- **Owner to do:** upload `404.html` and publish the rebuilt Worker.

### Motion
- **Change:** outlined numerals fill with their band's ink on hover or focus (220 ms fade; instant under reduced motion). Footer link underlines thicken (150 ms). Header Contact presses like other buttons.
- **Serves:** R6 meaningful transitions; brief "numerals fill".

### Style guide
- **Change:** `docs/overhaul/STYLE_GUIDE.md`, rewritten for the colour-band layout: colours, the band pattern, type, spacing, controls, ornaments, motion, and how to add a project (including the Korean font-subset check).

### Korean wording
- **Change:** three new Korean phrases reworded to avoid syllables missing from the font subset (밝, 맨, 잘): 출처를 표시하면, 위로 가기, 다르게 입력되었을.

Checked at 360–1440 px in both languages: no text under 12 px; every control at least 44 px (the inline licence link is exempt as text in a sentence); nothing cut off. All four validators pass, including the Worker.

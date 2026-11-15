# Changelog — art direction and UX overhaul

Base: the colour-band layout (`claude/wizardly-newton-mtmf99`). This branch: `claude/colour-bands-polish`.
Each entry: what changed, the rule it serves, how to undo it. Nothing here is live until the owner uploads and publishes.

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

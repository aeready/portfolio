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

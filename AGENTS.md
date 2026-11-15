# Portfolio editing rules

- Keep every user-visible website change in English and Korean. Update both entries in `web/locales.js` and both project language records in `web/projects.js` in the same change. No silent English fallback in Korean mode.
- Mark static copy with `data-i18n` or the corresponding `data-i18n-alt`, `data-i18n-src`, or `data-i18n-aria-label` attribute. Put dynamic interface strings in the paired UI dictionaries. Preserve language selection, filters and gallery position when switching languages.
- Preserve source-slide colours, supplied overview previews, original file bytes, and factual content. Original documents stay in their original languages. Label AI-assisted work as supplied by the owner; add no outcomes, credentials, or testimonials.
- The base design is the colour-band layout (`web/refine.css`, Nov 2026), approved by the owner on 15 Nov 2026. Do not remove or flatten the alternating paper / lime / aubergine project bands, the outlined numerals or the riso ornaments. Design rules: `docs/overhaul/MANIFESTO.md`, `DESIGN_DNA.md`, `PRESERVE.md`, `DECISIONS.md`. Two inks on paper (`#F3EBDD`, `#492B51`, `#D6DF66`); lime is never text on paper. No text under 12 px. Accessibility fixes go in `web/fixes.css`, loaded last. Keep the textured Riso hero artwork. Keep source slides and software logos in their original colours. Keep reduced-motion support. Any change to the design needs the owner's explicit yes.
- Keep the résumé, LinkedIn and email controls in the single lime Contact section. Keep the email hidden until requested.
- Run `node scripts/validate.mjs`, `node scripts/validate-locales.mjs`, and `node scripts/validate-downloads.mjs` after relevant changes. Check Korean font coverage when adding Korean characters.
- Originals are stored in the Site file bucket; local verification copies use exact byte parts in the ignored `storage-data/originals/`, with sizes and SHA-256 hashes in `web/originals.js`. Never replace an original with a compressed or altered deck under the same label.
- Preserve owner-private access and the existing `.openai/hosting.json` project ID. Use the Sites workflow for source sync, packaging and publication.

- The website source is in `web/`; runtime files are served from the Site R2 bucket. `worker/index.js` is the read-only file router; `node scripts/build-worker.mjs` packages the Worker. Upload changed website assets into R2 before publishing a new Worker. Do not place original decks in the deployment package.

- Do not commit PowerPoint byte data to Git or include it in build archives. Keep user originals in their existing Library records and the Site file bucket. The local `storage-data/` cache is ignored. Verify new uploads against the hashes in `web/originals.js`.

- Verify the live Content-Type headers for the homepage, CSS, JavaScript, SVGs, fonts, and PDFs after uploads or hosting changes. Byte hashes alone do not verify browser rendering. The Worker derives website response types from file extensions and must override incorrect stored metadata. Run `node scripts/validate-worker.mjs` and `node scripts/build-worker.mjs` after router changes.

- Nov 2026 overhaul: new design work goes in `web/press.css` (loads after `refine.css`, before `fixes.css`) and `web/press.js`. Read `CLAUDE.md` and `docs/overhaul/WORKPLAN.md` before continuing; browser QA scripts are in `scripts/qa/`.

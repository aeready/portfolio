# Portfolio editing rules

- Keep every user-visible website change in English and Korean. Update both entries in `web/locales.js` and both project language records in `web/projects.js` in the same change. No silent English fallback in Korean mode.
- Mark static copy with `data-i18n` or the corresponding `data-i18n-alt`, `data-i18n-src`, or `data-i18n-aria-label` attribute. Put dynamic interface strings in the paired UI dictionaries. Preserve language selection, filters and gallery position when switching languages.
- Preserve source-slide colours, supplied overview previews, original file bytes, and factual content. Original documents stay in their original languages. Label AI-assisted work as supplied by the owner; add no outcomes, credentials, or testimonials.
- Follow the owner's October 31 correction: use the textured Riso hero artwork, never approximate it with flat shapes or substitute the letterforms. Preserve original white/ruled/graph-paper panels against warm cream and sage, and preserve the original pale-green contact section with forest controls. Keep source slides and software logos in their original colours. Tape is omitted in the review draft. Keep reduced-motion support.
- Keep the résumé and email controls in the single pale-sage contact section. Keep the email hidden until requested.
- Run `node scripts/validate.mjs`, `node scripts/validate-locales.mjs`, and `node scripts/validate-downloads.mjs` after relevant changes. Check Korean font coverage when adding Korean characters.
- Originals are stored in the Site file bucket; local verification copies use exact byte parts in the ignored `storage-data/originals/`, with sizes and SHA-256 hashes in `web/originals.js`. Never replace an original with a compressed or altered deck under the same label.
- Preserve owner-private access and the existing `.openai/hosting.json` project ID. Use the Sites workflow for source sync, packaging and publication.

- The website source is in `web/`; runtime files are served from the Site R2 bucket. `worker/index.js` is the read-only file router; `node scripts/build-worker.mjs` packages the Worker. Upload changed website assets into R2 before publishing a new Worker. Do not place original decks in the deployment package.

- Do not commit PowerPoint byte data to Git or include it in build archives. Keep user originals in their existing Library records and the Site file bucket. The local `storage-data/` cache is ignored. Verify new uploads against the hashes in `web/originals.js`.

- Verify the live Content-Type headers for the homepage, CSS, JavaScript, SVGs, fonts, and PDFs after uploads or hosting changes. Byte hashes alone do not verify browser rendering. The Worker derives website response types from file extensions and must override incorrect stored metadata. Run `node scripts/validate-worker.mjs` and `node scripts/build-worker.mjs` after router changes.

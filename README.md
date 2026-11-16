# Refinement layer — November 15, 2026 (review draft, unpublished)

`web/refine.css` is one documented layer loaded after `style.css` and `overhaul-v2.css`. It keeps the aubergine (#492b51) / acid (#d6df66) Riso identity and changes type roles, spacing, alignment, interaction and decoration on mobile, tablet and desktop.

- Type: reading text uses Noto Sans + Noto Sans KR (already self-hosted as Portfolio Sans); Noto Sans Mono is limited to labels; Open Sans Condensed Bold stays for display. Korean never receives uppercase or wide tracking. Body 16→17px, minimum label 12px (was 8.6px).
- Spacing: 8px scale; sections 80px mobile / 128px desktop; one left content edge for bands, ribbon, contact and footer (ribbon text was 100px off at 1440px; hero copy sat 1px from the phone edge).
- Hero: one primary action; "My background" is a text link. The art label is bilingual (`home.note`) and no longer claims the site is printed.
- Projects: card numbers follow display order (were 01, 03, 02, 04, 07, 06, 05, 08); dialog "n of 8" matches. Card-to-dialog view-transition morph, scroll reveals and timeline print-in removed; content is never hidden waiting for scroll.
- Background: university seals and software logos kept as icon rows (owner's preference), with hairline rules and Noto Sans text.
- Gallery: catalogue spreads. Each project is a full-width colour band (sand, acid, aubergine, cream, repeating) separated by a 6px full-bleed ink rule; desktop alternates samples left/text right and mirrored. Outlined display numerals, inverted tags on acid, a bordered View button, and one Riso piece per spread in the text column's corner. USA Camp shows its three portrait pages side by side. Phones stack numeral/title, samples, then summary on the same bands.
- Additional Riso pieces: halftone dots (hero), plum/cream circles (Background heading), tape stack crossing the How I work band, crop marks around the contact actions, small cross in the footer.
- How I work: ruled-paper lines no longer cross the text. Korean heading and step titles were invisible (aubergine on aubergine); fixed.
- Korean hero name no longer clips (keeps the condensed face).
- Language parity: Korean display type now matches English. Numerals and Latin letters use Open Sans Condensed Bold, uppercase, in both languages; Hangul uses a self-hosted Noto Sans KR Black subset (`assets/fonts/NotoSans-Korean-site-Black--c4196f82c6ed.woff2`, 39 KB, the same 440 characters as the existing Korean Bold subset; SIL OFL, covered by `NOTO-LICENSE.txt`). Label chips use the same mono face for digits in both languages. If new Korean characters are added to headings, regenerate this subset from NotoSansCJK-Black.ttc using the Bold subset's codepoints plus the new ones.
- Gallery View buttons are solid on every band: aubergine fill (acid shadow) on sand and cream, aubergine fill with acid text on acid, acid fill with aubergine text on aubergine.
- Six decorative Riso pieces from `claude-code/riso-assets/` are served from `web/assets/riso/` as WebP. They are `aria-hidden`, pointer-transparent and placed only in margins.
- `scripts/build-worker.mjs` includes `refine.css`.

Validation: `validate.mjs`, `validate-locales.mjs`, `validate-downloads.mjs` pass; Worker build 39.4 MB. Browser review in English and Korean at 390, 768 and 1440px plus 352px; project dialog at 390 and 1440px. Not published. Do not upload to the production bucket without the owner's approval.

# Narrow-phone hero inset correction — October 31, 2026

Removed inherited wrapper padding from the hero container. A max-380px `.hero.wrap` rule was leaving 16px blank strips inside the border. The artwork and intro surface now fill the card width; the intro retains its own text padding. No typography, artwork, project or contact content changed.

# Heading rollback and lighter slide frames — October 31, 2026

Restored the heading typography from version 75 in English and Korean by removing the later serif overrides. The hero subtitle retains its original treatment. All project preview white borders are now 3px instead of 5px. Straight sample layouts and the nine-project selection are retained; Weather remains removed and Music/Advice remain present.

# Nine-project editorial refinement — October 31, 2026

Removed only Weather around the world from both project languages; Music integration and Advice & Suggestions remain. Section headings and project titles use the hero subtitle serif; category labels, subheadings, dates and body copy retain the sans-serif. Project samples are straight, with one main preview and an aligned thumbnail row; the two portrait workbook samples sit side by side. White frames, subtle shadows, torn backing, notebook/graph paper, the textured hero and sage contact section are preserved.

# Deployment packaging correction — October 31, 2026

The initial rollout of version 74 exceeded the host's uncompressed Worker limit. Packaging now shares identical payloads, losslessly compresses embedded text assets, and omits obsolete unreferenced hero experiments from overrides. The Worker returns the original uncompressed bytes and correct content lengths. Original source assets remain unchanged. Validation compares the served hero, both contact headings, identity/favicon and UI code byte-for-byte with source, including HEAD responses. A build size guard checks the packaging budget before publication.

# Matching Riso identity lettering — October 31, 2026

The header AR mark, English Contact me lettering and Korean 연락 및 이력서 lettering now use generated artwork referenced directly to the approved hero: matching high contrast letterforms, torn paper shapes, ink flecks and palette. The AR mark is also used as the favicon. The images have transparent outer backgrounds and are embedded byte-for-byte in the existing SVG assets, whose viewports size the lettering without blank margins. The hero, pale-sage contact panel, paper surfaces, content, and interaction behaviour are unchanged. Validated: existing interaction, locale, download and Worker checks pass; desktop AR/contact artwork and Korean mobile contact artwork were visually reviewed. Screenshots are in `design/matching-lettering/`. Saved for review only; do not publish without the owner's approval.

# Revised, unpublished artwork-and-paper draft — October 31, 2026

The owner rejected the flat approximation of the Riso mockup. The revision uses an imagegen edit of the approved artwork with physical ink texture, torn letterforms, and the original circle/block composition. Navigation and supporting text remain real HTML. The original white paper, ruled training panel, graph-paper qualifications panel, sage outer page, green contact controls and pale-green contact background are restored. Original contact and header lettering is restored. The draft omits tape while retaining paper edges and shadows. The existing ten-project grid, original samples and bilingual behaviour are preserved.

Validation: interaction, translation, download and Worker checks pass. Browser review covered English and Korean at 320, 768 and 1440 pixel frame widths, plus a 390 pixel mobile visual check. Document and viewport widths matched, and no completed image was broken. Review screenshots are in `design/oct31-revision/`. Original file bytes and project records are unchanged.

This is review-only. Do not publish or upload changes to the production bucket without the owner's approval.

# Unpublished Riso editorial redesign — October 30, 2026

The owner selected Riso editorial concept 1 and requested a complete redesign for review before publication. This draft replaces the stationery layout with a cream and forest editorial grid, cut-paper identity, coral/blue overprint geometry, paper grain, straight project frames, and matching gallery/contact controls. Tape and paperclips are omitted. Original slide artwork, source files, project content, bilingual copy, language/filter/gallery state and email/resume behavior are preserved. The original contact section uses email controls, not a server-submitted contact form.

The live site remains unchanged until explicit publication approval. The source is saved for review only. Browser screenshots are in `design/riso-review/`. Managed local preview serves `web/`; the production manifest and existing R2 routing remain intact. Do not upload web files to the production bucket before the owner approves.

Validation: all three interaction/locale/download checks pass. Browser QA verified English and Korean layouts, 320/390 phone layouts, 768 tablet and 1024/1440 desktop frames; measured page widths matched viewport widths. Verified the Reading for Meaning modal, image loading, and email reveal. Two preexisting original-download records lack a local verification cache; original bytes were not modified. Software brand logos and source slide colours remain unchanged by design.

---

# Anna Ready — Education Portfolio

## October 30, 2026 finishing pass

The current sage, forest, terracotta, and muted-blue identity is preserved. The hero uses a warm-white paper panel and the contact postcard uses pale sage with matching borders and shadows. White tape is shared across large and small preview frames; the contact paperclip retains the hero's terracotta accent. Previews stay stationary, with short opacity transitions and reduced-motion support. Software marks occupy a fixed centered column beside consistently aligned names. Desktop project pairs share aligned headings, previews, and actions.

All nine projects and their bilingual descriptions are retained. A bilingual Curriculum & units filter selects the camp, advice lesson, storybook unit, and cultural-exchange materials. The result count is visible. The hero's secondary action now goes to Background; the résumé remains in Contact.

Validation: the interaction suite covers 30 category/audience combinations across both languages, all nine project dialogs, source samples, remembered language, gallery-position preservation, browser history, menu keyboard behavior, and email/clipboard states. Locale parity, download behavior, and Worker routing checks pass. The two existing available original-file records have no local verification cache in this checkout, so original-file reconstruction hashes were not reverified. Original bytes and availability flags were preserved.

Managed browser QA used same-origin responsive iframes at 320, 390, 768, 1024, and 1440 CSS pixels in English and Korean. Document widths matched viewport widths at all ten combinations. No loaded image was broken. Mobile menu navigation, curriculum filtering, a full-screen gallery, next sample, in-dialog language switching without losing the selected image, and email reveal were exercised in the browser. This is responsive browser validation, not testing on physical devices. Site access is owner-only.

## USA Camp workbook (October 20)

The USA culture summer camp is the third selected project; Beyond teacher induction is fourth. Its overview shows the supplied portrait cover and Bananas Foster reading pages (#1 and #2), while the detail gallery includes all seven supplied images in order. The English and Korean descriptions place the 18-page workbook within the broader middle-school curriculum, which also used presentations and speaking activities. The full PDF and accompanying presentations are not hosted; this is stated in the project detail. The supplied PNG pages are preserved byte-for-byte. The overview retains two columns on desktop and stacks on narrow screens.

## Advice & Suggestions lesson

The fifth selected project shows a teacher-requested middle-school visit lesson as an example of an ordinary classroom PowerPoint and handout. The overview uses the title, advice/necessity, and comparison screenshots. The detail gallery includes those and the remaining five supplied images, including the student handout. Lossless WebP copies are served for the gallery; the supplied PNGs remain byte-for-byte in source. The 27-slide, 65 MB original PPTX is retained separately and is not hosted, as stated in both languages.

Private education portfolio for Korea education job applications. Preserve owner-only access unless the owner requests a change.

## Evidence and content

The project selection contains five projects: EPIK music workshop, Global Skills Enhancement, the graduate teacher-development analysis, the Nomi and Tashi taste-word storybook unit, and the USA/Türkiye elementary exchange-club lecture. The first three project records are preserved from the preceding version. Academic recommendations remain explicitly distinguished from evaluated outcomes.

The résumé, career history, qualifications, and contact details are retained. The trainer reach figures and footer were removed at the owner’s request. The club name includes the supplied Korean name: 강릉영어회화 모임. Source originals remain unchanged. Source previews are static; presentation media do not play.

## Design

The October 19 scrapbook redesign rebuilds the page composition: an oversized two-line name beside a custom collage of actual materials, a ruled notebook for trainer work, three different project arrangements, a career archive beside a graph-paper qualifications sheet, and a contact postcard. Custom torn edges, translucent tape, paper grain, paperclip linework, and framing recur deliberately. There are no generic rounded project cards or pill badges.

Two type families: self-hosted URW Bookman Demi for display and Noto Sans for readable text, with a small Noto Sans CJK subset for Korean characters. Font license files accompany the assets. The colour system is cream paper, ink blue, rose, and restrained dark red. Decorative colour does not convey interaction state alone.

`web/assets/learning-collage.svg` contains embedded source-image selections and custom vector artwork. Its brief annotations are paths so they do not depend on fonts inside SVG image documents. The decorative crop treatments do not replace the full-page project galleries.

## Files and interaction

- `web/index.html`: semantic page, navigation, native modal dialog.
- `web/projects.js`: the unchanged project evidence records.
- `web/app.js`: overview composition, filters, source galleries, deep links, mobile menu, copy-email behavior.
- `web/style.css`: responsive desktop, tablet, mobile, reduced-motion and print layouts.
- `scripts/validate.mjs`: interaction and asset validation without a browser.
- `design/opening-proof.svg` and `.png`: offline opening-screen composition proof created and reviewed before extending the page. These are design proofs, not browser screenshots.
- `.openai/hosting.json`: canonical Site identity and static output.

## Validation

Run `node scripts/validate.mjs`. Checks cover twenty filter/audience combinations, five dialogs, all gallery pages and boundaries, project deep links, neighboring project navigation, mobile-menu logic, clipboard success and fallback, internal anchors, and referenced assets. The redraw also checks source-content preservation, font glyph coverage, and colour contrast. Browser layout and device testing remain unavailable because the required control-browser skill is not exposed. Native hosting screenshots may provide an additional rendered desktop review after deployment; they do not constitute browser interaction testing or device testing.

## Annotation revisions

The header reads Portfolio. The hero punctuation and underline are removed. Trainer prose uses the available column width, and Selected projects remains on one line. The contact postcard is closer to the background section, its duplicate location is removed, and its loop has been replaced with the opening collage’s drawn paperclip.

Contact details are hidden initially. A keyboard-operable toggle reveals an email link and copy action; hiding clears the rendered address and link. The static HTML and application source contain no literal email address. This is client-side obfuscation, not bot-proof protection. The downloadable original résumé is unchanged and still contains contact information. Site access remains owner-private.

## Magazine-letter name

The hero name uses `assets/name-cutouts.svg`: nine individually typeset letter outlines from URW Base35 fonts, in the existing Rayo palette and paper grain. The existing font license covers the source families. No font download is needed for the SVG. The h1 retains the accessible image text Anna Ready. The outside header/content border is removed. Contact copy uses the owner-supplied wording exactly.

## Powder-blue refinements

The contact panel uses the shared powder-blue token with reduced vertical padding. The graduate-project article has no full-panel tint; its torn backing paper is powder blue, and screenshot borders remain white. The name’s A and y use blue paper. The graph-paper annotation is centred from its outlined glyph bounds. The EPIK trainer-summary article and folio divider are removed; the two remaining summaries are numbered in order. The EPIK project remains in the selected-work collection. The background résumé link is now its final row. The header reads professional portfolio. Contact fallback markup was removed after the supplied screenshot showed it printed literally.

## Latest navigation and contact polish

The project overview shows Explore project actions without the four duplicate PDF links or the trailing selection note. Full project dialogs retain their source document actions. The overview introduction uses the owner’s supplied text. The header is Professional Portfolio and the toolkit heading is Skills. Contact me uses a matching outlined-letter SVG with an accessible text label. The cream header and content canvas have 16px outer corner radii.

## Replacement Global Skills Enhancement deck

The middle project now uses Copy of Topic 3 GSE R3.pptx, supplied on October 19. Its two overview previews are byte-for-byte copies of image(2).png and image(3).png. Its six gallery pages are original slides 7–12 in order, with a matching six-page PDF. The earlier loose GSE images are removed. Project provenance and gallery-evidence notes identify the replacement source. Original source files are unchanged.

Slide conversion uses a font-aware office export for 7–11 and the alternate renderer for 12, which retains the complete Purpose title. Some source text overlaps remain in the automated renders; these require an author-exported PDF for a more faithful reference. Preview PNGs are unaffected by conversion. The résumé action is beside the Professional background heading on wider screens and stacks on smaller screens.

## Alignment and skill-brand annotations

The opening top padding is reduced to 16px (14px tablet, 12px phone), and hero columns align at the top while retaining the existing artwork scales. The trainer margin note is level. Professional background uses a left-aligned heading and introduction with the résumé action at the right; on narrow screens the action follows the heading. Contact content is centred in both columns, with the existing stacked mobile layout and reveal/hide behaviour preserved. The overview copy says “my contributions”; the background introduction uses the owner-supplied “nearly 8 years of education experience.” The TEFL line is removed from this section; the original résumé remains unchanged.

Five company marks accompany their existing skill labels. AI-assisted materials prototyping remains a method label because no provider is specified. Brand artwork retains its original colours, is served locally, and has empty alt text alongside the visible brand labels. Sources:

- Canva: https://static.canva.com/web/images/8439b51bb7a19f6e65ce1064bc37c197.svg
- Google: https://www.gstatic.com/images/branding/googleg_gradient/2x/googleg_gradient_standard_20dp.png (linked from https://workspace.google.com/)
- Microsoft: https://learn.microsoft.com/en-us/entra/identity-platform/media/howto-add-branding-in-apps/ms-symbollockup_mssymbol_19.svg
- Hancom: https://www.hancom.co.kr/images/common/bi-hancom.svg
- Adobe: https://www.adobe.com/content/dam/cc/icons/adobe_wordmark_red.svg

Company marks identify the listed tools and remain the property of their respective owners. Validation covers existing interactions and all new asset references, plus the revised content and accessible labels. Offline logo rendering was inspected; browser layout verification remains unavailable.

## Student-materials projects

Two student-materials projects are added after the existing three projects without replacing them. The Student materials category and Young learners audience each return the two new entries. All-work and modal counts are five. Both projects use the same existing paper, tape, preview borders, source gallery, deep links and project navigation.

- How does it taste?: the owner describes a school-requested Grade 3–4 school-visit unit linking storybooks, Chuseok and Thanksgiving, focused on taste words. The 97-slide `SVP #5 PPT.pptx` was inspected as Open XML to verify the lesson sequence and story dialogue. The owner identifies the digital storybook as AI-produced; the case study explicitly credits that process. The exact `image(4).png` and `image(5).png` files are the overview previews and two gallery pages. The turkey dialogue corresponds to original slide 63. The 193MB source deck is not included in site assets.
- USA & Türkiye: preparing for cultural exchange: the owner describes developing and delivering a guest lecture for high-level Grade 3–6 English exchange-club students at a Gyeonggi-do elementary school exchanging with US and Turkish schools. The exact `image(6).png` and `image(7).png` files are the overview previews and two gallery pages. The accompanying `us turkey.pptx` attachment failed to transfer; it has not been read, rendered or linked. No additional slide content is claimed.

The four supplied PNGs are copied byte-for-byte so their artwork, text and colours remain unchanged. The existing training and research project records are unchanged. No student outcomes or testimonials are added. Gallery excerpts are limited to the two supplied images per new project; original decks are not distributed in full. Browser layout verification remains unavailable.

## Background and contact refinements

Removed the AI-assisted materials prototyping skills line and the trainer-section sample shortcut. On desktop the qualifications paper begins alongside the background heading, spanning the header and history rows; it stacks after the timeline on tablet and phone. The résumé action is centred directly beneath the final Gangneung English Club entry. The Global Skills red paper now shares the first project's torn-edge shape through `--artifact-paper-edge`, retaining its red fill and the slide images.

The centred contact panel is approximately 30% narrower on desktop, with reduced padding and column gap. It keeps a readable stacked layout on narrow screens; controls retain their existing touch-target sizes and email behaviour. The English Teacher entry uses 횡계초등학교, 율곡중학교 and 강릉중학교, and the Korean font subset now includes every Hangul character on the page. School spelling references: https://www.schoolinfo.go.kr/ei/ss/Pneiss_b01_s0.do?SHL_IDF_CD=2257c421-1135-40d9-8136-a8d2b11d324c ; https://yulgok-m.gwe.ms.kr/openMap/view.do?m=0105&s=yulgok_m ; https://gwgned.gwe.go.kr/srchSite/list.do?m=371822&s=help&selRegion=%EA%B0%95%EB%A6%89 . Project records and source previews are unchanged by this refinement.

## Bilingual portfolio and original PowerPoints

The header and project-dialog language buttons switch the complete website between English and Korean. `web/locales.js` contains paired page and interface copy; each project in `web/projects.js` contains its Korean record under `ko`. Language selection is stored locally. Switching preserves filters, the active project, and gallery position. Navigation, image alternative text, gallery captions, source notes, file actions, email states and document metadata are localised. Original source documents, screenshots, brand marks and the Anna Ready name artwork retain their original languages. Localised cutout/contact and graph-paper annotation SVGs preserve the existing palette and paper arrangements. Regular and bold Korean Noto subsets cover all current Hangul.

The powder-blue contact slip contains both the résumé link and revealable email controls. The redundant résumé row beneath the timeline is removed. The original project preview pairs remain on the overview. Tape now belongs to the smaller, fixed preview wrapper; the large slide keeps its existing hover movement.

Each project dialog presents its purpose and audience, selected source samples, contribution and design choices, with a Materials area directly below the gallery. The primary file action downloads the complete original PPTX. Existing PDF excerpts and the full EPIK guide remain secondary actions. The curated galleries contain 7 EPIK/guide samples, 5 Global Skills samples (original 7, 8, 10, 11, 12), 6 research samples including references, 6 storybook/lesson samples, and 5 USA/Türkiye samples. Exports with crowded or clipped text are omitted rather than presented as the strongest samples. The full original decks remain unmodified.

All five original PowerPoints are available. `us turkey.pptx` was recovered from its saved original and contains 57 slides. `web/originals.js` records original filenames, exact sizes, complete SHA-256 hashes, and hosted paths. Small originals are direct files. The larger originals use exact 20MiB byte parts to satisfy the host's 25MiB per-asset limit; downloading creates the unchanged original PPTX filename. Browsers supporting file saving can write parts sequentially; other browsers use a normal Blob download. Download progress, cancellation and failure states are bilingual. Every part is size-checked and SHA-256-checked before assembly when Web Crypto is available. The asset-size limit is documented at https://developers.cloudflare.com/workers/platform/limits/ .

Validation: `node scripts/validate.mjs` checks 40 language/filter/audience combinations, five dialogs in both languages, all gallery samples, navigation, remembered language, in-dialog switching, and bilingual email states. `node scripts/validate-locales.mjs` checks paired content, gallery/document translation counts, original-file reconstruction hashes, and asset sizes. `node scripts/validate-downloads.mjs` checks streaming save, browser and embedded-browser fallbacks, cancellation, transfer failure and direct downloads. `AGENTS.md` requires future website copy changes in both languages. Offline asset renders and selected source-slide exports were visually inspected. Browser layout and device verification remain unavailable.

## Current file delivery

The website source is in `web/`. All website assets and original-file parts are stored in the Site’s R2 bucket and served by the small `worker/index.js` router. `.openai/hosting.json` preserves the same project ID and declares `r2: BUCKET`; `node scripts/build-worker.mjs` produces the deployment package. This keeps the roughly 580MB of original PowerPoint data out of the build archive. The local verification cache is `storage-data/originals/` (ignored by Git). The uploaded original Library records and the Site file bucket retain the actual files; `web/originals.js` retains their exact hashes. The Site access gate applies to website and file requests. The production router is read-only; file updates require a separately authorised maintenance upload process. No credential is included in website assets.

## October 19 bilingual publication check

The header language switch uses the existing warm yellow, tomato border and offset shadow, with responsive spacing. Both languages, project galleries, filters and remembered language are covered by the interaction checks. All website assets are checked against the hosted file etags and byte sizes during publication.

The original-file availability audit found all parts for the Global Skills and storybook decks, but missing files for EPIK, the graduate analysis and USA/Türkiye. These three original-download controls are disabled with paired English/Korean explanations; their selected samples and existing PDFs remain available. Set their `available` flags after the original-file uploads have been completed and verified. No original file bytes were changed. The local original-file cache is absent, so full original SHA-256 reconstruction was not rerun for this language update.

## Paper collage consistency

The Korean contact title uses individually outlined Noto Serif KR and Noto Sans CJK characters on varied, textured cut-paper shapes. The serif outlines were prepared from the Google Fonts Noto Serif KR Bold character subset; no external font is requested by visitors. All project overviews share a compact responsive collage geometry, the existing torn-paper backing edge, and white torn-paper descriptor slips carrying the existing paperclip artwork. Mobile headings are centred in both languages.

## Ordering food game

The sixth project documents the owner's reusable customer/cashier speaking game. The red fast-food menu is the lead preview; the wheel and Pick 3 game are the two smaller previews. The bilingual case study describes the two menu levels, pair-to-whole-class use, original middle-school audience, elementary use, and repeated annual classroom use. It makes no measured learning-outcome claim. The supplied deck contains 51 slides and remains unchanged. The original download is marked unavailable until its bytes are hosted and verified.

The site's static files live in R2, and this editing environment cannot reach its protected upload endpoint. For this bounded update, the Worker build embeds only the changed project metadata and three supplied PNGs as byte-exact route overrides. The original PPTX is not in the Worker bundle. Future file-bucket uploads can remove these overrides after verifying the replacement files.

The four additional ordering-game gallery screenshots show bubble tea, sauce choice, pizza choice, and the restaurant reward scene. The fifth supplied image in that update is a screenshot of the portfolio dialog and serves as layout evidence, not a source slide. The desktop project collection now uses a uniform two-column grid across all six projects; tablet and phone rules retain a single-column flow. The Worker override list includes the changed CSS and four byte-exact PNGs because the R2 upload endpoint is unavailable to this environment.

## Student projects first and white tape

The storybook and USA/Türkiye projects lead the six-project collection in both language modes. Display numbers follow the new order; the existing paper backing colours and collage tilts remain associated with their original projects. All site-created tape shapes on small previews, the trainer and qualifications paper, and both language variants of the hero collage use opaque bright white. Source slide artwork and supplied preview screenshots remain unchanged.


## Revised Topic 3 educator training project

The Global Skills Enhancement project now uses the seven supplied images from the revised 36-page Topic 3 PDF. The overview uses the title slide, context/tone/audience slide, and tone slide; all seven supplied images appear in the detail gallery. Content identifies the audience as Gyeonggi education staff—including teachers, administrators, and officers—and classifies the work under Teacher training / Educators. The obsolete adult-training category and adult-learner audience filter were removed. The prior selected-slide PDF link was removed; the full revised PDF is not hosted. Gallery WebP images are lossless pixel matches, and supplied PNGs are retained byte-for-byte in source.


## Hero and navigation notes (October 20)

The opening collage uses the current USA Camp cover, Advice & Suggestions title, and Global Skills C.L.E.A.R. screenshot. It is a source-based SVG composition with scrapbook backing, white tape, paperclip, pencil, and squiggles; English and Korean versions share the same composition with paired accessible descriptions. Hero copy, language label, and How I work introduction are centered. The Student materials category button is present; the obsolete Adult training category is removed. USA Camp uses the Curriculum development card label. The two section introductions follow the owner-supplied wording, with a Korean counterpart.


## Interactive speaking games (October 20)

The final project pairs the existing ordering-food game with a newly supplied 24-slide weather game. Its card retains the red menu as the large image and shows the world-weather board and ordering points wheel as the two smaller images. The gallery includes all seven ordering screenshots and all six weather screenshots. The weather game broadens location-based weather practice beyond Korea for upper elementary and lower middle-school learners. The supplied weather PNGs are retained byte-for-byte in source; the hosted WebP copies are lossless pixel matches. Both original PowerPoints are retained separately and are not hosted. This grouping keeps the two-column project grid at eight cards.

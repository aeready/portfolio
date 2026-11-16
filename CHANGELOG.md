# Changelog — art direction and UX overhaul

Base: the colour-band layout (`claude/wizardly-newton-mtmf99`). This branch: `claude/colour-bands-polish`.
Each entry: what changed, the rule it serves, how to undo it. Nothing here is live until the owner uploads and publishes.

## 18 Nov 2026 — Owner's review round

- **Cursor:** the registration-mark cursor and the lime ring that followed it are removed; ordinary arrow and hand everywhere.
- **Project order and colours:** Reading for Meaning, Music in English Classes, Clearer Global Communication, then the rest in their old order. Bands run lime → aubergine → cream and repeat, counted from whatever is showing, so filtered lists keep the same rhythm. The project page takes its band's colour.
- **One band layout:** every project band now has the same composition (work on one side, number, title, facts, summary and View on the other, alternating sides), fits one screen so View is visible without scrolling, and every cover sits at the same size (landscape covers the same width, portrait covers the same height).
- **Buttons like the phone menu:** button links outside the top bars are set in the title face (Korean: the reading face). Contact is now a numbered list like the phone menu, the email row a solid block. "View" only moves when the pointer is on it, not anywhere on the band.
- **Booklets:** USA Camp pages 10 and 12 swapped (captions renumbered in both languages). The last page no longer appears twice: the facing page is a lime "The end!" / "끝!" in the title face, on all three booklets. (Note: the downloadable PDF is in the Site bucket and wasn't checked here.)
- **Project pages as a file cabinet:** the sections (brief, choices, evidence, details, source; USA Camp's case study parts) are coloured files side by side: the open one wide, the rest as spines with a number and title. Click a spine to open it. On phones they're stacked drawers with a +. The files deal in once when they come into view. Arrow keys move between tabs.
- **Contact me:** the title is smaller and on one line on desktop.
- **Footer:** the fonts-and-inks line is removed.
- **Tagline:** "Good materials get better with use." → "Made in classrooms, for classrooms." / "교실에서, 교실을 위해 만든 자료."
- Undo: the "Owner's review round" blocks at the end of `edition.css`; `projects.js` order; `app.js` (data-tone, projectOrder, The end page).

## 18 Nov 2026 — Editorial edition (owner said yes to the full list)

New work for this round is in `web/edition.css` and `web/edition.js` (loaded after `press.css` / `press.js`). **Undo the whole round:** remove those two tags from `index.html` (and the two names from `scripts/build-worker.mjs`).

### Group 1 · Fixes
- **Project details / Source & scope** looked like empty rows: they were collapsed fold-outs whose open marker had been styled away. They are now ordinary open sections; the Audience / Context / Format facts sit in a ruled three-column row (one column on phones). Undo: restore the two `<details>` in `app.js` `openProject`.
- **Double rule above Project files** (rule, 48 px of nothing, rule) is now one rule. The empty "original download" block is hidden when there is no original to download.
- **Project files card:** title + PDF chip on the left, "View in new tab" and "Download" side by side on the right (on phones: chip beside the title, links on one line under it). The "PD/F" chip break on phones is gone.
- **Hero:** "Teacher trainer & / curriculum designer" now always sets on two lines on desktop (it was leaving "designer" alone on a third line).
- **"My background" button** had no bottom edge (an older rule removed it). It is now a complete outlined box, same height as "Explore work", lime on hover.
- **Korean font gaps closed.** The three Korean subsets (regular, bold, black) were rebuilt from the full Noto Sans KR (same design and metrics) and now include every syllable the site uses; the 11 that fell back to another font (것 난 누 듭 쉬 엇 웠 잘 좋 째 흥) now match. Files are ~30% smaller. New check: `python3 scripts/check-korean-font.py`. Undo: restore the three old font files and their names in `style.css` / `refine.css`.

### Group 2 · Typography
- Kerning and standard ligatures switched on explicitly (the display face already carries a kerning table, so no hand-kerning was needed).
- Headings balance their lines; paragraphs avoid one-word last lines (`text-wrap: balance / pretty`). English paragraphs hang opening punctuation.
- Figures: lining, tabular numerals in stats, counters and dates.
- **Korean:** lines break between words, never inside one (`keep-all`, strict line breaking); body leading raised to 1.75–1.8 for Hangul; no negative tracking on Hangul text.
- **Project reading rail:** every paragraph and list is one size (paragraphs were 14.4 px beside 17 px lists; now 17 px, 16 px on phones). Labels sit on the first baseline of the text beside them, including "My role".
- **Hanging dashes:** bullet lists in the rail use an en dash that hangs in the gutter, so the text keeps the rail's left edge.
- **Gallery counter:** the big misregistered numeral and its "/ N" share a baseline; the total is set in the display face.
- **Case study (USA Camp) width fix:** a paragraph-measure rule was squeezing the whole case study (facts, brief, the day-by-day plan) into a ~600 px column in both languages; the rows are full rail width again.
- Checked: copy already uses curly quotes, real dashes and × throughout — nothing to change.

### Group 3 · Composition
- **One left edge.** The hero's text block started at 80 px at 1440 px wide while the logo, name, sections and footer start at 152 px; at 1024 px it touched both screen edges. It now uses the same page edge as everything else.
- **Lead project as an opening spread** (desktop): the first band gives the work about 60% of the width, sets the numeral and title larger (the title is sized to its column so the longest word always fits), and has more air above and below. Korean title leading adjusted so the lines don't touch. It follows whatever card leads the current filter.
- **Colophon** in the footer, both languages: "Set in Open Sans Condensed, Noto Sans, Noto Sans Mono and Noto Sans KR. Two inks, aubergine and lime, on cream paper." / "서체는 … 크림색 종이 위에 가지색과 라임색, 두 가지 잉크로 인쇄했습니다." On phones the footer links now come last. "CC BY-NC 4.0" no longer breaks across lines.
- New script `scripts/build-korean-font.py` rebuilds the Korean subsets whenever new Korean text is added (it fetched 쇄 and 잉 for the colophon). Fonts renamed again: upload the three current `NotoSans-Korean-site*--*.woff2`.
- Looked at and left alone: rule weights (already two weights: 1.5 px ink for section breaks, 1 px at 15% for rows) and the band ornaments (already pinned to band corners).

### Group 4 · Pages and the gallery
- **All pages (contact sheet):** a new "All pages · N" button beside the gallery counter lays every page out on the dark ground, numbered like a proof sheet (portrait pages in narrower columns). Choose one to open it (spreads open at the right pair). Escape or × closes it and returns focus; arrow keys don't turn pages behind it. Phones get it too.
- **Crop marks:** fine printer's crop marks at the four corners of the page(s), outside the work, never over it.
- **Spine:** in booklet spreads the fold darkens slightly; during a page turn the shadow sweeps in from wide to narrow.
- **Light table:** on desktop, the page catches a faint glow when the pointer is over it.
- **Loupe:** on desktop, press and hold a page to get a round 2.6× magnifier that follows the pointer; let go to put it away. A quick click still opens the full-size image; a hold never does. A one-line hint sits under the counter ("Press and hold the page to magnify it" / "페이지를 길게 누르면 확대됩니다"). Fixed on the way: the varnish sheen covered the empty stage beside spreads; it now covers only the pages.
- **Thumb index:** on wide screens (1100 px+), numbered tabs on the right edge of a project page, like a dictionary's cut tabs: hover or focus to slide out the section name, click to jump; the section you're reading is inked.
- **Folio:** on wide screens, a running foot on project pages: "Anna Ready · Portfolio" left, the project's number and title right.
- **Next project:** at the foot of each project (tablet and desktop), the next band's number and title in the display face, with its cover rising from the bottom edge; it lifts on hover. Phones keep the sticky Previous / Next bar.
- **Band titles print in two plates:** the lime plate lands wide and slides into register, like the outlined numerals (not with reduced motion).
- USA Camp: the role's rule and the case facts' rules no longer sit 4 px apart.
- New strings, both languages: All pages / 전체 페이지, Close all pages / 전체 페이지 닫기, the sheet title, the loupe hint, Sections on this page / 이 페이지의 항목, Portfolio / 포트폴리오, Next / 다음. Korean font rebuilt (됩).

### Group 5 · Motion
- **One curve family:** the near-duplicate "print" curve and the literal curves in older files now use the site's `--ease-press` (things arriving) and `--ease-plate` (plates); small hovers keep a plain ease.
- **Navigation:** one lime bar with an ink edge slides under the main menu to the link you point at, and rests under the section you're reading (desktop). The current section's link is marked for assistive tech too.
- **Hero figures** 250+ and 15+ count up once when they first appear, then the lime plate lands in register. Screen readers hear only the final figure. Not with reduced motion.
- **Print piles** fan only if the pointer stays ~70 ms, so passing the cursor over a band no longer flickers it. Closing is immediate.
- Checked and left as is: primary buttons already press into their offset shadow when clicked; closing a project returns to the card with no scroll jump (measured every frame); reduced motion stays fully static, as you decided earlier (no fade added).

### Group 6 · Images, and the two booklets you asked for
- **Reading for Meaning sample booklet:** already set to show as a booklet (cover alone, then 2–3, 4–5, 6), and confirmed on desktop. Your phone screenshot was correct: phones show one page at a time (spreads are desktop-only, like USA Camp), with tap-to-zoom.
- **Music in English Classes: the course guide is now its own booklet gallery.** The 10-page EPIK course guide you uploaded is byte-identical to the PDF already on the site (`assets/epik-course-guide.pdf`), so no new download was needed. Its 10 pages are now a second gallery tab ("Workshop slides · 8" / "Course guide · 10"; "워크숍 슬라이드" / "강의 원고"), shown as spreads on desktop, with captions in both languages. The two loose course-guide pages that were mixed into the workshop slides moved into the guide.
- **Gallery tabs:** the counts were hard-coded ("· 32", "· 6"); they're now counted from each project. On phones the tabs are a compact two-part switch (the active one lime) in the reading face, instead of two wrapped all-caps headings.
- **Smaller images:** every work image now has a 160 px copy for the gallery strip, and the 32 Reading for Meaning slides got 160 / 480 / 960 px copies (they had none, so phones loaded the full files). Phone first view: 2.15 MB → 1.97 MB; opening USA Camp on desktop: 1.23 MB → 0.60 MB. Script: `python3 scripts/build-previews.py` (originals untouched, colour profiles kept).
- Looked at and left alone: the hero artwork renders wider than its file on every screen (1,541 px at 1440, 2,054 px at 1920), so a smaller copy would blur it.
- Korean font rebuilt again for the new captions (끄 술 애).

## 17 Nov 2026 — Booklet spreads and tap-to-zoom

- **Desktop, portrait galleries (USA Camp workbook):** pages show as an open booklet: the cover alone on the right, then 2–3, 4–5 … side by side, the last page alone. Arrows, swipe and arrow keys turn a whole spread; the counter reads "2–3 / 18"; both pages are highlighted in the strip; the caption names both. Pages turn in from the spine (fade, slight 3-D turn, focus pull). The halftone shadow sits under the whole spread. Landscape decks are unchanged (one slide at a time).
- **Phones:** tap the page to open it full screen on a dark ground; tap again to zoom to 230% at the point you tapped and pan around; previous / next and the page count along the bottom; × or Escape closes and returns focus to the page. New strings in both languages ("Tap the page to zoom in or out" / "페이지를 탭하면 확대합니다"; "Close full-screen view" / "확대 보기 닫기"), checked against the Korean font subset.
- Fixed on the way: the gallery shadow ignored its measured position in some layouts (an `inset: auto !important` override).
- Arrows, swipe and keys now share one stepping function in `app.js`.

## 17 Nov 2026 — Fifth pass

- **Desktop language switch** is lime (aubergine on hover), matching the phone Contact button.
- **USA Camp band piece:** the halftone blot replaced with a registration grid from the owner's riso library (`reg-grid`); `halftone-fade` deleted.
- **Gallery:** the lime "open full size" arrow badge is gone on all screens (tapping the image still opens it full size).
- **Slide change motion:** a soft dissolve (fade, slight lift and focus pull, 460 ms) instead of a wipe from the top.
- Note: the owner's phone screenshots were of the previous upload; the strip-under-the-image layout and deck-sized gallery from the fourth pass are in this branch.

## 17 Nov 2026 — Fourth pass (owner's phone review)

- **Hero proof numbers:** always two side-by-side columns in both languages (English stacked when the phone's text size was larger).
- **Hero buttons:** labels never wrap; below 380 px the two buttons stack full-width.
- **Education → Skills:** one rule and one 32 px gap instead of rule, empty space, rule.
- **Project gallery:** the numbered strip now sits directly under the work, then the counter and caption. The viewing room is sized to the project's own tallest slide (capped at 56% of the screen height on desktop, 52% on phones), so landscape decks no longer float in a tall empty box and the strip is visible without scrolling.
- **404:** "오식." is set in the same face, size and lime offset as "MISPRINT."
- **Korean copy checked against English, line by line:** "Contact me" was "연락 및 이력서" ("Contact & résumé") and is now "연락하기"; the phone filter label was "보기", the same word as the View buttons, and is now "분류". Both checked against the Korean font subset. Every other string matches in meaning and register.
- **Accessibility fix found in the audit:** elements waiting to animate were `visibility: hidden`, which removed off-screen project cards from keyboard Tab order. They are now transparent (still focusable), and focusing one shows it immediately. All seven cards are reachable by Tab.
- Checks: phone emulation at 320–430 px and desktop 1024–1440 px, EN/KO; text ≥ 12 px, controls ≥ 44 px, decoration pixel test 0%, all links land, all validators pass.

## 17 Nov 2026 — Third pass: real-device fixes, motion v2, finer riso, Misprint 404

From the owner's phone screenshots and a full audit (phone and desktop). Body font: the owner chose to keep Noto Sans / Noto Sans KR (option A).

### Broken on real phones (fixed)
- **Sideways "void":** full-bleed band textures made phones lay the page out at ~960 px. Clipped at page level; layout is now exactly the screen width (checked with phone emulation at 320–430 px).
- **"Explore work" / "My background" did nothing:** the hero artwork's box sat invisibly over the buttons on phones.
- **In-page links snapped back** (Explore, Background, footer "Back to top") once any project had been opened: the return-to-list logic ran on every link. It now only runs when leaving a project. Jumps also correct themselves when lazy images shift the page during the scroll.
- **Project pages showed blank cream below the gallery on phones:** the sections waited on a scroll timeline that phone browsers did not run. Content is always visible now.
- **Gallery jitter:** the image box changed height between slides (and on desktop, tall pages overflowed their frame). The viewing room now has one fixed height; slides wipe in without moving the page.

### Phone design
- Hero text has proper side margins; "Explore work" and "My background" are an even pair of buttons (the green tap colour is gone).
- The menu is a full aubergine sheet: numbered links set large in the display face, Contact as a lime block.
- Filters collapse into one control ("Filter · All work 7 ▾") that opens the list; new strings in both languages ("Filter" / "보기").
- "Korea" removed from the hero note (EN and KO).
- The halftone shadow is one shared backing under the whole print pile instead of one per print.

### Motion v2
- Every scroll-scrubbed animation removed (they froze half-done when you stopped scrolling: doubled numbers, tilted drifting pieces, half-covered work). Elements now print **once, completely**, when they arrive: lines of type rise in sequence; the outlined number's second plate slides into register; big headings rise out of a baseline mask; the print pile is dealt (back prints slide out from under the cover, then the cover settles); the band's riso piece fades in and stays still.
- Tilts are a system, not noise: cover straight, the two prints behind at a fixed ±2° on every band; hover fans them by a set amount.
- Without JavaScript or with reduced motion, everything is simply there.

### Riso
- Chunky square pieces (op-art square, spiral, halftone square, letterform, torn layers, wave band) replaced with finer ones from the owner's library: a registration circle, an overprinted moon, a quartered registration target, a halftone dot disc, torn grid paper. Removed files deleted.

### 404 "Misprint"
- Three ink plates of "404" (outline, lime, halftone) slide in and stop slightly out of register; on desktop they drift with the pointer. "Misprint." / "오식." with the original copy in both languages; Home and Email me. Styles and script moved to `nf.css` and `nf.js`; the old inline `<style>` was blocked by the site's own security policy.

### Favicon
- A drawn, misregistered AR favicon was tried and reverted at the owner's request; the original `favicon-ar-v2.svg` stays.

### Checks
- Phone emulation (Galaxy S9+): layout width = screen width; every in-page link lands on its section, including after opening a project. Text ≥ 12 px and controls ≥ 44 px at 320–1440 px EN/KO; decoration pixel test 0% on text and work at 375/768/1024/1280/1440 px. All validators pass. New Korean characters checked against the font subset ("쇄" is missing, so the 404 uses "오식").

### Owner to upload
`index.html`, `404.html`, `nf.css`, `nf.js`, `press.css`, `press.js`, `app.js`, `locales.js`, `assets/riso/lib/` (new: reg-circle, moon-overprint, halftone-disc, grid-torn); delete the removed library files from the bucket; publish the rebuilt Worker.

## 16 Nov 2026 — Second pass: calm, finish, gloss

Second audit (owner's brief: "look like a team of expensive designers made it"; no AI-template tells; nothing in front of words or the gallery). Owner approved: replace the checkerboard with a halftone fade, cut ornaments by about half, retire offset shadows, add gloss, vary the bands.

### Stage A — calm
- **Measured overlaps fixed** (screenshots with and without decorations, pixel comparison, 375/768/1440 px, EN/KO): the circles ornament covered 34% of the Korean "Selected projects" intro on desktop; X-tape covered 2–3% of the gallery cover on phones; band pieces touched project titles, the Professional background heading and a How I work paragraph on tablets; the checkerboard touched "USA Camp" on phones. All now 0%.
- **Checkerboard** replaced by a halftone fade from the owner's riso library.
- **Ornament budget about halved:** riso pieces only on bands 1, 3, 5, 7 (quiet bands between); removed the small cross, circles, graph, bullseye, tape, moon, the contact frame, tape strips on covers and X-tape on the gallery. On phones and tablets the pieces are mostly cropped by the band edge, above the number row.
- **Hard offset shadows retired** everywhere except the primary buttons (the 2024–25 template signature). Covers and the gallery sit on soft, layered paper shadows instead; hover lifts the print 4 px.
- **One voice for controls:** buttons in the reading face, sentence case; the mono face kept for small labels only (nav, filters, chips, dates). Hero details in the reading face.
- **Arrows** only where a link leaves the page (removed from "Explore work", "My background" and "Reveal & copy email address", which never left the page).
- **Project pages:** coloured left-border boxes and day cards set as ruled text.

### Stage B — finish
- **Spot-UV varnish:** a clear sheen on covers, the gallery and the hero art that follows the pointer on desktop and sweeps once as a cover scrolls in on phones. Transparent at rest, so source colours are untouched; off under reduced motion.
- **Sharper covers:** high-density screens were showing 960 px images at about 1,180 device pixels. The full-size originals are now offered in `srcset`, and `sizes` matches the real slot (600 px).
- **One motion family:** shared durations (140 / 260 / 620 ms) and two curves.
- **Designed focus ring:** aubergine outline with a lime halo on every control.

### Stage C — composition
- **How I work removed** (owner agreed it added nothing): its three generic steps and intro repeated the hero. Its two real numbers moved into the hero as proof, in the display face: **250+ educators reached through training · 15+ schools visited for lessons** (existing EN/KO strings, no new claims). Nav link removed; the ribbon "Good materials get better with use." stays. `validate.mjs` updated for the new section order.
- **Poster hero** (new default): the artwork full-bleed, "ANNA READY" set huge across its bottom edge (half on the image, half on the paper), then role, intro, proof and details in three columns. Your role line shows above the fold on a 1280 × 800 laptop and at about 420 px on phones. **Undo / switch back:** remove `hero--poster` from `<section id="home">` in `index.html`; the framed version is untouched.
- **Seven band compositions** on desktop, by position, so the rhythm survives filtering: spread · statement (title across the band) · centre stage · mirrored spread · contact sheet (three proofs in a row) · offset print · title-led spread. Riso pieces follow the work's side so they never sit behind text.
- **The print pile** replaces "one big image, two small below": the cover lies on top of the other two samples like prints on a table, slightly rotated. They fan open on hover (desktop) and as the band scrolls in (phones). Prints cast **halftone shadows** (a riso dot screen, lime on aubergine bands) instead of soft blurs.
- **View buttons** are solid in each band's contrast ink (aubergine on paper and lime, lime on aubergine) so they never blend into the band.
- Checks: decoration pixel test 0% on text and the cover at 375/768/1024/1440 px EN/KO; no text under 12 px, every control ≥ 44 px; all validators pass.
- **Project page gallery** gets the same halftone print shadow (replacing the soft blur and crop marks).
- **Project gallery, redesigned as a viewing room:** the gallery now spans the page on a dark aubergine ground directly under the opener. The work is shown as large as the screen allows (up to 70% of the screen height) as a print with a lime halftone shadow; no box around it. The counter is set as type (a large "6" over "/ 18" and the slide's own label). 64 px arrows. The strip is a numbered contact sheet; the current frame is lit. Each new page is laid down with a quick top-to-bottom wipe.
- **Project page reading order** (owner: "cream, wordy, no eye line"): gallery → role as a large lead statement → every section on a left label rail with its text on one measure to the right → files. Facts as a ruled row. Sections set in as you scroll. Content unchanged.
- **Share card:** a 1200 × 630 poster image (`assets/share-card--8c00ecbff6ae.jpg`) and Open Graph / Twitter tags, so links pasted into KakaoTalk, LinkedIn or Slack show the poster instead of a blank box. The site is still `noindex`, so search engines stay out.

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

### Phase 2 — type as architecture, the filter index, wall labels
- **Change:** "Selected projects" and "Contact me" set monumentally (up to 168 px) in a Bauhaus staircase: the second line steps in. Korean set at the same weight, kept on whole words. Intro paragraph sits beside the heading on desktop. (R1, R3, R5)
- **Change:** project numbers up to 184 px on desktop, 80–112 px on phones.
- **Change:** filters become a one-line index with counts ("All work 7 / Training & workshops 3 / …"). Still toggle buttons with `aria-pressed`, 44 px tall; the active one has a lime marker bar under aubergine text. The separate "7 projects" line is now screen-reader only (still announced on every filter change). (R4, R9 Hick's law)
- **Change:** a museum wall label on every band: Format and Audience from the existing project records, in both languages. No new facts.
- **Undo:** delete the "Phase 2" block in `press.css`; remove the `wall-label` markup and `data-count` line in `app.js`.

### Phase 3 — the press run: motion, cursor, riso library (R6, R7)
- **Opening sequence** (once per browser session; never under reduced motion; never on a direct project link): a lime plate and an aubergine plate slide into registration, the AR mark and name print, quarter-target registration marks sit at the corners, then the sheet feeds up off the page. About 1.4 s; a tap or any key skips it. The page loads underneath throughout. `press-boot.js` (a 0.5 KB external script, because the site's security policy blocks inline scripts) sets it up before first paint.
- **Hero:** the artwork prints from the top as if through rollers, the image settles, the name drops into place, the copy sets line by line.
- **Scrolling** (browsers with scroll-driven animations; others see the finished page): each cover prints through a halftone screen whose dots grow until solid; each outlined number's lime plate slides into registration; band text sets line by line; riso pieces drift against the scroll; "Selected projects" and "Contact me" slide in from the gutter.
- **Controls:** buttons lift slightly on hover and press into their shadow; placement and behaviour unchanged (R4).
- **Registration-mark cursor** on desktop (fine pointer only) over the hero, filters and project bands; a lime ring follows a beat behind, so the two plates are out of register while moving. Links, buttons and text keep normal cursors. No lime ring under reduced motion.
- **Riso library:** 15 pieces from the owner's 58-piece bank (`claude-code/riso-assets/png/`, untouched) converted to WebP in `assets/riso/lib/`: op-art waves, cream target, spiral, overprint circles, checkerboard, letterform crops, torn layers, halftone square, wave band, torn circle, quarter targets, X-tape, lime corners, hazard stripe. One composed moment per section: halftone square under the hero art; a cropped letterform in the right margin of Professional background (wide screens); a wave band and a torn sheet laid across the seams into How I work and Contact; a new piece for every project band.
- **Fixes found on the way:** "Contact me" no longer clipped at 375 px; the opening plates no longer overprint to brown.
- **Undo:** remove the `press-boot.js` and `press.js` script tags and the `.press-intro-sheet` element from `index.html`; delete the "Phase 3" block in `press.css`.

### Phase 4 — project pages instead of a pop-up
- **Why:** the pop-up floated as a cramped box over a dimmed page, stacked competing frames (dialog border, gallery box, chips, boxed facts that looked like buttons), showed the work small, left a dead hole under the left column, and had a timid title with none of its band's identity.
- **Change:** each project now opens as a full-screen page (same `#project/…` address, same Back/Forward, focus and Escape behaviour; still the accessible `<dialog>` underneath).
  - Sticky page bar: Back to projects · "5 of 7" · **Contact** (new, one tap from every project; lands on Contact with the email button focused) · language · Close.
  - Opener in the colour of the project's own band, with its outlined number (misregistered), monumental title, and that band's riso piece.
  - Gallery first: the work on a mount with crop marks and X-tape, sticky beside the reading column on desktop; 56 px arrows; a swipeable filmstrip of larger thumbnails with a fade showing it scrolls.
  - Reading column: facts set as a ruled list, not boxes.
  - Phones: Previous / Next project is a sticky bar at the bottom, in thumb reach (R8).
- **Motion** (View Transitions where supported; reduced motion gets instant open/close): the card's cover morphs into the page's gallery while the page feeds up like a sheet. On the way back the page feeds off, the cover flies back into its band, and the band you came from is re-printed: a riso registration stamp lands on its number, a lime pass sweeps across the band, and the number takes a full ink pass before settling, so you can see where you are.
- **Undo:** delete the "Phase 4" block in `press.css` and the project-page section of `press.js`; remove the `.dialog-contact` link from `index.html`; restore `withViewTransition` in `app.js` from the previous commit.

### Phase 5 — QA
- Checked in Chromium at 320, 375, 430, 768, 1024, 1280 and 1440 px, English and Korean, home page and project page: no text under 12 px, every control at least 44 × 44 px, nothing cut off.
- Fixed on the way: Close label 11.5 → 12 px; the page bar's Contact 40 → 44 px tall on phones; Korean "이력서" nav link 42 → 44 px wide; "PROJECTS" and "CONTACT" lost their last letter after the slide-in; "Contact me" ran under the email button at 768 px (both languages); the circles ornament covered "PROFESSIONAL" on tablets; the project page could be shifted sideways by focus (overflow fix).
- Flows tested: open a project, Escape / Back / Close return focus to its card; the page bar's Contact lands on Contact with the email button focused and on screen; direct links (`#project/…`) open without the opening sequence; browser Back closes the page; reduced motion shows no sequence, no scroll effects, no lime cursor ring.
- All validators pass: `validate.mjs` (also with direct entry), `validate-locales.mjs`, `validate-downloads.mjs`, `build-worker.mjs`, `validate-worker.mjs`. No new Korean characters were added, so the font subset is unchanged.

### Owner to do before publishing
- Review on your phone and laptop (the opening sequence shows once per session; open a private window to see it again).
- Upload to the site bucket: `press.css`, `press.js`, `press-boot.js`, `fixes.css`, the changed `index.html`, `404.html`, `app.js`, and the new images in `assets/riso/` (`grain-ink`, `grain-paper`, `mottle-ink`, `mottle-light`) and `assets/riso/lib/` (15 files). Then publish the rebuilt Worker.
- Check the live Content-Type headers for the new CSS, JS and WebP files.

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

# Decisions

Anna's decisions on the annaready.kr overhaul, newest first. Where a decision changes a proposal in another document, this file wins.

## 15 Nov 2026 — Base layout corrected

| Decision | Detail |
|---|---|
| **The colour-band layout is the base** | Branch `claude/wizardly-newton-mtmf99` (alternating paper, lime and aubergine project bands; outlined numerals; riso ornaments) is the design to polish. Earlier Stage 1–3 branches were built on the older `main` by mistake and are superseded by `claude/colour-bands-polish`. |
| Stage 3 stylesheet dropped | The colour-band layer (`refine.css`) already provides the type scale, spacing, humanist body text and 12 px label token. Only small fixes are added, in `fixes.css`. |

## 15 Nov 2026 — Stage 2 approval

| Decision | Detail |
|---|---|
| **Manifesto approved** | "One press run: two inks on one sheet of paper, so the teaching work is the only full colour on the page." All five rules stand. |
| **Body typeface: humanist sans** | Running text moves from monospace to the humanist sans (the Noto Sans already loaded for Korean). Mono stays for labels, chips, dates, navigation and buttons. |
| **Project order approved** | 01 Clearer Global Communication (lead) · 02 Reading for Meaning · 03 Music in English Classes · 04 Beyond Teacher Induction · 05 USA Camp · 06 How Does It Taste? · 07 Advice & Suggestions (archive). |
| **Ornaments: more than proposed** | Ornaments from the 58-asset bank may also appear on project entries. Limits that still hold: at most one per project entry; never over a work sample; never within 16 px of text; none on buttons, forms or body text. Hero stays unlimited; section headings get one each. |

## 15 Nov 2026 — Stage 0 intake

| Decision | Detail |
|---|---|
| Baseline | The current aubergine and lime site is the DNA to protect. |
| Primary action | "Email me", with the email still hidden until requested. |
| Analytics | None. |
| Portrait | None. |
| Featured work | Six projects featured; Advice & Suggestions as the archive entry. Classroom work sits last. |
| Ordering-food game | Removed (third-party assets). Done on branch `claude/stage1-fixes`. |
| Textbook 첫 출근 했습니다! | Slot held; nothing shown until Anna says so. It replaces the game and becomes the lead. |
| Rights | EPIK and GIGE work shown as is, with a "created for" credit; Anna confirms she has permission. |
| Licence | CC BY-NC 4.0 for Anna's materials. |
| Credentials row | Wording kept: Suwon · F-6 visa · US Citizen · English & 한국어. |
| Access | Site stays private. Search and link-preview setup is prepared but access is not changed. |
| Riso asset bank | Free to use. |

## Open items for Anna

- Korean titles for "Reading for Meaning" and "USA Camp" (both show in English in Korean mode): keep, or give Korean titles.
- The page is about 14 phone screens long; deciding how much to shorten is a Stage 4 layout question.

- Delete the game's PowerPoint and images from the site file bucket.
- Identify the site's "Zine Condensed" and "Zine Mono" fonts. Checked 15 Nov against the two fonts Anna supplied: **neither matches**. Syne Mono (OFL, free for web use) has rounded, quirky letterforms; Zin Display Condensed is a serif and is a CarnokyType **demo** ("All rights reserved"), which is usually not licensed for live sites. The site's fonts look like a plain sans mono and a bold condensed grotesque, likely from the open-licensed Noto family. To be confirmed in Stage 3; if unidentified, swap for a known open-licence pair that looks the same.
- Korean copy review by a native speaker before any public launch.
- Update "Mar 2026–Present" in the background section when the new role starts.

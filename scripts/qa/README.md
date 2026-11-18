# Browser QA scripts

Playwright checks used during the Nov 2026 "press run" overhaul. They need the
site served locally on port 8765:

    cd web && python3 -m http.server 8765    # leave running
    node scripts/qa/audit-sizes.cjs                 # text < 12 px, targets < 44 px, horizontal overflow (320–1440 px, EN/KO, home + project page)
    WS=375,1024,1440 PAGES=home,usa-camp-workbook node scripts/qa/audit-decoration-overlap.cjs
                                                    # pixel test: does any riso ornament/shadow cover text or work images? (silent = 0%)
    node scripts/qa/phone-links.cjs                 # phone emulation: Explore / Background / Back to top / return-to-card land correctly
    node scripts/qa/project-close-focus.cjs         # Escape closes projects and returns focus; page-bar Contact lands on the email button
    OUT=/tmp node scripts/qa/gallery-spread-zoom.cjs # desktop booklet spreads + phone tap-to-zoom

    node scripts/qa/visual-regression.cjs capture .qa/before   # then change CSS, capture .qa/after, then:
    node scripts/qa/visual-regression.cjs compare .qa/before .qa/after   # 39 screenshots, byte compare; IDENTICAL for a pure refactor

Expected output for the first two is just "audit done" / nothing (the only allowed
"over" entries are the big H2 headings whose slide-in starts off-screen, and a
0-px phone Close label that is intentionally icon-only).

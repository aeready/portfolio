# CLAUDE.md

Start here, in this order:

1. **`AGENTS.md`** — the project rules (bilingual EN/KO, two inks, originals untouched, validators, upload workflow). They override defaults.
2. **`docs/overhaul/WORKPLAN.md`** — what the Nov 2026 "press run" overhaul changed, the owner's decisions, where code lives, the publish checklist, how to continue, and gotchas.
3. **`CHANGELOG.md`** — every change, newest first, each with how to undo it.
4. Design rules: `docs/overhaul/MANIFESTO.md` (R1–R7), `DESIGN_DNA.md`, `PRESERVE.md`, `DECISIONS.md`, `STYLE_GUIDE.md`.

Working branch: `ccr-099385b1-ewrh8h`. Nothing on it is live until the owner uploads and publishes.

Quick commands:

```
cd web && python3 -m http.server 8765        # local site (keep running)
node scripts/validate.mjs && PORTFOLIO_TEST_DIRECT_ENTRY=1 node scripts/validate.mjs
node scripts/validate-locales.mjs && node scripts/validate-downloads.mjs
node scripts/build-worker.mjs && node scripts/validate-worker.mjs
node scripts/qa/audit-sizes.cjs              # see scripts/qa/README.md for the rest
```

Working with the owner: they review on an Android phone, often send screenshots of the live
site (which may lag behind this branch, so check before "fixing" something already fixed), and
want design changes previewed. Describe changes in plain language with before/after screenshots.

#!/usr/bin/env node
// Pixel regression for CSS work. Captures 39 deterministic screenshots (reduced motion = static),
// then compares two captures byte for byte. Needs Playwright (same as the other QA scripts), no other deps.
//
//   cd web && python3 -m http.server 8765        (separate terminal)
//   node scripts/qa/visual-regression.cjs capture .qa/before     (on the old code)
//   node scripts/qa/visual-regression.cjs capture .qa/after      (on the new code)
//   node scripts/qa/visual-regression.cjs compare .qa/before .qa/after
//
// Captures: home page, EN and KO, at 320/390/768/1024/1440; all 7 project dialogs EN and KO at 390 and 1440; the 404 page.
// A "DIFF" line means that screenshot changed: open both and decide if the change was intended.
// .qa/ is git-ignored.
const fs = require('fs');
const crypto = require('crypto');
const { chromium } = require('playwright');

const [mode, a, b] = process.argv.slice(2);
const BASE = process.env.BASE || 'http://localhost:8765/';
const WIDTHS = [320, 390, 768, 1024, 1440];
const PROJECTS = ['reading-for-meaning', 'epik-music', 'adult-communication', 'teacher-development', 'usa-camp-workbook', 'chuseok-thanksgiving-storybook', 'advice-suggestions-lesson'];

async function capture(out) {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  for (const lang of ['en', 'ko']) {
    for (const w of WIDTHS) {
      const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 800 : 900 }, reducedMotion: 'reduce', deviceScaleFactor: 1 });
      await ctx.addInitScript(l => { try { localStorage.setItem('portfolio-language', l); } catch (e) { /* storage blocked */ } }, lang);
      const page = await ctx.newPage();
      await page.goto(BASE, { waitUntil: 'load' });
      await page.waitForTimeout(1200);
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += 500) { await page.evaluate(v => scrollTo(0, v), y); await page.waitForTimeout(40); }
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${out}/home-${lang}-${w}.png`, fullPage: true, timeout: 60000 });
      if (w === 390 || w === 1440) {
        for (const id of PROJECTS) {
          await page.goto(`${BASE}#project/${id}`, { waitUntil: 'load' });
          await page.waitForTimeout(1200);
          await page.screenshot({ path: `${out}/dlg-${id}-${lang}-${w}.png` });
        }
      }
      await ctx.close();
    }
  }
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${BASE}404.html`);
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}/404.png`, fullPage: true });
  await browser.close();
  console.log(`captured ${fs.readdirSync(out).length} screenshots in ${out}`);
}

function compare(x, y) {
  const hash = f => crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex');
  let bad = 0;
  for (const f of fs.readdirSync(x)) {
    if (!fs.existsSync(`${y}/${f}`)) { console.log('MISSING', f); bad++; } else if (hash(`${x}/${f}`) !== hash(`${y}/${f}`)) { console.log('DIFF', f); bad++; }
  }
  console.log(bad ? `${bad} screenshot(s) differ` : `IDENTICAL (${fs.readdirSync(x).length} screenshots)`);
  process.exit(bad ? 1 : 0);
}

if (mode === 'capture' && a) capture(a); else if (mode === 'compare' && a && b) compare(a, b); else { console.error('usage: capture <dir> | compare <dirA> <dirB>'); process.exit(2); }

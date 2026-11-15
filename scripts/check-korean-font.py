#!/usr/bin/env python3
"""Fail if any Hangul syllable used on the site is missing from the Korean web-font subsets.
Usage: python3 scripts/check-korean-font.py"""
import glob, re, sys
from fontTools.ttLib import TTFont
web = 'web/'
used = set()
for f in glob.glob(web + '*.js') + glob.glob(web + '*.html') + glob.glob(web + '*.css'):
    used |= {ch for ch in open(f, encoding='utf-8').read() if 0xAC00 <= ord(ch) <= 0xD7AF}
css = open(web + 'style.css').read() + open(web + 'refine.css').read()
bad = 0
for font in sorted(set(re.findall(r"assets/fonts/(NotoSans-Korean-site[^']*\.woff2)", css))):
    cmap = TTFont(web + 'assets/fonts/' + font).getBestCmap()
    missing = ''.join(sorted(ch for ch in used if ord(ch) not in cmap))
    print(font, 'missing:', missing or 'none'); bad |= bool(missing)
sys.exit(1 if bad else 0)

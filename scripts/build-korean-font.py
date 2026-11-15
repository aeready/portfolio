#!/usr/bin/env python3
"""Rebuild the Korean web-font subsets so they contain every Hangul syllable the site uses.

Run after adding Korean text:  python3 scripts/build-korean-font.py
It fetches the full Noto Sans KR (SIL OFL) from the npm package @expo-google-fonts/noto-sans-kr
into a temp folder, subsets regular / bold / black, names them name--<sha256[:12]>.woff2,
updates style.css / refine.css / README.md and deletes the old subsets.
Then upload the new files and delete the old ones from the Site bucket."""
import glob, hashlib, os, re, subprocess, tarfile, tempfile
from fontTools.ttLib import TTFont
from fontTools import subset
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
tmp = tempfile.mkdtemp()
subprocess.run(['npm', 'pack', '@expo-google-fonts/noto-sans-kr', '--pack-destination', tmp], check=True, capture_output=True)
tarfile.open(glob.glob(tmp + '/*.tgz')[0]).extractall(tmp, filter='data')
src = tmp + '/package/'
used = set()
for f in glob.glob('web/*.js') + glob.glob('web/*.html') + glob.glob('web/*.css'):
    used |= {ord(ch) for ch in open(f, encoding='utf-8').read() if 0xAC00 <= ord(ch) <= 0xD7AF}
css_files = ['web/style.css', 'web/refine.css', 'README.md']
for base, full in [('NotoSans-Korean-site', '400Regular/NotoSansKR_400Regular.ttf'),
                   ('NotoSans-Korean-site-Bold', '700Bold/NotoSansKR_700Bold.ttf'),
                   ('NotoSans-Korean-site-Black', '900Black/NotoSansKR_900Black.ttf')]:
    old = [p for p in glob.glob(f'web/assets/fonts/{base}--*.woff2')]
    keep = set()
    for p in old: keep |= {c for c in TTFont(p).getBestCmap() if 0xAC00 <= c <= 0xD7AF}
    opt = subset.Options(); opt.flavor = 'woff2'; opt.layout_features = ['*']; opt.name_IDs = ['*']
    font = TTFont(src + full); s = subset.Subsetter(opt); s.populate(unicodes=sorted(keep | used)); s.subset(font)
    out = tmp + '/out.woff2'; font.flavor = 'woff2'; font.save(out)
    name = f'{base}--{hashlib.sha256(open(out, "rb").read()).hexdigest()[:12]}.woff2'
    if any(os.path.basename(p) == name for p in old): print(base, 'unchanged'); continue
    os.replace(out, 'web/assets/fonts/' + name)
    for p in old:
        for c in css_files:
            t = open(c, encoding='utf-8').read()
            if os.path.basename(p) in t: open(c, 'w', encoding='utf-8').write(t.replace(os.path.basename(p), name))
        os.remove(p)
    print(base, '->', name, len(keep | used), 'syllables')

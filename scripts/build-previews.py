#!/usr/bin/env python3
"""Make smaller WebP copies of the work images for thumbnails and phones.

  python3 scripts/build-previews.py

- Adds a 160 px copy to every entry in web/preview-assets.js (gallery strip thumbnails are 72 px).
- Creates 160 / 480 / 960 px copies for any image used in web/projects.js that has none yet.
Copies go to web/assets/previews/<name>-<width>--<sha256[:12]>.webp. Source files are never changed;
colour profiles are kept. Re-running is safe: existing sizes are skipped."""
import hashlib, io, json, os, re, subprocess
from PIL import Image
os.chdir(os.path.join(os.path.dirname(__file__), '..', 'web'))
raw = open('preview-assets.js', encoding='utf-8').read()
prefix = 'window.PORTFOLIO_PREVIEWS = '
data = json.loads(raw[len(prefix):].rstrip().rstrip(';'))
used = json.loads(subprocess.run(['node', '-e', """global.window={};require('./projects.js');const s=new Set();
JSON.stringify(window.PORTFOLIO_PROJECTS,(k,x)=>{if(typeof x==='string'&&/^assets\\/.*\\.(jpe?g|png|webp)$/.test(x))s.add(x);return x});
console.log(JSON.stringify([...s]))"""], capture_output=True, text=True, check=True).stdout)

def base(src): return re.sub(r'(-optimized)?--[0-9a-f]{12}$', '', os.path.splitext(os.path.basename(src))[0])
def make(src, width):
    im = Image.open(src); icc = im.info.get('icc_profile')
    im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') and 'transparency' in im.info or im.mode == 'RGBA' else 'RGB')
    h = round(im.height * width / im.width)
    im = im.resize((width, h), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=82, method=6, **({'icc_profile': icc} if icc else {}))
    b = buf.getvalue(); name = f'assets/previews/{base(src)}-{width}--{hashlib.sha256(b).hexdigest()[:12]}.webp'
    if not os.path.exists(name): open(name, 'wb').write(b)
    return {'path': name, 'width': width, 'height': h, 'bytes': len(b)}

added = 0
for src in used:
    if src not in data:
        im = Image.open(src)
        data[src] = {'original': src, 'width': im.width, 'height': im.height, 'bytes': os.path.getsize(src), 'outputs': [], 'new': True}
for src, entry in data.items():
    have = {o['width'] for o in entry['outputs']}
    for w in (160, 480, 960):
        if w in have or w >= entry['width']: continue
        if w != 160 and not entry.get('new') and 480 in have: continue  # existing entries only gain the thumbnail size
        entry['outputs'].append(make(src, w)); added += 1
    entry['outputs'].sort(key=lambda o: o['width'])
    entry.pop('new', None)
open('preview-assets.js', 'w', encoding='utf-8').write(prefix + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('new preview files:', added)

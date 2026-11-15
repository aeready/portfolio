const { chromium } = require('playwright');
const { PNG } = (()=>{ try { return require('pngjs'); } catch { return {}; } })();
(async () => {
  const b = await chromium.launch();
  const HIDE = `.flourish, .press-plate-cursor { visibility:hidden !important }
    .project-card::after, .project-card .artifact-arrangement::after, .project-card .artifact-arrangement::before, #home::after, #background::after, #trainer::after, #contact::after, .contact-actions::before, .section-ribbon::after, .section-ribbon::before, #project-dialog .gallery::before, #project-dialog .detail-head::after, #project-dialog .gallery-stage::before { content: none !important; background: none !important }`;
  const out=[];
  for (const W of (process.env.WS||'375,768,1440').split(',').map(Number)) for (const lang of ['en','ko']) for (const pg of (process.env.PAGES||'home,usa-camp-workbook,epik-music,advice-suggestions-lesson').split(',')) {
    const p = await b.newPage({ viewport:{width:W,height:W<800?812:900}, reducedMotion:'reduce' });
    await p.addInitScript(()=>sessionStorage.setItem('press-intro-seen','1'));
    await p.goto('http://localhost:8765/'+(pg==='home'?'':'#project/'+pg));
    if (lang==='ko') await p.click(pg==='home'?'#language-toggle':'#dialog-language-toggle');
    await p.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}'});
    await p.waitForTimeout(600);
    if (pg==='home') { await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=400){scrollTo(0,y);await new Promise(r=>setTimeout(r,30));}scrollTo(0,0)}); }
    await p.waitForTimeout(800);
    const shots = pg==='home' ? [null] : [0, 700, 1400, 2100];
    for (const st of shots) {
      if (st!==null) { await p.evaluate(y=>{document.querySelector('#project-dialog').scrollTop=y}, st); await p.waitForTimeout(250); }
      const full = pg==='home';
      const a = await p.screenshot({fullPage: full});
      const tag = await p.addStyleTag({content:HIDE}); await p.waitForTimeout(150);
      const bb = await p.screenshot({fullPage: full});
      await tag.evaluate(t=>t.remove());
      const rects = await p.evaluate(({full,pg})=>{
        const root = pg==='home'?document.body:document.querySelector('#project-dialog');
        const res=[]; const sy = full?scrollY:0;
        for (const e of root.querySelectorAll('*')) {
          if (e.closest('[aria-hidden="true"],.sr-only,#result-count,.press-intro-sheet,.flourish') || (pg==='home' && e.closest('dialog'))) continue;
          const s=getComputedStyle(e); if (s.visibility==='hidden'||s.display==='none') continue;
          const isImg = e.tagName==='IMG' && !e.closest('.skill-logo,.university-lockup,.identity');
          let r=null, kind=null;
          if (isImg) { r=e.getBoundingClientRect(); kind='IMG'; }
          else { const tn=[...e.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim()); if (tn.length){ const rg=document.createRange(); rg.selectNodeContents(e); r=rg.getBoundingClientRect(); kind='TXT'; } }
          if (!r||r.width<4||r.height<4) continue;
          if (!full && (r.bottom<0||r.top>innerHeight)) continue;
          res.push({kind, label:(e.tagName+'.'+String(e.className).split(' ')[0]).slice(0,40)+' "'+(e.alt||e.textContent).trim().replace(/\s+/g,' ').slice(0,28)+'"', x:r.left, y:r.top+sy, w:r.width, h:r.height});
        }
        return res;
      },{full,pg});
      // diff via node: decode PNGs with sharp-free approach using playwright? use canvas in a page
      const diffs = await (async()=>{
        const q = await b.newPage();
        const r = await q.evaluate(async ({a,bb,rects})=>{
          const load = src => new Promise(res=>{const i=new Image(); i.onload=()=>res(i); i.src='data:image/png;base64,'+src;});
          const [ia, ib] = await Promise.all([load(a), load(bb)]);
          const c=document.createElement('canvas'); c.width=ia.width; c.height=ia.height; const x=c.getContext('2d');
          x.drawImage(ia,0,0); const da=x.getImageData(0,0,c.width,c.height).data;
          x.clearRect(0,0,c.width,c.height); x.drawImage(ib,0,0); const db=x.getImageData(0,0,c.width,c.height).data;
          const out=[];
          for (const R of rects) {
            const x0=Math.max(0,Math.floor(R.x)), y0=Math.max(0,Math.floor(R.y)), x1=Math.min(c.width,Math.ceil(R.x+R.w)), y1=Math.min(c.height,Math.ceil(R.y+R.h));
            let n=0, d=0;
            for (let y=y0;y<y1;y+=2) for (let xx=x0;xx<x1;xx+=2) { const i=(y*c.width+xx)*4; n++; if (Math.abs(da[i]-db[i])+Math.abs(da[i+1]-db[i+1])+Math.abs(da[i+2]-db[i+2])>60) d++; }
            if (n && d/n>(R.kind==='IMG'?0.003:0.01)) out.push(R.kind+' '+(100*d/n).toFixed(1)+'% '+R.label);
          }
          return out;
        }, {a:a.toString('base64'), bb:bb.toString('base64'), rects});
        await q.close(); return r;
      })();
      if (diffs.length) out.push(`${W} ${lang} ${pg}${st!==null?'@'+st:''}: `+[...new Set(diffs)].join(' | '));
    }
    await p.close();
  }
  console.log(out.join('\n')); await b.close();
})();

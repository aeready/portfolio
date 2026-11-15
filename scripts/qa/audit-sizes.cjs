const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const W of [320,375,430,768,1024,1280,1440]) for (const lang of ['en','ko']) for (const page of ['home','project']) {
    const p = await b.newPage({ viewport:{width:W,height:W<800?812:900} });
    await p.addInitScript(()=>sessionStorage.setItem('press-intro-seen','1'));
    await p.goto('http://localhost:8765/'+(page==='project'?'#project/usa-camp-workbook':''));
    if (lang==='ko') await p.click(page==='project'?'#dialog-language-toggle':'#language-toggle');
    await p.waitForTimeout(900);
    await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=500){scrollTo(0,y);await new Promise(r=>setTimeout(r,20));}scrollTo(0,0)});
    await p.waitForTimeout(300);
    const r = await p.evaluate(({page})=>{
      const root = page==='project' ? document.querySelector('#project-dialog') : document.querySelector('body');
      const vis = e => { const s=getComputedStyle(e); const r=e.getBoundingClientRect(); return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&!e.closest('[aria-hidden="true"],.sr-only,#result-count,.press-intro-sheet,[hidden]') && (page==='project' || !e.closest('dialog')); };
      const small=[], tiny=[], over=[];
      for (const e of root.querySelectorAll('*')) {
        if (!vis(e)) continue;
        const own=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());
        const fs=parseFloat(getComputedStyle(e).fontSize);
        if (own && fs<11.9) small.push(e.tagName+'.'+String(e.className).slice(0,30)+' '+fs+' "'+e.textContent.trim().slice(0,20)+'"');
        if (e.matches('a,button') && !e.closest('p,li,dd,.footer-licence')) { const r=e.getBoundingClientRect(); if (r.height<43.5 || r.width<43.5) tiny.push(e.tagName+'#'+e.id+'.'+String(e.className).slice(0,25)+' '+Math.round(r.width)+'x'+Math.round(r.height)+' "'+e.textContent.trim().slice(0,18)+'"'); }
        if (own) { const r=e.getBoundingClientRect(); if (r.right>innerWidth+1 || r.left< -1) over.push(e.tagName+'.'+String(e.className).slice(0,30)+' '+Math.round(r.left)+'..'+Math.round(r.right)+' "'+e.textContent.trim().slice(0,20)+'"'); }
      }
      return {small:[...new Set(small)].slice(0,6), tiny:[...new Set(tiny)].slice(0,8), over:[...new Set(over)].slice(0,6)};
    },{page});
    if (r.small.length||r.tiny.length||r.over.length) console.log(W,lang,page,JSON.stringify(r));
    await p.close();
  }
  await b.close(); console.log('audit done');
})();

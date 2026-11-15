const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport:{width:375,height:812} });
  const errs=[]; p.on('pageerror', e=>errs.push(e.message));
  await p.addInitScript(()=>sessionStorage.setItem('press-intro-seen','1'));
  await p.goto('http://localhost:8765/'); await p.waitForTimeout(500);
  const res=[];
  for (const id of ['reading-for-meaning','epik-music','usa-camp-workbook','adult-communication']) {
    await p.evaluate(id=>document.getElementById('explore-'+id).scrollIntoView(), id); await p.waitForTimeout(300);
    await p.click('#explore-'+id+' .project-title'); await p.waitForTimeout(+(process.env.D||900));
    await p.keyboard.press('Escape'); await p.waitForTimeout(1300);
    res.push(await p.evaluate(()=>[document.querySelector('#project-dialog').open, document.activeElement?.id, location.hash]));
  }
  // contact jump check
  await p.click('#explore-epik-music .project-title'); await p.waitForTimeout(900);
  await p.click('.dialog-contact'); await p.waitForTimeout(1600);
  res.push(await p.evaluate(()=>{const r=document.querySelector('#contact-email').getBoundingClientRect();return ['email', Math.round(r.top), Math.round(r.bottom), innerHeight]}));
  console.log(JSON.stringify(res), errs);
  await b.close();
})();

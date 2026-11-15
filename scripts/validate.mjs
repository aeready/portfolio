import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'../web');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sectionOrder=[...html.matchAll(/<section\b[^>]*\bid="(home|work|background|trainer|contact)"/g)].map(m=>m[1]);
assert.deepEqual(sectionOrder,['home','work','background','trainer','contact'],'Background must precede How I work');
const navigation=html.match(/<nav\b[^>]*id="navigation"[^>]*>([\s\S]*?)<\/nav>/)?.[1]||'';
assert(navigation.indexOf('href="#background"')<navigation.indexOf('href="#trainer"'),'Navigation follows section order');
const data=fs.readFileSync(path.join(root,'projects.js'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const all=new Map();let active=[];let clipboard='';
class Element {
 constructor(attrs={}) {this.attrs={...attrs};this.dataset={};this.events={};this.hidden='hidden' in attrs;this.open=false;this.disabled=false;this.value='all';this.isConnected=true;this.textContent='';this._html='';this.children=[];this.classes=new Set((attrs.class||'').split(' '));this.classList={add:x=>this.classes.add(x),remove:x=>this.classes.delete(x),toggle:(x,v)=>{if(v===undefined)v=!this.classes.has(x);v?this.classes.add(x):this.classes.delete(x);return v;},contains:x=>this.classes.has(x)};for(const[k,v]of Object.entries(attrs))if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,x)=>x.toUpperCase())]=v;}
 set innerHTML(value){for(const old of this.children){old.isConnected=false;if(old.attrs.id)all.delete(old.attrs.id);const i=active.indexOf(old);if(i>=0)active.splice(i,1);}this._html=value;this.children=parse(value);}
 get innerHTML(){return this._html;}
 addEventListener(event,fn){(this.events[event]??=[]).push(fn);}
 async emit(event,props={}){for(const f of this.events[event]||[])await f({target:this,preventDefault(){},...props});}
 setAttribute(k,v){this.attrs[k]=String(v);}
 getAttribute(k){return this.attrs[k]??null;}
 closest(selector){let node=this;while(node){let match=false;if(selector.startsWith('#'))match=node.attrs.id===selector.slice(1);else if(selector.startsWith('.'))match=node.classes.has(selector.slice(1));else{const m=selector.match(/^(?:([a-z]+))?\[([^\]]+)\]$/);if(m)match=(!m[1]||node.attrs.tag===m[1])&&(m[2] in node.attrs);}if(match)return node;node=node.parent;}return null;}
 focus(){document.activeElement=this;}
 showModal(){this.open=true;}
 close(){this.open=false;for(const f of this.events.close||[])f({target:this});}
 getBoundingClientRect(){return {left:0,right:1000,top:0,bottom:1000};}
}
function parse(text){const nodes=[],stack=[];const voids=new Set(['img','meta','link','input','br','hr','source']);for(const m of text.matchAll(/<(\/?)([a-zA-Z][\w-]*)\b([^>]*?)>/g)){const tag=m[2];if(m[1]){while(stack.length){const node=stack.pop();if(node.attrs.tag===tag)break;}continue;}const attrs={tag};for(const a of m[3].matchAll(/([\w-]+)(?:="([^"]*)"|'([^']*)')?/g))attrs[a[1]]=a[2]??a[3]??'';const e=new Element(attrs);e.parent=stack.at(-1);nodes.push(e);active.push(e);if(attrs.id)all.set(attrs.id,e);if(!voids.has(tag)&&!m[3].trim().endsWith('/'))stack.push(e);}return nodes;}
parse(html);
const byId=id=>{const e=all.get(id);assert(e,`Missing DOM target: ${id}`);return e;};
const filters=()=>active.filter(e=>'filter'in e.dataset);
const thumbs=()=>byId('gallery-thumbnails')?.children?.filter(e=>'slide'in e.dataset)||[];
const navLinks=active.filter(e=>e.attrs.tag==='a'&&['#trainer','#work','#background','#contact'].includes(e.attrs.href)&&!e.attrs['data-filter-link']);
const document={querySelector:s=>{if(s==='meta[name="description"]')return active.find(e=>e.attrs.tag==='meta'&&e.attrs.name==='description');assert(s.startsWith('#'));return all.get(s.slice(1))||null;},querySelectorAll:s=>{
 if(s==='#category-filters button')return filters();if(s==='.gallery-thumbnails button')return thumbs();if(s==='.gallery-tabs button')return active.filter(e=>'gallery'in e.dataset);if(s==='[data-filter-link]')return active.filter(e=>'filterLink'in e.dataset);if(s.startsWith('[data-i18n'))return active.filter(e=>s.slice(1,-1) in e.attrs);if(s==='#navigation a')return navLinks;throw Error('Unsupported selector '+s);
},events:{},addEventListener(k,f){(this.events[k]??=[]).push(f);},async emit(k,event){for(const f of this.events[k]||[])await f({preventDefault(){},...event});},activeElement:null,body:new Element()};
const initialHash=process.env.PORTFOLIO_TEST_DIRECT_ENTRY?'#project/adult-communication':'';const location={hash:initialHash};const window={events:{},addEventListener(k,f){this.events[k]=f;},scrollTo(){},setTimeout(fn,ms){this.lastTimer={fn,ms};return 1;},clearTimeout(){}};const entries=[{hash:initialHash,state:null}];let historyIndex=0;const history={state:null,replaceState(state,_b,value){entries[historyIndex]={hash:value,state};this.state=state;location.hash=value;},pushState(state,_b,value){entries.splice(historyIndex+1);entries.push({hash:value,state});historyIndex++;this.state=state;location.hash=value;},back(){if(historyIndex===0)return;historyIndex--;const e=entries[historyIndex];location.hash=e.hash;this.state=e.state;window.events.popstate?.();window.events.hashchange?.();},forward(){if(historyIndex===entries.length-1)return;historyIndex++;const e=entries[historyIndex];location.hash=e.hash;this.state=e.state;window.events.popstate?.();window.events.hashchange?.();}};
const storage=new Map();const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
document.documentElement=new Element({lang:'en'});
const context={localStorage,window,document,location,history,navigator:{clipboard:{async writeText(v){clipboard=v;}}},console};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'preview-assets.js'),'utf8'),context);vm.runInContext(data,context);vm.runInContext(fs.readFileSync(path.join(root,'locales.js'),'utf8'),context);vm.runInContext(fs.readFileSync(path.join(root,'originals.js'),'utf8'),context);window.PortfolioDownloads={getState:()=>undefined,download:()=>{}};vm.runInContext(app,context);
if(initialHash){assert(byId('project-dialog').open);assert.equal(history.state.portfolioProject,'adult-communication');assert.equal(byId('gallery-image').src,window.PORTFOLIO_PROJECTS.find(p=>p.id==='adult-communication').slides[0][0]);await byId('back-projects').emit('click');assert.equal(location.hash,'#work');assert(!byId('project-dialog').open);}
const projects=window.PORTFOLIO_PROJECTS;
const grid=byId('project-grid');
const cards=()=>[...grid.innerHTML.matchAll(/class="project-card\b/g)].length;
assert.equal(projects.length,8);assert.equal(cards(),8);assert.equal(JSON.stringify(projects.map(p=>p.id)),JSON.stringify(['adult-communication','epik-music','reading-for-meaning','teacher-development','chuseok-thanksgiving-storybook','advice-suggestions-lesson','usa-camp-workbook','ordering-food-game']));const reading=projects.find(p=>p.id==='reading-for-meaning');assert.equal(reading.slides.length,32);assert.equal(reading.bookSlides.length,6);assert.equal(projects[0].id,'adult-communication');assert.equal(projects.at(-1).id,'ordering-food-game');assert(!projects.some(p=>p.id==='weather-speaking-game'||p.id==='usa-turkiye-exchange'));assert(projects.some(p=>p.id==='epik-music'));assert(projects.some(p=>p.id==='advice-suggestions-lesson'));assert.equal(projects.find(p=>p.id==='ordering-food-game').slides.length,7);
function assertCardActions(){const previewCount=grid.children.filter(e=>e.classes.has('preview-open')).length;assert.equal(grid.children.filter(e=>e.attrs.tag==='img').length,previewCount,'Each preview has an image');assert.equal(previewCount,cards()*3,'Every card shows three preview images');assert(!grid.innerHTML.includes('artifact-caption'),'Descriptor slips are removed');const links=grid.children.filter(e=>e.classes.has('project-card'));assert.equal(links.length,cards(),'One focus target per card');assert.equal(grid.children.filter(e=>e.attrs.tag==='button').length,0,'No nested card buttons');for(const link of links){assert.equal(link.attrs.tag,'a');assert(link.attrs['aria-label']?.length>10,'Card names its project');assert(link.attrs.href.startsWith('#project/'),'Card has a hash fallback');}}
assertCardActions();assert.equal(document.documentElement.getAttribute('lang'),'en');
await grid.emit('click',{target:byId('explore-reading-for-meaning')});
assert.equal(thumbs().length,32);
assert.equal(byId('slide-count').textContent.startsWith('1 / 32'),true);
await byId('project-dialog').emit('click',{target:active.find(e=>e.dataset.gallery==='bookSlides')});
assert.equal(thumbs().length,6);
assert.equal(byId('gallery-image').src,reading.bookSlides[0][0]);
for(let i=1;i<6;i++)await byId('project-dialog').emit('click',{target:byId('next-slide')});
assert.equal(byId('gallery-image').src,reading.bookSlides[5][0]);assert(byId('next-slide').disabled);
await byId('dialog-language-toggle').emit('click');
assert.equal(byId('gallery-image').alt,reading.ko.bookSlides[5][0]);
assert.equal(thumbs().length,6);
await byId('dialog-language-toggle').emit('click');
await byId('project-dialog').emit('click',{target:active.find(e=>e.dataset.gallery==='slides')});
assert.equal(thumbs().length,32);assert.equal(byId('gallery-image').src,reading.slides[0][0]);
await byId('close-dialog').emit('click');
const assetPaths=new Set(['preview-assets.js','assets/identity-cutouts--302c2deed319.svg','locales.js','originals.js','downloads.js','assets/contact-cutouts-ko--ca73061fcfe0.svg','assets/learning-collage-ko.svg']);for(const p of projects){assert(p.contribution.length>50);assert(p.slides.length>=2);for(const s of p.slides)assetPaths.add(s[0]);for(const s of p.bookSlides||[])assetPaths.add(s[0]);for(const d of p.documents)assetPaths.add(d[0]);assetPaths.add(p.cover);if(p.previewSecondary)assetPaths.add(p.previewSecondary);if(p.previewTertiary){assetPaths.add(p.previewTertiary);assert(p.previewTertiary!==p.cover&&p.previewTertiary!==p.previewSecondary);}}
for(const match of html.matchAll(/\s(?:src|href)="([^"]+)"/g)){const url=match[1];if(!url.startsWith('#')&&!url.startsWith('mailto:'))assetPaths.add(url);if(url.startsWith('#'))assert(all.has(url.slice(1)),`Broken anchor ${url}`);}
for(const entry of Object.values(window.PORTFOLIO_PREVIEWS))for(const output of entry.outputs){assetPaths.add(output.path);assert.equal(fs.statSync(path.join(root,output.path)).size,output.bytes);}
for(const match of fs.readFileSync(path.join(root,'style.css'),'utf8').matchAll(/url\(["']?([^"')]+)["']?\)/g)){if(!match[1].startsWith('data:'))assetPaths.add(match[1]);}
const r2HostedAssets=new Set(['assets/downloads/editing-skills.pdf','assets/downloads/usa-camp-book.pdf','assets/downloads/how-does-it-taste-complete.pdf','assets/downloads/ordering-game-2025.pptx','assets/downloads/dogica-font-pack.zip','assets/downloads/teacher-development-final.pdf']);
for(const asset of assetPaths){if(asset.startsWith('https://')||asset==='assets/teacher-development-full.pdf'||r2HostedAssets.has(asset))continue;const [file,fragment]=asset.split('#');assert(fs.existsSync(path.join(root,file)),`Missing asset ${file}`);assert(fs.statSync(path.join(root,file)).size>0,`Empty asset ${file}`);if(fragment)assert(fs.readFileSync(path.join(root,file),'utf8').includes(`id="${fragment}"`),`Missing SVG symbol ${fragment}`);}
for(const lang of ['en','ko']){
 if(document.documentElement.getAttribute('lang')!==lang)await byId('language-toggle').emit('click');
for(const category of ['all','training','curriculum','students','research']){
  const b=filters().find(x=>x.dataset.filter===category);await byId('category-filters').emit('click',{target:b});
  const expected=projects.filter(p=>category==='all'||p.categories.includes(category)).length;
  assert.equal(cards(),expected);assertCardActions();assert.equal(byId('empty-state').hidden,expected>0);assert.equal(byId('result-count').textContent,lang==='ko'?`프로젝트 ${expected}개`:`${expected} ${expected===1?'project':'projects'}`);
}
}
if(document.documentElement.getAttribute('lang')!=='en')await byId('language-toggle').emit('click');
await byId('empty-reset').emit('click');assert.equal(cards(),projects.length);history.replaceState(null,'','#work');
assert.equal(projects.filter(p=>p.categories.includes('students')).length,4);
assert.equal(projects.filter(p=>p.audiences.includes('young')).length,4);
for(const p of projects){
 const target=byId('explore-'+p.id);document.activeElement=target;await grid.emit('click',{target});assert(byId('project-dialog').open);assert(location.hash.endsWith(p.id));assert(byId('project-detail').innerHTML.includes(p.title.replaceAll('&','&amp;')));
 assert.equal(byId('gallery-image').src,p.slides[0][0]);assert(byId('previous-slide').disabled);
 const detail=byId('project-detail').innerHTML,unavailable=window.PORTFOLIO_ORIGINALS[p.original].available===false;
 assert(detail.includes('class="file-scope"'),'Every project explains its file availability');
 assert(detail.indexOf('id="open-image"')<detail.indexOf('id="download-original"'),'Samples come before the full original');
 assert.equal(byId('download-original').hidden,unavailable);
 assert.equal(byId('download-original').disabled,unavailable);
 if(unavailable)assert.equal(byId('download-status').textContent,'');
 assert(detail.includes(p.intro.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll("'",'&#39;')),'Teaching brief is visible');

 if(p.documents.length){const materials=byId('project-detail').innerHTML;assert(materials.includes('class="document-card primary"'),'First PDF is the primary material card');assert(materials.includes(`href="${p.documents[0][0]}" download`),'First PDF retains a direct download action');}

 for(let i=1;i<p.slides.length;i++){await byId('project-dialog').emit('click',{target:byId('next-slide')});assert.equal(byId('gallery-image').src,p.slides[i][0]);}
 assert(byId('next-slide').disabled);
 await byId('project-dialog').emit('keydown',{key:'ArrowLeft',target:byId('gallery-image')});assert.equal(byId('gallery-image').src,p.slides[p.slides.length-2][0]);
 await byId('project-dialog').emit('click',{target:thumbs()[0]});assert.equal(byId('gallery-image').src,p.slides[0][0]);
 await byId('close-dialog').emit('click');assert(!byId('project-dialog').open);assert(!document.body.classList.contains('modal-open'));assert.equal(location.hash,'#work');assert.equal(document.activeElement,byId('explore-'+p.id),'Closing returns to the single card action');
}
await byId('language-toggle').emit('click');assert.equal(document.documentElement.getAttribute('lang'),'ko');assert.equal(storage.get('portfolio-language'),'ko');
assert.equal(byId('result-count').textContent,'프로젝트 8개');
for(const p of projects){
 await grid.emit('click',{target:new Element({'data-project':p.id})});assert(byId('project-detail').innerHTML.includes(p.ko.title));assert.equal(byId('gallery-image').alt,p.ko.slides[0][0]);
 for(let i=1;i<p.slides.length;i++){await byId('project-dialog').emit('click',{target:byId('next-slide')});assert.equal(byId('gallery-image').alt,p.ko.slides[i][0]);}
 assert(byId('next-slide').disabled);await byId('close-dialog').emit('click');
}
await grid.emit('click',{target:new Element({'data-project':projects[0].id})});await byId('project-dialog').emit('click',{target:byId('next-slide')});const sample=byId('gallery-image').src;
await byId('dialog-language-toggle').emit('click');assert.equal(document.documentElement.getAttribute('lang'),'en');assert.equal(byId('gallery-image').src,sample);assert.equal(byId('gallery-image').alt,projects[0].slides[1][1]);await byId('close-dialog').emit('click');
history.pushState(null,'','#project/adult-communication');window.events.hashchange();assert(byId('project-dialog').open);assert(byId('project-detail').innerHTML.includes('Clearer global communication'));
await byId('project-dialog').emit('click',{target:new Element({'data-neighbor':'next'})});assert(location.hash.endsWith('epik-music'));
await byId('close-dialog').emit('click');

await byId('menu-toggle').emit('click');assert.equal(byId('menu-toggle').getAttribute('aria-expanded'),'true');assert(byId('navigation').classList.contains('open'));assert.equal(document.activeElement,navLinks[0]);
await navLinks[0].emit('click');assert.equal(byId('menu-toggle').getAttribute('aria-expanded'),'false');
await byId('menu-toggle').emit('click');await document.emit('keydown',{key:'Escape'});assert.equal(byId('menu-toggle').getAttribute('aria-expanded'),'false');assert.equal(document.activeElement,byId('menu-toggle'));
await byId('menu-toggle').emit('click');await document.emit('pointerdown',{target:new Element()});assert.equal(byId('menu-toggle').getAttribute('aria-expanded'),'false');
// Every visible preview opens its own exact gallery sample in both languages.
for(const lang of ['en','ko']){
 if(document.documentElement.getAttribute('lang')!==lang)await byId('language-toggle').emit('click');
 for(const p of projects){for(let i=0;i<p.previewIndices.length;i++){
  const preview=byId('preview-'+p.id+'-'+i);await grid.emit('click',{target:preview});
  assert.equal(byId('gallery-image').src,p.slides[p.previewIndices[i]][0]);
  const detail=byId('project-detail').innerHTML;assert(detail.indexOf('class="gallery"')<detail.indexOf('class="detail-role"'),'Gallery comes before role details in mobile reading order');if(detail.includes('class="project-materials"')){assert(detail.indexOf('class="gallery"')<detail.indexOf('class="project-materials"'),'Project files follow the gallery');assert(detail.indexOf('class="project-materials"')<detail.indexOf('class="detail-role"'),'Project files stay with the gallery before role details');}
  await byId('back-projects').emit('click');assert(!byId('project-dialog').open);assert.equal(document.activeElement,byId('explore-'+p.id));
 }}
}
if(document.documentElement.getAttribute('lang')!=='en')await byId('language-toggle').emit('click');
history.replaceState(null,'','#work');await grid.emit('click',{target:byId('explore-adult-communication')});assert(history.state.portfolioProject);history.back();assert(!byId('project-dialog').open);assert.equal(location.hash,'#work');history.forward();assert(byId('project-dialog').open);await byId('close-dialog').emit('click');
assert(byId('email-details').hidden);
assert.equal(byId('contact-email').getAttribute('aria-expanded'),'false');
assert(!html.includes('annaready@live.com'));
assert(!app.includes('annaready@live.com'));
assert(!html.includes('mailto:'));
assert(html.includes('© Anna Ready'));
assert(!html.includes('experience-note'));
assert(html.includes('강릉영어회화모임'));
await byId('contact-email').emit('click');
assert(!byId('email-details').hidden);
assert.equal(byId('contact-email').getAttribute('aria-expanded'),'true');
assert.equal(byId('email-address').textContent,'annaready@live.com');
assert.equal(byId('email-link').href,'mailto:annaready@live.com');
assert.equal(clipboard,'annaready@live.com');assert.equal(byId('copy-status').textContent,'Copied!');
assert.equal(window.lastTimer.ms,2000);window.lastTimer.fn();assert.equal(byId('copy-status').textContent,'');
context.navigator.clipboard.writeText=async()=>{throw Error('clipboard unavailable');};await byId('contact-email').emit('click');assert(byId('copy-status').textContent.includes('annaready@live.com'));
await byId('language-toggle').emit('click');assert(byId('contact-email').innerHTML.includes('이메일 표시 및 복사'));
context.navigator.clipboard.writeText=async v=>{clipboard=v;};await byId('contact-email').emit('click');assert.equal(byId('copy-status').textContent,'복사 완료!');
await byId('language-toggle').emit('click');
console.log(JSON.stringify({status:'passed',checks:['category filtering across English and Korean','8 project dialogs in both languages','language persistence and in-dialog switching','Korean captions, controls and contact states','all gallery samples and boundaries','deep links and next-project navigation','mobile menu focus, Escape, and outside dismissal','exact preview selection in both languages','native Back/Forward and explicit project Back controls','role and decisions before downloads','email reveal/hide, mail link, clipboard success and fallback','all internal anchors and referenced assets','two or three preview images per project, with no descriptor slips','distinct named sample actions and focus restoration','PDF-first materials and quiet unavailable originals'],projects:projects.length,assets:assetPaths.size,browserVisualQA:'not available'}));

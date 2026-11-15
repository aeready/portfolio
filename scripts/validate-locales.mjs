import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
const root=path.resolve('web');const c={window:{}};vm.createContext(c);for(const n of ['projects.js','locales.js','originals.js'])vm.runInContext(fs.readFileSync(path.join(root,n),'utf8'),c);
const {PORTFOLIO_LOCALES:l,PORTFOLIO_PROJECTS:projects,PORTFOLIO_ORIGINALS:files}=c.window;
const html=fs.readFileSync('web/index.html','utf8');
for(const [,attribute,key] of html.matchAll(/(data-i18n(?:-aria-label|-alt|-src)?)="([^"]+)"/g))for(const lang of ['en','ko'])assert(typeof l[lang].page[key]==='string',`${lang} missing ${attribute}=${key}`);
for(const [,category] of html.matchAll(/<button data-filter="([^"]+)"/g))if(category!=='all')assert(projects.some(project=>project.categories.includes(category)),`Empty filter ${category}`);
for(const scope of ['page','ui']){assert.deepEqual(Object.keys(l.en[scope]).sort(),Object.keys(l.ko[scope]).sort());for(const lang of ['en','ko'])for(const [key,value]of Object.entries(l[lang][scope]))assert(typeof value==='string'&&value.trim(),`${lang}.${scope}.${key}`);}
const fields=['title','displayTitle','displayLabel','label','audienceLabel','format','context','summary','intro','role','contribution','source','coverAlt','previewCaption'];
for(const p of projects){for(const key of fields)assert(typeof p[key]==='string'&&typeof p.ko[key]==='string'&&p.ko[key],p.id+'.'+key);assert(typeof p.evidence==='string'&&typeof p.ko.evidence==='string');assert.equal(Boolean(p.evidence),Boolean(p.ko.evidence));assert.equal(Boolean(p.note),Boolean(p.ko.note));assert.equal(p.slides.length,p.ko.slides.length);if(p.bookSlides){assert.equal(p.bookSlides.length,p.ko.bookSlides.length);for(const s of p.ko.bookSlides)assert.equal(s.length,2);}assert.equal(p.documents.length,p.ko.documents.length);assert.equal(p.decisions.length,p.ko.decisions.length);for(const s of p.ko.slides)assert.equal(s.length,2);for(const d of p.ko.documents)assert.equal(d.length,2);assert(files[p.original]);assert(p.previewIndices.length===2||p.previewIndices.length===3);if(p.previewTertiary){assert(typeof p.previewTertiaryAlt==='string'&&typeof p.ko.previewTertiaryAlt==='string');}for(const [i,src]of [p.cover,p.previewSecondary,p.previewTertiary].filter(Boolean).entries()){assert(typeof src==='string'&&src.length>0,p.id+' preview source '+i);assert(Number.isInteger(p.previewIndices[i])&&p.previewIndices[i]>=0&&p.previewIndices[i]<p.slides.length,p.id+' preview index '+i);}}
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');let hosted=0,missingLocalOriginals=0;
for(const [id,f]of Object.entries(files)){
 if(f.available===false)continue;
 const parts=f.parts||[{url:f.url,bytes:f.bytes,sha256:f.sha256}];
 if(parts.some(part=>!fs.existsSync(path.join('storage-data/originals',path.basename(part.url))))){missingLocalOriginals++;continue;}
 const total=createHash('sha256');let bytes=0;
 for(const part of parts){const b=fs.readFileSync(path.join('storage-data/originals',path.basename(part.url)));assert.equal(b.length,part.bytes);assert.equal(hash(b),part.sha256);assert(b.length<25*1024*1024);total.update(b);bytes+=b.length;}
 assert.equal(bytes,f.bytes);assert.equal(total.digest('hex'),f.sha256,id+' original file hash');hosted+=bytes;
}
console.log(JSON.stringify({status:'passed',pairedPageStrings:Object.keys(l.en.page).length,pairedUIStrings:Object.keys(l.en.ui).length,bilingualProjects:projects.length,originalRecords:Object.keys(files).length,verifiedHostedOriginalBytes:hosted,missingLocalOriginals}));

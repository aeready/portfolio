import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createHash,webcrypto} from 'node:crypto';
const source=fs.readFileSync('web/downloads.js','utf8');const data=Buffer.from('An exact original PowerPoint download fixture.');const a=data.subarray(0,17),b=data.subarray(17);const hash=v=>createHash('sha256').update(v).digest('hex');
const manifest={large:{filename:'original.pptx',bytes:data.length,parts:[{url:'part-a',bytes:a.length,sha256:hash(a)},{url:'part-b',bytes:b.length,sha256:hash(b)}]},small:{filename:'small.pptx',bytes:4,url:'small.pptx'}};
async function test(mode){let wrote=[],closed=false,aborted=false,clicked=[],blobs=[];const updates=[];
 const window={PORTFOLIO_ORIGINALS:manifest};
 if(mode==='stream')window.showSaveFilePicker=async()=>({createWritable:async()=>({write:async value=>wrote.push(Buffer.from(value)),close:async()=>{closed=true;},abort:async()=>{aborted=true;}})});
 if(mode==='cancel')window.showSaveFilePicker=async()=>{throw Object.assign(Error(),{name:'AbortError'});};
 if(mode==='permission')window.showSaveFilePicker=async()=>{throw Object.assign(Error(),{name:'NotAllowedError'});};
 if(mode==='embedded')window.showSaveFilePicker=async()=>{throw Object.assign(Error(),{name:'SecurityError'});};
 const document={body:{appendChild(){}},createElement:()=>({click(){clicked.push({href:this.href,download:this.download});},remove(){}})};
 const context={window,document,crypto:webcrypto,Blob,URL:{createObjectURL:blob=>{blobs.push(blob);return 'blob:download';},revokeObjectURL(){}},setTimeout:f=>f(),fetch:async url=>({ok:mode!=='error',arrayBuffer:async()=>{const v=url==='part-a'?a:b;return v.buffer.slice(v.byteOffset,v.byteOffset+v.byteLength);}})};vm.createContext(context);vm.runInContext(source,context);
 await window.PortfolioDownloads.download('large',s=>updates.push(s));
 if(mode==='stream'){assert(closed);assert(!aborted);assert.equal(Buffer.concat(wrote).toString(),data.toString());assert.equal(updates.at(-1).state,'downloadSaved');}
 if(mode==='fallback'||mode==='embedded'||mode==='permission'){assert.equal(Buffer.from(await blobs[0].arrayBuffer()).toString(),data.toString());assert.equal(clicked[0].download,'original.pptx');assert.equal(updates.at(-1).state,'downloadStarted');}
 if(mode==='cancel'){assert.equal(updates.at(-1).state,'downloadCancelled');assert.equal(clicked.length,0);}
 if(mode==='error')assert.equal(updates.at(-1).state,'downloadFailed');
 await window.PortfolioDownloads.download('small');assert(clicked.some(x=>x.href==='small.pptx'&&x.download==='small.pptx'));
}
for(const mode of ['stream','fallback','embedded','permission','cancel','error'])await test(mode);
console.log(JSON.stringify({status:'passed',checks:['byte-exact streamed save','byte-exact browser fallback','embedded-browser fallback','cancel and transfer-error handling','direct original download']}));

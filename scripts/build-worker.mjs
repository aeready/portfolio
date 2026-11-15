import fs from 'node:fs';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const core=['index.html','style.css','overhaul-v2.css','refine.css','press.css','edition.css','fixes.css','press-boot.js','press.js','edition.js','preview-assets.js','projects.js','app.js','downloads.js','locales.js','originals.js'];
const fileTypes={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',avif:'image/avif',woff2:'font/woff2',otf:'font/otf',pdf:'application/pdf'};
const sources=core.map(name=>fs.readFileSync(`web/${name}`,'utf8')).join('\n');
const referenced=[...sources.matchAll(/assets\/[\w./()+ -]+?\.(?:svg|png|jpe?g|webp|avif|woff2?|otf|pdf)/g)].map(match=>match[0]);
const available=referenced.filter(path=>fs.existsSync(`web/${path}`));
const hostedOriginals=new Set(['assets/anna-ready-cv.pdf','assets/how-does-it-taste-handout-optimized.pdf']);
const assets=[...new Set([...core.map(name=>name),...available.filter(path=>!path.endsWith('.pdf')||hostedOriginals.has(path))])].map(path=>{
 const extension=path.slice(path.lastIndexOf('.')+1).toLowerCase();return [path==='index.html'?'/':'/'+path,`web/${path}`,fileTypes[extension]];
});
assets.push(['/index.html','web/index.html',fileTypes.html]);
// Share identical payloads and losslessly compress text assets inside the Worker.
// Gallery previews stay embedded so the portfolio remains complete after deployment.
const payloads=[], routes=[], seen=new Map();
for(const [url,file,type] of assets){
 const bytes=fs.readFileSync(file),key=type+':'+createHash('sha256').update(bytes).digest('hex');
 const namedHash=file.match(/--([a-f0-9]{12})\.[^.]+$/)?.[1];
 if(namedHash&&namedHash!==createHash('sha256').update(bytes).digest('hex').slice(0,12))throw Error(`Stale content hash: ${file}`);
 let index=seen.get(key);
 if(index===undefined){
  index=payloads.length;seen.set(key,index);
  const compressed=/text\/|image\/svg|application\/pdf/.test(type)?gzipSync(bytes,{level:9}):bytes;
  const gzip=compressed.length<bytes.length;
  payloads.push({type,base64:(gzip?compressed:bytes).toString('base64'),bytes:bytes.length,...(gzip?{encoding:'gzip'}:{})});
 }
 routes.push([url,index]);
}
fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});
const worker=fs.readFileSync('worker/index.js','utf8').replace('const SITE_OVERRIDES = new Map();',`const SITE_OVERRIDES = (()=>{const payloads=${JSON.stringify(payloads)};return new Map(${JSON.stringify(routes)}.map(([url,index])=>[url,payloads[index]]));})();`);
if(Buffer.byteLength(worker)>63*1024*1024)throw Error('Worker exceeds the safe uncompressed packaging budget');
fs.writeFileSync('dist/server/index.js',worker);
console.log('Worker bytes:',Buffer.byteLength(worker));
fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');

import fs from 'node:fs';import assert from 'node:assert/strict';import {webcrypto} from 'node:crypto';
const source=fs.readFileSync('worker/index.js','utf8');const worker=(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).default;
const objects=new Map();const env={PORTFOLIO_UPLOAD_SECRET:'test-secret',BUCKET:{put:async(key,bytes,opts)=>{bytes=await new Response(bytes).arrayBuffer();assert.equal(Buffer.from(await webcrypto.subtle.digest('SHA-256',bytes)).toString('hex'),opts.sha256);objects.set(key,{bytes,opts});return {size:bytes.byteLength};},get:async key=>{const o=objects.get(key);if(!o)return null;return {size:o.bytes.byteLength,httpEtag:'"test"',body:o.bytes,writeHttpMetadata:h=>h.set('content-type',o.opts.httpMetadata.contentType)};}}};
let res=await worker.fetch(new Request('https://test/_portfolio-upload/site/index.html',{method:'PUT',body:'x'}),env);assert.equal(res.status,404);
const bytes=new TextEncoder().encode('<h1>Test</h1>');const hash=Buffer.from(await webcrypto.subtle.digest('SHA-256',bytes)).toString('hex');
res=await worker.fetch(new Request('https://test/_portfolio-upload/site/index.html',{method:'PUT',headers:{'X-Portfolio-Upload-Key':'test-secret','Content-Length':String(bytes.length),'X-Content-SHA256':hash,'X-File-Content-Type':'text/css; charset=utf-8'},body:bytes}),env);assert.equal(res.status,200);
res=await worker.fetch(new Request('https://test/'),env);assert.equal(await res.text(),'<h1>Test</h1>');assert.equal(res.headers.get('content-type'),'text/html; charset=utf-8');const etag=res.headers.get('etag');assert.notEqual(etag,'\"test\"');assert.equal(objects.get('site/index.html').opts.httpMetadata.contentType,'text/html; charset=utf-8');
res=await worker.fetch(new Request('https://test/',{method:'HEAD'}),env);assert.equal(await res.text(),'');
res=await worker.fetch(new Request('https://test/',{headers:{'if-none-match':etag}}),env);assert.equal(res.status,304);
// Existing objects can already carry the wrong metadata, as happened to the homepage.
objects.get('site/index.html').opts.httpMetadata.contentType='text/css; charset=utf-8';
for(const route of ['/','/index.html']){
 res=await worker.fetch(new Request('https://test'+route,{headers:{'if-none-match':'"test"'}}),env);
 assert.equal(res.status,200,'A stale incorrectly typed cache entry must be replaced');
 assert.equal(res.headers.get('content-type'),'text/html; charset=utf-8');assert.equal(await res.text(),'<h1>Test</h1>');
}
for(const [name,type]of [['app.js','text/javascript; charset=utf-8'],['style.css','text/css; charset=utf-8'],['assets/name-cutouts.svg','image/svg+xml'],['assets/fonts/NotoSans-Regular.woff2','font/woff2'],['assets/anna-ready-cv.pdf','application/pdf']]){
 objects.set('site/'+name,{bytes,opts:{httpMetadata:{contentType:'text/plain'}}});
 res=await worker.fetch(new Request('https://test/'+name,{method:'HEAD'}),env);assert.equal(res.headers.get('content-type'),type);assert.equal(await res.text(),'');
}
// Missing pages get the designed 404 page with a 404 status; missing files stay plain.
objects.set('site/404.html',{bytes:new TextEncoder().encode('<h1>404</h1>'),opts:{httpMetadata:{contentType:'text/html'}}});
res=await worker.fetch(new Request('https://test/no-such-page'),env);assert.equal(res.status,404);assert.equal(res.headers.get('content-type'),'text/html; charset=utf-8');assert.equal(await res.text(),'<h1>404</h1>');assert.match(res.headers.get('content-security-policy')||'',/frame-ancestors 'none'/);
res=await worker.fetch(new Request('https://test/missing.png'),env);assert.equal(res.status,404);assert.equal(await res.text(),'Not found');
res=await worker.fetch(new Request('https://test/no-such-page',{method:'HEAD'}),env);assert.equal(res.status,404);
const builtSource=fs.readFileSync('dist/server/index.js','utf8');
const built=(await import('data:text/javascript;base64,'+Buffer.from(builtSource).toString('base64'))).default;
for(const route of ['/','/index.html']){
 const home=await built.fetch(new Request('https://test'+route),{BUCKET:{get:async()=>{throw Error('Homepage should use current embedded HTML');}}});
 assert.equal(home.status,200);assert.equal(home.headers.get('content-type'),'text/html; charset=utf-8');
 assert.match(home.headers.get('content-security-policy')||'',/frame-ancestors 'none'/);
 assert.equal(home.headers.get('x-content-type-options'),'nosniff');
 assert.equal(home.headers.get('cache-control'),'private, no-cache');
 assert.equal(await home.text(),fs.readFileSync('web/index.html','utf8'));
}
for(const method of ['GET','HEAD']){
 const pdf=await built.fetch(new Request('https://test/assets/anna-ready-cv.pdf',{method}),{BUCKET:{get:async()=>{throw Error('Résumé should be embedded');}}});
 assert.equal(pdf.status,200);assert.equal(pdf.headers.get('content-type'),'application/pdf');
 assert.equal(pdf.headers.get('x-robots-tag'),'noindex, nofollow');
}
const bundleName=fs.readdirSync('web').find(name=>/^site--[a-f0-9]{12}\.js$/.test(name));
for(const [route,type] of [['/robots.txt','text/plain; charset=utf-8'],['/sitemap.xml','application/xml; charset=utf-8'],['/'+bundleName,'text/javascript; charset=utf-8']]){const res=await built.fetch(new Request('https://test'+route),{BUCKET:{get:async()=>{throw Error('Expected embedded '+route);}}});assert.equal(res.status,200);assert.equal(res.headers.get('content-type'),type);assert.equal(res.headers.get('x-robots-tag'),null,route+' is indexable');}
console.log('Worker upload authorization, storage hash, routing, content type, HEAD, cache, and embedded homepage checks passed.');

// Lossless text packaging and shared identity/favicon payloads must serve original bytes.
for(const file of ['style.css','overhaul-v2.css',bundleName,'robots.txt','sitemap.xml','assets/favicon-ar-v3.svg',...fs.readdirSync('web/assets').filter(name=>name.startsWith('zine-book-collage--')).map(name=>'assets/'+name)]){
 const res=await built.fetch(new Request('https://test/'+file),{BUCKET:{get:async()=>{throw Error('Expected embedded asset '+file);}}});
 assert.equal(res.status,200);const expected=fs.readFileSync('web/'+file);
 assert.deepEqual(Buffer.from(await res.arrayBuffer()),expected,file+' must remain byte-identical');
 assert.equal(res.headers.get('content-length'),String(expected.length));
 if(file.includes('--'))assert.equal(res.headers.get('cache-control'),'public, max-age=31536000, immutable');
 const head=await built.fetch(new Request('https://test/'+file,{method:'HEAD'}),{});
 assert.equal(head.headers.get('content-length'),String(expected.length));assert.equal(await head.text(),'');
}
console.log('Compressed and shared embedded assets serve byte-exact content and HEAD metadata.');

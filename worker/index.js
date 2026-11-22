const securityHeaders={'content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",'strict-transport-security':'max-age=31536000; includeSubDomains','referrer-policy':'strict-origin-when-cross-origin','permissions-policy':'camera=(), microphone=(), geolocation=()','x-content-type-options':'nosniff'};
const secure=headers=>{for(const [k,v] of Object.entries(securityHeaders))headers.set(k,v);return headers};
// Constant-time comparison for the upload key, so response timing cannot reveal how much of a guess was right.
const safeEqual=(a,b)=>{const x=new TextEncoder().encode(String(a??'')),y=new TextEncoder().encode(String(b??''));let d=x.length^y.length;const n=Math.max(x.length,y.length);for(let i=0;i<n;i++)d|=(x[i]||0)^(y[i]||0);return d===0};
const authorised=(request,env)=>Boolean(env.PORTFOLIO_UPLOAD_SECRET)&&safeEqual(request.headers.get('X-Portfolio-Upload-Key'),env.PORTFOLIO_UPLOAD_SECRET);
const respond=(message,status)=>new Response(message,{status,headers:secure(new Headers({'content-type':'text/plain; charset=utf-8','cache-control':'no-store'}))});
// Use the requested website file's extension rather than trusting object metadata.
const SITE_OVERRIDES = new Map();
const immutableAsset=path=>/^\/assets\/.+--[a-f0-9]{12}\.(?:svg|png|jpe?g|webp|avif|woff2?)$/.test(path)||/^\/site--[a-f0-9]{12}\.js$/.test(path);
const siteContentType=key=>{
 if(!key.startsWith('site/'))return null;
 const extension=key.slice(key.lastIndexOf('.')+1).toLowerCase();
 return {html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',avif:'image/avif',ico:'image/x-icon',woff:'font/woff',woff2:'font/woff2',ttf:'font/ttf',otf:'font/otf',pdf:'application/pdf',txt:'text/plain; charset=utf-8',xml:'application/xml; charset=utf-8',json:'application/json; charset=utf-8'}[extension]||null;
};
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(url.pathname==='/_portfolio-assemble'&&request.method==='POST'){
  if(!authorised(request,env))return respond('Not found',404);
  const spec=await request.json();if(!/^originals\/[a-z0-9-]+\.pptx$/.test(spec.key)||!Array.isArray(spec.parts)||spec.parts.length>50)return respond('Invalid request',400);
  const upload=await env.BUCKET.createMultipartUpload(spec.key,{httpMetadata:{contentType:'application/vnd.openxmlformats-officedocument.presentationml.presentation'},customMetadata:{sha256:spec.sha256}});
  try {let bytes=0;const uploaded=[];
   for(let i=0;i<spec.parts.length;i++){const key=spec.parts[i];if(!/^originals\/[a-z0-9.-]+\.bin$/.test(key))throw Error('Invalid part');const object=await env.BUCKET.get(key);if(!object)throw Error('Missing part');bytes+=object.size;uploaded.push(await upload.uploadPart(i+1,object.body));}
   if(bytes!==spec.bytes)throw Error('Size mismatch');const result=await upload.complete(uploaded);return Response.json({bytes:result.size,sha256:spec.sha256});
  }catch(error){await upload.abort();return respond('Assembly failed',500);}
 }
 if(url.pathname==='/_portfolio-assemble-site'&&request.method==='POST'){
  if(!authorised(request,env))return respond('Not found',404);
  const spec=await request.json();
  if(!/^site\/assets\/downloads\/[a-z0-9-]+\.(pdf|pptx|zip)$/.test(spec.key)||!Array.isArray(spec.parts)||spec.parts.length>20||!Number.isSafeInteger(spec.bytes)||! /^[a-f0-9]{64}$/.test(spec.sha256||''))return respond('Invalid request',400);
  const types={pdf:'application/pdf',pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',zip:'application/zip'};
  const type=types[spec.key.split('.').pop()];
  const upload=await env.BUCKET.createMultipartUpload(spec.key,{httpMetadata:{contentType:type},customMetadata:{sha256:spec.sha256}});
  try {let bytes=0;const uploaded=[];
   for(let i=0;i<spec.parts.length;i++){
    const key=spec.parts[i];if(!/^site\/upload-parts\/[a-f0-9-]+\.bin$/.test(key))throw Error('Invalid part');
    const object=await env.BUCKET.get(key);if(!object)throw Error('Missing part');bytes+=object.size;uploaded.push(await upload.uploadPart(i+1,object.body));
   }
   if(bytes!==spec.bytes)throw Error('Size mismatch');
   const result=await upload.complete(uploaded);
   await Promise.all(spec.parts.map(key=>env.BUCKET.delete(key)));
   return Response.json({key:spec.key,bytes:result.size,sha256:spec.sha256});
  }catch(error){await upload.abort();return respond('Assembly failed',500);}
 }
 if(url.pathname.startsWith('/_portfolio-upload/')){
  if(request.method!=='PUT'||!authorised(request,env))return respond('Not found',404);
  const key=decodeURIComponent(url.pathname.slice('/_portfolio-upload/'.length));if(!/^(site|originals)\//.test(key)||key.includes('..'))return respond('Invalid path',400);
  const size=Number(request.headers.get('Content-Length'));if(!size||size>25*1024*1024)return respond('Invalid size',413);
  const hash=request.headers.get('X-Content-SHA256');if(!/^[a-f0-9]{64}$/.test(hash||''))return respond('Invalid checksum',400);
  const object=await env.BUCKET.put(key,request.body,{sha256:hash,httpMetadata:{contentType:siteContentType(key)||request.headers.get('X-File-Content-Type')||'application/octet-stream'},customMetadata:{sha256:hash}});
  return Response.json({key,bytes:object.size,sha256:hash});
 }
 if(!['GET','HEAD'].includes(request.method))return respond('Method not allowed',405);
 let path;try{path=decodeURIComponent(url.pathname);}catch{return respond('Not found',404);}
 if(path.includes('..'))return respond('Not found',404);
 const override=SITE_OVERRIDES.get(path);
 if(override){
  const headers=new Headers({'content-type':override.type,'cache-control':immutableAsset(path)?'public, max-age=31536000, immutable':'private, no-cache','x-content-type-options':'nosniff'});
  secure(headers);headers.set('content-length',String(override.bytes));
  if(path==='/assets/anna-ready-cv.pdf')headers.set('x-robots-tag','noindex, nofollow');
  if(request.method==='HEAD')return new Response(null,{headers});
  let body=Uint8Array.from(atob(override.base64),c=>c.charCodeAt(0));
  if(override.encoding==='gzip'){
   body=new Uint8Array(await new Response(new Response(body).body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
  }
  return new Response(body,{headers});
 }
 const key=path.startsWith('/assets/originals/')?'originals/'+path.slice('/assets/originals/'.length):'site/'+(path==='/'?'index.html':path.slice(1));
 const object=await env.BUCKET.get(key);if(!object){const page=request.method==='GET'&&!/\.[a-z0-9]{2,5}$/i.test(path)?await env.BUCKET.get('site/404.html'):null;if(!page)return respond('Not found',404);const h=new Headers({'content-type':'text/html; charset=utf-8','cache-control':'no-store'});secure(h);return new Response(page.body,{status:404,headers:h});}
 const headers=new Headers();object.writeHttpMetadata(headers);
 const contentType=siteContentType(key);if(contentType)headers.set('content-type',contentType);if(key==='site/assets/anna-ready-cv.pdf')headers.set('x-robots-tag','noindex, nofollow');
 // Changing the response type must invalidate an older cached response with incorrect metadata.
 const etag=contentType?'\"'+object.httpEtag.replace(/^\"|\"$/g,'')+'-'+contentType.split(';')[0].replace(/[^a-z0-9]/g,'-')+'\"':object.httpEtag;
 secure(headers);headers.set('etag',etag);headers.set('cache-control',immutableAsset(path)?'public, max-age=31536000, immutable':'private, no-cache');headers.set('x-content-type-options','nosniff');headers.set('content-length',String(object.size));
 if(request.headers.get('if-none-match')===etag)return new Response(null,{status:304,headers});
 return new Response(request.method==='HEAD'?null:object.body,{headers});
}};

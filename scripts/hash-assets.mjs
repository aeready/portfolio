import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const web=path.join(root,'web');
const assetRoot=path.join(web,'assets');
const extensions=new Set(['.svg','.png','.jpg','.jpeg','.webp','.avif','.woff','.woff2','.ttf','.otf']);
const textExtensions=new Set(['.html','.css','.js']);
function walk(directory){return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
 const name=path.join(directory,entry.name);
 return entry.isDirectory()?walk(name):entry.isFile()?[name]:[];
});}
const textFiles=walk(web).filter(name=>textExtensions.has(path.extname(name)));
textFiles.push(...walk(path.join(root,'scripts')).filter(name=>/validate.*\.mjs$/.test(name)));
const texts=new Map(textFiles.map(name=>[name,fs.readFileSync(name,'utf8')]));
const siteSource=[...texts].filter(([name])=>name.startsWith(web+path.sep)).map(([,text])=>text).join('\n');
const assets=walk(assetRoot).filter(name=>extensions.has(path.extname(name).toLowerCase()));
const changes=[];
for(const file of assets){
 const relative=path.relative(web,file).split(path.sep).join('/');
 if(!siteSource.includes(relative))continue;
 const ext=path.extname(file),stem=path.basename(file,ext).replace(/--[a-f0-9]{12}$/,'');
 const hash=createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0,12);
 const next=path.join(path.dirname(file),`${stem}--${hash}${ext}`);
 if(file===next)continue;
 if(fs.existsSync(next))throw Error(`Refusing to overwrite ${next}`);
 changes.push({old:relative,next:path.relative(web,next).split(path.sep).join('/'),bytes:fs.statSync(file).size,hash});
}
// Replace longer paths first so one basename cannot partially rewrite another.
changes.sort((a,b)=>b.old.length-a.old.length);
for(const [name,original] of texts){
 let updated=original;
 for(const {old,next} of changes)updated=updated.replaceAll(old,next);
 if(updated!==original)fs.writeFileSync(name,updated);
}
for(const {old,next} of changes)fs.renameSync(path.join(web,old),path.join(web,next));
if(changes.length)fs.writeFileSync(path.join(root,'scripts','asset-hashes.json'),JSON.stringify(changes,null,2)+'\n');
console.log(`Hashed ${changes.length} referenced assets; ${changes.reduce((sum,item)=>sum+item.bytes,0)} bytes renamed without copies.`);

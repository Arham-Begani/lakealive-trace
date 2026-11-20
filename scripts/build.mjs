import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root=new URL('../',import.meta.url);
const files=['scenarios','model','state','simulator','report','map','app'];
let script='"use strict";\n(()=>{\n';
for(const file of files){let code=await readFile(new URL('src/'+file+'.js',root),'utf8');code=code.replace(/^import .+ from ['"].+['"];\s*$/gm,'').replace(/^export /gm,'');script+='\n// '+file+'.js\n'+code+'\n';}
script+='\n})();';
if(/<\/script/i.test(script))throw new Error('Unsafe closing script tag in bundled source');
let html=await readFile(new URL('index.html',root),'utf8');
const css=await readFile(new URL('src/styles.css',root),'utf8');
html=html.replace('<link rel="stylesheet" href="src/styles.css">',()=>'<style>'+css+'</style>').replace('<script type="module" src="src/app.js"></script>',()=>'<script>'+script+'</script>');
await mkdir(new URL('dist',root),{recursive:true});
await writeFile(new URL('dist/index.html',root),html);
console.log('Portable app: '+fileURLToPath(new URL('dist/index.html',root))+' ('+Buffer.byteLength(html)+' bytes)');

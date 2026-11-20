// Local developer convenience. Serve only the generated artifact, never project internals.
import './scripts/build.mjs';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const args=process.argv.slice(2);
const option=name=>{const i=args.indexOf(name);return i<0?undefined:args[i+1];};
const port=Number(option('--port')||process.env.PORT||5173);
const host=option('--host')||'127.0.0.1';
createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;
 if(path==='/__viewport'){const html=await readFile(new URL('./scripts/viewport-check.html',import.meta.url));res.writeHead(200,{'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store'});res.end(html);return;}
 if(path!=='/'&&path!=='/index.html'){res.writeHead(404);res.end('Not found');return;}
 try {const html=await readFile(new URL('./dist/index.html',import.meta.url));res.writeHead(200,{'Content-Type':'text/html;charset=utf-8','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});res.end(html);}
 catch{res.writeHead(500);res.end('Build the app first.');}
}).listen(port,host,()=>console.log('Trace: http://'+host+':'+port));

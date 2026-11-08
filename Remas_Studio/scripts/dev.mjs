import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,sep} from 'node:path';
import {Readable} from 'node:stream';
import {createHandler} from '../server/worker.js';

const directory = resolve('public');
const handle = createHandler(async route=>{
  const path = resolve(directory,'.'+route);
  if (!path.startsWith(directory+sep)) return null;
  try { return await readFile(path); }
  catch (error) { if (['ENOENT','EISDIR'].includes(error.code)) return null; throw error; }
});
const args = process.argv.slice(2);
function arg(name) {
  return args.find(value=>value.startsWith(name+'='))?.slice(name.length+1) ?? args[args.indexOf(name)+1];
}
const host = args.some(value=>value.startsWith('--host')) ? arg('--host') : process.env.HOST || '0.0.0.0';
const port = Number(args.some(value=>value.startsWith('--port')) ? arg('--port') : process.env.PORT || 3000);
createServer(async (req,res)=>{
  try {
    const url = new URL(req.url,'http://'+req.headers.host);
    const body = ['GET','HEAD'].includes(req.method) ? undefined : Readable.toWeb(req);
    const response = await handle(new Request(url,{method:req.method,headers:req.headers,body,duplex:'half'}),process.env);
    res.writeHead(response.status,Object.fromEntries(response.headers));
    if (response.body) Readable.fromWeb(response.body).pipe(res);
    else res.end();
  } catch {
    res.writeHead(500).end('Something went wrong');
  }
}).listen(port,host,()=>console.log('Studio ready on http://'+host+':'+port));

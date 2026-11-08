import {mkdir,readFile,readdir,writeFile,copyFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const files = await readdir('public',{recursive:true,withFileTypes:true});
const assets = Object.fromEntries(await Promise.all(files.filter(file=>file.isFile()).map(async file=>{
  const directory = file.parentPath ?? file.path;
  const path = resolve(directory,file.name);
  const route = path.slice(resolve('public').length);
  return [route,(await readFile(path)).toString('base64')];
})));
const code = await readFile('server/worker.js','utf8');
await mkdir('dist/server',{recursive:true});
await mkdir('dist/.openai',{recursive:true});
await writeFile('dist/server/index.js',code+'\nconst assets = '+JSON.stringify(assets)+';\n'+
  'export default { fetch:createHandler(path => Object.hasOwn(assets,path) ? Uint8Array.from(atob(assets[path]), c => c.charCodeAt(0)) : null) };\n');
await copyFile('.openai/hosting.json','dist/.openai/hosting.json');

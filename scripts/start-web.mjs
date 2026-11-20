import {access,cp} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const web=join(root,'apps/web'),standalone=join(web,'.next/standalone/apps/web');
try{await access(join(standalone,'server.js'))}catch{throw Error('Build the web application before starting it: npm run build')}
await cp(join(web,'public'),join(standalone,'public'),{recursive:true});
await cp(join(web,'.next/static'),join(standalone,'.next/static'),{recursive:true});
const child=spawn(process.execPath,[join(standalone,'server.js')],{cwd:standalone,stdio:'inherit',env:{...process.env,NODE_ENV:'production',HOSTNAME:'127.0.0.1',PORT:process.env.PORT??'3000'}});
process.once('SIGINT',()=>child.kill('SIGINT'));process.once('SIGTERM',()=>child.kill('SIGTERM'));
child.on('error',error=>{console.error(error.message);process.exitCode=1});child.on('exit',code=>{process.exitCode=code??0});

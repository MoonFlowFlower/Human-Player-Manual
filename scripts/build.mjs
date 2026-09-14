import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
execFileSync('tsc',[],{stdio:'inherit',shell:process.platform==='win32'});
fs.mkdirSync('dist/build',{recursive:true});
for(const file of fs.readdirSync('build'))if(file.endsWith('.js'))fs.copyFileSync(path.join('build',file),path.join('dist/build',file));
for(const file of ['index.html','style.css'])fs.copyFileSync(file,path.join('dist',file));
// A deliberately small, build-time linker for this project's named ESM modules.
// It preserves per-module scope; unsupported import/export syntax fails the build.
const modules=[],visited=new Set();
function link(name){
 if(visited.has(name))return;visited.add(name);
 let code=fs.readFileSync(path.join('build',name),'utf8');
 const imports=[...code.matchAll(/^import \{([^}]+)\} from ['"]\.\/([^'"]+)['"];?$/gm)];
 for(const m of imports)link(m[2]);
 for(const m of imports)code=code.replace(m[0],`const {${m[1]}} = __modules[${JSON.stringify(m[2])}];`);
 const exports=[...code.matchAll(/^export (?:const|let|function|class) (\w+)/gm)].map(m=>m[1]);
 code=code.replace(/^export (?=(?:const|let|function|class) )/gm,'').replace(/^export \{\};?$/gm,'');
 if(/^\s*(?:import |export )/m.test(code))throw new Error(`Unsupported ESM syntax in ${name}`);
 modules.push(`__modules[${JSON.stringify(name)}] = (() => {\n${code}\nreturn {${exports.join(',')}};\n})();`);
}
link('app.js');
const js=`(() => {\n'use strict';\nconst __modules = Object.create(null);\n${modules.join('\n')}\n})();`;
const css=fs.readFileSync('style.css','utf8');
let html=fs.readFileSync('index.html','utf8');
html=html.replace('<link rel="stylesheet" href="./style.css">',`<style>${css}</style>`).replace('<script type="module" src="./build/app.js"></script>',`<script>${js.replace(/<\/script/gi,'<\\/script')}</script>`);
fs.writeFileSync('dist/EARTH-player-manual.html',html);
console.log(`Built ${modules.length} scoped modules. Offline HTML: ${(Buffer.byteLength(html)/1024).toFixed(1)} KB, gzip ${(gzipSync(html).length/1024).toFixed(1)} KB. No fonts or external assets bundled.`);

import fs from 'node:fs';
const issues=[];
for(const file of fs.readdirSync('src').filter(f=>f.endsWith('.ts'))){
 const text=fs.readFileSync(`src/${file}`,'utf8');
 if(/\b(?:eval|Function)\s*\(/.test(text))issues.push(`${file}: dynamic evaluation`);
 if(/href=["']#["']/.test(text))issues.push(`${file}: empty navigation target`);
 if(/\son(?:click|input|submit)=/i.test(text))issues.push(`${file}: inline event handler`);
 if(/console\.log\(/.test(text))issues.push(`${file}: debug logging`);
 if(/\b(?:TODO|FIXME|lorem ipsum)\b/i.test(text))issues.push(`${file}: unfinished placeholder`);
}
if(issues.length){console.error(issues.join('\n'));process.exit(1);}
console.log('Project source checks passed: no placeholders, empty links, inline handlers, dynamic evaluation or debug logging. Strict TypeScript checks run separately.');

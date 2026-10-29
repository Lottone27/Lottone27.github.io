const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname,'..');
const pages = ['index.html','portfolio.html','project-kbo.html','project-personal.html','project-mentoring.html'];
const errors = [];
let references = 0;
for (const name of pages) {
  const html = fs.readFileSync(path.join(root,name),'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  if (ids.length !== new Set(ids).size) errors.push(name+': duplicate IDs');
  if ((html.match(/<h1\b/g)||[]).length !== 1) errors.push(name+': expected one H1');
  if (!html.includes('lang="ko"') || !html.includes('name="viewport"')) errors.push(name+': missing language/viewport');
  for (const match of html.matchAll(/(?:href|src|poster|data-gif)="([^"]+)"/g)) {
    const ref = match[1];
    if (/^(https?:|mailto:|data:)/.test(ref)) continue;
    const [file,hash] = ref.split('#');
    if (file && !fs.existsSync(path.join(root,file))) errors.push(`${name}: missing ${file}`);
    if (!file && hash && !ids.includes(hash)) errors.push(`${name}: missing anchor ${hash}`);
    if (file && hash && file.endsWith('.html') && fs.existsSync(path.join(root,file))) {
      const target = fs.readFileSync(path.join(root,file),'utf8');
      if (!target.includes(`id="${hash}"`)) errors.push(`${name}: missing target ${ref}`);
    }
    references++;
  }
  for (const image of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt=/.test(image[0])) errors.push(name+': image missing alt');
  for (const deck of html.matchAll(/data-deck="([^"]+)" data-count="(\d+)"/g)) {
    for(let i=1;i<=Number(deck[2]);i++) if (!fs.existsSync(path.join(root,'image',deck[1],'ppt',i+'.jpg'))) errors.push(`${name}: missing slide ${i}`);
  }
  // Check matching structural tags without requiring a framework or external parser.
  const voids = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  const stack = [];
  const clean = html.replace(/<!--[\s\S]*?-->/g,'');
  for (const token of clean.matchAll(/<(\/?)([a-z][\w-]*)\b[^>]*>/gi)) {
    const tag = token[2].toLowerCase();
    if(voids.has(tag)) continue;
    if(token[1]) { const previous = stack.pop(); if(previous!==tag) errors.push(`${name}: closing ${tag} after ${previous}`); }
    else stack.push(tag);
  }
  if(stack.length) errors.push(name+': unclosed '+stack.join(','));
}
assert.equal(fs.readFileSync(path.join(root,'index.html'),'utf8'),fs.readFileSync(path.join(root,'portfolio.html'),'utf8'),'Entry pages must match');
assert.equal(fs.readFileSync(path.join(root,'assets/fonts/PretendardVariable.woff2')).subarray(0,4).toString(),'wOF2','Font must be a valid WOFF2 file');
assert.ok(fs.existsSync(path.join(root,'assets/fonts/OFL.txt')),'Font license required');
for(const name of ['renewal.css','case-study.css']) {
  const css=fs.readFileSync(path.join(root,'css',name),'utf8');
  assert.equal((css.match(/{/g)||[]).length,(css.match(/}/g)||[]).length,name+' brace mismatch');
  for(const m of css.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)) if(!fs.existsSync(path.resolve(root,'css',m[1]))) errors.push(name+': missing '+m[1]);
}
function luminance(hex) { const rgb=hex.replace('#','').match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]; }
for(const [foreground,background] of [['#445168','#ffffff'],['#65728a','#f7f8fb'],['#ffffff','#285ad8']]) {
  const a=luminance(foreground),b=luminance(background);
  const contrast=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  assert.ok(contrast>=4.5,`${foreground} on ${background}: insufficient contrast ${contrast}`);
}
// Exercise actual slide navigation code for both deck lengths, including invalid input.
for(const count of [44,73]) {
  const element=()=>({listeners:{},addEventListener(k,fn){this.listeners[k]=fn;},setAttribute(k,v){this[k]=v;}});
  const selectors={};
  for(const key of ['.slide-image','.slide-page','.slide-prev','.slide-next','.slide-announcement','.slide-image-button']) selectors[key]=element();
  const viewer=element();
  viewer.dataset={count:String(count),deck:'kbo'};
  viewer.querySelector=s=>selectors[s];
  const document={querySelector:()=>null,querySelectorAll:s=>s==='[data-deck]'?[viewer]:[]};
  vm.runInNewContext(fs.readFileSync(path.join(root,'js/case-study.js'),'utf8'),{document,console,Date});
  assert.equal(selectors['.slide-prev'].disabled,true);
  selectors['.slide-next'].listeners.click();
  assert.equal(selectors['.slide-page'].value,2);
  selectors['.slide-page'].value=999;
  selectors['.slide-page'].listeners.change();
  assert.equal(selectors['.slide-page'].value,count);
  assert.equal(selectors['.slide-next'].disabled,true);
  selectors['.slide-page'].value='invalid';
  selectors['.slide-page'].listeners.change();
  assert.equal(selectors['.slide-page'].value,1);
  assert.equal(selectors['.slide-image'].src,'image/kbo/ppt/1.jpg');
}
if(errors.length) { console.error(errors.join('\n'));process.exit(1); }
console.log(`PASS: ${pages.length} HTML pages, ${references} local references, 117 slides, structural markup, WOFF2 font, text contrast, and slide-navigation boundaries.`);

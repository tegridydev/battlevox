/** Adapts the existing graphics-command fixture to real Chromium DOM for offline UI checks.
 * Graphics calls remain instrumented, as in tests/browser.ts. This does not test a GPU.
 */
const fs = require('node:fs'),
  path = require('node:path');
const root = path.resolve(__dirname, '../..');
const ts = require('../compiler.cjs').loadTypeScript();
const walk = (d) =>
  fs
    .readdirSync(d, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const list = [
  ...walk(path.join(root, 'src')).filter((f) => f.endsWith('.ts')),
  ...[
    'tests/helpers.ts',
    'tests/integration/ui.test.ts',
    'tests/integration/career-ui.test.ts',
    'tests/integration/ui-060.test.ts',
    'tests/integration/ui-061.test.ts',
    'tests/integration/polish-ui.test.ts',
    'tests/smoke/rendering.test.ts',
  ].map((f) => path.join(root, f)),
];
let fixture = fs.readFileSync(path.join(root, 'tests/browser.ts'), 'utf8');
const a = fixture.indexOf('  const window = new Window('),
  _b = fixture.indexOf('  const draws =', a);
fixture = fixture.replace("import { Window } from 'happy-dom';\n", '');
// Locate again after removing the import.
const start = fixture.indexOf('  const window = new Window('),
  end = fixture.indexOf('  const draws =', start);
fixture =
  fixture.slice(0, start) +
  `  const window = globalThis.window;
  document.head.innerHTML = '<style>'+globalThis.__fixtureCSS+'</style>';
  document.body.innerHTML = globalThis.__fixtureBody;
  const saved = new Map();
  for (const key of ['requestAnimationFrame','cancelAnimationFrame']) saved.set(key,Object.getOwnPropertyDescriptor(globalThis,key));
  globalThis.requestAnimationFrame=()=>1;globalThis.cancelAnimationFrame=()=>{};
  const getContext = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,'getContext');
  const capture = Object.getOwnPropertyDescriptor(HTMLElement.prototype,'setPointerCapture');
` +
  fixture.slice(end);
fixture = fixture.replace(
  '      void window.happyDOM.close();',
  `      Object.defineProperty(HTMLCanvasElement.prototype,'getContext',getContext);
      if(capture)Object.defineProperty(HTMLElement.prototype,'setPointerCapture',capture);else delete HTMLElement.prototype.setPointerCapture;`,
);
const sources = list.map((f) => [
  path.relative(root, f).split(path.sep).join('/'),
  fs.readFileSync(f, 'utf8'),
]);
sources.push(['tests/browser.ts', fixture]);
const adapter = `const tests=globalThis.__tests=[];
exports.test=(name,fn)=>tests.push({name,fn});
exports.expect=function expect(actual,not=false){const c=(value,message)=>{if(not?value:!value)throw Error((not?'NOT ':'')+message);};return {get not(){return expect(actual,!not);},toBe:x=>c(Object.is(actual,x),'expected '+String(x)+'; received '+String(actual)),toEqual:x=>c(JSON.stringify(actual)===JSON.stringify(x),'toEqual'),toBeCloseTo:(x,n=2)=>c(Math.abs(actual-x)<.5*10**(-n),'toBeCloseTo'),toBeGreaterThan:x=>c(actual>x,actual+' > '+x),toBeGreaterThanOrEqual:x=>c(actual>=x,'>='),toBeLessThan:x=>c(actual<x,actual+' < '+x),toBeLessThanOrEqual:x=>c(actual<=x,'<='),toBeUndefined:()=>c(actual===undefined,'undefined'),toBeNull:()=>c(actual===null,'null'),toContain:x=>c(actual.includes(x),'contains '+x),toHaveLength:x=>c(actual.length===x,'length '+actual.length+' = '+x),toHaveBeenCalledTimes:x=>c(actual.mock.calls.length===x,'calls '+actual.mock.calls.length+' = '+x),toMatch:x=>c(x.test(actual),'matches'),toThrow:x=>{let e;try{actual();}catch(error){e=error;}c(!!e&&(!x||(x instanceof RegExp?x.test(e.message):e.message.includes(x))),'throws '+x);}};};
exports.spyOn=(object,key)=>{const original=object[key];let implementation=original;const wrapper=function(...args){wrapper.mock.calls.push(args);return implementation.apply(this,args);};wrapper.mock={calls:[]};wrapper.mockImplementation=fn=>{implementation=fn;return wrapper;};wrapper.mockRestore=()=>object[key]=original;object[key]=wrapper;return wrapper;};`;
const modules = sources.map(
  ([id, source]) =>
    JSON.stringify(id) +
    ':function(require,module,exports){\n' +
    ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    }).outputText +
    '\n}',
);
modules.push('"bun:test":function(require,module,exports){' + adapter + '}');
const bundle = `(function(){const modules={${modules.join(',\n')}},cache={};function load(id){if(cache[id])return cache[id].exports;let m={exports:{}};cache[id]=m;if(!modules[id])throw Error('missing '+id);modules[id](name=>{if(name==='bun:test')return load(name);const p=id.split('/');p.pop();for(const v of name.split('/'))if(v==='..')p.pop();else if(v!=='.')p.push(v);return load(p.join('/')+(name.endsWith('.ts')?'':'.ts'));},m,m.exports);return m.exports;}globalThis.__load=load;load('tests/integration/ui.test.ts');load('tests/integration/career-ui.test.ts');load('tests/integration/ui-060.test.ts');load('tests/integration/ui-061.test.ts');load('tests/integration/polish-ui.test.ts');load('tests/smoke/rendering.test.ts');globalThis.__runTest=async i=>{try{await __tests[i].fn();return {name:__tests[i].name,status:'pass'};}catch(e){return {name:__tests[i].name,status:'fail',error:e.stack};}};})();`;
fs.mkdirSync(path.join(root, '.cache/qa'), { recursive: true });
fs.writeFileSync(path.join(root, '.cache/qa/browser-harness.js'), bundle);
console.log('Prepared Chromium DOM harness. Graphics commands are instrumented, not GPU rendered.');

/** Offline-compatible TypeScript compiler + static module linker. No eval or runtime dependencies. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const ts = require('./compiler.cjs').loadTypeScript();
const { writeDistribution } = require('./build-common.cjs');
const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .flatMap((entry) =>
      entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)],
    );
const files = walk(path.join(root, 'src')).filter((f) => f.endsWith('.ts'));
const options = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  strict: true,
  noUnusedLocals: true,
  noUnusedParameters: true,
  noEmit: true,
  skipLibCheck: true,
  types: [],
  lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
};
const program = ts.createProgram(files, options);
const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length) {
  console.error(
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: (f) => f,
      getCurrentDirectory: () => root,
      getNewLine: () => '\n',
    }),
  );
  process.exit(1);
}
if (process.argv.includes('--check')) {
  console.log(`Strict source typecheck: ${files.length} modules passed.`);
  process.exit(0);
}
const modules = files.map((file) => {
  const id = path.relative(root, file).split(path.sep).join('/');
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    fileName: file,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      removeComments: false,
    },
  }).outputText;
  return `${JSON.stringify(id)}:function(require,module,exports){\n${output}\n}`;
});
const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
const js = `/* Battlevox ${version} · linked from strict TypeScript sources */\n(function(){'use strict';\nconst modules={${modules.join(',\n')}};\nconst cache=Object.create(null);\nfunction load(id){if(cache[id])return cache[id].exports;const factory=modules[id];if(!factory)throw Error('Missing game module: '+id);const module={exports:{}};cache[id]=module;factory(function(name){if(!name.startsWith('.'))throw Error('Unexpected external dependency: '+name);const parts=id.split('/');parts.pop();for(const p of name.split('/')){if(p==='..')parts.pop();else if(p!=='.')parts.push(p);}let key=parts.join('/');if(!key.endsWith('.ts'))key+='.ts';return load(key);},module,module.exports);return module.exports;}\nload('src/main.ts');\n})();\n`;
for (const format of ['web', 'standalone']) {
  writeDistribution(root, `dist/${format}`, js, format === 'standalone');
  console.log(`Built dist/${format}/index.html`);
}

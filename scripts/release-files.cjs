/** Only these roots belong in a public source release. Local files never enter the manifest. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { loadTypeScript } = require('./compiler.cjs');
const rootFiles = [
  '.gitignore',
  '.gitattributes',
  'LICENSE',
  'CONTRIBUTING.md',
  'README.md',
  'package.json',
  'bun.lock',
  'bunfig.toml',
  'tsconfig.json',
  'biome.json',
  'dev.ts',
  'index.html',
  'PLAY.html',
  'docs/architecture.md',
  'docs/known-limitations.md',
  'docs/playtest.md',
  'docs/validation.md',
];
const directories = {
  src: /\.(ts|css)$/,
  tests: /\.ts$/,
  scripts: /\.(ts|cts|cjs|py)$/,
};
const localDirectories = new Set([
  'node_modules',
  '__pycache__',
  'coverage',
  'playwright-report',
  'test-results',
  'saves',
  'profiles',
  'logs',
  'screenshots',
  'tmp',
  'temp',
]);
const buildFiles = [
  'dist/web/index.html',
  'dist/web/game.js',
  'dist/web/styles.css',
  'dist/standalone/index.html',
];
function releaseFiles(root) {
  const files = [...rootFiles, ...buildFiles];
  function walk(dir, pattern) {
    for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      if (entry.name.startsWith('.') || localDirectories.has(entry.name.toLowerCase())) continue;
      const file = `${dir}/${entry.name}`;
      if (entry.isSymbolicLink()) throw Error(`Release files must not be symlinks: ${file}`);
      if (entry.isDirectory()) walk(file, pattern);
      else if (pattern.test(entry.name)) files.push(file);
    }
  }
  for (const [dir, pattern] of Object.entries(directories)) walk(dir, pattern);
  for (const file of files)
    if (!fs.lstatSync(path.join(root, file)).isFile())
      throw Error(`Expected release file: ${file}`);
  return files.sort();
}
function createManifest(root) {
  return {
    version: JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version,
    compiler: loadTypeScript().version,
    files: Object.fromEntries(
      releaseFiles(root).map((file) => [
        file,
        crypto
          .createHash('sha256')
          .update(fs.readFileSync(path.join(root, file)))
          .digest('hex'),
      ]),
    ),
  };
}
module.exports = { releaseFiles, createManifest };

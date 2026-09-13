/** Rebuild only inside a scratch copy and compare every canonical output byte. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { createManifest } = require('../release-files.cjs');
const root = path.resolve(__dirname, '../..');
const recorded = JSON.parse(fs.readFileSync(path.join(root, 'RELEASE-MANIFEST.json'), 'utf8'));
assert.deepStrictEqual(
  createManifest(root),
  recorded,
  'Release manifest is stale; run bun run release',
);
const cache = path.join(root, '.cache');
fs.mkdirSync(cache, { recursive: true });
const scratch = fs.mkdtempSync(path.join(cache, 'reproducible-'));
try {
  for (const name of ['src', 'scripts', 'index.html', 'package.json', 'LICENSE'])
    fs.cpSync(path.join(root, name), path.join(scratch, name), { recursive: true });
  for (let attempt = 0; attempt < 2; attempt++) {
    const result = spawnSync(process.execPath, ['scripts/build-portable.cjs'], {
      cwd: scratch,
      encoding: 'utf8',
      env: {
        ...process.env,
        BATTLEVOX_TYPESCRIPT: path.dirname(require.resolve('typescript/package.json')),
      },
    });
    assert.equal(result.status, 0, result.stderr);
    for (const file of [
      'PLAY.html',
      'dist/web/index.html',
      'dist/web/game.js',
      'dist/web/styles.css',
      'dist/standalone/index.html',
    ])
      assert.deepStrictEqual(
        fs.readFileSync(path.join(scratch, file)),
        fs.readFileSync(path.join(root, file)),
        `${file} does not reproduce`,
      );
  }
  console.log('Manifest and two isolated rebuilds match the committed outputs.');
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}

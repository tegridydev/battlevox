/** One reproducible source -> distributions -> release checks pipeline. */
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
process.chdir(root);
function run(command, args) {
  console.log(`\n> ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
run(process.execPath, ['scripts/build-portable.cjs']);
run(process.execPath, ['--expose-gc', 'scripts/qa/test-portable.cjs']);
run(process.execPath, ['scripts/qa/artifacts.cjs']);
run(process.execPath, ['scripts/qa/server.cjs']);
if (process.argv.includes('--browser') || process.argv.includes('--require-gpu')) {
  const python = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
  run(process.execPath, ['scripts/qa/build-browser-harness.cjs']);
  run(python, ['scripts/qa/browser_fixture_test.py']);
  run(python, ['scripts/qa/browser_checks.py']);
  run(python, ['scripts/qa/screens.py']);
  run(python, [
    'scripts/qa/emitted_boot.py',
    ...(process.argv.includes('--require-gpu') ? ['--require-gpu'] : []),
  ]);
}
if (process.argv.includes('--native')) {
  run('bun', ['run', 'typecheck']);
  run('bun', ['run', 'check:style']);
  run('bun', ['run', 'check:format']);
  run('bun', ['run', 'test']);
  run('bun', ['run', 'test:smoke']);
}
const { createManifest } = require('./release-files.cjs');
fs.writeFileSync('RELEASE-MANIFEST.json', JSON.stringify(createManifest(root), null, 2) + '\n');
console.log(
  'Release build and selected checks passed. Browser/GPU/native checks run only when selected.',
);

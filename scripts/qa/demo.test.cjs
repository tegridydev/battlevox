const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { prepareDemo } = require('../demo.cjs');
test('demo builds an isolated branch, preserves staged changes, and updates without force pushes', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'battlevox-demo-test-'));
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  try {
    git('init', '-b', 'main');
    git('config', 'user.name', 'Demo test');
    git('config', 'user.email', 'test@example.invalid');
    fs.writeFileSync(path.join(root, 'source.txt'), 'source');
    git('add', 'source.txt');
    git('commit', '-m', 'Source');
    fs.writeFileSync(path.join(root, 'source.txt'), 'staged edit');
    git('add', 'source.txt');
    fs.writeFileSync(path.join(root, 'source.txt'), 'unstaged edit');
    fs.mkdirSync(path.join(root, 'dist/web'), { recursive: true });
    for (const file of ['index.html', 'game.js', 'styles.css'])
      fs.writeFileSync(path.join(root, 'dist/web', file), file);
    fs.writeFileSync(path.join(root, 'LICENSE'), 'license');
    const before = git('status', '--porcelain');
    const index = git('write-tree');
    const head = git('rev-parse', 'HEAD');
    const first = prepareDemo(root, false);
    assert.deepEqual(git('ls-tree', '-r', '--name-only', 'demo').split('\n'), [
      '.nojekyll',
      'LICENSE',
      'game.js',
      'index.html',
      'styles.css',
    ]);
    assert.equal(git('show', 'demo:index.html'), 'index.html');
    assert.equal(git('rev-list', '--count', 'demo'), '1');
    assert.equal(prepareDemo(root, false), first);
    fs.writeFileSync(path.join(root, 'dist/web/game.js'), 'updated game');
    const second = prepareDemo(root, false);
    assert.notEqual(second, first);
    assert.equal(git('rev-parse', 'demo^'), first);
    assert.equal(git('show', 'demo:game.js'), 'updated game');
    assert.equal(git('status', '--porcelain'), before);
    assert.equal(git('write-tree'), index);
    assert.equal(git('rev-parse', 'HEAD'), head);
    git('branch', '-f', 'demo', 'main');
    assert.throws(() => prepareDemo(root, false), /contains other files/);
    git('branch', '-D', 'demo');
    git('symbolic-ref', 'HEAD', 'refs/heads/demo');
    assert.throws(() => prepareDemo(root, false), /checked out/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
test('demo requires a Git clone', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'battlevox-demo-test-'));
  try {
    assert.throws(() => prepareDemo(root, false), /local Git clone/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

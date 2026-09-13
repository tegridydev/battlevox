/** Prepare a local Pages branch without changing the source checkout or contacting a remote. */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const files = ['index.html', 'game.js', 'styles.css', 'LICENSE', '.nojekyll'];
function prepareDemo(root, build = true) {
  let env = { ...process.env };
  function git(args, input, optional = false) {
    const result = spawnSync('git', args, { cwd: root, env, input, encoding: 'utf8' });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      if (optional) return null;
      throw Error(result.stderr.trim() || `Git failed: ${args[0]}`);
    }
    return result.stdout.trim();
  }
  const top = git(['rev-parse', '--show-toplevel'], undefined, true);
  if (!top || fs.realpathSync(top) !== fs.realpathSync(root))
    throw Error(
      'Run demo from the project root in a local Git clone. A ZIP extraction has no branches.',
    );
  const ref = 'refs/heads/demo';
  if (git(['worktree', 'list', '--porcelain']).split('\n').includes(`branch ${ref}`))
    throw Error(
      'The demo branch is checked out in a worktree. Switch that checkout to another branch first.',
    );
  const old = git(['rev-parse', '--verify', ref], undefined, true);
  if (old) {
    const existing = git(['ls-tree', '-r', '--name-only', old]).split('\n');
    if (existing.length !== files.length || existing.some((file) => !files.includes(file)))
      throw Error(
        'The existing demo branch contains other files. Rename it before preparing a dedicated demo branch.',
      );
  }
  // Fail before building if this clone has no commit identity configured.
  git(['var', 'GIT_AUTHOR_IDENT']);
  git(['var', 'GIT_COMMITTER_IDENT']);
  if (build) {
    const result = spawnSync(process.execPath, ['scripts/build-portable.cjs'], {
      cwd: root,
      stdio: 'inherit',
    });
    if (result.error) throw result.error;
    if (result.status !== 0) throw Error('Demo build failed. The demo branch was not changed.');
  }
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'battlevox-demo-'));
  try {
    env = { ...env, GIT_INDEX_FILE: path.join(scratch, 'index') };
    git(['read-tree', '--empty']);
    for (const file of files) {
      const data =
        file === '.nojekyll'
          ? Buffer.alloc(0)
          : fs.readFileSync(path.join(root, file === 'LICENSE' ? file : `dist/web/${file}`));
      const blob = git(['hash-object', '-w', '--stdin'], data);
      git(['update-index', '--add', '--cacheinfo', `100644,${blob},${file}`]);
    }
    const tree = git(['write-tree']);
    if (old && git(['rev-parse', `${old}^{tree}`]) === tree) {
      console.log('The local demo branch already matches this build.');
      return old;
    }
    const commit = git(
      ['commit-tree', tree, ...(old ? ['-p', old] : [])],
      'Update Battlevox demo\n',
    );
    git([
      'update-ref',
      '-m',
      'Prepare Battlevox demo',
      ref,
      commit,
      old || '0'.repeat(commit.length),
    ]);
    console.log('Prepared local demo branch. Source checkout and staging area are unchanged.');
    console.log('To publish manually: git push origin demo');
    console.log('In GitHub Pages choose Deploy from a branch, demo, /(root).');
    return commit;
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}
if (require.main === module) {
  try {
    prepareDemo(path.resolve(__dirname, '..'));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { prepareDemo };

/** Validate already built release artifacts with Node and parse5. Does not execute WebGL. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const vm = require('node:vm');
const { inlineElements } = require('./html.cjs');
const root = path.resolve(__dirname, '../..');
const results = [];
const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
async function check(name, fn) {
  try {
    await fn();
    results.push({ name, status: 'pass' });
    console.log('PASS', name);
  } catch (error) {
    results.push({ name, status: 'fail', error: error.stack });
    console.error('FAIL', name, error.message);
  }
}
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const hash = (text) => crypto.createHash('sha256').update(text).digest('base64');
async function main() {
  await check('standalone assets are self contained and no source entrypoints remain', () => {
    const html = read('dist/standalone/index.html');
    assert.ok(html.includes('BATTLEVOX') && html.includes(version));
    assert.doesNotMatch(html, /<(?:script|link)[^>]+(?:src|href)=["'](?:https?:|\.\/|\/)/i);
    assert.ok(
      !/(?:process\.env|Bun\.serve)/.test(html),
      'server runtime leaked into browser artifact',
    );
    assert.ok(
      !/<script[^>]+src=["'][^"']*\.ts["']/i.test(html),
      'uncompiled TypeScript script entrypoint',
    );
    assert.ok(html.includes('SQUAD ORDERS'));
  });
  await check('all inline scripts and styles have exact CSP hashes', async () => {
    const html = read('dist/standalone/index.html');
    const policy = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1];
    assert.ok(
      policy && policy.includes("connect-src 'none'") && policy.includes("object-src 'none'"),
    );
    const elements = await inlineElements(html);
    for (const tag of ['script', 'style']) {
      const blocks = elements[tag];
      assert.ok(blocks.length > 0);
      for (const block of blocks) assert.ok(policy.includes('sha256-' + hash(block)));
    }
    assert.ok(!/script-src[^;]*unsafe-eval/.test(policy));
  });
  await check('static page references existing local assets only', () => {
    const html = read('dist/web/index.html');
    const refs = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map((m) => m[1]);
    assert.ok(refs.length >= 2);
    for (const ref of refs) {
      assert.ok(!/^https?:|^\/\//i.test(ref));
      assert.ok(fs.existsSync(path.resolve(root, 'dist/web', ref)));
    }
  });
  await check('generated browser JavaScript parses without module loading or eval', async () => {
    const js = read('dist/web/game.js');
    new vm.Script(js, { filename: 'game.js' });
    assert.doesNotMatch(js, /\bimport\s*\(/);
    assert.doesNotMatch(js, /\beval\s*\(/);
    const html = read('dist/standalone/index.html');
    for (const script of (await inlineElements(html)).script) new vm.Script(script);
  });
  await check('playable distributions retain the project license', () => {
    const notice = read('LICENSE').trim();
    for (const file of [
      'PLAY.html',
      'dist/web/index.html',
      'dist/web/game.js',
      'dist/standalone/index.html',
    ])
      assert.ok(read(file).includes(notice), `${file}: missing license notice`);
  });
  await check('PLAY.html is identical to the included standalone build', () => {
    assert.equal(read('PLAY.html'), read('dist/standalone/index.html'));
  });
  await check('source shell has unique IDs and every literal byId reference exists', () => {
    const html = read('index.html');
    const all = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
    const ids = new Set(all);
    assert.equal(ids.size, all.length);
    const walk = (dir) =>
      fs
        .readdirSync(dir, { withFileTypes: true })
        .flatMap((e) =>
          e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
        );
    for (const file of walk(path.join(root, 'src')).filter((f) => f.endsWith('.ts')))
      for (const match of fs
        .readFileSync(file, 'utf8')
        .matchAll(/byId(?:<[^>]+>)?\(['"]([^'"]+)['"]\)/g))
        assert.ok(ids.has(match[1]), `${file}: missing ${match[1]}`);
  });
  await check('source, web and standalone have consistent release labels', () => {
    assert.match(version, /^\d+\.\d+\.\d+$/);
    for (const file of ['index.html', 'dist/web/index.html', 'dist/standalone/index.html'])
      assert.ok(read(file).includes(version));
  });
  fs.mkdirSync(path.join(root, '.cache/qa'), { recursive: true });
  fs.writeFileSync(
    path.join(root, '.cache/qa/artifact-tests.json'),
    JSON.stringify({ runner: `Node ${process.version}`, checks: results }, null, 2),
  );
  console.log(
    `ARTIFACT RESULT ${results.filter((r) => r.status === 'pass').length}/${results.length}`,
  );
  if (results.some((r) => r.status === 'fail')) process.exitCode = 1;
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

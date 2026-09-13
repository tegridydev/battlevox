/** Exercise the included server over loopback using Node builtins. No browser or GPU. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const net = require('node:net');
const { spawn, spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const results = [];
async function check(name, fn) {
  try {
    await fn();
    results.push({ name, status: 'pass' });
    console.log('PASS', name);
  } catch (e) {
    results.push({ name, status: 'fail', error: e.stack });
    console.error('FAIL', name, e.message);
  }
}
async function main() {
  const probe = net.createServer();
  await new Promise((resolve, reject) => {
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', resolve);
  });
  const port = probe.address().port;
  await new Promise((resolve) => probe.close(resolve));
  const child = spawn(process.execPath, ['scripts/serve.cjs'], {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  child.stdout.on('data', (b) => {
    log += b;
  });
  child.stderr.on('data', (b) => {
    log += b;
  });
  const request = (pathname, method = 'GET') =>
    new Promise((resolve, reject) => {
      const req = http.request({ host: '127.0.0.1', port, path: pathname, method }, (res) => {
        const chunks = [];
        res.on('data', (b) => chunks.push(b));
        res.on('end', () =>
          resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }),
        );
      });
      req.setTimeout(5000, () => req.destroy(new Error('Request timeout')));
      req.on('error', reject);
      req.end();
    });
  try {
    for (let i = 0; i < 100 && !log.includes('Open http:'); i++)
      await new Promise((resolve) => setTimeout(resolve, 25));
    assert.ok(log.includes('Open http:'), `Server failed to become ready: ${log}`);
    await check('loopback index returns the exact static HTML and safe headers', async () => {
      const r = await request('/');
      assert.equal(r.status, 200);
      assert.equal(
        r.body.toString(),
        fs.readFileSync(path.join(root, 'dist/web/index.html'), 'utf8'),
      );
      assert.equal(r.headers['x-content-type-options'], 'nosniff');
      assert.equal(r.headers['cache-control'], 'no-store');
    });
    await check('JavaScript and stylesheet return exact release bytes and MIME types', async () => {
      for (const [file, mime] of [
        ['game.js', 'text/javascript'],
        ['styles.css', 'text/css'],
      ]) {
        const r = await request('/' + file);
        assert.equal(r.status, 200);
        assert.ok(r.headers['content-type'].startsWith(mime));
        assert.deepEqual(r.body, fs.readFileSync(path.join(root, 'dist/web', file)));
      }
    });
    await check('HEAD advertises full size without transmitting a body', async () => {
      const r = await request('/game.js', 'HEAD');
      assert.equal(r.status, 200);
      assert.equal(r.body.length, 0);
      assert.equal(
        Number(r.headers['content-length']),
        fs.statSync(path.join(root, 'dist/web/game.js')).size,
      );
    });
    await check('missing files return 404 and unsupported methods return 405', async () => {
      assert.equal((await request('/missing-file')).status, 404);
      assert.equal((await request('/', 'POST')).status, 405);
    });
    await check('encoded traversal and malformed paths cannot read outside dist/web', async () => {
      for (const p of ['/%2e%2e%2f%2e%2e%2fpackage.json', '/%00', '/%5cpackage.json', '/%ZZ']) {
        const r = await request(p);
        assert.ok(r.status >= 400, `${p}: ${r.status}`);
        assert.ok(!r.body.toString().includes('devDependencies'));
      }
    });
    await check('invalid port configuration exits with a useful error', async () => {
      const r = spawnSync(process.execPath, ['scripts/serve.cjs'], {
        cwd: root,
        env: { ...process.env, PORT: '0' },
        encoding: 'utf8',
        timeout: 5000,
      });
      assert.equal(r.status, 1);
      assert.match(r.stderr, /PORT must be/);
    });
  } finally {
    child.kill('SIGTERM');
    await Promise.race([
      new Promise((resolve) => child.once('exit', resolve)),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
    if (child.exitCode === null) child.kill('SIGKILL');
  }
  fs.mkdirSync(path.join(root, '.cache/qa'), { recursive: true });
  fs.writeFileSync(
    path.join(root, '.cache/qa/server-tests.json'),
    JSON.stringify(
      { runner: `Node ${process.version} / real loopback HTTP`, checks: results },
      null,
      2,
    ),
  );
  console.log(
    `SERVER RESULT ${results.filter((r) => r.status === 'pass').length}/${results.length}`,
  );
  if (results.some((r) => r.status === 'fail')) process.exitCode = 1;
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

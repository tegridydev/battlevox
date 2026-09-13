/** Runs the existing Bun test callbacks under Node with a deliberately small assertion adapter.
 * This is not Bun, and does not validate Bun's runner or runtime-specific build/dev-server APIs.
 */
const fs = require('node:fs'),
  path = require('node:path'),
  Module = require('node:module'),
  assert = require('node:assert/strict'),
  crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
process.chdir(root);
const ts = require('../compiler.cjs').loadTypeScript();
Module._extensions['.ts'] = (m, file) =>
  m._compile(
    ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      fileName: file,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText,
    file,
  );
const tests = [],
  before = [];
let group = '';
const test = (name, fn, timeout = 30000) => {
  if (
    !process.env.BATTLEVOX_TEST_FILTER ||
    (group + name).includes(process.env.BATTLEVOX_TEST_FILTER)
  )
    tests.push({ name: group + name, fn, timeout });
};
function expect(actual, not = false) {
  const check = (value, label) => assert.ok(not ? !value : value, (not ? 'NOT ' : '') + label);
  return {
    get not() {
      return expect(actual, !not);
    },
    get rejects() {
      return {
        toThrow: async (match) =>
          assert.rejects(actual, typeof match === 'string' ? new RegExp(match) : match),
      };
    },
    toBe: (x) =>
      check(Object.is(actual, x), 'expected ' + String(x) + '; received ' + String(actual)),
    toEqual: (x) => check(require('node:util').isDeepStrictEqual(actual, x), 'toEqual'),
    toBeCloseTo: (x, n = 2) =>
      check(Math.abs(actual - x) < 0.5 * 10 ** -n, `${actual} close to ${x}`),
    toBeGreaterThan: (x) => check(actual > x, `${actual} > ${x}`),
    toBeGreaterThanOrEqual: (x) => check(actual >= x, `${actual} >= ${x}`),
    toBeLessThan: (x) => check(actual < x, `${actual} < ${x}`),
    toBeLessThanOrEqual: (x) => check(actual <= x, `${actual} <= ${x}`),
    toBeNull: () => check(actual === null, 'toBeNull'),
    toBeUndefined: () => check(actual === undefined, 'toBeUndefined'),
    toContain: (x) => check(actual.includes(x), 'toContain ' + String(x)),
    toHaveLength: (x) => check(actual.length === x, `length ${actual.length} = ${x}`),
    toMatch: (x) => check(x.test(actual), 'toMatch ' + String(x)),
    toThrow: (x) => {
      let error;
      try {
        actual();
      } catch (e) {
        error = e;
      }
      check(
        !!error &&
          (!x || (x instanceof RegExp ? x.test(error.message) : error.message.includes(String(x)))),
        'toThrow',
      );
    },
    toHaveBeenCalledTimes: (x) => check(actual.mock.calls.length === x, 'calls ' + x),
  };
}
function spyOn(obj, key) {
  const original = obj[key];
  let implementation = original;
  const wrapper = function (...args) {
    wrapper.mock.calls.push(args);
    return implementation.apply(this, args);
  };
  wrapper.mock = { calls: [] };
  wrapper.mockImplementation = (fn) => {
    implementation = fn;
    return wrapper;
  };
  wrapper.mockRestore = () => {
    obj[key] = original;
  };
  obj[key] = wrapper;
  return wrapper;
}
const adapter = {
  test,
  it: test,
  expect,
  spyOn,
  describe: (name, fn) => {
    let old = group;
    group += name + ' / ';
    fn();
    group = old;
  },
  beforeAll: (fn) => before.push(fn),
};
const load = Module._load;
Module._load = function (id, ...args) {
  if (id === 'bun:test') return adapter;
  return load.call(this, id, ...args);
};
global.Bun = {
  CryptoHasher: class {
    constructor(algorithm) {
      this.hash = crypto.createHash(algorithm);
    }
    update(data) {
      this.hash.update(data);
      return this;
    }
    digest(format) {
      return this.hash.digest(format);
    }
  },
  file: (file) => ({
    text: () => fs.promises.readFile(file, 'utf8'),
    exists: async () => fs.existsSync(file),
  }),
};
const explicit = process.argv.slice(2);
const files = explicit.length
  ? explicit
  : [
      ...fs
        .readdirSync('tests/unit')
        .filter((f) => f.endsWith('.test.ts'))
        .map((f) => 'tests/unit/' + f),
      ...fs
        .readdirSync('tests/integration')
        .filter(
          (f) =>
            f.endsWith('.test.ts') &&
            ![
              'ui.test.ts',
              'career-ui.test.ts',
              'ui-060.test.ts',
              'ui-061.test.ts',
              'polish-ui.test.ts',
            ].includes(f),
        )
        .map((f) => 'tests/integration/' + f),
    ];
const reportPath = process.env.BATTLEVOX_TEST_REPORT || '.cache/qa/portable-tests.json';
// Each file has its own process, module state and hard watchdog. Timer promises alone
// cannot interrupt a synchronous loop; the parent must own that boundary.
if (!process.env.BATTLEVOX_TEST_CHILD) {
  const { spawnSync } = require('node:child_process');
  const results = [];
  fs.mkdirSync('.cache/qa', { recursive: true });
  for (let i = 0; i < files.length; i++) {
    const childReport = path.resolve(root, `.cache/qa/test-file-${i}.json`);
    try {
      fs.unlinkSync(childReport);
    } catch {}
    const child = spawnSync(process.execPath, ['--expose-gc', __filename, files[i]], {
      cwd: root,
      encoding: 'utf8',
      timeout: Number(process.env.BATTLEVOX_FILE_TIMEOUT) || 180000,
      maxBuffer: 16 * 1024 * 1024,
      env: { ...process.env, BATTLEVOX_TEST_CHILD: '1', BATTLEVOX_TEST_REPORT: childReport },
    });
    process.stdout.write(child.stdout || '');
    process.stderr.write(child.stderr || '');
    if (fs.existsSync(childReport))
      results.push(
        ...JSON.parse(fs.readFileSync(childReport, 'utf8')).results.map((v) => ({
          ...v,
          file: files[i],
        })),
      );
    if (child.status !== 0 && !results.some((v) => v.file === files[i] && v.status === 'fail'))
      results.push({
        name: files[i],
        file: files[i],
        status: 'fail',
        error: child.error?.message || `Runner exited ${child.status} (${child.signal})`,
      });
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          runner: `Node ${process.version}, isolated Bun assertion adapter (not native Bun)`,
          passed: results.filter((v) => v.status === 'pass').length,
          failed: results.filter((v) => v.status === 'fail').length,
          results,
        },
        null,
        2,
      ),
    );
  }
  const failed = results.filter((v) => v.status === 'fail').length;
  console.log(`PORTABLE SUITE: ${results.length - failed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}
for (const file of files) require(path.resolve(root, file));
(async () => {
  for (const fn of before) await fn();
  const results = [];
  for (const t of tests) {
    global.gc?.();
    const start = Date.now();
    let timer;
    try {
      // This catches asynchronous hangs; synchronous overrun is checked explicitly below.
      await Promise.race([
        Promise.resolve().then(() => t.fn()),
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(Error(`Test exceeded ${t.timeout} ms`)), t.timeout);
        }),
      ]);
      const ms = Date.now() - start;
      if (ms > t.timeout) throw Error(`Synchronous test exceeded ${t.timeout} ms (${ms} ms)`);
      results.push({ name: t.name, status: 'pass', ms });
      console.log('PASS', ms + 'ms', t.name);
    } catch (e) {
      results.push({ name: t.name, status: 'fail', ms: Date.now() - start, error: e.stack });
      console.error('FAIL', t.name, '\n', e.stack);
    } finally {
      clearTimeout(timer);
    }
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          runner: `Node ${process.version} / Bun assertion adapter`,
          passed: results.filter((v) => v.status === 'pass').length,
          failed: results.filter((v) => v.status === 'fail').length,
          results,
        },
        null,
        2,
      ),
    );
  }
  if (!results.length)
    fs.writeFileSync(reportPath, JSON.stringify({ passed: 0, failed: 0, results }));
  const failed = results.filter((v) => v.status === 'fail').length;
  process.exitCode = failed ? 1 : 0;
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

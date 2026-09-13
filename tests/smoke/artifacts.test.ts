import { beforeAll, expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { inlineElements } from '../../scripts/qa/html.cjs';

const artifactRoot = process.env.BATTLEVOX_ARTIFACT_ROOT ?? '.cache/artifact-smoke';
beforeAll(async () => {
  for (const format of ['web', 'standalone']) {
    const process = Bun.spawn(
      [
        'bun',
        'scripts/build.ts',
        ...(format === 'standalone' ? ['--standalone'] : []),
        '--outdir',
        `${artifactRoot}/${format}`,
      ],
      { stdout: 'ignore', stderr: 'inherit' },
    );
    if ((await process.exited) !== 0) throw Error(`Failed fresh ${format} build`);
  }
});
test('standalone contains all assets and valid CSP hashes', async () => {
  const html = await Bun.file(`${artifactRoot}/standalone/index.html`).text();
  expect(html).toContain('Content-Security-Policy');
  expect(html).toContain('SQUAD ORDERS');
  expect(html).not.toMatch(/<(?:script|link)[^>]+(?:src|href)=["'](?:https?:|\.\/|\/)/);
  const scripts = (await inlineElements(html)).script;
  expect(scripts.length).toBeGreaterThan(0);
  for (const script of scripts) {
    expect(html).toContain(`sha256-${createHash('sha256').update(script).digest('base64')}`);
    expect(script).not.toMatch(/\bimport\s*\(/);
  }
  expect(html).not.toContain('process.env');
  expect(html).not.toContain('Bun.serve');
  expect(html).not.toContain('localhost:');
});
test('static game references existing local build assets', async () => {
  const html = await Bun.file(`${artifactRoot}/web/index.html`).text();
  const refs = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map((m) => m[1]);
  expect(refs.length).toBeGreaterThan(0);
  for (const ref of refs) {
    expect(ref).not.toMatch(/^https?:/);
    expect(
      await Bun.file(`${artifactRoot}/web/${ref.replace(/^\.\//, '').replace(/^\//, '')}`).exists(),
    ).toBe(true);
  }
});
test('Bun can bundle the dev entrypoint without executing it or opening a socket', async () => {
  // Isolate HTML compilation from the test-runner module loader.
  // This compiles the launcher; it never executes the emitted server bundle.
  const compiler = Bun.spawn(
    ['bun', 'build', 'dev.ts', '--target=bun', '--root', '.', '--outdir', '.cache/dev-check'],
    { stdout: 'pipe', stderr: 'pipe' },
  );
  const [exitCode, errors] = await Promise.all([
    compiler.exited,
    new Response(compiler.stderr).text(),
  ]);
  expect(errors).not.toContain('error:');
  expect(exitCode).toBe(0);
  expect(await Bun.file('.cache/dev-check/dev.js').exists()).toBe(true);
});

import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeDistribution } from '../../scripts/build-common.cjs';
import { inlineElements } from '../../scripts/qa/html.cjs';

test('shared packaging rejects missing entrypoints and output escapes before replacing files', () => {
  const root = mkdtempSync(join(tmpdir(), 'battlevox-packaging-'));
  try {
    mkdirSync(join(root, 'src/ui'), { recursive: true });
    mkdirSync(join(root, 'dist/web'), { recursive: true });
    writeFileSync(join(root, 'LICENSE'), 'MIT License');
    writeFileSync(join(root, 'src/ui/styles.css'), 'body { color: white; }');
    writeFileSync(
      join(root, 'index.html'),
      '<!doctype html><html><head></head><body></body></html>',
    );
    writeFileSync(join(root, 'dist/web/index.html'), 'previous build');
    expect(() => writeDistribution(root, 'dist/web', '', false)).toThrow('exactly one');
    expect(readFileSync(join(root, 'dist/web/index.html'), 'utf8')).toBe('previous build');
    expect(() => writeDistribution(root, '../outside', '', false)).toThrow(
      'inside dist/ or .cache/',
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('shared standalone packaging escapes script terminators and hashes final inline bytes', async () => {
  const root = mkdtempSync(join(tmpdir(), 'battlevox-packaging-'));
  try {
    mkdirSync(join(root, 'src/ui'), { recursive: true });
    writeFileSync(join(root, 'LICENSE'), 'MIT License');
    writeFileSync(join(root, 'src/ui/styles.css'), 'body { color: white; }');
    writeFileSync(
      join(root, 'index.html'),
      '<!doctype html><html><head><link rel="stylesheet" href="./src/ui/styles.css"></head><body><script type="module" src="./src/main.ts">\n</script></body></html>',
    );
    writeDistribution(root, 'dist/standalone', 'const value = "</script>";', true);
    const html = readFileSync(join(root, 'PLAY.html'), 'utf8');
    const scripts = (await inlineElements(html)).script;
    expect(scripts).toHaveLength(1);
    expect(scripts[0]).toContain('<\\/script>');
    expect(html).toContain('sha256-' + createHash('sha256').update(scripts[0]).digest('base64'));
    expect(html).toBe(readFileSync(join(root, 'dist/standalone/index.html'), 'utf8'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

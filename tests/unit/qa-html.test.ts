import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { runInNewContext } from 'node:vm';
import { inlineElements } from '../../scripts/qa/html.cjs';
import { javascriptString } from '../../scripts/qa/javascript-literal.cjs';

test('artifact parser handles browser tag syntax and preserves inline source bytes', async () => {
  const source = '\r\n const value = "<\\/script>&amp;";\t\n';
  const html = `<!doctype html><!-- <script>ignored</script> --!>
    <ScRiPt data-value=">">${source}</sCrIpT extra="value">
    <style data-value='>'>\r\nbody { color: red; }\n</style >
    <script>second();</script>`;
  const blocks = await inlineElements(html);
  expect(blocks.script).toEqual([source, 'second();']);
  expect(blocks.style).toEqual(['\r\nbody { color: red; }\n']);
  const hash = (text: string) => createHash('sha256').update(text).digest('base64');
  expect(hash(blocks.script[0])).toBe(hash(source));
  const changed = await inlineElements(html.replace('const value', 'const changed'));
  expect(hash(changed.script[0])).not.toBe(hash(source));
});

test('artifact parser includes template blocks and rejects unterminated raw text', async () => {
  expect(await inlineElements('<p>No inline assets</p>')).toEqual({ script: [], style: [] });
  expect((await inlineElements('<template><script>x();</script></template>')).script).toEqual([
    'x();',
  ]);
  for (const tag of ['script', 'style']) {
    await expect(inlineElements(`<${tag}>unfinished`)).rejects.toThrow('Missing closing tag');
  }
});

test('harness module IDs round-trip without escaping the JavaScript or HTML context', async () => {
  const id = 'test/"\\\n</script><script>globalThis.injected=true</script>\u2028\u2029.ts';
  const literal = javascriptString(id);
  expect(literal).not.toMatch(/[<>\u2028\u2029]/);
  const source = `globalThis.modules = {[${literal}]: function () { return 42; }};`;
  const scripts = (await inlineElements(`<script>${source}</script>`)).script;
  expect(scripts).toEqual([source]);
  const context: { modules?: Record<string, () => number>; injected?: boolean } = {};
  runInNewContext(scripts[0], context);
  expect(Object.keys(context.modules ?? {})).toEqual([id]);
  expect(context.modules?.[id]()).toBe(42);
  expect(context.injected).toBeUndefined();
});

import { resolve } from 'node:path';
import { writeDistribution } from './build-common.cjs';

const standalone = process.argv.includes('--standalone');
const index = process.argv.indexOf('--outdir');
const outdir = index >= 0 ? process.argv[index + 1] : standalone ? 'dist/standalone' : 'dist/web';
if (!outdir) throw Error('--outdir requires a directory');
const result = await Bun.build({
  entrypoints: ['./src/main.ts'],
  target: 'browser',
  format: 'iife',
  minify: true,
  sourcemap: 'none',
  env: 'disable',
});
if (!result.success) throw new AggregateError(result.logs, 'Game bundle failed');
const asset = result.outputs.find((o) => o.path.endsWith('.js')) ?? result.outputs[0];
if (!asset) throw Error('Compiler did not produce a JavaScript bundle');
const js = await asset.text();
writeDistribution(resolve('.'), outdir, js, standalone);
console.log(`Built ${standalone ? 'standalone' : 'web'} game in ${outdir}`);

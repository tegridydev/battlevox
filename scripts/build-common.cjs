/** Shared packaging for the portable TypeScript and native Bun compilers. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function secureHTML(html) {
  const hashes = (tag) =>
    [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi'))]
      .filter((match) => match[1].trim())
      .map((match) => `'sha256-${crypto.createHash('sha256').update(match[1]).digest('base64')}'`);
  const policy = [
    "default-src 'none'",
    `script-src 'self' ${hashes('script').join(' ')}`,
    `style-src 'self' ${hashes('style').join(' ')}`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data:",
    "connect-src 'none'",
    "base-uri 'none'",
    "object-src 'none'",
    "form-action 'none'",
  ].join('; ');
  if (!/<head>/i.test(html)) throw Error('HTML shell is missing <head>');
  return html.replace(
    /<head>/i,
    `<head><meta http-equiv="Content-Security-Policy" content="${policy}"><meta name="referrer" content="no-referrer">`,
  );
}

function writeDistribution(root, outdir, js, standalone) {
  const target = path.resolve(root, outdir);
  if (
    !['dist', '.cache'].some((dir) => {
      const child = path.relative(path.resolve(root, dir), target);
      return (
        child && child !== '..' && !child.startsWith('..' + path.sep) && !path.isAbsolute(child)
      );
    })
  )
    throw Error('Build output must be inside dist/ or .cache/');
  const license = fs.readFileSync(path.join(root, 'LICENSE'), 'utf8').trim();
  js = `/*!\n${license}\n*/\n${js}`;
  const css = fs.readFileSync(path.join(root, 'src/ui/styles.css'), 'utf8');
  let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const style = /<link[^>]+href="\.\/src\/ui\/styles\.css"[^>]*>/g;
  const script = /<script[^>]+src="\.\/src\/main\.ts"[^>]*>\s*<\/script>/g;
  if ([...html.matchAll(style)].length !== 1 || [...html.matchAll(script)].length !== 1)
    throw Error('Expected exactly one stylesheet and TypeScript entrypoint');
  html = html
    .replace(style, () =>
      standalone ? `<style>${css}</style>` : '<link rel="stylesheet" href="./styles.css">',
    )
    .replace(script, () =>
      standalone
        ? `<script>${js.replace(/<\/script/gi, '<\\/script')}</script>`
        : '<script defer src="./game.js"></script>',
    );
  html = html.replace(/<!doctype html>/i, (doctype) => `${doctype}\n<!--\n${license}\n-->`);
  const secured = secureHTML(html);
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });
  if (!standalone) {
    fs.writeFileSync(path.join(target, 'game.js'), js);
    fs.writeFileSync(path.join(target, 'styles.css'), css);
  }
  fs.writeFileSync(path.join(target, 'index.html'), secured);
  if (standalone && target === path.join(root, 'dist/standalone'))
    fs.writeFileSync(path.join(root, 'PLAY.html'), secured);
}
module.exports = { secureHTML, writeDistribution };

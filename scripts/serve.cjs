/** Serve the included static build on loopback only. No packages, writes, or browser opener. */
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const { version } = require('../package.json');
const root = path.resolve(__dirname, '../dist/web');
const value = process.env.PORT ?? '8787';
if (!/^\d+$/.test(value) || Number(value) < 1024 || Number(value) > 65535) {
  console.error('PORT must be an integer between 1024 and 65535.');
  process.exit(1);
}
const port = Number(value);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};
const server = http.createServer(async (request, response) => {
  const reply = (status, body) => {
    response.writeHead(status, {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  };
  if (!['GET', 'HEAD'].includes(request.method ?? '')) return reply(405, 'Method not allowed');
  try {
    const url = new URL(request.url ?? '/', `http://127.0.0.1:${port}`);
    const pathname = decodeURIComponent(url.pathname);
    if (pathname.includes('\0') || pathname.includes('\\')) return reply(400, 'Invalid path');
    const filename = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!filename.startsWith(root + path.sep)) return reply(403, 'Forbidden');
    const real = await fs.realpath(filename);
    if (!real.startsWith(root + path.sep)) return reply(403, 'Forbidden');
    const data = await fs.readFile(real);
    response.writeHead(200, {
      'Content-Type': types[path.extname(real)] ?? 'application/octet-stream',
      'Content-Length': data.length,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Cache-Control': 'no-store',
    });
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch (error) {
    reply(
      error.code === 'ENOENT' || error.code === 'EISDIR' ? 404 : 400,
      'Not found or invalid path',
    );
  }
});
server.on('error', (error) => {
  console.error(`Unable to serve Battlevox: ${error.message}`);
  process.exitCode = 1;
});
fs.access(path.join(root, 'index.html'))
  .then(() => {
    server.listen(port, '127.0.0.1', () =>
      console.log(
        `Battlevox v${version}\nOpen http://127.0.0.1:${port}/\nPress Ctrl+C to stop. Saves belong to this browser and origin.`,
      ),
    );
  })
  .catch(() => {
    console.error('dist/web/index.html is missing. Extract the full release or build it first.');
    process.exitCode = 1;
  });
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close());

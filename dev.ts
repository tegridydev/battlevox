import page from './index.html';
import { browserCommand, launch, parsePort } from './scripts/launcher';

try {
  const server = await launch(
    {
      start(port) {
        const instance = Bun.serve({
          hostname: '127.0.0.1',
          port,
          development: { hmr: true, console: true },
          routes: { '/': page },
          fetch() {
            return new Response('Not found', {
              status: 404,
              headers: { 'X-Content-Type-Options': 'nosniff' },
            });
          },
        });
        return {
          url: new URL(`http://127.0.0.1:${instance.port}/`),
          stop() {
            void instance.stop(true);
          },
        };
      },
      async ready(url) {
        const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
        return response.ok && (await response.text()).includes('Battlevox');
      },
      async open(url) {
        const child = Bun.spawn(browserCommand(process.platform, url), {
          stdin: 'ignore',
          stdout: 'ignore',
          stderr: 'ignore',
        });
        if ((await child.exited) !== 0) throw Error('Browser opener failed');
      },
      log: console.log,
      delay: (ms) => Bun.sleep(ms),
    },
    parsePort(process.env.PORT),
  );
  for (const signal of ['SIGINT', 'SIGTERM'] as const)
    process.once(signal, () => {
      server.stop();
      process.exit(0);
    });
} catch (e) {
  console.error(
    `Unable to start Battlevox: ${e instanceof Error ? e.message : String(e)}\nIf port 3000 is occupied, use PORT=3001 bun run dev.`,
  );
  process.exitCode = 1;
}

export interface ServerHandle {
  url: URL;
  stop(): void;
}
export interface LauncherPorts {
  start(port: number): ServerHandle;
  ready(url: URL): Promise<boolean>;
  open(url: URL): Promise<void>;
  log(message: string): void;
  delay(ms: number): Promise<void>;
}
export function parsePort(raw: string | undefined) {
  if (raw === undefined) return 3000;
  if (!/^\d+$/.test(raw)) throw Error('PORT must be an integer from 1024 to 65535');
  const port = Number(raw);
  if (port < 1024 || port > 65535) throw Error('PORT must be an integer from 1024 to 65535');
  return port;
}
export function browserCommand(platform: string, url: URL): string[] {
  if (url.hostname !== '127.0.0.1' || url.protocol !== 'http:')
    throw Error('Only local development URLs may be opened');
  if (platform === 'darwin') return ['open', url.href];
  if (platform === 'win32') return ['rundll32.exe', 'url.dll,FileProtocolHandler', url.href];
  return ['xdg-open', url.href];
}
export async function launch(ports: LauncherPorts, port = 3000) {
  const server = ports.start(port);
  let ready = false;
  try {
    for (let attempt = 0; attempt < 100; attempt++) {
      try {
        ready = await ports.ready(server.url);
      } catch {}
      if (ready) break;
      await ports.delay(100);
    }
    if (!ready) throw Error('Game did not become ready within 10 seconds');
  } catch (e) {
    server.stop();
    throw e;
  }
  ports.log(
    `Battlevox ready at ${server.url.href}\nPress Ctrl+C to stop. Code changes reload the page and reset the match.`,
  );
  try {
    await ports.open(server.url);
  } catch {
    ports.log(`Browser could not be opened. Open ${server.url.href} manually.`);
  }
  return server;
}

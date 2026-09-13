import { expect, test } from 'bun:test';
import { browserCommand, type LauncherPorts, launch, parsePort } from '../../scripts/launcher';

function ports() {
  const state = { starts: 0, stops: 0, opens: 0, checks: 0, messages: [] as string[] };
  const adapter: LauncherPorts = {
    start() {
      state.starts++;
      return {
        url: new URL('http://127.0.0.1:3000/'),
        stop() {
          state.stops++;
        },
      };
    },
    async ready() {
      return ++state.checks >= 2;
    },
    async open() {
      state.opens++;
    },
    log(message) {
      state.messages.push(message);
    },
    async delay() {},
  };
  return { state, adapter };
}
test('launcher opens browser exactly once after readiness', async () => {
  const { state, adapter } = ports();
  const server = await launch(adapter);
  expect(state.starts).toBe(1);
  expect(state.checks).toBe(2);
  expect(state.opens).toBe(1);
  server.stop();
  expect(state.stops).toBe(1);
});
test('launcher stops after readiness failure without opening browser', async () => {
  const { state, adapter } = ports();
  adapter.ready = async () => false;
  await expect(launch(adapter)).rejects.toThrow('ready');
  expect(state.stops).toBe(1);
  expect(state.opens).toBe(0);
});
test('opener failure leaves ready server available with manual URL', async () => {
  const { state, adapter } = ports();
  adapter.open = async () => {
    throw Error('missing opener');
  };
  await launch(adapter);
  expect(state.stops).toBe(0);
  expect(state.messages.at(-1)).toContain('manually');
});
test('port and browser launcher reject unsafe arguments', () => {
  expect(parsePort(undefined)).toBe(3000);
  expect(parsePort('3001')).toBe(3001);
  for (const p of ['0', '1.2', '65536', '3000;open', 'NaN']) expect(() => parsePort(p)).toThrow();
  expect(browserCommand('darwin', new URL('http://127.0.0.1:3000/'))).toEqual([
    'open',
    'http://127.0.0.1:3000/',
  ]);
  expect(() => browserCommand('darwin', new URL('https://evil.example'))).toThrow();
});

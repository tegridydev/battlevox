# Checks

The release checks cover source types, formatting, gameplay, saves, build output, the local server and browser layouts.

## Run the checks

```sh
bun install --frozen-lockfile
bun run verify
node scripts/release.cjs --browser --native --require-gpu
bun run check:release
bun audit
```

Use Bun 1.3.9 and the dependency versions in the lockfile. Browser setup is in the [README](../README.md).

The last full check passed 242 native unit and integration tests, five smoke tests and 218 portable regressions. The browser checks passed 25 interaction and rendering cases, 18 page layouts, 54 UI surfaces and 432 detailed layout cases. Both startup checks passed, including a real WebGL 2 context. All eight artifact checks and six HTTP checks passed. The dependency audit reported no known vulnerabilities.

After updating the default settings, all 244 native unit and integration tests and five smoke tests passed. A fresh browser also confirmed all thirteen match and display defaults against the reference screenshots, with no uncaught errors. Existing saved preferences remain supported.

The build check recreates the playable files twice in a separate source copy and compares every byte. The release manifest also checks the public file hashes.

## What the results mean

The native tests use Bun. The portable tests run through a small Node adapter and cover the parts that do not need a DOM. Chromium runs the browser interactions and layout checks.

The browser fixture records graphics commands. The separate startup check opens the actual generated game and requires WebGL 2 when requested. Neither is a substitute for playing a full match on the target hardware.

`bun run benchmark` advances each scenario for sixty seconds and reports simulation timings. Rendering is excluded. Work budgets and battle outcomes can vary, so use those results to investigate performance rather than claim a fixed FPS.

The optional EGL check needs system GLES libraries. It was unavailable during the last checks and is not counted as passing.

## Release contents

Saves and personal profiles are not distributed. Local caches, logs, screenshots, browser data and temporary test reports are also excluded. Generated test fixtures stay in the source tests and are not loaded as player progress.

A browser that has played Battlevox before can still load its own existing save. That data belongs to the browser, not the downloaded files.

Use the [playtest checklist](playtest.md) for audio, mouse capture, hardware rendering, text scaling and long sessions.

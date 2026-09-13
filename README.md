# Battlevox | v0.6.1

Battlevox is currently an opensource single player voxel FPS. It has squad AI, a destructible city and local progression. It runs in your browser with no accounts, tracking or game downloads after you open it.

## Play

Open [PLAY.html](PLAY.html) in a browser with WebGL 2 and hardware acceleration. Everything needed to play is in that file, including the textures and audio.

You can also serve the included web build with Node 20 or later:

```sh
node scripts/serve.cjs
```

Open http://127.0.0.1:8787. Set `PORT` if you need a different port. This server only accepts connections from your own machine.

Civic Frontline starts with 60 soldiers on each team and Engineer selected. Metropolis uses the full city and supports up to 500 soldiers per team. Hold sectors, drain the other team's reserves or finish with more control when time runs out.

## Controls

* **W A S D:** Move. **Shift:** Sprint. **Space:** Jump or mantle. **C:** Crouch.
* **Mouse:** Look. **Left click:** Fire. **Right click:** Aim.
* **1, 2, 3:** Primary weapon, sidearm and class equipment.
* **Q or mouse wheel:** Change weapons. **X or wheel while aiming:** Change scope magnification.
* **R:** Reload. **G:** Frag grenade. **4:** Smoke grenade.
* **E:** Use a vehicle or lift. **Shift + E:** Take a lift down.
* **F:** Class ability. **H:** Self aid. **V:** Engineer tool. **Z:** Spot.
* **B:** Squad orders. **M or T:** Tactical map. **Tab:** Scoreboard.
* **Escape:** Pause or close a menu. **F2:** Field lab.

Touch controls and hold or toggle aim are in Settings. Engineers carry the launcher in slot 3. Other classes use their ability there. Class and sidearm changes take effect when you deploy.

Deployment, the map and squad orders stay live during a battle. The main menus and field lab pause the game.

## Classes

Medics heal and revive. Support supplies ammo. Engineers repair and build cover. Recon spots targets.

Supply bags need a valid floor and a clear path to the person using them. Smoke blocks sight, but bullets and blast damage still pass through. Friendly bases and uncontested friendly sectors refill reserves after six seconds without a recent hit. You still need to reload your weapon.

## Saves

The download does not include a player save or personal profile. Progress is created in your own browser when you play.

XP, mastery, assignments, ribbons and the last forty completed operations are saved locally. Use **Barracks → Save** to export a backup or recover a checkpoint. Export before clearing browser data or changing how you open the game.

## Working on the game

Use Bun 1.3.9 and install the packages from the lockfile:

```sh
bun install --frozen-lockfile
bun run dev
```

The development server opens http://127.0.0.1:3000. Code changes reload the page and reset the match.

```sh
bun run check
bun run test
bun run test:smoke
bun run build
```

These commands check the source, run the tests and build the playable files. `bun run verify` runs the main checks together. `bun run release` also writes the release manifest, and `bun run check:release` checks that the builds can be reproduced.

For the browser checks:

```sh
python3 -m pip install playwright==1.57.0
python3 -m playwright install --with-deps chromium
node scripts/release.cjs --browser --native
```

`PYTHON` selects the Python executable. `CHROMIUM_PATH` can point to a different Chromium installation. Add `--require-gpu` to require WebGL 2 during startup.

`bun run benchmark` measures simulation time without rendering. It is not an FPS test. The optional `bun run test:shaders:egl` needs EGL and GLES libraries on Linux.

The source is split into core data, world generation, simulation, rendering, platform support and UI under `src/`. Builds are in `dist/web` and `dist/standalone`.

See [contributing](CONTRIBUTING.md), [architecture](docs/architecture.md), [checks](docs/validation.md), [limits](docs/known-limitations.md) and [playtesting](docs/playtest.md).

## License

MIT, ~2026 tegridydev. See [LICENSE](LICENSE). Development packages keep their own licenses. The game does not need runtime libraries.

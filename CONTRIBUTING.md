# Contributing

Use Bun 1.3.9 and run `bun install --frozen-lockfile` before working on the source.

Make changes in `src/` and `index.html`. Build the playable files from that source. Keep existing saves compatible and preserve the cleanup and cancellation behaviour described in [architecture](docs/architecture.md).

For bug fixes, add a test that catches the problem. Keep older regression tests even if their names mention an earlier version. Keep gameplay changes easy to review separately from code cleanup.

Before submitting a change, run:

```sh
bun run format
bun run verify
node scripts/release.cjs --browser --native
bun run check:release
bun audit
```

The browser checks need Python, Playwright and Chromium. Setup is in the [README](README.md).

## Building a release

`bun run release` rebuilds `PLAY.html`, both distributions and `RELEASE-MANIFEST.json`. Include those files with the source changes. Run the release command again if you change a file listed in the manifest.

The manifest lists the public files and their SHA256 hashes. Local packages, caches, browser data, environment files and test output do not belong in the upload.

For a manual upload, run:

```sh
bun run package:public
```

This creates a clean source folder and ZIP under `.cache/public-release`. It copies only the manifest's files and replaces the previous extracted folder, so local leftovers are not carried forward. ZIP entries use fixed dates and permissions instead of local file metadata.

Make edits in the main project folder before building a release. The README animation lives at `docs/battlevox.gif` and is included in the public package. Files edited or added inside `.cache/public-release` are temporary and will be replaced. Add any new public assets to the list in `scripts/release-files.cjs` before running the release commands.

Keep `.gitignore` and `.gitattributes` when uploading. The source repository includes the tests and build tools so other people can work on it.

## Playable demo on GitHub Pages

In a local Git clone with your commit name and email configured, run:

```sh
bun run demo
```

This rebuilds the game and creates or updates the local `demo` branch. The branch contains `index.html`, `game.js`, `styles.css`, `LICENSE` and `.nojekyll` at its root. It keeps the source checkout and staging area intact. Repeating the command updates the same branch, and an identical build creates no extra commit. Run it again whenever you want to refresh the demo.

Push when you are ready:

```sh
git push origin demo
```

In the repository settings, open Pages. Set the source to **Deploy from a branch**, select **demo** and **/(root)**, then save. GitHub shows the playable URL there. The build uses relative asset paths so it also works under a repository URL.

The command never pushes or adds a workflow. The `.nojekyll` file tells Pages to serve the static build directly. See the [GitHub Pages setup guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

A source ZIP cannot contain a Git branch. Clone your uploaded repository before running `bun run demo`. If you already have a `demo` branch with other files, rename it first. If the branch already exists only on GitHub, fetch it and create a local tracking branch before running the command so its history is retained.

## Testing

Say which checks you ran and which ones you could not run. Use the [playtest checklist](docs/playtest.md) for things that automated tests cannot tell us, such as audio, mouse capture and how the game feels on real hardware.

## License

Contributions use the project's [MIT license](LICENSE). Keep any required credits when adding material from elsewhere.

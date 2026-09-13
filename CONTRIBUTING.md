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

Keep `.gitignore` and `.gitattributes` when uploading. The source repository includes the tests and build tools so other people can work on it.

## Testing

Say which checks you ran and which ones you could not run. Use the [playtest checklist](docs/playtest.md) for things that automated tests cannot tell us, such as audio, mouse capture and how the game feels on real hardware.

## License

Contributions use the project's [MIT license](LICENSE). Keep any required credits when adding material from elsewhere.

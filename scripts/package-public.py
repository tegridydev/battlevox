"""Create a source release from the verified public inventory, never a folder dump."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = 'RELEASE-MANIFEST.json'


def package_public():
    manifest = json.loads((ROOT / MANIFEST).read_text())
    current = json.loads(subprocess.check_output(
        ['node', '-e',
         "console.log(JSON.stringify(require('./scripts/release-files.cjs').createManifest(process.cwd())))"],
        cwd=ROOT, text=True,
    ))
    if current != manifest:
        raise RuntimeError('Release manifest is stale. Run bun run release first.')

    version = manifest['version']
    if not all(part.isdigit() for part in version.split('.')) or len(version.split('.')) != 3:
        raise ValueError('Expected a numeric release version')
    name = f'battlevox-{version}-public'
    output = ROOT / '.cache' / 'public-release'
    output.mkdir(parents=True, exist_ok=True)
    stage = Path(tempfile.mkdtemp(prefix='.package-', dir=output))
    files = sorted([*manifest['files'], MANIFEST])
    try:
        folder = stage / name
        folder.mkdir()
        archive_path = stage / f'{name}.zip'
        with zipfile.ZipFile(archive_path, 'w', compression=zipfile.ZIP_DEFLATED,
                             compresslevel=9) as archive:
            for filename in files:
                relative = Path(filename)
                if relative.is_absolute() or '..' in relative.parts:
                    raise ValueError(f'Invalid release path: {filename}')
                source = ROOT / relative
                if source.is_symlink() or not source.is_file():
                    raise ValueError(f'Expected a regular release file: {filename}')
                data = source.read_bytes()
                if filename != MANIFEST and hashlib.sha256(data).hexdigest() != manifest['files'][filename]:
                    raise RuntimeError(f'Release file changed during packaging: {filename}')
                target = folder / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(data)
                # Fixed metadata avoids leaking local timestamps or filesystem ownership.
                entry = zipfile.ZipInfo(filename, date_time=(1980, 1, 1, 0, 0, 0))
                entry.compress_type = zipfile.ZIP_DEFLATED
                entry.create_system = 3
                entry.external_attr = 0o100644 << 16
                archive.writestr(entry, data)
        with zipfile.ZipFile(archive_path) as archive:
            if archive.testzip() is not None or archive.namelist() != files:
                raise RuntimeError('Archive verification failed')
            for filename in files:
                if archive.read(filename) != (folder / filename).read_bytes():
                    raise RuntimeError(f'Archive contents differ: {filename}')
        # Replacing the complete staged folder removes leftovers from an earlier extraction.
        destination = output / name
        if destination.is_symlink():
            destination.unlink()
        elif destination.exists():
            shutil.rmtree(destination)
        os.replace(folder, destination)
        os.replace(archive_path, output / f'{name}.zip')
        print(f'Public source folder: {destination}')
        print(f'Public source ZIP: {output / (name + ".zip")}')
        print(f'{len(files)} files; all contents match the release manifest.')
    finally:
        shutil.rmtree(stage)


if __name__ == '__main__':
    package_public()

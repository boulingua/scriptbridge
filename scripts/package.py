"""Package only the extension runtime; no developer files or dependencies."""
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import json


def package(root, destination=None):
    version = json.loads((root/'extension/manifest.json').read_text())['version']
    out = (destination or root/'dist')/f'scriptbridge-{version}.zip'
    out.parent.mkdir(parents=True,exist_ok=True)
    files = [(p.relative_to(root/'extension').as_posix(),p)
             for p in (root/'extension').rglob('*') if p.is_file()]
    files.append(('LICENSE',root/'LICENSE'))
    with ZipFile(out,'w',ZIP_DEFLATED,compresslevel=9) as archive:
        for name,path in sorted(files):
            # Stable timestamps, permissions and ordering survive fresh checkouts.
            info = ZipInfo(name,date_time=(1980,1,1,0,0,0))
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            info.compress_type = ZIP_DEFLATED
            archive.writestr(info,path.read_bytes(),compress_type=ZIP_DEFLATED,compresslevel=9)
    return out


if __name__ == '__main__':
    print(package(Path(__file__).resolve().parents[1]))

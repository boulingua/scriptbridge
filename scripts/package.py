"""Package only the extension runtime; no developer files or dependencies."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root = Path(__file__).resolve().parents[1]
out = root / 'dist' / 'scriptbridge-0.1.0.zip'
out.parent.mkdir(exist_ok=True)
with ZipFile(out, 'w', ZIP_DEFLATED) as z:
    for p in sorted((root / 'extension').rglob('*')):
        if p.is_file():
            z.write(p, p.relative_to(root / 'extension'))
    z.write(root / 'LICENSE', 'LICENSE')
print(out)

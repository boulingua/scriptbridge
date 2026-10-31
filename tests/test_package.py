import importlib.util
import json
import os
from pathlib import Path
import tempfile
import unittest
from zipfile import ZipFile

spec=importlib.util.spec_from_file_location('package_script',Path(__file__).resolve().parents[1]/'scripts/package.py')
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class Packaging(unittest.TestCase):
    def test_fresh_checkout_metadata_does_not_change_package(self):
        with tempfile.TemporaryDirectory() as td:
            root=Path(td)
            (root/'extension').mkdir()
            (root/'extension/manifest.json').write_text(json.dumps({'version':'3.4.5'}))
            (root/'extension/main.js').write_text('alert("fixture");\n')
            (root/'LICENSE').write_text('Fixture licence\n')
            (root/'private-notes.txt').write_text('Do not package me')
            first=module.package(root)
            self.assertEqual(first.name,'scriptbridge-3.4.5.zip')
            expected=first.read_bytes()
            for p in (root/'extension').iterdir():
                os.utime(p,(1800000000,1800000000))
                p.chmod(0o755)
            self.assertEqual(module.package(root).read_bytes(),expected)
            with ZipFile(first) as archive:
                self.assertEqual(archive.namelist(),['LICENSE','main.js','manifest.json'])
                self.assertEqual(archive.read('main.js'),(root/'extension/main.js').read_bytes())


if __name__=='__main__':
    unittest.main()

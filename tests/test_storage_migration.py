import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/migrate-public-storage-r2.py'


class StoragePreflightTests(unittest.TestCase):
    def run_preflight(self, bucket='sets', corrupt=False):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            key = bucket + '/test.mp3'
            identity = hashlib.sha256(key.encode()).hexdigest()
            payload = b'original media'
            (root / identity).write_bytes(b'changed media!' if corrupt else payload)
            manifest = {'project_ref': 'azfazwgrfazdaunigqbd', 'errors': [], 'objects': [{
                'bucket_id': bucket, 'name': 'test.mp3', 'key': key,
                'local_file': identity, 'size': len(payload),
                'sha256': hashlib.sha256(payload).hexdigest(),
            }]}
            (root / 'verified-manifest.json').write_text(json.dumps(manifest))
            return subprocess.run([sys.executable, str(SCRIPT), str(root), '--bucket', 'test'],
                                  capture_output=True, text=True)

    def test_verified_backup_passes_without_credentials(self):
        result = self.run_preflight()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('Preflight passed: 1 objects', result.stdout)

    def test_changed_bytes_are_rejected(self):
        result = self.run_preflight(corrupt=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('integrity check failed', result.stderr)

    def test_private_bucket_is_rejected(self):
        result = self.run_preflight(bucket='tickets')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Unexpected bucket', result.stderr)


if __name__ == '__main__':
    unittest.main()

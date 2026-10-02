#!/usr/bin/env python3
"""Download the public storage manifest to a resumable, verified local backup.

Never writes to Supabase or deletes source objects. Uses opaque local filenames
so object names cannot escape the backup directory. No credentials are needed.
"""
import argparse
import concurrent.futures
import hashlib
import json
from pathlib import Path
import urllib.parse
import urllib.request


def digest(path):
    hasher = hashlib.sha256()
    with path.open('rb') as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b''):
            hasher.update(chunk)
    return hasher.hexdigest()


def backup(obj, root, project):
    key = obj['bucket_id'] + '/' + obj['name']
    identity = hashlib.sha256(key.encode()).hexdigest()
    target = root / identity
    receipt = root / (identity + '.json')
    if target.exists() and receipt.exists():
        previous = json.loads(receipt.read_text())
        if (previous['key'] == key and previous['size'] == obj['size']
                and previous['updated_at'] == obj['updated_at']
                and target.stat().st_size == obj['size']
                and digest(target) == previous['sha256']):
            return previous
    encoded = '/'.join(urllib.parse.quote(part, safe='') for part in key.split('/'))
    url = f'https://{project}.supabase.co/storage/v1/object/public/{encoded}'
    temporary = root / (identity + '.partial')
    hasher = hashlib.sha256()
    size = 0
    request = urllib.request.Request(url, headers={'Accept-Encoding': 'identity'})
    with urllib.request.urlopen(request, timeout=120) as response, temporary.open('wb') as output:
        for chunk in iter(lambda: response.read(1024 * 1024), b''):
            output.write(chunk)
            hasher.update(chunk)
            size += len(chunk)
    if size != obj['size']:
        raise ValueError(f'Size changed for {key}: expected {obj["size"]}, received {size}')
    temporary.replace(target)
    result = {**obj, 'key': key, 'local_file': identity, 'sha256': hasher.hexdigest()}
    receipt.write_text(json.dumps(result, indent=2) + '\n')
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('manifest', type=Path)
    parser.add_argument('destination', type=Path)
    args = parser.parse_args()
    manifest = json.loads(args.manifest.read_text())
    if manifest['project_ref'] != 'azfazwgrfazdaunigqbd':
        parser.error('Unexpected source project')
    allowed = {'anniversary', 'artistimage', 'images', 'musics', 'sets', 'waveforms'}
    if any(obj['bucket_id'] not in allowed for obj in manifest['objects']):
        parser.error('Manifest contains a non-public bucket')
    args.destination.mkdir(parents=True, exist_ok=True)
    results, errors = [], []
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        futures = {pool.submit(backup, obj, args.destination, manifest['project_ref']): obj
                   for obj in manifest['objects']}
        for future in concurrent.futures.as_completed(futures):
            try:
                result = future.result()
                results.append(result)
                print(f'Verified {len(results)}/{len(futures)}: {result["key"]}', flush=True)
            except Exception as error:
                obj = futures[future]
                errors.append({'key': obj['bucket_id'] + '/' + obj['name'], 'error': str(error)})
                print(f'FAILED: {errors[-1]["key"]}: {error}', flush=True)
    report = {'project_ref': manifest['project_ref'], 'objects': sorted(results, key=lambda o: o['key']), 'errors': errors}
    (args.destination / 'verified-manifest.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({'verified': len(results), 'bytes': sum(o['size'] for o in results), 'errors': len(errors)}))
    if errors:
        raise SystemExit(1)


if __name__ == '__main__':
    main()

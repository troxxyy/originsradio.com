#!/usr/bin/env python3
"""Copy a verified public backup to R2; never delete or change Supabase.

Credentials: R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY environment variables.
The destination bucket must already exist in the verified Cloudflare account.
Run without --apply for an offline preflight; --apply copies missing objects
and downloads every destination object to verify its SHA-256.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path

ACCOUNT = 'b65ef5640d57ae43887e3e191ba83c42'
PUBLIC_BUCKETS = {'anniversary', 'artistimage', 'images', 'musics', 'sets', 'waveforms'}


def hash_stream(stream):
    checksum = hashlib.sha256()
    for chunk in iter(lambda: stream.read(1024 * 1024), b''):
        checksum.update(chunk)
    return checksum.hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('backup', type=Path)
    parser.add_argument('--bucket', required=True)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    manifest = json.loads((args.backup / 'verified-manifest.json').read_text())
    if manifest.get('errors') or manifest['project_ref'] != 'azfazwgrfazdaunigqbd':
        parser.error('Backup incomplete or unexpected source project')
    if not manifest['objects']:
        parser.error('Backup contains no objects')
    # Validate the entire backup before the first write.
    for obj in manifest['objects']:
        key = obj['bucket_id'] + '/' + obj['name']
        identity = hashlib.sha256(key.encode()).hexdigest()
        if obj['bucket_id'] not in PUBLIC_BUCKETS or obj['key'] != key or obj['local_file'] != identity:
            parser.error('Unexpected bucket, key, or local filename')
        path = args.backup / identity
        with path.open('rb') as source:
            if path.stat().st_size != obj['size'] or hash_stream(source) != obj['sha256']:
                parser.error(f'Backup integrity check failed: {key}')
    print(f'Preflight passed: {len(manifest["objects"])} objects', flush=True)
    if not args.apply:
        return
    import boto3
    from botocore.config import Config
    from botocore.exceptions import ClientError
    client = boto3.client('s3',
        endpoint_url=f'https://{ACCOUNT}.r2.cloudflarestorage.com',
        aws_access_key_id=os.environ['R2_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['R2_SECRET_ACCESS_KEY'],
        region_name='auto',
        config=Config(signature_version='s3v4', request_checksum_calculation='when_required',
                      response_checksum_validation='when_required'))
    client.head_bucket(Bucket=args.bucket)
    results = []
    for obj in manifest['objects']:
        key = obj['key']
        try:
            head = client.head_object(Bucket=args.bucket, Key=key)
        except ClientError as error:
            if error.response['Error']['Code'] not in ('404', 'NoSuchKey', 'NotFound'):
                raise
            head = None
        if head is not None:
            if head['ContentLength'] != obj['size']:
                raise ValueError(f'Existing destination differs; refusing overwrite: {key}')
        else:
            with (args.backup / obj['local_file']).open('rb') as source:
                client.put_object(Bucket=args.bucket, Key=key, Body=source,
                    ContentLength=obj['size'], ContentType=obj['content_type'] or 'application/octet-stream',
                    CacheControl='public, max-age=3600', Metadata={'sha256': obj['sha256']},
                    IfNoneMatch='*')
        remote = client.get_object(Bucket=args.bucket, Key=key)
        try:
            actual_hash = hash_stream(remote['Body'])
        finally:
            remote['Body'].close()
        if remote['ContentLength'] != obj['size'] or actual_hash != obj['sha256']:
            raise ValueError(f'Destination verification failed: {key}')
        results.append({'key': key, 'size': obj['size'], 'sha256': actual_hash})
        report = {'account': ACCOUNT, 'bucket': args.bucket, 'objects': results,
                  'complete': len(results) == len(manifest['objects'])}
        temporary = args.backup / 'r2-verification.partial.json'
        temporary.write_text(json.dumps(report, indent=2) + '\n')
        temporary.replace(args.backup / 'r2-verification.json')
        print(f'R2 verified {len(results)}/{len(manifest["objects"])}: {key}', flush=True)


if __name__ == '__main__':
    main()

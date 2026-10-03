// Default: generate small previews from the verified local audio backup.
// --apply: publish new immutable R2 objects, verify delivery, then update only
// the original set rows with compare-and-set predicates. Never deletes audio.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn, execFileSync } = require('node:child_process');
const { createClient } = require('@supabase/supabase-js');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const root = path.resolve(__dirname, '..');
process.loadEnvFile(path.join(root, '.env.local')); process.loadEnvFile(path.join(root, '.env'));
if (process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://azfazwgrfazdaunigqbd.supabase.co' || process.env.R2_BUCKET !== 'originsradio-media') throw Error('Unexpected project');
const origin = 'https://originsradio-media.sinacetin.workers.dev';
const backup = path.join(root, '.storage-backup-2026-10-02.local');
const output = path.join(root, 'tmp/waveform-optimization-2026-10-03');
fs.mkdirSync(output, { recursive: true });
const manifest = JSON.parse(fs.readFileSync(path.join(backup, 'verified-manifest.json')));
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const hash = body => crypto.createHash('sha256').update(body).digest('hex');
const save = (name, data) => fs.writeFileSync(path.join(output, name), JSON.stringify(data, null, 2));
async function generate(file, duration) {
  return new Promise((resolve, reject) => {
    const child = spawn('ffmpeg', ['-v', 'error', '-i', file, '-vn', '-ac', '1', '-ar', '8000', '-f', 'f32le', 'pipe:1']);
    const peaks = Array(1200).fill(0); let samples = 0, carry = Buffer.alloc(0);
    child.stdout.on('data', chunk => {
      const buffer = Buffer.concat([carry, chunk]); const end = buffer.length - buffer.length % 4;
      for (let i = 0; i < end; i += 4) {
        const bin = Math.min(1199, Math.floor(samples++ * 1200 / (duration * 8000)));
        peaks[bin] = Math.max(peaks[bin], Math.abs(buffer.readFloatLE(i)));
      }
      carry = buffer.subarray(end);
    });
    child.stderr.resume(); child.on('error', reject);
    child.on('close', code => code === 0 && samples ? resolve(peaks.map(value => Math.round(value * 10000) / 10000)) : reject(Error('Audio decoding failed')));
  });
}
(async () => {
  if (!process.argv.includes('--apply')) {
    const { data: rows, error } = await client.from('sets').select('id,title,audio_url,peaks_url,duration').order('id');
    if (error || !rows.length) throw Error('Could not read sets');
    save('sets-before.json', rows);
    const assets = new Map(), changes = [];
    for (const row of rows) {
      const key = decodeURIComponent(new URL(row.audio_url, 'https://originsradio.com').pathname.slice(1));
      const original = manifest.objects.find(object => object.key === key);
      if (!original) throw Error('Missing verified audio backup');
      if (!assets.has(original.sha256)) {
        const file = path.join(backup, original.local_file);
        if (hash(fs.readFileSync(file)) !== original.sha256) throw Error('Audio backup integrity changed');
        const info = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', file], { encoding: 'utf8' }));
        const duration = Number(info.format.duration);
        if (!Number.isFinite(duration) || duration <= 0) throw Error('Invalid audio duration');
        const body = JSON.stringify({ version: 1, duration: Math.round(duration * 1000) / 1000, peaks: await generate(file, duration) });
        const filename = original.sha256 + '.json'; fs.writeFileSync(path.join(output, filename), body);
        assets.set(original.sha256, { key: 'waveforms/compact-v1/' + filename, filename, sha256: hash(body), bytes: Buffer.byteLength(body), duration: Math.round(duration * 1000) / 1000 });
        console.log('Prepared waveform ' + assets.size);
      }
      const asset = assets.get(original.sha256);
      changes.push({ id: row.id, before: row, after: { peaks_url: origin + '/' + asset.key, duration: Math.round(asset.duration) } });
    }
    const plan = { project: manifest.project_ref, complete: true, generatedAt: new Date().toISOString(), assets: [...assets.values()], changes };
    save('plan.json', plan); console.log(JSON.stringify({ prepared: plan.assets.length, sets: changes.length, totalBytes: plan.assets.reduce((n, a) => n + a.bytes, 0) })); return;
  }
  const plan = JSON.parse(fs.readFileSync(path.join(output, 'plan.json')));
  if (!plan.complete || plan.project !== 'azfazwgrfazdaunigqbd') throw Error('Invalid plan');
  const r2 = new S3Client({ region: 'auto', endpoint: 'https://b65ef5640d57ae43887e3e191ba83c42.r2.cloudflarestorage.com', credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY } });
  // Every source row must still match before the first remote write.
  const { data: current, error } = await client.from('sets').select('id,title,audio_url,peaks_url,duration').order('id');
  if (error || JSON.stringify(current) !== JSON.stringify(plan.changes.map(c => c.before))) throw Error('Source rows changed');
  for (const asset of plan.assets) {
    const body = fs.readFileSync(path.join(output, asset.filename));
    if (hash(body) !== asset.sha256 || body.length !== asset.bytes) throw Error('Preview changed');
    try { await r2.send(new PutObjectCommand({ Bucket: 'originsradio-media', Key: asset.key, Body: body, ContentType: 'application/json', CacheControl: 'public, max-age=31536000, immutable', IfNoneMatch: '*' })); }
    catch (error) { if (error.$metadata?.httpStatusCode !== 412) throw error; }
    const remote = await r2.send(new GetObjectCommand({ Bucket: 'originsradio-media', Key: asset.key }));
    if (hash(Buffer.from(await remote.Body.transformToByteArray())) !== asset.sha256) throw Error('R2 preview mismatch');
    const response = await fetch(origin + '/' + asset.key, { headers: { Origin: 'https://originsradio.com' }, signal: AbortSignal.timeout(60000) });
    if (response.status !== 200 || response.headers.get('access-control-allow-origin') !== '*' || hash(Buffer.from(await response.arrayBuffer())) !== asset.sha256) throw Error('Public preview mismatch');
  }
  const receipt = { complete: false, startedAt: new Date().toISOString(), updated: [] }; save('apply-receipt.json', receipt);
  for (const change of plan.changes) {
    let query = client.from('sets').update(change.after).eq('id', change.id).eq('audio_url', change.before.audio_url);
    query = change.before.peaks_url === null ? query.is('peaks_url', null) : query.eq('peaks_url', change.before.peaks_url);
    query = change.before.duration === null ? query.is('duration', null) : query.eq('duration', change.before.duration);
    const { data, error } = await query.select('id,peaks_url,duration');
    if (error || data?.length !== 1 || data[0].peaks_url !== change.after.peaks_url || data[0].duration !== change.after.duration) throw Error('Set changed or update failed');
    receipt.updated.push(change.id); save('apply-receipt.json', receipt);
  }
  receipt.complete = true; receipt.finishedAt = new Date().toISOString(); save('apply-receipt.json', receipt);
  console.log(JSON.stringify({ complete: true, assets: plan.assets.length, updatedSets: receipt.updated.length, audioFilesChanged: 0 }));
})().catch(error => { console.error('Stopped safely: ' + (/^(Unexpected|Could not|Missing|Audio|Invalid|Source|Preview|R2|Public|Set)/.test(error.message) ? error.message : error.name)); process.exitCode = 1; });

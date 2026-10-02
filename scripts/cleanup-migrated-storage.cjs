#!/usr/bin/env node
// Remove only the exact public objects backed up and verified in R2.
// Default is read-only; --apply requires explicit approval of source deletion.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { createClient } = require('@supabase/supabase-js');
const root = path.resolve(__dirname, '..');
process.loadEnvFile(path.join(root, '.env'));
const backup = path.join(root, '.storage-backup-2026-10-02.local');
const read = name => JSON.parse(fs.readFileSync(path.join(backup, name), 'utf8'));
const manifest = read('verified-manifest.json');
const r2 = read('r2-verification.json');
const publicProof = read('public-endpoint-verification.json');
const allowed = new Set(['anniversary', 'artistimage', 'images', 'musics', 'sets', 'waveforms']);
if (manifest.project_ref !== 'azfazwgrfazdaunigqbd' || manifest.errors.length || !r2.complete || !publicProof.complete || manifest.objects.length !== 154) throw Error('Incomplete backup');
const hashes = new Map(r2.objects.map(o => [o.key, o]));
for (const o of manifest.objects) {
 const receipt = hashes.get(o.key);
 if (!allowed.has(o.bucket_id) || o.key !== o.bucket_id + '/' + o.name || !receipt || receipt.sha256 !== o.sha256 || receipt.size !== o.size) throw Error('Unexpected object');
 const f = path.join(backup, o.local_file);
 if (o.local_file !== crypto.createHash('sha256').update(o.key).digest('hex') || fs.statSync(f).size !== o.size) throw Error('Local backup changed');
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (url !== 'https://azfazwgrfazdaunigqbd.supabase.co') throw Error('Unexpected project');
const client = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false,autoRefreshToken:false}});
async function list(bucket, prefix='') {
 const all=[];
 for(let offset=0;;offset+=1000) {
  const {data,error}=await client.storage.from(bucket).list(prefix,{limit:1000,offset,sortBy:{column:'name',order:'asc'}});
  if(error) throw Error('Source listing failed: '+bucket);
  for(const o of data) {
   const name=prefix?prefix+'/'+o.name:o.name;
   if(o.id) all.push({...o,name}); else all.push(...await list(bucket,name));
  }
  if(data.length<1000) return all;
 }
}
(async()=>{
 const groups=new Map();
 for(const bucket of allowed) {
  const expected=manifest.objects.filter(o=>o.bucket_id===bucket);
  const current=await list(bucket);
  if(current.length!==expected.length) throw Error('Source object count changed: '+bucket);
  for(const o of expected) {
   const c=current.find(c=>c.name===o.name);
   if(!c || Number(c.metadata?.size)!==o.size || Date.parse(c.updated_at)!==Date.parse(o.updated_at)) throw Error('Source changed: '+bucket+'/'+o.name);
  }
  groups.set(bucket,expected.map(o=>o.name));
 }
 console.log(JSON.stringify({preflight:'passed',publicObjects:154,bytes:manifest.objects.reduce((n,o)=>n+o.size,0),privateTicketsExcluded:true}));
 if(!process.argv.includes('--apply')) return;
 const receipt={project:manifest.project_ref,startedAt:new Date().toISOString(),deleted:[],complete:false};
 for(const [bucket,names] of groups) {
  for(let offset=0;offset<names.length;offset+=20) {
   const batch=names.slice(offset,offset+20);
   const {data,error}=await client.storage.from(bucket).remove(batch);
   if(error || data.length!==batch.length) throw Error('Source deletion failed: '+bucket);
   receipt.deleted.push(...batch.map(name=>({bucket,name})));
   fs.writeFileSync(path.join(backup,'source-cleanup-receipt.json'),JSON.stringify(receipt,null,2)+'\n');
   console.log('Removed verified source objects: '+receipt.deleted.length+'/154');
  }
 }
 for(const bucket of allowed) if((await list(bucket)).length) throw Error('Unexpected remaining public objects');
 receipt.complete=true;
 receipt.finishedAt=new Date().toISOString();
 fs.writeFileSync(path.join(backup,'source-cleanup-receipt.json'),JSON.stringify(receipt,null,2)+'\n');
 console.log('Source cleanup verified complete; private tickets retained.');
})().catch(()=>{console.error('Stopped: source inventory changed, backup invalid, or Storage API failed. No further deletions will run.');process.exitCode=1;});

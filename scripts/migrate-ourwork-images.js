// Run with:
// SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-ourwork-images.js

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const BUCKET = 'images'
const LOCAL_DIR = path.resolve(process.cwd(), 'public', 'ourwork')
const STORAGE_PREFIX = 'ourwork'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function ensureBucket() {
  // Best-effort: buckets are usually created via SQL; we just verify by listing
  const { data, error } = await supabase.storage.listBuckets()
  if (error) throw error
  const exists = (data || []).some((b) => b.id === BUCKET)
  if (!exists) {
    throw new Error(`Bucket "${BUCKET}" does not exist. Create it first (see storage-setup.sql).`)
  }
}

async function uploadFile(filePath, destPath) {
  const fileBuffer = fs.readFileSync(filePath)
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(destPath, fileBuffer, { upsert: true })
  if (error && !(error?.message || '').toLowerCase().includes('duplicate')) {
    throw error
  }
  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(destPath)
  return publicData.publicUrl
}

async function updateImageUrl(filename, publicUrl) {
  // Rows currently seeded have image_url like "/ourwork/<filename>"
  const oldPath = `/ourwork/${filename}`
  const { error } = await supabase
    .from('our_work_projects')
    .update({ image_url: publicUrl })
    .eq('image_url', oldPath)
  if (error) throw error
}

async function main() {
  console.log('Starting Our Work images migration...')
  await ensureBucket()
  if (!fs.existsSync(LOCAL_DIR)) {
    throw new Error(`Local directory not found: ${LOCAL_DIR}`)
  }

  const files = fs.readdirSync(LOCAL_DIR).filter((f) => !fs.statSync(path.join(LOCAL_DIR, f)).isDirectory())
  console.log(`Found ${files.length} files in ${LOCAL_DIR}`)

  let success = 0
  let failed = 0
  for (const filename of files) {
    const localPath = path.join(LOCAL_DIR, filename)
    const destPath = `${STORAGE_PREFIX}/${filename}`
    try {
      const publicUrl = await uploadFile(localPath, destPath)
      await updateImageUrl(filename, publicUrl)
      console.log(`✔ Uploaded and updated: ${filename} -> ${publicUrl}`)
      success++
      // avoid rate limits
      await sleep(100)
    } catch (err) {
      console.error(`✖ Failed for ${filename}:`, err?.message || err)
      failed++
    }
  }

  console.log(`Done. Success: ${success}, Failed: ${failed}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})



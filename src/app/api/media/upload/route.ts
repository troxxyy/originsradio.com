import { createClient } from '@supabase/supabase-js'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { validateMediaUpload } from '@/lib/media-upload-policy'
import { publicMediaUrl } from '@/lib/media-url'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const reply = (body: object, status: number) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1]
  if (!token) return reply({ error: 'Sign in with your admin account to upload.' }, 401)
  const { NEXT_PUBLIC_SUPABASE_URL: url, NEXT_PUBLIC_SUPABASE_ANON_KEY: anon,
    R2_ACCOUNT_ID: account, R2_BUCKET: bucket, R2_ACCESS_KEY_ID: accessKeyId,
    R2_SECRET_ACCESS_KEY: secretAccessKey, NEXT_PUBLIC_MEDIA_ORIGIN: mediaOrigin } = process.env
  const admins = (process.env.MEDIA_ADMIN_USER_IDS || '').split(',').map(id => id.trim()).filter(Boolean)
  if (!url || !anon || !account || !bucket || !accessKeyId || !secretAccessKey || !mediaOrigin || !admins.length) {
    return reply({ error: 'Media uploads are not configured.' }, 503)
  }
  const client = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await client.auth.getUser(token)
  if (error || !data.user || data.user.is_anonymous || !admins.includes(data.user.id)) {
    return reply({ error: 'Only an authorized admin can upload media.' }, 403)
  }
  let file
  try { file = validateMediaUpload(await request.json()) }
  catch { return reply({ error: 'Invalid file path, type, or size.' }, 400) }
  try {
    const s3 = new S3Client({ region: 'auto', endpoint: `https://${account}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey }, requestChecksumCalculation: 'WHEN_REQUIRED' })
    const uploadUrl = await getSignedUrl(s3, new PutObjectCommand({ Bucket: bucket, Key: file.key,
      ContentType: file.contentType, ContentLength: file.size, CacheControl: 'public, max-age=3600' }),
    { expiresIn: 300, signableHeaders: new Set(['content-type', 'content-length', 'cache-control']) })
    return reply({ uploadUrl, publicUrl: publicMediaUrl(file.bucket, file.path, mediaOrigin), contentType: file.contentType }, 200)
  } catch { return reply({ error: 'Could not prepare media upload.' }, 502) }
}

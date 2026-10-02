import { getSupabaseClient } from './supabase'

export async function uploadPublicMedia(bucket: string, path: string, file: Blob): Promise<string> {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured')
  if (!process.env.NEXT_PUBLIC_MEDIA_ORIGIN) {
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true, contentType: file.type || 'application/octet-stream', cacheControl: '3600',
    })
    if (error) throw error
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
  }
  const { data } = await supabase.auth.getSession()
  if (!data.session || data.session.user.is_anonymous) throw new Error('Sign in with your admin account before uploading.')
  const response = await fetch('/api/media/upload', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` },
    body: JSON.stringify({ bucket, path, size: file.size }),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Could not prepare upload')
  const uploaded = await fetch(result.uploadUrl, {
    method: 'PUT', headers: { 'Content-Type': result.contentType, 'Cache-Control': 'public, max-age=3600' }, body: file,
  })
  if (!uploaded.ok) throw new Error(`Media upload failed (${uploaded.status})`)
  return result.publicUrl
}

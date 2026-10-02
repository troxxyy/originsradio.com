const publicBuckets = new Set(['anniversary', 'artistimage', 'images', 'musics', 'sets', 'waveforms'])
const sourceOrigin = 'https://azfazwgrfazdaunigqbd.supabase.co'

export function publicMediaUrl(bucket: string, path: string, origin = process.env.NEXT_PUBLIC_MEDIA_ORIGIN): string {
  const key = [bucket, ...path.split('/')].map(encodeURIComponent).join('/')
  return origin ? `${origin.replace(/\/$/, '')}/${key}` : `${sourceOrigin}/storage/v1/object/public/${key}`
}

export function resolveMediaUrl(rawUrl: string, origin = process.env.NEXT_PUBLIC_MEDIA_ORIGIN): string {
  if (!origin) return rawUrl
  try {
    const url = new URL(rawUrl)
    const prefix = '/storage/v1/object/public/'
    if (url.origin !== sourceOrigin || !url.pathname.startsWith(prefix)) return rawUrl
    const [bucket, ...parts] = url.pathname.slice(prefix.length).split('/')
    if (!publicBuckets.has(bucket)) return rawUrl
    // Legacy anniversary URLs contain an extra separator after the bucket.
    while (parts[0] === '') parts.shift()
    const path = parts.map(decodeURIComponent).join('/')
    return publicMediaUrl(bucket, path, origin)
  } catch { return rawUrl }
}

export function isMediaUrl(rawUrl: string): boolean {
  const origin = process.env.NEXT_PUBLIC_MEDIA_ORIGIN
  if (!origin) return false
  try { return new URL(rawUrl).origin === new URL(origin).origin } catch { return false }
}

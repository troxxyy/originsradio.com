const audioTypes: Record<string, string> = {
  mp3: 'audio/mpeg', mp4: 'audio/mp4', m4a: 'audio/mp4', aac: 'audio/aac',
  opus: 'audio/ogg', ogg: 'audio/ogg', wav: 'audio/wav', flac: 'audio/flac',
}
const imageTypes: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif' }

export function validateMediaUpload(input: unknown) {
  if (!input || typeof input !== 'object') throw new Error('Invalid upload')
  const { bucket, path, size } = input as { bucket?: unknown; path?: unknown; size?: unknown }
  if (typeof bucket !== 'string' || typeof path !== 'string' || typeof size !== 'number' || !Number.isSafeInteger(size) || size <= 0) throw new Error('Invalid upload')
  const hasControlCharacter = [...path].some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)
  if (!path || path.length > 800 || path.startsWith('/') || (path.includes('\\') || hasControlCharacter) || path.split('/').some(part => !part || part === '.' || part === '..')) throw new Error('Invalid file path')
  const ext = path.split('.').pop()?.toLowerCase() || ''
  let contentType: string | undefined
  let maxSize = 0
  if (['sets', 'anniversary', 'musics'].includes(bucket)) { contentType = audioTypes[ext]; maxSize = 500 * 1024 * 1024 }
  if (['images', 'artistimage'].includes(bucket)) { contentType = imageTypes[ext]; maxSize = 30 * 1024 * 1024 }
  if (bucket === 'waveforms') { contentType = ext === 'json' ? 'application/json' : undefined; maxSize = 10 * 1024 * 1024 }
  if (!contentType || size > maxSize) throw new Error('Unsupported file type or size')
  return { bucket, path, size, contentType, key: `${bucket}/${path}` }
}

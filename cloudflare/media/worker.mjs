// Public media only. No write API, credentials, bucket listing, or proxy fetch.
const PUBLIC_PREFIXES = new Set(['anniversary', 'artistimage', 'images', 'musics', 'sets', 'waveforms'])

export function parseRange(header, size) {
  if (!header) return null
  const match = /^bytes=(\d*)-(\d*)$/.exec(header)
  if (!match || (!match[1] && !match[2]) || size === 0) return false
  let start, end
  if (!match[1]) {
    const suffix = Number(match[2])
    if (!Number.isSafeInteger(suffix) || suffix <= 0) return false
    start = Math.max(0, size - suffix)
    end = size - 1
  } else {
    start = Number(match[1])
    end = match[2] ? Number(match[2]) : size - 1
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || start > end) return false
    end = Math.min(end, size - 1)
  }
  return { offset: start, length: end - start + 1 }
}

function baseHeaders() {
  return new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Range, If-None-Match, If-Range',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges, ETag',
    'Access-Control-Max-Age': '86400',
    'X-Content-Type-Options': 'nosniff',
  })
}

export default {
  async fetch(request, env) {
    const headers = baseHeaders()
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
    if (!['GET', 'HEAD'].includes(request.method)) {
      headers.set('Allow', 'GET, HEAD, OPTIONS')
      return new Response('Method not allowed', { status: 405, headers })
    }
    let key
    try { key = decodeURIComponent(new URL(request.url).pathname.slice(1)) }
    catch { return new Response('Invalid path', { status: 400, headers }) }
    if (!PUBLIC_PREFIXES.has(key.split('/')[0]) || !key.includes('/')) {
      return new Response('Not found', { status: 404, headers })
    }
    if (!env.MEDIA) return new Response('Media unavailable', { status: 503, headers })
    const metadata = await env.MEDIA.head(key)
    if (!metadata) return new Response('Not found', { status: 404, headers })
    metadata.writeHttpMetadata(headers)
    // Some imported legacy image objects were stored as text/plain.
    const imageType = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[key.split('.').pop().toLowerCase()]
    if (imageType) headers.set('Content-Type', imageType)
    headers.set('ETag', metadata.httpEtag)
    headers.set('Last-Modified', metadata.uploaded.toUTCString())
    headers.set('Accept-Ranges', 'bytes')
    headers.set('Cache-Control', 'public, max-age=3600')
    const noneMatch = request.headers.get('If-None-Match')
    if (noneMatch?.split(',').some(value => value.trim() === '*' || value.trim().replace(/^W\//, '') === metadata.httpEtag)) {
      return new Response(null, { status: 304, headers })
    }
    headers.set('Content-Length', String(metadata.size))
    if (request.method === 'HEAD') return new Response(null, { headers })
    const ifRange = request.headers.get('If-Range')
    const rangeHeader = !ifRange || ifRange === metadata.httpEtag || ifRange === metadata.uploaded.toUTCString()
      ? request.headers.get('Range') : null
    const range = parseRange(rangeHeader, metadata.size)
    if (range === false) {
      headers.set('Content-Range', `bytes */${metadata.size}`)
      headers.delete('Content-Length')
      return new Response(null, { status: 416, headers })
    }
    // Only serve the same version whose metadata and range we calculated.
    const object = await env.MEDIA.get(key, {
      onlyIf: { etagMatches: metadata.etag }, ...(range ? { range } : {}),
    })
    if (!object || !('body' in object)) {
      headers.delete('Content-Length')
      headers.set('Cache-Control', 'no-store')
      return new Response(null, { status: 412, headers })
    }
    if (range) {
      headers.set('Content-Range', `bytes ${range.offset}-${range.offset + range.length - 1}/${metadata.size}`)
      headers.set('Content-Length', String(range.length))
    }
    return new Response(object.body, { status: range ? 206 : 200, headers })
  },
}

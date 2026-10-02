import test from 'node:test'
import assert from 'node:assert/strict'
import worker, { parseRange } from '../cloudflare/media/worker.mjs'

test('audio seeking supports bounded, open, suffix and clamped ranges', () => {
  assert.deepEqual(parseRange('bytes=2-5', 10), { offset: 2, length: 4 })
  assert.deepEqual(parseRange('bytes=2-', 10), { offset: 2, length: 8 })
  assert.deepEqual(parseRange('bytes=-3', 10), { offset: 7, length: 3 })
  assert.deepEqual(parseRange('bytes=7-999', 10), { offset: 7, length: 3 })
  for (const range of ['bytes=10-', 'bytes=5-2', 'bytes=-0', 'bytes=0-1,4-5', 'bytes=-']) {
    assert.equal(parseRange(range, 10), false)
  }
  assert.equal(parseRange('bytes=0-', 0), false)
})

function mediaEnv() {
  const payload = new TextEncoder().encode('0123456789')
  const metadata = {
    size: 10, etag: 'sample', httpEtag: '"sample"', uploaded: new Date('2026-10-02T00:00:00Z'),
    writeHttpMetadata: headers => headers.set('Content-Type', 'audio/mpeg'),
  }
  return { MEDIA: {
    head: async () => metadata,
    get: async (_key, options) => ({ ...metadata, body: options.range
      ? payload.slice(options.range.offset, options.range.offset + options.range.length) : payload }),
  } }
}

test('range response carries matching bytes, CORS and seeking headers', async () => {
  const response = await worker.fetch(new Request('https://media.example/sets/test.mp3', { headers: { Range: 'bytes=2-5' } }), mediaEnv())
  assert.equal(response.status, 206)
  assert.equal(await response.text(), '2345')
  assert.equal(response.headers.get('Content-Length'), '4')
  assert.equal(response.headers.get('Content-Range'), 'bytes 2-5/10')
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), '*')
})

test('private buckets and write methods never access R2', async () => {
  for (const [path, method, status] of [['tickets/private.pdf', 'GET', 404], ['sets/test.mp3', 'PUT', 405]]) {
    const response = await worker.fetch(new Request(`https://media.example/${path}`, { method }), {})
    assert.equal(response.status, status)
  }
})

test('HEAD returns metadata without a body', async () => {
  const env = mediaEnv()
  env.MEDIA.get = () => { throw new Error('HEAD must not read object body') }
  const response = await worker.fetch(new Request('https://media.example/sets/test.mp3', { method: 'HEAD' }), env)
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('Content-Length'), '10')
  assert.equal(await response.text(), '')
})

test('stale If-Range returns the complete object', async () => {
  const response = await worker.fetch(new Request('https://media.example/sets/test.mp3', { headers: { Range: 'bytes=2-5', 'If-Range': '"older"' } }), mediaEnv())
  assert.equal(response.status, 200)
  assert.equal(await response.text(), '0123456789')
})

test('matching ETag avoids body transfer', async () => {
  const response = await worker.fetch(new Request('https://media.example/sets/test.mp3', { headers: { 'If-None-Match': 'W/"sample"' } }), mediaEnv())
  assert.equal(response.status, 304)
  assert.equal(await response.text(), '')
})

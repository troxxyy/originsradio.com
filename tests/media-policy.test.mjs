import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'
async function load(name) {
  const source = await readFile(new URL(`../src/app/lib/${name}.ts`, import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } })
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
}
const { validateMediaUpload } = await load('media-upload-policy')
const { resolveMediaUrl } = await load('media-url')
const origin = 'https://originsradio-media.sinacetin.workers.dev'
const source = 'https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/'
test('migration preserves encoded filenames and normalizes legacy anniversary separator', () => {
  assert.equal(resolveMediaUrl(`${source}anniversary//DJ%20set%23one.mp3`, origin), `${origin}/anniversary/DJ%20set%23one.mp3`)
})
test('private and unrelated URLs never become public media URLs', () => {
  for (const url of [`${source}tickets/private.pdf`, 'https://example.com/image.jpg']) assert.equal(resolveMediaUrl(url, origin), url)
})
test('uploads reject private buckets, traversal, active documents and oversized audio', () => {
  for (const input of [
    { bucket: 'tickets', path: 'a.jpg', size: 1 },
    { bucket: 'images', path: '../a.jpg', size: 1 },
    { bucket: 'images', path: 'a.svg', size: 1 },
    { bucket: 'images', path: 'a.html', size: 1 },
    { bucket: 'sets', path: 'a.mp3', size: 500 * 1024 * 1024 + 1 },
  ]) assert.throws(() => validateMediaUpload(input))
})
test('upload policy supplies canonical content types', () => {
  assert.equal(validateMediaUpload({ bucket: 'images', path: 'blogs/a.jpg', size: 100 }).contentType, 'image/jpeg')
  assert.equal(validateMediaUpload({ bucket: 'sets', path: 'a.opus', size: 100 }).contentType, 'audio/ogg')
})

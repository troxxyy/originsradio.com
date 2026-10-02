import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'
import { createRequire } from 'node:module'

async function loadUtility(name, instance = '') {
  const source = await readFile(new URL(`../src/app/lib/${name}.ts`, import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } })
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}#${instance}`)
}

const { eventTimestamp, isUpcomingEvent } = await loadUtility('event-dates')
const now = new Date('2026-10-02T12:00:00Z')

test('yearless and recurring labels are not assigned the current year', () => {
  for (const value of ['November 29, Saturday', 'Every Friday', '', null]) {
    assert.equal(eventTimestamp(value), null)
  }
})

test('ISO dates retain their full date and sort chronologically', () => {
  assert.equal(eventTimestamp('2026-10-03'), Date.parse('2026-10-03'))
  assert.ok(eventTimestamp('March 28, 2024') < eventTimestamp('2026-10-03'))
})

test('past dated events leave upcoming even when the flag is stale', () => {
  assert.equal(isUpcomingEvent({ upcoming: true, date: '2025-08-29' }, now), false)
  assert.equal(isUpcomingEvent({ upcoming: true, date: '2026-10-03' }, now), true)
  assert.equal(isUpcomingEvent({ upcoming: false, date: '2026-10-03' }, now), false)
})

test('event day lasts through midnight in Istanbul', () => {
  const event = { upcoming: true, date: '2026-10-02' }
  assert.equal(isUpcomingEvent(event, new Date('2026-10-02T20:59:59Z')), true)
  assert.equal(isUpcomingEvent(event, new Date('2026-10-02T21:00:00Z')), false)
})

test('editorial flags are preserved when the date has no reliable year', () => {
  assert.equal(isUpcomingEvent({ upcoming: true, date: 'Every Friday' }, now), true)
  assert.equal(isUpcomingEvent({ upcoming: false, date: 'November 29, Saturday' }, now), false)
})

test('anonymous identity is safe without a browser', async () => {
  const { generateUserId } = await loadUtility('browser-identity', 'server')
  assert.equal(generateUserId(), '')
})

test('existing anonymous identity is retained', async () => {
  globalThis.window = { localStorage: { getItem: () => 'existing-id' } }
  try {
    const { generateUserId } = await loadUtility('browser-identity', 'existing')
    assert.equal(generateUserId(), 'existing-id')
  } finally { delete globalThis.window }
})

test('blocked storage keeps one identity for the browser session', async () => {
  globalThis.window = {
    localStorage: { getItem() { throw new Error('blocked') }, setItem() { throw new Error('blocked') } },
    crypto: { randomUUID: () => 'test-uuid' },
  }
  try {
    const { generateUserId } = await loadUtility('browser-identity', 'blocked')
    assert.equal(generateUserId(), 'user_test-uuid')
    assert.equal(generateUserId(), 'user_test-uuid')
  } finally { delete globalThis.window }
})

const proxySource = await readFile(new URL('../src/proxy.ts', import.meta.url), 'utf8')
const proxyCode = ts.transpileModule(proxySource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
const proxyModule = { exports: {} }
const require = createRequire(import.meta.url)
new Function('require', 'exports', proxyCode)(require, proxyModule.exports)
const { proxy } = proxyModule.exports
const { NextRequest } = require('next/server')

test('Snow root rewrites behind a local/reverse proxy and retains query parameters', () => {
  const request = new NextRequest('http://localhost:3100/?lang=tr', { headers: { host: 'snow.originsradio.com' } })
  const response = proxy(request)
  const destination = new URL(response.headers.get('x-middleware-rewrite'))
  assert.equal(destination.pathname, '/snow')
  assert.equal(destination.search, '?lang=tr')
})

test('main site and unrelated hosts never receive the Snow home', () => {
  for (const host of ['originsradio.com', 'snow.example.com', 'snow.originsradio.com.evil.test']) {
    assert.equal(proxy(new NextRequest('http://localhost/', { headers: { host } })).headers.get('x-middleware-rewrite'), null)
  }
})

test('Snow pages and assets do not get rewritten to the home', () => {
  for (const path of ['/lineup', '/_next/static/example.js']) {
    assert.equal(proxy(new NextRequest(`http://localhost${path}`, { headers: { host: 'snow.originsradio.com' } })).headers.get('x-middleware-rewrite'), null)
  }
})

import assert from 'node:assert/strict'

const origin = (process.argv[2] || 'http://127.0.0.1:3100').replace(/\/$/, '')
const site = 'https://originsradio.com'
const request = async (path, agent = 'OAI-SearchBot') => {
  const response = await fetch(`${origin}${path}`, { headers: { 'User-Agent': agent }, signal: AbortSignal.timeout(60000) })
  assert.equal(response.status, 200, `${agent} ${path}: accessible`)
  return { response, body: await response.text() }
}

const { body: sitemap } = await request('/sitemap.xml')
const pageUrls = new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]))
let catalogueBytes = 0
for (const path of ['/llms.txt', '/llms-full.txt']) {
  const { response, body } = await request(path)
  assert.match(response.headers.get('content-type') || '', /text\/plain; charset=utf-8/i)
  assert.match(body, /^# OriginsRadio\n/)
  assert.ok(!/<(?:html|script)\b/i.test(body), `${path}: plain text`)
  assert.ok(!/SUPABASE_ACCESS_TOKEN|service_role|\/artistcontrolsecret|\/adminuploads|\/ticket\/|\/invite\//i.test(body), `${path}: public content only`)
  assert.match(response.headers.get('link') || '', /<\/llms.txt>; rel="describedby"/)
  assert.match(response.headers.get('x-robots-tag') || '', /noindex, follow/)
  for (const match of body.matchAll(/\]\((https:\/\/originsradio\.com[^)]*)\)/g)) {
    const url = match[1]
    if (url.endsWith('.txt') || url.endsWith('.xml')) continue
    assert.ok(pageUrls.has(decodeURI(url)), `Source link belongs to canonical sitemap: ${url}`)
  }
  if (path === '/llms-full.txt') {
    catalogueBytes = Buffer.byteLength(body)
    for (const url of pageUrls) {
      if (/\/(artists|blog|events)\//.test(url)) {
        assert.ok(body.includes(encodeURI(url)) || body.includes(url), `Catalogue includes ${url}`)
      }
    }
  }
}
for (const agent of ['OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot']) {
  const { response, body } = await request('/ankara-elektronik-muzik', agent)
  assert.match(response.headers.get('link') || '', /<\/llms.txt>; rel="describedby"/)
  const html = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  assert.ok(html.includes('/artists/'), `${agent}: profile links before JavaScript`)
  assert.ok(!/noindex/i.test(response.headers.get('x-robots-tag') || ''), `${agent}: source HTML remains indexable`)
}
const { body: robots } = await request('/robots.txt')
assert.match(robots, /User-Agent: \*\s+Allow: \//)
console.log(JSON.stringify({ origin, catalogueBytes, sitemapUrls: pageUrls.size, result: 'PASS', note: 'Synthetic user-agent checks; actual provider crawling is not verified.' }, null, 2))

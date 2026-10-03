import assert from 'node:assert/strict'

// Checks the actual HTTP response, without executing client JavaScript.
// Usage: node scripts/audit_public_seo.mjs http://127.0.0.1:3100
const origin = (process.argv[2] || 'http://127.0.0.1:3100').replace(/\/$/, '')
const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
const attribute = (tag, name) => decode(tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))?.[1] || '')

async function get(path, options) {
  const response = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(60000), ...options })
  return { response, html: await response.text() }
}

function inspect(html) {
  const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map(match => match[0])
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map(match => match[0])
  const ld = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .flatMap(match => JSON.parse(match[1]))
  return {
    body,
    title: decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || ''),
    descriptions: metas.filter(tag => attribute(tag, 'name') === 'description').map(tag => attribute(tag, 'content')),
    canonicals: links.filter(tag => attribute(tag, 'rel') === 'canonical').map(tag => attribute(tag, 'href')),
    ld,
    hrefs: [...body.matchAll(/<a\b[^>]*href="([^"]*)"/gi)].map(match => decode(match[1])),
  }
}

const { response: sitemapResponse, html: sitemap } = await get('/sitemap.xml')
assert.equal(sitemapResponse.status, 200, 'Sitemap must be available')
const urls = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map(match => decode(match[1]))
assert.ok(urls.length > 8, 'Public profiles and articles must be discoverable')
assert.equal(new Set(urls).size, urls.length, 'Sitemap must not repeat URLs')
assert.ok(urls.every(url => !/\/(merch|thisweek|blog-server|events-server|artistcontrolsecret|uploads)(\/|$)/.test(url)), 'Paused and private routes must stay out of sitemap')
const site = new URL(urls[0]).origin
const titles = new Map()
const pages = new Map()

for (let offset = 0; offset < urls.length; offset += 6) {
  const batch = await Promise.all(urls.slice(offset, offset + 6).map(async url => {
    const path = new URL(url).pathname
    const { response, html } = await get(path, { redirect: 'manual' })
    assert.equal(response.status, 200, `${path}: sitemap URL must return 200 without redirects`)
    const page = inspect(html)
    assert.equal(page.canonicals.length, 1, `${path}: one canonical`)
    assert.equal(new URL(page.canonicals[0]).href, new URL(url).href, `${path}: self canonical`)
    assert.equal(page.descriptions.length, 1, `${path}: one description`)
    assert.ok(page.descriptions[0].length > 20, `${path}: useful description`)
    assert.ok(page.title.length > 10, `${path}: useful title`)
    assert.ok(!/Loading (artists|events|blog|article)|Loading…|Loading\.\.\./i.test(page.body), `${path}: content in initial HTML`)
    assert.ok(page.ld.some(item => item['@type'] === 'Organization'), `${path}: publisher identity`)
    assert.ok(!/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html), `${path}: public page must be indexable`)
    if (path.startsWith('/blog/')) {
      const article = page.ld.find(item => item['@type'] === 'BlogPosting')
      assert.ok(article?.headline, `${path}: article schema`)
      const plainBody = decode(page.body.replace(/<[^>]*>/g, ''))
      assert.ok(plainBody.includes(article.headline), `${path}: article headline is visible without JavaScript`)
    }
    if (path.startsWith('/artists/')) {
      const person = page.ld.find(item => item['@type'] === 'Person')
      assert.ok(person?.name, `${path}: profile schema`)
      assert.ok(decode(page.body.replace(/<[^>]*>/g, '')).includes(person.name), `${path}: artist name is visible without JavaScript`)
    }
    return { path, page }
  }))
  for (const { path, page } of batch) {
    assert.ok(!titles.has(page.title), `${path}: duplicate title with ${titles.get(page.title)}`)
    titles.set(page.title, path)
    pages.set(path, page)
  }
}

assert.ok(pages.get('/artists').hrefs.filter(href => href.startsWith('/artists/')).length > 0, 'Roster must have crawlable profile links')
assert.ok(pages.get('/blog').hrefs.filter(href => href.startsWith('/blog/')).length > 0, 'Blog must have crawlable article links')
assert.ok(pages.get('/events').hrefs.filter(href => href.startsWith('/events/')).length > 0, 'Events must have crawlable detail links')
assert.ok(pages.get('/radio/schedule').body.includes('Full weekly programme'), 'Complete programme is present before hydration')
const ankara = pages.get('/ankara-elektronik-muzik')
assert.ok(ankara, 'Turkish Ankara discovery page is included in sitemap')
assert.ok(ankara.ld.some(item => item['@type'] === 'CollectionPage' && item.inLanguage === 'tr'), 'Ankara page identifies its Turkish content')
assert.ok(ankara.hrefs.some(href => href.startsWith('/artists/')), 'Ankara page links to real artist profiles')
assert.ok(ankara.hrefs.some(href => href.startsWith('/events/')), 'Ankara page links to real event archives')
assert.ok(pages.get('/').hrefs.includes('/ankara-elektronik-muzik'), 'Home links to Ankara discovery page')
assert.ok(pages.get('/artists').hrefs.includes('/ankara-elektronik-muzik'), 'Roster links back to Ankara discovery page')

const artistPath = [...pages.keys()].find(path => path.startsWith('/artists/'))
for (const [from, to] of [['/blog-server', '/blog'], ['/events-server', '/events'], [artistPath.replace('/artists', ''), artistPath]]) {
  const { response } = await get(from, { redirect: 'manual' })
  assert.equal(response.status, 308, `${from}: permanent canonical redirect`)
  assert.equal(new URL(response.headers.get('location'), origin).pathname, to)
}
for (const path of ['/blog/__seo_missing_article__', '/artists/__seo_missing_artist__', '/events/__seo_missing_event__']) {
  const { response } = await get(path)
  assert.equal(response.status, 404, `${path}: missing content must not become a soft 404`)
}
const { html: preview } = await get('/thisweek')
assert.match(preview, /name="robots" content="noindex, follow"/, 'Coming-soon preview must be noindex')
const { response: privateResponse } = await get('/artist/login')
assert.match(privateResponse.headers.get('x-robots-tag') || '', /noindex/, 'Private login must be noindex')
const { html: robots } = await get('/robots.txt')
assert.ok(robots.includes(`Sitemap: ${site}/sitemap.xml`), 'Robots must reference the canonical sitemap')

const imageResponse = await fetch(`${origin}/opengraph-image`, { signal: AbortSignal.timeout(60000) })
assert.equal(imageResponse.status, 200, 'Social image must exist')
assert.match(imageResponse.headers.get('content-type') || '', /image\/png/)
const png = Buffer.from(await imageResponse.arrayBuffer())
assert.equal(png.readUInt32BE(16), 1200)
assert.equal(png.readUInt32BE(20), 630)
console.log(JSON.stringify({ origin, sitemapUrls: urls.length, profiles: [...pages.keys()].filter(path => path.startsWith('/artists/')).length, articles: [...pages.keys()].filter(path => path.startsWith('/blog/')).length, events: [...pages.keys()].filter(path => path.startsWith('/events/')).length, canonicalRedirects: 3, missingContent404s: 3, socialImage: '1200x630 PNG', result: 'PASS' }, null, 2))

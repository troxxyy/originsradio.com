import type { MetadataRoute } from 'next'
import { getArtistsForSitemap } from '../lib/artists'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://origins.radio'
  const items = await getArtistsForSitemap()
  
  // Include both root-level artist pages and /artists/ nested pages
  const artistPages = items.flatMap((a) => [
    {
      url: `${base}/${a.slug}`,
      lastModified: new Date(a.lastmod),
      changeFrequency: a.changefreq as MetadataRoute.Sitemap[number]['changeFrequency'],
      priority: a.priority,
    },
    {
      url: `${base}/artists/${a.slug}`,
      lastModified: new Date(a.lastmod),
      changeFrequency: a.changefreq as MetadataRoute.Sitemap[number]['changeFrequency'],
      priority: a.priority,
    }
  ])
  
  return artistPages
}



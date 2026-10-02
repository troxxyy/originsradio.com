import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { getPublicArtists, getPublicBlogs, getPublicProjects } from '@/lib/public-content'

export const revalidate = 300

function lastUpdated(rows: { updated_at?: string | null; created_at?: string | null }[]) {
  const timestamps = rows.map(row => Date.parse(row.updated_at || row.created_at || '')).filter(Number.isFinite)
  return timestamps.length ? new Date(Math.max(...timestamps)) : undefined
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [artists, blogs, projects] = await Promise.all([getPublicArtists(), getPublicBlogs(), getPublicProjects()])
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/` },
    { url: `${SITE_URL}/about` },
    { url: `${SITE_URL}/artists`, lastModified: lastUpdated(artists) },
    { url: `${SITE_URL}/events`, lastModified: lastUpdated(projects) },
    { url: `${SITE_URL}/blog`, lastModified: lastUpdated(blogs) },
    { url: `${SITE_URL}/radio/schedule` },
    { url: `${SITE_URL}/anniversary` },
    { url: `${SITE_URL}/gocrazy` },
    ...artists.filter(artist => artist.slug).map(artist => ({ url: `${SITE_URL}/artists/${artist.slug}`, lastModified: lastUpdated([artist]) })),
    ...projects.filter(project => project.slug).map(project => ({ url: `${SITE_URL}/events/${project.slug}`, lastModified: lastUpdated([project]) })),
    ...blogs.filter(blog => blog.slug).map(blog => ({ url: `${SITE_URL}/blog/${blog.slug}`, lastModified: lastUpdated([blog]) })),
  ]
  // Redirects, private routes and the paused Merch/This Week previews are omitted.
  return Array.from(new Map(pages.map(page => [page.url, page])).values())
}

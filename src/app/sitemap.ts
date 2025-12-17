import type { MetadataRoute } from 'next'
import { getArtistsForSitemap } from '../lib/artists'
import { getOurWorkProjects, generateSlug } from '@/lib/supabase-utils'
import { getPublishedBlogs } from '@/data/blogs-supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://origins.radio'
  const now = new Date()
  
  // Static pages with proper priorities
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${base}/artists`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${base}/events`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${base}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${base}/thisweek`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${base}/radio/schedule`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${base}/gocrazy`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ]
  
  // Fetch artists
  let artistPages: MetadataRoute.Sitemap = []
  try {
    const artists = await getArtistsForSitemap()
    artistPages = artists.map((a) => ({
      url: `${base}/artists/${a.slug}`,
      lastModified: new Date(a.lastmod),
      changeFrequency: a.changefreq as MetadataRoute.Sitemap[number]['changeFrequency'],
      priority: a.priority,
    }))
  } catch (error) {
    console.error('Error fetching artists for sitemap:', error)
  }
  
  // Fetch events/projects
  let eventPages: MetadataRoute.Sitemap = []
  try {
    const events = await getOurWorkProjects()
    eventPages = events
      .filter(event => event.slug) // Only include events with slugs
      .map((event) => ({
        url: `${base}/events/${event.slug}`,
        lastModified: event.updated_at ? new Date(event.updated_at) : event.created_at ? new Date(event.created_at) : now,
        changeFrequency: (event.upcoming ? 'weekly' : 'monthly') as MetadataRoute.Sitemap[number]['changeFrequency'],
        priority: event.upcoming ? 0.8 : 0.6,
      }))
  } catch (error) {
    console.error('Error fetching events for sitemap:', error)
  }
  
  // Fetch published blogs
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const { blogs } = await getPublishedBlogs(1, 1000) // Get all published blogs
    blogPages = blogs.map((blog) => ({
      url: `${base}/blog/${blog.slug || generateSlug(blog.title || 'blog')}`,
      lastModified: blog.updated_at ? new Date(blog.updated_at) : blog.published_at ? new Date(blog.published_at) : blog.created_at ? new Date(blog.created_at) : now,
      changeFrequency: 'monthly' as MetadataRoute.Sitemap[number]['changeFrequency'],
      priority: blog.featured ? 0.8 : 0.6,
    }))
  } catch (error) {
    console.error('Error fetching blogs for sitemap:', error)
  }
  
  // Combine all pages and sort by priority
  const allPages = [...staticPages, ...artistPages, ...eventPages, ...blogPages]
  allPages.sort((a, b) => {
    if (b.priority !== a.priority) {
      return (b.priority || 0) - (a.priority || 0)
    }
    return a.url.localeCompare(b.url)
  })
  
  return allPages
}



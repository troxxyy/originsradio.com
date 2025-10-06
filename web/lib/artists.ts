import { supabase } from './supabase'

export type Artist = {
  id: string
  name: string
  slug: string
  bio: string | null
  photo_url: string | null
  location: string | null
  genre: string[] | null
  featured: boolean
  social_links: Record<string, any> | null
  updated_at: string
  created_at: string
}

export async function getAllArtistSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('artist_sitemap')
    .select('slug')
  if (error || !data) return []
  return data.map((r: { slug: string }) => r.slug)
}

export async function getArtistBySlug(slug: string): Promise<Artist | null> {
  const { data, error } = await supabase
    .rpc('artist_by_slug', { p_slug: slug })
  if (error || !data || data.length === 0) return null
  return data[0] as unknown as Artist
}

export async function getArtistsForSitemap(): Promise<Array<{ slug: string; lastmod: string; changefreq: string; priority: number }>> {
  const { data, error } = await supabase
    .from('artist_sitemap')
    .select('slug,lastmod,changefreq,priority')
  if (error || !data) return []
  return data as Array<{ slug: string; lastmod: string; changefreq: string; priority: number }>
}



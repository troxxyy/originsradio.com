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

// TODO: Replace with real Supabase client in Next.js app
// For now, fetch from a public API route or fallback.

export async function getAllArtistSlugs(): Promise<string[]> {
  // Placeholder: adjust to your data source.
  const res = await fetch(process.env.NEXT_PUBLIC_ARTISTS_SLUGS_URL || 'https://api.origins.radio/artists/slugs', { cache: 'no-store' })
  if (!res.ok) return []
  const slugs = (await res.json()) as string[]
  return slugs
}

export async function getArtistBySlug(slug: string): Promise<Artist | null> {
  const url = (process.env.NEXT_PUBLIC_ARTIST_BY_SLUG_URL || 'https://api.origins.radio/artists') + `/${encodeURIComponent(slug)}`
  const res = await fetch(url, { next: { revalidate: 86400 } })
  if (!res.ok) return null
  const artist = (await res.json()) as Artist
  return artist
}

export async function getArtistsForSitemap(): Promise<Array<{ slug: string; lastmod: string; changefreq: string; priority: number }>> {
  // Ideally from DB with updated_at; fallback to fetch artists list
  const res = await fetch(process.env.NEXT_PUBLIC_ARTISTS_INDEX_URL || 'https://api.origins.radio/artists', { cache: 'no-store' })
  if (!res.ok) return []
  const artists = (await res.json()) as Artist[]
  return artists.map((a) => ({
    slug: a.slug,
    lastmod: a.updated_at || a.created_at,
    changefreq: 'weekly',
    priority: a.featured ? 0.9 : 0.6,
  }))
}



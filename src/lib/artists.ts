import { createClient } from '@supabase/supabase-js'

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

// Create Supabase client for server-side operations
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(supabaseUrl, supabaseKey)
}

export async function getAllArtistSlugs(): Promise<string[]> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('artists')
      .select('slug')
    
    if (error) {
      console.error('Error fetching artist slugs:', error)
      return []
    }
    
    return data?.map(a => a.slug) || []
  } catch (error) {
    console.error('Error in getAllArtistSlugs:', error)
    return []
  }
}

export async function getArtistBySlug(slug: string): Promise<Artist | null> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
    
    if (error) {
      console.error('Error fetching artist by slug:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error in getArtistBySlug:', error)
    return null
  }
}

export async function getArtistsForSitemap(): Promise<Array<{ slug: string; lastmod: string; changefreq: string; priority: number }>> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('artists')
      .select('slug, updated_at, created_at, featured')
    
    if (error) {
      console.error('Error fetching artists for sitemap:', error)
      return []
    }
    
    return data?.map((a) => ({
      slug: a.slug,
      lastmod: a.updated_at || a.created_at,
      changefreq: 'weekly',
      priority: a.featured ? 0.9 : 0.6,
    })) || []
  } catch (error) {
    console.error('Error in getArtistsForSitemap:', error)
    return []
  }
}



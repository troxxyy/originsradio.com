import { supabase, isSupabaseConfigured } from './supabase'

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
  if (!isSupabaseConfigured() || !supabase) {
    return null
  }
  return supabase
}

export async function getAllArtistSlugs(): Promise<string[]> {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) return []

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
    if (!supabase) return null

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
    if (!supabase) return []

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

export async function getArtistSEOData(slug: string): Promise<{
  metadata: {
    title: string
    description: string
    keywords: string
    openGraph: {
      title: string
      description: string
      url: string
      images: Array<{ url: string }>
      type: string
    }
    twitter: {
      card: string
      title: string
      description: string
      images: string[]
    }
    alternates: {
      canonical: string
    }
  }
  structuredData: Array<Record<string, any>>
} | null> {
  try {
    const artist = await getArtistBySlug(slug)
    if (!artist) return null

    const artistName = artist.name
    const artistBio = artist.bio || `Professional DJ and music producer ${artistName}${artist.location ? ` from ${artist.location}` : ''}.`
    const artistGenres = artist.genre?.join(', ') || 'Electronic, House, Techno'
    const artistLocation = artist.location || ''
    const artistPhoto = artist.photo_url || '/placeholder.svg'
    const currentUrl = `https://origins.radio/artists/${slug}`

    // Generate SEO-optimized title and description focusing on "DJ" keywords
    const title = `${artistName} - DJ & Producer | Origins Radio`
    const description = `Listen to DJ ${artistName}'s sets and tracks. ${artistGenres} music producer from ${artistLocation}. Book ${artistName} for events at Origins Radio.`

    // Generate comprehensive keywords
    const keywords = [
      artistName,
      'DJ',
      'music producer',
      'electronic music',
      ...artist.genre || [],
      ...(artistLocation ? [artistLocation] : []),
      'Origins Radio',
      'underground music',
      'techno',
      'house music',
      'DJ sets',
      'music events',
      'booking DJ'
    ].filter(Boolean).join(', ')

    // Structured Data for Rich Search Results
    const structuredData = [
      {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": artistName,
        "description": artistBio,
        "image": artistPhoto,
        "url": currentUrl,
        "sameAs": artist.social_links ? Object.values(artist.social_links) : [],
        "jobTitle": "DJ & Music Producer",
        "worksFor": {
          "@type": "Organization",
          "name": "Origins Radio"
        },
        "address": artistLocation ? {
          "@type": "PostalAddress",
          "addressLocality": artistLocation.split(',')[0]?.trim(),
          "addressCountry": artistLocation.includes('Turkey') ? "Turkey" : undefined
        } : undefined,
        "knowsAbout": artist.genre || ["Electronic Music", "DJing", "Music Production"],
        "hasOccupation": {
          "@type": "Occupation",
          "name": "DJ",
          "description": `Professional DJ specializing in ${artistGenres}`
        },
        "alumniOf": {
          "@type": "Organization",
          "name": "Origins Radio"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://origins.radio"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Artists",
            "item": "https://origins.radio/artists"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": artistName,
            "item": currentUrl
          }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "MusicGroup",
        "name": artistName,
        "url": currentUrl,
        "image": artistPhoto,
        "description": artistBio,
        "genre": artist.genre || ["Electronic Music"],
        "sameAs": artist.social_links ? Object.values(artist.social_links) : []
      }
    ]

    return {
      metadata: {
        title,
        description,
        keywords,
        openGraph: {
          title: `${artistName} - DJ & Producer`,
          description: description,
          url: currentUrl,
          images: [{ url: `/og/${slug}.png` }],
          type: 'profile'
        },
        twitter: {
          card: 'summary_large_image',
          title: `${artistName} - DJ & Producer`,
          description: description,
          images: [`/og/${slug}.png`]
        },
        alternates: {
          canonical: currentUrl
        }
      },
      structuredData
    }
  } catch (error) {
    console.error('Error in getArtistSEOData:', error)
    return null
  }
}



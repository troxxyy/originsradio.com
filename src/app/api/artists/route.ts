import { NextRequest, NextResponse } from 'next/server'
import { getArtists } from '@/data/artists-supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const featured = searchParams.get('featured') === 'true'

    const artists = await getArtists()
    
    let filtered = artists
    if (featured) {
      filtered = artists.filter(a => a.featured)
    }

    return NextResponse.json({ artists: filtered })
  } catch (error) {
    console.error('Error fetching artists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artists' },
      { status: 500 }
    )
  }
}

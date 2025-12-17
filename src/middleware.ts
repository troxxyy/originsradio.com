import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const reserved = new Set([
  '', 'artists', 'api', 'gocrazy', 'ourwork', 'assets', 'favicon', 'robots.txt', 'sitemap.xml', 'manifest.json'
])

export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || ''
  const { pathname } = req.nextUrl
  
  // Check if request is for snow subdomain
  if (hostname.startsWith('snow.')) {
    // If already in snow route, let it through
    if (pathname.startsWith('/lineup') || 
        pathname.startsWith('/hotels') || 
        pathname.startsWith('/prices') || 
        pathname.startsWith('/reservation') || 
        pathname.startsWith('/contact') ||
        pathname === '/') {
      return NextResponse.next()
    }
    // For snow subdomain, ensure we're using the correct paths
    // The route group (snow) will handle the routing
    return NextResponse.next()
  }
  
  const parts = pathname.split('/').filter(Boolean)
  // Only guard top-level slugs
  if (parts.length === 1) {
    const first = parts[0]
    if (reserved.has(first)) {
      return NextResponse.next()
    }
  }
  return NextResponse.next()
}



import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const reserved = new Set([
  '', 'artists', 'api', 'gocrazy', 'ourwork', 'assets', 'favicon', 'robots.txt', 'sitemap.xml', 'manifest.json'
])

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
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



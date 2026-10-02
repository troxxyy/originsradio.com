import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Route groups do not isolate URLs by hostname. Give Snow its own home route.
export function proxy(request: NextRequest) {
  const hostname = (request.headers.get('host') || request.nextUrl.hostname).split(':')[0].toLowerCase()
  if (hostname === 'snow.originsradio.com' && request.nextUrl.pathname === '/') {
    const destination = request.nextUrl.clone()
    destination.pathname = '/snow'
    return NextResponse.rewrite(destination)
  }
  return NextResponse.next()
}

export const config = { matcher: ['/'] }

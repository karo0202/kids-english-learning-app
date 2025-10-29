import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, search, hash } = request.nextUrl

  // Handle trailing slash redirects - redirect to non-trailing slash version
  if (pathname.endsWith('/') && pathname !== '/') {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(0, -1)
    // Preserve query string and hash
    url.search = search
    url.hash = hash
    return NextResponse.redirect(url, 301)
  }

  // Handle favicon.ico requests - redirect to favicon.png
  if (pathname === '/favicon.ico') {
    return NextResponse.redirect(new URL('/favicon.png', request.url), 301)
  }

  // Let Next.js handle everything else
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - Files with extensions
     */
    '/((?!api|_next/static|_next/image|.*\\..*).*)',
  ],
}
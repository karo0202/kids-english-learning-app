import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle favicon.ico requests - redirect to favicon.png
  if (pathname === '/favicon.ico') {
    return NextResponse.redirect(new URL('/favicon.png', request.url), 301)
  }

  // Let Next.js handle everything else including trailing slashes
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Only match favicon requests
    '/favicon.ico',
  ],
}
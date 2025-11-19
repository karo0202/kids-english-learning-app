import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const body = await request.text()
    const headers: Record<string, string> = {}
    
    // Forward all headers (especially webhook signatures)
    request.headers.forEach((value, key) => {
      headers[key] = value
    })
    
    const response = await fetch(`${BACKEND_URL}/api/webhooks/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body,
    })
    
    const data = await response.json()
    
    // For redirects (ZainCash, FIB), return redirect response
    if (response.status === 302 || response.status === 301) {
      const location = response.headers.get('location')
      if (location) {
        return NextResponse.redirect(location)
      }
    }
    
    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error('Webhook proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}


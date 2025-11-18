import { NextRequest, NextResponse } from 'next/server'
import { verifyWhopUser } from '@/lib/whop'

// Verify a user's Whop membership
// POST /api/whop/verify
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get Whop API key from environment variables
    const whopApiKey = process.env.WHOP_API_KEY

    if (!whopApiKey) {
      console.error('WHOP_API_KEY is not set in environment variables')
      return NextResponse.json(
        { error: 'Whop API key not configured' },
        { status: 500 }
      )
    }

    // Verify user with Whop
    const verification = await verifyWhopUser(userId, whopApiKey)

    if (!verification.isValid) {
      return NextResponse.json(
        {
          isValid: false,
          error: verification.error || 'User does not have an active Whop membership',
        },
        { status: 403 }
      )
    }

    return NextResponse.json({
      isValid: true,
      subscription: verification.subscription,
      user: verification.user,
    })
  } catch (error) {
    console.error('Error in Whop verification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


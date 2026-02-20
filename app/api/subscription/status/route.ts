/**
 * Serverless subscription status endpoint
 * Returns subscription status for the authenticated user
 * Dev admin (karolatef143@gmail.com) always gets premium access
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromToken } from '@/lib/verify-auth'
import { getUserSubscriptionStatus } from '@/lib/subscription-supabase'

const DEV_ADMIN_EMAIL = 'karolatef143@gmail.com'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const userId = await getUserIdFromToken(authHeader)

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is dev admin by getting user email from token
    // For dev admin, return premium status immediately
    try {
      // Try to decode token to get email
      const token = authHeader?.replace('Bearer ', '') || ''
      if (token) {
        // Simple check: if we can get user email from session, check it
        // Note: This is a client-side check, but we'll also check server-side
        const { getUserSession } = await import('@/lib/simple-auth')
        // This won't work server-side, so we'll check in subscription-supabase instead
      }
    } catch (error) {
      // Continue with normal flow
    }

    // Get subscription status from database
    const status = await getUserSubscriptionStatus(userId)

    // Note: Dev admin check is handled client-side in subscription.ts
    // This endpoint returns database subscription status
    // Client-side checkModuleAccess() will grant full access for dev admin
    
    return NextResponse.json({
      hasActiveSubscription: status.hasActiveSubscription,
      subscription: status.subscription || null,
      isTrial: status.isTrial || false,
      trialDaysRemaining: status.trialDaysRemaining || 0,
    })
  } catch (error: any) {
    console.error('Error fetching subscription status:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch subscription status',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

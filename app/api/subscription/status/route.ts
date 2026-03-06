/**
 * Serverless subscription status endpoint
 * Returns subscription status for the authenticated user
 * Dev admin (karolatef143@gmail.com) always gets premium access
 */
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getUserIdFromToken } from '@/lib/verify-auth'
import { getUserSubscriptionStatus } from '@/lib/subscription-supabase'

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

    // Decode token for email (Firebase ID token includes email) so we can fallback lookup by email
    let userEmail: string | null = null
    try {
      const token = authHeader?.replace(/^Bearer\s+/i, '')?.trim() || ''
      if (token) {
        const decoded = jwt.decode(token) as { email?: string } | null
        if (decoded?.email && typeof decoded.email === 'string') {
          userEmail = decoded.email.trim().toLowerCase()
        }
      }
    } catch {
      // ignore
    }

    // Get subscription status from database (lookup by user_id, then fallback by user_email)
    const status = await getUserSubscriptionStatus(userId, userEmail)

    if (process.env.NODE_ENV !== 'test') {
      console.log('[subscription/status]', { hasActive: status.hasActiveSubscription, hasEmail: !!userEmail })
    }

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

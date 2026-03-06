/**
 * Admin-only: Check if an email has an active subscription (for support/debug).
 * Secured by SUBSCRIPTION_ADMIN_SECRET. Use to verify a user's subscription before linking.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSubscriptionStatusByEmail } from '@/lib/subscription-supabase'

const ADMIN_SECRET = process.env.SUBSCRIPTION_ADMIN_SECRET

export async function POST(request: NextRequest) {
  if (!ADMIN_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Admin not configured.' },
      { status: 503 }
    )
  }

  const authHeader = request.headers.get('x-admin-secret') || request.headers.get('authorization')
  const secret = authHeader?.replace(/^Bearer\s+/i, '').trim()
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'email is required (string)' },
        { status: 400 }
      )
    }

    const result = await getSubscriptionStatusByEmail(email)
    return NextResponse.json({
      success: true,
      hasActiveSubscription: result.hasActiveSubscription,
      transactionId: result.transactionId ?? null,
      userId: result.userId ?? null,
      expiresAt: result.expiresAt ?? null,
    })
  } catch (error: unknown) {
    console.error('Admin check-email error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    )
  }
}

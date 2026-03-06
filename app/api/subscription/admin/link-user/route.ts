/**
 * Admin-only: Link a subscription (by transaction_id) to a user_id.
 * Use when a user still can't access paid modules after activation because the subscription
 * was stored with a different/wrong user_id. Call with the transaction_id from the payment
 * and the correct Firebase UID so the user gets access.
 * Secured by SUBSCRIPTION_ADMIN_SECRET (same as activate).
 */
import { NextRequest, NextResponse } from 'next/server'
import { linkSubscriptionToUser } from '@/lib/subscription-supabase'

const ADMIN_SECRET = process.env.SUBSCRIPTION_ADMIN_SECRET

export async function POST(request: NextRequest) {
  if (!ADMIN_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Admin not configured. Set SUBSCRIPTION_ADMIN_SECRET in Vercel.' },
      { status: 503 }
    )
  }

  const authHeader = request.headers.get('x-admin-secret') || request.headers.get('authorization')
  const secret = authHeader?.replace(/^Bearer\s+/i, '').trim()
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { transactionId, userId } = body
    if (!transactionId || typeof transactionId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'transactionId is required (string)' },
        { status: 400 }
      )
    }
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'userId is required (Firebase UID string)' },
        { status: 400 }
      )
    }

    const result = await linkSubscriptionToUser(transactionId.trim(), userId.trim())
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription linked to user. They can refresh the app to get access.',
    })
  } catch (error: unknown) {
    console.error('Admin link-user error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to link user',
      },
      { status: 500 }
    )
  }
}

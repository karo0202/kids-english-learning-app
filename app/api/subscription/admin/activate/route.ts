/**
 * Admin-only: Activate a manual payment subscription.
 * After you verify the payment (reference or screenshot), call this to grant the user access.
 * Secured by SUBSCRIPTION_ADMIN_SECRET env var.
 */
import { NextRequest, NextResponse } from 'next/server'
import { activateManualSubscription } from '@/lib/subscription-supabase'

const ADMIN_SECRET = process.env.SUBSCRIPTION_ADMIN_SECRET

export async function POST(request: NextRequest) {
  if (!ADMIN_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Admin activation not configured. Set SUBSCRIPTION_ADMIN_SECRET in Vercel.' },
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
    const { transactionId } = body
    if (!transactionId || typeof transactionId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'transactionId is required' },
        { status: 400 }
      )
    }

    const result = await activateManualSubscription(transactionId.trim())
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription activated. The user now has access to all modules.',
    })
  } catch (error: any) {
    console.error('Admin activate error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to activate' },
      { status: 500 }
    )
  }
}

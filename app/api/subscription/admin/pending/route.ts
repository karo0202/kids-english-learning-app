/**
 * Admin-only: List pending manual payment subscriptions.
 * Secured by SUBSCRIPTION_ADMIN_SECRET env var (same as activate).
 */
import { NextRequest, NextResponse } from 'next/server'
import { listPendingManualSubscriptions } from '@/lib/subscription-supabase'

const ADMIN_SECRET = process.env.SUBSCRIPTION_ADMIN_SECRET

export async function GET(request: NextRequest) {
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

  const result = await listPendingManualSubscriptions()
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 }
    )
  }
  return NextResponse.json({ success: true, list: result.list || [] })
}

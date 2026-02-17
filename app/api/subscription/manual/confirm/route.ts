/**
 * Serverless manual payment confirmation - runs on Vercel
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromToken } from '@/lib/verify-auth'
import { confirmManualPayment } from '@/lib/subscription-supabase'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const userId = await getUserIdFromToken(authHeader)

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { transactionId, reference, notes } = body

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'transactionId is required' },
        { status: 400 }
      )
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { success: false, error: 'Service not configured. Supabase credentials are missing. See SUPABASE_SETUP.md' },
        { status: 503 }
      )
    }

    await confirmManualPayment(userId, transactionId, reference, notes)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Manual confirm error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit confirmation' },
      { status: 500 }
    )
  }
}

/**
 * Admin-only: Debug subscription - returns full details for a transaction ID.
 * Use to verify that user_id was correctly linked.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_SECRET = process.env.SUBSCRIPTION_ADMIN_SECRET
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export async function POST(request: NextRequest) {
  if (!ADMIN_SECRET) {
    return NextResponse.json({ success: false, error: 'Admin not configured.' }, { status: 503 })
  }

  const authHeader = request.headers.get('x-admin-secret') || request.headers.get('authorization')
  const secret = authHeader?.replace(/^Bearer\s+/i, '').trim()
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { transactionId, userId, email } = body

    const result: Record<string, unknown> = {}

    // If transactionId provided, get subscription details
    if (transactionId && typeof transactionId === 'string') {
      const { data: sub, error } = await supabase
        .from('subscriptions')
        .select('id, user_id, user_email, status, plan_id, transaction_id, expires_at, created_at')
        .eq('transaction_id', transactionId.trim())
        .single()
      result.byTransactionId = { sub, error: error?.message }
    }

    // If userId provided, check if there's an active subscription
    if (userId && typeof userId === 'string') {
      const { data: subs, error } = await supabase
        .from('subscriptions')
        .select('id, user_id, user_email, status, plan_id, transaction_id, expires_at')
        .eq('user_id', userId.trim())
        .order('created_at', { ascending: false })
        .limit(5)
      result.byUserId = { subs, error: error?.message }
    }

    // If email provided, check subscriptions with that email
    if (email && typeof email === 'string') {
      const { data: subs, error } = await supabase
        .from('subscriptions')
        .select('id, user_id, user_email, status, plan_id, transaction_id, expires_at')
        .eq('user_email', email.trim().toLowerCase())
        .order('created_at', { ascending: false })
        .limit(5)
      result.byEmail = { subs, error: error?.message }
    }

    return NextResponse.json({ success: true, ...result })
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed',
    }, { status: 500 })
  }
}

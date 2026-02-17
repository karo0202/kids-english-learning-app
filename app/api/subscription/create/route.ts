/**
 * Serverless subscription create - runs on Vercel, no separate backend needed
 * Handles fib_manual (phone number) payment
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromToken } from '@/lib/verify-auth'
import { createSubscriptionPayment, seedPlansIfNeeded } from '@/lib/subscription-supabase'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const body = await request.json()
    const userId = await getUserIdFromToken(authHeader, body.userId)

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in.' },
        { status: 401 }
      )
    }

    const { planId, paymentMethod } = body

    if (!planId || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'planId and paymentMethod are required' },
        { status: 400 }
      )
    }

    if (paymentMethod !== 'fib_manual') {
      return NextResponse.json(
        { success: false, error: 'Only phone number payment is supported. Use fib_manual.' },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment service not configured',
          message: 'Supabase is not set. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel Environment Variables. See SUPABASE_SETUP.md for instructions.',
          requiresBackend: true,
        },
        { status: 503 }
      )
    }

    if (!process.env.FIB_PHONE_NUMBER) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment service not configured',
          message: 'FIB_PHONE_NUMBER is not set. Add your phone number in Vercel Environment Variables.',
          requiresBackend: true,
        },
        { status: 503 }
      )
    }

    await seedPlansIfNeeded()
    const result = await createSubscriptionPayment(userId, planId, paymentMethod)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Subscription create error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create subscription',
      },
      { status: 500 }
    )
  }
}

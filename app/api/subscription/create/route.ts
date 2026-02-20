/**
 * Serverless subscription create - runs on Vercel, no separate backend needed
 * Handles fib_manual (phone number) payment
 * Includes: Rate limiting, request logging, email notifications
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromToken } from '@/lib/verify-auth'
import { createSubscriptionPayment, seedPlansIfNeeded } from '@/lib/subscription-supabase'
import { checkRateLimit, getRateLimitHeaders, getRateLimitIdentifier } from '@/lib/rate-limit'
import { logPaymentAction, getRequestMetadata } from '@/lib/payment-logger'
import { sendPaymentCreatedEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  const requestMetadata = getRequestMetadata(request)
  let userId: string | null = null

  try {
    const authHeader = request.headers.get('authorization')
    const body = await request.json()
    userId = await getUserIdFromToken(authHeader, body.userId)

    if (!userId) {
      await logPaymentAction({
        user_id: 'anonymous',
        action: 'payment_failed',
        ip_address: requestMetadata.ip_address,
        user_agent: requestMetadata.user_agent,
        error_message: 'Authentication required',
      })
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in.' },
        { status: 401 }
      )
    }

    // Rate limiting: 5 requests per minute per user
    const identifier = getRateLimitIdentifier(request, userId)
    const rateLimit = checkRateLimit(identifier, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 5,
    })

    if (!rateLimit.allowed) {
      await logPaymentAction({
        user_id: userId,
        action: 'rate_limit_exceeded',
        ip_address: requestMetadata.ip_address,
        user_agent: requestMetadata.user_agent,
      })
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please wait before trying again.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            ...getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime),
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    const { planId, paymentMethod } = body

    if (!planId || !paymentMethod) {
      await logPaymentAction({
        user_id: userId,
        action: 'payment_failed',
        ip_address: requestMetadata.ip_address,
        user_agent: requestMetadata.user_agent,
        error_message: 'Missing planId or paymentMethod',
      })
      return NextResponse.json(
        { success: false, error: 'planId and paymentMethod are required' },
        { status: 400 }
      )
    }

    if (paymentMethod !== 'fib_manual') {
      await logPaymentAction({
        user_id: userId,
        action: 'payment_failed',
        plan_id: planId,
        payment_method: paymentMethod,
        ip_address: requestMetadata.ip_address,
        user_agent: requestMetadata.user_agent,
        error_message: 'Invalid payment method',
      })
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

    // Get plan price for logging and email
    const FALLBACK_PLANS = [
      { planId: 'monthly', price: 13000, currency: 'IQD', name: 'Monthly Plan' },
      { planId: 'yearly', price: 125000, currency: 'IQD', name: 'Yearly Plan' },
      { planId: 'lifetime', price: 200000, currency: 'IQD', name: 'Lifetime Plan' },
    ]
    const plan = FALLBACK_PLANS.find(p => p.planId === planId) || { price: 0, currency: 'IQD', name: planId }

    // Log successful payment creation
    await logPaymentAction({
      user_id: userId,
      action: 'create_payment',
      transaction_id: result.transactionId,
      plan_id: planId,
      amount: plan.price,
      currency: plan.currency,
      payment_method: paymentMethod,
      ip_address: requestMetadata.ip_address,
      user_agent: requestMetadata.user_agent,
      metadata: {
        subscriptionId: result.subscriptionId,
      },
    })

    // Send email notification (non-blocking)
    if (result.manualInstructions && result.manualInstructions.phoneNumber) {
      // Get user email from Firebase or Supabase
      const userEmail = body.userEmail || process.env.ADMIN_EMAIL // Fallback to admin email
      if (userEmail) {
        sendPaymentCreatedEmail({
          to: userEmail,
          userName: body.userName || 'User',
          transactionId: result.transactionId,
          amount: plan.price,
          currency: plan.currency,
          planName: plan.name,
          paymentMethod: paymentMethod,
          phoneNumber: result.manualInstructions.phoneNumber,
          accountName: result.manualInstructions.accountName,
        }).catch((error) => {
          console.error('Failed to send payment email:', error)
        })
      }
    }

    return NextResponse.json(result, {
      headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime),
    })
  } catch (error: any) {
    console.error('Subscription create error:', error)
    
    // Log error
    if (userId) {
      await logPaymentAction({
        user_id: userId,
        action: 'payment_failed',
        ip_address: requestMetadata.ip_address,
        user_agent: requestMetadata.user_agent,
        error_message: error.message || 'Unknown error',
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create subscription',
      },
      { status: 500 }
    )
  }
}

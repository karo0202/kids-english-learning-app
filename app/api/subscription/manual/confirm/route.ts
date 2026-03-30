/**
 * Serverless manual payment confirmation - runs on Vercel
 * Includes: Rate limiting, request logging
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromToken } from '@/lib/verify-auth'
import {
  confirmManualPayment,
  getSubscriptionUserEmailByTransactionId,
} from '@/lib/subscription-supabase'
import { checkRateLimit, getRateLimitHeaders, getRateLimitIdentifier } from '@/lib/rate-limit'
import { logPaymentAction, getRequestMetadata } from '@/lib/payment-logger'
import { sendAdminPaymentProofSubmittedEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  const requestMetadata = getRequestMetadata(request)
  let userId: string | null = null

  try {
    const authHeader = request.headers.get('authorization')
    userId = await getUserIdFromToken(authHeader)

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

    // Rate limiting: 10 confirmations per minute per user
    const identifier = getRateLimitIdentifier(request, userId)
    const rateLimit = checkRateLimit(identifier, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10, // More lenient for confirmations
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
          error: 'Too many confirmation attempts. Please wait before trying again.',
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

    const body = await request.json()
    const { transactionId, reference, proofUrl, contactPhone, notes } = body

    if (!transactionId) {
      await logPaymentAction({
        user_id: userId,
        action: 'payment_failed',
        ip_address: requestMetadata.ip_address,
        user_agent: requestMetadata.user_agent,
        error_message: 'Missing transactionId',
      })
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

    await confirmManualPayment(userId, transactionId, { reference, proofUrl, contactPhone, notes })

    // Log successful confirmation
    await logPaymentAction({
      user_id: userId,
      action: 'confirm_payment',
      transaction_id: transactionId,
      ip_address: requestMetadata.ip_address,
      user_agent: requestMetadata.user_agent,
      metadata: {
        reference: reference || null,
        proofUrl: proofUrl || null,
        contactPhone: contactPhone || null,
        hasNotes: !!notes,
      },
    })

    const bodyUserEmail =
      typeof body.userEmail === 'string' ? body.userEmail.trim() || undefined : undefined
    const emailFromSub = await getSubscriptionUserEmailByTransactionId(transactionId)
    const userEmail = bodyUserEmail || emailFromSub
    const notesPreview =
      typeof notes === 'string' && notes.trim()
        ? notes.trim().slice(0, 280) + (notes.trim().length > 280 ? '…' : '')
        : undefined
    const hasProof =
      typeof proofUrl === 'string' &&
      proofUrl.trim().length > 0 &&
      !proofUrl.trim().startsWith('undefined')

    sendAdminPaymentProofSubmittedEmail({
      transactionId,
      userId,
      userEmail,
      reference: typeof reference === 'string' ? reference : undefined,
      hasProofScreenshot: hasProof,
      contactPhone: typeof contactPhone === 'string' ? contactPhone : undefined,
      notesPreview,
    }).catch((err) => console.error('Failed to send admin proof-submitted email:', err))

    return NextResponse.json(
      { success: true, message: 'Payment confirmation submitted successfully. We will verify and activate your subscription soon.' },
      {
        headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime),
      }
    )
  } catch (error: any) {
    console.error('Manual confirm error:', error)
    
    // Log error (don't try to read body again - already read above)
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
      { success: false, error: error.message || 'Failed to submit confirmation' },
      { status: 500 }
    )
  }
}

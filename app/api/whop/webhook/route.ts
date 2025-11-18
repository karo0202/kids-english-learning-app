import { NextRequest, NextResponse } from 'next/server'
import { verifyWhopWebhookSignature } from '@/lib/whop'
import { getFirestoreClient } from '@/lib/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

// Handle Whop webhook events
// POST /api/whop/webhook
export async function POST(request: NextRequest) {
  try {
    // Get webhook secret from environment
    const webhookSecret = process.env.WHOP_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('WHOP_WEBHOOK_SECRET is not set')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Get raw body for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('x-whop-signature') || ''

    // Verify webhook signature
    if (!verifyWhopWebhookSignature(rawBody, signature, webhookSecret)) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse webhook payload
    const event = JSON.parse(rawBody)

    console.log('Whop webhook event received:', event.type)

    // Handle different webhook event types
    switch (event.type) {
      case 'membership.created':
      case 'membership.updated':
      case 'membership.renewed':
        await handleMembershipUpdate(event.data)
        break

      case 'membership.cancelled':
      case 'membership.expired':
        await handleMembershipCancellation(event.data)
        break

      default:
        console.log('Unhandled webhook event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing Whop webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle membership creation/update
async function handleMembershipUpdate(membershipData: any) {
  const firestore = getFirestoreClient()
  if (!firestore) {
    console.error('Firestore not available')
    return
  }

  try {
    const userId = membershipData.user_id || membershipData.user?.id
    if (!userId) {
      console.error('No user ID in membership data')
      return
    }

    // Store subscription in Firestore
    const subscriptionRef = doc(firestore, 'whop_subscriptions', userId)
    await setDoc(
      subscriptionRef,
      {
        userId,
        subscriptionId: membershipData.id,
        productId: membershipData.product_id,
        planId: membershipData.plan_id,
        status: membershipData.status || 'active',
        createdAt: membershipData.created_at,
        expiresAt: membershipData.expires_at,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    console.log(`Updated Whop subscription for user: ${userId}`)
  } catch (error) {
    console.error('Error updating membership:', error)
  }
}

// Handle membership cancellation/expiration
async function handleMembershipCancellation(membershipData: any) {
  const firestore = getFirestoreClient()
  if (!firestore) {
    console.error('Firestore not available')
    return
  }

  try {
    const userId = membershipData.user_id || membershipData.user?.id
    if (!userId) {
      console.error('No user ID in membership data')
      return
    }

    // Update subscription status in Firestore
    const subscriptionRef = doc(firestore, 'whop_subscriptions', userId)
    await setDoc(
      subscriptionRef,
      {
        userId,
        status: membershipData.status || 'cancelled',
        cancelledAt: membershipData.cancelled_at || new Date().toISOString(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    console.log(`Cancelled Whop subscription for user: ${userId}`)
  } catch (error) {
    console.error('Error cancelling membership:', error)
  }
}


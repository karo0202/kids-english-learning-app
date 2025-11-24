import Subscription, { ISubscription } from '../models/Subscription'
import SubscriptionPlan from '../models/SubscriptionPlan'
import PaymentTransaction from '../models/PaymentTransaction'
import { generateTransactionId } from '../utils/paymentToken'

export interface CreateSubscriptionParams {
  userId: string
  planId: string
  paymentMethod: 'crypto' | 'zaincash' | 'fastpay' | 'nasspay' | 'fib' | 'crypto_manual' | 'fib_manual'
  transactionId: string
  providerTransactionId?: string
  amount: number
  currency?: string
  metadata?: Record<string, any>
}

/**
 * Create a new subscription
 */
export async function createSubscription(
  params: CreateSubscriptionParams
): Promise<ISubscription> {
  // Get plan details
  const plan = await SubscriptionPlan.findOne({ planId: params.planId, isActive: true })
  if (!plan) {
    throw new Error(`Plan ${params.planId} not found or inactive`)
  }

  // Calculate expiration date
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + plan.duration)

  // Create subscription
  const subscription = new Subscription({
    userId: params.userId,
    planId: params.planId,
    status: 'pending',
    paymentMethod: params.paymentMethod,
    transactionId: params.transactionId,
    providerTransactionId: params.providerTransactionId,
    amount: params.amount,
    currency: params.currency || 'USD',
    expiresAt,
    metadata: params.metadata || {},
  })

  await subscription.save()
  return subscription
}

/**
 * Activate subscription after payment confirmation
 */
export async function activateSubscription(
  transactionId: string,
  providerTransactionId?: string
): Promise<ISubscription | null> {
  const subscription = await Subscription.findOne({ transactionId })
  
  if (!subscription) {
    console.error(`Subscription not found for transaction: ${transactionId}`)
    return null
  }

  // Check if already activated (idempotency)
  if (subscription.status === 'active') {
    console.log(`Subscription ${subscription._id} already active`)
    return subscription
  }

  // Update subscription
  subscription.status = 'active'
  if (providerTransactionId) {
    subscription.providerTransactionId = providerTransactionId
  }
  await subscription.save()

  // Update payment transaction
  await PaymentTransaction.findOneAndUpdate(
    { transactionId },
    {
      status: 'completed',
      providerTransactionId,
    }
  )

  return subscription
}

/**
 * Get active subscription for user
 */
export async function getActiveSubscription(userId: string): Promise<ISubscription | null> {
  const subscription = await Subscription.findOne({
    userId,
    status: 'active',
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 })

  return subscription
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getActiveSubscription(userId)
  return subscription !== null
}

/**
 * Expire old subscriptions (run as cron job)
 */
export async function expireOldSubscriptions(): Promise<number> {
  const result = await Subscription.updateMany(
    {
      status: 'active',
      expiresAt: { $lte: new Date() },
    },
    {
      status: 'expired',
    }
  )

  return result.modifiedCount
}


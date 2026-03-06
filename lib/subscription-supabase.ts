/**
 * Serverless subscription logic using Supabase (PostgreSQL) - works globally including Iraq
 */
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase not configured - using fallback mode')
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

const FALLBACK_PLANS = [
  { planId: 'monthly', name: 'Monthly Plan', description: 'Full access for 30 days', duration: 30, price: 13000, currency: 'IQD', features: ['Access to all learning modules', 'Unlimited child profiles', 'Progress tracking', 'Email support'], isActive: true },
  { planId: 'yearly', name: 'Yearly Plan', description: 'Full access for 365 days (Save 20%)', duration: 365, price: 125000, currency: 'IQD', features: ['Access to all learning modules', 'Unlimited child profiles', 'Progress tracking', 'Priority email support', 'Early access to new features'], isActive: true },
  { planId: 'lifetime', name: 'Lifetime Plan', description: 'One-time payment, lifetime access', duration: 9999, price: 200000, currency: 'IQD', features: ['Lifetime access to all modules', 'Unlimited child profiles', 'Advanced progress tracking', 'Priority support', 'Early access to new features', 'Exclusive content'], isActive: true },
]

function generatePaymentToken(): string {
  return `pay_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`
}

function getManualFIBConfig() {
  const phoneNumber = process.env.FIB_PHONE_NUMBER || ''
  if (!phoneNumber) throw new Error('FIB phone number is not configured. Set FIB_PHONE_NUMBER in Vercel.')
  return {
    accountName: process.env.FIB_ACCOUNT_NAME,
    phoneNumber,
    qrCodeUrl: process.env.FIB_QR_IMAGE_URL,
    qrCodeText: process.env.FIB_QR_TEXT,
    note: process.env.FIB_MANUAL_NOTE,
  }
}

export async function seedPlansIfNeeded() {
  if (!supabase) return

  for (const plan of FALLBACK_PLANS) {
    // Map camelCase to snake_case for Supabase
    await supabase
      .from('subscription_plans')
      .upsert({
        plan_id: plan.planId,
        name: plan.name,
        description: plan.description,
        duration: plan.duration,
        price: plan.price,
        currency: plan.currency,
        features: plan.features,
        is_active: plan.isActive,
      }, { 
        onConflict: 'plan_id',
        ignoreDuplicates: false // Force update existing rows
      })
  }
}

export async function createSubscriptionPayment(
  userId: string,
  planId: string,
  paymentMethod: string,
  userEmail?: string | null
) {
  // SECURITY: Always fetch plan from database first, fallback to hardcoded
  let plan = null
  
  if (supabase) {
    const { data: dbPlan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('plan_id', planId)
      .eq('is_active', true)
      .single()
    
    if (dbPlan) {
      plan = {
        planId: dbPlan.plan_id,
        name: dbPlan.name,
        description: dbPlan.description,
        duration: dbPlan.duration,
        price: parseFloat(dbPlan.price),
        currency: dbPlan.currency,
        features: Array.isArray(dbPlan.features) ? dbPlan.features : [],
        isActive: dbPlan.is_active,
      }
    }
  }

  // Fallback to hardcoded plans if database doesn't have it
  if (!plan) {
    plan = FALLBACK_PLANS.find(p => p.planId === planId)
  }

  if (!plan) {
    throw new Error(`Plan ${planId} not found or inactive`)
  }

  const transactionId = generatePaymentToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + plan.duration)

  if (supabase) {
    // SECURITY: Check for duplicate transaction (idempotency)
    // Note: This is basic - for production, use a unique constraint on transaction_id
    const { data: existing } = await supabase
      .from('payment_transactions')
      .select('id')
      .eq('transaction_id', transactionId)
      .single()

    if (existing) {
      throw new Error('Transaction ID collision - please try again')
    }

    // Store in Supabase. Optional: add user_email for email fallback — ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS user_email TEXT;
    const insertPayload: Record<string, unknown> = {
      user_id: userId,
      plan_id: planId,
      status: 'pending',
      payment_method: paymentMethod,
      transaction_id: transactionId,
      amount: plan.price,
      currency: plan.currency,
      expires_at: expiresAt.toISOString(),
    }
    if (userEmail != null && userEmail !== '') {
      insertPayload.user_email = userEmail.trim().toLowerCase()
    }
    let result = await supabase.from('subscriptions').insert(insertPayload).select().single()
    // If user_email column is missing (e.g. "Could not find the 'user_email' column... in the schema cache"), retry without it
    const errMsg = result.error?.message ?? ''
    if (result.error && insertPayload.user_email !== undefined && /user_email/.test(errMsg) && (/column|schema|cache|does not exist/i.test(errMsg) || errMsg.includes("'user_email'"))) {
      delete insertPayload.user_email
      result = await supabase.from('subscriptions').insert(insertPayload).select().single()
    }
    const { data: subscription, error: subError } = result

    if (subError) {
      throw new Error('Failed to create subscription: ' + subError.message)
    }

    const { error: txError } = await supabase
      .from('payment_transactions')
      .insert({
        transaction_id: transactionId,
        user_id: userId,
        subscription_id: subscription?.id,
        payment_method: paymentMethod,
        amount: plan.price,
        currency: plan.currency,
        status: 'pending',
        provider_response: {},
      })

    if (txError) {
      throw new Error('Failed to create transaction: ' + txError.message)
    }
  }

  const manualInstructions =
    paymentMethod === 'fib_manual'
      ? {
          type: 'fib_manual',
          ...getManualFIBConfig(),
          transactionId,
        }
      : null

  return {
    success: true,
    transactionId,
    paymentUrl: '',
    subscriptionId: supabase ? 'sub_' + transactionId : transactionId,
    manualPayment: !!manualInstructions,
    manualInstructions,
    paymentMethod,
  }
}

export async function confirmManualPayment(
  userId: string,
  transactionId: string,
  payload: { reference?: string; proofUrl?: string; contactPhone?: string; notes?: string }
) {
  if (!supabase) {
    return { success: true }
  }

  const { reference, proofUrl, contactPhone, notes } = payload

  // SECURITY: Verify transaction exists and belongs to user
  const { data: transaction, error: fetchError } = await supabase
    .from('payment_transactions')
    .select('user_id, created_at, status')
    .eq('transaction_id', transactionId)
    .single()

  if (fetchError || !transaction) {
    throw new Error('Transaction not found')
  }

  if (transaction.user_id !== userId) {
    throw new Error('Unauthorized: Transaction does not belong to this user')
  }

  // SECURITY: Check if transaction already confirmed
  if (transaction.status === 'completed' || transaction.status === 'approved') {
    throw new Error('Transaction already confirmed')
  }

  // SECURITY: Check transaction expiration (24 hours)
  const createdAt = new Date(transaction.created_at)
  const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
  if (hoursSinceCreation > 24) {
    throw new Error('Transaction expired. Please create a new payment.')
  }

  // SECURITY: Sanitize user inputs (proofUrl can be a long data: URL for uploaded screenshots)
  const sanitizedReference = reference?.trim().substring(0, 200) || undefined
  const sanitizedNotes = notes?.trim().substring(0, 1000) || undefined
  const sanitizedProofUrl = proofUrl?.trim().substring(0, 800000) || undefined
  const sanitizedContactPhone = contactPhone?.trim().substring(0, 50) || undefined

  const manualConfirmation = {
    submittedAt: new Date().toISOString(),
    reference: sanitizedReference,
    proofUrl: sanitizedProofUrl,
    contactPhone: sanitizedContactPhone,
    notes: sanitizedNotes,
  }

  const { error: updateError } = await supabase
    .from('payment_transactions')
    .update({
      provider_response: { manualConfirmation },
      status: 'pending', // Still pending until admin verifies
    })
    .eq('transaction_id', transactionId)
    .eq('user_id', userId) // Double-check user ownership

  if (updateError) {
    throw new Error('Failed to update transaction: ' + updateError.message)
  }

  await supabase
    .from('subscriptions')
    .update({
      metadata: { manualConfirmation },
    })
    .eq('transaction_id', transactionId)
    .eq('user_id', userId) // Ensure user owns the subscription too

  return { success: true }
}

const MANUAL_PAYMENT_METHODS = ['fib_manual', 'manual']

/**
 * List pending manual subscriptions (admin only). Used by the admin payments page.
 */
export async function listPendingManualSubscriptions(): Promise<{
  success: boolean
  error?: string
  list?: Array<{
    id: string
    user_id: string
    transaction_id: string
    plan_id: string
    created_at: string
    metadata: { manualConfirmation?: { reference?: string; proofUrl?: string; contactPhone?: string; notes?: string } } | null
  }>
}> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' }
  }

  const { data: rows, error } = await supabase
    .from('subscriptions')
    .select('id, user_id, transaction_id, plan_id, created_at, metadata')
    .eq('status', 'pending')
    .in('payment_method', MANUAL_PAYMENT_METHODS)
    .order('created_at', { ascending: false })

  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true, list: rows || [] }
}

/**
 * Activate a manual payment subscription (admin only).
 * Sets subscription and payment_transactions status to active/completed so the user gets access.
 */
export async function activateManualSubscription(transactionId: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' }
  }

  const { data: sub, error: subFetchError } = await supabase
    .from('subscriptions')
    .select('id, user_id, plan_id, expires_at')
    .eq('transaction_id', transactionId)
    .single()

  if (subFetchError || !sub) {
    return { success: false, error: 'Subscription not found for this transaction' }
  }

  const { error: subUpdateError } = await supabase
    .from('subscriptions')
    .update({ status: 'active' })
    .eq('transaction_id', transactionId)
    .eq('user_id', sub.user_id)

  if (subUpdateError) {
    return { success: false, error: 'Failed to activate subscription: ' + subUpdateError.message }
  }

  const { error: txUpdateError } = await supabase
    .from('payment_transactions')
    .update({ status: 'completed' })
    .eq('transaction_id', transactionId)
    .eq('user_id', sub.user_id)

  if (txUpdateError) {
    return { success: false, error: 'Failed to update transaction: ' + txUpdateError.message }
  }

  return { success: true }
}

/**
 * Admin: Link a subscription (by transaction_id) to a specific user_id.
 * Use when a user's subscription was created with wrong/missing user_id so they can't access paid modules.
 */
export async function linkSubscriptionToUser(
  transactionId: string,
  newUserId: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' }
  }

  const { data: sub, error: fetchErr } = await supabase
    .from('subscriptions')
    .select('id, user_id')
    .eq('transaction_id', transactionId)
    .single()

  if (fetchErr || !sub) {
    return { success: false, error: 'Subscription not found for this transaction' }
  }

  const { error: subUpdateErr } = await supabase
    .from('subscriptions')
    .update({ user_id: newUserId })
    .eq('transaction_id', transactionId)

  if (subUpdateErr) {
    return { success: false, error: 'Failed to update subscription: ' + subUpdateErr.message }
  }

  const { error: txUpdateErr } = await supabase
    .from('payment_transactions')
    .update({ user_id: newUserId })
    .eq('transaction_id', transactionId)

  if (txUpdateErr) {
    return { success: false, error: 'Failed to update transaction: ' + txUpdateErr.message }
  }

  return { success: true }
}

export async function getUserSubscriptionStatus(userId: string, userEmail?: string | null) {
  if (!supabase) {
    return {
      hasActiveSubscription: false,
      subscription: null,
      isTrial: false,
      trialDaysRemaining: 0,
    }
  }

  // 1) Look up by user_id first
  let { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*, subscription_plans(*)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // 2) Fallback: if no subscription by user_id and we have email, try by user_email (column must exist)
  let foundByEmail = false
  if ((error || !subscription) && userEmail) {
    try {
      const { data: subByEmail, error: emailErr } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_email', userEmail.trim().toLowerCase())
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (!emailErr && subByEmail) {
        subscription = subByEmail
        error = null
        foundByEmail = true
        // Auto-repair: link this subscription to current user_id so future lookups work without email
        if (subByEmail.user_id !== userId && subByEmail.transaction_id) {
          await supabase
            .from('subscriptions')
            .update({ user_id: userId })
            .eq('id', subByEmail.id)
          await supabase
            .from('payment_transactions')
            .update({ user_id: userId })
            .eq('transaction_id', subByEmail.transaction_id)
        }
      }
    } catch {
      // user_email column may not exist yet; ignore
    }
  }

  if (error || !subscription) {
    return {
      hasActiveSubscription: false,
      subscription: null,
      isTrial: false,
      trialDaysRemaining: 0,
    }
  }

  // Check if subscription is expired
  const expiresAt = subscription.expires_at ? new Date(subscription.expires_at) : null
  const isExpired = expiresAt && expiresAt < new Date()

  if (isExpired) {
    return {
      hasActiveSubscription: false,
      subscription: null,
      isTrial: false,
      trialDaysRemaining: 0,
    }
  }

  return {
    hasActiveSubscription: true,
    subscription: {
      id: subscription.id,
      planId: subscription.plan_id,
      status: subscription.status,
      expiresAt: subscription.expires_at,
      createdAt: subscription.created_at,
    },
    isTrial: false,
    trialDaysRemaining: 0,
  }
}

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
  { planId: 'lifetime', name: 'Lifetime Plan', description: 'One-time payment, lifetime access', duration: 9999, price: 260000, currency: 'IQD', features: ['Lifetime access to all modules', 'Unlimited child profiles', 'Advanced progress tracking', 'Priority support', 'Early access to new features', 'Exclusive content'], isActive: true },
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
    await supabase
      .from('subscription_plans')
      .upsert(plan, { onConflict: 'planId' })
  }
}

export async function createSubscriptionPayment(userId: string, planId: string, paymentMethod: string) {
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

    // Store in Supabase
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        status: 'pending',
        payment_method: paymentMethod,
        transaction_id: transactionId,
        amount: plan.price,
        currency: plan.currency,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

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

export async function confirmManualPayment(userId: string, transactionId: string, reference?: string, notes?: string) {
  if (!supabase) {
    return { success: true }
  }

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

  // SECURITY: Sanitize user inputs (basic - consider using DOMPurify for production)
  const sanitizedReference = reference?.trim().substring(0, 200) || undefined
  const sanitizedNotes = notes?.trim().substring(0, 1000) || undefined

  const manualConfirmation = {
    submittedAt: new Date().toISOString(),
    reference: sanitizedReference,
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

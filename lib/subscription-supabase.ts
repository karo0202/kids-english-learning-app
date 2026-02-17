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
  { planId: 'monthly', name: 'Monthly Plan', description: 'Full access for 30 days', duration: 30, price: 9.99, currency: 'USD', features: ['Access to all learning modules', 'Unlimited child profiles', 'Progress tracking', 'Email support'], isActive: true },
  { planId: 'yearly', name: 'Yearly Plan', description: 'Full access for 365 days (Save 20%)', duration: 365, price: 95.99, currency: 'USD', features: ['Access to all learning modules', 'Unlimited child profiles', 'Progress tracking', 'Priority email support', 'Early access to new features'], isActive: true },
  { planId: 'lifetime', name: 'Lifetime Plan', description: 'One-time payment, lifetime access', duration: 9999, price: 199.99, currency: 'USD', features: ['Lifetime access to all modules', 'Unlimited child profiles', 'Advanced progress tracking', 'Priority support', 'Early access to new features', 'Exclusive content'], isActive: true },
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
  const plan = FALLBACK_PLANS.find(p => p.planId === planId)
  if (!plan) throw new Error(`Plan ${planId} not found`)

  const transactionId = generatePaymentToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + plan.duration)

  if (supabase) {
    // Store in Supabase
    const { data: subscription } = await supabase
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

    await supabase
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

  const manualConfirmation = {
    submittedAt: new Date().toISOString(),
    reference,
    notes,
  }

  await supabase
    .from('payment_transactions')
    .update({
      provider_response: { manualConfirmation },
      status: 'pending',
    })
    .eq('transaction_id', transactionId)
    .eq('user_id', userId)

  await supabase
    .from('subscriptions')
    .update({
      metadata: { manualConfirmation },
    })
    .eq('transaction_id', transactionId)

  return { success: true }
}

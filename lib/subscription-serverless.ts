/**
 * Serverless subscription logic - runs on Vercel without separate backend
 */
import { connectDB } from './mongodb'
import mongoose from 'mongoose'
import crypto from 'crypto'

// Inline schemas to avoid importing from backend
const SubscriptionPlanSchema = new mongoose.Schema(
  {
    planId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    features: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    planId: { type: String, required: true },
    status: { type: String, enum: ['active', 'pending', 'expired', 'cancelled'], default: 'pending' },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    expiresAt: { type: Date, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
)

const PaymentTransactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    subscriptionId: { type: String },
    paymentMethod: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled'], default: 'pending' },
    providerResponse: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
)

const SubscriptionPlan = mongoose.models.SubscriptionPlan || mongoose.model('SubscriptionPlan', SubscriptionPlanSchema)
const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema)
const PaymentTransaction = mongoose.models.PaymentTransaction || mongoose.model('PaymentTransaction', PaymentTransactionSchema)

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
  await connectDB()
  for (const plan of FALLBACK_PLANS) {
    await SubscriptionPlan.findOneAndUpdate(
      { planId: plan.planId },
      plan,
      { upsert: true, new: true }
    )
  }
}

export async function createSubscriptionPayment(userId: string, planId: string, paymentMethod: string) {
  await connectDB()

  const plan = await SubscriptionPlan.findOne({ planId, isActive: true })
  if (!plan) throw new Error(`Plan ${planId} not found`)

  const transactionId = generatePaymentToken()

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + plan.duration)

  const subscription = await Subscription.create({
    userId,
    planId,
    status: 'pending',
    paymentMethod,
    transactionId,
    amount: plan.price,
    currency: plan.currency,
    expiresAt,
  })

  const manualInstructions =
    paymentMethod === 'fib_manual'
      ? {
          type: 'fib_manual',
          ...getManualFIBConfig(),
          transactionId,
        }
      : null

  await PaymentTransaction.create({
    transactionId,
    userId,
    subscriptionId: String(subscription._id),
    paymentMethod,
    amount: plan.price,
    currency: plan.currency,
    status: 'pending',
    providerResponse: manualInstructions ? { manualInstructions } : {},
  })

  return {
    success: true,
    transactionId,
    paymentUrl: '',
    subscriptionId: subscription._id,
    manualPayment: !!manualInstructions,
    manualInstructions,
    paymentMethod,
  }
}

export async function confirmManualPayment(userId: string, transactionId: string, reference?: string, notes?: string) {
  await connectDB()

  const transaction = await PaymentTransaction.findOne({ transactionId, userId })
  if (!transaction) throw new Error('Transaction not found')

  const manualConfirmation = {
    submittedAt: new Date().toISOString(),
    reference,
    notes,
  }

  await PaymentTransaction.findByIdAndUpdate(transaction._id, {
    $set: {
      'providerResponse.manualConfirmation': manualConfirmation,
      status: 'pending',
    },
  })

  await Subscription.findOneAndUpdate(
    { transactionId },
    { $set: { 'metadata.manualConfirmation': manualConfirmation } }
  )

  return { success: true }
}

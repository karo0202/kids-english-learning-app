import mongoose, { Schema, Document } from 'mongoose'

export type SubscriptionPaymentMethod =
  | 'crypto'
  | 'zaincash'
  | 'fastpay'
  | 'nasspay'
  | 'fib'
  | 'crypto_manual'
  | 'fib_manual'

export interface ISubscription extends Document {
  userId: string
  planId: string
  status: 'active' | 'pending' | 'expired' | 'cancelled'
  paymentMethod: SubscriptionPaymentMethod
  transactionId: string
  providerTransactionId?: string
  amount: number
  currency: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    planId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'expired', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['crypto', 'zaincash', 'fastpay', 'nasspay', 'fib', 'crypto_manual', 'fib_manual'],
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    providerTransactionId: {
      type: String,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

// Index for active subscriptions lookup
SubscriptionSchema.index({ userId: 1, status: 1 })
SubscriptionSchema.index({ expiresAt: 1, status: 1 })

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema)


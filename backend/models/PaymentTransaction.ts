import mongoose, { Schema, Document } from 'mongoose'

export interface IPaymentTransaction extends Document {
  transactionId: string
  userId: string
  subscriptionId?: string
  paymentMethod: 'crypto' | 'zaincash' | 'fastpay' | 'nasspay' | 'fib'
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  providerTransactionId?: string
  providerResponse?: Record<string, any>
  webhookData?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const PaymentTransactionSchema = new Schema<IPaymentTransaction>(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    subscriptionId: {
      type: String,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['crypto', 'zaincash', 'fastpay', 'nasspay', 'fib'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    providerTransactionId: {
      type: String,
      index: true,
    },
    providerResponse: {
      type: Schema.Types.Mixed,
      default: {},
    },
    webhookData: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

PaymentTransactionSchema.index({ userId: 1, status: 1 })
PaymentTransactionSchema.index({ createdAt: -1 })

export default mongoose.model<IPaymentTransaction>('PaymentTransaction', PaymentTransactionSchema)


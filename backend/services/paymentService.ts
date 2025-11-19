import PaymentTransaction from '../models/PaymentTransaction'
import { generateTransactionId } from '../utils/paymentToken'

export interface CreatePaymentParams {
  userId: string
  paymentMethod: 'crypto' | 'zaincash' | 'fastpay' | 'nasspay' | 'fib'
  amount: number
  currency?: string
  subscriptionId?: string
  metadata?: Record<string, any>
}

/**
 * Create a payment transaction record
 */
export async function createPaymentTransaction(
  params: CreatePaymentParams
): Promise<PaymentTransaction> {
  const transactionId = generateTransactionId()

  const transaction = new PaymentTransaction({
    transactionId,
    userId: params.userId,
    subscriptionId: params.subscriptionId,
    paymentMethod: params.paymentMethod,
    amount: params.amount,
    currency: params.currency || 'USD',
    status: 'pending',
    providerResponse: params.metadata || {},
  })

  await transaction.save()
  return transaction
}

/**
 * Update payment transaction status
 */
export async function updatePaymentTransaction(
  transactionId: string,
  updates: {
    status?: 'pending' | 'completed' | 'failed' | 'cancelled'
    providerTransactionId?: string
    providerResponse?: Record<string, any>
    webhookData?: Record<string, any>
  }
): Promise<PaymentTransaction | null> {
  const transaction = await PaymentTransaction.findOneAndUpdate(
    { transactionId },
    { $set: updates },
    { new: true }
  )

  return transaction
}

/**
 * Get payment transaction by ID
 */
export async function getPaymentTransaction(
  transactionId: string
): Promise<PaymentTransaction | null> {
  return await PaymentTransaction.findOne({ transactionId })
}


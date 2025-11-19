import crypto from 'crypto'

/**
 * Generate a unique payment token for transaction tracking
 */
export function generatePaymentToken(): string {
  return `pay_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`
}

/**
 * Generate a unique transaction ID
 */
export function generateTransactionId(): string {
  return `txn_${Date.now()}_${crypto.randomBytes(12).toString('hex')}`
}

/**
 * Generate idempotency key to prevent duplicate processing
 */
export function generateIdempotencyKey(provider: string, transactionId: string): string {
  return `${provider}_${transactionId}_${Date.now()}`
}


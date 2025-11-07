// Cryptocurrency Payment Management
export interface PaymentPlan {
  id: string
  name: string
  priceUSD: number
  priceCrypto: number
  currency: 'BTC' | 'ETH' | 'USDT' | 'USDC'
  duration: 'monthly' | 'yearly' | 'lifetime'
  features: string[]
}

export interface PaymentTransaction {
  id: string
  userId: string
  planId: string
  amount: number
  currency: string
  walletAddress: string
  status: 'pending' | 'completed' | 'failed' | 'expired'
  createdAt: string
  expiresAt: string
  txHash?: string
}

const WALLET_ADDRESSES = {
  BTC: process.env.NEXT_PUBLIC_BTC_WALLET || '',
  ETH: process.env.NEXT_PUBLIC_ETH_WALLET || '',
  USDT: process.env.NEXT_PUBLIC_USDT_WALLET || '',
  USDC: process.env.NEXT_PUBLIC_USDC_WALLET || '',
}

// Payment plans
export const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 'premium-monthly',
    name: 'Premium Monthly',
    priceUSD: 9.99,
    priceCrypto: 0.00015, // Approximate BTC value
    currency: 'BTC',
    duration: 'monthly',
    features: [
      'Unlimited access to all lessons',
      'Advanced AI personalization',
      'Priority support',
      'Ad-free experience',
      'Offline mode',
      'Progress reports'
    ]
  },
  {
    id: 'premium-yearly',
    name: 'Premium Yearly',
    priceUSD: 99.99,
    priceCrypto: 0.0015, // Approximate BTC value
    currency: 'BTC',
    duration: 'yearly',
    features: [
      'All monthly features',
      '2 months free (save 20%)',
      'Exclusive content',
      'Family plan (up to 5 children)',
      'Early access to new features'
    ]
  },
  {
    id: 'premium-lifetime',
    name: 'Premium Lifetime',
    priceUSD: 299.99,
    priceCrypto: 0.0045, // Approximate BTC value
    currency: 'BTC',
    duration: 'lifetime',
    features: [
      'All yearly features',
      'Lifetime access',
      'Unlimited children',
      'Priority feature requests',
      'Dedicated support'
    ]
  }
]

// Get wallet address for currency
export function getWalletAddress(currency: 'BTC' | 'ETH' | 'USDT' | 'USDC'): string {
  return WALLET_ADDRESSES[currency] || ''
}

// Generate QR code data for payment
export function generatePaymentQR(
  amount: number,
  currency: 'BTC' | 'ETH' | 'USDT' | 'USDC',
  label?: string
): string {
  const walletAddress = getWalletAddress(currency)
  
  switch (currency) {
    case 'BTC':
      return `bitcoin:${walletAddress}?amount=${amount}${label ? `&label=${encodeURIComponent(label)}` : ''}`
    case 'ETH':
      return `ethereum:${walletAddress}?value=${amount}${label ? `&label=${encodeURIComponent(label)}` : ''}`
    case 'USDT':
    case 'USDC':
      return `ethereum:${walletAddress}?value=${amount}&token=${currency}${label ? `&label=${encodeURIComponent(label)}` : ''}`
    default:
      return walletAddress
  }
}

// Create payment transaction
export function createPaymentTransaction(
  userId: string,
  planId: string
): PaymentTransaction {
  const plan = PAYMENT_PLANS.find(p => p.id === planId)
  if (!plan) {
    throw new Error('Invalid plan ID')
  }

  const transaction: PaymentTransaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    planId,
    amount: plan.priceCrypto,
    currency: plan.currency,
    walletAddress: getWalletAddress(plan.currency),
    status: 'pending',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
  }

  // Save to localStorage
  const transactions = getPaymentTransactions()
  transactions.push(transaction)
  localStorage.setItem('crypto_payments', JSON.stringify(transactions))

  return transaction
}

// Get payment transactions
export function getPaymentTransactions(): PaymentTransaction[] {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem('crypto_payments')
  return stored ? JSON.parse(stored) : []
}

// Get user's payment transactions
export function getUserTransactions(userId: string): PaymentTransaction[] {
  return getPaymentTransactions().filter(tx => tx.userId === userId)
}

// Update transaction status
export function updateTransactionStatus(
  transactionId: string,
  status: PaymentTransaction['status'],
  txHash?: string
): void {
  const transactions = getPaymentTransactions()
  const index = transactions.findIndex(tx => tx.id === transactionId)
  
  if (index !== -1) {
    transactions[index].status = status
    if (txHash) {
      transactions[index].txHash = txHash
    }
    localStorage.setItem('crypto_payments', JSON.stringify(transactions))
  }
}

// Check if transaction is expired
export function isTransactionExpired(transaction: PaymentTransaction): boolean {
  return new Date(transaction.expiresAt) < new Date()
}

// Get user subscription status
export function getUserSubscription(userId: string): {
  isPremium: boolean
  planId?: string
  expiresAt?: string
  status: 'active' | 'expired' | 'none'
} {
  const transactions = getUserTransactions(userId)
  const activeTransaction = transactions
    .filter(tx => tx.status === 'completed')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

  if (!activeTransaction) {
    return { isPremium: false, status: 'none' }
  }

  const plan = PAYMENT_PLANS.find(p => p.id === activeTransaction.planId)
  if (!plan) {
    return { isPremium: false, status: 'none' }
  }

  // Calculate expiration
  let expiresAt: string | undefined
  if (plan.duration === 'monthly') {
    expiresAt = new Date(new Date(activeTransaction.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
  } else if (plan.duration === 'yearly') {
    expiresAt = new Date(new Date(activeTransaction.createdAt).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString()
  }
  // Lifetime doesn't expire

  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false

  return {
    isPremium: !isExpired,
    planId: activeTransaction.planId,
    expiresAt,
    status: isExpired ? 'expired' : 'active'
  }
}

// Verify payment (manual verification - in production, use blockchain API)
export function verifyPayment(transactionId: string): boolean {
  // This is a placeholder - in production, you would:
  // 1. Check blockchain for transaction
  // 2. Verify amount matches
  // 3. Verify transaction is confirmed
  // 4. Update transaction status
  
  // For now, return false - user needs to manually verify
  return false
}



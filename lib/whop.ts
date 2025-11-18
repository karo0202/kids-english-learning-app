// Whop API integration for subscription management
// Documentation: https://dev.whop.com/

export interface WhopUser {
  id: string
  email: string
  username?: string
  verified: boolean
}

export interface WhopSubscription {
  id: string
  userId: string
  productId: string
  status: 'active' | 'cancelled' | 'expired' | 'pending'
  planId: string
  createdAt: string
  expiresAt?: string
  cancelledAt?: string
}

export interface WhopProduct {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year' | 'lifetime'
}

// Verify a user's Whop membership
export async function verifyWhopUser(userId: string, whopApiKey: string): Promise<{
  isValid: boolean
  subscription?: WhopSubscription
  user?: WhopUser
  error?: string
}> {
  try {
    // Whop API endpoint to verify user membership
    const response = await fetch(`https://api.whop.com/api/v2/memberships/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whopApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Whop verification failed:', error)
      return {
        isValid: false,
        error: `Whop API error: ${response.status}`,
      }
    }

    const data = await response.json()
    
    return {
      isValid: data.valid === true,
      subscription: data.subscription,
      user: data.user,
    }
  } catch (error) {
    console.error('Error verifying Whop user:', error)
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Get user's active subscriptions from Whop
export async function getWhopSubscriptions(
  userId: string,
  whopApiKey: string
): Promise<WhopSubscription[]> {
  try {
    const response = await fetch(`https://api.whop.com/api/v2/users/${userId}/memberships`, {
      headers: {
        'Authorization': `Bearer ${whopApiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch Whop subscriptions:', response.status)
      return []
    }

    const data = await response.json()
    return data.memberships || []
  } catch (error) {
    console.error('Error fetching Whop subscriptions:', error)
    return []
  }
}

// Check if user has active Whop subscription
export async function hasActiveWhopSubscription(
  userId: string,
  whopApiKey: string
): Promise<boolean> {
  const subscriptions = await getWhopSubscriptions(userId, whopApiKey)
  return subscriptions.some(
    sub => sub.status === 'active' && (!sub.expiresAt || new Date(sub.expiresAt) > new Date())
  )
}

// Verify webhook signature (for security)
export function verifyWhopWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // Whop uses HMAC SHA256 for webhook signatures
  // Implementation depends on Whop's specific signature format
  // This is a placeholder - check Whop docs for exact implementation
  try {
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    return signature === expectedSignature
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}

// Store Whop subscription in localStorage (for client-side access)
export function storeWhopSubscription(subscription: WhopSubscription): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('whop_subscription', JSON.stringify(subscription))
    localStorage.setItem('whop_user_id', subscription.userId)
  }
}

// Get stored Whop subscription from localStorage
export function getStoredWhopSubscription(): WhopSubscription | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem('whop_subscription')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error reading stored Whop subscription:', error)
  }
  
  return null
}

// Clear stored Whop subscription
export function clearWhopSubscription(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('whop_subscription')
    localStorage.removeItem('whop_user_id')
  }
}


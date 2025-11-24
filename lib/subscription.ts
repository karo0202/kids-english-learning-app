import { getAuthToken } from './simple-auth'

// Subscription management system
export interface SubscriptionStatus {
  isActive: boolean
  isTrial: boolean
  trialDaysRemaining: number
  subscriptionType: 'free' | 'trial' | 'premium'
  expiresAt?: Date
}

export interface ModuleAccess {
  hasAccess: boolean
  isLocked: boolean
  requiresSubscription: boolean
  message?: string
}

// Free modules available during 7-day trial
export const FREE_MODULES = ['grammar', 'writing', 'games'] as const

// Premium modules requiring subscription
export const PREMIUM_MODULES = [
  'reading',
  'speaking',
  'puzzle',
  'alphabet-coloring',
  'challenges'
] as const

export type ModuleId = typeof FREE_MODULES[number] | typeof PREMIUM_MODULES[number]

const SUBSCRIPTION_STORAGE_KEY = 'user_subscription'
let cachedStatus: SubscriptionStatus | null = null
let lastStatusFetch = 0
const STATUS_TTL_MS = 60 * 1000

// Get user registration date from localStorage
export function getUserRegistrationDate(): Date | null {
  if (typeof window === 'undefined') return null
  
  const registrationDateStr = localStorage.getItem('user_registration_date')
  if (registrationDateStr) {
    try {
      return new Date(registrationDateStr)
    } catch {
      return null
    }
  }
  return null
}

// Set user registration date (call this on registration)
export function setUserRegistrationDate(date: Date = new Date()): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user_registration_date', date.toISOString())
  }
}

// Check if user is within 7-day free trial
export function isWithinFreeTrial(): boolean {
  const registrationDate = getUserRegistrationDate()
  if (!registrationDate) return false
  
  const now = new Date()
  const daysSinceRegistration = Math.floor(
    (now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  
  return daysSinceRegistration < 7
}

// Get trial days remaining
export function getTrialDaysRemaining(): number {
  const registrationDate = getUserRegistrationDate()
  if (!registrationDate) return 0
  
  const now = new Date()
  const daysSinceRegistration = Math.floor(
    (now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  
  const remaining = 7 - daysSinceRegistration
  return Math.max(0, remaining)
}

function getTrialStatus(): SubscriptionStatus {
  if (isWithinFreeTrial()) {
    return {
      isActive: true,
      isTrial: true,
      trialDaysRemaining: getTrialDaysRemaining(),
      subscriptionType: 'trial',
    }
  }

  return {
    isActive: false,
    isTrial: false,
    trialDaysRemaining: 0,
    subscriptionType: 'free',
  }
}

function getStoredSubscription(): SubscriptionStatus | null {
  if (typeof window === 'undefined') return null

  const subscriptionStr = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY)
  if (subscriptionStr) {
    try {
      const subscription = JSON.parse(subscriptionStr)
      if (subscription.isActive && subscription.expiresAt) {
        const expiresAt = new Date(subscription.expiresAt)
        if (expiresAt > new Date()) {
          return {
            isActive: true,
            isTrial: false,
            trialDaysRemaining: 0,
            subscriptionType: 'premium',
            expiresAt,
          }
        }
      }
    } catch {
      return null
    }
  }
  return null
}

// Check if user has active subscription based on cached/local data
export function hasActiveSubscription(): boolean {
  const stored = cachedStatus || getStoredSubscription()
  return !!(stored && stored.isActive && !stored.isTrial)
}

// Get subscription status
export function getSubscriptionStatus(): SubscriptionStatus {
  if (cachedStatus) return cachedStatus

  const stored = getStoredSubscription()
  if (stored) {
    cachedStatus = stored
    return stored
  }

  const trialStatus = getTrialStatus()
  cachedStatus = trialStatus
  return trialStatus
}

// Refresh subscription status from backend
export async function refreshSubscriptionStatus(force = false): Promise<SubscriptionStatus> {
  if (typeof window === 'undefined') {
    return getSubscriptionStatus()
  }

  const now = Date.now()
  if (!force && cachedStatus && now - lastStatusFetch < STATUS_TTL_MS) {
    return cachedStatus
  }

  try {
    const token = await getAuthToken()
    if (!token) {
      cachedStatus = getSubscriptionStatus()
      return cachedStatus
    }

    const response = await fetch('/api/subscription/status', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch subscription status')
    }

    const data = await response.json()

    if (data.hasActiveSubscription && data.subscription) {
      const status: SubscriptionStatus = {
        isActive: true,
        isTrial: false,
        trialDaysRemaining: 0,
        subscriptionType: 'premium',
        expiresAt: data.subscription.expiresAt ? new Date(data.subscription.expiresAt) : undefined,
      }

      cachedStatus = status
      lastStatusFetch = now
      setSubscription({
        isActive: true,
        expiresAt: status.expiresAt,
        type: data.subscription.planId,
      })
      return status
    }

    const trialStatus = getTrialStatus()
    cachedStatus = trialStatus
    lastStatusFetch = now
    setSubscription({
      isActive: false,
    })
    return trialStatus
  } catch (error) {
    console.error('Error refreshing subscription status:', error)
    cachedStatus = getSubscriptionStatus()
    return cachedStatus
  }
}

// Check if user has access to a specific module
export function checkModuleAccess(moduleId: ModuleId, statusOverride?: SubscriptionStatus): ModuleAccess {
  const status = statusOverride || getSubscriptionStatus()

  if (FREE_MODULES.includes(moduleId as any)) {
    return {
      hasAccess: true,
      isLocked: false,
      requiresSubscription: false,
    }
  }

  if (status.isActive && !status.isTrial) {
    return {
      hasAccess: true,
      isLocked: false,
      requiresSubscription: false,
    }
  }

  const message = status.isTrial
    ? 'Premium modules unlock with a subscription once your free trial ends.'
    : 'Subscribe to unlock this premium module.'

  return {
    hasAccess: false,
    isLocked: true,
    requiresSubscription: true,
    message,
  }
}

export async function checkModuleAccessAsync(moduleId: ModuleId): Promise<ModuleAccess> {
  const status = await refreshSubscriptionStatus()
  return checkModuleAccess(moduleId, status)
}

// Set subscription (persists subscription state locally)
export function setSubscription(subscription: {
  isActive: boolean
  expiresAt?: Date
  type?: 'monthly' | 'yearly' | string
}): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify({
      isActive: subscription.isActive,
      expiresAt: subscription.expiresAt?.toISOString(),
      type: subscription.type,
      activatedAt: new Date().toISOString()
    }))
    cachedStatus = subscription.isActive
      ? {
          isActive: true,
          isTrial: false,
          trialDaysRemaining: 0,
          subscriptionType: 'premium',
          expiresAt: subscription.expiresAt,
        }
      : null
    lastStatusFetch = Date.now()
  }
}


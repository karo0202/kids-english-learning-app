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

// Check if user has active subscription
export function hasActiveSubscription(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check local subscription flag
  const subscriptionStr = localStorage.getItem('user_subscription')
  if (subscriptionStr) {
    try {
      const subscription = JSON.parse(subscriptionStr)
      if (subscription.isActive) {
        const expiresAt = subscription.expiresAt ? new Date(subscription.expiresAt) : null
        if (expiresAt && expiresAt > new Date()) {
          return true
        }
      }
    } catch {
      return false
    }
  }
  return false
}

// Get subscription status
export function getSubscriptionStatus(): SubscriptionStatus {
  const hasSubscription = hasActiveSubscription()
  const isTrial = isWithinFreeTrial()
  const trialDaysRemaining = getTrialDaysRemaining()
  
  if (hasSubscription) {
    // Regular premium subscription
    const subscriptionStr = localStorage.getItem('user_subscription')
    if (subscriptionStr) {
      try {
        const subscription = JSON.parse(subscriptionStr)
        return {
          isActive: true,
          isTrial: false,
          trialDaysRemaining: 0,
          subscriptionType: 'premium',
          expiresAt: subscription.expiresAt ? new Date(subscription.expiresAt) : undefined
        }
      } catch {
        // Fall through
      }
    }
    
    return {
      isActive: true,
      isTrial: false,
      trialDaysRemaining: 0,
      subscriptionType: 'premium'
    }
  }
  
  if (isTrial) {
    return {
      isActive: true,
      isTrial: true,
      trialDaysRemaining,
      subscriptionType: 'trial'
    }
  }
  
  return {
    isActive: false,
    isTrial: false,
    trialDaysRemaining: 0,
    subscriptionType: 'free'
  }
}

// Check if user has access to a specific module
export function checkModuleAccess(moduleId: string): ModuleAccess {
  const status = getSubscriptionStatus()
  const moduleIdLower = moduleId.toLowerCase()
  
  // Free modules are always accessible (grammar, writing, games)
  if (FREE_MODULES.includes(moduleIdLower as any)) {
    return {
      hasAccess: true,
      isLocked: false,
      requiresSubscription: false
    }
  }
  
  // Premium modules require subscription
  if (PREMIUM_MODULES.includes(moduleIdLower as any)) {
    if (status.isActive) {
      return {
        hasAccess: true,
        isLocked: false,
        requiresSubscription: true
      }
    }
    
    if (status.isTrial) {
      return {
        hasAccess: false,
        isLocked: true,
        requiresSubscription: true,
        message: `This premium module requires a subscription. You have ${status.trialDaysRemaining} days left in your free trial.`
      }
    }
    
    return {
      hasAccess: false,
      isLocked: true,
      requiresSubscription: true,
      message: 'This premium module requires a subscription.'
    }
  }
  
  // Unknown module - default to locked
  return {
    hasAccess: false,
    isLocked: true,
    requiresSubscription: true,
    message: 'This module is not available.'
  }
}

// Set subscription (for future payment integration)
export function setSubscription(subscription: {
  isActive: boolean
  expiresAt?: Date
  type?: 'monthly' | 'yearly'
}): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user_subscription', JSON.stringify({
      isActive: subscription.isActive,
      expiresAt: subscription.expiresAt?.toISOString(),
      type: subscription.type,
      activatedAt: new Date().toISOString()
    }))
  }
}


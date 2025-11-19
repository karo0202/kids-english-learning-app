import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'
import { hasActiveSubscription } from '../services/subscriptionService'

/**
 * Middleware to verify user has active subscription
 */
export async function verifySubscription(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.userId) {
    res.status(401).json({ error: 'Authentication required' })
    return
  }

  try {
    const hasActive = await hasActiveSubscription(req.userId)
    
    if (!hasActive) {
      res.status(403).json({
        error: 'Active subscription required',
        message: 'Please subscribe to access this feature',
      })
      return
    }

    next()
  } catch (error) {
    console.error('Subscription verification error:', error)
    res.status(500).json({ error: 'Failed to verify subscription' })
  }
}

/**
 * Optional middleware - attach subscription status to request
 */
export async function attachSubscriptionStatus(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.userId) {
    next()
    return
  }

  try {
    const hasActive = await hasActiveSubscription(req.userId)
    req.user = req.user || {}
    ;(req.user as any).hasActiveSubscription = hasActive
    next()
  } catch (error) {
    console.error('Error attaching subscription status:', error)
    next()
  }
}


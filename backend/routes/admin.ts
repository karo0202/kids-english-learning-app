import { Router, Response } from 'express'
import { AuthRequest, authenticateToken } from '../middleware/auth'
import Subscription from '../models/Subscription'
import PaymentTransaction from '../models/PaymentTransaction'
import SubscriptionPlan from '../models/SubscriptionPlan'

const router = Router()

// Simple admin check (implement proper admin role check)
const isAdmin = (req: AuthRequest): boolean => {
  // TODO: Implement proper admin role check
  // For now, check if user email is in admin list
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',')
  return req.user?.email ? adminEmails.includes(req.user.email) : false
}

/**
 * GET /api/admin/payments
 * Get all payment transactions
 */
router.get('/payments', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { page = 1, limit = 50, status, paymentMethod } = req.query

    const query: any = {}
    if (status) query.status = status
    if (paymentMethod) query.paymentMethod = paymentMethod

    const transactions = await PaymentTransaction.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean()

    const total = await PaymentTransaction.countDocuments(query)

    res.json({
      success: true,
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error: any) {
    console.error('Error fetching payments:', error)
    res.status(500).json({ error: 'Failed to fetch payments' })
  }
})

/**
 * GET /api/admin/subscriptions
 * Get all subscriptions
 */
router.get('/subscriptions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { page = 1, limit = 50, status, userId } = req.query

    const query: any = {}
    if (status) query.status = status
    if (userId) query.userId = userId

    const subscriptions = await Subscription.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean()

    const total = await Subscription.countDocuments(query)

    res.json({
      success: true,
      subscriptions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error)
    res.status(500).json({ error: 'Failed to fetch subscriptions' })
  }
})

/**
 * POST /api/admin/updatePlan
 * Update subscription plan (admin only)
 */
router.post('/updatePlan', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { planId, updates } = req.body

    if (!planId || !updates) {
      return res.status(400).json({ error: 'planId and updates are required' })
    }

    const plan = await SubscriptionPlan.findOneAndUpdate(
      { planId },
      { $set: updates },
      { new: true }
    )

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' })
    }

    res.json({ success: true, plan })
  } catch (error: any) {
    console.error('Error updating plan:', error)
    res.status(500).json({ error: 'Failed to update plan' })
  }
})

export default router


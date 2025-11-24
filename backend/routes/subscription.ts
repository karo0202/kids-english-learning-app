import { Router, Response } from 'express'
import { AuthRequest, authenticateToken } from '../middleware/auth'
import SubscriptionPlan from '../models/SubscriptionPlan'
import { createSubscription, getActiveSubscription } from '../services/subscriptionService'
import { createPaymentTransaction } from '../services/paymentService'
import { createCryptoInvoice } from '../services/payments/cryptoService'
import { createZainCashPayment } from '../services/payments/zaincashService'
import { createFastPayPayment } from '../services/payments/fastpayService'
import { createNassPayPayment } from '../services/payments/nasspayService'
import { createFIBPayment } from '../services/payments/fibService'
import { generatePaymentToken } from '../utils/paymentToken'
import { getManualCryptoConfig, getManualFIBConfig } from '../config/manualPayments'
import PaymentTransaction from '../models/PaymentTransaction'
import Subscription from '../models/Subscription'

const router = Router()

/**
 * GET /api/subscription/plans
 * Get all available subscription plans
 */
router.get('/plans', async (req, res: Response) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 })
    res.json({ success: true, plans })
  } catch (error: any) {
    console.error('Error fetching plans:', error)
    res.status(500).json({ error: 'Failed to fetch subscription plans' })
  }
})

/**
 * POST /api/subscription/create
 * Create a new subscription payment request
 */
router.post('/create', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { planId, paymentMethod } = req.body
    const userId = req.userId!

    if (!planId || !paymentMethod) {
      return res.status(400).json({ error: 'planId and paymentMethod are required' })
    }

    // Get plan
    const plan = await SubscriptionPlan.findOne({ planId, isActive: true })
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' })
    }

    // Generate transaction ID
    const transactionId = generatePaymentToken()

    // Create payment transaction
    const paymentTransaction = await createPaymentTransaction({
      userId,
      paymentMethod,
      amount: plan.price,
      currency: plan.currency,
      transactionId,
    })

    // Create subscription (pending status)
    const subscription = await createSubscription({
      userId,
      planId,
      paymentMethod,
      transactionId,
      amount: plan.price,
      currency: plan.currency,
    })

    await paymentTransaction.updateOne({
      subscriptionId: subscription._id,
    })

    // Generate payment URL based on method
    let paymentUrl = ''
    let paymentData: any = {}
    let manualPayment = false
    let manualInstructions: Record<string, any> | null = null

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const callbackUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/webhooks/${paymentMethod}`

    switch (paymentMethod) {
      case 'crypto':
        const cryptoInvoice = await createCryptoInvoice({
          amount: plan.price,
          currency: plan.currency,
          orderId: transactionId,
          title: `Subscription: ${plan.name}`,
          description: plan.description,
          callbackUrl,
          successUrl: `${baseUrl}/subscribe/success?transactionId=${transactionId}`,
          cancelUrl: `${baseUrl}/subscribe/cancel?transactionId=${transactionId}`,
        })
        paymentUrl = cryptoInvoice.paymentUrl
        paymentData = { invoiceId: cryptoInvoice.invoiceId }
        break
      case 'crypto_manual': {
        const manualCrypto = getManualCryptoConfig()
        manualPayment = true
        paymentUrl = ''
        manualInstructions = {
          type: 'crypto_manual',
          walletAddress: manualCrypto.walletAddress,
          network: manualCrypto.network,
          qrCodeUrl: manualCrypto.qrCodeUrl,
          qrCodeText: manualCrypto.qrCodeText,
          note: manualCrypto.note,
          contactPhone: manualCrypto.contactPhone,
          transactionId,
        }
        paymentData = { manualInstructions }
        break
      }

      case 'zaincash':
        const zainCashPayment = await createZainCashPayment({
          amount: plan.price,
          orderId: transactionId,
          serviceType: 'Subscription',
          redirectUrl: `${baseUrl}/subscribe/success?transactionId=${transactionId}`,
        })
        paymentUrl = zainCashPayment.paymentUrl
        paymentData = { id: zainCashPayment.id }
        break

      case 'fastpay':
        const fastPayPayment = await createFastPayPayment({
          amount: plan.price,
          orderId: transactionId,
          description: plan.description,
          callbackUrl,
        })
        paymentUrl = fastPayPayment.paymentUrl
        paymentData = { referenceId: fastPayPayment.referenceId }
        break

      case 'nasspay':
        const nassPayPayment = await createNassPayPayment({
          amount: plan.price,
          orderId: transactionId,
          description: plan.description,
          callbackUrl,
        })
        paymentUrl = nassPayPayment.paymentUrl
        paymentData = { paymentId: nassPayPayment.paymentId }
        break

      case 'fib':
        const fibPayment = await createFIBPayment({
          amount: plan.price,
          orderId: transactionId,
          description: plan.description,
          callbackUrl,
        })
        paymentUrl = fibPayment.paymentUrl
        paymentData = { paymentLink: fibPayment.paymentLink }
        break
      case 'fib_manual': {
        const fibManual = getManualFIBConfig()
        manualPayment = true
        paymentUrl = ''
        manualInstructions = {
          type: 'fib_manual',
          qrCodeUrl: fibManual.qrCodeUrl,
          qrCodeText: fibManual.qrCodeText,
          phoneNumber: fibManual.phoneNumber,
          accountName: fibManual.accountName,
          note: fibManual.note,
          transactionId,
        }
        paymentData = { manualInstructions }
        break
      }

      default:
        return res.status(400).json({ error: 'Invalid payment method' })
    }

    // Update payment transaction with provider response
    await paymentTransaction.updateOne({
      providerResponse: paymentData,
    })

    res.json({
      success: true,
      transactionId,
      paymentUrl,
      subscriptionId: subscription._id,
      manualPayment,
      manualInstructions,
      paymentMethod,
    })
  } catch (error: any) {
    console.error('Error creating subscription:', error)
    res.status(500).json({ error: error.message || 'Failed to create subscription' })
  }
})

/**
 * POST /api/subscription/manual/confirm
 * Allow users to submit proof/reference for manual payments
 */
router.post('/manual/confirm', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const { transactionId, reference, proofUrl, notes, paymentMethod } = req.body

    if (!transactionId) {
      return res.status(400).json({ error: 'transactionId is required' })
    }

    const transaction = await PaymentTransaction.findOne({ transactionId, userId })
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' })
    }

    if (!['crypto_manual', 'fib_manual'].includes(transaction.paymentMethod)) {
      return res.status(400).json({ error: 'Manual confirmation is only available for manual payment methods' })
    }

    const manualConfirmation = {
      submittedAt: new Date().toISOString(),
      reference,
      proofUrl,
      notes,
      paymentMethod: paymentMethod || transaction.paymentMethod,
    }

    const existingResponse = transaction.providerResponse || {}

    await transaction.updateOne({
      providerResponse: {
        ...existingResponse,
        manualConfirmation,
      },
      status: 'pending',
    })

    const subscription = await Subscription.findOne({ transactionId })
    if (subscription) {
      subscription.metadata = {
        ...(subscription.metadata || {}),
        manualConfirmation,
      }
      await subscription.save()
    }

    res.json({ success: true })
  } catch (error: any) {
    console.error('Error submitting manual confirmation:', error)
    res.status(500).json({ error: 'Failed to submit manual confirmation' })
  }
})

/**
 * GET /api/subscription/status
 * Get current user's subscription status
 */
router.get('/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const subscription = await getActiveSubscription(userId)

    if (!subscription) {
      return res.json({
        success: true,
        hasActiveSubscription: false,
        subscription: null,
      })
    }

    res.json({
      success: true,
      hasActiveSubscription: true,
      subscription: {
        id: subscription._id,
        planId: subscription.planId,
        status: subscription.status,
        paymentMethod: subscription.paymentMethod,
        expiresAt: subscription.expiresAt,
        createdAt: subscription.createdAt,
      },
    })
  } catch (error: any) {
    console.error('Error fetching subscription status:', error)
    res.status(500).json({ error: 'Failed to fetch subscription status' })
  }
})

/**
 * POST /api/subscription/verify
 * Verify subscription status (for frontend polling)
 */
router.post('/verify', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { transactionId } = req.body
    const userId = req.userId!

    if (!transactionId) {
      return res.status(400).json({ error: 'transactionId is required' })
    }

    const subscription = await getActiveSubscription(userId)

    if (subscription && subscription.transactionId === transactionId) {
      return res.json({
        success: true,
        verified: subscription.status === 'active',
        subscription: {
          status: subscription.status,
          expiresAt: subscription.expiresAt,
        },
      })
    }

    res.json({
      success: true,
      verified: false,
      subscription: null,
    })
  } catch (error: any) {
    console.error('Error verifying subscription:', error)
    res.status(500).json({ error: 'Failed to verify subscription' })
  }
})

export default router


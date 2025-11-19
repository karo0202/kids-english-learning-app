import { Router, Request, Response } from 'express'
import { verifyCoinGateSignature, verifyNOWPaymentsSignature } from '../utils/webhookVerification'
import { verifyZainCashCallback } from '../services/payments/zaincashService'
import { verifyFastPayWebhook } from '../services/payments/fastpayService'
import { verifyNassPayWebhook } from '../services/payments/nasspayService'
import { verifyFIBCallback } from '../services/payments/fibService'
import { activateSubscription } from '../services/subscriptionService'
import { updatePaymentTransaction } from '../services/paymentService'
import { sendEmailReceipt } from '../services/emailService'
import Subscription from '../models/Subscription'
import SubscriptionPlan from '../models/SubscriptionPlan'

const router = Router()

// Store processed webhooks to prevent duplicate processing
const processedWebhooks = new Set<string>()

/**
 * POST /api/webhooks/crypto
 * Handle crypto payment webhook (CoinGate or NOWPayments)
 */
router.post('/crypto', async (req: Request, res: Response) => {
  try {
    const rawBody = JSON.stringify(req.body)
    const signature = req.headers['x-coingate-signature'] || req.headers['x-nowpayments-sig'] || ''

    // Verify signature
    const isCoinGate = !!req.headers['x-coingate-signature']
    const secret = isCoinGate
      ? process.env.COINGATE_WEBHOOK_SECRET || ''
      : process.env.NOWPAYMENTS_WEBHOOK_SECRET || ''

    const isValid = isCoinGate
      ? verifyCoinGateSignature(rawBody, signature as string, secret)
      : verifyNOWPaymentsSignature(rawBody, signature as string, secret)

    if (!isValid) {
      console.error('Invalid crypto webhook signature')
      return res.status(401).json({ error: 'Invalid signature' })
    }

    const webhookId = req.body.id || req.body.payment_id || ''
    if (processedWebhooks.has(webhookId)) {
      return res.status(200).json({ message: 'Webhook already processed' })
    }

    const orderId = req.body.order_id || req.body.order_id || ''
    const status = req.body.status || req.body.payment_status || ''

    // Check if payment is confirmed
    const isPaid = isCoinGate
      ? status === 'paid' || status === 'confirmed'
      : status === 'confirmed' || status === 'finished'

    if (isPaid && orderId) {
      const subscription = await activateSubscription(orderId, webhookId)
      
      if (subscription) {
        // Get plan details for email
        const plan = await SubscriptionPlan.findOne({ planId: subscription.planId })
        
        // Send email receipt (implement email service)
        // await sendEmailReceipt({...})

        processedWebhooks.add(webhookId)
        console.log(`✅ Subscription activated for transaction: ${orderId}`)
      }
    }

    res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('Crypto webhook error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

/**
 * POST /api/webhooks/zaincash
 * Handle ZainCash payment callback
 */
router.post('/zaincash', async (req: Request, res: Response) => {
  try {
    const callbackData = req.body

    // Verify signature
    if (!verifyZainCashCallback(callbackData)) {
      console.error('Invalid ZainCash callback signature')
      return res.status(401).json({ error: 'Invalid signature' })
    }

    const transactionId = callbackData.orderId || callbackData.order_id || ''
    const status = callbackData.status || ''

    if (status === 'success' || status === 'completed') {
      const subscription = await activateSubscription(
        transactionId,
        callbackData.id || callbackData.transactionId
      )

      if (subscription) {
        await updatePaymentTransaction(transactionId, {
          status: 'completed',
          providerTransactionId: callbackData.id,
          webhookData: callbackData,
        })

        console.log(`✅ ZainCash subscription activated: ${transactionId}`)
      }
    }

    // Redirect to success page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    res.redirect(`${frontendUrl}/subscribe/success?transactionId=${transactionId}`)
  } catch (error: any) {
    console.error('ZainCash webhook error:', error)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    res.redirect(`${frontendUrl}/subscribe/failed`)
  }
})

/**
 * POST /api/webhooks/fastpay
 * Handle FastPay payment webhook
 */
router.post('/fastpay', async (req: Request, res: Response) => {
  try {
    const rawBody = JSON.stringify(req.body)
    const signature = req.headers['x-fastpay-signature'] || req.headers['x-signature'] || ''

    // Verify signature
    if (!verifyFastPayWebhook(rawBody, signature as string)) {
      console.error('Invalid FastPay webhook signature')
      return res.status(401).json({ error: 'Invalid signature' })
    }

    const webhookId = req.body.reference_id || req.body.transaction_id || ''
    if (processedWebhooks.has(webhookId)) {
      return res.status(200).json({ message: 'Webhook already processed' })
    }

    const transactionId = req.body.order_id || ''
    const status = req.body.status || ''

    if (status === 'success' || status === 'completed') {
      const subscription = await activateSubscription(transactionId, webhookId)

      if (subscription) {
        await updatePaymentTransaction(transactionId, {
          status: 'completed',
          providerTransactionId: webhookId,
          webhookData: req.body,
        })

        processedWebhooks.add(webhookId)
        console.log(`✅ FastPay subscription activated: ${transactionId}`)
      }
    }

    res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('FastPay webhook error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

/**
 * POST /api/webhooks/nasspay
 * Handle NassPay payment webhook
 */
router.post('/nasspay', async (req: Request, res: Response) => {
  try {
    const rawBody = JSON.stringify(req.body)
    const signature = req.headers['x-nasspay-signature'] || req.headers['x-signature'] || ''

    // Verify signature
    if (!verifyNassPayWebhook(rawBody, signature as string)) {
      console.error('Invalid NassPay webhook signature')
      return res.status(401).json({ error: 'Invalid signature' })
    }

    const webhookId = req.body.payment_id || req.body.transaction_id || ''
    if (processedWebhooks.has(webhookId)) {
      return res.status(200).json({ message: 'Webhook already processed' })
    }

    const transactionId = req.body.order_id || ''
    const status = req.body.status || ''

    if (status === 'success' || status === 'completed') {
      const subscription = await activateSubscription(transactionId, webhookId)

      if (subscription) {
        await updatePaymentTransaction(transactionId, {
          status: 'completed',
          providerTransactionId: webhookId,
          webhookData: req.body,
        })

        processedWebhooks.add(webhookId)
        console.log(`✅ NassPay subscription activated: ${transactionId}`)
      }
    }

    res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('NassPay webhook error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

/**
 * POST /api/webhooks/fib
 * Handle FIB payment callback
 */
router.post('/fib', async (req: Request, res: Response) => {
  try {
    const callbackData = req.body

    // Verify signature
    if (!verifyFIBCallback(callbackData)) {
      console.error('Invalid FIB callback signature')
      return res.status(401).json({ error: 'Invalid signature' })
    }

    const transactionId = callbackData.order_id || ''
    const status = callbackData.status || ''

    if (status === 'success' || status === 'completed') {
      const subscription = await activateSubscription(
        transactionId,
        callbackData.payment_id || callbackData.transaction_id
      )

      if (subscription) {
        await updatePaymentTransaction(transactionId, {
          status: 'completed',
          providerTransactionId: callbackData.payment_id,
          webhookData: callbackData,
        })

        console.log(`✅ FIB subscription activated: ${transactionId}`)
      }
    }

    // Redirect to success page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    res.redirect(`${frontendUrl}/subscribe/success?transactionId=${transactionId}`)
  } catch (error: any) {
    console.error('FIB webhook error:', error)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    res.redirect(`${frontendUrl}/subscribe/failed`)
  }
})

export default router


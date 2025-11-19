import axios from 'axios'
import crypto from 'crypto'

const FASTPAY_MERCHANT_ID = process.env.FASTPAY_MERCHANT_ID || ''
const FASTPAY_API_KEY = process.env.FASTPAY_API_KEY || ''
const FASTPAY_API_URL = process.env.FASTPAY_API_URL || 'https://api.fastpay.iq/v1'

export interface FastPayPaymentParams {
  amount: number
  orderId: string
  description: string
  callbackUrl: string
  customerPhone?: string
}

export interface FastPayPaymentResponse {
  transactionId: string
  paymentUrl: string
  referenceId: string
}

/**
 * Generate FastPay HMAC signature
 */
function generateFastPaySignature(data: Record<string, any>): string {
  const sortedKeys = Object.keys(data).sort()
  const signatureString = sortedKeys
    .map((key) => `${key}=${data[key]}`)
    .join('&')
  
  return crypto
    .createHmac('sha256', FASTPAY_API_KEY)
    .update(signatureString)
    .digest('hex')
}

/**
 * Create FastPay payment request
 */
export async function createFastPayPayment(
  params: FastPayPaymentParams
): Promise<FastPayPaymentResponse> {
  try {
    const paymentData = {
      merchant_id: FASTPAY_MERCHANT_ID,
      amount: params.amount.toString(),
      order_id: params.orderId,
      description: params.description,
      callback_url: params.callbackUrl,
      customer_phone: params.customerPhone || '',
    }

    // Generate signature
    const signature = generateFastPaySignature(paymentData)

    const response = await axios.post(
      `${FASTPAY_API_URL}/payments/create`,
      {
        ...paymentData,
        signature,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${FASTPAY_API_KEY}`,
        },
      }
    )

    if (response.data.success && response.data.data) {
      return {
        transactionId: params.orderId,
        paymentUrl: response.data.data.payment_url,
        referenceId: response.data.data.reference_id,
      }
    } else {
      throw new Error(response.data.message || 'Failed to create FastPay payment')
    }
  } catch (error: any) {
    console.error('FastPay payment creation error:', error.response?.data || error.message)
    throw new Error(`Failed to create FastPay payment: ${error.message}`)
  }
}

/**
 * Verify FastPay webhook signature
 */
export function verifyFastPayWebhook(
  payload: string,
  signature: string
): boolean {
  try {
    const calculatedSignature = crypto
      .createHmac('sha256', FASTPAY_API_KEY)
      .update(payload)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    )
  } catch (error) {
    console.error('FastPay webhook verification error:', error)
    return false
  }
}


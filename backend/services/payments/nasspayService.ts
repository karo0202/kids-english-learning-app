import axios from 'axios'
import crypto from 'crypto'

const NASSPAY_MERCHANT_ID = process.env.NASSPAY_MERCHANT_ID || ''
const NASSPAY_API_KEY = process.env.NASSPAY_API_KEY || ''
const NASSPAY_SECRET = process.env.NASSPAY_SECRET || ''
const NASSPAY_API_URL = process.env.NASSPAY_API_URL || 'https://api.nasspay.iq/v1'

export interface NassPayPaymentParams {
  amount: number
  orderId: string
  description: string
  callbackUrl: string
  customerEmail?: string
  customerPhone?: string
}

export interface NassPayPaymentResponse {
  transactionId: string
  paymentUrl: string
  paymentId: string
}

/**
 * Generate NassPay signature
 */
function generateNassPaySignature(data: Record<string, any>): string {
  const sortedKeys = Object.keys(data).sort()
  const signatureString = sortedKeys
    .map((key) => `${key}=${data[key]}`)
    .join('&')
  
  return crypto
    .createHmac('sha256', NASSPAY_SECRET)
    .update(signatureString)
    .digest('hex')
}

/**
 * Create NassPay payment request
 */
export async function createNassPayPayment(
  params: NassPayPaymentParams
): Promise<NassPayPaymentResponse> {
  try {
    const paymentData = {
      merchant_id: NASSPAY_MERCHANT_ID,
      amount: params.amount.toFixed(2),
      order_id: params.orderId,
      description: params.description,
      callback_url: params.callbackUrl,
      customer_email: params.customerEmail || '',
      customer_phone: params.customerPhone || '',
    }

    // Generate signature
    const signature = generateNassPaySignature(paymentData)

    const response = await axios.post(
      `${NASSPAY_API_URL}/payments/initiate`,
      {
        ...paymentData,
        signature,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': NASSPAY_API_KEY,
        },
      }
    )

    if (response.data.success && response.data.data) {
      return {
        transactionId: params.orderId,
        paymentUrl: response.data.data.payment_url,
        paymentId: response.data.data.payment_id,
      }
    } else {
      throw new Error(response.data.message || 'Failed to create NassPay payment')
    }
  } catch (error: any) {
    console.error('NassPay payment creation error:', error.response?.data || error.message)
    throw new Error(`Failed to create NassPay payment: ${error.message}`)
  }
}

/**
 * Verify NassPay webhook signature
 */
export function verifyNassPayWebhook(
  payload: string,
  signature: string
): boolean {
  try {
    const calculatedSignature = crypto
      .createHmac('sha256', NASSPAY_SECRET)
      .update(payload)
      .digest('hex')

    return signature === calculatedSignature
  } catch (error) {
    console.error('NassPay webhook verification error:', error)
    return false
  }
}


import axios from 'axios'
import crypto from 'crypto'

const FIB_MERCHANT_ID = process.env.FIB_MERCHANT_ID || ''
const FIB_API_KEY = process.env.FIB_API_KEY || ''
const FIB_SECRET = process.env.FIB_SECRET || ''
const FIB_API_URL = process.env.FIB_API_URL || 'https://api.fib.iq/v1'

export interface FIBPaymentParams {
  amount: number
  orderId: string
  description: string
  callbackUrl: string
  customerName?: string
  customerEmail?: string
}

export interface FIBPaymentResponse {
  transactionId: string
  paymentUrl: string
  paymentLink: string
}

/**
 * Generate FIB signature
 */
function generateFIBSignature(data: Record<string, any>): string {
  const sortedKeys = Object.keys(data).sort()
  const signatureString = sortedKeys
    .map((key) => `${key}=${data[key]}`)
    .join('&')
  
  return crypto
    .createHash('sha256')
    .update(signatureString + FIB_SECRET)
    .digest('hex')
}

/**
 * Create FIB payment link
 */
export async function createFIBPayment(
  params: FIBPaymentParams
): Promise<FIBPaymentResponse> {
  try {
    const paymentData = {
      merchant_id: FIB_MERCHANT_ID,
      amount: params.amount.toFixed(2),
      order_id: params.orderId,
      description: params.description,
      callback_url: params.callbackUrl,
      customer_name: params.customerName || '',
      customer_email: params.customerEmail || '',
    }

    // Generate signature
    const signature = generateFIBSignature(paymentData)

    const response = await axios.post(
      `${FIB_API_URL}/payments/create`,
      {
        ...paymentData,
        signature,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${FIB_API_KEY}`,
        },
      }
    )

    if (response.data.success && response.data.data) {
      return {
        transactionId: params.orderId,
        paymentUrl: response.data.data.payment_url,
        paymentLink: response.data.data.payment_link,
      }
    } else {
      throw new Error(response.data.message || 'Failed to create FIB payment')
    }
  } catch (error: any) {
    console.error('FIB payment creation error:', error.response?.data || error.message)
    throw new Error(`Failed to create FIB payment: ${error.message}`)
  }
}

/**
 * Verify FIB callback signature
 */
export function verifyFIBCallback(data: Record<string, any>): boolean {
  try {
    const receivedSignature = data.signature || data.hash
    if (!receivedSignature) {
      return false
    }

    // Remove signature from data for verification
    const { signature, hash, ...verificationData } = data
    const calculatedSignature = generateFIBSignature(verificationData)

    return calculatedSignature.toLowerCase() === receivedSignature.toLowerCase()
  } catch (error) {
    console.error('FIB callback verification error:', error)
    return false
  }
}


import axios from 'axios'
import crypto from 'crypto'

const ZAINCASH_MERCHANT_ID = process.env.ZAINCASH_MERCHANT_ID || ''
const ZAINCASH_SECRET = process.env.ZAINCASH_SECRET || ''
const ZAINCASH_REDIRECT_URL = process.env.ZAINCASH_REDIRECT_URL || ''
const ZAINCASH_API_URL = process.env.ZAINCASH_API_URL || 'https://test.zaincash.iq/transaction/init'

export interface ZainCashPaymentParams {
  amount: number
  orderId: string
  serviceType: string
  redirectUrl: string
  msisdn?: string // Phone number (optional)
}

export interface ZainCashPaymentResponse {
  transactionId: string
  paymentUrl: string
  id: string
}

/**
 * Generate ZainCash payment hash
 */
function generateZainCashHash(data: Record<string, string>): string {
  const sortedKeys = Object.keys(data).sort()
  const hashString = sortedKeys.map((key) => `${key}=${data[key]}`).join('&')
  return crypto.createHash('md5').update(hashString + ZAINCASH_SECRET).digest('hex')
}

/**
 * Create ZainCash payment request
 */
export async function createZainCashPayment(
  params: ZainCashPaymentParams
): Promise<ZainCashPaymentResponse> {
  try {
    const amount = Math.round(params.amount * 1000) // Convert to fils (IQD smallest unit)
    
    const paymentData = {
      amount: amount.toString(),
      orderId: params.orderId,
      serviceType: params.serviceType || 'Subscription',
      redirectUrl: params.redirectUrl,
      msisdn: params.msisdn || '',
    }

    // Generate hash
    const hash = generateZainCashHash(paymentData)

    // Create payment request
    const response = await axios.post(
      ZAINCASH_API_URL,
      {
        ...paymentData,
        hash,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.data.id) {
      return {
        transactionId: params.orderId,
        paymentUrl: `${ZAINCASH_API_URL.replace('/init', '')}/pay/${response.data.id}`,
        id: response.data.id,
      }
    } else {
      throw new Error('Invalid response from ZainCash')
    }
  } catch (error: any) {
    console.error('ZainCash payment creation error:', error.response?.data || error.message)
    throw new Error(`Failed to create ZainCash payment: ${error.message}`)
  }
}

/**
 * Verify ZainCash callback data
 */
export function verifyZainCashCallback(data: Record<string, any>): boolean {
  try {
    const receivedHash = data.hash || data.token
    if (!receivedHash) {
      return false
    }

    // Remove hash from data for verification
    const { hash, token, ...verificationData } = data
    const hashString = Object.keys(verificationData)
      .sort()
      .map((key) => `${key}=${verificationData[key]}`)
      .join('&')
    
    const calculatedHash = crypto
      .createHash('md5')
      .update(hashString + ZAINCASH_SECRET)
      .digest('hex')

    return calculatedHash.toLowerCase() === receivedHash.toLowerCase()
  } catch (error) {
    console.error('ZainCash verification error:', error)
    return false
  }
}


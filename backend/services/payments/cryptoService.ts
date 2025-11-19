import axios from 'axios'
import { generatePaymentToken } from '../../utils/paymentToken'

// CoinGate Configuration
const COINGATE_API_URL = 'https://api.coingate.com/v2'
const COINGATE_API_KEY = process.env.COINGATE_API_KEY || ''
const COINGATE_API_SECRET = process.env.COINGATE_API_SECRET || ''

// NOWPayments Configuration (alternative)
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1'
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY || ''

const USE_COINGATE = process.env.USE_COINGATE !== 'false' // Default to CoinGate

export interface CryptoInvoiceParams {
  amount: number
  currency: string
  orderId: string
  title: string
  description: string
  callbackUrl: string
  successUrl: string
  cancelUrl: string
}

export interface CryptoInvoiceResponse {
  invoiceId: string
  paymentUrl: string
  status: string
}

/**
 * Create crypto payment invoice using CoinGate
 */
export async function createCoinGateInvoice(
  params: CryptoInvoiceParams
): Promise<CryptoInvoiceResponse> {
  try {
    const response = await axios.post(
      `${COINGATE_API_URL}/orders`,
      {
        order_id: params.orderId,
        price_amount: params.amount,
        price_currency: params.currency,
        receive_currency: 'BTC', // or 'ETH', 'USDT', etc.
        title: params.title,
        description: params.description,
        callback_url: params.callbackUrl,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
      },
      {
        headers: {
          'Authorization': `Token ${COINGATE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return {
      invoiceId: response.data.id.toString(),
      paymentUrl: response.data.payment_url,
      status: response.data.status,
    }
  } catch (error: any) {
    console.error('CoinGate invoice creation error:', error.response?.data || error.message)
    throw new Error(`Failed to create CoinGate invoice: ${error.message}`)
  }
}

/**
 * Create crypto payment invoice using NOWPayments
 */
export async function createNOWPaymentsInvoice(
  params: CryptoInvoiceParams
): Promise<CryptoInvoiceResponse> {
  try {
    const response = await axios.post(
      `${NOWPAYMENTS_API_URL}/payment`,
      {
        price_amount: params.amount,
        price_currency: params.currency,
        pay_currency: 'BTC', // or other supported crypto
        order_id: params.orderId,
        order_description: params.description,
        ipn_callback_url: params.callbackUrl,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
      },
      {
        headers: {
          'x-api-key': NOWPAYMENTS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    )

    return {
      invoiceId: response.data.payment_id,
      paymentUrl: response.data.invoice_url || response.data.pay_url,
      status: response.data.payment_status,
    }
  } catch (error: any) {
    console.error('NOWPayments invoice creation error:', error.response?.data || error.message)
    throw new Error(`Failed to create NOWPayments invoice: ${error.message}`)
  }
}

/**
 * Create crypto invoice (uses CoinGate by default, falls back to NOWPayments)
 */
export async function createCryptoInvoice(
  params: CryptoInvoiceParams
): Promise<CryptoInvoiceResponse> {
  if (USE_COINGATE && COINGATE_API_KEY) {
    return createCoinGateInvoice(params)
  } else if (NOWPAYMENTS_API_KEY) {
    return createNOWPaymentsInvoice(params)
  } else {
    throw new Error('No crypto payment provider configured')
  }
}

/**
 * Verify CoinGate payment status
 */
export async function verifyCoinGatePayment(orderId: string): Promise<{
  status: string
  paid: boolean
}> {
  try {
    const response = await axios.get(`${COINGATE_API_URL}/orders/${orderId}`, {
      headers: {
        'Authorization': `Token ${COINGATE_API_KEY}`,
      },
    })

    return {
      status: response.data.status,
      paid: response.data.status === 'paid' || response.data.status === 'confirmed',
    }
  } catch (error: any) {
    console.error('CoinGate verification error:', error.response?.data || error.message)
    throw new Error(`Failed to verify CoinGate payment: ${error.message}`)
  }
}

/**
 * Verify NOWPayments payment status
 */
export async function verifyNOWPaymentsPayment(paymentId: string): Promise<{
  status: string
  paid: boolean
}> {
  try {
    const response = await axios.get(`${NOWPAYMENTS_API_URL}/payment/${paymentId}`, {
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY,
      },
    })

    return {
      status: response.data.payment_status,
      paid: response.data.payment_status === 'confirmed' || response.data.payment_status === 'finished',
    }
  } catch (error: any) {
    console.error('NOWPayments verification error:', error.response?.data || error.message)
    throw new Error(`Failed to verify NOWPayments payment: ${error.message}`)
  }
}


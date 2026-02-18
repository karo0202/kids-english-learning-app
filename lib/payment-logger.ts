/**
 * Payment request logging for audit trail
 * Logs all payment-related actions to Supabase
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export interface PaymentLogEntry {
  user_id: string
  action: 'create_payment' | 'confirm_payment' | 'payment_failed' | 'payment_success' | 'rate_limit_exceeded'
  transaction_id?: string
  plan_id?: string
  amount?: number
  currency?: string
  payment_method?: string
  ip_address?: string | null
  user_agent?: string | null
  error_message?: string
  metadata?: Record<string, any>
}

/**
 * Log payment action to database
 */
export async function logPaymentAction(entry: PaymentLogEntry): Promise<void> {
  if (!supabase) {
    // Fallback: log to console if Supabase not available
    console.log('📝 Payment Log:', {
      ...entry,
      timestamp: new Date().toISOString(),
    })
    return
  }

  try {
    await supabase.from('payment_logs').insert({
      user_id: entry.user_id,
      action: entry.action,
      transaction_id: entry.transaction_id || null,
      plan_id: entry.plan_id || null,
      amount: entry.amount || null,
      currency: entry.currency || null,
      payment_method: entry.payment_method || null,
      ip_address: entry.ip_address || null,
      user_agent: entry.user_agent || null,
      error_message: entry.error_message || null,
      metadata: entry.metadata || {},
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    // Don't fail the request if logging fails
    console.error('Failed to log payment action:', error)
  }
}

/**
 * Get request metadata from NextRequest
 */
export function getRequestMetadata(request: Request): {
  ip_address: string | null
  user_agent: string | null
} {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip')
  const userAgent = request.headers.get('user-agent')

  return {
    ip_address: ip || null,
    user_agent: userAgent || null,
  }
}

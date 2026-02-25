#!/usr/bin/env node
/**
 * Call the admin activate API to grant a user access after you've verified their payment.
 *
 * Usage:
 *   Set env vars then run with the transaction ID:
 *     set ACTIVATE_APP_URL=https://your-app.vercel.app
 *     set SUBSCRIPTION_ADMIN_SECRET=your_secret_from_vercel
 *     node scripts/activate-subscription.js pay_1738123456_abcxyz
 *
 *   Or one line (PowerShell):
 *     $env:ACTIVATE_APP_URL="https://your-app.vercel.app"; $env:SUBSCRIPTION_ADMIN_SECRET="your_secret"; node scripts/activate-subscription.js pay_1738123456_abcxyz
 *
 *   Or one line (CMD):
 *     set ACTIVATE_APP_URL=https://your-app.vercel.app & set SUBSCRIPTION_ADMIN_SECRET=your_secret & node scripts/activate-subscription.js pay_1738123456_abcxyz
 */

const appUrl = process.env.ACTIVATE_APP_URL || process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`.replace(/\/$/, '')
const secret = process.env.SUBSCRIPTION_ADMIN_SECRET
const transactionId = process.argv[2] && process.argv[2].trim()

if (!appUrl) {
  console.error('Missing ACTIVATE_APP_URL. Set it to your app URL, e.g. https://kids-english-learning-app.vercel.app')
  process.exit(1)
}
if (!secret) {
  console.error('Missing SUBSCRIPTION_ADMIN_SECRET. Use the same value you set in Vercel Environment Variables.')
  process.exit(1)
}
if (!transactionId) {
  console.error('Usage: node scripts/activate-subscription.js <transaction_id>')
  console.error('Get transaction_id from Supabase → Table Editor → subscriptions → transaction_id column (pending row).')
  process.exit(1)
}

const url = `${appUrl.replace(/\/$/, '')}/api/subscription/admin/activate`

;(async () => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Secret': secret,
      },
      body: JSON.stringify({ transactionId }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      console.log('OK:', data.message || data)
      console.log('Subscription activated. Ask the user to refresh the app.')
    } else {
      console.error('Error', res.status, data.error || data)
      process.exit(1)
    }
  } catch (e) {
    console.error('Request failed:', e.message)
    process.exit(1)
  }
})()

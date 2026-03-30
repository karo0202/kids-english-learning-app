/**
 * Email notification service using Resend
 * Alternative: SendGrid, AWS SES, Mailgun
 */

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

let resendClient: any = null

/**
 * Initialize Resend client
 */
function getResendClient() {
  if (resendClient) {
    return resendClient
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set - email notifications disabled')
    return null
  }

  try {
    // Dynamic import to avoid loading if not configured
    const { Resend } = require('resend')
    resendClient = new Resend(apiKey)
    return resendClient
  } catch (error) {
    console.warn('Resend not available:', error)
    return null
  }
}

/**
 * Send email notification
 */
/**
 * Emails that receive admin alerts for payments.
 * Set PAYMENT_NOTIFY_EMAILS=comma@separated.com,list@example.com
 * Or a single ADMIN_EMAIL as fallback.
 */
export function getPaymentNotificationRecipients(): string[] {
  const raw =
    process.env.PAYMENT_NOTIFY_EMAILS?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    ''
  if (!raw) return []
  const list = raw
    .split(/[,;]/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.includes('@'))
  return [...new Set(list)]
}

function adminDashboardUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
  return base ? `${base}/admin/payments` : ''
}

async function sendEmailToPaymentAdmins(subject: string, html: string): Promise<void> {
  const recipients = getPaymentNotificationRecipients()
  if (recipients.length === 0) {
    console.warn('No PAYMENT_NOTIFY_EMAILS or ADMIN_EMAIL — skipping admin payment notification')
    return
  }
  await Promise.all(
    recipients.map((to) =>
      sendEmail({
        to,
        subject,
        html,
      }).catch((err) => console.error('Admin notify failed for', to, err))
    )
  )
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const client = getResendClient()
  if (!client) {
    console.log('📧 Email would be sent (Resend not configured):', {
      to: options.to,
      subject: options.subject,
    })
    return false
  }

  try {
    const fromEmail = options.from || process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com'
    
    await client.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })

    console.log('✅ Email sent successfully to:', options.to)
    return true
  } catch (error: any) {
    console.error('Failed to send email:', error)
    return false
  }
}

/**
 * Send payment creation notification
 */
export async function sendPaymentCreatedEmail(params: {
  to: string
  userName: string
  transactionId: string
  amount: number
  currency: string
  planName: string
  paymentMethod: string
  phoneNumber?: string
  accountName?: string
}): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
        .info-row { margin: 10px 0; }
        .label { font-weight: bold; color: #667eea; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Instructions</h1>
        </div>
        <div class="content">
          <p>Dear ${params.userName},</p>
          <p>Thank you for choosing our subscription service! Please complete your payment using the details below:</p>
          
          <div class="info-box">
            <div class="info-row"><span class="label">Transaction ID:</span> ${params.transactionId}</div>
            <div class="info-row"><span class="label">Amount:</span> ${params.amount} ${params.currency}</div>
            <div class="info-row"><span class="label">Plan:</span> ${params.planName}</div>
            <div class="info-row"><span class="label">Payment Method:</span> ${params.paymentMethod}</div>
            ${params.phoneNumber ? `<div class="info-row"><span class="label">Phone Number:</span> ${params.phoneNumber}</div>` : ''}
            ${params.accountName ? `<div class="info-row"><span class="label">Account Name:</span> ${params.accountName}</div>` : ''}
          </div>

          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Send the payment to the phone number above</li>
            <li>Submit your payment reference in the app</li>
            <li>We'll verify and activate your subscription within 24-48 hours</li>
          </ol>

          <p>If you have any questions, please contact our support team.</p>
          
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: params.to,
    subject: `Payment Instructions - Transaction ${params.transactionId.substring(0, 12)}...`,
    html,
  })
}

/**
 * Send payment confirmation notification
 */
export async function sendPaymentConfirmedEmail(params: {
  to: string
  userName: string
  transactionId: string
  planName: string
  expiresAt: Date
}): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Payment Confirmed!</h1>
        </div>
        <div class="content">
          <p>Dear ${params.userName},</p>
          <p>Great news! Your payment has been received and verified.</p>
          
          <div class="success-box">
            <p><strong>Subscription Details:</strong></p>
            <ul>
              <li><strong>Transaction ID:</strong> ${params.transactionId}</li>
              <li><strong>Plan:</strong> ${params.planName}</li>
              <li><strong>Expires:</strong> ${params.expiresAt.toLocaleDateString()}</li>
            </ul>
          </div>

          <p>Your subscription is now active! Enjoy all premium features.</p>
          
          <div class="footer">
            <p>Thank you for your subscription!</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: params.to,
    subject: `Payment Confirmed - ${params.planName}`,
    html,
  })
}

/**
 * Notify admins when a user starts a manual payment (transaction created, pending transfer).
 */
export async function sendAdminNewPendingPaymentEmail(params: {
  transactionId: string
  planName: string
  amount: number
  currency: string
  userId: string
  userEmail?: string
  paymentMethod: string
  payToPhone?: string
}): Promise<void> {
  const dash = adminDashboardUrl()
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #5b21b6;">New pending payment</h2>
        <p>A user started a paid-module checkout (manual / FIB flow).</p>
        <table style="width: 100%; border-collapse: collapse; background: #f9fafb; border-radius: 8px;">
          <tr><td style="padding: 8px 12px; font-weight: bold;">Transaction ID</td><td style="padding: 8px 12px;">${escapeHtml(params.transactionId)}</td></tr>
          <tr><td style="padding: 8px 12px; font-weight: bold;">Plan</td><td style="padding: 8px 12px;">${escapeHtml(params.planName)}</td></tr>
          <tr><td style="padding: 8px 12px; font-weight: bold;">Amount</td><td style="padding: 8px 12px;">${params.amount} ${escapeHtml(params.currency)}</td></tr>
          <tr><td style="padding: 8px 12px; font-weight: bold;">User ID</td><td style="padding: 8px 12px; font-size: 12px; word-break: break-all;">${escapeHtml(params.userId)}</td></tr>
          ${params.userEmail ? `<tr><td style="padding: 8px 12px; font-weight: bold;">Email</td><td style="padding: 8px 12px;">${escapeHtml(params.userEmail)}</td></tr>` : ''}
          <tr><td style="padding: 8px 12px; font-weight: bold;">Method</td><td style="padding: 8px 12px;">${escapeHtml(params.paymentMethod)}</td></tr>
          ${params.payToPhone ? `<tr><td style="padding: 8px 12px; font-weight: bold;">Pay to (FIB)</td><td style="padding: 8px 12px;">${escapeHtml(params.payToPhone)}</td></tr>` : ''}
        </table>
        ${dash ? `<p style="margin-top: 20px;"><a href="${escapeHtml(dash)}" style="color: #5b21b6;">Open admin payments</a></p>` : '<p style="margin-top: 16px; color: #666;">Review pending payments in your admin dashboard.</p>'}
      </div>
    </body>
    </html>
  `
  const shortId = params.transactionId.slice(0, 14)
  await sendEmailToPaymentAdmins(`[Kids English] New pending payment — ${shortId}`, html)
}

/**
 * Notify admins when a user submits payment reference / proof (awaiting verification).
 */
export async function sendAdminPaymentProofSubmittedEmail(params: {
  transactionId: string
  userId: string
  userEmail?: string
  reference?: string
  hasProofScreenshot: boolean
  contactPhone?: string
  notesPreview?: string
}): Promise<void> {
  const dash = adminDashboardUrl()
  const ref = params.reference ? escapeHtml(params.reference) : '—'
  const notes = params.notesPreview ? escapeHtml(params.notesPreview) : '—'
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0d9488;">Payment proof submitted</h2>
        <p>A user submitted a reference or screenshot for verification.</p>
        <table style="width: 100%; border-collapse: collapse; background: #f0fdfa; border-radius: 8px;">
          <tr><td style="padding: 8px 12px; font-weight: bold;">Transaction ID</td><td style="padding: 8px 12px;">${escapeHtml(params.transactionId)}</td></tr>
          <tr><td style="padding: 8px 12px; font-weight: bold;">User ID</td><td style="padding: 8px 12px; font-size: 12px; word-break: break-all;">${escapeHtml(params.userId)}</td></tr>
          ${params.userEmail ? `<tr><td style="padding: 8px 12px; font-weight: bold;">Email</td><td style="padding: 8px 12px;">${escapeHtml(params.userEmail)}</td></tr>` : ''}
          <tr><td style="padding: 8px 12px; font-weight: bold;">Reference</td><td style="padding: 8px 12px;">${ref}</td></tr>
          <tr><td style="padding: 8px 12px; font-weight: bold;">Screenshot</td><td style="padding: 8px 12px;">${params.hasProofScreenshot ? 'Yes (view in admin)' : 'No'}</td></tr>
          ${params.contactPhone ? `<tr><td style="padding: 8px 12px; font-weight: bold;">Contact phone</td><td style="padding: 8px 12px;">${escapeHtml(params.contactPhone)}</td></tr>` : ''}
          <tr><td style="padding: 8px 12px; font-weight: bold; vertical-align: top;">Notes</td><td style="padding: 8px 12px;">${notes}</td></tr>
        </table>
        ${dash ? `<p style="margin-top: 20px;"><a href="${escapeHtml(dash)}" style="color: #0f766e;">Open admin payments</a></p>` : '<p style="margin-top: 16px; color: #666;">Open Admin → Payments to review the proof.</p>'}
      </div>
    </body>
    </html>
  `
  const shortId = params.transactionId.slice(0, 14)
  await sendEmailToPaymentAdmins(`[Kids English] Proof submitted — ${shortId}`, html)
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

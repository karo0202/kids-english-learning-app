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

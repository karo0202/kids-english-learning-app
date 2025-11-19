/**
 * Send email receipt after successful payment
 * This is a generic helper - implement with your preferred email service
 * (SendGrid, AWS SES, Mailgun, etc.)
 */

export interface EmailReceiptParams {
  to: string
  userName: string
  transactionId: string
  amount: number
  currency: string
  planName: string
  paymentMethod: string
  expiresAt: Date
}

export async function sendEmailReceipt(params: EmailReceiptParams): Promise<void> {
  // TODO: Implement with your email service
  // Example with SendGrid, AWS SES, or Mailgun
  
  const emailContent = {
    to: params.to,
    subject: 'Subscription Payment Confirmation',
    html: `
      <h2>Thank you for your subscription!</h2>
      <p>Dear ${params.userName},</p>
      <p>Your payment has been successfully processed.</p>
      <ul>
        <li><strong>Transaction ID:</strong> ${params.transactionId}</li>
        <li><strong>Amount:</strong> ${params.amount} ${params.currency}</li>
        <li><strong>Plan:</strong> ${params.planName}</li>
        <li><strong>Payment Method:</strong> ${params.paymentMethod}</li>
        <li><strong>Expires At:</strong> ${params.expiresAt.toLocaleDateString()}</li>
      </ul>
      <p>Thank you for using our service!</p>
    `,
  }

  console.log('📧 Email receipt would be sent:', emailContent)
  
  // Example implementation:
  // await sendGrid.send(emailContent)
  // or
  // await ses.sendEmail(emailContent)
}


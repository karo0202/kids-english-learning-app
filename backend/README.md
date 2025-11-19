# Subscription Payment System - Backend

A complete, production-ready subscription payment system supporting multiple payment providers including crypto (CoinGate/NOWPayments) and Iraqi payment gateways (ZainCash, FastPay, NassPay, FIB).

## 🚀 Features

- **Multiple Payment Providers**: Crypto (CoinGate/NOWPayments), ZainCash, FastPay, NassPay, FIB
- **Secure Webhooks**: Signature verification for all providers
- **Subscription Management**: Create, activate, and manage subscriptions
- **Transaction Logging**: Complete payment transaction history
- **Admin Panel**: View payments and subscriptions
- **Type-Safe**: Full TypeScript support

## 📦 Installation

```bash
cd backend
npm install
```

## ⚙️ Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in all required environment variables (see `.env.example` for details)

3. Set up MongoDB database

## 🗄️ Database Setup

The system uses MongoDB with Mongoose. Make sure MongoDB is running:

```bash
# Using Docker
docker run -d -p 27017:27017 mongo

# Or use MongoDB Atlas (cloud)
```

## 🏃 Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 📡 API Endpoints

### Subscription

- `GET /api/subscription/plans` - Get all subscription plans
- `POST /api/subscription/create` - Create subscription payment
- `GET /api/subscription/status` - Get user subscription status
- `POST /api/subscription/verify` - Verify subscription

### Webhooks

- `POST /api/webhooks/crypto` - CoinGate/NOWPayments webhook
- `POST /api/webhooks/zaincash` - ZainCash callback
- `POST /api/webhooks/fastpay` - FastPay webhook
- `POST /api/webhooks/nasspay` - NassPay webhook
- `POST /api/webhooks/fib` - FIB callback

### Admin

- `GET /api/admin/payments` - Get all payments
- `GET /api/admin/subscriptions` - Get all subscriptions
- `POST /api/admin/updatePlan` - Update subscription plan

## 🔐 Authentication

All subscription endpoints require JWT authentication. Include token in header:

```
Authorization: Bearer <your-jwt-token>
```

## 🔒 Security Features

- Webhook signature verification for all providers
- Idempotency checks to prevent duplicate processing
- Secure token generation
- Environment variable protection

## 📝 Payment Flow

1. User selects plan and payment method
2. Backend creates subscription (pending) and payment transaction
3. User redirected to payment provider
4. Provider processes payment and sends webhook
5. Backend verifies webhook signature
6. Subscription activated automatically
7. User receives confirmation

## 🧪 Testing

Configure webhook URLs in payment provider dashboards:

- **CoinGate**: `https://your-domain.com/api/webhooks/crypto`
- **NOWPayments**: `https://your-domain.com/api/webhooks/crypto`
- **ZainCash**: `https://your-domain.com/api/webhooks/zaincash`
- **FastPay**: `https://your-domain.com/api/webhooks/fastpay`
- **NassPay**: `https://your-domain.com/api/webhooks/nasspay`
- **FIB**: `https://your-domain.com/api/webhooks/fib`

## 📚 Models

- **Subscription**: User subscription records
- **PaymentTransaction**: Payment transaction logs
- **SubscriptionPlan**: Available subscription plans

## 🛠️ Utilities

- `generatePaymentToken()` - Generate unique payment tokens
- `verifyWebhookSignature()` - Verify provider webhook signatures
- `activateSubscription()` - Activate subscription after payment
- `sendEmailReceipt()` - Send payment confirmation email

## 📧 Email Service

Implement `sendEmailReceipt()` in `services/emailService.ts` with your preferred email provider (SendGrid, AWS SES, Mailgun, etc.)

## 🔄 Cron Jobs

Set up a cron job to expire old subscriptions:

```typescript
import { expireOldSubscriptions } from './services/subscriptionService'

// Run daily
setInterval(async () => {
  await expireOldSubscriptions()
}, 24 * 60 * 60 * 1000)
```

## 🚨 Error Handling

All endpoints include proper error handling and logging. Check server logs for debugging.

## 📖 License

MIT


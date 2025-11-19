# Complete Subscription Payment System Setup Guide

This guide will help you set up the complete subscription payment system for your app.

## 📋 Table of Contents

1. [Backend Setup](#backend-setup)
2. [Frontend Integration](#frontend-integration)
3. [Payment Provider Configuration](#payment-provider-configuration)
4. [Testing](#testing)
5. [Production Deployment](#production-deployment)

## 🚀 Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

**Required Variables:**
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `FRONTEND_URL` - Your frontend URL
- `BACKEND_URL` - Your backend URL

### 3. Seed Subscription Plans

```bash
npm run dev
# In another terminal:
npx ts-node scripts/seedPlans.ts
```

### 4. Start the Server

```bash
npm run dev  # Development
# or
npm run build && npm start  # Production
```

## 🎨 Frontend Integration

### 1. Add API Routes

The frontend components are already created. Make sure your Next.js API routes proxy to the backend:

**Create `app/api/subscription/[...path]/route.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const token = request.headers.get('authorization')
  
  const response = await fetch(`${BACKEND_URL}/api/subscription/${path}`, {
    headers: {
      Authorization: token || '',
    },
  })
  
  return NextResponse.json(await response.json())
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const body = await request.json()
  const token = request.headers.get('authorization')
  
  const response = await fetch(`${BACKEND_URL}/api/subscription/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token || '',
    },
    body: JSON.stringify(body),
  })
  
  return NextResponse.json(await response.json())
}
```

### 2. Update Authentication

Make sure your frontend authentication stores the JWT token:

```typescript
// After login
localStorage.setItem('accessToken', token)
```

## 💳 Payment Provider Configuration

### Crypto Payments (CoinGate)

1. Sign up at [CoinGate.com](https://coingate.com)
2. Get your API credentials from the dashboard
3. Set webhook URL: `https://your-domain.com/api/webhooks/crypto`
4. Add to `.env`:
   ```
   COINGATE_API_KEY=your-key
   COINGATE_API_SECRET=your-secret
   COINGATE_WEBHOOK_SECRET=your-webhook-secret
   ```

### Crypto Payments (NOWPayments - Alternative)

1. Sign up at [NOWPayments.io](https://nowpayments.io)
2. Get API key from dashboard
3. Set webhook URL: `https://your-domain.com/api/webhooks/crypto`
4. Add to `.env`:
   ```
   NOWPAYMENTS_API_KEY=your-key
   NOWPAYMENTS_WEBHOOK_SECRET=your-secret
   USE_COINGATE=false
   ```

### ZainCash

1. Register at [ZainCash](https://zaincash.iq)
2. Get merchant ID and secret key
3. Set callback URL: `https://your-domain.com/api/webhooks/zaincash`
4. Add to `.env`:
   ```
   ZAINCASH_MERCHANT_ID=your-merchant-id
   ZAINCASH_SECRET=your-secret
   ZAINCASH_REDIRECT_URL=https://your-domain.com/api/webhooks/zaincash
   ```

### FastPay

1. Register at [FastPay](https://fastpay.iq)
2. Get merchant ID and API key
3. Set webhook URL: `https://your-domain.com/api/webhooks/fastpay`
4. Add to `.env`:
   ```
   FASTPAY_MERCHANT_ID=your-merchant-id
   FASTPAY_API_KEY=your-api-key
   ```

### NassPay

1. Register at [NassPay](https://nasspay.iq)
2. Get merchant ID, API key, and secret
3. Set webhook URL: `https://your-domain.com/api/webhooks/nasspay`
4. Add to `.env`:
   ```
   NASSPAY_MERCHANT_ID=your-merchant-id
   NASSPAY_API_KEY=your-api-key
   NASSPAY_SECRET=your-secret
   ```

### FIB (Fast Iraqi Bank)

1. Register at FIB
2. Get merchant ID, API key, and secret
3. Set callback URL: `https://your-domain.com/api/webhooks/fib`
4. Add to `.env`:
   ```
   FIB_MERCHANT_ID=your-merchant-id
   FIB_API_KEY=your-api-key
   FIB_SECRET=your-secret
   ```

## 🧪 Testing

### 1. Test Subscription Creation

```bash
curl -X POST http://localhost:5000/api/subscription/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "planId": "monthly",
    "paymentMethod": "crypto"
  }'
```

### 2. Test Webhook (using ngrok for local testing)

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok tunnel
ngrok http 5000

# Use ngrok URL in payment provider webhook settings
```

### 3. Verify Subscription Status

```bash
curl http://localhost:5000/api/subscription/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚢 Production Deployment

### 1. Environment Variables

Set all environment variables in your hosting platform (Vercel, Railway, etc.)

### 2. Database

Use MongoDB Atlas for production database

### 3. Webhook URLs

Update all payment provider webhook URLs to your production domain

### 4. SSL Certificate

Ensure your domain has SSL (HTTPS) for secure webhook delivery

### 5. Monitoring

Set up monitoring for:
- Webhook delivery failures
- Payment processing errors
- Subscription expiration

## 🔒 Security Checklist

- [ ] All API keys stored in environment variables
- [ ] Webhook signatures verified for all providers
- [ ] JWT tokens have secure expiration times
- [ ] HTTPS enabled for all endpoints
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using Mongoose)
- [ ] CORS properly configured

## 📊 Admin Panel

Access admin panel at `/admin/subscriptions` (requires admin email in `ADMIN_EMAILS`)

## 🐛 Troubleshooting

### Webhooks not receiving

1. Check webhook URL is correct in provider dashboard
2. Verify SSL certificate is valid
3. Check server logs for errors
4. Test with ngrok for local development

### Payments not activating

1. Verify webhook signature verification
2. Check transaction logs in database
3. Verify subscription service is working
4. Check payment provider status

### Subscription not showing

1. Verify JWT token is valid
2. Check user ID matches subscription userId
3. Verify subscription hasn't expired
4. Check database for subscription record

## 📞 Support

For issues or questions, check:
- Backend logs: `console.log` statements
- Database: Check MongoDB collections
- Payment provider dashboards: Transaction status

## 📝 Notes

- All payment amounts should be in the provider's supported currency
- Webhook processing is idempotent (safe to retry)
- Subscriptions automatically expire based on `expiresAt` date
- Use cron jobs to expire old subscriptions daily


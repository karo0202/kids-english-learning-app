# Quick Start Guide - Subscription Payment System

## 🎯 What You Have

A complete subscription payment system with:
- ✅ 5 Payment Methods (Crypto, ZainCash, FastPay, NassPay, FIB)
- ✅ Full Backend API (Express + TypeScript + MongoDB)
- ✅ Frontend Components (React/Next.js)
- ✅ Admin Panel
- ✅ Webhook Security

## ⚡ 5-Minute Setup

### Step 1: Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with MongoDB URI and JWT secrets
npm run dev
```

### Step 2: Seed Plans

```bash
npx ts-node scripts/seedPlans.ts
```

### Step 3: Configure Payment Providers

Add your API keys to `backend/.env`:

```env
# At minimum, configure ONE payment method:
COINGATE_API_KEY=your-key
# OR
ZAINCASH_MERCHANT_ID=your-id
ZAINCASH_SECRET=your-secret
```

### Step 4: Test

1. Visit `/subscribe` in your app
2. Select a plan
3. Choose payment method
4. Complete payment
5. Subscription activates automatically!

## 📁 Key Files

**Backend:**
- `backend/server.ts` - Main server
- `backend/routes/subscription.ts` - Subscription API
- `backend/routes/webhooks.ts` - Payment webhooks
- `backend/services/payments/*` - Payment providers

**Frontend:**
- `app/subscribe/page.tsx` - Subscription page
- `components/subscription/*` - UI components
- `app/api/subscription/[...path]/route.ts` - API proxy

## 🔗 API Endpoints

- `GET /api/subscription/plans` - Get plans
- `POST /api/subscription/create` - Create subscription
- `GET /api/subscription/status` - Check status
- `POST /api/webhooks/{method}` - Payment webhooks

## 🔐 Environment Variables

**Required:**
- `MONGODB_URI` - MongoDB connection
- `JWT_SECRET` - JWT signing key
- `FRONTEND_URL` - Your frontend URL
- `BACKEND_URL` - Your backend URL

**Payment Providers (at least one):**
- CoinGate: `COINGATE_API_KEY`, `COINGATE_API_SECRET`
- ZainCash: `ZAINCASH_MERCHANT_ID`, `ZAINCASH_SECRET`
- FastPay: `FASTPAY_MERCHANT_ID`, `FASTPAY_API_KEY`
- NassPay: `NASSPAY_MERCHANT_ID`, `NASSPAY_API_KEY`, `NASSPAY_SECRET`
- FIB: `FIB_MERCHANT_ID`, `FIB_API_KEY`, `FIB_SECRET`

## 🚀 Production Checklist

1. ✅ Set all environment variables
2. ✅ Configure MongoDB (Atlas recommended)
3. ✅ Set webhook URLs in payment provider dashboards
4. ✅ Enable HTTPS
5. ✅ Test all payment methods
6. ✅ Set up monitoring

## 📖 Full Documentation

- **Setup Guide**: `SUBSCRIPTION_SETUP.md`
- **System Summary**: `SUBSCRIPTION_SYSTEM_SUMMARY.md`
- **Backend README**: `backend/README.md`

## 🆘 Need Help?

1. Check server logs for errors
2. Verify webhook URLs are correct
3. Test with one payment method first
4. Review `SUBSCRIPTION_SETUP.md` for detailed instructions

---

**You're all set!** The system is ready to accept payments. 🎉


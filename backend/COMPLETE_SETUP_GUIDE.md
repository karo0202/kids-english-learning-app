# Complete Setup Guide - Subscription Payment System

## ✅ Automated Setup Steps

I've created automated scripts to help you set up the system. Follow these steps:

### Step 1: Create .env File ✅ DONE

The `.env` file has been created automatically with default values.

**Next:** Update these values in `backend/.env`:
- `MONGODB_URI` - Your MongoDB connection string
- `ADMIN_EMAILS` - Your admin email address
- Payment provider credentials (when ready)

### Step 2: Install Dependencies ✅ DONE

Dependencies have been installed in the `backend` directory.

### Step 3: Set Up MongoDB

You need MongoDB running. Choose one option:

#### Option A: MongoDB Atlas (Recommended - Free Cloud Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a free cluster (M0 - Free)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Update `MONGODB_URI` in `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/kids-english-app?retryWrites=true&w=majority
   ```
7. Replace `username` and `password` with your database user credentials

#### Option B: Local MongoDB

**Windows:**
1. Download MongoDB from [mongodb.com/download](https://www.mongodb.com/try/download/community)
2. Install MongoDB
3. Start MongoDB service (usually starts automatically)
4. Verify it's running on `mongodb://localhost:27017`

**Using Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

### Step 4: Verify MongoDB Connection

```bash
cd backend
npm run check-mongo
```

If successful, proceed to Step 5.

### Step 5: Seed Subscription Plans

```bash
cd backend
npm run setup
```

This will:
- Connect to MongoDB
- Create subscription plans (Monthly, Yearly, Lifetime)
- Check environment configuration
- Verify payment provider setup

### Step 6: Start the Backend Server

```bash
cd backend
npm run dev
```

The server will start on `http://localhost:5000`

### Step 7: Configure Frontend Environment

Add to your main `.env` file (in `app` directory):

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
BACKEND_URL=http://localhost:5000
```

### Step 8: Test the System

1. Start your Next.js frontend (if not already running):
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/subscribe`

3. You should see subscription plans

4. Select a plan and payment method (payment won't work until you configure a provider)

## 🔧 Payment Provider Configuration

### Quick Start - Configure One Provider

You only need to configure **ONE** payment provider to start accepting payments.

#### CoinGate (Crypto - Easiest)

1. Sign up at [CoinGate.com](https://coingate.com)
2. Go to Settings → API
3. Create API token
4. Add to `backend/.env`:
   ```
   COINGATE_API_KEY=your-api-key
   COINGATE_API_SECRET=your-api-secret
   COINGATE_WEBHOOK_SECRET=your-webhook-secret
   ```
5. Set webhook URL in CoinGate dashboard:
   ```
   http://localhost:5000/api/webhooks/crypto
   ```
   (For production, use your domain: `https://your-domain.com/api/webhooks/crypto`)

#### ZainCash (Iraqi Payments)

1. Register at [ZainCash](https://zaincash.iq)
2. Get merchant ID and secret
3. Add to `backend/.env`:
   ```
   ZAINCASH_MERCHANT_ID=your-merchant-id
   ZAINCASH_SECRET=your-secret
   ZAINCASH_REDIRECT_URL=http://localhost:5000/api/webhooks/zaincash
   ```

## 📋 Setup Checklist

- [x] ✅ Dependencies installed
- [x] ✅ .env file created
- [ ] ⏳ MongoDB configured (Atlas or local)
- [ ] ⏳ Subscription plans seeded
- [ ] ⏳ Backend server running
- [ ] ⏳ Frontend environment variables set
- [ ] ⏳ At least one payment provider configured
- [ ] ⏳ Test subscription flow

## 🚀 Quick Commands Reference

```bash
# Navigate to backend
cd backend

# Create .env file (already done)
npm run create-env

# Check MongoDB connection
npm run check-mongo

# Seed subscription plans
npm run setup

# Start development server
npm run dev

# Seed plans only
npm run seed
```

## 🐛 Troubleshooting

### MongoDB Connection Failed

**Error:** `connect ECONNREFUSED`

**Solutions:**
1. Check MongoDB is running: `mongosh` (should connect)
2. Verify `MONGODB_URI` in `.env` is correct
3. For Atlas: Check IP whitelist (add `0.0.0.0/0` for testing)
4. For local: Check MongoDB service is running

### TypeScript Errors

**Error:** `Cannot find module`

**Solution:**
```bash
cd backend
npm install
```

### Port Already in Use

**Error:** `Port 5000 already in use`

**Solution:**
Change `PORT=5000` to another port in `.env`

## 📞 Next Steps After Setup

1. **Configure Payment Provider** - Add API keys to `.env`
2. **Test Payment Flow** - Try a test payment
3. **Set Up Webhooks** - Configure webhook URLs in provider dashboards
4. **Production Deployment** - Update URLs for production
5. **Monitor Transactions** - Check admin panel at `/admin/subscriptions`

## 📚 Documentation

- **Quick Start**: `QUICK_START_SUBSCRIPTION.md`
- **Full Setup**: `SUBSCRIPTION_SETUP.md`
- **System Summary**: `SUBSCRIPTION_SYSTEM_SUMMARY.md`
- **Backend README**: `README.md`

---

**You're almost there!** Just set up MongoDB and you're ready to go! 🚀


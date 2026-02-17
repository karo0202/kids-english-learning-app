# Supabase Setup - Works in Iraq! 🇮🇶

Since MongoDB Atlas doesn't support Iraq, we'll use **Supabase** (PostgreSQL) instead. It works globally!

## Step 1: Create Supabase Account (Free)

1. Go to **https://supabase.com**
2. Click **"Start your project"** → Sign up with GitHub/Google
3. Create a new project:
   - **Name**: `kids-english-app`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you (or any available region)
   - Click **"Create new project"** (takes ~2 minutes)

## Step 2: Create Database Tables

Once your project is ready:

1. Go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Paste this SQL and click **"Run"**:

```sql
-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id BIGSERIAL PRIMARY KEY,
  plan_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  duration INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT NOT NULL,
  transaction_id TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  expires_at TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id BIGSERIAL PRIMARY KEY,
  transaction_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  subscription_id BIGINT,
  payment_method TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  provider_response JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);

-- Insert default plans
INSERT INTO subscription_plans (plan_id, name, description, duration, price, currency, features, is_active)
VALUES
  ('monthly', 'Monthly Plan', 'Full access for 30 days', 30, 9.99, 'USD', 
   '["Access to all learning modules", "Unlimited child profiles", "Progress tracking", "Email support"]', true),
  ('yearly', 'Yearly Plan', 'Full access for 365 days (Save 20%)', 365, 95.99, 'USD',
   '["Access to all learning modules", "Unlimited child profiles", "Progress tracking", "Priority email support", "Early access to new features"]', true),
  ('lifetime', 'Lifetime Plan', 'One-time payment, lifetime access', 9999, 199.99, 'USD',
   '["Lifetime access to all modules", "Unlimited child profiles", "Advanced progress tracking", "Priority support", "Early access to new features", "Exclusive content"]', true)
ON CONFLICT (plan_id) DO NOTHING;
```

4. You should see **"Success. No rows returned"**

## Step 3: Get API Keys

1. Go to **Settings** → **API** (left sidebar)
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **service_role key** (under "Project API keys" → "service_role" - keep this secret!)

## Step 4: Add to Vercel Environment Variables

1. Go to **https://vercel.com/dashboard**
2. Your project → **Settings** → **Environment Variables**
3. Add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role key |
| `FIB_PHONE_NUMBER` | 07700802848 |
| `FIB_ACCOUNT_NAME` | KARO LATEEF HUSSEIN HUSSEIN |
| `FIB_QR_IMAGE_URL` | https://kids-english-learning-app-sepia.vercel.app/images/FIB-payment-QR/fib-qr-code.jpg |
| `FIB_QR_TEXT` | P4CD-GNCB-Q9IR |
| `FIB_MANUAL_NOTE` | Extra instructions |

4. Click **Save**
5. **Redeploy** your project

## That's It! 🎉

Your payment system will now work with Supabase instead of MongoDB. Supabase works globally, including Iraq!

## Alternative: Use Railway MongoDB

If you prefer MongoDB, you can also use **Railway** which might have better regional support:

1. Go to **https://railway.app**
2. Create account → New Project → Add MongoDB
3. Get connection string
4. Use `MONGODB_URI` instead of Supabase variables

But Supabase is recommended as it's simpler and works everywhere! ✅

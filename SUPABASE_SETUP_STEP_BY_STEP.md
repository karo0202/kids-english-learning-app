# Supabase Setup - Complete Step-by-Step Guide 🇮🇶

This guide will walk you through setting up Supabase for your payment system. It works in Iraq!

---

## Step 1: Create Supabase Account

### 1.1 Go to Supabase Website
1. Open your web browser
2. Go to: **https://supabase.com**
3. Click the **"Start your project"** button (usually in the top right corner)

### 1.2 Sign Up
You have two options:

**Option A: Sign up with GitHub (Recommended)**
1. Click **"Sign up with GitHub"**
2. Authorize Supabase to access your GitHub account
3. You'll be redirected back to Supabase

**Option B: Sign up with Email**
1. Click **"Sign up with Email"**
2. Enter your email address
3. Enter a password (make it strong!)
4. Click **"Create account"**
5. Check your email and verify your account

---

## Step 2: Create a New Project

### 2.1 Start New Project
1. After logging in, you'll see the Supabase dashboard
2. Click the **"New Project"** button (usually green, top right)

### 2.2 Fill in Project Details

**Project Name:**
- Enter: `kids-english-app` (or any name you prefer)
- This is just for your reference

**Database Password:**
- **IMPORTANT:** Create a strong password (at least 12 characters)
- **SAVE THIS PASSWORD** - you'll need it later!
- Example: `MySecurePass123!@#`
- Write it down in a safe place

**Region:**
- Choose the region closest to you
- If you're in Iraq, choose:
  - **West US (N. California)** or
  - **East US (N. Virginia)** or
  - **Europe (Frankfurt)** - closest option
- Don't worry too much - any region will work

**Pricing Plan:**
- Select **"Free"** (it's free forever for small projects!)

### 2.3 Create Project
1. Click the **"Create new project"** button
2. Wait 2-3 minutes while Supabase sets up your database
3. You'll see a loading screen with progress
4. **Don't close the browser** - wait for it to finish!

---

## Step 3: Create Database Tables

### 3.1 Open SQL Editor
1. Once your project is ready, you'll see the dashboard
2. Look at the left sidebar menu
3. Click on **"SQL Editor"** (it has a database icon)

### 3.2 Create New Query
1. In the SQL Editor, click the **"New query"** button (top left)
2. You'll see a blank text area where you can type SQL

### 3.3 Copy and Paste SQL Script
1. Copy the **entire SQL script** below (starts with `-- Subscription Plans Table`)
2. Paste it into the SQL Editor text area
3. Make sure you copy everything from `-- Subscription Plans Table` to the end

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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);

-- Insert default subscription plans
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

### 3.4 Run the SQL Script
1. After pasting the SQL, click the **"Run"** button (or press `Ctrl+Enter`)
2. Wait a few seconds
3. You should see a success message: **"Success. No rows returned"** or similar
4. If you see any errors, check that you copied the entire script correctly

### 3.5 Verify Tables Were Created
1. In the left sidebar, click **"Table Editor"**
2. You should see three tables:
   - `subscription_plans`
   - `subscriptions`
   - `payment_transactions`
3. Click on `subscription_plans` - you should see 3 rows (monthly, yearly, lifetime plans)

**✅ If you see the tables, you're done with this step!**

---

## Step 4: Get Your API Keys

### 4.1 Go to API Settings
1. In the left sidebar, click **"Settings"** (gear icon at the bottom)
2. Click **"API"** in the settings menu

### 4.2 Find Your Project URL
1. Look for **"Project URL"** section
2. You'll see a URL like: `https://xxxxxxxxxxxxx.supabase.co`
3. **Copy this entire URL** - you'll need it for Vercel

### 4.3 Find Your Service Role Key
1. Scroll down to **"Project API keys"** section
2. You'll see two keys:
   - **anon** `public` key (don't use this)
   - **service_role** `secret` key (use this one!)
3. Click the **eye icon** next to `service_role` to reveal it
4. Click the **copy icon** to copy the entire key
5. **IMPORTANT:** This key is secret - don't share it publicly!

**⚠️ Security Note:** The `service_role` key has admin access. Keep it secret and only use it in server-side code (Vercel environment variables).

---

## Step 5: Add to Vercel Environment Variables

### 5.1 Go to Vercel Dashboard
1. Open a new browser tab
2. Go to: **https://vercel.com/dashboard**
3. Log in if needed

### 5.2 Select Your Project
1. Find your project: `kids-english-learning-app` (or your project name)
2. Click on it to open

### 5.3 Open Settings
1. Click the **"Settings"** tab (at the top)
2. In the left sidebar, click **"Environment Variables"**

### 5.4 Add Supabase Variables

**Add Variable 1: NEXT_PUBLIC_SUPABASE_URL**
1. Click **"Add New"** button
2. **Key:** `NEXT_PUBLIC_SUPABASE_URL`
3. **Value:** Paste your Supabase Project URL (from Step 4.2)
4. **Environment:** Select all three:
   - ☑ Production
   - ☑ Preview
   - ☑ Development
5. Click **"Save"**

**Add Variable 2: SUPABASE_SERVICE_ROLE_KEY**
1. Click **"Add New"** button again
2. **Key:** `SUPABASE_SERVICE_ROLE_KEY`
3. **Value:** Paste your Supabase service_role key (from Step 4.3)
4. **Environment:** Select all three:
   - ☑ Production
   - ☑ Preview
   - ☑ Development
5. Click **"Save"**

### 5.5 Add FIB Payment Variables (if not already added)

**Add Variable 3: FIB_PHONE_NUMBER**
1. Click **"Add New"**
2. **Key:** `FIB_PHONE_NUMBER`
3. **Value:** `07700802848`
4. **Environment:** All three
5. Click **"Save"**

**Add Variable 4: FIB_ACCOUNT_NAME**
1. Click **"Add New"**
2. **Key:** `FIB_ACCOUNT_NAME`
3. **Value:** `KARO LATEEF HUSSEIN HUSSEIN`
4. **Environment:** All three
5. Click **"Save"**

**Add Variable 5: FIB_QR_IMAGE_URL**
1. Click **"Add New"**
2. **Key:** `FIB_QR_IMAGE_URL`
3. **Value:** `https://kids-english-learning-app-sepia.vercel.app/images/FIB-payment-QR/fib-qr-code.jpg`
4. **Environment:** All three
5. Click **"Save"**

**Add Variable 6: FIB_QR_TEXT**
1. Click **"Add New"**
2. **Key:** `FIB_QR_TEXT`
3. **Value:** `P4CD-GNCB-Q9IR`
4. **Environment:** All three
5. Click **"Save"**

**Add Variable 7: FIB_MANUAL_NOTE**
1. Click **"Add New"**
2. **Key:** `FIB_MANUAL_NOTE`
3. **Value:** `Extra instructions`
4. **Environment:** All three
5. Click **"Save"**

### 5.6 Verify All Variables
You should now have 7 environment variables:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `FIB_PHONE_NUMBER`
- ✅ `FIB_ACCOUNT_NAME`
- ✅ `FIB_QR_IMAGE_URL`
- ✅ `FIB_QR_TEXT`
- ✅ `FIB_MANUAL_NOTE`

---

## Step 6: Redeploy Your Project

### 6.1 Go to Deployments
1. In Vercel, click the **"Deployments"** tab (at the top)
2. You'll see a list of your deployments

### 6.2 Redeploy
1. Find the **latest deployment** (top of the list)
2. Click the **"..."** (three dots) menu on the right
3. Click **"Redeploy"**
4. Confirm by clicking **"Redeploy"** again
5. Wait 1-2 minutes for deployment to complete

**✅ Your project is now redeployed with the new environment variables!**

---

## Step 7: Test Your Setup

### 7.1 Visit Your Site
1. Go to your Vercel site URL (e.g., `https://kids-english-learning-app-sepia.vercel.app`)
2. Navigate to `/subscribe` page
3. You should see the subscription plans

### 7.2 Test Payment Flow
1. Select a plan (Monthly, Yearly, or Lifetime)
2. Click **"Pay by Phone Number"**
3. You should see a modal with:
   - Your phone number: **07700802848**
   - Account name: **KARO LATEEF HUSSEIN HUSSEIN**
   - QR code (if configured)
   - Transaction ID

**✅ If you see the payment modal, everything is working!**

---

## Troubleshooting

### Problem: "Payment service not configured" error
**Solution:**
- Go back to Vercel → Settings → Environment Variables
- Make sure `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Make sure you selected all environments (Production, Preview, Development)
- Redeploy your project

### Problem: "Plans not showing"
**Solution:**
- Go to Supabase → Table Editor
- Check if `subscription_plans` table exists
- Check if it has 3 rows (monthly, yearly, lifetime)
- If not, go back to SQL Editor and run the INSERT statement again

### Problem: "401 Authentication required" error
**Solution:**
- User needs to be logged in
- Make sure they're signed in before visiting `/subscribe`

### Problem: SQL script gives errors
**Solution:**
- Make sure you copied the ENTIRE script
- Check for any typos
- Try running each CREATE TABLE statement one at a time
- Make sure you're in the SQL Editor, not Table Editor

### Problem: Can't find service_role key
**Solution:**
- Go to Settings → API
- Scroll down to "Project API keys"
- Click the eye icon to reveal the key
- Make sure you're copying the `service_role` key, not the `anon` key

---

## What's Next?

Once everything is set up:
1. ✅ Users can select subscription plans
2. ✅ Users can click "Pay by Phone Number"
3. ✅ Users see your phone number and payment instructions
4. ✅ Users submit their transaction reference
5. ✅ You verify payments in Supabase Table Editor → `payment_transactions` table
6. ✅ You can activate subscriptions manually in the database

---

## Need Help?

- Check Supabase logs: Supabase Dashboard → Logs
- Check Vercel logs: Vercel Dashboard → Deployments → Click deployment → View Function Logs
- Verify environment variables are set correctly
- Make sure you redeployed after adding variables

**You're all set! Your payment system is now working with Supabase! 🎉**

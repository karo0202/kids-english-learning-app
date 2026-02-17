# Verify Supabase Setup - Quick Checklist

## ✅ Step 1: Check Vercel Environment Variables

1. Go to **https://vercel.com/dashboard**
2. Select your project → **Settings** → **Environment Variables**
3. Verify you have these **exact** variable names:

### Required Variables:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://ohdaxgwylhrtalipllcf.supabase.co` (your Supabase URL)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your service_role key)
- [ ] `FIB_PHONE_NUMBER` = `07700802848`
- [ ] `FIB_ACCOUNT_NAME` = `KARO LATEEF HUSSEIN HUSSEIN`
- [ ] `FIB_QR_IMAGE_URL` = `https://kids-english-learning-app-sepia.vercel.app/images/FIB-payment-QR/fib-qr-code.jpg`
- [ ] `FIB_QR_TEXT` = `P4CD-GNCB-Q9IR`
- [ ] `FIB_MANUAL_NOTE` = `Extra instructions`

### Important Checks:
- [ ] All variables have **all three environments** selected (Production, Preview, Development)
- [ ] No typos in variable names (case-sensitive!)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` starts with `https://` and ends with `.supabase.co`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is a long string starting with `eyJ`

---

## ✅ Step 2: Redeploy After Adding Variables

**CRITICAL:** Environment variables only take effect after redeployment!

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete (1-2 minutes)

---

## ✅ Step 3: Test the Payment Flow

1. Visit: `https://kids-english-learning-app-sepia.vercel.app/subscribe`
2. Select a plan (Monthly, Yearly, or Lifetime)
3. Click **"Pay by Phone Number"**
4. **Expected:** You should see a modal with:
   - Your phone number: 07700802848
   - Account name: KARO LATEEF HUSSEIN HUSSEIN
   - QR code (if image is available)
   - Transaction ID

**If you still see the error:**
- Check Vercel deployment logs for errors
- Verify environment variables are spelled correctly
- Make sure you redeployed after adding variables

---

## 🔍 Debug: Check Environment Variables in Vercel

### Method 1: Check Deployment Logs
1. Go to Vercel → Your Project → **Deployments**
2. Click on the latest deployment
3. Click **"View Function Logs"**
4. Look for any errors mentioning Supabase or environment variables

### Method 2: Add Debug Endpoint (Temporary)
Create a test API route to check if variables are loaded:

**File:** `app/api/test-env/route.ts`
```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasFibPhone: !!process.env.FIB_PHONE_NUMBER,
    supabaseUrlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) || 'NOT SET',
  })
}
```

Then visit: `https://kids-english-learning-app-sepia.vercel.app/api/test-env`

**Expected response:**
```json
{
  "hasSupabaseUrl": true,
  "hasSupabaseKey": true,
  "hasFibPhone": true,
  "supabaseUrlPrefix": "https://ohdaxgwylhrt"
}
```

If any are `false`, the environment variables aren't set correctly.

---

## 🐛 Common Issues

### Issue: Variables show in Vercel but still get error
**Solution:**
- Make sure you selected **all three environments** (Production, Preview, Development)
- Redeploy after adding variables
- Clear browser cache

### Issue: "Supabase is not set" error
**Solution:**
- Double-check variable names are **exact**:
  - `NEXT_PUBLIC_SUPABASE_URL` (not `SUPABASE_URL`)
  - `SUPABASE_SERVICE_ROLE_KEY` (not `SUPABASE_KEY`)
- Make sure there are no extra spaces
- Redeploy after fixing

### Issue: Variables work locally but not on Vercel
**Solution:**
- Local `.env.local` doesn't affect Vercel
- You MUST add variables in Vercel dashboard
- Redeploy after adding

---

## ✅ Quick Fix Steps

1. **Go to Vercel** → Your Project → Settings → Environment Variables
2. **Verify** all 7 variables are there
3. **Check** all have Production/Preview/Development selected
4. **Redeploy** (Deployments → Latest → Redeploy)
5. **Test** the payment button again

---

**Still having issues?** Share what you see in the Vercel environment variables page and I'll help debug!

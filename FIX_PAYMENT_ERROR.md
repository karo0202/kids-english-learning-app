# Fix "Payment Service Unavailable" Error

The error you're seeing means **Supabase environment variables are not set in Vercel** or the deployment needs to be updated.

## Quick Fix (3 Steps)

### Step 1: Verify Environment Variables in Vercel

1. Go to **https://vercel.com/dashboard**
2. Click your project → **Settings** → **Environment Variables**
3. Check if you have these **exact** variable names:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FIB_PHONE_NUMBER`
- `FIB_ACCOUNT_NAME`
- `FIB_QR_IMAGE_URL`
- `FIB_QR_TEXT`
- `FIB_MANUAL_NOTE`

### Step 2: Add Missing Variables

If any are missing, add them:

| Variable Name | Value |
|---------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ohdaxgwylhrtalipllcf.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service_role key from Supabase |
| `FIB_PHONE_NUMBER` | `07700802848` |
| `FIB_ACCOUNT_NAME` | `KARO LATEEF HUSSEIN HUSSEIN` |
| `FIB_QR_IMAGE_URL` | `https://kids-english-learning-app-sepia.vercel.app/images/FIB-payment-QR/fib-qr-code.jpg` |
| `FIB_QR_TEXT` | `P4CD-GNCB-Q9IR` |
| `FIB_MANUAL_NOTE` | `Extra instructions` |

**Important:** When adding each variable:
- Select **all three environments**: Production, Preview, Development
- Click **"Save"**

### Step 3: Redeploy (CRITICAL!)

**Environment variables only work after redeployment!**

1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait 1-2 minutes for deployment to complete

---

## Verify It's Working

After redeploying:

1. Visit: `https://kids-english-learning-app-sepia.vercel.app/subscribe`
2. Select a plan
3. Click **"Pay by Phone Number"**
4. **Expected:** You should see a modal with your phone number and payment details
5. **If you still see the error:** Check the steps below

---

## Still Not Working?

### Check 1: Variable Names Are Exact
- `NEXT_PUBLIC_SUPABASE_URL` (not `SUPABASE_URL`)
- `SUPABASE_SERVICE_ROLE_KEY` (not `SUPABASE_KEY`)
- No extra spaces or typos

### Check 2: All Environments Selected
When adding variables, make sure you check:
- ☑ Production
- ☑ Preview  
- ☑ Development

### Check 3: Redeployed After Adding
- Environment variables don't work until you redeploy
- Go to Deployments → Redeploy

### Check 4: Supabase Credentials Are Correct
- `NEXT_PUBLIC_SUPABASE_URL` should be: `https://ohdaxgwylhrtalipllcf.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` should be a long string starting with `eyJ`

---

## Test Environment Variables

Create a test endpoint to verify variables are loaded:

**File:** `app/api/test-supabase/route.ts`
```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasFibPhone: !!process.env.FIB_PHONE_NUMBER,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...' || 'NOT SET',
  })
}
```

Visit: `https://kids-english-learning-app-sepia.vercel.app/api/test-supabase`

**Expected:**
```json
{
  "hasSupabaseUrl": true,
  "hasSupabaseKey": true,
  "hasFibPhone": true,
  "supabaseUrl": "https://ohdaxgwylhrtalipllcf.sup..."
}
```

If any are `false`, the variables aren't set correctly.

---

## Most Common Issue

**90% of the time**, the issue is:
1. ✅ Variables are added to Vercel
2. ❌ **But you forgot to redeploy!**

**Solution:** Always redeploy after adding/changing environment variables!

---

Need help? Share what you see in Vercel Environment Variables and I'll help debug!

# Vercel Payment Setup - Phone Number Only

**UPDATED**: Now uses **Supabase** instead of MongoDB Atlas (works in Iraq! 🇮🇶)

Your payment system runs **directly on Vercel** - no separate backend needed!

## Quick Setup (2 steps, ~10 minutes)

### Step 1: Create Supabase Account (Free) - Works in Iraq!

1. Go to **https://supabase.com**
2. Sign up with GitHub/Google
3. Create new project → Choose any region
4. Wait ~2 minutes for setup
5. Go to **SQL Editor** → Run the SQL from `SUPABASE_SETUP.md`
6. Go to **Settings** → **API** → Copy:
   - Project URL
   - service_role key (secret!)

### Step 2: Add Environment Variables in Vercel

1. Go to **https://vercel.com/dashboard**
2. Your project → **Settings** → **Environment Variables**
3. Add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role key |
| `FIB_PHONE_NUMBER` | 07700802848 |
| `FIB_ACCOUNT_NAME` | KARO LATEEF HUSSEIN HUSSEIN |
| `FIB_QR_IMAGE_URL` | https://kids-english-learning-app-sepia.vercel.app/images/FIB-payment-QR/fib-qr-code.jpg |
| `FIB_QR_TEXT` | P4CD-GNCB-Q9IR |
| `FIB_MANUAL_NOTE` | Extra instructions |

4. Click **Save**
5. **Redeploy** your project

## That's It!

After redeploying, your payment button will work. Users can:
1. Select a plan
2. Click "Pay by Phone Number"
3. See your phone number and QR code
4. Send payment
5. Submit their transaction reference

## Detailed Instructions

See `SUPABASE_SETUP.md` for complete step-by-step guide with SQL scripts.

## Troubleshooting

**503 Error?** → Make sure Supabase variables are set in Vercel and you've redeployed.

**401 Error?** → User needs to be logged in.

**Plans not showing?** → Plans are auto-seeded. Check Supabase tables were created.

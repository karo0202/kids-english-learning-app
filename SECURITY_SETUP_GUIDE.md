# Security Features Setup Guide

This guide will help you set up the new security features: Rate Limiting, Firebase Admin SDK, Request Logging, and Email Notifications.

---

## ✅ Step 1: Create Payment Logs Table in Supabase

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click **SQL Editor** in the left sidebar
3. Copy and paste the contents of `SUPABASE_PAYMENT_LOGS.sql`
4. Click **Run** to execute the SQL
5. Verify the table was created: Go to **Table Editor** → Look for `payment_logs`

---

## ✅ Step 2: Set Up Firebase Admin SDK (Optional but Recommended)

### Option A: Using Service Account Key (Recommended)

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file
6. Copy the entire JSON content
7. In Vercel, add environment variable:
   - **Key:** `FIREBASE_SERVICE_ACCOUNT_KEY`
   - **Value:** Paste the entire JSON (as a single-line string)
   - **Environments:** Production, Preview, Development

### Option B: Skip Firebase Admin (Uses Fallback)

If you don't set up Firebase Admin SDK, the system will use a fallback method (less secure but still functional). Token verification will decode tokens without full verification.

---

## ✅ Step 3: Set Up Email Notifications (Resend)

### Step 3.1: Create Resend Account

1. Go to https://resend.com
2. Sign up for a free account (100 emails/day free)
3. Verify your email

### Step 3.2: Get API Key

1. Go to **API Keys** in Resend dashboard
2. Click **Create API Key**
3. Name it: `Kids English App`
4. Copy the API key (starts with `re_`)

### Step 3.3: Add Domain (Optional but Recommended)

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Add your domain (e.g., `yourdomain.com`)
4. Add the DNS records to your domain provider
5. Wait for verification (can take a few hours)

### Step 3.4: Add Environment Variables in Vercel

1. Go to Vercel → Your Project → **Settings** → **Environment Variables**
2. Add these variables:

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `RESEND_API_KEY` | `re_...` | Your Resend API key |
| `RESEND_FROM_EMAIL` | `noreply@yourdomain.com` | Sender email (use verified domain) |

**Note:** If you don't add a domain, use `onboarding@resend.dev` temporarily.

### Step 3.5: Install Resend Package

The code uses dynamic imports, so Resend will only load if `RESEND_API_KEY` is set. However, you should install it:

```bash
npm install resend
```

---

## ✅ Step 4: Install Firebase Admin SDK (Optional)

Only needed if you set up Firebase Admin SDK in Step 2:

```bash
npm install firebase-admin
```

---

## ✅ Step 5: Verify Everything Works

### Test Rate Limiting

1. Try creating 6 payments in quick succession
2. The 6th request should return `429 Too Many Requests`
3. Wait 1 minute and try again

### Test Logging

1. Create a payment
2. Go to Supabase → **Table Editor** → `payment_logs`
3. You should see a new log entry with action `create_payment`

### Test Email Notifications

1. Create a payment with a valid email address
2. Check the email inbox
3. You should receive payment instructions email

### Test Firebase Admin (if configured)

1. Check Vercel function logs
2. Look for "Firebase Admin initialized" message
3. No warnings about fallback token verification

---

## 📋 Environment Variables Checklist

Make sure you have these in Vercel:

### Required:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `FIB_PHONE_NUMBER`
- ✅ `FIB_ACCOUNT_NAME`

### Optional (but recommended):
- ⚠️ `FIREBASE_SERVICE_ACCOUNT_KEY` (for proper token verification)
- ⚠️ `RESEND_API_KEY` (for email notifications)
- ⚠️ `RESEND_FROM_EMAIL` (for email sender address)
- ⚠️ `JWT_SECRET` (if using custom JWT tokens)

---

## 🔍 Monitoring & Debugging

### Check Payment Logs

```sql
-- View recent payment logs
SELECT * FROM payment_logs 
ORDER BY created_at DESC 
LIMIT 50;

-- View failed payments
SELECT * FROM payment_logs 
WHERE action = 'payment_failed'
ORDER BY created_at DESC;

-- View rate limit hits
SELECT * FROM payment_logs 
WHERE action = 'rate_limit_exceeded'
ORDER BY created_at DESC;
```

### Check Rate Limiting

Rate limiting uses in-memory storage. For production at scale, consider:
- **Upstash Redis** (recommended for Vercel)
- **Vercel KV** (Vercel's Redis)

### Check Email Delivery

1. Go to Resend dashboard → **Emails**
2. See delivery status and any bounces
3. Check spam folder if emails not received

---

## 🚀 Production Recommendations

### For High Traffic:

1. **Upgrade Rate Limiting:**
   - Use Upstash Redis instead of in-memory
   - Install: `npm install @upstash/ratelimit @upstash/redis`
   - Update `lib/rate-limit.ts` to use Redis

2. **Add Monitoring:**
   - Set up Sentry for error tracking
   - Use Vercel Analytics for request monitoring
   - Set up alerts for failed payments

3. **Email Service:**
   - Upgrade Resend plan if sending >100 emails/day
   - Or use SendGrid/AWS SES for higher limits

---

## 🐛 Troubleshooting

### Rate Limiting Not Working

- Check Vercel logs for errors
- Verify rate limit identifier is correct
- Check if multiple serverless instances are running (in-memory storage is per-instance)

### Emails Not Sending

- Check `RESEND_API_KEY` is set correctly
- Verify domain is verified in Resend
- Check Resend dashboard for delivery errors
- Check spam folder

### Firebase Admin Not Working

- Verify `FIREBASE_SERVICE_ACCOUNT_KEY` is valid JSON
- Check Firebase project permissions
- Look for errors in Vercel logs
- System will fallback to decode-only if Admin fails

### Logs Not Appearing

- Verify `payment_logs` table exists in Supabase
- Check RLS policies allow service role
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check Supabase logs for errors

---

## 📚 Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
- [Upstash Redis](https://upstash.com/docs/redis/overall/getstarted)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Last Updated:** February 2026

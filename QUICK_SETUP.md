# ⚡ Quick Setup - Run This Script!

## 🚀 Automated Setup

I've created a PowerShell script to automate the setup. Just run:

```powershell
.\setup-security-features.ps1
```

This script will:
1. ✅ Fix git lock file
2. ✅ Install npm packages (resend, firebase-admin)
3. ✅ Stage all changes
4. ✅ Commit changes
5. ✅ Push to GitHub

---

## 📋 Manual Steps (If Script Fails)

### 1. Fix Git Lock File
Close all editors, then delete: `.git/index.lock`

### 2. Install Packages
```bash
npm install resend firebase-admin
```

### 3. Git Commands
```bash
git add -A
git commit -m "Add security features: rate limiting, Firebase Admin SDK, request logging, and email notifications"
git push origin main
```

---

## 🗄️ Required: Run SQL in Supabase

1. Open `SUPABASE_PAYMENT_LOGS.sql`
2. Copy all SQL code
3. Go to Supabase → SQL Editor
4. Paste and Run

**This is REQUIRED** - without this, logging won't work!

---

## 📧 Optional: Set Up Email (Resend)

1. Sign up: https://resend.com
2. Get API key
3. Add to Vercel:
   - `RESEND_API_KEY` = your key
   - `RESEND_FROM_EMAIL` = `onboarding@resend.dev`

---

## 🔐 Optional: Set Up Firebase Admin

1. Firebase Console → Service Accounts
2. Generate Private Key
3. Copy JSON
4. Add to Vercel: `FIREBASE_SERVICE_ACCOUNT_KEY` = JSON string

---

## ✅ Verify Everything Works

After Vercel deploys:

1. **Test Rate Limiting:** Try 6 payments quickly → should get 429 error
2. **Test Logging:** Check Supabase `payment_logs` table
3. **Test Email:** Create payment → check inbox

---

**All code is ready!** Just run the script and complete the SQL step! 🎉

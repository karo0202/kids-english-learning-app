# 🚀 Quick Deployment Checklist

Follow these steps in order:

## ✅ Step 1: MongoDB Atlas (5 min)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free account → Create M0 FREE cluster
3. Database Access → Add user → Copy password
4. Network Access → Allow from anywhere
5. Database → Connect → Connect your app → Copy connection string
6. Replace `<username>` and `<password>` in connection string
7. **SAVE THIS CONNECTION STRING** 📝

## ✅ Step 2: Railway Deployment (10 min)

1. Go to https://railway.app → Sign up with GitHub
2. New Project → Deploy from GitHub repo
3. Select your repo
4. Add Service → GitHub Repo → Select repo
5. Settings → Set Root Directory: `app/backend`
6. Variables tab → Add all environment variables (see below)
7. Wait for deployment
8. Copy your Railway URL (e.g., `https://your-app.railway.app`)

## ✅ Step 3: Vercel Environment Variables (2 min)

1. Go to https://vercel.com/dashboard
2. Your project → Settings → Environment Variables
3. Add:
   - `BACKEND_URL` = Your Railway URL
   - `NEXT_PUBLIC_BACKEND_URL` = Your Railway URL
4. Deployments → Redeploy

## ✅ Step 4: Test (2 min)

1. Visit: `https://your-railway-url.railway.app/health` (should return `{"status":"ok"}`)
2. Visit: `https://your-railway-url.railway.app/api/subscription/plans` (should return plans)
3. Visit your Vercel site → `/subscribe` page (should work!)

---

## 📋 Environment Variables for Railway

Copy these into Railway's Variables tab:

```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://kids-english-learning-app-sepia.vercel.app
BACKEND_URL=https://your-railway-url.railway.app
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/kids-english-app?retryWrites=true&w=majority
JWT_SECRET=generate-a-random-32-character-secret-here
JWT_REFRESH_SECRET=generate-another-random-32-character-secret-here
ADMIN_EMAILS=your-email@example.com
FIB_PHONE_NUMBER=07700802848
FIB_ACCOUNT_NAME=KARO LATEEF HUSSEIN HUSSEIN
FIB_QR_IMAGE_URL=https://kids-english-learning-app-sepia.vercel.app/images/FIB-payment-QR/fib-qr-code.jpg
FIB_QR_TEXT=P4CD-GNCB-Q9IR
FIB_MANUAL_NOTE=Extra instructions
```

**Important:**
- Replace `MONGODB_URI` with your connection string from Step 1
- Generate JWT secrets at https://randomkeygen.com/ (use CodeIgniter Encryption Keys)
- Replace `BACKEND_URL` with your actual Railway URL after deployment
- Replace `FRONTEND_URL` with your actual Vercel URL

---

## 🎯 That's It!

Once deployed, your subscription system will work on production! 🎉

For detailed instructions, see `BACKEND_DEPLOYMENT_GUIDE.md`


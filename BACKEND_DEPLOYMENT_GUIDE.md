# Backend Deployment Guide - Step by Step

This guide will help you deploy your backend to production so your subscription system works on Vercel.

## 🎯 Quick Overview

You need to:
1. Set up MongoDB Atlas (free cloud database) - 5 minutes
2. Deploy backend to Railway (free tier available) - 10 minutes
3. Configure environment variables - 5 minutes
4. Update Vercel with backend URL - 2 minutes

**Total time: ~20 minutes**

---

## Step 1: Set Up MongoDB Atlas (Free)

### 1.1 Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account
3. Verify your email

### 1.2 Create a Free Cluster

1. Click **"Build a Database"**
2. Choose **"M0 FREE"** (Free tier)
3. Select a cloud provider and region (choose closest to you)
4. Click **"Create"**
5. Wait 3-5 minutes for cluster to be created

### 1.3 Create Database User

1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter username (e.g., `kidsenglish`)
5. Click **"Autogenerate Secure Password"** and **COPY IT** (you'll need it!)
6. Click **"Add User"**

### 1.4 Whitelist Your IP

1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for now - you can restrict later)
4. Click **"Confirm"**

### 1.5 Get Connection String

1. Go back to **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` with your database username
6. Replace `<password>` with your database password
7. Add database name at the end: `?retryWrites=true&w=majority` → `?retryWrites=true&w=majority&appName=kids-english-app`
8. **Save this connection string** - you'll need it in Step 3!

---

## Step 2: Deploy Backend to Railway

### 2.1 Create Railway Account

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Sign up with GitHub (easiest)

### 2.2 Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: `kids-english-learning-app`
4. Railway will detect your project

### 2.3 Configure Deployment

1. Railway will show you a list of services
2. Click **"Add Service"** → **"GitHub Repo"**
3. Select your repo again
4. In the settings, set:
   - **Root Directory**: `app/backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 2.4 Set Environment Variables

Click on your service → **"Variables"** tab → Add these:

**Required Variables:**
```
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://kids-english-learning-app-sepia.vercel.app
BACKEND_URL=https://your-railway-url.railway.app
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/kids-english-app?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters-long
ADMIN_EMAILS=your-email@example.com
```

**FIB Manual Payment (you already have these):**
```
FIB_PHONE_NUMBER=07700802848
FIB_ACCOUNT_NAME=KARO LATEEF HUSSEIN HUSSEIN
FIB_QR_IMAGE_URL=https://kids-english-learning-app-sepia.vercel.app/images/FIB-payment-QR/fib-qr-code.jpg
FIB_QR_TEXT=P4CD-GNCB-Q9IR
FIB_MANUAL_NOTE=Extra instructions
```

**Important:**
- Replace `MONGODB_URI` with your connection string from Step 1.5
- Generate secure JWT secrets (use https://randomkeygen.com/)
- Replace `FRONTEND_URL` with your Vercel URL
- Railway will give you a URL like `https://your-app.railway.app` - use that for `BACKEND_URL`

### 2.5 Deploy

1. Railway will automatically deploy when you save variables
2. Wait for deployment to complete (2-3 minutes)
3. Check the **"Deployments"** tab to see status
4. Once deployed, copy your Railway URL (e.g., `https://kids-english-backend.railway.app`)

### 2.6 Seed Subscription Plans

1. Go to your Railway service
2. Click **"Deployments"** → Latest deployment → **"View Logs"**
3. Or use Railway CLI:
   ```bash
   railway run npm run seed
   ```

**Alternative:** You can also seed plans by making a request to your backend after it's deployed (we'll do this in testing).

---

## Step 3: Update Vercel Environment Variables

### 3.1 Go to Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project: `kids-english-learning-app`

### 3.2 Add Environment Variables

1. Go to **"Settings"** → **"Environment Variables"**
2. Add these variables:

```
BACKEND_URL=https://your-railway-url.railway.app
NEXT_PUBLIC_BACKEND_URL=https://your-railway-url.railway.app
```

**Important:** Replace `https://your-railway-url.railway.app` with your actual Railway URL from Step 2.5

### 3.3 Redeploy

1. Go to **"Deployments"** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

---

## Step 4: Test Your Deployment

### 4.1 Test Backend Health

Visit: `https://your-railway-url.railway.app/health`

Should return:
```json
{"status":"ok","timestamp":"2025-01-XX..."}
```

### 4.2 Test Subscription Plans

Visit: `https://your-railway-url.railway.app/api/subscription/plans`

Should return:
```json
{"success":true,"plans":[...]}
```

### 4.3 Test Frontend

1. Visit your Vercel site: `https://kids-english-learning-app-sepia.vercel.app`
2. Go to `/subscribe` page
3. You should see subscription plans
4. Try selecting a plan and payment method
5. It should work now! 🎉

---

## 🐛 Troubleshooting

### Backend Not Starting

**Check Railway logs:**
1. Go to Railway dashboard
2. Click on your service → **"Deployments"** → **"View Logs"**
3. Look for errors

**Common issues:**
- MongoDB connection failed → Check `MONGODB_URI` is correct
- Port error → Make sure `PORT=5000` is set
- Build failed → Check build logs

### Frontend Still Shows Errors

1. **Check Vercel environment variables:**
   - Make sure `BACKEND_URL` is set correctly
   - Make sure it matches your Railway URL

2. **Check CORS:**
   - Backend should allow requests from your Vercel domain
   - Check `FRONTEND_URL` in Railway matches your Vercel URL

3. **Redeploy both:**
   - Redeploy Railway backend
   - Redeploy Vercel frontend

### MongoDB Connection Issues

1. **Check IP whitelist:**
   - Railway IPs change - you may need to allow all IPs temporarily
   - Or find Railway's IP and whitelist it

2. **Check connection string:**
   - Make sure username/password are correct
   - Make sure database name is included

---

## 🎉 Success Checklist

- [ ] MongoDB Atlas cluster created and running
- [ ] Database user created
- [ ] IP whitelisted
- [ ] Backend deployed to Railway
- [ ] Environment variables set in Railway
- [ ] Backend health check works
- [ ] Subscription plans endpoint works
- [ ] Environment variables set in Vercel
- [ ] Vercel redeployed
- [ ] Frontend can fetch plans
- [ ] Frontend can create subscriptions

---

## 📚 Alternative: Deploy to Render

If you prefer Render over Railway:

1. Go to https://render.com
2. Sign up with GitHub
3. Click **"New"** → **"Web Service"**
4. Connect your GitHub repo
5. Set:
   - **Root Directory**: `app/backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Add environment variables (same as Railway)
7. Deploy!

---

## 💰 Cost Estimate

- **MongoDB Atlas**: FREE (M0 tier)
- **Railway**: FREE tier available (500 hours/month)
- **Vercel**: FREE tier (already using)
- **Total**: $0/month for small scale! 🎉

---

## 🚀 Next Steps After Deployment

1. **Set up payment providers** (CoinGate, ZainCash, etc.)
2. **Test payment flow** end-to-end
3. **Monitor logs** for any issues
4. **Set up alerts** for errors
5. **Configure custom domain** (optional)

---

**Need help?** Check the logs in Railway and Vercel dashboards for detailed error messages.


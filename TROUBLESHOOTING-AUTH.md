# 🔧 Google Authentication Troubleshooting Guide

If Google sign-in isn't working, follow these steps **in order**:

## ✅ Step 1: Check Firebase Console Setup

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: `kids-english-learning-2b5cd`
3. **Go to Authentication → Sign-in method**:
   - ✅ Google: Should be **Enabled**
   - ✅ Support email: Should be set
   - ✅ Authorized domains: Should include your Vercel domain

## ✅ Step 2: Check Authorized Domains

**Critical**: Your Vercel domain **MUST** be in Firebase's authorized domains:

1. Firebase Console → Authentication → Settings → Authorized domains
2. Add these domains if missing:
   - `kids-english-learning-app-sepia.vercel.app`
   - `localhost` (for local testing)
   - Your custom domain (if you have one)

## ✅ Step 3: Verify Environment Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables:

**Required variables:**
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Must start with `AIza...`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Should be `your-project.firebaseapp.com`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Your project ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Should be `1:xxx:web:yyy`

**After adding/changing variables:**
- Click **Save**
- Go to **Deployments** tab
- Click **Redeploy** on the latest deployment

## ✅ Step 4: Check Browser Console

Open browser DevTools (F12) → Console tab and look for:

**Good signs:**
- ✅ `Firebase initialized successfully`
- ✅ `Starting Google sign-in redirect...`
- ✅ `Google redirect successful: your@email.com`

**Bad signs:**
- ❌ `Firebase config missing: ...`
- ❌ `Firebase not initialized`
- ❌ `unauthorized-domain`
- ❌ `auth/unauthorized-domain`

## ✅ Step 5: Common Issues & Solutions

### Issue: "Firebase config missing"
**Solution**: Environment variables not set in Vercel. Follow Step 3.

### Issue: "unauthorized-domain"
**Solution**: Domain not added to Firebase authorized domains. Follow Step 2.

### Issue: Redirect doesn't happen
**Solution**: 
1. Check browser console for errors
2. Make sure cookies are enabled
3. Try incognito mode (to rule out extensions)

### Issue: Redirects but no user session
**Solution**: 
1. Check that `handleGoogleRedirect` is being called
2. Check browser console for redirect errors
3. Clear browser cache and try again

## ✅ Step 6: Test Checklist

- [ ] Firebase project created
- [ ] Google sign-in enabled in Firebase
- [ ] Authorized domains include Vercel URL
- [ ] Environment variables set in Vercel
- [ ] Vercel deployment redeployed after env changes
- [ ] Browser console shows no errors
- [ ] Cookies enabled in browser
- [ ] Tested in incognito mode

## 🆘 Still Not Working?

1. **Check browser console** (F12) for specific error messages
2. **Check Vercel logs** for deployment errors
3. **Verify Firebase project** is active and billing is enabled (if required)
4. **Try email/password** login first to verify Firebase is working

## 📝 Quick Test

Run this in browser console (on your deployed site):
```javascript
console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Missing')
console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Missing')
```

If these show "Missing", environment variables aren't set correctly in Vercel.

## 🔄 Alternative: Use Email/Password Only

If Google auth continues to fail, you can:
1. Use email/password authentication (works without Google setup)
2. Add Google auth later once Firebase is properly configured

The email/password authentication doesn't require Google OAuth setup and should work immediately if Firebase is configured.

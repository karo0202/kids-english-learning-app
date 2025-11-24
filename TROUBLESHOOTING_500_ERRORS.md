# Troubleshooting 500 Errors - Subscription API

## Error: `Failed to load resource: the server responded with a status of 500`

This error occurs when the frontend cannot communicate with the backend server.

## Quick Fix Checklist

### 1. ✅ Check Backend Server is Running

The backend server must be running on port 5000 (or your configured port).

**Start the backend:**
```bash
cd app/backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

### 2. ✅ Check MongoDB Connection

The backend needs MongoDB to be connected.

**Check MongoDB:**
```bash
cd app/backend
npm run check-mongo
```

**If MongoDB is not connected:**
- **Option A: Use MongoDB Atlas (Free Cloud)**
  1. Go to https://www.mongodb.com/cloud/atlas/register
  2. Create a free cluster
  3. Get connection string
  4. Update `MONGODB_URI` in `app/backend/.env`

- **Option B: Install Local MongoDB**
  - Windows: Download from https://www.mongodb.com/try/download/community
  - Or use Docker: `docker run -d -p 27017:27017 --name mongodb mongo`

### 3. ✅ Seed Subscription Plans

The database needs subscription plans to exist.

**Seed plans:**
```bash
cd app/backend
npm run seed
```

You should see:
```
✅ Seeded plan: Monthly Plan
✅ Seeded plan: Yearly Plan
✅ Seeded plan: Lifetime Plan
✅ All plans seeded successfully
```

### 4. ✅ Configure Environment Variables

**Frontend `.env` (app/.env):**
```env
BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

**Backend `.env` (app/backend/.env):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kids-english-app
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

### 5. ✅ Restart Both Servers

After making changes:

1. **Stop both servers** (Ctrl+C)
2. **Start backend first:**
   ```bash
   cd app/backend
   npm run dev
   ```
3. **Then start frontend:**
   ```bash
   cd app
   npm run dev
   ```

## Common Error Messages

### "Failed to fetch subscription status"
- **Cause:** Backend server not running
- **Fix:** Start backend server (see step 1)

### "MongoDB connection error"
- **Cause:** MongoDB not running or wrong connection string
- **Fix:** Check MongoDB connection (see step 2)

### "Plan not found" or empty plans array
- **Cause:** Subscription plans not seeded
- **Fix:** Seed plans (see step 3)

### "ECONNREFUSED" or "Network error"
- **Cause:** Backend URL incorrect or server not accessible
- **Fix:** Check BACKEND_URL in frontend .env matches backend port

## Testing the Backend

**Test backend health:**
```bash
curl http://localhost:5000/health
```

Should return:
```json
{"status":"ok","timestamp":"2025-01-XX..."}
```

**Test subscription plans:**
```bash
curl http://localhost:5000/api/subscription/plans
```

Should return:
```json
{"success":true,"plans":[...]}
```

## Production Deployment

For Vercel/production:

1. **Set environment variables in Vercel:**
   - `BACKEND_URL` = Your backend server URL
   - `NEXT_PUBLIC_BACKEND_URL` = Your backend server URL

2. **Deploy backend separately:**
   - Use Railway, Render, or similar
   - Update `BACKEND_URL` in Vercel to point to your deployed backend

3. **Ensure MongoDB is accessible:**
   - Use MongoDB Atlas for production
   - Update `MONGODB_URI` in backend environment

## Still Having Issues?

1. Check browser console for detailed error messages
2. Check backend server logs for errors
3. Verify all environment variables are set correctly
4. Ensure ports 3000 (frontend) and 5000 (backend) are not in use by other apps


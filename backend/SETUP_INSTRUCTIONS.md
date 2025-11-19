# Backend Setup Instructions

## Step 1: Create .env File

Create a `.env` file in the `backend` directory with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb://localhost:27017/kids-english-app

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Admin
ADMIN_EMAILS=your-email@example.com

# Payment Providers (configure at least one)
# Uncomment and fill in when ready:

# CoinGate
# COINGATE_API_KEY=your-key
# COINGATE_API_SECRET=your-secret
# COINGATE_WEBHOOK_SECRET=your-webhook-secret
USE_COINGATE=true

# ZainCash
# ZAINCASH_MERCHANT_ID=your-id
# ZAINCASH_SECRET=your-secret
# ZAINCASH_REDIRECT_URL=http://localhost:5000/api/webhooks/zaincash
```

## Step 2: Install Dependencies

```bash
cd backend
npm install
```

## Step 3: Set Up MongoDB

### Option A: Local MongoDB

Install MongoDB locally or use Docker:

```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

### Option B: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## Step 4: Run Setup Script

```bash
npm run setup
```

This will:
- Connect to MongoDB
- Seed subscription plans
- Check environment variables
- Verify payment provider configuration

## Step 5: Start the Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Step 6: Configure Payment Providers

At minimum, configure ONE payment provider:

1. Sign up for the provider
2. Get API credentials
3. Add to `.env` file
4. Restart server

## Testing

1. Visit `http://localhost:3000/subscribe` (frontend)
2. Select a plan
3. Choose payment method
4. Complete payment flow

## Troubleshooting

**MongoDB connection error?**
- Check MongoDB is running
- Verify `MONGODB_URI` is correct
- Check firewall settings

**Payment not working?**
- Verify payment provider credentials in `.env`
- Check webhook URLs are correct
- Review server logs

**Port already in use?**
- Change `PORT` in `.env`
- Or stop the process using port 5000


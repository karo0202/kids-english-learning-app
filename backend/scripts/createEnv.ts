import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

const envPath = path.join(__dirname, '..', '.env')
const envExamplePath = path.join(__dirname, '..', '.env.example')

// Generate random secrets
const generateSecret = () => crypto.randomBytes(32).toString('hex')

const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Database - Update with your MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/kids-english-app

# JWT Authentication - Auto-generated secrets (change in production)
JWT_SECRET=${generateSecret()}
JWT_REFRESH_SECRET=${generateSecret()}

# Admin - Add your admin email addresses (comma-separated)
ADMIN_EMAILS=admin@example.com

# Crypto Payments - CoinGate (uncomment and configure when ready)
# COINGATE_API_KEY=your-coingate-api-key
# COINGATE_API_SECRET=your-coingate-api-secret
# COINGATE_WEBHOOK_SECRET=your-coingate-webhook-secret
USE_COINGATE=true

# Crypto Payments - NOWPayments (Alternative)
# NOWPAYMENTS_API_KEY=your-nowpayments-api-key
# NOWPAYMENTS_WEBHOOK_SECRET=your-nowpayments-webhook-secret

# ZainCash (uncomment and configure when ready)
# ZAINCASH_MERCHANT_ID=your-zaincash-merchant-id
# ZAINCASH_SECRET=your-zaincash-secret-key
# ZAINCASH_REDIRECT_URL=http://localhost:5000/api/webhooks/zaincash
# ZAINCASH_API_URL=https://test.zaincash.iq/transaction/init

# FastPay (uncomment and configure when ready)
# FASTPAY_MERCHANT_ID=your-fastpay-merchant-id
# FASTPAY_API_KEY=your-fastpay-api-key
# FASTPAY_API_URL=https://api.fastpay.iq/v1

# NassPay (uncomment and configure when ready)
# NASSPAY_MERCHANT_ID=your-nasspay-merchant-id
# NASSPAY_API_KEY=your-nasspay-api-key
# NASSPAY_SECRET=your-nasspay-secret
# NASSPAY_API_URL=https://api.nasspay.iq/v1

# FIB (Fast Iraqi Bank) (uncomment and configure when ready)
# FIB_MERCHANT_ID=your-fib-merchant-id
# FIB_API_KEY=your-fib-api-key
# FIB_SECRET=your-fib-secret
# FIB_API_URL=https://api.fib.iq/v1

# Manual Crypto Wallet (optional)
# MANUAL_CRYPTO_WALLET_ADDRESS=your-wallet-address
# MANUAL_CRYPTO_NETWORK=USDT-TRC20
# MANUAL_CRYPTO_QR_URL=https://example.com/qr.png
# MANUAL_CRYPTO_NOTE=Extra info for customers
# MANUAL_CRYPTO_CONTACT_PHONE=+9647xxxxxxx

# Manual FIB (QR / Phone) (optional)
# FIB_PHONE_NUMBER=0750xxxxxxx
# FIB_ACCOUNT_NAME=Your Name
# FIB_QR_IMAGE_URL=https://example.com/fib-qr.png
# FIB_MANUAL_NOTE=Leave optional notes here
`

try {
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists. Skipping creation.')
    console.log('   If you want to recreate it, delete the existing file first.')
  } else {
    fs.writeFileSync(envPath, envContent)
    console.log('✅ Created .env file with default configuration')
    console.log('📝 Please update the following:')
    console.log('   - MONGODB_URI (if not using local MongoDB)')
    console.log('   - ADMIN_EMAILS (add your admin email)')
    console.log('   - Payment provider credentials (when ready)')
  }
} catch (error: any) {
  console.error('❌ Error creating .env file:', error.message)
  process.exit(1)
}


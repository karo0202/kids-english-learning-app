import mongoose from 'mongoose'
import dotenv from 'dotenv'
import SubscriptionPlan from '../models/SubscriptionPlan'
import { connectDatabase } from '../config/database'

dotenv.config()

const plans = [
  {
    planId: 'monthly',
    name: 'Monthly Plan',
    description: 'Full access for 30 days',
    duration: 30,
    price: 9.99,
    currency: 'USD',
    features: [
      'Access to all learning modules',
      'Unlimited child profiles',
      'Progress tracking',
      'Email support',
    ],
    isActive: true,
  },
  {
    planId: 'yearly',
    name: 'Yearly Plan',
    description: 'Full access for 365 days (Save 20%)',
    duration: 365,
    price: 95.99,
    currency: 'USD',
    features: [
      'Access to all learning modules',
      'Unlimited child profiles',
      'Progress tracking',
      'Priority email support',
      'Early access to new features',
    ],
    isActive: true,
  },
  {
    planId: 'lifetime',
    name: 'Lifetime Plan',
    description: 'One-time payment, lifetime access',
    duration: 9999,
    price: 199.99,
    currency: 'USD',
    features: [
      'Lifetime access to all modules',
      'Unlimited child profiles',
      'Advanced progress tracking',
      'Priority support',
      'Early access to new features',
      'Exclusive content',
    ],
    isActive: true,
  },
]

async function setup() {
  try {
    console.log('🚀 Starting subscription system setup...\n')

    // Connect to database
    console.log('📦 Connecting to MongoDB...')
    await connectDatabase()
    console.log('✅ MongoDB connected\n')

    // Seed plans
    console.log('📝 Seeding subscription plans...')
    for (const plan of plans) {
      const existing = await SubscriptionPlan.findOne({ planId: plan.planId })
      if (existing) {
        await SubscriptionPlan.findOneAndUpdate({ planId: plan.planId }, plan)
        console.log(`  ✅ Updated plan: ${plan.name}`)
      } else {
        await SubscriptionPlan.create(plan)
        console.log(`  ✅ Created plan: ${plan.name}`)
      }
    }
    console.log('\n✅ All plans seeded successfully\n')

    // Check environment variables
    console.log('🔍 Checking environment variables...')
    const required = ['MONGODB_URI', 'JWT_SECRET', 'FRONTEND_URL', 'BACKEND_URL']
    const missing: string[] = []
    
    required.forEach(key => {
      if (!process.env[key]) {
        missing.push(key)
      }
    })

    if (missing.length > 0) {
      console.log(`⚠️  Missing environment variables: ${missing.join(', ')}`)
      console.log('   Please check your .env file\n')
    } else {
      console.log('✅ All required environment variables are set\n')
    }

    // Check payment providers
    console.log('💳 Checking payment provider configuration...')
    const providers = [
      { name: 'CoinGate', keys: ['COINGATE_API_KEY', 'COINGATE_API_SECRET'] },
      { name: 'NOWPayments', keys: ['NOWPAYMENTS_API_KEY'] },
      { name: 'ZainCash', keys: ['ZAINCASH_MERCHANT_ID', 'ZAINCASH_SECRET'] },
      { name: 'FastPay', keys: ['FASTPAY_MERCHANT_ID', 'FASTPAY_API_KEY'] },
      { name: 'NassPay', keys: ['NASSPAY_MERCHANT_ID', 'NASSPAY_API_KEY', 'NASSPAY_SECRET'] },
      { name: 'FIB', keys: ['FIB_MERCHANT_ID', 'FIB_API_KEY', 'FIB_SECRET'] },
    ]

    const configured: string[] = []
    providers.forEach(provider => {
      const hasAllKeys = provider.keys.every(key => process.env[key])
      if (hasAllKeys) {
        configured.push(provider.name)
      }
    })

    if (configured.length > 0) {
      console.log(`✅ Configured payment providers: ${configured.join(', ')}\n`)
    } else {
      console.log('⚠️  No payment providers configured yet')
      console.log('   You can configure them later in your .env file\n')
    }

    console.log('✨ Setup complete!')
    console.log('\n📖 Next steps:')
    console.log('   1. Configure at least one payment provider in .env')
    console.log('   2. Start the server: npm run dev')
    console.log('   3. Test subscription flow at /subscribe')
    console.log('\n')

    await mongoose.disconnect()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Setup error:', error.message)
    process.exit(1)
  }
}

setup()


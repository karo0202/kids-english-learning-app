import mongoose from 'mongoose'
import SubscriptionPlan from '../models/SubscriptionPlan'
import { connectDatabase } from '../config/database'
import dotenv from 'dotenv'

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

async function seedPlans() {
  try {
    await connectDatabase()

    for (const plan of plans) {
      await SubscriptionPlan.findOneAndUpdate(
        { planId: plan.planId },
        plan,
        { upsert: true, new: true }
      )
      console.log(`✅ Seeded plan: ${plan.name}`)
    }

    console.log('✅ All plans seeded successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding plans:', error)
    process.exit(1)
  }
}

seedPlans()


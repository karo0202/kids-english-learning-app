/**
 * Get subscription plans - uses Supabase or fallback
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const FALLBACK_PLANS = [
  {
    _id: 'monthly',
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
    _id: 'yearly',
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
    _id: 'lifetime',
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

export async function GET() {
  try {
    // Try Supabase first
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey)
        const { data: plans, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true })

        if (!error && plans && plans.length > 0) {
          // Transform Supabase format to expected format
          const formattedPlans = plans.map((plan: any) => ({
            _id: plan.plan_id,
            planId: plan.plan_id,
            name: plan.name,
            description: plan.description,
            duration: plan.duration,
            price: parseFloat(plan.price),
            currency: plan.currency,
            features: Array.isArray(plan.features) ? plan.features : [],
            isActive: plan.is_active,
          }))

          return NextResponse.json({
            success: true,
            plans: formattedPlans,
          })
        }
      } catch (supabaseError) {
        console.warn('Supabase query failed, using fallback:', supabaseError)
      }
    }

    // Fallback to hardcoded plans
    return NextResponse.json({
      success: true,
      plans: FALLBACK_PLANS,
      fallback: true,
    })
  } catch (error: any) {
    console.error('Error fetching plans:', error)
    return NextResponse.json(
      {
        success: true,
        plans: FALLBACK_PLANS,
        fallback: true,
      },
      { status: 200 }
    )
  }
}

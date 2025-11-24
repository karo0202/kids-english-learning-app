import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

// Fallback plans when backend is unavailable
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

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const token = request.headers.get('authorization')
    
    // Special handling for /plans endpoint - provide fallback if backend unavailable
    if (path === 'plans') {
      try {
        // Create timeout controller
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        const response = await fetch(`${BACKEND_URL}/api/subscription/plans`, {
          headers: {
            ...(token ? { Authorization: token } : {}),
          },
          signal: controller.signal,
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const data = await response.json()
          return NextResponse.json(data, { status: response.status })
        }
      } catch (error: any) {
        // If backend is unavailable, return fallback plans
        console.warn('Backend unavailable, using fallback plans:', error.message)
        return NextResponse.json({
          success: true,
          plans: FALLBACK_PLANS,
          fallback: true,
        })
      }
    }
    
    // For other endpoints, try backend first
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(`${BACKEND_URL}/api/subscription/${path}`, {
      headers: {
        ...(token ? { Authorization: token } : {}),
      },
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend error (${response.status}):`, errorText)
      return NextResponse.json(
        { 
          error: 'Failed to fetch subscription data',
          details: errorText,
          backendUrl: BACKEND_URL
        },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    // If it's the plans endpoint and backend failed, return fallback
    const path = params.path.join('/')
    if (path === 'plans') {
      console.warn('Using fallback plans due to backend error:', error.message)
      return NextResponse.json({
        success: true,
        plans: FALLBACK_PLANS,
        fallback: true,
      })
    }
    
    console.error('Subscription API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch subscription data',
        details: error.message,
        backendUrl: BACKEND_URL,
        hint: 'Make sure the backend server is running on ' + BACKEND_URL
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const body = await request.json()
    const token = request.headers.get('authorization')
    
    const response = await fetch(`${BACKEND_URL}/api/subscription/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend error (${response.status}):`, errorText)
      return NextResponse.json(
        { 
          error: 'Failed to process subscription request',
          details: errorText,
          backendUrl: BACKEND_URL
        },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error('Subscription API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process subscription request',
        details: error.message,
        backendUrl: BACKEND_URL,
        hint: 'Make sure the backend server is running on ' + BACKEND_URL
      },
      { status: 500 }
    )
  }
}


'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserSession } from '@/lib/simple-auth'
import SubscriptionPlanCard, { SubscriptionPlan } from '@/components/subscription/SubscriptionPlanCard'
import PaymentButton, { PaymentMethod } from '@/components/subscription/PaymentButton'
import CryptoInvoiceModal from '@/components/subscription/CryptoInvoiceModal'
import ManualPaymentModal from '@/components/subscription/ManualPaymentModal'
import { motion } from 'framer-motion'

export default function SubscribePage() {
  const router = useRouter()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [cryptoModalOpen, setCryptoModalOpen] = useState(false)
  const [cryptoInvoice, setCryptoInvoice] = useState<any>(null)
  const [manualPaymentData, setManualPaymentData] = useState<{
    method: 'crypto_manual' | 'fib_manual'
    instructions: any
    transactionId: string
    amount: number
    currency: string
  } | null>(null)
  const [manualModalOpen, setManualModalOpen] = useState(false)
  const [confirmingManual, setConfirmingManual] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const user = getUserSession()
    if (!user) {
      router.push('/login')
      return
    }

    fetchPlans()
  }, [router])

  const fetchPlans = async () => {
    setErrorMessage(null)
    try {
      const response = await fetch('/api/subscription/plans')
      const data = await response.json()
      if (data.success) {
        setPlans(data.plans)
        if (!data.plans || data.plans.length === 0) {
          setErrorMessage('No subscription plans are available yet. Please contact support to configure plans.')
        }
      } else {
        setErrorMessage(data.error || 'Unable to load subscription plans.')
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
      setErrorMessage('Unable to reach the subscription server. Please ensure the backend is running and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
  }

  const handlePaymentMethodSelect = async (paymentMethod: PaymentMethod) => {
    if (!selectedPlan) {
      alert('Please select a plan first')
      return
    }

    const user = getUserSession()
    if (!user) {
      router.push('/login')
      return
    }

    const { getAuthToken } = await import('@/lib/simple-auth')
    // Force refresh token so payment API gets a valid token
    let token = await getAuthToken(true)
    // If no token, wait for Firebase auth state (e.g. just logged in) and retry once
    if (!token && user) {
      await new Promise((r) => setTimeout(r, 1500))
      token = await getAuthToken(true)
    }
    if (!token) {
      setErrorMessage('Your session has expired. Please log in again to continue.')
      setTimeout(() => router.push('/login'), 3000)
      return
    }

    setSelectedPaymentMethod(paymentMethod)

    try {
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          planId: selectedPlan,
          paymentMethod,
          userId: user.id, // Must match token for server verification
          userEmail: user.email,
          userName: user.name,
        }),
      })

      // Check if response is ok before parsing
      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: 'Payment service is unavailable' }
        }
        
        const errorMsg = errorData.message || errorData.error || 'Payment service is currently unavailable'
        if (response.status === 401) {
          setErrorMessage(
            'Your session has expired or you are not logged in. Please log in again to continue.'
          )
          setTimeout(() => router.push('/login'), 4000)
        } else if (response.status === 503 || errorData.requiresBackend) {
          setErrorMessage(
            'Payment service is currently unavailable. The backend server needs to be deployed to process payments. Please contact support or check back later.'
          )
        } else {
          setErrorMessage(errorMsg)
        }
        setSelectedPaymentMethod(null) // Reset loading state
        setTimeout(() => setErrorMessage(null), 15000) // Clear after 15 seconds
        return
      }

      const data = await response.json()

      if (data.success) {
        const planInfo = plans.find((p) => p.planId === selectedPlan)

        if (data.manualPayment) {
          setManualPaymentData({
            method: paymentMethod as 'crypto_manual' | 'fib_manual',
            instructions: data.manualInstructions || {},
            transactionId: data.transactionId,
            amount: planInfo?.price || 0,
            currency: planInfo?.currency || 'IQD',
          })
          setManualModalOpen(true)
        } else if (paymentMethod === 'crypto') {
          setCryptoInvoice({
            paymentUrl: data.paymentUrl,
            invoiceId: data.invoiceId || data.transactionId,
            amount: planInfo?.price || 0,
            currency: planInfo?.currency || 'IQD',
          })
          setCryptoModalOpen(true)
        } else if (data.paymentUrl) {
          // Redirect to payment provider
          window.location.href = data.paymentUrl
        } else {
          alert('Payment created. Please follow the instructions provided.')
        }
      } else {
        // Show better error message
        const errorMsg = data.message || data.error || 'Failed to create payment'
        if (data.requiresBackend) {
          setErrorMessage(
            'Payment service is currently unavailable. The backend server needs to be deployed to process payments. Please contact support or check back later.'
          )
        } else {
          setErrorMessage(errorMsg)
        }
        setSelectedPaymentMethod(null) // Reset loading state
        setTimeout(() => setErrorMessage(null), 15000) // Clear after 15 seconds
      }
    } catch (error: any) {
      console.error('Payment creation error:', error)
      setSelectedPaymentMethod(null) // Reset loading state
      setErrorMessage(
        'Failed to create payment. The payment service is currently unavailable. This usually means the backend server needs to be deployed. Please contact support or check back later.'
      )
      setTimeout(() => setErrorMessage(null), 15000) // Clear after 15 seconds
    }
  }

  const handleManualConfirmation = async (payload: {
    transactionId: string
    reference?: string
    proofUrl?: string
    contactPhone?: string
    notes?: string
  }) => {
    try {
      setConfirmingManual(true)
      const { getAuthToken } = await import('@/lib/simple-auth')
      const token = await getAuthToken()
      const sessionUser = getUserSession()
      const response = await fetch('/api/subscription/manual/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...payload,
          paymentMethod: manualPaymentData?.method,
          userEmail: sessionUser?.email || undefined,
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert('Thank you! We will verify your payment and notify you soon.')
        setManualModalOpen(false)
        setManualPaymentData(null)
      } else {
        alert(data.error || 'Failed to submit payment proof.')
      }
    } catch (error) {
      console.error('Manual confirmation error:', error)
      alert('Failed to submit payment proof. Please try again.')
    } finally {
      setConfirmingManual(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Choose Your Subscription Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Unlock all premium features and enhance your learning experience
          </p>
        </motion.div>

        {/* Error / Empty States */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl shadow-lg p-6 mb-10"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                  {errorMessage?.toLowerCase().includes('log in') ? 'Log in required' : 'Payment Service Unavailable'}
                </h3>
                <p className="text-red-700 dark:text-red-400 mb-4">{errorMessage}</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setErrorMessage(null)
                      setSelectedPaymentMethod(null)
                    }}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    Dismiss
                  </button>
                  {errorMessage?.toLowerCase().includes('log in') && (
                    <button
                      onClick={() => router.push('/login')}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
                    >
                      Log in again
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setLoading(true)
                      setErrorMessage(null)
                      fetchPlans()
                    }}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    Refresh Plans
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, index) => (
            <SubscriptionPlanCard
              key={plan.planId}
              plan={plan}
              onSelect={handlePlanSelect}
              isPopular={index === 1} // Middle plan is popular
              isSelected={selectedPlan === plan.planId}
              loading={selectedPlan === plan.planId && !!selectedPaymentMethod}
            />
          ))}
        </div>

        {plans.length === 0 && !errorMessage && (
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
            Plans will appear here once they are configured in the admin panel.
          </p>
        )}

        {/* Payment Method - Phone Number Only */}
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Complete Your Payment
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                Pay via phone number transfer
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Send payment to our phone number and submit your transaction reference to activate your subscription
              </p>
            </div>

            <div className="flex justify-center">
              <PaymentButton
                paymentMethod="fib_manual"
                onClick={() => handlePaymentMethodSelect('fib_manual')}
                className="min-w-[350px] text-lg py-6"
              />
            </div>
          </motion.div>
        )}

        {/* Crypto Invoice Modal */}
        {cryptoInvoice && (
          <CryptoInvoiceModal
            isOpen={cryptoModalOpen}
            onClose={() => setCryptoModalOpen(false)}
            paymentUrl={cryptoInvoice.paymentUrl}
            invoiceId={cryptoInvoice.invoiceId}
            amount={cryptoInvoice.amount}
            currency={cryptoInvoice.currency}
          />
        )}

        {/* Manual Payment Modal */}
        {manualPaymentData && (
          <ManualPaymentModal
            isOpen={manualModalOpen}
            onClose={() => {
              setManualModalOpen(false)
              setManualPaymentData(null)
            }}
            method={manualPaymentData.method}
            instructions={manualPaymentData.instructions}
            amount={manualPaymentData.amount}
            currency={manualPaymentData.currency}
            transactionId={manualPaymentData.transactionId}
            onConfirm={handleManualConfirmation}
            confirming={confirmingManual}
          />
        )}
      </div>
    </div>
  )
}


'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserSession } from '@/lib/simple-auth'
import SubscriptionPlanCard, { SubscriptionPlan } from '@/components/subscription/SubscriptionPlanCard'
import PaymentButton, { PaymentMethod } from '@/components/subscription/PaymentButton'
import CryptoInvoiceModal from '@/components/subscription/CryptoInvoiceModal'
import ManualPaymentModal from '@/components/subscription/ManualPaymentModal'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Crown, Sparkles, Shield, X, RefreshCw, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    let token = await getAuthToken(true)
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
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
        }),
      })

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: 'Payment service is unavailable' }
        }
        
        const errorMsg = errorData.message || errorData.error || 'Payment service is currently unavailable'
        if (response.status === 401) {
          setErrorMessage('Your session has expired or you are not logged in. Please log in again to continue.')
          setTimeout(() => router.push('/login'), 4000)
        } else if (response.status === 503 || errorData.requiresBackend) {
          setErrorMessage('Payment service is currently unavailable. Please contact support or check back later.')
        } else {
          setErrorMessage(errorMsg)
        }
        setSelectedPaymentMethod(null)
        setTimeout(() => setErrorMessage(null), 15000)
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
          window.location.href = data.paymentUrl
        } else {
          alert('Payment created. Please follow the instructions provided.')
        }
      } else {
        const errorMsg = data.message || data.error || 'Failed to create payment'
        if (data.requiresBackend) {
          setErrorMessage('Payment service is currently unavailable. Please contact support or check back later.')
        } else {
          setErrorMessage(errorMsg)
        }
        setSelectedPaymentMethod(null)
        setTimeout(() => setErrorMessage(null), 15000)
      }
    } catch (error: any) {
      console.error('Payment creation error:', error)
      setSelectedPaymentMethod(null)
      setErrorMessage('Failed to create payment. The payment service is currently unavailable. Please contact support or check back later.')
      setTimeout(() => setErrorMessage(null), 15000)
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-200 border-t-violet-600"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading plans...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-6 sm:py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              PREMIUM
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Choose Your Subscription Plan
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-lg mx-auto">
              Unlock all premium features and enhance your child&apos;s learning experience
            </p>
          </div>
        </motion.div>

        {/* Error State */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                    {errorMessage?.toLowerCase().includes('log in') ? 'Session Expired' : 'Something went wrong'}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setErrorMessage(null); setSelectedPaymentMethod(null) }}
                      className="rounded-xl text-xs border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
                    >
                      <X className="w-3 h-3 mr-1" /> Dismiss
                    </Button>
                    {errorMessage?.toLowerCase().includes('log in') && (
                      <Button
                        size="sm"
                        onClick={() => router.push('/login')}
                        className="rounded-xl text-xs bg-violet-600 hover:bg-violet-700 text-white"
                      >
                        <LogIn className="w-3 h-3 mr-1" /> Log in
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setLoading(true); setErrorMessage(null); fetchPlans() }}
                      className="rounded-xl text-xs border-gray-300 dark:border-gray-600"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" /> Retry
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mb-10">
          {plans.map((plan, index) => (
            <SubscriptionPlanCard
              key={plan.planId}
              plan={plan}
              onSelect={handlePlanSelect}
              isPopular={index === 1}
              isSelected={selectedPlan === plan.planId}
              loading={selectedPlan === plan.planId && !!selectedPaymentMethod}
            />
          ))}
        </div>

        {plans.length === 0 && !errorMessage && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">Plans will appear here once they are configured.</p>
          </div>
        )}

        {/* Payment Section */}
        <AnimatePresence>
          {selectedPlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-w-lg mx-auto"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
                <div className="p-6 sm:p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      Complete Your Payment
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Send payment to our phone number and submit your receipt
                    </p>
                  </div>

                  {/* Selected plan mini-summary */}
                  {(() => {
                    const planInfo = plans.find(p => p.planId === selectedPlan)
                    if (!planInfo) return null
                    return (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 mb-6">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{planInfo.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{planInfo.description}</p>
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {planInfo.price.toLocaleString()} <span className="text-xs font-normal text-gray-500">{planInfo.currency}</span>
                        </p>
                      </div>
                    )
                  })()}

                  <div className="flex justify-center">
                    <PaymentButton
                      paymentMethod="fib_manual"
                      onClick={() => handlePaymentMethodSelect('fib_manual')}
                      className="w-full text-base py-5 rounded-xl"
                    />
                  </div>

                  <div className="flex items-start gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Shield className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                      Your payment will be verified manually. Submit your receipt to activate your subscription.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals */}
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

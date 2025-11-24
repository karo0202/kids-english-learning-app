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

  useEffect(() => {
    const user = getUserSession()
    if (!user) {
      router.push('/login')
      return
    }

    fetchPlans()
  }, [router])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscription/plans')
      const data = await response.json()
      if (data.success) {
        setPlans(data.plans)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
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

    setSelectedPaymentMethod(paymentMethod)

    try {
      const { getAuthToken } = await import('@/lib/simple-auth')
      const token = await getAuthToken()
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          planId: selectedPlan,
          paymentMethod,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const planInfo = plans.find((p) => p.planId === selectedPlan)

        if (data.manualPayment) {
          setManualPaymentData({
            method: paymentMethod as 'crypto_manual' | 'fib_manual',
            instructions: data.manualInstructions || {},
            transactionId: data.transactionId,
            amount: planInfo?.price || 0,
            currency: planInfo?.currency || 'USD',
          })
          setManualModalOpen(true)
        } else if (paymentMethod === 'crypto') {
          setCryptoInvoice({
            paymentUrl: data.paymentUrl,
            invoiceId: data.invoiceId || data.transactionId,
            amount: planInfo?.price || 0,
            currency: planInfo?.currency || 'USD',
          })
          setCryptoModalOpen(true)
        } else if (data.paymentUrl) {
          // Redirect to payment provider
          window.location.href = data.paymentUrl
        } else {
          alert('Payment created. Please follow the instructions provided.')
        }
      } else {
        alert(data.error || 'Failed to create payment')
      }
    } catch (error) {
      console.error('Payment creation error:', error)
      alert('Failed to create payment. Please try again.')
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
      const response = await fetch('/api/subscription/manual/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...payload,
          paymentMethod: manualPaymentData?.method,
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 py-12 px-4">
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

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, index) => (
            <SubscriptionPlanCard
              key={plan.planId}
              plan={plan}
              onSelect={handlePlanSelect}
              isPopular={index === 1} // Middle plan is popular
              loading={selectedPlan === plan.planId && !!selectedPaymentMethod}
            />
          ))}
        </div>

        {/* Payment Methods */}
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Select Payment Method
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <PaymentButton
                paymentMethod="crypto"
                onClick={() => handlePaymentMethodSelect('crypto')}
              />
              <PaymentButton
                paymentMethod="zaincash"
                onClick={() => handlePaymentMethodSelect('zaincash')}
              />
              <PaymentButton
                paymentMethod="fastpay"
                onClick={() => handlePaymentMethodSelect('fastpay')}
              />
              <PaymentButton
                paymentMethod="nasspay"
                onClick={() => handlePaymentMethodSelect('nasspay')}
              />
              <PaymentButton
                paymentMethod="fib"
                onClick={() => handlePaymentMethodSelect('fib')}
              />
              <PaymentButton
                paymentMethod="crypto_manual"
                onClick={() => handlePaymentMethodSelect('crypto_manual')}
              />
              <PaymentButton
                paymentMethod="fib_manual"
                onClick={() => handlePaymentMethodSelect('fib_manual')}
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


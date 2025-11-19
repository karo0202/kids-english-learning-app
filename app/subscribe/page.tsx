'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authenticateToken } from '@/lib/simple-auth'
import SubscriptionPlanCard, { SubscriptionPlan } from '@/components/subscription/SubscriptionPlanCard'
import PaymentButton from '@/components/subscription/PaymentButton'
import CryptoInvoiceModal from '@/components/subscription/CryptoInvoiceModal'
import { motion } from 'framer-motion'

export default function SubscribePage() {
  const router = useRouter()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [cryptoModalOpen, setCryptoModalOpen] = useState(false)
  const [cryptoInvoice, setCryptoInvoice] = useState<any>(null)

  useEffect(() => {
    const user = authenticateToken()
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

  const handlePaymentMethodSelect = async (paymentMethod: string) => {
    if (!selectedPlan) {
      alert('Please select a plan first')
      return
    }

    setSelectedPaymentMethod(paymentMethod)

    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: selectedPlan,
          paymentMethod,
        }),
      })

      const data = await response.json()

      if (data.success) {
        if (paymentMethod === 'crypto') {
          setCryptoInvoice({
            paymentUrl: data.paymentUrl,
            invoiceId: data.invoiceId || data.transactionId,
            amount: plans.find((p) => p.planId === selectedPlan)?.price || 0,
            currency: plans.find((p) => p.planId === selectedPlan)?.currency || 'USD',
          })
          setCryptoModalOpen(true)
        } else {
          // Redirect to payment provider
          window.location.href = data.paymentUrl
        }
      } else {
        alert(data.error || 'Failed to create payment')
      }
    } catch (error) {
      console.error('Payment creation error:', error)
      alert('Failed to create payment. Please try again.')
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
      </div>
    </div>
  )
}


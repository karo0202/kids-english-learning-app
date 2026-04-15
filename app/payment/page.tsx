'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  CheckCircle2, 
  Clock, 
  Copy,
  ArrowLeft,
  Shield,
  Zap,
  Building2,
  Star,
  Infinity,
  CalendarDays,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import { getUserSession } from '@/lib/simple-auth'
import { 
  PAYMENT_PLANS, 
  PaymentPlan,
  createPaymentTransaction,
  generatePaymentQR,
  updateTransactionStatus,
  isTransactionExpired,
  PaymentTransaction
} from '@/lib/crypto-payment'
import { QRCodeSVG } from 'qrcode.react'
import ManualPaymentModal from '@/components/subscription/ManualPaymentModal'

const PLAN_TO_SUBSCRIPTION: Record<string, string> = {
  'premium-monthly': 'monthly',
  'premium-yearly': 'yearly',
  'premium-lifetime': 'lifetime',
}

const PLAN_IQD: Record<string, { amount: number; currency: string }> = {
  'premium-monthly': { amount: 13000, currency: 'IQD' },
  'premium-yearly': { amount: 125000, currency: 'IQD' },
  'premium-lifetime': { amount: 200000, currency: 'IQD' },
}

const PLAN_META: Record<string, { icon: typeof Star; gradient: string; badge?: string; popular?: boolean }> = {
  'premium-monthly': { icon: Star, gradient: 'from-blue-500 to-cyan-500' },
  'premium-yearly': { icon: CalendarDays, gradient: 'from-violet-500 to-purple-600', badge: 'Most Popular', popular: true },
  'premium-lifetime': { icon: Infinity, gradient: 'from-amber-500 to-orange-500', badge: 'Best Value' },
}

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan') || 'premium-monthly'
  
  const [user, setUser] = useState<any>(null)
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null)
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null)
  const [copied, setCopied] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<'BTC' | 'ETH' | 'USDT' | 'USDC'>('BTC')
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'fib'>('crypto')
  const [manualPaymentData, setManualPaymentData] = useState<{
    method: 'fib_manual'
    instructions: any
    transactionId: string
    amount: number
    currency: string
  } | null>(null)
  const [manualModalOpen, setManualModalOpen] = useState(false)
  const [fibLoading, setFibLoading] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [confirmingManual, setConfirmingManual] = useState(false)
  const [step, setStep] = useState<'plan' | 'pay'>('plan')

  useEffect(() => {
    const currentUser = getUserSession()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    const plan = PAYMENT_PLANS.find(p => p.id === planId)
    setSelectedPlan(plan || PAYMENT_PLANS[0])
  }, [planId, router])

  useEffect(() => {
    if (user && selectedPlan && paymentMethod === 'crypto') {
      const newTransaction = createPaymentTransaction(user.id, selectedPlan.id)
      setTransaction(newTransaction)
    }
  }, [user, selectedPlan, paymentMethod])

  const handleCopyAddress = () => {
    if (transaction?.walletAddress) {
      navigator.clipboard.writeText(transaction.walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleVerifyPayment = () => {
    if (transaction) {
      const txHash = prompt('Enter your transaction hash (TX ID) from your wallet:')
      if (txHash) {
        updateTransactionStatus(transaction.id, 'completed', txHash)
        alert('Payment verified! Your premium subscription is now active.')
        router.push('/dashboard')
      }
    }
  }

  const handlePayWithFIB = async () => {
    if (!user || !selectedPlan) return
    setPaymentError(null)
    setFibLoading(true)
    try {
      const { getAuthToken } = await import('@/lib/simple-auth')
      const token = await getAuthToken(true)
      if (!token) {
        setPaymentError('Session expired. Please log in again.')
        return
      }
      const subscriptionPlanId = PLAN_TO_SUBSCRIPTION[selectedPlan.id] || 'monthly'
      const res = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          planId: subscriptionPlanId,
          paymentMethod: 'fib_manual',
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPaymentError(data.error || data.message || 'Failed to create payment')
        return
      }
      if (data.success && data.manualPayment && data.manualInstructions) {
        const iqd = PLAN_IQD[selectedPlan.id] || { amount: 13000, currency: 'IQD' }
        setManualPaymentData({
          method: 'fib_manual',
          instructions: data.manualInstructions,
          transactionId: data.transactionId,
          amount: iqd.amount,
          currency: iqd.currency,
        })
        setManualModalOpen(true)
      } else {
        setPaymentError('FIB payment is not configured. Please try crypto or contact support.')
      }
    } catch (e: any) {
      setPaymentError(e.message || 'Request failed')
    } finally {
      setFibLoading(false)
    }
  }

  const handleManualConfirm = async (payload: {
    transactionId: string
    reference?: string
    proofUrl?: string
    contactPhone?: string
    notes?: string
  }) => {
    setConfirmingManual(true)
    try {
      const { getAuthToken } = await import('@/lib/simple-auth')
      const token = await getAuthToken()
      const res = await fetch('/api/subscription/manual/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          ...payload,
          paymentMethod: 'fib_manual',
          userEmail: user?.email || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setManualModalOpen(false)
        setManualPaymentData(null)
        alert('Thank you! We will verify your payment and activate your subscription soon.')
        router.push('/dashboard')
      } else {
        alert(data.error || 'Failed to submit payment proof.')
      }
    } catch {
      alert('Request failed. Please try again.')
    } finally {
      setConfirmingManual(false)
    }
  }

  const qrData = transaction && selectedPlan && paymentMethod === 'crypto'
    ? generatePaymentQR(transaction.amount, selectedCurrency, `Kids English App - ${selectedPlan.name}`)
    : ''

  if (!user || !selectedPlan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-200 border-t-violet-600"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Preparing checkout...</p>
      </div>
    )
  }

  if (paymentMethod === 'crypto' && !transaction) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-200 border-t-violet-600"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Setting up payment...</p>
      </div>
    )
  }

  const isExpired = transaction ? isTransactionExpired(transaction) : false
  const meta = PLAN_META[selectedPlan.id] || PLAN_META['premium-monthly']
  const PlanIcon = meta.icon

  const currencyEmoji: Record<string, string> = { BTC: '₿', ETH: 'Ξ', USDT: '$', USDC: '$' }

  return (
    <div className="min-h-screen py-6 sm:py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => step === 'pay' ? setStep('plan') : router.back()}
            className="mb-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step === 'pay' ? 'Change plan' : 'Back'}
          </Button>
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              PREMIUM
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Unlock the full experience
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-lg mx-auto sm:mx-0">
              Give your child unlimited access to all lessons, games, and personalized learning.
            </p>
          </div>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8 max-w-xs mx-auto sm:mx-0">
          {['Choose Plan', 'Payment'].map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                (i === 0 && step === 'plan') || (i === 1 && step === 'pay')
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900'
                  : i === 0 && step === 'pay'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {i === 0 && step === 'pay' ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${
                (i === 0 && step === 'plan') || (i === 1 && step === 'pay')
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>{label}</span>
              {i === 0 && <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 hidden sm:block" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Plan Selection */}
          {step === 'plan' && (
            <motion.div
              key="plans"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5"
            >
              {PAYMENT_PLANS.map((plan, index) => {
                const isSelected = selectedPlan.id === plan.id
                const pm = PLAN_META[plan.id] || PLAN_META['premium-monthly']
                const Icon = pm.icon
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="relative"
                  >
                    {pm.badge && (
                      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                        pm.popular ? 'bg-gradient-to-r from-violet-500 to-purple-600' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                      }`}>
                        {pm.badge}
                      </div>
                    )}
                    <Card
                      className={`cursor-pointer transition-all duration-300 overflow-hidden h-full ${
                        isSelected
                          ? 'ring-2 ring-violet-500 dark:ring-violet-400 shadow-xl shadow-violet-100 dark:shadow-violet-900/30 bg-white dark:bg-gray-800'
                          : 'border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 bg-white/80 dark:bg-gray-800/80'
                      } ${pm.popular ? 'md:scale-[1.03]' : ''}`}
                      onClick={() => {
                        setSelectedPlan(plan)
                        if (user) {
                          const newTransaction = createPaymentTransaction(user.id, plan.id)
                          setTransaction(newTransaction)
                        }
                      }}
                    >
                      <div className={`h-1.5 bg-gradient-to-r ${pm.gradient}`} />
                      <CardContent className="p-5 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pm.gradient} flex items-center justify-center shadow-md`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center"
                            >
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>

                        <div className="mt-3 mb-5">
                          <span className="text-3xl font-extrabold text-gray-900 dark:text-white">${plan.priceUSD}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                            /{plan.duration === 'lifetime' ? 'forever' : plan.duration === 'yearly' ? 'year' : 'month'}
                          </span>
                          {plan.id === 'premium-yearly' && (
                            <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">Save $19.89 vs monthly</p>
                          )}
                        </div>

                        <ul className="space-y-2.5">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <Button
                          className={`w-full mt-6 rounded-xl h-11 font-semibold transition-all ${
                            isSelected
                              ? `bg-gradient-to-r ${pm.gradient} text-white shadow-md hover:shadow-lg`
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedPlan(plan)
                            if (user) {
                              const newTransaction = createPaymentTransaction(user.id, plan.id)
                              setTransaction(newTransaction)
                            }
                            setStep('pay')
                          }}
                        >
                          {isSelected ? 'Continue' : 'Select'}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {step === 'pay' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-xl mx-auto"
            >
              <Card className="overflow-hidden border-0 shadow-2xl shadow-violet-100 dark:shadow-black/30 bg-white dark:bg-gray-800">
                <div className={`h-2 bg-gradient-to-r ${meta.gradient}`} />
                <CardContent className="p-6 sm:p-8 space-y-6">

                  {/* Selected plan summary */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center`}>
                        <PlanIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{selectedPlan.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedPlan.duration === 'lifetime' ? 'One-time payment' : `Billed ${selectedPlan.duration}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-gray-900 dark:text-white">${selectedPlan.priceUSD}</p>
                    </div>
                  </div>

                  {/* Payment method */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Payment method</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'crypto' as const, label: 'Crypto', icon: Zap, desc: 'BTC, ETH, USDT', color: 'violet' },
                        { id: 'fib' as const, label: 'FIB Bank', icon: Building2, desc: 'Iraqi Dinar', color: 'emerald' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setPaymentMethod(m.id)}
                          className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                            paymentMethod === m.id
                              ? m.id === 'crypto'
                                ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 dark:border-violet-400'
                                : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-400'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                          }`}
                        >
                          {paymentMethod === m.id && (
                            <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center ${
                              m.id === 'crypto' ? 'bg-violet-500' : 'bg-emerald-500'
                            }`}>
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <m.icon className={`w-5 h-5 mb-2 ${
                            paymentMethod === m.id
                              ? m.id === 'crypto' ? 'text-violet-600 dark:text-violet-400' : 'text-emerald-600 dark:text-emerald-400'
                              : 'text-gray-400'
                          }`} />
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">{m.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{m.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* FIB Bank flow */}
                  {paymentMethod === 'fib' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                        <p className="text-sm text-emerald-800 dark:text-emerald-200">
                          Pay via FIB (First Iraqi Bank). You&apos;ll get payment instructions and can submit your receipt after paying.
                        </p>
                      </div>
                      {paymentError && (
                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <p className="text-sm text-red-700 dark:text-red-300">{paymentError}</p>
                        </div>
                      )}
                      <Button
                        onClick={handlePayWithFIB}
                        disabled={fibLoading}
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30"
                      >
                        {fibLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Loading...
                          </div>
                        ) : (
                          <>
                            <Building2 className="w-4 h-4 mr-2" />
                            Get FIB Payment Details
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}

                  {/* Crypto flow */}
                  {paymentMethod === 'crypto' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                      {/* Currency selector */}
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Select currency</p>
                        <div className="grid grid-cols-4 gap-2">
                          {(['BTC', 'ETH', 'USDT', 'USDC'] as const).map((currency) => (
                            <button
                              key={currency}
                              onClick={() => setSelectedCurrency(currency)}
                              className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                selectedCurrency === currency
                                  ? 'bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/30'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                            >
                              {currencyEmoji[currency]} {currency}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* QR Code */}
                      {qrData && (
                        <div className="flex flex-col items-center py-4">
                          <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-600">
                            <QRCodeSVG value={qrData} size={180} level="H" />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                            Scan with your wallet to pay
                          </p>
                        </div>
                      )}

                      {/* Wallet Address */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          {selectedCurrency} Wallet Address
                        </p>
                        <div className="flex gap-2">
                          <div className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 font-mono text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate">
                            {transaction?.walletAddress || ''}
                          </div>
                          <Button
                            onClick={handleCopyAddress}
                            variant="outline"
                            className={`rounded-xl border-gray-200 dark:border-gray-600 px-4 transition-all ${
                              copied ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700' : ''
                            }`}
                          >
                            {copied ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        {copied && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1.5 font-medium">Copied to clipboard!</p>
                        )}
                      </div>

                      {/* Amount */}
                      {transaction && (
                        <div className="flex items-center justify-between p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                          <span className="text-sm font-medium text-violet-700 dark:text-violet-300">Amount to send</span>
                          <div className="text-right">
                            <p className="text-xl font-bold text-violet-900 dark:text-violet-100">
                              {transaction.amount} {selectedCurrency}
                            </p>
                            <p className="text-xs text-violet-500 dark:text-violet-400">
                              ≈ ${selectedPlan.priceUSD} USD
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Status badges */}
                      {isExpired && (
                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <p className="text-sm text-red-700 dark:text-red-300">
                            This payment request has expired. Please go back and try again.
                          </p>
                        </div>
                      )}

                      {transaction && transaction.status === 'pending' && !isExpired && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <p className="text-sm text-amber-700 dark:text-amber-300">
                            Waiting for payment · Expires in {Math.max(0, Math.floor((new Date(transaction.expiresAt).getTime() - Date.now()) / 60000))} min
                          </p>
                        </div>
                      )}

                      {/* Instructions */}
                      {transaction && (
                        <div className="space-y-2 text-sm">
                          <p className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <Shield className="w-4 h-4 text-violet-500" />
                            How to pay
                          </p>
                          <ol className="text-gray-500 dark:text-gray-400 space-y-1 list-decimal list-inside text-xs sm:text-sm leading-relaxed">
                            <li>Copy the wallet address above</li>
                            <li>Send exactly <strong className="text-gray-700 dark:text-gray-200">{transaction.amount} {selectedCurrency}</strong></li>
                            <li>Wait for blockchain confirmation (1-10 min)</li>
                            <li>Click &quot;Verify Payment&quot; below and paste your TX hash</li>
                          </ol>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="space-y-3 pt-2">
                        <Button
                          onClick={handleVerifyPayment}
                          className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-violet-200 dark:shadow-violet-900/30"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Verify Payment
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => router.push('/dashboard')}
                          className="w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          I&apos;ll pay later
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Security */}
                  <div className="flex items-start gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <Shield className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                      {paymentMethod === 'crypto'
                        ? 'Processed securely on the blockchain. We never store your private keys.'
                        : 'FIB payments are verified manually. Submit your receipt for activation.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {manualPaymentData && (
        <ManualPaymentModal
          isOpen={manualModalOpen}
          onClose={() => setManualModalOpen(false)}
          method="fib_manual"
          instructions={manualPaymentData.instructions}
          transactionId={manualPaymentData.transactionId}
          amount={manualPaymentData.amount}
          currency={manualPaymentData.currency}
          onConfirm={handleManualConfirm}
          confirming={confirmingManual}
        />
      )}
    </div>
  )
}

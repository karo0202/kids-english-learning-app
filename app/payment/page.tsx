'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Copy,
  ArrowLeft,
  Sparkles,
  Shield,
  Zap,
  Building2,
  Crown
} from 'lucide-react'
import { getUserSession } from '@/lib/simple-auth'
import { 
  PAYMENT_PLANS, 
  PaymentPlan,
  createPaymentTransaction,
  generatePaymentQR,
  getUserTransactions,
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
      // Manual verification - in production, integrate with blockchain API
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
        body: JSON.stringify({ ...payload, paymentMethod: 'fib_manual' }),
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
    } catch (e: any) {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment...</p>
        </div>
      </div>
    )
  }

  if (paymentMethod === 'crypto' && !transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment...</p>
        </div>
      </div>
    )
  }

  const isExpired = transaction ? isTransactionExpired(transaction) : false

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                Upgrade to Premium
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-0.5">
                Pay with crypto or FIB Bank · Unlock all features
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* Payment Plans */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Choose Your Plan</h2>
            {PAYMENT_PLANS.map((plan, index) => {
              const isSelected = selectedPlan.id === plan.id
              const isYearly = plan.id === 'premium-yearly'
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`relative cursor-pointer transition-all duration-200 overflow-hidden ${
                      isSelected
                        ? 'ring-2 ring-violet-500 dark:ring-violet-400 shadow-xl bg-gradient-to-br from-white to-violet-50/50 dark:from-gray-800 dark:to-violet-900/20'
                        : 'hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 border border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => {
                      setSelectedPlan(plan)
                      if (user) {
                        const newTransaction = createPaymentTransaction(user.id, plan.id)
                        setTransaction(newTransaction)
                      }
                    }}
                  >
                    {isYearly && (
                      <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-amber-400/90 dark:bg-amber-500 text-amber-900 text-xs font-semibold">
                        Save 20%
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            {plan.name}
                          </CardTitle>
                          <p className="text-2xl font-bold text-violet-600 dark:text-violet-400 mt-2">
                            ${plan.priceUSD}
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                              /{plan.duration === 'lifetime' ? 'one-time' : plan.duration}
                            </span>
                          </p>
                        </div>
                        {isSelected && (
                          <div className="rounded-full bg-violet-500 p-1">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Payment Details */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/80 dark:border-gray-700 shadow-xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                    <CreditCard className="w-5 h-5 text-violet-500" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                {/* Selected Plan Info */}
                <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-violet-100 dark:border-violet-800/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-800 dark:text-gray-100">{selectedPlan.name}</span>
                    <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                      ${selectedPlan.priceUSD}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedPlan.duration === 'lifetime' 
                      ? 'One-time payment' 
                      : `Billed ${selectedPlan.duration}`}
                  </p>
                </div>

                {/* Payment method: Crypto or FIB */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Payment method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={paymentMethod === 'crypto' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('crypto')}
                      className={`flex items-center justify-center gap-2 h-11 transition-all ${
                        paymentMethod === 'crypto'
                          ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-md'
                          : 'hover:border-violet-300 dark:hover:border-violet-600'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">Crypto</span>
                    </Button>
                    <Button
                      variant={paymentMethod === 'fib' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('fib')}
                      className={`flex items-center justify-center gap-2 h-11 transition-all ${
                        paymentMethod === 'fib'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md'
                          : 'hover:border-emerald-300 dark:hover:border-emerald-600'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">FIB Bank</span>
                    </Button>
                  </div>
                </div>

                {/* FIB: single button to get instructions */}
                {paymentMethod === 'fib' && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Pay via FIB (First Iraqi Bank). You will get payment details and can submit your screenshot after paying.
                    </p>
                    {paymentError && (
                      <p className="text-sm text-red-600">{paymentError}</p>
                    )}
                    <Button
                      onClick={handlePayWithFIB}
                      disabled={fibLoading}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md"
                      size="lg"
                    >
                      {fibLoading ? 'Loading...' : 'Get FIB payment details'}
                    </Button>
                  </div>
                )}

                {/* Crypto: Currency Selection */}
                {paymentMethod === 'crypto' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Payment Currency
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['BTC', 'ETH', 'USDT', 'USDC'] as const).map((currency) => (
                      <Button
                        key={currency}
                        variant={selectedCurrency === currency ? 'default' : 'outline'}
                        onClick={() => setSelectedCurrency(currency)}
                        className={`text-xs font-medium transition-all ${
                          selectedCurrency === currency
                            ? 'bg-violet-500 hover:bg-violet-600'
                            : ''
                        }`}
                      >
                        {currency}
                      </Button>
                    ))}
                  </div>
                </div>
                )}

                {/* QR Code */}
                {paymentMethod === 'crypto' && qrData && (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                      <QRCodeSVG value={qrData} size={200} level="H" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      Scan with your crypto wallet to pay
                    </p>
                  </div>
                )}

                {/* Wallet Address */}
                {paymentMethod === 'crypto' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wallet Address ({selectedCurrency})
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={transaction?.walletAddress || ''}
                      className="flex-1 px-4 py-2 border rounded-xl bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 font-mono text-sm text-gray-800 dark:text-gray-200"
                    />
                    <Button
                      onClick={handleCopyAddress}
                      variant="outline"
                      size="icon"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {copied && (
                    <p className="text-sm text-green-600 mt-2">Copied to clipboard!</p>
                  )}
                </div>
                )}

                {/* Amount */}
                {paymentMethod === 'crypto' && transaction && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Amount to Pay:</span>
                    <span className="text-xl font-bold text-gray-800 dark:text-white">
                      {transaction.amount} {selectedCurrency}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ≈ ${selectedPlan.priceUSD} USD
                  </p>
                </div>
                )}

                {/* Status */}
                {paymentMethod === 'crypto' && isExpired && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600">
                      ⚠️ This payment request has expired. Please create a new one.
                    </p>
                  </div>
                )}

                {paymentMethod === 'crypto' && transaction && transaction.status === 'pending' && !isExpired && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        Payment Pending
                      </span>
                    </div>
                    <p className="text-xs text-yellow-700">
                      Expires in {Math.max(0, Math.floor((new Date(transaction.expiresAt).getTime() - Date.now()) / 60000))} minutes
                    </p>
                  </div>
                )}

                {/* Instructions */}
                {paymentMethod === 'crypto' && transaction && (
                <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-4 space-y-2">
                  <h4 className="font-semibold text-violet-800 dark:text-violet-200 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Payment Instructions
                  </h4>
                  <ol className="text-sm text-violet-700 dark:text-violet-300 space-y-1 list-decimal list-inside">
                    <li>Copy the wallet address above</li>
                    <li>Send exactly {transaction.amount} {selectedCurrency} to this address</li>
                    <li>Wait for blockchain confirmation (usually 1-10 minutes)</li>
                    <li>Click &quot;Verify Payment&quot; and enter your transaction hash</li>
                    <li>Your premium subscription will be activated immediately</li>
                  </ol>
                </div>
                )}

                {/* Action Buttons */}
                {paymentMethod === 'crypto' && (
                <div className="space-y-3">
                  <Button
                    onClick={handleVerifyPayment}
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-md"
                    size="lg"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Verify Payment
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                    className="w-full border-gray-300 dark:border-gray-600"
                  >
                    Continue Later
                  </Button>
                </div>
                )}

                {/* Security Note */}
                <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>
                    {paymentMethod === 'crypto'
                      ? 'Your payment is processed securely on the blockchain. We never store your private keys or wallet information.'
                      : 'FIB payments are verified manually. After you pay, submit your screenshot so we can activate your subscription.'}
                  </p>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </div>
        </div>
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


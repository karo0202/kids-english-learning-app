'use client'

import { Button } from '@/components/ui/button'
import { CreditCard, Wallet, Coins, Building2, QrCode } from 'lucide-react'
import { useState } from 'react'

export type PaymentMethod =
  | 'crypto'
  | 'zaincash'
  | 'fastpay'
  | 'nasspay'
  | 'fib'
  | 'crypto_manual'
  | 'fib_manual'

interface PaymentButtonProps {
  paymentMethod: PaymentMethod
  onClick: () => void
  disabled?: boolean
  className?: string
}

const paymentMethodConfig = {
  crypto: {
    label: 'Pay with Crypto',
    icon: Coins,
    color: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-200 dark:shadow-amber-900/30',
  },
  zaincash: {
    label: 'ZainCash',
    icon: Wallet,
    color: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/30',
  },
  fastpay: {
    label: 'FastPay',
    icon: CreditCard,
    color: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-200 dark:shadow-green-900/30',
  },
  nasspay: {
    label: 'NassPay',
    icon: Building2,
    color: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-200 dark:shadow-purple-900/30',
  },
  fib: {
    label: 'FIB Bank',
    icon: Building2,
    color: 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30',
  },
  crypto_manual: {
    label: 'Crypto Wallet (Manual)',
    icon: Coins,
    color: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-200 dark:shadow-amber-900/30',
  },
  fib_manual: {
    label: 'Pay by Phone Number',
    icon: QrCode,
    color: 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-200 dark:shadow-violet-900/30',
  },
} as const

export default function PaymentButton({
  paymentMethod,
  onClick,
  disabled = false,
  className = '',
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)
  const config = paymentMethodConfig[paymentMethod]
  const Icon = config.icon

  const handleClick = async () => {
    setLoading(true)
    try {
      await onClick()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`${config.color} text-white font-semibold rounded-xl transition-all ${className}`}
      size="lg"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Processing...
        </span>
      ) : (
        <>
          <Icon className="w-5 h-5 mr-2" />
          {config.label}
        </>
      )}
    </Button>
  )
}

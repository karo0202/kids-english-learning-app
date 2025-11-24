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
    color: 'bg-orange-500 hover:bg-orange-600',
  },
  zaincash: {
    label: 'ZainCash',
    icon: Wallet,
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  fastpay: {
    label: 'FastPay',
    icon: CreditCard,
    color: 'bg-green-500 hover:bg-green-600',
  },
  nasspay: {
    label: 'NassPay',
    icon: Building2,
    color: 'bg-purple-500 hover:bg-purple-600',
  },
  fib: {
    label: 'FIB Bank',
    icon: Building2,
    color: 'bg-indigo-500 hover:bg-indigo-600',
  },
  crypto_manual: {
    label: 'Crypto Wallet (Manual)',
    icon: Coins,
    color: 'bg-amber-500 hover:bg-amber-600',
  },
  fib_manual: {
    label: 'FIB QR / Phone',
    icon: QrCode,
    color: 'bg-slate-700 hover:bg-slate-800',
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
      className={`${config.color} text-white ${className}`}
      size="lg"
    >
      <Icon className="w-5 h-5 mr-2" />
      {loading ? 'Processing...' : config.label}
    </Button>
  )
}


'use client'

import { useSearchParams } from 'next/navigation'
import PaymentSuccessScreen from '@/components/subscription/PaymentSuccessScreen'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const transactionId = searchParams.get('transactionId')

  return <PaymentSuccessScreen transactionId={transactionId || undefined} />
}


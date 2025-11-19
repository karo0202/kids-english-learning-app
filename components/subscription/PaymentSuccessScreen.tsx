'use client'

import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface PaymentSuccessScreenProps {
  transactionId?: string
}

export default function PaymentSuccessScreen({ transactionId }: PaymentSuccessScreenProps) {
  const router = useRouter()
  const [verifying, setVerifying] = useState(true)

  useEffect(() => {
    // Verify subscription status
    if (transactionId) {
      const verifySubscription = async () => {
        try {
      const { getAuthToken } = await import('@/lib/simple-auth')
      const token = await getAuthToken()
      const response = await fetch('/api/subscription/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
            body: JSON.stringify({ transactionId }),
          })

          const data = await response.json()
          if (data.verified) {
            setVerifying(false)
          } else {
            // Poll again after 2 seconds
            setTimeout(verifySubscription, 2000)
          }
        } catch (error) {
          console.error('Verification error:', error)
          setVerifying(false)
        }
      }

      verifySubscription()
    } else {
      setVerifying(false)
    }
  }, [transactionId])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
        >
          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Payment Successful!
        </h1>

        {verifying ? (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Verifying your subscription...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-300">
              Your subscription has been activated successfully. You now have access to all premium features!
            </p>

            {transactionId && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Transaction ID
                </p>
                <p className="text-sm font-mono text-gray-900 dark:text-white">
                  {transactionId}
                </p>
              </div>
            )}

            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              size="lg"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}


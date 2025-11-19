'use client'

import { motion } from 'framer-motion'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function PaymentFailedScreen() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"
        >
          <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Payment Failed
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          We couldn't process your payment. Please try again or contact support if the problem persists.
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => router.push('/subscribe')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            size="lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </Button>

          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  )
}


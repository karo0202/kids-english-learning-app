'use client'

import { motion } from 'framer-motion'
import { Lock, Crown, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { checkModuleAccess, refreshSubscriptionStatus } from '@/lib/subscription'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SubscriptionLockOverlayProps {
  moduleId: string
  moduleName: string
  onSubscribe?: () => void
}

export default function SubscriptionLockOverlay({
  moduleId,
  moduleName,
  onSubscribe
}: SubscriptionLockOverlayProps) {
  const router = useRouter()
  const [access, setAccess] = useState<any>({ isLocked: true })
  const [status, setStatus] = useState<any>({ isTrial: false, trialDaysRemaining: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadAccess = async () => {
      try {
        const statusData = await refreshSubscriptionStatus()
        if (!mounted) return
        setStatus(statusData)
        setAccess(checkModuleAccess(moduleId, statusData))
      } catch (error) {
        console.error('Error checking module access:', error)
        if (mounted) {
          setAccess({ isLocked: true, hasAccess: false, requiresSubscription: true })
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadAccess()

    return () => {
      mounted = false
    }
  }, [moduleId])

  if (loading || !access.isLocked) return null

  const handleSubscribe = () => {
    if (onSubscribe) {
      onSubscribe()
    } else {
      router.push('/subscribe')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="max-w-md w-full"
      >
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-900 border-2 border-purple-200 dark:border-purple-800 shadow-2xl">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg relative"
            >
              <Lock className="w-10 h-10 text-white" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0"
              >
                <Sparkles className="w-full h-full text-yellow-300 opacity-50" />
              </motion.div>
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              {moduleName} is Locked
            </h2>

            {status.isTrial ? (
              <div className="mb-6">
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                  This premium module requires a subscription.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                  <Crown className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                    {status.trialDaysRemaining} days left in your free trial
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                {access.message || 'This module requires a subscription to access.'}
              </p>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleSubscribe}
                className="w-full text-lg py-6 rounded-xl shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                size="lg"
              >
                Subscribe Now
              </Button>
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="w-full"
              >
                Go Back
              </Button>
            </div>

            {status.isTrial && (
              <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                During your free trial, you have access to Grammar, Writing, and Games modules.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}


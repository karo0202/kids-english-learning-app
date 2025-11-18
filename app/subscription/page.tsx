'use client'

import { motion } from 'framer-motion'
import { Crown, Check, Sparkles, Star } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import WhopPurchaseButton from '@/components/whop-purchase-button'
import { getSubscriptionStatus } from '@/lib/subscription'
import { useEffect, useState } from 'react'

export default function SubscriptionPage() {
  const [status, setStatus] = useState<any>({ isActive: false, isTrial: false })

  useEffect(() => {
    async function loadStatus() {
      const subscriptionStatus = await getSubscriptionStatus()
      setStatus(subscriptionStatus)
    }
    loadStatus()
  }, [])

  const features = [
    'Access to all premium learning modules',
    'Reading comprehension exercises',
    'Speaking practice with AI feedback',
    'Interactive puzzles and games',
    'Alphabet coloring activities',
    'Progress tracking and analytics',
    'Unlimited child profiles',
    'Priority customer support',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl"
          >
            <Crown className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Unlock Premium Access
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Get full access to all learning modules and features
          </p>
        </motion.div>

        {status.isTrial && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-yellow-500" />
                  <div>
                    <h3 className="font-bold text-lg text-yellow-800 dark:text-yellow-200">
                      Free Trial Active
                    </h3>
                    <p className="text-yellow-700 dark:text-yellow-300">
                      You have {status.trialDaysRemaining} days left in your free trial
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border-2 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Free Plan</h2>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">$0</span>
                  <span className="text-gray-600 dark:text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>7-day free trial</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Grammar, Writing, Games modules</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-400 dark:text-gray-600">
                    <span className="w-5 h-5">✗</span>
                    <span>Premium modules locked</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full border-2 border-purple-500 dark:border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-br from-purple-500 to-pink-500 text-white px-4 py-1 rounded-bl-lg">
                <span className="text-sm font-bold">RECOMMENDED</span>
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Premium Plan</h2>
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">Premium</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {features.map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                    >
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                <WhopPurchaseButton
                  className="w-full"
                  size="lg"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
                Why Choose Premium?
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">
                    Complete Learning
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Access all modules and unlock your child's full potential
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                    <Star className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">
                    Quality Content
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Expertly designed activities and exercises
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Crown className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">
                    Priority Support
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Get help when you need it with priority support
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}


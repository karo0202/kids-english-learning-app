'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'

export interface SubscriptionPlan {
  planId: string
  name: string
  description: string
  duration: number
  price: number
  currency: string
  features: string[]
}

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan
  onSelect: (planId: string) => void
  isPopular?: boolean
  loading?: boolean
}

export default function SubscriptionPlanCard({
  plan,
  onSelect,
  isPopular = false,
  loading = false,
}: SubscriptionPlanCardProps) {
  const durationText =
    plan.duration === 30
      ? 'Monthly'
      : plan.duration === 365
      ? 'Yearly'
      : plan.duration === 9999
      ? 'Lifetime'
      : `${plan.duration} days`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`relative h-full ${
          isPopular
            ? 'border-2 border-purple-500 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
            : 'border border-gray-200 dark:border-gray-700'
        }`}
      >
        {isPopular && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Popular
            </span>
          </div>
        )}

        <CardHeader className="text-center pb-4">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {plan.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">{plan.description}</p>
          <div className="mt-4">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              {plan.price}
            </span>
            <span className="text-gray-600 dark:text-gray-400 ml-2">
              {plan.currency} / {durationText}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            onClick={() => onSelect(plan.planId)}
            disabled={loading}
            className={`w-full ${
              isPopular
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                : ''
            }`}
            size="lg"
          >
            {loading ? 'Processing...' : 'Subscribe Now'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}


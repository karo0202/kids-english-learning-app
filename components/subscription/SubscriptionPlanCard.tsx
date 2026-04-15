'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Star, CalendarDays, Infinity, Sparkles } from 'lucide-react'
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
  isSelected?: boolean
}

const DURATION_META: Record<number, { label: string; icon: typeof Star; gradient: string; badge?: string }> = {
  30: { label: 'Monthly', icon: Star, gradient: 'from-blue-500 to-cyan-500' },
  365: { label: 'Yearly', icon: CalendarDays, gradient: 'from-violet-500 to-purple-600', badge: 'Most Popular' },
  9999: { label: 'Lifetime', icon: Infinity, gradient: 'from-amber-500 to-orange-500', badge: 'Best Value' },
}

export default function SubscriptionPlanCard({
  plan,
  onSelect,
  isPopular = false,
  loading = false,
  isSelected = false,
}: SubscriptionPlanCardProps) {
  const meta = DURATION_META[plan.duration] || { label: `${plan.duration} days`, icon: Star, gradient: 'from-gray-500 to-gray-600' }
  const Icon = meta.icon
  const badge = meta.badge || (isPopular ? 'Popular' : null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="cursor-pointer relative"
      onClick={() => !loading && onSelect(plan.planId)}
    >
      {badge && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
          plan.duration === 9999
            ? 'bg-gradient-to-r from-amber-500 to-orange-500'
            : 'bg-gradient-to-r from-violet-500 to-purple-600'
        }`}>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {badge}
          </span>
        </div>
      )}

      <Card
        className={`h-full transition-all duration-300 overflow-hidden ${
          isSelected
            ? 'ring-2 ring-violet-500 dark:ring-violet-400 shadow-xl shadow-violet-100 dark:shadow-violet-900/30 bg-white dark:bg-gray-800'
            : 'border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 bg-white/80 dark:bg-gray-800/80'
        } ${isPopular && !isSelected ? 'md:scale-[1.03]' : ''}`}
      >
        <div className={`h-1.5 bg-gradient-to-r ${meta.gradient}`} />
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-md`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>

          <div className="mt-3 mb-5">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {plan.price.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1.5">
              {plan.currency} / {meta.label}
            </span>
            {plan.duration === 365 && (
              <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">Save ~20% vs monthly</p>
            )}
          </div>

          <ul className="space-y-2.5 mb-6">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            onClick={(e) => {
              e.stopPropagation()
              onSelect(plan.planId)
            }}
            disabled={loading}
            className={`w-full rounded-xl h-11 font-semibold transition-all ${
              isSelected
                ? `bg-gradient-to-r ${meta.gradient} text-white shadow-md hover:shadow-lg`
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : isSelected ? (
              <span className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                Selected
              </span>
            ) : (
              'Select Plan'
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

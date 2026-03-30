'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Crown, Loader2, MessageSquare, ExternalLink } from 'lucide-react'

const PLAN_LABELS: Record<string, string> = {
  monthly: 'Monthly plan',
  yearly: 'Yearly plan',
  lifetime: 'Lifetime plan',
}

type Props = {
  /** Smaller card for parent dashboard */
  compact?: boolean
}

export default function SubscriptionBillingHelp({ compact }: Props) {
  const router = useRouter()
  const [state, setState] = useState<{
    loading: boolean
    error: boolean
    hasActiveSubscription: boolean
    planId?: string
    expiresAt?: string | null
  }>({ loading: true, error: false, hasActiveSubscription: false })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { getAuthToken } = await import('@/lib/simple-auth')
        const token = await getAuthToken()
        if (!token) {
          if (!cancelled) {
            setState({ loading: false, error: false, hasActiveSubscription: false })
          }
          return
        }
        const res = await fetch('/api/subscription/status', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed')
        const sub = data.subscription as { plan_id?: string; expires_at?: string | null } | null
        if (!cancelled) {
          setState({
            loading: false,
            error: false,
            hasActiveSubscription: !!data.hasActiveSubscription,
            planId: sub?.plan_id,
            expiresAt: sub?.expires_at ?? null,
          })
        }
      } catch {
        if (!cancelled) {
          setState({ loading: false, error: true, hasActiveSubscription: false })
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const goContact = () => router.push('/contact?topic=subscription')

  const planName = state.planId ? PLAN_LABELS[state.planId] || state.planId : null
  const expiresLine =
    state.expiresAt && state.planId !== 'lifetime'
      ? new Date(state.expiresAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
      : state.planId === 'lifetime'
        ? 'Does not expire'
        : null

  const statusBlock =
    state.loading ? (
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/70">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking subscription…
      </div>
    ) : state.error ? (
      <p className="text-sm text-amber-800 dark:text-amber-200/90">
        Could not load subscription status. You can still contact us about billing below.
      </p>
    ) : state.hasActiveSubscription ? (
      <ul className="text-sm text-gray-700 dark:text-white/80 space-y-1">
        <li>
          <span className="font-semibold text-emerald-700 dark:text-emerald-300">Premium active</span>
          {planName ? ` — ${planName}` : ''}
        </li>
        {expiresLine ? (
          <li>
            <span className="text-gray-600 dark:text-white/60">Access until:</span> {expiresLine}
          </li>
        ) : null}
      </ul>
    ) : (
      <p className="text-sm text-gray-700 dark:text-white/80">
        No active premium subscription on this account. You can upgrade from the dashboard when you are ready.
      </p>
    )

  const explain = (
    <p className="text-sm text-gray-600 dark:text-white/70 leading-relaxed">
      Payments are verified by our team. To <strong>cancel</strong>, stop renewal, or ask about a refund, use{' '}
      <strong>Contact support</strong> — we will update your account after we confirm your request.
    </p>
  )

  if (compact) {
    return (
      <Card className="mb-8 border-violet-200/80 bg-white/90 dark:bg-white/5 dark:border-violet-500/30 shadow-sm">
        <CardHeader className="pb-2">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-violet-600" />
            Subscription & billing
          </h2>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {statusBlock}
          {explain}
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto border-violet-300 text-violet-800 dark:text-violet-200 dark:border-violet-600"
            onClick={goContact}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact support
            <ExternalLink className="w-3.5 h-3.5 ml-2 opacity-70" />
          </Button>
          <p className="text-xs text-gray-500 dark:text-white/50">
            Full details also under Settings → Subscription & billing.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/70 backdrop-blur-xl border-violet-200/80 dark:bg-white/5 dark:border-violet-500/30 shadow-xl">
      <CardHeader>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Crown className="w-6 h-6 text-violet-600" />
          Subscription & billing
        </h2>
        <p className="text-gray-600 dark:text-white/70 text-sm">
          See your plan status and how to cancel or change your subscription.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-2xl border border-violet-100 dark:border-white/10 bg-gradient-to-br from-violet-50/80 to-white dark:from-violet-950/40 dark:to-white/5">
          {statusBlock}
        </div>
        {explain}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
            onClick={goContact}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact support (cancel / billing)
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/subscribe')}>
            View plans
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

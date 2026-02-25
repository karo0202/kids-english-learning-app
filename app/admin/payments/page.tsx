'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, RefreshCw, CheckCircle, ExternalLink, Loader2 } from 'lucide-react'
import { getUserSession } from '@/lib/simple-auth'

const ADMIN_EMAIL = 'karolate143@gmail.com'

interface PendingItem {
  id: string
  user_id: string
  transaction_id: string
  plan_id: string
  created_at: string
  metadata: {
    manualConfirmation?: {
      reference?: string
      proofUrl?: string
      contactPhone?: string
      notes?: string
    }
  } | null
}

export default function AdminPaymentsPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [secret, setSecret] = useState('')
  const [list, setList] = useState<PendingItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activatingId, setActivatingId] = useState<string | null>(null)

  useEffect(() => {
    const currentUser = getUserSession()
    if (!currentUser) {
      router.replace('/login')
      return
    }
    setUser(currentUser)
    setAuthChecked(true)
  }, [router])

  const headers = () => ({
    'Content-Type': 'application/json',
    'X-Admin-Secret': secret,
  })

  const loadPending = async () => {
    if (!secret.trim()) {
      setError('Enter your admin secret first.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/subscription/admin/pending', { headers: headers() })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to load')
        setList([])
        return
      }
      setList(data.list || [])
    } catch (e: any) {
      setError(e.message || 'Request failed')
      setList([])
    } finally {
      setLoading(false)
    }
  }

  const activate = async (transactionId: string) => {
    if (!secret.trim()) return
    setActivatingId(transactionId)
    setError(null)
    try {
      const res = await fetch('/api/subscription/admin/activate', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ transactionId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Activate failed')
        return
      }
      setList((prev) => prev.filter((r) => r.transaction_id !== transactionId))
    } catch (e: any) {
      setError(e.message || 'Request failed')
    } finally {
      setActivatingId(null)
    }
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (user && user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Shield className="w-6 h-6" />
              Access denied
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400">
              This page is only available to the account administrator.
            </p>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-8">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-8 h-8 text-emerald-600" />
            Pending payments
          </h1>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Admin access</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Use the same secret as in Vercel (SUBSCRIPTION_ADMIN_SECRET). It is not stored.
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="secret">Admin secret</Label>
              <Input
                id="secret"
                type="password"
                placeholder="Paste SUBSCRIPTION_ADMIN_SECRET"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="mt-1 font-mono"
              />
            </div>
            <Button onClick={loadPending} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Load pending
            </Button>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Pending manual payments</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Verify the proof (screenshot or reference), then click Activate to grant access.
            </p>
          </CardHeader>
          <CardContent>
            {list.length === 0 && !loading && (
              <p className="text-gray-500 dark:text-gray-400 py-8 text-center">
                No pending payments. Click &quot;Load pending&quot; after entering your admin secret.
              </p>
            )}
            {list.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Transaction ID</th>
                      <th className="text-left p-3">Plan</th>
                      <th className="text-left p-3">User ID</th>
                      <th className="text-left p-3">Reference</th>
                      <th className="text-left p-3">Proof</th>
                      <th className="text-left p-3">Contact</th>
                      <th className="text-left p-3 w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((row) => {
                      const proof = row.metadata?.manualConfirmation
                      return (
                        <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="p-3 whitespace-nowrap">
                            {new Date(row.created_at).toLocaleString()}
                          </td>
                          <td className="p-3 font-mono text-xs break-all max-w-[140px]">
                            {row.transaction_id}
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">{row.plan_id}</Badge>
                          </td>
                          <td className="p-3 font-mono text-xs">{row.user_id}</td>
                          <td className="p-3 text-gray-600 dark:text-gray-400">
                            {proof?.reference || '—'}
                          </td>
                          <td className="p-3">
                            {proof?.proofUrl ? (
                              <a
                                href={proof.proofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1"
                              >
                                View <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="p-3 text-gray-600 dark:text-gray-400">
                            {proof?.contactPhone || proof?.notes ? (
                              <span title={proof?.notes}>{proof?.contactPhone || '—'}</span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="p-3">
                            <Button
                              size="sm"
                              onClick={() => activate(row.transaction_id)}
                              disabled={activatingId === row.transaction_id}
                            >
                              {activatingId === row.transaction_id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Activate
                                </>
                              )}
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

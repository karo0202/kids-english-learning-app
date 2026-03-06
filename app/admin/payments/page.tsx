'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Shield, RefreshCw, CheckCircle, ExternalLink, Loader2, Link2 } from 'lucide-react'
import { getUserSession } from '@/lib/simple-auth'

const ADMIN_EMAIL = 'karolatef143@gmail.com'

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
  const [proofViewUrl, setProofViewUrl] = useState<string | null>(null)
  const [proofImageError, setProofImageError] = useState(false)
  const [proofDisplayUrl, setProofDisplayUrl] = useState<string | null>(null)
  const proofObjectUrlRef = useRef<string | null>(null)
  const [linkTransactionId, setLinkTransactionId] = useState('')
  const [linkUserId, setLinkUserId] = useState('')
  const [linkUserLoading, setLinkUserLoading] = useState(false)
  const [linkUserMessage, setLinkUserMessage] = useState<string | null>(null)
  const [checkEmail, setCheckEmail] = useState('')
  const [checkEmailLoading, setCheckEmailLoading] = useState(false)
  const [checkEmailResult, setCheckEmailResult] = useState<{ hasActive: boolean; transactionId?: string; userId?: string } | null>(null)

  // Convert data URLs to blob object URL so the image renders reliably (long data URLs can fail in img src)
  const proofViewUrlRef = useRef(proofViewUrl)
  proofViewUrlRef.current = proofViewUrl
  useEffect(() => {
    if (!proofViewUrl) {
      if (proofObjectUrlRef.current) {
        URL.revokeObjectURL(proofObjectUrlRef.current)
        proofObjectUrlRef.current = null
      }
      setProofDisplayUrl(null)
      return
    }
    if (proofViewUrl.startsWith('data:')) {
      const urlForThisEffect = proofViewUrl
      fetch(proofViewUrl)
        .then((res) => res.blob())
        .then((blob) => {
          if (proofViewUrlRef.current !== urlForThisEffect) return
          if (proofObjectUrlRef.current) URL.revokeObjectURL(proofObjectUrlRef.current)
          const objUrl = URL.createObjectURL(blob)
          proofObjectUrlRef.current = objUrl
          setProofDisplayUrl(objUrl)
          setProofImageError(false)
        })
        .catch(() => {
          // Fallback: try to render the original data URL directly
          if (proofViewUrlRef.current === urlForThisEffect) {
            setProofDisplayUrl(urlForThisEffect)
            setProofImageError(false)
          }
        })
    } else {
      setProofDisplayUrl(proofViewUrl)
    }
    return () => {
      if (proofObjectUrlRef.current) {
        URL.revokeObjectURL(proofObjectUrlRef.current)
        proofObjectUrlRef.current = null
      }
    }
  }, [proofViewUrl])

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

  const runCheckEmail = async () => {
    if (!secret.trim() || !checkEmail.trim()) {
      setCheckEmailResult(null)
      return
    }
    setCheckEmailResult(null)
    setCheckEmailLoading(true)
    try {
      const res = await fetch('/api/subscription/admin/check-email', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email: checkEmail.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCheckEmailResult({ hasActive: false })
        return
      }
      setCheckEmailResult({
        hasActive: !!data.hasActiveSubscription,
        transactionId: data.transactionId ?? undefined,
        userId: data.userId ?? undefined,
      })
      if (data.hasActiveSubscription && data.transactionId) {
        setLinkTransactionId(data.transactionId)
        // Leave Firebase UID for admin to paste (user's current UID, not the one stored on the row)
      }
    } catch {
      setCheckEmailResult({ hasActive: false })
    } finally {
      setCheckEmailLoading(false)
    }
  }

  const linkUser = async () => {
    if (!secret.trim() || !linkTransactionId.trim() || !linkUserId.trim()) {
      setLinkUserMessage('Enter admin secret, transaction ID, and Firebase UID.')
      return
    }
    setLinkUserMessage(null)
    setLinkUserLoading(true)
    try {
      const res = await fetch('/api/subscription/admin/link-user', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          transactionId: linkTransactionId.trim(),
          userId: linkUserId.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setLinkUserMessage(data.error || 'Link failed')
        return
      }
      setLinkUserMessage('Done. Ask the user to refresh the app.')
      setLinkTransactionId('')
      setLinkUserId('')
    } catch (e: unknown) {
      setLinkUserMessage(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setLinkUserLoading(false)
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

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              Check subscription by email
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter the user&apos;s email to see if they have an active subscription. If yes, transaction ID and user_id are filled below for &quot;Fix user access&quot;.
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="check-email">User email</Label>
              <Input
                id="check-email"
                type="email"
                placeholder="user@example.com"
                value={checkEmail}
                onChange={(e) => setCheckEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button onClick={runCheckEmail} disabled={checkEmailLoading}>
              {checkEmailLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Check
            </Button>
          </CardContent>
          {checkEmailResult && (
            <div className="px-6 pb-4 text-sm">
              {checkEmailResult.hasActive ? (
                <p className="text-green-600 dark:text-green-400">
                  Active subscription found. Transaction ID filled below. Paste the user&apos;s <strong>current Firebase UID</strong> and click Link user.
                </p>
              ) : (
                <p className="text-amber-600 dark:text-amber-400">
                  No active subscription found for this email (or user_email not set on the row).
                </p>
              )}
            </div>
          )}
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              Fix user access
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              If a user still can&apos;t access paid modules after activation, link their subscription to their Firebase UID. Use &quot;Check by email&quot; above or get transaction_id from Supabase.
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[180px]">
              <Label htmlFor="link-tx">Transaction ID</Label>
              <Input
                id="link-tx"
                placeholder="pay_1738xxxxx_abc"
                value={linkTransactionId}
                onChange={(e) => setLinkTransactionId(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div className="flex-1 min-w-[180px]">
              <Label htmlFor="link-uid">Firebase UID</Label>
              <Input
                id="link-uid"
                placeholder="V8iXAGR7gXXSK0bkiiqAZJwN0zq2"
                value={linkUserId}
                onChange={(e) => setLinkUserId(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <Button onClick={linkUser} disabled={linkUserLoading}>
              {linkUserLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
              Link user
            </Button>
          </CardContent>
          {linkUserMessage && (
            <div className="px-6 pb-4 text-sm text-gray-600 dark:text-gray-400">
              {linkUserMessage}
            </div>
          )}
        </Card>

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
                              <button
                                type="button"
                                onClick={() => {
                                  setProofViewUrl(proof.proofUrl!)
                                  setProofImageError(false)
                                }}
                                className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 hover:underline font-medium"
                              >
                                View <ExternalLink className="w-3 h-3" />
                              </button>
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

      <Dialog open={!!proofViewUrl} onOpenChange={(open) => !open && (setProofViewUrl(null), setProofImageError(false))}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Payment proof (screenshot)</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-[200px] overflow-auto flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {proofViewUrl && (
              proofImageError ? (
                <div className="text-center space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Image could not be displayed (e.g. file too large, invalid, or proof was submitted before we fixed storage).
                  </p>
                  <a
                    href={proofViewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download="payment-proof"
                    className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 underline font-medium"
                  >
                    Open / download original image <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ) : proofViewUrl.startsWith('data:') && !proofDisplayUrl ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Loading image…</span>
                </div>
              ) : (proofViewUrl.startsWith('data:') ? proofDisplayUrl : proofViewUrl) && (proofViewUrl.startsWith('data:') || /\.(jpe?g|png|gif|webp)(\?|$)/i.test(proofViewUrl)) ? (
                <img
                  src={proofViewUrl.startsWith('data:') ? proofDisplayUrl! : proofViewUrl}
                  alt="Payment proof"
                  className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded"
                  onError={() => setProofImageError(true)}
                />
              ) : (
                <a
                  href={proofViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 underline flex items-center gap-2"
                >
                  Open proof in new tab <ExternalLink className="w-4 h-4" />
                </a>
              )
            )}
          </div>
          <Button variant="outline" onClick={() => setProofViewUrl(null)} className="mt-2">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

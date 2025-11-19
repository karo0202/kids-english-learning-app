'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Subscription {
  _id: string
  userId: string
  planId: string
  status: string
  paymentMethod: string
  amount: number
  currency: string
  expiresAt: string
  createdAt: string
}

export default function AdminSubscriptionsPage() {
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchSubscriptions()
  }, [page])

  const fetchSubscriptions = async () => {
    try {
      const { getUserSession } = await import('@/lib/simple-auth')
      const user = getUserSession()
      const token = user?.token || localStorage.getItem('accessToken')
      const response = await fetch(`/api/admin/subscriptions?page=${page}&limit=50`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      const data = await response.json()
      if (data.success) {
        setSubscriptions(data.subscriptions)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'expired':
        return 'bg-gray-500'
      case 'cancelled':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Subscriptions Management
          </h1>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">User ID</th>
                    <th className="text-left p-4">Plan</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Payment Method</th>
                    <th className="text-left p-4">Amount</th>
                    <th className="text-left p-4">Expires At</th>
                    <th className="text-left p-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub._id} className="border-b">
                      <td className="p-4 font-mono text-sm">{sub.userId}</td>
                      <td className="p-4">{sub.planId}</td>
                      <td className="p-4">
                        <Badge className={getStatusColor(sub.status)}>
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="p-4">{sub.paymentMethod}</td>
                      <td className="p-4">
                        {sub.amount} {sub.currency}
                      </td>
                      <td className="p-4">
                        {new Date(sub.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="outline"
              >
                Previous
              </Button>
              <span className="text-gray-600 dark:text-gray-400">
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


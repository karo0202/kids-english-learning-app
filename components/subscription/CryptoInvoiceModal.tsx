'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Copy, ExternalLink } from 'lucide-react'
import { useState } from 'react'

interface CryptoInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  paymentUrl: string
  invoiceId: string
  amount: number
  currency: string
}

export default function CryptoInvoiceModal({
  isOpen,
  onClose,
  paymentUrl,
  invoiceId,
  amount,
  currency,
}: CryptoInvoiceModalProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crypto Payment Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Invoice ID</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono bg-white dark:bg-gray-900 p-2 rounded">
                {invoiceId}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(invoiceId)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Amount</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {amount} {currency}
            </p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => window.open(paymentUrl, '_blank')}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              size="lg"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Open Payment Page
            </Button>

            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Complete the payment on the provider's page. Your subscription will be activated automatically.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}


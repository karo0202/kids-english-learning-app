'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Copy, CheckCircle, Phone, Image } from 'lucide-react'

interface ManualInstructions {
  walletAddress?: string
  network?: string
  qrCodeUrl?: string
  phoneNumber?: string
  accountName?: string
  note?: string
  contactPhone?: string
}

interface ManualPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  method: 'crypto_manual' | 'fib_manual'
  instructions: ManualInstructions
  amount: number
  currency: string
  transactionId: string
  onConfirm: (payload: {
    transactionId: string
    reference?: string
    proofUrl?: string
    contactPhone?: string
    notes?: string
  }) => Promise<void>
  confirming: boolean
}

export default function ManualPaymentModal({
  isOpen,
  onClose,
  method,
  instructions,
  amount,
  currency,
  transactionId,
  onConfirm,
  confirming,
}: ManualPaymentModalProps) {
  const [reference, setReference] = useState('')
  const [proofUrl, setProofUrl] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (value?: string) => {
    if (!value || typeof navigator === 'undefined' || !navigator.clipboard) return
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async () => {
    await onConfirm({
      transactionId,
      reference: reference.trim() || undefined,
      proofUrl: proofUrl.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      notes: notes.trim() || undefined,
    })
  }

  const manualTitle = method === 'crypto_manual' ? 'Crypto Wallet Payment' : 'FIB Payment Instructions'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{manualTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Amount</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {amount} {currency}
              </p>
              <p className="text-xs text-gray-500 mt-1">Transaction ID: {transactionId}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
              {instructions.walletAddress && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Wallet Address</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono bg-white dark:bg-gray-900 p-2 rounded break-all">
                      {instructions.walletAddress}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(instructions.walletAddress)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  {instructions.network && (
                    <p className="text-xs text-gray-500 mt-1">Network: {instructions.network}</p>
                  )}
                </div>
              )}

              {instructions.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">Phone Number</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{instructions.phoneNumber}</p>
                  </div>
                </div>
              )}

              {instructions.accountName && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Account Name: <span className="font-semibold">{instructions.accountName}</span>
                </p>
              )}

              {instructions.note && (
                <p className="text-xs text-gray-500">{instructions.note}</p>
              )}
            </div>
          </div>

          {instructions.qrCodeUrl && (
            <div className="bg-white dark:bg-gray-900/60 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 text-center">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Scan this QR code to pay
              </p>
              <div className="flex flex-col items-center gap-3">
                <img
                  src={instructions.qrCodeUrl}
                  alt="Payment QR"
                  className="w-40 h-40 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Use your banking app to scan
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Already paid? Submit your reference so we can activate your subscription faster.
            </p>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={method === 'crypto_manual' ? 'Transaction hash / reference' : 'Receipt reference'}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="Link to payment screenshot (optional)"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="Your WhatsApp / phone number"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes for the admin (optional)"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <Button
              onClick={handleSubmit}
              disabled={confirming}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              {confirming ? 'Sending...' : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Submit Payment Proof
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>

          {instructions.contactPhone && (
            <p className="text-xs text-gray-500 text-center">
              Need help? Contact us on WhatsApp: {instructions.contactPhone}
            </p>
          )}

          {copied && (
            <p className="text-xs text-green-600 text-center">Copied to clipboard!</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Copy, CheckCircle, Phone, Image, QrCode, Sparkles, Shield, Clock, Upload } from 'lucide-react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'

interface ManualInstructions {
  walletAddress?: string
  network?: string
  qrCodeUrl?: string
  qrCodeText?: string
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
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [contactPhone, setContactPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [copied, setCopied] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const copyToClipboard = (value?: string) => {
    if (!value || typeof navigator === 'undefined' || !navigator.clipboard) return
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setSubmitError('Please select an image file (e.g. PNG, JPG)')
      return
    }
    setSubmitError('')
    setProofFile(file)
    const reader = new FileReader()
    reader.onload = () => setProofUrl(String(reader.result))
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    setSubmitError('')
    const hasReference = reference.trim().length > 0
    const hasProof = proofUrl.trim().length > 0
    if (method === 'fib_manual') {
      if (!hasReference && !hasProof) {
        setSubmitError('Please provide a receipt reference or attach your transaction screenshot.')
        return
      }
    } else {
      if (!hasReference) {
        setSubmitError('Please enter the transaction hash / reference.')
        return
      }
    }
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-gray-50 to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 border-2 border-purple-100 dark:border-purple-900/50 shadow-2xl">
        <DialogHeader className="relative pb-4 border-b border-purple-100 dark:border-purple-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {manualTitle}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Amount Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-purple-900/20 dark:via-gray-800 dark:to-indigo-900/20 p-6 rounded-2xl border-2 border-purple-200/50 dark:border-purple-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-transparent rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Amount</p>
                </div>
                <p className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  {amount} {currency}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-gray-800/60 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono">ID: {transactionId.substring(0, 20)}...</span>
                </div>
              </div>
            </motion.div>

            {/* Payment Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="relative bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-900/20 dark:via-gray-800 dark:to-teal-900/20 p-6 rounded-2xl border-2 border-emerald-200/50 dark:border-emerald-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-transparent rounded-full blur-2xl"></div>
              <div className="relative space-y-4">
                {instructions.walletAddress && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Wallet Address
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs font-mono bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 break-all shadow-sm">
                        {instructions.walletAddress}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(instructions.walletAddress)}
                        className="border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                      >
                        <Copy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </Button>
                    </div>
                    {instructions.network && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-md inline-block">
                        Network: {instructions.network}
                      </p>
                    )}
                  </div>
                )}

                {instructions.phoneNumber && (
                  <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-emerald-200 dark:border-emerald-700/50">
                    <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg shadow-md">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Phone Number</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{instructions.phoneNumber}</p>
                    </div>
                  </div>
                )}

                {instructions.accountName && (
                  <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-emerald-200 dark:border-emerald-700/50">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Account Name</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{instructions.accountName}</p>
                  </div>
                )}

                {instructions.note && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700/50">
                    <p className="text-xs text-amber-700 dark:text-amber-400">{instructions.note}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* QR Code Section - generate from text for reliable scanning, or show image */}
          {(instructions.qrCodeUrl || instructions.qrCodeText) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="relative bg-gradient-to-br from-white via-emerald-50/50 to-teal-50/50 dark:from-gray-800 dark:via-emerald-900/10 dark:to-teal-900/10 border-2 border-dashed border-emerald-300 dark:border-emerald-700/50 rounded-2xl p-8 text-center shadow-xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/20 to-teal-100/20 dark:from-emerald-900/10 dark:to-teal-900/10"></div>
              <div className="relative">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Scan this QR code to pay
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="relative p-5 bg-white rounded-2xl shadow-2xl border-4 border-emerald-200 dark:border-emerald-700/50">
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full shadow-lg animate-pulse"></div>
                    {instructions.qrCodeText ? (
                      <QRCodeSVG
                        value={instructions.qrCodeText}
                        size={300}
                        level="H"
                        bgColor="#ffffff"
                        fgColor="#000000"
                        marginSize={2}
                        className="rounded-lg"
                      />
                    ) : instructions.qrCodeUrl ? (
                      <img
                        src={instructions.qrCodeUrl}
                        alt="Payment QR"
                        className="w-[300px] h-[300px] min-w-[280px] min-h-[280px] object-contain rounded-xl bg-white"
                      />
                    ) : null}
                  </div>
                  {instructions.qrCodeText && (
                    <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-emerald-200 dark:border-emerald-700/50 shadow-md">
                      <p className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-widest">
                        {instructions.qrCodeText}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700">
                    <Image className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-medium">Use your banking app to scan</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {/* Payment Proof Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="relative bg-gradient-to-br from-white via-gray-50 to-purple-50/30 dark:from-gray-800 dark:via-gray-700 dark:to-purple-900/10 p-6 rounded-2xl border-2 border-purple-200/50 dark:border-purple-700/50 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-md">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <p className="text-base font-bold text-gray-800 dark:text-gray-200">
                Already paid? {method === 'fib_manual' ? 'Attach your transaction screenshot so we can activate your subscription faster.' : 'Submit your reference so we can activate your subscription faster.'}
              </p>
            </div>
            {submitError && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 mb-4">
                {submitError}
              </p>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {method === 'crypto_manual' ? 'Transaction hash / reference' : 'Receipt reference'}
                  {method === 'crypto_manual' ? <span className="text-red-500"> *</span> : <span className="text-gray-400 text-xs"> (optional for FIB)</span>}
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder={method === 'crypto_manual' ? 'Enter transaction hash' : 'Enter if you have a reference'}
                  className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:border-purple-500 transition-all shadow-sm hover:shadow-md"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {method === 'fib_manual' ? 'Transaction screenshot' : 'Link to payment screenshot'}
                  {method === 'fib_manual' ? <span className="text-red-500"> *</span> : <span className="text-gray-400 text-xs"> (optional)</span>}
                  <span className="block text-xs font-normal text-gray-500 dark:text-gray-400 mt-1">
                    {method === 'fib_manual' ? 'FIB doesn’t provide a receipt reference — attach a screenshot of your transaction.' : 'Paste a link or attach an image below.'}
                  </span>
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleProofFileChange}
                  className="hidden"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {proofFile ? proofFile.name : 'Attach screenshot image'}
                  </Button>
                  <input
                    type="text"
                    value={proofFile ? '' : proofUrl}
                    onChange={(e) => { setProofUrl(e.target.value); setProofFile(null) }}
                    placeholder="Or paste screenshot URL here"
                    className="flex-1 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:border-purple-500 transition-all shadow-sm hover:shadow-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Your WhatsApp / phone number
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Enter your contact number"
                  className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:border-purple-500 transition-all shadow-sm hover:shadow-md"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Any notes for the admin <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional information..."
                  className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:border-purple-500 transition-all shadow-sm hover:shadow-md resize-none"
                  rows={3}
                />
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4">
            <Button
              onClick={handleSubmit}
              disabled={confirming}
              className="flex-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {confirming ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Clock className="w-5 h-5" />
                  </motion.div>
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Submit Payment Proof
                </span>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              Close
            </Button>
          </div>

          {/* Help Text */}
          {instructions.contactPhone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/50"
            >
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <span className="font-semibold">Need help?</span> Contact us on WhatsApp: <span className="font-bold">{instructions.contactPhone}</span>
              </p>
            </motion.div>
          )}

          {/* Copy Success Message */}
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 z-50"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Copied to clipboard!</span>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


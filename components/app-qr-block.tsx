'use client'

import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useState } from 'react'
import { QrCode } from 'lucide-react'

/**
 * QR code that opens this app in the browser (install / PWA).
 * Optional: set NEXT_PUBLIC_APP_URL in Vercel (e.g. https://your-domain.com) so the code always points to production.
 * If unset, the code uses the site you’re currently visiting (works on preview URLs too).
 */
export default function AppQrBlock({ className }: { className?: string }) {
  const [url, setUrl] = useState('')

  useEffect(() => {
    const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '')
    if (fromEnv) {
      setUrl(fromEnv)
      return
    }
    setUrl(`${window.location.origin}/`)
  }, [])

  if (!url) {
    return (
      <div
        className={`flex h-[168px] w-[168px] shrink-0 items-center justify-center rounded-2xl border border-dashed border-slate-300/80 bg-white/50 text-xs text-slate-500 dark:border-white/20 dark:bg-white/5 dark:text-slate-400 ${className ?? ''}`}
        aria-hidden
      >
        …
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm dark:border-white/15 dark:bg-slate-900/80 ${className ?? ''}`}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#00aeef]">
        <QrCode className="h-4 w-4" aria-hidden />
        Scan to open
      </div>
      <div className="rounded-xl bg-white p-2 shadow-inner ring-1 ring-slate-200/80 dark:bg-white dark:ring-slate-600">
        <QRCodeSVG
          value={url}
          size={144}
          level="M"
          marginSize={2}
          fgColor="#003366"
          bgColor="#ffffff"
          title="QR code: open Kids English in the browser"
          aria-label={`QR code linking to ${url}`}
        />
      </div>
      <p className="max-w-[200px] break-all text-center text-[11px] leading-snug text-slate-500 dark:text-slate-400">
        {url}
      </p>
    </div>
  )
}

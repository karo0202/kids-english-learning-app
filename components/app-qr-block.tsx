'use client'

import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { QrCode } from 'lucide-react'
import { useAppShareUrl } from '@/lib/use-app-share-url'

const ICON_IN_QR = 36

/**
 * QR code that opens this app in the browser (install / PWA), with app icon in the center.
 * Optional: set NEXT_PUBLIC_APP_URL in Vercel for a stable production URL.
 */
export default function AppQrBlock({ className }: { className?: string }) {
  const { appUrl, iconSrc, faviconFallback, logoSvgFallback } = useAppShareUrl()
  const [logoSrc, setLogoSrc] = useState<string | 'none' | null>(null)

  useEffect(() => {
    if (!iconSrc || !faviconFallback || !logoSvgFallback) return
    const candidates = [iconSrc, faviconFallback, logoSvgFallback]
    let index = 0
    const tryNext = () => {
      if (index >= candidates.length) {
        setLogoSrc('none')
        return
      }
      const src = candidates[index++]
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => setLogoSrc(src)
      img.onerror = tryNext
      img.src = src
    }
    setLogoSrc(null)
    tryNext()
  }, [iconSrc, faviconFallback, logoSvgFallback])

  if (!appUrl) {
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
        {logoSrc !== null ? (
          <QRCodeSVG
            value={appUrl}
            size={144}
            level="H"
            marginSize={2}
            fgColor="#003366"
            bgColor="#ffffff"
            title="QR code: open Kids English in the browser"
            imageSettings={
              logoSrc !== 'none'
                ? {
                    src: logoSrc,
                    height: ICON_IN_QR,
                    width: ICON_IN_QR,
                    excavate: true,
                    crossOrigin: 'anonymous',
                  }
                : undefined
            }
          />
        ) : (
          <div className="flex h-[144px] w-[144px] items-center justify-center text-[10px] text-slate-400">
            …
          </div>
        )}
      </div>
      <p className="max-w-[200px] break-all text-center text-[11px] leading-snug text-slate-500 dark:text-slate-400">
        {appUrl}
      </p>
      <Link
        href="/share"
        className="text-[11px] font-semibold text-[#00aeef] hover:underline"
      >
        Bigger QR for social media →
      </Link>
    </div>
  )
}

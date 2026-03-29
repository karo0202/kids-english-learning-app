'use client'

import { QRCodeCanvas } from 'qrcode.react'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Copy, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Logo from '@/components/logo'
import { useAppShareUrl } from '@/lib/use-app-share-url'

const QR_SIZE = 520
const ICON_IN_QR = 88

export default function SocialShareQr() {
  const { appUrl, iconSrc, faviconFallback, logoSvgFallback } = useAppShareUrl()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)
  /** `null` = resolving, string = use in QR, `none` = QR without center image */
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

  const downloadPng = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'kids-english-qr.png'
    a.click()
  }, [])

  const copyLink = useCallback(async () => {
    if (!appUrl) return
    try {
      await navigator.clipboard.writeText(appUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }, [appUrl])

  if (!appUrl) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        Loading…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-[#e8f4fc] dark:from-slate-950 dark:to-[#003366]/40 px-4 py-10">
      <div className="mx-auto max-w-lg">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#003366] dark:text-[#00aeef] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-xl dark:border-slate-700 dark:bg-slate-900/90">
          <div className="mb-6 flex justify-center">
            <Logo size="lg" showText />
          </div>
          <h1 className="font-display text-center text-2xl font-semibold text-[#003366] dark:text-white">
            Share the app
          </h1>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            High-resolution QR with your app icon—save the image or copy the link for Instagram, WhatsApp, and more.
          </p>

          <div className="mt-8 flex justify-center rounded-2xl bg-white p-4 shadow-inner ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-700">
            {logoSrc !== null ? (
              <QRCodeCanvas
                ref={canvasRef}
                value={appUrl}
                size={QR_SIZE}
                level="H"
                marginSize={2}
                fgColor="#003366"
                bgColor="#ffffff"
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
              <div className="flex h-[200px] w-[200px] items-center justify-center text-sm text-slate-400">
                Preparing QR…
              </div>
            )}
          </div>

          <p className="mt-4 break-all text-center text-xs text-slate-500 dark:text-slate-400">{appUrl}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              className="rounded-xl bg-[#00aeef] text-white hover:bg-[#0090c5]"
              onClick={downloadPng}
              disabled={logoSrc === null}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PNG
            </Button>
            <Button type="button" variant="outline" className="rounded-xl" onClick={copyLink}>
              <Copy className="mr-2 h-4 w-4" />
              {copied ? 'Copied!' : 'Copy link'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

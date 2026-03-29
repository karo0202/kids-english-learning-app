'use client'

import { useEffect, useMemo, useState } from 'react'

function readEnvUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '') || ''
}

/** Canonical app origin for links and QR codes (no trailing slash). */
export function useAppShareUrl() {
  const [origin, setOrigin] = useState(() => readEnvUrl())

  useEffect(() => {
    const fromEnv = readEnvUrl()
    if (fromEnv) {
      setOrigin(fromEnv)
      return
    }
    setOrigin(window.location.origin)
  }, [])

  const appUrl = origin ? `${origin}/` : ''

  const iconSrc = useMemo(() => {
    if (!origin) return ''
    return `${origin}/icons/icon-192.png`
  }, [origin])

  const faviconFallback = useMemo(() => {
    if (!origin) return ''
    return `${origin}/favicon.png`
  }, [origin])

  const logoSvgFallback = useMemo(() => {
    if (!origin) return ''
    return `${origin}/logo.svg`
  }, [origin])

  return { origin, appUrl, iconSrc, faviconFallback, logoSvgFallback }
}

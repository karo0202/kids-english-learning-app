'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import en, { type TranslationKeys } from './translations/en'
import ku from './translations/ku'
import ar from './translations/ar'

export type Locale = 'en' | 'ku' | 'ar'
export type Direction = 'ltr' | 'rtl'

type Translations = Record<TranslationKeys, string>

const translationMap: Record<Locale, Translations> = {
  en: en as unknown as Translations,
  ku: ku as unknown as Translations,
  ar: ar as unknown as Translations,
}

export const LANGUAGES: { code: Locale; name: string; nativeName: string; dir: Direction; flag: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', flag: '🇬🇧' },
  { code: 'ku', name: 'Kurdish', nativeName: 'کوردی', dir: 'rtl', flag: '🟡' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', flag: '🇸🇦' },
]

interface LanguageContextType {
  locale: Locale
  dir: Direction
  setLocale: (locale: Locale) => void
  t: (key: TranslationKeys) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const STORAGE_KEY = 'app_language'

function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && (stored === 'en' || stored === 'ku' || stored === 'ar')) {
      return stored as Locale
    }
  } catch {}
  return 'en'
}

function getDirection(locale: Locale): Direction {
  return locale === 'en' ? 'ltr' : 'rtl'
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setLocaleState(getStoredLocale())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const dir = getDirection(locale)
    document.documentElement.lang = locale
    document.documentElement.dir = dir

    if (dir === 'rtl') {
      document.documentElement.classList.add('rtl')
    } else {
      document.documentElement.classList.remove('rtl')
    }
  }, [locale, mounted])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    try {
      localStorage.setItem(STORAGE_KEY, newLocale)
    } catch {}
  }, [])

  const t = useCallback((key: TranslationKeys): string => {
    return translationMap[locale]?.[key] ?? translationMap.en[key] ?? key
  }, [locale])

  const dir = getDirection(locale)

  return (
    <LanguageContext.Provider value={{ locale, dir, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export function useTranslation() {
  const { t, locale, dir } = useLanguage()
  return { t, locale, dir }
}

export { type TranslationKeys }

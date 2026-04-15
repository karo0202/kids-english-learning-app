'use client'

import { useLanguage, LANGUAGES, type Locale } from '@/lib/i18n'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LanguageSwitcherProps {
  variant?: 'full' | 'compact' | 'icon-only'
  className?: string
}

export default function LanguageSwitcher({ variant = 'full', className = '' }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLanguage()

  if (variant === 'icon-only') {
    const currentIdx = LANGUAGES.findIndex(l => l.code === locale)
    const nextLocale = LANGUAGES[(currentIdx + 1) % LANGUAGES.length]
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={() => setLocale(nextLocale.code)}
        className={`rounded-xl ${className}`}
        title={`Switch to ${nextLocale.nativeName}`}
      >
        <Globe className="w-4 h-4" />
      </Button>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              locale === lang.code
                ? 'bg-violet-600 text-white shadow-md'
                : 'bg-white/80 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/20 border border-slate-200/60 dark:border-white/15'
            }`}
          >
            {lang.nativeName}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={`p-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-gradient-to-br from-white to-slate-50 dark:from-white/5 dark:to-white/5 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Globe className="w-6 h-6 text-violet-500" />
        <div>
          <h3 className="font-bold text-gray-800 dark:text-white">{t('language')}</h3>
          <p className="text-sm text-gray-600 dark:text-white/70">{t('languageDesc')}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
              locale === lang.code
                ? 'bg-violet-600 text-white shadow-lg scale-[1.02]'
                : 'bg-white dark:bg-white/10 text-gray-700 dark:text-slate-200 hover:bg-violet-50 dark:hover:bg-white/20 border border-gray-200 dark:border-white/15'
            }`}
          >
            <span className="text-2xl">{lang.flag}</span>
            <span className="text-sm font-bold">{lang.nativeName}</span>
            <span className={`text-xs ${locale === lang.code ? 'text-white/80' : 'text-gray-500 dark:text-slate-400'}`}>
              {lang.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

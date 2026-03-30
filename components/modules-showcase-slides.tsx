'use client'

import { motion } from 'framer-motion'
import { ModuleContentPreview } from '@/components/module-content-preview'
import { WELCOME_MODULES } from '@/lib/welcome-modules'
import { cn } from '@/lib/utils'

export default function ModulesShowcaseSlides() {
  return (
    <motion.section
      className="relative mb-20 max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-4"
      id="what-we-offer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.35, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="what-we-offer-heading"
    >
      <div className="relative mx-auto mb-8 max-w-2xl rounded-3xl border border-slate-200/90 bg-white/95 px-6 py-5 text-center shadow-[0_12px_40px_-16px_rgba(0,51,102,0.12)] backdrop-blur-sm dark:border-slate-600/80 dark:bg-slate-900/95 dark:shadow-black/25 md:mb-10 md:px-8 md:py-6">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0090c5] dark:text-[#5fd4ff] md:text-xs">
          Curriculum
        </p>
        <h2
          id="what-we-offer-heading"
          className="font-display text-2xl font-semibold tracking-tight text-[#00264d] dark:text-white sm:text-3xl md:text-4xl"
        >
          Learning modules
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200 md:text-base">
          Every subject in one glance—each card shows what kids do inside the app.
        </p>
      </div>

      <div className="rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-700/80 shadow-[0_24px_64px_-20px_rgba(0,51,102,0.14),0_8px_24px_-12px_rgba(0,0,0,0.06)] dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.45)] p-4 sm:p-6 md:p-8">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6"
          role="list"
          aria-label="Learning modules"
        >
          {WELCOME_MODULES.map((mod, index) => {
            const Icon = mod.Icon
            return (
              <motion.article
                key={mod.title}
                role="listitem"
                className={cn(
                  'group relative flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-[#f6f8f9] dark:bg-slate-950/80 overflow-hidden',
                  'shadow-sm hover:shadow-[0_16px_40px_-20px_rgba(0,51,102,0.2)] dark:hover:shadow-black/30 transition-shadow duration-300'
                )}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 1.45 + Math.min(index, 8) * 0.05,
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-60 dark:opacity-40 bg-gradient-to-b from-[#00aeef]/10 to-transparent"
                  aria-hidden
                />
                <div className="relative z-[1] flex flex-col flex-1 p-4 sm:p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00aeef] text-white shadow-md shadow-[#00aeef]/20"
                      aria-hidden
                    >
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00aeef] mb-1">
                        Learning module
                      </p>
                      <h3 className="font-display text-lg sm:text-xl font-semibold leading-snug text-[#0a2540] dark:text-white">
                        {mod.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 mb-4 flex-1">
                    {mod.description}
                  </p>
                  <div className="mt-auto flex justify-center pt-1 pb-1">
                    <div className="origin-top scale-[0.82] sm:scale-[0.88] w-full max-w-[200px] sm:max-w-[220px] mx-auto">
                      <ModuleContentPreview
                        previewKey={mod.previewKey}
                        gradient={mod.gradient}
                        screenshotSrc={mod.screenshotSrc}
                        screenshotAlt={`${mod.title} — screen from Kids English app`}
                        priority={index < 2}
                        className="max-w-[220px] sm:max-w-[240px]"
                      />
                    </div>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}

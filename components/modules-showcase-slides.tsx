'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModuleContentPreview } from '@/components/module-content-preview'
import { WELCOME_MODULES } from '@/lib/welcome-modules'
import { cn } from '@/lib/utils'

const AUTOPLAY_MS = 6000

export default function ModulesShowcaseSlides() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
  })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [pauseAuto, setPauseAuto] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const onChange = () => setPrefersReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('reInit', onSelect)
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('reInit', onSelect)
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  useEffect(() => {
    if (!emblaApi || prefersReducedMotion || pauseAuto) return
    const id = window.setInterval(() => emblaApi.scrollNext(), AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [emblaApi, prefersReducedMotion, pauseAuto])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi])

  return (
    <motion.section
      className="relative mb-20 max-w-6xl mx-auto px-3 sm:px-4"
      id="what-we-offer"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.35, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="what-we-offer-heading"
    >
      {/* Soft spotlight behind the showcase */}
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 w-[min(100%,56rem)] h-[28rem] -mt-8 rounded-full bg-gradient-to-b from-[#00aeef]/12 via-violet-500/8 to-transparent blur-3xl dark:from-[#00aeef]/20 dark:via-violet-500/12 opacity-90"
        aria-hidden
      />

      <div className="relative text-center mb-10 md:mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-white/15 bg-white/70 dark:bg-white/5 backdrop-blur-md px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-white/70 mb-5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#00aeef]" strokeWidth={2} aria-hidden />
          Inside the experience
        </div>
        <h2
          id="what-we-offer-heading"
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-800 dark:from-white dark:via-white dark:to-slate-200 bg-clip-text text-transparent"
        >
          Crafted for curious young minds
        </h2>
        <p className="text-slate-600 dark:text-white/65 text-base md:text-lg max-w-xl mx-auto leading-relaxed font-medium">
          Peek inside each module—real app screens when available, with a polished preview as backup.
        </p>
        <div
          className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-[#00aeef]/60 to-transparent"
          aria-hidden
        />
      </div>

      <div
        className="relative rounded-[1.75rem] md:rounded-[2rem] p-[1px] bg-gradient-to-br from-white/90 via-white/40 to-slate-300/50 dark:from-white/25 dark:via-white/10 dark:to-slate-600/30 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.18),0_0_0_1px_rgba(255,255,255,0.08)_inset] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)]"
        onMouseEnter={() => setPauseAuto(true)}
        onMouseLeave={() => setPauseAuto(false)}
      >
        <div className="rounded-[1.7rem] md:rounded-[1.95rem] bg-white/80 dark:bg-[#0a1628]/85 backdrop-blur-2xl border border-white/60 dark:border-white/[0.08] px-3 py-4 sm:px-5 sm:py-5 md:px-8 md:py-7">
          <div className="flex items-center justify-between gap-3 mb-4 px-1">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              Module tour
            </span>
            <span className="tabular-nums text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-tight">
              {String(selectedIndex + 1).padStart(2, '0')} / {String(WELCOME_MODULES.length).padStart(2, '0')}
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl md:rounded-3xl ring-1 ring-slate-200/80 dark:ring-white/[0.06]" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {WELCOME_MODULES.map((mod, index) => {
                const Icon = mod.Icon
                return (
                  <div
                    key={mod.title}
                    className="min-w-0 flex-[0_0_100%] pl-0"
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${index + 1} of ${WELCOME_MODULES.length}`}
                    aria-hidden={selectedIndex !== index}
                  >
                    <div className="mx-0 sm:mx-1 md:mx-2">
                      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl">
                        <div
                          className={cn(
                            'absolute inset-0 opacity-[0.14] dark:opacity-[0.22] bg-gradient-to-br pointer-events-none',
                            mod.gradient
                          )}
                          aria-hidden
                        />
                        <div className="relative rounded-2xl md:rounded-3xl border border-white/70 dark:border-white/[0.09] bg-white/[0.97] dark:bg-slate-950/80 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] px-5 py-7 md:px-10 md:py-9 flex flex-col md:flex-row md:items-center gap-8 md:gap-10">
                          <div className="min-w-0 flex-1 space-y-4 text-center md:text-left order-2 md:order-1">
                            <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-5">
                              <div
                                className={cn(
                                  'shrink-0 w-[4.25rem] h-[4.25rem] md:w-[4.75rem] md:h-[4.75rem] rounded-2xl flex items-center justify-center mx-auto md:mx-0',
                                  'bg-gradient-to-br text-white shadow-lg ring-2 ring-white/30 dark:ring-white/10',
                                  mod.gradient
                                )}
                                aria-hidden
                              >
                                <Icon className="w-[1.65rem] h-[1.65rem] md:w-9 md:h-9" strokeWidth={1.85} />
                              </div>
                              <div className="min-w-0 space-y-1">
                                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                                  Learning module
                                </p>
                                <h3 className="text-2xl md:text-3xl lg:text-[2rem] font-bold tracking-tight text-slate-900 dark:text-white">
                                  {mod.title}
                                </h3>
                              </div>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300/95 text-base md:text-[1.05rem] leading-relaxed max-w-prose mx-auto md:mx-0 font-medium">
                              {mod.description}
                            </p>
                          </div>
                          <div className="order-1 md:order-2 shrink-0 flex justify-center md:justify-end w-full md:w-auto md:pl-2">
                            <div className="relative">
                              <div
                                className={cn(
                                  'absolute -inset-3 rounded-[2rem] opacity-25 blur-2xl bg-gradient-to-br pointer-events-none',
                                  mod.gradient
                                )}
                                aria-hidden
                              />
                              <ModuleContentPreview
                                previewKey={mod.previewKey}
                                gradient={mod.gradient}
                                screenshotSrc={mod.screenshotSrc}
                                screenshotAlt={`${mod.title} — screen from Kids English app`}
                                priority={index === 0}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6 md:mt-8 flex-wrap px-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full h-12 w-12 shrink-0 border-slate-200/90 dark:border-white/12 bg-white/90 dark:bg-white/[0.06] text-slate-700 dark:text-white shadow-md shadow-slate-200/40 dark:shadow-none hover:bg-white dark:hover:bg-white/10 hover:border-[#00aeef]/40 hover:text-[#003366] dark:hover:text-white transition-all duration-300"
              onClick={scrollPrev}
              aria-label="Previous module"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.25} />
            </Button>
            <div
              className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-[min(100%,18rem)] sm:max-w-[22rem] md:max-w-none"
              aria-label="Choose module slide"
            >
              {WELCOME_MODULES.map((mod, i) => (
                <button
                  key={mod.title}
                  type="button"
                  aria-current={selectedIndex === i ? 'true' : undefined}
                  aria-label={`Show ${mod.title}`}
                  className={cn(
                    'h-2 rounded-full transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00aeef] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
                    selectedIndex === i
                      ? 'w-9 bg-gradient-to-r from-[#00aeef] to-cyan-500 shadow-[0_0_12px_rgba(0,174,239,0.45)]'
                      : 'w-2 bg-slate-300/70 dark:bg-white/[0.2] hover:bg-slate-400 dark:hover:bg-white/35'
                  )}
                  onClick={() => scrollTo(i)}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full h-12 w-12 shrink-0 border-slate-200/90 dark:border-white/12 bg-white/90 dark:bg-white/[0.06] text-slate-700 dark:text-white shadow-md shadow-slate-200/40 dark:shadow-none hover:bg-white dark:hover:bg-white/10 hover:border-[#00aeef]/40 hover:text-[#003366] dark:hover:text-white transition-all duration-300"
              onClick={scrollNext}
              aria-label="Next module"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2.25} />
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

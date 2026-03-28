'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModuleContentPreview } from '@/components/module-content-preview'
import { WELCOME_MODULES } from '@/lib/welcome-modules'
import { cn } from '@/lib/utils'

const AUTOPLAY_MS = 6500

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

  const moduleChipRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const el = moduleChipRefs.current[selectedIndex]
    if (!el) return
    el.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [selectedIndex, prefersReducedMotion])

  return (
    <motion.section
      className="relative mb-20 max-w-5xl mx-auto px-3 sm:px-4"
      id="what-we-offer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.35, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="what-we-offer-heading"
    >
      <div className="relative text-center mb-8 md:mb-10">
        <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.28em] text-[#00aeef] mb-2">
          Curriculum
        </p>
        <h2
          id="what-we-offer-heading"
          className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-[#003366] dark:text-white tracking-tight"
        >
          Learning modules
        </h2>
        <p className="mt-2 text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Explore each subject—swipe or choose a module in the bar below.
        </p>
      </div>

      <div
        className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/80 shadow-[0_24px_64px_-20px_rgba(0,51,102,0.18),0_8px_24px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.45)]"
        onMouseEnter={() => setPauseAuto(true)}
        onMouseLeave={() => setPauseAuto(false)}
      >
        {/* Featured module (hero) */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {WELCOME_MODULES.map((mod, index) => {
              const Icon = mod.Icon
              return (
                <div
                  key={mod.title}
                  className="min-w-0 flex-[0_0_100%]"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${WELCOME_MODULES.length}`}
                  aria-hidden={selectedIndex !== index}
                >
                  <div className="relative min-h-[300px] md:min-h-[340px] bg-[#f6f8f9] dark:bg-slate-950">
                    <div
                      className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-[min(78%,420px)] h-[115%] opacity-90 dark:opacity-50"
                      style={{
                        background:
                          'radial-gradient(ellipse 65% 60% at 70% 45%, rgba(0, 174, 239, 0.22), transparent 72%)',
                      }}
                      aria-hidden
                    />
                    <div className="relative z-[1] flex flex-col md:flex-row md:items-center gap-8 md:gap-10 px-6 py-8 md:px-12 md:py-10 lg:px-14">
                      <div className="flex-1 min-w-0 text-center md:text-left space-y-4 md:space-y-5">
                        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-5">
                          <div
                            className="mx-auto md:mx-0 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#00aeef] text-white shadow-md shadow-[#00aeef]/25 ring-4 ring-white/80 dark:ring-slate-900/50"
                            aria-hidden
                          >
                            <Icon className="h-7 w-7" strokeWidth={2} />
                          </div>
                          <div className="min-w-0 space-y-2 md:space-y-3">
                            <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.24em] text-[#00aeef]">
                              Learning module
                            </p>
                            <h3 className="font-display text-[1.65rem] sm:text-3xl md:text-4xl lg:text-[2.35rem] font-semibold leading-[1.15] text-[#0a2540] dark:text-white">
                              {mod.title}
                            </h3>
                          </div>
                        </div>
                        <p className="text-[0.95rem] md:text-base leading-relaxed text-slate-500 dark:text-slate-400 max-w-xl mx-auto md:mx-0 font-normal">
                          {mod.description}
                        </p>
                      </div>
                      <div className="shrink-0 flex justify-center md:justify-end md:pl-4">
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
              )
            })}
          </div>
        </div>

        {/* Bottom carousel bar */}
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-100/95 dark:bg-slate-800/95 border-t border-slate-200/80 dark:border-slate-700/80 px-2 sm:px-3 py-3 md:py-3.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-full border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-[#003366] dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            onClick={scrollPrev}
            aria-label="Previous module"
          >
            <ChevronLeft className="h-4 w-4 sm:h-[1.15rem] sm:w-[1.15rem]" strokeWidth={2.5} />
          </Button>

          <div
            className="min-w-0 flex-1 flex gap-2 sm:gap-3 overflow-x-auto overflow-y-hidden py-0.5 scroll-smooth touch-pan-x [scrollbar-width:thin]"
            role="tablist"
            aria-label="All learning modules"
          >
            {WELCOME_MODULES.map((mod, i) => {
              const Icon = mod.Icon
              const active = selectedIndex === i
              return (
                <button
                  key={mod.title}
                  ref={(el) => {
                    moduleChipRefs.current[i] = el
                  }}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Show ${mod.title}`}
                  className={cn(
                    'flex shrink-0 flex-col items-center gap-1.5 rounded-xl px-2 py-2 sm:px-2.5 sm:py-2.5 w-[4.85rem] sm:w-[5.5rem] transition-all duration-300 ease-out',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00aeef] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100 dark:focus-visible:ring-offset-slate-800',
                    active
                      ? 'bg-white dark:bg-slate-900 shadow-[0_8px_24px_-6px_rgba(0,51,102,0.2)] dark:shadow-black/40 border border-slate-200/70 dark:border-slate-600 scale-[1.02]'
                      : 'bg-transparent border border-transparent hover:bg-white/60 dark:hover:bg-slate-700/40'
                  )}
                  onClick={() => scrollTo(i)}
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-colors',
                      active
                        ? 'bg-[#00aeef] text-white shadow-inner'
                        : 'bg-slate-200/95 dark:bg-slate-600/60 text-slate-400 dark:text-slate-500'
                    )}
                  >
                    <Icon className="h-[1.05rem] w-[1.05rem] sm:h-5 sm:w-5" strokeWidth={2.2} />
                  </div>
                  <span
                    className={cn(
                      'text-[9px] sm:text-[10px] text-center font-semibold leading-[1.2] line-clamp-2 min-h-[2.35em] px-0.5',
                      active ? 'text-[#003366] dark:text-white' : 'text-slate-400 dark:text-slate-500'
                    )}
                  >
                    {mod.title}
                  </span>
                </button>
              )
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-full border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-[#003366] dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            onClick={scrollNext}
            aria-label="Next module"
          >
            <ChevronRight className="h-4 w-4 sm:h-[1.15rem] sm:w-[1.15rem]" strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </motion.section>
  )
}

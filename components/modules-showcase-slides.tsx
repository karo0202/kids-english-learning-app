'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModuleContentPreview } from '@/components/module-content-preview'
import { WELCOME_MODULES } from '@/lib/welcome-modules'
import { cn } from '@/lib/utils'

const AUTOPLAY_MS = 5500

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
      className="mb-16 max-w-5xl mx-auto px-1 sm:px-0"
      id="what-we-offer"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.35, duration: 0.5 }}
      aria-labelledby="what-we-offer-heading"
    >
      <div className="text-center mb-8">
        <h2
          id="what-we-offer-heading"
          className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-2 drop-shadow-sm"
        >
          What we offer for your kids
        </h2>
        <p className="text-slate-600 dark:text-white/75 text-base md:text-lg max-w-2xl mx-auto">
          Real screenshots from the app (plus a simple preview if an image is still being added).
        </p>
      </div>

      <div
        className="relative rounded-[2rem] border border-white/70 dark:border-white/15 bg-white/75 dark:bg-white/10 backdrop-blur-md shadow-lg shadow-indigo-500/10 dark:shadow-none p-4 md:p-6"
        onMouseEnter={() => setPauseAuto(true)}
        onMouseLeave={() => setPauseAuto(false)}
      >
        <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
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
                  <div className="mx-1 md:mx-4">
                    <div
                      className={cn(
                        'relative overflow-hidden rounded-2xl border border-white/50 dark:border-white/10',
                        'bg-gradient-to-br',
                        mod.gradient,
                        'p-1'
                      )}
                    >
                      <div className="rounded-[0.9rem] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-5 py-6 md:px-8 md:py-8 flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
                        <div className="min-w-0 flex-1 space-y-3 text-center md:text-left order-2 md:order-1">
                          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                            <div
                              className={cn(
                                'shrink-0 w-16 h-16 md:w-[4.5rem] md:h-[4.5rem] rounded-2xl flex items-center justify-center mx-auto md:mx-0',
                                'bg-gradient-to-br shadow-lg text-white',
                                mod.gradient
                              )}
                              aria-hidden
                            >
                              <Icon className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.75} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Learning module
                              </p>
                              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                                {mod.title}
                              </h3>
                            </div>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed">
                            {mod.description}
                          </p>
                        </div>
                        <div className="order-1 md:order-2 shrink-0 flex justify-center md:justify-end w-full md:w-auto">
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
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full h-11 w-11 border-slate-200 dark:border-white/20 bg-white/90 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20"
            onClick={scrollPrev}
            aria-label="Previous module"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-1.5 px-2" aria-label="Choose module slide">
            {WELCOME_MODULES.map((mod, i) => (
              <button
                key={mod.title}
                type="button"
                aria-current={selectedIndex === i ? 'true' : undefined}
                aria-label={`Show ${mod.title}`}
                className={cn(
                  'h-2.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kids3-cyan focus-visible:ring-offset-2',
                  selectedIndex === i
                    ? 'w-8 bg-kids3-cyan'
                    : 'w-2.5 bg-slate-300/80 dark:bg-white/30 hover:bg-slate-400 dark:hover:bg-white/50'
                )}
                onClick={() => scrollTo(i)}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full h-11 w-11 border-slate-200 dark:border-white/20 bg-white/90 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20"
            onClick={scrollNext}
            aria-label="Next module"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </motion.section>
  )
}

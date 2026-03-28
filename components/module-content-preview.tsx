'use client'

import Image from 'next/image'
import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { ModulePreviewKey } from '@/lib/welcome-modules'

type Props = {
  previewKey: ModulePreviewKey
  screenshotSrc: string
  screenshotAlt: string
  /** Tailwind gradient utility segment e.g. `from-blue-400 to-blue-600` */
  gradient: string
  className?: string
  /** First carousel slide only — speeds up LCP */
  priority?: boolean
}

function PhoneChrome({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('relative mx-auto w-full max-w-[270px] sm:max-w-[288px] md:max-w-[300px]', className)} aria-hidden>
      <div
        className={cn(
          'relative rounded-[2rem] p-[3px] bg-gradient-to-b from-slate-500 via-slate-800 to-slate-950',
          'shadow-[0_28px_56px_-12px_rgba(15,23,42,0.45),0_12px_24px_-8px_rgba(0,174,239,0.12),inset_0_1px_0_rgba(255,255,255,0.15)]',
          'dark:shadow-[0_28px_56px_-8px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.12)]'
        )}
      >
        <div className="relative rounded-[1.85rem] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-[6px]">
          <div className="absolute top-[7px] left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
            <span className="h-[10px] w-[72px] rounded-full bg-black/90 shadow-[inset_0_1px_2px_rgba(255,255,255,0.12)] ring-1 ring-white/10" />
          </div>
          <div
            className={cn(
              'relative min-h-[198px] md:min-h-[218px] pt-9 pb-3 px-2 flex items-center justify-center rounded-[1.55rem]',
              'bg-gradient-to-b from-slate-200/95 via-slate-100 to-slate-200/90',
              'dark:from-slate-800 dark:via-slate-800 dark:to-slate-900'
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Shows a real PNG from `public/images/module-previews/` when present.
 * If the file is missing or fails to load, falls back to the illustrated preview.
 */
export function ModuleContentPreview({
  previewKey,
  screenshotSrc,
  screenshotAlt,
  gradient,
  className,
  priority,
}: Props) {
  const [useFallback, setUseFallback] = useState(false)

  if (useFallback) {
    return (
      <PhoneChrome className={className}>
        <div className="w-full rounded-[1.35rem] bg-white dark:bg-slate-950/95 shadow-[inset_0_2px_8px_rgba(15,23,42,0.06)] dark:shadow-[inset_0_2px_12px_rgba(0,0,0,0.4)] border border-white/80 dark:border-white/[0.07] p-3 min-h-[168px] flex items-center justify-center">
          <IllustrativeModuleScene previewKey={previewKey} gradient={gradient} />
        </div>
      </PhoneChrome>
    )
  }

  return (
    <PhoneChrome className={className}>
      <div className="relative w-full aspect-[9/19.5] rounded-[1.35rem] overflow-hidden bg-slate-200/90 dark:bg-slate-950 shadow-[inset_0_2px_12px_rgba(15,23,42,0.08)] dark:shadow-[inset_0_2px_16px_rgba(0,0,0,0.5)] ring-1 ring-black/5 dark:ring-white/10">
        <Image
          src={screenshotSrc}
          alt={screenshotAlt}
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 85vw, 300px"
          priority={priority}
          onError={() => setUseFallback(true)}
        />
      </div>
    </PhoneChrome>
  )
}

function IllustrativeModuleScene({ previewKey, gradient }: { previewKey: ModulePreviewKey; gradient: string }) {
  const accent = cn('bg-gradient-to-br', gradient)

  switch (previewKey) {
    case 'speaking':
      return (
        <div className="w-full space-y-3 text-center">
          <div className="flex items-end justify-center gap-1 h-12">
            {[6, 11, 5, 14, 8, 16, 9].map((px, i) => (
              <span
                key={i}
                className={cn('w-1.5 rounded-full opacity-90', accent)}
                style={{ height: `${px * 2}px` }}
              />
            ))}
          </div>
          <div
            className={cn(
              'inline-flex items-center justify-center w-14 h-14 rounded-2xl text-white shadow-md mx-auto',
              accent
            )}
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          <div className="rounded-2xl bg-sky-50 dark:bg-sky-950/40 px-3 py-2 text-sm font-semibold text-sky-800 dark:text-sky-200 border border-sky-100 dark:border-sky-900">
            “Hello!” 🌟
          </div>
        </div>
      )

    case 'writing':
      return (
        <div className="w-full space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 text-center">Trace the letter</p>
          <div className="flex justify-center">
            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-teal-600">
              Aa
            </span>
          </div>
          <svg className="w-full h-8 text-emerald-400/70" viewBox="0 0 120 24" fill="none">
            <path
              d="M8 16 Q30 4 52 16 T96 16"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
          </svg>
          <div className="flex justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="h-2 w-2 rounded-full bg-lime-400" />
            <span className="h-2 w-2 rounded-full bg-teal-400" />
          </div>
        </div>
      )

    case 'reading':
      return (
        <div className="w-full flex gap-2 items-stretch">
          <div className="flex-1 rounded-xl bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-950/50 dark:to-pink-950/30 p-2 border border-pink-200/60 dark:border-pink-900/40">
            <div className="h-2 w-8 rounded bg-pink-300/80 mb-2" />
            <div className="space-y-1.5">
              {[0.9, 0.75, 0.85, 0.6].map((w, i) => (
                <div key={i} className="h-1.5 rounded-full bg-pink-200/90 dark:bg-pink-900/50" style={{ width: `${w * 100}%` }} />
              ))}
            </div>
          </div>
          <div className="w-10 rounded-lg bg-gradient-to-b from-amber-200 to-amber-400 dark:from-amber-800 dark:to-amber-900 shadow-sm border border-amber-300/50" />
        </div>
      )

    case 'games':
      return (
        <div className="w-full grid grid-cols-2 gap-2 p-1">
          {[
            { l: 'A', c: 'from-violet-400 to-purple-500' },
            { l: 'B', c: 'from-fuchsia-400 to-pink-500' },
            { l: 'C', c: 'from-cyan-400 to-blue-500' },
            { l: 'D', c: 'from-amber-400 to-orange-500' },
          ].map((cell) => (
            <div
              key={cell.l}
              className={cn(
                'aspect-square rounded-xl flex items-center justify-center text-2xl font-black text-white shadow-md',
                'bg-gradient-to-br',
                cell.c
              )}
            >
              {cell.l}
            </div>
          ))}
        </div>
      )

    case 'grammar':
      return (
        <div className="w-full text-center space-y-3 px-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">Tap the noun</p>
          <p className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 leading-snug">
            The{' '}
            <span className={cn('px-2 py-0.5 rounded-lg text-white shadow-sm', accent)}>cat</span> sits.
          </p>
          <div className="flex justify-center gap-2">
            {['✓', '○', '○'].map((m, i) => (
              <span
                key={i}
                className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-sm flex items-center justify-center font-bold border border-indigo-200/60 dark:border-indigo-800"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      )

    case 'puzzles':
      return (
        <div className="w-full grid grid-cols-4 gap-1 p-1 max-w-[200px] mx-auto">
          {['C', 'A', 'T', '', 'D', 'O', 'G', '', '', '', '', ''].map((ch, i) => (
            <div
              key={i}
              className={cn(
                'aspect-square rounded-md flex items-center justify-center text-xs font-bold border-2',
                ch
                  ? cn('text-white border-transparent shadow-sm', accent)
                  : 'bg-slate-100 dark:bg-slate-800 border-dashed border-slate-300 dark:border-slate-600 text-transparent'
              )}
            >
              {ch}
            </div>
          ))}
        </div>
      )

    case 'coloring':
      return (
        <div className="w-full flex flex-col items-center gap-2">
          <div className="flex gap-1.5">
            {['bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'].map((c, i) => (
              <span key={i} className={cn('w-5 h-5 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200', c)} />
            ))}
          </div>
          <div className="text-6xl font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-sky-400 to-indigo-400 drop-shadow-sm">
            B
          </div>
          <p className="text-[10px] font-semibold text-slate-500">Tap colors to fill</p>
        </div>
      )

    case 'challenges':
      return (
        <div className="w-full space-y-2 px-1">
          {[
            { t: 'Read 1 story', done: true },
            { t: 'Spell 5 words', done: true },
            { t: 'Play a game', done: false },
          ].map((row, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center gap-2 rounded-xl px-2 py-2 border',
                row.done
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200/70 dark:border-rose-900/50'
                  : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
                  row.done ? accent : 'bg-slate-300 dark:bg-slate-600'
                )}
              >
                {row.done ? '✓' : ''}
              </span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{row.t}</span>
            </div>
          ))}
        </div>
      )

    case 'math':
      return (
        <div className="w-full text-center space-y-3">
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 py-4 px-2">
            <p className="text-2xl font-black text-amber-900 dark:text-amber-100 tracking-tight">5 + 2 = ?</p>
          </div>
          <div className="flex justify-center gap-2">
            {['6', '7', '8'].map((n) => (
              <span
                key={n}
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-md',
                  n === '7' ? accent : 'bg-slate-300 dark:bg-slate-600'
                )}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      )

    case 'creative':
      return (
        <div className="w-full space-y-2 px-1">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Today’s prompt</p>
          <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-white dark:bg-slate-900 p-2 space-y-1.5">
            <div className="h-2 rounded bg-emerald-200/80 dark:bg-emerald-900/40 w-[75%]" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-1 rounded-full bg-slate-200/90 dark:bg-slate-700/80 w-full" />
            ))}
            <p className="text-[10px] text-slate-400 italic pt-1">Once upon a time…</p>
          </div>
        </div>
      )

    case 'progress':
      return (
        <div className="w-full space-y-3 px-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Level 5</span>
            <span className="text-amber-500 text-sm">★★★</span>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Reading', w: 85 },
              { label: 'Games', w: 60 },
              { label: 'Speaking', w: 45 },
            ].map((bar) => (
              <div key={bar.label}>
                <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                  <span>{bar.label}</span>
                  <span>{bar.w}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className={cn('h-full rounded-full', accent)} style={{ width: `${bar.w}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )

    default: {
      const _exhaustive: never = previewKey
      void _exhaustive
      return null
    }
  }
}

'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import {
  Library,
  Calculator,
  PencilLine,
  Mic,
  Gamepad2,
  FileText,
  Puzzle,
  Palette,
  Target,
  type LucideIcon,
} from 'lucide-react'
import type { ModuleId } from '@/lib/subscription'
import { AgeGroup } from '@/lib/age-utils'
import { getModulesForAgeGroup, getAgeTrackLabel } from '@/lib/age-group-modules'

type GradientFn = (accent: string) => React.CSSProperties

const GRADIENT: Record<ModuleId, GradientFn | 'challenges'> = {
  reading: (a) => ({
    backgroundImage: `linear-gradient(to bottom right, ${a}, #8c0066)`,
  }),
  counting: (a) => ({
    backgroundImage: `linear-gradient(to bottom right, #8c0066, ${a})`,
  }),
  writing: (a) => ({
    backgroundImage: `linear-gradient(to bottom right, ${a}, #8eca40)`,
  }),
  speaking: (a) => ({
    backgroundImage: `linear-gradient(to bottom right, #8c0066, ${a})`,
  }),
  games: (a) => ({
    backgroundImage: `linear-gradient(to bottom right, ${a}, #8eca40)`,
  }),
  grammar: (a) => ({
    backgroundImage: `linear-gradient(to bottom right, #003366, ${a})`,
  }),
  puzzle: (a) => ({
    backgroundImage: `linear-gradient(to bottom right, #8eca40, ${a})`,
  }),
  'alphabet-coloring': (a) => ({
    backgroundImage: `linear-gradient(to bottom right, #8c0066, ${a})`,
  }),
  challenges: 'challenges',
}

const ICONS: Record<ModuleId, LucideIcon> = {
  reading: Library,
  counting: Calculator,
  writing: PencilLine,
  speaking: Mic,
  games: Gamepad2,
  grammar: FileText,
  puzzle: Puzzle,
  'alphabet-coloring': Palette,
  challenges: Target,
}

const COPY: Record<
  ModuleId,
  { title: string; description: string; cta: string; lockId: ModuleId; path: string; name: string }
> = {
  reading: {
    title: 'Reading',
    description: 'Stories, vocabulary, and comprehension',
    cta: 'Start Reading',
    lockId: 'reading',
    path: '/learning/reading',
    name: 'Reading',
  },
  counting: {
    title: 'Math in English',
    description: 'Foundation, Elementary & Intermediate — numbers, shapes, operations',
    cta: 'Start',
    lockId: 'counting',
    path: '/learning/math',
    name: 'Math',
  },
  writing: {
    title: 'Writing',
    description: 'Letter tracing, spelling, and creative writing',
    cta: 'Start Writing',
    lockId: 'writing',
    path: '/learning/writing',
    name: 'Writing',
  },
  speaking: {
    title: 'Speaking',
    description: 'Pronunciation and conversation',
    cta: 'Start Speaking',
    lockId: 'speaking',
    path: '/learning/speaking',
    name: 'Speaking',
  },
  games: {
    title: 'Games',
    description: 'Fun interactive learning games',
    cta: 'Start Playing',
    lockId: 'games',
    path: '/learning/games',
    name: 'Games',
  },
  grammar: {
    title: 'Grammar',
    description: 'Grammar rules and language structure',
    cta: 'Start Learning',
    lockId: 'grammar',
    path: '/learning/grammar',
    name: 'Grammar',
  },
  puzzle: {
    title: 'Puzzles',
    description: 'Word and sentence puzzles',
    cta: 'Start Solving',
    lockId: 'puzzle',
    path: '/learning/puzzle',
    name: 'Puzzles',
  },
  'alphabet-coloring': {
    title: 'Coloring',
    description: 'Color letters and learn the alphabet',
    cta: 'Start Coloring',
    lockId: 'alphabet-coloring',
    path: '/learning/alphabet-coloring',
    name: 'Coloring',
  },
  challenges: {
    title: 'Challenges',
    description: 'Daily challenges from your dashboard',
    cta: 'View Challenges',
    lockId: 'challenges',
    path: '/dashboard',
    name: 'Challenges',
  },
}

type Props = {
  ageGroup: AgeGroup
  accentColor: string
  moduleIsLocked: (moduleId: string) => boolean
  renderLockBadge: (moduleId: string) => React.ReactNode
  onModuleClick: (moduleId: string, displayName: string, path: string) => void
}

const cardBase =
  'cursor-pointer group relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-[#003366] bg-white/90 dark:bg-[#003366]/40 backdrop-blur-sm shadow-xl shadow-slate-200/50 dark:shadow-black/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300'
const iconBase =
  'w-20 h-20 md:w-24 md:h-24 mx-auto mb-3 md:mb-4 rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-black/5 dark:ring-white/5 relative overflow-hidden'

function ModuleTile({
  moduleId,
  accentColor,
  delay,
  featured,
  moduleIsLocked,
  renderLockBadge,
  onModuleClick,
}: {
  moduleId: ModuleId
  accentColor: string
  delay: number
  featured: boolean
  moduleIsLocked: (moduleId: string) => boolean
  renderLockBadge: (moduleId: string) => React.ReactNode
  onModuleClick: (moduleId: string, displayName: string, path: string) => void
}) {
  const meta = COPY[moduleId]
  const Icon = ICONS[moduleId]
  const g = GRADIENT[moduleId]
  const isChallenges = g === 'challenges'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={cardBase}
        style={
          featured ? { borderColor: accentColor } : undefined
        }
        onClick={() => onModuleClick(meta.lockId, meta.name, meta.path)}
      >
        {moduleIsLocked(meta.lockId) ? renderLockBadge(meta.lockId) : null}
        <CardContent className="p-5 md:p-6 text-center relative z-10">
          <motion.div
            className={
              isChallenges
                ? `${iconBase} bg-gradient-to-br from-[#00aeef] to-[#8c0066]`
                : iconBase
            }
            style={!isChallenges ? (g as GradientFn)(accentColor) : undefined}
            whileHover={{ scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Icon className="w-9 h-9 md:w-11 md:h-11 text-white" strokeWidth={2} />
          </motion.div>
          <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-1.5 tracking-tight">
            {meta.title}
            {featured && (
              <span className="ml-2 align-middle text-[10px] px-2 py-0.5 rounded-full bg-[#00aeef]/10 text-[#00aeef] font-semibold uppercase tracking-wide">
                Featured
              </span>
            )}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">{meta.description}</p>
          <div className="text-sm font-medium text-[#8c0066] dark:text-[#00aeef] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
            {meta.cta}
            <span className="text-[#00aeef]">→</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function LearningModuleTiles({
  ageGroup,
  accentColor,
  moduleIsLocked,
  renderLockBadge,
  onModuleClick,
}: Props) {
  const { primary, secondary } = getModulesForAgeGroup(ageGroup)
  const track = getAgeTrackLabel(ageGroup)

  const baseDelay = 0.1
  const step = 0.05

  return (
    <div className="space-y-10">
      <section aria-labelledby="age-primary-modules">
        <div className="mb-4">
          <h3 id="age-primary-modules" className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">
            {track}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Featured activities for this age — start here for the best fit.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {primary.map((id, i) => (
            <ModuleTile
              key={id}
              moduleId={id}
              accentColor={accentColor}
              delay={baseDelay + i * step}
              featured
              moduleIsLocked={moduleIsLocked}
              renderLockBadge={renderLockBadge}
              onModuleClick={onModuleClick}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="age-secondary-modules" className="border-t border-slate-200/80 dark:border-white/10 pt-10">
        <div className="mb-4">
          <h3 id="age-secondary-modules" className="text-lg md:text-xl font-semibold text-slate-700 dark:text-slate-200">
            More activities
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Other modules you can still open anytime — pacing may suit older or younger skills.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 opacity-95">
          {secondary.map((id, i) => (
            <ModuleTile
              key={id}
              moduleId={id}
              accentColor={accentColor}
              delay={baseDelay + i * step}
              featured={false}
              moduleIsLocked={moduleIsLocked}
              renderLockBadge={renderLockBadge}
              onModuleClick={onModuleClick}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

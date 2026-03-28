import type { LucideIcon } from 'lucide-react'
import {
  Mic,
  PenTool,
  BookOpen,
  Gamepad2,
  FileText,
  Puzzle,
  Palette,
  Target,
  Calculator,
  PencilLine,
  Trophy,
} from 'lucide-react'

/** Keys for illustrated “in-app” previews on the welcome carousel. */
export type ModulePreviewKey =
  | 'speaking'
  | 'writing'
  | 'reading'
  | 'games'
  | 'grammar'
  | 'puzzles'
  | 'coloring'
  | 'challenges'
  | 'math'
  | 'creative'
  | 'progress'

export const MODULE_PREVIEW_IMAGE_DIR = '/images/module-previews'

export type WelcomeModule = {
  Icon: LucideIcon
  title: string
  description: string
  /** Tailwind gradient classes, e.g. `from-blue-400 to-blue-600` */
  gradient: string
  previewKey: ModulePreviewKey
  /** PNG in `public/images/module-previews/` (see `npm run capture:module-previews`) */
  screenshotSrc: string
}

export const WELCOME_MODULES: WelcomeModule[] = [
  {
    Icon: Mic,
    title: 'Speaking Practice',
    description: 'Learn pronunciation with our friendly AI buddy!',
    gradient: 'from-blue-400 to-blue-600',
    previewKey: 'speaking',
    screenshotSrc: `${MODULE_PREVIEW_IMAGE_DIR}/speaking.png`,
  },
  {
    Icon: PenTool,
    title: 'Writing & Spelling',
    description: 'Trace letters and build words in fun ways!',
    gradient: 'from-green-400 to-green-600',
    previewKey: 'writing',
    screenshotSrc: `${MODULE_PREVIEW_IMAGE_DIR}/writing.png`,
  },
  {
    Icon: BookOpen,
    title: 'Reading Library',
    description: 'Explore magical stories and PDF books!',
    gradient: 'from-pink-400 to-pink-600',
    previewKey: 'reading',
    screenshotSrc: `${MODULE_PREVIEW_IMAGE_DIR}/reading.png`,
  },
  {
    Icon: Gamepad2,
    title: 'Educational Games',
    description: 'Play exciting games while learning English!',
    gradient: 'from-purple-400 to-purple-600',
    previewKey: 'games',
    screenshotSrc: `${MODULE_PREVIEW_IMAGE_DIR}/games.png`,
  },
  {
    Icon: FileText,
    title: 'Grammar & Language',
    description: 'Master grammar rules with interactive exercises!',
    gradient: 'from-indigo-400 to-indigo-600',
    previewKey: 'grammar',
    screenshotSrc: `${MODULE_PREVIEW_IMAGE_DIR}/grammar.png`,
  },
  {
    Icon: Puzzle,
    title: 'Word Puzzles',
    description: 'Solve word, sentence, and picture puzzles!',
    gradient: 'from-orange-400 to-orange-600',
    previewKey: 'puzzles',
    screenshotSrc: `${MODULE_PREVIEW_IMAGE_DIR}/puzzles.png`,
  },
  {
    Icon: Palette,
    title: 'Alphabet Coloring',
    description: 'Color letters and learn the alphabet creatively!',
    gradient: 'from-cyan-400 to-cyan-600',
    previewKey: 'coloring',
    screenshotSrc: `${MODULE_PREVIEW_IMAGE_DIR}/coloring.png`,
  },
  {
    Icon: Target,
    title: 'Daily Challenges',
    description: 'Complete fun challenges and earn rewards!',
    gradient: 'from-rose-400 to-rose-600',
    previewKey: 'challenges',
    screenshotSrc: `${MODULE_PREVIEW_IMAGE_DIR}/challenges.png`,
  },
  {
    Icon: Calculator,
    title: 'Math in English',
    description: 'Numbers, shapes, and problem solving explained in English.',
    gradient: 'from-amber-400 to-orange-500',
    previewKey: 'math',
    screenshotSrc: `${MODULE_PREVIEW_IMAGE_DIR}/math.png`,
  },
  {
    Icon: PencilLine,
    title: 'Creative Writing',
    description: 'Story prompts and guided writing practice for older kids.',
    gradient: 'from-emerald-400 to-teal-500',
    previewKey: 'creative',
    screenshotSrc: `${MODULE_PREVIEW_IMAGE_DIR}/creative.png`,
  },
  {
    Icon: Trophy,
    title: 'Progress & Rewards',
    description: 'XP, stars, and a parent dashboard to track every module.',
    gradient: 'from-sky-400 to-indigo-500',
    previewKey: 'progress',
    screenshotSrc: `${MODULE_PREVIEW_IMAGE_DIR}/progress.png`,
  },
]

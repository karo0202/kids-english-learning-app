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

export type WelcomeModule = {
  Icon: LucideIcon
  title: string
  description: string
  /** Tailwind gradient classes, e.g. `from-blue-400 to-blue-600` */
  gradient: string
}

export const WELCOME_MODULES: WelcomeModule[] = [
  {
    Icon: Mic,
    title: 'Speaking Practice',
    description: 'Learn pronunciation with our friendly AI buddy!',
    gradient: 'from-blue-400 to-blue-600',
  },
  {
    Icon: PenTool,
    title: 'Writing & Spelling',
    description: 'Trace letters and build words in fun ways!',
    gradient: 'from-green-400 to-green-600',
  },
  {
    Icon: BookOpen,
    title: 'Reading Library',
    description: 'Explore magical stories and PDF books!',
    gradient: 'from-pink-400 to-pink-600',
  },
  {
    Icon: Gamepad2,
    title: 'Educational Games',
    description: 'Play exciting games while learning English!',
    gradient: 'from-purple-400 to-purple-600',
  },
  {
    Icon: FileText,
    title: 'Grammar & Language',
    description: 'Master grammar rules with interactive exercises!',
    gradient: 'from-indigo-400 to-indigo-600',
  },
  {
    Icon: Puzzle,
    title: 'Word Puzzles',
    description: 'Solve word, sentence, and picture puzzles!',
    gradient: 'from-orange-400 to-orange-600',
  },
  {
    Icon: Palette,
    title: 'Alphabet Coloring',
    description: 'Color letters and learn the alphabet creatively!',
    gradient: 'from-cyan-400 to-cyan-600',
  },
  {
    Icon: Target,
    title: 'Daily Challenges',
    description: 'Complete fun challenges and earn rewards!',
    gradient: 'from-rose-400 to-rose-600',
  },
  {
    Icon: Calculator,
    title: 'Math in English',
    description: 'Numbers, shapes, and problem solving explained in English.',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    Icon: PencilLine,
    title: 'Creative Writing',
    description: 'Story prompts and guided writing practice for older kids.',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    Icon: Trophy,
    title: 'Progress & Rewards',
    description: 'XP, stars, and a parent dashboard to track every module.',
    gradient: 'from-sky-400 to-indigo-500',
  },
]

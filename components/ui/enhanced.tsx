// Enhanced UI components with animations and micro-interactions
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Star, Trophy, Zap, Heart, Target, Crown } from 'lucide-react'

interface AchievementProps {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
  progress?: number
  maxProgress?: number
}

export function AchievementCard({ achievement }: { achievement: AchievementProps }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
        achievement.unlocked
          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-lg'
          : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${
          achievement.unlocked ? 'bg-yellow-100' : 'bg-gray-200'
        }`}>
          {achievement.icon}
        </div>
        <div className="flex-1">
          <h4 className={`font-bold ${
            achievement.unlocked ? 'text-yellow-800' : 'text-gray-600'
          }`}>
            {achievement.title}
          </h4>
          <p className={`text-sm ${
            achievement.unlocked ? 'text-yellow-700' : 'text-gray-500'
          }`}>
            {achievement.description}
          </p>
          {achievement.progress !== undefined && achievement.maxProgress && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {achievement.progress}/{achievement.maxProgress}
              </p>
            </div>
          )}
        </div>
        {achievement.unlocked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-yellow-500"
          >
            <Crown className="w-6 h-6" />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

interface FloatingActionButtonProps {
  onClick: () => void
  icon: React.ReactNode
  label: string
  color?: string
  pulse?: boolean
}

export function FloatingActionButton({ 
  onClick, 
  icon, 
  label, 
  color = 'from-blue-500 to-purple-600',
  pulse = false 
}: FloatingActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br ${color} text-white shadow-2xl flex items-center justify-center z-50 ${
        pulse ? 'animate-pulse' : ''
      }`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5 }}
    >
      {icon}
    </motion.button>
  )
}

interface ProgressBarProps {
  progress: number
  label?: string
  color?: string
  animated?: boolean
}

export function ProgressBar({ 
  progress, 
  label, 
  color = 'from-blue-500 to-purple-500',
  animated = true 
}: ProgressBarProps) {
  const [displayProgress, setDisplayProgress] = useState(0)

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayProgress(progress)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setDisplayProgress(progress)
    }
  }, [progress, animated])

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{label}</span>
          <span>{Math.round(displayProgress)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${displayProgress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

interface ConfettiProps {
  active: boolean
  onComplete?: () => void
}

export function Confetti({ active, onComplete }: ConfettiProps) {
  const particles = Array.from({ length: 50 }, (_, i) => i)

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {particles.map((particle) => (
            <motion.div
              key={particle}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: -10,
                rotate: 0,
                scale: 1
              }}
              animate={{
                y: window.innerHeight + 10,
                rotate: 360,
                scale: 0
              }}
              exit={{ scale: 0 }}
              transition={{
                duration: 2,
                delay: Math.random() * 0.5,
                ease: "easeOut"
              }}
              onAnimationComplete={() => {
                if (particle === particles.length - 1) {
                  onComplete?.()
                }
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}

interface LevelUpModalProps {
  isOpen: boolean
  newLevel: number
  rewards: { coins: number; xp: number }
  onClose: () => void
}

export function LevelUpModal({ isOpen, newLevel, rewards, onClose }: LevelUpModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Crown className="w-10 h-10 text-white" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Level Up!</h2>
            <p className="text-xl text-gray-600 mb-6">You reached level {newLevel}!</p>
            
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-gray-800 mb-2">Rewards:</h3>
              <div className="flex justify-center gap-6">
                <div className="text-center">
                  <Star className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                  <div className="font-bold text-gray-800">+{rewards.xp} XP</div>
                </div>
                <div className="text-center">
                  <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                  <div className="font-bold text-gray-800">+{rewards.coins} Coins</div>
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
            >
              Awesome!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface StreakDisplayProps {
  currentStreak: number
  longestStreak: number
}

export function StreakDisplay({ currentStreak, longestStreak }: StreakDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-orange-500" />
          <span className="font-bold text-gray-800">Daily Streak</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-600">{currentStreak}</div>
          <div className="text-sm text-gray-600">Best: {longestStreak}</div>
        </div>
      </div>
      
      {currentStreak > 0 && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(currentStreak * 10, 100)}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-2 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
        />
      )}
    </motion.div>
  )
}

'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface ThemeContextType {
  theme: 'light' | 'dark' | 'auto'
  setTheme: (theme: 'light' | 'dark' | 'auto') => void
  actualTheme: 'light' | 'dark' // The actual theme being used
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light')
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('user_preferences')
    if (savedTheme) {
      try {
        const prefs = JSON.parse(savedTheme)
        if (prefs.theme) {
          setTheme(prefs.theme)
        }
      } catch (error) {
        console.error('Error loading theme:', error)
      }
    }
  }, [])

  useEffect(() => {
    // Determine actual theme based on preference
    if (theme === 'auto') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setActualTheme(systemTheme)
    } else {
      setActualTheme(theme)
    }
  }, [theme])

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement
    if (actualTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [actualTheme])

  const handleSetTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme)
    
    // Update localStorage
    try {
      const savedPrefs = localStorage.getItem('user_preferences')
      const prefs = savedPrefs ? JSON.parse(savedPrefs) : {}
      prefs.theme = newTheme
      localStorage.setItem('user_preferences', JSON.stringify(prefs))
    } catch (error) {
      console.error('Error saving theme:', error)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

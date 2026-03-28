
'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mascot } from '@/components/ui/mascot'
import Logo from '@/components/logo'
import { Star, BookOpen, Menu, X, MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AudioSettings from '@/components/audio-settings'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import ModulesShowcaseSlides from '@/components/modules-showcase-slides'
import { WELCOME_MODULES } from '@/lib/welcome-modules'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export default function WelcomePage() {
  const router = useRouter()
  const [showAudioSettings, setShowAudioSettings] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [appInstalled, setAppInstalled] = useState(false)
  const [isIOSStandaloneHintVisible, setIsIOSStandaloneHintVisible] = useState(false)
  const [showInstallHelp, setShowInstallHelp] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setAppInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    window.addEventListener('appinstalled', handleAppInstalled)

    // iOS Safari does not support beforeinstallprompt, so we show a custom hint
    const ua = window.navigator.userAgent || ''
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
    const isInStandalone =
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      // Safari iOS legacy check
      (window.navigator as any).standalone === true

    if (isIOS && !isInStandalone) {
      setIsIOSStandaloneHintVisible(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (installPrompt) {
      try {
        await installPrompt.prompt()
        await installPrompt.userChoice
        setInstallPrompt(null)
        return
      } catch {
        // ignore and fall through to help
      }
    }
    // If we don't have a native prompt, show manual install help
    setShowInstallHelp(true)
  }

  return (
		<div className="min-h-screen relative">
			{/* Same kids-learning background as app (from layout); optional extra overlay for landing readability */}
			<div className="fixed inset-0 -z-10 bg-[url('/images/kids-learning-background.png')] bg-cover bg-center bg-no-repeat" aria-hidden />
			<div className="fixed inset-0 -z-[1] bg-white/65 dark:bg-[#003366]/80 pointer-events-none" aria-hidden />
			{/* Top Nav */}
			<div className="absolute inset-x-0 top-0 z-20">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<Logo size="md" showText={true} />
					{/* Desktop Menu */}
					<div className="hidden sm:flex items-center gap-2">
						<a href="/about" className="px-3 py-2 text-sm rounded-xl bg-white/80 dark:bg-white/10 border border-white/50 dark:border-white/20 text-slate-700 dark:text-white hover:bg-white dark:hover:bg-white/20 transition">About</a>
						<a href="/contact" className="px-3 py-2 text-sm rounded-xl bg-white/80 dark:bg-white/10 border border-white/50 dark:border-white/20 text-slate-700 dark:text-white hover:bg-white dark:hover:bg-white/20 transition">Contact</a>
            {!appInstalled && (
              <Button
                className="ml-2 px-4 py-2 text-sm rounded-xl bg-[#00aeef] text-white hover:bg-[#0090c5] shadow-sm"
                onClick={handleInstallClick}
              >
                Download app
              </Button>
            )}
					</div>
					{/* Mobile Menu */}
					<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
						<SheetTrigger asChild className="sm:hidden">
							<Button
								variant="ghost"
								size="icon"
								className="sm:hidden bg-white/80 dark:bg-white/10 border border-white/50 dark:border-white/20 text-slate-700 dark:text-white hover:bg-white dark:hover:bg-white/20"
							>
								<Menu className="h-6 w-6" />
								<span className="sr-only">Open menu</span>
							</Button>
						</SheetTrigger>
						<SheetContent side="right" className="w-[300px] sm:w-[400px] bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900">
							<SheetHeader>
								<SheetTitle className="text-2xl font-bold text-gray-800 dark:text-white">Menu</SheetTitle>
								<SheetDescription className="text-gray-600 dark:text-gray-400">
									Navigate to different sections
								</SheetDescription>
							</SheetHeader>
							<div className="mt-8 flex flex-col gap-4">
								<Button
									variant="outline"
									className="w-full justify-start text-left h-auto py-4 px-4 bg-white/80 dark:bg-white/10 border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/30"
									onClick={() => {
										router.push('/about')
										setMobileMenuOpen(false)
									}}
								>
									<BookOpen className="mr-3 h-5 w-5" />
									<div className="flex flex-col items-start">
										<span className="font-semibold text-gray-800 dark:text-white">About</span>
										<span className="text-xs text-gray-600 dark:text-gray-400">Learn about our app</span>
									</div>
								</Button>
								<Button
									variant="outline"
									className="w-full justify-start text-left h-auto py-4 px-4 bg-white/80 dark:bg-white/10 border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/30"
									onClick={() => {
										router.push('/contact')
										setMobileMenuOpen(false)
									}}
								>
									<MessageSquare className="mr-3 h-5 w-5" />
									<div className="flex flex-col items-start">
										<span className="font-semibold text-gray-800 dark:text-white">Contact</span>
										<span className="text-xs text-gray-600 dark:text-gray-400">Get in touch with us</span>
									</div>
								</Button>
                {!appInstalled && (
                  <Button
                    className="mt-2 w-full justify-center h-auto py-3 px-4 bg-[#00aeef] text-white hover:bg-[#0090c5]"
                    onClick={() => {
                      handleInstallClick()
                      setMobileMenuOpen(false)
                    }}
                  >
                    Download app
                  </Button>
                )}
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>
			{/* Header */}
			<div className="container mx-auto px-4 py-8">
				{/* Floating decorative letters */}
				<div className="pointer-events-none select-none absolute inset-0 -z-10">
					<div className="absolute left-6 top-24 text-pink-400/30 text-6xl">A</div>
					<div className="absolute right-8 top-40 text-purple-400/30 text-7xl">B</div>
					<div className="absolute left-12 bottom-28 text-blue-400/30 text-5xl">C</div>
					<div className="absolute right-16 bottom-16 text-emerald-400/30 text-6xl">D</div>
				</div>
        <motion.div 
					className="text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
					<div className="flex justify-center mb-6">
            <Mascot emotion="celebrating" size="large" />
          </div>
          
					<motion.h1 
						className="text-5xl md:text-7xl font-extrabold mb-3 drop-shadow-sm bg-gradient-to-r from-indigo-800 via-violet-700 to-fuchsia-700 bg-clip-text text-transparent"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          >
            Kids English
          </motion.h1>
          
					<motion.p 
						className="text-xl md:text-2xl text-slate-700 dark:text-white/90 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Learning Adventure! 🌟
          </motion.p>

					<motion.div 
						className="max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
						<div className="space-y-4">
              <div className="rounded-3xl bg-white/80 dark:bg-white/10 backdrop-blur border border-white/60 dark:border-white/20 p-6 shadow-sm">
                <p className="text-slate-700 dark:text-white/90">
                  Join millions of kids learning English through fun games, interactive activities,
                  and magical adventures!
                </p>
              </div>
              {isIOSStandaloneHintVisible && !installPrompt && !appInstalled && (
                <div className="rounded-3xl bg-amber-50/90 dark:bg-amber-900/40 backdrop-blur border border-amber-200/80 dark:border-amber-700/70 p-4 text-sm text-amber-900 dark:text-amber-50 flex items-start gap-3">
                  <div className="mt-0.5">
                    <Star className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">
                      Add this app to your iPhone or iPad
                    </p>
                    <p>
                      Tap the <span className="font-semibold">Share</span> button in Safari, then choose{' '}
                      <span className="font-semibold">“Add to Home Screen”</span> to install the app.
                    </p>
                  </div>
                </div>
              )}
            </div>
					</motion.div>

          {/* CTA Buttons */}
					<motion.div 
						className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
						<Button 
							size="lg"
							className="btn-primary-kid group relative overflow-hidden text-xl px-8 py-6 rounded-2xl shadow-2xl hover:shadow-purple-500/50"
							onClick={() => router.push('/register')}
						>
							<span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
								<span className="absolute -inset-8 rounded-full blur-2xl bg-violet-500/30 animate-pulse" />
							</span>
							<span className="relative z-10 flex items-center gap-2">
								<Star className="w-6 h-6 animate-float" />
								Start Learning Now!
							</span>
						</Button>
            
						<Button 
							size="lg"
							className="group relative overflow-hidden text-xl px-8 py-6 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white border-2 border-blue-400/50 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 rounded-2xl font-semibold"
							onClick={() => router.push('/login')}
						>
							<span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
								<span className="absolute -inset-8 rounded-full blur-2xl bg-blue-500/30 animate-pulse" />
							</span>
							<span className="relative z-10">I Already Have an Account</span>
						</Button>
          </motion.div>

          <ModulesShowcaseSlides />

          {/* Install help modal */}
          {showInstallHelp && !appInstalled && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
              <div className="max-w-md w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 shadow-xl">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      How to install this app
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Follow the steps below to add Kids English to your device.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInstallHelp(false)}
                    className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300"
                    aria-label="Close install help"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
                  <p className="font-semibold">On Android (Chrome):</p>
                  <ul className="list-disc list-inside pl-1 space-y-1">
                    <li>Tap the browser menu <span className="font-semibold">(⋮)</span> in the top-right.</li>
                    <li>Choose <span className="font-semibold">“Install app”</span> or <span className="font-semibold">“Add to Home screen”</span>.</li>
                  </ul>
                  <p className="font-semibold mt-3">On iPhone / iPad (Safari):</p>
                  <ul className="list-disc list-inside pl-1 space-y-1">
                    <li>Tap the <span className="font-semibold">Share</span> icon.</li>
                    <li>Scroll and tap <span className="font-semibold">“Add to Home Screen”</span>.</li>
                  </ul>
                  <p className="font-semibold mt-3">On computer (Chrome / Edge):</p>
                  <ul className="list-disc list-inside pl-1 space-y-1">
                    <li>Open the browser menu.</li>
                    <li>Select <span className="font-semibold">“Install Kids English”</span> or <span className="font-semibold">“Install app”</span>.</li>
                  </ul>
                </div>
                <div className="mt-5 flex justify-end">
                  <Button
                    variant="outline"
                    className="text-sm"
                    onClick={() => setShowInstallHelp(false)}
                  >
                    Got it
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Features Grid */}
				<motion.div 
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
					id="about-section"
				>
          {WELCOME_MODULES.map((module, index) => {
            const Icon = module.Icon
            return (
            <motion.div
              key={module.title}
              className="card-kid p-6 text-center group relative overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 + (index * 0.1) }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              <motion.div 
                className={`w-16 h-16 bg-gradient-to-r ${module.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg relative z-10`}
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Icon className="w-8 h-8" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 relative z-10">{module.title}</h3>
              <p className="text-gray-600 dark:text-white/70 relative z-10">{module.description}</p>
            </motion.div>
            )
          })}
        </motion.div>

        {/* Age Groups */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <h2 className="text-4xl font-bold text-white dark:text-white mb-8 drop-shadow-lg">Perfect for Every Age!</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                age: "Ages 3-5",
                title: "Little Learners",
                features: ["Alphabet & Phonics", "Colors & Animals", "Simple Words"],
                gradient: "from-yellow-400 to-orange-400"
              },
              {
                age: "Ages 6-8", 
                title: "Word Builders",
                features: ["Sentence Building", "Basic Grammar", "Spelling Games"],
                gradient: "from-green-400 to-emerald-400"
              },
              {
                age: "Ages 9-12",
                title: "Language Masters", 
                features: ["Creative Writing", "Conversations", "Advanced Grammar"],
                gradient: "from-purple-400 to-indigo-400"
              }
            ].map((group, index) => (
              <motion.div
                key={index}
                className="card-kid p-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2 + (index * 0.2) }}
                whileHover={{ scale: 1.05 }}
              >
                <div className={`w-20 h-20 bg-gradient-to-r ${group.gradient} rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg text-2xl font-bold`}>
                  {group.age.split(' ')[1]}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{group.age}</h3>
                <h4 className="text-lg font-semibold text-gray-600 dark:text-white/80 mb-4">{group.title}</h4>
                <ul className="text-gray-600 dark:text-white/70 space-y-1">
                  {group.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center justify-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
			</div>

			{/* Footer */}
			<div className="container mx-auto px-4 pb-8">
				<div className="mx-auto max-w-4xl rounded-3xl bg-white/60 dark:bg-white/10 backdrop-blur border border-white/50 dark:border-white/20 p-4 text-center text-sm text-gray-600 dark:text-white/70">
					Built with ❤️ for kids. New: Reading Library, Math in English, Creative Writing, Word & Picture Puzzles, Alphabet Coloring, Daily Challenges, and a Parent Progress Dashboard.
        </div>
      </div>
      
      {/* Audio Settings Modal */}
      <AudioSettings 
        isOpen={showAudioSettings} 
        onClose={() => setShowAudioSettings(false)} 
      />
    </div>
  )
}


'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mascot } from '@/components/ui/mascot'
import Logo from '@/components/logo'
import { Star, BookOpen, Gamepad2, Mic, PenTool } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function WelcomePage() {
  const router = useRouter()
  const [bgSrc, setBgSrc] = useState('https://images.unsplash.com/photo-1604882737218-2c5622a3b3c5?q=80&w=1600&auto=format&fit=crop')

  const features = [
    {
      icon: <Mic className="w-8 h-8" />,
      title: "Speaking Practice",
      description: "Learn pronunciation with our friendly AI buddy!",
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: <PenTool className="w-8 h-8" />,
      title: "Writing & Spelling",
      description: "Trace letters and build words in fun ways!",
      color: "from-green-400 to-green-600"
    },
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: "Educational Games",
      description: "Play exciting games while learning English!",
      color: "from-purple-400 to-purple-600"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Story Adventures",
      description: "Explore magical stories and learn new words!",
      color: "from-pink-400 to-pink-600"
    }
  ]

  return (
		<div className="min-h-screen relative bg-gradient-to-br from-rose-50 via-violet-50 to-sky-50">
			{/* Top Nav */}
			<div className="absolute inset-x-0 top-0 z-20">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<Logo size="md" showText={true} />
					<div className="hidden sm:flex items-center gap-2">
					<a href="/about" className="px-3 py-2 text-sm rounded-xl bg-white/80 border border-white/50 text-slate-700 hover:bg-white transition">About</a>
					<a href="/contact" className="px-3 py-2 text-sm rounded-xl bg-white/80 border border-white/50 text-slate-700 hover:bg-white transition">Contact</a>
					</div>
				</div>
			</div>
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <img
          src={bgSrc}
          alt="Kids learning background"
          className="w-full h-full object-contain mx-auto"
          onError={() => setBgSrc('')}
          aria-hidden
        />
        {/* Soft vignette for readability without obscuring image */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/70 via-white/30 to-white/70" />
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
						className="text-xl md:text-2xl text-slate-700 mb-6"
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
						<div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 p-6 shadow-sm">
							<p className="text-slate-700">
								Join millions of kids learning English through fun games, interactive activities,
								and magical adventures!
							</p>
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
							className="group relative overflow-hidden text-xl px-8 py-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl shadow-lg hover:from-violet-700 hover:to-indigo-700 transition"
							onClick={() => router.push('/register')}
						>
							<span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
								<span className="absolute -inset-8 rounded-full blur-2xl bg-violet-500/30 animate-pulse" />
							</span>
							<span className="relative z-10 flex items-center gap-2">
								<Star className="w-6 h-6" />
								Start Learning Now!
							</span>
						</Button>
            
						<Button 
							size="lg"
							variant="outline"
							className="group relative overflow-hidden text-xl px-8 py-6 bg-white/80 backdrop-blur border border-white/60 text-slate-800 hover:bg-white hover:scale-105 transition-all duration-300 rounded-2xl"
							onClick={() => router.push('/login')}
						>
							<span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
								<span className="absolute -inset-8 rounded-full blur-2xl bg-white/50" />
							</span>
							<span className="relative z-10">I Already Have an Account</span>
						</Button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
				<motion.div 
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
					id="about-section"
				>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="p-6 text-center rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 + (index * 0.1) }}
              whileHover={{ scale: 1.05 }}
            >
						<div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Age Groups */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <h2 className="text-4xl font-bold text-white mb-8 drop-shadow-lg">Perfect for Every Age!</h2>
          
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
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{group.age}</h3>
                <h4 className="text-lg font-semibold text-gray-600 mb-4">{group.title}</h4>
                <ul className="text-gray-600 space-y-1">
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
				<div className="mx-auto max-w-4xl rounded-3xl bg-white/60 backdrop-blur border border-white/50 p-4 text-center text-sm text-gray-600">
					Built with ❤️ for kids. New: Reading Library, PDF books, and daily challenges.
				</div>
			</div>
    </div>
  )
}

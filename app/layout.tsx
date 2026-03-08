
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { ThemeProvider } from '@/lib/theme-context'
import { ErrorBoundary } from '@/components/error-boundary'
// PortraitLock removed to enable landscape mode

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Kids English Learning Adventure | Fun & Interactive Learning for Ages 3-12',
  description: 'A fun and interactive English learning app for kids ages 3-12. Learn speaking, writing, reading, grammar, and more through games and activities.',
  keywords: ['kids', 'english', 'learning', 'education', 'games', 'speaking', 'writing', 'reading', 'grammar', 'puzzles', 'coloring', 'challenges', 'children', 'preschool', 'elementary'],
  authors: [{ name: 'Kids Learning Team' }],
  creator: 'Kids English Learning',
  publisher: 'Kids English Learning',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e8f4fc' },
    { media: '(prefers-color-scheme: dark)', color: '#003366' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kids English',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Kids English Learning Adventure',
    description: 'Fun and interactive English learning for kids ages 3-12',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kids English Learning Adventure',
    description: 'Fun and interactive English learning for kids',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#003366" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#e8f4fc" media="(prefers-color-scheme: light)" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kids English" />
        {/* Performance optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const prefs = localStorage.getItem('user_preferences');
                if (prefs) {
                  const parsed = JSON.parse(prefs);
                  if (parsed.theme === 'dark' || (parsed.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundary>
          <Providers>
            <ThemeProvider>
              {/* Skip to main content link for accessibility */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#00aeef] focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-[#00aeef]"
              >
                Skip to main content
              </a>
              <div className="min-h-screen relative m-0 p-0 overflow-hidden">
                {/* App-wide full-page background: kids learning illustration */}
                <div
                  className="fixed inset-0 -z-[2] bg-cover bg-center bg-no-repeat min-h-screen"
                  style={{ backgroundImage: "url('/images/kids-learning-background.png')" }}
                  aria-hidden
                />
                {/* Overlay so all page content stays readable */}
                <div className="fixed inset-0 -z-[1] pointer-events-none min-h-screen bg-white/70 dark:bg-[#003366]/85" aria-hidden />
                <main id="main-content" className="relative z-0">
                  {children}
                </main>
              </div>
            </ThemeProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}

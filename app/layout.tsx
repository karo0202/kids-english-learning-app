
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { ThemeProvider } from '@/lib/theme-context'
// PortraitLock removed to enable landscape mode

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kids English Learning Adventure',
  description: 'A fun and interactive English learning app for kids ages 3-12',
  keywords: ['kids', 'english', 'learning', 'education', 'games', 'speaking', 'writing'],
  authors: [{ name: 'Kids Learning Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
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
        <meta name="theme-color" content="#0f172a" />
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
        <Providers>
          <ThemeProvider>
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 m-0 p-0">
              {children}
            </div>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}

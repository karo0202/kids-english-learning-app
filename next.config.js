/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  trailingSlash: false,
  async rewrites() {
    return [
      // Rewrite trailing slash URLs to non-trailing slash
      {
        source: '/dashboard/',
        destination: '/dashboard',
      },
      {
        source: '/login/',
        destination: '/login',
      },
      {
        source: '/register/',
        destination: '/register',
      },
      {
        source: '/learning/',
        destination: '/learning',
      },
      {
        source: '/settings/',
        destination: '/settings',
      },
      {
        source: '/about/',
        destination: '/about',
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/login/',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/register/',
        destination: '/register',
        permanent: true,
      },
      {
        source: '/dashboard/',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/learning/',
        destination: '/learning',
        permanent: true,
      },
      {
        source: '/settings/',
        destination: '/settings',
        permanent: true,
      },
      {
        source: '/about/',
        destination: '/about',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
                  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://apis.google.com https://accounts.google.com https://identitytoolkit.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' https://fonts.gstatic.com",
                  "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://accounts.google.com https://kids-english-learning-2b5cd.firebaseapp.com",
                  "frame-src 'self' https://accounts.google.com https://kids-english-learning-2b5cd.firebaseapp.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
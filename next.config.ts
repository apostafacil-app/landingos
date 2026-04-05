import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // jsdom (usado pelo isomorphic-dompurify no servidor) tem deps ESM que quebram o bundler.
  // Deixar o Node.js resolver nativamente evita o ERR_REQUIRE_ESM no Vercel.
  serverExternalPackages: ['jsdom', 'canvas'],

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}

export default nextConfig

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  typedRoutes: true,
  experimental: { useTypeScriptCli: false },
  env: {
    // Public build flag; never a credential. Production always wins.
    NEXT_PUBLIC_DEV_SMS_INBOX_ENABLED: process.env.APP_ENV === 'production' ? 'false' : (process.env.DEV_SMS_INBOX_ENABLED ?? 'true')
  },
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:4000'}/api/:path*` }];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-Frame-Options', value: 'DENY' }
        ]
      }
    ];
  }
};

export default nextConfig;

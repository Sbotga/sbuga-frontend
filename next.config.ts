import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        hostname: 'api.sbuga.com',
      },
    ],
    localPatterns: [
      {
        pathname: '/**',
      },
      {
        pathname: '/api/**',
      },
    ],
  },
}

export default nextConfig

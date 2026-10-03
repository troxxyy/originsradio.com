/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Link', value: '</llms.txt>; rel="describedby"' },
      ],
    }, {
      // Home media uses versioned filenames; bump the version when replacing a file.
      source: '/media/home/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    }, {
      source: '/3d/orb-v1/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    }, ...['/artist/:path*', '/artistcontrolsecret/:path*', '/originsradio/adminuploads/:path*', '/uploads/:path*', '/ticket/:path*', '/invite/:path*'].map(source => ({
      source,
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
    }))]
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Base path for serving the application from a subdirectory
  // Only use basePath if explicitly set via env var, otherwise empty for dev
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  // Optimize for virtual environments and production builds
  output: 'standalone',
  experimental: {
    // Enable optimizations for better performance in virtual environments
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  // Ensure proper handling of static assets
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // Optimize images for better performance
  images: {
    formats: ['image/webp', 'image/avif'],
    qualities: [60, 75],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'originsradio-media.sinacetin.workers.dev',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Enable compression
  compress: true,
  // Turbopack config (empty to silence warning, webpack config still needed for fallbacks)
  turbopack: {},
  // Optimize bundle size
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
}

export default nextConfig

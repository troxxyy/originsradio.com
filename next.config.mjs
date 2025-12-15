/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
    minimumCacheTTL: 60,
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [],
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

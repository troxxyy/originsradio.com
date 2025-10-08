/** @type {import('next').NextConfig} */
const nextConfig = {
  // Using default Next.js build (not static export) to work with React Router
  // Vercel will deploy this as a serverless Next.js application
  images: {
    unoptimized: true,
  },
  // Skip trailing slashes
  trailingSlash: false,
  // Skip static optimization completely
  generateBuildId: async () => {
    return 'build-id'
  },
}

export default nextConfig

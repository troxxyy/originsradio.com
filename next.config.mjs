/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Outputs a Single-Page Application (SPA).
  distDir: './dist', // Changes the build output directory to `./dist/`.
  trailingSlash: false, // Set to false for SPA  
  images: {
    unoptimized: true, // Required for static export
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't analyze these modules on the server/build
      config.externals = [...(config.externals || []), {
        'react-router-dom': 'react-router-dom',
      }]
    }
    return config
  },
}

export default nextConfig

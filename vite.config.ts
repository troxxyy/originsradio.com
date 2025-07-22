import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "shader-park-core": path.resolve(__dirname, "node_modules/shader-park-core/dist/shader-park-core.esm.js")
    },
  },
  
  build: {
    chunkSizeWarningLimit: 500, // Lower warning limit to catch large chunks
    rollupOptions: {
      treeshake: true, // Enable tree shaking for better optimization
      output: {
        manualChunks: {
          // Core React libraries
          vendor: ['react', 'react-dom'],
          
          // Router and navigation
          router: ['react-router-dom'],
          
          // Animation library (separate chunk for code splitting)
          animations: ['framer-motion'],
          
          // UI libraries
          ui: [
            '@radix-ui/react-label',
            '@radix-ui/react-select', 
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            'lucide-react'
          ],
          
          // Data fetching and state management
          data: ['@tanstack/react-query', '@supabase/supabase-js'],
          
          // Heavy 3D libraries (lazy loaded)
          three: ['three'],
          
          // Shader library (lazy loaded)
          shaderPark: ['shader-park-core'],
          
          // Charts (if used)
          charts: ['recharts'],
          
          // Form libraries
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Utilities
          utils: [
            'clsx',
            'class-variance-authority',
            'tailwind-merge',
            'next-themes'
          ]
        },
        
        // Optimize chunk naming for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        
        // Optimize asset naming
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    // Optimize minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : []
      },
      mangle: {
        safari10: true
      }
    },
    
    // Optimize asset inlining
    assetsInlineLimit: 2048, // Reduce inline limit to decrease initial bundle size
    
    // Enable source maps only in development
    sourcemap: mode === 'development',
    
    // Enable CSS code splitting
    cssCodeSplit: true,
    
    // Optimize target for modern browsers
    target: 'es2020'
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query'
    ],
    exclude: [
      'shader-park-core', // Exclude heavy shader library from pre-bundling
      'three' // Let Three.js be code-split
    ]
  },
  
  // Enable experimental features for better performance
  esbuild: {
    target: 'es2020',
    drop: mode === 'production' ? ['console', 'debugger'] : []
  },
  
  publicDir: 'public',
  base: '/',
}));

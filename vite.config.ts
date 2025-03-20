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
    chunkSizeWarningLimit: 1e9,
    rollupOptions: {
     treeshake: false,
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          shaderPark: ['shader-park-core']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    assetsInlineLimit: 4096,
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['shader-park-core'],
    exclude: ['shader-park-core']
  },
  publicDir: 'public',
  base: '/',
}));
// vite.config.ts
import { defineConfig } from "file:///Users/sina/Documents/OriginsRadio/origins-radio/node_modules/vite/dist/node/index.js";
import react from "file:///Users/sina/Documents/OriginsRadio/origins-radio/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///Users/sina/Documents/OriginsRadio/origins-radio/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "/Users/sina/Documents/OriginsRadio/origins-radio";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    chunkSizeWarningLimit: 1e3,
    // Increase warning limit to 1000kb
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            "react",
            "react-dom",
            "react-router-dom"
          ],
          // Split shader-park into its own chunk since it's causing eval warnings
          shaderPark: ["shader-park-core"]
        }
      }
    },
    // Additional build optimizations
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    assetsInlineLimit: 4096,
    // 4kb - files smaller than this will be inlined
    sourcemap: true
    // Enable source maps for debugging
  },
  // Handle static assets
  publicDir: "public",
  base: "/"
  // Ensure proper base path for assets
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvc2luYS9Eb2N1bWVudHMvT3JpZ2luc1JhZGlvL29yaWdpbnMtcmFkaW9cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9zaW5hL0RvY3VtZW50cy9PcmlnaW5zUmFkaW8vb3JpZ2lucy1yYWRpby92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvc2luYS9Eb2N1bWVudHMvT3JpZ2luc1JhZGlvL29yaWdpbnMtcmFkaW8vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmXG4gICAgY29tcG9uZW50VGFnZ2VyKCksXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLCAvLyBJbmNyZWFzZSB3YXJuaW5nIGxpbWl0IHRvIDEwMDBrYlxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICB2ZW5kb3I6IFtcbiAgICAgICAgICAgICdyZWFjdCcsXG4gICAgICAgICAgICAncmVhY3QtZG9tJyxcbiAgICAgICAgICAgICdyZWFjdC1yb3V0ZXItZG9tJ1xuICAgICAgICAgIF0sXG4gICAgICAgICAgLy8gU3BsaXQgc2hhZGVyLXBhcmsgaW50byBpdHMgb3duIGNodW5rIHNpbmNlIGl0J3MgY2F1c2luZyBldmFsIHdhcm5pbmdzXG4gICAgICAgICAgc2hhZGVyUGFyazogWydzaGFkZXItcGFyay1jb3JlJ11cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgLy8gQWRkaXRpb25hbCBidWlsZCBvcHRpbWl6YXRpb25zXG4gICAgbWluaWZ5OiAndGVyc2VyJyxcbiAgICB0ZXJzZXJPcHRpb25zOiB7XG4gICAgICBjb21wcmVzczoge1xuICAgICAgICBkcm9wX2NvbnNvbGU6IHRydWUsXG4gICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWVcbiAgICAgIH1cbiAgICB9LFxuICAgIGFzc2V0c0lubGluZUxpbWl0OiA0MDk2LCAvLyA0a2IgLSBmaWxlcyBzbWFsbGVyIHRoYW4gdGhpcyB3aWxsIGJlIGlubGluZWRcbiAgICBzb3VyY2VtYXA6IHRydWUsIC8vIEVuYWJsZSBzb3VyY2UgbWFwcyBmb3IgZGVidWdnaW5nXG4gIH0sXG4gIC8vIEhhbmRsZSBzdGF0aWMgYXNzZXRzXG4gIHB1YmxpY0RpcjogJ3B1YmxpYycsXG4gIGJhc2U6ICcvJywgLy8gRW5zdXJlIHByb3BlciBiYXNlIHBhdGggZm9yIGFzc2V0c1xufSkpOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBa1UsU0FBUyxvQkFBb0I7QUFDL1YsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUhoQyxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixTQUFTLGlCQUNULGdCQUFnQjtBQUFBLEVBQ2xCLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsdUJBQXVCO0FBQUE7QUFBQSxJQUN2QixlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsVUFDWixRQUFRO0FBQUEsWUFDTjtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsVUFDRjtBQUFBO0FBQUEsVUFFQSxZQUFZLENBQUMsa0JBQWtCO0FBQUEsUUFDakM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSxRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDYixVQUFVO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxlQUFlO0FBQUEsTUFDakI7QUFBQSxJQUNGO0FBQUEsSUFDQSxtQkFBbUI7QUFBQTtBQUFBLElBQ25CLFdBQVc7QUFBQTtBQUFBLEVBQ2I7QUFBQTtBQUFBLEVBRUEsV0FBVztBQUFBLEVBQ1gsTUFBTTtBQUFBO0FBQ1IsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K

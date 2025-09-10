// vite.config.ts
import { defineConfig } from "file:///Users/sina/Documents/OriginsRadio/origins-radio/node_modules/vite/dist/node/index.js";
import react from "file:///Users/sina/Documents/OriginsRadio/origins-radio/node_modules/@vitejs/plugin-react-swc/index.js";
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
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      "shader-park-core": path.resolve(__vite_injected_original_dirname, "node_modules/shader-park-core/dist/shader-park-core.esm.js")
    }
  },
  build: {
    chunkSizeWarningLimit: 1e9,
    rollupOptions: {
      //treeshake: false,
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          shaderPark: ["shader-park-core"]
        }
      }
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    assetsInlineLimit: 4096,
    sourcemap: true
  },
  optimizeDeps: {
    include: ["shader-park-core"]
    //exclude: ['shader-park-core']
  },
  publicDir: "public",
  base: "/"
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvc2luYS9Eb2N1bWVudHMvT3JpZ2luc1JhZGlvL29yaWdpbnMtcmFkaW9cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9zaW5hL0RvY3VtZW50cy9PcmlnaW5zUmFkaW8vb3JpZ2lucy1yYWRpby92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvc2luYS9Eb2N1bWVudHMvT3JpZ2luc1JhZGlvL29yaWdpbnMtcmFkaW8vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcbmltcG9ydCB7IHVzZU1lbW8gfSBmcm9tIFwicmVhY3RcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogXCI6OlwiLFxuICAgIHBvcnQ6IDgwODAsXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiYgY29tcG9uZW50VGFnZ2VyKCksXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgICAgXCJzaGFkZXItcGFyay1jb3JlXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwibm9kZV9tb2R1bGVzL3NoYWRlci1wYXJrLWNvcmUvZGlzdC9zaGFkZXItcGFyay1jb3JlLmVzbS5qc1wiKVxuICAgIH0sXG4gIH0sXG4gIFxuICBidWlsZDoge1xuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMWU5LFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAvL3RyZWVzaGFrZTogZmFsc2UsXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgdmVuZG9yOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXG4gICAgICAgICAgc2hhZGVyUGFyazogWydzaGFkZXItcGFyay1jb3JlJ11cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgbWluaWZ5OiAndGVyc2VyJyxcbiAgICB0ZXJzZXJPcHRpb25zOiB7XG4gICAgICBjb21wcmVzczoge1xuICAgICAgICBkcm9wX2NvbnNvbGU6IHRydWUsXG4gICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWVcbiAgICAgIH1cbiAgICB9LFxuICAgIGFzc2V0c0lubGluZUxpbWl0OiA0MDk2LFxuICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogWydzaGFkZXItcGFyay1jb3JlJ10sXG4gICAgLy9leGNsdWRlOiBbJ3NoYWRlci1wYXJrLWNvcmUnXVxuICB9LFxuICBwdWJsaWNEaXI6ICdwdWJsaWMnLFxuICBiYXNlOiAnLycsXG59KSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWtVLFNBQVMsb0JBQW9CO0FBQy9WLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sU0FBUyxpQkFBaUIsZ0JBQWdCO0FBQUEsRUFDNUMsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUNoQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsTUFDcEMsb0JBQW9CLEtBQUssUUFBUSxrQ0FBVyw0REFBNEQ7QUFBQSxJQUMxRztBQUFBLEVBQ0Y7QUFBQSxFQUVBLE9BQU87QUFBQSxJQUNMLHVCQUF1QjtBQUFBLElBQ3ZCLGVBQWU7QUFBQTtBQUFBLE1BRWIsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osUUFBUSxDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQSxVQUNqRCxZQUFZLENBQUMsa0JBQWtCO0FBQUEsUUFDakM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLE1BQ2IsVUFBVTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsZUFBZTtBQUFBLE1BQ2pCO0FBQUEsSUFDRjtBQUFBLElBQ0EsbUJBQW1CO0FBQUEsSUFDbkIsV0FBVztBQUFBLEVBQ2I7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxrQkFBa0I7QUFBQTtBQUFBLEVBRTlCO0FBQUEsRUFDQSxXQUFXO0FBQUEsRUFDWCxNQUFNO0FBQ1IsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K

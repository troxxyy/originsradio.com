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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvc2luYS9Eb2N1bWVudHMvT3JpZ2luc1JhZGlvL29yaWdpbnMtcmFkaW9cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9zaW5hL0RvY3VtZW50cy9PcmlnaW5zUmFkaW8vb3JpZ2lucy1yYWRpby92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvc2luYS9Eb2N1bWVudHMvT3JpZ2luc1JhZGlvL29yaWdpbnMtcmFkaW8vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogXCI6OlwiLFxuICAgIHBvcnQ6IDgwODAsXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiYgY29tcG9uZW50VGFnZ2VyKCksXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgICAgXCJzaGFkZXItcGFyay1jb3JlXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwibm9kZV9tb2R1bGVzL3NoYWRlci1wYXJrLWNvcmUvZGlzdC9zaGFkZXItcGFyay1jb3JlLmVzbS5qc1wiKVxuICAgIH0sXG4gIH0sXG4gIFxuICBidWlsZDoge1xuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMWU5LFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgLy90cmVlc2hha2U6IGZhbHNlLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgIHZlbmRvcjogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbSddLFxuICAgICAgICAgIHNoYWRlclBhcms6IFsnc2hhZGVyLXBhcmstY29yZSddXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG1pbmlmeTogJ3RlcnNlcicsXG4gICAgdGVyc2VyT3B0aW9uczoge1xuICAgICAgY29tcHJlc3M6IHtcbiAgICAgICAgZHJvcF9jb25zb2xlOiB0cnVlLFxuICAgICAgICBkcm9wX2RlYnVnZ2VyOiB0cnVlXG4gICAgICB9XG4gICAgfSxcbiAgICBhc3NldHNJbmxpbmVMaW1pdDogNDA5NixcbiAgICBzb3VyY2VtYXA6IHRydWUsXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFsnc2hhZGVyLXBhcmstY29yZSddLFxuICAgIC8vZXhjbHVkZTogWydzaGFkZXItcGFyay1jb3JlJ11cbiAgfSxcbiAgcHVibGljRGlyOiAncHVibGljJyxcbiAgYmFzZTogJy8nLFxufSkpOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBa1UsU0FBUyxvQkFBb0I7QUFDL1YsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUhoQyxJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixTQUFTLGlCQUFpQixnQkFBZ0I7QUFBQSxFQUM1QyxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxNQUNwQyxvQkFBb0IsS0FBSyxRQUFRLGtDQUFXLDREQUE0RDtBQUFBLElBQzFHO0FBQUEsRUFDRjtBQUFBLEVBRUEsT0FBTztBQUFBLElBQ0wsdUJBQXVCO0FBQUEsSUFDdkIsZUFBZTtBQUFBO0FBQUEsTUFFYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsVUFDWixRQUFRLENBQUMsU0FBUyxhQUFhLGtCQUFrQjtBQUFBLFVBQ2pELFlBQVksQ0FBQyxrQkFBa0I7QUFBQSxRQUNqQztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDYixVQUFVO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxlQUFlO0FBQUEsTUFDakI7QUFBQSxJQUNGO0FBQUEsSUFDQSxtQkFBbUI7QUFBQSxJQUNuQixXQUFXO0FBQUEsRUFDYjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLGtCQUFrQjtBQUFBO0FBQUEsRUFFOUI7QUFBQSxFQUNBLFdBQVc7QUFBQSxFQUNYLE1BQU07QUFDUixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=

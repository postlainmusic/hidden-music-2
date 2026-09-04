import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    target: "es2020",
    minify: "esbuild", // Ultra-fast native esbuild minification
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("three")) {
              return "three";
            }
            if (id.includes("framer-motion") || id.includes("lucide-react") || id.includes("zustand")) {
              return "ui-vendor";
            }
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }
            return "vendor";
          }
        },
        chunkFileNames: "chunks/[name].[hash].js",
        entryFileNames: "[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]"
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ["react", "react-dom", "zustand", "framer-motion", "lucide-react"]
  }
});

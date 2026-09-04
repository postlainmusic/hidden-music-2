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
    target: "ES2020",  // ✅ Modern browsers only (Safari 14+)
    minify: "terser",  // ✅ Best minification for JavaScript
    sourcemap: false,  // ✅ No source maps in production
    rollupOptions: {
      output: {
        // ✅ Code splitting strategy
        manualChunks: {
          // Separate Three.js bundle (580KB)
          three: ["three"],
          // Separate vendor bundle
          vendor: ["react", "react-dom", "zustand", "framer-motion", "lucide-react"],
          // Keep main app code separate
          app: ["./src/main.tsx"]
        },
        // ✅ Optimize chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split("/").pop()?.split(".")[0]
            : "chunk";
          return `chunks/[name].[hash].js`;
        },
        entryFileNames: "[name].[hash].js"
      }
    },
    // ✅ Faster build with higher thresholds
    chunkSizeWarningLimit: 1000,
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true
      }
    }
  },
  // ✅ Optimize dependencies pre-bundling
  optimizeDeps: {
    include: ["react", "react-dom", "zustand", "framer-motion", "lucide-react"],
    exclude: ["three"] // Three.js should not be pre-bundled, let Rollup handle it
  }
});

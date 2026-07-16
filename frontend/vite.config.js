import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    css: false,
  },
  build: {
    // Faster minification; esbuild is default in Vite 5 – keep explicit for clarity
    minify: "esbuild",
    // Smaller initial load: split heavy vendors so they cache and load in parallel
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("recharts")) return "recharts";
            if (id.includes("react-dom") || id.includes("react-router")) return "react-vendor";
            if (id.includes("react")) return "react-vendor";
            if (id.includes("i18next") || id.includes("i18n")) return "i18n";
            if (id.includes("lucide-react")) return "icons";
            if (id.includes("xlsx") || id.includes("jspdf") || id.includes("html2canvas"))
              return "export-libs";
            if (id.includes("axios")) return "axios";
          }
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
});

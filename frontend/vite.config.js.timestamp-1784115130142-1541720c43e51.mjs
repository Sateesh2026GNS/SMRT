// vite.config.js
import { defineConfig } from "file:///C:/Users/demo/SMRT_new/SMRT/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/demo/SMRT_new/SMRT/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///C:/Users/demo/SMRT_new/SMRT/frontend/node_modules/@tailwindcss/vite/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    css: false
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
        }
      }
    },
    chunkSizeWarningLimit: 900
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxkZW1vXFxcXFNNUlRfbmV3XFxcXFNNUlRcXFxcZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGRlbW9cXFxcU01SVF9uZXdcXFxcU01SVFxcXFxmcm9udGVuZFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvZGVtby9TTVJUX25ldy9TTVJUL2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xyXG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSBcIkB0YWlsd2luZGNzcy92aXRlXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCB0YWlsd2luZGNzcygpXSxcclxuICB0ZXN0OiB7XHJcbiAgICBlbnZpcm9ubWVudDogXCJqc2RvbVwiLFxyXG4gICAgZ2xvYmFsczogdHJ1ZSxcclxuICAgIHNldHVwRmlsZXM6IFwiLi9zcmMvdGVzdC9zZXR1cC5qc1wiLFxyXG4gICAgY3NzOiBmYWxzZSxcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICAvLyBGYXN0ZXIgbWluaWZpY2F0aW9uOyBlc2J1aWxkIGlzIGRlZmF1bHQgaW4gVml0ZSA1IFx1MjAxMyBrZWVwIGV4cGxpY2l0IGZvciBjbGFyaXR5XHJcbiAgICBtaW5pZnk6IFwiZXNidWlsZFwiLFxyXG4gICAgLy8gU21hbGxlciBpbml0aWFsIGxvYWQ6IHNwbGl0IGhlYXZ5IHZlbmRvcnMgc28gdGhleSBjYWNoZSBhbmQgbG9hZCBpbiBwYXJhbGxlbFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3MoaWQpIHtcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlc1wiKSkge1xyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJyZWNoYXJ0c1wiKSkgcmV0dXJuIFwicmVjaGFydHNcIjtcclxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwicmVhY3QtZG9tXCIpIHx8IGlkLmluY2x1ZGVzKFwicmVhY3Qtcm91dGVyXCIpKSByZXR1cm4gXCJyZWFjdC12ZW5kb3JcIjtcclxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwicmVhY3RcIikpIHJldHVybiBcInJlYWN0LXZlbmRvclwiO1xyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJpMThuZXh0XCIpIHx8IGlkLmluY2x1ZGVzKFwiaTE4blwiKSkgcmV0dXJuIFwiaTE4blwiO1xyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJsdWNpZGUtcmVhY3RcIikpIHJldHVybiBcImljb25zXCI7XHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcInhsc3hcIikgfHwgaWQuaW5jbHVkZXMoXCJqc3BkZlwiKSB8fCBpZC5pbmNsdWRlcyhcImh0bWwyY2FudmFzXCIpKVxyXG4gICAgICAgICAgICAgIHJldHVybiBcImV4cG9ydC1saWJzXCI7XHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcImF4aW9zXCIpKSByZXR1cm4gXCJheGlvc1wiO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA5MDAsXHJcbiAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMFMsU0FBUyxvQkFBb0I7QUFDdlUsT0FBTyxXQUFXO0FBQ2xCLE9BQU8saUJBQWlCO0FBRXhCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDO0FBQUEsRUFDaEMsTUFBTTtBQUFBLElBQ0osYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLElBQ1QsWUFBWTtBQUFBLElBQ1osS0FBSztBQUFBLEVBQ1A7QUFBQSxFQUNBLE9BQU87QUFBQTtBQUFBLElBRUwsUUFBUTtBQUFBO0FBQUEsSUFFUixlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixhQUFhLElBQUk7QUFDZixjQUFJLEdBQUcsU0FBUyxjQUFjLEdBQUc7QUFDL0IsZ0JBQUksR0FBRyxTQUFTLFVBQVUsRUFBRyxRQUFPO0FBQ3BDLGdCQUFJLEdBQUcsU0FBUyxXQUFXLEtBQUssR0FBRyxTQUFTLGNBQWMsRUFBRyxRQUFPO0FBQ3BFLGdCQUFJLEdBQUcsU0FBUyxPQUFPLEVBQUcsUUFBTztBQUNqQyxnQkFBSSxHQUFHLFNBQVMsU0FBUyxLQUFLLEdBQUcsU0FBUyxNQUFNLEVBQUcsUUFBTztBQUMxRCxnQkFBSSxHQUFHLFNBQVMsY0FBYyxFQUFHLFFBQU87QUFDeEMsZ0JBQUksR0FBRyxTQUFTLE1BQU0sS0FBSyxHQUFHLFNBQVMsT0FBTyxLQUFLLEdBQUcsU0FBUyxhQUFhO0FBQzFFLHFCQUFPO0FBQ1QsZ0JBQUksR0FBRyxTQUFTLE9BQU8sRUFBRyxRQUFPO0FBQUEsVUFDbkM7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLHVCQUF1QjtBQUFBLEVBQ3pCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K

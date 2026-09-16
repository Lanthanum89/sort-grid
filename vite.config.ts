import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/sort-grid/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "Sort Grid",
        short_name: "Sort Grid",
        description: "An F1-themed sorting algorithm visualiser with synced source code.",
        theme_color: "#FADADD",
        background_color: "#FFFFFF",
        display: "standalone",
        orientation: "any",
        scope: "/sort-grid/",
        start_url: "/sort-grid/",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "/sort-grid/index.html",
        cleanupOutdatedCaches: true
      }
    })
  ],
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } }
});

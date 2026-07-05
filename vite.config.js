import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: [
        "favicon-16.png",
        "favicon-32.png",
        "apple-touch-icon.png",
        "brand/pulsepeak_icon.png"
      ],
      manifest: {
        name: "PulsePeak — Personal Fitness Companion",
        short_name: "PulsePeak",
        description:
          "Personalized workouts, a smart weekly plan, nutrition, recovery and progress — your personal fitness companion.",
        id: "/",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#0a0b0d",
        theme_color: "#0a0b0d",
        categories: ["health", "fitness", "lifestyle", "sports"],
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        // Precache only the app shell + small icons. The hundreds of MB of
        // exercise/nutrition imagery are runtime-cached on demand (below),
        // never precached — otherwise first load would download ~500 MB.
        globPatterns: ["**/*.{js,css,html,woff,woff2,ico,webmanifest}", "icon-*.png", "apple-touch-icon.png", "favicon-*.png"],
        // SPA offline fallback — but never intercept the API.
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api/],
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // Google Fonts are intentionally NOT SW-cached: the browser caches them
        // natively and SW interception of opaque cross-origin responses caused
        // spurious ERR_FAILED console errors. Only same-origin imagery is cached.
        runtimeCaching: [
          {
            // Exercise/nutrition imagery — cache-first, capped.
            urlPattern: ({ request, sameOrigin }) => sameOrigin && request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "pulsepeak-images",
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      devOptions: {
        // Keep the SW off during `vite dev` to avoid cache confusion while developing.
        enabled: false
      }
    })
  ],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001"
    }
  },
  preview: {
    host: true
  }
});

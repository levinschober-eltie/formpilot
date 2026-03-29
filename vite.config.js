import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib';

  return {
    base: isLib ? '/' : '/formpilot/',
    plugins: [
      react(),
      // PWA only for SPA build
      ...(!isLib ? [VitePWA({
        registerType: 'prompt',
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'FormPilot',
          short_name: 'FormPilot',
          description: 'Digitale Formulare fuer Handwerk & Bau',
          theme_color: '#2563eb',
          background_color: '#f1f5f9',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/formpilot/',
          scope: '/formpilot/',
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          ],
        },
        workbox: {
          // Cache App-Shell
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            // Google Fonts
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
            // Railway API — NetworkFirst with 5s timeout
            {
              urlPattern: /^https:\/\/.*\.railway\.app\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
                networkTimeoutSeconds: 5,
              },
            },
          ],
        },
      })] : []),
    ],
    build: isLib ? {
      lib: {
        entry: resolve(__dirname, 'src/index.js'),
        name: 'FormPilot',
        fileName: 'formpilot',
        formats: ['es'],
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
      },
      cssFileName: 'formpilot.css',
      outDir: 'dist/lib',
    } : {
      // Keep existing SPA build defaults (outDir: 'dist' by default)
    },
  };
})

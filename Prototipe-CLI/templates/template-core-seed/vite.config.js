import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

// Cargar dinámicamente el manifest.json creado por el generador
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const manifestPath = path.resolve(__dirname, './public/manifest.json')
let dynamicManifest = {
  name: 'Prototipe App',
  short_name: 'Prototipe',
  description: 'Aplicación de Ecosistema Prototipe',
  theme_color: '#000000',
  background_color: '#ffffff',
  display: 'standalone',
  start_url: '/',
  scope: '/'
}

try {
  if (fs.existsSync(manifestPath)) {
    dynamicManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
  }
} catch (e) {
  console.warn('Advertencia: No se pudo cargar el manifest.json dinámico, usando fallbacks.')
}

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg'],
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true
      },
      manifest: {
        ...dynamicManifest,
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    manifest: true,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.message.includes('Circular chunk') || 
            warning.message.includes('dynamic import will not move')) {
          throw new Error(`[Build Integrity Guard] ${warning.message}`);
        }
        warn(warning);
      },
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/')
          if (normalizedId.includes('node_modules')) {
            if (normalizedId.includes('jspdf') || normalizedId.includes('html2canvas') || normalizedId.includes('jspdf-autotable')) {
              return // Exclude from manual chunks, let Vite chunk it dynamically!
            }
            // Fragmentar Firebase SDK
            if (normalizedId.includes('firebase/auth') || normalizedId.includes('@firebase/auth')) {
              return 'firebase-auth'
            }
            if (normalizedId.includes('firebase/firestore') || normalizedId.includes('@firebase/firestore')) {
              return 'firebase-firestore'
            }
            if (normalizedId.includes('firebase/storage') || normalizedId.includes('@firebase/storage')) {
              return 'firebase-storage'
            }
            if (normalizedId.includes('firebase/app') || normalizedId.includes('@firebase/app')) {
              return 'firebase-app'
            }
            if (normalizedId.includes('firebase')) {
              return 'firebase-misc'
            }
            // Fragmentar Utilidades Pesadas de Terceros
            if (normalizedId.includes('dexie')) {
              return 'dexie'
            }
            if (normalizedId.includes('qrcode')) {
              return 'qrcode'
            }
            if (normalizedId.includes('embla-carousel')) {
              return 'embla'
            }
            if (normalizedId.includes('canvas-confetti')) {
              return 'confetti'
            }
            if (normalizedId.includes('framer-motion')) {
              return 'framer-motion'
            }
            if (normalizedId.includes('lucide-react')) {
              return 'icons'
            }
            // Fragmentar React Query y Zod
            if (normalizedId.includes('@tanstack/react-query') || normalizedId.includes('@tanstack/query-core')) {
              return 'react-query'
            }
            if (normalizedId.includes('zod')) {
              return 'zod'
            }
            // Fragmentar React Core y React Router
            if (normalizedId.includes('/react/') || 
                normalizedId.includes('react-dom') || 
                normalizedId.includes('scheduler') || 
                normalizedId.includes('react-error-boundary')) {
              if (!normalizedId.includes('react-router') && !normalizedId.includes('react-query')) {
                return 'react-core'
              }
            }
            if (normalizedId.includes('react-router') || normalizedId.includes('@react-router')) {
              return 'react-router'
            }
            // Todas las demás dependencias core y utilidades menores unificadas en un único vendor
            // para evitar dependencias circulares (ej. react-router importando utilidades y viceversa)
            return 'vendor'
          }
        }
      }
    },
    chunkSizeWarningLimit: 1500
  }
})

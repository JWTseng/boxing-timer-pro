import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,wav}'],
        maximumFileSizeToCacheInBytes: 5000000
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Boxing Timer Pro',
        short_name: 'BoxingTimer',
        description: '专业拳击/搏击训练计时器',
        theme_color: '#00FF00',
        background_color: '#121212',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    target: 'es2018',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'audio-engine': ['src/audio/AudioManager.js'],
          'timer-core': ['src/timer/TimerEngine.js', 'src/timer/TimerWorker.js'],
          'data-storage': ['dexie', 'src/storage/Database.js']
        }
      }
    }
  },
  server: {
    host: true,
    port: 3000
  }
});
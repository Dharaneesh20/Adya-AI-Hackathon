import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    allowedHosts: true,
    host: '0.0.0.0',
    port: 5173,
    cors: false,
    hmr: {
      port: 5173,
      host: '0.0.0.0'
    },
    watch: {
      usePolling: true,
      interval: 1000
    }
  },
  build: {
    chunkSizeWarningLimit: 2000,
  },
  optimizeDeps: {
    force: true
  },
  css: {
    postcss: './postcss.config.js'
  }
})
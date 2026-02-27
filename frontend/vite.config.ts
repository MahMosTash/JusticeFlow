import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // Allow external connections (needed for Docker)
    port: 5173,
    watch: {
      usePolling: true, // Needed for Docker volume mounting
    },
    proxy: {
      '/api': {
        target: 'http://backend:8000', // Use service name in Docker
        changeOrigin: true,
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@database': path.resolve(__dirname, './src/database'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendors principales
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          // Librerías de UI/utilidades
          'vendor-ui': ['lucide-react'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-state': ['zustand'],
          'vendor-db': ['dexie'],
          'vendor-dates': ['date-fns'],
        },
      },
    },
    // Aumentar límite de advertencia a 600KB mientras optimizamos
    chunkSizeWarningLimit: 600,
  },
})

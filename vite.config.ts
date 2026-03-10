/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-slot', 'lucide-react', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          'data-vendor': ['@tanstack/react-query', '@tanstack/react-table', '@supabase/supabase-js', 'zustand'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'xlsx': ['xlsx'],
          'jspdf': ['jspdf'],
          'recharts': ['recharts']
        }
      }
    }
  }
})

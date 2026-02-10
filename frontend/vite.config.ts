import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 8080,
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
  },

  // Keep some legacy libs happy in the browser.
  // (Most Solana + wallet-adapter stuff works fine without heavy polyfills.)
  define: {
    'process.env': {},
    global: 'globalThis',
  },
})
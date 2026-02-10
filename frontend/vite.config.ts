import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
<<<<<<< Updated upstream
=======
import { nodePolyfills } from 'vite-plugin-node-polyfills'
>>>>>>> Stashed changes

export default defineConfig({
<<<<<<< Updated upstream
  plugins: [react()],

=======
  plugins: [
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
      // Whether to polyfill specific globals.
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
>>>>>>> Stashed changes
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
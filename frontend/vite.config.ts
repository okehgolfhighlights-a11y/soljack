import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
import { nodePolyfills } from 'vite-plugin-node-polyfills'
>>>>>>> Stashed changes
=======
import { nodePolyfills } from 'vite-plugin-node-polyfills'
>>>>>>> Stashed changes

export default defineConfig({
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  plugins: [react()],

=======
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
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
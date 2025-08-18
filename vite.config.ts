import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'strip-version-in-imports',
      enforce: 'pre',
      resolveId(source, importer, options) {
        // Only strip a trailing @x.y.z, keep scoped package prefixes (e.g. @radix-ui)
        const stripped = source.replace(/@(\d+)\.(\d+)\.(\d+)$/, '')
        if (stripped !== source) {
          // Delegate to Vite's resolver with the cleaned specifier
          // @ts-expect-error Vite types not strictly imported
          return this.resolve(stripped, importer, { ...options, skipSelf: true })
        }
        return null
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-slot', '@radix-ui/react-dialog'],
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pdfjsPath = resolve(__dirname, 'node_modules/react-pdf/node_modules/pdfjs-dist')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'pdfjs-dist': pdfjsPath,
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
})

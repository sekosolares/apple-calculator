import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/apple-calculator/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})

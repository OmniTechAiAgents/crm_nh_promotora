import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['newsale.tech'],
    cors: {
      origin: ['http://newsale.tech', 'https://newsale.tech'],
      credentials: true
    }
  }
})

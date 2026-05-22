import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy para desarrollo local: evita CORS y espeja el comportamiento de producción.
    // El frontend en prod usa nginx que hace proxy de /api → backend:8080.
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})

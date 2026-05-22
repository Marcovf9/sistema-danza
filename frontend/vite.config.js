import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv lee .env, .env.local, .env.[mode], etc.
  // El tercer argumento '' expone TODAS las variables (no solo VITE_*)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      // Proxy para desarrollo local: evita CORS y espeja el comportamiento de producción.
      // En prod: nginx hace proxy de /api → backend:8080.
      // En dev: leer BACKEND_PORT de .env.local (default 8080).
      proxy: {
        '/api': {
          target: `http://localhost:${env.BACKEND_PORT || 8080}`,
          changeOrigin: true,
        },
      },
    },
  }
})

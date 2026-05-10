import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // Yerel ağa açık — 0.0.0.0 dinler
    port: 5173,
    strictPort: true,  // Port doluysa hata ver
  },
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/d-team2026/',
  plugins: [vue()],
  server: {
    port: 3000,
    open: true,
    host: true
  }
})

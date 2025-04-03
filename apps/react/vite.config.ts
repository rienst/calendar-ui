import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/calendar-ui/react/',
  plugins: [react(), tailwindcss()],
})

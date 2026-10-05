import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Tailwind removido — usamos Vanilla CSS con CSS Modules
export default defineConfig({
  plugins: [react()],
})

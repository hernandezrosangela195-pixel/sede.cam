import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const rewrites = {
  '/eAConsultaWeb/consulta/': '/index.html',
  '/eAConsultaWeb/consulta': '/index.html'
}

export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist', emptyOutDir: true },
  server: { port: 5173 }
})

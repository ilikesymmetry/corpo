import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(() => {
  const repo = process.env.VITE_GITHUB_REPO
  const base = repo ? `/${repo}/` : '/'
  return {
    base,
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': 'http://localhost:3000'
      }
    }
  }
})
